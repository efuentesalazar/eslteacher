import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { CH, SIDE, STOPS } from './content.js';

// Trend City: a big open city (6×6 blocks, 5 districts) + a highway to the Atacama Desert.
// Models: Kenney (City Kits, Car Kit, Mini Market, Factory Kit, Furniture Kit, Nature Kit, Blocky Characters)
// and Poly Pizza (fast fashion props). All coordinates are in metres; y is up.
export const scene = new THREE.Scene();
export const colliders = [];   // {x,z,r} circle  or  {x,z,hx,hz} box
export const camBlockers = []; // same shapes + y0,y1
export const animated = [];    // functions (t, dt)
export const landmarks = [];   // minimap labels {x,z,name}
export const mapRects = [];    // minimap shapes {x,z,hx,hz,col} or {x,z,r,col}
export const zoneInfo = [];    // per main mission: {center, npcPos, face, itemPos:[3]}
export const sideInfo = [];    // per side mission: {npcPos, face, items:[]}
export const stopInfo = [];    // bus stops {pos, name}
export const cars = [], walkers = [];
export const STREETS = [-180, -120, -60, 0, 60, 120, 180];
export const MAP = { minX: -195, maxX: 432, minZ: -195, maxZ: 195 };
const CITY = 186, DES_X = 188, DES_MAX_X = 425, DES_Z = 122;
const UP = new THREE.Vector3(0, 1, 0);

/** Keep the player inside the city or the desert. */
export function clampWalk(p) {
  if (p.x > DES_X) {
    if (Math.abs(p.z) > DES_Z) { if (p.x - DES_X < Math.abs(p.z) - DES_Z) p.x = DES_X; else p.z = Math.sign(p.z) * DES_Z; }
    p.x = Math.min(p.x, DES_MAX_X);
  }
  p.x = Math.max(p.x, -CITY); p.z = THREE.MathUtils.clamp(p.z, -CITY, CITY);
}

// ---------- loading ----------
const loader = new GLTFLoader();
const cache = {};
let loadTotal = 0, loadDone = 0, onProgress = () => { };
export function setProgress(fn) { onProgress = fn; }
function load(url) {
  if (!cache[url]) {
    loadTotal++;
    cache[url] = new Promise(res => loader.load(url, g => { loadDone++; onProgress(loadDone / loadTotal); res(g); }, undefined, e => { loadDone++; console.warn('No se pudo cargar', url, e); res(null); }));
  }
  return cache[url];
}
const texLoader = new THREE.TextureLoader();
const VAR = {};
function variation(name) {
  if (!VAR[name]) { const t = texLoader.load(`assets/models/com/Textures/${name}.png`); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; VAR[name] = t; }
  return VAR[name];
}

// ---------- helpers ----------
let seed = 11;
export function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra });
function shadowize(o, cast = true) { o.traverse(m => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = true; } }); return o; }
function addBox(x, z, hx, hz, h, cam = true) { colliders.push({ x, z, hx, hz }); if (cam) camBlockers.push({ x, z, hx, hz, y0: 0, y1: h }); }
function plate(x, z, w, d, col, y = 0.02) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), M(col, { roughness: 1 })); m.position.set(x, y, z); m.receiveShadow = true; scene.add(m); return m; }
function box(x, y, z, w, h, d, col, extra) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(col, extra)); m.position.set(x, y, z); shadowize(m); scene.add(m); return m; }

/** Canvas texture with text (signs, screens). */
export function textTex(lines, { w = 512, h = 256, bg = '#111', fg = '#fff', font = 'Baloo 2', size = 90, stroke = null } = {}) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  const draw = (ls, opt = {}) => {
    c.fillStyle = opt.bg || bg; c.fillRect(0, 0, w, h);
    const L = Array.isArray(ls) ? ls : [ls], sz = opt.size || size;
    c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `800 ${sz}px "${font}", Nunito, sans-serif`;
    L.forEach((t, i) => { const y = h / 2 + (i - (L.length - 1) / 2) * sz * 1.05; if (stroke) { c.lineWidth = sz / 8; c.strokeStyle = stroke; c.strokeText(t, w / 2, y); } c.fillStyle = opt.fg || fg; c.fillText(t, w / 2, y); });
    tex.needsUpdate = true;
  };
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  tex.userData.draw = draw; tex.userData.ctx = c; tex.userData.cv = cv;
  draw(lines);
  return tex;
}
/** Flat sign facing direction ry. */
function sign(x, y, z, ry, w, h, lines, opt = {}) {
  const t = textTex(lines, opt);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide, toneMapped: false }));
  m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); return m;
}

/** Place one model. key = 'folder/name'. opt: h (height) or w (footprint), ry, y, r (circle collider), solid (box collider), tint, parent */
export async function prop(key, x, z, opt = {}) {
  const g = await load(`assets/models/${key}.glb`); if (!g) return null;
  const o = g.scene.clone(true);
  const bx = new THREE.Box3().setFromObject(o), size = bx.getSize(new THREE.Vector3());
  const s = opt.h ? opt.h / Math.max(size.y, 1e-3) : (opt.w || 1) / Math.max(size.x, size.z, 1e-3);
  o.scale.setScalar(s);
  const cx = (bx.min.x + bx.max.x) / 2 * s, cz = (bx.min.z + bx.max.z) / 2 * s;
  const ry = opt.ry ?? rnd() * Math.PI * 2, c = Math.cos(ry), sn = Math.sin(ry);
  o.position.set(x - (cx * c + cz * sn), (opt.y || 0) - bx.min.y * s, z - (-cx * sn + cz * c));
  o.rotation.y = ry;
  if (opt.tint) o.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.set(opt.tint); } });
  shadowize(o, opt.shadow !== false);
  (opt.parent || scene).add(o);
  if (opt.r) colliders.push({ x, z, r: opt.r });
  if (opt.solid) { const q = Math.abs(Math.sin(ry)) > 0.7; addBox(x, z, (q ? size.z : size.x) * s / 2, (q ? size.x : size.z) * s / 2, size.y * s, opt.cam !== false); }
  return o;
}

// ---------- instanced buildings ----------
const BLD = new Map();   // 'key|tex' -> [{x,z,ry,w,maxH,cb}]
function building(key, x, z, ry, w, opt = {}) { const k = `${key}|${opt.tex || ''}`; if (!BLD.has(k)) BLD.set(k, []); BLD.get(k).push({ x, z, ry, w, maxH: opt.maxH || 60, h: opt.h, cb: opt.cb }); }
async function flushBuildings() {
  const q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), m4 = new THREE.Matrix4(), off = new THREE.Matrix4();
  await Promise.all([...BLD.entries()].map(async ([k, list]) => {
    const [key, tex] = k.split('|');
    const g = await load(`assets/models/${key}.glb`); if (!g) return;
    const root = g.scene; root.updateMatrixWorld(true);
    const bx = new THREE.Box3().setFromObject(root), size = bx.getSize(new THREE.Vector3());
    const meshes = []; root.traverse(m => { if (m.isMesh) meshes.push(m); });
    list.forEach(p => {
      let s = p.h ? p.h / size.y : p.w / Math.max(size.x, size.z); if (size.y * s > p.maxH) s = p.maxH / size.y;
      p.s = s; p.top = size.y * s;
      const qd = Math.abs(Math.sin(p.ry)) > 0.7, hx = (qd ? size.z : size.x) * s / 2, hz = (qd ? size.x : size.z) * s / 2;
      addBox(p.x, p.z, hx, hz, p.top);
      if (p.cb) p.cb(p.top, hx, hz);
    });
    for (const mesh of meshes) {
      let mat = mesh.material;
      if (tex) { mat = mat.clone(); const t = variation(tex); if (mat.map) { t.wrapS = mat.map.wrapS; t.wrapT = mat.map.wrapT; } mat.map = t; }
      const im = new THREE.InstancedMesh(mesh.geometry, mat, list.length);
      im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
      list.forEach((p, i) => {
        off.makeTranslation(-(bx.min.x + bx.max.x) / 2, -bx.min.y, -(bx.min.z + bx.max.z) / 2);
        m4.compose(v.set(p.x, 0, p.z), q.setFromAxisAngle(UP, p.ry), sc.set(p.s, p.s, p.s)).multiply(off).multiply(mesh.matrixWorld);
        im.setMatrixAt(i, m4);
      });
      scene.add(im);
    }
  }));
}
/** Many copies of a small model in one draw call. list: [{x,z,h,ry}] */
async function scatter(key, list, opt = {}) {
  if (!list.length) return;
  const g = await load(`assets/models/${key}.glb`); if (!g) return;
  const root = g.scene; root.updateMatrixWorld(true);
  const bx = new THREE.Box3().setFromObject(root), sy = Math.max(bx.max.y - bx.min.y, 1e-3);
  const meshes = []; root.traverse(m => { if (m.isMesh) meshes.push(m); });
  const q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), mat = new THREE.Matrix4();
  list.forEach(p => { if (p.ry === undefined) p.ry = rnd() * Math.PI * 2; });
  for (const m of meshes) {
    const im = new THREE.InstancedMesh(m.geometry, m.material, list.length);
    im.castShadow = opt.shadow !== false; im.receiveShadow = true; im.frustumCulled = false;
    list.forEach((p, i) => { const s = p.h / sy; mat.compose(v.set(p.x, (p.y || 0) - bx.min.y * s, p.z), q.setFromAxisAngle(UP, p.ry), sc.set(s, s, s)).multiply(m.matrixWorld); im.setMatrixAt(i, mat); });
    scene.add(im);
  }
  if (opt.r) list.forEach(p => colliders.push({ x: p.x, z: p.z, r: opt.r * p.h / (opt.ref || p.h) }));
  if (opt.cam) list.forEach(p => camBlockers.push({ x: p.x, z: p.z, r: p.h * 0.3, y0: p.h * 0.35, y1: p.h * 1.05 }));
}

// ---------- characters (Kenney Blocky Characters, with their own animations) ----------
const charScale = {};
export async function makeChar(model, tint, height = 1.9) {
  const g = await load(`assets/chars/character-${model}.glb`);
  const inner = SkeletonUtils.clone(g.scene);
  if (!charScale[model]) { const bx = new THREE.Box3().setFromObject(g.scene); charScale[model] = height / Math.max(bx.max.y - bx.min.y, 1e-3); }
  inner.scale.setScalar(charScale[model] * height / 1.9);
  inner.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; if (m.material.map) m.material.map.magFilter = THREE.NearestFilter; if (tint) { m.material = m.material.clone(); m.material.color.set(tint).lerp(new THREE.Color('#ffffff'), 0.35); } } });
  const root = new THREE.Group(); root.add(inner);
  const mixer = new THREE.AnimationMixer(inner), actions = {};
  for (const clip of g.animations) actions[clip.name] = mixer.clipAction(clip);
  for (const k of ['pick-up', 'emote-yes', 'emote-no', 'interact-right', 'interact-left', 'attack-melee-right', 'attack-kick-right', 'die']) if (actions[k]) { actions[k].setLoop(THREE.LoopOnce); actions[k].clampWhenFinished = true; }
  const c = { root, inner, mixer, actions, cur: null, curName: '', lockUntil: 0 };
  c.play = (name, fade = 0.2, once = false) => {
    const a = actions[name]; if (!a || c.cur === a) return;
    a.reset().fadeIn(fade).play(); if (c.cur) c.cur.fadeOut(fade);
    c.cur = a; c.curName = name;
    if (once) c.lockUntil = performance.now() + a.getClip().duration * 1000 * 0.95;
  };
  c.play('idle', 0);
  return c;
}
/** A small phone with a glowing screen, held in front of the character. */
export function phoneFor(c, color = '#5ee7ff') {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.03), M('#1b1b22')));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.23), new THREE.MeshBasicMaterial({ color, toneMapped: false })); scr.position.z = -0.017; scr.rotation.y = Math.PI; g.add(scr);
  g.position.set(0.12, 1.05, 0.38); g.rotation.x = -0.9; c.root.add(g); return g;
}

// ---------- the world ----------
export const hype = { screens: [], ring: null, state: 'evil' };
const district = (x, z) => (Math.abs(x) < 56 && Math.abs(z) < 56) ? 'plaza' : x < 0 && z < 0 ? 'mall' : x > 0 && z < 0 ? 'pixel' : x < 0 ? 'factory' : 'suburb';
const COM = 'abcdefghijklmn'.split('').map(l => `com/building-${l}`), SKY = 'abcde'.split('').map(l => `com/building-skyscraper-${l}`);
const SUB = 'abcdfhjlos'.split('').map(l => `sub/building-type-${l}`);
const NEON = ['#ff3d8b', '#35e6ff', '#b45cff', '#ffe03d', '#3dff8b'];
const SLOGANS = [['#TRENDING'], ['BUY', 'NOW!'], ['LIKE ❤'], ['FOLLOW', 'ME'], ['MUST', 'HAVE!'], ['NEW', 'DROP'], ['SALE', '70%'], ['GO', 'VIRAL'], ['#OOTD'], ['DON\'T', 'MISS IT']];
const BLOCKS = [-150, -90, -30, 30, 90, 150];

export async function buildWorld() {
  scene.background = new THREE.Color('#9fd8ff');
  scene.fog = new THREE.Fog('#c9e8ff', 110, 330);
  scene.add(new THREE.HemisphereLight('#ffffff', '#6b7a5a', 1.15));
  const sun = new THREE.DirectionalLight('#fff3d6', 2.3);
  sun.position.set(30, 60, 20); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 160 }); sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target); scene.userData.sun = sun;

  // ground: grass outside, asphalt city, sand desert
  plate(120, 0, 1400, 1400, '#86b85a', -0.02);
  plate(0, 0, CITY * 2, CITY * 2, '#4a4d57', 0);
  mapRects.push({ x: 0, z: 0, hx: CITY, hz: CITY, col: '#5b5e68' });
  const sand = plate((DES_X + DES_MAX_X + 10) / 2, 0, DES_MAX_X - DES_X + 30, DES_Z * 2 + 30, '#e6c891', 0.005);
  mapRects.push({ x: (DES_X + DES_MAX_X + 10) / 2, z: 0, hx: (DES_MAX_X - DES_X + 30) / 2, hz: DES_Z + 15, col: '#e6c891' });
  // lane markings (dashed) and crosswalks
  const dash = [], cross = [];
  for (const s of STREETS) for (let t = -CITY + 2; t < CITY; t += 5) {
    if (s === 0 && Math.abs(t) < 56) continue;
    if (STREETS.some(o => Math.abs(o - t) < 7)) continue;
    dash.push([t, s, 0]); dash.push([s, t, Math.PI / 2]);
  }
  for (const a of STREETS) for (const b of STREETS) { if (Math.abs(a) < 56 && Math.abs(b) < 56) continue; for (let k = -2; k <= 2; k++) { cross.push([a + k * 2.2, b - 8.6, 0]); cross.push([a + k * 2.2, b + 8.6, 0]); cross.push([a - 8.6, b + k * 2.2, Math.PI / 2]); cross.push([a + 8.6, b + k * 2.2, Math.PI / 2]); } }
  const instFlat = (list, w, d, col) => { const im = new THREE.InstancedMesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), M(col, { roughness: 1 }), list.length); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(); list.forEach(([x, z, r], i) => im.setMatrixAt(i, m4.compose(new THREE.Vector3(x, 0.03, z), q.setFromAxisAngle(UP, r), new THREE.Vector3(1, 1, 1)))); im.receiveShadow = true; im.frustumCulled = false; scene.add(im); };
  instFlat(dash, 2.4, 0.22, '#f4f1e6'); instFlat(cross, 0.9, 4.5, '#f4f1e6');
  // highway to the desert
  plate(DES_X + 50, 0, 120, 12, '#4a4d57', 0.012);
  for (let x = CITY + 4; x < DES_X + 108; x += 5) dash.push([x, 0, 0]);
  instFlat(dash.filter(d => d[0] > CITY), 2.4, 0.22, '#ffd23a');
  plate(DES_X + 145, 0, 60, 8, '#c9a46a', 0.011);  // dirt road into the dump
  mapRects.push({ x: DES_X + 50, z: 0, hx: 60, hz: 6, col: '#5b5e68' });

  // the blocks
  const trees = [], lamps = [], benches = [], planters = [];
  for (const bx of BLOCKS) for (const bz of BLOCKS) {
    const d = district(bx, bz);
    const side = SIDE.find(s => s.pos[0] === bx && s.pos[1] === bz);
    const hub = (bx === 90 && bz === -90) || (bx === -90 && bz === -90) || (bx === -90 && bz === 90);
    if (d === 'plaza') continue;
    const col = { mall: '#d8cfc6', pixel: '#c9c6dc', factory: '#c8c9c4', suburb: '#d4d6cf' }[d];
    plate(bx, bz, 48, 48, col, 0.04);
    if (hub) continue;
    if (side && side.kind === 'park') { park(bx, bz, trees, benches); mapRects.push({ x: bx, z: bz, hx: 22, hz: 22, col: '#7fc35a' }); continue; }
    mapRects.push({ x: bx, z: bz, hx: 23, hz: 23, col: { mall: '#f0b483', pixel: '#a996f0', factory: '#9fd6c6', suburb: '#e9e2c9' }[d] });
    if (d === 'suburb') plate(bx, bz, 42, 42, '#8cc45f', 0.05);
    // four slots; the slot nearest the centre stays free for a side mission corner
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const x = bx + sx * 12.5, z = bz + sz * 12.5;
      const nearC = Math.sign(-bx) === sx && Math.sign(-bz) === sz;
      if (side && nearC) { miniPlaza(x, z, benches, planters); side._spot = { x, z, sx, sz }; continue; }
      const face = rnd() < 0.5 ? (sx > 0 ? Math.PI / 2 : -Math.PI / 2) : (sz > 0 ? 0 : Math.PI);
      if (d === 'suburb') {
        building(SUB[Math.floor(rnd() * SUB.length)], x, z, face, 12 + rnd() * 2);
        trees.push({ x: x + sx * 8, z: z - sz * 7, h: 5 + rnd() * 2, k: 'sub/tree-large' });
      } else if (d === 'factory' && rnd() < 0.5) {
        warehouse(x, z, 16, 10 + rnd() * 4, 7 + rnd() * 3, ['#9aa3ad', '#b4876a', '#7f9a8c', '#a8a07a'][Math.floor(rnd() * 4)]);
      } else {
        const tall = d === 'pixel' ? 0.55 : Math.hypot(bx, bz) < 140 ? 0.35 : 0.15;
        const key = rnd() < tall ? SKY[Math.floor(rnd() * SKY.length)] : COM[Math.floor(rnd() * COM.length)];
        const tex = d === 'mall' ? 'variation-b' : d === 'factory' ? 'variation-a' : '';
        const neon = d === 'pixel' || (d === 'mall' && rnd() < 0.35);
        building(key, x, z, face, 15 + rnd() * 3, { tex, maxH: 58, cb: neon ? (top, hx, hz) => roofSign(x, z, top, face, hx, hz) : null });
      }
    }
    // street lamps and trees on the sidewalk
    for (const [lx, lz, r] of [[bx - 23, bz - 23, Math.PI / 4], [bx + 23, bz + 23, -3 * Math.PI / 4]]) lamps.push({ x: lx, z: lz, ry: r });
    if (d !== 'suburb') for (const k of [-1, 1]) { trees.push({ x: bx + k * 6, z: bz + 22.6, h: 4.5, k: 'nat/tree_default' }); trees.push({ x: bx + 22.6, z: bz + k * 6, h: 4.5, k: 'nat/tree_default' }); }
  }

  await buildPlaza(trees, benches, lamps);
  await buildPixel(); await buildMall(); await buildFactory();
  await buildDesert();
  buildSkyline();
  await flushBuildings();
  // shared small props
  const byK = {}; trees.forEach(t => (byK[t.k] ||= []).push(t));
  await Promise.all(Object.entries(byK).map(([k, l]) => scatter(k, l, { r: 0.6, cam: true })));
  await scatter('road/light-square', lamps.map(l => ({ ...l, h: 5.5 })), { r: 0.3 });
  await scatter('fur/bench', benches.map(b => ({ ...b, h: 0.9 })), { r: 0.8 });
  await scatter('sub/planter', planters.map(b => ({ ...b, h: 0.7 })), { r: 0.9 });
  for (const s of STOPS) busStop(s);
  // clouds
  for (let i = 0; i < 18; i++) { const c = cloud(); c.position.set(-250 + rnd() * 700, 55 + rnd() * 20, -250 + rnd() * 500); const sp = 1 + rnd() * 2; animated.push((t, dt) => { c.position.x += dt * sp; if (c.position.x > 480) c.position.x = -260; }); }
}

function cloud() { const g = new THREE.Group(); for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(4 + rnd() * 4, 0), M('#ffffff', { roughness: 1 })); s.position.set(k * 5 - 10, rnd() * 2, rnd() * 4); s.scale.y = 0.6; g.add(s); } scene.add(g); return g; }

function park(bx, bz, trees, benches) {
  plate(bx, bz, 44, 44, '#7fc35a', 0.05);
  const path1 = plate(bx, bz, 44, 3.4, '#e7d6b3', 0.06), path2 = plate(bx, bz, 3.4, 44, '#e7d6b3', 0.06);
  for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2 + 0.2, r = 17 + rnd() * 3; const x = bx + Math.cos(a) * r, z = bz + Math.sin(a) * r; if (Math.abs(x - bx) < 3 || Math.abs(z - bz) < 3) continue; trees.push({ x, z, h: 5 + rnd() * 3, k: k % 3 ? 'nat/tree_oak' : 'nat/tree_default' }); }
  for (const [dx, dz, r] of [[-6, 3.5, Math.PI], [6, -3.5, 0], [3.5, 6, -Math.PI / 2], [-3.5, -6, Math.PI / 2]]) benches.push({ x: bx + dx, z: bz + dz, ry: r });
  // flower beds
  for (const [dx, dz] of [[-10, -10], [10, 10], [-10, 10], [10, -10]]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.5, 12), M('#7a5532')); f.position.set(bx + dx, 0.25, bz + dz); scene.add(f); colliders.push({ x: bx + dx, z: bz + dz, r: 2.6 }); for (let k = 0; k < 9; k++) { const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 0), M(NEON[k % 5], { emissive: NEON[k % 5], emissiveIntensity: 0.15 })); fl.position.set(bx + dx + (rnd() - .5) * 3.4, 0.7, bz + dz + (rnd() - .5) * 3.4); scene.add(fl); } }
}
function miniPlaza(x, z, benches, planters) {
  plate(x, z, 22, 22, '#e9dcc8', 0.05);
  planters.push({ x: x - 6, z: z - 6 }, { x: x + 6, z: z + 6 });
  benches.push({ x: x + 6, z: z - 6, ry: 0 });
}
function warehouse(x, z, w, d, h, col) {
  box(x, h / 2, z, w, h, d, col);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(d / 2, d / 2, w, 10, 1, false, 0, Math.PI), M('#6d7178')); roof.rotation.z = Math.PI / 2; roof.position.set(x, h, z); roof.scale.set(1, 1, 0.5); shadowize(roof); scene.add(roof);
  for (const s of [-1, 1]) box(x + s * w * 0.25, 1.8, z + d / 2 + 0.05, 3.6, 3.6, 0.1, '#5b5f66');
  addBox(x, z, w / 2, d / 2, h + d / 4);
}
function roofSign(x, z, top, face, hx, hz) {
  const col = NEON[Math.floor(rnd() * NEON.length)], txt = SLOGANS[Math.floor(rnd() * SLOGANS.length)];
  const fx = Math.sin(face), fz = Math.cos(face);
  const w = 9, h = 4.2;
  const s = sign(x + fx * Math.min(hx, hz) * 0.4, top + h / 2 + 0.6, z + fz * Math.min(hx, hz) * 0.4, face, w, h, txt, { bg: '#120a24', fg: col, size: txt.length > 1 ? 96 : 120, w: 512, h: 240 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, h + 0.4, 0.2), M('#22183a')); frame.position.copy(s.position); frame.position.x -= fx * 0.12; frame.position.z -= fz * 0.12; frame.rotation.y = face; scene.add(frame);
  const ph = rnd() * 6; animated.push(t => { s.material.color.setScalar(0.75 + 0.25 * Math.sin(t * 4 + ph)); });
}
function busStop(st) {
  const g = new THREE.Group();
  const roof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.2, 1.8), M('#2f6fe0')); roof.position.y = 2.7; g.add(roof);
  for (const dx of [-1.9, 1.9]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.7, 0.12), M('#d0d4da')); p.position.set(dx, 1.35, -0.7); g.add(p); }
  const back = new THREE.Mesh(new THREE.BoxGeometry(4, 1.8, 0.08), M('#bfe6ff', { transparent: true, opacity: 0.5 })); back.position.set(0, 1.5, -0.8); g.add(back);
  const bench = new THREE.Mesh(new THREE.BoxGeometry(3, 0.12, 0.5), M('#7a5230')); bench.position.set(0, 0.55, -0.45); g.add(bench);
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ map: textTex(['🚌', 'BUS'], { w: 256, h: 256, bg: '#2f6fe0', size: 80 }), toneMapped: false })); sg.position.set(2.4, 2.9, 0); g.add(sg);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3), M('#d0d4da')); pole.position.set(2.4, 1.5, 0); g.add(pole);
  g.position.set(st.x, 0, st.z); g.rotation.y = st.x > 200 ? Math.PI : Math.atan2(-st.x, -st.z);
  shadowize(g); scene.add(g); colliders.push({ x: st.x, z: st.z, r: 1.2 });
  stopInfo.push({ name: st.name, pos: new THREE.Vector3(st.x, 0, st.z), g });
  landmarks.push({ x: st.x, z: st.z, name: '🚌', bus: true });
}

// ---------- Hype Square (centre) ----------
async function buildPlaza(trees, benches, lamps) {
  plate(0, 0, 112, 112, '#ead9c4', 0.05);
  mapRects.push({ x: 0, z: 0, hx: 56, hz: 56, col: '#f3dcc7' });
  const ring = new THREE.Mesh(new THREE.RingGeometry(20, 22, 48).rotateX(-Math.PI / 2), M('#ff3d8b', { emissive: '#ff3d8b', emissiveIntensity: 0.3 })); ring.position.y = 0.07; scene.add(ring);
  for (let k = 0; k < 4; k++) { const p = plate(0, 0, 3, 112, '#d7c2aa', 0.06); p.rotation.y = k * Math.PI / 4; }
  // Trend Tower
  building('com/building-skyscraper-e', 0, 0, 0, 15, { maxH: 72, cb: (top, hx, hz) => {
    const tower = new THREE.Group(); scene.add(tower);
    const sz = Math.min(hx, hz) * 2 * 0.95;
    for (let k = 0; k < 4; k++) {
      const t = textTex(['HYPE'], { w: 512, h: 512, bg: '#14092b', fg: '#ff3d8b', size: 150 });
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
      const a = k * Math.PI / 2, d = (k % 2 ? hx : hz) + 0.4; scr.position.set(Math.sin(a) * d, top * 0.72, Math.cos(a) * d); scr.rotation.y = a; tower.add(scr);
      hype.screens.push({ mesh: scr, tex: t });
    }
    const holo = textTex(['#TRENDING  •  BUY NOW  •  #MUSTHAVE  •  FOLLOW  •  #VIRAL  •  '], { w: 2048, h: 128, bg: 'rgba(0,0,0,0)', fg: '#35e6ff', size: 80 });
    holo.wrapS = THREE.RepeatWrapping;
    const R = Math.hypot(hx, hz) + 3;
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 4, 48, 1, true), new THREE.MeshBasicMaterial({ map: holo, transparent: true, side: THREE.DoubleSide, toneMapped: false, depthWrite: false })); cyl.position.y = top * 0.45; scene.add(cyl);
    hype.ring = cyl;
    animated.push((t, dt) => { cyl.rotation.y += dt * 0.25; });
  } });
  landmarks.push({ x: 0, z: 0, name: 'Trend Tower' });
  // fountains
  for (const fx of [-32, 32]) {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(5, 5.4, 0.9, 24), M('#c7c1b8')); b.position.set(fx, 0.45, 32); shadowize(b); scene.add(b);
    const w = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 0.2, 24), M('#4fc3f7', { roughness: 0.2, emissive: '#1a6f9a', emissiveIntensity: 0.3 })); w.position.set(fx, 0.85, 32); scene.add(w);
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.6, 3.5, 8), M('#bfefff', { transparent: true, opacity: 0.7 })); jet.position.set(fx, 2.5, 32); scene.add(jet);
    animated.push(t => { jet.scale.y = 1 + Math.sin(t * 5 + fx) * 0.15; });
    colliders.push({ x: fx, z: 32, r: 5.6 });
  }
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + 0.1; const x = Math.cos(a) * 47, z = Math.sin(a) * 47; if (Math.abs(x) < 6 || Math.abs(z) < 6) continue; trees.push({ x, z, h: 6, k: 'nat/tree_oak' }); }
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; benches.push({ x: Math.cos(a) * 26, z: Math.sin(a) * 26, ry: -a - Math.PI / 2 }); lamps.push({ x: Math.cos(a) * 30, z: Math.sin(a) * 30, ry: -a }); }
  // giant billboard (Poly Pizza, CC-BY)
  await prop('pp/cartel-publicitario', -40, -40, { h: 9, ry: Math.PI / 4, r: 2.5 });
  await prop('pp/cartel-publicitario', 40, -40, { h: 9, ry: -Math.PI / 4, r: 2.5 });
  zoneInfo[0] = { center: new THREE.Vector3(0, 0, 0), npcPos: new THREE.Vector3(7, 0, 33), face: 0, itemPos: [[-38, -12], [40, -18], [-12, -44]].map(([x, z]) => new THREE.Vector3(x, 0, z)) };
}

// ---------- Pixel District hub (social media) ----------
async function buildPixel() {
  const cx = 90, cz = -90;
  plate(cx, cz, 48, 48, '#241c46', 0.05);
  mapRects.push({ x: cx, z: cz, hx: 23, hz: 23, col: '#5b3fd6' });
  // neon grid
  for (let k = -4; k <= 4; k++) { const a = plate(cx + k * 5, cz, 0.15, 46, '#b45cff', 0.06); a.material.emissive = new THREE.Color('#b45cff'); a.material.emissiveIntensity = 0.8; const b = plate(cx, cz + k * 5, 46, 0.15, '#35e6ff', 0.06); b.material.emissive = new THREE.Color('#35e6ff'); b.material.emissiveIntensity = 0.8; }
  // giant phone
  const ph = new THREE.Group(); ph.position.set(cx, 0, cz - 12); scene.add(ph);
  const body = new THREE.Mesh(new THREE.BoxGeometry(8, 15, 1.2), M('#15151c', { roughness: 0.3 })); body.position.y = 8.5; ph.add(body);
  const feed = textTex(['❤ 1.2M', '#TRENDING'], { w: 512, h: 900, bg: '#ff3d8b', size: 90 });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(7, 13.2), new THREE.MeshBasicMaterial({ map: feed, toneMapped: false })); scr.position.set(0, 8.5, 0.61); ph.add(scr);
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3, 1, 16), M('#3a3550')); stand.position.y = 0.5; ph.add(stand);
  shadowize(ph); addBox(cx, cz - 12, 4, 1.5, 16);
  const posts = [['❤ 1.2M', '#TRENDING', '#ff3d8b'], ['😍 LOOK', 'AT ME', '#b45cff'], ['📈 +5K', 'FOLLOWERS', '#1fb5a8'], ['🔥 NEW', 'CHALLENGE', '#ff8a1f']];
  let pi = 0; setInterval(() => { pi = (pi + 1) % posts.length; const p = posts[pi]; feed.userData.draw([p[0], p[1]], { bg: p[2] }); }, 2500);
  // floating hearts
  const hearts = [];
  for (let k = 0; k < 14; k++) { const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTex('❤', { w: 128, h: 128, bg: 'rgba(0,0,0,0)', fg: '#ff3d8b', size: 100 }), transparent: true, depthWrite: false })); h.userData.o = rnd(); h.userData.x = (rnd() - .5) * 10; scene.add(h); hearts.push(h); }
  animated.push(t => hearts.forEach(h => { const k = (t * 0.15 + h.userData.o) % 1; h.position.set(cx + h.userData.x, 4 + k * 22, cz - 12 + Math.sin(k * 8) * 1.5); h.scale.setScalar(1.2 + k); h.material.opacity = 1 - k; }));
  // neon arches
  for (const [ax, az, r] of [[cx, cz + 22, 0], [cx - 22, cz, Math.PI / 2]]) { for (const [k, col] of [[0, '#35e6ff'], [1, '#ff3d8b']]) { const a = new THREE.Mesh(new THREE.TorusGeometry(6 - k * 0.7, 0.25, 8, 30, Math.PI), M(col, { emissive: col, emissiveIntensity: 1.2 })); a.position.set(ax, 0, az); a.rotation.y = r; scene.add(a); } colliders.push({ x: ax + (r ? 0 : -6), z: az + (r ? -6 : 0), r: 0.4 }, { x: ax + (r ? 0 : 6), z: az + (r ? 6 : 0), r: 0.4 }); }
  // desks of content creators
  for (const [dx, dz] of [[-14, -14], [14, -14]]) { await prop('fur/desk', cx + dx, cz + dz, { w: 2.4, ry: 0, solid: true, cam: false }); await prop('fur/computerScreen', cx + dx, cz + dz - 0.2, { h: 0.6, ry: 0, y: 0.78 }); await prop('fur/chairDesk', cx + dx, cz + dz + 1.2, { h: 1.1, ry: Math.PI }); }
  for (const [dx, dz] of [[-17, 8], [17, 8]]) await prop('fur/speaker', cx + dx, cz + dz, { h: 2.2, r: 0.8 });
  sign(cx, 6.5, cz + 22.3, 0, 10, 2.2, ['PIXEL DISTRICT'], { w: 1024, h: 220, bg: '#120a24', fg: '#35e6ff', size: 120 });
  landmarks.push({ x: cx, z: cz, name: 'Pixel District' });
  zoneInfo[1] = { center: new THREE.Vector3(cx, 0, cz), npcPos: new THREE.Vector3(cx + 4, 0, cz + 8), face: 0, itemPos: [[cx - 16, cz - 2], [cx + 16, cz - 4], [cx + 2, cz - 22]].map(([x, z]) => new THREE.Vector3(x, 0, z)) };
}

// ---------- Mega Mall hub (consumption) ----------
async function buildMall() {
  const cx = -90, cz = -90;
  plate(cx, cz + 6, 46, 30, '#efe4d6', 0.05);
  mapRects.push({ x: cx, z: cz, hx: 23, hz: 23, col: '#ff9f4a' });
  const mz = cz - 13; // mall building: front face at z = cz - 4
  box(cx, 7, mz, 44, 14, 18, '#f0eee9');
  box(cx, 14.6, mz, 45, 1.2, 19, '#ff8a1f');
  addBox(cx, mz, 22, 9, 15);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(40, 8), M('#8fd3ff', { emissive: '#3a9ad9', emissiveIntensity: 0.35, roughness: 0.1, metalness: 0.3 })); glass.position.set(cx, 5, mz + 9.02); scene.add(glass);
  for (let k = -4; k <= 4; k++) box(cx + k * 5, 5, mz + 9.08, 0.3, 8, 0.15, '#d9d6cf');
  sign(cx, 11.8, mz + 9.1, 0, 22, 3.6, ['MEGA MALL'], { w: 1024, h: 168, bg: '#ff8a1f', fg: '#fff', size: 120 });
  for (const [dx, txt, col] of [[-16, ['SALE', '70%'], '#e2408f'], [16, ['NEW', 'EVERY WEEK'], '#7b5cff']]) sign(cx + dx, 11.8, mz + 9.1, 0, 7, 3.6, txt, { w: 400, h: 200, bg: col, size: 70 });
  for (let k = -3; k <= 3; k += 2) await prop('com/detail-awning-wide', cx + k * 5.5, mz + 9.4, { w: 5.2, ry: 0, y: 7.6 });
  // plaza in front
  for (let k = 0; k < 4; k++) await prop('pp/maniqui', cx - 15 + k * 10, cz + 1, { h: 2, ry: 0, r: 0.6 });
  for (const [dx, dz] of [[-10, 8], [10, 8], [0, 14]]) clothesRack(cx + dx, cz + dz);
  await prop('pp/colgador', cx - 4, cz + 3.6, { h: 0.5, ry: 0, y: 0.8 });
  for (const [dx, dz] of [[-18, 14], [18, 14]]) await prop('com/detail-parasol-a', cx + dx, cz + dz, { h: 3, ry: 0, r: 0.5 });
  for (let k = 0; k < 5; k++) await prop('mkt/shopping-cart', cx - 20 + rnd() * 40, cz + 18 + rnd() * 3, { h: 1.1, r: 0.6 });
  await prop('pp/poleras-dos-pilas', cx - 4, cz + 3, { h: 0.8, ry: 0, y: 0 });
  await prop('pp/cartel-publicitario', cx + 19, cz - 1, { h: 8, ry: -Math.PI / 2, r: 2 });
  // bags people bought (piles)
  for (let k = 0; k < 14; k++) { const c = NEON[k % 5]; const b = box(cx - 20 + rnd() * 40, 0.35, cz + 20 + rnd() * 3, 0.6, 0.7, 0.3, c); b.rotation.y = rnd() * 3; }
  landmarks.push({ x: cx, z: cz, name: 'Mega Mall' });
  zoneInfo[2] = { center: new THREE.Vector3(cx, 0, cz), npcPos: new THREE.Vector3(cx + 3, 0, cz + 10), face: 0, itemPos: [[cx - 20, cz + 6], [cx + 21, cz + 9], [cx - 58 + 28, cz - 26]].map(([x, z]) => new THREE.Vector3(x, 0, z)) };
}

// ---------- Factory Row hub (labour) ----------
async function buildFactory() {
  const cx = -90, cz = 90;
  plate(cx, cz - 6, 46, 30, '#bfc2bd', 0.05);
  mapRects.push({ x: cx, z: cz, hx: 23, hz: 23, col: '#2fb6a3' });
  const fz = cz + 13;
  box(cx, 6, fz, 44, 12, 18, '#8e9aa3');
  for (let k = -2; k <= 2; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(8, 2.4, 18.4), M('#6b737b')); r.position.set(cx + k * 8.6, 13, fz); r.rotation.z = 0.35; shadowize(r); scene.add(r); }
  addBox(cx, fz, 22, 9, 14);
  for (const dx of [-15, 15]) { const ch = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.3, 10, 10), M('#a35b4a')); ch.position.set(cx + dx, 17, fz + 4); shadowize(ch); scene.add(ch); puffs(cx + dx, 22, fz + 4); }
  sign(cx, 10, fz - 9.1, Math.PI, 26, 3.2, ['FASTFASHION Co.'], { w: 1024, h: 128, bg: '#2b2f36', fg: '#ffd23a', size: 100 });
  sign(cx - 14, 4, fz - 9.1, Math.PI, 7, 2.6, ['SHIFT:', '14 HOURS'], { w: 400, h: 150, bg: '#d9433b', size: 56 });
  sign(cx + 14, 4, fz - 9.1, Math.PI, 7, 2.6, ['NO', 'UNIONS!'], { w: 400, h: 150, bg: '#2b2f36', fg: '#ff6b5e', size: 60 });
  await prop('fac/door-wide-closed', cx, fz - 9.1, { h: 5, ry: Math.PI });
  // outdoor workshop under a roof
  const roof = box(cx, 3.4, cz - 2, 20, 0.25, 8, '#5f6b74');
  for (const [dx, dz] of [[-9.5, -5.5], [9.5, -5.5], [-9.5, 1.5], [9.5, 1.5]]) { box(cx + dx, 1.7, cz + dz, 0.25, 3.4, 0.25, '#4b5258'); colliders.push({ x: cx + dx, z: cz + dz, r: 0.3 }); }
  for (let k = 0; k < 4; k++) { const x = cx - 7.5 + k * 5; await prop('fur/desk', x, cz - 2, { w: 2.2, ry: Math.PI, solid: true, cam: false }); await prop('pp/maquina-de-coser', x, cz - 2, { h: 0.55, ry: Math.PI, y: 0.76 }); }
  await prop('fac/conveyor-long-sides', cx - 14, cz - 14, { w: 8, ry: Math.PI / 2, solid: true, cam: false });
  await prop('fac/conveyor-long-sides', cx + 14, cz - 14, { w: 8, ry: Math.PI / 2, solid: true, cam: false });
  for (let k = 0; k < 10; k++) await prop(k % 2 ? 'fac/box-small' : 'fac/box-large', cx - 20 + rnd() * 6, cz + 1 + rnd() * 2, { h: 0.8 + rnd() * 0.5 });
  await prop('car/truck', cx + 19, cz - 2, { w: 7, ry: 0, solid: true });
  await prop('road/dumpster', cx - 20, cz - 16, { h: 1.6, ry: Math.PI / 2, r: 1.2 });
  landmarks.push({ x: cx, z: cz, name: 'Factory Row' });
  zoneInfo[3] = { center: new THREE.Vector3(cx, 0, cz), npcPos: new THREE.Vector3(cx + 3, 0, cz - 14), face: Math.PI, itemPos: [[cx - 20, cz - 8], [cx + 19, cz - 13], [cx - 2, cz - 24]].map(([x, z]) => new THREE.Vector3(x, 0, z)) };
}
function clothesRack(x, z) {
  const g = new THREE.Group();
  for (const dx of [-1.6, 1.6]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.9, 6), M('#c9ccd2')); p.position.set(dx, 0.95, 0); g.add(p); }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.4, 6), M('#c9ccd2')); bar.rotation.z = Math.PI / 2; bar.position.y = 1.85; g.add(bar);
  for (let k = 0; k < 7; k++) { const c = NEON[(k + Math.floor(x)) % 5]; const sh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 0.7), M(c)); sh.position.set(-1.35 + k * 0.45, 1.3, 0); g.add(sh); }
  g.position.set(x, 0, z); shadowize(g); scene.add(g); colliders.push({ x, z, hx: 1.8, hz: 0.5 });
}
function puffs(x, y, z) {
  const g = new THREE.Group(); scene.add(g);
  for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 5), M('#8d8d93', { transparent: true, opacity: 0.6 })); p.userData.o = i / 6; g.add(p); }
  animated.push(t => g.children.forEach(p => { const k = (t * 0.25 + p.userData.o) % 1; p.position.set(x + k * 4, y + k * 8, z); p.scale.setScalar(0.8 + k * 2.5); p.material.opacity = 0.6 * (1 - k); }));
}

// ---------- Atacama Desert ----------
export const piles = [];
async function buildDesert() {
  // dunes and cliffs around the edge
  for (let k = 0; k < 40; k++) {
    const side = k % 3, x = side === 0 ? DES_MAX_X + 10 + rnd() * 20 : DES_X + 20 + rnd() * (DES_MAX_X - DES_X), z = side === 0 ? (rnd() - .5) * 260 : (side === 1 ? 1 : -1) * (DES_Z + 10 + rnd() * 15);
    const d = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(['#e2bf86', '#d9b079', '#eccf9c'][k % 3])); d.position.set(x, 0, z); d.scale.set(14 + rnd() * 16, 6 + rnd() * 10, 12 + rnd() * 14); shadowize(d); scene.add(d);
  }
  for (let k = 0; k < 12; k++) { const x = DES_X + 30 + rnd() * 200, z = (rnd() < .5 ? -1 : 1) * (40 + rnd() * 75); if (Math.abs(x - 345) < 40 && Math.abs(z) < 70) continue; const d = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M('#e0bd84')); d.position.set(x, 0, z); d.scale.set(7 + rnd() * 6, 1.6 + rnd() * 1.5, 6 + rnd() * 5); scene.add(d); colliders.push({ x, z, r: 5.5 }); }
  // ZOFRI container yard
  const zx = 245, zz = -72;
  plate(zx, zz, 60, 50, '#8c8f96', 0.02);
  mapRects.push({ x: zx, z: zz, hx: 30, hz: 25, col: '#8c8f96' });
  const cc = ['#d9433b', '#2f6fe0', '#2ea64f', '#ff8a1f', '#7b5cff', '#e0a53a'];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) {
    const x = zx - 22 + c * 11, z = zz - 15 + r * 9, n = 1 + Math.floor(rnd() * 3);
    for (let k = 0; k < n; k++) box(x, 1.3 + k * 2.6, z, 8, 2.6, 3.2, cc[(r * 5 + c + k) % 6]);
    addBox(x, z, 4, 1.6, n * 2.6);
  }
  await prop('fac/crane', zx + 24, zz - 18, { h: 16, ry: Math.PI, r: 2 });
  sign(zx, 4.2, zz + 26, 0, 16, 3, ['ZOFRI · FREE TRADE ZONE'], { w: 1024, h: 192, bg: '#1f3f8f', size: 80 });
  for (const dx of [-7.5, 7.5]) { box(zx + dx, 1.4, zz + 26, 0.3, 2.8, 0.3, '#ccc'); }
  landmarks.push({ x: zx, z: zz, name: 'ZOFRI (Iquique)' });
  // welcome sign
  sign(DES_X + 8, 4, 12, -Math.PI / 2, 10, 3, ['ALTO HOSPICIO', 'ATACAMA DESERT'], { w: 640, h: 192, bg: '#2ea64f', size: 64 });
  box(DES_X + 8, 1.2, 9, 0.25, 2.4, 0.25, '#ddd'); box(DES_X + 8, 1.2, 15, 0.25, 2.4, 0.25, '#ddd');
  // clothing mountains
  const P = [[345, 0, 16, 9], [372, -45, 12, 7], [374, 46, 13, 8], [318, 54, 9, 5], [300, -52, 10, 6], [400, 4, 11, 7], [338, -88, 8, 5], [342, 90, 8, 4], [410, -70, 9, 5], [408, 78, 9, 5]];
  const cols = ['#2f6fe0', '#d9433b', '#ffd23a', '#2ea64f', '#ff6fa8', '#ffffff', '#222831', '#7b5cff', '#8a5a3c', '#35e6ff', '#ff8a1f', '#9aa3ad'].map(c => new THREE.Color(c));
  let total = 0; P.forEach(p => total += Math.round(p[2] * p[2] * 4.2));
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 0.3, 0.9), M('#ffffff'), total); im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(); let n = 0;
  for (const [x, z, r, h] of P) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(r, h, 14), M('#7d6f78')); cone.position.set(x, h / 2 - 0.2, z); shadowize(cone); scene.add(cone);
    const N = Math.round(r * r * 4.2);
    for (let k = 0; k < N; k++) {
      const rho = Math.sqrt(rnd()) * r, a = rnd() * Math.PI * 2, y = Math.max(0.1, h * (1 - rho / r)) + 0.05;
      m4.compose(new THREE.Vector3(x + Math.cos(a) * rho, y, z + Math.sin(a) * rho), q.setFromEuler(e.set((rnd() - .5) * 0.9, rnd() * 6, (rnd() - .5) * 0.9)), new THREE.Vector3(0.8 + rnd() * 0.9, 1, 0.8 + rnd() * 0.8));
      im.setMatrixAt(n, m4); im.setColorAt(n, cols[Math.floor(rnd() * cols.length)]); n++;
    }
    colliders.push({ x, z, r: r * 0.92 }); camBlockers.push({ x, z, r: r * 0.7, y0: 0, y1: h * 0.8 });
    piles.push({ x, z, r }); mapRects.push({ x, z, r, col: '#b07ca8' });
  }
  scene.add(im);
  landmarks.push({ x: 360, z: 0, name: 'Clothing mountains' });
  // cacti and rocks
  const cact = [], rocks = [];
  for (let k = 0; k < 260; k++) {
    const x = DES_X + 6 + rnd() * (DES_MAX_X - DES_X - 6), z = (rnd() - .5) * DES_Z * 2;
    if (Math.abs(z) < 9 && x < DES_X + 175) continue;
    if (P.some(p => Math.hypot(p[0] - x, p[1] - z) < p[2] + 4)) continue;
    if (Math.abs(x - zx) < 34 && Math.abs(z - zz) < 30) continue;
    if (Math.hypot(x - 300, z - 10) < 14 || Math.hypot(x - 255, z - 34) < 22) continue;
    (k % 3 ? rocks : cact).push({ x, z, h: k % 3 ? 0.6 + rnd() * 1.4 : 1.6 + rnd() * 2.2 });
  }
  await scatter('nat/cactus_tall', cact.filter((_, i) => i % 2), { r: 0.5 }); await scatter('nat/cactus_short', cact.filter((_, i) => !(i % 2)), { r: 0.5 });
  await scatter('nat/stone_largeB', rocks, { shadow: false });
  // garbage truck dumping
  await prop('car/garbage-truck', 322, -14, { w: 7, ry: Math.PI / 2 + 0.4, solid: true });
  // Camila's camp
  const tent = new THREE.Mesh(new THREE.ConeGeometry(3.4, 3.2, 4), M('#2ea64f')); tent.position.set(292, 1.6, 2); tent.rotation.y = Math.PI / 4; shadowize(tent); scene.add(tent); colliders.push({ x: 292, z: 2, r: 2.6 });
  await prop('fur/tableRound', 300, 2, { h: 0.8, r: 0.8 });
  sign(304, 2.6, 4, -Math.PI / 2 + 0.3, 5, 2, ['STOP', 'FAST FASHION'], { w: 400, h: 160, bg: '#e0a53a', size: 54 });
  landmarks.push({ x: 300, z: 6, name: 'Activists\' camp' });
  zoneInfo[4] = { center: new THREE.Vector3(330, 0, 0), npcPos: new THREE.Vector3(299, 0, 9), face: -Math.PI / 2, itemPos: [[318, -26], [361, 22], [354, -64]].map(([x, z]) => new THREE.Vector3(x, 0, z)) };
}

function buildSkyline() {
  const L = 'abcdefgh'.split('').map(l => `com/low-detail-building-${l}`);
  for (let k = 0; k < 70; k++) {
    const t = k / 70, edge = Math.floor(t * 4), u = (t * 4 % 1) * 2 - 1;
    let x, z;
    if (edge === 0) { x = u * 215; z = -212 - rnd() * 20; } else if (edge === 1) { x = u * 215; z = 212 + rnd() * 20; } else if (edge === 2) { x = -212 - rnd() * 20; z = u * 215; } else { x = 160 + u * 30 + 30; z = (rnd() < .5 ? -1 : 1) * (212 + rnd() * 20); }
    building(L[k % L.length], x, z, Math.floor(rnd() * 4) * Math.PI / 2, 16 + rnd() * 8, { maxH: 70 });
  }
}

// ---------- traffic and pedestrians ----------
export async function buildTraffic() {
  const models = ['car/sedan', 'car/taxi', 'car/suv', 'car/van', 'car/delivery', 'car/hatchback-sports', 'car/police'];
  let i = 0;
  for (const s of STREETS) {
    if (s === 0) continue;
    for (const dir of [1, -1]) for (const axis of ['x', 'z']) {
      const key = models[i++ % models.length];
      const o = await prop(key, 0, 0, { w: 4.4, ry: 0, shadow: true });
      if (!o) continue;
      const wrap = new THREE.Group(); scene.remove(o); wrap.add(o); o.position.set(0, o.position.y, 0); scene.add(wrap);
      const c = { g: wrap, axis, dir, lane: s + dir * 3 * (axis === 'x' ? 1 : -1), t: (rnd() - .5) * 2 * CITY, speed: 9 + rnd() * 5, v: 0 };
      wrap.rotation.y = axis === 'x' ? (dir > 0 ? Math.PI / 2 : -Math.PI / 2) : (dir > 0 ? 0 : Math.PI);
      cars.push(c);
    }
  }
  // pedestrians glued to their phones
  const ped = ['l', 'l', 'l', 'o', 'b', 'k', 'q', 'e', 'm', 'f'];
  const tints = ['#9aa7ff', '#b3b3c8', null, '#c8a8ff'];
  const blocks = []; for (const bx of BLOCKS) for (const bz of BLOCKS) if (!(Math.abs(bx) < 56 && Math.abs(bz) < 56)) blocks.push([bx, bz]);
  for (let k = 0; k < 26; k++) {
    const [bx, bz] = blocks[Math.floor(rnd() * blocks.length)];
    const c = await makeChar(ped[k % ped.length], tints[k % tints.length]);
    const phone = phoneFor(c);
    c.play('walk', 0);
    scene.add(c.root);
    walkers.push({ c, phone, bx, bz, t: rnd() * 4, sp: (0.9 + rnd() * 0.5) * (rnd() < .5 ? 1 : -1), off: 23.6 });
  }
}
/** Point on the sidewalk loop around a block. t in [0,4). */
export function loopAt(w) {
  const t = ((w.t % 4) + 4) % 4, s = Math.floor(t), f = t - s, o = w.off;
  const pts = [[-o, -o], [o, -o], [o, o], [-o, o], [-o, -o]];
  const [x1, z1] = pts[s], [x2, z2] = pts[s + 1];
  return [w.bx + x1 + (x2 - x1) * f, w.bz + z1 + (z2 - z1) * f, Math.atan2(x2 - x1, z2 - z1) + (w.sp < 0 ? Math.PI : 0)];
}
export function updateTraffic(dt, player, near) {
  for (const c of cars) {
    // stop when the player is in front of the car
    const px = c.axis === 'x' ? player.x : player.z, pl = c.axis === 'x' ? player.z : player.x;
    let ahead = (px - c.t) * c.dir; if (ahead < -CITY) ahead += CITY * 2;
    const blocked = Math.abs(pl - c.lane) < 2.6 && ahead > 0 && ahead < 9;
    c.v += ((blocked ? 0 : c.speed) - c.v) * Math.min(1, dt * (blocked ? 6 : 1.2));
    c.t += c.v * c.dir * dt;
    if (c.t > CITY) c.t -= CITY * 2; if (c.t < -CITY) c.t += CITY * 2;
    if (c.axis === 'x') c.g.position.set(c.t, 0, c.lane); else c.g.position.set(c.lane, 0, c.t);
    c.g.visible = Math.abs(c.t) < CITY - 1;
  }
  for (const w of walkers) {
    const d = Math.hypot(w.c.root.position.x - player.x, w.c.root.position.z - player.z);
    w.t += w.sp * dt / 47;
    const [x, z, ry] = loopAt(w);
    w.c.root.position.set(x, 0, z); w.c.root.rotation.y = ry;
    w.c.root.visible = d < 120;
    if (d < 70) w.c.mixer.update(dt);
  }
}

// ---------- side missions and main-mission spots ----------
export function sideSpot(q) {
  if (q.kind === 'park' || q.kind === 'desert') return { x: q.pos[0], z: q.pos[1] + (q.kind === 'park' ? 2 : 0), face: 0 };
  const sp = q._spot || { x: q.pos[0], z: q.pos[1], sx: 1, sz: 1 };
  return { x: sp.x, z: sp.z, face: Math.atan2(sp.sx, sp.sz) };
}
