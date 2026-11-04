import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { ZONES, SIDE } from './content.js';

// Festival Quest v2 (open world). Same structure as Green Quest (7° básico):
// big island, roads between zones, landmarks, minimap data and side quests on the roads.
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
let seed = 7;
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

// ---------- festival decorations ----------
/** Triangle flags on a string. Returns the group of flags (the poles stay apart). */
function bunting(x1, z1, x2, z2, y, colors, poles = true) {
  const g = new THREE.Group();
  const n = Math.max(4, Math.floor(Math.hypot(x2 - x1, z2 - z1) / 0.8));
  const line = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, Math.hypot(x2 - x1, z2 - z1)), M('#444'));
  line.position.set((x1 + x2) / 2, y, (z1 + z2) / 2); line.rotation.z = Math.PI / 2; line.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
  g.add(line);
  const tri = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.28, 0, 0), new THREE.Vector3(0.28, 0, 0), new THREE.Vector3(0, -0.55, 0)]);
  tri.computeVertexNormals();
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, sag = Math.sin(t * Math.PI) * 0.6;
    const f = new THREE.Mesh(tri, M(colors[i % colors.length], { side: THREE.DoubleSide }));
    f.position.set(x1 + (x2 - x1) * t, y - sag, z1 + (z2 - z1) * t);
    f.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    g.add(f);
  }
  scene.add(g);
  if (poles) for (const [x, z] of [[x1, z1], [x2, z2]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, y + 0.2, 6), M('#7a5230')); p.position.set(x, (y + 0.2) / 2, z); p.castShadow = true; scene.add(p); colliders.push({ x, z, r: 0.3 }); }
  return g;
}

export function paperLantern(x, y, z, color, parent = scene) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), M(color, { emissive: color, emissiveIntensity: 0.6 }));
  body.scale.y = 0.85;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 8), M('#ffcc33'));
  const cap2 = cap.clone(); cap.position.y = 0.38; cap2.position.y = -0.38;
  const tas = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.4, 5), M('#ffcc33')); tas.position.y = -0.62;
  g.add(body, cap, cap2, tas); g.position.set(x, y, z); parent.add(g);
  g.userData.body = body;
  const ph = rnd() * 6;
  animated.push(t => { g.rotation.z = Math.sin(t * 1.3 + ph) * 0.06; });
  return g;
}

export function flame(x, z, s = 1, parent = scene, y = 0) {
  const g = new THREE.Group();
  const cols = ['#ff5a1a', '#ff9a1a', '#ffe14a'];
  cols.forEach((c, i) => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.5 - i * 0.12, 1.4 - i * 0.3, 7), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9 })); m.position.y = 0.7 - i * 0.1; g.add(m); });
  g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
  const ph = rnd() * 9;
  animated.push(t => { if (!g.visible) return; g.children.forEach((m, i) => { m.scale.set(1 + Math.sin(t * 9 + i + ph) * 0.08, 1 + Math.sin(t * 13 + i * 2 + ph) * 0.15, 1); m.rotation.y = t * (1 + i); }); });
  return g;
}

function chileFlag(x, z, h = 4) {
  const cv = document.createElement('canvas'); cv.width = 96; cv.height = 64; const c = cv.getContext('2d');
  c.fillStyle = '#fff'; c.fillRect(0, 0, 96, 32); c.fillStyle = '#d52b1e'; c.fillRect(0, 32, 96, 32); c.fillStyle = '#0039a6'; c.fillRect(0, 0, 32, 32);
  c.fillStyle = '#fff'; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 4 : 10, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(16 + Math.cos(a) * r, 16 + Math.sin(a) * r); } c.fill();
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, h, 6), M('#ddd')); pole.position.set(x, h / 2, z); pole.castShadow = true;
  const geo = new THREE.PlaneGeometry(1.8, 1.2, 8, 1); geo.translate(0.9, 0, 0);
  const fl = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }));
  fl.position.set(x, h - 0.7, z); fl.castShadow = true;
  scene.add(pole, fl); colliders.push({ x, z, r: 0.3 });
  const pos = geo.attributes.position, base = Float32Array.from(pos.array), ph = rnd() * 5;
  animated.push(t => { for (let i = 0; i < pos.count; i++) { const px = base[i * 3]; pos.array[i * 3 + 2] = Math.sin(px * 3 - t * 5 + ph) * 0.12 * px; } pos.needsUpdate = true; });
}

function kiteMesh(color) {
  const shape = new THREE.Shape(); shape.moveTo(0, 0.9); shape.lineTo(0.6, 0); shape.lineTo(0, -0.9); shape.lineTo(-0.6, 0); shape.closePath();
  const k = new THREE.Mesh(new THREE.ShapeGeometry(shape), M(color, { side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.2 }));
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.2, 0.02), M('#ffffff')); tail.position.y = -1.4; k.add(tail);
  return k;
}
/** A kite flying above (x,z), tied to the ground with a string. Returns a group (hide it to remove the kite). */
function kite(x, z, color, h) {
  const g = new THREE.Group(); scene.add(g);
  const k = kiteMesh(color); g.add(k);
  const ph = rnd() * 6;
  const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0.8, z), new THREE.Vector3()]);
  g.add(new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 })));
  animated.push(t => {
    if (!g.visible) return;
    k.position.set(x + Math.sin(t * 0.7 + ph) * 3, h + Math.sin(t * 1.1 + ph) * 1.2, z + 6 + Math.cos(t * 0.5 + ph) * 2);
    k.rotation.set(0.3, Math.sin(t * 0.4 + ph) * 0.4, Math.sin(t * 1.7 + ph) * 0.3);
    const p = lineGeo.attributes.position; p.setXYZ(1, k.position.x, k.position.y - 0.9, k.position.z); p.needsUpdate = true;
  });
  return g;
}

function ruka(x, z) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.2, 1.6, 10), M('#8a6a3c')); wall.position.y = 0.8;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 3.6, 10), M('#c9a24f')); roof.position.y = 3.3;
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, 0.2), M('#3b2614')); door.position.set(0, 0.75, 3.1);
  g.add(wall, roof, door); g.position.set(x, 0, z); g.lookAt(0, 0, 0); g.rotation.x = 0; g.rotation.z = 0;
  shadowize(g); scene.add(g); colliders.push({ x, z, r: 3.4 }); camBlockers.push({ x, z, r: 3.4, y0: 0, y1: 5 });
}

function powderBowl(x, z, color, parent = scene) {
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.3, 0.25, 10), M('#b98a5a')); b.position.set(x, 0.12, z);
  const p = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.45, 10), M(color)); p.position.set(x, 0.45, z);
  shadowize(b); parent.add(b, p);
}

function colourCloud(cx, cz) {
  const n = 160, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), base = [];
  const pal = ['#ff2e93', '#ffd500', '#1fd1ff', '#7cff3a', '#a64dff', '#ff7a1a'].map(c => new THREE.Color(c));
  for (let i = 0; i < n; i++) { base.push([cx + (rnd() - .5) * 18, rnd() * 4, cz + (rnd() - .5) * 18, rnd() * 6]); const c = pal[i % pal.length]; col.set([c.r, c.g, c.b], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.35, vertexColors: true, transparent: true, opacity: 0.85 }));
  scene.add(pts);
  animated.push(t => { for (let i = 0; i < n; i++) { const b = base[i]; pos[i * 3] = b[0] + Math.sin(t * .5 + b[3]) * .8; pos[i * 3 + 1] = 0.5 + ((b[1] + t * 0.6 + b[3]) % 4.5); pos[i * 3 + 2] = b[2] + Math.cos(t * .4 + b[3]) * .8; } g.attributes.position.needsUpdate = true; });
  return pts;
}

function puffs(x, y, z, { n = 6, col = '#9a9a9a', size = 0.4, rise = 3, drift = 1, speed = 0.35 } = {}) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(size, 7, 5), M(col, { transparent: true, opacity: 0.7 })); p.userData.o = i / n; g.add(p); }
  scene.add(g);
  animated.push(t => { if (!g.visible) return; g.children.forEach(p => { const k = (t * speed + p.userData.o) % 1; p.position.set(x + k * drift, y + k * rise, z + Math.sin(k * 6) * 0.3); p.scale.setScalar(0.6 + k * 1.5); p.material.opacity = 0.7 * (1 - k); }); });
  return g;
}

/** Small house with windows that can be lit (Diwali). */
function cottage(x, z, ry) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(5, 3, 4), M('#f6d8b8')); body.position.y = 1.5;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.9, 2, 4), M('#c0503a')); roof.position.y = 4; roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.85);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, 0.1), M('#7a4a2a')); door.position.set(0, 0.85, 2.02);
  g.add(body, roof, door);
  const lit = [], dark = [];
  for (const [wx, wy, wz, rot] of [[-1.6, 1.8, 2.03, 0], [1.6, 1.8, 2.03, 0], [2.53, 1.8, 0, Math.PI / 2], [-2.53, 1.8, 0, Math.PI / 2]]) {
    const on = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.08), M('#fff2a0', { emissive: '#ffd84a', emissiveIntensity: 1.2 })); on.position.set(wx, wy, wz); on.rotation.y = rot;
    const off = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 0.08), M('#3b4a5c', { roughness: 0.3 })); off.position.copy(on.position); off.rotation.y = rot;
    g.add(on, off); lit.push(on); dark.push(off);
  }
  const glow = new THREE.PointLight('#ffb347', 6, 12); glow.position.set(0, 1.5, 4); g.add(glow); lit.push(glow);
  g.position.set(x, 0, z); g.rotation.y = ry; shadowize(g); scene.add(g); colliders.push({ x, z, r: 3.2 }); camBlockers.push({ x, z, r: 3, y0: 0, y1: 5 });
  return { lit, dark };
}

/** Row of clay lamps (diyas). Returns {flames}: hide them for "unlit". */
function diyas(x1, z1, x2, z2, n) {
  const flames = new THREE.Group(); scene.add(flames);
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1), x = x1 + (x2 - x1) * t, z = z1 + (z2 - z1) * t;
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M('#b5652b')); bowl.position.set(x, 0.22, z); shadowize(bowl); scene.add(bowl);
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.25, 6), new THREE.MeshBasicMaterial({ color: '#ffd23a' })); f.position.set(x, 0.36, z); flames.add(f);
  }
  const light = new THREE.PointLight('#ffb347', 5, 8); light.position.set((x1 + x2) / 2, 1, (z1 + z2) / 2); flames.add(light);
  animated.push(t => { if (!flames.visible) return; flames.children.forEach((f, i) => { if (f.isMesh) f.scale.y = 0.85 + Math.sin(t * 11 + i) * 0.2; }); });
  return flames;
}

function rangoli(x, z) {
  const g = new THREE.Group();
  ['#ff2e93', '#ffd500', '#1fd1ff', '#7cff3a', '#ff7a1a'].forEach((c, i) => { const r = new THREE.Mesh(new THREE.RingGeometry(0.3 + i * 0.3, 0.55 + i * 0.3, 8 + i * 2).rotateX(-Math.PI / 2), M(c, { side: THREE.DoubleSide })); r.position.y = 0.03 + i * 0.002; g.add(r); });
  g.position.set(x, 0, z); scene.add(g); return g;
}

function clayOven(x, z) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.9, 2.2), M('#a07850')); base.position.y = 0.45;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 7, 0, Math.PI * 2, 0, Math.PI / 2), M('#c0703a')); dome.position.y = 0.9;
  const mouth = new THREE.Mesh(new THREE.CircleGeometry(0.35, 10, 0, Math.PI), M('#2b1a10', { side: THREE.DoubleSide })); mouth.position.set(0, 0.92, 1.0);
  g.add(base, dome, mouth); g.position.set(x, 0, z); shadowize(g); scene.add(g); colliders.push({ x, z, r: 1.4 });
  return g;
}

function mask(color) {
  const g = new THREE.Group();
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.65, 0.18), M(color, { emissive: color, emissiveIntensity: 0.15 }));
  const hl = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.35, 5), M('#ffd23a')); hl.position.set(-0.2, 0.45, 0); hl.rotation.z = 0.4;
  const hr = hl.clone(); hr.position.x = 0.2; hr.rotation.z = -0.4;
  const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 4), M('#ffffff')); e1.position.set(-0.12, 0.08, 0.1);
  const e2 = e1.clone(); e2.position.x = 0.12;
  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.04), M('#ffffff')); mouth.position.set(0, -0.15, 0.1);
  g.add(face, hl, hr, e1, e2, mouth); return g;
}

/** A glowing thing the player picks up during a side quest. */
function collectible(kind, idx, x, z) {
  const g = new THREE.Group(), item = new THREE.Group();
  if (kind === 'candle') {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.55, 10), M('#fff6e0')); const w = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 4), M('#222')); w.position.y = 0.32; item.add(c, w);
  } else if (kind === 'envelope') {
    const e = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.05), M('#e8322f', { emissive: '#e8322f', emissiveIntensity: 0.2 })); const s = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.06), M('#ffcc33', { metalness: 0.4 })); s.rotation.z = Math.PI / 4; item.add(e, s);
  } else if (kind === 'ingredient') {
    if (idx === 0) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6), M('#9b4f96')); o.scale.y = 0.85; const t = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.2, 5), M('#7ab648')); t.position.y = 0.27; item.add(o, t); }
    else if (idx === 1) item.add(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.22, 0.4), M('#a8423a')));
    else if (idx === 2) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), M('#fffaf0')); e.scale.y = 1.3; item.add(e); }
    else for (let k = 0; k < 3; k++) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.1, 7, 5), M('#2b2b30', { roughness: 0.3 })); o.scale.y = 1.3; o.position.x = (k - 1) * 0.2; item.add(o); }
  } else if (kind === 'petal') {
    const cols = ['#ff6fa8', '#ffd23a', '#ff8a3d', '#e2408f', '#b07cff'], c = cols[idx % cols.length];
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4), M('#3f9a3a')); stem.position.y = -0.2;
    for (let k = 0; k < 5; k++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 4), M(c, { emissive: c, emissiveIntensity: 0.15 })); const a = k / 5 * Math.PI * 2; p.position.set(Math.cos(a) * 0.15, 0.05, Math.sin(a) * 0.15); p.scale.y = 0.4; item.add(p); }
    const mid = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), M('#ffef7a')); mid.position.y = 0.08; item.add(stem, mid);
  } else if (kind === 'mask') {
    item.add(mask(['#e23b3b', '#2f6fe0', '#2fae5a'][idx % 3]));
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 6, 24), new THREE.MeshBasicMaterial({ color: '#29d3e8' })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.05;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 8, 10, 1, true), new THREE.MeshBasicMaterial({ color: '#29d3e8', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 4;
  shadowize(item); g.add(item, ring, beam); g.userData.item = item; g.userData.float = true;
  g.position.set(x, 0, z); g.visible = false; scene.add(g); return g;
}

// ---------- roads ----------
export const roads = [];       // {pts:[Vector3], w}
export const legs = [];        // legs[i] = road that arrives at zone i (side quests stand on it)
export const gates = [];       // entrance of each zone
export const landmarks = [];   // {x,z,r,name} for the minimap
const blocked = [];            // areas where the scattered trees must not grow
const stones = [];

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
  for (let i = 3; i < n - 1; i += 7) { const p = pts[i], s = (i % 2 ? 1 : -1) * (w / 2 + 0.4); const d = pts[i + 1].clone().sub(pts[i - 1]).normalize(); stones.push({ x: p.x - d.z * s, z: p.z + d.x * s }); }
  const road = { pts, w }; roads.push(road); return road;
}

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

// ---------- world ----------
export const pedestals = [];   // central lanterns, one per zone
export const zoneInfo = [];    // {center, npcPos, scrollPos[]}
export const sideInfo = [];    // per side quest: {npcPos, face, items[], after[], problem[], solved[]}
export let greatFire;

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
  const ground = new THREE.Mesh(gg, M('#6cc04a', { roughness: 1 })); ground.receiveShadow = true; scene.add(ground);
  const beach = new THREE.Mesh(new THREE.RingGeometry(ISLAND + 6, ISLAND + 15, 128).rotateX(-Math.PI / 2), M('#f1d9a0')); beach.position.y = -0.05; beach.receiveShadow = true; scene.add(beach);
  const water = new THREE.Mesh(new THREE.CircleGeometry(600, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#3fb3e8', roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.92 }));
  water.position.y = -0.3; scene.add(water);
  animated.push(t => { water.position.y = -0.3 + Math.sin(t * 0.8) * 0.05; });
  const patchCols = ['#5aa83e', '#74c652', '#7fcf5a', '#5fae43', '#8cd166'];
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI * 2, d = 20 + rnd() * (ISLAND - 25), r = 5 + rnd() * 14;
    const p = new THREE.Mesh(new THREE.CircleGeometry(r, 9).rotateX(-Math.PI / 2), M(patchCols[i % patchCols.length], { roughness: 1 }));
    p.position.set(Math.cos(a) * d, 0.006 + (i % 5) * 0.001, Math.sin(a) * d); p.rotation.y = rnd() * 3; p.scale.z = 0.6 + rnd() * 0.6; p.receiveShadow = true; scene.add(p);
  }

  // plaza
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(12, 40).rotateX(-Math.PI / 2), M('#e6cf9e')); plaza.position.y = 0.03; plaza.receiveShadow = true; scene.add(plaza);
  const ringStone = new THREE.Mesh(new THREE.RingGeometry(11.6, 12.4, 40).rotateX(-Math.PI / 2), M('#c2a26b')); ringStone.position.y = 0.035; scene.add(ringStone);

  // roads: plaza → each zone (spokes) and zone → next zone (a big pentagon)
  const pads = ['#f0c48a', '#f2b8a8', '#cfe0f5', '#f3c9ef', '#bfe3b0'];
  for (let i = 0; i < 5; i++) {
    const p = zonePos(i), dir = p.clone().normalize();
    gates.push(dir.clone().multiplyScalar(GATE_R));
    const pad = new THREE.Mesh(new THREE.CircleGeometry(14, 36).rotateX(-Math.PI / 2), M(pads[i])); pad.position.set(p.x, 0.025, p.z); pad.receiveShadow = true; scene.add(pad);
    blocked.push({ x: p.x, z: p.z, r: 23 });
  }
  const spokes = gates.map(g => makeRoad(g.clone().normalize().multiplyScalar(11.5), g, 5, 2, 3.4, '#e2c58e', 0.02));
  const chords = gates.map((g, i) => makeRoad(g, gates[(i + 1) % 5], 7, 3, 3.4, '#d8bb84', 0.022));
  legs.push(spokes[0], chords[0], chords[1], chords[2], chords[3]);
  // signposts at each zone entrance
  gates.forEach((g, i) => {
    const d = g.clone().normalize(), side = new THREE.Vector3(-d.z, 0, d.x), x = g.x + side.x * 3.4, z = g.z + side.z * 3.4;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.6, 0.22), M('#8a5a2b')); post.position.set(x, 1.3, z);
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.12), M(ZONES[i].color)); board.position.set(x, 2.4, z); board.rotation.y = Math.atan2(d.x, d.z);
    shadowize(post); shadowize(board); scene.add(post, board); colliders.push({ x, z, r: 0.3 });
  });

  // Great Festival Fire (centre)
  await prop('rb/Wood_Log_Stack', 0, 0, 1.2, { r: 2.2, ry: 0 });
  const stonesRing = new THREE.Mesh(new THREE.TorusGeometry(2, 0.35, 6, 14).rotateX(Math.PI / 2), M('#8f8f9a')); stonesRing.position.y = 0.2; shadowize(stonesRing); scene.add(stonesRing);
  greatFire = new THREE.Group(); scene.add(greatFire);
  flame(0, 0, 2.6, greatFire); flame(0.8, 0.4, 1.6, greatFire); flame(-0.7, -0.5, 1.8, greatFire);
  greatFire.visible = false;
  const fireLight = new THREE.PointLight('#ff9a3a', 0, 30); fireLight.position.y = 3; scene.add(fireLight); greatFire.userData.light = fireLight;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * Math.PI * 2 / 5, x = Math.cos(a) * 6.5, z = Math.sin(a) * 6.5;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 1.3, 8), M('#b9a27a')); ped.position.set(x, 0.65, z); shadowize(ped); scene.add(ped);
    colliders.push({ x, z, r: 0.7 });
    const l = paperLantern(x, 1.9, z, '#777777');
    l.userData.body.material.emissiveIntensity = 0;
    pedestals.push({ lantern: l, color: ZONES[i].color });
  }
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i + 0.5) * Math.PI * 2 / 5;
    prop('cb/bench', Math.cos(a) * 10, Math.sin(a) * 10, 0.9, { ry: -a - Math.PI / 2, r: 1 });
    prop('cb/streetlight', Math.cos(a) * 12.8, Math.sin(a) * 12.8, 4.5, { ry: -a + Math.PI / 2, r: 0.4 });
  }

  // village houses around the plaza
  const houses = ['hx/building_home_A_red', 'hx/building_home_B_yellow', 'hx/building_tavern_red', 'hx/building_home_A_yellow', 'hx/building_church_red', 'hx/building_home_B_red'];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i + 0.5) * Math.PI * 2 / 5;
    for (const [d, off] of [[24, -0.12], [31, 0.1]]) {
      const x = Math.cos(a + off) * d, z = Math.sin(a + off) * d;
      prop(houses[(i * 2 + (d > 25 ? 1 : 0)) % houses.length], x, z, 6.5, { ry: -a - Math.PI / 2, r: 3.6 });
      blocked.push({ x, z, r: 6 });
    }
    // festival bunting between the two houses of each pair
    const x1 = Math.cos(a - 0.12) * 24, z1 = Math.sin(a - 0.12) * 24, x2 = Math.cos(a + 0.1) * 31, z2 = Math.sin(a + 0.1) * 31;
    bunting(x1 + (x2 - x1) * 0.25, z1 + (z2 - z1) * 0.25, x1 + (x2 - x1) * 0.75, z1 + (z2 - z1) * 0.75, 4.2, ['#ff2e93', '#ffd500', '#1fd1ff', '#7cff3a', '#ff7a1a']);
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
  const forestC = zonePos(4);   // We Tripantu: thicker woods
  let nt = 0;
  for (let k = 0; k < 9000 && nt < 520; k++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * (ISLAND - 4), x = Math.cos(a) * d, z = Math.sin(a) * d;
    let dens = 0.5 + 0.5 * Math.sin(x * 0.045 + 1.3) * Math.cos(z * 0.05 - 0.7);
    if (Math.hypot(x - forestC.x, z - forestC.z) < 55) dens += 0.45;
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
  for (let c = 0; c < 45; c++) {
    const a = rnd() * Math.PI * 2, d = 18 + rnd() * (ISLAND - 22), cx = Math.cos(a) * d, cz = Math.sin(a) * d;
    for (let k = 0; k < 22; k++) { const x = cx + (rnd() - .5) * 9, z = cz + (rnd() - .5) * 9; if (isFree(x, z, -2.2)) F.push({ x, z }); }
  }
  flowerField(F);
  await scatter('fo/Rock_2_C_Color1', stones.map(s => ({ ...s, h: 0.25 + rnd() * 0.2 })), { shadow: false });
}

// Landmarks between the zones, so the walk from one zone to the next has things to see.
async function buildLandmarks() {
  const at = (i, r, off = 0) => { const a = -Math.PI / 2 + (i + 0.5) * Math.PI * 2 / 5 + off; return [Math.cos(a) * r, Math.sin(a) * r, a]; };
  const face = (x, z) => Math.atan2(-x, -z);

  { // Lantern Lake (between Day of the Dead and Lunar New Year): floating lanterns on the water
    const [x, z] = at(0, 60), r = 12;
    const sand = new THREE.Mesh(new THREE.CircleGeometry(r + 1.6, 30).rotateX(-Math.PI / 2), M('#e6d29a')); sand.position.set(x, 0.03, z); scene.add(sand);
    const lake = new THREE.Mesh(new THREE.CircleGeometry(r, 30).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#2aa6e0', roughness: 0.12, metalness: 0.1 })); lake.position.set(x, 0.05, z); scene.add(lake);
    colliders.push({ x, z, r: r - 0.4 });
    for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2; prop(['fo/Rock_1_A_Color1', 'fo/Rock_3_A_Color1', 'fo/Rock_2_C_Color1'][k % 3], x + Math.cos(a) * (r + 0.6), z + Math.sin(a) * (r + 0.6), 0.5 + rnd() * 0.6); }
    for (let k = 0; k < 6; k++) { const a = rnd() * 6.28, d = rnd() * (r - 2); prop(k % 2 ? 'hx/waterlily_A' : 'hx/waterlily_B', x + Math.cos(a) * d, z + Math.sin(a) * d, 0.15, { y: 0.06 }); }
    const cols = ['#e8322f', '#ffcc33', '#ff7a1a', '#e2408f'];
    for (let k = 0; k < 10; k++) {
      const l = paperLantern(0, 0.45, 0, cols[k % 4]); l.scale.setScalar(0.7);
      const rr = 2 + rnd() * (r - 4), ph = rnd() * 6, sp = 0.04 + rnd() * 0.05;
      animated.push(t => { const a = ph + t * sp; l.position.set(x + Math.cos(a) * rr, 0.42 + Math.sin(t * 1.5 + ph) * 0.04, z + Math.sin(a) * rr); });
    }
    const [dx, dz] = [x * 0.86, z * 0.86];
    const dock = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 6), M('#a07040')); dock.position.set(dx, 0.2, dz); dock.rotation.y = face(x, z); shadowize(dock); scene.add(dock);
    landmarks.push({ x, z, r, name: 'Lantern Lake', lake: true });
    blocked.push({ x, z, r: r + 5 });
  }
  { // Harbour village (between Lunar New Year and Fiestas Patrias)
    const [x, z, a] = at(1, 62);
    const spots = [['hx/building_home_A_blue', -7, 0], ['hx/building_tavern_yellow', 0, -6], ['hx/building_home_B_blue', 7, 0], ['hx/building_home_A_red', 0, 7]];
    const c = Math.cos(a), s = Math.sin(a);
    for (const [k, lx, lz] of spots) { const px = x + lx * c - lz * s, pz = z + lx * s + lz * c; await prop(k, px, pz, 6.5, { ry: Math.atan2(x - px, z - pz), r: 3.4 }); }
    prop('hx/building_well_yellow', x, z, 3, { r: 1.4 });
    for (let k = 0; k < 6; k++) prop(k % 2 ? 'hx/barrel' : 'hx/crate_A_big', x + (rnd() - .5) * 10, z + (rnd() - .5) * 10, 0.9, { r: 0.6 });
    bunting(x - 6, z - 6, x + 6, z + 6, 4.5, ['#e8322f', '#ffcc33', '#2f6fe0'], false);
    landmarks.push({ x, z, r: 10, name: 'Harbour Village' }); blocked.push({ x, z, r: 15 });
  }
  { // Market square (between Fiestas Patrias and Holi)
    const [x, z] = at(2, 62);
    const sq = new THREE.Mesh(new THREE.CircleGeometry(9, 24).rotateX(-Math.PI / 2), M('#e6cf9e')); sq.position.set(x, 0.03, z); sq.receiveShadow = true; scene.add(sq);
    await prop('hx/building_market_red', x, z - 6, 6, { ry: 0, r: 3.4 });
    await prop('hx/building_church_yellow', x - 8, z + 3, 7, { ry: Math.PI / 2, r: 3.6 });
    await prop('hx/building_home_A_yellow', x + 8, z + 3, 6, { ry: -Math.PI / 2, r: 3.4 });
    ['rs/crate_tomatoes', 'rs/crate_carrots', 'rs/crate_onions', 'rs/crate_potatoes'].forEach((k, i) => prop(k, x - 3 + i * 1.6, z - 1.5, 0.6, { r: 0.5 }));
    prop('hx/wheelbarrow', x + 3, z + 3, 0.9, { r: 0.6 }); prop('hx/sack', x - 3, z + 3, 0.7);
    for (let k = 0; k < 5; k++) paperLantern(x - 4 + k * 2, 3.6, z + 1, ['#e8322f', '#ffcc33', '#2f6fe0', '#e2408f', '#2fae5a'][k]);
    bunting(x - 6, z + 1, x + 6, z + 1, 4.1, ['#ff2e93', '#ffd500', '#1fd1ff']);
    landmarks.push({ x, z, r: 9, name: 'Market Square' }); blocked.push({ x, z, r: 14 });
  }
  { // Harvest fields (between Holi and We Tripantu)
    const [x, z] = at(3, 62);
    await prop('hx/building_windmill_yellow', x, z, 8, { ry: face(x, z), r: 2.6 });
    prop('hx/building_grain', x + 6, z + 4, 3, { r: 1.8 });
    const wheat = new THREE.InstancedMesh(new THREE.ConeGeometry(0.18, 1.1, 4), M('#e8c34a', { emissive: '#7a5a00', emissiveIntensity: 0.1 }), 900); wheat.frustumCulled = false;
    const mat = new THREE.Matrix4(); let n = 0;
    for (let r = 0; r < 30; r++) for (let q = 0; q < 30; q++) { const lx = -14 + q * 0.95, lz = -16 + r * 0.95; if (Math.hypot(lx, lz) < 6) continue; const px = x + lx + rnd() * 0.3, pz = z + lz + rnd() * 0.3; if (distToRoads(px, pz) < 3) continue; wheat.setMatrixAt(n++, mat.makeTranslation(px, 0.55, pz)); }
    wheat.count = n; wheat.castShadow = true; scene.add(wheat);
    landmarks.push({ x, z, r: 14, name: 'Harvest Fields' }); blocked.push({ x, z, r: 18 });
  }
  { // Stone circle (between We Tripantu and Day of the Dead)
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
      const a = Math.PI + (k - (N - 1) / 2) * (2.4 / Math.max(1, N - 1)) + (rnd() - .5) * 0.3, d = 6 + rnd() * 6;
      const [x, z] = W(Math.sin(a) * d, Math.cos(a) * d);
      info.items.push(collectible(q.collect.kind, k, x, z));
      info.after.push(null);
    }
  }
  if (q.id === 'picado') {
    const cols = ['#ff2e93', '#ffd500', '#1fd1ff', '#7cff3a', '#ff7a1a', '#a64dff'];
    const [ax, az] = W(-4, -2.5), [bx, bz] = W(4, -2.5);
    info.solved.push(hide(bunting(ax, az, bx, bz, 3.6, cols)));
    const fallen = new THREE.Group(); scene.add(fallen);
    for (let k = 0; k < 9; k++) { const [x, z] = W(-3 + k * 0.75 + (rnd() - .5) * 0.4, -1.6 + (rnd() - .5) * 0.8); const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.55).rotateX(-Math.PI / 2), M(cols[k % cols.length], { side: THREE.DoubleSide })); fl.position.set(x, 0.04, z); fl.rotation.y = rnd() * 3; fallen.add(fl); }
    info.problem.push(fallen);
    P('dg/table_small_decorated_A', 2.8, -0.8, 0.9, { r: 0.6 });
  }
  if (q.id === 'candles') {
    await P('dg/table_medium_tablecloth_decorated_B', 0, -2.6, 1.1, { ry: faceRoad, r: 1.2 });
    for (let k = 0; k < 6; k++) P(k % 2 ? 'hw/pumpkin_orange_small' : 'hw/pumpkin_yellow', -2.4 + k, -1.2, 0.4);
    const lit = new THREE.Group(); scene.add(lit);
    for (let k = 0; k < 5; k++) { const [x, z] = W(-0.8 + k * 0.4, -2.6); await prop('hw/candle_thin', x, z, 0.4, { y: 1.1, parent: lit }); flame(x, z, 0.09, lit, 1.5); }
    const glow = new THREE.PointLight('#ffb347', 4, 7); const [gx, gz] = W(0, -2); glow.position.set(gx, 2, gz); lit.add(glow);
    info.solved.push(hide(lit));
  }
  if (q.id === 'envelopes') {
    P('hx/tent', 3.5, -4.5, 2.5, { ry: faceRoad + 0.4, r: 1.6 });
    P('dg/chest_gold', -2.5, -1.8, 0.7, { r: 0.5 });
    const ls = new THREE.Group(); scene.add(ls);
    for (let k = 0; k < 4; k++) { const [x, z] = W(-3 + k * 2, -3.5); paperLantern(x, 3, z, k % 2 ? '#ffcc33' : '#e8322f', ls); }
    const [ax, az] = W(-4, -3.5), [bx, bz] = W(4, -3.5);
    info.solved.push(hide(ls)); bunting(ax, az, bx, bz, 3.6, ['#e8322f', '#ffcc33']);
  }
  if (q.id === 'skylantern') {
    await P('fo/Tree_2_A_Color1', -3, -4, 7, { r: 0.9, ry: 0 });
    const [tx, tz] = W(-2.3, -1.8);
    const stuck = paperLantern(tx, 3.7, tz, '#ffcc33'); info.problem.push(stuck);
    const [hx, hz] = W(2.2, -1.2);
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.6, 0.15), M('#7a5230')); post.position.set(hx, 1.3, hz);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.1, 0.1), M('#7a5230')); arm.position.set(hx, 2.55, hz); arm.rotation.y = faceRoad;
    shadowize(post); scene.add(post, arm); colliders.push({ x: hx, z: hz, r: 0.3 });
    const safe = new THREE.Group(); scene.add(safe); paperLantern(hx, 1.9, hz, '#ffcc33', safe); info.solved.push(hide(safe));
  }
  if (q.id === 'kite') {
    await P('fo/Tree_1_A_Color1', 3, -4, 7, { r: 0.9, ry: 0 });
    const [kx, kz] = W(2.3, -1.8);
    const stuck = kiteMesh('#2f6fe0'); stuck.position.set(kx, 3.9, kz); stuck.rotation.set(0.6, faceRoad, 0.8); scene.add(stuck); info.problem.push(stuck);
    const [fx, fz] = W(-1.5, -1);
    info.solved.push(hide(kite(fx, fz, '#2f6fe0', 12)));
  }
  if (q.id === 'empanadas') {
    const [ox, oz] = W(-3, -3); clayOven(ox, oz);
    await P('dg/table_long_tablecloth_decorated_A', 2.4, -2.6, 1.1, { ry: faceRoad, r: 1.4 });
    const tray = new THREE.Group(); scene.add(tray);
    for (let k = 0; k < 6; k++) { const [x, z] = W(1.6 + (k % 3) * 0.55, -2.4 - Math.floor(k / 3) * 0.5); const e = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.1, 10, 1, false, 0, Math.PI), M('#e0a548')); e.rotation.y = faceRoad; e.position.set(x, 1.17, z); tray.add(e); }
    tray.add(puffs(ox, 2, oz, { n: 6, col: '#cfcfcf', size: 0.3, rise: 3, drift: 0.6 }));
    info.solved.push(hide(tray));
    chileFlag(...W(-5, -0.5), 3.5);
  }
  if (q.id === 'petals') {
    const bowls = new THREE.Group(); scene.add(bowls);
    ['#ff2e93', '#ffd500', '#ff7a1a', '#7cff3a'].forEach((c, k) => { const [x, z] = W(-1.8 + k * 1.2, -2); powderBowl(x, z, c, bowls); });
    info.solved.push(hide(bowls));
    P('rb/Textiles_A', 2.8, -1.5, 0.5);
  }
  if (q.id === 'diwali') {
    const [hx, hz] = W(0, -7.5); const h = cottage(hx, hz, faceRoad);
    h.lit.forEach(o => info.solved.push(o)); h.dark.forEach(o => info.problem.push(o));
    const [ax, az] = W(-3, -4.6), [bx, bz] = W(3, -4.6);
    info.solved.push(diyas(ax, az, bx, bz, 9));
    const [rx, rz] = W(0, -2.6); info.solved.push(rangoli(rx, rz));
  }
  if (q.id === 'masks') {
    P('hx/building_stage_A', 0, -5, 2, { ry: faceRoad, r: 2.8 });
    const shown = new THREE.Group(); scene.add(shown);
    for (let k = 0; k < 3; k++) { const [x, z] = W(-2 + k * 2, -2.2); const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), M('#7a5230')); post.position.set(x, 0.8, z); shown.add(post); const m = mask(['#e23b3b', '#2f6fe0', '#2fae5a'][k]); m.position.set(x, 1.9, z); m.rotation.y = faceRoad; shown.add(m); }
    info.solved.push(hide(shown));
  }
  if (q.id === 'pumpkins') {
    const plain = new THREE.Group(), carved = new THREE.Group(); scene.add(plain, carved);
    for (let k = 0; k < 5; k++) { const [x, z] = W(-2.4 + k * 1.2, -2.2 - (k % 2) * 0.6); await prop('hw/pumpkin_orange', x, z, 0.7, { ry: faceRoad, parent: plain }); await prop('hw/pumpkin_orange_jackolantern', x, z, 0.7, { ry: faceRoad, parent: carved }); }
    const glow = new THREE.PointLight('#ff8a1f', 5, 8); const [gx, gz] = W(0, -1.5); glow.position.set(gx, 1, gz); carved.add(glow);
    info.problem.push(plain); info.solved.push(hide(carved));
    P('hw/fence', -4, -3.5, 1, { ry: faceRoad + Math.PI / 2 }); P('hw/lantern_standing', 3.8, -1.5, 2, { r: 0.4 });
  }
  info.problem.forEach(o => o && o.traverse && o.traverse(m => { if (m.isMesh) m.castShadow = true; }));
  sideInfo.push(info);
  blocked.push({ x: npc.x, z: npc.z, r: q.collect ? 15 : 11 });
}

// Local zone coordinates: +dz points toward the plaza (front), -dz is the back.
const SCROLL_OFFS = {
  muertos: [[-6, -8], [7, 0], [-4, 6]],
  lunar: [[-7, 3], [7, 2], [0, -7]],
  patrias: [[-8, -8], [3, -7], [-5, 5]],
  holi: [[-8, -2], [3, -8], [6, 5]],
  tripantu: [[-8, 2], [6, -6], [-1, -9]],
};

async function buildZone(i) {
  const z = ZONES[i], c = zonePos(i), cx = c.x, cz = c.z;
  const u = new THREE.Vector3(-cx, 0, -cz).normalize();       // toward plaza
  const rt = new THREE.Vector3(-u.z, 0, u.x);                  // local right
  const W = (dx, dz) => [cx + rt.x * dx + u.x * dz, cz + rt.z * dx + u.z * dz];
  const toC = Math.atan2(u.x, u.z);                            // rotation that faces the plaza
  const V = (dx, dz) => { const [x, zz] = W(dx, dz); return new THREE.Vector3(x, 0, zz); };
  const npcPos = V(0, 2.5);
  zoneInfo.push({ center: c, npcPos, scrollPos: SCROLL_OFFS[z.id].map(([dx, dz]) => V(dx, dz)) });
  const P = (k, dx, dz, h, o = {}) => { const [x, zz] = W(dx, dz); return prop(k, x, zz, h, o); };
  const B = (a, b, y, cols) => { const [x1, z1] = W(...a), [x2, z2] = W(...b); bunting(x1, z1, x2, z2, y, cols); };
  const L = (dx, dz, y, col) => { const [x, zz] = W(dx, dz); return paperLantern(x, y, zz, col); };
  const F = (dx, dz, s) => { const [x, zz] = W(dx, dz); return flame(x, zz, s); };

  if (z.id === 'muertos') {
    await P('hw/arch', 0, 8.5, 4.2, { ry: toC });
    await P('dg/table_long_tablecloth_decorated_A', 0, -2, 1.1, { ry: toC, r: 1.8 });
    for (const dx of [-2.8, 2.8]) await P('hw/shrine_candles', dx, -2.5, 1.8, { ry: toC, r: 0.9 });
    await P('hw/plaque_candles', 0, -4.2, 1.6, { ry: toC, r: 0.8 });
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; P(k % 2 ? 'hw/candle_triple' : 'hw/skull_candle', Math.cos(a) * 6.5, Math.sin(a) * 6.5, 0.6); }
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + .3; P(k % 2 ? 'hw/pumpkin_orange_small' : 'hw/pumpkin_yellow', Math.cos(a) * 4.8, Math.sin(a) * 4.8, 0.5); }
    for (const [dx, dz] of [[-8, -5], [8, -5], [-9, 3], [9, 3]]) P(dx > 0 ? 'hw/tree_pine_orange_large' : 'hw/tree_pine_yellow_medium', dx, dz, 5.5, { r: 1 });
    P('hw/lantern_standing', -4, 1, 2.2, { r: 0.4 }); P('hw/lantern_standing', 4, 1, 2.2, { r: 0.4 });
    B([-6, -1], [6, -1], 4, ['#ff2e93', '#ffd500', '#1fd1ff', '#7cff3a', '#ff7a1a', '#a64dff']);
    B([-6, -5.5], [6, -5.5], 4, ['#ff7a1a', '#a64dff', '#ff2e93', '#ffd500']);
  }
  if (z.id === 'lunar') {
    await P('hx/building_market_yellow', 6.5, -5.5, 5, { ry: toC, r: 3.5 });
    await P('hx/building_tavern_red', -6.5, -5.5, 6, { ry: toC, r: 3.5 });
    await P('dg/table_medium_tablecloth_decorated_B', 0, -1.5, 1.1, { r: 1.2 }); P('rs/stew_pot', 0.3, -1.5, 0.5, { y: 1.05 });
    P('dg/chest_gold', -3, 0.5, 0.9, { r: 0.7 }); P('dg/coin_stack_large', -2.2, -0.8, 0.5); P('rs/crate_buns', 3, 0.5, 0.8, { r: 0.6 });
    for (const dx of [-4, 4]) P('dg/banner_triple_red', dx, 5, 3.2, { ry: toC, r: 0.4 });
    for (let k = 0; k < 7; k++) L(-6 + k * 2, 1, 3.6 - Math.sin(k / 6 * Math.PI) * 0.5, '#e8322f');
    B([-7, 1], [7, 1], 4.2, ['#e8322f', '#ffcc33']);
    for (let k = 0; k < 6; k++) L(-5 + k * 2, -9, 3.2, k % 2 ? '#ffcc33' : '#e8322f');
    B([-6, -9], [6, -9], 3.8, ['#e8322f', '#ffcc33']);
  }
  if (z.id === 'patrias') {
    await P('hx/tent', -6, -4, 3.5, { ry: toC, r: 2.4 });
    await P('hx/building_stage_A', 6, -4, 2.5, { ry: toC, r: 3 });
    for (const [dx, dz, h] of [[-7, 2, 4], [7, 2, 4], [0, -8, 5]]) { const [x, zz] = W(dx, dz); chileFlag(x, zz, h); }
    await P('dg/table_long_tablecloth_decorated_A', 0, -1.5, 1.1, { ry: toC, r: 1.6 }); P('rs/food_dinner', 0, -1.5, 0.35, { y: 1.1 });
    P('dg/barrel_large', -2.8, 0, 1.2, { r: 0.7 }); P('rs/chair_A', 2.6, 0, 1); P('rs/crate_tomatoes', -3, -3, 0.7);
    const [px, pz] = W(8, -8);
    const palo = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 9, 8), M('#b07a3a')); palo.position.set(px, 4.5, pz); shadowize(palo); scene.add(palo); colliders.push({ x: px, z: pz, r: 0.4 });
    B([-6, 0.8], [6, 0.8], 4, ['#d52b1e', '#ffffff', '#0039a6']);
    for (let k = 0; k < 5; k++) { const [x, zz] = W(-10 + k * 5, -10 + (k % 2) * 4); kite(x, zz, ['#d52b1e', '#0039a6', '#ffd500', '#ffffff', '#2fae5a'][k], 13 + k * 1.5); }
  }
  if (z.id === 'holi') {
    await P('hx/building_home_A_yellow', 6.5, -5.5, 6, { ry: toC, r: 3.5 });
    P('rb/Textiles_Stack_Large_Colored', -5, -4, 1.4, { r: 1.2 }); P('rb/Textiles_A', -3.5, -5.8, 0.6);
    P('dg/table_medium_tablecloth_decorated_B', 0, -1.5, 1.1, { r: 1.2 });
    const pc = ['#ff2e93', '#ffd500', '#1fd1ff', '#7cff3a', '#a64dff', '#ff7a1a'];
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + 0.5; const [x, zz] = W(Math.cos(a) * 4.5, Math.sin(a) * 4.5 - 1); powderBowl(x, zz, pc[k]); }
    await P('rb/Wood_Log_Stack', -6, 3, 0.9, { r: 1.2 }); F(-6, 3, 1.2);
    B([-7, 0.8], [7, 0.8], 4, pc);
    B([-7, -7], [7, -7], 4, pc.slice().reverse());
    colourCloud(cx, cz);
  }
  if (z.id === 'tripantu') {
    const [rx, rz] = W(-4, -5); ruka(rx, rz);
    await P('rb/Wood_Log_Stack', 3, -1, 0.9, { r: 1.2 }); F(3, -1, 1.3);
    for (const [dx, dz] of [[1.5, -3], [4.5, -3], [5.2, 0.6]]) P('rb/Wood_Log_A', dx, dz, 0.45);
    const [wx, wz] = W(10, -4);
    const river = new THREE.Mesh(new THREE.PlaneGeometry(4, 24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4fc3f7', roughness: 0.2, transparent: true, opacity: 0.9 }));
    river.position.set(wx, 0.04, wz); river.rotation.y = toC; scene.add(river);
    for (let k = 0; k < 9; k++) P(['fo/Rock_1_A_Color1', 'fo/Rock_3_A_Color1', 'fo/Rock_2_C_Color1'][k % 3], 7.6 + (k % 2) * 4.8, -15 + k * 2.7, 0.6);
    for (let k = 0; k < 26; k++) {
      const a = rnd() * Math.PI * 2, d = 10 + rnd() * 6, dx = Math.cos(a) * d, dz = Math.sin(a) * d;
      if (dz > 4 && Math.abs(dx) < 5) continue;   // keep the entrance path clear
      if (Math.abs(dx - 10) < 3) continue;          // keep the river clear
      P(['fo/Tree_1_A_Color1', 'fo/Tree_3_A_Color1', 'fo/Tree_4_A_Color1'][k % 3], dx, dz, 6 + rnd() * 3, { r: 0.9 });
    }
    const [kx, kz] = W(-1.5, 0.5);
    const kul = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.2, 0.4, 12), M('#a0522d')); kul.position.set(kx, 0.2, kz); scene.add(kul);
    const top = new THREE.Mesh(new THREE.CircleGeometry(0.5, 12).rotateX(-Math.PI / 2), M('#f0e0c0')); top.position.set(kx, 0.41, kz); scene.add(top);
  }
}
