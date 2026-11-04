import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { ZONES } from './content.js';

export const scene = new THREE.Scene();
export const colliders = [];          // {x,z,r}
export const animated = [];           // functions (t,dt)
export const ISLAND = 74;
export const ZONE_R = 40;

const loader = new GLTFLoader();
const cache = {};
let loadTotal = 0, loadDone = 0, onProgress = () => {};
export function setProgress(fn) { onProgress = fn; }
function load(url) {
  if (!cache[url]) {
    loadTotal++;
    cache[url] = new Promise(res => loader.load(url, g => { loadDone++; onProgress(loadDone / loadTotal); res(g); }, undefined, e => { loadDone++; console.warn('No se pudo cargar', url, e); res(null); }));
  }
  return cache[url];
}

// ---------- helpers ----------
let seed = 11;
export function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
export function zonePos(i) { const a = -Math.PI / 2 + i * (Math.PI * 2 / 5); return new THREE.Vector3(Math.cos(a) * ZONE_R, 0, Math.sin(a) * ZONE_R); }
function shadowize(o) { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); }
const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true, ...extra });

/** Place a KayKit prop scaled to a target height. key = 'pack/name' */
export async function prop(key, x, z, h, opt = {}) {
  const g = await load(`assets/models/${key}.gltf`);
  if (!g) return null;
  const o = g.scene.clone(true);
  const box = new THREE.Box3().setFromObject(o);
  const size = box.getSize(new THREE.Vector3());
  const s = h / Math.max(size.y, 0.001);
  o.scale.setScalar(s);
  o.position.set(x, (opt.y || 0) - box.min.y * s, z);
  o.rotation.y = opt.ry ?? rnd() * Math.PI * 2;
  shadowize(o);
  (opt.parent || scene).add(o);
  if (opt.r) colliders.push({ x, z, r: opt.r });
  return o;
}

// ---------- characters ----------
let animClips = null;
async function clips() {
  if (!animClips) animClips = Promise.all(['General', 'MovementBasic', 'Simulation', 'CombatMelee'].map(n => load(`assets/chars/anim_${n}.glb`)))
    .then(gs => { const m = {}; gs.forEach(g => g && g.animations.forEach(c => { if (c.name !== 'T-Pose') m[c.name] = c; })); return m; });
  return animClips;
}
export async function makeChar(model, tint) {
  const g = await load(`assets/chars/${model}.glb`);
  const root = SkeletonUtils.clone(g.scene);
  shadowize(root);
  if (tint) root.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.lerp(new THREE.Color(tint), 0.75); } });
  const mixer = new THREE.AnimationMixer(root);
  const cl = await clips();
  const actions = {};
  for (const k in cl) actions[k] = mixer.clipAction(cl[k]);
  for (const k of ['Jump_Start', 'Interact', 'PickUp', 'Hit_A', 'Melee_1H_Attack_Chop', 'Melee_Unarmed_Attack_Punch_A', 'Death_A', 'Jump_Land']) if (actions[k]) { actions[k].setLoop(THREE.LoopOnce); actions[k].clampWhenFinished = true; }
  const c = { root, mixer, actions, cur: null, lockUntil: 0 };
  c.play = (name, fade = 0.2, once = false) => {
    const a = actions[name]; if (!a || c.cur === a) return;
    a.reset().fadeIn(fade).play();
    if (c.cur) c.cur.fadeOut(fade);
    c.cur = a; c.curName = name;
    if (once) c.lockUntil = performance.now() + a.getClip().duration * 1000 * 0.9;
  };
  c.play('Idle_A', 0);
  return c;
}

// ---------- custom pieces ----------
/** Floating eco crystal (used on the pedestals) */
export function ecoCrystal(x, y, z, color, parent = scene) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), M(color, { emissive: color, emissiveIntensity: 0.6, roughness: 0.3 }));
  body.scale.y = 1.4;
  const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 5), M('#5fd35f')); leaf.position.set(0.18, 0.75, 0); leaf.rotation.z = -0.6;
  g.add(body, leaf); g.position.set(x, y, z); parent.add(g);
  g.userData.body = body;
  const ph = rnd() * 6;
  animated.push(t => { g.rotation.y = t * 0.8 + ph; g.position.y = y + Math.sin(t * 1.5 + ph) * 0.1; });
  return g;
}

/** Plastic bottle used in the online clean-up */
export function bottle(color, parent) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 10), M('#bfe9ff', { transparent: true, opacity: 0.75, roughness: 0.15, emissive: '#6fc3ff', emissiveIntensity: 0.25 }));
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.28, 0.3, 10), body.material); neck.position.y = 0.6;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 10), M(color)); cap.position.y = 0.8;
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.3, 10), M(color)); label.position.y = 0.05;
  const inner = new THREE.Group(); inner.add(body, neck, cap, label); inner.rotation.z = 0.5; inner.position.y = 1.4;
  g.add(inner); parent.add(g);
  return g;
}

function recyclingBins(x, z, ry) {
  const g = new THREE.Group();
  [['#2f6fe0', 'PAPER'], ['#f2c21a', 'PLASTIC'], ['#2fae5a', 'GLASS']].forEach(([c], i) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.1, 0.8), M(c)); b.position.set((i - 1) * 1, 0.55, 0);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.12, 0.86), M(c)); lid.position.set((i - 1) * 1, 1.16, 0);
    const sym = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 4, 3), M('#ffffff')); sym.position.set((i - 1) * 1, 0.6, 0.41);
    g.add(b, lid, sym);
  });
  g.position.set(x, 0, z); g.rotation.y = ry; shadowize(g); scene.add(g); colliders.push({ x, z, r: 1.6 });
}

export const turbines = [];
function windTurbine(x, z, h, ry) {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.35, h, 8), M('#f4f4f4')); tower.position.y = h / 2;
  const nac = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 1.1), M('#e8e8e8')); nac.position.set(0, h, 0.1);
  const rotor = new THREE.Group(); rotor.position.set(0, h, 0.7);
  for (let i = 0; i < 3; i++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.28, h * 0.45, 0.06), M('#ffffff')); bl.position.y = h * 0.225; const p = new THREE.Group(); p.rotation.z = i * Math.PI * 2 / 3; p.add(bl); rotor.add(p); }
  rotor.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), M('#dddddd')));
  g.add(tower, nac, rotor); g.position.set(x, 0, z); g.rotation.y = ry; shadowize(g); scene.add(g);
  colliders.push({ x, z, r: 0.6 });
  const tb = { rotor, speed: 0 }; turbines.push(tb);
  animated.push((t, dt) => { rotor.rotation.z += dt * tb.speed; });
}

function solarPanel(x, z, ry) {
  const g = new THREE.Group();
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1, 6), M('#888')); leg.position.y = 0.5;
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 1.4), M('#2552c9', { roughness: 0.25, metalness: 0.3, emissive: '#10307a', emissiveIntensity: 0.3 })); panel.position.y = 1.08; panel.rotation.x = 0.35;
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.12, 0.06, 1.52), M('#cfd6e0')); frame.position.y = 1.03; frame.rotation.x = 0.35;
  g.add(leg, frame, panel); g.position.set(x, 0, z); g.rotation.y = ry; shadowize(g); scene.add(g);
  colliders.push({ x, z, r: 0.9 });
}

function chimney(x, z, smokeList) {
  const base = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 3), M('#6d6460')); base.position.set(x, 1.25, z);
  const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 6, 8), M('#7a6f6a')); ch.position.set(x + 0.6, 4, z);
  shadowize(base); shadowize(ch); scene.add(base, ch); colliders.push({ x, z, r: 2.2 });
  const puffs = new THREE.Group(); scene.add(puffs);
  for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.7, 7, 5), M('#3d3a3a', { transparent: true, opacity: 0.7 })); puffs.add(p); p.userData.o = i / 8; }
  animated.push(t => puffs.children.forEach(p => { const k = (t * 0.25 + p.userData.o) % 1; p.position.set(x + 0.6 + k * 3, 7 + k * 6, z + Math.sin(k * 6) * 0.6); p.scale.setScalar(0.6 + k * 1.8); p.material.opacity = 0.75 * (1 - k); }));
  smokeList.push(puffs);
}

function turtle(x, z, ry) {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), M('#3f8f4f')); shell.scale.y = 0.6; shell.position.y = 0.12;
  const belly = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.12, 10), M('#d9c27a')); belly.position.y = 0.1;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), M('#7fbf6a')); head.position.set(0, 0.25, 0.8);
  g.add(shell, belly, head);
  for (const [fx, fz] of [[-0.6, 0.4], [0.6, 0.4], [-0.5, -0.45], [0.5, -0.45]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.06, 0.2), M('#7fbf6a')); f.position.set(fx, 0.1, fz); f.rotation.y = fx * 0.6; g.add(f); }
  g.position.set(x, 0, z); g.rotation.y = ry; shadowize(g); scene.add(g);
  animated.push(t => { head.position.z = 0.8 + Math.sin(t * 1.3) * 0.05; });
}

function umbrella(x, z, color) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), M('#eeeeee')); pole.position.set(x, 1.3, z);
  const top = new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.6, 8), M(color)); top.position.set(x, 2.6, z);
  shadowize(top); scene.add(pole, top); colliders.push({ x, z, r: 0.3 });
}

let puffTex = null;
function puffTexture() {   // soft round dot so smog particles are not squares
  if (puffTex) return puffTex;
  const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d');
  const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = gr; c.fillRect(0, 0, 64, 64);
  puffTex = new THREE.CanvasTexture(cv); return puffTex;
}

/** A grey cloud of smog particles around a zone */
function smogCloud(cx, cz, rad = 11) {
  const n = 220, pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) base.push([cx + (rnd() - .5) * rad * 2, rnd() * 6, cz + (rnd() - .5) * rad * 2, rnd() * 6]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: '#5a5550', size: 2.2, map: puffTexture(), transparent: true, opacity: 0.5, depthWrite: false }));
  scene.add(pts);
  animated.push(t => { if (!pts.visible) return; for (let i = 0; i < n; i++) { const b = base[i]; pos[i * 3] = b[0] + Math.sin(t * .3 + b[3]) * 1.2; pos[i * 3 + 1] = 0.8 + ((b[1] + t * 0.35 + b[3]) % 6); pos[i * 3 + 2] = b[2] + Math.cos(t * .25 + b[3]) * 1.2; } g.attributes.position.needsUpdate = true; });
  return pts;
}

// ---------- world ----------
export const pedestals = [];   // central crystals, one per zone
export const zoneInfo = [];    // {center, npcPos, bagPos[]}
export const smogs = [];       // per zone: [objects that disappear when the zone is clean]
export const greens = [];      // per zone: [objects that appear when the zone is clean]
export const greatTree = { bare: null, green: null };

export async function buildWorld() {
  scene.background = new THREE.Color('#8fd3ff');
  scene.fog = new THREE.Fog('#bfe6ff', 70, 170);
  scene.add(new THREE.HemisphereLight('#ffffff', '#5b8c3a', 1.1));
  const sun = new THREE.DirectionalLight('#fff3d6', 2.2);
  sun.position.set(30, 50, 20); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: 1, far: 140 });
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  scene.userData.sun = sun;

  // island
  const gg = new THREE.CircleGeometry(ISLAND + 6, 96); gg.rotateX(-Math.PI / 2);
  const cols = []; const c1 = new THREE.Color('#6cc04a'), c2 = new THREE.Color('#57a83c');
  for (let i = 0; i < gg.attributes.position.count; i++) { const c = c1.clone().lerp(c2, rnd()); cols.push(c.r, c.g, c.b); }
  gg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const ground = new THREE.Mesh(gg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
  ground.receiveShadow = true; scene.add(ground);
  const beach = new THREE.Mesh(new THREE.RingGeometry(ISLAND + 5, ISLAND + 11, 96).rotateX(-Math.PI / 2), M('#f1d9a0')); beach.position.y = -0.05; beach.receiveShadow = true; scene.add(beach);
  const water = new THREE.Mesh(new THREE.CircleGeometry(400, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#3fb3e8', roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.92 }));
  water.position.y = -0.3; scene.add(water);
  animated.push(t => { water.position.y = -0.3 + Math.sin(t * 0.8) * 0.05; });

  // plaza + paths
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(12, 40).rotateX(-Math.PI / 2), M('#d9cfa6')); plaza.position.y = 0.02; plaza.receiveShadow = true; scene.add(plaza);
  const ringStone = new THREE.Mesh(new THREE.RingGeometry(11.6, 12.4, 40).rotateX(-Math.PI / 2), M('#a8a07a')); ringStone.position.y = 0.03; scene.add(ringStone);
  const pads = ['#4a4038', '#f1d9a0', '#a9a9b2', '#c9a86a', '#b8d88a'];
  for (let i = 0; i < 5; i++) {
    const p = zonePos(i), len = ZONE_R - 12;
    const path = new THREE.Mesh(new THREE.PlaneGeometry(3.2, len).rotateX(-Math.PI / 2), M('#d8c48e'));
    const mid = p.clone().multiplyScalar((12 + len / 2) / ZONE_R);
    path.position.set(mid.x, 0.015, mid.z); path.rotation.y = -Math.atan2(p.z, p.x) + Math.PI / 2; path.receiveShadow = true; scene.add(path);
    const pad = new THREE.Mesh(new THREE.CircleGeometry(10, 32).rotateX(-Math.PI / 2), M(pads[i])); pad.position.set(p.x, 0.02, p.z); pad.receiveShadow = true; scene.add(pad);
  }

  // The Great Tree (centre): dry until the end of the story
  const garden = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24).rotateX(-Math.PI / 2), M('#6b4a2b')); garden.position.y = 0.04; scene.add(garden);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.3, 6, 20).rotateX(Math.PI / 2), M('#9a9488')); rim.position.y = 0.15; shadowize(rim); scene.add(rim);
  greatTree.bare = await prop('fo/Tree_Bare_1_A_Color1', 0, 0, 9, { ry: 0 });
  greatTree.green = await prop('fo/Tree_1_A_Color1', 0, 0, 12, { ry: 0 });
  colliders.push({ x: 0, z: 0, r: 2.6 });
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 5, x = Math.cos(a) * 6.5, z = Math.sin(a) * 6.5;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 1.3, 8), M('#b9b29a')); ped.position.set(x, 0.65, z); shadowize(ped); scene.add(ped);
    colliders.push({ x, z, r: 0.7 });
    const l = ecoCrystal(x, 2.0, z, '#777777');
    l.userData.body.material.emissiveIntensity = 0;
    pedestals.push({ crystal: l, color: ZONES[i].color });
  }
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i + 0.5) * Math.PI * 2 / 5;
    prop('cb/bench', Math.cos(a) * 10, Math.sin(a) * 10, 0.9, { ry: -a - Math.PI / 2, r: 1 });
    prop('cb/streetlight', Math.cos(a) * 12.8, Math.sin(a) * 12.8, 4.5, { ry: -a + Math.PI / 2, r: 0.4 });
  }

  // village houses between zones
  const houses = ['hx/building_home_A_green', 'hx/building_home_B_green', 'hx/building_tavern_green', 'hx/building_home_A_blue', 'hx/building_church_green', 'hx/building_market_green'];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i + 0.5) * Math.PI * 2 / 5;
    for (const [d, off] of [[22, -0.12], [27, 0.1]]) {
      const x = Math.cos(a + off) * d, z = Math.sin(a + off) * d;
      prop(houses[(i * 2 + (d > 25 ? 1 : 0)) % houses.length], x, z, 6.5, { ry: -a - Math.PI / 2, r: 3.6 });
    }
  }

  // mountains, trees and clouds
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2 + 0.1, d = ISLAND + 26 + rnd() * 10;
    prop(['hx/mountain_A_grass_trees', 'hx/mountain_B_grass_trees', 'hx/hills_A_trees'][i % 3], Math.cos(a) * d, Math.sin(a) * d, 18 + rnd() * 14);
  }
  const trees = ['fo/Tree_1_A_Color1', 'fo/Tree_2_A_Color1', 'fo/Tree_3_A_Color1', 'fo/Tree_4_A_Color1', 'fo/Tree_2_C_Color1'];
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI * 2, d = 48 + rnd() * (ISLAND - 50);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    let near = false; for (let k = 0; k < 5; k++) { const p = zonePos(k); if (Math.hypot(p.x - x, p.z - z) < 14) near = true; }
    if (near) continue;
    prop(trees[i % 5], x, z, 5 + rnd() * 3, { r: 0.9 });
  }
  for (let i = 0; i < 40; i++) { const a = rnd() * Math.PI * 2, d = 14 + rnd() * 58; const x = Math.cos(a) * d, z = Math.sin(a) * d; let near = false; for (let k = 0; k < 5; k++) { const p = zonePos(k); if (Math.hypot(p.x - x, p.z - z) < 11) near = true; } if (near) continue; prop(['fo/Bush_1_A_Color1', 'fo/Bush_2_C_Color1', 'fo/Grass_1_A_Color1', 'fo/Grass_2_A_Color1', 'fo/Rock_1_A_Color1'][i % 5], x, z, i % 5 === 4 ? 0.9 : 0.7); }
  for (let i = 0; i < 9; i++) { const g = await prop(i % 2 ? 'hx/cloud_big' : 'hx/cloud_small', (rnd() - .5) * 160, (rnd() - .5) * 160, 3, { y: 32 + rnd() * 10 }); if (g) { g.scale.multiplyScalar(2.5); const sp = 0.5 + rnd(); animated.push((t, dt) => { g.position.x += dt * sp; if (g.position.x > 100) g.position.x = -100; }); } }

  for (let i = 0; i < 5; i++) await buildZone(i);
}

// Local zone coordinates: +dz points toward the plaza (front), -dz is the back.
const BAG_OFFS = {
  forest: [[-7, -3], [6.5, 1], [2, -8.5]],
  ocean: [[-7.5, 1], [8, -3], [0, -13]],
  city: [[-8, -2], [8, 3], [0, -7]],
  farm: [[-6, -0.5], [6, -3], [-2, -10]],
  energy: [[-6.5, 0], [6, -2.5], [0, -12.5]],
};

async function buildZone(i) {
  const z = ZONES[i], c = zonePos(i), cx = c.x, cz = c.z;
  const u = new THREE.Vector3(-cx, 0, -cz).normalize();       // toward plaza
  const rt = new THREE.Vector3(-u.z, 0, u.x);                  // local right
  const W = (dx, dz) => [cx + rt.x * dx + u.x * dz, cz + rt.z * dx + u.z * dz];
  const toC = Math.atan2(u.x, u.z);                            // rotation that faces the plaza
  const V = (dx, dz) => { const [x, zz] = W(dx, dz); return new THREE.Vector3(x, 0, zz); };
  const npcPos = V(0, 2.5);
  zoneInfo.push({ center: c, npcPos, bagPos: BAG_OFFS[z.id].map(([dx, dz]) => V(dx, dz)) });
  const P = (k, dx, dz, h, o = {}) => { const [x, zz] = W(dx, dz); return prop(k, x, zz, h, o); };
  const clean = [smogCloud(cx, cz)];   // things that disappear when the zone is restored
  const green = [];                    // things that appear when the zone is restored
  const dirty = (o) => { if (o) clean.push(o); return o; };
  const front = (dx, dz) => dz > 3 && Math.abs(dx) < 4;

  if (z.id === 'forest') {
    await P('hx/building_lumbermill_green', 0, -13, 6, { ry: toC, r: 3.5 });
    // burnt trees at the back and sides
    for (let k = 0; k < 14; k++) {
      const a = rnd() * Math.PI * 2, d = 8 + rnd() * 6, dx = Math.cos(a) * d, dz = Math.sin(a) * d;
      if (front(dx, dz) || (dz < -10 && Math.abs(dx) < 5)) continue;
      P(['fo/Tree_Bare_1_A_Color1', 'fo/Tree_Bare_2_A_Color1', 'fo/Tree_Bare_1_B_Color1'][k % 3], dx, dz, 5 + rnd() * 2, { r: 0.6 });
    }
    // young native trees planted in rows, with a little fence
    for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) P(['fo/Tree_3_A_Color1', 'fo/Tree_4_A_Color1', 'fo/Tree_1_A_Color1'][(r + q) % 3], -5 + q * 1.8, -3 - r * 1.8, 1.3 + rnd() * 0.5);
    for (let q = 0; q < 3; q++) P('hx/fence_wood_straight', -5 + q * 1.8, -0.8, 0.8, { ry: toC + Math.PI / 2 });
    await P('rb/Wood_Log_Stack', 5, -4, 1, { r: 1.2 });
    P('rb/Wood_Log_A', 4, -1.5, 0.45); P('hx/trees_A_cut', 7, -7, 1.2); P('hx/trees_A_cut', -8, -8, 1.2);
    P('hx/tent', 7.5, 4, 2.5, { ry: toC - 0.5, r: 1.6 });
    P('hx/wheelbarrow', -3, 1, 0.9, { r: 0.6 });
    dirty(await P('cb/trash_A', 2.5, -2, 0.7)); dirty(await P('cb/trash_B', -7.5, 3, 0.8));
  }
  if (z.id === 'ocean') {
    const [px, pz] = W(0, -6);
    const pond = new THREE.Mesh(new THREE.CircleGeometry(5.5, 28).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2aa6e0', roughness: 0.15, transparent: true, opacity: 0.92 }));
    pond.position.set(px, 0.05, pz); scene.add(pond); colliders.push({ x: px, z: pz, r: 5 });
    const dirtyWater = new THREE.Mesh(new THREE.CircleGeometry(5.55, 28).rotateX(-Math.PI / 2), M('#6b6f52', { transparent: true, opacity: 0.85 }));
    dirtyWater.position.set(px, 0.07, pz); scene.add(dirtyWater); clean.push(dirtyWater);
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; P(['fo/Rock_1_A_Color1', 'fo/Rock_2_C_Color1', 'fo/Rock_3_A_Color1'][k % 3], Math.cos(a) * 6 , -6 + Math.sin(a) * 6, 0.5 + rnd() * 0.5); }
    for (let k = 0; k < 4; k++) P(k % 2 ? 'hx/waterlily_A' : 'hx/waterlily_B', -2.5 + k * 1.7, -6 + (k % 2 ? 2 : -2), 0.15, { y: 0.06 });
    const [tx, tz] = W(3.5, -0.2); turtle(tx, tz, toC + 2.2);
    umbrella(...W(6, 3), '#ff5a5a'); umbrella(...W(-5, 4), '#ffd23a');
    P('hx/crate_A_big', -7, -2, 0.9, { r: 0.6 }); P('hx/bucket_water', -6, -1, 0.5);
    dirty(await P('rb/Fuel_A_Barrel_Dirty', 7, -6, 1.1, { r: 0.6 })); dirty(await P('rb/Fuel_B_Barrel_Dirty', 7.8, -7.5, 1.1));
    dirty(await P('cb/trash_A', -3, 0.5, 0.6)); dirty(await P('cb/trash_B', 4, -11, 0.7));
  }
  if (z.id === 'city') {
    const road = new THREE.Mesh(new THREE.PlaneGeometry(20, 3.6).rotateX(-Math.PI / 2), M('#55555c')); road.position.set(W(0, -4.5)[0], 0.03, W(0, -4.5)[1]); road.rotation.y = toC; scene.add(road);
    for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.2).rotateX(-Math.PI / 2), M('#f5f5f5')); const [x, zz] = W(-8 + k * 3.2, -4.5); s.position.set(x, 0.04, zz); s.rotation.y = toC; scene.add(s); }
    const blds = ['cb/building_A_withoutBase', 'cb/building_B_withoutBase', 'cb/building_C_withoutBase', 'cb/building_D_withoutBase', 'cb/building_E_withoutBase', 'cb/building_F_withoutBase'];
    const spots = [[-9, -10, 9], [-3, -11, 11], [3.5, -11, 8], [9.5, -10, 10], [-11, -1, 7], [11, 0, 8]];
    for (let k = 0; k < spots.length; k++) await P(blds[k], spots[k][0], spots[k][1], spots[k][2], { ry: toC, r: 3 });
    P('cb/car_sedan', -4, -4, 1.2, { ry: toC + Math.PI / 2 }); P('cb/car_taxi', 5, -5, 1.2, { ry: toC - Math.PI / 2 });
    colliders.push({ x: W(-4, -4)[0], z: W(-4, -4)[1], r: 1.2 }, { x: W(5, -5)[0], z: W(5, -5)[1], r: 1.2 });
    recyclingBins(...W(4.5, 1), toC);
    P('cb/dumpster', -6, 0.5, 1.4, { ry: toC, r: 1.2 });
    P('cb/streetlight', -7, -2.2, 4, { ry: toC, r: 0.3 }); P('cb/streetlight', 7, -2.2, 4, { ry: toC, r: 0.3 });
    P('cb/firehydrant', 2.5, -2.4, 0.7, { r: 0.3 }); P('cb/bench', -3, 1, 0.9, { ry: toC, r: 0.9 });
    for (let k = 0; k < 6; k++) dirty(await P(k % 2 ? 'cb/trash_A' : 'cb/trash_B', -8 + k * 3.2 + rnd(), -1 + rnd() * 2 * (k % 2 ? 1 : -1), 0.6));
    dirty(await P('cb/box_A', 8, -1, 0.6)); dirty(await P('cb/box_B', -2, -7.2, 0.6));
  }
  if (z.id === 'farm') {
    for (let r = 0; r < 4; r++) {
      const [x, zz] = W(-6, -3 - r * 1.6);
      const row = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 0.9), M('#7a5230')); row.position.set(x, 0.1, zz); row.rotation.y = toC; row.receiveShadow = true; scene.add(row);
      for (let q = 0; q < 5; q++) P(['fo/Bush_1_A_Color1', 'fo/Grass_2_A_Color1', 'fo/Bush_2_C_Color1', 'fo/Bush_4_A_Color1'][r], -8.4 + q * 1.2, -3 - r * 1.6, 0.55);
    }
    await P('hx/building_watermill_green', 8, -7, 6, { ry: toC, r: 3.4 });
    await P('hx/building_well_green', 6.5, 1.5, 3, { ry: toC, r: 1.4 });
    await P('cb/watertower', 0, -12, 7, { ry: toC, r: 1.8 });
    await P('hx/building_grain', -9, 3, 3, { ry: toC, r: 1.8 });
    P('rs/crate_tomatoes', 2.5, -2, 0.6, { r: 0.5 }); P('rs/crate_carrots', 3.4, -2.6, 0.6); P('rs/crate_potatoes', 2.8, -3.5, 0.6);
    P('hx/wheelbarrow', -1.5, -5, 0.9, { r: 0.6 }); P('hx/sack', -2.5, -6, 0.7);
    // dry river bed
    const [rx, rz] = W(11, -2);
    const bed = new THREE.Mesh(new THREE.PlaneGeometry(3, 22).rotateX(-Math.PI / 2), M('#a98a5a')); bed.position.set(rx, 0.035, rz); bed.rotation.y = toC; scene.add(bed);
    const river = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 22).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4fc3f7', roughness: 0.2, transparent: true, opacity: 0.9 }));
    river.position.set(rx, 0.05, rz); river.rotation.y = toC; scene.add(river); green.push(river);
    dirty(await P('cb/trash_A', -4, 1.5, 0.6)); dirty(await P('cb/trash_B', 5, -9, 0.7));
  }
  if (z.id === 'energy') {
    for (const [dx, dz] of [[-9, -6], [-4, -12], [4, -12], [9, -6]]) { const [x, zz] = W(dx, dz); windTurbine(x, zz, 9, toC); }
    for (let r = 0; r < 2; r++) for (let q = 0; q < 3; q++) { const [x, zz] = W(-7 + q * 2.2, -1.5 - r * 2.2); solarPanel(x, zz, toC); }
    const smoke = []; const [chx, chz] = W(5, -4); chimney(chx, chz, smoke); clean.push(...smoke);
    P('hx/building_windmill_green', 9, 2, 6, { ry: toC, r: 2.4 });
    P('hx/building_home_A_blue', -9, 3, 5, { ry: toC, r: 3 });
    P('cb/streetlight', -3, 1, 4, { ry: toC, r: 0.3 }); P('cb/streetlight', 3, 1, 4, { ry: toC, r: 0.3 });
    dirty(await P('rb/Fuel_A_Barrels', 2, -8, 1.1, { r: 1 })); dirty(await P('rb/Stone_Chunks_Small', 3.5, -1, 0.5));
    P('hx/flag_green', 0, -8, 2.5, { ry: toC });
  }
  smogs[i] = clean;
  greens[i] = green;
}
