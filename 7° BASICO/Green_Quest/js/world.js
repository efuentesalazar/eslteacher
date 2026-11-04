import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { ZONES, SIDE } from './content.js';

export const scene = new THREE.Scene();
export const colliders = [];          // {x,z,r}
export const animated = [];           // functions (t,dt)
export const camBlockers = [];        // {x,z,r,y0,y1}: the camera moves closer instead of going inside these
export const ISLAND = 175;            // walkable radius
export const ZONE_R = 120;            // distance from the plaza to each zone
const GATE_R = ZONE_R - 15;           // zone entrance (front, toward the plaza)
const UP = new THREE.Vector3(0, 1, 0);

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
  if (opt.r >= 1.4) camBlockers.push({ x, z, r: opt.r * 0.9, y0: 0, y1: h });
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

// ---------- roads ----------
export const roads = [];       // {pts:[Vector3], w}
export const legs = [];        // legs[i] = road that arrives at zone i (side quests stand on it)
export const gates = [];       // entrance of each zone
export const landmarks = [];   // {x,z,r,name} for the minimap
const blocked = [];            // areas where the scattered trees must not grow

function makeRoad(a, b, amp, waves, w, color, y) {
  const len = a.distanceTo(b), n = Math.max(10, Math.round(len / 2));
  const dir = b.clone().sub(a).normalize(), nrm = new THREE.Vector3(-dir.z, 0, dir.x), ph = rnd() * 6;
  const pts = [];
  for (let i = 0; i <= n; i++) { const t = i / n; pts.push(a.clone().lerp(b, t).addScaledVector(nrm, Math.sin(t * Math.PI) * amp * Math.sin(t * Math.PI * waves + ph))); }
  const pos = [], idx = [];
  pts.forEach((p, i) => {
    const d = pts[Math.min(n, i + 1)].clone().sub(pts[Math.max(0, i - 1)]).normalize(), nx = -d.z * w / 2, nz = d.x * w / 2;
    pos.push(p.x + nx, y, p.z + nz, p.x - nx, y, p.z - nz);
    if (i < n) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 1 })); m.receiveShadow = true; scene.add(m);
  // little stones along the edges
  for (let i = 3; i < n - 1; i += 7) { const p = pts[i], s = (i % 2 ? 1 : -1) * (w / 2 + 0.4); const d = pts[i + 1].clone().sub(pts[i - 1]).normalize(); stones.push({ x: p.x - d.z * s, z: p.z + d.x * s }); }
  const road = { pts, w }; roads.push(road); return road;
}
const stones = [];

/** Point on a road: t from 0 to 1. Returns position, direction and normal. */
export function roadAt(road, t) {
  const P = road.pts, f = THREE.MathUtils.clamp(t, 0, 1) * (P.length - 1), i = Math.min(P.length - 2, Math.floor(f));
  const p = P[i].clone().lerp(P[i + 1], f - i), d = P[i + 1].clone().sub(P[i]).normalize();
  return { p, d, n: new THREE.Vector3(-d.z, 0, d.x) };
}
function distToRoads(x, z) { let m = 1e9; for (const r of roads) for (const p of r.pts) { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < m) m = d; } return Math.sqrt(m); }
function isFree(x, z, pad = 0) {
  if (Math.hypot(x, z) < 18 + pad || Math.hypot(x, z) > ISLAND - 3) return false;
  for (const b of blocked) if (Math.hypot(b.x - x, b.z - z) < b.r + pad) return false;
  return distToRoads(x, z) > 3.4 + pad;
}

/** Many copies of one KayKit model drawn in a single draw call. list: [{x,z,h,ry}] */
async function scatter(key, list, opt = {}) {
  if (!list.length) return;
  const g = await load(`assets/models/${key}.gltf`); if (!g) return;
  const root = g.scene; root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root), sy = Math.max(box.max.y - box.min.y, 0.001);
  list.forEach(p => { if (p.ry === undefined) p.ry = rnd() * Math.PI * 2; });
  const meshes = []; root.traverse(m => { if (m.isMesh) meshes.push(m); });
  const q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), mat = new THREE.Matrix4();
  for (const m of meshes) {
    const im = new THREE.InstancedMesh(m.geometry, m.material, list.length);
    im.castShadow = opt.shadow !== false; im.receiveShadow = true; im.frustumCulled = false;
    list.forEach((p, i) => { const s = p.h / sy; mat.compose(v.set(p.x, (p.y || 0) - box.min.y * s, p.z), q.setFromAxisAngle(UP, p.ry), sc.set(s, s, s)).multiply(m.matrixWorld); im.setMatrixAt(i, mat); });
    scene.add(im);
  }
  if (opt.r) list.forEach(p => colliders.push({ x: p.x, z: p.z, r: opt.r }));
  if (opt.cam) list.forEach(p => camBlockers.push({ x: p.x, z: p.z, r: p.h * 0.34, y0: p.h * 0.3, y1: p.h * 1.05 }));
}

/** Small round flowers in several colours (instanced). */
function flowerField(list) {
  const cols = ['#ff6fa8', '#ffd23a', '#ffffff', '#b07cff', '#ff8a3d'];
  const geo = new THREE.IcosahedronGeometry(0.17, 0), mat = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  cols.forEach((c, ci) => {
    const mine = list.filter((_, i) => i % cols.length === ci); if (!mine.length) return;
    const im = new THREE.InstancedMesh(geo, M(c, { emissive: c, emissiveIntensity: 0.12 }), mine.length); im.frustumCulled = false;
    mine.forEach((p, i) => { const k = 0.8 + rnd() * 0.6; im.setMatrixAt(i, mat.compose(v.set(p.x, 0.22, p.z), q, s.set(k, k * 0.7, k))); });
    scene.add(im);
  });
}

// ---------- extra custom pieces ----------
function puffs(x, y, z, { n = 6, col = '#4a4545', size = 0.4, rise = 3, drift = 1, speed = 0.35 } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(size, 7, 5), M(col, { transparent: true, opacity: 0.7 })); p.userData.o = i / n; g.add(p); }
  scene.add(g);
  animated.push(t => { if (!g.visible) return; g.children.forEach(p => { const k = (t * speed + p.userData.o) % 1; p.position.set(x + k * drift, y + k * rise, z + Math.sin(k * 6) * 0.3); p.scale.setScalar(0.6 + k * 1.5); p.material.opacity = 0.7 * (1 - k); }); });
  return g;
}

function campfire(x, z) {
  const base = new THREE.Group();
  for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.1, 6), M('#6b4423')); l.rotation.z = Math.PI / 2; l.rotation.y = k * Math.PI / 4; l.position.y = 0.12; base.add(l); }
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), M('#8d8d8d')); st.position.set(Math.cos(a) * 0.75, 0.1, Math.sin(a) * 0.75); base.add(st); }
  base.position.set(x, 0, z); shadowize(base); scene.add(base); colliders.push({ x, z, r: 0.9 });
  const flames = new THREE.Group();
  [['#ff5a1f', 0.45, 1.1], ['#ffb02e', 0.32, 0.8], ['#fff176', 0.18, 0.5]].forEach(([c, r, h], i) => { const f = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), M(c, { emissive: c, emissiveIntensity: 0.9 })); f.position.y = 0.2 + h / 2; f.userData.ph = i; flames.add(f); });
  flames.position.set(x, 0, z); scene.add(flames);
  const light = new THREE.PointLight('#ff8a3d', 6, 9); light.position.set(x, 1.4, z); flames.add(light); light.position.set(0, 1.4, 0);
  animated.push(t => { if (!flames.visible) return; flames.children.forEach(f => { if (f.isMesh) { f.scale.set(1, 0.8 + Math.sin(t * 9 + f.userData.ph * 2) * 0.2, 1); f.rotation.y = t * 2 + f.userData.ph; } }); light.intensity = 5 + Math.sin(t * 13) * 1.5; });
  return { flames, smoke: puffs(x, 1.2, z, { n: 7, col: '#3d3a3a', size: 0.35, rise: 4, drift: 1.6 }) };
}

function bird(color = '#ffffff') {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), M(color)); body.scale.set(1, 0.8, 1.4);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), M(color)); head.position.set(0, 0.22, 0.33);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 5), M('#ffa21f')); beak.rotation.x = Math.PI / 2; beak.position.set(0, 0.2, 0.52);
  const wl = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.3), M('#d9dde3')); wl.position.x = -0.3; const pl = new THREE.Group(); pl.add(wl); pl.position.set(-0.15, 0.08, 0);
  const wr = wl.clone(); wr.position.x = 0.3; const pr = new THREE.Group(); pr.add(wr); pr.position.set(0.15, 0.08, 0);
  g.add(body, head, beak, pl, pr); g.userData.wings = [pl, pr]; shadowize(g);
  return g;
}

function recycleBin(x, z, color) {
  const g = new THREE.Group();
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 1, 10), M(color)); b.position.y = 0.5;
  const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.1, 10), M(color)); lid.position.y = 1.03;
  const sym = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 4, 3), M('#ffffff')); sym.position.set(0, 0.6, 0.39);
  g.add(b, lid, sym); g.position.set(x, 0, z); shadowize(g); scene.add(g); return g;
}

function bike(lying) {
  const g = new THREE.Group(), red = M('#e2408f'), dark = M('#2b2b30');
  const wheel = () => { const w = new THREE.Group(); w.add(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 6, 16), dark)); for (let k = 0; k < 3; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.03, 0.03), M('#cccccc')); s.rotation.z = k * Math.PI / 3; w.add(s); } return w; };
  const w1 = wheel(); w1.position.set(-0.6, 0.45, 0); g.add(w1);
  if (!lying) { const w2 = wheel(); w2.position.set(0.6, 0.45, 0); g.add(w2); }
  const f1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), red); f1.position.set(0, 0.75, 0); f1.rotation.z = 0.12;
  const f2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.6, 0.08), red); f2.position.set(-0.25, 0.65, 0); f2.rotation.z = 0.35;
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.07, 0.16), dark); seat.position.set(-0.35, 0.98, 0);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.55), dark); bar.position.set(0.52, 1.05, 0);
  const fork = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.6, 0.06), red); fork.position.set(0.56, 0.75, 0);
  g.add(f1, f2, seat, bar, fork);
  if (lying) { g.rotation.x = Math.PI / 2; g.position.y = 0.12; }
  shadowize(g); return g;
}

function cottage(x, z, ry) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 4), M('#f3e3c3')); body.position.y = 1.5;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.9, 2, 4), M('#c0503a')); roof.position.y = 4; roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.85);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, 0.1), M('#7a4a2a')); door.position.set(0, 0.85, 2.02);
  g.add(body, roof, door);
  const lit = [], dark = [];
  for (const [wx, wy, wz, rot] of [[-1.6, 1.8, 2.03, 0], [1.6, 1.8, 2.03, 0], [2.53, 1.8, 0, Math.PI / 2], [-2.53, 1.8, 0, Math.PI / 2]]) {
    const on = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.08), M('#fff2a0', { emissive: '#ffd84a', emissiveIntensity: 1.2 })); on.position.set(wx, wy, wz); on.rotation.y = rot;
    const off = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.08), M('#3b4a5c', { roughness: 0.3 })); off.position.copy(on.position); off.rotation.y = rot;
    g.add(on, off); lit.push(on); dark.push(off);
  }
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), M('#fff7c2', { emissive: '#ffe066', emissiveIntensity: 1.5 })); lamp.position.set(1, 2.6, 2.2); g.add(lamp); lit.push(lamp);
  const glow = new THREE.PointLight('#ffd84a', 5, 10); glow.position.set(0, 2, 3); g.add(glow); lit.push(glow);
  g.position.set(x, 0, z); g.rotation.y = ry; shadowize(g); scene.add(g); colliders.push({ x, z, r: 3.2 });
  return { lit, dark };
}

function beehive(x, z) {
  const g = new THREE.Group();
  [['#ffffff', 0.35], ['#ffd23a', 0.75], ['#ffffff', 1.15]].forEach(([c, y]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.38, 0.9), M(c)); b.position.y = y; g.add(b); });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.12, 1.05), M('#8a5a2b')); roof.position.y = 1.4; g.add(roof);
  g.position.set(x, 0, z); shadowize(g); scene.add(g); colliders.push({ x, z, r: 0.7 });
  bees(x, z, 1.4, 5);
}
function bees(x, z, y, n) {
  const g = new THREE.Group(); scene.add(g);
  for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), M('#ffcc00', { emissive: '#ffcc00', emissiveIntensity: 0.4 })); b.userData.o = rnd() * 6; b.userData.r = 0.6 + rnd() * 0.8; g.add(b); }
  animated.push(t => { if (!g.visible) return; g.children.forEach(b => { const a = t * 2.5 + b.userData.o; b.position.set(x + Math.cos(a) * b.userData.r, y + Math.sin(a * 1.7) * 0.3, z + Math.sin(a) * b.userData.r); }); });
  return g;
}

function flowerCluster(x, z) {
  const g = new THREE.Group(), cols = ['#ff6fa8', '#ffd23a', '#b07cff', '#ff8a3d'];
  for (let k = 0; k < 5; k++) {
    const a = k / 5 * Math.PI * 2, d = k ? 0.45 : 0, fx = Math.cos(a) * d, fz = Math.sin(a) * d;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 4), M('#3f9a3a')); stem.position.set(fx, 0.3, fz);
    const head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), M(cols[k % 4], { emissive: cols[k % 4], emissiveIntensity: 0.15 })); head.position.set(fx, 0.65, fz); head.scale.y = 0.6;
    const mid = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), M('#ffef7a')); mid.position.set(fx, 0.72, fz);
    g.add(stem, head, mid);
  }
  g.position.set(x, 0, z); g.visible = false; shadowize(g); scene.add(g); return g;
}

/** A glowing thing the player picks up during a side quest. */
function collectible(kind, idx, x, z) {
  const g = new THREE.Group(), item = new THREE.Group();
  if (kind === 'seed') {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.6, 0.1), M('#f6e7b5')); const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 5), M('#3fae4a')); leaf.position.set(0, 0.05, 0.07); leaf.rotation.x = Math.PI / 2; item.add(p, leaf);
  } else if (kind === 'litter') {
    const makers = [
      () => new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 10), M('#e23b3b', { metalness: 0.4, roughness: 0.4 })),
      () => new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.6, 10), M('#bfe9ff', { transparent: true, opacity: 0.8 })),
      () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 7, 5), M('#f4f4f4')); m.scale.y = 0.7; return m; },
      () => new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.3), M('#ff9a2e')),
      () => new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.38, 10), M('#ffffff')),
      () => new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.42, 10), M('#2fae5a', { metalness: 0.4, roughness: 0.4 })),
    ];
    item.add(makers[idx % makers.length]());
  } else if (kind === 'part') {
    if (idx === 0) { item.add(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 6, 16), M('#2b2b30'))); for (let k = 0; k < 3; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.03, 0.03), M('#cccccc')); s.rotation.z = k * Math.PI / 3; item.add(s); } }
    else if (idx === 1) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 4, 18), M('#777777', { metalness: 0.6, roughness: 0.3 })); c.scale.y = 0.55; item.add(c); }
    else { const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), M('#ffd23a', { metalness: 0.6, roughness: 0.3 })); const s = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 5), M('#777')); s.position.y = -0.1; item.add(b, s); }
  } else if (kind === 'flower') {
    const soil = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), M('#6b4a2b')); soil.scale.y = 0.4; item.add(soil);
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 6, 24), new THREE.MeshBasicMaterial({ color: '#29d3e8' })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.05;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 8, 10, 1, true), new THREE.MeshBasicMaterial({ color: '#29d3e8', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 4;
  shadowize(item); g.add(item, ring, beam); g.userData.item = item; g.userData.float = kind !== 'flower';
  g.position.set(x, 0, z); g.visible = false; scene.add(g); return g;
}

// ---------- world ----------
export const pedestals = [];   // central crystals, one per zone
export const zoneInfo = [];    // {center, npcPos, bagPos[]}
export const smogs = [];       // per zone: [objects that disappear when the zone is clean]
export const greens = [];      // per zone: [objects that appear when the zone is clean]
export const greatTree = { bare: null, green: null };
export const sideInfo = [];    // per side quest: {npcPos, face, items[], after[], problem[], solved[]}

export async function buildWorld() {
  scene.background = new THREE.Color('#8fd3ff');
  scene.fog = new THREE.Fog('#bfe6ff', 80, 240);
  scene.add(new THREE.HemisphereLight('#ffffff', '#5b8c3a', 1.1));
  const sun = new THREE.DirectionalLight('#fff3d6', 2.2);
  sun.position.set(30, 50, 20); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -38, right: 38, top: 38, bottom: -38, near: 1, far: 140 });
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  scene.userData.sun = sun;

  // island, beach and sea
  const gg = new THREE.CircleGeometry(ISLAND + 8, 128); gg.rotateX(-Math.PI / 2);
  const ground = new THREE.Mesh(gg, M('#66b947', { roughness: 1 })); ground.receiveShadow = true; scene.add(ground);
  const beach = new THREE.Mesh(new THREE.RingGeometry(ISLAND + 6, ISLAND + 15, 128).rotateX(-Math.PI / 2), M('#f1d9a0')); beach.position.y = -0.05; beach.receiveShadow = true; scene.add(beach);
  const water = new THREE.Mesh(new THREE.CircleGeometry(600, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#3fb3e8', roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.92 }));
  water.position.y = -0.3; scene.add(water);
  animated.push(t => { water.position.y = -0.3 + Math.sin(t * 0.8) * 0.05; });
  // meadow patches so the big island is not one flat colour
  const patchCols = ['#5aa83e', '#74c652', '#7fcf5a', '#5fae43', '#8cd166'];
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI * 2, d = 20 + rnd() * (ISLAND - 25), r = 5 + rnd() * 14;
    const p = new THREE.Mesh(new THREE.CircleGeometry(r, 9).rotateX(-Math.PI / 2), M(patchCols[i % patchCols.length], { roughness: 1 }));
    p.position.set(Math.cos(a) * d, 0.006 + (i % 5) * 0.001, Math.sin(a) * d); p.rotation.y = rnd() * 3; p.scale.z = 0.6 + rnd() * 0.6; p.receiveShadow = true; scene.add(p);
  }

  // plaza
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(12, 40).rotateX(-Math.PI / 2), M('#d9cfa6')); plaza.position.y = 0.03; plaza.receiveShadow = true; scene.add(plaza);
  const ringStone = new THREE.Mesh(new THREE.RingGeometry(11.6, 12.4, 40).rotateX(-Math.PI / 2), M('#a8a07a')); ringStone.position.y = 0.035; scene.add(ringStone);

  // roads: plaza → each zone (spokes) and zone → next zone (a big pentagon)
  const pads = ['#4a4038', '#f1d9a0', '#a9a9b2', '#c9a86a', '#b8d88a'];
  for (let i = 0; i < 5; i++) {
    const p = zonePos(i), dir = p.clone().normalize();
    gates.push(dir.clone().multiplyScalar(GATE_R));
    const pad = new THREE.Mesh(new THREE.CircleGeometry(14, 36).rotateX(-Math.PI / 2), M(pads[i])); pad.position.set(p.x, 0.025, p.z); pad.receiveShadow = true; scene.add(pad);
    blocked.push({ x: p.x, z: p.z, r: 23 });
  }
  const spokes = gates.map((g, i) => makeRoad(g.clone().normalize().multiplyScalar(11.5), g, 5, 2, 3.4, '#d8c48e', 0.02));
  const chords = gates.map((g, i) => makeRoad(g, gates[(i + 1) % 5], 7, 3, 3.4, '#cfba86', 0.022));
  legs.push(spokes[0], chords[0], chords[1], chords[2], chords[3]);
  // signposts at each zone entrance
  gates.forEach((g, i) => {
    const d = g.clone().normalize(), side = new THREE.Vector3(-d.z, 0, d.x), x = g.x + side.x * 3.4, z = g.z + side.z * 3.4;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.6, 0.22), M('#8a5a2b')); post.position.set(x, 1.3, z);
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.12), M(ZONES[i].color)); board.position.set(x, 2.4, z); board.rotation.y = Math.atan2(d.x, d.z);
    shadowize(post); shadowize(board); scene.add(post, board); colliders.push({ x, z, r: 0.3 });
  });

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

  // village houses around the plaza
  const houses = ['hx/building_home_A_green', 'hx/building_home_B_green', 'hx/building_tavern_green', 'hx/building_home_A_blue', 'hx/building_church_green', 'hx/building_market_green'];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i + 0.5) * Math.PI * 2 / 5;
    for (const [d, off] of [[24, -0.12], [31, 0.1]]) {
      const x = Math.cos(a + off) * d, z = Math.sin(a + off) * d;
      prop(houses[(i * 2 + (d > 25 ? 1 : 0)) % houses.length], x, z, 6.5, { ry: -a - Math.PI / 2, r: 3.6 });
      blocked.push({ x, z, r: 6 });
    }
  }

  await buildLandmarks();
  for (let i = 0; i < SIDE.length; i++) await buildSide(i);
  for (let i = 0; i < 5; i++) await buildZone(i);

  // mountains on the horizon and clouds
  for (let i = 0; i < 22; i++) {
    const a = i / 22 * Math.PI * 2 + 0.1, d = ISLAND + 40 + rnd() * 16;
    prop(['hx/mountain_A_grass_trees', 'hx/mountain_B_grass_trees', 'hx/hills_A_trees', 'hx/mountain_C_grass_trees'][i % 4], Math.cos(a) * d, Math.sin(a) * d, 22 + rnd() * 16);
  }
  for (let i = 0; i < 14; i++) { const g = await prop(i % 2 ? 'hx/cloud_big' : 'hx/cloud_small', (rnd() - .5) * 380, (rnd() - .5) * 380, 3, { y: 34 + rnd() * 12 }); if (g) { g.scale.multiplyScalar(2.8); const sp = 0.5 + rnd(); animated.push((t, dt) => { g.position.x += dt * sp; if (g.position.x > 220) g.position.x = -220; }); } }

  // nature: groves of trees, bushes, rocks and flowers (instanced = fast)
  const treeKeys = ['fo/Tree_1_A_Color1', 'fo/Tree_1_B_Color1', 'fo/Tree_1_C_Color1', 'fo/Tree_2_A_Color1', 'fo/Tree_2_B_Color1', 'fo/Tree_2_C_Color1', 'fo/Tree_2_D_Color1', 'fo/Tree_3_A_Color1', 'fo/Tree_3_B_Color1', 'fo/Tree_4_A_Color1', 'fo/Tree_4_B_Color1'];
  const T = treeKeys.map(() => []);
  const forestC = zonePos(0);
  let nt = 0;
  for (let k = 0; k < 9000 && nt < 520; k++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * (ISLAND - 4), x = Math.cos(a) * d, z = Math.sin(a) * d;
    let dens = 0.5 + 0.5 * Math.sin(x * 0.045 + 1.3) * Math.cos(z * 0.05 - 0.7);
    if (Math.hypot(x - forestC.x, z - forestC.z) < 55) dens += 0.45;     // thicker woods around the forest zone
    if (rnd() > dens * dens * 0.55) continue;
    if (!isFree(x, z, 1)) continue;
    T[Math.floor(rnd() * T.length)].push({ x, z, h: 4.5 + rnd() * 4 }); nt++;
  }
  await Promise.all(treeKeys.map((key, i) => scatter(key, T[i], { r: 0.8, cam: true })));
  const small = ['fo/Bush_1_A_Color1', 'fo/Bush_1_C_Color1', 'fo/Bush_2_C_Color1', 'fo/Bush_3_A_Color1', 'fo/Bush_4_A_Color1', 'fo/Grass_1_A_Color1', 'fo/Grass_1_C_Color1', 'fo/Grass_2_A_Color1', 'fo/Rock_1_A_Color1', 'fo/Rock_1_E_Color1', 'fo/Rock_3_E_Color1'];
  const B = small.map(() => []);
  for (let k = 0; k < 2600; k++) {
    const a = rnd() * Math.PI * 2, d = 14 + Math.sqrt(rnd()) * (ISLAND - 16), x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (!isFree(x, z, -1.2)) continue;
    const s = Math.floor(rnd() * small.length); B[s].push({ x, z, h: s >= 8 ? 0.6 + rnd() * 0.9 : 0.6 + rnd() * 0.5 });
  }
  await Promise.all(small.map((key, i) => scatter(key, B[i], { shadow: i < 5 })));
  const F = [];
  for (let c = 0; c < 45; c++) {   // flower meadows
    const a = rnd() * Math.PI * 2, d = 18 + rnd() * (ISLAND - 22), cx = Math.cos(a) * d, cz = Math.sin(a) * d;
    for (let k = 0; k < 22; k++) { const x = cx + (rnd() - .5) * 9, z = cz + (rnd() - .5) * 9; if (isFree(x, z, -2.2)) F.push({ x, z }); }
  }
  flowerField(F);
  await scatter('fo/Rock_2_C_Color1', stones.map(s => ({ ...s, h: 0.25 + rnd() * 0.2 })), { shadow: false });
}

// Landmarks between the zones, so the walk from one zone to the next has things to see.
async function buildLandmarks() {
  const at = (i, r, off = 0) => { const a = -Math.PI / 2 + (i + 0.5) * Math.PI * 2 / 5 + off; return [Math.cos(a) * r, Math.sin(a) * r, a]; };
  const face = (x, z) => Math.atan2(-x, -z);   // rotation that looks at the plaza

  { // Mirror Lake (between the forest and the bay)
    const [x, z] = at(0, 60), r = 12;
    const sand = new THREE.Mesh(new THREE.CircleGeometry(r + 1.6, 30).rotateX(-Math.PI / 2), M('#e6d29a')); sand.position.set(x, 0.03, z); scene.add(sand);
    const lake = new THREE.Mesh(new THREE.CircleGeometry(r, 30).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2aa6e0', roughness: 0.12, metalness: 0.1 })); lake.position.set(x, 0.05, z); scene.add(lake);
    colliders.push({ x, z, r: r - 0.4 });
    for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2; prop(['fo/Rock_1_A_Color1', 'fo/Rock_3_A_Color1', 'fo/Rock_2_C_Color1'][k % 3], x + Math.cos(a) * (r + 0.6), z + Math.sin(a) * (r + 0.6), 0.5 + rnd() * 0.6); }
    for (let k = 0; k < 7; k++) { const a = rnd() * 6.28, d = rnd() * (r - 2); prop(k % 2 ? 'hx/waterlily_A' : 'hx/waterlily_B', x + Math.cos(a) * d, z + Math.sin(a) * d, 0.15, { y: 0.06 }); }
    const [dx, dz] = [x * 0.86, z * 0.86];   // little wooden dock toward the plaza
    const dock = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 6), M('#a07040')); dock.position.set(dx, 0.2, dz); dock.rotation.y = face(x, z); shadowize(dock); scene.add(dock);
    for (let k = 0; k < 3; k++) { const b = bird('#ffffff'); b.scale.setScalar(0.8); scene.add(b); const ph = k * 2.1; animated.push(t => { const a = t * 0.15 + ph; b.position.set(x + Math.cos(a) * (r - 4), 0.12, z + Math.sin(a) * (r - 4)); b.rotation.y = -a; }); }
    landmarks.push({ x, z, r, name: 'Mirror Lake', lake: true });
    blocked.push({ x, z, r: r + 5 });
  }
  { // Fishing village (between the bay and the city)
    const [x, z, a] = at(1, 62);
    const spots = [['hx/building_home_A_blue', -7, 0], ['hx/building_tavern_green', 0, -6], ['hx/building_home_B_green', 7, 0], ['hx/building_home_A_blue', 0, 7]];
    const c = Math.cos(a), s = Math.sin(a);
    for (const [k, lx, lz] of spots) { const px = x + lx * c - lz * s, pz = z + lx * s + lz * c; await prop(k, px, pz, 6.5, { ry: Math.atan2(x - px, z - pz), r: 3.4 }); }
    prop('hx/building_well_green', x, z, 3, { r: 1.4 });
    for (let k = 0; k < 6; k++) prop(k % 2 ? 'hx/barrel' : 'hx/crate_A_big', x + (rnd() - .5) * 10, z + (rnd() - .5) * 10, 0.9, { r: 0.6 });
    landmarks.push({ x, z, r: 10, name: 'Fishing Village' }); blocked.push({ x, z, r: 15 });
  }
  { // Market square (between the city and the farm)
    const [x, z] = at(2, 62);
    const sq = new THREE.Mesh(new THREE.CircleGeometry(9, 24).rotateX(-Math.PI / 2), M('#cfc39a')); sq.position.set(x, 0.03, z); sq.receiveShadow = true; scene.add(sq);
    await prop('hx/building_market_green', x, z - 6, 6, { ry: 0, r: 3.4 });
    await prop('hx/building_church_green', x - 8, z + 3, 7, { ry: Math.PI / 2, r: 3.6 });
    await prop('hx/building_home_A_green', x + 8, z + 3, 6, { ry: -Math.PI / 2, r: 3.4 });
    ['rs/crate_tomatoes', 'rs/crate_carrots', 'rs/crate_lettuce', 'rs/crate_potatoes'].forEach((k, i) => prop(k, x - 3 + i * 1.6, z - 1.5, 0.6, { r: 0.5 }));
    prop('hx/wheelbarrow', x + 3, z + 3, 0.9, { r: 0.6 }); prop('hx/sack', x - 3, z + 3, 0.7);
    landmarks.push({ x, z, r: 9, name: 'Market' }); blocked.push({ x, z, r: 14 });
  }
  { // Golden fields (between the farm and the hills)
    const [x, z, a] = at(3, 62);
    await prop('hx/building_windmill_yellow', x, z, 8, { ry: face(x, z), r: 2.6 });
    prop('hx/building_grain', x + 6, z + 4, 3, { r: 1.8 });
    const wheat = new THREE.InstancedMesh(new THREE.ConeGeometry(0.18, 1.1, 4), M('#e8c34a', { emissive: '#7a5a00', emissiveIntensity: 0.1 }), 900); wheat.frustumCulled = false;
    const mat = new THREE.Matrix4(); let n = 0;
    for (let r = 0; r < 30; r++) for (let q = 0; q < 30; q++) { const lx = -14 + q * 0.95, lz = -16 + r * 0.95; if (Math.hypot(lx, lz) < 6) continue; const px = x + lx + rnd() * 0.3, pz = z + lz + rnd() * 0.3; if (distToRoads(px, pz) < 3) continue; wheat.setMatrixAt(n++, mat.makeTranslation(px, 0.55, pz)); }
    wheat.count = n; wheat.castShadow = true; scene.add(wheat);
    landmarks.push({ x, z, r: 14, name: 'Golden Fields' }); blocked.push({ x, z, r: 18 });
  }
  { // Stone circle (between the hills and the forest)
    const [x, z] = at(4, 60);
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; prop('fo/Rock_3_E_Color1', x + Math.cos(a) * 6.5, z + Math.sin(a) * 6.5, 2.4 + rnd(), { r: 1 }); }
    prop('hx/tree_single_A', x, z, 7, { r: 1 });
    landmarks.push({ x, z, r: 7, name: 'Stone Circle' }); blocked.push({ x, z, r: 11 });
  }
  { // Lighthouse on the far coast
    const [x, z] = at(1, ISLAND - 6), g = new THREE.Group();
    for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(1.5 - k * 0.15, 1.6 - k * 0.15, 2.4, 12), M(k % 2 ? '#ffffff' : '#e23b3b')); s.position.y = 1.2 + k * 2.4; g.add(s); }
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.4, 10), M('#fff7c2', { emissive: '#ffe066', emissiveIntensity: 1 })); top.position.y = 12.7;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.4, 10), M('#2b2b30')); cap.position.y = 14.1;
    const beam = new THREE.Mesh(new THREE.ConeGeometry(2.2, 18, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#fff3a0', transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide }));
    beam.rotation.z = Math.PI / 2; beam.position.x = 9; const rot = new THREE.Group(); rot.position.y = 12.7; rot.add(beam);
    g.add(top, cap, rot); g.position.set(x, 0, z); shadowize(g); scene.add(g); colliders.push({ x, z, r: 1.8 });
    animated.push(t => { rot.rotation.y = t * 0.6; });
    landmarks.push({ x, z, r: 3, name: 'Lighthouse' }); blocked.push({ x, z, r: 6 });
  }
}

// Side quest scenes. Local frame: +dz points from the NPC toward the road, -dz goes away from it.
async function buildSide(i) {
  const q = SIDE[i], road = legs[q.leg], { p, n } = roadAt(road, q.t);
  const npc = p.clone().addScaledVector(n, q.side * 4.4);
  const f = p.clone().sub(npc).normalize(), r = new THREE.Vector3(-f.z, 0, f.x);
  const W = (dx, dz) => [npc.x + r.x * dx + f.x * dz, npc.z + r.z * dx + f.z * dz];
  const faceRoad = Math.atan2(f.x, f.z);
  const info = { npcPos: npc, face: faceRoad, items: [], after: [], problem: [], solved: [] };
  const P = (k, dx, dz, h, o = {}) => { const [x, z] = W(dx, dz); return prop(k, x, z, h, o); };
  const hide = o => { if (o) o.visible = false; return o; };

  if (q.collect) {   // spread the things to collect around the NPC, away from the road
    const N = q.collect.n;
    for (let k = 0; k < N; k++) {
      const a = Math.PI + (k - (N - 1) / 2) * (2.4 / Math.max(1, N - 1)) + (rnd() - .5) * 0.3, d = q.collect.kind === 'flower' ? 4.5 + (k % 2) * 1.5 : 6 + rnd() * 6;
      const [x, z] = W(Math.sin(a) * d, Math.cos(a) * d);
      info.items.push(collectible(q.collect.kind, k, x, z));
      info.after.push(q.collect.kind === 'flower' ? flowerCluster(x, z) : null);
    }
  }
  if (q.id === 'campfire') {
    const [x, z] = W(-3, -2.5); const fire = campfire(x, z); info.problem.push(fire.flames, fire.smoke);
    P('hx/tent', 3.5, -4.5, 2.5, { ry: faceRoad + 0.4, r: 1.6 }); P('rb/Wood_Log_A', -5.5, -1, 0.45); P('hx/bucket_water', -1.5, -1.2, 0.5);
    for (let k = 0; k < 6; k++) P('fo/Grass_2_A_Color1', -6 + rnd() * 6, -4 - rnd() * 3, 0.6);
  }
  if (q.id === 'seeds') {
    P('hx/wheelbarrow', 2.2, -1.5, 0.9, { r: 0.6 }); P('hx/sack', 3.2, -0.6, 0.7);
    for (let k = 0; k < 6; k++) info.solved.push(hide(await P(k % 2 ? 'fo/Tree_3_A_Color1' : 'fo/Tree_4_A_Color1', -3 - (k % 3) * 1.8, -2.5 - Math.floor(k / 3) * 1.8, 1.4, { ry: rnd() * 6 })));
  }
  if (q.id === 'picnic') {
    const [bx, bz] = W(-3, -2.5);
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(3, 0.05, 2.2), M('#e23b3b')); blanket.position.set(bx, 0.03, bz); blanket.rotation.y = faceRoad; blanket.receiveShadow = true; scene.add(blanket);
    for (let k = 0; k < 3; k++) { const st = new THREE.Mesh(new THREE.BoxGeometry(3, 0.06, 0.3), M('#ffffff')); st.position.set(0, 0.01, -0.75 + k * 0.75); blanket.add(st); }
    P('hx/crate_A_big', -2, -2, 0.6);
    const [cx, cz] = W(2.5, -1.5); info.solved.push(hide(recycleBin(cx, cz, '#2fae5a')));
  }
  if (q.id === 'net') {
    const [px, pz] = W(0, -8.5);
    const pond = new THREE.Mesh(new THREE.CircleGeometry(4.5, 24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2aa6e0', roughness: 0.15 })); pond.position.set(px, 0.05, pz); scene.add(pond); colliders.push({ x: px, z: pz, r: 4.2 });
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; prop(['fo/Rock_1_A_Color1', 'fo/Rock_2_C_Color1'][k % 2], px + Math.cos(a) * 4.9, pz + Math.sin(a) * 4.9, 0.45 + rnd() * 0.4); }
    const boat = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.6, 10, 1, false, 0, Math.PI), M('#b5652b')); boat.rotation.z = Math.PI / 2; boat.rotation.y = faceRoad; boat.position.set(px + 1.2, 0.35, pz); boat.scale.set(1, 1, 0.6); shadowize(boat); scene.add(boat);
    const [nx, nz] = W(-3.2, -2.6);
    const net = new THREE.Mesh(new THREE.SphereGeometry(1.1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4f6b3a', wireframe: true })); net.scale.y = 0.55; net.position.set(nx, 0, nz); scene.add(net);
    const stuck = bird(); stuck.position.set(nx, 0.25, nz); scene.add(stuck);
    animated.push(t => { if (!stuck.visible) return; const w = Math.sin(t * 14) * 0.5; stuck.userData.wings[0].rotation.z = w; stuck.userData.wings[1].rotation.z = -w; });
    info.problem.push(net, stuck);
    const free = bird(); free.visible = false; scene.add(free); info.solved.push(free);
    animated.push(t => { if (!free.visible) return; const a = t * 0.8; free.position.set(px + Math.cos(a) * 6, 7 + Math.sin(t) * 0.6, pz + Math.sin(a) * 6); free.rotation.y = -a; const w = Math.sin(t * 6) * 0.6; free.userData.wings[0].rotation.z = w; free.userData.wings[1].rotation.z = -w; });
  }
  if (q.id === 'sort') {
    recyclingBins(...W(-3, -2.5), faceRoad);
    const pile = new THREE.Group(); scene.add(pile);
    await P('cb/box_A', 2.4, -2.2, 0.6, { parent: pile }); await P('cb/box_B', 3.2, -2.8, 0.6, { parent: pile }); await P('cb/trash_A', 2.8, -1.6, 0.7, { parent: pile }); await P('cb/trash_B', 3.6, -1.9, 0.7, { parent: pile });
    [['#bfe9ff', 2, -3], ['#2fae5a', 3.8, -3.2], ['#e23b3b', 2.2, -1.2]].forEach(([c, dx, dz]) => { const [x, z] = W(dx, dz); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.5, 8), M(c)); b.rotation.z = Math.PI / 2; b.position.set(x, 0.13, z); pile.add(b); });
    info.problem.push(pile);
    const [kx, kz] = W(-0.5, -3); recycleBin(kx, kz, '#7a5230'); colliders.push({ x: kx, z: kz, r: 0.5 });
  }
  if (q.id === 'car') {
    const [cx, cz] = W(3, -1.2);
    await prop('cb/car_hatchback', cx, cz, 1.3, { ry: faceRoad + Math.PI / 2, r: 1.3 });
    const [ex, ez] = W(3 - 1.6, -1.2);
    info.problem.push(puffs(ex, 0.35, ez, { n: 6, col: '#5a5550', size: 0.25, rise: 2.4, drift: -0.8, speed: 0.5 }));
    P('cb/streetlight', -2.5, -0.5, 4, { ry: faceRoad, r: 0.3 });
  }
  if (q.id === 'tap') {
    const [tx, tz] = W(-2.5, -2.2);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.1, 0.25), M('#9a9488')); post.position.set(tx, 0.55, tz);
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 6), M('#c0c0c8', { metalness: 0.6, roughness: 0.3 })); spout.rotation.x = Math.PI / 2; spout.position.set(tx + f.x * 0.25, 1.0, tz + f.z * 0.25);
    shadowize(post); scene.add(post, spout); colliders.push({ x: tx, z: tz, r: 0.4 });
    const sx = tx + f.x * 0.42, sz = tz + f.z * 0.42;
    const stream = new THREE.Group(); scene.add(stream);
    for (let k = 0; k < 5; k++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), M('#4fc3f7', { emissive: '#1f8fd6', emissiveIntensity: 0.3 })); d.userData.o = k / 5; stream.add(d); }
    animated.push(t => { if (!stream.visible) return; stream.children.forEach(d => { const k = (t * 1.6 + d.userData.o) % 1; d.position.set(sx, 0.95 - k * 0.95, sz); }); });
    const puddle = new THREE.Mesh(new THREE.CircleGeometry(1.1, 16).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4fc3f7', transparent: true, opacity: 0.75, roughness: 0.1 })); puddle.position.set(sx, 0.04, sz); scene.add(puddle);
    info.problem.push(stream, puddle);
    P('hx/barrel', -4, -3, 1.1, { r: 0.6 }); P('rs/crate_lettuce', 2, -2.5, 0.6, { r: 0.5 }); P('rs/crate_tomatoes', 3.2, -3, 0.6);
    for (let k = 0; k < 5; k++) P('fo/Bush_1_A_Color1', -1 + k * 1.2, -5, 0.6);
  }
  if (q.id === 'bees') {
    beehive(...W(-3.2, -2.2)); beehive(...W(-4.6, -0.8));
    P('hx/fence_wood_straight', -3.8, -4, 0.8, { ry: faceRoad + Math.PI / 2 });
    info.after.forEach(fl => { if (fl) info.solved.push(bees(fl.position.x, fl.position.z, 0.9, 3)); });
    info.solved.forEach(b => b.visible = false);
  }
  if (q.id === 'lights') {
    const [hx, hz] = W(0, -7.5); const h = cottage(hx, hz, faceRoad);
    info.problem.push(...h.lit); h.dark.forEach(o => info.solved.push(o));
    P('cb/streetlight', 3, -1.5, 4, { ry: faceRoad, r: 0.3 });
    for (let k = 0; k < 4; k++) P('fo/Bush_2_C_Color1', -3.5 + k * 2.3, -4.6, 0.8);
  }
  if (q.id === 'bike') {
    const broken = bike(true); const [bx, bz] = W(2.2, -1.6); broken.position.x = bx; broken.position.z = bz; broken.rotation.z = faceRoad; scene.add(broken);
    const ok = bike(false); ok.position.set(bx, 0, bz); ok.rotation.y = faceRoad + Math.PI / 2; ok.visible = false; scene.add(ok);
    info.problem.push(broken); info.solved.push(ok); colliders.push({ x: bx, z: bz, r: 0.8 });
  }
  info.problem.forEach(o => o && o.traverse && o.traverse(m => { if (m.isMesh) m.castShadow = true; }));
  sideInfo.push(info);
  blocked.push({ x: npc.x, z: npc.z, r: q.collect ? 15 : 11 });
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
  const clean = [smogCloud(cx, cz, 14)];   // things that disappear when the zone is restored
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
