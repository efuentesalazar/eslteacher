// ============================================================
//  MISSION 2050 · Mundo abierto (isla de Skyport, ~700 m de diámetro)
//  Plaza central (portal del tiempo) · Robot Lab (este) · Eco Dome (sur)
//  Mars Base (oeste) · Smart City (norte) · Torre de GLITCH (noreste)
// ============================================================
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { DISTRICTS, CITIZENS } from './content.js';

export const scene = new THREE.Scene();
export const WORLD_R = 322;                // radio caminable
export const circles = [];                 // colisiones redondas {x,z,r}
export const boxes = [];                   // colisiones de caja {x,z,hw,hd,h} (se puede parar encima)
export const animated = [];                // funciones (t, dt)
export const springs = [];                 // resortes {x,z,power}
export const DPOS = { robot: [200, 0], eco: [0, 205], mars: [-200, 0], city: [0, -200] };
export const CORE_POS = { robot: [188, 0], eco: [0, 205], mars: [-186, 0], city: [0, -200] };
export const TOWER = [178, -178];
export const PORTAL = [0, -6];
export const NOVA_POS = [7, 4];
export const cores = {};                   // id → {setStep(step,n), pads:[{x,z}], npc:[x,z]}
export const cellSpots = [];               // [x,y,z]
export const citizenSpots = {};            // id → [x,z,ry]
export const world = { towerField: null, rocket: null, launch: null, groundCanvas: null };

// ---------- carga de modelos ----------
const loader = new GLTFLoader();
const cache = {};
let loadTotal = 0, loadDone = 0, onProgress = () => { };
export function setProgress(fn) { onProgress = fn; }
// Total de modelos de la última carga (o un estimado la primera vez): así la barra avanza de verdad y no salta a 100% al inicio
const LOAD_KEY = 'eslt_load_m2050';
let LOAD_EXPECT = 80; try { LOAD_EXPECT = Number(localStorage.getItem(LOAD_KEY)) || 80; } catch (e) { }
export function load(url) {
  if (!cache[url]) {
    loadTotal++;
    cache[url] = new Promise(res => loader.load(url, g => { fixMats(g.scene); loadDone++; onProgress(loadDone / Math.max(loadTotal, LOAD_EXPECT)); if (loadDone === loadTotal) { try { localStorage.setItem(LOAD_KEY, loadTotal); } catch (e) { } } res(g); }, undefined, e => { loadDone++; console.warn('No se pudo cargar', url, e); onProgress(loadDone / loadTotal); res(null); }));
  }
  return cache[url];
}
const U = { city: n => `assets/models/city/${n}.glb`, car: n => `assets/models/car/${n}.glb`, space: n => `assets/models/space/${n}.glb`, nat: n => `assets/models/nature/${n}.glb`, plat: n => `assets/models/plat/${n}.glb`, kk: n => `assets/models/kk/${n}.gltf` };

// los modelos metálicos se ven negros sin mapa de entorno: se dejan mate
function fixMats(root) { root.traverse(m => { if (!m.isMesh) return; for (const mt of [].concat(m.material)) { if (mt.metalness > 0.3) mt.metalness = 0.15; if (mt.roughness < 0.3) mt.roughness = 0.5; } }); }

// ---------- ayudas ----------
let seed = 2050;
export function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
const R = (a, b) => a + rnd() * (b - a);
export const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, flatShading: true, ...extra });
function shadowize(o, cast = true) { o.traverse(m => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = true; } }); }
function add(mesh, x, y, z, cast = true) { mesh.position.set(x, y, z); mesh.castShadow = cast; mesh.receiveShadow = true; scene.add(mesh); return mesh; }
const dist = (x1, z1, x2, z2) => Math.hypot(x1 - x2, z1 - z2);

/** Coloca un modelo. opt: {h altura | w ancho | s escala, ry, y, col:'box'|'circle', r, parent} */
export async function place(url, x, z, opt = {}) {
  const g = await load(url); if (!g) return null;
  const o = g.scene.clone(true);
  o.rotation.y = opt.ry ?? 0;
  const b0 = new THREE.Box3().setFromObject(o), sz = b0.getSize(new THREE.Vector3());
  const s = opt.s ?? (opt.h ? opt.h / Math.max(sz.y, 1e-3) : opt.w ? opt.w / Math.max(sz.x, sz.z, 1e-3) : 1);
  o.scale.setScalar(s);
  const b = new THREE.Box3().setFromObject(o);
  o.position.set(x - (b.min.x + b.max.x) / 2 * (opt.center ? 1 : 0), (opt.y || 0) - b.min.y, z - (b.min.z + b.max.z) / 2 * (opt.center ? 1 : 0));
  shadowize(o, opt.cast !== false);
  (opt.parent || scene).add(o);
  const bb = new THREE.Box3().setFromObject(o);
  if (opt.col === 'box') boxes.push(o.userData.colBox = { x: (bb.min.x + bb.max.x) / 2, z: (bb.min.z + bb.max.z) / 2, hw: (bb.max.x - bb.min.x) / 2 * (opt.shrink || 0.92), hd: (bb.max.z - bb.min.z) / 2 * (opt.shrink || 0.92), h: bb.max.y });
  if (opt.col === 'circle') circles.push({ x, z, r: opt.r || Math.max(bb.max.x - bb.min.x, bb.max.z - bb.min.z) * 0.4 });
  o.userData.box = bb;
  return o;
}

/** Muchas copias del mismo modelo con InstancedMesh (árboles, rocas, faroles…). list: [{x,z,h|s,ry,y}] */
export async function scatter(url, list, opt = {}) {
  const g = await load(url); if (!g || !list.length) return;
  const root = g.scene; root.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(root), sz = bb.getSize(new THREE.Vector3());
  const meshes = []; root.traverse(m => { if (m.isMesh) meshes.push(m); });
  const base = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), p = new THREE.Vector3(), tmp = new THREE.Matrix4();
  for (const m of meshes) {
    const im = new THREE.InstancedMesh(m.geometry, m.material, list.length);
    list.forEach((it, i) => {
      const s = it.s ?? (it.h ? it.h / Math.max(sz.y, 1e-3) : 1);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), it.ry ?? 0); sc.setScalar(s); p.set(it.x, (it.y || 0) - bb.min.y * s, it.z);
      base.compose(p, q, sc); tmp.multiplyMatrices(base, m.matrixWorld); im.setMatrixAt(i, tmp);
    });
    im.castShadow = opt.cast !== false; im.receiveShadow = true; im.computeBoundingSphere();
    scene.add(im);
  }
  if (opt.r) list.forEach(it => circles.push({ x: it.x, z: it.z, r: opt.r * (it.rs ?? 1) }));
}

export function label(text, color = '#fff', w = 3, size = 34, bg = null) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 128; const c = cv.getContext('2d');
  c.font = `800 ${size * 2}px "Baloo 2", Nunito, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (bg) { const tw = Math.min(500, c.measureText(text).width + 40); c.fillStyle = bg; roundRect(c, 256 - tw / 2, 18, tw, 92, 30); c.fill(); }
  c.lineWidth = 10; c.strokeStyle = 'rgba(15,10,40,.8)'; c.strokeText(text, 256, 66); c.fillStyle = color; c.fillText(text, 256, 66);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(w, w / 4, 1); s.renderOrder = 20; return s;
}
function roundRect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

// ---------- personajes ----------
const ONCE = ['pick-up', 'emote-yes', 'emote-no', 'interact-right', 'interact-left', 'attack-kick-right'];
export async function makeChar(model) {
  const g = await load(`assets/chars/${model}.glb`);
  const inner = g.scene.clone(true);
  const bb = new THREE.Box3().setFromObject(inner);
  inner.scale.setScalar(1.75 / (bb.max.y - bb.min.y)); inner.position.y = -bb.min.y * inner.scale.x;
  const root = new THREE.Group(); root.add(inner); shadowize(root);
  const mixer = new THREE.AnimationMixer(inner);
  const actions = {}; for (const c of g.animations) actions[c.name] = mixer.clipAction(c);
  for (const k of ONCE) if (actions[k]) { actions[k].setLoop(THREE.LoopOnce); actions[k].clampWhenFinished = true; }
  const ch = { root, mixer, actions, cur: null, lockUntil: 0 };
  ch.play = (name, fade = 0.18, once = false) => {
    const a = actions[name]; if (!a || ch.cur === a) return;
    a.reset().fadeIn(fade).play(); if (ch.cur) ch.cur.fadeOut(fade); ch.cur = a; ch.curName = name;
    if (once) ch.lockUntil = performance.now() + a.getClip().duration * 1000 * 0.95;
  };
  ch.play('idle', 0);
  return ch;
}

export async function makeRobot(h = 2.2, tint = null) {
  const g = await load('assets/robot/robot.gltf'); if (!g) return null;
  const inner = SkeletonUtils.clone(g.scene);
  const bb = new THREE.Box3().setFromObject(inner);
  inner.scale.setScalar(h / (bb.max.y - bb.min.y)); inner.position.y = -bb.min.y * inner.scale.x;
  if (tint) inner.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.color = new THREE.Color(tint).multiplyScalar(2.6); } });
  const root = new THREE.Group(); root.add(inner); shadowize(root);
  const mixer = new THREE.AnimationMixer(inner); const actions = {};
  for (const c of g.animations) actions[c.name] = mixer.clipAction(c);
  const r = { root, mixer, actions, cur: null };
  r.play = n => { const a = actions[n]; if (!a || r.cur === a) return; a.reset().fadeIn(0.25).play(); if (r.cur) r.cur.fadeOut(0.25); r.cur = a; };
  r.play('iddle');
  animated.push((t, dt) => mixer.update(dt));
  return r;
}

// ---------- zonas libres (para no poner árboles sobre caminos o distritos) ----------
function segDist(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az; const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(px - ax - t * dx, pz - az - t * dz); }
const LAKE = [-150, -125, 30];
const FARM = [110, 100, 190, 180];
export function isFree(x, z, m = 0) {
  const r = Math.hypot(x, z);
  if (r > 312 - m) return false;
  if (r < 42 + m) return false;
  if (Math.abs(x) < 10 + m && Math.abs(z) < 300) return false;          // bulevares N-S
  if (Math.abs(z) < 10 + m && Math.abs(x) < 300) return false;          // bulevares E-O
  if (Math.abs(r - 120) < 9 + m) return false;                           // anillo
  if (segDist(x, z, 85, -85, TOWER[0], TOWER[1]) < 9 + m) return false;  // camino a la torre
  if (dist(x, z, ...DPOS.robot) < 78 + m) return false;
  if (dist(x, z, ...DPOS.eco) < 82 + m) return false;
  if (dist(x, z, ...DPOS.mars) < 92 + m) return false;
  if (Math.abs(x) < 95 + m && z < -105 + m && z > -298 - m) return false;
  if (dist(x, z, ...TOWER) < 52 + m) return false;
  if (dist(x, z, LAKE[0], LAKE[1]) < LAKE[2] + 8 + m) return false;
  if (x > FARM[0] - m && x < FARM[2] + m && z > FARM[1] - m && z < FARM[3] + m) return false;
  for (const p of PLATFORMS) if (dist(x, z, p[0], p[1]) < 10 + m) return false;
  return true;
}

// plataformas flotantes con resorte: [x, z, alto, ancho]
const PLATFORMS = [[-55, 40, 7, 8], [60, -48, 9, 7], [-95, -40, 8, 8], [255, 75, 10, 7], [-60, 255, 8, 8], [-255, 95, 9, 7], [95, 225, 7, 8], [-235, -120, 10, 7]];

// ---------- suelo pintado (también se usa para el minimapa) ----------
const SIZE = 700, CV = 2048, K = CV / SIZE;
const P = v => (v + SIZE / 2) * K;
function paintGround() {
  const cv = document.createElement('canvas'); cv.width = cv.height = CV; const c = cv.getContext('2d');
  c.fillStyle = '#2b8fd6'; c.fillRect(0, 0, CV, CV);
  const circ = (x, z, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(P(x), P(z), r * K, 0, Math.PI * 2); c.fill(); };
  circ(0, 0, 350, '#f2dca2');
  circ(0, 0, 322, '#6fc04f');
  for (let i = 0; i < 2600; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 318; circ(Math.cos(a) * r, Math.sin(a) * r, R(1.5, 6), ['#67b847', '#77c957', '#62b043', '#7fcf5f'][i % 4]); }
  // farmland
  for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#8a6a3f' : '#a8c95a'; c.fillRect(P(FARM[0]), P(FARM[1] + i * 10), (FARM[2] - FARM[0]) * K, 10 * K); }
  // lake
  circ(LAKE[0], LAKE[1], LAKE[2] + 5, '#f2dca2'); circ(LAKE[0], LAKE[1], LAKE[2], '#3aa7e8'); circ(LAKE[0] + 6, LAKE[1] - 5, LAKE[2] * 0.55, '#56b9f0');
  // districts
  circ(...DPOS.mars, 92, '#c9663b'); for (let i = 0; i < 500; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 88; circ(DPOS.mars[0] + Math.cos(a) * r, Math.sin(a) * r, R(1, 5), ['#b9552f', '#d8774a', '#a84a2a'][i % 3]); }
  circ(...DPOS.eco, 82, '#86d96e'); for (let i = 0; i < 300; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 78; circ(Math.cos(a) * r, DPOS.eco[1] + Math.sin(a) * r, R(0.6, 1.4), ['#ffd84a', '#ff7ab8', '#ffffff', '#b98cff'][i % 4]); }
  circ(...DPOS.robot, 78, '#aebccf'); c.strokeStyle = '#22b8ff'; c.lineWidth = 1.2 * K; for (let r = 20; r < 78; r += 14) { c.beginPath(); c.arc(P(DPOS.robot[0]), P(0), r * K, 0, 6.28); c.stroke(); }
  c.fillStyle = '#8b93a1'; c.fillRect(P(-95), P(-298), 190 * K, 193 * K);
  c.fillStyle = '#c9ced8'; for (const x of [-65, -22.5, 22.5, 65]) for (const z of [-266, -222, -178, -134]) c.fillRect(P(x - 17), P(z - 17), 34 * K, 34 * K);
  circ(...TOWER, 52, '#3b2550'); for (let i = 0; i < 160; i++) { const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 50; circ(TOWER[0] + Math.cos(a) * r, TOWER[1] + Math.sin(a) * r, R(0.6, 2.4), ['#ff3b6b', '#7a3cff', '#22102f'][i % 3]); }
  // roads
  const road = (pts, w, closed = false) => {
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = '#d8d2c2'; c.lineWidth = (w + 2.4) * K; c.beginPath(); pts.forEach(([x, z], i) => i ? c.lineTo(P(x), P(z)) : c.moveTo(P(x), P(z))); if (closed) c.closePath(); c.stroke();
    c.strokeStyle = '#4b4f58'; c.lineWidth = w * K; c.stroke();
    c.strokeStyle = '#ffd23f'; c.lineWidth = 0.45 * K; c.setLineDash([3 * K, 3 * K]); c.stroke(); c.setLineDash([]);
  };
  road([[0, -110], [0, 0], [0, 128]], 11); road([[-118, 0], [0, 0], [120, 0]], 11);
  road([[0, -300], [0, -100]], 10); road([[-300, 0], [-110, 0]], 10); road([[110, 0], [290, 0]], 10); road([[0, 125], [0, 300]], 10);
  const ring = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2; ring.push([Math.cos(a) * 120, Math.sin(a) * 120]); } road(ring, 9, true);
  road([[85, -85], [TOWER[0] - 30, TOWER[1] + 30]], 8);
  for (const x of [-45, 45]) road([[x, -292], [x, -110]], 9);
  for (const z of [-245, -155]) road([[-92, z], [92, z]], 9);
  // plaza
  circ(0, 0, 36, '#e9e2d0'); for (let r = 6; r < 36; r += 6) { c.strokeStyle = r % 12 ? '#d6ccb6' : '#7ad3ff'; c.lineWidth = 0.6 * K; c.beginPath(); c.arc(P(0), P(0), r * K, 0, 6.28); c.stroke(); }
  circ(...CORE_POS.city, 16, '#e9e2d0');
  world.groundCanvas = cv;
  return cv;
}

// ---------- piezas propias ----------
function sky() {
  const geo = new THREE.SphereGeometry(1400, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#3f8cff') }, mid: { value: new THREE.Color('#9fd8ff') }, bot: { value: new THREE.Color('#ffe6c4') } },
    vertexShader: 'varying vec3 vp; void main(){ vp = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vp; void main(){ float h = vp.y; vec3 c = h>0.0 ? mix(mid, top, smoothstep(0.0,0.55,h)) : mix(mid, bot, smoothstep(0.0,0.25,-h)); gl_FragColor = vec4(c,1.0); }'
  });
  scene.add(new THREE.Mesh(geo, mat));
  // nubes
  const cm = M('#ffffff', { roughness: 1, emissive: '#ffffff', emissiveIntensity: 0.25 });
  for (let i = 0; i < 26; i++) {
    const g = new THREE.Group(); const a = rnd() * 6.28, r = R(60, 420);
    for (let j = 0; j < 4; j++) { const p = new THREE.Mesh(new THREE.IcosahedronGeometry(R(6, 12), 0), cm); p.position.set(j * 9 - 13, R(-2, 3), R(-4, 4)); p.scale.y = 0.55; g.add(p); }
    g.position.set(Math.cos(a) * r, R(70, 110), Math.sin(a) * r); scene.add(g);
    const sp = R(0.6, 1.4); animated.push((t, dt) => { g.position.x += dt * sp; if (g.position.x > 460) g.position.x = -460; });
  }
}

function water() {
  const ocean = new THREE.Mesh(new THREE.CircleGeometry(1400, 64), M('#2a98da', { roughness: 0.25, metalness: 0.1, flatShading: false }));
  ocean.rotation.x = -Math.PI / 2; ocean.position.y = -1.1; ocean.receiveShadow = true; scene.add(ocean);
  animated.push(t => { ocean.material.color.setHSL(0.56, 0.68, 0.5 + Math.sin(t * 0.5) * 0.02); });
  const beach = new THREE.Mesh(new THREE.CylinderGeometry(350, 366, 1.2, 96, 1, true), M('#efd59a', { side: THREE.DoubleSide }));
  beach.position.y = -0.6; scene.add(beach);
  const lake = new THREE.Mesh(new THREE.CircleGeometry(LAKE[2], 40), M('#45b2f0', { roughness: 0.15, transparent: true, opacity: 0.85 }));
  lake.rotation.x = -Math.PI / 2; lake.position.set(LAKE[0], 0.08, LAKE[1]); scene.add(lake);
  circles.push({ x: LAKE[0], z: LAKE[1], r: LAKE[2] - 1 });
  // islas lejanas
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * 6.28 + 0.3, r = R(470, 620);
    const hill = new THREE.Mesh(new THREE.ConeGeometry(R(30, 60), R(25, 55), 7), M(['#5aa84a', '#79b85a', '#4f9a6a'][i % 3]));
    hill.position.set(Math.cos(a) * r, 8, Math.sin(a) * r); scene.add(hill);
  }
}

function cyl(rt, rb, h, col, seg = 8, extra) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), M(col, extra)); }

/** Portal del tiempo en la plaza */
function portal() {
  const [x, z] = PORTAL;
  const base = add(cyl(7, 8, 1.2, '#d9dfe9', 12), x, 0.6, z);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.7, 8, 32), M('#7ad3ff', { emissive: '#22b8ff', emissiveIntensity: 0.9 }));
  ring.position.set(x, 7, z); scene.add(ring);
  const inner = new THREE.Mesh(new THREE.CircleGeometry(5, 32), new THREE.MeshBasicMaterial({ color: '#b9f0ff', transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
  inner.position.set(x, 7, z); scene.add(inner);
  for (const s of [-1, 1]) add(cyl(0.6, 0.9, 7, '#aab4c4', 8), x + s * 6, 3.5, z);
  circles.push({ x, z, r: 7.5 });
  const sparks = new THREE.Group(); scene.add(sparks);
  for (let i = 0; i < 16; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.25), new THREE.MeshBasicMaterial({ color: i % 2 ? '#ffd23f' : '#ffffff' })); sparks.add(s); s.userData.o = i / 16; }
  animated.push(t => { ring.rotation.z = t * 0.4; inner.material.opacity = 0.35 + Math.sin(t * 2) * 0.12; sparks.children.forEach(s => { const a = (t * 0.6 + s.userData.o) * 6.28; s.position.set(x + Math.cos(a) * 5.5, 7 + Math.sin(a) * 5.5, z); }); });
  const l = label('SKYPORT 2050', '#ffd23f', 12, 40); l.position.set(x, 15, z); scene.add(l);
}

/** Núcleo de energía de cada distrito + almohadillas para el equipo */
function powerCore(d) {
  const [x, z] = CORE_POS[d.id];
  const col = new THREE.Color(d.color);
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const base = cyl(3.2, 3.8, 1, '#5d6676', 6); base.position.y = 0.5; g.add(base);
  const crystalMat = M('#707a8a', { emissive: '#000000', roughness: 0.3 });
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 0), crystalMat); crystal.scale.y = 2; crystal.position.y = 4.4; g.add(crystal);
  const rings = [0, 1].map(i => { const r = new THREE.Mesh(new THREE.TorusGeometry(2.4 + i * 0.6, 0.12, 6, 32), M('#9aa3b2', { emissive: '#000000' })); r.position.y = 4.4; g.add(r); return r; });
  const beamMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 220, 12, 1, true), beamMat); beam.position.y = 114; g.add(beam);
  shadowize(g);
  circles.push({ x, z, r: 3.6 });
  const name = label(`${d.icon} ${d.name}`, d.color, 12, 40); name.position.set(x, 14, z); scene.add(name);
  // almohadillas
  const pads = [];
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2 + Math.PI / 4, px = x + Math.cos(a) * 7.5, pz = z + Math.sin(a) * 7.5;
    const pm = M('#3a4150', { emissive: col, emissiveIntensity: 0 });
    const pad = cyl(1.4, 1.5, 0.3, '#3a4150', 16); pad.material = pm; pad.position.set(px, 0.15, pz); pad.visible = false; scene.add(pad);
    const n = label(String(i + 1), '#fff', 2); n.position.set(px, 2, pz); n.visible = false; scene.add(n);
    pads.push({ x: px, z: pz, mesh: pad, num: n });
  }
  let on = false, step = 0;
  animated.push(t => {
    crystal.rotation.y = t * (on ? 1.2 : 0.2); crystal.position.y = 4.4 + (on ? Math.sin(t * 2) * 0.3 : 0);
    rings[0].rotation.x = t * (on ? 1.4 : 0.1); rings[1].rotation.y = t * (on ? 1.1 : 0.1);
    beamMat.opacity = on ? 0.22 + Math.sin(t * 3) * 0.05 : 0;
    if (step === 3) pads.forEach(p => { p.mesh.material.emissiveIntensity = p.lit ? 1.2 : 0.35 + Math.sin(t * 4) * 0.25; });
  });
  // la ciudadana o científico del distrito, frente al núcleo, mirando hacia la plaza
  const toPlaza = Math.atan2(-x, -z);
  const npc = [x + Math.sin(toPlaza) * 6, z + Math.cos(toPlaza) * 6];
  cores[d.id] = {
    pads, npc, npcRy: toPlaza,
    setStep(s, n = 1) {
      step = s; on = s >= 4;
      crystalMat.color.set(on ? col : '#707a8a'); crystalMat.emissive.set(on ? col : '#000000'); crystalMat.emissiveIntensity = on ? 0.9 : 0;
      rings.forEach(r => { r.material.emissive.set(on ? col : '#000000'); r.material.emissiveIntensity = on ? 0.7 : 0; });
      pads.forEach((p, i) => { const v = s === 3 && i < n; p.mesh.visible = v; p.num.visible = v; });
    },
    lightPads(lit) { pads.forEach((p, i) => p.lit = !!lit[i]); }
  };
}

function solarPanel(x, z, ry = 0) {
  const g = new THREE.Group();
  const leg = cyl(0.12, 0.12, 1.2, '#888'); leg.position.y = 0.6;
  const panel = new THREE.Mesh(new THREE.BoxGeometry(3, 0.12, 2), M('#2552c9', { roughness: 0.25, metalness: 0.3, emissive: '#10307a', emissiveIntensity: 0.35 })); panel.position.y = 1.3; panel.rotation.x = 0.4;
  g.add(leg, panel); g.position.set(x, 0, z); g.rotation.y = ry; shadowize(g); scene.add(g); circles.push({ x, z, r: 1.2 });
}
function windTurbine(x, z, h = 22) {
  const g = new THREE.Group();
  const tower = cyl(0.3, 0.6, h, '#f4f4f4'); tower.position.y = h / 2;
  const nac = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 1.8), M('#e8e8e8')); nac.position.set(0, h, 0.2);
  const rotor = new THREE.Group(); rotor.position.set(0, h, 1.2);
  for (let i = 0; i < 3; i++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.5, h * 0.45, 0.1), M('#ffffff')); bl.position.y = h * 0.225; const p = new THREE.Group(); p.rotation.z = i * 2.094; p.add(bl); rotor.add(p); }
  g.add(tower, nac, rotor); g.position.set(x, 0, z); g.rotation.y = Math.atan2(-x, -z) + Math.PI; shadowize(g); scene.add(g);
  circles.push({ x, z, r: 0.9 });
  const sp = R(0.8, 1.4); animated.push((t, dt) => { rotor.rotation.z += dt * sp; });
}
function verticalFarm(x, z) {
  const g = new THREE.Group(); const h = R(9, 14);
  const core = new THREE.Mesh(new THREE.BoxGeometry(5, h, 5), M('#e8f1f5', { transparent: true, opacity: 0.55, roughness: 0.1 })); core.position.y = h / 2;
  g.add(core);
  for (let y = 1; y < h; y += 1.6) { const shelf = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.5, 4.4), M(y % 3 < 1.5 ? '#4fc94a' : '#e94f3a')); shelf.position.y = y; g.add(shelf); }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.4, 5.4), M('#2552c9', { emissive: '#10307a', emissiveIntensity: 0.3 })); roof.position.y = h + 0.2; g.add(roof);
  g.position.set(x, 0, z); shadowize(g); scene.add(g); boxes.push({ x, z, hw: 2.6, hd: 2.6, h: h + 0.4 });
}
function holoBoard(text, x, y, z, look = [0, 0], color = '#22b8ff', w = 10) {
  const ry = Math.atan2(look[0] - x, look[1] - z);
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const c = cv.getContext('2d');
  c.fillStyle = 'rgba(10,20,50,.7)'; roundRect(c, 6, 6, 500, 244, 30); c.fill(); c.strokeStyle = color; c.lineWidth = 8; c.stroke();
  c.fillStyle = '#fff'; c.font = '800 54px "Baloo 2", Nunito, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const lines = text.split('\n'); lines.forEach((l, i) => c.fillText(l, 256, 128 + (i - (lines.length - 1) / 2) * 62));
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, opacity: 0.92 }));
  m.position.set(x, y, z); m.rotation.y = ry; scene.add(m);
  const pole = cyl(0.15, 0.15, y - w / 4, '#9aa3b2'); pole.position.set(x, (y - w / 4) / 2, z); scene.add(pole);
  const ph = rnd() * 6; animated.push(t => { m.material.opacity = 0.85 + Math.sin(t * 3 + ph) * 0.08; });
}
function springPad(x, z, power = 25) {
  const g = new THREE.Group();
  const base = cyl(1.3, 1.4, 0.35, '#ff7a1a', 16); base.position.y = 0.18;
  const top = cyl(1.1, 1.1, 0.2, '#ffd23f', 16, { emissive: '#ffb000', emissiveIntensity: 0.5 }); top.position.y = 0.45;
  g.add(base, top); g.position.set(x, 0, z); shadowize(g); scene.add(g);
  springs.push({ x, z, power, top });
  animated.push(t => { top.position.y = 0.45 + Math.abs(Math.sin(t * 3)) * 0.12; });
}
function skyPlatform(x, z, h, w) {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, w), M('#7ad3ff', { emissive: '#22b8ff', emissiveIntensity: 0.25 })); top.position.y = h - 0.4;
  const under = new THREE.Mesh(new THREE.ConeGeometry(w * 0.55, 3, 4), M('#9aa3b2')); under.position.y = h - 2.3; under.rotation.y = Math.PI / 4; under.rotation.x = Math.PI;
  g.add(top, under); g.position.set(x, 0, z); shadowize(g); scene.add(g);
  boxes.push({ x, z, hw: w / 2, hd: w / 2, h, floating: true });
  springPad(x - w / 2 - 2.2, z);
  cellSpots.push([x, h + 1.2, z]);
}

/** Celda de energía (coleccionable) */
export function energyCell() {
  const g = new THREE.Group();
  const body = cyl(0.35, 0.35, 0.9, '#3fe8ff', 10, { emissive: '#22b8ff', emissiveIntensity: 0.8, roughness: 0.2 });
  const capA = cyl(0.38, 0.38, 0.14, '#ffd23f', 10); capA.position.y = 0.5; const capB = capA.clone(); capB.position.y = -0.5;
  const bolt = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), M('#ffffff', { emissive: '#ffffff', emissiveIntensity: 1 })); bolt.position.set(0, 0, 0.36);
  g.add(body, capA, capB, bolt);
  return g;
}

// ---------- distritos ----------
async function plaza() {
  portal();
  holoBoard('MISSION 2050\nSave Skyport!', -14, 7, -14, [0, 20], '#ffd23f', 11);
  // señales a cada distrito
  const signs = [['🏙️ Smart City', 0, -36, 0], ['🤖 Robot Lab', 36, 0, -Math.PI / 2], ['🌱 Eco Dome', 0, 36, Math.PI], ['🚀 Mars Base', -36, 0, Math.PI / 2]];
  for (const [t, x, z, ry] of signs) { const s = label(t, '#fff', 9, 34, 'rgba(20,40,80,.75)'); s.position.set(x + (x ? 0 : 13), 4.5, z + (z ? 0 : 13)); scene.add(s); }
  const lamps = []; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28 + 0.26; lamps.push({ x: Math.cos(a) * 33, z: Math.sin(a) * 33, h: 6, ry: -a }); }
  await scatter(U.kk('streetlight'), lamps, { r: 0.35 });
  const benches = []; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28 + 0.4; benches.push({ x: Math.cos(a) * 26, z: Math.sin(a) * 26, h: 1, ry: -a + Math.PI / 2 }); }
  await scatter(U.kk('bench'), benches, { r: 0.9 });
  const bushes = []; for (let i = 0; i < 20; i++) { const a = i / 20 * 6.28; bushes.push({ x: Math.cos(a) * 30, z: Math.sin(a) * 30, h: 1.4, ry: a }); }
  await scatter(U.nat('plant_bushLarge'), bushes.filter(b => Math.abs(b.x) > 7 && Math.abs(b.z) > 7), {});
}

async function robotLab() {
  const [cx, cz] = DPOS.robot;
  await place(U.space('hangar_largeA'), cx + 38, cz, { w: 34, ry: Math.PI / 2, col: 'box' });
  await place(U.space('hangar_roundGlass'), cx + 20, cz - 60, { w: 18, col: 'box' });
  await place(U.space('hangar_smallA'), cx + 18, cz + 60, { w: 14, ry: -Math.PI / 2, col: 'box' });
  await place(U.space('satelliteDish_large'), cx + 45, cz - 40, { h: 14, ry: -2.3, col: 'circle', r: 3.5 });
  await place(U.space('satelliteDish'), cx + 50, cz + 35, { h: 8, ry: 2.4, col: 'circle', r: 2.2 });
  for (const [dx, dz] of [[-10, -26], [-4, -26], [2, -26], [-10, 26], [-4, 26], [2, 26]]) await place(U.space('machine_generator'), cx + dx, cz + dz, { h: 3.2, ry: Math.PI, col: 'circle', r: 1.6 });
  for (const [dx, dz] of [[25, -18], [25, 18]]) await place(U.space('machine_generatorLarge'), cx + dx, cz + dz, { h: 5, col: 'box' });
  for (const [dx, dz, ry] of [[6, -14, 0], [10, -14, 0], [6, 14, Math.PI], [10, 14, Math.PI]]) await place(U.space('desk_computer'), cx + dx, cz + dz, { h: 1.6, ry, col: 'circle', r: 1 });
  await place(U.space('machine_wireless'), cx - 30, cz - 40, { h: 9, col: 'circle', r: 1.5 });
  await place(U.space('structure_detailed'), cx - 35, cz + 42, { h: 8, col: 'box' });
  // cintas transportadoras con cajas
  for (const side of [-1, 1]) {
    const bx = cx + 12, bz = cz + side * 34;
    const belt = new THREE.Mesh(new THREE.BoxGeometry(28, 1, 3), M('#3a4150')); add(belt, bx, 0.5, bz);
    boxes.push({ x: bx, z: bz, hw: 14, hd: 1.5, h: 1 });
    const crates = [];
    for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), M(['#ffd23f', '#22b8ff', '#ff6a3d'][i % 3])); b.castShadow = true; scene.add(b); crates.push(b); }
    animated.push(t => crates.forEach((b, i) => { const k = ((t * 0.08 * side + i / 6) % 1 + 1) % 1; b.position.set(bx - 14 + k * 28, 1.7, bz); b.rotation.y = k * 3; }));
    // brazo robótico
    const arm = new THREE.Group(); const ab = cyl(0.9, 1.1, 1.2, '#ff7a1a'); ab.position.y = 0.6; arm.add(ab);
    const seg1 = new THREE.Group(); seg1.position.y = 1.2; arm.add(seg1);
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4, 0.6), M('#ffd23f')); s1.position.y = 2; seg1.add(s1);
    const seg2 = new THREE.Group(); seg2.position.y = 4; seg1.add(seg2);
    const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3, 0.5), M('#ffd23f')); s2.position.y = 1.5; seg2.add(s2);
    const claw = new THREE.Mesh(new THREE.BoxGeometry(1, 0.4, 1), M('#3a4150')); claw.position.y = 3; seg2.add(claw);
    arm.position.set(bx, 0, bz - side * 4); shadowize(arm); scene.add(arm); circles.push({ x: bx, z: bz - side * 4, r: 1.2 });
    animated.push(t => { arm.rotation.y = Math.sin(t * 0.7 + side) * 1.2; seg1.rotation.z = 0.5 + Math.sin(t * 1.1) * 0.25; seg2.rotation.z = 1.3 + Math.sin(t * 1.3) * 0.3; });
  }
  holoBoard('ROBOT LAB\nAI · Jobs · Future', cx - 22, 7, cz - 22, [0, 0], '#22b8ff', 10);
  // robots patrullando
  for (let i = 0; i < 3; i++) {
    const r = await makeRobot(2, ['#9be7ff', '#ffe08a', '#c6b3ff'][i]); if (!r) continue;
    scene.add(r.root); r.play('walking'); const rad = 30 + i * 9, sp = 0.12 + i * 0.03, ph = i * 2;
    animated.push(t => { const a = t * sp + ph; r.root.position.set(cx + Math.cos(a) * rad, 0, cz + Math.sin(a) * rad); r.root.rotation.y = -a; });
  }
}

async function ecoDome() {
  const [cx, cz] = DPOS.eco;
  // cúpula de vidrio con entrada hacia la plaza (norte)
  const dome = new THREE.Mesh(new THREE.SphereGeometry(30, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#bff3ff', transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false }));
  dome.position.set(cx, 0, cz); scene.add(dome);
  const frame = new THREE.Mesh(new THREE.SphereGeometry(30.05, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#e8fbff', wireframe: true, transparent: true, opacity: 0.45 }));
  frame.position.copy(dome.position); scene.add(frame);
  const ringBase = new THREE.Mesh(new THREE.TorusGeometry(30, 0.6, 6, 64), M('#d9dfe9')); ringBase.rotation.x = Math.PI / 2; ringBase.position.set(cx, 0.3, cz); scene.add(ringBase);
  for (let a = 0; a < 360; a += 4) { const r = a * Math.PI / 180; if (Math.abs(Math.atan2(Math.sin(r - -Math.PI / 2), Math.cos(r - -Math.PI / 2))) < 0.3) continue; circles.push({ x: cx + Math.cos(r) * 30, z: cz + Math.sin(r) * 30, r: 1.4 }); }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(7, 0.6, 6, 20, Math.PI), M('#3fd36b', { emissive: '#1f8f3f', emissiveIntensity: 0.4 })); arch.position.set(cx, 0, cz - 30); scene.add(arch);
  // árboles dentro
  const inTrees = []; for (let i = 0; i < 26; i++) { const a = rnd() * 6.28, r = R(13, 25); const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (z < cz - 20 && Math.abs(x - cx) < 9) continue; inTrees.push({ x, z, h: R(5, 9), ry: rnd() * 6 }); }
  await scatter(U.nat('tree_fat'), inTrees.filter((_, i) => i % 2), { r: 0.8 });
  await scatter(U.nat('tree_detailed'), inTrees.filter((_, i) => !(i % 2)), { r: 0.8 });
  const fl = []; for (let i = 0; i < 60; i++) { const a = rnd() * 6.28, r = R(9, 27); fl.push({ x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r, h: 0.7, ry: rnd() * 6 }); }
  await scatter(U.nat('flower_redA'), fl.slice(0, 20)); await scatter(U.nat('flower_yellowA'), fl.slice(20, 40)); await scatter(U.nat('flower_purpleA'), fl.slice(40));
  // paneles solares, molinos y viveros
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { solarPanel(cx + 45 + i * 5, cz - 20 + j * 4); solarPanel(cx - 45 - i * 5, cz - 20 + j * 4); }
  for (let x = -150; x <= 150; x += 30) windTurbine(x, 292 - Math.abs(x) * 0.2, R(20, 26));
  for (const [dx, dz] of [[42, 30], [-42, 30], [55, 50], [-55, 50]]) verticalFarm(cx + dx, cz + dz);
  holoBoard('ECO DOME\nClimate · Energy', cx + 24, 7, cz - 40, [0, 0], '#3fd36b', 10);
  const palms = []; for (let i = 0; i < 40; i++) { const a = R(0.2, Math.PI - 0.2), r = R(326, 336); palms.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, h: R(7, 11), ry: rnd() * 6 }); }
  await scatter(U.nat('tree_palmTall'), palms, {});
}

async function marsBase() {
  const [cx, cz] = DPOS.mars;
  // cohete New Horizon en su plataforma
  const padX = cx - 40, padZ = cz;
  const pad = cyl(11, 12, 1.2, '#5d6676', 10); add(pad, padX, 0.6, padZ); boxes.push({ x: padX, z: padZ, hw: 8, hd: 8, h: 1.2 });
  const rocket = new THREE.Group(); rocket.position.set(padX, 1.2, padZ); scene.add(rocket);
  let y = 0;
  for (const n of ['rocket_baseA', 'rocket_fuelA', 'rocket_fuelA', 'rocket_sidesA', 'rocket_topA']) {
    const o = await place(U.space(n), 0, 0, { s: 7, y, parent: rocket, center: true });
    if (o) { const h = o.userData.box.max.y - o.userData.box.min.y; y += h; }
  }
  const flame = new THREE.Mesh(new THREE.ConeGeometry(3, 12, 10), new THREE.MeshBasicMaterial({ color: '#ffb000', transparent: true, opacity: 0.9 })); flame.rotation.x = Math.PI; flame.position.y = -5; flame.visible = false; rocket.add(flame);
  circles.push({ x: padX, z: padZ, r: 6 });
  world.rocket = rocket; world.rocketFlame = flame; world.rocketY = 1.2;
  await place(U.space('structure'), padX + 11, padZ, { h: y * 0.85 + 1, col: 'box' });
  const lbl = label('🚀 New Horizon', '#ff6a3d', 10); lbl.position.set(padX, y + 6, padZ); rocket.add(lbl); lbl.position.set(0, y + 5, 0);
  // hangares, cráteres, rocas
  await place(U.space('hangar_roundGlass'), cx + 5, cz - 50, { w: 20, col: 'box' });
  await place(U.space('hangar_roundA'), cx + 5, cz + 50, { w: 20, ry: Math.PI, col: 'box' });
  await place(U.space('hangar_largeA'), cx - 30, cz + 48, { w: 22, col: 'box' });
  await place(U.space('satelliteDish_large'), cx - 15, cz - 55, { h: 12, ry: 0.8, col: 'circle', r: 3 });
  const craters = []; for (let i = 0; i < 9; i++) { const a = rnd() * 6.28, r = R(25, 82); const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (Math.abs(z) < 12 || dist(x, z, padX, padZ) < 20) continue; craters.push({ x, z, s: R(4, 8), ry: rnd() * 6 }); }
  await scatter(U.space('craterLarge'), craters, {});
  const rocks = []; for (let i = 0; i < 40; i++) { const a = rnd() * 6.28, r = R(18, 88); const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (Math.abs(z) < 12 || dist(x, z, padX, padZ) < 16 || dist(x, z, ...CORE_POS.mars) < 14) continue; rocks.push({ x, z, h: R(1, 3.5), ry: rnd() * 6 }); }
  await scatter(U.space('rock_largeA'), rocks.filter((_, i) => i % 3 === 0), { r: 1.2 });
  await scatter(U.space('rock_largeB'), rocks.filter((_, i) => i % 3 === 1), { r: 1.2 });
  await scatter(U.space('rock_crystalsLargeA'), rocks.filter((_, i) => i % 3 === 2), { r: 1.2 });
  for (const [dx, dz] of [[15, -40], [20, 40], [-5, 30]]) await place(U.space(dx > 16 ? 'astronautB' : 'astronautA'), cx + dx, cz + dz, { h: 1.9, ry: Math.atan2(-dx, -dz), col: 'circle', r: 0.6 });
  await place(U.space('alien'), cx - 70, cz - 30, { h: 1.6, ry: 1, col: 'circle', r: 0.6 });
  // rover dando vueltas
  const rover = await place(U.space('rover'), 0, 0, { h: 2.4 });
  if (rover) { const rc = rover; animated.push(t => { const a = t * 0.12; rc.position.set(cx + Math.cos(a) * 62, 0, cz + Math.sin(a) * 62); rc.rotation.y = -a + Math.PI; }); }
  holoBoard('MARS BASE\nSpace · Colonies', cx + 28, 7, cz + 24, [0, 0], '#ff6a3d', 10);
}

async function smartCity() {
  const cityB = ['building-a', 'building-b', 'building-c', 'building-d', 'building-e', 'building-f', 'building-g', 'building-h', 'building-i', 'building-j'];
  const sky = ['building-skyscraper-a', 'building-skyscraper-b', 'building-skyscraper-c', 'building-skyscraper-d', 'building-skyscraper-e'];
  const [ccx, ccz] = CORE_POS.city;
  const jobs = [];
  for (const bx of [-65, -22.5, 22.5, 65]) for (const bz of [-266, -222, -178, -134]) {
    // cada manzana: 4 edificios en las esquinas (las manzanas del centro dejan libre la plaza)
    for (const [ox, oz] of [[-8, -8], [8, -8], [-8, 8], [8, 8]]) {
      const x = bx + ox, z = bz + oz;
      if (dist(x, z, ccx, ccz) < 22) continue;
      const tall = dist(x, z, ccx, ccz) < 60;
      const n = tall ? sky[Math.floor(rnd() * sky.length)] : cityB[Math.floor(rnd() * cityB.length)];
      const ry = [0, Math.PI / 2, Math.PI, -Math.PI / 2][Math.floor(rnd() * 4)];
      const stretch = tall ? R(1.2, 1.7) : 1;
      jobs.push(place(U.city(n), x, z, { w: R(11, 13.5), ry, col: 'box', center: true, shrink: 0.9 }).then(o => { if (o && stretch > 1) { o.scale.y = o.scale.x * stretch; o.userData.colBox.h = new THREE.Box3().setFromObject(o).max.y; } }));
    }
  }
  await Promise.all(jobs);
  // faroles y semáforos
  const lamps = []; for (let z = -290; z <= -110; z += 18) for (const x of [-6.5, 6.5]) lamps.push({ x, z, h: 6, ry: x < 0 ? Math.PI / 2 : -Math.PI / 2 });
  for (let x = -90; x <= 90; x += 20) for (const z of [-251, -149]) lamps.push({ x, z, h: 6, ry: 0 });
  await scatter(U.kk('streetlight'), lamps.filter(l => dist(l.x, l.z, ccx, ccz) > 18), { r: 0.3 });
  const tl = []; for (const x of [-45, 45]) for (const z of [-245, -155]) tl.push({ x: x + 6, z: z + 6, h: 5, ry: 0 });
  await scatter(U.kk('trafficlight_A'), tl, { r: 0.3 });
  holoBoard('SMART CITY\nTech · Transport', 18, 9, -112, [18, 0], '#b26bff', 11);
  holoBoard('RECYCLE = REWARDS', -18, 9, -112, [-18, 0], '#3fd36b', 11);
  // autos que dan la vuelta a la ciudad (se detienen si hay alguien delante)
  const loop = [[-45, -245], [45, -245], [45, -155], [-45, -155]];
  const L = loop.length, segLen = loop.map((p, i) => dist(...p, ...loop[(i + 1) % L])), total = segLen.reduce((a, b) => a + b, 0);
  const cars = ['sedan', 'taxi', 'police', 'van', 'suv', 'race-future', 'delivery', 'hatchback-sports'];
  world.cars = [];
  for (let i = 0; i < cars.length; i++) {
    const o = await place(U.car(cars[i]), 0, 0, { w: 4.6 }); if (!o) continue;
    const car = { o, s: i / cars.length * total, lane: i % 2 ? 2.2 : -2.2, dir: i % 2 ? 1 : -1, wait: 0 };
    world.cars.push(car);
  }
  world.carPos = (s, lane) => {
    s = ((s % total) + total) % total; let i = 0; while (s > segLen[i]) { s -= segLen[i]; i++; }
    const a = loop[i], b = loop[(i + 1) % L], k = s / segLen[i];
    const dx = (b[0] - a[0]) / segLen[i], dz = (b[1] - a[1]) / segLen[i];
    return { x: a[0] + (b[0] - a[0]) * k - dz * lane, z: a[1] + (b[1] - a[1]) * k + dx * lane, ry: Math.atan2(dx, dz) };
  };
  // pods voladores
  for (let i = 0; i < 5; i++) {
    const o = await place(U.space(['craft_speederA', 'craft_speederB', 'craft_racer', 'craft_cargoA', 'craft_speederA'][i]), 0, 0, { w: 5 }); if (!o) continue;
    const rad = 40 + i * 12, h = 26 + i * 5, sp = (i % 2 ? 1 : -1) * (0.08 + i * 0.015);
    animated.push(t => { const a = t * sp + i; o.position.set(ccx + Math.cos(a) * rad, h + Math.sin(t + i) * 1.5, ccz + Math.sin(a) * rad); o.rotation.y = -a + (sp > 0 ? 0 : Math.PI); });
  }
}

async function glitchTower() {
  const [tx, tz] = TOWER;
  const dark = M('#2a1838', { emissive: '#4a0f3a', emissiveIntensity: 0.4 });
  const glow = M('#ff3b6b', { emissive: '#ff1f4f', emissiveIntensity: 1.1 });
  const g = new THREE.Group(); g.position.set(tx, 0, tz); scene.add(g);
  let y = 0; for (let i = 0; i < 6; i++) { const w = 12 - i * 1.6, h = 7; const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), dark); b.position.y = y + h / 2; b.rotation.y = i * 0.3; g.add(b); const band = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.5, w + 0.3), glow); band.position.y = y + h; band.rotation.y = i * 0.3; g.add(band); y += h; }
  const eye = new THREE.Mesh(new THREE.SphereGeometry(2.6, 16, 12), glow); eye.position.y = y + 3; g.add(eye);
  const rings = [0, 1, 2].map(i => { const r = new THREE.Mesh(new THREE.TorusGeometry(9 + i * 3, 0.25, 6, 40), glow); r.position.y = 12 + i * 10; g.add(r); return r; });
  shadowize(g); boxes.push({ x: tx, z: tz, hw: 6.5, hd: 6.5, h: 60 });
  const crystals = []; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28, r = R(16, 40); crystals.push({ x: tx + Math.cos(a) * r, z: tz + Math.sin(a) * r, h: R(2, 5), ry: rnd() * 6 }); }
  await scatter(U.space('rock_crystalsLargeB'), crystals.filter(c => dist(c.x, c.z, tx - 20, tz + 20) > 10), { r: 1 });
  // campo de fuerza (se apaga cuando los 4 distritos están listos)
  const fieldMat = new THREE.MeshBasicMaterial({ color: '#ff3b6b', transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
  const field = new THREE.Mesh(new THREE.SphereGeometry(34, 32, 16), fieldMat); field.position.set(tx, 0, tz); scene.add(field);
  const fieldCircle = { x: tx, z: tz, r: 34, field: true }; circles.push(fieldCircle);
  world.towerField = { mesh: field, circle: fieldCircle, set(on) { field.visible = on; fieldCircle.r = on ? 34 : 0; } };
  animated.push(t => { eye.scale.setScalar(1 + Math.sin(t * 3) * 0.08); rings.forEach((r, i) => { r.rotation.x = Math.PI / 2 + Math.sin(t * 0.5 + i) * 0.3; r.rotation.z = t * (0.3 + i * 0.2); }); fieldMat.opacity = 0.13 + Math.sin(t * 2) * 0.04; });
  const l = label('⚡ GLITCH TOWER', '#ff3b6b', 14, 40); l.position.set(tx, y + 10, tz); scene.add(l);
}

async function countryside() {
  const pick = (n, m, filter = () => true) => { const out = []; let tries = 0; while (out.length < n && tries < n * 30) { tries++; const a = rnd() * 6.28, r = Math.sqrt(rnd()) * 318; const x = Math.cos(a) * r, z = Math.sin(a) * r; if (isFree(x, z, m) && filter(x, z)) out.push({ x, z, ry: rnd() * 6 }); } return out; };
  // bosque denso al noreste y noroeste; árboles sueltos en el resto
  const forest = pick(520, 2, (x, z) => z < 0 || rnd() < 0.45);
  const kinds = ['tree_default', 'tree_oak', 'tree_pineRoundA', 'tree_pineTallA', 'tree_blocks', 'tree_cone', 'tree_fat'];
  for (let k = 0; k < kinds.length; k++) await scatter(U.nat(kinds[k]), forest.filter((_, i) => i % kinds.length === k).map(t => ({ ...t, h: R(6, 12) })), { r: 0.9 });
  const rocks = pick(90, 1); for (let k = 0; k < 3; k++) await scatter(U.nat(['rock_largeA', 'rock_largeB', 'rock_largeC'][k]), rocks.filter((_, i) => i % 3 === k).map(t => ({ ...t, h: R(1.2, 3.5) })), { r: 1.3 });
  const bushes = pick(260, 0); await scatter(U.nat('plant_bush'), bushes.slice(0, 130).map(t => ({ ...t, h: R(0.8, 1.5) }))); await scatter(U.nat('grass_large'), bushes.slice(130).map(t => ({ ...t, h: R(0.6, 1) })), { cast: false });
  const flowers = pick(240, 0); for (let k = 0; k < 3; k++) await scatter(U.nat(['flower_redA', 'flower_yellowA', 'flower_purpleA'][k]), flowers.filter((_, i) => i % 3 === k).map(t => ({ ...t, h: 0.7 })), { cast: false });
  // granja vertical y cultivos al sureste
  const crops = []; for (let x = FARM[0] + 4; x < FARM[2] - 2; x += 5) for (let z = FARM[1] + 5; z < FARM[3]; z += 10) crops.push({ x, z, h: 1.1, ry: rnd() * 6 });
  await scatter(U.nat('plant_bush'), crops, { cast: false });
  verticalFarm(FARM[0] + 12, FARM[1] - 10); verticalFarm(FARM[0] + 32, FARM[1] - 10); verticalFarm(FARM[2] + 8, FARM[1] + 20);
  // parque del lago
  const benches = []; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; benches.push({ x: LAKE[0] + Math.cos(a) * (LAKE[2] + 5), z: LAKE[1] + Math.sin(a) * (LAKE[2] + 5), h: 1, ry: -a - Math.PI / 2 }); }
  await scatter(U.kk('bench'), benches, { r: 0.8 });
  // faroles a lo largo de los bulevares y el anillo
  const lamps = [];
  for (let d = 44; d < 300; d += 22) { for (const s of [-7.5, 7.5]) { if (d < 105 || d > 125) { lamps.push({ x: s, z: d, h: 6, ry: 0 }); if (d < 100) lamps.push({ x: s, z: -d, h: 6, ry: 0 }); lamps.push({ x: d, z: s, h: 6, ry: Math.PI / 2 }); lamps.push({ x: -d, z: s, h: 6, ry: Math.PI / 2 }); } } }
  await scatter(U.kk('streetlight'), lamps.filter(l => dist(l.x, l.z, ...DPOS.robot) > 70 && dist(l.x, l.z, ...DPOS.eco) > 75 && dist(l.x, l.z, ...DPOS.mars) > 85 && !(Math.abs(l.x) < 95 && l.z < -105)), { r: 0.3 });
  // monorriel elevado (anillo de 140 m)
  const trackR = 140;
  const track = new THREE.Mesh(new THREE.TorusGeometry(trackR, 0.8, 6, 160), M('#d9dfe9')); track.rotation.x = Math.PI / 2; track.position.y = 10; scene.add(track);
  const sup = []; for (let i = 0; i < 40; i++) { const a = i / 40 * 6.28; const x = Math.cos(a) * trackR, z = Math.sin(a) * trackR; if (Math.abs(x) < 14 || Math.abs(z) < 14 || segDist(x, z, 85, -85, TOWER[0], TOWER[1]) < 10) continue; sup.push([x, z]); }
  const supGeo = new THREE.CylinderGeometry(0.6, 0.9, 10, 8), supMat = M('#aab4c4');
  const im = new THREE.InstancedMesh(supGeo, supMat, sup.length); const mm = new THREE.Matrix4();
  sup.forEach(([x, z], i) => { mm.makeTranslation(x, 5, z); im.setMatrixAt(i, mm); circles.push({ x, z, r: 1 }); }); im.castShadow = true; scene.add(im);
  const train = new THREE.Group(); scene.add(train);
  for (let i = 0; i < 4; i++) { const car = new THREE.Mesh(new THREE.CapsuleGeometry(1.4, 6, 4, 10), M(i ? '#ffffff' : '#22b8ff', { emissive: i ? '#000' : '#0a5a8a', emissiveIntensity: 0.4 })); car.rotation.z = Math.PI / 2; const w = new THREE.Mesh(new THREE.BoxGeometry(5, 0.8, 2.9), M('#2b3a55', { emissive: '#7ad3ff', emissiveIntensity: 0.4 })); w.position.y = 0.5; const cg = new THREE.Group(); cg.add(car, w); train.add(cg); cg.userData.i = i; }
  animated.push(t => train.children.forEach(cg => { const a = t * 0.05 - cg.userData.i * 0.066; cg.position.set(Math.cos(a) * trackR, 12, Math.sin(a) * trackR); cg.rotation.y = -a; }));
}

function platformsAndCells() {
  for (const [x, z, h, w] of PLATFORMS) skyPlatform(x, z, h, w);
  // celdas en el suelo, repartidas por todo el mapa (algunas escondidas)
  const ground = [[22, 22], [-24, -22], [70, 60], [-70, -60], [150, -20], [258, -62], [268, 22], [-150, 30], [-260, -30], [-262, 48], [30, 150], [-30, 160], [60, 250], [-110, 230], [170, 210], [-170, -170], [-120, -90], [-45, -200], [110, -150], [130, -250], [-140, -250], [230, 150], [-280, 140], [280, -120]];
  for (const [x, z] of ground) cellSpots.push([x, 1.2, z]);
}

function citizensSpots() {
  const pos = { c1: [58, 13], c2: [-122, -150], c3: [112, -46], c4: [-42, 262], c5: [-13, -100], c6: [150, 92], c7: [-80, -82], c8: [236, 64], c9: [96, 86], c10: [-108, 86], c11: [64, 272], c12: [-252, -62] };
  for (const c of CITIZENS) { const [x, z] = pos[c.id]; citizenSpots[c.id] = [x, z, Math.atan2(-x, -z)]; }
}

// ---------- construir todo ----------
export async function buildWorld() {
  scene.background = new THREE.Color('#9fd8ff');
  scene.fog = new THREE.Fog('#bfe6ff', 140, 560);
  sky(); water();
  const cv = paintGround();
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const ground = new THREE.Mesh(new THREE.CircleGeometry(350, 128), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  for (const d of DISTRICTS) powerCore(d);
  platformsAndCells(); citizensSpots();
  await Promise.all([plaza(), robotLab(), ecoDome(), marsBase(), smartCity(), glitchTower(), countryside()]);
}
