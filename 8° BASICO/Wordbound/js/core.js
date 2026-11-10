import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Shared things for the whole game: scene, model loading, ground height, colliders.
export const scene = new THREE.Scene();
export const colliders = [];      // {x,z,r}
export const camBlockers = [];    // {x,z,r,y0,y1}
export const animated = [];       // functions (t, dt)
export const WORLD_R = 250;       // walkable radius of the island

const loader = new GLTFLoader();
const cache = {};
let loadTotal = 0, loadDone = 0, onProgress = () => {};
export function setProgress(fn) { onProgress = fn; }
// Total de modelos de la última carga (o un estimado la primera vez): así la barra avanza de verdad y no salta a 100% al inicio
const LOAD_KEY = 'eslt_load_wordbound';
let LOAD_EXPECT = 80; try { LOAD_EXPECT = Number(localStorage.getItem(LOAD_KEY)) || 80; } catch (e) { }
export function load(url) {
  if (!cache[url]) {
    loadTotal++;
    cache[url] = new Promise(res => loader.load(url, g => { shareTextures(url, g); loadDone++; onProgress(loadDone / Math.max(loadTotal, LOAD_EXPECT)); if (loadDone === loadTotal) { try { localStorage.setItem(LOAD_KEY, loadTotal); } catch (e) { } } res(g); }, undefined, e => { loadDone++; console.warn('No se pudo cargar', url, e); res(null); }));
  }
  return cache[url];
}

// KayKit models of one pack use the same texture file: keep one copy in memory.
const texCache = {};
function shareTextures(url, g) {
  const imgs = g.parser && g.parser.json.images; if (!imgs || imgs.length !== 1 || !imgs[0].uri) return;
  const key = url.slice(0, url.lastIndexOf('/') + 1) + imgs[0].uri;
  g.scene.traverse(m => {
    if (!m.isMesh) return;
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
      if (!mat.map) continue;
      if (!texCache[key]) texCache[key] = mat.map;
      else if (mat.map !== texCache[key]) { mat.map.dispose(); mat.map = texCache[key]; }
    }
  });
}

let seed = 11;
export function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
export const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true, ...extra });
export function shadowize(o) { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); }
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export { sstep };

// ---------- realms ----------
export const REALMS = [
  { id: 'greenvale', name: 'Greenvale', people: 'Humans', color: '#6cc04a', fog: '#cfeaff', sky: '#8fd3ff', fogNear: 90, fogFar: 260, music: 'm_village', town: { x: 0, z: 0 } },
  { id: 'whisperwood', name: 'Whisperwood', people: 'Elves', color: '#3c8c43', fog: '#b9e3cf', sky: '#86cfc0', fogNear: 50, fogFar: 200, music: 'm_forest', town: { x: 0, z: -170 }, dir: -Math.PI / 2 },
  { id: 'stonehold', name: 'Stonehold', people: 'Dwarves', color: '#8e9b78', fog: '#dfe3ea', sky: '#a9c3df', fogNear: 70, fogFar: 240, music: 'm_mountain', town: { x: 170, z: 0 }, dir: 0 },
  { id: 'sunscar', name: 'Sunscar Desert', people: 'Orcs', color: '#e2c07a', fog: '#f6e2b8', sky: '#f2c98a', fogNear: 80, fogFar: 260, music: 'm_desert', town: { x: 0, z: 170 }, dir: Math.PI / 2 },
  { id: 'mistmoor', name: 'Mistmoor', people: 'the Bonefolk', color: '#5e5b70', fog: '#6d6684', sky: '#4b4466', fogNear: 30, fogFar: 150, music: 'm_marsh', town: { x: -170, z: 0 }, dir: Math.PI }
];

/** Weights of each realm at (x,z). Order = REALMS. */
export function realmWeights(x, z) {
  const d = Math.hypot(x, z), c = 1 - sstep(72, 112, d);
  const a = Math.atan2(z, x);
  const lobes = [-Math.PI / 2, 0, Math.PI / 2, Math.PI].map(t => { const k = Math.max(0, Math.cos(a - t)); return k * k * k; });
  const sum = lobes.reduce((s, v) => s + v, 0) || 1;
  return [c, ...lobes.map(v => (1 - c) * v / sum)];
}
export function realmAt(x, z) { const w = realmWeights(x, z); let b = 0; w.forEach((v, i) => { if (v > w[b]) b = i; }); return b; }

// ---------- roads ----------
export const roads = [];   // {pts:[Vector3], w}
const FLAT = [];           // {x,z,r}: places kept flat (towns, plazas)
export function flatArea(x, z, r) { FLAT.push({ x, z, r }); }
function segDist(px, pz, a, b) {
  const vx = b.x - a.x, vz = b.z - a.z, l = vx * vx + vz * vz || 1;
  let t = ((px - a.x) * vx + (pz - a.z) * vz) / l; t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - a.x - vx * t, pz - a.z - vz * t);
}
export function distToRoads(x, z) {
  let m = 1e9;
  for (const r of roads) { const P = r.pts; for (let i = 0; i < P.length - 1; i++) { const a = P[i]; if (Math.abs(a.x - x) > 30 && Math.abs(a.z - z) > 30) continue; const d = segDist(x, z, a, P[i + 1]); if (d < m) m = d; } }
  return m;
}
/** A road as a list of points with a gentle wave. */
export function roadPath(ax, az, bx, bz, amp = 6, waves = 2) {
  const a = new THREE.Vector3(ax, 0, az), b = new THREE.Vector3(bx, 0, bz);
  const len = a.distanceTo(b), n = Math.max(6, Math.round(len / 3));
  const dir = b.clone().sub(a).normalize(), nrm = new THREE.Vector3(-dir.z, 0, dir.x), ph = rnd() * 6;
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push(a.clone().lerp(b, t).addScaledVector(nrm, Math.sin(t * Math.PI) * amp * Math.sin(t * Math.PI * waves + ph))); }
  const r = { pts, w: 3.6 }; roads.push(r); return r;
}

// ---------- ground height ----------
export function H(x, z) {
  const d = Math.hypot(x, z);
  let h = 0.9 * Math.sin(x * 0.031 + 0.7) * Math.cos(z * 0.027 - 0.4) + 0.55 * Math.sin(x * 0.067 + 2.1) * Math.sin(z * 0.059 + 0.3);
  const w = realmWeights(x, z);
  h += w[2] * (2.4 + 2.6 * Math.sin(x * 0.045 + 1) * Math.cos(z * 0.05)) ; // Stonehold hills
  h -= w[4] * 0.6;                                                          // Mistmoor is low and wet
  h *= 1 - w[3] * 0.55;                                                     // the desert is flatter
  let f = 1;
  for (const t of FLAT) { const dd = Math.hypot(x - t.x, z - t.z); if (dd < t.r + 16) f = Math.min(f, sstep(t.r, t.r + 16, dd)); }
  const rd = distToRoads(x, z); if (rd < 14) f = Math.min(f, 0.25 + 0.75 * sstep(3, 14, rd));
  const flatH = w[2] * 1.2 - w[4] * 0.3;
  h = flatH + (h - flatH) * f;
  if (d > WORLD_R - 12) h -= (d - (WORLD_R - 12)) * 0.22;
  return h;
}

/** Place a model scaled to a target height. key = 'pack/name' (assets/models/pack/name.gltf) */
export async function prop(key, x, z, h, opt = {}) {
  const g = await load(key.includes('/') && !key.startsWith('assets') ? `assets/models/${key}.gltf` : key);
  if (!g) return null;
  const o = g.scene.clone(true);
  const box = new THREE.Box3().setFromObject(o);
  const size = box.getSize(new THREE.Vector3());
  const s = h / Math.max(size.y, 0.001);
  o.scale.setScalar(s);
  const y = opt.y !== undefined ? opt.y : H(x, z) - (opt.sink || 0.05);
  o.position.set(x, y - box.min.y * s, z);
  o.rotation.y = opt.ry ?? rnd() * Math.PI * 2;
  if (opt.tint) o.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.lerp(new THREE.Color(opt.tint), opt.tintK ?? 0.6); if (opt.emissive) { m.material.emissive = new THREE.Color(opt.emissive); m.material.emissiveIntensity = 0.35; } } });
  shadowize(o);
  (opt.parent || scene).add(o);
  if (opt.r) colliders.push({ x, z, r: opt.r });
  if (opt.r >= 1.4 || opt.cam) camBlockers.push({ x, z, r: (opt.r || 1.5) * 0.9, y0: y, y1: y + h });
  return o;
}

const UP = new THREE.Vector3(0, 1, 0);
/** Many copies of one model in a single draw call. list: [{x,z,h,ry,y}] */
export async function scatter(key, list, opt = {}) {
  if (!list.length) return;
  const g = await load(`assets/models/${key}.gltf`); if (!g) return;
  const root = g.scene; root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root), sy = Math.max(box.max.y - box.min.y, 0.001);
  list.forEach(p => { if (p.ry === undefined) p.ry = rnd() * Math.PI * 2; if (p.y === undefined) p.y = H(p.x, p.z) - 0.1; });
  const meshes = []; root.traverse(m => { if (m.isMesh) meshes.push(m); });
  const q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), mat = new THREE.Matrix4();
  for (const m of meshes) {
    let material = m.material;
    if (opt.tint) { material = material.clone(); material.color.lerp(new THREE.Color(opt.tint), opt.tintK ?? 0.5); }
    const im = new THREE.InstancedMesh(m.geometry, material, list.length);
    im.castShadow = opt.shadow !== false; im.receiveShadow = true; im.frustumCulled = false;
    list.forEach((p, i) => { const s = p.h / sy; mat.compose(v.set(p.x, p.y - box.min.y * s, p.z), q.setFromAxisAngle(UP, p.ry), sc.set(s, s, s)).multiply(m.matrixWorld); im.setMatrixAt(i, mat); });
    scene.add(im);
  }
  if (opt.r) list.forEach(p => colliders.push({ x: p.x, z: p.z, r: opt.r * (p.h / (opt.refH || p.h)) }));
  if (opt.cam) list.forEach(p => camBlockers.push({ x: p.x, z: p.z, r: p.h * 0.32, y0: p.y + p.h * 0.3, y1: p.y + p.h * 1.05 }));
}

/** Text label that always faces the camera. */
export function label(text, color = '#fff', size = 30, w = 2.6) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const c = cv.getContext('2d');
  c.font = `800 ${size}px Nunito, sans-serif`; c.textAlign = 'center'; c.lineWidth = 7; c.strokeStyle = 'rgba(30,15,50,.8)'; c.strokeText(text, 128, 44); c.fillStyle = color; c.fillText(text, 128, 44);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(w, w / 4, 1); s.renderOrder = 10; return s;
}
