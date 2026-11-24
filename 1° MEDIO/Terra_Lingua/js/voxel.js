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

function baseHeight(x, z) {
  const u = unitOf(x, z);
  if (u === 0) return 20;
  const n = fbm(x / 58, z / 58, 4), d = fbm(x / 16 + 40, z / 16, 2);
  let h;
  if (u === 1) h = 16 + n * 14 + d * 2;
  else if (u === 2) h = 15 + n * 22 + d * 3;
  else if (u === 3) { const m = 13 + n * 34; h = Math.floor(m / 5) * 5 + (m % 5 > 3.6 ? (m % 5 - 3.6) * 3.5 : 0); }
  else { const coast = Math.min(x, WORLD - z) / 90; h = 7 + n * 16 + Math.min(coast, 1) * 8; }
  return h;
}
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
export function buildStructures() {
  buildHub(); buildIslands();
  for (const u of [1, 2, 3, 4]) { townCenter(u); SITES[u].forEach((s, i) => hut(s.x, s.z, u, i)); }
}

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
      const snowy = h > 37;
      for (let y = 0; y <= h; y++) {
        let id = B.STONE;
        if (y >= h - 3) {
          if (u === 3) id = (Math.floor(y / 3) % 2 ? B.CLAY : B.ORANGE);
          else if (u === 4 && h <= SEA + 1) id = B.SAND;
          else id = y === h ? B.GRASS : B.DIRT;
        }
        if (y === h) { if (snowy) id = B.SNOW; else if (onRoad && h > SEA) id = B.PATH; else if (u === 2 && hash2(wx, wz) < .25) id = B.MOSS; }
        d[I(x, y, z)] = id;
      }
      if (h < SEA) for (let y = h + 1; y <= SEA; y++) d[I(x, y, z)] = B.WATER;
    }
    // árboles (se revisa un margen para que crucen entre chunks)
    for (let wx = ox - 3; wx < ox + CHUNK + 3; wx++) for (let wz = oz - 3; wz < oz + CHUNK + 3; wz++) {
      if (wx < 12 || wz < 12 || wx > WORLD - 13 || wz > WORLD - 13) continue;
      const u = unitOf(wx, wz); if (!u) continue;
      const dens = [0, .012, .05, .004, .012][u]; if (hash2(wx * 3 + 1, wz * 7 + 2) > dens) continue;
      const h = groundHeight(wx, wz); if (h <= SEA || h > 36 || isRoad(wx, wz, u)) continue;
      const [tx, tz] = TOWNS[u]; if (Math.hypot(wx - tx, wz - tz) < 24 || SITES[u].some(s => Math.hypot(wx - s.x, wz - s.z) < 13)) continue;
      const setB = (ax, ay, az, id) => { const lx = ax - ox, lz = az - oz; if (lx < 0 || lz < 0 || lx >= CHUNK || lz >= CHUNK || ay >= HEIGHT) return; const ii = I(lx, ay, lz); if (!d[ii] || d[ii] === B.LEAF) d[ii] = id; };
      const th = 4 + (hash2(wx, wz + 5) * 3 | 0);
      if (u === 3) { for (let t = 1; t <= 3; t++) setB(wx, h + t, wz, B.GREEN); setB(wx + 1, h + 2, wz, B.GREEN); continue; }
      const leaf = u === 2 ? B.PINELEAF : (u === 4 && hash2(wx, wz) < .006 ? B.BLOSSOM : (hash2(wx + 9, wz) < .2 ? B.BLOSSOM : B.LEAF));
      for (let t = 1; t <= th; t++) setB(wx, h + t, wz, B.WOOD);
      if (u === 2) { for (let l = 0; l < 4; l++) { const r = 3 - l; for (let a = -r; a <= r; a++) for (let b = -r; b <= r; b++) if (Math.abs(a) + Math.abs(b) <= r + 1) setB(wx + a, h + th - 1 + l, wz + b, leaf); } }
      else for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) for (let e = 0; e <= 2; e++) if (a * a + b * b + e * e * 1.5 <= 6) setB(wx + a, h + th + e, wz + b, leaf);
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
