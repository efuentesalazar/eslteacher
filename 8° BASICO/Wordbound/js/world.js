import * as THREE from 'three';
import { scene, colliders, camBlockers, animated, WORLD_R, REALMS, realmWeights, roads, roadPath, flatArea, distToRoads, H, prop, scatter, rnd, M, shadowize, label, load } from './core.js';
import { PLACES, SIGNS, NPCS, PORTALS } from './data/world_data.js';
import { ACTS } from './data/quests.js';

const blocked = [];   // {x,z,r}: no random trees here
const block = (x, z, r) => blocked.push({ x, z, r });
export const world = { lanterns: [], crown: null, signs: [], lakes: [], portals: [] };

function isFree(x, z, pad = 0) {
  const d = Math.hypot(x, z);
  if (d > WORLD_R - 4) return false;
  for (const b of blocked) if (Math.abs(b.x - x) < b.r + pad && Math.hypot(b.x - x, b.z - z) < b.r + pad) return false;
  return distToRoads(x, z) > 4 + pad;
}

// ---------- terrain ----------
function buildGround() {
  const S = (WORLD_R + 40) * 2, N = 220;
  const g = new THREE.PlaneGeometry(S, S, N, N); g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, col = new Float32Array(pos.count * 3);
  const rc = REALMS.map(r => new THREE.Color(r.color)), c = new THREE.Color(), tmp = new THREE.Color();
  const sand = new THREE.Color('#ead39a'), rock = new THREE.Color('#9a958c'), road = new THREE.Color('#d9bf8a');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = H(x, z); pos.setY(i, h);
    const w = realmWeights(x, z); c.setRGB(0, 0, 0);
    w.forEach((v, k) => { c.r += rc[k].r * v; c.g += rc[k].g * v; c.b += rc[k].b * v; });
    if (w[2] > 0.4 && h > 4) c.lerp(rock, Math.min(1, (h - 4) / 2.5) * 0.8);
    const n = Math.sin(x * 0.37) * Math.cos(z * 0.41) * 0.05 + (Math.sin(x * 1.3 + z * 0.7) * 0.03);
    c.offsetHSL(0, 0, n);
    const d = Math.hypot(x, z); if (d > WORLD_R - 2) c.lerp(sand, Math.min(1, (d - WORLD_R + 2) / 6));
    if (distToRoads(x, z) < 2.6) c.lerp(road, 0.85 * (w[4] > 0.5 ? 0.5 : 1));
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  const ground = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, flatShading: true }));
  ground.receiveShadow = true; scene.add(ground);
  const water = new THREE.Mesh(new THREE.CircleGeometry(900, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#3fb3e8', roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.93 }));
  water.position.y = -1.1; scene.add(water);
  animated.push(t => { water.position.y = -1.1 + Math.sin(t * 0.7) * 0.06; });
}

function lake(x, z, r, color = '#2aa6e0') {
  const m = new THREE.Mesh(new THREE.CircleGeometry(r, 32).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color, roughness: 0.12, metalness: 0.15, transparent: true, opacity: 0.9 }));
  let lo = 1e9; for (let a = 0; a < 6.3; a += 0.5) lo = Math.min(lo, H(x + Math.cos(a) * r, z + Math.sin(a) * r));
  m.position.set(x, Math.min(lo, H(x, z)) + 0.12, z); scene.add(m);
  const shore = new THREE.Mesh(new THREE.RingGeometry(r, r + 1.6, 32).rotateX(-Math.PI / 2), M('#e6d29a')); shore.position.copy(m.position); shore.position.y -= 0.02; scene.add(shore);
  colliders.push({ x, z, r: r - 0.6 }); block(x, z, r + 3); world.lakes.push({ x, z, r, color });
  return m;
}

function buildRoads() {
  const T = REALMS.map(r => r.town);
  for (let i = 1; i < 5; i++) roadPath(T[0].x + Math.sign(T[i].x) * 10, T[0].z + Math.sign(T[i].z) * 10, T[i].x - Math.sign(T[i].x) * 8, T[i].z - Math.sign(T[i].z) * 8, 8, 2);
  const spur = (a, b) => roadPath(PLACES[a].x, PLACES[a].z, PLACES[b].x, PLACES[b].z, 3, 1);
  spur('brightwater', 'farm'); spur('brightwater', 'mill'); spur('brightwater', 'pond'); roadPath(-8, -8, -38, -55, 3, 1);
  spur('leafhollow', 'glade'); spur('leafhollow', 'wolflake'); spur('leafhollow', 'sagetree');
  roadPath(176, -10, 200, -42, 3, 1); spur('ironhearth', 'quarry');
  spur('redrock', 'oasis'); spur('redrock', 'ruins');
  spur('bonewick', 'graveyard'); roadPath(-172, -8, -172, -40, 1, 1); roadPath(-172, -40, -200, -44, 1, 1); spur('bonewick', 'tower');
  // flat ground in towns and special places
  flatArea(0, 0, 34); flatArea(0, -176, 30); flatArea(176, 0, 30); flatArea(0, 176, 30); flatArea(-172, 0, 26);
  flatArea(-50, -74, 24); flatArea(46, 36, 16); flatArea(-50, 40, 8); flatArea(-226, 0, 16); flatArea(-206, -44, 12); flatArea(208, -52, 22); flatArea(0, -224, 10);
}

function drawRoads() {
  const mat = new THREE.MeshStandardMaterial({ color: '#d9bf8a', roughness: 1, polygonOffset: true, polygonOffsetFactor: -2 });
  for (const r of roads) {
    const P = r.pts, n = P.length - 1, pos = [], idx = [];
    P.forEach((p, i) => {
      const d = P[Math.min(n, i + 1)].clone().sub(P[Math.max(0, i - 1)]).normalize(), nx = -d.z * r.w / 2, nz = d.x * r.w / 2;
      pos.push(p.x + nx, H(p.x + nx, p.z + nz) + 0.07, p.z + nz, p.x - nx, H(p.x - nx, p.z - nz) + 0.07, p.z - nz);
      if (i < n) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; scene.add(m);
  }
}

// ---------- small procedural things ----------
function box(w, h, d, color, x, y, z, parent = scene) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(color)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
function signTexture(lines, w = 512, h = 256) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const c = cv.getContext('2d');
  c.fillStyle = '#c99a5b'; c.fillRect(0, 0, w, h); c.strokeStyle = '#6b4423'; c.lineWidth = 14; c.strokeRect(7, 7, w - 14, h - 14);
  c.fillStyle = '#3a2410'; c.textAlign = 'center'; c.font = `800 ${lines.length > 2 ? 40 : 46}px Nunito, sans-serif`;
  lines.forEach((l, i) => c.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (lines.length > 2 ? 62 : 72) + 16));
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function signpost(x, z, lines) {
  const y = H(x, z), g = new THREE.Group(); g.position.set(x, y, z);
  box(0.22, 2.8, 0.22, '#7a5230', 0, 1.4, 0, g);
  const board = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.3, 0.1), [M('#a8763e'), M('#a8763e'), M('#a8763e'), M('#a8763e'), new THREE.MeshStandardMaterial({ map: signTexture(lines) }), new THREE.MeshStandardMaterial({ map: signTexture(lines) })]);
  board.position.y = 2.3; board.castShadow = true; g.add(board);
  g.rotation.y = Math.atan2(-x, -z) + Math.PI; scene.add(g); colliders.push({ x, z, r: 0.35 });
  world.signs.push({ x, z, lines });
}
export function noticeBoard(x, z) {
  const y = H(x, z), g = new THREE.Group(); g.position.set(x, y, z);
  box(0.2, 2.6, 0.2, '#6b4423', -1.1, 1.3, 0, g); box(0.2, 2.6, 0.2, '#6b4423', 1.1, 1.3, 0, g);
  box(2.6, 1.6, 0.14, '#a8763e', 0, 1.8, 0, g); box(2.9, 0.2, 0.4, '#6b4423', 0, 2.7, 0, g);
  ['#fff6d8', '#ffe0e0', '#e0f0ff'].forEach((c, i) => { const p = box(0.6, 0.75, 0.02, c, -0.75 + i * 0.75, 1.8, 0.09, g); p.rotation.z = (i - 1) * 0.08; });
  g.rotation.y = Math.atan2(-x, -z); scene.add(g); colliders.push({ x, z, r: 1 });
  return g;
}
function cactus(x, z, h) {
  const g = new THREE.Group(), m = M('#4f9a4a'); const y = H(x, z);
  const t = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * h / 3, 0.4 * h / 3, h, 7), m); t.position.y = h / 2; g.add(t);
  for (const s of [-1, 1]) { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * h / 3, 0.22 * h / 3, h * 0.35, 6), m); a.position.set(s * 0.6 * h / 3, h * 0.55, 0); g.add(a); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * h / 3, 0.2 * h / 3, 0.5 * h / 3, 6), m); b.rotation.z = Math.PI / 2; b.position.set(s * 0.35 * h / 3, h * 0.4, 0); g.add(b); }
  g.position.set(x, y, z); g.rotation.y = rnd() * 6; shadowize(g); scene.add(g); colliders.push({ x, z, r: 0.5 * h / 3 + 0.2 });
}
function palm(x, z, h = 7) {
  const g = new THREE.Group(), y = H(x, z);
  for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.28 - i * 0.02, 0.32 - i * 0.02, h / 6, 7), M(i % 2 ? '#a0703a' : '#8a5a2b')); s.position.set(i * 0.12, h / 12 + i * h / 6, 0); g.add(s); }
  for (let k = 0; k < 7; k++) { const l = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3.6, 4), M('#3f9a3a')); l.scale.z = 0.25; l.position.set(0.7, h, 0); l.rotation.set(0, k / 7 * Math.PI * 2, 1.9); const p = new THREE.Group(); p.add(l); p.rotation.y = k / 7 * Math.PI * 2; p.position.set(0.7, 0, 0); l.position.set(1.5, h - 0.3, 0); l.rotation.set(0, 0, -1.2); g.add(p); }
  g.position.set(x, y, z); shadowize(g); scene.add(g); colliders.push({ x, z, r: 0.5 });
}
function crystal(x, z, h, color = '#4ad0ff') {
  const g = new THREE.Group(), y = H(x, z);
  for (let k = 0; k < 5; k++) { const c = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), M(color, { emissive: color, emissiveIntensity: 0.45, transparent: true, opacity: 0.9, roughness: 0.2 })); const s = k ? 0.4 + rnd() * 0.4 : 1; c.scale.set(0.45 * s * h / 3, s * h / 2, 0.45 * s * h / 3); c.position.set(k ? (rnd() - .5) * 2 : 0, s * h / 2 * 0.9, k ? (rnd() - .5) * 2 : 0); c.rotation.set((rnd() - .5) * 0.5, rnd() * 3, (rnd() - .5) * 0.5); g.add(c); }
  const l = new THREE.PointLight(color, 8, 14); l.position.y = h * 0.6; g.add(l);
  g.position.set(x, y, z); shadowize(g); scene.add(g); colliders.push({ x, z, r: h * 0.35 });
}
function cart(x, z, color = '#c0392b') {
  const g = new THREE.Group(), y = H(x, z);
  box(2, 0.9, 1.3, color, 0, 0.9, 0, g); box(2.1, 0.12, 1.4, '#5a3a20', 0, 1.4, 0, g);
  for (const [a, b] of [[-0.7, 0.7], [0.7, 0.7], [-0.7, -0.7], [0.7, -0.7]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.15, 10), M('#3a2a1a')); w.rotation.x = Math.PI / 2; w.position.set(a, 0.35, b * 1.05); g.add(w); }
  for (let k = 0; k < 4; k++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), M('#7a7a80')); r.position.set((rnd() - .5) * 1.2, 1.45, (rnd() - .5) * 0.8); g.add(r); }
  g.position.set(x, y, z); g.rotation.y = 0.4; shadowize(g); scene.add(g); colliders.push({ x, z, r: 1.3 });
}
function anvil(x, z) {
  const g = new THREE.Group(), y = H(x, z);
  box(0.6, 0.7, 0.6, '#5a4a3a', 0, 0.35, 0, g); box(1.2, 0.35, 0.5, '#4a4f58', 0, 0.85, 0, g); const h = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 6), M('#4a4f58')); h.rotation.z = Math.PI / 2; h.position.set(0.85, 0.85, 0); g.add(h);
  g.position.set(x, y, z); shadowize(g); scene.add(g); colliders.push({ x, z, r: 0.7 });
}
function waterfall(x, z) {
  const y = H(x, z);
  for (let k = 0; k < 7; k++) prop(['fo/Rock_3_A_Color1', 'fo/Rock_1_E_Color1', 'fo/Rock_3_E_Color1'][k % 3], x - 9 + k * 3, z - 4 - (k % 2) * 1.5, 7 + rnd() * 4, { r: 2 });
  const tex = (() => { const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const c = cv.getContext('2d'); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.5})`; c.fillRect(rnd() * 64, rnd() * 256, 2 + rnd() * 4, 20 + rnd() * 50); } const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(4, 8), new THREE.MeshStandardMaterial({ color: '#6fd0ff', map: tex, transparent: true, opacity: 0.85, emissive: '#2a7fb0', emissiveIntensity: 0.3 }));
  fall.position.set(x, y + 4, z - 1.6); scene.add(fall);
  animated.push(t => { tex.offset.y = t * 1.2; });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(3.4, 20).rotateX(-Math.PI / 2), M('#3fb3e8', { roughness: 0.1 })); pool.position.set(x, y + 0.1, z - 0.4); scene.add(pool);
}
function tower(x, z) {
  const y = H(x, z), g = new THREE.Group(); g.position.set(x, y, z);
  const dark = M('#2b2440'), trim = M('#5a3f8a', { emissive: '#3a1f6a', emissiveIntensity: 0.5 });
  for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(5.4 - i * 0.5, 5.8 - i * 0.5, 5, 10), dark); s.position.y = 2.5 + i * 5; g.add(s); const r = new THREE.Mesh(new THREE.TorusGeometry(5.6 - i * 0.5, 0.25, 6, 20), trim); r.rotation.x = Math.PI / 2; r.position.y = 5 + i * 5; g.add(r); }
  const top = new THREE.Mesh(new THREE.ConeGeometry(3.6, 7, 10), M('#1c1730')); top.position.y = 33.5; g.add(top);
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), M('#a070ff', { emissive: '#7a3cff', emissiveIntensity: 1.5 })); orb.position.y = 38; g.add(orb);
  const door = box(2.6, 4, 0.4, '#140f22', 0, 2, 5.5, g); door.material = M('#140f22', { emissive: '#4a1f8a', emissiveIntensity: 0.35 });
  const l = new THREE.PointLight('#9a6aff', 30, 40); l.position.y = 36; g.add(l);
  g.rotation.y = Math.PI / 2; shadowize(g); scene.add(g);
  colliders.push({ x, z, r: 6 }); camBlockers.push({ x, z, r: 6, y0: y, y1: y + 36 }); block(x, z, 10);
  animated.push(t => { orb.position.y = 38 + Math.sin(t * 1.5) * 0.4; orb.rotation.y = t; });
  // ring of standing stones (the arena)
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; if (Math.abs(Math.cos(a) - 1) < 0.3) continue; prop('fo/Rock_3_E_Color1', x + 10 + Math.cos(a) * 14, z + Math.sin(a) * 14, 3 + rnd(), { r: 1, tint: '#4a3a6a', tintK: 0.5 }); }
}
function linguaStone() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.8, 0.8, 8), M('#b8b0a0')); base.position.y = 0.4; g.add(base);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 3.2, 8), M('#cfc8b8')); pillar.position.y = 2.4; g.add(pillar);
  const runes = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.4, 8), M('#6fb0ff', { emissive: '#3a7fff', emissiveIntensity: 0.6 })); runes.position.y = 3.2; g.add(runes);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 0.9, 0.4, 8), M('#b8b0a0')); cap.position.y = 4.2; g.add(cap);
  const crown = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, 0.5, 12, 1, true), M('#ffcc33', { metalness: 0.7, roughness: 0.3, side: THREE.DoubleSide, emissive: '#7a5a00', emissiveIntensity: 0.4 })); crown.add(ring);
  for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.5, 4), M('#ffcc33', { metalness: 0.7, roughness: 0.3 })); const a = k / 6 * Math.PI * 2; s.position.set(Math.cos(a) * 0.72, 0.45, Math.sin(a) * 0.72); crown.add(s); const gm = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), M(['#4ade80', '#fb923c', '#facc15', '#a78bfa', '#60a5fa', '#f472b6'][k], { emissive: '#ffffff', emissiveIntensity: 0.3 })); gm.position.set(Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8); crown.add(gm); }
  crown.position.y = 4.8; g.add(crown); crown.visible = false; world.crown = crown;
  const cl = new THREE.PointLight('#ffd76a', 0, 25); cl.position.y = 6; g.add(cl); crown.userData.light = cl;
  animated.push(t => { crown.rotation.y = t * 0.6; crown.position.y = 4.9 + Math.sin(t * 2) * 0.1; runes.material.emissiveIntensity = crown.visible ? 1.2 : 0.25 + Math.sin(t * 3) * 0.15; });
  shadowize(g); scene.add(g); colliders.push({ x: 0, z: 0, r: 2.8 });
}
function fieldOfWheat(x, z, w, d) {
  const n = Math.floor(w * d / 0.9), im = new THREE.InstancedMesh(new THREE.ConeGeometry(0.1, 0.75, 4), M('#e8c34a', { emissive: '#7a5a00', emissiveIntensity: 0.1 }), n); im.frustumCulled = false;
  const mat = new THREE.Matrix4(); let k = 0;
  for (let i = 0; i < n; i++) { const px = x - w / 2 + rnd() * w, pz = z - d / 2 + rnd() * d; if (distToRoads(px, pz) < 3) continue; im.setMatrixAt(k++, mat.makeTranslation(px, H(px, pz) + 0.33, pz)); }
  im.count = k; im.castShadow = true; scene.add(im); block(x, z, Math.max(w, d) / 2);
}
function soilPatch(x, z, r, color = '#5a3b22') { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 18).rotateX(-Math.PI / 2), M(color)); m.position.set(x, H(x, z) + 0.06, z); m.receiveShadow = true; scene.add(m); }

/** Lantern post for "Light the Way". Returns {lit(on)} */
function lanternPost(x, z) {
  const g = new THREE.Group(), y = H(x, z); g.position.set(x, y, z);
  box(0.18, 3, 0.18, '#3a3048', 0, 1.5, 0, g); box(0.9, 0.12, 0.12, '#3a3048', 0.35, 2.9, 0, g);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.55, 0.4), M('#444455', { transparent: true, opacity: 0.85 })); glass.position.set(0.7, 2.55, 0); g.add(glass);
  const light = new THREE.PointLight('#ffd27a', 0, 14); light.position.set(0.7, 2.5, 0); g.add(light);
  shadowize(g); scene.add(g); colliders.push({ x, z, r: 0.3 });
  const L = { x, z, on: false, set(on) { L.on = on; glass.material.color.set(on ? '#ffe9a8' : '#444455'); glass.material.emissive = new THREE.Color(on ? '#ffb43a' : '#000'); glass.material.emissiveIntensity = on ? 1.2 : 0; light.intensity = on ? 12 : 0; } };
  return L;
}


/** Magic portal: stone ring with a swirling centre. Returns {def, x, z, set(active)} */
function spiralTexture() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d');
  const g = c.createRadialGradient(128, 128, 10, 128, 128, 128); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 6;
  for (let arm = 0; arm < 4; arm++) { c.beginPath(); for (let t = 0; t < 1; t += 0.01) { const a = arm * Math.PI / 2 + t * 7, r = t * 120; c.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } c.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
let spiralTex = null;
function portal(def) {
  const { x, z, color } = def, y = H(x, z), g = new THREE.Group(); g.position.set(x, y, z);
  const stone = M('#8f8a9a'), dark = M('#5a5568');
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.9, 0.4, 10), dark); base.position.y = 0.2; g.add(base);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4.2, 0.7), stone); p.position.set(s * 2, 2.3, 0); g.add(p); const cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.42), M(color, { emissive: color, emissiveIntensity: 0.9 })); cap.position.set(s * 2, 4.75, 0); g.add(cap); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.22, 8, 28), stone); ring.position.y = 2.6; g.add(ring);
  spiralTex ||= spiralTexture();
  const swirlMat = new THREE.MeshBasicMaterial({ map: spiralTex, color, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false });
  const swirl = new THREE.Mesh(new THREE.CircleGeometry(1.6, 32), swirlMat); swirl.position.y = 2.6; g.add(swirl);
  const light = new THREE.PointLight(color, 0, 12); light.position.y = 2.6; g.add(light);
  const n = 30, pos = new Float32Array(n * 3), seedA = []; for (let i = 0; i < n; i++) seedA.push([rnd() * 6.28, rnd()]);
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ color, size: 0.18, transparent: true, opacity: 0.9, depthWrite: false })); g.add(pts);
  g.rotation.y = Math.atan2(REALMS[def.realm].town.x - x, REALMS[def.realm].town.z - z);
  shadowize(base); shadowize(ring); scene.add(g);
  colliders.push({ x: x + Math.cos(g.rotation.y) * 2, z: z - Math.sin(g.rotation.y) * 2, r: 0.5 }, { x: x - Math.cos(g.rotation.y) * 2, z: z + Math.sin(g.rotation.y) * 2, r: 0.5 });
  const P = { def, x, z, on: false, rot: g.rotation.y, set(on) { P.on = on; swirlMat.color.set(on ? color : '#777788'); swirlMat.opacity = on ? 0.85 : 0.35; light.intensity = on ? 10 : 0; pts.visible = on; } };
  animated.push(t => {
    swirl.rotation.z = -t * (P.on ? 2.2 : 0.4);
    if (!P.on) return;
    for (let i = 0; i < n; i++) { const [a, o] = seedA[i], k = (t * 0.5 + o) % 1, r = 1.7 * (1 - k); pos[i * 3] = Math.cos(a + t) * r; pos[i * 3 + 1] = 2.6 + Math.sin(a + t) * r; pos[i * 3 + 2] = (k - 0.5) * 0.4; }
    pg.attributes.position.needsUpdate = true;
  });
  block(x, z, 5); world.portals.push(P); return P;
}

// ---------- realms ----------

/** The Arena (PvP duels): sand floor, stone wall with a gate, banners, torches and benches. */
function arena() {
  const A = PLACES.arena, y = H(A.x, A.z), g = new THREE.Group(); g.position.set(A.x, y, A.z); scene.add(g);
  const gateA = Math.atan2(-A.z, -A.x);                 // the gate looks at Brightwater
  world.arena = { x: A.x, z: A.z, r: 13, gateA };
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14.6, 48).rotateX(-Math.PI / 2), M('#e8cf98', { roughness: 1 })); floor.position.y = 0.07; floor.receiveShadow = true; g.add(floor);
  for (const [r0, r1, c] of [[5.6, 6, '#b08850'], [0, 1.2, '#c0392b'], [13.6, 14.6, '#b08850']]) { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 48).rotateX(-Math.PI / 2), M(c)); m.position.y = 0.09; g.add(m); }
  for (const [s, c] of [[-1, '#e2453a'], [1, '#2f8fe0']]) { const m = new THREE.Mesh(new THREE.CircleGeometry(1.4, 24).rotateX(-Math.PI / 2), M(c, { emissive: c, emissiveIntensity: 0.25 })); m.position.set(s * 8, 0.1, 0); g.add(m); }
  // stone wall, with a gap for the gate
  const stone = M('#a39a8c'), top = M('#8a8174');
  const segs = 34;
  for (let i = 0; i < segs; i++) {
    const a = i / segs * Math.PI * 2, da = Math.atan2(Math.sin(a - gateA), Math.cos(a - gateA));
    if (Math.abs(da) < 0.22) continue;
    const x = Math.cos(a) * 15.4, z = Math.sin(a) * 15.4;
    const w = new THREE.Mesh(new THREE.BoxGeometry(2.95, 1.7, 0.9), stone); w.position.set(x, 0.85, z); w.rotation.y = -a + Math.PI / 2; w.castShadow = true; w.receiveShadow = true; g.add(w);
    if (i % 2) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 1.1), top); c.position.set(x, 1.95, z); c.rotation.y = -a + Math.PI / 2; g.add(c); }
    colliders.push({ x: A.x + x, z: A.z + z, r: 1.45 });
  }
  // gate pillars with flags, and big pillars around
  for (const s of [-1, 1]) {
    const a = gateA + s * 0.27, x = Math.cos(a) * 15.6, z = Math.sin(a) * 15.6;
    const p = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5, 1.4), stone); p.position.set(x, 2.5, z); p.castShadow = true; g.add(p);
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 1.2), M(s < 0 ? '#e2453a' : '#2f8fe0')); f.position.set(x, 4.2, z + 0.01); f.rotation.y = -a; g.add(f);
    colliders.push({ x: A.x + x, z: A.z + z, r: 1 });
  }
  const arch = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 9.5), stone); arch.position.set(Math.cos(gateA) * 15.6, 5.2, Math.sin(gateA) * 15.6); arch.rotation.y = -gateA; arch.castShadow = true; g.add(arch);
  for (let k = 0; k < 8; k++) {
    const a = gateA + Math.PI / 8 + k * Math.PI / 4; if (Math.abs(Math.atan2(Math.sin(a - gateA), Math.cos(a - gateA))) < 0.4) continue;
    prop('dg/torch_lit', A.x + Math.cos(a) * 16.9, A.z + Math.sin(a) * 16.9, 2.6, { r: 0.3 });
    prop(k % 2 ? 'dg/banner_patternA_red' : 'dg/banner_patternC_blue', A.x + Math.cos(a + 0.2) * 16.9, A.z + Math.sin(a + 0.2) * 16.9, 3.2, { r: 0.3, ry: -a - Math.PI / 2 });
  }
  for (let k = 0; k < 10; k++) { const a = gateA + 0.7 + k * 0.5; prop('hw/bench', A.x + Math.cos(a) * 19.5, A.z + Math.sin(a) * 19.5, 0.9, { r: 0.9, ry: -a + Math.PI / 2 }); }
  shadowize(floor); block(A.x, A.z, 26);
}

async function greenvale() {
  arena();
  linguaStone();
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(13, 40).rotateX(-Math.PI / 2), M('#e6cf9e')); plaza.position.y = H(0, 0) + 0.05; plaza.receiveShadow = true; scene.add(plaza);
  block(0, 0, 36);
  const B = [['hx/building_castle_blue', -22, -20, 11, 5], ['hx/building_blacksmith_blue', 22, -16, 6.5, 3.6], ['hx/building_tavern_blue', 22, 24, 7, 3.8], ['hx/building_market_blue', -22, 20, 6, 3.6],
    ['hx/building_home_A_blue', -32, 8, 6, 3.4], ['hx/building_home_B_red', -30, -8, 6, 3.4], ['hx/building_home_A_red', 30, -32, 6, 3.4], ['hx/building_home_B_blue', -12, -34, 6, 3.4],
    ['hx/building_home_A_yellow', 12, 34, 6, 3.4], ['hx/building_church_blue', -14, 34, 8, 3.8], ['hx/building_home_B_yellow', 32, 10, 6, 3.4], ['hx/building_well_blue', 8, 6, 2.6, 1.2]];
  for (const [k, x, z, h, r] of B) prop(k, x, z, h, { r, ry: Math.atan2(-x, -z) });
  for (const [x, z] of [[-18, 10], [-20, 13], [-24, 12]]) prop(['hx/crate_A_big', 'hx/barrel', 'hx/sack'][Math.floor(rnd() * 3)], x, z, 0.9, { r: 0.6 });
  prop('hx/weaponrack', 20, -10, 1.6, { r: 0.6, ry: -Math.PI / 2 }); anvil(14, -13);
  crystal(-18, -15, 2.6, '#ffd23a'); anvil(-13, -16);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + 0.2; prop('dg/torch_lit', Math.cos(a) * 14, Math.sin(a) * 14, 2.2, { r: 0.25 }); }
  // farm
  const F = PLACES.farm;
  prop('hx/building_home_B_red', F.x + 6, F.z - 8, 6, { r: 3.4, ry: 2.6 }); prop('hx/building_home_A_yellow', F.x - 8, F.z - 10, 6, { r: 3.4, ry: 0.5 });
  fieldOfWheat(F.x + 14, F.z + 10, 16, 14);
  for (let k = 0; k < 10; k++) prop('hx/fence_wood_straight', F.x - 10 + k * 2.2, F.z + 2, 1, { ry: 0 });
  // mill and pond
  prop('hx/building_windmill_blue', PLACES.mill.x, PLACES.mill.z - 3, 10, { r: 3, ry: 0.6 }); block(PLACES.mill.x, PLACES.mill.z, 8);
  lake(PLACES.pond.x + 6, PLACES.pond.z - 4, 9); prop('hx/tent', PLACES.pond.x - 6, PLACES.pond.z + 4, 2.5, { r: 1.5 });
}

async function whisperwood() {
  const T = REALMS[1].town;
  const B = [['hx/building_church_green', 0, -196, 10, 4.5, 0], ['hx/building_home_A_green', -18, -170, 6, 3.4], ['hx/building_home_B_green', 18, -172, 6, 3.4], ['hx/building_tower_A_green', -20, -188, 10, 3],
    ['hx/building_tower_A_green', 20, -188, 10, 3], ['hx/building_home_A_green', -24, -158, 6, 3.4], ['hx/building_market_green', -10, -184, 5, 3], ['hx/building_archeryrange_green', 26, -154, 5, 3.5]];
  for (const [k, x, z, h, r, ry] of B) prop(k, x, z, h, { r, ry: ry ?? Math.atan2(T.x - x, T.z - z) });
  block(T.x, T.z - 6, 30);
  // giant trees around the town
  const big = []; for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, d = 34 + rnd() * 4, x = T.x + Math.cos(a) * d, z = T.z - 6 + Math.sin(a) * d; if (distToRoads(x, z) > 5) big.push({ x, z, h: 13 + rnd() * 4 }); }
  await scatter('fo/Tree_4_A_Color1', big, { r: 1.4, cam: true });
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; prop('dg/banner_patternB_green', T.x + Math.cos(a) * 13, T.z - 6 + Math.sin(a) * 13, 3, { r: 0.3, ry: -a }); }
  // glade (moonflowers), wolf lake, great tree
  soilPatch(PLACES.glade.x, PLACES.glade.z, 14, '#4f9a55'); block(PLACES.glade.x, PLACES.glade.z, 15);
  lake(PLACES.wolflake.x, PLACES.wolflake.z, 11, '#2a8fd0');
  const S = PLACES.sagetree;
  await prop('fo/Tree_3_A_Color1', S.x, S.z - 4, 24, { r: 3, cam: true, ry: 0 }); block(S.x, S.z, 10);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; prop('fo/Rock_1_A_Color1', S.x + Math.cos(a) * 8, S.z - 4 + Math.sin(a) * 8, 0.8); }
  // fireflies
  const n = 120, pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) { const a = rnd() * 6.28, d = rnd() * 60; base.push([T.x + Math.cos(a) * d, T.z - 20 + Math.sin(a) * d, rnd() * 6]); }
  const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(fg, new THREE.PointsMaterial({ color: '#d9ff7a', size: 0.25, transparent: true, opacity: 0.9 })));
  animated.push(t => { for (let i = 0; i < n; i++) { const b = base[i]; pos[i * 3] = b[0] + Math.sin(t * .5 + b[2]) * 2; pos[i * 3 + 1] = H(b[0], b[1]) + 1.5 + Math.sin(t * .8 + b[2]) * 1; pos[i * 3 + 2] = b[1] + Math.cos(t * .4 + b[2]) * 2; } fg.attributes.position.needsUpdate = true; });
}

async function stonehold() {
  const T = REALMS[2].town;
  const B = [['hx/building_castle_yellow', 206, -6, 12, 5.5, -Math.PI / 2], ['hx/building_blacksmith_yellow', 160, -20, 6.5, 3.6], ['hx/building_home_A_yellow', 158, 18, 6, 3.4], ['hx/building_tavern_yellow', 168, 24, 7, 3.6],
    ['hx/building_barracks_yellow', 186, -22, 6, 3.6], ['hx/building_home_B_yellow', 190, 22, 6, 3.4], ['hx/building_tower_base_yellow', 146, -6, 5, 2.6, 0], ['hx/building_tower_base_yellow', 146, 16, 5, 2.6, 0]];
  for (const [k, x, z, h, r, ry] of B) prop(k, x, z, h, { r, ry: ry ?? Math.atan2(T.x - x, T.z - z) });
  for (let k = 0; k < 6; k++) prop('hx/flag_yellow', 150 + k * 8, k % 2 ? -14 : 14, 4, { r: 0.3 });
  block(T.x + 4, T.z, 30); prop('dg/barrel_large', 156, 22, 1.4, { r: 0.7 }); prop('dg/crates_stacked', 155, 24, 1.6, { r: 0.9 });
  prop('hx/building_stage_A', 186, 18, 2, { r: 2.5 }); for (let k = 0; k < 3; k++) prop('hx/crate_A_small', 184 + k, 26, 0.6);
  // mine
  crystal(181, -17, 2.4, '#a070ff'); anvil(175, -16);
  prop('hx/building_mine_yellow', 206, -44, 7, { r: 4, ry: Math.PI }); cart(198, -52); anvil(200, -40);
  crystal(229, -40, 5); crystal(232, -34, 2.5, '#7af0ff'); crystal(188, -64, 2, '#4ad0ff');
  waterfall(212, -84);
  for (let k = 0; k < 18; k++) { const a = k / 18 * Math.PI * 2, d = 26 + rnd() * 5; const x = 210 + Math.cos(a) * d, z = -56 + Math.sin(a) * d; if (distToRoads(x, z) > 4) prop(k % 3 ? 'fo/Rock_3_A_Color1' : 'fo/Rock_3_E_Color1', x, z, 3.5 + rnd() * 2.5, { r: 2.4, cam: true }); }
  block(210, -56, 26);
  for (let k = 0; k < 6; k++) prop('dg/torch_lit', 196 + k * 4, -46 - (k % 2) * 6, 2, { r: 0.2 });
  // quarry
  for (let k = 0; k < 10; k++) { const a = rnd() * 6.28, d = 6 + rnd() * 8; prop(k % 2 ? 'rb/Stone_Chunks_Large' : 'hx/rock_single_C', PLACES.quarry.x + Math.cos(a) * d, PLACES.quarry.z + Math.sin(a) * d, 1.5 + rnd() * 1.5, { r: 1 }); }
  soilPatch(PLACES.quarry.x, PLACES.quarry.z, 12, '#8a8476'); block(PLACES.quarry.x, PLACES.quarry.z, 14);
}

async function sunscar() {
  const T = REALMS[3].town;
  prop('hx/building_barracks_red', -20, 196, 6, { r: 3.6, ry: 0.5 }); prop('hx/building_tower_A_red', 24, 196, 10, { r: 2.6 });
  prop('hx/tent', 0, 202, 6, { r: 4, ry: Math.PI, tint: '#c0392b', tintK: 0.4 });
  const tents = [[-24, 168], [24, 160], [-18, 150], [30, 182], [-30, 182], [16, 186]];
  for (const [x, z] of tents) prop('hx/tent', x, z, 3.5, { r: 2.2, ry: Math.atan2(-x, T.z - z), tint: ['#c0392b', '#e08a3c', '#8e5a2b'][Math.floor(rnd() * 3)], tintK: 0.35 });
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; prop('dg/banner_patternA_red', T.x + Math.cos(a) * 15, T.z + 6 + Math.sin(a) * 15, 3.2, { r: 0.3 }); }
  const fire = new THREE.Group(); fire.position.set(0, H(0, 176), 176); scene.add(fire);
  ['#ff5a1a', '#ff9a1a', '#ffe14a'].forEach((c, i) => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.8 - i * 0.2, 2 - i * 0.4, 7), new THREE.MeshBasicMaterial({ color: c })); m.position.y = 1 - i * 0.1; fire.add(m); });
  const fl = new THREE.PointLight('#ff9a3a', 20, 20); fl.position.y = 2; fire.add(fl); colliders.push({ x: 0, z: 176, r: 1.4 });
  animated.push(t => fire.children.forEach((m, i) => { if (m.isMesh) m.scale.y = 1 + Math.sin(t * 11 + i) * 0.15; }));
  block(T.x, T.z + 8, 32);
  // oasis
  lake(PLACES.oasis.x, PLACES.oasis.z, 7.5, '#2fc0d8');
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2 + 0.3; palm(PLACES.oasis.x + Math.cos(a) * 13, PLACES.oasis.z + Math.sin(a) * 13, 6 + rnd() * 3); }
  // ruins
  const R = PLACES.ruins;
  prop('hx/building_destroyed', R.x, R.z, 5, { r: 4 }); for (let k = 0; k < 8; k++) prop(k % 2 ? 'dg/rubble_large' : 'dg/pillar', R.x + (rnd() - .5) * 20, R.z + (rnd() - .5) * 20, k % 2 ? 1.2 : 4, { r: 0.8 });
  block(R.x, R.z, 14);
  // the tallest cactus (Kasim's box is behind it)
  cactus(-16, 221, 7.5); block(-16, 224, 4);
  for (let k = 0; k < 70; k++) { const a = Math.PI / 2 + (rnd() - .5) * 1.7, d = 110 + rnd() * 130, x = Math.cos(a) * d, z = Math.sin(a) * d; if (isFree(x, z, 2)) cactus(x, z, 2 + rnd() * 2.5); }
}

async function mistmoor() {
  const T = REALMS[4].town, dark = '#4a3a6a';
  const B = [['hx/building_home_B_blue', -184, -14, 6, 3.4], ['hx/building_home_A_red', -186, 12, 6, 3.4], ['hx/building_home_B_red', -158, -24, 6, 3.4], ['hx/building_church_red', -158, 22, 8, 3.8], ['hx/building_home_A_blue', -150, -6, 6, 3.4]];
  for (const [k, x, z, h, r] of B) prop(k, x, z, h, { r, ry: Math.atan2(T.x - x, T.z - z), tint: dark, tintK: 0.55 });
  block(T.x, T.z, 28);
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2 + 0.3; prop(k % 2 ? 'hw/post_lantern' : 'hw/pumpkin_orange_jackolantern', T.x + Math.cos(a) * 16, T.z + Math.sin(a) * 16, k % 2 ? 3 : 0.9, { r: 0.4 }); }
  // graveyard
  const G = PLACES.graveyard;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) prop(['hw/grave_A', 'hw/grave_B', 'hw/gravestone', 'hw/gravemarker_A'][(i + j) % 4], G.x - 9 + i * 6, G.z - 9 + j * 6, 1.4, { r: 0.6, ry: 0 });
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; if (Math.abs(Math.sin(a) + 1) < 0.2) continue; prop(k % 4 ? 'hw/fence' : 'hw/fence_pillar', G.x + Math.cos(a) * 16, G.z + Math.sin(a) * 16, 1.4, { ry: -a + Math.PI / 2 }); }
  prop('hw/shrine_candles', G.x, G.z + 12, 2.5, { r: 1 }); block(G.x, G.z, 18);
  // the marsh path: two lanterns, a big dead tree, the stone wall, the crypt
  prop('hw/lantern_standing', -169.5, -18, 2.6, { r: 0.3 }); prop('hw/lantern_standing', -174.5, -28, 2.6, { r: 0.3 });
  prop('hw/tree_dead_large', -175, -45, 10, { r: 1.2, ry: 0.5 }); block(-175, -45, 4);
  for (let k = 0; k < 6; k++) prop('dg/wall', -196, -52 + k * 3.8, 4, { ry: Math.PI / 2, r: 1.2, tint: '#7a7a8a', tintK: 0.3 });
  prop('hw/crypt', -208, -46, 6, { r: 4.5, ry: Math.PI / 2 }); block(-206, -44, 12);
  // pumpkin field
  soilPatch(-146, 34, 11); block(-146, 34, 12);
  // dark puddles
  for (let k = 0; k < 14; k++) { const a = Math.PI + (rnd() - .5) * 1.6, d = 110 + rnd() * 120, x = Math.cos(a) * d, z = Math.sin(a) * d; if (!isFree(x, z, 6)) continue; const r = 3 + rnd() * 4; const p = new THREE.Mesh(new THREE.CircleGeometry(r, 14).rotateX(-Math.PI / 2), M('#1e1a2e', { roughness: 0.1 })); p.position.set(x, H(x, z) + 0.08, z); scene.add(p); block(x, z, r + 1); }
  tower(PLACES.tower.x - 10, PLACES.tower.z);
  // ghost mist
  const n = 160, pos = new Float32Array(n * 3), base = [];
  for (let i = 0; i < n; i++) { const a = Math.PI + (rnd() - .5) * 1.5, d = 100 + rnd() * 140; base.push([Math.cos(a) * d, Math.sin(a) * d, rnd() * 6]); }
  const mg = new THREE.BufferGeometry(); mg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(mg, new THREE.PointsMaterial({ color: '#c8b8ff', size: 0.6, transparent: true, opacity: 0.35, depthWrite: false })));
  animated.push(t => { for (let i = 0; i < n; i++) { const b = base[i]; pos[i * 3] = b[0] + Math.sin(t * .2 + b[2]) * 4; pos[i * 3 + 1] = H(b[0], b[1]) + 0.6 + Math.sin(t * .5 + b[2]) * 0.4; pos[i * 3 + 2] = b[1] + Math.cos(t * .15 + b[2]) * 4; } mg.attributes.position.needsUpdate = true; });
  for (const [x, z] of ACTS.lantern.pts) world.lanterns.push(lanternPost(x, z));
}

// ---------- nature ----------
async function nature() {
  const lists = {};
  const add = (k, p) => (lists[k] ||= []).push(p);
  const G1 = ['fo/Tree_1_A_Color1', 'fo/Tree_1_B_Color1', 'fo/Tree_1_C_Color1', 'fo/Tree_2_A_Color1', 'fo/Tree_2_B_Color1', 'fo/Tree_2_C_Color1', 'fo/Tree_2_D_Color1'];
  const W1 = ['fo/Tree_3_A_Color1', 'fo/Tree_3_B_Color1', 'fo/Tree_3_C_Color1', 'fo/Tree_4_A_Color1', 'fo/Tree_4_B_Color1', 'fo/Tree_4_C_Color1', 'fo/Tree_2_E_Color1'];
  const S1 = ['fo/Tree_Bare_1_A_Color1', 'fo/Tree_Bare_2_A_Color1', 'fo/Tree_1_C_Color1', 'hx/trees_A_medium', 'hx/trees_B_medium'];
  const M1 = ['hw/tree_dead_large', 'hw/tree_dead_medium', 'hw/tree_dead_small', 'hw/tree_pine_orange_medium', 'hw/tree_pine_yellow_large'];
  for (let k = 0; k < 16000; k++) {
    const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * (WORLD_R - 6), x = Math.cos(a) * d, z = Math.sin(a) * d;
    const w = realmWeights(x, z); let r = 0; w.forEach((v, i) => { if (v > w[r]) r = i; });
    const dens = [0.16, 0.85, 0.14, 0.012, 0.18][r];
    if (rnd() > dens) continue;
    if (!isFree(x, z, 1.5)) continue;
    const set = [G1, W1, S1, null, M1][r]; if (!set) continue;
    add(set[Math.floor(rnd() * set.length)], { x, z, h: r === 1 ? 7 + rnd() * 6 : r === 4 ? 4 + rnd() * 4 : 4.5 + rnd() * 3.5 });
  }
  await Promise.all(Object.entries(lists).map(([k, l]) => scatter(k, l, { r: 0.8, cam: true })));
  // bushes, grass, rocks, flowers
  const small = {};
  const addS = (k, p) => (small[k] ||= []).push(p);
  for (let k = 0; k < 5000; k++) {
    const a = rnd() * Math.PI * 2, d = 10 + Math.sqrt(rnd()) * (WORLD_R - 12), x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (!isFree(x, z, -2)) continue;
    const r = (() => { const w = realmWeights(x, z); let b = 0; w.forEach((v, i) => { if (v > w[b]) b = i; }); return b; })();
    const opts = [['fo/Bush_1_A_Color1', 'fo/Grass_1_A_Color1', 'fo/Grass_2_A_Color1', 'fo/Rock_1_A_Color1', 'fo/Bush_2_C_Color1'],
      ['fo/Bush_3_A_Color1', 'fo/Bush_4_A_Color1', 'fo/Grass_1_C_Color1', 'fo/Grass_2_C_Color1', 'fo/Bush_1_C_Color1'],
      ['fo/Rock_1_E_Color1', 'fo/Rock_3_A_Color1', 'fo/Rock_2_C_Color1', 'fo/Grass_1_A_Color1', 'hx/rock_single_A'],
      ['fo/Rock_2_C_Color1', 'fo/Rock_1_A_Color1', 'hw/bone_A', 'hx/rock_single_B'],
      ['hw/bone_B', 'hw/gravemarker_B', 'fo/Rock_1_E_Color1', 'hw/pumpkin_orange_small', 'fo/Grass_2_A_Color1']][r];
    const key = opts[Math.floor(rnd() * opts.length)];
    addS(key, { x, z, h: /Rock|rock/.test(key) ? 0.6 + rnd() * 1.2 : /grave/.test(key) ? 1 : 0.6 + rnd() * 0.6 });
  }
  await Promise.all(Object.entries(small).map(([k, l]) => scatter(k, l, { shadow: /Bush|rock|Rock/.test(k) })));
  // flowers (Greenvale and Whisperwood)
  const cols = ['#ff6fa8', '#ffd23a', '#ffffff', '#b07cff', '#ff8a3d'], geo = new THREE.IcosahedronGeometry(0.17, 0), mat = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  const F = [];
  for (let c = 0; c < 60; c++) { const a = rnd() * 6.28, d = 15 + rnd() * 200, cx = Math.cos(a) * d, cz = Math.sin(a) * d; const w = realmWeights(cx, cz); if (w[0] + w[1] < 0.5) continue; for (let k = 0; k < 20; k++) { const x = cx + (rnd() - .5) * 9, z = cz + (rnd() - .5) * 9; if (isFree(x, z, -2.5)) F.push({ x, z }); } }
  cols.forEach((c, ci) => { const mine = F.filter((_, i) => i % cols.length === ci); if (!mine.length) return; const im = new THREE.InstancedMesh(geo, M(c, { emissive: c, emissiveIntensity: 0.12 }), mine.length); im.frustumCulled = false; mine.forEach((p, i) => { const k = 0.8 + rnd() * 0.6; im.setMatrixAt(i, mat.compose(v.set(p.x, H(p.x, p.z) + 0.22, p.z), q, s.set(k, k * 0.7, k))); }); scene.add(im); });
  // mountains around the island and in Stonehold
  for (let i = 0; i < 34; i++) { const a = i / 34 * Math.PI * 2 + 0.05, d = WORLD_R + 34 + rnd() * 18; prop(['hx/mountain_A_grass_trees', 'hx/mountain_B_grass_trees', 'hx/mountain_C_grass', 'hx/hills_A_trees'][i % 4], Math.cos(a) * d, Math.sin(a) * d, 26 + rnd() * 18, { y: -2 }); }
  for (let i = 0; i < 12; i++) { const a = (rnd() - .5) * 1.4, d = 120 + rnd() * 110, x = Math.cos(a) * d, z = Math.sin(a) * d; if (isFree(x, z, 16)) { const h = 14 + rnd() * 10; prop(['hx/mountain_A', 'hx/mountain_B', 'hx/mountain_C'][i % 3], x, z, h, { r: h * 0.5, cam: true }); block(x, z, h * 0.7); } }
  for (let i = 0; i < 16; i++) { const g = await prop(i % 2 ? 'hx/cloud_big' : 'hx/cloud_small', (rnd() - .5) * 500, (rnd() - .5) * 500, 3, { y: 40 + rnd() * 14 }); if (g) { g.scale.multiplyScalar(3); const sp = 0.6 + rnd(); animated.push((t, dt) => { g.position.x += dt * sp; if (g.position.x > 300) g.position.x = -300; }); } }
}

export async function buildWorld() {
  scene.background = new THREE.Color('#8fd3ff');
  scene.fog = new THREE.Fog('#cfeaff', 90, 260);
  scene.add(new THREE.HemisphereLight('#ffffff', '#5b8c3a', 1.15));
  const sun = new THREE.DirectionalLight('#fff3d6', 2.3);
  sun.position.set(30, 50, 20); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 150 });
  sun.shadow.bias = -0.0006; scene.add(sun, sun.target); scene.userData.sun = sun;
  buildRoads();
  // keep NPC spots clear of random trees
  for (const n of Object.values(NPCS)) block(n.x, n.z, 3);
  buildGround(); drawRoads();
  await greenvale(); await whisperwood(); await stonehold(); await sunscar(); await mistmoor();
  for (const s of SIGNS) signpost(s.x, s.z, s.lines);
  for (const p of PORTALS) portal(p);
  await nature();
}
