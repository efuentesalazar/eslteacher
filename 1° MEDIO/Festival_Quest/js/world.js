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
    cache[url] = new Promise((res, rej) => loader.load(url, g => { loadDone++; onProgress(loadDone / loadTotal); res(g); }, undefined, e => { loadDone++; console.warn('No se pudo cargar', url, e); res(null); }));
  }
  return cache[url];
}

// ---------- helpers ----------
let seed = 7;
export function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
export function zonePos(i) { const a = -Math.PI / 2 + i * (Math.PI * 2 / 5); return new THREE.Vector3(Math.cos(a) * ZONE_R, 0, Math.sin(a) * ZONE_R); }

function shadowize(o) { o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); }

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

// ---------- custom decorations ----------
const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true, ...extra });

function bunting(x1, z1, x2, z2, y, colors) {
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
  for (const [x, z] of [[x1, z1], [x2, z2]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, y + 0.2, 6), M('#7a5230')); p.position.set(x, (y + 0.2) / 2, z); p.castShadow = true; scene.add(p); colliders.push({ x, z, r: 0.3 }); }
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

export function flame(x, z, s = 1, parent = scene) {
  const g = new THREE.Group();
  const cols = ['#ff5a1a', '#ff9a1a', '#ffe14a'];
  cols.forEach((c, i) => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.5 - i * 0.12, 1.4 - i * 0.3, 7), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9 })); m.position.y = 0.7 - i * 0.1; g.add(m); });
  g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
  const ph = rnd() * 9;
  animated.push(t => { g.children.forEach((m, i) => { m.scale.set(1 + Math.sin(t * 9 + i + ph) * 0.08, 1 + Math.sin(t * 13 + i * 2 + ph) * 0.15, 1); m.rotation.y = t * (1 + i); }); });
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

function kite(x, z, color, h) {
  const shape = new THREE.Shape(); shape.moveTo(0, 0.9); shape.lineTo(0.6, 0); shape.lineTo(0, -0.9); shape.lineTo(-0.6, 0); shape.closePath();
  const k = new THREE.Mesh(new THREE.ShapeGeometry(shape), M(color, { side: THREE.DoubleSide, emissive: color, emissiveIntensity: 0.2 }));
  scene.add(k);
  const ph = rnd() * 6;
  const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0, z), new THREE.Vector3()]);
  const ln = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.6 }));
  scene.add(ln);
  animated.push(t => {
    k.position.set(x + Math.sin(t * 0.7 + ph) * 3, h + Math.sin(t * 1.1 + ph) * 1.2, z + 6 + Math.cos(t * 0.5 + ph) * 2);
    k.rotation.set(0.3, Math.sin(t * 0.4 + ph) * 0.4, Math.sin(t * 1.7 + ph) * 0.3);
    const p = lineGeo.attributes.position; p.setXYZ(1, k.position.x, k.position.y - 0.9, k.position.z); p.needsUpdate = true;
  });
}

function ruka(x, z) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(3, 3.2, 1.6, 10), M('#8a6a3c')); wall.position.y = 0.8;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 3.6, 10), M('#c9a24f')); roof.position.y = 3.3;
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, 0.2), M('#3b2614')); door.position.set(0, 0.75, 3.1);
  g.add(wall, roof, door); g.position.set(x, 0, z); g.lookAt(0, 0, 0); g.rotation.x = 0; g.rotation.z = 0;
  shadowize(g); scene.add(g); colliders.push({ x, z, r: 3.4 });
}

function powderBowl(x, z, color) {
  const b = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.3, 0.25, 10), M('#b98a5a')); b.position.set(x, 0.12, z);
  const p = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.45, 10), M(color)); p.position.set(x, 0.45, z);
  shadowize(b); scene.add(b, p);
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

// ---------- world ----------
export const pedestals = [];   // central lanterns, one per zone
export const zoneInfo = [];    // {center, npcPos, scrollPos[]}
export let greatFire;

export async function buildWorld() {
  // sky + light
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

  // island ground with gentle colour variation
  const gg = new THREE.CircleGeometry(ISLAND + 6, 96, 0, Math.PI * 2); gg.rotateX(-Math.PI / 2);
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
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(12, 40).rotateX(-Math.PI / 2), M('#e6cf9e')); plaza.position.y = 0.02; plaza.receiveShadow = true; scene.add(plaza);
  const ringStone = new THREE.Mesh(new THREE.RingGeometry(11.6, 12.4, 40).rotateX(-Math.PI / 2), M('#c2a26b')); ringStone.position.y = 0.03; scene.add(ringStone);
  for (let i = 0; i < 5; i++) {
    const p = zonePos(i), len = ZONE_R - 12;
    const path = new THREE.Mesh(new THREE.PlaneGeometry(3.2, len).rotateX(-Math.PI / 2), M('#e2c58e'));
    path.position.set(p.x * 0.5 + p.x / ZONE_R * 6 * 0.5 * 0, 0.015, 0);
    const mid = p.clone().multiplyScalar((12 + len / 2) / ZONE_R);
    path.position.set(mid.x, 0.015, mid.z); path.rotation.y = -Math.atan2(p.z, p.x) + Math.PI / 2; path.receiveShadow = true; scene.add(path);
    const pad = new THREE.Mesh(new THREE.CircleGeometry(9, 32).rotateX(-Math.PI / 2), M(['#f0c48a', '#f2b8a8', '#cfe0f5', '#f3c9ef', '#bfe3b0'][i])); pad.position.set(p.x, 0.02, p.z); pad.receiveShadow = true; scene.add(pad);
  }

  // Great Festival Fire (centre)
  await prop('rb/Wood_Log_Stack', 0, 0, 1.2, { r: 2.2, ry: 0 });
  const stones = new THREE.Mesh(new THREE.TorusGeometry(2, 0.35, 6, 14).rotateX(Math.PI / 2), M('#8f8f9a')); stones.position.y = 0.2; shadowize(stones); scene.add(stones);
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

  // village houses between zones
  const houses = ['hx/building_home_A_red', 'hx/building_home_B_yellow', 'hx/building_tavern_red', 'hx/building_home_A_yellow', 'hx/building_church_red', 'hx/building_home_B_red', 'hx/building_well_red', 'hx/building_windmill_yellow'];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i + 0.5) * Math.PI * 2 / 5;
    for (const [d, off] of [[22, -0.12], [27, 0.1]]) {
      const x = Math.cos(a + off) * d, z = Math.sin(a + off) * d;
      prop(houses[(i * 2 + (d > 25 ? 1 : 0)) % houses.length], x, z, 6.5, { ry: -a - Math.PI / 2, r: 3.6 });
    }
  }
  prop('hx/building_windmill_yellow', Math.cos(0.3) * 56, Math.sin(0.3) * 56, 11, { r: 4 });

  // mountains & trees ring
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2 + 0.1, d = ISLAND + 26 + rnd() * 10;
    prop(['hx/mountain_A_grass_trees', 'hx/mountain_B_grass_trees', 'hx/hills_A_trees'][i % 3], Math.cos(a) * d, Math.sin(a) * d, 18 + rnd() * 14);
  }
  const trees = ['fo/Tree_1_A_Color1', 'fo/Tree_2_A_Color1', 'fo/Tree_3_A_Color1', 'fo/Tree_4_A_Color1', 'fo/Tree_2_C_Color1'];
  for (let i = 0; i < 70; i++) {
    const a = rnd() * Math.PI * 2, d = 48 + rnd() * (ISLAND - 50);
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    let near = false; for (let k = 0; k < 5; k++) { const p = zonePos(k); if (Math.hypot(p.x - x, p.z - z) < 13) near = true; }
    if (near) continue;
    prop(trees[i % 5], x, z, 5 + rnd() * 3, { r: 0.9 });
  }
  for (let i = 0; i < 40; i++) { const a = rnd() * Math.PI * 2, d = 14 + rnd() * 58; prop(['fo/Bush_1_A_Color1', 'fo/Bush_2_C_Color1', 'fo/Grass_1_A_Color1', 'fo/Grass_2_A_Color1', 'fo/Rock_1_A_Color1'][i % 5], Math.cos(a) * d, Math.sin(a) * d, i % 5 === 4 ? 0.9 : 0.7); }
  for (let i = 0; i < 9; i++) { const g = await prop(i % 2 ? 'hx/cloud_big' : 'hx/cloud_small', (rnd() - .5) * 160, (rnd() - .5) * 160, 3, { y: 32 + rnd() * 10 }); if (g) { g.scale.multiplyScalar(2.5); const sp = 0.5 + rnd(); animated.push((t, dt) => { g.position.x += dt * sp; if (g.position.x > 100) g.position.x = -100; }); } }

  // zones
  for (let i = 0; i < 5; i++) await buildZone(i);
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
    const [wx, wz] = W(10, 0);
    const river = new THREE.Mesh(new THREE.PlaneGeometry(4, 36).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#4fc3f7', roughness: 0.2, transparent: true, opacity: 0.9 }));
    river.position.set(wx, 0.04, wz); river.rotation.y = toC; scene.add(river);
    for (let k = 0; k < 12; k++) P(['fo/Rock_1_A_Color1', 'fo/Rock_3_A_Color1', 'fo/Rock_2_C_Color1'][k % 3], 7.6 + (k % 2) * 4.8, -15 + k * 2.7, 0.6);
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
