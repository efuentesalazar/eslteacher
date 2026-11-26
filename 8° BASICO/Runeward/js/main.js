/* RUNEWARD: The Silent Realm · pixel-art action RPG in English for eslteacher.cl
   Art, music and sounds: Ninja Adventure Asset Pack by Pixel-boy & AAA (CC0).
   Every answer is sent to the teacher panel (only for students with a session) through /assets/js/eslt-track.js. */
import { BANK, GRADES, SKILLS } from './content.js';
import { MAP_W, MAP_H, CX, CY, SPR, ZONES, MOBS, ZSTAT, BOSSES, CLASSES, WEAPON_MULT, ARMOR_DEF, WEAPON_NAMES, WEAPON_ICON, ARMOR_NAMES, ITEMS, RECIPES, BUILDS, NPCS, DIALOG, TRADES } from './data.js';
import { logAnswer, student } from '/assets/js/eslt-track.js';

const GAME = 'runeward';
const SAVE_KEY = 'runeward-save-v1';
const T = 16;                       // tile size in pixels (art)
const DEBUG = /[?&]debug/.test(location.search);
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist = (a, b, c, d) => Math.hypot(a - c, b - d);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];

/* ============================== RNG + noise (deterministic world) ============================== */
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function makeNoise(seed) {
  const R = rng(seed), N = 64, g = new Float32Array(N * N); for (let i = 0; i < N * N; i++) g[i] = R();
  const sm = t => t * t * (3 - 2 * t);
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = sm(x - xi), fy = sm(y - yi);
    const v = (a, b) => g[((b % N + N) % N) * N + ((a % N + N) % N)];
    const a = v(xi, yi), b = v(xi + 1, yi), c = v(xi, yi + 1), d = v(xi + 1, yi + 1);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
}
const hash2 = (x, y) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };

/* ============================== Assets ============================== */
const IMG = {};
const IMG_LIST = [
  ...['floor', 'nature', 'water', 'element', 'camp', 'house', 'towers', 'dungeon', 'flag'].map(n => 'tiles/' + n),
  ...['slash', 'claw', 'circle', 'flam', 'smoke', 'fireball', 'energy', 'arrow', 'spark', 'rock'].map(n => 'fx/' + n),
  ...['Knight', 'Samurai', 'Hunter', 'NinjaGreen', 'SorcererOrange', 'NinjaMageBlack', 'OldMan', 'Princess', 'Monk', 'Noble', 'Eskimo', 'Caveman', 'Master', 'Woman', 'Skeleton', 'SkeletonDemon'].map(n => 'chars/' + n),
  ...Object.keys(MOBS).filter(m => !MOBS[m].chr).map(n => 'mon/' + n),
  ...BOSSES.map(b => 'boss/' + b.id),
  ...['wood', 'stone', 'fiber', 'iron', 'gold', 'crystal', 'gem', 'potion', 'coin', 'chest', 'bigchest', 'meat', 'scroll', 'sword', 'sword2', 'bigsword', 'katana', 'bow', 'bow2', 'wand', 'tome', 'anvil'].map(n => 'items/' + n),
  'ui/heart', 'ui/emote',
  'tiles/floordetail', ...['plant', 'ripple', 'ripplepurple', 'leaf', 'leafpink', 'snow', 'ember', 'fog', 'raylight'].map(n => 'amb/' + n)
];
function loadImages(onProgress) {
  let done = 0;
  return Promise.all(IMG_LIST.map(p => new Promise(res => {
    const im = new Image(); im.onload = im.onerror = () => { done++; onProgress(done / IMG_LIST.length); res(); }; im.src = `assets/${p}.png`; IMG[p] = im;
  })));
}
const ICON = k => `assets/items/${k === 'gem' ? 'gem' : k}.png`;

/* ---------- audio ---------- */
let actx = null, sfxGain = null; const SFX = {}; let muted = false;
const SFX_LIST = ['slash', 'slash2', 'launch', 'hit', 'hit2', 'impact', 'chop', 'coin', 'pickup', 'power', 'accept', 'cancel', 'move', 'heal', 'magic', 'fireball', 'explode', 'alert', 'build', 'wrong', 'levelup', 'success', 'gameover', 'secret', 'correct'];
function initAudio() {
  if (actx) return; try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  sfxGain = actx.createGain(); sfxGain.gain.value = .55; sfxGain.connect(actx.destination);
  SFX_LIST.forEach(n => fetch(`assets/sfx/${n}.mp3`).then(r => r.arrayBuffer()).then(b => actx.decodeAudioData(b)).then(buf => SFX[n] = buf).catch(() => { }));
}
const lastSfx = {};
function sfx(n, vol = 1) {
  if (muted || !actx || !SFX[n]) return; const now = performance.now(); if (lastSfx[n] && now - lastSfx[n] < 45) return; lastSfx[n] = now;
  const s = actx.createBufferSource(); s.buffer = SFX[n]; const g = actx.createGain(); g.gain.value = vol; s.connect(g); g.connect(sfxGain); s.start();
}
const music = new Audio(); music.loop = true; music.volume = .38; let musicName = '';
function playMusic(n) { if (n === musicName) return; musicName = n; music.src = `assets/music/${n}.mp3`; if (!muted) music.play().catch(() => { }); }
function setMuted(m) { muted = m; if (m) music.pause(); else music.play().catch(() => { }); try { localStorage.setItem('runeward-muted', m ? '1' : '0'); } catch (e) { } }
let voice = null;
function pickVoice() { const vs = speechSynthesis.getVoices(); voice = vs.find(v => /en-GB/i.test(v.lang) && /female|Google|Natural/i.test(v.name)) || vs.find(v => /^en[-_](GB|US)/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null; }
try { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; } catch (e) { }
function speak(text) { try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = voice ? voice.lang : 'en-GB'; if (voice) u.voice = voice; u.rate = .88; speechSynthesis.speak(u); } catch (e) { } }

/* ============================== World generation ============================== */
const N = MAP_W * MAP_H;
const W = {
  zone: new Uint8Array(N), path: new Uint8Array(N), water: new Uint8Array(N), solid: new Uint8Array(N), border: new Uint8Array(N),
  objAt: new Int32Array(N).fill(-1), decor: new Int16Array(N).fill(-1), objs: [], lore: [], chests: []
};
const idx = (x, y) => y * MAP_W + x;
const inMap = (x, y) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H;

function genWorld() {
  const R = rng(20261119), n1 = makeNoise(11), n2 = makeNoise(22), n3 = makeNoise(33), nb = makeNoise(44);
  // zones
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    const dx = x - CX, dy = y - CY, r = Math.hypot(dx, dy) + (n1(x / 8, y / 8) * 2 - 1) * 4;
    let z;
    if (r < 24) z = 0;
    else {
      const wx = dx + (n2(x / 10, y / 10) * 2 - 1) * 9, wy = dy + (n3(x / 10, y / 10) * 2 - 1) * 9;
      if (Math.abs(wx) > Math.abs(wy)) z = wx < 0 ? 1 : 2; else z = wy < 0 ? 3 : (r > 52 ? 5 : 4);
    }
    W.zone[idx(x, y)] = z;
    const e = Math.min(x, y, MAP_W - 1 - x, MAP_H - 1 - y);
    if (e < 3 + nb(x / 5, y / 5) * 2.5) W.border[idx(x, y)] = 1;
  }
  // paths
  const P = [[72, 74], [72, 56]], lines = [[[72, 74], [72, 54]], [[72, 74], [42, 72], [16, 72]], [[72, 74], [102, 72], [128, 72]], [[72, 56], [72, 42], [72, 14]], [[72, 74], [72, 102], [84, 106]], [[72, 102], [72, 132]], [[66, 72], [79, 72]]];
  const carve = (x, y) => { for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) if (inMap(x + a, y + b) && !W.border[idx(x + a, y + b)]) W.path[idx(x + a, y + b)] = 1; };
  lines.forEach(pts => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1], len = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / len, ny = (bx - ax) / len;
      for (let s = 0; s <= len; s += .5) {
        const t = s / len, wob = Math.sin(t * Math.PI) * (n1(ax + s / 6, ay + s / 6) * 2 - 1) * 5;
        carve(Math.round(ax + (bx - ax) * t + nx * wob), Math.round(ay + (by - ay) * t + ny * wob));
      }
    }
  });
  // water: lakes in Greenvale, oases in the Dunes, frozen lakes in Frostfang
  const lakes = [[0, 3, 4], [2, 2, 3], [3, 2, 3]];
  lakes.forEach(([z, count, rad]) => {
    let made = 0, tries = 0;
    while (made < count && tries++ < 400) {
      const x = 8 + R() * (MAP_W - 16) | 0, y = 8 + R() * (MAP_H - 16) | 0;
      if (W.zone[idx(x, y)] !== z || dist(x, y, CX, CY) < 12 || nearPath(x, y, rad + 3)) continue;
      if (BOSSES.some(b => dist(x, y, b.at[0], b.at[1]) < 12) || NPCS.some(n => dist(x, y, n.at[0], n.at[1]) < 8)) continue;
      const rr = rad + R() * 2;
      for (let yy = -rr - 2; yy <= rr + 2; yy++) for (let xx = -rr - 2; xx <= rr + 2; xx++) {
        const X = x + xx | 0, Y = y + yy | 0; if (!inMap(X, Y)) continue;
        if (Math.hypot(xx, yy) + (n2(X / 3, Y / 3) - .5) * 3 < rr && W.zone[idx(X, Y)] === z && !W.path[idx(X, Y)] && !W.border[idx(X, Y)]) W.water[idx(X, Y)] = 1;
      }
      made++;
    }
  });
  fillDiagonals(W.path); fillDiagonals(W.water, true);
  for (let i = 0; i < N; i++) { if (W.path[i]) W.water[i] = 0; if (W.border[i]) W.solid[i] = 1; if (W.water[i]) W.solid[i] = 1; }

  // keep + village area
  addObj('keep', 70, 72, { kind: 'keep', solidRect: [70, 70, 4, 3], noHarvest: true });
  NPCS.forEach(n => clearArea(n.at[0], n.at[1], 2));
  BOSSES.forEach(b => clearArea(b.at[0], b.at[1], 7));
  clearArea(CX, CY, 8);

  // nature objects
  const dens = [[.07, .02, 0, .03], [.17, .02, .012, .03], [.035, .025, .014, .02], [.09, .03, .014, .01], [.045, .03, .012, .008], [.03, .02, 0, .006]];
  for (let y = 0; y < MAP_H; y++) for (let x = 0; x < MAP_W; x++) {
    const i = idx(x, y), z = W.zone[i], Z = ZONES[z];
    if (W.border[i]) { if ((x + y) % 2 === 0 && hash2(x, y) < .8) addObj(pick2(Z.trees.filter(t => t !== 'cactus'), x, y) || 'deadTree', x, y, { noHarvest: true }); continue; }
    if (W.solid[i] || W.path[i] || W.objAt[i] >= 0 || nearPath(x, y, 1) || dist(x, y, CX, CY) < 9) continue;
    const r = R(), [dt, dr, dore, dbush] = dens[z];
    if (r < dt) { if (!occupiedNear(x, y, 1)) addObj(pick2(Z.trees, x, y), x, y, { kind: Z.trees[0] === 'cactus' && hash2(x, y) < .66 ? 'cactus' : 'tree' }); }
    else if (r < dt + dr) addObj(pick2(Z.rocks, x, y), x, y, { kind: 'rock' });
    else if (r < dt + dr + dore && Z.ore) addObj(Z.ore === 'iron' ? 'oreIron' : Z.ore === 'gold' ? 'oreGold' : (z === 3 ? 'crystalBlue' : 'crystalPink'), x, y, { kind: 'ore', ore: Z.ore });
    else if (r < dt + dr + dore + dbush) addObj(z === 0 || z === 1 ? pick2(['bush1', 'bush2', 'bush3'], x, y) : 'bush3', x, y, { kind: 'bush' });
    else if (Z.decor.length && R() < .05) W.decor[i] = 1;
  }
  // a few iron rocks also in Greenvale's edge so that the Forge is reachable early (near the west path)
  for (let k = 0, made = 0; k < 300 && made < 6; k++) {
    const x = 50 + R() * 20 | 0, y = 60 + R() * 24 | 0, i = idx(x, y);
    if (W.zone[i] !== 0 || W.solid[i] || W.path[i] || W.objAt[i] >= 0 || nearPath(x, y, 1) || dist(x, y, CX, CY) < 9) continue;
    addObj('oreIron', x, y, { kind: 'ore', ore: 'iron' }); made++;
  }
  // Lore stones (2 per zone) and rune chests (3 per zone)
  let ln = 0, cn = 0;
  for (let z = 0; z < 6; z++) {
    for (let k = 0, made = 0; k < 3000 && made < 5; k++) {
      const x = 6 + R() * (MAP_W - 12) | 0, y = 6 + R() * (MAP_H - 12) | 0, i = idx(x, y);
      if (W.zone[i] !== z || W.solid[i] || W.path[i] || W.objAt[i] >= 0 || !nearPath(x, y, 12) || nearPath(x, y, 3) || dist(x, y, CX, CY) < 10) continue;
      if ([...W.lore, ...W.chests].some(o => dist(o.x, o.y, x, y) < 12)) continue;
      if (BOSSES.some(b => dist(x, y, b.at[0], b.at[1]) < 9)) continue;
      clearArea(x, y, 1);
      if (made < 2) { W.lore.push({ id: ln++, z, x, y, n: made }); addObj('loreStone', x, y, { kind: 'lore', ref: ln - 1, noHarvest: true }); }
      else { W.chests.push({ id: cn++, z, x, y }); addObj('chest', x, y, { kind: 'chest', ref: cn - 1, noHarvest: true }); }
      made++;
    }
  }
  // decorative torii at the zone entrances + signposts
  [[44, 70], [100, 70], [70, 44], [70, 100], [70, 128]].forEach(([x, y]) => { clearArea(x + 3, y + 1, 1); addObj('torii', x + 3, y + 1, { noHarvest: true, deco: true, solid: false }); });
  buildMiniBase();
}
function pick2(arr, x, y) { return arr[Math.floor(hash2(x * 7 + 1, y * 13 + 5) * arr.length)]; }
function nearPath(x, y, r) { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) { const X = x + xx, Y = y + yy; if (inMap(X, Y) && W.path[idx(X, Y)]) return true; } return false; }
function occupiedNear(x, y, r) { for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) { const X = x + xx, Y = y + yy; if (inMap(X, Y) && W.objAt[idx(X, Y)] >= 0) return true; } return false; }
function clearArea(x, y, r) {
  for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) {
    const X = x + xx, Y = y + yy; if (!inMap(X, Y)) continue; const i = idx(X, Y);
    const oi = W.objAt[i]; if (oi >= 0 && W.objs[oi].kind !== 'keep') { W.objs[oi].gone = true; W.objAt[i] = -1; W.solid[i] = W.border[i] || W.water[i] ? 1 : 0; }
  }
}
function fillDiagonals(L, grow) {
  // fill small holes (a tile with 3-4 neighbours in the set); changes are applied after each pass so nothing floods
  for (let pass = 0; pass < 2; pass++) {
    const add = [];
    for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) {
      const i = idx(x, y); if (L[i]) continue;
      if (L[idx(x, y - 1)] + L[idx(x, y + 1)] + L[idx(x - 1, y)] + L[idx(x + 1, y)] >= 3) add.push(i);
    }
    add.forEach(i => L[i] = 1);
  }
  if (!grow) return;
  // water has no inner-corner tiles: fill the missing diagonal of fully surrounded tiles
  for (let pass = 0; pass < 4; pass++) {
    const add = [];
    for (let y = 1; y < MAP_H - 1; y++) for (let x = 1; x < MAP_W - 1; x++) {
      if (!L[idx(x, y)] || !(L[idx(x, y - 1)] && L[idx(x, y + 1)] && L[idx(x - 1, y)] && L[idx(x + 1, y)])) continue;
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { if (!L[idx(x + a, y + b)]) add.push(idx(x + a, y + b)); });
    }
    if (!add.length) break; add.forEach(i => L[i] = 1);
  }
}
function addObj(spr, x, y, o = {}) {
  const ob = { spr, x, y, kind: o.kind || 'deco', hp: 0, max: 0, gone: false, respawn: 0, ...o };
  ob.max = ob.hp = { tree: 3, cactus: 2, rock: 4, ore: 5, bush: 1 }[ob.kind] || 0;
  const id = W.objs.length; W.objs.push(ob);
  if (o.solidRect) { const [rx, ry, rw, rh] = o.solidRect; for (let yy = ry; yy < ry + rh; yy++) for (let xx = rx; xx < rx + rw; xx++) { W.solid[idx(xx, yy)] = 1; W.objAt[idx(xx, yy)] = id; } }
  else { W.objAt[idx(x, y)] = id; if (o.solid !== false && ob.kind !== 'bush') W.solid[idx(x, y)] = 1; }
  return ob;
}

/* ---------- minimap base ---------- */
const miniBase = document.createElement('canvas'); miniBase.width = MAP_W; miniBase.height = MAP_H;
function buildMiniBase() {
  const c = miniBase.getContext('2d'), im = c.createImageData(MAP_W, MAP_H);
  const col = ['#8fb64a', '#4f8a3a', '#e9b06a', '#e8ecf4', '#8d7766', '#5f4250'].map(h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  for (let i = 0; i < N; i++) {
    let c3 = col[W.zone[i]];
    if (W.water[i]) c3 = [70, 150, 220]; else if (W.path[i]) c3 = [214, 170, 110]; else if (W.border[i]) c3 = [30, 50, 30];
    else if (W.objAt[i] >= 0 && W.objs[W.objAt[i]].kind === 'tree') c3 = c3.map(v => v * .72);
    im.data.set([c3[0], c3[1], c3[2], 255], i * 4);
  }
  c.putImageData(im, 0, 0);
}

/* ============================== Chunk rendering (ground) ============================== */
const CH = 16; const chunks = new Map();
function tileRect(sheet, tx, ty, ctx, dx, dy) { ctx.drawImage(IMG['tiles/' + sheet], tx * T, ty * T, T, T, dx, dy, T, T); }
// 4-bit autotile: N=1 E=2 S=4 W=8 → offset in the blob (3x3 + thin lines + single)
const AUTO = { 0: [3, 3], 1: [3, 2], 4: [3, 0], 5: [3, 1], 2: [0, 3], 8: [2, 3], 10: [1, 3], 6: [0, 0], 12: [2, 0], 3: [0, 2], 9: [2, 2], 14: [1, 0], 7: [0, 1], 13: [2, 1], 11: [1, 2], 15: [1, 1] };
function mask(L, x, y) { const g = (a, b) => inMap(a, b) ? L[idx(a, b)] : 1; return (g(x, y - 1) ? 1 : 0) | (g(x + 1, y) ? 2 : 0) | (g(x, y + 1) ? 4 : 0) | (g(x - 1, y) ? 8 : 0); }
/* ---------- ground polish: floordetail overlays + light/dark variation (baked, zero per-frame cost) ---------- */
const nShade = makeNoise(77);
const imgOK = k => { const im = IMG[k]; return im && im.complete && im.naturalWidth ? im : null; };
function fdraw(g, c, r, dx, dy) { const im = imgOK('tiles/floordetail'); if (im) g.drawImage(im, c * T, r * T, T, T, dx, dy, T, T); }
function groundDetail(g, x, y, z, dx, dy) {
  const d1 = hash2(x * 3 + 11, y * 5 + 7), d2 = hash2(x * 5 + 3, y * 7 + 13);
  if (z <= 1) { if (d1 < .16) { if (d2 < .19) fdraw(g, 5 + Math.min(2, d2 / .19 * 3 | 0), 2, dx, dy); else fdraw(g, Math.min(4, (d2 - .19) / .81 * 5 | 0), 2, dx, dy); } }
  else if (z === 3) { if (d1 < .14) { if (d2 < .15) fdraw(g, 5 + Math.min(2, d2 / .15 * 3 | 0), 3, dx, dy); else fdraw(g, Math.min(4, (d2 - .15) / .85 * 5 | 0), 3, dx, dy); } }
  else if (z === 2) { if (d1 < .006) fdraw(g, 13 + (d2 * 2 | 0), 0, dx, dy); else if (d1 < .1) fdraw(g, 3 + Math.min(4, d2 * 5 | 0), 0, dx, dy); }
  else { if (d1 < .008) fdraw(g, 13 + (d2 * 2 | 0), 0, dx, dy); else if (d1 < .08) fdraw(g, 0, 1, dx, dy); }
}
function getChunk(cx, cy) {
  const key = cx + ',' + cy; let c = chunks.get(key); if (c) return c;
  c = document.createElement('canvas'); c.width = c.height = CH * T; const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
    const x = cx * CH + tx, y = cy * CH + ty; if (!inMap(x, y)) continue;
    const i = idx(x, y), Z = ZONES[W.zone[i]], dx = tx * T, dy = ty * T, h = hash2(x, y);
    const gt = h < .14 ? Z.details[Math.floor(h / .14 * Z.details.length)] : Z.ground;
    tileRect('floor', gt[0], gt[1], g, dx, dy);
    if (W.water[i] && Z.water) { const o = AUTO[mask(W.water, x, y)]; tileRect('water', Z.water[0] + o[0], Z.water[1] + o[1], g, dx, dy); }
    else if (W.path[i]) {
      const m = mask(W.path, x, y); let o = AUTO[m];
      if (m === 15) { // inner corners: grass peeks in from a diagonal
        const d = (a, b) => inMap(x + a, y + b) && !W.path[idx(x + a, y + b)];
        if (d(1, 1)) o = [5, 1]; else if (d(-1, 1)) o = [6, 1]; else if (d(1, -1)) o = [5, 2]; else if (d(-1, -1)) o = [6, 2];
      }
      tileRect('floor', Z.path[0] + o[0], Z.path[1] + o[1], g, dx, dy);
    }
    // (static decor on zones 0/1 is replaced by the animated swaying plants drawn in drawEnvAnim)
    if (!W.water[i] && !W.path[i] && W.decor[i] < 0) groundDetail(g, x, y, W.zone[i], dx, dy);
  }
  { // low-frequency light/dark variation, grass shore shadow, citadel tint
    g.globalCompositeOperation = 'source-atop';
    // smooth shade map at 4 px resolution, upscaled with smoothing so no tile-sized steps show
    const Q = 4, SN = CH * Q, sc = document.createElement('canvas'); sc.width = sc.height = SN; const sg = sc.getContext('2d'), im = sg.createImageData(SN, SN);
    for (let py = 0; py < SN; py++) for (let px = 0; px < SN; px++) {
      const fx = cx * CH + px / Q, fy = cy * CH + py / Q, x = fx | 0, y = fy | 0; if (!inMap(x, y)) continue; const i = idx(x, y); if (W.water[i]) continue;
      const d = clamp((nShade(fx / 9 + 3.7, fy / 9 + 1.3) - .5) * 3, -1, 1), a = Math.abs(d) * .08 * (W.path[i] ? .5 : 1), o = (py * SN + px) * 4;
      if (d < 0) im.data.set([0, 0, 0, a * 255], o); else im.data.set([255, 255, 220, a * 255], o);
    }
    sg.putImageData(im, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(sc, 0, 0, CH * T, CH * T); g.imageSmoothingEnabled = false;
    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const x = cx * CH + tx, y = cy * CH + ty; if (!inMap(x, y)) continue; const i = idx(x, y), z = W.zone[i];
      if (!W.water[i]) {
        if (z === 0 && !W.path[i] && inMap(x, y + 1) && W.water[idx(x, y + 1)]) { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(tx * T, ty * T + T - 3, T, 3); }
      }
      if (z === 5) { g.fillStyle = 'rgba(90,10,60,.28)'; g.fillRect(tx * T, ty * T, T, T); }
    }
    g.globalCompositeOperation = 'source-over';
  }
  chunks.set(key, c); return c;
}

/* ============================== Game state ============================== */
let S = null;               // saved state
let P = null;               // player entity
let mobs = [], projs = [], pickups = [], parts = [], texts = [], fx = [], builds = [], npcs = [], boss = null;
let paused = true, started = false, gameTime = 0;
const newState = (cls, skin, grade) => ({
  v: 1, cls, skin, grade, level: 1, xp: 0, hpMax: CLASSES[cls].hp, bonusAtk: 0, gold: 10, wt: 0, at: 0,
  inv: { wood: 0, stone: 0, fiber: 0, iron: 0, gold: 0, crystal: 0, gem: 0, potion: 2 },
  runes: 0, boss: [0, 0, 0, 0, 0, 0], quest: 0, lore: {}, chests: {}, builds: [], time: 30, pos: [72 * T + 8, 75 * T + 8],
  stats: {}, seen: {}, retry: [], streak: 0, answers: 0, correct: 0, played: 0, elderStage: 0, met: {}
});
function save() { if (!S || !P) return; S.pos = [P.x, P.y]; S.builds = builds.map(b => [b.id, b.x, b.y, Math.round(b.hp)]); try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
function loadSave() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return s && s.v === 1 && CLASSES[s.cls] ? s : null; } catch (e) { return null; } }

/* ============================== Entities ============================== */
function makePlayer() {
  const C = CLASSES[S.cls];
  return { x: S.pos[0], y: S.pos[1], r: 5, dir: 0, anim: 0, moving: false, hp: S.hpMax, atkT: 0, atkAnim: 0, specT: 0, inv: 0, kx: 0, ky: 0, sheet: 'chars/' + C.skins[S.skin], spd: C.spd, buff: 0, heal: 0, aim: [0, 1] };
}
function atkPower() { return (CLASSES[S.cls].atk + (S.level - 1) * 1.3 + S.bonusAtk) * WEAPON_MULT[S.wt] * (P.buff > 0 ? 1.3 : 1); }
function solidAt(px, py) { const x = Math.floor(px / T), y = Math.floor(py / T); if (!inMap(x, y)) return true; return W.solid[idx(x, y)] === 1; }
function blocked(x, y, r) { return solidAt(x - r, y - r) || solidAt(x + r, y - r) || solidAt(x - r, y + r) || solidAt(x + r, y + r); }
function moveEnt(e, dx, dy) {
  const r = e.r || 5; let moved = false;
  if (dx && !blocked(e.x + dx, e.y, r)) { e.x += dx; moved = true; }
  if (dy && !blocked(e.x, e.y + dy, r)) { e.y += dy; moved = true; }
  return moved;
}
const zoneOf = (px, py) => { const x = clamp(Math.floor(px / T), 0, MAP_W - 1), y = clamp(Math.floor(py / T), 0, MAP_H - 1); return W.zone[idx(x, y)]; };
const dirOf = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
const DIRV = [[0, 1], [0, -1], [-1, 0], [1, 0]];

function spawnMob(type, x, y, z, opt = {}) {
  const M = MOBS[type], hp = ZSTAT.hp[z] * M.hp * (opt.mult || 1);
  const m = { type, x, y, r: 5, z, hp, max: hp, dmg: ZSTAT.dmg[z] * (opt.mult || 1), spd: M.spd * (opt.fast || 1), dir: 0, anim: Math.random() * 4, kx: 0, ky: 0, t: Math.random() * 2, shootT: 1 + Math.random() * 2, hitT: 0, flash: 0, raider: !!opt.raider, wx: 0, wy: 0, wt: 0, sheet: M.chr ? 'chars/' + type : 'mon/' + type, chr: !!M.chr, shoot: M.shoot, float: M.float, atkT: 0 };
  mobs.push(m); return m;
}

/* ============================== Input ============================== */
const keys = {}; const mouse = { x: 0, y: 0, down: false, moved: 0, over: false };
let touchMove = { x: 0, y: 0, on: false };
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
addEventListener('keydown', e => {
  if (e.target && e.target.tagName === 'INPUT') return;
  const k = e.key.toLowerCase(); keys[k] = true;
  if (quizKey(e)) { e.preventDefault(); return; }
  if (!started) return;
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
  if (!$('dialog').classList.contains('hidden') && (k === 'enter' || k === ' ' || k === 'e')) { dialogNext(); return; }
  if (k === 'escape') { if (buildMode) { exitBuild(); return; } if (!$('modal').classList.contains('hidden')) { if (modalClosable) closeModal(); return; } openMenu(); return; }
  if (!$('modal').classList.contains('hidden') || !$('dialog').classList.contains('hidden')) return;
  if (k === 'c') openCraft(); else if (k === 'b') toggleBuild(); else if (k === 'm') openMap(); else if (k === 'l') openJournal();
  else if (k === 'q') drinkPotion(); else if (k === 'e') { if (buildMode) placeBuild(); else interact(); }
  else if (k === 'k') special(); else if (k === 'x' && buildMode) { demolish = !demolish; toast(demolish ? 'Demolish mode: click a building to remove it.' : 'Build mode'); }
});
addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
const cv = $('cv'), ctx = cv.getContext('2d');
cv.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = performance.now(); mouse.over = true; });
cv.addEventListener('mouseleave', () => { mouse.over = false; });
cv.addEventListener('mousedown', e => {
  if (isTouch && e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
  mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = performance.now();
  if (paused) return;
  if (buildMode) { if (e.button === 2) exitBuild(); else placeBuild(); return; }
  if (e.button === 2) special(); else mouse.down = true;
});
addEventListener('mouseup', () => { mouse.down = false; });
cv.addEventListener('contextmenu', e => e.preventDefault());
// touch controls
function setupTouch() {
  document.body.classList.add('touch'); $('touch').classList.remove('hidden');
  const st = $('stick'), kn = $('knob'); let id = null, cx0 = 0, cy0 = 0;
  st.addEventListener('touchstart', e => { const t = e.changedTouches[0]; id = t.identifier; const r = st.getBoundingClientRect(); cx0 = r.left + r.width / 2; cy0 = r.top + r.height / 2; mv(t); e.preventDefault(); }, { passive: false });
  const mv = t => { let dx = t.clientX - cx0, dy = t.clientY - cy0; const l = Math.hypot(dx, dy), m = 46; if (l > m) { dx *= m / l; dy *= m / l; } kn.style.transform = `translate(${dx}px,${dy}px)`; touchMove = { x: dx / m, y: dy / m, on: l > 8 }; };
  st.addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === id) mv(t); e.preventDefault(); }, { passive: false });
  const end = e => { for (const t of e.changedTouches) if (t.identifier === id) { id = null; kn.style.transform = ''; touchMove = { x: 0, y: 0, on: false }; } };
  st.addEventListener('touchend', end); st.addEventListener('touchcancel', end);
  const hold = (el, on, off) => { el.addEventListener('touchstart', e => { e.preventDefault(); on(); }, { passive: false }); el.addEventListener('touchend', e => { e.preventDefault(); off && off(); }, { passive: false }); };
  hold($('tA'), () => { if (buildMode) placeBuild(); else mouse.down = true; }, () => mouse.down = false);
  hold($('tS'), () => { if (buildMode) exitBuild(); else special(); });
  hold($('tE'), () => { if (!$('dialog').classList.contains('hidden')) dialogNext(); else if (buildMode) placeBuild(); else interact(); });
  hold($('tQ'), () => drinkPotion());
}

/* ============================== Player actions ============================== */
function aimVec() {
  if (!isTouch && mouse.over && performance.now() - mouse.moved < 4000) {
    const [wx, wy] = screenToWorld(mouse.x, mouse.y); const dx = wx - P.x, dy = wy - (P.y - 6), l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l];
  }
  // auto-aim on touch / keyboard: nearest enemy within 9 tiles, else facing
  let best = null, bd = 150; const targets = boss && boss.alive ? [...mobs, boss] : mobs;
  for (const m of targets) { const d = dist(m.x, m.y, P.x, P.y); if (d < bd) { bd = d; best = m; } }
  if (best && (isTouch || keys[' '] || keys.j)) { const dx = best.x - P.x, dy = best.y - P.y, l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; }
  return DIRV[P.dir];
}
function attack() {
  if (P.atkT > 0) return; const C = CLASSES[S.cls]; P.atkT = C.cd; P.atkAnim = .22;
  const [ax, ay] = aimVec(); P.aim = [ax, ay]; P.dir = dirOf(ax, ay);
  const dmg = atkPower();
  if (S.cls === 'warrior') {
    sfx('slash', .6);
    fx.push({ img: 'fx/slash', frames: 4, fw: 32, fh: 32, x: P.x + ax * 14, y: P.y - 6 + ay * 14, rot: Math.atan2(ay, ax), t: 0, dur: .22, scale: 1 });
    meleeHit(P.x, P.y - 4, ax, ay, 26, 1.25, dmg, true);
  } else if (S.cls === 'ranger') {
    sfx('launch', .5); shootArrow(ax, ay, dmg);
  } else {
    sfx('fireball', .45);
    projs.push({ x: P.x + ax * 8, y: P.y - 6 + ay * 8, vx: ax * 175, vy: ay * 175, life: 1.15, dmg, from: 'p', img: 'fx/fireball', frames: 4, aoe: 26, r: 5 });
  }
}
function shootArrow(ax, ay, dmg) { projs.push({ x: P.x + ax * 8, y: P.y - 6 + ay * 8, vx: ax * 270, vy: ay * 270, life: .85, dmg, from: 'p', img: 'fx/arrow', rot: Math.atan2(ay, ax), r: 3 }); }
function special() {
  if (paused || !P || P.specT > 0) return; const C = CLASSES[S.cls]; P.specT = C.scd; P.atkAnim = .3;
  const dmg = atkPower();
  if (S.cls === 'warrior') {
    sfx('slash2', .8); fx.push({ img: 'fx/circle', frames: 4, fw: 32, fh: 32, x: P.x, y: P.y - 6, rot: 0, t: 0, dur: .32, scale: 2.4 });
    areaHit(P.x, P.y - 4, 40, dmg * 2.2, 120);
  } else if (S.cls === 'ranger') {
    sfx('launch', .8); const [ax, ay] = aimVec(); const a0 = Math.atan2(ay, ax);
    [-.22, 0, .22].forEach(da => shootArrow(Math.cos(a0 + da), Math.sin(a0 + da), dmg * 1.3));
  } else {
    sfx('magic', .8); fx.push({ img: 'fx/spark', frames: 9, fw: 30, fh: 35, x: P.x, y: P.y - 8, rot: 0, t: 0, dur: .5, scale: 3 });
    areaHit(P.x, P.y - 4, 64, dmg * 2, 180);
  }
}
function hurtMob(m, dmg, kx, ky, crit) {
  if (m.isBoss) { if (m.shield) { addText(m.x, m.y - 40, 'SHIELD', '#ffe27a'); return; } }
  m.hp -= dmg; m.flash = .12; m.kx += kx; m.ky += ky; sfx(crit ? 'hit2' : 'hit', .45); hitSparks(m.x, m.y - (m.isBoss ? 14 : 6));
  addText(m.x, m.y - (m.isBoss ? 40 : 18), Math.round(dmg) + (crit ? '!' : ''), crit ? '#ffd35a' : '#ffffff');
  if (m.hp <= 0) killMob(m);
  else if (m.isBoss) checkShield();
}
function rollDmg(d) { const crit = Math.random() < .1; return [d * (.9 + Math.random() * .2) * (crit ? 1.8 : 1), crit]; }
function meleeHit(x, y, ax, ay, range, arc, dmg, harvest) {
  const targets = boss && boss.alive ? [...mobs, boss] : mobs; let hitAny = false;
  for (const m of targets) {
    const dx = m.x - x, dy = (m.y - (m.isBoss ? 14 : 4)) - y, d = Math.hypot(dx, dy), rr = range + (m.isBoss ? 20 : 4);
    if (d > rr) continue; if (d > 8 && (dx * ax + dy * ay) / d < Math.cos(arc)) continue;
    const [dd, crit] = rollDmg(dmg); hurtMob(m, dd, ax * 90, ay * 90, crit); hitAny = true;
  }
  if (harvest && !hitAny) gatherNear(ax, ay, 24);
}
function areaHit(x, y, r, dmg, kb) {
  const targets = boss && boss.alive ? [...mobs, boss] : mobs;
  for (const m of targets) { const dx = m.x - x, dy = m.y - y, d = Math.hypot(dx, dy); if (d < r + (m.isBoss ? 22 : 0)) { const [dd, crit] = rollDmg(dmg); hurtMob(m, dd, dx / (d || 1) * kb, dy / (d || 1) * kb, crit); } }
}
function gatherNear(ax, ay, range) {
  // the resource in front of the player (or the closest one)
  let best = null, bd = 1e9;
  const tx = Math.floor(P.x / T), ty = Math.floor(P.y / T);
  for (let yy = -2; yy <= 2; yy++) for (let xx = -2; xx <= 2; xx++) {
    const X = tx + xx, Y = ty + yy; if (!inMap(X, Y)) continue; const oi = W.objAt[idx(X, Y)]; if (oi < 0) continue; const o = W.objs[oi];
    if (o.gone || !o.max || o.noHarvest) continue;
    const ox = X * T + 8, oy = Y * T + 8, d = dist(ox, oy, P.x + ax * 8, P.y + ay * 8);
    if (d < range && d < bd) { bd = d; best = o; }
  }
  if (!best) return false;
  const power = 1 + Math.floor(S.wt / 2);
  best.hp -= power; best.shake = .15; sfx('chop', .55);
  const ox = best.x * T + 8, oy = best.y * T + 4;
  partBurst(ox, oy, best.kind === 'tree' || best.kind === 'cactus' || best.kind === 'bush' ? 'fx/leaf' : 'fx/rockp', 5);
  if (best.hp <= 0) {
    const give = { tree: { wood: 3 }, cactus: { fiber: 2, wood: 1 }, rock: { stone: 3 }, bush: { fiber: 2 }, ore: { [best.ore]: 2, stone: 1 } }[best.kind];
    for (const [k, v] of Object.entries(give)) for (let i = 0; i < v; i++) dropItem(ox, oy, k);
    best.gone = true; best.respawn = 150; W.objAt[idx(best.x, best.y)] = -1; W.solid[idx(best.x, best.y)] = 0;
  }
  return true;
}
function interact() {
  if (paused) return;
  const t = nearestInteract(); if (t) { t.act(); return; }
  P.atkAnim = .2; P.dir = P.dir;
  if (!gatherNear(...DIRV[P.dir], 26)) gatherNear(...aimVec(), 26);
}
function nearestInteract() {
  for (const n of npcs) if (dist(n.x, n.y, P.x, P.y) < 24) return { label: 'Talk to ' + n.name, act: () => talk(n) };
  const tx = Math.floor(P.x / T), ty = Math.floor(P.y / T);
  for (let yy = -1; yy <= 1; yy++) for (let xx = -1; xx <= 1; xx++) {
    const X = tx + xx, Y = ty + yy; if (!inMap(X, Y)) continue; const oi = W.objAt[idx(X, Y)]; if (oi < 0) continue; const o = W.objs[oi];
    if (o.gone) continue;
    if (o.kind === 'lore' && !S.lore[o.ref]) return { label: 'Read the Lore Stone', act: () => openLore(W.lore[o.ref]) };
    if (o.kind === 'chest' && !S.chests[o.ref]) return { label: 'Open the Rune Chest', act: () => openChest(W.chests[o.ref], o) };
  }
  if (boss && boss.dead && boss.shrine && dist(boss.x, boss.y, P.x, P.y) < 30) return null;
  return null;
}
function drinkPotion() {
  if (paused || !P || S.inv.potion <= 0) return; if (P.hp >= S.hpMax) { toast('Your health is full.'); return; }
  S.inv.potion--; P.hp = Math.min(S.hpMax, P.hp + S.hpMax * .5); sfx('heal', .7); partBurst(P.x, P.y - 8, 'fx/spark', 6); hudDirty = true;
}
function dropItem(x, y, k, n = 1) { pickups.push({ x: x + (Math.random() - .5) * 10, y: y + (Math.random() - .5) * 10, vx: (Math.random() - .5) * 60, vy: -40 - Math.random() * 40, z: 0, vz: 50, k, n, t: 0 }); }
function gain(k, n) {
  if (k === 'coin') { S.gold += n; sfx('coin', .35); }
  else { S.inv[k] = (S.inv[k] || 0) + n; sfx('pickup', .3); }
  hudDirty = true; checkQuest();
}
function addXp(n) {
  S.xp += n; let up = false;
  while (S.xp >= xpNeed()) { S.xp -= xpNeed(); S.level++; S.hpMax += 10; up = true; }
  if (up) { P.hp = S.hpMax; sfx('levelup', .8); toast('LEVEL UP! Level ' + S.level, true); levelQuiz(); }
  hudDirty = true;
}
const xpNeed = () => 18 + S.level * 14;
function hurtPlayer(d, from) {
  if (P.inv > 0 || paused || P.dead) return;
  const dd = d * (1 - ARMOR_DEF[S.at]); P.hp -= dd; P.inv = .7; shake = 5; sfx('impact', .55);
  addText(P.x, P.y - 22, '-' + Math.round(dd), '#ff6b5b');
  if (from) { const dx = P.x - from.x, dy = P.y - from.y, l = Math.hypot(dx, dy) || 1; P.kx += dx / l * 120; P.ky += dy / l * 120; }
  if (P.hp <= 0) die();
  hudDirty = true;
}
function die() {
  P.dead = true; P.hp = 0; sfx('gameover', .7);
  const lost = Math.floor(S.gold * .1); S.gold -= lost;
  setTimeout(() => {
    if (boss && boss.alive) despawnBoss();
    mobs = mobs.filter(m => dist(m.x, m.y, 72 * T, 74 * T) > 200);
    P.x = 72 * T + 8; P.y = 75 * T + 8; P.hp = S.hpMax; P.dead = false; P.inv = 2;
    toast(`You were defeated... You wake up at your keep. (-${lost} gold)`); save();
  }, 1600);
}
function killMob(m) {
  if (m.isBoss) { bossDefeated(); return; }
  m.dead = true; partBurst(m.x, m.y - 6, 'fx/smoke', 1, true); rings.push({ x: m.x, y: m.y - 6, t: 0 });
  addXp(ZSTAT.xp[m.z]);
  const gz = ZSTAT.gold[m.z]; for (let i = 0; i < 1 + (Math.random() * 2 | 0); i++) dropItem(m.x, m.y, 'coin', gz);
  if (Math.random() < .05) dropItem(m.x, m.y, 'potion');
  const Z = ZONES[m.z]; if (Z.ore && Math.random() < .15) dropItem(m.x, m.y, Z.ore);
  if (Math.random() < .2) dropItem(m.x, m.y, 'fiber');
}

/* ============================== Bosses ============================== */
function maybeSpawnBoss() {
  if (boss && boss.alive) return;
  for (const B of BOSSES) {
    if (S.boss[B.zone] || B.zone > S.runes) continue;
    const bx = B.at[0] * T + 8, by = B.at[1] * T + 8;
    if (dist(bx, by, P.x, P.y) < 9 * T) {
      boss = { isBoss: true, B, x: bx, y: by - 20, r: 12, hp: B.hp, max: B.hp, alive: true, shield: false, s66: false, s33: false, t: 0, anim: 0, flash: 0, kx: 0, ky: 0, burstT: 2.5, dashT: 5, sumT: 10, vx: 0, vy: 0, dash: 0 };
      mobs = mobs.filter(m => dist(m.x, m.y, bx, by) > 120);
      playMusic(B.zone === 5 ? 'final' : 'boss');
      $('bossbar').classList.remove('hidden'); $('bossName').textContent = B.name;
      sfx('alert', .7);
      openDialog(B.name, 'boss/' + B.id, [B.taunt], true);
      return;
    }
  }
}
function despawnBoss() { boss = null; $('bossbar').classList.add('hidden'); musicName = ''; }
function checkShield() {
  const b = boss; if (!b || b.shield) return; const f = b.hp / b.max;
  if ((!b.s66 && f <= .66) || (b.s66 && !b.s33 && f <= .33)) {
    b.s66 = true; if (f <= .33) b.s33 = true;
    b.shield = true; sfx('magic', .8); toast(`${b.B.name} raises a WORD SHIELD! Answer to break it.`, true);
    whenFree(() => openQuiz({ reason: 'Guardian shield', title: 'Break the Word Shield!', count: 2, zone: b.B.zone, info: 'Each correct answer hits the Guardian hard. Wrong answers make it stronger.', onDone: res => {
      const ok = res.filter(Boolean).length; if (!boss) return;
      if (ok) { const d = boss.max * .1 * ok; boss.shield = false; hurtMob(boss, d, 0, 0, true); toast(`The shield breaks! ${ok} correct: -${Math.round(d)} HP`); }
      else { boss.hp = Math.min(boss.max, boss.hp + boss.max * .08); boss.shield = false; toast('The Guardian feels stronger... (+8% HP)'); }
    } }), 500);
  }
}
// opens something only when no quiz, menu or dialog is on screen
function whenFree(fn, wait = 0) { setTimeout(function f() { if (quiz || !$('modal').classList.contains('hidden') || !$('dialog').classList.contains('hidden')) setTimeout(f, 400); else fn(); }, wait); }
function bossDefeated() {
  const b = boss, B = b.B; b.alive = false; b.dead = true;
  S.boss[B.zone] = 1; S.runes = Math.max(S.runes, B.zone + 1);
  for (let i = 0; i < 6; i++) partBurst(b.x + (Math.random() - .5) * 40, b.y - 10 + (Math.random() - .5) * 30, 'fx/smoke', 1, true);
  sfx('success', .9); shake = 10;
  addXp([60, 110, 180, 280, 400, 0][B.zone]);
  for (let i = 0; i < 2 + B.zone; i++) dropItem(b.x, b.y, 'gem');
  for (let i = 0; i < 6; i++) dropItem(b.x, b.y, 'coin', 5 * (B.zone + 1));
  despawnBoss();
  if (B.zone === 5) { save(); setTimeout(victory, 1800); return; }
  toast(`You restored the ${B.rune}!`, true);
  setTimeout(() => toast(`The wall of silence around ${ZONES[B.zone + 1].name} is gone!`), 1600);
  checkQuest(); save(); hudDirty = true;
}

/* ============================== NPCs & dialog ============================== */
let dlgQueue = [], dlgDone = null;
function openDialog(name, face, lines, pause, done) {
  dlgQueue = lines.slice(); dlgDone = done || null; const d = $('dialog');
  d.querySelector('img').src = `assets/${face.startsWith('boss/') ? 'face/' + face.slice(5) : face}.png`;
  d.querySelector('.nm').textContent = name; d.classList.remove('hidden'); if (pause) paused = true; dialogNext();
}
function dialogNext() {
  const d = $('dialog'); if (!dlgQueue.length) { d.classList.add('hidden'); paused = !$('modal').classList.contains('hidden'); const f = dlgDone; dlgDone = null; f && f(); return; }
  d.querySelector('.tx').textContent = dlgQueue.shift(); sfx('move', .3); paused = true;
}
$('dialog').querySelector('button').onclick = dialogNext;
function talk(n) {
  S.met[n.id] = 1;
  if (n.id === 'elder') {
    const st = S.boss[5] ? 4 : S.runes >= 1 ? 3 : S.wt >= 1 ? 2 : S.quest >= 1 && builds.some(b => b.id === 'workbench') ? 1 : 0;
    openDialog(n.name, 'face/OldMan', DIALOG.elder[st], true, () => { if (S.quest < 1) { S.quest = 1; checkQuest(); } });
  } else if (n.id === 'trader') openDialog(n.name, 'face/' + n.sheet, DIALOG.trader, true, openTrade);
  else openDialog(n.name, 'face/' + n.sheet, DIALOG[n.id], true);
}

/* ============================== Quests ============================== */
function questText() {
  const q = S.quest;
  if (q === 0) return ['Welcome, Runeward!', 'Talk to Elder Bram in the village (walk close and press E).'];
  if (q === 1) { const wb = builds.some(b => b.id === 'workbench'); return ['Build your keep', wb ? 'Done! Talk to Elder Bram.' : `Gather wood (${S.inv.wood}/8) and stone (${S.inv.stone}/4) with E, then press B and build a Workbench near your keep.`]; }
  if (q === 2) return ['Craft a weapon', `Stand near your Workbench, press C and craft the ${WEAPON_NAMES[S.cls][1]} (6 wood, 6 stone).`];
  if (q >= 3 && q <= 8) { const z = q - 3, B = BOSSES[z]; const extra = z === 1 ? ' Tip: build a Forge (12 stone, 4 iron) to make iron gear.' : ''; return [`Rune ${z + 1} of 6`, `Defeat ${B.name} in ${ZONES[z].name} (recommended level ${ZONES[z].lvl}).${extra}`]; }
  return ['Eldmere is free!', 'Explore, read every Lore Stone and open every Rune Chest.'];
}
function checkQuest() {
  const before = S.quest;
  if (S.quest === 1 && builds.some(b => b.id === 'workbench')) S.quest = 2;
  if (S.quest === 2 && S.wt >= 1) S.quest = 3;
  if (S.quest >= 3) S.quest = Math.max(S.quest, 3 + S.runes);
  if (S.quest !== before) { sfx('success', .5); toast('Quest updated!'); }
  hudDirty = true;
}

/* ============================== Quiz system ============================== */
// grade for a question: in "journey" (mix) mode the zone decides (Greenvale = 5° básico … Citadel = 3° medio)
function gradeFor(zone) {
  if (S.grade === 'mix') return ZONES[clamp(zone, 0, 5)].grade;
  const gi = GRADES.findIndex(g => g.id === S.grade);
  if (gi > 0 && Math.random() < .25) return GRADES[gi - 1].id;   // review from the year before
  return S.grade;
}
function allQuestions(g) {
  const B = BANK[g], out = [];
  B.mc.forEach((m, i) => out.push({ id: `${g}:mc${i}`, g, k: m[0], unit: m[1], q: m[2], right: m[3][0], opts: m[3], why: m[4] }));
  B.listen.forEach((m, i) => out.push({ id: `${g}:ls${i}`, g, k: 'LIST', unit: 'Listening', say: m[0], q: m[1], right: m[2][0], opts: m[2], why: `You heard: "${m[0]}"` }));
  B.order.forEach((s, i) => out.push({ id: `${g}:or${i}`, g, k: 'ORD', unit: 'Word order', sentence: s, q: 'Put the words in order.', right: s, why: `"${s}"` }));
  return out;
}
const QCACHE = {}; const qsOf = g => QCACHE[g] || (QCACHE[g] = allQuestions(g));
function pickQuestion(zone, avoid) {
  // spaced repetition: wrong answers come back later
  if (S.retry.length && Math.random() < .3) {
    const id = S.retry[0], g = id.split(':')[0], q = qsOf(g).find(x => x.id === id);
    if (q && !avoid.has(id)) { S.retry.shift(); return q; }
  }
  const g = gradeFor(zone), pool = qsOf(g).filter(q => !avoid.has(q.id));
  let min = Infinity; pool.forEach(q => min = Math.min(min, S.seen[q.id] || 0));
  const fresh = pool.filter(q => (S.seen[q.id] || 0) === min);
  return pick(fresh.length ? fresh : pool);
}
let quiz = null, modalClosable = true;
function openQuiz(o) {
  // o: {reason, title, count, zone, info, onDone(results), passage?, questions?}
  const avoid = new Set(), qs = o.questions || [];
  if (!o.questions) for (let i = 0; i < o.count; i++) { const q = pickQuestion(o.zone, avoid); avoid.add(q.id); qs.push(q); }
  quiz = { ...o, qs, i: 0, res: [], answered: false, t0: 0 };
  modalClosable = false; openModal(''); renderQuiz();
}
function renderQuiz() {
  const z = quiz, q = z.qs[z.i]; z.answered = false; z.t0 = performance.now(); z.built = [];
  const dots = z.qs.map((_, j) => `<i class="${j < z.res.length ? (z.res[j] ? 'ok' : 'no') : j === z.i ? 'cur' : ''}"></i>`).join('');
  const gname = (GRADES.find(g => g.id === q.g) || {}).name || '';
  let body = '';
  if (z.passage) body += `<div class="passage"><h4>📜 ${esc(z.passage.title)}</h4>${esc(z.passage.text)}</div>`;
  if (q.say) body += `<button class="listen" id="qListen">🔊 Listen again</button>`;
  body += `<div class="qtext">${esc(q.q)}</div>`;
  if (q.k === 'ORD') {
    z.words = shuffle(q.sentence.replace(/\s+/g, ' ').split(' ')); if (z.words.join(' ') === q.sentence) z.words = shuffle(z.words);
    body += `<div class="words built" id="wBuilt"></div><div class="words" id="wPool"></div><div class="row" style="margin-top:8px"><button class="small" id="wUndo">↶ Undo</button><button class="primary" id="wCheck" disabled>Check</button></div>`;
  } else {
    z.opts = shuffle(q.opts);
    body += `<div class="opts">${z.opts.map((t, j) => `<button data-j="${j}"><kbd>${j + 1}</kbd>${esc(t)}</button>`).join('')}</div>`;
  }
  body += `<div id="qfb"></div>`;
  $('panel').innerHTML = `<div class="qhead"><span class="qreason">${esc(z.title || z.reason)}</span><span class="dots">${dots}</span></div>
    ${z.info && z.i === 0 ? `<p style="margin:0 0 4px;font-size:14px">${esc(z.info)}</p>` : ''}
    <div style="font-size:12px;opacity:.7">${esc(SKILLS[q.k])} · ${esc(q.unit)} · ${esc(gname)}</div>${body}`;
  if (q.say) { $('qListen').onclick = () => speak(q.say); setTimeout(() => speak(q.say), 250); }
  if (q.k === 'ORD') renderWords();
  else $('panel').querySelectorAll('.opts button').forEach(b => b.onclick = () => answer(+b.dataset.j));
}
function renderWords() {
  const z = quiz, pool = $('wPool'), built = $('wBuilt');
  built.innerHTML = z.built.map(j => `<button data-j="${j}">${esc(z.words[j])}</button>`).join('');
  pool.innerHTML = z.words.map((w, j) => z.built.includes(j) ? '' : `<button data-j="${j}">${esc(w)}</button>`).join('');
  pool.querySelectorAll('button').forEach(b => b.onclick = () => { if (z.answered) return; z.built.push(+b.dataset.j); sfx('move', .3); renderWords(); });
  built.querySelectorAll('button').forEach(b => b.onclick = () => { if (z.answered) return; z.built = z.built.filter(j => j !== +b.dataset.j); renderWords(); });
  $('wUndo').onclick = () => { if (z.answered) return; z.built.pop(); renderWords(); };
  $('wCheck').disabled = z.built.length !== z.words.length;
  $('wCheck').onclick = () => answer(-1);
}
function answer(j) {
  const z = quiz; if (!z || z.answered) return; z.answered = true;
  const q = z.qs[z.i], ms = performance.now() - z.t0;
  let chosen, ok;
  if (q.k === 'ORD') { chosen = z.built.map(i => z.words[i]).join(' '); ok = chosen === q.sentence; }
  else {
    chosen = z.opts[j]; ok = chosen === q.right;
    $('panel').querySelectorAll('.opts button').forEach((b, i) => { b.disabled = true; if (z.opts[i] === q.right) b.classList.add('ok'); else if (i === j) b.classList.add('no'); });
  }
  z.res.push(ok);
  // learning record
  S.seen[q.id] = (S.seen[q.id] || 0) + 1; S.answers++; if (ok) S.correct++;
  const st = S.stats[q.k] = S.stats[q.k] || [0, 0]; st[1]++; if (ok) st[0]++;
  if (!ok && !S.retry.includes(q.id)) S.retry.push(q.id);
  S.streak = ok ? S.streak + 1 : 0;
  const qtext = (z.passage ? `[${z.passage.title}] ` : '') + (q.say ? `🎧 "${q.say}" ` : '') + q.q;
  logAnswer(GAME, { activity: `${z.reason} · ${(GRADES.find(g => g.id === q.g) || {}).name || q.g}`, item: { q: qtext, k: q.k }, chosen, right: q.right, ok, ms });
  sfx(ok ? 'correct' : 'wrong', ok ? .6 : .7);
  let extra = '';
  if (ok && S.streak > 0 && S.streak % 3 === 0) { P.buff = 45; extra = '<br>🔥 <b>3 in a row! You are INSPIRED: +30% damage for 45 seconds.</b>'; }
  $('qfb').innerHTML = `<div class="fb ${ok ? 'ok' : 'no'}">${ok ? '✅ <b>Correct!</b> ' : `❌ <b>Not quite.</b> The answer is: <b>${esc(q.right)}</b>. `}${esc(q.why || '')}${extra}</div>
    <div class="row" style="justify-content:flex-end;margin-top:10px"><button class="primary" id="qNext">${z.i + 1 < z.qs.length ? 'Next question ▸' : 'Continue ▸'}</button></div>`;
  $('qNext').onclick = nextQ; setTimeout(() => $('qNext') && $('qNext').focus(), 30);
  if (q.k === 'ORD') { $('wCheck').disabled = true; $('wUndo').disabled = true; }
  hudDirty = true;
}
function nextQ() {
  const z = quiz; if (!z || !z.answered) return;
  if (z.i + 1 < z.qs.length) { z.i++; renderQuiz(); return; }
  quiz = null; modalClosable = true; closeModal(); save(); z.onDone && z.onDone(z.res);
}
function quizKey(e) {
  if (!quiz || $('modal').classList.contains('hidden')) return false;
  const k = e.key;
  if (!quiz.answered && /^[1-4]$/.test(k) && quiz.qs[quiz.i].k !== 'ORD') { answer(+k - 1); return true; }
  if (quiz.answered && (k === 'Enter' || k === ' ')) { nextQ(); return true; }
  return k === ' ' || k === 'Enter';
}
function levelQuiz() {
  whenFree(() => openQuiz({ reason: 'Level up', title: `Level ${S.level}! Wisdom Trial`, count: 1, zone: zoneOf(P.x, P.y), info: 'Answer correctly to get a wisdom bonus: +6 max health and +1 attack.', onDone: r => {
    if (r[0]) { S.hpMax += 6; S.bonusAtk += 1; P.hp = S.hpMax; toast('Wisdom bonus! +6 max health, +1 attack'); } else toast('No bonus this time. Keep learning!');
    hudDirty = true;
  } }), 400);
}
function passageFor(stone) {
  let g, pi;
  if (S.grade === 'mix') { g = ZONES[stone.z].grade; pi = stone.n; }
  else {
    const gi = GRADES.findIndex(x => x.id === S.grade), list = [];
    [gi - 1, gi, gi + 1].forEach(k => { if (k >= 0 && k < GRADES.length) BANK[GRADES[k].id].read.forEach((_, j) => list.push([GRADES[k].id, j])); });
    [g, pi] = list[(stone.z * 2 + stone.n) % list.length];
  }
  const p = BANK[g].read[pi % BANK[g].read.length];
  return { g, p, questions: p.qs.map((m, i) => ({ id: `${g}:rd${pi}:${i}`, g, k: m[0], unit: 'Reading · ' + p.title, q: m[1], right: m[2][0], opts: m[2], why: m[3] })) };
}
function openLore(stone) {
  const { p, questions } = passageFor(stone);
  modalClosable = true;
  openModal(`<h2>📜 Lore Stone</h2><p>The stone glows. Ancient words appear... Read the story carefully, then answer the questions.</p>
    <div class="passage" style="max-height:48vh"><h4>${esc(p.title)}</h4>${esc(p.text)}</div>
    <div class="row" style="justify-content:flex-end"><button class="small" id="lsListen">🔊 Read it to me</button><button id="lsLater">Later</button><button class="primary" id="lsGo">I've read it ▸ Questions</button></div>`);
  $('lsListen').onclick = () => speak(p.text); $('lsLater').onclick = () => { speechSynthesis.cancel(); closeModal(); };
  $('lsGo').onclick = () => { speechSynthesis.cancel(); openQuiz({ reason: 'Lore Stone', title: p.title, passage: p, questions, zone: stone.z, onDone: res => {
    const ok = res.filter(Boolean).length; S.lore[stone.id] = 1;
    const gold = 8 + ok * 6 * (stone.z + 1); S.gold += gold; S.inv.gem += ok >= res.length - 1 ? 1 : 0; addXp(10 + ok * 6 * (stone.z + 1));
    toast(`Lore Stone: ${ok}/${res.length} correct · +${gold} gold${ok >= res.length - 1 ? ' · +1 Rune Shard' : ''}`, true); sfx('secret', .7); save(); hudDirty = true;
  } }); };
}
function openChest(ch, o) {
  openQuiz({ reason: 'Rune Chest', title: 'Rune Lock', count: 1, zone: ch.z, info: 'This chest is locked with a rune. Answer to open it!', onDone: r => {
    if (!r[0]) { toast('The rune lock holds... Try again!'); return; }
    S.chests[ch.id] = 1; sfx('secret', .7);
    const Z = ZONES[ch.z], x = ch.x * T + 8, y = ch.y * T + 8;
    for (let i = 0; i < 4; i++) dropItem(x, y, 'coin', 4 * (ch.z + 1));
    dropItem(x, y, 'potion'); if (Z.ore) for (let i = 0; i < 3; i++) dropItem(x, y, Z.ore);
    ['wood', 'stone', 'fiber'].forEach(k => dropItem(x, y, k, 3));
    toast('The chest opens!'); save();
  } });
}

/* ============================== Modals: craft, build, trade, journal, map, menu ============================== */
function openModal(html) { $('panel').innerHTML = html; $('modal').classList.remove('hidden'); paused = true; }
function closeModal() { if (quiz) return; $('modal').classList.add('hidden'); paused = !$('dialog').classList.contains('hidden'); sfx('cancel', .3); }
$('modal').addEventListener('click', e => { if (e.target.id === 'modal' && modalClosable && !quiz) closeModal(); });
const costHTML = c => `<div class="cost">${Object.entries(c).map(([k, v]) => `<span class="${(S.inv[k] || 0) < v ? 'lack' : ''}"><img class="ic" src="${ICON(k)}">${v} ${ITEMS[k]} <small>(${S.inv[k] || 0})</small></span>`).join('')}</div>`;
const canPay = c => Object.entries(c).every(([k, v]) => (S.inv[k] || 0) >= v);
const pay = c => Object.entries(c).forEach(([k, v]) => S.inv[k] -= v);
const nearBuild = id => builds.some(b => b.id === id && dist(b.x * T + 8, b.y * T + 8, P.x, P.y) < 3.5 * T);
function openCraft() {
  if (!P) return;
  const rows = RECIPES.filter(r => r.id === 'potion' || (r.name === 'weapon' ? r.tier === S.wt + 1 : r.tier === S.at + 1)).map(r => {
    let name, icon, desc;
    if (r.name === 'weapon') { name = WEAPON_NAMES[S.cls][r.tier]; icon = WEAPON_ICON[S.cls][r.tier]; desc = `Weapon · damage ×${WEAPON_MULT[r.tier]} (now ×${WEAPON_MULT[S.wt]})`; }
    else if (r.name === 'armour') { name = ARMOR_NAMES[r.tier]; icon = 'chest'; desc = `Armour · blocks ${Math.round(ARMOR_DEF[r.tier] * 100)}% of damage (now ${Math.round(ARMOR_DEF[S.at] * 100)}%)`; }
    else { name = r.name; icon = r.icon; desc = r.desc; }
    const stOk = !r.station || nearBuild(r.station);
    const stTxt = r.station ? (builds.some(b => b.id === r.station) ? (stOk ? `<span class="tag">at the ${r.station}</span>` : `<span class="tag">go to your ${r.station}</span>`) : `<span class="tag">build a ${r.station} first</span>`) : '';
    return `<div class="item"><img src="assets/items/${icon}.png"><div><div class="nm">${esc(name)} ${stTxt}</div><div class="ds">${esc(desc)}</div>${costHTML(r.cost)}</div>
      <button class="primary" data-r="${r.id}" ${canPay(r.cost) && stOk ? '' : 'disabled'}>Craft</button></div>`;
  }).join('');
  modalClosable = true;
  openModal(`<button class="close small" id="mClose">✕</button><h2>⚒ Craft</h2>
    <p>Every craft has a <b>Rune Lock</b>: answer an English question to finish it. If you fail, you keep your materials and can try again.</p>
    <p class="tag">Weapon: ${esc(WEAPON_NAMES[S.cls][S.wt])} · Armour: ${esc(ARMOR_NAMES[S.at])}</p>
    <div class="list">${rows}</div>${S.wt >= 5 && S.at >= 5 ? '<p>Your gear is the best in Eldmere!</p>' : ''}`);
  $('mClose').onclick = closeModal;
  $('panel').querySelectorAll('button[data-r]').forEach(b => b.onclick = () => {
    const r = RECIPES.find(x => x.id === b.dataset.r);
    openQuiz({ reason: 'Crafting', title: 'Rune Lock · Crafting', count: 1, zone: zoneOf(P.x, P.y), onDone: res => {
      if (!res[0]) { toast('The rune did not accept your answer. Try again!'); return; }
      if (!canPay(r.cost)) return; pay(r.cost); sfx('power', .7);
      if (r.name === 'weapon') { S.wt = r.tier; toast(`You crafted: ${WEAPON_NAMES[S.cls][r.tier]}!`, true); }
      else if (r.name === 'armour') { S.at = r.tier; toast(`You crafted: ${ARMOR_NAMES[r.tier]}!`, true); }
      else { for (const [k, v] of Object.entries(r.give)) S.inv[k] += v; toast(`You crafted: ${r.name}`); }
      checkQuest(); save(); hudDirty = true;
    } });
  });
}
let buildMode = false, buildSel = null, demolish = false;
function toggleBuild() { if (buildMode) exitBuild(); else openBuild(); }
function openBuild() {
  if (!P) return;
  if (dist(P.x, P.y, 72 * T, 72 * T) > 18 * T) { toast('You can only build near your keep. Go back to Greenvale village.'); return; }
  const rows = BUILDS.map(b => {
    const have = b.unique && builds.some(x => x.id === b.id);
    return `<div class="item"><img src="${buildIconSrc(b)}"><div><div class="nm">${esc(b.name)}</div><div class="ds">${esc(b.desc)}</div>${costHTML(b.cost)}</div>
      <button class="primary" data-b="${b.id}" ${canPay(b.cost) && !have ? '' : 'disabled'}>${have ? 'Built' : 'Place'}</button></div>`;
  }).join('');
  modalClosable = true;
  openModal(`<button class="close small" id="mClose">✕</button><h2>🏰 Build your keep</h2>
    <p>Choose a building, then click a free tile near your keep (or press E / USE to place it in front of you). <b>X</b> = demolish (half the materials back). <b>Esc</b> = stop building.</p>
    <p>At night, Hollow raiders attack your keep: walls, spike traps and arrow towers protect it.</p><div class="list">${rows}</div>
    <div class="row" style="margin-top:10px"><button id="bDemo">🪓 Demolish mode</button></div>`);
  $('mClose').onclick = closeModal;
  $('bDemo').onclick = () => { closeModal(); buildMode = true; demolish = true; buildSel = null; toast('Demolish mode: click a building to remove it. Esc to stop.'); };
  $('panel').querySelectorAll('button[data-b]').forEach(b => b.onclick = () => { buildSel = BUILDS.find(x => x.id === b.dataset.b); buildMode = true; demolish = false; closeModal(); toast(`Place the ${buildSel.name}. Esc to stop.`); });
}
function buildIconSrc(b) {
  const s = SPR[b.spr], c = document.createElement('canvas'); c.width = s[3] * T; c.height = s[4] * T;
  c.getContext('2d').drawImage(IMG['tiles/' + s[0]], s[1] * T, s[2] * T, s[3] * T, s[4] * T, 0, 0, s[3] * T, s[4] * T); return c.toDataURL();
}
function exitBuild() { buildMode = false; buildSel = null; demolish = false; }
function ghostTile() {
  if (!isTouch && mouse.over && performance.now() - mouse.moved < 3000) { const [wx, wy] = screenToWorld(mouse.x, mouse.y); return [Math.floor(wx / T), Math.floor(wy / T)]; }
  const [dx, dy] = DIRV[P.dir]; return [Math.floor(P.x / T) + dx, Math.floor((P.y - 2) / T) + dy];
}
function canPlace(x, y) {
  if (!inMap(x, y)) return false; const i = idx(x, y);
  if (W.solid[i] || W.water[i] || W.objAt[i] >= 0 || W.zone[i] !== 0) return false;
  if (dist(x, y, CX, CY) > 16) return false;
  if (Math.floor(P.x / T) === x && Math.floor(P.y / T) === y) return false;
  if (npcs.some(n => Math.floor(n.x / T) === x && Math.floor(n.y / T) === y)) return false;
  return !builds.some(b => b.x === x && b.y === y);
}
function placeBuild() {
  if (!buildMode) return; const [x, y] = ghostTile();
  if (demolish) {
    const b = builds.find(b => b.x === x && b.y === y); if (!b) { toast('No building there.'); return; }
    const D = BUILDS.find(d => d.id === b.id); for (const [k, v] of Object.entries(D.cost)) S.inv[k] += Math.floor(v / 2);
    removeBuild(b); sfx('chop', .6); save(); hudDirty = true; return;
  }
  if (!buildSel) return;
  if (!canPay(buildSel.cost)) { toast('You need more materials.'); exitBuild(); return; }
  if (!canPlace(x, y)) { toast('You cannot build there.'); sfx('wrong', .4); return; }
  pay(buildSel.cost); addBuild(buildSel.id, x, y); sfx('build', .7); partBurst(x * T + 8, y * T + 8, 'fx/smoke', 1, true);
  if (buildSel.unique || !canPay(buildSel.cost)) exitBuild();
  checkQuest(); save(); hudDirty = true;
}
function addBuild(id, x, y, hp) {
  const D = BUILDS.find(d => d.id === id); if (!D) return;
  const b = { id, x, y, hp: hp || D.hp, max: D.hp, t: 0, D }; builds.push(b);
  if (!D.walk) W.solid[idx(x, y)] = 1; return b;
}
function removeBuild(b) { builds = builds.filter(x => x !== b); W.solid[idx(b.x, b.y)] = W.objAt[idx(b.x, b.y)] >= 0 ? 1 : 0; }
function openTrade() {
  const rows = TRADES.map((t, i) => {
    const locked = t.need && S.runes < t.need;
    return `<div class="item"><img src="${ICON(Object.keys(t.give)[0])}"><div><div class="nm">${esc(t.label)}</div><div class="ds">${locked ? 'Available after you restore more Runes.' : `Price: ${t.price} gold`}</div></div>
      <button class="primary" data-t="${i}" ${S.gold >= t.price && !locked ? '' : 'disabled'}>Buy</button></div>`;
  }).join('');
  modalClosable = true;
  openModal(`<button class="close small" id="mClose">✕</button><h2>🪙 Pip's shop</h2><p>You have <b>${S.gold}</b> gold.</p><div class="list">${rows}</div>`);
  $('mClose').onclick = closeModal;
  $('panel').querySelectorAll('button[data-t]').forEach(b => b.onclick = () => {
    const t = TRADES[+b.dataset.t]; if (S.gold < t.price) return; S.gold -= t.price; for (const [k, v] of Object.entries(t.give)) S.inv[k] += v; sfx('coin', .6); hudDirty = true; save(); openTrade();
  });
}
function openJournal() {
  if (!S) return;
  const [qt, qd] = questText();
  const skills = Object.keys(SKILLS).map(k => { const [ok, t] = S.stats[k] || [0, 0]; const p = t ? Math.round(ok / t * 100) : 0;
    return `<div class="stat"><span>${esc(SKILLS[k])}</span><div class="bar"><i style="width:${p}%"></i></div><span>${t ? p + '%' : '–'} <small>(${ok}/${t})</small></span></div>`; }).join('');
  const review = S.retry.slice(-8).map(id => { const g = id.split(':')[0]; const q = qsOf(g).find(x => x.id === id); return q ? `<li>${esc(q.say ? '🎧 ' + q.say : q.q)} → <b>${esc(q.right)}</b></li>` : ''; }).join('');
  const gname = S.grade === 'mix' ? 'Journey (5° básico → 3° medio)' : GRADES.find(g => g.id === S.grade).name;
  modalClosable = true;
  openModal(`<button class="close small" id="mClose">✕</button><h2>📖 Journal</h2>
    <h3>Quest: ${esc(qt)}</h3><p>${esc(qd)}</p>
    <h3>Runes restored: ${S.runes}/6</h3><p>${BOSSES.map(b => `${S.boss[b.zone] ? '✅' : '⬜'} ${esc(b.rune)} (${esc(b.name)})`).join('<br>')}</p>
    <p>Lore Stones read: ${Object.keys(S.lore).length}/${W.lore.length} · Rune Chests opened: ${Object.keys(S.chests).length}/${W.chests.length}</p>
    <h3>My English</h3><p>Level: <b>${esc(gname)}</b> · Answers: ${S.answers} · Correct: ${S.answers ? Math.round(S.correct / S.answers * 100) : 0}%</p>${skills}
    ${review ? `<h3>To review (they will come back)</h3><ul>${review}</ul>` : ''}`);
  $('mClose').onclick = closeModal;
}
function openMap() {
  if (!S) return;
  modalClosable = true;
  const travel = BOSSES.filter(b => S.boss[b.zone] && b.zone < 5).map(b => `<button class="small" data-z="${b.zone}">Travel to ${esc(ZONES[b.zone].name)} shrine</button>`).join('');
  openModal(`<button class="close small" id="mClose">✕</button><h2>🗺 Map of Eldmere</h2><div class="mapwrap"><canvas id="bigmap" width="288" height="288"></canvas></div>
    <div class="legend"><span><i style="background:#fff"></i>You</span><span><i style="background:#ff4b4b"></i>Guardian</span><span><i style="background:#ffe14a"></i>Lore Stone</span><span><i style="background:#c27a2c"></i>Rune Chest</span><span><i style="background:#6ad1ff"></i>Keep</span></div>
    <div class="row" style="justify-content:center;margin-top:10px"><button class="primary" id="mHome">🏰 Return to keep</button>${travel}</div>`);
  drawMap($('bigmap'), 2);
  $('mClose').onclick = closeModal;
  $('mHome').onclick = () => { teleport(72 * T + 8, 75 * T + 8); };
  $('panel').querySelectorAll('button[data-z]').forEach(b => b.onclick = () => { const B = BOSSES[+b.dataset.z]; teleport(B.at[0] * T + 8, B.at[1] * T + 30); });
}
function teleport(x, y) { if (boss && boss.alive) { toast('You cannot travel during a Guardian fight!'); return; } closeModal(); P.x = x; P.y = y; mobs = []; sfx('magic', .6); partBurst(x, y - 8, 'fx/spark', 8); }
function openMenu() {
  if (!S) return; modalClosable = true;
  const opts = `<option value="mix" ${S.grade === 'mix' ? 'selected' : ''}>Journey: 5° básico → 3° medio (the world decides)</option>` + GRADES.map(g => `<option value="${g.id}" ${S.grade === g.id ? 'selected' : ''}>${g.name} (${g.band})</option>`).join('');
  openModal(`<button class="close small" id="mClose">✕</button><h2>☰ Menu</h2>
    <h3>English level</h3><select id="mGrade">${opts}</select>
    <h3>Sound</h3><div class="row"><button id="mMute">${muted ? '🔈 Sound: OFF' : '🔊 Sound: ON'}</button></div>
    <h3>Controls</h3><p>Move: <b>WASD / arrows</b> · Attack: <b>click / Space / J</b> · Special: <b>right click / K</b> · Use, talk, chop: <b>E</b> · Potion: <b>Q</b> · Craft: <b>C</b> · Build: <b>B</b> · Map: <b>M</b> · Journal: <b>L</b></p>
    <div class="row" style="margin-top:12px"><button class="primary" id="mResume">▶ Resume</button><button id="mSave">💾 Save</button><button id="mQuit">Exit to title</button></div>`);
  $('mClose').onclick = $('mResume').onclick = closeModal;
  $('mGrade').onchange = e => { S.grade = e.target.value; save(); toast('English level changed.'); };
  $('mMute').onclick = () => { setMuted(!muted); $('mMute').textContent = muted ? '🔈 Sound: OFF' : '🔊 Sound: ON'; };
  $('mSave').onclick = () => { save(); toast('Saved!'); };
  $('mQuit').onclick = () => { save(); location.reload(); };
}
function victory() {
  playMusic('win'); paused = true; modalClosable = false;
  const p = S.answers ? Math.round(S.correct / S.answers * 100) : 0;
  openModal(`<h2>👑 The Crown of Meaning is yours!</h2>
    <p>The Hollow King is defeated. Words fly back into Eldmere like birds: stories, songs and jokes fill the villages again.</p>
    <p><b>Level ${S.level}</b> · ${S.answers} answers · ${p}% correct · ${Object.keys(S.lore).length} Lore Stones read</p>
    <p>Thank you for playing, Runeward! You can keep exploring, read the Lore Stones you missed and open every Rune Chest.</p>
    <div class="row" style="justify-content:flex-end"><button class="primary" id="vGo">Keep exploring ▸</button></div>`);
  $('vGo').onclick = () => { modalClosable = true; closeModal(); musicName = ''; };
  S.quest = 9; save();
}

/* ============================== Particles / fx / text ============================== */
function partBurst(x, y, img, n, single) {
  if (single) { fx.push({ img, frames: img === 'fx/smoke' ? 6 : 9, fw: img === 'fx/smoke' ? 32 : 30, fh: img === 'fx/smoke' ? 32 : 35, x, y, rot: 0, t: 0, dur: .45, scale: 1 }); return; }
  for (let i = 0; i < n; i++) parts.push({ img, x, y, vx: (Math.random() - .5) * 90, vy: -30 - Math.random() * 60, t: 0, life: .5 + Math.random() * .3, f: Math.random() * 4 | 0 });
}
function addText(x, y, s, color) { texts.push({ x, y, s, color, t: 0 }); }
function toast(s, big) { const d = document.createElement('div'); d.className = 'toast' + (big ? ' big' : ''); d.textContent = s; $('toasts').appendChild(d); setTimeout(() => d.remove(), big ? 3200 : 2600); while ($('toasts').children.length > 4) $('toasts').firstChild.remove(); }

/* ============================== Ambient particles + hit sparks (graphics polish) ============================== */
const AMB_MAX = 45, AMB_RATE = [2.2, 3, 6, 3.5, 3.5, 4]; // spawns per second, by zone
const AMB_FR = { leaf: 6, leafpink: 6, snow: 7, ember: 7 };
let amb = [], ambAcc = 0, sparks = [], rings = [];
function spawnAmb(z, vw, vh) {
  const x = camX - 8 + Math.random() * (vw + 16), y = camY - 8 + Math.random() * (vh + 16), ph = Math.random() * 6.28, R = Math.random();
  let k, vx, vy, life;
  if (z <= 1) { k = z === 1 && R < .6 ? 'leafpink' : 'leaf'; vx = 6 + Math.random() * 8; vy = 7 + Math.random() * 7; life = 7 + Math.random() * 5; }
  else if (z === 2) { k = 'dust'; vx = 35 + Math.random() * 30; vy = 1 + Math.random() * 3; life = 2.5 + Math.random() * 2; }
  else if (z === 3) { k = 'snow'; vx = -4 + Math.random() * 10; vy = 14 + Math.random() * 12; life = 6 + Math.random() * 4; }
  else { k = z === 4 ? 'ember' : 'mote'; vx = -3 + Math.random() * 6; vy = -(7 + Math.random() * 9); life = 5 + Math.random() * 4; }
  amb.push({ k, x, y, vx, vy, t: 0, life, ph });
}
function updateAmb(dt, z) {
  if (!VW) return; const vw = VW / SC, vh = VH / SC;
  for (const p of amb) {
    p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.k === 'leaf' || p.k === 'leafpink') { p.x += Math.sin(p.t * 2 + p.ph) * 8 * dt; p.y += Math.cos(p.t * 2 + p.ph) * 3 * dt; }
    else if (p.k === 'snow') p.x += Math.sin(p.t * 1.5 + p.ph) * 6 * dt;
    else if (p.k === 'ember' || p.k === 'mote') p.x += Math.sin(p.t * 2.5 + p.ph) * 5 * dt;
  }
  amb = amb.filter(p => p.t < p.life && p.x > camX - 40 && p.x < camX + vw + 40 && p.y > camY - 40 && p.y < camY + vh + 40);
  ambAcc = Math.min(3, ambAcc + dt * AMB_RATE[z]);
  while (ambAcc >= 1) { ambAcc--; if (amb.length < AMB_MAX) spawnAmb(z, vw, vh); }
}
function hitSparks(x, y) {
  const n = 4 + (Math.random() * 3 | 0);
  for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, v = 40 + Math.random() * 50; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 20, t: 0, life: .2 + Math.random() * .1, c: i % 2 ? '#fff' : '#ffe27a' }); }
  if (sparks.length > 60) sparks.splice(0, sparks.length - 60);
}

/* ============================== Update ============================== */
let shake = 0, spawnT = 0, raidT = 0, wasNight = false, saveT = 0, lastSafe = null, lockMsgT = 0, hudDirty = true, hudT = 0;
const DAY = 360;
function nightLevel() { const t = S.time % DAY; if (t < 255) return 0; if (t < 275) return (t - 255) / 20; if (t < 345) return 1; return 1 - (t - 345) / 15; }
function update(dt) {
  gameTime += dt; updateAmb(dt, P ? zoneOf(P.x, P.y) : 0);
  if (paused || !P) return;
  S.time += dt; S.played += dt; saveT += dt;
  if (saveT > 20) { saveT = 0; save(); }
  // ---- player movement
  let mx = 0, my = 0;
  if (keys.a || keys.arrowleft) mx -= 1; if (keys.d || keys.arrowright) mx += 1; if (keys.w || keys.arrowup) my -= 1; if (keys.s || keys.arrowdown) my += 1;
  if (touchMove.on) { mx = touchMove.x; my = touchMove.y; }
  const l = Math.hypot(mx, my); if (l > 1) { mx /= l; my /= l; }
  P.moving = l > .1 && !P.dead;
  if (P.moving) { P.dir = dirOf(mx, my); P.anim += dt * 8; }
  if (!P.dead) {
    const sp = P.spd * (P.atkAnim > 0 && S.cls !== 'ranger' ? .55 : 1);
    moveEnt(P, mx * sp * dt + P.kx * dt, my * sp * dt + P.ky * dt);
  }
  P.kx *= Math.pow(.001, dt); P.ky *= Math.pow(.001, dt);
  // walls of silence: locked zones
  const zHere = zoneOf(P.x, P.y);
  if (zHere > S.runes) {
    if (lastSafe) { P.x = lastSafe[0]; P.y = lastSafe[1]; }
    if (gameTime - lockMsgT > 2.5) { lockMsgT = gameTime; toast(`A wall of silence blocks the way to ${ZONES[zHere].name}. Restore ${zHere === 1 ? 'the first Rune' : 'more Runes'} first!`); sfx('wrong', .4); }
  } else lastSafe = [P.x, P.y];
  P.atkT -= dt; P.specT -= dt; P.atkAnim -= dt; P.inv -= dt; if (P.buff > 0) P.buff -= dt;
  if ((mouse.down || keys[' '] || keys.j) && !buildMode && !P.dead) attack();
  // campfire healing
  P.heal -= dt;
  if (P.heal <= 0 && P.hp < S.hpMax && builds.some(b => b.id === 'campfire' && dist(b.x * T + 8, b.y * T + 8, P.x, P.y) < 40)) { P.heal = 1; P.hp = Math.min(S.hpMax, P.hp + S.hpMax * .05); addText(P.x, P.y - 22, '+', '#7dff7d'); hudDirty = true; }
  // ---- day / night + raids
  const night = nightLevel() > .6;
  if (night && !wasNight) { toast('Night falls... Hollow raiders are coming to your keep!', true); sfx('alert', .6); }
  if (!night && wasNight) { toast('The sun rises. The raiders run away.'); mobs.forEach(m => { if (m.raider) m.flee = true; }); }
  wasNight = night;
  if (night && builds.length) {
    raidT -= dt;
    if (raidT <= 0 && mobs.filter(m => m.raider).length < 4 + S.runes) {
      raidT = 7; const a = Math.random() * Math.PI * 2, rx = (CX + Math.cos(a) * 15) * T, ry = (CY + Math.sin(a) * 15) * T;
      if (!blocked(rx, ry, 5) && zoneOf(rx, ry) === 0) { const z = clamp(S.runes, 0, 5); spawnMob(S.runes >= 3 ? 'SkeletonDemon' : 'Skeleton', rx, ry, z, { raider: true, mult: .7 }); }
    }
  }
  // ---- mob spawning
  spawnT -= dt;
  if (spawnT <= 0) {
    spawnT = .9;
    const normal = mobs.filter(m => !m.raider).length;
    if (normal < 12 && !(boss && boss.alive)) {
      const a = Math.random() * Math.PI * 2, d = (10 + Math.random() * 5) * T, x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d;
      const z = zoneOf(x, y), safe = dist(x, y, CX * T, CY * T) < 14 * T;
      if (!blocked(x, y, 6) && z <= S.runes && !safe && inMap(Math.floor(x / T), Math.floor(y / T))) {
        const Z = ZONES[z]; spawnMob(pick(Z.mobs), x, y, z, { mult: night ? 1.25 : 1 });
      }
    }
  }
  // ---- mobs
  for (const m of mobs) updateMob(m, dt);
  mobs = mobs.filter(m => !m.dead && dist(m.x, m.y, P.x, P.y) < 26 * T && !(m.flee && dist(m.x, m.y, P.x, P.y) > 12 * T));
  // ---- NPCs look at you
  for (const n of npcs) if (dist(n.x, n.y, P.x, P.y) < 40) n.dir = dirOf(P.x - n.x, P.y - n.y);
  // ---- boss
  maybeSpawnBoss(); if (boss && boss.alive) updateBoss(boss, dt);
  // ---- buildings
  for (const b of builds) {
    b.t -= dt;
    if (b.id === 'tower' && b.t <= 0) {
      let best = null, bd = 6 * T; const bx = b.x * T + 8, by = b.y * T;
      for (const m of mobs) { const d = dist(m.x, m.y, bx, by); if (d < bd) { bd = d; best = m; } }
      if (best) { b.t = .9; const dx = best.x - bx, dy = best.y - 6 - by, l2 = Math.hypot(dx, dy) || 1; projs.push({ x: bx, y: by - 10, vx: dx / l2 * 260, vy: dy / l2 * 260, life: 1, dmg: 6 + S.level * 2.5, from: 't', img: 'fx/arrow', rot: Math.atan2(dy, dx), r: 3 }); sfx('launch', .2); }
    }
    if (b.id === 'spikes' && b.t <= 0) { b.t = .6; for (const m of mobs) if (Math.floor(m.x / T) === b.x && Math.floor(m.y / T) === b.y) hurtMob(m, 12 + S.level * 2.5, 0, 0, false); }
  }
  // ---- projectiles
  for (const p of projs) {
    p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; p.anim = (p.anim || 0) + dt * 10;
    if (p.life <= 0 || solidAt(p.x, p.y + 4) && !isBuildTile(p.x, p.y + 4, p.from)) { p.dead = true; if (p.aoe) explode(p); continue; }
    if (p.from === 'p' || p.from === 't') {
      const targets = boss && boss.alive ? [...mobs, boss] : mobs;
      for (const m of targets) {
        if (m.dead) continue; const hr = m.isBoss ? 22 : 9;
        if (dist(p.x, p.y, m.x, m.y - (m.isBoss ? 14 : 6)) < hr + p.r) {
          p.dead = true; if (p.aoe) explode(p); else { const [dd, crit] = rollDmg(p.dmg); hurtMob(m, dd, p.vx * .3, p.vy * .3, crit); } break;
        }
      }
    } else {
      if (!P.dead && dist(p.x, p.y, P.x, P.y - 6) < 7 + p.r) { p.dead = true; hurtPlayer(p.dmg, p); }
    }
  }
  projs = projs.filter(p => !p.dead);
  // ---- pickups
  for (const it of pickups) {
    it.t += dt; it.z = Math.max(0, it.z + it.vz * dt); it.vz -= 260 * dt; it.x += it.vx * dt; it.vx *= .9;
    const d = dist(it.x, it.y, P.x, P.y);
    if (it.t > .35 && d < 52) { it.x += (P.x - it.x) * Math.min(1, dt * 9); it.y += (P.y - 4 - it.y) * Math.min(1, dt * 9); }
    if (it.t > .35 && d < 9) { it.dead = true; gain(it.k, it.n); }
    if (it.t > 60) it.dead = true;
  }
  pickups = pickups.filter(i => !i.dead);
  // ---- resources respawn
  for (const o of W.objs) if (o.gone && o.respawn > 0) {
    o.respawn -= dt;
    if (o.respawn <= 0) { const i = idx(o.x, o.y); if (W.objAt[i] < 0 && !builds.some(b => b.x === o.x && b.y === o.y) && dist(o.x * T, o.y * T, P.x, P.y) > 10 * T) { o.gone = false; o.hp = o.max; W.objAt[i] = W.objs.indexOf(o); if (o.kind !== 'bush') W.solid[i] = 1; } else o.respawn = 10; }
  }
  // ---- fx
  for (const p of parts) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 200 * dt; }
  parts = parts.filter(p => p.t < p.life);
  for (const p of sparks) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 150 * dt; } sparks = sparks.filter(p => p.t < p.life);
  for (const r of rings) r.t += dt; rings = rings.filter(r => r.t < .25);
  for (const f of fx) f.t += dt; fx = fx.filter(f => f.t < f.dur);
  for (const t of texts) { t.t += dt; t.y -= 22 * dt; } texts = texts.filter(t => t.t < .9);
  for (const o of W.objs) if (o.shake > 0) o.shake -= dt;
  shake = Math.max(0, shake - dt * 30);
  // ---- music by zone
  if (!(boss && boss.alive) && started) playMusic(nightLevel() > .6 && zHere === 0 ? 'night' : ZONES[zHere].music);
  // ---- interaction prompt
  const it = nearestInteract(); const pr = $('prompt');
  if (it && !buildMode) { pr.textContent = (isTouch ? 'USE: ' : 'E: ') + it.label; pr.classList.remove('hidden'); } else if (buildMode) { pr.textContent = demolish ? 'Demolish: click a building · Esc to stop' : `Placing: ${buildSel ? buildSel.name : ''} · Esc to stop`; pr.classList.remove('hidden'); } else pr.classList.add('hidden');
  hudT -= dt; if (hudT <= 0 || hudDirty) { hudT = .25; updateHud(); }
}
function isBuildTile(px, py, from) { if (from !== 't') return false; const x = Math.floor(px / T), y = Math.floor(py / T); return builds.some(b => b.x === x && b.y === y); }
function explode(p) {
  sfx('explode', .35); fx.push({ img: 'fx/smoke', frames: 6, fw: 32, fh: 32, x: p.x, y: p.y, rot: 0, t: 0, dur: .35, scale: 1.3 });
  const targets = boss && boss.alive ? [...mobs, boss] : mobs;
  for (const m of targets) { const d = dist(p.x, p.y, m.x, m.y - 6); if (d < p.aoe + (m.isBoss ? 18 : 0)) { const [dd, crit] = rollDmg(p.dmg); hurtMob(m, dd, (m.x - p.x) * 2, (m.y - p.y) * 2, crit); } }
}
function updateMob(m, dt) {
  m.flash -= dt; m.t -= dt; m.atkT -= dt;
  let tx = P.x, ty = P.y, target = null;
  const dP = dist(m.x, m.y, P.x, P.y);
  if (m.raider) {
    // raiders go for the nearest building unless the player is close
    let bd = 1e9; for (const b of builds) { const d = dist(m.x, m.y, b.x * T + 8, b.y * T + 8); if (d < bd) { bd = d; target = b; } }
    if (dP < 5 * T || !target) target = null; else { tx = target.x * T + 8; ty = target.y * T + 8; }
  }
  let mx = 0, my = 0;
  const chase = m.raider || dP < 8 * T;
  if (m.flee) { mx = m.x - CX * T; my = m.y - CY * T; }
  else if (chase && !P.dead) {
    const dx = tx - m.x, dy = ty - m.y, d = Math.hypot(dx, dy) || 1;
    if (m.shoot && !target) { if (d > 70) { mx = dx / d; my = dy / d; } else if (d < 45) { mx = -dx / d; my = -dy / d; } }
    else { mx = dx / d; my = dy / d; }
    if (m.shoot && !target && d < 140) { m.shootT -= dt; if (m.shootT <= 0) { m.shootT = 2 + Math.random(); const v = 110; projs.push({ x: m.x, y: m.y - 6, vx: (P.x - m.x) / dP * v, vy: (P.y - 6 - m.y) / dP * v, life: 2.2, dmg: m.dmg * .9, from: 'm', img: 'fx/' + m.shoot, frames: 4, r: 4 }); } }
    if (target && d < 20 && m.atkT <= 0) { m.atkT = 1; target.hp -= m.dmg; target.flash = .15; sfx('chop', .25); if (target.hp <= 0) { removeBuild(target); partBurst(target.x * T + 8, target.y * T + 8, 'fx/smoke', 1, true); toast(`A raider destroyed your ${target.D.name}!`); } }
  } else {
    m.wt -= dt; if (m.wt <= 0) { m.wt = 1.5 + Math.random() * 2; const a = Math.random() * Math.PI * 2; m.wx = Math.random() < .35 ? 0 : Math.cos(a); m.wy = Math.sin(a) * (m.wx ? 1 : 0); }
    mx = m.wx * .45; my = m.wy * .45;
  }
  if (mx || my) { m.dir = dirOf(mx, my); m.anim += dt * 6; }
  const moved = moveEnt(m, mx * m.spd * dt + m.kx * dt, my * m.spd * dt + m.ky * dt);
  if (!moved && m.float) { m.x += mx * m.spd * dt * .5; m.y += my * m.spd * dt * .5; }
  m.kx *= Math.pow(.002, dt); m.ky *= Math.pow(.002, dt);
  if (!m.shoot && dP < 12 && !P.dead) hurtPlayer(m.dmg, m);
  else if (m.shoot && dP < 10 && !P.dead) hurtPlayer(m.dmg * .7, m);
}
function updateBoss(b, dt) {
  const B = b.B; b.t += dt; b.anim += dt * 7; b.flash -= dt;
  const dP = dist(b.x, b.y, P.x, P.y);
  if (dP > 16 * T) { despawnBoss(); toast(`${B.name} returns to its lair...`); return; }
  if (b.shield) return;
  const dx = P.x - b.x, dy = P.y - b.y, d = Math.hypot(dx, dy) || 1;
  if (b.dash > 0) { b.dash -= dt; moveEnt(b, b.vx * dt, b.vy * dt); }
  else { moveEnt(b, dx / d * (24 + B.zone * 3) * dt + b.kx * dt * .2, dy / d * (24 + B.zone * 3) * dt + b.ky * dt * .2); }
  b.kx *= .9; b.ky *= .9;
  b.burstT -= dt; b.dashT -= dt; b.sumT -= dt;
  const rage = b.hp / b.max < .5 ? 1.35 : 1;
  if (b.burstT <= 0) {
    b.burstT = (3.4 - B.zone * .2) / rage; const n = 8 + B.zone * 2, off = Math.random() * Math.PI;
    for (let i = 0; i < n; i++) { const a = off + i / n * Math.PI * 2; projs.push({ x: b.x, y: b.y - 16, vx: Math.cos(a) * 95, vy: Math.sin(a) * 95, life: 3, dmg: B.dmg * .8, from: 'm', img: 'fx/' + B.shoot, frames: 4, r: 5 }); }
    sfx('magic', .4);
  }
  if (b.dashT <= 0 && B.zone >= 1) { b.dashT = 5.5 / rage; b.dash = .55; b.vx = dx / d * 190; b.vy = dy / d * 190; sfx('slash2', .5); }
  if (b.sumT <= 0 && B.zone >= 2) { b.sumT = 12; for (let i = 0; i < 2; i++) { const a = Math.random() * 6.28; const x = b.x + Math.cos(a) * 40, y = b.y + Math.sin(a) * 40; if (!blocked(x, y, 5)) spawnMob(pick(ZONES[B.zone].mobs), x, y, B.zone, { mult: .6 }); } }
  if (dP < 26) hurtPlayer(B.dmg, b);
  const f = b.hp / b.max; const bar = $('bossbar'); bar.querySelector('i').style.width = (f * 100) + '%'; bar.classList.toggle('shield', b.shield);
}

/* ============================== Render ============================== */
let SC = 3, camX = 0, camY = 0, VW = 0, VH = 0;
function resize() {
  VW = innerWidth; VH = innerHeight; cv.width = VW; cv.height = VH;
  SC = Math.max(2, Math.floor(Math.min(VW / (T * 20), VH / (T * 11.5))));
  if (VW < 700 || VH < 450) SC = 2;
  ctx.imageSmoothingEnabled = false; lightCv.width = VW; lightCv.height = VH; buildAtmCache();
}
const lightCv = document.createElement('canvas'), lctx = lightCv.getContext('2d');
let vigCv = null, cloudCv = null; // cached vignette + cloud-shadow sprite (rebuilt in resize)
function buildAtmCache() {
  if (!VW || !VH) return;
  vigCv = document.createElement('canvas'); vigCv.width = VW; vigCv.height = VH; const v = vigCv.getContext('2d');
  const gr = v.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * .35, VW / 2, VH / 2, Math.hypot(VW, VH) / 2);
  gr.addColorStop(0, 'rgba(10,5,20,0)'); gr.addColorStop(1, 'rgba(10,5,20,.38)'); v.fillStyle = gr; v.fillRect(0, 0, VW, VH);
  const w = 240 * SC, h = 110 * SC; cloudCv = document.createElement('canvas'); cloudCv.width = w; cloudCv.height = h; const c = cloudCv.getContext('2d');
  c.translate(w / 2, h / 2); c.scale(1, h / w); const cg = c.createRadialGradient(0, 0, 0, 0, 0, w / 2);
  cg.addColorStop(0, 'rgba(0,0,30,.10)'); cg.addColorStop(.6, 'rgba(0,0,30,.07)'); cg.addColorStop(1, 'rgba(0,0,30,0)'); c.fillStyle = cg; c.fillRect(-w / 2, -w / 2, w, w);
}
addEventListener('resize', resize);
const screenToWorld = (sx, sy) => [sx / SC + camX, sy / SC + camY];
function drawSpr(name, wx, wy, alpha, shakeX) {
  const s = SPR[name]; if (!s) return; const im = IMG['tiles/' + s[0]]; const w = s[3] * T, h = s[4] * T;
  const x = Math.round((wx - w / 2 - camX + (shakeX || 0)) * SC), y = Math.round((wy - h - camY) * SC);
  if (alpha != null) ctx.globalAlpha = alpha;
  ctx.drawImage(im, s[1] * T, s[2] * T, w, h, x, y, w * SC, h * SC);
  if (alpha != null) ctx.globalAlpha = 1;
}
function drawFrame(img, sx, sy, sw, sh, wx, wy, scale = 1, flash) {
  const im = IMG[img]; if (!im) return;
  const x = Math.round((wx - sw * scale / 2 - camX) * SC), y = Math.round((wy - sh * scale - camY) * SC);
  ctx.drawImage(im, sx, sy, sw, sh, x, y, sw * scale * SC, sh * scale * SC);
  if (flash) { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .6; ctx.drawImage(im, sx, sy, sw, sh, x, y, sw * scale * SC, sh * scale * SC); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; }
}
function shadow(wx, wy, w) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse((wx - camX) * SC, (wy - camY) * SC, w * SC, w * .45 * SC, 0, 0, 7); ctx.fill(); }
function render() {
  ctx.fillStyle = '#1a120c'; ctx.fillRect(0, 0, VW, VH);
  if (!P) { renderTitleBg(); return; }
  const vw = VW / SC, vh = VH / SC;
  camX = clamp(P.x - vw / 2, 0, MAP_W * T - vw); camY = clamp(P.y - 8 - vh / 2, 0, MAP_H * T - vh);
  if (shake > 0) { camX += (Math.random() - .5) * shake * .5; camY += (Math.random() - .5) * shake * .5; }
  camX = Math.round(camX * SC) / SC; camY = Math.round(camY * SC) / SC;
  // ground chunks
  const c0 = Math.floor(camX / (CH * T)), c1 = Math.floor((camX + vw) / (CH * T)), r0 = Math.floor(camY / (CH * T)), r1 = Math.floor((camY + vh) / (CH * T));
  for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) {
    if (cx < 0 || cy < 0 || cx * CH >= MAP_W || cy * CH >= MAP_H) continue;
    ctx.drawImage(getChunk(cx, cy), Math.round((cx * CH * T - camX) * SC), Math.round((cy * CH * T - camY) * SC), CH * T * SC, CH * T * SC);
  }
  const tx0 = Math.max(0, Math.floor(camX / T) - 2), tx1 = Math.min(MAP_W - 1, Math.ceil((camX + vw) / T) + 2), ty0 = Math.max(0, Math.floor(camY / T) - 1), ty1 = Math.min(MAP_H - 1, Math.ceil((camY + vh) / T) + 3);
  drawEnvAnim(tx0, tx1, ty0, ty1);
  // build ghost
  if (buildMode) {
    const [gx, gy] = ghostTile(); const ok = demolish ? builds.some(b => b.x === gx && b.y === gy) : canPlace(gx, gy);
    ctx.fillStyle = ok ? 'rgba(120,255,120,.35)' : 'rgba(255,80,80,.35)'; ctx.fillRect((gx * T - camX) * SC, (gy * T - camY) * SC, T * SC, T * SC);
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.strokeRect((gx * T - camX) * SC, (gy * T - camY) * SC, T * SC, T * SC);
  }
  // y-sorted drawables
  const list = [];
  for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
    const oi = W.objAt[idx(x, y)]; if (oi < 0) continue; const o = W.objs[oi];
    if (o.gone || o.drawnF === frameN) continue; o.drawnF = frameN;
    list.push({ y: o.y * T + 15, f: () => drawObj(o) });
  }
  for (const b of builds) if (b.x >= tx0 && b.x <= tx1 && b.y >= ty0 && b.y <= ty1) list.push({ y: b.y * T + (b.id === 'spikes' ? 0 : 15), f: () => drawBuild(b) });
  for (const n of npcs) list.push({ y: n.y, f: () => drawChar(n.sheet, n.x, n.y, n.dir, 0, false) });
  for (const m of mobs) list.push({ y: m.y, f: () => drawMob(m) });
  if (boss && boss.alive) list.push({ y: boss.y, f: () => drawBoss(boss) });
  for (const it of pickups) list.push({ y: it.y, f: () => drawPickup(it) });
  list.push({ y: P.y, f: drawPlayer });
  list.sort((a, b) => a.y - b.y); for (const d of list) d.f();
  // projectiles
  for (const p of projs) {
    const im = IMG[p.img]; if (!im) continue;
    if (p.rot != null) { ctx.save(); ctx.translate((p.x - camX) * SC, (p.y - camY) * SC); ctx.rotate(p.rot); ctx.drawImage(im, -im.width / 2 * SC, -im.height / 2 * SC, im.width * SC, im.height * SC); ctx.restore(); }
    else { const fr = (p.anim | 0) % (p.frames || 1), fw = im.height; ctx.drawImage(im, fr * fw, 0, fw, fw, (p.x - fw / 2 - camX) * SC, (p.y - fw / 2 - camY) * SC, fw * SC, fw * SC); }
  }
  // particles + fx
  for (const p of parts) { const im = IMG[p.img]; if (!im) continue; const fw = im.height; ctx.globalAlpha = 1 - p.t / p.life; ctx.drawImage(im, (p.f % Math.max(1, im.width / fw | 0)) * fw, 0, fw, fw, (p.x - 4 - camX) * SC, (p.y - 4 - camY) * SC, 8 * SC, 8 * SC); }
  ctx.globalAlpha = 1;
  for (const f of fx) {
    const im = IMG[f.img]; if (!im) continue; const fr = Math.min(f.frames - 1, Math.floor(f.t / f.dur * f.frames));
    ctx.save(); ctx.translate((f.x - camX) * SC, (f.y - camY) * SC); ctx.rotate(f.rot);
    const w = f.fw * f.scale * SC, h = f.fh * f.scale * SC; ctx.drawImage(im, fr * f.fw, 0, f.fw, f.fh, -w / 2, -h / 2, w, h); ctx.restore();
  }
  // walls of silence (locked zones)
  ctx.fillStyle = 'rgba(40,10,70,.55)';
  for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) if (W.zone[idx(x, y)] > S.runes) ctx.fillRect(Math.floor((x * T - camX) * SC), Math.floor((y * T - camY) * SC), Math.ceil(T * SC) + 1, Math.ceil(T * SC) + 1);
  drawAmb(); drawSparks();
  // night
  const nl = Math.max(nightLevel() * .68, zoneOf(P.x, P.y) === 5 ? .35 : 0);
  if (nl > .01) {
    lctx.globalCompositeOperation = 'source-over'; lctx.clearRect(0, 0, VW, VH); lctx.fillStyle = `rgba(8,10,35,${nl})`; lctx.fillRect(0, 0, VW, VH);
    lctx.globalCompositeOperation = 'destination-out';
    const light = (wx, wy, r) => { const x = (wx - camX) * SC, y = (wy - camY) * SC, R = r * SC; if (x < -R || y < -R || x > VW + R || y > VH + R) return; const g = lctx.createRadialGradient(x, y, 0, x, y, R); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); lctx.fillStyle = g; lctx.beginPath(); lctx.arc(x, y, R, 0, 7); lctx.fill(); };
    light(P.x, P.y - 6, 72); light(72 * T, 72 * T, 60);
    for (const b of builds) if (b.id === 'campfire' || b.id === 'brazier') light(b.x * T + 8, b.y * T + 6, b.id === 'campfire' ? 95 : 75); else if (b.id === 'tower') light(b.x * T + 8, b.y * T, 40);
    for (const p of projs) if (p.img === 'fx/fireball') light(p.x, p.y, 24);
    ctx.drawImage(lightCv, 0, 0);
  }
  drawAtmos(zoneOf(P.x, P.y));
  // floating text
  ctx.font = `${Math.max(12, 5 * SC)}px Pixel, monospace`; ctx.textAlign = 'center';
  for (const t of texts) { ctx.globalAlpha = 1 - t.t / .9; ctx.fillStyle = '#000'; ctx.fillText(t.s, (t.x - camX) * SC + 2, (t.y - camY) * SC + 2); ctx.fillStyle = t.color; ctx.fillText(t.s, (t.x - camX) * SC, (t.y - camY) * SC); }
  ctx.globalAlpha = 1;
  drawMini();
}
let frameN = 0;
function drawObj(o) {
  const sx = o.shake > 0 ? Math.sin(o.shake * 80) * 1.2 : 0, wx = o.x * T + 8, wy = o.y * T + 16;
  if (o.spr === 'keep') { drawSpr('keep', 72 * T, 73 * T); const fl = IMG['tiles/flag']; const fr = (gameTime * 6 | 0) % 4; ctx.drawImage(fl, fr * 16, 0, 16, 16, (73 * T + 4 - camX) * SC, (69 * T + 2 - camY) * SC, 16 * SC, 16 * SC); return; }
  if (o.kind === 'chest') { const done = S.chests[o.ref]; const im = IMG['items/bigchest']; shadow(wx, wy - 2, 7); ctx.drawImage(im, done ? 16 : 0, 0, 16, 14, (wx - 8 - camX) * SC, (wy - 15 - camY) * SC, 16 * SC, 14 * SC); if (!done) sparkle(wx, wy - 14); return; }
  if (o.kind === 'lore') { drawSpr(S.lore[o.ref] ? 'loreDone' : 'loreStone', wx, wy); if (!S.lore[o.ref]) sparkle(wx, wy - 18); return; }
  if (o.kind === 'tree' || o.kind === 'cactus' || o.kind === 'deco' && SPR[o.spr] && SPR[o.spr][3] === 2) shadow(wx, wy - 2, 8);
  if (o.kind === 'tree') drawTree(o, wx, wy, sx); else drawSpr(o.spr, wx, wy, null, sx);
}
/* ---------- wind sway: canopy row shifts by whole world pixels, trunk row stays ---------- */
function drawTree(o, wx, wy, sx) {
  const s = SPR[o.spr]; if (!s || s[4] !== 2) { drawSpr(o.spr, wx, wy, null, sx); return; }
  const im = IMG['tiles/' + s[0]], w = s[3] * T, x = Math.round((wx - w / 2 - camX + sx) * SC), y = Math.round((wy - 2 * T - camY) * SC);
  const sw = Math.round(Math.sin(gameTime * 1.6 + o.x * .7 + o.y * .3) * .9) * SC;
  ctx.drawImage(im, s[1] * T, s[2] * T, w, T, x + sw, y, w * SC, T * SC);
  ctx.drawImage(im, s[1] * T, s[2] * T + T, w, T, x, y + T * SC, w * SC, T * SC);
}
function sparkle(wx, wy) { const a = .5 + Math.sin(gameTime * 4) * .5; ctx.fillStyle = `rgba(255,240,150,${a})`; const s = SC; ctx.fillRect((wx - camX) * SC - s, (wy - camY - 4 - a * 3) * SC - s, 2 * s, 2 * s); }
function drawBuild(b) {
  const wx = b.x * T + 8, wy = b.y * T + 16; if (b.id !== 'spikes') shadow(wx, wy - 2, 7);
  drawSpr(b.D.spr, wx, wy);
  if (b.id === 'campfire' || b.id === 'forge') { const im = IMG['fx/flam'], fr = (gameTime * 10 | 0) % 8; ctx.drawImage(im, fr * 25, 0, 25, 30, (wx - 6 - camX) * SC, (wy - 20 - (b.id === 'forge' ? 4 : 0) - camY) * SC, 12 * SC, 15 * SC); }
  if (b.hp < b.max) { ctx.fillStyle = '#300'; ctx.fillRect((wx - 7 - camX) * SC, (wy - 2 - camY) * SC, 14 * SC, 2 * SC); ctx.fillStyle = '#f55'; ctx.fillRect((wx - 7 - camX) * SC, (wy - 2 - camY) * SC, 14 * SC * b.hp / b.max, 2 * SC); }
}
function drawChar(sheet, x, y, dir, frame, atk, flash) {
  shadow(x, y, 6);
  drawFrame(sheet, dir * 16, (atk ? 4 : frame) * 16, 16, 16, x, y + 2, 1, flash);
}
function drawPlayer() {
  if (P.dead) { ctx.globalAlpha = .5; }
  if (P.inv > 0 && !P.dead && (gameTime * 20 | 0) % 2) ctx.globalAlpha = .45;
  drawChar(P.sheet, P.x, P.y, P.dir, P.moving ? (P.anim | 0) % 4 : 0, P.atkAnim > 0);
  ctx.globalAlpha = 1;
  if (P.buff > 0 && (gameTime * 8 | 0) % 2) sparkle(P.x + (Math.random() - .5) * 10, P.y - 10);
}
function drawMob(m) {
  const fr = (m.anim | 0) % 4, bob = m.float ? Math.sin(gameTime * 5 + m.x) * 2 : 0;
  shadow(m.x, m.y, 6);
  drawFrame(m.sheet, m.dir * 16, fr * 16, 16, 16, m.x, m.y + 2 - bob - (m.float ? 3 : 0), 1, m.flash > 0);
  if (m.hp < m.max) { const w = 14; ctx.fillStyle = '#300'; ctx.fillRect((m.x - w / 2 - camX) * SC, (m.y - 19 - camY) * SC, w * SC, 2 * SC); ctx.fillStyle = m.raider ? '#c79bff' : '#ff5a4a'; ctx.fillRect((m.x - w / 2 - camX) * SC, (m.y - 19 - camY) * SC, w * SC * m.hp / m.max, 2 * SC); }
}
function drawBoss(b) {
  const B = b.B, fr = (b.anim | 0) % B.frames, sc = B.fw < 50 ? 1.6 : 1.1;
  shadow(b.x, b.y, 20);
  drawFrame('boss/' + B.id, fr * B.fw, 0, B.fw, B.fh, b.x, b.y + 4, sc, b.flash > 0);
  if (b.shield) { ctx.strokeStyle = `rgba(255,220,90,${.6 + Math.sin(gameTime * 8) * .3})`; ctx.lineWidth = 3 * SC / 2; ctx.beginPath(); ctx.arc((b.x - camX) * SC, (b.y - 18 - camY) * SC, 32 * SC, 0, 7); ctx.stroke(); }
}
function drawPickup(it) {
  const im = IMG['items/' + it.k]; if (!im) return; const s = it.k === 'coin' ? 8 : 10;
  ctx.drawImage(im, 0, 0, im.width, im.height, (it.x - s / 2 - camX) * SC, (it.y - s - it.z - camY) * SC, s * SC, s * SC);
}
function drawMap(c, s) {
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(miniBase, 0, 0, MAP_W * s, MAP_H * s);
  g.fillStyle = 'rgba(20,0,40,.6)';
  for (let y = 0; y < MAP_H; y += 2) for (let x = 0; x < MAP_W; x += 2) if (W.zone[idx(x, y)] > S.runes) g.fillRect(x * s, y * s, 2 * s, 2 * s);
  const dot = (x, y, col, r) => { g.fillStyle = '#000'; g.fillRect(x * s - r - 1, y * s - r - 1, r * 2 + 2, r * 2 + 2); g.fillStyle = col; g.fillRect(x * s - r, y * s - r, r * 2, r * 2); };
  W.lore.forEach(l => { if (!S.lore[l.id] && l.z <= S.runes) dot(l.x, l.y, '#ffe14a', s * 1.3); });
  W.chests.forEach(l => { if (!S.chests[l.id] && l.z <= S.runes) dot(l.x, l.y, '#c27a2c', s * 1.1); });
  BOSSES.forEach(b => { if (!S.boss[b.zone] && b.zone <= S.runes) dot(b.at[0], b.at[1], '#ff4b4b', s * 2); });
  dot(72, 71, '#6ad1ff', s * 1.6);
  if (P) dot(P.x / T, P.y / T, (gameTime * 3 | 0) % 2 ? '#fff' : '#ff0', s * 1.6);
}
/* ---------- animated environment layer: water ripples + swaying plants (visible tiles only) ---------- */
function drawEnvAnim(tx0, tx1, ty0, ty1) {
  const rip = imgOK('amb/ripple'), ripP = imgOK('amb/ripplepurple') || rip, pl = imgOK('amb/plant'); if (!rip && !pl) return;
  const sz = T * SC;
  for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
    const i = idx(x, y), z = W.zone[i];
    if (W.water[i]) {
      if (!rip || !ZONES[z].water || x < 1 || y < 1 || x >= MAP_W - 1 || y >= MAP_H - 1) continue;
      const h = hash2(x * 5 + 9, y * 3 + 4); if (h >= .12) continue;
      if (!(W.water[i - 1] && W.water[i + 1] && W.water[i - MAP_W] && W.water[i + MAP_W])) continue;
      ctx.drawImage(z === 5 ? ripP : rip, (((gameTime * 4 + h / .12 * 4) | 0) % 4) * T, 0, T, T, Math.round((x * T - camX) * SC), Math.round((y * T - camY) * SC), sz, sz);
    } else if (pl && z <= 1 && !W.path[i]) {
      const h = hash2(x * 11 + 5, y * 3 + 9);
      if (W.decor[i] < 0 && (W.solid[i] || W.objAt[i] >= 0 || h >= .025)) continue;
      ctx.drawImage(pl, (((gameTime * 5 + h * 40) | 0) % 4) * T, 0, T, T, Math.round((x * T - camX) * SC), Math.round((y * T - camY) * SC), sz, sz);
    }
  }
}
/* ---------- ambient particles + hit sparks + death rings ---------- */
function drawAmb() {
  for (const p of amb) {
    const a = Math.min(1, p.t / .8, (p.life - p.t) / 1.2); if (a <= 0) continue;
    const sx = Math.round((p.x - camX) * SC), sy = Math.round((p.y - camY) * SC);
    if (p.k === 'dust') { ctx.fillStyle = `rgba(236,205,150,${(a * .55).toFixed(2)})`; ctx.fillRect(sx, sy, 2 * SC, SC); continue; }
    if (p.k === 'mote') { ctx.fillStyle = `rgba(196,120,255,${(a * (.35 + .35 * Math.sin(gameTime * 9 + p.ph))).toFixed(2)})`; ctx.fillRect(sx, sy, 2 * SC, 2 * SC); continue; }
    const im = imgOK('amb/' + p.k); if (!im) continue; const n = AMB_FR[p.k], fw = im.width / n;
    const fr = (p.k === 'leaf' || p.k === 'leafpink' ? p.t * 7 + p.ph : p.k === 'snow' ? p.t * 4 + p.ph : p.t * 8 + p.ph) | 0;
    ctx.globalAlpha = a * (p.k === 'ember' ? .6 + .4 * Math.sin(gameTime * 14 + p.ph) : .9);
    ctx.drawImage(im, (fr % n) * fw, 0, fw, im.height, sx, sy, fw * SC, im.height * SC);
  }
  ctx.globalAlpha = 1;
}
function drawSparks() {
  for (const p of sparks) { ctx.globalAlpha = 1 - p.t / p.life; ctx.fillStyle = p.c; ctx.fillRect(Math.round((p.x - camX) * SC), Math.round((p.y - camY) * SC), SC, SC); }
  if (rings.length) { ctx.strokeStyle = '#fff'; ctx.lineWidth = SC; for (const r of rings) { const u = r.t / .25; ctx.globalAlpha = 1 - u; ctx.beginPath(); ctx.arc((r.x - camX) * SC, (r.y - camY) * SC, (3 + u * 11) * SC, 0, 7); ctx.stroke(); } }
  ctx.globalAlpha = 1;
}
/* ---------- atmosphere overlays: fog, light rays, cloud shadows, vignette, zone colour grade ---------- */
const ATM = { fog: 0, ray: 0, cloud: 0, g: [255, 220, 150, 0] }; let atmT = 0;
const FOG_T = [0, 0, 0, .10, .18, .25];
const GRADE_T = [[255, 220, 150, .08], [120, 200, 140, .07], [255, 170, 80, .08], [170, 210, 255, .08], [255, 120, 60, .06], [170, 80, 200, .10]];
const RAYS = [[0, 72], [78, 140], [149, 206]];
function drawAtmos(z) {
  const dt = Math.min(.1, gameTime - atmT), k = 1 - Math.exp(-dt * 1.5); atmT = gameTime;
  const nl = nightLevel(), day = nl < .3 ? 1 - nl / .3 : 0, vw = VW / SC, vh = VH / SC;
  ATM.fog += (FOG_T[z] - ATM.fog) * k; ATM.ray += ((z === 1 ? day : 0) - ATM.ray) * k; ATM.cloud += ((z === 0 || z === 2 ? day : 0) - ATM.cloud) * k;
  const gt = GRADE_T[z]; for (let j = 0; j < 4; j++) ATM.g[j] += (gt[j] - ATM.g[j]) * k;
  // (a) fog, tiled, parallax 0.5 + slow drift
  const fog = ATM.fog > .004 && imgOK('amb/fog');
  if (fog) {
    const fw = 320 * SC, fh = 180 * SC, ox = -Math.round(((camX * .5 + gameTime * 5) * SC) % fw), oy = -Math.round(((camY * .5 + gameTime * 1.5) * SC) % fh);
    ctx.globalAlpha = ATM.fog; for (let x = ox; x < VW; x += fw) for (let y = oy; y < VH; y += fh) ctx.drawImage(fog, x, y, fw, fh); ctx.globalAlpha = 1;
  }
  // (b) light rays (Whisperwood, daytime), anchored in world space
  const rays = ATM.ray > .01 && imgOK('amb/raylight');
  if (rays) {
    ctx.globalCompositeOperation = 'lighter';
    for (let cj = Math.floor((camY - 110) / 80); cj <= Math.floor((camY + vh) / 80); cj++) for (let ci = Math.floor((camX - 80) / 110); ci <= Math.floor((camX + vw) / 110); ci++) {
      const h = hash2(ci * 19 + 7, cj * 23 + 3); if (h > .35) continue;
      const r = RAYS[(h * 1000 | 0) % 3], wx = ci * 110 + hash2(ci, cj * 3 + 1) * 40, wy = cj * 80 + hash2(ci * 5 + 2, cj) * 30 - 20;
      ctx.globalAlpha = .12 * ATM.ray * (.7 + .3 * Math.sin(gameTime * .7 + h * 40));
      ctx.drawImage(rays, r[0], 0, r[1] - r[0], 102, Math.round((wx - camX) * SC), Math.round((wy - camY) * SC), (r[1] - r[0]) * SC, 102 * SC);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  // (c) cloud shadows (Greenvale / Dunes, daytime): one drifting cloud per 640x480 world cell, fading in/out as it crosses
  if (ATM.cloud > .01 && cloudCv) {
    const CW = 640, CHt = 480;
    for (let cj = Math.floor((camY - 200) / CHt); cj <= Math.floor((camY + vh + 100) / CHt); cj++) for (let ci = Math.floor((camX - 300) / CW); ci <= Math.floor((camX + vw + 300) / CW); ci++) {
      const h = hash2(ci * 13 + 3, cj * 17 + 5); if (h > .8) continue;
      const ph = ((gameTime * 3 + h * CW) % CW) / CW, wx = ci * CW + ph * CW, wy = cj * CHt + hash2(ci + 9, cj * 5) * CHt;
      ctx.globalAlpha = ATM.cloud * Math.sin(ph * Math.PI);
      ctx.drawImage(cloudCv, Math.round((wx - camX) * SC - cloudCv.width / 2), Math.round((wy - camY) * SC - cloudCv.height / 2));
    }
    ctx.globalAlpha = 1;
  }
  // (d) vignette
  if (vigCv) ctx.drawImage(vigCv, 0, 0);
  // (e) per-zone colour grade (eased between zones)
  if (ATM.g[3] > .003) { ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = `rgba(${ATM.g[0] | 0},${ATM.g[1] | 0},${ATM.g[2] | 0},${ATM.g[3].toFixed(3)})`; ctx.fillRect(0, 0, VW, VH); ctx.globalCompositeOperation = 'source-over'; }
}
let miniT = 0;
function drawMini() { if (gameTime - miniT < .3) return; miniT = gameTime; drawMap($('mini'), 1); }
// title background: a slow pan over the world
function renderTitleBg() {
  if (!W.objs.length) return;
  const t = gameTime * 8; SC = Math.max(2, SC); camX = 60 * T + Math.sin(t / 90) * 200; camY = 64 * T + Math.cos(t / 120) * 120;
  const vw = VW / SC, vh = VH / SC, c0 = Math.floor(camX / (CH * T)), c1 = Math.floor((camX + vw) / (CH * T)), r0 = Math.floor(camY / (CH * T)), r1 = Math.floor((camY + vh) / (CH * T));
  for (let cy = r0; cy <= r1; cy++) for (let cx = c0; cx <= c1; cx++) if (cx >= 0 && cy >= 0 && cx * CH < MAP_W && cy * CH < MAP_H) ctx.drawImage(getChunk(cx, cy), Math.round((cx * CH * T - camX) * SC), Math.round((cy * CH * T - camY) * SC), CH * T * SC, CH * T * SC);
  const list = [];
  for (let y = Math.floor(camY / T); y <= Math.ceil((camY + vh) / T) + 2 && y < MAP_H; y++) for (let x = Math.max(0, Math.floor(camX / T) - 1); x <= Math.ceil((camX + vw) / T) + 1 && x < MAP_W; x++) { const oi = W.objAt[idx(x, y)]; if (oi >= 0 && !W.objs[oi].gone && W.objs[oi].drawnF !== frameN) { W.objs[oi].drawnF = frameN; list.push(W.objs[oi]); } }
  list.sort((a, b) => a.y - b.y);
  const S0 = S; S = S || { chests: {}, lore: {} }; list.forEach(drawObj); S = S0;
  drawAmb();
}

/* ============================== HUD ============================== */
function updateHud() {
  hudDirty = false; if (!S || !P) return;
  $('hpbar').querySelector('i').style.width = (P.hp / S.hpMax * 100) + '%'; $('hpbar').querySelector('span').textContent = `${Math.ceil(P.hp)} / ${S.hpMax}`;
  $('xpbar').querySelector('i').style.width = (S.xp / xpNeed() * 100) + '%';
  $('lvl').textContent = `Lv ${S.level} · ${CLASSES[S.cls].name}`;
  $('gold').textContent = S.gold; $('potN').textContent = S.inv.potion;
  const z = zoneOf(P.x, P.y); $('zoneName').textContent = ZONES[z].name;
  $('runes').innerHTML = BOSSES.map(b => `<b class="${S.boss[b.zone] ? 'on' : ''}" title="${esc(b.rune)}"></b>`).join('');
  const t = S.time % DAY; $('clock').textContent = nightLevel() > .5 ? '🌙 Night' : `☀ Day ${Math.floor(S.time / DAY) + 1}` + (t > 230 && t < 255 ? ' · dusk soon' : '');
  const [qt, qd] = questText(); $('quest').innerHTML = `<b>${esc(qt)}</b>${esc(qd)}`;
  $('mats').innerHTML = ['wood', 'stone', 'fiber', 'iron', 'gold', 'crystal', 'gem'].filter(k => k === 'wood' || k === 'stone' || k === 'fiber' || S.inv[k] > 0).map(k => `<span title="${ITEMS[k]}"><img class="ic" src="${ICON(k)}">${S.inv[k]}</span>`).join('');
  const cdF = clamp(P.specT / CLASSES[S.cls].scd, 0, 1); $('specCd').style.transform = `scaleY(${cdF})`;
  const bf = $('buff'); if (P.buff > 0) { bf.textContent = `🔥 INSPIRED ${Math.ceil(P.buff)}s`; bf.classList.remove('hidden'); } else bf.classList.add('hidden');
}
$('bCraft').onclick = () => openCraft(); $('bBuild').onclick = () => toggleBuild(); $('bMap').onclick = $('mini').onclick = () => openMap(); $('bLog').onclick = () => openJournal(); $('bMenu').onclick = () => openMenu();

/* ============================== Start / title ============================== */
function gradeFromSession() {
  const g = new URLSearchParams(location.search).get('g'); if (g && (g === 'mix' || GRADES.some(x => x.id === g))) return g;
  const s = student(); const m = s && /^(\d)°/.exec(s.section || ''); if (m) { const n = +m[1]; const id = n >= 5 ? n + 'b' : n + 'm'; if (GRADES.some(x => x.id === id)) return id; }
  return 'mix';
}
function startGame(state) {
  S = state; initAudio(); started = true; paused = false;
  P = makePlayer(); builds = []; (S.builds || []).forEach(b => addBuild(b[0], b[1], b[2], b[3]));
  npcs = NPCS.map(n => ({ ...n, x: n.at[0] * T + 8, y: n.at[1] * T + 8, dir: 0, sheet: 'chars/' + n.sheet }));
  $('title').classList.add('hidden'); $('hud').classList.remove('hidden'); if (isTouch) setupTouch();
  $('face').src = `assets/face/${CLASSES[S.cls].skins[S.skin]}.png`;
  $('specIc').src = `assets/items/${S.cls === 'warrior' ? 'scrollthunder' : S.cls === 'ranger' ? 'scrollice' : 'scrollfire'}.png`;
  musicName = ''; if (!muted) playMusic(ZONES[zoneOf(P.x, P.y)].music);
  hudDirty = true; updateHud();
  if (S.quest === 0 && !S.met.elder) setTimeout(() => toast('Walk to Elder Bram (the old man) and press ' + (isTouch ? 'USE' : 'E'), true), 900);
  if (DEBUG) window.RW = { S, P: () => P, dbg: () => ({ keys, paused, buildMode, fx: fx.length, mobs: mobs.length, atkT: P.atkT, aim: aimVec() }), attack: () => attack(), step: s => { for (let i = 0; i < s * 60; i++) update(1 / 60); render(); }, keys, W, give: (k, n) => { S.inv[k] = (S.inv[k] || 0) + n; hudDirty = true; }, runes: n => { S.runes = n; for (let i = 0; i < n; i++) S.boss[i] = 1; chunks.clear(); }, tp: (x, y) => { P.x = x * T + 8; P.y = y * T + 8; }, quiz: () => openQuiz({ reason: 'Test', count: 3, zone: 0 }), boss: () => boss, night: () => { S.time = Math.floor(S.time / DAY) * DAY + 280; }, lvl: n => { S.level = n; S.hpMax = CLASSES[S.cls].hp + 10 * (n - 1); P.hp = S.hpMax; } };
}
function showNewGame() {
  let cls = 'warrior', skin = 0, grade = gradeFromSession();
  const sess = student();
  const opts = `<option value="mix">Journey: 5° básico → 3° medio (the world decides)</option>` + GRADES.map(g => `<option value="${g.id}">${g.name} (${g.band})</option>`).join('');
  $('title').classList.add('hidden'); modalClosable = false;
  openModal(`<h2>New adventure</h2>
    <h3>1. Choose your class</h3><div class="cards">${Object.entries(CLASSES).map(([k, c]) => `<div class="card" data-c="${k}"><canvas width="16" height="16" data-face="${k}"></canvas><div><div class="nm">${c.name}</div><p>${esc(c.desc)}</p><div class="skins">${c.skins.map((s, i) => `<canvas width="16" height="16" data-skin="${k}:${i}" title="Look ${i + 1}"></canvas>`).join('')}</div></div></div>`).join('')}</div>
    <h3>2. Your English level</h3><p style="font-size:14px">${sess ? `Playing as <b>${esc(sess.first_name || sess.name || '')}</b> (${esc(sess.section || '')}). Your teacher will see your answers.` : 'Tip: log in at eslteacher.cl so your teacher can see your progress.'}</p>
    <select id="ngGrade">${opts}</select>
    <p style="font-size:13px;opacity:.8">"Journey" mixes all levels: Greenvale has 5° básico English and the Hollow Citadel has 3° medio English. Choose your year to practise your own level (with some review).</p>
    ${loadSave() ? '<p style="color:#b3261e;font-size:14px">⚠ Starting a new adventure deletes your saved game on this device.</p>' : ''}
    <div class="row" style="justify-content:flex-end;margin-top:10px"><button id="ngBack">Back</button><button class="primary" id="ngGo">Start ▸</button></div>`);
  $('ngGrade').value = grade;
  const draw = () => {
    $('panel').querySelectorAll('.card').forEach(c => c.classList.toggle('sel', c.dataset.c === cls));
    $('panel').querySelectorAll('canvas[data-face]').forEach(c => { const k = c.dataset.face, g = c.getContext('2d'); g.clearRect(0, 0, 16, 16); g.drawImage(IMG['chars/' + CLASSES[k].skins[k === cls ? skin : 0]], 0, 0, 16, 16, 0, 0, 16, 16); });
    $('panel').querySelectorAll('canvas[data-skin]').forEach(c => { const [k, i] = c.dataset.skin.split(':'); const g = c.getContext('2d'); g.clearRect(0, 0, 16, 16); g.drawImage(IMG['chars/' + CLASSES[k].skins[+i]], 0, 0, 16, 16, 0, 0, 16, 16); c.classList.toggle('sel', k === cls && +i === skin); });
  };
  $('panel').querySelectorAll('.card').forEach(c => c.onclick = () => { if (cls !== c.dataset.c) { cls = c.dataset.c; skin = 0; } draw(); sfx('move', .4); });
  $('panel').querySelectorAll('canvas[data-skin]').forEach(c => c.onclick = e => { e.stopPropagation(); const [k, i] = c.dataset.skin.split(':'); cls = k; skin = +i; draw(); });
  draw();
  $('ngBack').onclick = () => { modalClosable = true; closeModal(); $('title').classList.remove('hidden'); };
  $('ngGo').onclick = () => {
    modalClosable = true; $('modal').classList.add('hidden');
    const st = newState(cls, skin, $('ngGrade').value); startGame(st); save();
    openDialog('Elder Bram', 'face/OldMan', ['Runeward! You came at last.', 'The Hollow King stole the words of Eldmere. Come and talk to me in the village: I am the old man next to your keep.'], true);
  };
}
function howTo() {
  openModal(`<button class="close small" id="mClose">✕</button><h2>How to play</h2>
    <p>🗡 <b>Fight</b> monsters (click, Space or J) and use your special (right click or K).</p>
    <p>🌲 <b>Gather</b>: walk next to trees, rocks, bushes and ores and press <b>E</b> to collect wood, stone, fibre, iron, gold and crystal.</p>
    <p>🏰 <b>Build</b> your keep (B): workbench, forge, walls, campfires, spike traps and arrow towers. At night, raiders attack your buildings!</p>
    <p>⚒ <b>Craft</b> (C) better weapons, armour and potions. Each craft has a <b>Rune Lock</b>: answer an English question.</p>
    <p>📜 <b>Read</b> the glowing Lore Stones and answer questions about the story. Open Rune Chests with a Rune Lock.</p>
    <p>👑 <b>Defeat the six Word Guardians</b>. When a Guardian raises its Word Shield, your English answers break it.</p>
    <p>🔥 3 correct answers in a row make you <b>INSPIRED</b> (+30% damage). Wrong answers come back later so you can learn them.</p>
    <p>📱 On a phone or tablet: joystick on the left, buttons on the right.</p>`);
  $('mClose').onclick = () => { closeModal(); };
}
function credits() {
  openModal(`<button class="close small" id="mClose">✕</button><h2>Credits</h2>
    <p><b>Runeward: The Silent Realm</b> · a game for eslteacher.cl.</p>
    <p>Pixel art, music and sound effects: <b>Ninja Adventure Asset Pack</b> by <b>Pixel-boy</b> and <b>AAA</b> (CC0) · pixel-boy.itch.io/ninja-adventure-asset-pack</p>
    <p>English content based on the Chilean English curriculum (Programas de Estudio de Inglés, Mineduc): 5° básico to 3° medio.</p>`);
  $('mClose').onclick = () => { closeModal(); };
}

/* ============================== Loop ============================== */
let last = performance.now();
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now; frameN++;
  try { if (started) update(dt); else { gameTime += dt; updateAmb(dt, 0); } render(); } catch (e) { console.error(e); }
  requestAnimationFrame(loop);
}
async function boot() {
  resize();
  try { muted = localStorage.getItem('runeward-muted') === '1'; } catch (e) { }
  await document.fonts.load('16px Pixel').catch(() => { });
  await loadImages(p => $('loadPct').textContent = Math.round(p * 100));
  genWorld();
  $('loadPct').parentElement.style.visibility = 'hidden';
  const sv = loadSave();
  $('tCont').classList.toggle('hidden', !sv);
  $('tCont').onclick = () => { initAudio(); startGame(loadSave()); };
  $('tNew').onclick = () => { initAudio(); playMusic('title'); showNewGame(); };
  $('tHow').onclick = () => { modalClosable = true; howTo(); };
  $('tCred').onclick = () => { modalClosable = true; credits(); };
  document.addEventListener('pointerdown', function first() { initAudio(); if (!started && !muted) playMusic('title'); document.removeEventListener('pointerdown', first); });
  addEventListener('beforeunload', save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { save(); music.pause(); } else if (!muted && started) music.play().catch(() => { }); });
  requestAnimationFrame(loop);
}
boot();
