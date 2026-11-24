// TERRA LINGUA · Motor de bloques: generación del mundo, mallas por chunk, colisiones y raycast.
import * as THREE from 'three';

export const WORLD = 512, HEIGHT = 72, CHUNK = 16, SEA = 14;
const CW = WORLD / CHUNK;
export const B = { AIR: 0, GRASS: 1, DIRT: 2, STONE: 3, SAND: 4, WATER: 5, WOOD: 6, LEAF: 7, PLANK: 8, BRICK: 9, SNOW: 10, RED: 11, ORANGE: 12, YELLOW: 13, GREEN: 14, BLUE: 15, PURPLE: 16, PINK: 17, WHITE: 18, BLACK: 19, GLASS: 20, GOLD: 21, RUNE: 22, CLAY: 23, PATH: 24, LAMP: 25, CRYSTAL: 26, MOSS: 27, PINELEAF: 28, BLOSSOM: 29, ROOF: 30, CYAN: 31 };
export const PALETTE = [B.PLANK, B.BRICK, B.STONE, B.GLASS, B.RED, B.ORANGE, B.YELLOW, B.GREEN, B.CYAN, B.BLUE, B.PURPLE, B.PINK, B.WHITE, B.BLACK, B.WOOD, B.LEAF, B.BLOSSOM, B.GRASS, B.SAND, B.CLAY, B.ROOF, B.GOLD, B.CRYSTAL, B.LAMP];
export const BLOCK_NAMES = { 8: 'Planks', 9: 'Bricks', 3: 'Stone', 20: 'Glass', 11: 'Red', 12: 'Orange', 13: 'Yellow', 14: 'Green', 31: 'Cyan', 15: 'Blue', 16: 'Purple', 17: 'Pink', 18: 'White', 19: 'Black', 6: 'Wood', 7: 'Leaves', 29: 'Blossom', 1: 'Grass', 4: 'Sand', 23: 'Clay', 30: 'Roof', 21: 'Gold', 26: 'Crystal', 25: 'Lamp' };

// tile del atlas por bloque: [arriba, lado, abajo]
const TILES = {
  1: [0, 1, 2], 2: [2, 2, 2], 3: [3, 3, 3], 4: [4, 4, 4], 5: [5, 5, 5], 6: [7, 6, 7], 7: [8, 8, 8], 8: [9, 9, 9], 9: [10, 10, 10], 10: [11, 12, 2],
  11: [13, 13, 13], 12: [14, 14, 14], 13: [15, 15, 15], 14: [16, 16, 16], 15: [17, 17, 17], 16: [18, 18, 18], 17: [19, 19, 19], 18: [20, 20, 20], 19: [21, 21, 21],
  20: [22, 22, 22], 21: [23, 23, 23], 22: [24, 24, 24], 23: [25, 26, 26], 24: [27, 27, 2], 25: [28, 28, 28], 26: [29, 29, 29], 27: [30, 31, 2], 28: [32, 32, 32], 29: [33, 33, 33], 30: [34, 34, 34], 31: [35, 35, 35]
};
const ATLAS_N = 8, TILE_PX = 24;
const isTransparent = id => id === B.AIR || id === B.WATER || id === B.GLASS;
const isSolid = id => id !== B.AIR && id !== B.WATER;

/* ---------- Atlas: texturas propias de "bloque de juguete" (biselado, sin imágenes externas) ---------- */
export function makeAtlas() {
  const c = document.createElement('canvas'); c.width = c.height = ATLAS_N * TILE_PX;
  const g = c.getContext('2d');
  const defs = ['#6fd14f', '#a9794c', '#a9794c', '#8d95a3', '#f0d890', '#3f9df0', '#9a6a3f', '#c99a63', '#3fae55', '#d8a765', '#c9573f', '#f4f8ff', '#cfd9e6', '#e8483f', '#ff9a2e', '#ffd93b', '#3fc463', '#3f78f0', '#9a55e0', '#ff7fbe', '#f6f4ee', '#2d2f3a', '#cdeeff', '#ffc933', '#7a5cff', '#d97a4a', '#c8653c', '#d9bf8a', '#fff2a8', '#7ff0e6', '#4fa85a', '#a9794c', '#2f8a5f', '#ffb3d6', '#b5473c', '#2fd0e0'];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const shade = (hex, a) => { const n = parseInt(hex.slice(1), 16); const f = v => Math.max(0, Math.min(255, Math.round(v + a))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  defs.forEach((col, i) => {
    const x = (i % ATLAS_N) * TILE_PX, y = Math.floor(i / ATLAS_N) * TILE_PX, s = TILE_PX;
    g.fillStyle = col; g.fillRect(x, y, s, s);
    for (let k = 0; k < 46; k++) { g.fillStyle = shade(col, (rnd() - .5) * 26); const w = 2 + (rnd() * 3 | 0); g.fillRect(x + (rnd() * (s - w) | 0), y + (rnd() * (s - w) | 0), w, w); }
    if (i === 1 || i === 12 || i === 31) { g.fillStyle = i === 12 ? '#f4f8ff' : '#6fd14f'; g.fillRect(x, y, s, 8); for (let k = 0; k < s; k += 3) g.fillRect(x + k, y + 8, 3, 2 + (rnd() * 4 | 0)); }
    if (i === 6) { g.fillStyle = shade(col, -30); for (let k = 3; k < s; k += 6) g.fillRect(x + k, y, 2, s); }
    if (i === 7) { g.strokeStyle = shade(col, -35); g.lineWidth = 2; g.strokeRect(x + 5, y + 5, s - 10, s - 10); }
    if (i === 9) { g.fillStyle = shade(col, -32); for (let k = 0; k < s; k += 6) g.fillRect(x, y + k, s, 1); }
    if (i === 10) { g.fillStyle = '#e9d6c4'; for (let r = 0; r < 4; r++) { g.fillRect(x, y + r * 6, s, 1); for (let k = (r % 2) * 6; k < s; k += 12) g.fillRect(x + k, y + r * 6, 1, 6); } }
    if (i === 22) { g.clearRect(x, y, s, s); g.fillStyle = 'rgba(205,238,255,.28)'; g.fillRect(x, y, s, s); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, s - 2, s - 2); }
    if (i === 24) { g.fillStyle = '#d7ccff'; g.fillRect(x + 10, y + 4, 4, 16); g.fillRect(x + 5, y + 10, 14, 4); }
    if (i === 28) { g.fillStyle = '#fff'; g.fillRect(x + 7, y + 7, 10, 10); }
    if (i === 29) { g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.moveTo(x + 12, y + 3); g.lineTo(x + 20, y + 12); g.lineTo(x + 12, y + 21); g.lineTo(x + 4, y + 12); g.fill(); }
    if (i === 34) { g.fillStyle = shade(col, -32); for (let k = 0; k < s; k += 6) g.fillRect(x, y + k, s, 2); }
    if (i !== 22 && i !== 5) { g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(x, y, s, 1); g.fillRect(x, y, 1, s); g.fillStyle = 'rgba(0,0,0,.16)'; g.fillRect(x, y + s - 1, s, 1); g.fillRect(x + s - 1, y, 1, s); }
  });
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.colorSpace = THREE.SRGBColorSpace;
  return { tex: t, canvas: c };
}
export function tileCss(id, atlasCanvas, size = 40) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const t = TILES[id][1]; g.drawImage(atlasCanvas, (t % ATLAS_N) * TILE_PX, Math.floor(t / ATLAS_N) * TILE_PX, TILE_PX, TILE_PX, 0, 0, size, size); return c.toDataURL();
}

/* ---------- Ruido ---------- */
function hash2(x, z) { let h = (x * 374761393 + z * 668265263) | 0; h = (h ^ (h >> 13)) * 1274126177 | 0; return ((h ^ (h >> 16)) >>> 0) / 4294967295; }
const lerp = (a, b, t) => a + (b - a) * t, sm = t => t * t * (3 - 2 * t);
function vnoise(x, z) { const xi = Math.floor(x), zi = Math.floor(z), xf = sm(x - xi), zf = sm(z - zi); return lerp(lerp(hash2(xi, zi), hash2(xi + 1, zi), xf), lerp(hash2(xi, zi + 1), hash2(xi + 1, zi + 1), xf), zf); }
const fbm = (x, z, o = 4) => { let a = .5, f = 1, s = 0, n = 0; for (let i = 0; i < o; i++) { s += a * vnoise(x * f + i * 17, z * f - i * 11); n += a; a *= .5; f *= 2; } return s / n; };
const clamp01 = t => Math.max(0, Math.min(1, t));
const ridged = (x, z, o) => 1 - Math.abs(fbm(x, z, o) * 2 - 1);
// Río serpenteante: baja el terreno hasta el lecho dentro de una franja del ruido
function riverCut(x, z, h, bed, w) { const r = Math.abs(fbm(x / 95 + 310, z / 95 - 190, 3) - .25); if (r >= w) return h; return lerp(bed, h, sm(clamp01((r - w * .35) / (w * .65)))); }

/* ---------- Geografía ---------- */
export const CENTER = 256, HUB_R = 34;
export const TOWNS = { 1: [128, 128], 2: [384, 128], 3: [384, 384], 4: [128, 384] };
export const GATES = { 1: [232, 232], 2: [280, 232], 3: [280, 280], 4: [232, 280] };
export const ISLAND = { arena: { x: 256, z: 62, y: 50, r: 30 }, creative: { x: 256, z: 450, y: 50, r: 34 } };
export const unitOf = (x, z) => { if (Math.hypot(x - CENTER, z - CENTER) <= HUB_R + 2) return 0; return x < CENTER ? (z < CENTER ? 1 : 4) : (z < CENTER ? 2 : 3); };

// Sitios de misión: 8 alrededor de cada pueblo + faro de party en el centro
export const SITES = {};
for (const u of [1, 2, 3, 4]) {
  const [cx, cz] = TOWNS[u]; SITES[u] = [];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + (u * .35), r = 58 + (i % 2) * 22;
    SITES[u].push({ x: Math.round(cx + Math.cos(a) * r), z: Math.round(cz + Math.sin(a) * r) });
  }
}
const distSeg = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz; let t = l ? ((px - ax) * dx + (pz - az) * dz) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * dx, pz - az - t * dz); };
const roads = []; for (const u of [1, 2, 3, 4]) { const [cx, cz] = TOWNS[u], g = GATES[u]; roads.push({ u, a: g, b: [cx, cz] }); SITES[u].forEach(s => roads.push({ u, a: [cx, cz], b: [s.x, s.z] })); }
const FLAT = { 1: 20, 2: 22, 3: 24, 4: 18 };

// Cada unidad tiene su propio relieve
function baseHeight(x, z) {
  const u = unitOf(x, z);
  if (u === 0) return 20;
  const n = fbm(x / 58, z / 58, 4), d = fbm(x / 16 + 40, z / 16, 2), big = fbm(x / 130 + 9, z / 130 - 4, 3);
  let h;
  if (u === 1) { // Worktown: praderas onduladas, cerros rocosos con nieve y un río
    const hills = Math.pow(clamp01((big - .28) * 9), 1.5) * 24;
    h = riverCut(x, z, 16 + n * 11 + d * 2.5 + hills, SEA - 3, .008);
  } else if (u === 2) { // Scholar Woods: colinas de bosque y arroyos
    h = riverCut(x, z, 13 + n * 12 + d * 3 + ridged(x / 70, z / 70, 3) * 16, SEA - 2, .006);
  } else if (u === 3) { // Canvas Canyon: mesetas escalonadas cortadas por cañones secos
    let m = 13 + n * 34; const cy = Math.abs(fbm(x / 64 + 77, z / 64 - 31, 3) - .25);
    if (cy < .014) m = lerp(SEA + 3, m, sm(clamp01((cy - .005) / .009)));
    h = Math.floor(m / 5) * 5 + (m % 5 > 3.6 ? (m % 5 - 3.6) * 3.5 : 0);
  } else { // Fiesta Coast: costa con playas e islas
    const coast = Math.min(x, WORLD - z) / 90; h = 7 + n * 16 + Math.min(coast, 1) * 8;
    if (h < SEA + 1) { const isl = fbm(x / 34 + 70, z / 34 - 12, 3); if (isl > .33) h = Math.max(h, lerp(h, SEA + 5 + d * 3, clamp01((isl - .33) * 30))); }
  }
  return h;
}

/* ---------- Lugares para explorar: 6 por unidad, con cofre y un jefe en el primero ---------- */
export const LANDMARKS = [];
const LM_PLAN = {
  1: [['quarry', 12, 1], ['windmill', 7], ['barn', 8], ['windmill', 7], ['crane', 8], ['watertower', 5]],
  2: [['ruins', 10, 1], ['tower', 7], ['bigtree', 8], ['stones', 8], ['mushrooms', 7], ['ruins', 9]],
  3: [['rainbow', 12, 1], ['arch', 9], ['brush', 7], ['easel', 7], ['statue', 7], ['arch', 9]],
  4: [['wreck', 10, 1, 'coast'], ['lighthouse', 7, 0, 'coast'], ['pier', 6, 0, 'coast'], ['stage', 10], ['market', 9], ['sandcastle', 7]]
};
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
function placeLandmarks() {
  for (const u of [1, 2, 3, 4]) {
    const x0 = (u === 1 || u === 4) ? 14 : 270, z0 = u <= 2 ? 14 : 270, [tx, tz] = TOWNS[u];
    LM_PLAN[u].forEach(([type, flat, boss, where], i) => {
      let best = null, bestS = -1e9;
      for (let k = 0; k < 600; k++) {
        const x = Math.round(x0 + Math.min(1, hash2(u * 131 + k * 7, i * 53 + k) * 2) * 228), z = Math.round(z0 + Math.min(1, hash2(k * 11 + i * 29, u * 71 + k * 3) * 2) * 228);
        const ridge = Math.min(Math.abs(x - CENTER), Math.abs(z - CENTER)), edge = Math.min(x, z, WORLD - 1 - x, WORLD - 1 - z);
        if (ridge < 15 + flat || edge < (where ? 8 : 10 + flat) || Math.hypot(x - tx, z - tz) < 40 + flat) continue;
        if (SITES[u].some(s => Math.hypot(x - s.x, z - s.z) < 18 + flat)) continue;
        if (roads.some(r => r.u === u && distSeg(x, z, r.a[0], r.a[1], r.b[0], r.b[1]) < 6 + flat)) continue;
        if (LANDMARKS.some(L => Math.hypot(x - L.x, z - L.z) < 14 + flat + L.r)) continue;
        const bh = baseHeight(x, z); let sc;
        if (where === 'coast') sc = -Math.abs(bh - SEA) * 3; else { if (bh < SEA + 1.5) continue; sc = -Math.abs(bh - 24) * .3; }
        sc += hash2(k, i + u) * 2; if (sc > bestS) { bestS = sc; best = { x, z, bh }; }
      }
      if (!best) return;
      const L = { u, i, type, x: best.x, z: best.z, r: flat, flat: where === 'coast' && type !== 'lighthouse' ? 0 : flat, clear: flat + 4, boss: !!boss, coast: where === 'coast' };
      L.h = Math.max(SEA + 2, Math.min(32, Math.round(best.bh)));
      if (L.coast) { let bv = 1e9; for (const dd of DIRS) { const v = baseHeight(best.x + dd[0] * 14, best.z + dd[1] * 14); if (v < bv) { bv = v; L.dir = dd; } } }
      LANDMARKS.push(L);
    });
  }
}
placeLandmarks();
const LM_U = { 1: [], 2: [], 3: [], 4: [] }; LANDMARKS.forEach(L => LM_U[L.u].push(L));
// Senderos de tierra desde cada pueblo a sus lugares (siguen el relieve, no lo aplanan)
const trails = LANDMARKS.map(L => ({ u: L.u, a: TOWNS[L.u], b: [L.x, L.z] }));
const isTrail = (x, z, u) => { for (const t of trails) if (t.u === u && distSeg(x, z, t.a[0], t.a[1], t.b[0], t.b[1]) < 1.1 + hash2(x, z) * .6) return true; return false; };
const nearLM = (x, z, u) => LM_U[u].some(L => Math.hypot(x - L.x, z - L.z) < L.clear);
const hCache = new Map();
export function groundHeight(x, z) {
  x = Math.floor(x); z = Math.floor(z);
  const key = x * 4096 + z; let v = hCache.get(key); if (v !== undefined) return v;
  let h = baseHeight(x, z); const u = unitOf(x, z);
  // cordillera entre regiones y en el borde
  const ridge = Math.min(Math.abs(x - CENTER), Math.abs(z - CENTER)), edge = Math.min(x, z, WORLD - 1 - x, WORLD - 1 - z);
  const hubD = Math.hypot(x - CENTER, z - CENTER);
  if (hubD > HUB_R) { if (ridge < 9) h = Math.max(h, lerp(46, h, sm(ridge / 9)) + vnoise(x / 5, z / 5) * 4); if (edge < 10 && !(u === 4 && (x < 10 || z > WORLD - 11))) h = Math.max(h, lerp(46, h, sm(edge / 10)) + vnoise(x / 5, z / 5) * 3); }
  if (u) {
    const flat = FLAT[u], [cx, cz] = TOWNS[u], td = Math.hypot(x - cx, z - cz);
    if (td < 42) h = lerp(flat, h, sm(Math.max(0, td - 24) / 18));
    for (const L of LM_U[u]) { if (!L.flat) continue; const ld = Math.hypot(x - L.x, z - L.z); if (ld < L.flat + 9) h = lerp(L.h, h, sm(Math.max(0, ld - L.flat) / 9)); }
    for (const s of SITES[u]) { const sd = Math.hypot(x - s.x, z - s.z); if (sd < 18) h = lerp(flat, h, sm(Math.max(0, sd - 8) / 10)); }
    for (const r of roads) { if (r.u !== u) continue; const rd = distSeg(x, z, r.a[0], r.a[1], r.b[0], r.b[1]); if (rd < 8) h = lerp(flat, h, sm(Math.max(0, rd - 2.5) / 5.5)); }
    const gd = Math.hypot(x - GATES[u][0], z - GATES[u][1]); if (gd < 16) h = lerp(20, h, sm(Math.max(0, gd - 6) / 10));
  }
  if (hubD <= HUB_R + 8) h = lerp(20, h, sm(Math.max(0, hubD - HUB_R) / 8));
  v = Math.max(3, Math.min(HEIGHT - 12, Math.round(h))); hCache.set(key, v); return v;
}
const isRoad = (x, z, u) => { for (const r of roads) { if (r.u !== u) continue; if (distSeg(x, z, r.a[0], r.a[1], r.b[0], r.b[1]) < 1.7) return true; } return false; };

/* ---------- Estructuras: se calculan una vez y se aplican a cada chunk ---------- */
const stamps = new Map();
const put = (x, y, z, id) => { if (x < 0 || z < 0 || x >= WORLD || z >= WORLD || y < 0 || y >= HEIGHT) return; const k = (x >> 4) * 64 + (z >> 4); let a = stamps.get(k); if (!a) stamps.set(k, a = []); a.push(x & 15, y, z & 15, id); };
const box = (x0, y0, z0, x1, y1, z1, id) => { for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) for (let z = z0; z <= z1; z++) put(x, y, z, id); };

function hut(x, z, u, i) {
  const y = groundHeight(x, z) + 1, wall = [B.PLANK, B.BRICK, B.CLAY, B.WHITE][u - 1], roof = [B.ORANGE, B.GREEN, B.PURPLE, B.BLUE][u - 1], w = 3, off = -7;
  const cx = x, cz = z + off;
  box(cx - w - 1, y - 1, cz - w - 1, cx + w + 1, y - 1, cz + w + 1, B.PATH);
  for (let h = 0; h < 4; h++) for (let a = -w; a <= w; a++) { put(cx + a, y + h, cz - w, wall); put(cx - w, y + h, cz + a, wall); put(cx + w, y + h, cz + a, wall); if (Math.abs(a) > 1 || h > 2) put(cx + a, y + h, cz + w, wall); }
  put(cx - w, y + 2, cz, B.GLASS); put(cx + w, y + 2, cz, B.GLASS);
  for (let l = 0; l <= w + 1; l++) box(cx - w - 1 + l, y + 4 + l, cz - w - 1 + l, cx + w + 1 - l, y + 4 + l, cz + w + 1 - l, l === w + 1 ? B.GOLD : roof);
  put(cx - 2, y, cz + w + 1, B.LAMP); put(cx + 2, y, cz + w + 1, B.LAMP);
  // adorno temático
  if (u === 1) { box(x + 5, y, z - 2, x + 5, y + 2, z - 2, B.WOOD); put(x + 5, y + 3, z - 2, B.YELLOW); }
  if (u === 2) { box(x + 5, y, z - 2, x + 6, y + 2, z - 2, B.PLANK); put(x + 5, y + 1, z - 2, B.BLUE); put(x + 6, y + 1, z - 2, B.RED); }
  if (u === 3) { box(x + 5, y, z - 2, x + 5, y + 1, z - 2, B.WHITE); put(x + 5, y + 2, z - 2, [B.RED, B.CYAN, B.YELLOW, B.PINK][i % 4]); }
  if (u === 4) { box(x + 5, y, z - 2, x + 5, y + 3, z - 2, B.WOOD); put(x + 5, y + 4, z - 2, B.LAMP); put(x + 4, y + 3, z - 2, B.RED); put(x + 6, y + 3, z - 2, B.YELLOW); }
}
function townCenter(u) {
  const [x, z] = TOWNS[u], y = FLAT[u] + 1, c = [B.ORANGE, B.GREEN, B.PINK, B.BLUE][u - 1];
  for (let a = -8; a <= 8; a++) for (let b = -8; b <= 8; b++) if (a * a + b * b <= 66) put(x + a, y - 1, z + b, (a + b) & 1 ? B.PATH : B.WHITE);
  for (const [a, b] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) { box(x + a, y, z + b, x + a, y + 4, z + b, B.WOOD); put(x + a, y + 5, z + b, B.LAMP); }
  box(x - 1, y, z - 1, x + 1, y, z + 1, B.STONE); box(x, y + 1, z, x, y + 3, z, B.RUNE); put(x, y + 4, z, B.CRYSTAL);
  box(x - 2, y, z - 2, x + 2, y, z - 2, c);
}
function buildHub() {
  const c = CENTER, y = 21;
  for (let a = -HUB_R; a <= HUB_R; a++) for (let b = -HUB_R; b <= HUB_R; b++) { const d = Math.hypot(a, b); if (d <= HUB_R) put(c + a, y - 1, c + b, d < 8 ? B.GOLD : (Math.floor(d / 4) % 2 ? B.WHITE : B.PATH)); }
  // muro con cuatro puertas en diagonal
  for (let i = 0; i < 360; i += .5) { const r = i * Math.PI / 180, wx = Math.round(c + Math.cos(r) * HUB_R), wz = Math.round(c + Math.sin(r) * HUB_R); const nearGate = Object.values(GATES).some(g => Math.hypot(wx - g[0], wz - g[1]) < 4.2); if (!nearGate) box(wx, y, wz, wx, y + 3, wz, B.BRICK); }
  for (const u of [1, 2, 3, 4]) { const g = GATES[u], col = [B.ORANGE, B.GREEN, B.PINK, B.BLUE][u - 1]; for (const s of [-1, 1]) { const dx = (u === 1 || u === 3) ? s * 4 : s * 4, dz = (u === 1 || u === 3) ? -s * 4 : s * 4; box(g[0] + dx, y, g[1] + dz, g[0] + dx, y + 7, g[1] + dz, col); put(g[0] + dx, y + 8, g[1] + dz, B.LAMP); } }
  box(c - 1, y, c - 1, c + 1, y + 1, c + 1, B.STONE); box(c, y + 2, c, c, y + 6, c, B.RUNE); put(c, y + 7, c, B.CRYSTAL);
  // portales a la arena y a la isla creativa
  const portal = (px, pz, col) => { for (let a = -2; a <= 2; a++) { put(px + a, y, pz, col); put(px + a, y + 5, pz, col); } for (let h = 0; h <= 5; h++) { put(px - 3, y + h, pz, col); put(px + 3, y + h, pz, col); } };
  portal(c, c - 22, B.RED); portal(c, c + 22, B.CYAN);
  // tienda
  box(c + 16, y, c - 4, c + 22, y, c + 4, B.PLANK); box(c + 16, y + 4, c - 4, c + 22, y + 4, c + 4, B.RED);
  for (const [a, b] of [[16, -4], [22, -4], [16, 4], [22, 4]]) box(c + a, y, c + b, c + a, y + 3, c + b, B.WOOD);
}
function islandDisc(cfg, top, side) {
  const { x, z, y, r } = cfg;
  for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) { const d = Math.hypot(a, b); if (d > r) continue; const depth = Math.floor((1 - d / r) * 9 + vnoise((x + a) / 4, (z + b) / 4) * 3); for (let k = 0; k <= depth; k++) put(x + a, y - 1 - k, z + b, k === 0 ? top(a, b, d) : (k < 3 ? side : B.STONE)); }
}
function buildIslands() {
  const A = ISLAND.arena, C = ISLAND.creative;
  islandDisc(A, (a, b, d) => d < 6 ? B.GOLD : ((Math.floor(d / 3) % 2) ? B.BLACK : B.RED), B.BRICK);
  for (let i = 0; i < 360; i += .4) { const r = i * Math.PI / 180, wx = Math.round(A.x + Math.cos(r) * (A.r - 1)), wz = Math.round(A.z + Math.sin(r) * (A.r - 1)); box(wx, A.y, wz, wx, A.y + (Math.floor(i / 15) % 2 ? 4 : 3), wz, B.BRICK); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, px = Math.round(A.x + Math.cos(a) * 14), pz = Math.round(A.z + Math.sin(a) * 14); box(px - 1, A.y, pz - 1, px + 1, A.y + 1 + (i % 2), pz + 1, B.STONE); }
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + .8, px = Math.round(A.x + Math.cos(a) * 24), pz = Math.round(A.z + Math.sin(a) * 24); box(px, A.y, pz, px, A.y + 5, pz, B.WOOD); put(px, A.y + 6, pz, B.LAMP); }
  islandDisc(C, () => B.GRASS, B.DIRT);
  for (let i = 0; i < 360; i += .4) { const r = i * Math.PI / 180, wx = Math.round(C.x + Math.cos(r) * (C.r - 1)), wz = Math.round(C.z + Math.sin(r) * (C.r - 1)); put(wx, C.y, wz, B.PLANK); }
}
/* ---------- Lugares para explorar ---------- */
const STRATA = [B.CLAY, B.ORANGE, B.RED, B.YELLOW, B.WHITE, B.ORANGE, B.CLAY];
const strata = y => STRATA[Math.floor(y / 2) % STRATA.length];
// Torre cuadrada hueca con escalera en espiral; devuelve dónde va el cofre (arriba)
function stairTower(cx, cz, y, H, wall, o = {}) {
  const W = (h, a, b) => typeof wall === 'function' ? wall(h, a, b) : wall;
  for (let h = -1; h <= H; h++) for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) {
    if (h === -1) { put(cx + a, y - 1, cz + b, o.base || B.STONE); continue; }
    const edge = Math.abs(a) === 3 || Math.abs(b) === 3;
    if (!edge || (b === 3 && a === 0 && h <= 1)) { put(cx + a, y + h, cz + b, B.AIR); continue; }
    const win = (a === 0 || b === 0) && h % 5 === 3; put(cx + a, y + h, cz + b, win && !o.open ? B.GLASS : W(h, a, b));
  }
  const ring = []; for (let a = -2; a <= 2; a++) ring.push([a, -2]); for (let b = -1; b <= 2; b++) ring.push([2, b]); for (let a = 1; a >= -2; a--) ring.push([a, 2]); for (let b = 1; b >= -1; b--) ring.push([-2, b]);
  for (let k = 0; k < H; k++) { const [a, b] = ring[k % 16]; put(cx + a, y + k, cz + b, o.step || B.PLANK); }
  const skip = new Set([(H - 1) % 16, (H - 2) % 16, (H - 3) % 16]); // hueco en el piso para subir sin golpearse la cabeza
  for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) { const ri = ring.findIndex(([p, q]) => p === a && q === b); if (!(ri >= 0 && skip.has(ri))) put(cx + a, y + H, cz + b, o.floor || B.PLANK); }
  for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) if ((Math.abs(a) === 3 || Math.abs(b) === 3) && (a + b) % 2 === 0) put(cx + a, y + H + 1, cz + b, W(H + 1, a, b));
  return { x: cx, y: y + H + 1, z: cz };
}
function pyramid(cx, cz, y, r, id, top) { for (let l = 0; l <= r; l++) box(cx - r + l, y + l, cz - r + l, cx + r - l, y + l, cz + r - l, l === r && top ? top : id); }
function bigShroom(x, z, y, hgt, cap) {
  box(x, y, z, x, y + hgt - 1, z, B.WHITE);
  for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) { const d = a * a + b * b; if (d <= 10) put(x + a, y + hgt, z + b, (d < 9 && (a * 3 + b * 5 + 99) % 7 === 0) ? B.WHITE : cap); if (d <= 4) put(x + a, y + hgt + 1, z + b, (a + b) % 3 === 0 ? B.WHITE : cap); }
}
const PIX = {
  heart: ['.RR.RR.', 'RRRRRRR', 'RRRRRRR', '.RRRRR.', '..RRR..', '...R...'],
  smile: ['..YYYYY..', '.YYYYYYY.', 'YYKYYYKYY', 'YYYYYYYYY', 'YKYYYYYKY', 'YYKKKKKYY', '.YYYYYYY.', '..YYYYY..']
};
const PIXC = { R: B.RED, Y: B.YELLOW, K: B.BLACK, B: B.BLUE, G: B.GREEN };
function buildLandmark(L) {
  const { x, z, u } = L, y = L.h + 1; let chest = { x, y, z }, boss = { x: x + 3, y, z: z + 3 };
  const t = L.type;
  if (t === 'quarry') { // cantera escalonada (se puede bajar y subir caminando)
    const R = 12; for (let a = -R; a <= R; a++) for (let b = -R; b <= R; b++) { const d = Math.hypot(a, b); if (d >= R) continue; const dep = Math.min(7, Math.floor((R - d) / 1.25)); if (dep <= 0) continue; for (let k = L.h - dep + 1; k <= L.h + 4; k++) put(x + a, k, z + b, B.AIR); const ore = hash2(x + a, z + b); put(x + a, L.h - dep, z + b, ore < .025 ? B.GOLD : ore < .04 ? B.CRYSTAL : B.STONE); }
    box(x - 3, L.h - 7, z, x + 3, L.h - 7, z, B.BLACK); for (const s of [-1, 1]) { box(x + s * (R + 1), y, z - 1, x + s * (R + 1), y + 4, z - 1, B.WOOD); put(x + s * (R + 1), y + 5, z - 1, B.LAMP); }
    box(x - 1, L.h - 6, z - 3, x + 1, L.h - 5, z - 2, B.YELLOW); chest = { x: x + 2, y: L.h - 6, z: z - 2 }; boss = { x, y: L.h - 6, z: z + 2 };
  } else if (t === 'windmill') {
    for (let h = 0; h < 10; h++) { const r = h < 6 ? 2 : 1; for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) put(x + a, y + h, z + b, Math.abs(a) === r || Math.abs(b) === r ? (h % 4 === 3 ? B.PLANK : B.WHITE) : B.AIR); }
    put(x, y, z + 2, B.AIR); put(x, y + 1, z + 2, B.AIR); pyramid(x, z, y + 10, 2, B.RED);
    const hy = y + 8; put(x, hy, z - 2, B.WOOD); put(x, hy, z - 3, B.WOOD);
    for (let k = 1; k <= 6; k++) { const s = k > 1 ? B.WHITE : B.WOOD; put(x + k, hy, z - 3, s); put(x - k, hy, z - 3, s); put(x, hy + k, z - 3, s); put(x, hy - k, z - 3, s); if (k > 1) { put(x + k, hy + 1, z - 3, B.PLANK); put(x - k, hy - 1, z - 3, B.PLANK); put(x - 1, hy + k, z - 3, B.PLANK); put(x + 1, hy - k, z - 3, B.PLANK); } }
    chest = { x: x + 1, y, z }; for (let a = -6; a <= 6; a += 2) { put(x + a, y, z + 6, B.WOOD); put(x + a + 1, y, z + 6, B.PLANK); }
  } else if (t === 'barn') {
    const W = 5, D = 4;
    for (let h = 0; h <= 4; h++) for (let a = -W; a <= W; a++) for (let b = -D; b <= D; b++) { const edge = Math.abs(a) === W || Math.abs(b) === D; const door = b === D && Math.abs(a) <= 1 && h <= 2; put(x + a, y + h, z + b, !edge || door ? B.AIR : (Math.abs(a) === W && Math.abs(b) === D) || h === 4 ? B.WHITE : B.RED); }
    for (let l = 0; l <= D + 1; l++) { for (let a = -W - 1; a <= W + 1; a++) { put(x + a, y + 5 + l, z - D - 1 + l, B.ROOF); put(x + a, y + 5 + l, z + D + 1 - l, B.ROOF); } for (let b = -D + l; b <= D - l; b++) { put(x - W, y + 5 + l, z + b, B.RED); put(x + W, y + 5 + l, z + b, B.RED); } }
    box(x - W + 1, y, z - D + 1, x - W + 3, y + 1, z - D + 2, B.YELLOW); box(x + W - 2, y, z - D + 1, x + W - 1, y, z - D + 1, B.YELLOW); chest = { x: x + 2, y, z: z - 2 };
    for (let a = -8; a <= 8; a++) for (const b of [-7, 7]) put(x + a, y, z + b, a % 2 ? B.PLANK : B.WOOD);
  } else if (t === 'crane') { // obra en construcción: andamio con escalera y una grúa amarilla
    chest = stairTower(x, z, y, 13, (h, a, b) => (Math.abs(a) === 3 && Math.abs(b) === 3) ? B.WOOD : (h % 4 === 3 ? B.PLANK : (h < 4 ? B.BRICK : B.AIR)), { open: true });
    const cx = x + 7; box(cx, y, z, cx + 1, y + 19, z + 1, B.YELLOW); box(cx - 12, y + 20, z, cx + 5, y + 20, z + 1, B.YELLOW); box(cx + 4, y + 18, z, cx + 5, y + 19, z + 1, B.STONE);
    box(cx - 10, y + 15, z, cx - 10, y + 19, z, B.BLACK); box(cx - 11, y + 14, z, cx - 9, y + 14, z, B.ORANGE);
  } else if (t === 'watertower') {
    for (const [a, b] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) box(x + a, y, z + b, x + a, y + 8, z + b, B.WOOD);
    for (let h = 9; h <= 13; h++) for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) if (a * a + b * b <= 10) put(x + a, y + h, z + b, h === 9 || h === 13 || a * a + b * b > 5 ? (h % 2 ? B.PLANK : B.BLUE) : B.WATER);
    pyramid(x, z, y + 14, 2, B.RED); chest = { x, y, z };
  } else if (t === 'ruins') { // ruinas antiguas cubiertas de musgo
    for (let a = -6; a <= 6; a++) for (let b = -5; b <= 5; b++) { const r = hash2(x + a * 3, z + b * 5); put(x + a, y - 1, z + b, r < .15 ? B.MOSS : (a + b) & 1 ? B.STONE : B.PATH); if (Math.abs(a) === 6 || Math.abs(b) === 5) { const hh = Math.floor(hash2(x + a, z - b) * 10); for (let k = 0; k < hh; k++) put(x + a, y + k, z + b, hash2(a, k + b) < .18 ? B.MOSS : B.STONE); } }
    for (const [a, b] of [[-4, -3], [4, -3], [-4, 3], [4, 3]]) { const hh = 3 + Math.floor(hash2(x + a, z + b) * 12); box(x + a, y, z + b, x + a, y + hh, z + b, B.WHITE); if (hh > 6) box(x + a - 1, y + hh, z + b, x + a + 1, y + hh, z + b, B.STONE); }
    box(x - 1, y, z - 1, x + 1, y, z + 1, B.STONE); put(x, y + 1, z, B.RUNE); put(x, y + 2, z, B.CRYSTAL); chest = { x: x + 2, y, z: z - 2 }; boss = { x, y, z: z + 3 };
  } else if (t === 'tower') { // torre del mago con escalera hasta un cofre
    chest = stairTower(x, z, y, 21, (h) => h % 7 === 6 ? B.PURPLE : B.STONE);
    for (const [a, b] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) box(x + a, y + 22, z + b, x + a, y + 24, z + b, B.STONE);
    pyramid(x, z, y + 25, 4, B.PURPLE, B.CRYSTAL);
  } else if (t === 'bigtree') { // árbol gigante con escalera alrededor del tronco
    box(x - 1, y - 1, z - 1, x + 1, y + 19, z + 1, B.WOOD);
    const ring = []; for (let a = -2; a <= 2; a++) ring.push([a, -2]); for (let b = -1; b <= 2; b++) ring.push([2, b]); for (let a = 1; a >= -2; a--) ring.push([a, 2]); for (let b = 1; b >= -1; b--) ring.push([-2, b]);
    for (let k = 0; k < 12; k++) { const [a, b] = ring[k]; put(x + a, y + k, z + b, B.PLANK); }
    for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) { if (Math.abs(a) <= 1 && Math.abs(b) <= 1) continue; const ri = ring.findIndex(([p, q]) => p === a && q === b); if (ri >= 9 && ri <= 11) continue; put(x + a, y + 12, z + b, B.PLANK); }
    for (let a = -7; a <= 7; a++) for (let b = -7; b <= 7; b++) for (let e = 0; e <= 5; e++) { const d = a * a + b * b + (e - 2) * (e - 2) * 2.2; if (d <= 50 && hash2(x + a * 7 + e, z + b) > .12) put(x + a, y + 15 + e, z + b, (a + b + e) % 5 === 0 ? B.BLOSSOM : B.LEAF); }
    chest = { x: x + 2, y: y + 13, z: z + 2 };
  } else if (t === 'stones') { // círculo de piedras rúnicas
    for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2, px = Math.round(x + Math.cos(ang) * 6), pz = Math.round(z + Math.sin(ang) * 6); box(px, y, pz, px, y + 3 + (i % 2), pz, i % 2 ? B.RUNE : B.STONE); }
    box(x - 1, y, z - 1, x + 1, y, z + 1, B.MOSS); put(x, y + 1, z, B.CRYSTAL); chest = { x, y: y + 1, z: z + 2 }; put(x, y, z + 2, B.STONE);
  } else if (t === 'mushrooms') { // anillo de hongos gigantes
    for (let i = 0; i < 5; i++) { const ang = i / 5 * Math.PI * 2, px = Math.round(x + Math.cos(ang) * 6), pz = Math.round(z + Math.sin(ang) * 6); bigShroom(px, pz, y, 5 + (i % 3), i % 2 ? B.RED : B.PURPLE); }
    chest = { x, y, z };
  } else if (t === 'rainbow') { // arcoíris de bloques con ollas de oro
    const cols = [B.RED, B.ORANGE, B.YELLOW, B.GREEN, B.CYAN, B.BLUE, B.PURPLE];
    for (let a = -12; a <= 12; a++) for (let hy = 0; hy <= 12; hy++) { const d = 12 - Math.hypot(a, hy); if (d >= 0 && d < 7) { put(x + a, y + hy, z, cols[Math.floor(d)]); put(x + a, y + hy, z + 1, cols[Math.floor(d)]); } }
    for (const s of [-1, 1]) { box(x + s * 9 - 1, y, z + 3, x + s * 9, y, z + 4, B.BLACK); box(x + s * 9 - 1, y + 1, z + 3, x + s * 9, y + 1, z + 4, B.GOLD); }
    chest = { x, y, z: z + 4 }; boss = { x, y, z: z - 4 };
  } else if (t === 'arch') { // arco natural de roca a franjas
    const alongX = hash2(x, z) < .25, P2 = (a, hy, b) => alongX ? put(x + a, y + hy, z + b, strata(y + hy)) : put(x + b, y + hy, z + a, strata(y + hy));
    for (let a = -7; a <= 7; a++) for (let b = -1; b <= 1; b++) for (let hy = 0; hy <= 12; hy++) { const leg = Math.abs(a) >= 5, top = hy >= 9 + (Math.abs(a) < 2 ? 1 : 0); if (leg || top) P2(a, hy, b); }
    chest = { x, y, z }; put(x, y - 1, z, B.SAND);
  } else if (t === 'brush') { // pincel gigante clavado en un charco de pintura
    for (let a = -5; a <= 5; a++) for (let b = -5; b <= 5; b++) if (a * a + b * b <= 20 + hash2(x + a, z + b) * 8) put(x + a, y - 1, z + b, B.BLUE);
    box(x - 1, y, z - 1, x + 1, y + 1, z + 1, B.BLUE); box(x - 1, y + 2, z - 1, x + 1, y + 3, z + 1, B.BLACK); box(x - 1, y + 4, z - 1, x + 1, y + 5, z + 1, B.GOLD); box(x, y + 6, z, x + 1, y + 17, z + 1, B.RED);
    chest = { x: x + 3, y, z: z + 3 };
  } else if (t === 'easel') { // atril con un cuadro de pixel art
    const pic = PIX[hash2(x, z) < .25 ? 'heart' : 'smile'], w = pic[0].length, hh = pic.length;
    box(x - (w >> 1) - 1, y + 2, z, x + (w >> 1) + 1, y + 3 + hh, z, B.WOOD); box(x - (w >> 1), y + 3, z, x + (w >> 1), y + 2 + hh, z, B.WHITE);
    pic.forEach((row, r) => [...row].forEach((ch, c) => { if (PIXC[ch]) put(x - (w >> 1) + c, y + 2 + hh - r, z, PIXC[ch]); }));
    for (const s of [-1, 1]) box(x + s * ((w >> 1) - 1), y, z + 1, x + s * ((w >> 1) - 1), y + 1, z + 1, B.WOOD);
    for (let i = 0; i < 4; i++) put(x - 4 + i * 3, y, z + 4, [B.RED, B.YELLOW, B.BLUE, B.GREEN][i]); chest = { x, y, z: z + 2 };
  } else if (t === 'statue') { // cabeza gigante de piedra
    box(x - 3, y, z - 3, x + 3, y, z + 3, B.STONE); box(x - 2, y + 1, z - 2, x + 2, y + 9, z + 2, B.CLAY);
    box(x - 2, y + 7, z + 3, x + 2, y + 7, z + 3, B.CLAY); put(x - 1, y + 6, z + 3, B.BLACK); put(x + 1, y + 6, z + 3, B.BLACK); box(x, y + 4, z + 3, x, y + 6, z + 3, B.CLAY); box(x - 1, y + 2, z + 3, x + 1, y + 2, z + 3, B.RED); box(x - 2, y + 10, z - 2, x + 2, y + 10, z + 2, B.GREEN);
    chest = { x: x + 4, y, z: z + 1 };
  } else if (t === 'lighthouse') {
    chest = stairTower(x, z, y, 20, (h) => Math.floor(h / 3) % 2 ? B.RED : B.WHITE, { base: B.STONE });
    for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) if (Math.abs(a) === 3 || Math.abs(b) === 3) { put(x + a, y + 21, z + b, (a + b) % 2 ? B.GLASS : B.WHITE); put(x + a, y + 22, z + b, B.GLASS); }
    pyramid(x, z, y + 23, 3, B.RED, B.LAMP);
  } else if (t === 'pier') { // muelle de madera hacia el mar, con bote
    const [dx, dz] = L.dir, side = [dz, dx];
    for (let k = -2; k <= 18; k++) for (let s = -1; s <= 1; s++) { const px = x + dx * k + side[0] * s, pz = z + dz * k + side[1] * s; put(px, SEA + 1, pz, B.PLANK); if (k % 4 === 0 && Math.abs(s) === 1) { for (let yy = SEA - 6; yy <= SEA; yy++) put(px, yy, pz, B.WOOD); put(px, SEA + 2, pz, B.WOOD); put(px, SEA + 3, pz, B.LAMP); } }
    const bx = x + dx * 12 + side[0] * 4, bz = z + dz * 12 + side[1] * 4;
    for (let k = -3; k <= 3; k++) for (let s = -1; s <= 1; s++) { const px = bx + dx * k + side[0] * s, pz = bz + dz * k + side[1] * s; if (Math.abs(k) === 3 && s) continue; put(px, SEA, pz, B.RED); if (Math.abs(s) === 1 || Math.abs(k) >= 2) put(px, SEA + 1, pz, B.WHITE); }
    chest = { x: x + dx * 18, y: SEA + 2, z: z + dz * 18 };
  } else if (t === 'wreck') { // barco pirata hundido en la orilla
    const [dx, dz] = L.dir, side = [dz, dx], cx = x + dx * 7, cz = z + dz * 7, base = SEA - 3;
    for (let k = -8; k <= 8; k++) { const hw = Math.round(3.2 * Math.sqrt(1 - (k / 9) ** 2)); for (let s = -hw; s <= hw; s++) for (let hy = 0; hy <= 5; hy++) { const px = cx + dx * k + side[0] * s, pz = cz + dz * k + side[1] * s; const shell = Math.abs(s) >= hw - (hy < 2 ? 1 : 0) || hy === 0; const hole = hash2(px * 3 + hy, pz) < .07 && hy > 1; put(px, base + hy, pz, shell && !hole ? (hy === 5 ? B.PLANK : B.WOOD) : (hy <= SEA - base ? B.WATER : B.AIR)); } if (Math.abs(k) < 7) for (let s = -hw + 1; s <= hw - 1; s++) put(cx + dx * k + side[0] * s, SEA + 1, cz + dz * k + side[1] * s, B.PLANK); }
    box(cx, SEA + 2, cz, cx, SEA + 11, cz, B.WOOD); for (let s = -3; s <= 3; s++) for (let hy = 6; hy <= 9; hy++) if (hash2(s, hy) > .1) put(cx + side[0] * s, SEA + hy, cz + side[1] * s, hy === 9 ? B.BLACK : B.WHITE);
    chest = { x: cx + dx * 4, y: SEA + 2, z: cz + dz * 4 }; boss = { x, y: L.h + 1, z };
  } else if (t === 'stage') { // escenario de fiesta con guirnaldas de faroles
    box(x - 6, y, z - 3, x + 6, y, z + 3, B.PLANK); for (let a = -6; a <= 6; a++) for (let hy = 1; hy <= 6; hy++) put(x + a, y + hy, z - 3, [B.RED, B.YELLOW, B.BLUE][Math.floor((a + 6) / 2) % 3]);
    const poles = [[-9, -6], [9, -6], [-9, 7], [9, 7]]; poles.forEach(([a, b]) => { box(x + a, y, z + b, x + a, y + 6, z + b, B.WOOD); put(x + a, y + 7, z + b, B.LAMP); });
    const cols = [B.RED, B.YELLOW, B.GREEN, B.BLUE, B.PINK, B.ORANGE];
    for (let a = -8; a <= 8; a++) { put(x + a, y + 6 - (Math.abs(a) < 5 ? 1 : 0), z - 6, cols[(a + 9) % 6]); put(x + a, y + 6 - (Math.abs(a) < 5 ? 1 : 0), z + 7, cols[(a + 12) % 6]); }
    for (let b = -5; b <= 6; b++) put(x, y + 6, z + b, cols[(b + 6) % 6]); chest = { x: x + 4, y: y + 1, z };
  } else if (t === 'market') { // puestos de mercado con toldos a rayas
    [[-6, 0, B.RED], [0, 0, B.BLUE], [6, 0, B.GREEN]].forEach(([a, b, c], i) => { const px = x + a, pz = z + b; for (const [p, q] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(px + p, y, pz + q, px + p, y + 2, pz + q, B.WOOD); for (let p = -2; p <= 2; p++) for (let q = -2; q <= 2; q++) put(px + p, y + 3, pz + q, (p + 9) % 2 ? B.WHITE : c); box(px - 1, y, pz + 1, px + 1, y, pz + 1, B.PLANK); [B.RED, B.ORANGE, B.YELLOW].forEach((f, k) => put(px - 1 + k, y + 1, pz + 1, i === 1 ? [B.PINK, B.CYAN, B.PURPLE][k] : f)); });
    chest = { x, y, z: z - 3 };
  } else if (t === 'sandcastle') {
    for (let a = -4; a <= 4; a++) for (let b = -4; b <= 4; b++) if (Math.abs(a) === 4 || Math.abs(b) === 4) { const door = b === 4 && Math.abs(a) <= 0; if (!door) box(x + a, y, z + b, x + a, y + 2, z + b, B.SAND); }
    for (const [a, b] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) { box(x + a - 1, y, z + b - 1, x + a, y + 4, z + b, B.SAND); box(x + a, y + 5, z + b, x + a, y + 6, z + b, B.WOOD); put(x + a + 1, y + 6, z + b, (a > 0) ? B.RED : B.BLUE); }
    chest = { x, y, z };
  }
  L.chest = chest; L.bossAt = boss;
}

export function buildStructures() {
  buildHub(); buildIslands();
  for (const u of [1, 2, 3, 4]) { townCenter(u); SITES[u].forEach((s, i) => hut(s.x, s.z, u, i)); }
  LANDMARKS.forEach(buildLandmark);
}
export const SAFE = (x, z) => { if (Math.hypot(x - CENTER, z - CENTER) < HUB_R + 8) return true; const u = unitOf(x, z); if (!u) return true; const [tx, tz] = TOWNS[u]; if (Math.hypot(x - tx, z - tz) < 30) return true; return SITES[u].some(s => Math.hypot(x - s.x, z - s.z) < 12); };

/* ---------- Chunks ---------- */
export class VoxelWorld {
  constructor(scene, atlas) {
    this.scene = scene; this.chunks = new Map(); this.queue = []; this.edits = new Map();
    this.mat = new THREE.MeshBasicMaterial({ map: atlas, vertexColors: true });
    this.matT = new THREE.MeshBasicMaterial({ map: atlas, vertexColors: true, transparent: true, opacity: .78, depthWrite: false, side: THREE.DoubleSide });
  }
  key(cx, cz) { return cx * 64 + cz; }
  generate(cx, cz) {
    const k = this.key(cx, cz); let c = this.chunks.get(k); if (c) return c;
    const d = new Uint8Array(CHUNK * CHUNK * HEIGHT); const I = (x, y, z) => x + z * CHUNK + y * CHUNK * CHUNK;
    const ox = cx * CHUNK, oz = cz * CHUNK;
    for (let x = 0; x < CHUNK; x++) for (let z = 0; z < CHUNK; z++) {
      const wx = ox + x, wz = oz + z, h = groundHeight(wx, wz), u = unitOf(wx, wz), onRoad = u && isRoad(wx, wz, u);
      const snowy = h > 37, under = h < SEA;
      const steep = u && u !== 3 && !onRoad && Math.max(Math.abs(h - groundHeight(wx + 1, wz)), Math.abs(h - groundHeight(wx - 1, wz)), Math.abs(h - groundHeight(wx, wz + 1)), Math.abs(h - groundHeight(wx, wz - 1))) >= 3;
      // puente de tablas donde el camino cruza un río
      const bridge = onRoad && baseHeight(wx, wz) < SEA - .5 ? Math.round(baseHeight(wx, wz)) : null;
      let top = B.GRASS;
      if (snowy) top = B.SNOW; else if (under) top = u === 3 ? B.CLAY : B.SAND; else if (onRoad) top = bridge !== null ? B.PLANK : B.PATH; else if (steep) top = B.STONE;
      else if (u && isTrail(wx, wz, u)) top = B.PATH;
      else if (u === 1) { const cx = Math.floor(wx / 14), cz = Math.floor(wz / 14), f = hash2(cx * 7 + 3, cz * 13 + 1); if (f < .11 && h < 30) top = wx % 4 === 0 ? B.DIRT : [B.YELLOW, B.GREEN, B.YELLOW, B.ORANGE][Math.floor(f * 37) % 4]; }
      else if (u === 2) { if (hash2(wx, wz) < .25 + fbm(wx / 30, wz / 30, 2) * .3) top = B.MOSS; }
      else if (u === 3) { top = strata(h); if (h <= SEA + 2) top = B.SAND; else { const cx = Math.floor(wx / 9), cz = Math.floor(wz / 9), f = hash2(cx * 5 + 1, cz * 3 + 7); if (f < .035 && Math.hypot(wx - cx * 9 - 4.5, wz - cz * 9 - 4.5) < 2 + f * 60) top = [B.PINK, B.CYAN, B.YELLOW, B.PURPLE, B.BLUE][Math.floor(f * 143) % 5]; } }
      else if (u === 4 && h <= SEA + 2) top = B.SAND;
      for (let y = 0; y <= h; y++) {
        let id = B.STONE;
        if (y >= h - 3) {
          if (u === 3) id = strata(y);
          else if (steep) id = B.STONE;
          else if ((u === 4 && h <= SEA + 2) || under) id = B.SAND;
          else id = B.DIRT;
        }
        if (y === h) id = top;
        if (bridge !== null && y > bridge && y < h) id = y <= SEA ? B.WATER : B.AIR;
        d[I(x, y, z)] = id;
      }
      if (h < SEA) for (let y = h + 1; y <= SEA; y++) d[I(x, y, z)] = B.WATER;
    }
    // vegetación y detalles de cada bioma (se revisa un margen para que crucen entre chunks)
    const setB = (ax, ay, az, id) => { const lx = ax - ox, lz = az - oz; if (lx < 0 || lz < 0 || lx >= CHUNK || lz >= CHUNK || ay >= HEIGHT || ay < 0) return; const ii = I(lx, ay, lz); if (!d[ii] || d[ii] === B.LEAF || d[ii] === B.WATER || d[ii] === B.PINELEAF) d[ii] = id; };
    const tree = (wx, h, wz, th, leaf, trunk = B.WOOD) => { for (let t = 1; t <= th; t++) setB(wx, h + t, wz, trunk); for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) for (let e = 0; e <= 2; e++) if (a * a + b * b + e * e * 1.5 <= 6) setB(wx + a, h + th + e, wz + b, leaf); };
    const pine = (wx, h, wz, th) => { for (let t = 1; t <= th; t++) setB(wx, h + t, wz, B.WOOD); for (let l = 0; l < 4; l++) { const r = 3 - l; for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) if (Math.abs(a) + Math.abs(b) <= r + 1) setB(wx + a, h + th - 1 + l, wz + b, B.PINELEAF); } setB(wx, h + th + 3, wz, B.PINELEAF); };
    for (let wx = ox - 3; wx < ox + CHUNK + 3; wx++) for (let wz = oz - 3; wz < oz + CHUNK + 3; wz++) {
      if (wx < 12 || wz < 12 || wx > WORLD - 13 || wz > WORLD - 13) continue;
      const r = hash2(wx * 3 + 1, wz * 7 + 2); if (r > .075) continue;
      const u = unitOf(wx, wz); if (!u) continue;
      const h = groundHeight(wx, wz); if (h > 38 || isRoad(wx, wz, u) || isTrail(wx, wz, u) || nearLM(wx, wz, u)) continue;
      const [tx, tz] = TOWNS[u]; if (Math.hypot(wx - tx, wz - tz) < 24 || SITES[u].some(s => Math.hypot(wx - s.x, wz - s.z) < 13)) continue;
      const r2 = hash2(wx + 17, wz * 3 - 5), th = 4 + (r2 * 6 | 0), grove = fbm(wx / 40 + 5, wz / 40, 2);
      if (u === 1) {
        if (h <= SEA) continue;
        if (r < (grove > .31 ? .03 : .0035)) tree(wx, h, wz, th, r2 < .09 ? B.BLOSSOM : B.LEAF);
        else if (r < .02 && r2 < .04) { setB(wx, h + 1, wz, B.STONE); setB(wx + 1, h + 1, wz, B.MOSS); setB(wx, h + 1, wz + 1, B.STONE); setB(wx, h + 2, wz, B.STONE); }
        else if (r < .07 && r2 < .02) setB(wx, h + 1, wz, [B.RED, B.YELLOW, B.WHITE, B.PINK][Math.floor(hash2(wx * 5, wz) * 8) % 4]);
      } else if (u === 2) {
        if (h <= SEA) continue;
        const clearing = grove < .185;
        if (!clearing && r < .036) { if (r2 < .42) pine(wx, h, wz, th + 1); else tree(wx, h, wz, th + 1, B.LEAF, B.WHITE); }
        else if ((clearing ? r < .0012 : r >= .036 && r < .037) && r2 < .5) { const hh = 4 + (r2 * 8 | 0), cap = hash2(wx * 5, wz) < .25 ? B.RED : B.PURPLE; for (let t = 1; t <= hh; t++) setB(wx, h + t, wz, B.WHITE); for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) { const dd = a * a + b * b; if (dd <= 10) setB(wx + a, h + hh + 1, wz + b, (a * 3 + b * 5 + 99) % 7 === 0 ? B.WHITE : cap); if (dd <= 4) setB(wx + a, h + hh + 2, wz + b, cap); } }
        else if (r >= .047 && r < .05 && r2 < .4) { setB(wx, h + 1, wz, B.MOSS); setB(wx + 1, h + 1, wz, B.STONE); setB(wx, h + 1, wz + 1, B.MOSS); setB(wx, h + 2, wz, B.MOSS); }
        else if (r >= .05 && r < .052 && r2 < .3) { setB(wx, h + 1, wz, B.CRYSTAL); setB(wx, h + 2, wz, B.CRYSTAL); setB(wx + 1, h + 1, wz, B.CRYSTAL); }
        else if (r >= .052 && r < .055 && r2 < .15) { const along = r2 < .07; for (let k = 0; k < 4; k++) setB(wx + (along ? k : 0), h + 1, wz + (along ? 0 : k), B.WOOD); }
        else if (r >= .055 && r < .07 && clearing && r2 < .08) setB(wx, h + 1, wz, [B.BLOSSOM, B.YELLOW, B.WHITE][Math.floor(hash2(wx * 5, wz) * 6) % 3]);
      } else if (u === 3) {
        if (h <= SEA) continue;
        if (r < .005) { const ch = 2 + (r2 * 6 | 0); for (let t = 1; t <= ch; t++) setB(wx, h + t, wz, B.GREEN); if (ch > 2) { const s = r2 < .25 ? 1 : -1; setB(wx + s, h + 2, wz, B.GREEN); setB(wx + s, h + 3, wz, B.GREEN); } }
        else if (r < .0062) { const hh = 5 + (r2 * 14 | 0); for (let t = 1; t <= hh; t++) setB(wx, h + t, wz, strata(h + t)); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) setB(wx + a, h + hh + 1, wz + b, B.CLAY); }
        else if (r < .01) { setB(wx, h + 1, wz, B.WOOD); if (r2 < .25) setB(wx + 1, h + 2, wz, B.WOOD); }
        else if (r < .013) { setB(wx, h + 1, wz, B.ORANGE); setB(wx + 1, h + 1, wz, B.CLAY); }
      } else {
        if (h < SEA) { if (h >= SEA - 6 && r < .03) { const hh = 1 + (r2 * 6 | 0), c = [B.PINK, B.ORANGE, B.YELLOW, B.PURPLE][Math.floor(hash2(wx * 5, wz) * 8) % 4]; for (let t = 1; t <= hh && h + t < SEA; t++) setB(wx, h + t, wz, c); } continue; }
        if (h <= SEA + 2) {
          if (r < .012) { const ph = 5 + (r2 * 6 | 0), lean = r2 < .25 ? 1 : 0; for (let t = 1; t <= ph; t++) setB(wx + (t > ph / 2 ? lean : 0), h + t, wz, B.WOOD); const px = wx + lean, py = h + ph + 1; setB(px, py, wz, B.LEAF); for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) { setB(px + a, py, wz + b, B.LEAF); setB(px + a * 2, py - 1, wz + b * 2, B.LEAF); if (!(a && b)) setB(px + a * 3, py - 2, wz + b * 3, B.LEAF); } setB(px, py - 1, wz + 1, B.WOOD); }
          else if (r < .014) { for (let t = 1; t <= 3; t++) setB(wx, h + t, wz, B.WOOD); const c = r2 < .25 ? B.RED : B.BLUE; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) setB(wx + a, h + 4, wz + b, (a + b) & 1 ? B.WHITE : c); }
        } else if (r < .012) tree(wx, h, wz, th, r2 < .12 ? B.BLOSSOM : B.LEAF);
        else if (r < .02 && r2 < .1) setB(wx, h + 1, wz, [B.RED, B.YELLOW, B.PINK][Math.floor(hash2(wx * 5, wz) * 6) % 3]);
      }
    }
    const st = stamps.get(cx * 64 + cz); if (st) for (let i = 0; i < st.length; i += 4) d[I(st[i], st[i + 1], st[i + 2])] = st[i + 3];
    const ed = this.edits.get(k); if (ed) for (const [ii, id] of ed) d[ii] = id;
    c = { cx, cz, d, mesh: null, water: null, dirty: true, queued: false }; this.chunks.set(k, c); return c;
  }
  get(x, y, z) {
    if (y < 0 || y >= HEIGHT || x < 0 || z < 0 || x >= WORLD || z >= WORLD) return B.AIR;
    const c = this.chunks.get(this.key(x >> 4, z >> 4)) || this.generate(x >> 4, z >> 4);
    return c.d[(x & 15) + (z & 15) * CHUNK + y * CHUNK * CHUNK];
  }
  set(x, y, z, id) {
    if (y < 0 || y >= HEIGHT || x < 0 || z < 0 || x >= WORLD || z >= WORLD) return;
    const cx = x >> 4, cz = z >> 4, k = this.key(cx, cz), c = this.generate(cx, cz), ii = (x & 15) + (z & 15) * CHUNK + y * CHUNK * CHUNK;
    c.d[ii] = id; let e = this.edits.get(k); if (!e) this.edits.set(k, e = new Map()); e.set(ii, id);
    this.rebuild(cx, cz); if ((x & 15) === 0) this.rebuild(cx - 1, cz); if ((x & 15) === 15) this.rebuild(cx + 1, cz); if ((z & 15) === 0) this.rebuild(cx, cz - 1); if ((z & 15) === 15) this.rebuild(cx, cz + 1);
  }
  rebuild(cx, cz) { const c = this.chunks.get(this.key(cx, cz)); if (c && c.mesh !== null) this.mesh(c); else if (c) c.dirty = true; }
  mesh(c) {
    const P = [], U = [], C = [], I = [], Pw = [], Uw = [], Cw = [], Iw = [];
    const ox = c.cx * CHUNK, oz = c.cz * CHUNK, d = c.d, S = CHUNK * CHUNK;
    const at = (x, y, z) => { if (y < 0) return B.STONE; if (y >= HEIGHT) return B.AIR; if (x >= 0 && z >= 0 && x < CHUNK && z < CHUNK) return d[x + z * CHUNK + y * S]; return this.get(ox + x, y, oz + z); };
    const FACES = [
      { n: [0, 1, 0], l: 1, t: 0, v: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]] }, { n: [0, -1, 0], l: .55, t: 2, v: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
      { n: [1, 0, 0], l: .8, t: 1, v: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]] }, { n: [-1, 0, 0], l: .72, t: 1, v: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] },
      { n: [0, 0, 1], l: .88, t: 1, v: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] }, { n: [0, 0, -1], l: .66, t: 1, v: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]] }
    ];
    const uvE = .002, ts = 1 / ATLAS_N;
    let top = 0; for (let i = d.length - 1; i >= 0; i--) if (d[i]) { top = Math.floor(i / S) + 1; break; }
    for (let y = 0; y <= Math.min(top, HEIGHT - 1); y++) for (let z = 0; z < CHUNK; z++) for (let x = 0; x < CHUNK; x++) {
      const id = d[x + z * CHUNK + y * S]; if (!id) continue;
      const tr = id === B.WATER || id === B.GLASS, glow = id === B.LAMP || id === B.RUNE || id === B.CRYSTAL;
      for (const f of FACES) {
        const nid = at(x + f.n[0], y + f.n[1], z + f.n[2]);
        if (tr ? (nid === id || (id === B.WATER && isSolid(nid) && nid !== B.GLASS) || (id === B.WATER && f.n[1] < 0)) : !isTransparent(nid)) continue;
        if (id === B.WATER && f.n[1] === 0 && nid !== B.AIR) continue;
        const tile = TILES[id][f.t], tu = (tile % ATLAS_N) * ts, tv = 1 - (Math.floor(tile / ATLAS_N) + 1) * ts;
        const pa = tr ? Pw : P, ua = tr ? Uw : U, ca = tr ? Cw : C, ia = tr ? Iw : I, base = pa.length / 3, ao = [];
        f.v.forEach((v, n) => {
          const wy = id === B.WATER && v[1] === 1 ? y + .86 : y + v[1];
          pa.push(ox + x + v[0], wy, oz + z + v[2]);
          ua.push(tu + ((n === 1 || n === 2) ? ts - uvE : uvE), tv + (n >= 2 ? ts - uvE : uvE));
          let o = 3;
          if (!tr && !glow) {
            const sx = v[0] * 2 - 1, sy = v[1] * 2 - 1, sz = v[2] * 2 - 1, nx = x + f.n[0], ny = y + f.n[1], nz = z + f.n[2];
            let a, b, cc;
            if (f.n[1]) { a = isSolid(at(nx + sx, ny, nz)); b = isSolid(at(nx, ny, nz + sz)); cc = isSolid(at(nx + sx, ny, nz + sz)); }
            else if (f.n[0]) { a = isSolid(at(nx, ny + sy, nz)); b = isSolid(at(nx, ny, nz + sz)); cc = isSolid(at(nx, ny + sy, nz + sz)); }
            else { a = isSolid(at(nx + sx, ny, nz)); b = isSolid(at(nx, ny + sy, nz)); cc = isSolid(at(nx + sx, ny + sy, nz)); }
            o = a && b ? 0 : 3 - (a ? 1 : 0) - (b ? 1 : 0) - (cc ? 1 : 0);
          }
          ao.push(o); const l = (glow ? 1.15 : f.l) * (.55 + o * .15); ca.push(l, l, l);
        });
        if (ao[0] + ao[2] >= ao[1] + ao[3]) ia.push(base, base + 1, base + 2, base, base + 2, base + 3); else ia.push(base + 1, base + 2, base + 3, base + 1, base + 3, base);
      }
    }
    const make = (old, pos, uv, col, idx, mat) => {
      if (old) { old.geometry.dispose(); if (!pos.length) { this.scene.remove(old); return false; } }
      if (!pos.length) return false;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
      g.boundingSphere = new THREE.Sphere(new THREE.Vector3(ox + 8, HEIGHT / 2, oz + 8), 56);
      if (old) { old.geometry = g; return old; }
      const m = new THREE.Mesh(g, mat); m.matrixAutoUpdate = false; this.scene.add(m); return m;
    };
    c.mesh = make(c.mesh || null, P, U, C, I, this.mat); c.water = make(c.water || null, Pw, Uw, Cw, Iw, this.matT); c.dirty = false;
    if (c.water) c.water.renderOrder = 2;
  }
  // Carga y descarga según la posición; construye pocos chunks por cuadro para no trabar el juego
  update(px, pz, radius, budget) {
    const pcx = Math.floor(px / CHUNK), pcz = Math.floor(pz / CHUNK), todo = [];
    for (let a = -radius; a <= radius; a++) for (let b = -radius; b <= radius; b++) {
      if (a * a + b * b > radius * radius + 1) continue; const cx = pcx + a, cz = pcz + b; if (cx < 0 || cz < 0 || cx >= CW || cz >= CW) continue;
      const c = this.chunks.get(this.key(cx, cz)); if (!c || c.mesh === null || c.dirty) todo.push([a * a + b * b, cx, cz]);
    }
    todo.sort((p, q) => p[0] - q[0]);
    for (let i = 0; i < Math.min(budget, todo.length); i++) { const c = this.generate(todo[i][1], todo[i][2]); this.mesh(c); }
    const far = radius + 2;
    for (const [k, c] of this.chunks) if (Math.max(Math.abs(c.cx - pcx), Math.abs(c.cz - pcz)) > far) {
      if (c.mesh) { this.scene.remove(c.mesh); c.mesh.geometry.dispose(); } if (c.water) { this.scene.remove(c.water); c.water.geometry.dispose(); }
      this.chunks.delete(k);
    }
    return todo.length;
  }
  solidAt(x, y, z) { return isSolid(this.get(Math.floor(x), Math.floor(y), Math.floor(z))); }
  waterAt(x, y, z) { return this.get(Math.floor(x), Math.floor(y), Math.floor(z)) === B.WATER; }
  // Avanza una caja (jugador) eje por eje y devuelve si tocó suelo
  move(p, v, dt, hw = .3, h = 1.75, wasGround = false) {
    let ground = false, canStep = wasGround;
    const hits = (px, py, pz) => { for (let x = Math.floor(px - hw); x <= Math.floor(px + hw); x++) for (let y = Math.floor(py); y <= Math.floor(py + h - .01); y++) for (let z = Math.floor(pz - hw); z <= Math.floor(pz + hw); z++) if (isSolid(this.get(x, y, z))) return true; return false; };
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)) * dt / .4)), s = dt / steps;
    for (let i = 0; i < steps; i++) {
      let nx = p.x + v.x * s; if (!hits(nx, p.y, p.z)) p.x = nx; else if (canStep && !hits(nx, p.y + 1.05, p.z)) { p.x = nx; p.y += 1.05; } else v.x = 0;
      let nz = p.z + v.z * s; if (!hits(p.x, p.y, nz)) p.z = nz; else if (canStep && !hits(p.x, p.y + 1.05, nz)) { p.z = nz; p.y += 1.05; } else v.z = 0;
      let ny = p.y + v.y * s; if (!hits(p.x, ny, p.z)) p.y = ny; else { if (v.y < 0) { ground = true; canStep = true; p.y = Math.floor(ny) + 1; } v.y = 0; }
    }
    return ground;
  }
  // Primer bloque sólido en la dirección de la mirada
  raycast(o, dir, max = 7) {
    let x = Math.floor(o.x), y = Math.floor(o.y), z = Math.floor(o.z), px = x, py = y, pz = z;
    const sx = Math.sign(dir.x), sy = Math.sign(dir.y), sz = Math.sign(dir.z), tdx = sx ? Math.abs(1 / dir.x) : 1e9, tdy = sy ? Math.abs(1 / dir.y) : 1e9, tdz = sz ? Math.abs(1 / dir.z) : 1e9;
    let tx = sx ? ((sx > 0 ? x + 1 - o.x : o.x - x) * tdx) : 1e9, ty = sy ? ((sy > 0 ? y + 1 - o.y : o.y - y) * tdy) : 1e9, tz = sz ? ((sz > 0 ? z + 1 - o.z : o.z - z) * tdz) : 1e9, t = 0;
    while (t <= max) {
      if (isSolid(this.get(x, y, z))) return { x, y, z, px, py, pz, t };
      px = x; py = y; pz = z;
      if (tx < ty && tx < tz) { x += sx; t = tx; tx += tdx; } else if (ty < tz) { y += sy; t = ty; ty += tdy; } else { z += sz; t = tz; tz += tdz; }
    }
    return null;
  }
  topY(x, z) { for (let y = HEIGHT - 1; y >= 0; y--) if (isSolid(this.get(Math.floor(x), y, Math.floor(z)))) return y + 1; return SEA + 1; }
}
