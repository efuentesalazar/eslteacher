/* Weather Heroes — 3D third-person English game for 5° básico (Unit 4: What's the weather like?)
   Three.js + Kenney CC0 models. Story mode is saved in the browser; online mode uses Supabase Realtime. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CLOTHES, SLOTS, ZONES, STORY, LESSONS, NPCS, NPC_HELLO, QUICK, CALLS, PHRASES } from './content.js';
import { logAnswer, student } from './track.js';

/* ===== Registro para el Panel del profe (eslteacher.cl → Análisis de juegos) =====
   Se guarda cada intento. Habilidad: V vocabulario · A audición · R lectura · G gramática · O ordenar · C completar */
const GAME_ID = 'weather-heroes-5b';
function skillOf(s, L) {
  if (s.read) return 'R';
  if (s.t === 'listen') return 'A';
  if (s.t === 'order') return 'O';
  if (s.t === 'gap') return 'C';
  if (s.t === 'mcq' && L && /language/i.test(L.kind)) return 'G';
  return 'V';
}
function track(activity, s, L, q, chosen, right, ok, t0) {
  logAnswer(GAME_ID, { activity, item: { q, k: skillOf(s, L) }, chosen, right, ok, ms: performance.now() - t0 });
}
// texto de la pregunta: incluye la imagen y lo que se escucha, para distinguir preguntas parecidas
const qText = s => `${s.pic ? s.pic + ' ' : ''}${s.q}${s.say ? ` 🔊 "${s.say}"` : ''}`;

/* ================= small helpers ================= */
const $ = id => document.getElementById(id);
const show = (el, on = true) => (typeof el === 'string' ? $(el) : el).classList.toggle('hidden', !on);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const shuffle = (arr, r = Math.random) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const SKINS = 'abcdefghijklmnopqr'.split('');
const SEASON_ICON = { summer: '☀️', spring: '🌸', autumn: '🍂', winter: '❄️' };
const CRYSTAL_ZONE = { summer: 'desert', spring: 'forest', autumn: 'hills', winter: 'snow' };
const CRYSTAL_COLOR = { summer: 0xffa726, spring: 0x66e08a, autumn: 0xd9772b, winter: 0x7fd8ff };
const ZONE_LESSONS = { desert: ['desertRead', 'desertLang', 'desertVocab'], forest: ['forestRead', 'forestLang', 'forestVocab'], snow: ['snowRead', 'snowLang', 'snowVocab'], hills: ['hillsRead', 'hillsLang', 'hillsVocab'] };
const ZONE_CRYSTAL_LESSON = { desert: 'desertCrystal', forest: 'forestCrystal', snow: 'snowCrystal', hills: 'hillsCrystal' };

/* ================= settings, save ================= */
const SAVE_KEY = 'weatherHeroes.v1', OPT_KEY = 'weatherHeroes.opts';
const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const OPTS = Object.assign({ voice: true, music: true }, store.get(OPT_KEY) || {});
const newProgress = () => ({ name: '', skin: 'a', introDone: false, lessons: {}, collected: {}, collecting: {}, crystals: {}, outfit: { body: 'tshirt', feet: 'sandals' }, finalDone: false, visited: {} });
let P = newProgress();          // current progress (story: saved; online: session only)
let MODE = 'story';             // 'story' | 'online'
const saveGame = () => { if (MODE === 'story' && P.name && GAME.running) store.set(SAVE_KEY, P); };

/* ================= audio ================= */
const SFX = {}; ['ok', 'bad', 'click', 'pickup', 'open', 'win', 'crystal'].forEach(n => { SFX[n] = `assets/audio/${n}.ogg`; });
function sfx(n, vol = .6) { try { const a = new Audio(SFX[n]); a.volume = vol; a.play().catch(() => {}); } catch (e) {} }
const music = { town: new Audio('assets/audio/music-town.mp3'), adv: new Audio('assets/audio/music-adventure.mp3'), cur: null };
Object.values(music).forEach(a => { if (a && a.loop !== undefined) { a.loop = true; a.volume = 0; } });
function musicTick(dt, zone) {
  const want = !OPTS.music || !GAME.running ? null : (zone === 'town' ? 'town' : 'adv');
  for (const k of ['town', 'adv']) {
    const a = music[k], target = k === want ? .32 : 0;
    a.volume = clamp(a.volume + Math.sign(target - a.volume) * dt * .4, 0, .32);
    if (target > 0 && a.paused) a.play().catch(() => {});
    if (a.volume === 0 && !a.paused && target === 0) a.pause();
  }
}
let AC = null, rainGain = null, windGain = null;
function initAmbient() {
  if (AC) return;
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    const len = AC.sampleRate * 2, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const mk = (type, freq, q) => { const src = AC.createBufferSource(); src.buffer = buf; src.loop = true; const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = AC.createGain(); g.gain.value = 0; src.connect(f); f.connect(g); g.connect(AC.destination); src.start(); return { g, f }; };
    rainGain = mk('bandpass', 1400, .6).g;
    const w = mk('lowpass', 500, 1); windGain = w.g; windGain.f = w.f;
  } catch (e) { AC = null; }
}
function thunder() {
  if (!AC) return;
  const len = AC.sampleRate * 2.2, buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const s = AC.createBufferSource(); s.buffer = buf; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180; const g = AC.createGain(); g.gain.value = .9;
  s.connect(f); f.connect(g); g.connect(AC.destination); s.start();
}
/* text to speech (English voice) */
let VOICE = null;
function pickVoice() { const vs = speechSynthesis.getVoices(); VOICE = vs.find(v => /en-US/i.test(v.lang) && /female|samantha|zira|google us/i.test(v.name)) || vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null; }
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text, force = false) {
  if (!('speechSynthesis' in window) || (!OPTS.voice && !force)) return;
  try {
    speechSynthesis.cancel();
    const clean = String(text).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').replace(/___/g, 'blank').replace(/−/g, 'minus ');
    const u = new SpeechSynthesisUtterance(clean); u.lang = 'en-US'; u.rate = .88; if (VOICE) u.voice = VOICE; speechSynthesis.speak(u);
  } catch (e) {}
}

/* ================= renderer, scene ================= */
const canvas = $('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
const PHONE = matchMedia('(pointer: coarse)').matches;
renderer.setPixelRatio(Math.min(devicePixelRatio, PHONE ? 1.25 : 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87c8ff);
scene.fog = new THREE.Fog(0x87c8ff, 60, 320);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, .1, 900);
const hemi = new THREE.HemisphereLight(0xdff1ff, 0x6d8a4a, 1.4); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff2d6, 2.6);
sun.castShadow = true; sun.shadow.mapSize.set(PHONE ? 1024 : 1536, PHONE ? 1024 : 1536);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 200 });
sun.shadow.bias = -.0005; sun.shadow.normalBias = .03;
scene.add(sun, sun.target);
/* tall phone screens: wider view and camera a bit farther back */
let camFar = 1;
function fitView() {
  renderer.setSize(innerWidth, innerHeight);
  const a = innerWidth / innerHeight; camera.aspect = a;
  camera.fov = a < 1 ? Math.min(78, 60 + (1 - a) * 34) : 60;
  camFar = a < 1 ? 1.2 : 1;
  camera.updateProjectionMatrix();
}
fitView();
addEventListener('resize', fitView);

/* ================= world shape ================= */
const WORLD = 440, SEG = 150, MAXR = 192;
const ZDIR = { desert: [0, -1], forest: [-1, 0], snow: [0, 1], hills: [1, 0] };
const PONDS = [{ x: -150, z: -42, r: 15, d: 3.2 }, { x: -32, z: -96, r: 9, d: 2.8 }];
function zoneW(x, z) {
  const r = Math.hypot(x, z) || 1, t = 1 - smooth(38, 62, r), w = { town: t }; let sum = 0;
  for (const k in ZDIR) { const d = ZDIR[k]; const c = (x * d[0] + z * d[1]) / r; const v = Math.pow(Math.max(0, c), 3) + 1e-6; w[k] = v; sum += v; }
  for (const k in ZDIR) w[k] = (1 - t) * w[k] / sum;
  return w;
}
function zoneAt(x, z) {
  if (Math.hypot(x, z) < 50) return 'town';
  let best = 'desert', bv = -9; for (const k in ZDIR) { const d = ZDIR[k]; const v = x * d[0] + z * d[1]; if (v > bv) { bv = v; best = k; } } return best;
}
function pathDist(x, z) {
  let d = 1e9;
  if (z < 4 && z > -175) d = Math.min(d, Math.abs(x)); if (z > -4 && z < 175) d = Math.min(d, Math.abs(x));
  if (x < 4 && x > -175) d = Math.min(d, Math.abs(z)); if (x > -4 && x < 175) d = Math.min(d, Math.abs(z));
  return d;
}
function heightAt(x, z) {
  const w = zoneW(x, z), r = Math.hypot(x, z);
  const n1 = Math.sin(x * .045) * Math.cos(z * .05) * 1.2 + Math.sin((x - z) * .09) * .5;
  const dune = (Math.sin(x * .07 + z * .025) + 1) * 1.6 + Math.sin(z * .13 + x * .05) * .5;
  const forest = n1 * .8 + 1.1;
  const mtn = smooth(18, 42, Math.abs(x)) * smooth(80, 125, r) * (9 + 6 * Math.sin(x * .07) * Math.cos(z * .06));
  const snow = n1 + 1.2 + mtn;
  const hills = (Math.sin(x * .06) * Math.cos(z * .07) + 1) * 3 + n1 * .5;
  let h = w.desert * dune + w.forest * forest + w.snow * snow + w.hills * hills;
  h *= smooth(28, 55, r);
  h *= .4 + .6 * smooth(3, 10, pathDist(x, z));
  h = Math.max(h, .05);
  for (const p of PONDS) { const dd = Math.hypot(x - p.x, z - p.z); if (dd < p.r) h -= p.d * (1 - (dd / p.r) ** 2); }
  h += smooth(186, 214, r) * 30;
  return h;
}
const CELL = WORLD / SEG;
function groundY(x, z) {
  const gx = (x + WORLD / 2) / CELL, gz = (z + WORLD / 2) / CELL, ix = Math.floor(gx), iz = Math.floor(gz), fx = gx - ix, fz = gz - iz;
  const X = i => i * CELL - WORLD / 2;
  const a = heightAt(X(ix), X(iz)), b = heightAt(X(ix + 1), X(iz)), c = heightAt(X(ix), X(iz + 1)), d = heightAt(X(ix + 1), X(iz + 1));
  return lerp(lerp(a, b, fx), lerp(c, d, fx), fz);
}
const ZCOL = { town: new THREE.Color(0x79c45f), desert: new THREE.Color(0xe9c97a), forest: new THREE.Color(0x3f9a4c), snow: new THREE.Color(0xf1f6fc), hills: new THREE.Color(0xc0a046) };
function groundColor(x, z, h, r) {
  const w = zoneW(x, z), c = new THREE.Color(0, 0, 0);
  for (const k in w) c.r += ZCOL[k].r * w[k], c.g += ZCOL[k].g * w[k], c.b += ZCOL[k].b * w[k];
  const n = Math.sin(x * .3 + z * .17) * Math.cos(z * .23 - x * .11);
  if (w.hills > .3) c.lerp(new THREE.Color(n > 0 ? 0xd9772b : 0x8aa93f), .35 * w.hills * Math.abs(n));
  if (w.desert > .3) c.offsetHSL(0, 0, n * .03);
  if (w.forest > .3 && n > .4) c.lerp(new THREE.Color(0x2f7d3b), .4);
  if (w.snow > .3) c.lerp(new THREE.Color(0xdfe9f5), Math.max(0, n) * .5);
  const pd = pathDist(x, z), pm = 1 - smooth(2.4, 3.8, pd);
  if (pm > 0 && Math.hypot(x, z) < 176) c.lerp(new THREE.Color(w.snow > .5 ? 0xc9d3de : 0xc9a46e), pm);
  const plaza = 1 - smooth(15, 16.5, Math.hypot(x, z)); if (plaza > 0) c.lerp(new THREE.Color(0xc9c4b8), plaza);
  if (h < -.2) c.lerp(new THREE.Color(0xc7b37a), .7);
  if (r > 190) c.lerp(new THREE.Color(w.snow > .5 ? 0xffffff : 0x8f8a80), smooth(190, 205, r));
  c.offsetHSL(0, 0, (Math.random() - .5) * .025);
  return c;
}

/* ================= model loading ================= */
const loadMgr = new THREE.LoadingManager();
loadMgr.onProgress = (u, l, t) => { $('loadBar').style.width = (100 * l / t).toFixed(0) + '%'; };
const gltfLoader = new GLTFLoader(loadMgr);
const MODELS = {};
const NAT = ['tree_default', 'tree_oak', 'tree_fat', 'tree_detailed', 'tree_cone', 'tree_pineDefaultA', 'tree_pineRoundA', 'tree_default_fall', 'tree_oak_fall', 'tree_fat_fall', 'tree_cone_fall', 'tree_palmTall', 'tree_palmBend', 'tree_palmShort', 'cactus_short', 'cactus_tall', 'rock_largeA', 'rock_largeB', 'rock_largeC', 'rock_tallA', 'rock_tallB', 'rock_smallA', 'flower_redA', 'flower_yellowA', 'flower_purpleA', 'mushroom_red', 'mushroom_redGroup', 'plant_bush', 'plant_bushLarge', 'grass', 'grass_large', 'log', 'stump_round', 'tent_detailedOpen', 'campfire_stones', 'sign', 'fence_simple', 'lily_large', 'statue_obelisk'];
const HOL = ['snowman', 'snowman-hat', 'tree-snow-a', 'tree-snow-b', 'tree-snow-c', 'snow-pile', 'sled', 'rocks-large', 'lantern', 'bench', 'reindeer', 'snowflake-a', 'present-a-cube'];
const TOWN = ['building-type-a', 'building-type-b', 'building-type-c', 'building-type-d', 'building-type-e', 'building-type-f', 'building-type-g', 'building-type-h', 'building-type-k', 'building-type-m', 'tree-large', 'tree-small', 'fence', 'planter'];
const PETS = ['penguin', 'dog', 'cat', 'bunny', 'parrot', 'polar', 'chick', 'fox', 'deer', 'bee', 'crab', 'cow', 'hog', 'pig'];
const ITEMS = ['coin-gold', 'star', 'jewel', 'flag', 'chest', 'heart', 'sign'];
const LIST = [
  ...SKINS.map(s => ['char_' + s, `assets/chars/character-${s}.glb`]),
  ...NAT.map(n => [n, `assets/nature/${n}.glb`]),
  ...HOL.map(n => [n, `assets/holiday/${n}.glb`]),
  ...TOWN.map(n => [n, `assets/town/${n}.glb`]),
  ...PETS.map(n => ['pet_' + n, `assets/pets/animal-${n}.glb`]),
  ...ITEMS.map(n => ['item_' + n, `assets/items/${n}.glb`]),
];
/* target heights in meters */
const SIZE = { tree_default: 5, tree_oak: 5.5, tree_fat: 5, tree_detailed: 6, tree_cone: 6.5, tree_pineDefaultA: 7.5, tree_pineRoundA: 6.5, tree_default_fall: 5, tree_oak_fall: 5.5, tree_fat_fall: 5, tree_cone_fall: 6.5, tree_palmTall: 8, tree_palmBend: 7, tree_palmShort: 5,
  cactus_short: 1.7, cactus_tall: 3.4, rock_largeA: 2.6, rock_largeB: 2.4, rock_largeC: 2.2, rock_tallA: 4.5, rock_tallB: 4, rock_smallA: .7, flower_redA: .55, flower_yellowA: .55, flower_purpleA: .55, mushroom_red: .6, mushroom_redGroup: .7,
  plant_bush: 1.1, plant_bushLarge: 1.7, grass: .5, grass_large: .8, log: .7, stump_round: .6, tent_detailedOpen: 2.8, campfire_stones: .6, sign: 1.5, fence_simple: 1.1, lily_large: .12, statue_obelisk: 4.5,
  snowman: 2.2, 'snowman-hat': 2.5, 'tree-snow-a': 6.5, 'tree-snow-b': 5.5, 'tree-snow-c': 7.5, 'snow-pile': .9, sled: .7, 'rocks-large': 2.2, lantern: 1.6, bench: .95, reindeer: 2, 'snowflake-a': 1.1, 'present-a-cube': .8,
  'tree-large': 6, 'tree-small': 4.2, fence: 1.1, planter: .8,
  pet_penguin: .9, pet_dog: .8, pet_cat: .7, pet_bunny: .6, pet_parrot: .6, pet_polar: 1.4, pet_chick: .45, pet_fox: .8, pet_deer: 1.4, pet_bee: .5, pet_crab: .5, pet_cow: 1.5, pet_hog: 1, pet_pig: .9,
  item_star: 1.1, item_jewel: 1, item_flag: 3.2, item_chest: 1.1, item_heart: .9, item_sign: 1.6, 'item_coin-gold': .9 };
function loadAll() {
  return Promise.all(LIST.map(([k, url]) => new Promise(res => gltfLoader.load(url, g => {
    const box = new THREE.Box3().setFromObject(g.scene), hgt = box.max.y - box.min.y || 1;
    MODELS[k] = { scene: g.scene, anims: g.animations, h: hgt, minY: box.min.y };
    g.scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if ('metalness' in m) { m.metalness = 0; m.roughness = Math.max(.75, m.roughness); } }); } });
    res();
  }, undefined, e => { console.warn('missing model', url, e); res(); }))));
}
function modelScale(k) {
  const m = MODELS[k]; if (!m) return 1;
  if (k.startsWith('building-type')) return 8 / MODELS['building-type-a'].h;
  return (SIZE[k] || 1) / m.h;
}
/* place many copies of one model as InstancedMesh (fast) */
function instanced(k, list, cast = true) {
  const m = MODELS[k]; if (!m || !list.length) return;
  const k0 = modelScale(k); m.scene.updateMatrixWorld(true);
  const meshes = []; m.scene.traverse(o => { if (o.isMesh) meshes.push(o); });
  const T = new THREE.Matrix4(), base = new THREE.Matrix4().makeTranslation(0, -m.minY, 0), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  for (const mesh of meshes) {
    const im = new THREE.InstancedMesh(mesh.geometry, mesh.material, list.length);
    im.castShadow = cast; im.receiveShadow = true;
    list.forEach((p, i) => {
      const s = (p.s || 1) * k0; q.setFromAxisAngle(up, p.ry || 0);
      T.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(s, s, s)).multiply(base).multiply(mesh.matrixWorld);
      im.setMatrixAt(i, T);
    });
    im.computeBoundingSphere(); scene.add(im);
  }
}
function cloneModel(k, s = 1) {
  const m = MODELS[k]; const g = new THREE.Group(); if (!m) return g;
  const c = m.scene.clone(true); c.scale.setScalar(modelScale(k) * s); c.position.y = -m.minY * modelScale(k) * s; g.add(c); g.userData.inner = c; return g;
}

/* ================= labels (sprites with text) ================= */
function makeLabel(text, { size = 34, bg = 'rgba(255,253,247,.92)', color = '#1f2a44', border = '#1f2a44', scale = .011, pad = 14 } = {}) {
  const c = document.createElement('canvas'), x = c.getContext('2d');
  x.font = `600 ${size}px Fredoka, system-ui, sans-serif`;
  const lines = String(text).split('\n'), w = Math.max(...lines.map(l => x.measureText(l).width)) + pad * 2, h = lines.length * size * 1.25 + pad * 1.4;
  c.width = Math.ceil(w); c.height = Math.ceil(h);
  x.font = `600 ${size}px Fredoka, system-ui, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
  if (bg) { x.fillStyle = bg; x.strokeStyle = border; x.lineWidth = 4; const r = 14; x.beginPath(); x.roundRect(2, 2, c.width - 4, c.height - 4, r); x.fill(); x.stroke(); }
  x.fillStyle = color; lines.forEach((l, i) => x.fillText(l, c.width / 2, pad * .7 + size * 1.25 * (i + .5)));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true }));
  sp.scale.set(c.width * scale, c.height * scale, 1); sp.renderOrder = 5; return sp;
}
function emojiSprite(e, sc = 1.1) { const s = makeLabel(e, { size: 64, bg: null, pad: 6, scale: .014 * sc }); return s; }

/* ================= world building ================= */
const colliders = [];           // {x,z,r}
const blocks = [];              // exclusion circles for scatter
const block = (x, z, r) => blocks.push({ x, z, r });
const free = (x, z, r = 1) => blocks.every(b => Math.hypot(x - b.x, z - b.z) > b.r + r);
const animated = [];            // objects with update(dt,t)
let waterMat;

function buildGround() {
  const geo = new THREE.PlaneGeometry(WORLD, WORLD, SEG, SEG); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, cols = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = heightAt(x, z); pos.setY(i, h);
    const c = groundColor(x, z, h, Math.hypot(x, z)); cols.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const g = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: .95 }));
  g.receiveShadow = true; scene.add(g);
  waterMat = new THREE.MeshStandardMaterial({ color: 0x3aa0e8, transparent: true, opacity: .78, roughness: .2, metalness: .1 });
  for (const p of PONDS) { const w = new THREE.Mesh(new THREE.CircleGeometry(p.r * 1.05, 24), waterMat); w.rotation.x = -Math.PI / 2; w.position.set(p.x, -.35, p.z); scene.add(w); block(p.x, p.z, p.r + 1.5); colliders.push({ x: p.x, z: p.z, r: p.r * .8 }); }
}

/* scatter props inside a zone */
function scatter(zone, n, keys, { minR = 62, maxR = 182, s = [.8, 1.25], col = .5, seed = 1, maxH = 99, near = null } = {}) {
  const r = rng(seed), lists = {};
  let tries = 0, placed = 0;
  while (placed < n && tries < n * 30) {
    tries++;
    let x, z;
    if (near) { const a = r() * Math.PI * 2, d = r() * near.r; x = near.x + Math.cos(a) * d; z = near.z + Math.sin(a) * d; }
    else { const d = ZDIR[zone], ang = Math.atan2(d[1], d[0]) + (r() - .5) * 1.75, rad = lerp(minR, maxR, Math.sqrt(r())); x = Math.cos(ang) * rad; z = Math.sin(ang) * rad; }
    if (zone !== 'any' && zoneAt(x, z) !== zone) continue;
    if (pathDist(x, z) < 5.5 || Math.hypot(x, z) > 183 || !free(x, z, col)) continue;
    const y = heightAt(x, z); if (y < .1 || y > maxH) continue;
    const k = keys[Math.floor(r() * keys.length)], sc = lerp(s[0], s[1], r());
    (lists[k] = lists[k] || []).push({ x, y: groundY(x, z) - .05, z, s: sc, ry: r() * Math.PI * 2 });
    if (col > 0) { colliders.push({ x, z, r: col * sc }); blocks.push({ x, z, r: col * sc * .7 }); }
    placed++;
  }
  for (const k in lists) instanced(k, lists[k], !/grass|flower|lily|mushroom/.test(k));
}

function place(k, x, z, ry = 0, s = 1, col = 0) {
  const o = cloneModel(k, s); o.position.set(x, groundY(x, z), z); o.rotation.y = ry; scene.add(o);
  if (col) { colliders.push({ x, z, r: col }); block(x, z, col + 1); } return o;
}

const machineSockets = {};
const shopPos = { x: -28.3, z: 12.7 };
function buildTown() {
  /* weather machine in the plaza */
  const m = new THREE.Group();
  const mat = c => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .6 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3, 1.2, 8), mat(0x8c96a8)); base.position.y = .6;
  const col = new THREE.Mesh(new THREE.CylinderGeometry(.8, 1.1, 3.2, 8), mat(0xd7dde8)); col.position.y = 2.8;
  const globe = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), new THREE.MeshStandardMaterial({ color: 0x9fd4ff, flatShading: true, emissive: 0x2266aa, emissiveIntensity: .3, roughness: .3 }));
  globe.position.y = 5.4; m.add(base, col, globe);
  Object.keys(CRYSTAL_ZONE).forEach((c, i) => {
    const a = i * Math.PI / 2 + Math.PI / 4, s = new THREE.Mesh(new THREE.OctahedronGeometry(.45), new THREE.MeshStandardMaterial({ color: 0x555b66, flatShading: true }));
    s.position.set(Math.cos(a) * 2.2, 1.7, Math.sin(a) * 2.2); m.add(s); machineSockets[c] = s;
  });
  scene.add(m); colliders.push({ x: 0, z: 0, r: 3.2 }); block(0, 0, 14);
  animated.push({ update: (dt, t) => { globe.rotation.y += dt * .4; globe.position.y = 5.4 + Math.sin(t * 1.5) * .15; } });
  const lab = makeLabel('🌦️ Weather Machine'); lab.position.set(0, 7.6, 0); scene.add(lab);
  /* houses around the plaza */
  const types = ['building-type-a', 'building-type-b', 'building-type-c', 'building-type-d', 'building-type-e', 'building-type-f', 'building-type-g', 'building-type-h', 'building-type-k', 'building-type-m'];
  const spots = [];
  for (let q = 0; q < 4; q++) for (const off of [.42, 1.15]) { const a = q * Math.PI / 2 + off; spots.push([Math.cos(a) * 31, Math.sin(a) * 31]); }
  spots.forEach(([x, z], i) => { if (i === 3 || i === 7) return; place(types[i % types.length], x, z, Math.atan2(-x, -z), 1, 4.6); });
  /* Mia's shop and the weather station */
  const shop = place('building-type-k', shopPos.x, shopPos.z, Math.atan2(-shopPos.x, -shopPos.z), 1.1, 5);
  const sl = makeLabel("👕 Mia's Clothes Shop 🧥"); sl.position.set(shopPos.x, 10.5, shopPos.z); scene.add(sl);
  const st = { x: 28.3, z: -12.7 };
  place('building-type-m', st.x, st.z, Math.atan2(-st.x, -st.z), 1.1, 5);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 6, 6), mat(0xdddddd)); mast.position.set(st.x, 12, st.z); scene.add(mast);
  const cups = new THREE.Group(); cups.position.set(st.x, 15, st.z);
  for (let i = 0; i < 3; i++) { const arm = new THREE.Mesh(new THREE.BoxGeometry(1.6, .08, .08), mat(0xbbbbbb)); arm.rotation.y = i * Math.PI * 2 / 3; arm.position.set(Math.cos(i * 2.094) * .8, 0, -Math.sin(i * 2.094) * .8); cups.add(arm); const cup = new THREE.Mesh(new THREE.SphereGeometry(.25, 6, 4), mat(0xef5a4c)); cup.position.set(Math.cos(i * 2.094) * 1.6, 0, -Math.sin(i * 2.094) * 1.6); cups.add(cup); }
  scene.add(cups); animated.push({ update: dt => { cups.rotation.y += dt * 3; } });
  const stl = makeLabel('📡 Weather Station'); stl.position.set(st.x, 17, st.z); scene.add(stl);
  /* trees, planters, benches, flowers */
  const tl = [], ts = [], fl = [], pl = [];
  const r = rng(77);
  for (let i = 0; i < 40; i++) { const a = r() * Math.PI * 2, d = 18 + r() * 28, x = Math.cos(a) * d, z = Math.sin(a) * d; if (pathDist(x, z) < 5 || !free(x, z, 2)) continue; (r() < .5 ? tl : ts).push({ x, y: groundY(x, z), z, s: .8 + r() * .4, ry: r() * 6 }); colliders.push({ x, z, r: .7 }); block(x, z, 2); }
  for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = 17 + r() * 30, x = Math.cos(a) * d, z = Math.sin(a) * d; if (pathDist(x, z) < 4 || !free(x, z, .5)) continue; fl.push({ x, y: groundY(x, z), z, s: .8 + r() * .6, ry: r() * 6, k: ['flower_redA', 'flower_yellowA', 'flower_purpleA'][i % 3] }); }
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + Math.PI / 8; pl.push({ x: Math.cos(a) * 15, y: 0, z: Math.sin(a) * 15, s: 1, ry: -a }); }
  instanced('tree-large', tl); instanced('tree-small', ts); instanced('planter', pl);
  for (const k of ['flower_redA', 'flower_yellowA', 'flower_purpleA']) instanced(k, fl.filter(f => f.k === k), false);
  [[8, 12], [-8, -12], [12, 8], [-12, -8]].forEach(([x, z]) => place('bench', x, z, Math.atan2(-x, -z), 1, .9));
}

/* zone gates: wardrobe chest + sign at the entrance of each zone */
const GATES = { desert: [6, -64], forest: [-64, -6], snow: [-6, 64], hills: [64, 6] };
const PEDESTALS = { desert: [0, -170], forest: [-170, 0], snow: [0, 172], hills: [170, 0] };
const chests = [];
function buildGates() {
  for (const zk in GATES) {
    const [x, z] = GATES[zk], Z = ZONES[zk];
    const ch = place('item_chest', x, z, Math.atan2(-x, -z), 1.3, 1);
    const lab = makeLabel('🎁 Clothes'); lab.position.set(x, 2.6, z); scene.add(lab);
    chests.push({ zone: zk, x, z });
    const d = ZDIR[zk], sx = d[0] === 0 ? -x : x, sz = d[0] === 0 ? z : -z;
    const sg = makeLabel(`${Z.icon} ${Z.name}\n${Z.weather}\n🌡️ ${Z.temp}°C`, { size: 30 }); sg.position.set(sx, 4.2, sz); scene.add(sg);
    place('sign', sx, sz, Math.atan2(-sx, -sz), 1.2, .5);
    block(x, z, 4);
  }
}

/* crystal pedestals */
const pedestals = {};
function buildPedestals() {
  for (const zk in PEDESTALS) {
    const [x, z] = PEDESTALS[zk], season = ZONES[zk].season, y = groundY(x, z);
    const g = new THREE.Group(); g.position.set(x, y, z);
    const stone = new THREE.MeshStandardMaterial({ color: 0xb9b2a4, flatShading: true });
    const b1 = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, .8, 6), stone); b1.position.y = .4;
    const b2 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.8, 1.6, 6), stone); b2.position.y = 1.6;
    const cr = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ color: CRYSTAL_COLOR[season], emissive: CRYSTAL_COLOR[season], emissiveIntensity: .7, flatShading: true, roughness: .2 }));
    cr.scale.set(.8, 1.3, .8); cr.position.y = 4;
    const bub = new THREE.Mesh(new THREE.IcosahedronGeometry(2, 1), new THREE.MeshStandardMaterial({ color: 0xaad8ff, transparent: true, opacity: .35, flatShading: true }));
    bub.position.y = 4;
    g.add(b1, b2, cr, bub); scene.add(g);
    const lab = makeLabel(`💎 ${season[0].toUpperCase() + season.slice(1)} Crystal`); lab.position.set(0, 7, 0); g.add(lab);
    colliders.push({ x, z, r: 3.4 }); block(x, z, 10);
    pedestals[zk] = { g, cr, bub, lab, x, z };
    animated.push({ update: (dt, t) => { cr.rotation.y += dt; cr.position.y = 4 + Math.sin(t * 2) * .25; bub.rotation.y -= dt * .3; } });
  }
}

/* windmills, kites in the sky */
function buildWindmill(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, groundY(x, z), z); g.rotation.y = Math.atan2(-x, -z);
  const white = new THREE.MeshStandardMaterial({ color: 0xf3efe6, flatShading: true }), red = new THREE.MeshStandardMaterial({ color: 0xc0453a, flatShading: true });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.7, 9, 6), white); tower.position.y = 4.5;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2, 6), red); roof.position.y = 10;
  const hub = new THREE.Group(); hub.position.set(0, 8.6, 1.3);
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.6, 4.5, .12), white); b.position.y = 2.4; const arm = new THREE.Group(); arm.rotation.z = i * Math.PI / 2; arm.add(b); hub.add(arm); }
  g.add(tower, roof, hub); g.scale.setScalar(s); g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g);
  colliders.push({ x, z, r: 2 * s }); block(x, z, 5);
  animated.push({ update: dt => { hub.rotation.z += dt * 2.2; } });
}
function kiteMesh(color = 0xef5a4c, s = 1) {
  const g = new THREE.Group();
  const shape = new THREE.Shape(); shape.moveTo(0, .9); shape.lineTo(.55, 0); shape.lineTo(0, -1.1); shape.lineTo(-.55, 0); shape.closePath();
  const k = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, flatShading: true }));
  const cross = new THREE.Mesh(new THREE.BoxGeometry(1.1, .05, .05), new THREE.MeshStandardMaterial({ color: 0x5a3b1e }));
  g.add(k, cross);
  for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.18, .12, .02), new THREE.MeshStandardMaterial({ color: [0xffc93c, 0x4aa8ff][i % 2] })); b.position.set(0, -1.3 - i * .3, 0); g.add(b); }
  g.scale.setScalar(s); return g;
}
function buildZones() {
  /* desert */
  scatter('desert', 90, ['cactus_tall', 'cactus_short', 'cactus_short'], { seed: 11, col: .45 });
  scatter('desert', 30, ['rock_largeA', 'rock_largeB', 'rock_tallA', 'rock_tallB'], { seed: 12, col: 1.2, s: [.7, 1.4] });
  scatter('desert', 14, ['tree_palmTall', 'tree_palmBend', 'tree_palmShort'], { seed: 13, col: .5, near: { x: -32, z: -96, r: 16 } });
  place('tent_detailedOpen', 16, -118, -2.2, 1, 2); place('campfire_stones', 11, -121, 0, 1, .5);
  place('statue_obelisk', 30, -160, .4, 1, 1); place('statue_obelisk', -30, -165, .2, .8, 1);
  /* lemonade stand for Sofía */
  const stand = new THREE.Group(); const wood = new THREE.MeshStandardMaterial({ color: 0xc58a4a, flatShading: true });
  const table = new THREE.Mesh(new THREE.BoxGeometry(3, 1.1, 1.2), wood); table.position.y = .55;
  const roof = new THREE.Mesh(new THREE.BoxGeometry(3.4, .15, 1.8), new THREE.MeshStandardMaterial({ color: 0xffc93c })); roof.position.y = 2.5;
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(.12, 2.5, .12), wood); p1.position.set(-1.5, 1.25, 0); const p2 = p1.clone(); p2.position.x = 1.5;
  stand.add(table, roof, p1, p2); stand.position.set(-22, groundY(-22, -138.5), -138.5); stand.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(stand);
  colliders.push({ x: -22, z: -138.5, r: 1.6 }); const sl = makeLabel('🍋 Lemonade'); sl.position.set(-22, groundY(-22, -138.5) + 3.3, -138.5); scene.add(sl);
  /* forest */
  scatter('forest', 150, ['tree_default', 'tree_oak', 'tree_fat', 'tree_detailed', 'tree_pineDefaultA', 'tree_pineRoundA'], { seed: 21, col: .55, s: [.8, 1.35] });
  scatter('forest', 60, ['mushroom_red', 'mushroom_redGroup', 'plant_bush', 'plant_bushLarge', 'flower_redA', 'flower_purpleA', 'flower_yellowA'], { seed: 22, col: 0 });
  scatter('forest', 20, ['log', 'stump_round', 'rock_largeC'], { seed: 23, col: .6 });
  { const r = rng(24), l = []; for (let i = 0; i < 9; i++) { const a = r() * 6.28, d = 2 + r() * 9; l.push({ x: -150 + Math.cos(a) * d, y: -.34, z: -42 + Math.sin(a) * d, s: 1 + r(), ry: r() * 6 }); } instanced('lily_large', l, false); }
  /* snow */
  scatter('snow', 120, ['tree-snow-a', 'tree-snow-b', 'tree-snow-c'], { seed: 31, col: .6 });
  scatter('snow', 30, ['rocks-large', 'snow-pile', 'snow-pile'], { seed: 32, col: .8 });
  [[20, 120], [-20, 128], [8, 158], [-6, 98], [26, 150]].forEach(([x, z], i) => place(i % 2 ? 'snowman-hat' : 'snowman', x, z, Math.atan2(-x, -z), 1, .7));
  place('sled', -10, 116, 1, 1, .6); place('sled', 18, 140, -.5, 1, .6); place('lantern', -5, 108, 0, 1, .3); place('bench', -12, 110, 1.4, 1, .8);
  /* hills */
  scatter('hills', 150, ['tree_default_fall', 'tree_oak_fall', 'tree_fat_fall', 'tree_cone_fall'], { seed: 41, col: .55 });
  scatter('hills', 140, ['grass_large', 'grass', 'plant_bush'], { seed: 42, col: 0 });
  scatter('hills', 14, ['fence_simple'], { seed: 43, col: .4, near: { x: 140, z: 30, r: 14 } });
  buildWindmill(128, -42); buildWindmill(152, 48, 1.1); buildWindmill(96, 64, .9);
  [[0xef5a4c, 108, -14, 16], [0x4aa8ff, 118, 4, 19], [0xffc93c, 104, 8, 14]].forEach(([c, x, z, h], i) => {
    const k = kiteMesh(c, 1.6); scene.add(k); const gy = groundY(x, z);
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), new THREE.LineBasicMaterial({ color: 0xffffff }));
    scene.add(line);
    animated.push({ update: (dt, t) => { k.position.set(x + Math.sin(t * .7 + i) * 3, gy + h + Math.sin(t * 1.3 + i) * 1.5, z + Math.cos(t * .5 + i) * 2); k.rotation.z = Math.sin(t * 1.7 + i) * .3; line.geometry.setFromPoints([new THREE.Vector3(x - 4, gy + 1, z - 2), k.position.clone().add(new THREE.Vector3(0, -1, 0))]); } });
  });
  /* edge of the world: big mountains and rocks */
  const edge = [], edgeS = [];
  const er = rng(99);
  for (let i = 0; i < 70; i++) { const a = i / 70 * Math.PI * 2 + er() * .05, d = 192 + er() * 10, x = Math.cos(a) * d, z = Math.sin(a) * d; (zoneAt(x, z) === 'snow' ? edgeS : edge).push({ x, y: groundY(x, z) - 1, z, s: 2 + er() * 2, ry: er() * 6 }); }
  instanced('rock_tallA', edge); instanced('tree-snow-c', edgeS);
}

/* blocky clouds */
const clouds = [];
function buildClouds() {
  const r = rng(5), white = new THREE.MeshStandardMaterial({ color: 0xffffff, flatShading: true, transparent: true, opacity: .95 }), dark = new THREE.MeshStandardMaterial({ color: 0x6e7787, flatShading: true });
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2, d = r() * 200, x = Math.cos(a) * d, z = Math.sin(a) * d, zk = zoneAt(x, z);
    if (zk === 'desert' && r() < .8) continue;
    const g = new THREE.Group(), mat = zk === 'forest' ? dark : white, n = 3 + Math.floor(r() * 4);
    for (let j = 0; j < n; j++) { const b = new THREE.Mesh(new THREE.BoxGeometry(6 + r() * 8, 3 + r() * 3, 5 + r() * 6), mat); b.position.set((j - n / 2) * 5 + r() * 2, r() * 2, r() * 4 - 2); g.add(b); }
    g.position.set(x, 42 + r() * 18 + (zk === 'forest' ? -8 : 0), z); scene.add(g); clouds.push(g);
  }
}

/* ================= characters ================= */
let CHAR_SCALE = 1;
function charBox(k) { const m = MODELS[k]; const b = new THREE.Box3().setFromObject(m.scene); return b; }
function makeChar(skin) {
  const k = 'char_' + skin, m = MODELS[k];
  const root = new THREE.Group(), model = m.scene.clone(true);
  model.scale.setScalar(CHAR_SCALE); model.position.y = -m.minY * CHAR_SCALE; root.add(model);
  model.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  const mixer = new THREE.AnimationMixer(model), actions = {};
  for (const clip of m.anims) actions[clip.name] = mixer.clipAction(clip);
  const parts = {}; ['torso', 'head', 'arm-left', 'arm-right', 'leg-left', 'leg-right'].forEach(n => { parts[n] = model.getObjectByName(n); });
  const ch = { root, model, mixer, actions, parts, cur: null, cloth: [], skin };
  playAnim(ch, 'idle');
  return ch;
}
function playAnim(ch, name, fade = .2, once = false) {
  if (ch.cur === name || !ch.actions[name]) return;
  const next = ch.actions[name], prev = ch.cur && ch.actions[ch.cur];
  next.reset(); next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); next.clampWhenFinished = once; next.fadeIn(fade).play();
  if (prev) prev.fadeOut(fade);
  ch.cur = name;
}
function localBox(part) {
  const box = new THREE.Box3();
  if (part.isMesh) { part.geometry.computeBoundingBox(); box.copy(part.geometry.boundingBox); }
  else part.children.forEach(c => { if (c.isMesh && !/^(torso|head|arm|leg)/.test(c.name)) { c.geometry.computeBoundingBox(); box.union(c.geometry.boundingBox.clone().applyMatrix4(c.matrix)); } });
  return box;
}
const clothMat = {}; const cmat = c => clothMat[c] || (clothMat[c] = new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .8 }));
function boxOn(ch, partName, color, y0, y1, ex = 1.1, ez = 1.1, off = {}) {
  const part = ch.parts[partName]; if (!part) return null;
  const b = localBox(part), sz = b.getSize(new THREE.Vector3());
  const m = new THREE.Mesh(new THREE.BoxGeometry(sz.x * ex, sz.y * (y1 - y0), sz.z * ez), cmat(color));
  m.position.set((b.min.x + b.max.x) / 2 + (off.x || 0) * sz.x, b.min.y + sz.y * (y0 + y1) / 2, (b.min.z + b.max.z) / 2 + (off.z || 0) * sz.z);
  m.castShadow = true; part.add(m); ch.cloth.push(m); return m;
}
function dressChar(ch, outfit) {
  ch.cloth.forEach(m => m.parent && m.parent.remove(m)); ch.cloth = [];
  const has = id => Object.values(outfit).includes(id);
  const body = outfit.body;
  if (body) {
    const c = body === 'tshirt' ? 0xff8a3d : CLOTHES[body].color;
    boxOn(ch, 'torso', c, 0, body === 'tshirt' ? 1 : 1.02, 1.1, 1.14);
    const sleeve = body === 'tshirt' ? .32 : .9;
    for (const a of ['arm-left', 'arm-right']) { const p = ch.parts[a]; if (!p) continue; const b = localBox(p), h = b.max.y - b.min.y; boxOn(ch, a, c, 1 - sleeve - (b.max.y > 0 ? 0 : 0), 1.02, 1.16, 1.16); }
    if (body === 'coat') { boxOn(ch, 'leg-left', c, .55, 1, 1.2, 1.18); boxOn(ch, 'leg-right', c, .55, 1, 1.2, 1.18); }
    if (body === 'raincoat' && !outfit.head) boxOn(ch, 'head', 0xf5c518, .55, 1.08, 1.12, 1.12, { z: -.04 });
  }
  if (has('scarf')) { boxOn(ch, 'torso', 0xd23b3b, .84, 1.04, 1.2, 1.26); boxOn(ch, 'torso', 0xd23b3b, .45, .86, .22, 1.3, { x: .2, z: .06 }); }
  if (has('cap')) { boxOn(ch, 'head', 0x2f6fe0, .74, 1.04, 1.06, 1.06); boxOn(ch, 'head', 0x2f6fe0, .72, .8, .9, .45, { z: .7 }); }
  if (has('beanie')) { boxOn(ch, 'head', 0x8a4fd1, .66, 1.1, 1.1, 1.1); boxOn(ch, 'head', 0xffffff, 1.1, 1.26, .22, .22); }
  if (has('sunglasses')) boxOn(ch, 'head', 0x111111, .48, .62, .9, .08, { z: .52 });
  if (has('gloves')) for (const a of ['arm-left', 'arm-right']) boxOn(ch, a, 0x6b3e1f, 0, .2, 1.24, 1.24);
  if (has('boots')) for (const l of ['leg-left', 'leg-right']) boxOn(ch, l, 0x4a2e1a, 0, .32, 1.18, 1.25, { z: .04 });
  if (has('sandals')) for (const l of ['leg-left', 'leg-right']) boxOn(ch, l, 0xc9a06a, 0, .07, 1.25, 1.3, { z: .04 });
  if (has('umbrella')) {
    const g = new THREE.Group();
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.5, 5), cmat(0x333333)); stick.position.set(.42, 1.55, .15);
    const top = new THREE.Mesh(new THREE.ConeGeometry(1, .5, 8), cmat(0xe23b55)); top.position.set(.42, 2.4, .15);
    g.add(stick, top); ch.root.add(g); ch.cloth.push(g);
  }
}

/* ================= player & camera ================= */
const player = { ch: null, pos: new THREE.Vector3(0, 0, 10), vel: new THREE.Vector3(), yaw: 0, onGround: true, comfort: 100, zone: 'town' };
const cam = { yaw: Math.PI, pitch: .38, dist: 8.5 };
const keys = {};
const joy = { x: 0, y: 0, active: false };
let runToggle = false;
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if (e.code === 'KeyE' || e.code === 'Enter') { if (!UI.busy()) interact(); else if (e.code === 'Enter' && !$('dialog').classList.contains('hidden')) { const b = $('dActs').querySelector('button'); b && b.click(); } }
  if (e.code === 'Space' && !UI.busy()) e.preventDefault();
  if (e.code === 'Escape') { if (!$('modal').classList.contains('hidden') && UI.closable) UI.closeModal(); else if (!UI.busy()) openMenu(); }
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
let drag = null;
canvas.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') return; drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => { if (!drag) return; cam.yaw -= (e.clientX - drag.x) * .006; cam.pitch = clamp(cam.pitch + (e.clientY - drag.y) * .004, .05, 1.25); drag = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointerup', () => { drag = null; });
canvas.addEventListener('wheel', e => { cam.dist = clamp(cam.dist + Math.sign(e.deltaY) * .8, 4, 16); }, { passive: true });
canvas.addEventListener('contextmenu', e => e.preventDefault());
/* touch: joystick + camera drag */
const touchCam = new Map();
let touchReady = false;
function setupTouch() {
  if (touchReady) return; touchReady = true;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0; if (!isTouch) return;
  show('touch', true);
  const J = $('joy'), K = J.querySelector('.k'); let jid = null;
  const jm = t => { const r = J.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = t.clientX - cx, dy = t.clientY - cy; const l = Math.hypot(dx, dy), mx = r.width / 2; if (l > mx) { dx *= mx / l; dy *= mx / l; } joy.x = dx / mx; joy.y = dy / mx; K.style.transform = `translate(${dx}px,${dy}px)`; };
  J.addEventListener('touchstart', e => { e.preventDefault(); const t = e.changedTouches[0]; jid = t.identifier; joy.active = true; jm(t); }, { passive: false });
  J.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === jid) jm(t); }, { passive: false });
  const end = e => { for (const t of e.changedTouches) if (t.identifier === jid) { jid = null; joy.active = false; joy.x = joy.y = 0; K.style.transform = ''; } };
  J.addEventListener('touchend', end); J.addEventListener('touchcancel', end);
  canvas.addEventListener('touchstart', e => { for (const t of e.changedTouches) touchCam.set(t.identifier, { x: t.clientX, y: t.clientY }); }, { passive: true });
  let pinch = 0;
  canvas.addEventListener('touchmove', e => {
    if (e.targetTouches.length === 2) { /* two fingers: zoom */
      const [a, b] = e.targetTouches, d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (pinch) cam.dist = clamp(cam.dist - (d - pinch) * .03, 4, 16);
      pinch = d; for (const t of e.targetTouches) touchCam.set(t.identifier, { x: t.clientX, y: t.clientY }); return;
    }
    pinch = 0;
    for (const t of e.changedTouches) { const p = touchCam.get(t.identifier); if (!p) continue; cam.yaw -= (t.clientX - p.x) * .008; cam.pitch = clamp(cam.pitch + (t.clientY - p.y) * .005, .05, 1.25); touchCam.set(t.identifier, { x: t.clientX, y: t.clientY }); } }, { passive: true });
  const ce = e => { pinch = 0; for (const t of e.changedTouches) touchCam.delete(t.identifier); };
  canvas.addEventListener('touchend', ce); canvas.addEventListener('touchcancel', ce);
  $('tJump').addEventListener('touchstart', e => { e.preventDefault(); keys.Space = true; setTimeout(() => keys.Space = false, 120); }, { passive: false });
  $('tRun').addEventListener('touchstart', e => { e.preventDefault(); runToggle = !runToggle; $('tRun').style.background = runToggle ? '#ffc93c' : ''; }, { passive: false });
  $('tAct').addEventListener('touchstart', e => { e.preventDefault(); if (!UI.busy()) interact(); }, { passive: false });
}

function updatePlayer(dt) {
  const ch = player.ch; if (!ch) return;
  let ix = 0, iz = 0;
  if (!UI.busy()) {
    if (keys.KeyW || keys.ArrowUp) iz += 1; if (keys.KeyS || keys.ArrowDown) iz -= 1;
    if (keys.KeyA || keys.ArrowLeft) ix -= 1; if (keys.KeyD || keys.ArrowRight) ix += 1;
    if (joy.active) { ix += joy.x; iz -= joy.y; }
  }
  const len = Math.hypot(ix, iz); if (len > 1) { ix /= len; iz /= len; }
  const run = keys.ShiftLeft || keys.ShiftRight || runToggle;
  const speed = run ? 11 : 6.2;
  const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
  const mx = (fx * iz + rx * ix) * speed, mz = (fz * iz + rz * ix) * speed;
  player.pos.x += mx * dt; player.pos.z += mz * dt;
  /* collisions */
  for (const c of colliders) { const dx = player.pos.x - c.x, dz = player.pos.z - c.z, d = Math.hypot(dx, dz), m = c.r + .45; if (d < m && d > 1e-4) { player.pos.x = c.x + dx / d * m; player.pos.z = c.z + dz / d * m; } }
  for (const n of npcList) { const dx = player.pos.x - n.x, dz = player.pos.z - n.z, d = Math.hypot(dx, dz); if (d < .9 && d > 1e-4) { player.pos.x = n.x + dx / d * .9; player.pos.z = n.z + dz / d * .9; } }
  const r = Math.hypot(player.pos.x, player.pos.z); if (r > MAXR) { player.pos.x *= MAXR / r; player.pos.z *= MAXR / r; }
  /* gravity / jump */
  const gy = groundY(player.pos.x, player.pos.z);
  if (player.onGround && keys.Space && !UI.busy()) { player.vel.y = 9; player.onGround = false; }
  player.vel.y -= 26 * dt; player.pos.y += player.vel.y * dt;
  if (player.pos.y <= gy) { player.pos.y = gy; player.vel.y = 0; player.onGround = true; }
  else if (player.pos.y - gy > .25) player.onGround = false;
  /* facing + animation */
  if (len > .05) { const target = Math.atan2(mx, mz); let d = target - player.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); player.yaw += d * Math.min(1, dt * 12); }
  ch.root.position.copy(player.pos); ch.root.rotation.y = player.yaw;
  if (player.emote > 0) player.emote -= dt;
  else playAnim(ch, !player.onGround ? 'walk' : len > .05 ? (run ? 'sprint' : 'walk') : 'idle');
  player.moving = len > .05;
  ch.mixer.update(dt * (player.onGround ? 1 : .5));
}
function updateCamera(dt) {
  const t = player.pos.clone().add(new THREE.Vector3(0, 1.7, 0));
  const off = new THREE.Vector3(Math.sin(cam.yaw) * Math.cos(cam.pitch), Math.sin(cam.pitch), Math.cos(cam.yaw) * Math.cos(cam.pitch)).multiplyScalar(cam.dist * camFar);
  const want = t.clone().add(off);
  const gy = groundY(want.x, want.z) + .8; if (want.y < gy) want.y = gy;
  camera.position.lerp(want, 1 - Math.exp(-dt * 10));
  camera.lookAt(t);
  sun.position.set(player.pos.x + 30, player.pos.y + 60, player.pos.z + 20); sun.target.position.copy(player.pos);
}

/* ================= NPCs ================= */
const npcList = [];
function buildNPCs() {
  for (const id in NPCS) {
    const d = NPCS[id], ch = makeChar(d.skin), [x, z] = d.pos;
    ch.root.position.set(x, groundY(x, z), z); ch.root.rotation.y = Math.atan2(-x, -z); scene.add(ch.root);
    if (id === 'sky') dressChar(ch, { head: 'cap', body: 'jacket' });
    else if (ZONES[d.zone].need.length) { const o = {}; ZONES[d.zone].need.forEach(c => o[CLOTHES[c].slot] = c); dressChar(ch, o); }
    const name = makeLabel(d.name, { size: 30, scale: .017 }); name.position.y = 2.45; ch.root.add(name);
    const mark = emojiSprite('❗', 1.2); mark.position.y = 3.3; ch.root.add(mark);
    const n = { id, ...d, x, z, ch, mark, markTxt: '❗', face: ch.root.rotation.y };
    npcList.push(n); block(x, z, 7);
  }
}
function setMark(n, txt) {
  if (n.markTxt === txt) return; n.markTxt = txt;
  n.ch.root.remove(n.mark); n.mark = null;
  if (txt) { n.mark = emojiSprite(txt, 1.2); n.mark.position.y = 3.3; n.ch.root.add(n.mark); }
}
function updateNPCs(dt, t) {
  for (const n of npcList) {
    const d = Math.hypot(player.pos.x - n.x, player.pos.z - n.z);
    if (d < 40) {
      n.ch.mixer.update(dt);
      if (d < 7) { const target = Math.atan2(player.pos.x - n.x, player.pos.z - n.z); let df = target - n.ch.root.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); n.ch.root.rotation.y += df * Math.min(1, dt * 5); }
    }
    if (n.mark) n.mark.position.y = 3.3 + Math.sin(t * 3 + n.x) * .12;
    setMark(n, npcMark(n));
  }
}
/* pets that wander */
const pets = [];
function addPets(kind, n, cx, cz, rad, seed) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const a = r() * 6.28, d = r() * rad, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    const o = cloneModel('pet_' + kind); o.position.set(x, groundY(x, z), z); scene.add(o);
    const m = MODELS['pet_' + kind]; let mixer = null;
    if (m && m.anims.length) { mixer = new THREE.AnimationMixer(o.userData.inner); const clip = m.anims.find(c => /walk|idle/i.test(c.name)) || m.anims[0]; mixer.clipAction(clip).play(); }
    pets.push({ o, mixer, home: { x: cx, z: cz }, rad, tx: x, tz: z, wait: r() * 3, sp: .9 + r() * .8, r });
  }
}
function updatePets(dt) {
  for (const p of pets) {
    const dPl = Math.hypot(player.pos.x - p.o.position.x, player.pos.z - p.o.position.z); if (dPl > 60) continue;
    if (p.mixer) p.mixer.update(dt);
    if (p.wait > 0) { p.wait -= dt; continue; }
    const dx = p.tx - p.o.position.x, dz = p.tz - p.o.position.z, d = Math.hypot(dx, dz);
    if (d < .3) { p.wait = 1 + p.r() * 4; const a = p.r() * 6.28, rr = p.r() * p.rad; p.tx = p.home.x + Math.cos(a) * rr; p.tz = p.home.z + Math.sin(a) * rr; continue; }
    p.o.position.x += dx / d * p.sp * dt; p.o.position.z += dz / d * p.sp * dt;
    p.o.position.y = groundY(p.o.position.x, p.o.position.z) + Math.abs(Math.sin(performance.now() / 120)) * .08;
    p.o.rotation.y = Math.atan2(dx, dz);
  }
}

/* ================= collectibles (vocabulary words) & online orbs ================= */
const items = [];   // {lesson, idx, obj, x,z, word}
function spawnCollect(lessonId) {
  const L = LESSONS[lessonId], zone = L.zone, words = L.collect.words, got = P.collected[lessonId] || [];
  const r = rng(lessonId.length * 131 + 7);
  words.forEach((w, i) => {
    if (got.includes(i) || items.some(it => it.lesson === lessonId && it.idx === i)) return;
    let x, z, tries = 0;
    do { const d = ZDIR[zone], ang = Math.atan2(d[1], d[0]) + (r() - .5) * 1.4, rad = lerp(72, 172, r()); x = Math.cos(ang) * rad; z = Math.sin(ang) * rad; tries++; }
    while (tries < 200 && (zoneAt(x, z) !== zone || heightAt(x, z) > 7 || heightAt(x, z) < .2 || !free(x, z, 1.5)));
    let obj;
    if (L.collect.model === 'kite') obj = kiteMesh([0xef5a4c, 0x4aa8ff, 0xffc93c, 0x66e08a][i % 4], .9);
    else if (L.collect.model === 'snowflake') obj = cloneModel('snowflake-a');
    else if (L.collect.model === 'jewel') { obj = cloneModel('item_jewel'); obj.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.color.set(0x4aa8ff); o.material.emissive = new THREE.Color(0x1d5fb0); } }); }
    else obj = cloneModel('item_star');
    const g = new THREE.Group(); g.add(obj); const y = groundY(x, z) + 1; g.position.set(x, y, z);
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, .05, 16), new THREE.MeshBasicMaterial({ color: 0xfff3a0, transparent: true, opacity: .5 })); glow.position.y = -.95; g.add(glow);
    scene.add(g); items.push({ lesson: lessonId, idx: i, obj: g, x, z, y, word: w });
  });
}
function updateItems(dt, t) {
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i]; it.obj.rotation.y += dt * 1.6; it.obj.children[0].position.y = Math.sin(t * 2.5 + it.x) * .2;
    if (Math.hypot(player.pos.x - it.x, player.pos.z - it.z) < 1.8 && Math.abs(player.pos.y + 1 - it.y) < 2.5) {
      scene.remove(it.obj); items.splice(i, 1);
      (P.collected[it.lesson] = P.collected[it.lesson] || []).push(it.idx); saveGame();
      sfx('pickup'); wordCard(it.word, it.lesson);
    }
  }
}
function wordCard([word, icon, sentence], lessonId) {
  const total = LESSONS[lessonId].collect.words.length, n = (P.collected[lessonId] || []).length;
  toast(`${icon} <b>${esc(word)}</b> — ${esc(sentence)}<br><small>${n}/${total} found ${n === total ? '· Go back to ' + esc(NPCS[LESSONS[lessonId].npc].name) + '! ✅' : ''}</small>`, 5000);
  speak(`${word}. ${sentence}`);
}
const orbs = [];
function buildOrbs() {
  const r = rng(2024), geo = new THREE.IcosahedronGeometry(.7, 0);
  for (let i = 0; i < 28; i++) {
    let x, z, t = 0;
    do { const a = r() * 6.28, d = 25 + r() * 155; x = Math.cos(a) * d; z = Math.sin(a) * d; t++; } while (t < 100 && (heightAt(x, z) > 7 || heightAt(x, z) < .2 || !free(x, z, 1.5)));
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xffd23c, emissive: 0xff9a00, emissiveIntensity: .6, flatShading: true }));
    const g = new THREE.Group(); g.add(m); const q = emojiSprite('❓', .7); q.position.y = 1.2; g.add(q);
    const y = groundY(x, z) + 1.2; g.position.set(x, y, z); g.visible = false; scene.add(g);
    orbs.push({ g, x, z, y, cd: 0 });
  }
}
function updateOrbs(dt, t) {
  if (MODE !== 'online') return;
  for (const o of orbs) {
    if (o.cd > 0) { o.cd -= dt; o.g.visible = o.cd <= 0; continue; }
    o.g.visible = true; o.g.rotation.y += dt * 2; o.g.position.y = o.y + Math.sin(t * 3 + o.x) * .2;
    if (!UI.busy() && Math.hypot(player.pos.x - o.x, player.pos.z - o.z) < 1.7) { o.cd = 45; o.g.visible = false; sfx('open'); quickQuestion(); }
  }
}

/* ================= weather effects ================= */
const FX = {};
function buildFX() {
  const N = 1800, rp = new Float32Array(N * 6);
  for (let i = 0; i < N; i++) { const x = (Math.random() - .5) * 60, y = Math.random() * 28, z = (Math.random() - .5) * 60; rp.set([x, y, z, x + .05, y - .7, z], i * 6); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  FX.rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: 0xaecbe6, transparent: true, opacity: .55 })); FX.rain.frustumCulled = false; scene.add(FX.rain);
  const S = 1600, sp = new Float32Array(S * 3); for (let i = 0; i < S; i++) sp.set([(Math.random() - .5) * 60, Math.random() * 28, (Math.random() - .5) * 60], i * 3);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  FX.snow = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: .28, transparent: true, opacity: .9 })); FX.snow.frustumCulled = false; scene.add(FX.snow);
  const L = 260, lp = new Float32Array(L * 3), lc = new Float32Array(L * 3), pal = [0xd9772b, 0xffc93c, 0xa0522d, 0xc0453a].map(c => new THREE.Color(c));
  for (let i = 0; i < L; i++) { lp.set([(Math.random() - .5) * 60, Math.random() * 10, (Math.random() - .5) * 60], i * 3); const c = pal[i % 4]; lc.set([c.r, c.g, c.b], i * 3); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3)); lg.setAttribute('color', new THREE.BufferAttribute(lc, 3));
  FX.leaves = new THREE.Points(lg, new THREE.PointsMaterial({ size: .38, vertexColors: true, transparent: true, opacity: 1 })); FX.leaves.frustumCulled = false; scene.add(FX.leaves);
  const W = 90, wp = new Float32Array(W * 6); for (let i = 0; i < W; i++) { const x = (Math.random() - .5) * 60, y = .5 + Math.random() * 8, z = (Math.random() - .5) * 60; wp.set([x, y, z, x + 3, y, z], i * 6); }
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.BufferAttribute(wp, 3));
  FX.wind = new THREE.LineSegments(wg, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 })); FX.wind.frustumCulled = false; scene.add(FX.wind);
  FX.flash = 0; FX.nextFlash = 5;
  FX.sky = { town: [0x87c8ff, 60, 320, 2.6, 1.4], desert: [0x63b8ff, 90, 380, 3.4, 1.5], forest: [0x7d8a99, 28, 160, 1.4, 1.35], snow: [0xc8d6e6, 20, 130, 1.4, 1.3], hills: [0xa9c3d8, 50, 260, 1.9, 1.2] };
}
const tmpC = new THREE.Color(), tmpC2 = new THREE.Color();
function updateWeather(dt, t) {
  const w = zoneW(player.pos.x, player.pos.z);
  const wr = clamp(w.forest * 1.6 - .3, 0, 1), ws = clamp(w.snow * 1.6 - .3, 0, 1), ww = clamp(w.hills * 1.6 - .3, 0, 1);
  const c = new THREE.Vector3(player.pos.x, player.pos.y, player.pos.z);
  /* rain */
  FX.rain.visible = wr > .02; FX.rain.material.opacity = .55 * wr; FX.rain.position.copy(c);
  if (FX.rain.visible) { const a = FX.rain.geometry.attributes.position, arr = a.array; for (let i = 0; i < arr.length; i += 6) { arr[i + 1] -= 30 * dt; arr[i + 4] -= 30 * dt; if (arr[i + 4] < -2) { arr[i + 1] += 30; arr[i + 4] += 30; } } a.needsUpdate = true; }
  FX.snow.visible = ws > .02; FX.snow.material.opacity = .9 * ws; FX.snow.position.copy(c);
  if (FX.snow.visible) { const a = FX.snow.geometry.attributes.position, arr = a.array; for (let i = 0; i < arr.length; i += 3) { arr[i + 1] -= 2.6 * dt; arr[i] += Math.sin(t + i) * dt * .6 + dt * 1.2; if (arr[i + 1] < -2) arr[i + 1] += 30; if (arr[i] > 30) arr[i] -= 60; } a.needsUpdate = true; }
  FX.leaves.visible = ww > .02; FX.leaves.material.opacity = ww; FX.leaves.position.copy(c);
  FX.wind.visible = ww > .02; FX.wind.material.opacity = .45 * ww; FX.wind.position.copy(c);
  if (FX.leaves.visible) {
    const a = FX.leaves.geometry.attributes.position, arr = a.array; for (let i = 0; i < arr.length; i += 3) { arr[i] += 11 * dt; arr[i + 1] += Math.sin(t * 3 + i) * dt * 2; if (arr[i] > 30) { arr[i] -= 60; arr[i + 1] = Math.random() * 10; } } a.needsUpdate = true;
    const b = FX.wind.geometry.attributes.position, br = b.array; for (let i = 0; i < br.length; i += 6) { br[i] += 26 * dt; br[i + 3] += 26 * dt; if (br[i] > 30) { br[i] -= 60; br[i + 3] -= 60; } } b.needsUpdate = true;
  }
  /* sky, fog, light */
  let fogN = 0, fogF = 0, sunI = 0, hemiI = 0; tmpC.setRGB(0, 0, 0);
  for (const k in w) { const s = FX.sky[k]; tmpC2.set(s[0]); tmpC.r += tmpC2.r * w[k]; tmpC.g += tmpC2.g * w[k]; tmpC.b += tmpC2.b * w[k]; fogN += s[1] * w[k]; fogF += s[2] * w[k]; sunI += s[3] * w[k]; hemiI += s[4] * w[k]; }
  if (GAME.rainbow) { tmpC.set(0x7cc8ff); sunI = 3; }
  /* lightning (stormy forest) */
  if (wr > .6) { FX.nextFlash -= dt; if (FX.nextFlash <= 0) { FX.flash = .35; FX.nextFlash = 6 + Math.random() * 9; setTimeout(thunder, 500 + Math.random() * 900); } }
  if (FX.flash > 0) { FX.flash -= dt; const f = (FX.flash > .22 || (FX.flash < .15 && FX.flash > .08)) ? 1 : 0; hemiI += f * 3; tmpC.lerp(tmpC2.set(0xeef3ff), f * .6); }
  scene.background.copy(tmpC); scene.fog.color.copy(tmpC); scene.fog.near = fogN; scene.fog.far = fogF;
  sun.intensity = sunI; hemi.intensity = hemiI;
  sun.color.setHSL(.1, w.desert > .5 ? .9 : .4, .85);
  for (const cl of clouds) { cl.position.x += dt * (1.5 + 6 * zoneW(cl.position.x, cl.position.z).hills); if (cl.position.x > 210) cl.position.x = -210; }
  if (rainGain && AC) { rainGain.gain.value = lerp(rainGain.gain.value, wr * .25, dt * 2); windGain.gain.value = lerp(windGain.gain.value, (ww * .3 + ws * .12), dt * 2); windGain.f.frequency.value = 350 + Math.sin(t * .7) * 150; }
  return w;
}

/* ================= comfort (wear the right clothes!) ================= */
function outfitIds() { return Object.values(P.outfit).filter(Boolean); }
function clothesCheck(zk) {
  const Z = ZONES[zk], on = outfitIds();
  return { missing: Z.need.filter(c => !on.includes(c)), bad: Z.forbid.filter(c => on.includes(c)) };
}
let comfortMsgT = 0;
function updateComfort(dt) {
  const zk = player.zone;
  let ok = true;
  if (zk !== 'town') { const c = clothesCheck(zk); ok = !c.missing.length && !c.bad.length; }
  if (zk === 'hills' && P.outfit.hands === 'umbrella') { P.outfit.hands = null; dressChar(player.ch, P.outfit); saveGame(); toast("💨☂️ Oh no! It's very windy! The wind took your umbrella!", 4000); speak("Oh no! It's very windy! The wind took your umbrella!"); }
  player.comfort = clamp(player.comfort + (ok ? 18 : -6.5) * dt, 0, 100);
  $('comfort').style.width = player.comfort + '%';
  $('comfort').style.background = player.comfort > 60 ? '#38b26a' : player.comfort > 30 ? '#ffc93c' : '#ef5a4c';
  const feel = $('feel');
  if (!ok) {
    feel.textContent = ZONES[zk].feel; show(feel, true);
    feel.style.transform = `translateX(calc(-50% + ${Math.sin(performance.now() / 40) * 3}px))`;
    comfortMsgT -= dt;
    if (comfortMsgT <= 0 && !UI.busy()) { comfortMsgT = 9; toast(`${ZONES[zk].tooBad}<br>Wear the right clothes! Find a 🎁 Clothes chest.`, 4500); }
    if (player.comfort <= 0 && !UI.busy()) {
      const [gx, gz] = GATES[zk]; player.pos.set(gx + (gx ? -Math.sign(gx) * 3 : 0), 0, gz + (gz ? -Math.sign(gz) * 3 : 0)); player.pos.y = groundY(player.pos.x, player.pos.z);
      player.comfort = 40; sfx('bad');
      openWardrobe(zk, `Oh no! ${ZONES[zk].tooBad.replace(/ [^ ]+$/, '')} Let's choose better clothes.`);
    }
  } else show(feel, false);
}

/* ================= UI: toast, prompt, dialog, modal ================= */
let toastT = null;
function toast(html, ms = 3000) { const t = $('toast'); t.innerHTML = html; show(t, true); t.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(() => { t.style.opacity = 0; setTimeout(() => show(t, false), 300); }, ms); }
const UI = {
  closable: true,
  busy() { return !$('modal').classList.contains('hidden') || !$('dialog').classList.contains('hidden') || !GAME.running; },
  openModal(html, closable = true) { $('mBox').innerHTML = html; show('modal', true); this.closable = closable; },
  closeModal() { show('modal', false); $('mBox').innerHTML = ''; },
};
function dialog(who, lines, { es = '', end = null, buttons = null } = {}) {
  let i = 0;
  const step = () => {
    $('dWho').textContent = who; $('dTxt').textContent = lines[i];
    $('dEs').textContent = es; show('dEs', false);
    const acts = $('dActs'); acts.innerHTML = '';
    const add = (label, cls, fn) => { const b = document.createElement('button'); b.className = 'btn small ' + cls; b.innerHTML = label; b.onclick = () => { sfx('click', .4); fn(); }; acts.appendChild(b); return b; };
    const last = i === lines.length - 1;
    if (last && buttons) buttons.forEach(([l, c, fn]) => add(l, c, () => { show('dialog', false); fn && fn(); }));
    else add(last ? 'OK ✔' : 'Next ▶', 'primary', () => { if (last) { show('dialog', false); end && end(); } else { i++; step(); } });
    add('🔊', '', () => speak(lines[i], true));
    if (es) add('Español', '', () => show('dEs', $('dEs').classList.contains('hidden')));
    // keep primary first in DOM order for Enter key
    speak(lines[i]);
  };
  show('dialog', true); step();
}

/* ================= lesson engine ================= */
function runLesson(id, onDone) {
  const L = LESSONS[id];
  const steps = [];
  L.ex.forEach(e => { if (e.t === 'read') e.qs.forEach((q, qi) => steps.push({ t: 'mcq', q: q.q, o: q.o, why: q.why, read: e, first: qi === 0 })); else steps.push(e); });
  let si = 0, mistakes = 0;
  const head = () => `<div class="mhead"><span class="kind">${esc(L.kind)}</span><h2>${esc(L.title)}</h2><button class="btn small" id="xClose" title="Close">✖</button></div>
    <div class="progress">${steps.map((_, i) => `<span class="${i < si ? 'on' : ''}"></span>`).join('')}</div>`;
  const finish = () => {
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1, prev = P.lessons[id] || 0;
    P.lessons[id] = Math.max(prev, stars);
    let pts = 0; if (MODE === 'online' && !prev) { pts = stars * 10; addScore(pts); }
    saveGame(); sfx(L.crystal ? 'crystal' : 'win', .5);
    UI.openModal(`${head()}<div style="text-align:center"><div class="q">${stars === 3 ? 'Excellent! 🎉' : stars === 2 ? 'Great job! 👏' : 'Good work! 💪'}</div>
      <div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
      <div>${mistakes === 0 ? 'No mistakes!' : `Mistakes: ${mistakes}`}${pts ? ` · +${pts} points 🏆` : ''}</div>
      <div style="margin-top:16px"><button class="btn primary" id="xDone">Continue ▶</button></div></div>`, false);
    $('xClose').onclick = $('xDone').onclick = () => { UI.closeModal(); updateHUD(); onDone && onDone(stars); };
  };
  const next = () => { si++; if (si >= steps.length) finish(); else render(); };
  const render = () => {
    const s = steps[si], t0 = performance.now();
    let body = '';
    if (s.read) body += `<div class="reading"><div style="display:flex;justify-content:space-between;align-items:center"><b>${esc(s.read.title)}</b><button class="btn small" id="xRead">🔊 Listen</button></div>${s.read.text.map(p => `<p>${esc(p)}</p>`).join('')}</div>`;
    if (s.t === 'mcq' || s.t === 'listen') {
      const opts = shuffle(s.o.map((o, i) => ({ o, ok: i === 0 })));
      body += (s.pic ? `<div class="pic">${esc(s.pic)}</div>` : '') + (s.t === 'listen' ? `<div style="text-align:center"><button class="btn blue" id="xSay" style="font-size:26px">🔊 Listen</button></div>` : '') +
        `<div class="q">${esc(s.q)} <button class="btn small" id="xQ" title="Read aloud">🔊</button></div><div class="opts">${opts.map((o, i) => `<button class="btn" data-i="${i}">${esc(o.o)}</button>`).join('')}</div><div class="feedback" id="xFb"></div>
        <div class="mfoot"><span class="hint">${s.t === 'listen' ? 'Listen and choose.' : 'Choose the correct answer.'}</span><button class="btn primary hidden" id="xNext">Next ▶</button></div>`;
      UI.openModal(head() + body);
      let tries = 0;
      $('mBox').querySelectorAll('.opts .btn').forEach(b => b.onclick = () => {
        const o = opts[+b.dataset.i]; if (b.classList.contains('no') || $('xNext').classList.contains('hidden') === false) return;
        track(L.title, s, L, qText(s), o.o, s.o[0], o.ok, t0);
        if (o.ok) { b.classList.add('ok'); sfx('ok'); $('xFb').className = 'feedback good'; $('xFb').textContent = '✅ Correct! ' + (s.why || ''); show('xNext', true); $('xNext').focus(); }
        else { tries++; mistakes++; b.classList.add('no'); sfx('bad', .4); $('xFb').className = 'feedback bad'; $('xFb').textContent = '❌ Try again!' + (tries >= 1 && s.why ? ' Tip: ' + s.why : ''); }
      });
      $('xQ').onclick = () => speak(s.q.replace('___', 'blank'), true);
      if (s.t === 'listen') { $('xSay').onclick = () => speak(s.say, true); setTimeout(() => speak(s.say, true), 350); }
    } else if (s.t === 'order') {
      const words = s.s.split(' '); let order = shuffle(words.map((w, i) => ({ w, i })));
      if (order.every((o, i) => o.i === i) && words.length > 1) order = order.reverse();
      const built = [];
      body += `<div class="q">Put the words in order. <button class="btn small" id="xQ">🔊</button></div><div class="built" id="xBuilt"></div><div class="bank" id="xBank"></div><div class="feedback" id="xFb"></div>
        <div class="mfoot"><span>${s.es ? `<button class="btn small" id="xEs">💡 Pista</button> <span class="hint hidden" id="xEsT">${esc(s.es)}</span>` : ''}</span><span><button class="btn small" id="xClear">↺</button> <button class="btn green" id="xCheck">Check ✔</button> <button class="btn primary hidden" id="xNext">Next ▶</button></span></div>`;
      UI.openModal(head() + body);
      const draw = () => {
        $('xBuilt').innerHTML = built.map((o, k) => `<button class="chip" data-k="${k}">${esc(o.w)}</button>`).join('');
        $('xBank').innerHTML = order.map((o, k) => `<button class="chip ${built.includes(o) ? 'used' : ''}" data-k="${k}">${esc(o.w)}</button>`).join('');
        $('xBank').querySelectorAll('.chip').forEach(b => b.onclick = () => { const o = order[+b.dataset.k]; if (!built.includes(o)) { built.push(o); sfx('click', .3); draw(); } });
        $('xBuilt').querySelectorAll('.chip').forEach(b => b.onclick = () => { built.splice(+b.dataset.k, 1); draw(); });
      };
      draw();
      $('xClear').onclick = () => { built.length = 0; draw(); };
      $('xQ').onclick = () => speak(s.s, true);
      if (s.es) $('xEs').onclick = () => show('xEsT', true);
      $('xCheck').onclick = () => {
        if (built.length < words.length) { $('xFb').className = 'feedback bad'; $('xFb').textContent = 'Use all the words.'; return; }
        track(L.title, s, L, 'Order: ' + s.s, built.map(o => o.w).join(' '), s.s, built.map(o => o.w).join(' ') === s.s, t0);
        if (built.map(o => o.w).join(' ') === s.s) { sfx('ok'); $('xFb').className = 'feedback good'; $('xFb').textContent = '✅ Correct! ' + s.s; show('xCheck', false); show('xClear', false); show('xNext', true); speak(s.s); $('xBuilt').querySelectorAll('.chip').forEach(c => c.onclick = null); }
        else { mistakes++; sfx('bad', .4); $('xFb').className = 'feedback bad'; $('xFb').textContent = '❌ Not yet. Try again! Start with: "' + words[0] + '"'; }
      };
    } else if (s.t === 'gap') {
      const parts = s.text.split('___'), fill = new Array(s.a.length).fill(null); let cur = 0;
      const bank = shuffle([...s.a, ...(s.extra || [])].map((w, i) => ({ w, i })));
      body += `<div class="q">Complete the text. <button class="btn small" id="xQ">🔊</button></div><div class="gaptext" id="xText"></div><div class="bank" id="xBank" style="margin-top:10px"></div><div class="feedback" id="xFb"></div>
        <div class="mfoot"><span class="hint">Tap a blank, then tap a word.</span><span><button class="btn green" id="xCheck">Check ✔</button> <button class="btn primary hidden" id="xNext">Next ▶</button></span></div>`;
      UI.openModal(head() + body);
      let locked = false, marks = [];
      const draw = () => {
        $('xText').innerHTML = parts.map((p, k) => esc(p) + (k < fill.length ? `<span class="slot ${k === cur ? 'cur' : ''} ${marks[k] || ''}" data-k="${k}">${fill[k] ? esc(fill[k].w) : '&nbsp;'}</span>` : '')).join('');
        $('xBank').innerHTML = bank.map((o, k) => `<button class="chip ${fill.includes(o) ? 'used' : ''}" data-k="${k}">${esc(o.w)}</button>`).join('');
        $('xText').querySelectorAll('.slot').forEach(sl => sl.onclick = () => { if (locked) return; const k = +sl.dataset.k; if (fill[k]) fill[k] = null; cur = k; marks[k] = ''; draw(); });
        $('xBank').querySelectorAll('.chip').forEach(b => b.onclick = () => { if (locked) return; const o = bank[+b.dataset.k]; if (fill.includes(o)) return; fill[cur] = o; marks[cur] = ''; sfx('click', .3); const nx = fill.findIndex(f => !f); cur = nx < 0 ? cur : nx; draw(); });
      };
      draw();
      $('xQ').onclick = () => speak(parts.map((p, k) => p + (k < fill.length ? (fill[k] ? fill[k].w : 'blank') : '')).join(''), true);
      $('xCheck').onclick = () => {
        if (locked || marks.some(m => m === 'bad')) return; // espera a que se borren las palabras rojas (evita contar dos veces)
        if (fill.some(f => !f)) { $('xFb').className = 'feedback bad'; $('xFb').textContent = 'Complete all the blanks.'; return; }
        marks = fill.map((f, k) => f.w === s.a[k] ? 'ok' : 'bad');
        track(L.title, s, L, s.text, fill.map(f => f.w).join(' / '), s.a.join(' / '), marks.every(m => m === 'ok'), t0);
        if (marks.every(m => m === 'ok')) { locked = true; sfx('ok'); draw(); $('xFb').className = 'feedback good'; $('xFb').textContent = '✅ Perfect!'; show('xCheck', false); show('xNext', true); }
        else { mistakes++; sfx('bad', .4); draw(); $('xFb').className = 'feedback bad'; $('xFb').textContent = '❌ The red words are not correct. Try again!'; setTimeout(() => { fill.forEach((f, k) => { if (marks[k] === 'bad') fill[k] = null; }); marks = []; cur = Math.max(0, fill.findIndex(f => !f)); draw(); }, 1100); }
      };
    } else if (s.t === 'match') {
      const left = shuffle(s.pairs.map((p, i) => ({ w: p[0], i }))), right = shuffle(s.pairs.map((p, i) => ({ e: p[1], i })));
      let sel = null; const done = new Set();
      body += `<div class="q">Match the words and the pictures.</div><div class="match"><div class="col" id="xL"></div><div class="col" id="xR"></div></div><div class="feedback" id="xFb"></div>
        <div class="mfoot"><span class="hint">Tap a word, then its picture. Tap 🔊 to hear the word.</span><button class="btn primary hidden" id="xNext">Next ▶</button></div>`;
      UI.openModal(head() + body);
      const draw = () => {
        $('xL').innerHTML = left.map((o, k) => `<button class="chip ${done.has(o.i) ? 'done' : ''} ${sel === o.i ? 'sel' : ''}" data-k="${k}">${esc(o.w)}</button>`).join('');
        $('xR').innerHTML = right.map((o, k) => `<button class="chip emo ${done.has(o.i) ? 'done' : ''}" data-k="${k}">${esc(o.e)}</button>`).join('');
        $('xL').querySelectorAll('.chip').forEach(b => b.onclick = () => { const o = left[+b.dataset.k]; if (done.has(o.i)) return; sel = o.i; speak(o.w, true); draw(); });
        $('xR').querySelectorAll('.chip').forEach(b => b.onclick = () => {
          const o = right[+b.dataset.k]; if (done.has(o.i) || sel === null) return;
          track(L.title, s, L, 'Match: ' + s.pairs[sel][0], o.e, s.pairs[sel][1], o.i === sel, t0);
          if (o.i === sel) { done.add(o.i); sel = null; sfx('ok', .4); if (done.size === s.pairs.length) { $('xFb').className = 'feedback good'; $('xFb').textContent = '✅ All matched!'; show('xNext', true); } }
          else { mistakes++; sfx('bad', .4); $('xFb').className = 'feedback bad'; $('xFb').textContent = '❌ Try again!'; }
          draw();
        });
      };
      draw();
    }
    if ($('xRead')) $('xRead').onclick = () => speak(s.read.text.join(' '), true);
    if (s.read && s.first && s.read.listen) setTimeout(() => speak(s.read.text.join(' ')), 300);
    $('xNext') && ($('xNext').onclick = () => { sfx('click', .4); next(); });
    $('xClose').onclick = () => { UI.closeModal(); toast('You can finish this activity later. 👍'); };
  };
  render();
}

/* quick question for online orbs */
function quickQuestion() {
  const pool = [...QUICK]; for (const id in LESSONS) LESSONS[id].ex.forEach(e => { if (e.t === 'mcq' || e.t === 'listen') pool.push(e); });
  const q = pool[Math.floor(Math.random() * pool.length)];
  if (q.t === 'order') {
    const words = q.s.split(' '), order = shuffle(words.map((w, i) => ({ w, i }))), built = []; let tries = 0;
    UI.openModal(`<div class="mhead"><span class="kind">Weather Orb</span><h2>Put the words in order</h2><span></span></div><div class="built" id="xBuilt"></div><div class="bank" id="xBank"></div><div class="feedback" id="xFb"></div><div class="mfoot"><span></span><button class="btn green" id="xCheck">Check ✔</button></div>`, false);
    const draw = () => { $('xBuilt').innerHTML = built.map((o, k) => `<button class="chip" data-k="${k}">${esc(o.w)}</button>`).join(''); $('xBank').innerHTML = order.map((o, k) => `<button class="chip ${built.includes(o) ? 'used' : ''}" data-k="${k}">${esc(o.w)}</button>`).join(''); $('xBank').querySelectorAll('.chip').forEach(b => b.onclick = () => { const o = order[+b.dataset.k]; if (!built.includes(o)) { built.push(o); draw(); } }); $('xBuilt').querySelectorAll('.chip').forEach(b => b.onclick = () => { built.splice(+b.dataset.k, 1); draw(); }); };
    draw();
    const t0 = performance.now();
    $('xCheck').onclick = () => { if (built.length < words.length) return; track('Weather Orb', q, null, 'Order: ' + q.s, built.map(o => o.w).join(' '), q.s, built.map(o => o.w).join(' ') === q.s, t0); if (built.map(o => o.w).join(' ') === q.s) { const p = tries ? 5 : 10; addScore(p); sfx('ok'); UI.closeModal(); toast(`✅ Correct! +${p} 🏆`); } else { tries++; sfx('bad', .4); built.length = 0; draw(); $('xFb').className = 'feedback bad'; $('xFb').textContent = '❌ Try again!'; } };
    return;
  }
  const opts = shuffle(q.o.map((o, i) => ({ o, ok: i === 0 }))); let tries = 0;
  UI.openModal(`<div class="mhead"><span class="kind">Weather Orb</span><h2>Quick question!</h2><span></span></div>${q.pic ? `<div class="pic">${esc(q.pic)}</div>` : ''}${q.t === 'listen' ? `<div style="text-align:center"><button class="btn blue" id="xSay">🔊 Listen</button></div>` : ''}<div class="q">${esc(q.q)}</div><div class="opts">${opts.map((o, i) => `<button class="btn" data-i="${i}">${esc(o.o)}</button>`).join('')}</div><div class="feedback" id="xFb"></div>`, false);
  if (q.t === 'listen') { $('xSay').onclick = () => speak(q.say, true); setTimeout(() => speak(q.say, true), 300); }
  const t0 = performance.now();
  $('mBox').querySelectorAll('.opts .btn').forEach(b => b.onclick = () => {
    const o = opts[+b.dataset.i]; if (b.classList.contains('no')) return;
    track('Weather Orb', q, null, qText(q), o.o, q.o[0], o.ok, t0);
    if (o.ok) { const p = tries ? 5 : 10; b.classList.add('ok'); sfx('ok'); addScore(p); setTimeout(() => { UI.closeModal(); toast(`✅ Correct! +${p} 🏆`); }, 700); }
    else { tries++; b.classList.add('no'); sfx('bad', .4); $('xFb').className = 'feedback bad'; $('xFb').textContent = '❌ Try again!'; }
  });
}

/* ================= wardrobe ================= */
function openWardrobe(zk = null, intro = '') {
  sfx('open', .4); let checks = 0;
  const draw = () => {
    const on = P.outfit, list = outfitIds();
    const sentence = list.length ? "I'm wearing " + list.map(id => (/s$/.test(CLOTHES[id].name) ? '' : /^[aeiou]/i.test(CLOTHES[id].name) ? 'an ' : 'a ') + CLOTHES[id].name).join(', ').replace(/, ([^,]*)$/, ' and $1') + '.' : "I'm not wearing anything special.";
    const Z = zk ? ZONES[zk] : null;
    UI.openModal(`<div class="mhead"><span class="kind">Wardrobe</span><h2>👕 Choose your clothes</h2><button class="btn small" id="xClose">✖</button></div>
      ${intro ? `<div class="need">${esc(intro)}</div>` : ''}
      ${Z ? `<div class="need"><b>${Z.icon} ${esc(Z.name)}</b> — ${esc(Z.weather)} 🌡️ ${Z.temp}°C<br>What do you need? Choose the right clothes!</div>` : `<div class="need">Visit the four zones. What's the weather like there? Choose the right clothes for each place!</div>`}
      <div class="wardrobe">${Object.entries(CLOTHES).map(([id, c]) => `<button class="chip ${on[c.slot] === id ? 'on' : ''}" data-id="${id}"><span class="e">${c.icon}</span>${esc(c.name)}</button>`).join('')}</div>
      <div class="need" style="margin-top:12px">🗣️ <b id="xSent">${esc(sentence)}</b> <button class="btn small" id="xSay">🔊</button></div>
      <div class="feedback" id="xFb"></div>
      <div class="mfoot"><span class="hint">One item for each part of the body.</span><span>${Z ? '<button class="btn green" id="xCheck">Check my clothes ✔</button> ' : ''}<button class="btn primary" id="xOk">Done ▶</button></span></div>`);
    $('mBox').querySelectorAll('.wardrobe .chip').forEach(b => b.onclick = () => {
      const id = b.dataset.id, slot = CLOTHES[id].slot; P.outfit[slot] = P.outfit[slot] === id ? null : id; sfx('click', .3);
      dressChar(player.ch, P.outfit); saveGame(); speak(CLOTHES[id].name); draw();
    });
    $('xSay').onclick = () => speak(sentence, true);
    $('xClose').onclick = $('xOk').onclick = () => { UI.closeModal(); netState(true); };
    if (Z) $('xCheck').onclick = () => {
      const c = clothesCheck(zk); checks++;
      if (!c.missing.length && !c.bad.length) { sfx('ok'); $('xFb').className = 'feedback good'; $('xFb').textContent = `✅ Perfect! You're ready for the ${Z.name}!`; speak(`Perfect! You're ready for the ${Z.name}!`); player.comfort = 100; }
      else {
        sfx('bad', .4); $('xFb').className = 'feedback bad';
        let msg = `❌ Not yet! ${Z.weather}`;
        if (c.bad.length) msg += ` Take off: ${c.bad.map(i => CLOTHES[i].icon).join(' ')}.`;
        if (checks >= 2 && c.missing.length) msg += ` You need: ${c.missing.map(i => CLOTHES[i].icon + ' ' + CLOTHES[i].name).join(', ')}.`;
        else if (c.missing.length) msg += ` You need ${c.missing.length} more thing${c.missing.length > 1 ? 's' : ''}.`;
        $('xFb').textContent = msg;
      }
    };
  };
  draw();
}

/* ================= story logic ================= */
function lessonAvailable(id) { const L = LESSONS[id]; if (L.after && !P.lessons[L.after]) return false; return true; }
function zoneDone(zk) { return ZONE_LESSONS[zk].filter(id => P.lessons[id]).length; }
function npcNextLesson(n) { return n.lessons.find(id => !P.lessons[id] && lessonAvailable(id)) || null; }
function npcMark(n) {
  if (MODE === 'story' && !P.introDone) return n.id === 'sky' ? '❗' : '';
  if (n.id === 'sky') { if (!P.lessons.warmup) return '❗'; if (Object.keys(P.crystals).length === 4 && !P.lessons.final) return '❗'; return P.lessons.final ? '🌈' : ''; }
  const id = npcNextLesson(n);
  if (!id) return '✅';
  const L = LESSONS[id];
  if (L.collect && P.collecting[id]) { const got = (P.collected[id] || []).length; return got >= L.collect.words.length ? '❓' : '🔍'; }
  return '❗';
}
function talkTo(n) {
  sfx('open', .3);
  const who = n.name;
  if (n.id === 'sky') return talkSky(n);
  if (n.id === 'mia' && P.lessons.clothes) return dialog(who, ["Hi again! Let's choose your clothes. 👕"], { end: () => openWardrobe() });
  const id = npcNextLesson(n);
  if (!id) {
    const done = n.lessons.map(l => P.lessons[l]); const stars = done.reduce((a, b) => a + (b || 0), 0);
    return dialog(who, [`Thank you, Weather Hero! ${'⭐'.repeat(Math.min(3, Math.round(stars / n.lessons.length)))}`], { buttons: [['Play again 🔁', 'blue', () => runLesson(n.lessons[n.lessons.length - 1], afterLesson(n))], ['Bye! 👋', '', null]] });
  }
  const L = LESSONS[id];
  if (L.collect) {
    const got = (P.collected[id] || []).length, total = L.collect.words.length;
    if (!P.collecting[id]) {
      const text = id === 'hillsVocab' ? "The wind took my four kites! 🪁 Can you find them in the Windy Hills? Look at the map!" : NPC_HELLO[n.id] + ' Look at the map! 🗺️';
      return dialog(who, [text], { buttons: [["OK, I'll find them! 🔍", 'primary', () => { P.collecting[id] = true; saveGame(); spawnCollect(id); updateHUD(); toast('Look for the yellow dots on the map 🗺️'); }], ['Not now', '', null]] });
    }
    if (got < total) { spawnCollect(id); return dialog(who, [`You have ${got} of ${total}. Keep looking! Look for the yellow dots on the map. 🗺️`]); }
    return dialog(who, ['You found them all! Thank you! 🎉', "Now let's use the new words."], { buttons: [["Let's start! ▶", 'primary', () => runLesson(id, afterLesson(n))], ['Not now', '', null]] });
  }
  const hello = n.id === 'mia' ? NPC_HELLO.mia : (n.lessons.indexOf(id) > 0 ? "Let's do another activity!" : NPC_HELLO[n.id]);
  dialog(who, [hello], { buttons: [["Let's start! ▶", 'primary', () => runLesson(id, afterLesson(n))], ['Not now', '', null]] });
}
function afterLesson(n) {
  return () => {
    const L = LESSONS[n.lessons.find(l => P.lessons[l]) || n.lessons[0]];
    if (n.id === 'mia') return dialog(n.name, ['Well done! Now choose your clothes. Remember: different weather, different clothes!'], { end: () => openWardrobe() });
    for (const zk in ZONE_LESSONS) if (ZONE_LESSONS[zk].includes(n.lessons[0]) || n.lessons.some(l => ZONE_LESSONS[zk].includes(l))) {
      const d = zoneDone(zk);
      if (d >= 3 && !P.crystals[ZONES[zk].season]) { toast(`💎 The ${ZONES[zk].season} crystal is free! Go to the 💎 on the map.`, 5000); speak(`The ${ZONES[zk].season} crystal is free! Go to the crystal.`); }
      else if (d < 3) toast(`${ZONES[zk].icon} ${ZONES[zk].name}: ${d}/3 friends helped`, 3500);
    }
    updateHUD();
  };
}
function talkSky(n) {
  if (MODE === 'story' && !P.introDone) {
    return dialog(n.name, STORY.intro, { es: STORY.introEs, end: () => { P.introDone = true; saveGame(); dialog(n.name, ["Let's warm up with some weather words!"], { buttons: [["Let's start! ▶", 'primary', () => runLesson('warmup', () => { dialog(n.name, ["Fantastic! Now go to Mia's Clothes Shop. Follow the ❗ on the map."], { end: updateHUD }); })], ['Later', '', updateHUD]] }); } });
  }
  if (!P.lessons.warmup) return dialog(n.name, ["Let's warm up with some weather words!"], { buttons: [["Let's start! ▶", 'primary', () => runLesson('warmup', updateHUD)], ['Not now', '', null]] });
  const nc = Object.keys(P.crystals).length;
  if (nc < 4) {
    const status = ['desert', 'forest', 'hills', 'snow'].map(zk => `${ZONES[zk].icon} ${zoneDone(zk)}/3${P.crystals[ZONES[zk].season] ? ' 💎' : ''}`).join('   ');
    return dialog(n.name, [`You have ${nc} of 4 crystals. Keep going! ${status}`, 'Remember: help 3 people in each zone, then take the crystal. 💎']);
  }
  if (!P.lessons.final) return dialog(n.name, STORY.allCrystals, { buttons: [["Let's read it! ▶", 'primary', () => runLesson('final', () => ending())], ['Not now', '', null]] });
  dialog(n.name, ['Thank you, Weather Hero! The weather is perfect now. 🌈'], { buttons: [['🏅 My certificate', 'primary', certificate], ['Bye! 👋', '', null]] });
}
function touchPedestal(zk) {
  const season = ZONES[zk].season, ped = pedestals[zk];
  if (P.crystals[season]) return dialog('💎 Crystal', [`You already have the ${season} crystal. Take it to Professor Sky!`]);
  const d = zoneDone(zk);
  if (d < 3) return dialog('💎 Crystal', [`The ${season} crystal is inside a weather bubble. 🫧`, `Help the 3 people in the ${ZONES[zk].name} first. (${d}/3)`]);
  dialog('💎 Crystal', [`The ${season} crystal is free! Answer the challenge to take it.`], { buttons: [['Start the challenge ▶', 'primary', () => runLesson(ZONE_CRYSTAL_LESSON[zk], () => {
    P.crystals[season] = true; saveGame(); updateHUD(); sfx('crystal');
    player.emote = 1.5; playAnim(player.ch, 'emote-yes', .1, true); player.ch.cur = 'emote-yes';
    const n = Object.keys(P.crystals).length;
    dialog('💎 Crystal', [`You have the ${season} crystal! ${SEASON_ICON[season]} (${n}/4)`, n < 4 ? 'Find the next crystal!' : 'You have all four crystals! Go back to Professor Sky in Sunnyvale Town. 🏘️'], { end: updateHUD });
  })], ['Not now', '', null]] });
}
function refreshCrystals() {
  for (const zk in pedestals) {
    const season = ZONES[zk].season, p = pedestals[zk], got = !!P.crystals[season], free = zoneDone(zk) >= 3;
    p.cr.visible = !got; p.bub.visible = !got && !free;
    machineSockets[season].material.color.set(got ? CRYSTAL_COLOR[season] : 0x555b66);
    machineSockets[season].material.emissive = new THREE.Color(got ? CRYSTAL_COLOR[season] : 0);
    machineSockets[season].material.emissiveIntensity = got ? .9 : 0;
  }
}
let rainbow = null;
function ending() {
  GAME.rainbow = true;
  if (!rainbow) {
    rainbow = new THREE.Group(); const cols = [0xff4d4d, 0xff9a3c, 0xffe14d, 0x5fd35f, 0x4aa8ff, 0x8a5cf6];
    cols.forEach((c, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(60 - i * 2.2, 1.1, 6, 48, Math.PI), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .8, fog: false })); rainbow.add(m); });
    rainbow.position.set(0, 0, -40); scene.add(rainbow);
  }
  P.finalDone = true; saveGame(); sfx('win');
  dialog('Professor Sky', STORY.ending, { end: certificate });
}
function certificate() {
  const stars = Object.values(P.lessons).reduce((a, b) => a + b, 0), max = Object.keys(LESSONS).length * 3;
  UI.openModal(`<div class="cert"><div style="font-size:40px">🌈☀️🌧️❄️💨</div><h1>Weather Hero</h1><div>This certificate is for</div><div class="nm">${esc(P.name || 'Weather Hero')}</div>
    <div>for completing <b>Unit 4: What's the weather like?</b></div><div class="stars" style="font-size:30px">⭐ ${stars} / ${max}</div><div class="hint">${new Date().toLocaleDateString('es-CL')}</div></div>
    <div class="mfoot"><button class="btn" onclick="window.print()">🖨️ Print</button><button class="btn primary" id="xOk">Keep playing ▶</button></div>`);
  $('xOk').onclick = () => UI.closeModal();
}

/* ================= interaction ================= */
function nearest() {
  let best = null, bd = 1e9; const px = player.pos.x, pz = player.pos.z;
  for (const n of npcList) { const d = Math.hypot(px - n.x, pz - n.z); if (d < 3.4 && d < bd) { bd = d; best = { type: 'npc', n, label: `Talk to ${n.name}` }; } }
  for (const c of chests) { const d = Math.hypot(px - c.x, pz - c.z); if (d < 3.2 && d < bd) { bd = d; best = { type: 'chest', c, label: 'Open the clothes chest 🎁' }; } }
  for (const zk in pedestals) { const p = pedestals[zk], d = Math.hypot(px - p.x, pz - p.z); if (d < 6 && d < bd) { bd = d; best = { type: 'ped', zk, label: 'Look at the crystal 💎' }; } }
  return best;
}
function interact() {
  const t = nearest(); if (!t) return;
  if (t.type === 'npc') talkTo(t.n);
  else if (t.type === 'chest') openWardrobe(t.c.zone);
  else if (t.type === 'ped') touchPedestal(t.zk);
}

/* ================= HUD, minimap ================= */
let lastZone = null;
function zoneEnter(zk) {
  if (zk === lastZone) return; lastZone = zk; player.zone = zk;
  const Z = ZONES[zk];
  $('zName').textContent = `${Z.icon} ${Z.name}`; $('zWeather').textContent = `What's the weather like? ${Z.weather}`; $('zTemp').textContent = `🌡️ ${Z.temp}°C`;
  if (zk !== 'town' && !P.visited[zk] && GAME.running) {
    P.visited[zk] = true; saveGame();
    toast(`<b>Welcome to the ${Z.icon} ${esc(Z.name)}!</b><br>It's ${Z.season}. ${esc(Z.weather)} It's ${Z.temp} degrees.`, 5500);
    speak(`Welcome to the ${Z.name}! It's ${Z.season}. ${Z.weather} It's ${Z.temp < 0 ? 'minus ' + (-Z.temp) : Z.temp} degrees.`);
  }
}
function questText() {
  if (MODE === 'online') return 'Touch the ❓ orbs, talk to people with ❗ and listen to the Weather Calls!';
  if (!P.introDone) return 'Talk to Professor Sky ❗ next to the Weather Machine.';
  if (!P.lessons.warmup) return 'Talk to Professor Sky ❗.';
  const coll = Object.keys(P.collecting).find(id => P.collecting[id] && !P.lessons[id]);
  let s = '';
  if (coll) { const L = LESSONS[coll], g = (P.collected[coll] || []).length, tot = L.collect.words.length; s += g < tot ? `🔍 Find the words: ${g}/${tot} (yellow dots on the map)<br>` : `✅ Go back to ${NPCS[L.npc].name}!<br>`; }
  const nc = Object.keys(P.crystals).length;
  if (nc === 4) return s + (P.lessons.final ? '🌈 You are a Weather Hero! Explore and play again.' : '💎 You have 4 crystals! Go to Professor Sky.');
  if (!P.lessons.clothes) s += "👕 Visit Mia's Clothes Shop (❗)<br>";
  return s + 'Find the 4 crystals 💎<br>' + ['desert', 'forest', 'hills', 'snow'].map(zk => `${ZONES[zk].icon} ${zoneDone(zk)}/3${P.crystals[ZONES[zk].season] ? '💎' : ''}`).join(' &nbsp; ');
}
function updateHUD() {
  $('qHead').textContent = MODE === 'online' ? 'Online · Room ' + NET.room : 'Story Mode';
  $('qText').innerHTML = questText();
  $('sStars').textContent = '⭐ ' + Object.values(P.lessons).reduce((a, b) => a + b, 0);
  $('sCrys').textContent = '💎 ' + Object.keys(P.crystals).length + '/4';
  show('sScore', MODE === 'online'); $('sScore').textContent = '🏆 ' + NET.score;
  refreshCrystals();
}
const mm = $('minimap').getContext('2d');
function drawMinimap() {
  const W = 340, R = W / 2, sc = R / 200, c = mm;
  c.clearRect(0, 0, W, W); c.save(); c.beginPath(); c.arc(R, R, R, 0, Math.PI * 2); c.clip();
  const zc = { desert: '#e9c97a', forest: '#3f9a4c', snow: '#f1f6fc', hills: '#c99a4a' };
  for (const zk in ZDIR) { const d = ZDIR[zk], a = Math.atan2(d[1], d[0]); c.fillStyle = zc[zk]; c.beginPath(); c.moveTo(R, R); c.arc(R, R, R, a - Math.PI / 4, a + Math.PI / 4); c.fill(); }
  c.fillStyle = '#79c45f'; c.beginPath(); c.arc(R, R, 50 * sc, 0, 7); c.fill();
  c.strokeStyle = '#c9a46e'; c.lineWidth = 6; c.beginPath(); c.moveTo(R, R - 175 * sc); c.lineTo(R, R + 175 * sc); c.moveTo(R - 175 * sc, R); c.lineTo(R + 175 * sc, R); c.stroke();
  const P2 = (x, z) => [R + x * sc, R + z * sc];
  c.font = '600 22px Fredoka, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const zk in ZDIR) { const [x, z] = P2(ZDIR[zk][0] * 105, ZDIR[zk][1] * 105); c.fillText(ZONES[zk].icon, x, z); }
  const dot = (x, z, col, r = 6) => { const [a, b] = P2(x, z); c.fillStyle = col; c.strokeStyle = '#1f2a44'; c.lineWidth = 2; c.beginPath(); c.arc(a, b, r, 0, 7); c.fill(); c.stroke(); };
  for (const it of items) dot(it.x, it.z, '#ffe14d', 10);
  if (MODE === 'online') for (const o of orbs) if (o.cd <= 0) dot(o.x, o.z, '#ff9a00', 4);
  for (const ch of chests) { const [a, b] = P2(ch.x, ch.z); c.font = '18px sans-serif'; c.fillText('🎁', a, b); }
  for (const zk in pedestals) if (!P.crystals[ZONES[zk].season]) { const [a, b] = P2(pedestals[zk].x, pedestals[zk].z); c.font = '22px sans-serif'; c.fillText('💎', a, b); }
  for (const n of npcList) if (n.markTxt === '❗' || n.markTxt === '❓') { const [a, b] = P2(n.x, n.z); c.font = '700 30px sans-serif'; c.fillText(n.markTxt, a, b); } else if (n.markTxt) dot(n.x, n.z, '#ffffff', 5);
  for (const p of NET.peers.values()) dot(p.x, p.z, '#4aa8ff', 6);
  const [px, pz] = P2(player.pos.x, player.pos.z);
  c.save(); c.translate(px, pz); c.rotate(-player.yaw + Math.PI); c.fillStyle = '#ef5a4c'; c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, -13); c.lineTo(9, 10); c.lineTo(0, 5); c.lineTo(-9, 10); c.closePath(); c.fill(); c.stroke(); c.restore();
  c.restore();
  c.fillStyle = '#1f2a44'; c.font = '700 20px Fredoka, sans-serif'; c.fillText('N', R, 16);
}
function updatePrompt() {
  const t = UI.busy() ? null : nearest();
  if (t) { $('prompt').textContent = ('ontouchstart' in window ? '' : 'E · ') + t.label; show('prompt', true); $('tAct').textContent = t.type === 'npc' ? 'Talk' : 'Open'; }
  else { show('prompt', false); $('tAct').textContent = 'E'; }
}

/* ================= online (Supabase Realtime) ================= */
const SUPA_URL = 'https://tlihbmgokuhvppbchvrz.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaWhibWdva3VodnBwYmNodnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTMyMDAsImV4cCI6MjEwODY2OTIwMH0.ZHA6-G0S_iqGxdnPXSB_nOIoS67G2pxSYbaGcNfvLQw';
const NET = { sb: null, ch: null, ok: false, id: Math.random().toString(36).slice(2, 10), room: '', peers: new Map(), score: 0, sendT: 0, last: '', callPhase: -1, callDone: -1 };
function netStart(room) {
  NET.room = room;
  if (typeof supabase === 'undefined' || !supabase.createClient) { toast('⚠️ No internet connection: you are playing alone.', 5000); return; }
  try {
    NET.sb = NET.sb || supabase.createClient(SUPA_URL, SUPA_ANON, { auth: { persistSession: false, autoRefreshToken: false } });
    const ch = NET.sb.channel('weather-' + room.toLowerCase(), { config: { broadcast: { self: false } } });
    ch.on('broadcast', { event: 'st' }, m => netPeer(m.payload));
    ch.on('broadcast', { event: 'bye' }, m => netRemove(m.payload && m.payload.id));
    ch.on('broadcast', { event: 'say' }, m => { const p = m.payload || {}; const peer = NET.peers.get(p.id); chatLine(peer ? peer.name : '?', p.t); if (peer) bubble(peer, p.t); });
    ch.subscribe(st => { NET.ok = st === 'SUBSCRIBED'; if (NET.ok) { toast(`🌐 Connected to room <b>${esc(room)}</b>!`); netState(true); } else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') toast('⚠️ Connection problem. Trying again…'); });
    NET.ch = ch;
  } catch (e) { console.warn(e); toast('⚠️ Could not connect. You are playing alone.'); }
}
function netStop() { if (NET.ch) { try { NET.ch.send({ type: 'broadcast', event: 'bye', payload: { id: NET.id } }); NET.sb.removeChannel(NET.ch); } catch (e) {} } NET.ch = null; NET.ok = false; for (const id of [...NET.peers.keys()]) netRemove(id); }
function netState(force = false) {
  if (!NET.ok || MODE !== 'online') return;
  const p = player.pos, st = { id: NET.id, n: P.name, k: P.skin, x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2), r: +player.yaw.toFixed(2), m: player.moving ? 1 : 0, o: P.outfit, s: NET.score };
  const key = JSON.stringify([st.x, st.z, st.r, st.m, st.s, st.o]);
  const now = performance.now();
  if (!force && key === NET.last && now - NET.sendT < 1500) return;
  if (!force && now - NET.sendT < 110) return;
  NET.last = key; NET.sendT = now; NET.ch.send({ type: 'broadcast', event: 'st', payload: st });
}
function netPeer(s) {
  if (!s || !s.id || s.id === NET.id) return;
  let p = NET.peers.get(s.id);
  const skin = SKINS.includes(s.k) ? s.k : 'a';
  if (!p || p.skin !== skin) {
    if (p) scene.remove(p.ch.root);
    const ch = makeChar(skin); scene.add(ch.root);
    const tag = makeLabel(String(s.n || '?').slice(0, 14), { size: 28, bg: 'rgba(74,168,255,.92)', color: '#fff', scale: .017 }); tag.position.y = 2.45; ch.root.add(tag);
    p = { ch, skin, x: s.x, y: s.y, z: s.z, r: s.r, name: String(s.n || '?').slice(0, 14), outfitKey: '' };
    ch.root.position.set(s.x, s.y, s.z); NET.peers.set(s.id, p);
  }
  Object.assign(p, { tx: s.x, ty: s.y, tz: s.z, tr: s.r, m: s.m, score: +s.s || 0, seen: performance.now() });
  const ok = JSON.stringify(s.o || {}); if (ok !== p.outfitKey) { p.outfitKey = ok; const o = {}; for (const sl of SLOTS) if (s.o && CLOTHES[s.o[sl]]) o[sl] = s.o[sl]; dressChar(p.ch, o); }
}
function netRemove(id) { const p = NET.peers.get(id); if (!p) return; scene.remove(p.ch.root); NET.peers.delete(id); }
function updatePeers(dt) {
  const now = performance.now();
  for (const [id, p] of NET.peers) {
    if (now - p.seen > 20000) { netRemove(id); continue; }
    const k = 1 - Math.exp(-dt * 10);
    p.x = lerp(p.x, p.tx, k); p.y = lerp(p.y, p.ty, k); p.z = lerp(p.z, p.tz, k);
    let d = p.tr - p.r; d = Math.atan2(Math.sin(d), Math.cos(d)); p.r += d * k;
    p.ch.root.position.set(p.x, p.y, p.z); p.ch.root.rotation.y = p.r;
    playAnim(p.ch, p.m ? 'walk' : 'idle'); p.ch.mixer.update(dt);
    if (p.bub && now > p.bubT) { p.ch.root.remove(p.bub); p.bub = null; }
  }
  if (MODE === 'online') { const now2 = performance.now(); if (!NET.boardT || now2 - NET.boardT > 1000) { NET.boardT = now2; drawBoard(); } }
}
function drawBoard() {
  const rows = [{ n: P.name + ' (you)', s: NET.score, me: true }, ...[...NET.peers.values()].map(p => ({ n: p.name, s: p.score }))].sort((a, b) => b.s - a.s).slice(0, 10);
  $('board').innerHTML = `<b>🏆 Room ${esc(NET.room)} ${NET.ok ? '🟢' : '🔴'}</b>` + rows.map((r, i) => `<div style="${r.me ? 'font-weight:700' : ''}">${i + 1}. ${esc(r.n)} — ${r.s}</div>`).join('');
}
function addScore(p) { NET.score += p; updateHUD(); netState(true); }
function chatLine(name, text) {
  const d = document.createElement('div'); d.innerHTML = `<b>${esc(name)}:</b> ${esc(text)}`; $('chatLog').appendChild(d);
  while ($('chatLog').children.length > 5) $('chatLog').firstChild.remove();
  setTimeout(() => d.remove(), 12000);
}
function bubble(p, text) { if (p.bub) p.ch.root.remove(p.bub); p.bub = makeLabel(text, { size: 28 }); p.bub.position.y = 3.2; p.ch.root.add(p.bub); p.bubT = performance.now() + 4500; }
function openPhrases() {
  UI.openModal(`<div class="mhead"><span class="kind">Chat</span><h2>💬 Say something</h2><button class="btn small" id="xClose">✖</button></div><div class="phr">${PHRASES.map((p, i) => `<button class="btn" data-i="${i}">${esc(p)}</button>`).join('')}</div>`);
  $('xClose').onclick = () => UI.closeModal();
  $('mBox').querySelectorAll('.phr .btn').forEach(b => b.onclick = () => {
    const t = PHRASES[+b.dataset.i]; UI.closeModal(); chatLine(P.name, t); speak(t);
    if (!player.selfBubble) player.selfBubble = { ch: player.ch }; bubble(player.selfBubble, t);
    if (NET.ok) NET.ch.send({ type: 'broadcast', event: 'say', payload: { id: NET.id, t } });
  });
}
/* Weather Calls: every 2 minutes, everybody in the room gets the same call (based on the clock). */
const CALL_PERIOD = 120000, CALL_TIME = 50000;
function updateCalls() {
  if (MODE !== 'online') { show('callBox', false); return; }
  const now = Date.now(), phase = Math.floor(now / CALL_PERIOD), into = now % CALL_PERIOD;
  const call = CALLS[(phase * 7 + 3) % CALLS.length];
  if (into < CALL_TIME) {
    const left = Math.ceil((CALL_TIME - into) / 1000);
    if (NET.callPhase !== phase) { NET.callPhase = phase; sfx('open'); speak('Weather call! ' + call.say, true); }
    const done = NET.callDone === phase;
    $('callBox').innerHTML = `📢 <b>Weather Call!</b> ${esc(call.say)}<br>${done ? '✅ You did it!' : `⏱️ ${left} s`}`; show('callBox', true);
    if (!done && player.zone === call.zone) {
      NET.callDone = phase; const c = clothesCheck(call.zone), good = !c.missing.length && !c.bad.length, pts = good ? 30 : 15;
      addScore(pts); sfx('win', .5);
      toast(good ? `🎉 You're in the ${ZONES[call.zone].name} with the right clothes! +${pts} 🏆` : `👍 Right place! +${pts} 🏆<br>Wear the right clothes next time for +30!`, 5000);
    }
  } else {
    const next = Math.ceil((CALL_PERIOD - into) / 1000);
    $('callBox').innerHTML = `📢 Next Weather Call in ${next} s`; show('callBox', next <= 15);
  }
}

/* ================= menus ================= */
const GAME = { running: false, rainbow: false };
let selSkin = 'a';
function screen(id) { ['loading', 'title', 'setup', 'info'].forEach(s => show(s, s === id)); }
function buildSkins() {
  $('skins').innerHTML = SKINS.map(s => `<button data-s="${s}" class="${s === selSkin ? 'sel' : ''}" aria-label="Character ${s}"><img src="assets/previews/character-${s}.png" alt=""></button>`).join('');
  $('skins').querySelectorAll('button').forEach(b => b.onclick = () => { selSkin = b.dataset.s; sfx('click', .3); buildSkins(); });
}
function titleScreen() {
  GAME.running = false; screen('title'); show('hud', false); show('touch', false);
  const sv = store.get(SAVE_KEY);
  $('bStory').textContent = sv && sv.name ? `📖 Continue Story (${sv.name})` : '📖 Story Mode';
  $('saveNote').innerHTML = sv && sv.name ? `💎 ${Object.keys(sv.crystals || {}).length}/4 · ⭐ ${Object.values(sv.lessons || {}).reduce((a, b) => a + b, 0)} &nbsp; <button class="btn small" id="bNew">New story</button>` : '';
  if ($('bNew')) $('bNew').onclick = () => { if (confirm('Start a new story? Your progress will be deleted.')) { store.set(SAVE_KEY, null); setupScreen('story'); } };
  const st = student();
  $('esltStatus').innerHTML = st
    ? `📊 Hola, <b>${esc(st.first_name || st.name || '')}</b> (${esc(st.section || '')}). Tu profe verá tu avance.`
    : `⚠️ No has iniciado sesión: tu profe no verá tu avance. <a href="https://eslteacher.cl/" target="_blank" rel="noopener">Entra en eslteacher.cl</a> (Mi perfil) y vuelve a abrir el juego.`;
  $('esltStatus').classList.toggle('warn', !st);
}
let setupMode = 'story';
function setupScreen(mode) {
  setupMode = mode; screen('setup'); show('roomField', mode === 'online');
  $('setupTitle').textContent = mode === 'online' ? '🌐 Play Online' : '📖 Create your hero';
  const sv = store.get(SAVE_KEY); $('inName').value = (sv && sv.name) || store.get('weatherHeroes.name') || (student() && String(student().first_name || '').slice(0, 14)) || ''; $('inRoom').value = store.get('weatherHeroes.room') || '';
  selSkin = (sv && sv.skin) || 'a'; buildSkins();
  $('setupNote').textContent = mode === 'online' ? 'Everybody in the same room code plays together. Your score starts at 0.' : 'Your progress is saved on this computer.';
}
function infoScreen(html) { $('infoBody').innerHTML = html; screen('info'); }
const HOW = `<h2 style="margin-top:0">🎮 How to play</h2>
<p><b>Move:</b> W A S D or arrows · <b>Run:</b> Shift · <b>Jump:</b> Space<br><b>Camera:</b> drag with the mouse · <b>Zoom:</b> mouse wheel<br><b>Talk / open:</b> E</p>
<p>On a phone or tablet: joystick on the left, buttons on the right, drag the screen to turn the camera, pinch with two fingers to zoom.</p>
<p><b>📖 Story Mode:</b> help Professor Sky! Visit the 4 zones, help 3 people in each zone (reading, language and vocabulary) and take the 💎 crystal.</p>
<p><b>👕 Clothes:</b> every zone has different weather. Wear the right clothes or your 😊 bar goes down! Open a 🎁 chest to change.</p>
<p><b>🌐 Online:</b> play with your class in the same room. Touch ❓ orbs, answer and win points. Listen to the 📢 Weather Calls and run to the right place!</p>
<hr><p class="hint">Español: Muévete con WASD, habla con E. Ayuda a 3 personas en cada zona y consigue los 4 cristales. Usa la ropa correcta para cada clima: ¡si no, baja tu barra de comodidad! En modo online, juega con tu curso usando el mismo código de sala.</p>`;
const CREDITS = `<h2 style="margin-top:0">Credits</h2>
<p><b>Weather Heroes</b> — English game for 5° básico, Unit 4 "What's the weather like?"</p>
<p>3D models: <b>Kenney</b> (Blocky Characters, Nature Kit, Holiday Kit, City Kit Suburban, Cube Pets, Platformer Kit) — CC0 · kenney.nl</p>
<p>Music: <b>CoMiGo</b> Music Loops — CC0. Sounds and jingles: <b>Kenney</b> Interface Sounds, Music Jingles — CC0.</p>
<p>Engine: three.js (MIT). Online: Supabase Realtime.</p>`;

function openMenu() {
  UI.openModal(`<div class="mhead"><span class="kind">Menu</span><h2>⏸️ Paused</h2><button class="btn small" id="xClose">✖</button></div>
    <div class="menu">
      <button class="btn primary" id="mRes">▶ Resume</button>
      <button class="btn" id="mVoice">🗣️ Voice: ${OPTS.voice ? 'ON' : 'OFF'}</button>
      <button class="btn" id="mMusic">🎵 Music: ${OPTS.music ? 'ON' : 'OFF'}</button>
      ${MODE === 'story' && P.finalDone ? '<button class="btn" id="mCert">🏅 My certificate</button>' : ''}
      <button class="btn" id="mHow">🎮 How to play</button>
      <button class="btn red" id="mExit">🏠 Exit to the title</button>
    </div>`);
  $('xClose').onclick = $('mRes').onclick = () => UI.closeModal();
  $('mVoice').onclick = () => { OPTS.voice = !OPTS.voice; store.set(OPT_KEY, OPTS); openMenu(); };
  $('mMusic').onclick = () => { OPTS.music = !OPTS.music; store.set(OPT_KEY, OPTS); openMenu(); };
  if ($('mCert')) $('mCert').onclick = certificate;
  $('mHow').onclick = () => UI.openModal(HOW + '<div class="mfoot"><span></span><button class="btn primary" id="xOk">OK</button></div>') || ($('xOk').onclick = () => UI.closeModal());
  $('mExit').onclick = () => { UI.closeModal(); saveGame(); if (MODE === 'online') netStop(); titleScreen(); };
}

function clearRunState() {
  for (const it of items) scene.remove(it.obj); items.length = 0;
  if (player.ch) scene.remove(player.ch.root);
  GAME.rainbow = false; if (rainbow) { scene.remove(rainbow); rainbow = null; }
  lastZone = null; NET.score = 0; NET.callDone = -1;
}
function startGame(mode) {
  initAmbient(); if (AC && AC.state === 'suspended') AC.resume();
  const name = $('inName').value.trim().slice(0, 14) || 'Hero';
  store.set('weatherHeroes.name', name);
  clearRunState();
  MODE = mode;
  if (mode === 'story') { const sv = store.get(SAVE_KEY); P = Object.assign(newProgress(), sv || {}); if (!sv || !sv.name) P = newProgress(); P.name = name; P.skin = selSkin; saveGame(); }
  else { P = newProgress(); P.name = name; P.skin = selSkin; P.introDone = true; P.lessons = {}; }
  player.ch = makeChar(P.skin); scene.add(player.ch.root); dressChar(player.ch, P.outfit);
  player.pos.set(0, 0, 12); player.pos.y = groundY(0, 12); player.yaw = Math.PI; cam.yaw = 0; player.comfort = 100;
  for (const lid in P.collecting) if (P.collecting[lid] && !P.lessons[lid]) spawnCollect(lid);
  screen(null); show('hud', true); setupTouch();
  show('board', mode === 'online'); show('bChat', mode === 'online');
  orbs.forEach(o => { o.g.visible = mode === 'online'; o.cd = 0; });
  GAME.running = true; saveGame(); updateHUD(); zoneEnter('town');
  if (mode === 'online') { const room = ($('inRoom').value.trim() || 'CLASS').slice(0, 12).toUpperCase(); store.set('weatherHeroes.room', room); netStart(room); updateHUD(); toast(`Welcome, ${esc(name)}! Touch the ❓ orbs to win points.`); }
  else if (!P.introDone) setTimeout(() => { const sky = npcList.find(n => n.id === 'sky'); cam.yaw = Math.atan2(player.pos.x - sky.x, player.pos.z - sky.z); talkTo(sky); }, 900);
  else toast(`Welcome back, ${esc(name)}! ☀️`);
}

/* buttons */
$('bStory').onclick = () => { sfx('click', .4); const sv = store.get(SAVE_KEY); if (sv && sv.name) { $('inName').value = sv.name; selSkin = sv.skin || 'a'; startGame('story'); } else setupScreen('story'); };
$('bOnline').onclick = () => { sfx('click', .4); setupScreen('online'); };
$('bHow').onclick = () => infoScreen(HOW);
$('bCredits').onclick = () => infoScreen(CREDITS);
$('bInfoOk').onclick = () => titleScreen();
$('bBack').onclick = () => titleScreen();
$('bGo').onclick = () => { if (setupMode === 'online' && !$('inRoom').value.trim()) { $('setupNote').textContent = 'Write the room code (for example: 5A).'; return; } startGame(setupMode); };
$('bMenu').onclick = () => { if (!UI.busy()) openMenu(); };
$('bChat').onclick = () => { if (!UI.busy()) openPhrases(); };
$('bListen').onclick = () => { const Z = ZONES[player.zone]; speak(`${Z.name}. What's the weather like? ${Z.weather} It's ${Z.temp < 0 ? 'minus ' + (-Z.temp) : Z.temp} degrees.`, true); };
addEventListener('beforeunload', () => { saveGame(); if (MODE === 'online') netStop(); });

/* ================= main loop ================= */
const clock = new THREE.Clock();
let hudT = 0;
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  if (player.ch) {
    if (GAME.running) updatePlayer(dt);
    zoneEnter(zoneAt(player.pos.x, player.pos.z));
    updateCamera(dt); updateNPCs(dt, t); updatePets(dt); updateItems(dt, t); updateOrbs(dt, t); updatePeers(dt);
    if (GAME.running) { updateComfort(dt); netState(); hudT -= dt; if (hudT <= 0) { hudT = .25; drawMinimap(); updatePrompt(); updateCalls(); if (player.selfBubble && player.selfBubble.bub && performance.now() > player.selfBubble.bubT) { player.ch.root.remove(player.selfBubble.bub); player.selfBubble.bub = null; } } }
  } else { const a = t * .05; camera.position.set(Math.sin(a) * 60, 30, Math.cos(a) * 60); camera.lookAt(0, 4, 0); sun.position.set(30, 60, 20); sun.target.position.set(0, 0, 0); }
  updateWeather(dt, t); musicTick(dt, player.zone);
  for (const a of animated) a.update(dt, t);
  if (rainbow) rainbow.lookAt(camera.position.x, 0, camera.position.z);
  renderer.render(scene, camera);
}

/* debug helper for teachers/devs: WH.tp('snow') */
window.WH = { get P() { return P; }, NET, netState, scene, MODELS, player, items, npcList, cam, runLesson, openWardrobe, tp(zk) { const [x, z] = zk === 'town' ? [0, 12] : GATES[zk].map(v => v * 1.6); player.pos.set(x, groundY(x, z), z); }, at(x, z) { player.pos.set(x, groundY(x, z), z); } };

/* ================= boot ================= */
(async function boot() {
  try { await document.fonts.ready; } catch (e) {}
  await loadAll();
  const b = charBox('char_a'); CHAR_SCALE = 1.8 / (b.max.y - b.min.y);
  buildGround(); buildTown(); buildGates(); buildPedestals(); buildNPCs(); buildZones(); buildClouds(); buildFX(); buildOrbs();
  addPets('dog', 2, 0, 24, 8, 1); addPets('cat', 2, -20, -10, 6, 2); addPets('bunny', 3, 22, 18, 7, 3); addPets('chick', 4, -10, 30, 5, 4);
  addPets('crab', 3, -18, -112, 7, 5); addPets('parrot', 2, -44, -90, 4, 6);
  addPets('chick', 5, -128, -24, 5, 7); addPets('bunny', 3, -120, 30, 12, 8); addPets('fox', 2, -160, 10, 15, 9); addPets('deer', 2, -100, -40, 15, 10);
  addPets('penguin', 6, 16, 140, 7, 11); addPets('polar', 2, -30, 140, 12, 12);
  addPets('cow', 3, 142, 30, 9, 13); addPets('pig', 2, 135, 22, 6, 14); addPets('hog', 1, 145, 36, 5, 15);
  refreshCrystals();
  loop();
  titleScreen();
})();
