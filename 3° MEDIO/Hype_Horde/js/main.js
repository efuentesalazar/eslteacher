// Hype Horde — survivor 3D original para 3° medio (Unit 4). eslteacher.cl
// Las preguntas están en content.js. Cada respuesta se registra con eslt-track.js (Panel del profe).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { VOCAB, SKILLS } from './content.js';
import { logAnswer } from '/assets/js/eslt-track.js';
import { crearFluido } from '/assets/js/eslt-fluido.js';

const GAME = 'hype-horde-3m';
const RUN = 420;            // segundos hasta que aparece HYPE (7:00)
const BOSS1_AT = 210;       // Mega Pile (3:30)
const ARENA = 90;
const MAX_ENEMIES = 110;

const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0;[a[i], a[j]] = [a[j], a[i]]; } return a; };
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };

// ---------------------------------------------------------------- render
const renderer = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const SKY = new THREE.Color('#f4c597');
scene.background = SKY; scene.fog = new THREE.Fog(SKY, 34, 72);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
scene.add(new THREE.HemisphereLight('#fff4e0', '#a8714a', 1.35));
const sun = new THREE.DirectionalLight('#fff0d4', 1.9);
sun.position.set(10, 22, 8); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
const fluido = crearFluido({ renderer, juego: 'hype-horde', sol: () => sun });
Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 70 });
scene.add(sun, sun.target);
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w < h ? 72 : 50; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

// ---------------------------------------------------------------- audio
const SND = {}; let muted = store.get('hh_muted', false);
['gem', 'hit', 'hurt', 'levelup', 'boom', 'shot', 'magic', 'v_ready', 'v_go', 'v_level_up', 'v_correct', 'v_wrong', 'v_you_win', 'v_game_over'].forEach(n => SND[n] = { src: `assets/audio/${n}.mp3`, last: 0 });
function sfx(n, vol = 0.5, gap = 60) {
  if (muted) return; const s = SND[n]; const now = performance.now(); if (now - s.last < gap) return; s.last = now;
  const a = new Audio(s.src); a.volume = vol; a.play().catch(() => { });
}
const music = new Audio('assets/audio/music.mp3'); music.loop = true; music.volume = 0.32;
const bossMusic = new Audio('assets/audio/boss.mp3'); bossMusic.loop = true; bossMusic.volume = 0.35;
let curMusic = null;
function playMusic(m) { if (curMusic && curMusic !== m) curMusic.pause(); curMusic = m; if (m && !muted) { m.currentTime = 0; m.play().catch(() => { }); } }
function setMuted(v) { muted = v; store.set('hh_muted', v); $('muteBtn').textContent = v ? '🔇' : '🔊'; if (v) curMusic?.pause(); else curMusic?.play().catch(() => { }); }

// ---------------------------------------------------------------- models
const loader = new GLTFLoader();
const T = {}; // plantillas normalizadas
function prep(g, h, opts = {}) {
  const root = new THREE.Group(); const s = g.scene;
  const b = new THREE.Box3().setFromObject(s); const k = h / Math.max(0.001, b.max.y - b.min.y);
  const c = b.getCenter(new THREE.Vector3());
  s.scale.multiplyScalar(k); s.position.set(-c.x * k, -b.min.y * k, -c.z * k);
  if (opts.rotY) { const w = new THREE.Group(); w.add(s); w.rotation.y = opts.rotY; root.add(w); } else root.add(s);
  s.traverse(o => {
    if (!o.isMesh) return; o.castShadow = !!opts.shadow; o.receiveShadow = false;
    if (opts.tint) {
      const old = o.material;
      o.material = new THREE.MeshLambertMaterial({ map: old.map || null, color: (old.color ? old.color.clone() : new THREE.Color('#fff')).multiply(new THREE.Color(opts.tint)), emissive: opts.glow || '#000000', emissiveIntensity: 0.3 });
    }
  });
  root.userData.anims = g.animations || [];
  return root;
}
function inst(key) { const t = T[key]; const o = SkeletonUtils.clone(t); o.userData.anims = t.userData.anims; return o; }
function animate(o, name) {
  const m = new THREE.AnimationMixer(o); o.userData.mixer = m;
  o.userData.play = (n, fade = 0.15) => {
    const clip = o.userData.anims.find(c => c.name === n); if (!clip) return;
    const a = m.clipAction(clip); if (o.userData.cur === a) return;
    a.reset().fadeIn(fade).play(); if (o.userData.cur) o.userData.cur.fadeOut(fade); o.userData.cur = a;
  };
  o.userData.play(name, 0); return m;
}

const HEROES = [{ id: 'a', name: 'Sky' }, { id: 'c', name: 'Leo' }, { id: 'e', name: 'Ana' }, { id: 'k', name: 'Max' }];
const ENEMY_SKINS = ['b', 'd', 'h', 'm'];
const PETDEF = {
  bolt: { name: 'Pip', evo: 'Squawk', model: 'chick', evoModel: 'parrot', icon: '🐤', desc: 'Shoots fact-check bolts at the nearest enemy.', evoDesc: 'Bolts pierce enemies and fire in bursts.' },
  claw: { name: 'Whiskers', evo: 'Stripes', model: 'cat', evoModel: 'tiger', icon: '🐱', desc: 'Spins around you and scratches enemies.', evoDesc: 'Huge, fast spin with extra claws.' },
  hop: { name: 'Bounce', evo: 'Antlers', model: 'bunny', evoModel: 'deer', icon: '🐰', desc: 'Jumps on enemies and makes a shockwave.', evoDesc: 'Giant shockwaves, twice as often.' },
  frost: { name: 'Waddles', evo: 'Blizzard', model: 'penguin', evoModel: 'polar', icon: '🐧', desc: 'Freezing aura: slows and hurts enemies near you.', evoDesc: 'A big blizzard that almost stops enemies.' },
  fetch: { name: 'Rex', evo: 'Blaze', model: 'dog', evoModel: 'fox', icon: '🐶', desc: 'Throws a bone boomerang that comes back.', evoDesc: 'Three fire boomerangs.' },
};
const PASSIVES = {
  speed: { name: 'Running Shoes', icon: '👟', desc: '+10% move speed.' },
  heart: { name: 'Big Heart', icon: '❤️', desc: '+20 max HP and heal 20.' },
  magnet: { name: 'Magnet', icon: '🧲', desc: '+35% pickup range.' },
  learn: { name: 'Fast Learner', icon: '📚', desc: '+15% XP from cubes.' },
  power: { name: 'Power', icon: '💪', desc: '+12% damage for all pets.' },
  focus: { name: 'Focus', icon: '⏱️', desc: 'Pets attack 8% faster.' },
};

async function loadAll() {
  const jobs = [];
  const add = (key, url, h, opts) => jobs.push([key, url, h, opts]);
  HEROES.forEach(hh => add('hero_' + hh.id, `assets/models/chars/character-${hh.id}.glb`, 1.6, { shadow: true }));
  ENEMY_SKINS.forEach(s => add('scroller_' + s, `assets/models/chars/character-${s}.glb`, 1.55, { tint: '#c7a2ff', glow: '#5a1a8a' }));
  Object.values(PETDEF).forEach(p => { add('pet_' + p.model, `assets/models/pets/animal-${p.model}.glb`, 0.75, { shadow: true }); add('pet_' + p.evoModel, `assets/models/pets/animal-${p.evoModel}.glb`, 1.15, { shadow: true }); });
  add('phone', 'assets/models/props/celular-apps.glb', 1.3, {});
  add('pile', 'assets/models/props/poleras-dos-pilas.glb', 1.5, { tint: '#ffd0e6' });
  add('decoPile', 'assets/models/props/poleras-dos-pilas.glb', 3.2, { shadow: true });
  add('decoPile2', 'assets/models/props/poleras-dobladas.glb', 2.2, { shadow: true });
  add('billboard', 'assets/models/props/cartel-publicitario.glb', 7, { shadow: true });
  add('hype', 'assets/models/props/cartel-publicitario.glb', 6, { shadow: true, tint: '#ffb3dc', glow: '#ff3d8b' });
  ['cactus_short', 'cactus_tall', 'rock_largeA', 'rock_largeC', 'rock_smallA', 'rock_smallB', 'plant_bushSmall'].forEach(n =>
    add(n, `assets/models/props/${n}.glb`, n.startsWith('rock_large') ? 2.4 : n.startsWith('cactus_tall') ? 2.6 : n.startsWith('cactus') ? 1.5 : 0.7, { shadow: n.startsWith('cactus') }));
  let done = 0;
  await Promise.all(jobs.map(async ([key, url, h, opts]) => {
    const g = await loader.loadAsync(url); T[key] = prep(g, h, opts);
    done++; $('loadBar').style.width = (done / jobs.length * 100) + '%';
  }));
}

// ---------------------------------------------------------------- world
function sandTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  x.fillStyle = '#e9b783'; x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) { const v = Math.random(); x.fillStyle = v < .5 ? 'rgba(255,230,190,.35)' : 'rgba(170,110,70,.18)'; x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); }
  for (let i = 0; i < 9; i++) { x.strokeStyle = 'rgba(200,140,90,.25)'; x.lineWidth = 3; x.beginPath(); const y = Math.random() * 256; x.moveTo(0, y); for (let k = 0; k <= 256; k += 16) x.lineTo(k, y + Math.sin(k / 30 + i) * 6); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 40); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(60,30,20,.45)'); g.addColorStop(1, 'rgba(60,30,20,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
const blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });
function blob(o, s) { const m = new THREE.Mesh(blobGeo, blobMat); m.scale.setScalar(s); m.position.y = 0.03; o.add(m); }

function buildWorld() {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), new THREE.MeshLambertMaterial({ map: sandTexture() }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const place = (key, x, z, s = 1, ry = Math.random() * 6.28) => { const o = inst(key); o.position.set(x, 0, z); o.rotation.y = ry; o.scale.setScalar(s); scene.add(o); return o; };
  // borde: anillo de rocas
  for (let a = 0; a < Math.PI * 2; a += 0.075) { const r = ARENA + rand(2, 6); place(Math.random() < .5 ? 'rock_largeA' : 'rock_largeC', Math.cos(a) * r, Math.sin(a) * r, rand(1.6, 2.6)); }
  const free = (x, z) => Math.hypot(x, z) > 9;
  const scatter = (key, n, s0, s1) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, r = Math.sqrt(Math.random()) * (ARENA - 4); const x = Math.cos(a) * r, z = Math.sin(a) * r; if (free(x, z)) place(key, x, z, rand(s0, s1)); } };
  scatter('cactus_tall', 22, .8, 1.3); scatter('cactus_short', 26, .8, 1.3); scatter('rock_smallA', 30, .8, 1.6); scatter('rock_smallB', 30, .8, 1.6); scatter('plant_bushSmall', 30, .8, 1.4);
  scatter('decoPile', 16, .5, .9); scatter('decoPile2', 16, .7, 1.1);
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + .4, r = rand(28, 70); place('billboard', Math.cos(a) * r, Math.sin(a) * r, 1, -a + Math.PI / 2); }
}

// ---------------------------------------------------------------- pools & fx
const gemGeo = new THREE.OctahedronGeometry(0.24);
const GEMS = 450;
const gemMesh = new THREE.InstancedMesh(gemGeo, new THREE.MeshLambertMaterial({ emissive: '#2a6c8a', emissiveIntensity: .6 }), GEMS);
gemMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(gemMesh);
const gems = Array.from({ length: GEMS }, () => ({ on: false, x: 0, z: 0, v: 1, pull: false }));
const dummy = new THREE.Object3D(); const tmpC = new THREE.Color();
for (let i = 0; i < GEMS; i++) { gemMesh.setColorAt(i, tmpC.set('#35e6ff')); }
function dropGem(x, z, v) {
  let g = gems.find(g => !g.on);
  if (!g) { g = gems.reduce((b, c) => (Math.hypot(c.x - x, c.z - z) < Math.hypot(b.x - x, b.z - z) ? c : b)); g.v += v; return; }
  Object.assign(g, { on: true, x: x + rand(-.3, .3), z: z + rand(-.3, .3), v, pull: false });
  gemMesh.setColorAt(gems.indexOf(g), tmpC.set(v >= 10 ? '#ffc23d' : v >= 3 ? '#7dff9a' : '#35e6ff')); gemMesh.instanceColor.needsUpdate = true;
}

const PARTS = 260;
const partMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(.18, .18, .18), new THREE.MeshBasicMaterial(), PARTS);
partMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(partMesh);
const parts = Array.from({ length: PARTS }, () => ({ life: 0, p: new THREE.Vector3(), v: new THREE.Vector3() }));
let partI = 0;
for (let i = 0; i < PARTS; i++) partMesh.setColorAt(i, tmpC.set('#fff'));
function burst(pos, color, n = 8, sp = 5) {
  for (let k = 0; k < n; k++) {
    const p = parts[partI]; partMesh.setColorAt(partI, tmpC.set(color)); partI = (partI + 1) % PARTS;
    p.life = rand(.35, .7); p.p.set(pos.x, pos.y + .6, pos.z); p.v.set(rand(-1, 1) * sp, rand(2, 6), rand(-1, 1) * sp);
  }
  partMesh.instanceColor.needsUpdate = true;
}
const rings = [];
const ringGeo = new THREE.RingGeometry(0.85, 1, 48).rotateX(-Math.PI / 2);
function ring(pos, radius, color, dur = .45) {
  const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .9, depthWrite: false }));
  m.position.set(pos.x, .15, pos.z); scene.add(m); rings.push({ m, t: 0, dur, radius });
}

// números de daño
const dmgPool = []; const dmgLive = [];
function dmgNum(pos, n, big) {
  if (dmgLive.length > 26) return;
  const el = dmgPool.pop() || Object.assign(document.createElement('div'), { className: 'dmg' });
  el.className = 'dmg' + (big ? ' big' : ''); el.textContent = Math.round(n); document.body.appendChild(el);
  dmgLive.push({ el, p: new THREE.Vector3(pos.x + rand(-.3, .3), 1.8, pos.z), t: 0 });
}
const proj = new THREE.Vector3();
function updDmg(dt) {
  for (let i = dmgLive.length - 1; i >= 0; i--) {
    const d = dmgLive[i]; d.t += dt; d.p.y += dt * 1.6;
    proj.copy(d.p).project(camera);
    d.el.style.transform = `translate(${(proj.x * .5 + .5) * innerWidth}px,${(-proj.y * .5 + .5) * innerHeight}px) translate(-50%,-50%)`;
    d.el.style.opacity = String(1 - d.t / .7);
    if (d.t > .7) { d.el.remove(); dmgPool.push(d.el); dmgLive.splice(i, 1); }
  }
}

// geometrías de enemigos y proyectiles
const heartShape = (() => { const s = new THREE.Shape(); s.moveTo(0, -.5); s.bezierCurveTo(-.15, -.35, -.6, -.1, -.6, .2); s.bezierCurveTo(-.6, .5, -.25, .6, 0, .35); s.bezierCurveTo(.25, .6, .6, .5, .6, .2); s.bezierCurveTo(.6, -.1, .15, -.35, 0, -.5); return s; })();
const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: .25, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 2 }); heartGeo.center();
const heartMat = new THREE.MeshLambertMaterial({ color: '#ff4f9a', emissive: '#ff2a7a', emissiveIntensity: .45 });
const boltGeo = new THREE.SphereGeometry(.18, 10, 8);
const boltMat = new THREE.MeshBasicMaterial({ color: '#fff27a' });
const boltEvoMat = new THREE.MeshBasicMaterial({ color: '#7dffef' });
const boneGeo = new THREE.BoxGeometry(.9, .14, .22);
const boneMat = new THREE.MeshLambertMaterial({ color: '#fff7e0', emissive: '#665533', emissiveIntensity: .3 });
const fireMat = new THREE.MeshBasicMaterial({ color: '#ff8a2a' });
const hypeShotGeo = new THREE.IcosahedronGeometry(.32);
const hypeShotMat = new THREE.MeshBasicMaterial({ color: '#ff3d8b' });
const clawGeo = new THREE.ConeGeometry(.18, .7, 4).rotateZ(Math.PI / 2);
const clawMat = new THREE.MeshBasicMaterial({ color: '#ffe066' });
const auraMat = new THREE.MeshBasicMaterial({ color: '#8fe9ff', transparent: true, opacity: .22, depthWrite: false, side: THREE.DoubleSide });

// ---------------------------------------------------------------- state
let S = null; // partida actual
let heroId = store.get('hh_hero', 'a');
let player = null;

function newRun() {
  // limpia la escena de la partida anterior
  if (S) { S.enemies.forEach(e => scene.remove(e.obj)); S.shots.forEach(s => scene.remove(s.m)); S.eshots.forEach(s => scene.remove(s.m)); Object.values(S.pets).forEach(p => { scene.remove(p.obj); p.extra?.forEach(m => scene.remove(m)); }); if (S.aura) scene.remove(S.aura); scene.remove(player); }
  gems.forEach(g => g.on = false);
  player = inst('hero_' + heroId); animate(player, 'idle'); blob(player, 1.3); scene.add(player);
  S = {
    t: 0, running: true, over: false, paused: false, lvlQueue: 0,
    hp: 100, maxHp: 100, inv: 0, speed: 6.2, mag: 2.6, xpMul: 1, dmgMul: 1, cdMul: 1,
    lvl: 1, xp: 0, next: 6, kills: 0, streak: 0, bestStreak: 0, ult: 0,
    dir: new THREE.Vector3(0, 0, 1), moving: false,
    enemies: [], shots: [], eshots: [], pets: {}, pass: {}, aura: null,
    spawnAcc: 0, waveAt: 60, boss1: false, boss2: false, bossE: null, won: false,
    answers: [], deck: shuffle(VOCAB.slice()),
  };
  addPet('bolt');
  updHud(); renderPets();
}

// ---------------------------------------------------------------- pets
function addPet(key) {
  const d = PETDEF[key];
  const p = { key, lvl: 1, evo: false, cd: 0, obj: null, extra: [], st: 'follow', jt: 0, from: new THREE.Vector3(), to: new THREE.Vector3(), ang: 0 };
  setPetModel(p, d.model);
  p.obj.position.copy(player.position).add(new THREE.Vector3(rand(-1, 1), 0, rand(-1, 1)));
  S.pets[key] = p;
  if (key === 'frost') { S.aura = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2), auraMat); S.aura.position.y = .08; scene.add(S.aura); }
  syncClaws(p);
}
function setPetModel(p, model) {
  const old = p.obj; const o = inst('pet_' + model); animate(o, 'walk'); blob(o, .9); scene.add(o);
  if (old) { o.position.copy(old.position); o.rotation.copy(old.rotation); scene.remove(old); }
  p.obj = o;
}
function petStats(p) {
  const L = p.lvl, E = p.evo, dm = S.dmgMul, cm = S.cdMul;
  switch (p.key) {
    case 'bolt': return { dmg: (9 + 3 * L) * (E ? 1.6 : 1) * dm, cd: (1.05 - .1 * L) * cm * (E ? .7 : 1), n: 1 + (L >= 3 ? 1 : 0) + (E ? 2 : 0), pierce: E ? 3 : 0 };
    case 'claw': return { dmg: (7 + 4 * L) * (E ? 2 : 1) * dm, r: E ? 3.6 : 2.4 + .1 * L, spd: (2.6 + .25 * L) * (E ? 1.5 : 1), n: Math.floor(L / 2) + (E ? 3 : 0) };
    case 'hop': return { dmg: (14 + 6 * L) * (E ? 1.8 : 1) * dm, cd: (3.2 - .25 * L) * cm * (E ? .5 : 1), r: (3 + .35 * L) * (E ? 1.6 : 1) };
    case 'frost': return { dps: (4 + 2.5 * L) * (E ? 2 : 1) * dm, r: (2.6 + .35 * L) * (E ? 1.6 : 1), slow: E ? .7 : .25 + .05 * L };
    case 'fetch': return { dmg: (12 + 5 * L) * (E ? 1.7 : 1) * dm, cd: (2.2 - .15 * L) * cm, n: E ? 3 : 1 + (L >= 4 ? 1 : 0), range: 7 + .5 * L };
  }
}
function syncClaws(p) {
  if (p.key !== 'claw') return;
  const n = petStats(p).n;
  while (p.extra.length < n) { const m = new THREE.Mesh(clawGeo, clawMat); scene.add(m); p.extra.push(m); }
}
function levelPet(key) {
  const p = S.pets[key]; p.lvl++;
  if (p.lvl >= 5 && !p.evo) {
    p.evo = true; setPetModel(p, PETDEF[key].evoModel); burst(p.obj.position, '#ffc23d', 26, 7); ring(p.obj.position, 5, '#ffc23d', .7);
    toast(`${PETDEF[key].name} evolved into ${PETDEF[key].evo}!`); sfx('magic', .6);
  }
  syncClaws(p);
}

function nearest(pos, maxD = 1e9, skip) {
  let best = null, bd = maxD * maxD;
  for (const e of S.enemies) { if (e.dead || e === skip) continue; const dx = e.obj.position.x - pos.x, dz = e.obj.position.z - pos.z, d = dx * dx + dz * dz; if (d < bd) { bd = d; best = e; } }
  return best;
}

const V = new THREE.Vector3(), V2 = new THREE.Vector3();
function updPets(dt) {
  const keys = Object.keys(S.pets); let slot = 0;
  const side = new THREE.Vector3(S.dir.z, 0, -S.dir.x);
  for (const key of keys) {
    const p = S.pets[key], st = petStats(p), o = p.obj; p.cd -= dt;
    o.userData.mixer.update(dt);
    if (key === 'claw') {
      p.ang += st.spd * dt;
      o.position.set(player.position.x + Math.cos(p.ang) * st.r, 0, player.position.z + Math.sin(p.ang) * st.r);
      o.rotation.y = -p.ang;
      p.extra.forEach((m, i) => { const a = p.ang * 1.3 + (i + 1) / (p.extra.length + 1) * Math.PI * 2; m.position.set(player.position.x + Math.cos(a) * (st.r - .6), .8, player.position.z + Math.sin(a) * (st.r - .6)); m.rotation.y = -a; });
      const hitters = [o, ...p.extra];
      for (const e of S.enemies) {
        if (e.dead || (e.clawT || 0) > S.t) continue;
        for (const h of hitters) { if (Math.hypot(e.obj.position.x - h.position.x, e.obj.position.z - h.position.z) < e.r + .7) { hurt(e, st.dmg, h.position); e.clawT = S.t + .45; break; } }
      }
      continue;
    }
    if (key === 'hop' && p.st === 'jump') {
      p.jt += dt / .5; const k = Math.min(1, p.jt);
      o.position.lerpVectors(p.from, p.to, k); o.position.y = Math.sin(k * Math.PI) * 3;
      if (k >= 1) {
        p.st = 'follow'; o.position.y = 0; ring(o.position, st.r, '#ffffff', .4); burst(o.position, '#ffe7c2', 10, 4); sfx('boom', .35, 120);
        for (const e of S.enemies) if (!e.dead && e.obj.position.distanceTo(o.position) < st.r + e.r) hurt(e, st.dmg, o.position, 6);
      }
      continue;
    }
    // seguir al jugador en formación
    const n = keys.length - (S.pets.claw ? 1 : 0); const off = (slot - (n - 1) / 2) * 1.3; slot++;
    V.copy(player.position).addScaledVector(S.dir, -1.5).addScaledVector(side, off);
    V2.subVectors(V, o.position); V2.y = 0; const d = V2.length();
    if (d > .15) { o.position.addScaledVector(V2.normalize(), Math.min(d, (S.speed + 1.5 + d) * dt)); o.rotation.y = Math.atan2(V2.x, V2.z); o.userData.play(d > 1.5 ? 'run' : 'walk'); }
    else o.userData.play('idle');
    if (d > 14) o.position.copy(V);
    if (p.cd > 0) continue;
    if (key === 'bolt') {
      const tgt = nearest(o.position, 16); if (!tgt) continue; p.cd = st.cd;
      for (let i = 0; i < st.n; i++) setTimeout(() => { if (S.running && !tgt.dead) fireBolt(o.position, tgt, st, p.evo); }, i * 90);
      sfx('shot', .18, 90);
    } else if (key === 'hop') {
      const tgt = nearest(player.position, 11); if (!tgt) continue; p.cd = st.cd;
      p.st = 'jump'; p.jt = 0; p.from.copy(o.position); p.to.copy(tgt.obj.position); p.to.y = 0;
    } else if (key === 'fetch') {
      const tgt = nearest(player.position, 14); p.cd = st.cd;
      const base = tgt ? Math.atan2(tgt.obj.position.x - o.position.x, tgt.obj.position.z - o.position.z) : Math.atan2(S.dir.x, S.dir.z);
      for (let i = 0; i < st.n; i++) { const a = base + (i - (st.n - 1) / 2) * .5; fireBone(o.position, a, st, p.evo); }
    }
  }
  // aura de hielo
  if (S.pets.frost) {
    const st = petStats(S.pets.frost); S.aura.position.set(player.position.x, .08, player.position.z); S.aura.scale.setScalar(st.r);
    for (const e of S.enemies) { if (e.dead) continue; const dd = Math.hypot(e.obj.position.x - player.position.x, e.obj.position.z - player.position.z); if (dd < st.r + e.r) { e.slow = st.slow; e.frostAcc = (e.frostAcc || 0) + st.dps * dt; if (e.frostAcc >= 4) { hurt(e, e.frostAcc, null); e.frostAcc = 0; } } }
  }
}

function fireBolt(from, tgt, st, evo) {
  const m = new THREE.Mesh(boltGeo, evo ? boltEvoMat : boltMat); m.position.set(from.x, .8, from.z); scene.add(m);
  const dir = new THREE.Vector3(tgt.obj.position.x - from.x, 0, tgt.obj.position.z - from.z).normalize();
  S.shots.push({ kind: 'bolt', m, dir, spd: 17, life: 1.2, dmg: st.dmg, pierce: st.pierce, hit: new Set() });
}
function fireBone(from, ang, st, evo) {
  const m = new THREE.Mesh(boneGeo, evo ? fireMat : boneMat); m.position.set(from.x, .8, from.z); scene.add(m);
  S.shots.push({ kind: 'bone', m, dir: new THREE.Vector3(Math.sin(ang), 0, Math.cos(ang)), spd: 13, out: st.range, d: 0, back: false, dmg: st.dmg, hit: new Map(), life: 4 });
}
function updShots(dt) {
  for (let i = S.shots.length - 1; i >= 0; i--) {
    const s = S.shots[i]; s.life -= dt;
    if (s.kind === 'bolt') s.m.position.addScaledVector(s.dir, s.spd * dt);
    else {
      s.m.rotation.y += dt * 18;
      if (!s.back) { s.m.position.addScaledVector(s.dir, s.spd * dt); s.d += s.spd * dt; if (s.d > s.out) s.back = true; }
      else { V.subVectors(player.position, s.m.position); V.y = 0; const d = V.length(); if (d < .8) s.life = 0; else s.m.position.addScaledVector(V.normalize(), (s.spd + 3) * dt); }
    }
    for (const e of S.enemies) {
      if (e.dead) continue;
      if (Math.hypot(e.obj.position.x - s.m.position.x, e.obj.position.z - s.m.position.z) > e.r + .35) continue;
      if (s.kind === 'bolt') { if (s.hit.has(e)) continue; s.hit.add(e); hurt(e, s.dmg, s.m.position, 2); if (s.pierce-- <= 0) { s.life = 0; break; } }
      else { if ((s.hit.get(e) || 0) > S.t) continue; s.hit.set(e, S.t + .35); hurt(e, s.dmg, s.m.position, 3); }
    }
    if (s.life <= 0) { scene.remove(s.m); S.shots.splice(i, 1); }
  }
  for (let i = S.eshots.length - 1; i >= 0; i--) {
    const s = S.eshots[i]; s.life -= dt; s.m.position.addScaledVector(s.dir, s.spd * dt); s.m.rotation.x += dt * 5;
    if (Math.hypot(player.position.x - s.m.position.x, player.position.z - s.m.position.z) < .75) { damagePlayer(s.dmg); s.life = 0; }
    if (s.life <= 0) { scene.remove(s.m); S.eshots.splice(i, 1); }
  }
}

// ---------------------------------------------------------------- enemies
const ETYPES = {
  scroller: { hp: 16, spd: 2.6, dmg: 6, xp: 1, r: .55 },
  like: { hp: 7, spd: 4.0, dmg: 4, xp: 1, r: .45 },
  phone: { hp: 34, spd: 3.0, dmg: 8, xp: 3, r: .6 },
  pile: { hp: 110, spd: 1.7, dmg: 14, xp: 6, r: 1.0 },
};
function spawn(type, x, z, opts = {}) {
  const def = ETYPES[type]; let obj;
  if (type === 'scroller') { obj = inst('scroller_' + ENEMY_SKINS[(Math.random() * 4) | 0]); animate(obj, 'walk'); obj.userData.cur.timeScale = 1.2; blob(obj, 1.1); }
  else if (type === 'like') { obj = new THREE.Group(); const h = new THREE.Mesh(heartGeo, heartMat); h.position.y = 1; h.scale.setScalar(.9); obj.add(h); obj.userData.bob = h; blob(obj, .9); }
  else if (type === 'phone') { obj = new THREE.Group(); const ph = inst('phone'); ph.position.y = .5; obj.add(ph); obj.userData.bob = ph; blob(obj, 1); }
  else if (type === 'pile') { obj = inst('pile'); blob(obj, 2); }
  const hpMul = (1 + S.t / 95) * (opts.hpMul || 1);
  obj.position.set(x, 0, z); if (opts.scale) obj.scale.setScalar(opts.scale); scene.add(obj);
  const e = { type, obj, hp: def.hp * hpMul, maxHp: def.hp * hpMul, spd: def.spd * (opts.spdMul || 1), dmg: def.dmg * (1 + S.t / 400), xp: def.xp, r: def.r * (opts.scale || 1), slow: 0, pop: 0, boss: opts.boss || null, kb: new THREE.Vector3(), seed: Math.random() * 10 };
  S.enemies.push(e); return e;
}
function spawnRing(type, n, r0 = 22, r1 = 27) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, r = rand(r0, r1);
    let x = player.position.x + Math.cos(a) * r, z = player.position.z + Math.sin(a) * r;
    const d = Math.hypot(x, z); if (d > ARENA - 2) { x *= (ARENA - 2) / d; z *= (ARENA - 2) / d; }
    spawn(type, x, z);
  }
}
function pickType() {
  const t = S.t, w = [['scroller', 10], ['like', t > 25 ? 6 : 2], ['phone', t > 100 ? 3 + t / 80 : 0], ['pile', t > 170 ? 1 + t / 150 : 0]];
  let sum = w.reduce((a, b) => a + b[1], 0), r = Math.random() * sum;
  for (const [k, v] of w) { if ((r -= v) < 0) return k; } return 'scroller';
}
function spawnBoss(kind) {
  const a = Math.random() * 6.28; const x = player.position.x + Math.cos(a) * 20, z = player.position.z + Math.sin(a) * 20;
  let e;
  if (kind === 'mega') { e = spawn('pile', x, z, { scale: 2.1, hpMul: 9, spdMul: 1.25, boss: 'Mega Pile' }); e.dmg = 25; e.xp = 40; }
  else { e = spawn('pile', x, z, { scale: 1, hpMul: 1, boss: 'HYPE' }); scene.remove(e.obj); e.obj = inst('hype'); e.obj.position.set(x, 0, z); blob(e.obj, 5); scene.add(e.obj); e.hp = e.maxHp = 5200; e.spd = 1.9; e.dmg = 30; e.xp = 80; e.r = 2.4; }
  e.bossT = 0; S.bossE = e;
  $('boss').classList.remove('hidden'); $('bossName').textContent = e.boss; toast(kind === 'mega' ? 'MEGA PILE is coming!' : 'HYPE IS HERE!'); playMusic(bossMusic);
}

function hurt(e, d, from, knock = 0) {
  if (e.dead) return;
  e.hp -= d; e.pop = .12; dmgNum(e.obj.position, d, d >= 40);
  if (knock && from && !e.boss) { e.kb.set(e.obj.position.x - from.x, 0, e.obj.position.z - from.z).normalize().multiplyScalar(knock); }
  sfx('hit', .22, 70);
  if (e.hp <= 0) kill(e);
}
function kill(e) {
  e.dead = true; S.kills++;
  burst(e.obj.position, e.type === 'like' ? '#ff4f9a' : e.type === 'phone' ? '#35e6ff' : e.type === 'pile' ? '#ffd0e6' : '#c7a2ff', e.boss ? 40 : 8);
  if (e.boss) {
    for (let i = 0; i < 12; i++) dropGem(e.obj.position.x + rand(-2, 2), e.obj.position.z + rand(-2, 2), Math.ceil(e.xp / 12));
    $('boss').classList.add('hidden'); S.bossE = null; sfx('boom', .7, 0); ring(e.obj.position, 10, '#ffc23d', .8);
    S.hp = Math.min(S.maxHp, S.hp + 40);
    if (e.boss === 'HYPE') { S.won = true; setTimeout(() => endRun(true), 1200); } else { toast('Mega Pile recycled! +40 HP'); playMusic(music); }
  } else dropGem(e.obj.position.x, e.obj.position.z, e.xp);
  scene.remove(e.obj);
}
function updEnemies(dt) {
  const pp = player.position;
  for (const e of S.enemies) {
    if (e.dead) continue; const o = e.obj;
    V.subVectors(pp, o.position); V.y = 0; const d = V.length(); V.normalize();
    let spd = e.spd * (1 - (e.slow || 0)); e.slow = 0;
    if (e.boss) {
      e.bossT += dt;
      if (e.boss === 'Mega Pile' && e.bossT % 6 < 1) spd *= 3.5;
      if (e.boss === 'HYPE') {
        if (e.bossT > 5) { e.bossT = 0; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; spawn('like', o.position.x + Math.cos(a) * 3, o.position.z + Math.sin(a) * 3); } }
        if ((e.shotT = (e.shotT || 0) + dt) > 3.2) { e.shotT = 0; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28 + Math.random(); const m = new THREE.Mesh(hypeShotGeo, hypeShotMat); m.position.set(o.position.x, 1.2, o.position.z); scene.add(m); S.eshots.push({ m, dir: new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), spd: 7, life: 4, dmg: 10 }); } }
      }
    }
    o.position.addScaledVector(V, spd * dt);
    if (e.kb.lengthSq() > .01) { o.position.addScaledVector(e.kb, dt * 6); e.kb.multiplyScalar(1 - dt * 8); }
    o.rotation.y = Math.atan2(V.x, V.z);
    if (o.userData.mixer) o.userData.mixer.update(dt);
    if (o.userData.bob) o.userData.bob.position.y = (e.type === 'like' ? 1 : .5) + Math.sin(S.t * 6 + e.seed) * .18;
    if (e.type === 'pile' && !e.boss) o.rotation.z = Math.sin(S.t * 5 + e.seed) * .08;
    const base = e.boss === 'Mega Pile' ? 2.1 : 1;
    if (e.pop > 0) { e.pop -= dt; o.scale.setScalar(base * (1 + e.pop * 1.4)); } else o.scale.setScalar(base);
    if (d < e.r + .45) damagePlayer(e.dmg);
  }
  // separación simple
  const L = S.enemies;
  for (let i = 0; i < L.length; i++) {
    const a = L[i]; if (a.dead) continue;
    for (let j = i + 1; j < L.length; j++) {
      const b = L[j]; if (b.dead) continue;
      const dx = b.obj.position.x - a.obj.position.x, dz = b.obj.position.z - a.obj.position.z, rr = a.r + b.r, dd = dx * dx + dz * dz;
      if (dd < rr * rr && dd > 1e-4) { const dl = Math.sqrt(dd), push = (rr - dl) * .5 / dl; const wa = a.boss ? 0 : 1, wb = b.boss ? 0 : 1; a.obj.position.x -= dx * push * wa; a.obj.position.z -= dz * push * wa; b.obj.position.x += dx * push * wb; b.obj.position.z += dz * push * wb; }
    }
  }
  // descartar muertos y muy lejanos
  for (let i = L.length - 1; i >= 0; i--) {
    const e = L[i];
    if (e.dead) { L.splice(i, 1); continue; }
    if (!e.boss && e.obj.position.distanceTo(pp) > 45) { scene.remove(e.obj); L.splice(i, 1); }
  }
}
function damagePlayer(d) {
  if (S.inv > 0 || S.over) return;
  S.hp -= d; S.inv = .85; sfx('hurt', .5, 150);
  $('hurt').style.boxShadow = 'inset 0 0 120px 30px rgba(255,40,40,.55)'; setTimeout(() => $('hurt').style.boxShadow = 'inset 0 0 120px 30px rgba(255,40,40,0)', 180);
  if (S.hp <= 0) { S.hp = 0; endRun(false); }
}

// ---------------------------------------------------------------- gems & xp
function updGems(dt) {
  const pp = player.position, mag = S.mag;
  for (let i = 0; i < GEMS; i++) {
    const g = gems[i];
    if (!g.on) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0); dummy.updateMatrix(); gemMesh.setMatrixAt(i, dummy.matrix); continue; }
    const dx = pp.x - g.x, dz = pp.z - g.z, d = Math.hypot(dx, dz);
    if (d < mag || g.pull) { g.pull = true; const s = Math.min(d, (10 + (mag - Math.min(d, mag)) * 3) * dt); g.x += dx / d * s; g.z += dz / d * s; }
    if (d < .6) { g.on = false; gainXp(g.v); sfx('gem', .2, 45); continue; }
    dummy.position.set(g.x, .45 + Math.sin(S.t * 4 + i) * .1, g.z); dummy.rotation.set(0, S.t * 2 + i, 0); dummy.scale.setScalar(g.v >= 10 ? 1.7 : g.v >= 3 ? 1.3 : 1); dummy.updateMatrix(); gemMesh.setMatrixAt(i, dummy.matrix);
  }
  gemMesh.instanceMatrix.needsUpdate = true;
}
function gainXp(v) {
  S.xp += v * S.xpMul;
  while (S.xp >= S.next) { S.xp -= S.next; S.lvl++; S.next = Math.round(6 + S.lvl * 4.2 + Math.pow(S.lvl, 1.55)); S.lvlQueue++; }
  if (S.lvlQueue && !S.paused) openLevelUp();
}

// ---------------------------------------------------------------- level up (vocabulary)
function nextQ() { if (!S.deck.length) S.deck = shuffle(VOCAB.slice()); return S.deck.pop(); }
function openLevelUp() {
  S.paused = 'lvl'; S.lvlQueue--; sfx('levelup', .5, 0); sfx('v_level_up', .7, 0);
  const it = nextQ(); const t0 = performance.now();
  $('qTag').textContent = 'Level ' + S.lvl + ' · ' + SKILLS[it.k];
  $('q').innerHTML = it.q; $('fb').className = 'hidden'; $('choices').innerHTML = '';
  const opts = shuffle(it.o.map((t, i) => ({ t, ok: i === it.a })));
  const box = $('opts'); box.innerHTML = '';
  opts.forEach(op => {
    const b = document.createElement('button'); b.textContent = op.t; box.appendChild(b);
    b.onclick = () => {
      const ok = op.ok; [...box.children].forEach((c, i) => { c.disabled = true; if (opts[i].ok) c.classList.add('ok'); });
      if (!ok) b.classList.add('no');
      logAnswer(GAME, { activity: 'level-up', item: { q: it.q, k: it.k }, chosen: op.t, right: it.o[it.a], ok, ms: Math.round(performance.now() - t0) });
      S.answers.push({ k: it.k, ok });
      const fb = $('fb'); fb.className = ok ? 'ok' : 'no';
      if (ok) { S.streak++; S.bestStreak = Math.max(S.bestStreak, S.streak); S.ult = Math.min(100, S.ult + 34); fb.innerHTML = `✅ Correct! ${it.why} <br><b>Choose 1 of 3 power-ups</b> · Truth Blast +34%`; sfx('v_correct', .7, 0); }
      else { S.streak = 0; S.deck.splice(Math.max(0, S.deck.length - 4), 0, it); fb.innerHTML = `❌ The answer is <b>${it.o[it.a]}</b>. ${it.why}<br>You get 1 power-up. (This word will come back!)`; sfx('v_wrong', .7, 0); }
      showChoices(ok ? 3 : 1);
      updHud();
    };
  });
  $('lvlup').classList.remove('hidden');
}
function offers(n) {
  const pool = [];
  const owned = Object.keys(S.pets).length;
  for (const [k, d] of Object.entries(PETDEF)) {
    const p = S.pets[k];
    if (!p && owned < 5) pool.push({ w: 3, ic: d.icon, t: `New pet: ${d.name}`, s: d.desc, f: () => addPet(k) });
    else if (p && p.lvl < 5) pool.push({ w: 4, ic: d.icon, evo: p.lvl === 4, t: p.lvl === 4 ? `EVOLVE: ${d.name} → ${d.evo}` : `${d.name} Lv ${p.lvl + 1}`, s: p.lvl === 4 ? d.evoDesc : 'Stronger and faster.', f: () => levelPet(k) });
  }
  for (const [k, d] of Object.entries(PASSIVES)) {
    const lv = S.pass[k] || 0; if (lv >= 5) continue;
    pool.push({ w: 2, ic: d.icon, t: `${d.name} ${lv ? 'Lv ' + (lv + 1) : ''}`, s: d.desc, f: () => applyPassive(k) });
  }
  if (S.hp < S.maxHp * .6) pool.push({ w: 3, ic: '💧', t: 'Water break', s: 'Heal 50% of your HP.', f: () => { S.hp = Math.min(S.maxHp, S.hp + S.maxHp * .5); } });
  const out = [];
  while (out.length < n && pool.length) {
    let sum = pool.reduce((a, b) => a + b.w, 0), r = Math.random() * sum, idx = 0;
    for (; idx < pool.length; idx++) { if ((r -= pool[idx].w) < 0) break; }
    out.push(pool.splice(Math.min(idx, pool.length - 1), 1)[0]);
  }
  if (!out.length) out.push({ ic: '💧', t: 'Water break', s: 'Heal 50% of your HP.', f: () => { S.hp = Math.min(S.maxHp, S.hp + S.maxHp * .5); } });
  return out;
}
function applyPassive(k) {
  S.pass[k] = (S.pass[k] || 0) + 1;
  if (k === 'speed') S.speed *= 1.1; if (k === 'heart') { S.maxHp += 20; S.hp += 20; } if (k === 'magnet') S.mag *= 1.35;
  if (k === 'learn') S.xpMul *= 1.15; if (k === 'power') S.dmgMul *= 1.12; if (k === 'focus') S.cdMul *= .92;
}
function showChoices(n) {
  const box = $('choices'); box.innerHTML = '';
  offers(n).forEach(o => {
    const b = document.createElement('button'); if (o.evo) b.className = 'evo';
    b.innerHTML = `<div class="ic">${o.ic}</div><div><b>${o.t}</b><span>${o.s}</span></div>`;
    b.onclick = () => { o.f(); renderPets(); $('lvlup').classList.add('hidden'); S.paused = false; updHud(); if (S.lvlQueue) setTimeout(openLevelUp, 150); };
    box.appendChild(b);
  });
}

// ---------------------------------------------------------------- ultimate
function ult() {
  if (!S || S.paused || S.over || S.ult < 100) return;
  S.ult = 0; sfx('magic', .7, 0); sfx('boom', .6, 0);
  $('flash').style.opacity = '.75'; setTimeout(() => $('flash').style.opacity = '0', 80);
  ring(player.position, 18, '#ff3d8b', .7); ring(player.position, 12, '#ffffff', .5);
  for (const e of S.enemies) if (!e.dead && e.obj.position.distanceTo(player.position) < 19) hurt(e, e.boss ? 400 : 250 * (1 + S.t / 200), player.position, 8);
  S.eshots.forEach(s => s.life = 0);
  toast('TRUTH BLAST!'); updHud();
}

// ---------------------------------------------------------------- input
const keys = {};
addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') { e.preventDefault(); ult(); } if (e.code === 'Escape' || e.code === 'KeyP') togglePause(); });
addEventListener('keyup', e => keys[e.code] = false);
const joy = { on: false, id: null, ox: 0, oy: 0, x: 0, y: 0 };
const stick = $('stick');
$('joy').addEventListener('pointerdown', e => { joy.on = true; joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY; joy.x = joy.y = 0; stick.classList.remove('hidden'); stick.style.left = (e.clientX - 60) + 'px'; stick.style.top = (e.clientY - 60) + 'px'; stick.firstElementChild.style.transform = ''; });
addEventListener('pointermove', e => { if (!joy.on || e.pointerId !== joy.id) return; let dx = e.clientX - joy.ox, dy = e.clientY - joy.oy; const d = Math.hypot(dx, dy), m = 50; if (d > m) { dx *= m / d; dy *= m / d; } joy.x = dx / m; joy.y = dy / m; stick.firstElementChild.style.transform = `translate(${dx}px,${dy}px)`; });
const joyEnd = e => { if (e.pointerId !== joy.id) return; joy.on = false; joy.x = joy.y = 0; stick.classList.add('hidden'); };
addEventListener('pointerup', joyEnd); addEventListener('pointercancel', joyEnd);
$('ult').onclick = ult;
function togglePause(force) {
  if (!S || S.over || S.paused === 'lvl') return;
  const p = force !== undefined ? force : !S.paused; S.paused = p ? 'menu' : false;
  $('pause').classList.toggle('hidden', !p);
}
$('pauseBtn').onclick = () => togglePause(); $('resume').onclick = () => togglePause(false);
$('quit').onclick = () => { $('pause').classList.add('hidden'); endRun(false, true); };
$('muteBtn').onclick = () => setMuted(!muted);
document.addEventListener('visibilitychange', () => { if (document.hidden && S && !S.paused && !S.over) togglePause(true); });

// ---------------------------------------------------------------- hud
let toastT = 0;
function toast(t) { const el = $('toast'); el.textContent = t; el.style.opacity = 1; toastT = 2; }
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function updHud() {
  $('hpFill').style.width = (S.hp / S.maxHp * 100) + '%';
  $('xpFill').style.width = (S.xp / S.next * 100) + '%'; $('lvl').textContent = 'LV ' + S.lvl;
  $('kills').textContent = S.kills; $('streak').textContent = S.streak;
  $('timer').textContent = S.t < RUN ? fmt(RUN - S.t) : 'DEFEAT HYPE!';
  const u = $('ult'); u.style.setProperty('--p', S.ult); u.classList.toggle('ready', S.ult >= 100); $('ultP').textContent = S.ult >= 100 ? 'READY!' : Math.round(S.ult) + '%';
  if (S.bossE) $('bossFill').style.width = Math.max(0, S.bossE.hp / S.bossE.maxHp * 100) + '%';
}
function renderPets() {
  $('pets').innerHTML = Object.values(S.pets).map(p => { const d = PETDEF[p.key]; return `<span class="chip">${d.icon} ${p.evo ? d.evo : d.name} <b>${p.evo ? '★' : 'Lv' + p.lvl}</b></span>`; }).join('') +
    Object.entries(S.pass).map(([k, v]) => `<span class="chip">${PASSIVES[k].icon} <b>${v}</b></span>`).join('');
}

// ---------------------------------------------------------------- run flow
function startRun() {
  newRun();
  ['menu', 'end', 'pause', 'lvlup'].forEach(id => $(id).classList.add('hidden'));
  $('hud').classList.remove('hidden'); $('joy').classList.remove('hidden');
  sfx('v_ready', .7, 0); setTimeout(() => sfx('v_go', .7, 0), 800); toast('Survive the Hype!');
  playMusic(music);
}
function endRun(won, quit) {
  if (S.over) return; S.over = true; S.running = false;
  player.userData.play(won ? 'emote-yes' : 'die');
  $('joy').classList.add('hidden'); stick.classList.add('hidden'); $('boss').classList.add('hidden');
  playMusic(null); if (!quit) sfx(won ? 'v_you_win' : 'v_game_over', .8, 0);
  const right = S.answers.filter(a => a.ok).length;
  const best = store.get('hh_best', null);
  const score = Math.round(S.t * 10 + S.kills * 2 + right * 50 + (won ? 3000 : 0));
  if (!best || score > best.score) store.set('hh_best', { score, t: S.t, won });
  setTimeout(() => {
    $('endT').textContent = won ? '🏆 You defeated HYPE!' : quit ? 'Run finished' : '💥 The hype got you!';
    $('endS').textContent = `Score: ${score}` + (best && score > best.score ? ' · NEW RECORD!' : '');
    $('endStats').innerHTML = [['Time', fmt(S.t)], ['Level', S.lvl], ['Enemies', S.kills], ['Answers', `${right}/${S.answers.length}`], ['Best streak', S.bestStreak], ['Pets', Object.keys(S.pets).length]].map(([a, b]) => `<div><small>${a}</small>${b}</div>`).join('');
    $('endSkills').innerHTML = Object.entries(SKILLS).map(([k, name]) => { const a = S.answers.filter(x => x.k === k); if (!a.length) return ''; const r = a.filter(x => x.ok).length; return `<div class="skillrow"><span>${name}</span><span>${r}/${a.length} ${r === a.length ? '⭐' : ''}</span></div>`; }).join('');
    $('end').classList.remove('hidden'); $('hud').classList.add('hidden');
  }, quit ? 0 : 1300);
}

// ---------------------------------------------------------------- loop
const clock = new THREE.Clock();
const camOff = new THREE.Vector3(0, 15, 11.5);
let hudAcc = 0;
function step(dt) {
  S.t += dt; S.inv -= dt; S.hp = Math.min(S.maxHp, S.hp + .6 * dt);
  // movimiento
  let mx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x;
  let mz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + joy.y;
  const ml = Math.hypot(mx, mz);
  if (ml > .1) {
    mx /= Math.max(1, ml); mz /= Math.max(1, ml);
    player.position.x += mx * S.speed * dt; player.position.z += mz * S.speed * dt;
    S.dir.set(mx, 0, mz).normalize(); player.rotation.y = Math.atan2(mx, mz); player.userData.play('sprint');
  } else player.userData.play('idle');
  const pd = Math.hypot(player.position.x, player.position.z); if (pd > ARENA - 1.5) player.position.multiplyScalar((ARENA - 1.5) / pd);
  player.visible = S.inv > 0 ? Math.floor(S.t * 20) % 2 === 0 : true;
  // spawns
  if (!S.boss1 && S.t >= BOSS1_AT) { S.boss1 = true; spawnBoss('mega'); }
  if (!S.boss2 && S.t >= RUN) { S.boss2 = true; spawnBoss('hype'); }
  if (S.t >= S.waveAt) { S.waveAt += 60; spawnRing('like', 10 + Math.floor(S.t / 40), 16, 18); toast('Fake like wave!'); }
  const rate = (0.9 + S.t / 38) * (S.boss2 ? .5 : 1);
  S.spawnAcc += rate * dt;
  while (S.spawnAcc >= 1) { S.spawnAcc--; if (S.enemies.length < MAX_ENEMIES) spawnRing(pickType(), 1); }
  updPets(dt); updShots(dt); updEnemies(dt); updGems(dt);
}
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 1 / 20);
  if (S && S.running && !S.paused) step(dt);
  if (player) {
    player.userData.mixer.update(dt);
    camera.position.lerp(V.copy(player.position).add(camOff), 1 - Math.pow(.001, dt));
    camera.lookAt(player.position.x, .8, player.position.z);
    sun.position.set(player.position.x + 10, 22, player.position.z + 8); sun.target.position.copy(player.position);
    if (S?.over) Object.values(S.pets).forEach(p => p.obj.userData.mixer.update(dt));
  }
  // partículas
  for (let i = 0; i < PARTS; i++) {
    const p = parts[i];
    if (p.life > 0 && !(S && S.paused)) { p.life -= dt; p.v.y -= 18 * dt; p.p.addScaledVector(p.v, dt); if (p.p.y < .1) { p.p.y = .1; p.v.multiplyScalar(.5); } }
    dummy.position.copy(p.p); dummy.rotation.set(p.life * 8, p.life * 6, 0); dummy.scale.setScalar(p.life > 0 ? Math.min(1, p.life * 3) : 0); dummy.updateMatrix(); partMesh.setMatrixAt(i, dummy.matrix);
  }
  partMesh.instanceMatrix.needsUpdate = true;
  for (let i = rings.length - 1; i >= 0; i--) { const r = rings[i]; r.t += dt; const k = r.t / r.dur; r.m.scale.setScalar(.3 + k * r.radius); r.m.material.opacity = .9 * (1 - k); if (k >= 1) { scene.remove(r.m); r.m.material.dispose(); rings.splice(i, 1); } }
  updDmg(dt);
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').style.opacity = 0; }
  if (S && (hudAcc += dt) > .1) { hudAcc = 0; updHud(); }
  renderer.render(scene, camera);
  fluido.cuadro();
}

// ---------------------------------------------------------------- menu
function buildMenu() {
  const box = $('heroes');
  box.innerHTML = HEROES.map(h => `<button data-id="${h.id}" class="${h.id === heroId ? 'on' : ''}">${h.name}</button>`).join('');
  box.onclick = e => { const b = e.target.closest('button'); if (!b) return; heroId = b.dataset.id; store.set('hh_hero', heroId); [...box.children].forEach(c => c.classList.toggle('on', c === b)); showPreview(); };
  const best = store.get('hh_best', null);
  $('best').textContent = best ? `Your best score: ${best.score}${best.won ? ' 🏆' : ''}` : 'Tip: correct answers give better power-ups!';
}
let preview = null;
function showPreview() {
  if (preview) scene.remove(preview);
  preview = inst('hero_' + heroId); animate(preview, 'emote-yes'); blob(preview, 1.3); preview.position.set(0, 0, 0); preview.rotation.y = .4; scene.add(preview);
  player = preview; // la cámara lo sigue en el menú
}
$('play').onclick = () => { if (preview) { scene.remove(preview); preview = null; } startRun(); };
$('again').onclick = startRun;
$('creditsBtn').onclick = () => $('credits').classList.remove('hidden');
$('closeCredits').onclick = () => $('credits').classList.add('hidden');
setMuted(muted);
// ?debug: acceso para probar (saltar tiempo, jefes, mascotas). No afecta el juego normal.
if (location.search.includes('debug')) window.__hh = { get S() { return S; }, spawnBoss, addPet, levelPet, gainXp, renderPets };

(async () => {
  try { await loadAll(); }
  catch (err) { console.error(err); $('loading').querySelector('div div').textContent = 'Could not load the game. Please reload the page.'; return; }
  buildWorld(); buildMenu(); showPreview();
  S = null; $('loading').classList.add('hidden'); $('menu').classList.remove('hidden');
  frame();
})();
