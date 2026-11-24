// TERRA LINGUA · Juego principal (1° medio). Mundo abierto de bloques con 4 unidades en orden, party, arena y modo creativo.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { logAnswer, student, flush, openLogin } from '/assets/js/eslt-track.js';
import { crearFluido } from '/assets/js/eslt-fluido.js';
import { VoxelWorld, makeAtlas, tileCss, buildStructures, groundHeight, unitOf, B, PALETTE, BLOCK_NAMES, WORLD, TOWNS, GATES, SITES, ISLAND, CENTER, SEA, LANDMARKS, SAFE, canHarvest } from './voxel.js';
import { createCreatures, BOSSES } from './creatures.js';
import { UNITS, ALL_QUESTS, quickPool } from './content.js';
import { ITEMS, itemById, SLOTS, slotGroup, LEVELS, levelFloor, QUICK_CHAT, MATS, BLOCK_MAT, HARVEST, DROPS, STARTER_KIT } from './items.js';
import { NET, on as netOn, join, joinWorld, leave as netLeave, send, updateMe, MAX_PARTY, MAX_ARENA } from './net.js';
import { runQuest, quickQuestion, partyQuizUI, shuffle, speak } from './quiz.js';

if (!CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h) { this.rect(x, y, w, h); }; // celulares antiguos
const GAME = 'terra-lingua-1m', DB = 'https://tlihbmgokuhvppbchvrz.supabase.co', DBK = 'sb_publishable_nGgOCuUUuXKK7gx957LYhg_Jf2V4TJC';
const $ = id => document.getElementById(id), esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const CHARS = 'abcdefghijklmnopqr'.split(''), DEBUG = new URLSearchParams(location.search).has('debug');
const isTouch = matchMedia('(pointer: coarse)').matches || (DEBUG && new URLSearchParams(location.search).has('touch'));
const today = () => new Date().toLocaleDateString('en-CA');
const MAX_CREATIVE = 600, PER_UNIT = 150, MIN_TASKS = 4, TASKS_PER_UNIT = 8;

/* ========== Guardado ========== */
const me = student();
const SAVE_KEY = 'tl1m_save_' + (me ? me.sid : 'guest');
const fresh = () => ({ v: 1, name: '', char: 0, pts: 0, coins: 0, done: {}, owned: ['w_wood', 'pw_spark'], eq: { weapon: 'w_wood', power: 'pw_spark' }, gems: [], cr: { d: '', used: 0 }, build: [], time: 0, kos: 0, koDay: { d: '', n: 0 }, pos: null, seen: false, firstT: 0, mobs: 0, mobDay: { d: '', n: 0 }, bosses: {}, bossT: {}, mat: {}, kit: false, harvDay: { d: '', n: 0 } });
let S = fresh();
const fixSave = () => { for (const k of ['mobDay', 'bosses', 'bossT', 'mat', 'harvDay']) if (!S[k]) S[k] = fresh()[k]; if (!S.owned.includes('pw_spark')) S.owned.push('pw_spark'); if (!S.eq.power) S.eq.power = 'pw_spark'; };
try { const l = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (l && l.v) S = { ...fresh(), ...l }; } catch (e) { }
fixSave();
let dirty = false, lastCloud = 0;
const rpc = async (fn, args, keepalive) => { const r = await fetch(`${DB}/rest/v1/rpc/${fn}`, { method: 'POST', keepalive: !!keepalive, headers: { apikey: DBK, 'Content-Type': 'application/json' }, body: JSON.stringify(args) }); return r.ok ? r.json() : null; };
function saveLocal() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
function summaryForCloud() {
  const units = {}; for (const u of UNITS) units[u.id] = u.quests.filter(q => S.done[q.id]).length;
  return { ...S, lvl: LEVELS(S.pts), units, solved: solvedTotal(), partyDone: UNITS.filter(u => S.done[u.party.id]).length, at: Date.now() };
}
async function saveCloud(force, keepalive) {
  if (!me) return; const now = Date.now(); if (!force && now - lastCloud < 25000) return; if (!dirty && !force) return;
  lastCloud = now; dirty = false;
  try { const r = await rpc('eslt_tl_save', { p_token: me.token, p_data: summaryForCloud() }, keepalive); if (r && r.error === 'limit') dirty = true; } catch (e) { dirty = true; }
}
const touch = () => { dirty = true; saveLocal(); };
async function loadCloud() {
  if (!me) return;
  try {
    const r = await rpc('eslt_tl_load', { p_token: me.token });
    if (r && r.ok && r.data && (r.data.pts || 0) > (S.pts || 0)) { const { lvl, units, solved, partyDone, at, ...d } = r.data; S = { ...fresh(), ...d }; fixSave(); saveLocal(); }
    else if (r && r.ok && r.data) { S.done = { ...r.data.done, ...S.done }; S.owned = [...new Set([...(r.data.owned || []), ...S.owned])]; }
  } catch (e) { }
}
addEventListener('pagehide', () => { if (started) { S.pos = [P.pos.x, P.pos.y, P.pos.z]; saveLocal(); saveCloud(true, true); } });

/* ========== Progreso ========== */
const solvedIn = u => UNITS[u - 1].quests.filter(q => S.done[q.id]).length;
const solvedTotal = () => UNITS.reduce((n, u) => n + solvedIn(u.id), 0);
const unitDone = u => solvedIn(u) >= TASKS_PER_UNIT;
const unitOpen = u => u <= 1 || unitDone(u - 1);
const highestOpen = () => { let m = 1; for (let u = 2; u <= 4; u++) if (unitOpen(u)) m = u; return m; };
const creativeBudget = () => Math.min(MAX_CREATIVE, Math.round(UNITS.reduce((s, u) => s + solvedIn(u.id) / TASKS_PER_UNIT * PER_UNIT, 0)));
const creativeLeft = () => { if (S.cr.d !== today()) { S.cr = { d: today(), used: 0 }; } return Math.max(0, creativeBudget() - S.cr.used); };
const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function nextQuest() { for (const u of UNITS) { if (!unitOpen(u.id)) break; const q = u.quests.find(q => !S.done[q.id]); if (q) return { u, q, i: u.quests.indexOf(q) }; } return null; }
function gain(p, why) { const before = LEVELS(S.pts); S.pts += p; S.coins += p; if (why) float(`+${p} ${why}`); const after = LEVELS(S.pts); if (after > before) { toast(`⭐ Level ${after}!`, 'gold'); sfx('win'); S.coins += 25; updateNetMe(); } hud(); touch(); }

/* ========== Sonido ========== */
const SND = {}; let muted = false, music = null;
for (const n of ['click', 'ok', 'bad', 'hit', 'block', 'coin', 'swing', 'win']) { SND[n] = new Audio(`assets/sfx/${n}.ogg`); SND[n].preload = 'auto'; }
function sfx(n, v = .55) { if (muted) return; try { const a = SND[n].cloneNode(); a.volume = v; a.play().catch(() => { }); } catch (e) { } }
function playMusic(track) { if (!music) { music = new Audio(); music.loop = true; music.volume = .16; } const src = `assets/music/${track}.mp3`; if (music.dataset.t !== track) { music.dataset.t = track; music.src = src; } if (!muted) music.play().catch(() => { }); }
function toggleMute() { muted = !muted; $('bMute').textContent = muted ? '🔇' : '🔊'; if (music) muted ? music.pause() : music.play().catch(() => { }); }

/* ========== Escena ========== */
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
let pixelScale = Math.min(devicePixelRatio || 1, isTouch ? 1 : 1.25); renderer.setPixelRatio(pixelScale); renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene(); const SKY = new THREE.Color('#8fd6ff');
scene.background = SKY; scene.fog = new THREE.Fog(SKY, 50, 118);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, .1, 260);
scene.add(new THREE.HemisphereLight('#ffffff', '#7f8fa6', 1.5)); const sunL = new THREE.DirectionalLight('#fff4d6', 1.5); sunL.position.set(40, 80, 20); scene.add(sunL);
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
const fluido = crearFluido({ renderer, juego: 'terra-lingua', sol: () => null, maxPixelRatio: isTouch ? 1 : 1.25 });
const atlas = makeAtlas(); buildStructures();
const world = new VoxelWorld(scene, atlas.tex);
let viewR = isTouch ? 4 : 6;
if (isTouch) { scene.fog.far = 18 + viewR * 16; scene.fog.near = scene.fog.far * .45; }
// sol y nubes
const sun = new THREE.Mesh(new THREE.BoxGeometry(14, 14, 14), new THREE.MeshBasicMaterial({ color: '#fff3b0', fog: false })); scene.add(sun);
const clouds = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .85, fog: false }), 46);
{ const m = new THREE.Matrix4(); for (let i = 0; i < 46; i++) { const r = (n) => { const x = Math.sin(i * 12.9 + n * 78.2) * 43758.5; return x - Math.floor(x); }; m.makeScale(14 + r(1) * 26, 3, 10 + r(2) * 18); m.setPosition(r(3) * 640 - 64, 66 + r(4) * 5, r(5) * 640 - 64); clouds.setMatrixAt(i, m); } clouds.frustumCulled = false; scene.add(clouds); }

/* ========== Modelos ========== */
const loader = new GLTFLoader(), gltfCache = {};
const loadG = url => gltfCache[url] || (gltfCache[url] = new Promise((res, rej) => loader.load(url, res, undefined, rej)));
const norm = (o, h) => { const b = new THREE.Box3().setFromObject(o), s = b.getSize(new THREE.Vector3()); const k = h / (s.y || 1); o.scale.setScalar(k); };
const flatMat = m => { const n = new THREE.MeshLambertMaterial({ map: m.map, color: m.color }); return n; };
function boxM(w, h, d, color, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshLambertMaterial({ color })); m.position.set(x, y, z); return m; }

class Avatar {
  constructor(charIdx, name, tag) {
    this.root = new THREE.Group(); this.inner = new THREE.Group(); this.root.add(this.inner); scene.add(this.root);
    this.name = name; this.action = null; this.mixer = null; this.nodes = {}; this.att = {}; this.ready = false; this.eq = {}; this.pet = null; this.petId = '';
    this.label = makeLabel(name, tag); this.label.position.y = 2.25; this.root.add(this.label);
    this.load(charIdx);
  }
  async load(charIdx) {
    const url = `assets/chars/character-${CHARS[charIdx % 18]}.glb`, g = await loadG(url);
    if (this.dead) return; if (this.model) this.inner.remove(this.model);
    const m = SkeletonUtils.clone(g.scene); m.traverse(o => { if (o.isMesh) { o.frustumCulled = false; o.material = flatMat(o.material); } if (o.name) this.nodes[o.name] = o; });
    norm(m, 1.85); m.rotation.y = 0; this.inner.add(m); this.model = m;
    this.mixer = new THREE.AnimationMixer(m); this.clips = {}; g.animations.forEach(c => this.clips[c.name] = c);
    this.action = null; this.ready = true; this.play(this.want || 'idle'); this.applyEq(this.eq, true);
  }
  play(n, once) {
    this.want = n; if (!this.ready || !this.clips[n]) return; if (this.curN === n && !once) return;
    const a = this.mixer.clipAction(this.clips[n]); a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); a.clampWhenFinished = !!once; a.fadeIn(.14).play();
    if (this.action && this.action !== a) this.action.fadeOut(.14); this.action = a; this.curN = n;
  }
  oneShot(n, ms = 450) { if (!this.ready || this._busy) return; this._os = true; this.play(n, true); clearTimeout(this._t); this._t = setTimeout(() => { this._os = false; if (this._busy) return; this.curN = ''; this.play(this.base || 'idle'); }, ms); }
  applyEq(eq, force) {
    eq = eq || {}; const old = this.eq; this.eq = { ...eq }; if (!this.ready) return;
    const head = this.nodes.head, arm = this.nodes['arm-right'], torso = this.nodes.torso;
    const swap = (slot, parent, build) => { if (!force && old[slot] === eq[slot]) return; if (this.att[slot]) { this.att[slot].parent?.remove(this.att[slot]); this.att[slot] = null; } const it = eq[slot] && itemById(eq[slot]); if (it && parent) { this.model.updateWorldMatrix(true, true); const k = 1 / parent.getWorldScale(new THREE.Vector3()).x; const o = build(it); o.scale.multiplyScalar(k); if (slot === 'weapon') { const ab = new THREE.Box3().expandByObject(parent, false); const c = ab.getCenter(new THREE.Vector3()), hand = parent.worldToLocal(new THREE.Vector3(c.x, ab.min.y + .06, c.z)); o.position.copy(hand); o.scale.multiplyScalar(.85); }
      if (slot === 'hat' || slot === 'cape') { // se ajusta a la cabeza o torso real del modelo
        this.model.updateWorldMatrix(true, true); const box = new THREE.Box3(); (parent.isMesh ? [parent] : parent.children.filter(c => c.isMesh)).forEach(c => box.expandByObject(c, false)); if (box.isEmpty()) box.expandByObject(parent);
        const cw = box.getCenter(new THREE.Vector3()), tw = new THREE.Vector3(cw.x, box.max.y, cw.z), l = parent.worldToLocal(tw.clone()), lc = parent.worldToLocal(cw.clone());
        if (slot === 'hat') o.position.set(lc.x, l.y - .44 * k, lc.z); else { o.scale.y *= .62; o.position.set(lc.x, lc.y + .06 * k, lc.z - .02 * k); }
      }
      parent.add(o); this.att[slot] = o; } };
    swap('hat', head, buildHat); swap('cape', torso, buildCape); swap('weapon', arm, buildWeapon);
    if (force || old.pet !== eq.pet) this.setPet(eq.pet);
  }
  async setPet(id) {
    if (this.pet) { scene.remove(this.pet.o); this.pet = null; } const it = id && itemById(id); this.petId = id || ''; if (!it) return;
    const g = await loadG(`assets/pets/animal-${it.model}.glb`); if (this.petId !== id || this.dead) return;
    const o = SkeletonUtils.clone(g.scene); o.traverse(c => { if (c.isMesh) { c.frustumCulled = false; c.material = flatMat(c.material); } }); norm(o, .75);
    const w = new THREE.Group(); w.add(o); w.position.copy(this.root.position); scene.add(w); const mx = new THREE.AnimationMixer(o); const clip = g.animations.find(a => a.name === 'walk'); const idle = g.animations.find(a => a.name === 'idle');
    this.pet = { o: w, mx, walk: clip && mx.clipAction(clip), idle: idle && mx.clipAction(idle), state: '' };
  }
  tick(dt, near = true) {
    if (near && this.mixer) this.mixer.update(dt);
    if (this.pet) {
      const p = this.pet, t = this.root.position, off = new THREE.Vector3(1.3, 0, 1.1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.root.rotation.y), goal = t.clone().add(off);
      const d = p.o.position.distanceTo(goal), mv = d > .25;
      if (d > 14) p.o.position.copy(goal); else p.o.position.lerp(goal, Math.min(1, dt * 3.4));
      p.o.position.y = Math.max(world.topY(p.o.position.x, p.o.position.z), t.y - 1.2);
      if (mv) p.o.rotation.y = Math.atan2(goal.x - p.o.position.x, goal.z - p.o.position.z);
      const st = mv ? 'walk' : 'idle'; if (st !== p.state) { p.state = st; p.walk && (st === 'walk' ? p.walk.reset().fadeIn(.1).play() : p.walk.fadeOut(.1)); p.idle && (st === 'idle' ? p.idle.reset().fadeIn(.1).play() : p.idle.fadeOut(.1)); }
      if (near) p.mx.update(dt);
    }
  }
  dispose() { this.dead = true; scene.remove(this.root); if (this.pet) scene.remove(this.pet.o); this.root.traverse(o => { if (o.isSprite) { o.material.map?.dispose(); o.material.dispose(); } }); }
}
function makeLabel(text, tag) {
  const c = document.createElement('canvas'); c.width = 320; c.height = 72; const g = c.getContext('2d');
  const paint = (t, sub) => { g.clearRect(0, 0, 320, 72); g.font = '700 30px Fredoka, sans-serif'; const w = Math.min(310, g.measureText(t).width + 26); g.fillStyle = 'rgba(16,20,40,.78)'; g.beginPath(); g.roundRect(160 - w / 2, 6, w, 42, 12); g.fill(); g.fillStyle = sub || '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t, 160, 28, 300); };
  paint(text, tag); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthWrite: false, transparent: true, fog: false })); s.scale.set(2.9, .65, 1); s.userData.set = (t, col) => { paint(t, col); tx.needsUpdate = true; }; return s;
}
function buildHat(it) {
  const g = new THREE.Group(), c = it.color, y = .48;
  if (it.shape === 'cap') { g.add(boxM(.62, .16, .62, c, 0, y, 0), boxM(.5, .05, .3, c, 0, y - .06, .4)); }
  if (it.shape === 'helmet') { g.add(boxM(.66, .24, .66, c, 0, y, 0), boxM(.72, .05, .72, c, 0, y - .12, 0)); }
  if (it.shape === 'grad') { g.add(boxM(.56, .14, .56, c, 0, y - .02, 0), boxM(.86, .05, .86, c, 0, y + .08, 0), boxM(.04, .3, .04, '#ffd93b', .34, y - .06, .34)); }
  if (it.shape === 'beret') { g.add(boxM(.74, .14, .7, c, -.06, y, 0), boxM(.08, .1, .08, c, 0, y + .1, 0)); }
  if (it.shape === 'crown') { g.add(boxM(.62, .14, .62, c, 0, y, 0)); for (const [a, b] of [[-.26, -.26], [.26, -.26], [-.26, .26], [.26, .26], [0, .28]]) g.add(boxM(.1, .18, .1, c, a, y + .14, b)); g.add(boxM(.1, .1, .04, '#e8483f', 0, y, .32)); }
  return g;
}
function buildCape(it) { const g = new THREE.Group(); const m = boxM(.6, 1, .05, it.color, 0, -.12, -.2); m.rotation.x = .12; g.add(m); if (it.id === 'c_rainbow') for (let i = 0; i < 4; i++) { const b = boxM(.61, .16, .06, ['#e8483f', '#ffd93b', '#3fc463', '#3f78f0'][i], 0, .25 - i * .25, -.2 - i * .03); b.rotation.x = .12; g.add(b); } return g; }
function buildWeapon(it) {
  const g = new THREE.Group(), c = it.color;
  if (it.shape === 'sword') g.add(boxM(.09, .2, .09, '#6b4a2b', 0, 0, 0), boxM(.28, .06, .1, '#ffc933', 0, .12, 0), boxM(.12, .68, .05, c, 0, .48, 0));
  if (it.shape === 'hammer') g.add(boxM(.08, .72, .08, '#6b4a2b', 0, .26, 0), boxM(.46, .26, .26, c, 0, .68, 0));
  if (it.shape === 'bow') { for (let i = -3; i <= 3; i++) g.add(boxM(.06, .16, .06, c, Math.abs(i) * -.045 + .1, i * .13 + .2, 0)); g.add(boxM(.01, .88, .01, '#fff', -.05, .2, 0)); }
  if (it.shape === 'staff') g.add(boxM(.07, 1, .07, '#6b4a2b', 0, .36, 0), boxM(.24, .24, .24, c, 0, .96, 0));
  if (it.shape === 'pick') g.add(boxM(.08, .8, .08, '#6b4a2b', 0, .3, 0), boxM(.62, .12, .12, c, 0, .7, 0), boxM(.1, .1, .1, c, .34, .64, 0), boxM(.1, .1, .1, c, -.34, .64, 0));
  if (it.shape === 'sling') g.add(boxM(.08, .36, .08, '#6b4a2b', 0, .1, 0), boxM(.07, .26, .07, '#6b4a2b', .1, .38, 0), boxM(.07, .26, .07, '#6b4a2b', -.1, .38, 0), boxM(.22, .02, .02, '#e8483f', 0, .48, 0));
  if (it.shape === 'spear') g.add(boxM(.06, 1.25, .06, '#2d2f3a', 0, .45, 0), boxM(.08, .16, .08, '#ffc933', 0, 1.1, 0), boxM(.18, .5, .03, c, .08, 1.0, 0));
  if (it.shape === 'brush') g.add(boxM(.08, .8, .08, '#e8483f', 0, .3, 0), boxM(.14, .1, .14, '#cfd9e6', 0, .74, 0), boxM(.18, .26, .18, c, 0, .92, 0));
  if (it.shape === 'blaster') { g.add(boxM(.1, .24, .12, '#2d2f3a', 0, .05, 0), boxM(.16, .16, .55, '#f6f4ee', 0, .22, .16)); ['#e8483f', '#ffd93b', '#3fc463', '#3f78f0'].forEach((cc, i) => g.add(boxM(.17, .04, .1, cc, 0, .16 + i * .04, .36))); }
  if (it.shape === 'trident') { g.add(boxM(.06, 1.2, .06, '#ffc933', 0, .42, 0), boxM(.36, .06, .06, c, 0, 1.02, 0)); for (const x of [-.16, 0, .16]) g.add(boxM(.05, .26, .05, c, x, 1.16, 0)); }
  if (it.shape === 'launcher') g.add(boxM(.1, .22, .1, '#2d2f3a', 0, .05, 0), boxM(.2, .2, .72, c, 0, .24, .16), boxM(.22, .22, .06, '#ffd93b', 0, .24, .52));
  g.rotation.x = Math.PI / 2; g.position.set(0, -.5, .12); return g;
}

/* ========== Jugador ========== */
const P = { pos: new THREE.Vector3(CENTER + .5, 22, CENTER + 12), vel: new THREE.Vector3(), yaw: Math.PI, pitch: -.18, ground: false, hp: 100, cd: 0, pcd: 0, lastHurt: 0, zone: 'world', fly: false, dead: false, fp: false, stepT: 0, boost: 0, inv: 0 };
let avatar = null, started = false, uiLock = 0, activeQuiz = false;
const keys = {}, mv = { x: 0, z: 0, jump: false, down: false };
const hasTool = k => S.owned.map(itemById).filter(Boolean).find(i => i[k]);
const speedMul = () => hasTool('speed')?.speed || 1, jumpMul = () => hasTool('jump')?.jump || 1;
const anyUI = () => uiLock > 0 || activeQuiz || !$('quiz').classList.contains('hidden') || !$('quick').classList.contains('hidden') || !$('pquiz').classList.contains('hidden') || document.querySelector('.modal:not(.hidden)');
function lockPointer() { try { const r = canvas.requestPointerLock?.(); r?.catch?.(() => { }); } catch (e) { } }
function openUI() { if (document.pointerLockElement) document.exitPointerLock(); }

addEventListener('keydown', e => {
  if (!started || e.target.matches?.('input,textarea,select')) return;
  if (e.code === 'Escape') { closeModals(); return; }
  if (anyUI()) return;
  keys[e.code] = true;
  if (e.code === 'Space') e.preventDefault();
  if (e.code === 'KeyE') interact(); if (e.code === 'KeyR') castPower(); if (e.code === 'KeyV') P.fp = !P.fp; if (e.code === 'KeyB') openBag(); if (e.code === 'KeyJ' || e.code === 'KeyQ') openLog(); if (e.code === 'KeyM') openMap(); if (e.code === 'KeyP') openParty(); if (e.code === 'KeyT') openChat();
  if (e.code === 'KeyF' && P.zone === 'creative') { P.fly = !P.fly; toast(P.fly ? 'Flying ON' : 'Flying OFF'); }
  if (e.code.startsWith('Digit') && P.zone === 'creative') { const n = +e.code.slice(5); if (n >= 1) selectHot(n - 1); }
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
canvas.addEventListener('click', () => { if (started && !isTouch && !anyUI() && !document.pointerLockElement) lockPointer(); });
document.addEventListener('pointerlockchange', () => $('lockHint').classList.toggle('hidden', !!document.pointerLockElement || !started || isTouch || !!anyUI()));
document.addEventListener('mousemove', e => { if (document.pointerLockElement === canvas) { P.yaw -= e.movementX * .0024; P.pitch = Math.max(-1.45, Math.min(1.2, P.pitch - e.movementY * .0024)); } });
canvas.addEventListener('mousedown', e => { if (!started || anyUI() || document.pointerLockElement !== canvas) return; if (e.button === 0) primary(); if (e.button === 2) secondary(); });
canvas.addEventListener('contextmenu', e => e.preventDefault());
addEventListener('wheel', e => { if (P.zone === 'creative' && !anyUI()) selectHot((hotSel + (e.deltaY > 0 ? 1 : -1) + HOT.length) % HOT.length); }, { passive: true });

/* Controles táctiles: joystick flotante (aparece donde pones el pulgar izquierdo) y mirada con el lado derecho */
let hitHeld = false;
if (isTouch) {
  document.body.classList.add('touch');
  const stick = $('stick'), knob = $('knob'); let sid = null, sx = 0, sy = 0, lookId = null, lx = 0, ly = 0;
  const closeMenu = () => document.body.classList.remove('menuopen', 'pal');
  canvas.addEventListener('touchstart', e => {
    e.preventDefault(); closeMenu();
    for (const t of e.changedTouches) {
      if (t.clientX < innerWidth * .45 && sid === null) { sid = t.identifier; sx = t.clientX; sy = t.clientY; stick.style.left = sx + 'px'; stick.style.top = sy + 'px'; knob.style.transform = ''; stick.classList.add('on'); }
      else if (lookId === null) { lookId = t.identifier; lx = t.clientX; ly = t.clientY; }
    }
  }, { passive: false });
  addEventListener('touchmove', e => {
    for (const t of e.changedTouches) {
      if (t.identifier === sid) { let dx = t.clientX - sx, dy = t.clientY - sy; const l = Math.hypot(dx, dy), m = 44; if (l > m) { dx *= m / l; dy *= m / l; } knob.style.transform = `translate(${dx}px,${dy}px)`; const dead = l < 5 ? 0 : 1; mv.x = dead * dx / m; mv.z = dead * dy / m; }
      if (t.identifier === lookId) { P.yaw -= (t.clientX - lx) * .0058; P.pitch = Math.max(-1.45, Math.min(1.2, P.pitch - (t.clientY - ly) * .0048)); lx = t.clientX; ly = t.clientY; }
    }
  }, { passive: true });
  const end = e => { for (const t of e.changedTouches) { if (t.identifier === sid) { sid = null; mv.x = mv.z = 0; stick.classList.remove('on'); } if (t.identifier === lookId) lookId = null; } };
  addEventListener('touchend', end); addEventListener('touchcancel', end);
  const hold = (id, on, off) => { const b = $(id); b.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); b.classList.add('down'); on(); }, { passive: false }); const up = e => { e.preventDefault(); b.classList.remove('down'); off && off(); }; b.addEventListener('touchend', up, { passive: false }); b.addEventListener('touchcancel', up, { passive: false }); };
  hold('tJump', () => mv.jump = true, () => mv.jump = false); hold('tDown', () => mv.down = true, () => mv.down = false);
  hold('tHit', () => { hitHeld = true; primary(); }, () => hitHeld = false); hold('tPlace', () => secondary()); hold('tPow', () => castPower());
  $('prompt').addEventListener('click', () => interact());
  $('bMenu').addEventListener('click', () => { sfx('click'); document.body.classList.remove('pal'); document.body.classList.toggle('menuopen'); });
  document.querySelector('.tools').addEventListener('click', e => { if (e.target.closest('button')) closeMenu(); });
  $('bBlock').addEventListener('click', () => { document.body.classList.remove('menuopen'); document.body.classList.toggle('pal'); });
  $('bFly').addEventListener('click', () => { P.fly = !P.fly; $('bFly').classList.toggle('on', P.fly); document.body.classList.toggle('flying', P.fly); });
  $('objBox').addEventListener('click', () => openLog());
}

function primary() { if (P.zone === 'creative') breakBlock(); else attack(); }
function secondary() { if (P.zone === 'creative') placeBlock(); else castPower(); }

function updatePlayer(dt) {
  if (P.dead) return;
  let fx = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + mv.x, fz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + mv.z;
  if (anyUI()) fx = fz = 0;
  const len = Math.hypot(fx, fz); if (len > 1) { fx /= len; fz /= len; }
  const sprint = (keys.ShiftLeft || (isTouch && Math.hypot(mv.x, mv.z) > .93)) && !P.fly, inWater = world.waterAt(P.pos.x, P.pos.y + .6, P.pos.z);
  let sp = (sprint ? 8.4 : 5.8) * speedMul(); if (inWater) sp *= .6; if (P.fly) sp = 11; if (P.boost > 0) sp *= 1.15;
  const s = Math.sin(P.yaw), c = Math.cos(P.yaw), wx = (fx * c + fz * s) * sp, wz = (-fx * s + fz * c) * sp;
  P.vel.x += (wx - P.vel.x) * Math.min(1, dt * 14); P.vel.z += (wz - P.vel.z) * Math.min(1, dt * 14);
  const jump = (keys.Space || mv.jump) && !anyUI(), down = (keys.ShiftLeft && P.fly) || mv.down;
  if (P.fly) P.vel.y = jump ? 8 : down ? -8 : 0;
  else if (inWater) { P.vel.y = jump ? 4 : Math.max(P.vel.y - 12 * dt, -2.2); }
  else {
    if (jump && P.ground) { P.vel.y = 9.2 * jumpMul(); P.ground = false; }
    const gliding = jump && !P.ground && P.vel.y < 0 && hasTool('glide');
    P.vel.y -= (gliding ? 5 : 26) * dt; P.vel.y = Math.max(P.vel.y, gliding ? -2.6 : -36);
    P.glide = !!gliding;
  }
  const before = { x: P.pos.x, z: P.pos.z };
  P.ground = world.move(P.pos, P.vel, Math.min(dt, .05), .3, 1.78, P.ground);
  P.pos.x = Math.max(1, Math.min(WORLD - 2, P.pos.x)); P.pos.z = Math.max(1, Math.min(WORLD - 2, P.pos.z));
  if (P.zone === 'world') {
    const u = unitOf(P.pos.x, P.pos.z);
    if (u && !unitOpen(u)) { P.pos.x = before.x; P.pos.z = before.z; P.vel.x = P.vel.z = 0; const n = Date.now(); if (n - (P.lockT || 0) > 2600) { P.lockT = n; toast(`🔒 ${UNITS[u - 1].place} is locked. Complete all 8 missions of Unit ${u - 1} first.`, 'warn'); sfx('bad', .3); } }
  }
  if (P.pos.y < -6) { if (P.zone === 'arena') { koSelf(null); } else respawn(); }
  if (P.zone === 'arena' || P.zone === 'creative') { const c2 = ISLAND[P.zone]; if (P.pos.y < c2.y - 16 && P.zone === 'creative') teleport(c2.x + .5, c2.y + 2, c2.z + 5); if (P.pos.y < c2.y - 16 && P.zone === 'arena') koSelf(null); }
  const speed = Math.hypot(P.vel.x, P.vel.z);
  if (avatar) { avatar.root.position.copy(P.pos); if (speed > .4 && !P.fp) avatar.root.rotation.y = lerpAngle(avatar.root.rotation.y, Math.atan2(P.vel.x, P.vel.z), Math.min(1, dt * 11)); const base = speed > 7.6 ? 'sprint' : speed > .6 ? 'walk' : (P.zone === 'arena' ? 'holding-right' : 'idle'); avatar.base = base; if (avatar.curN !== base && !avatar._busy && !avatar._os) avatar.play(base); if (P.fp) avatar.inner.visible = false; avatar.label.visible = false; }
}
const lerpAngle = (a, b, t) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return a + d * t; };
const camTmp = new THREE.Vector3(), camDir = new THREE.Vector3();
function updateCamera() {
  const eye = camTmp.set(P.pos.x, P.pos.y + 1.6, P.pos.z);
  camDir.set(-Math.sin(P.yaw) * Math.cos(P.pitch), Math.sin(P.pitch), -Math.cos(P.yaw) * Math.cos(P.pitch));
  if (P.fp) { camera.position.copy(eye); camera.lookAt(eye.x + camDir.x, eye.y + camDir.y, eye.z + camDir.z); return; }
  let dist = 5.2; const back = camDir.clone().multiplyScalar(-1), hit = world.raycast(eye, back, dist); if (hit) dist = Math.max(.6, hit.t - .25);
  if (P.zone !== 'world') { const side = new THREE.Vector3(Math.cos(P.yaw), 0, -Math.sin(P.yaw)).multiplyScalar(.85); const t = eye.clone().add(side); if (!world.solidAt(t.x, t.y, t.z)) eye.copy(t); }
  camera.position.copy(eye).addScaledVector(back, dist); camera.lookAt(eye); if (avatar) avatar.inner.visible = dist > 1.25;
}
function teleport(x, y, z) { P.pos.set(x, y, z); P.vel.set(0, 0, 0); P.ground = false; world.update(x, z, 2, 30); if (avatar) avatar.root.position.copy(P.pos); }
function respawn() { const u = unitOf(P.pos.x, P.pos.z); if (u && unitOpen(u)) { const [x, z] = TOWNS[u]; teleport(x + .5, world.topY(x + 3, z) + 1, z + 3.5); } else teleport(CENTER + .5, 23, CENTER + 12); toast('You are back on land!'); }

/* ========== NPCs ========== */
const NPCS = [];
function addNpc(cfg) { const a = new Avatar(cfg.char, cfg.name, cfg.tagColor || '#ffe27a'); a.root.position.set(cfg.x + .5, groundHeight(cfg.x, cfg.z) + 1, cfg.z + .5); a.root.rotation.y = cfg.ry || 0; const m = makeMarker(); m.position.y = 2.95; a.root.add(m); const n = { ...cfg, a, m }; NPCS.push(n); return n; }
function makeMarker() { const c = document.createElement('canvas'); c.width = c.height = 64; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false })); s.scale.set(.85, .85, 1); s.userData.draw = (txt, bg) => { const g = c.getContext('2d'); g.clearRect(0, 0, 64, 64); g.fillStyle = bg; g.beginPath(); g.roundRect(6, 6, 52, 52, 12); g.fill(); g.fillStyle = '#fff'; g.font = '700 34px Fredoka,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 32, 35); t.needsUpdate = true; }; return s; }
function refreshMarkers() {
  const nx = nextQuest();
  for (const n of NPCS) {
    let txt = '', bg = '#ff8a1f';
    if (n.quest) { if (S.done[n.quest.id]) { txt = '✓'; bg = '#2ea64f'; } else if (!unitOpen(n.u)) { txt = '🔒'; bg = '#6b7280'; } else if (nx && nx.q.id === n.quest.id) { txt = '!'; bg = '#ff3d71'; } else { txt = '?'; bg = '#3f78f0'; } }
    else if (n.party) { txt = S.done[n.party.id] ? '✓' : '👥'; bg = S.done[n.party.id] ? '#2ea64f' : '#9a55e0'; }
    else if (n.kind === 'shop') { txt = '$'; bg = '#e0a100'; } else if (n.kind === 'guide') { txt = 'i'; bg = '#2fb5d6'; } else if (n.kind === 'arena') { txt = '⚔'; bg = '#e8483f'; } else if (n.kind === 'creative') { txt = '🧱'; bg = '#22b8a6'; }
    n.m.userData.draw(txt, bg);
  }
}
function spawnNpcs() {
  let ci = 1;
  for (const u of UNITS) u.quests.forEach((q, i) => { const s = SITES[u.id][i]; addNpc({ name: q.npc, char: ci++ % 18, x: s.x, z: s.z - 1, quest: q, u: u.id, kind: 'quest', ry: Math.atan2(TOWNS[u.id][0] - s.x, TOWNS[u.id][1] - s.z) }); });
  for (const u of UNITS) { const [x, z] = TOWNS[u.id]; addNpc({ name: 'Party Beacon', char: 7 + u.id, x: x + 4, z: z + 4, party: u.party, u: u.id, kind: 'party', tagColor: '#e3c9ff' }); }
  addNpc({ name: 'Profe Block', char: 0, x: CENTER + 5, z: CENTER + 8, kind: 'guide', ry: Math.PI, tagColor: '#9beaff' });
  addNpc({ name: 'Nico the Merchant', char: 15, x: CENTER + 19, z: CENTER, kind: 'shop', ry: -Math.PI / 2 });
  addNpc({ name: 'Arena Portal', char: 12, x: CENTER + 5, z: CENTER - 21, kind: 'arena', ry: 0, tagColor: '#ffb4ae' });
  addNpc({ name: 'Creative Portal', char: 9, x: CENTER + 5, z: CENTER + 21, kind: 'creative', ry: Math.PI, tagColor: '#a5f3e8' });
  refreshMarkers();
}

/* ========== Puertas, cofres, baliza ========== */
const gateMeshes = {};
function buildGates() {
  for (const u of [1, 2, 3, 4]) {
    const [x, z] = GATES[u], c = new THREE.Color(UNITS[u - 1].color);
    const m = new THREE.Mesh(new THREE.BoxGeometry(11, 7, .35), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .55, side: THREE.DoubleSide, depthWrite: false }));
    m.position.set(x + .5, 24.5, z + .5); m.rotation.y = (u === 1 || u === 3) ? Math.PI / 4 * 3 : Math.PI / 4; scene.add(m);
    const lab = makeLabel(`Unit ${u} · ${UNITS[u - 1].place}`, '#fff'); lab.scale.set(7, 1.6, 1); lab.position.set(x + .5, 29.6, z + .5); scene.add(lab);
    gateMeshes[u] = m;
  }
  refreshGates();
}
function refreshGates() { for (const u of [1, 2, 3, 4]) gateMeshes[u].visible = !unitOpen(u); }
const GEMS = [];
function buildGems() {
  const geo = new THREE.BoxGeometry(.95, .75, .7);
  for (const u of [1, 2, 3, 4]) {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + u * 1.3, r = 26 + (i * 37) % 62, [cx, cz] = TOWNS[u], x = Math.round(cx + Math.cos(a) * r), z = Math.round(cz + Math.sin(a) * r), id = `g${u}_${i}`;
      if (S.gems.includes(id) || groundHeight(x, z) <= SEA) continue;
      const g = new THREE.Group(), box = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: '#b9772f' })), lid = boxM(1, .2, .75, '#ffc933', 0, .42, 0), lock = boxM(.16, .2, .05, '#fff3b0', 0, .18, .37);
      g.add(box, lid, lock); g.position.set(x + .5, groundHeight(x, z) + 1.4, z + .5); scene.add(g); GEMS.push({ id, u, g, x: x + .5, y: groundHeight(x, z) + 1, z: z + .5 });
    }
  }
  // cofres dorados en los lugares para explorar (arriba de torres, en barcos, en ruinas…)
  for (const L of LANDMARKS) {
    const id = `L${L.u}_${L.i}`; if (S.gems.includes(id) || !L.chest) continue; const c = L.chest;
    const g = new THREE.Group(), box = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: '#8a4fd8' })), lid = boxM(1, .2, .75, '#ffd93b', 0, .42, 0), lock = boxM(.16, .2, .05, '#fff3b0', 0, .18, .37);
    g.add(box, lid, lock); g.position.set(c.x + .5, c.y + .4, c.z + .5); scene.add(g); GEMS.push({ id, u: L.u, g, x: c.x + .5, y: c.y, z: c.z + .5, big: true });
  }
}
const beam = new THREE.Mesh(new THREE.BoxGeometry(.8, 70, .8), new THREE.MeshBasicMaterial({ color: '#ffe27a', transparent: true, opacity: .35, depthWrite: false, fog: false })); beam.visible = false; scene.add(beam);
function updateBeam() { const n = nextQuest(); if (!n || !hasTool('compass') || P.zone !== 'world') { beam.visible = false; return; } const s = SITES[n.u.id][n.i]; beam.visible = true; beam.position.set(s.x + .5, 50, s.z - .5); }

/* ========== Interacción ========== */
let nearest = null;
function findNearest() {
  nearest = null; let best = 4.2;
  if (P.zone === 'world') {
    for (const n of NPCS) { const d = Math.hypot(n.a.root.position.x - P.pos.x, n.a.root.position.z - P.pos.z); if (d < best && Math.abs(n.a.root.position.y - P.pos.y) < 4) { best = d; nearest = { t: 'npc', n }; } }
    for (const g of GEMS) { const d = Math.hypot(g.x - P.pos.x, g.z - P.pos.z); if (d < Math.min(best, 3) && Math.abs(g.y - P.pos.y) < 2.5) { best = d; nearest = { t: 'gem', g }; } }
  } else if (P.zone === 'arena' && cube.visible && cube.position.distanceTo(P.pos) < 3.2) nearest = { t: 'cube' };
  const hint = $('prompt');
  if (nearest && !anyUI()) { hint.classList.remove('hidden'); hint.innerHTML = `${isTouch ? '✋' : '<kbd>E</kbd>'} ${nearest.t === 'gem' ? 'Open chest' : nearest.t === 'cube' ? 'Power Cube' : 'Talk to ' + esc(nearest.n.name)}`; }
  else hint.classList.add('hidden');
  
}
function interact() {
  if (anyUI() || !nearest) return; openUI();
  if (nearest.t === 'gem') return openGem(nearest.g);
  if (nearest.t === 'cube') return useCube();
  const n = nearest.n;
  if (n.kind === 'quest') return talkQuest(n);
  if (n.kind === 'party') return talkParty(n);
  if (n.kind === 'shop') return openBag(true);
  if (n.kind === 'guide') return talkGuide();
  if (n.kind === 'arena') return talkArena();
  if (n.kind === 'creative') return talkCreative();
}
function dialog(title, who, html, buttons) {
  const m = $('dialog'); $('dTitle').textContent = title; $('dWho').textContent = who; $('dBody').innerHTML = html;
  const row = $('dBtns'); row.innerHTML = ''; buttons.forEach(b => { const e = document.createElement('button'); e.type = 'button'; e.className = 'btn ' + (b.c || 'green'); e.textContent = b.t; e.disabled = !!b.off; e.onclick = () => { sfx('click'); m.classList.add('hidden'); b.f && b.f(); }; row.appendChild(e); });
  m.classList.remove('hidden'); openUI(); row.firstChild?.focus();
}
function talkGuide() {
  const n = nextQuest();
  dialog('Welcome to Terra Lingua!', 'Profe Block', `<p>Four lands need your English. Complete the <b>8 missions</b> of each unit to open the next gate.</p>
  <p>${n ? `Next: <b>${esc(n.q.title)}</b> with ${esc(n.q.npc)} in ${esc(n.u.place)}.` : '🏆 You completed every mission!'}</p>
  <p class="small">If you answer wrong, try again. On the <b>third try</b> you get feedback.<br>Earn points to buy hats, pets, tools and weapons. Solve ${MIN_TASKS} missions to unlock Creative Mode.</p>`, [{ t: 'Got it!' }]);
}
function talkQuest(n) {
  const q = n.quest, u = UNITS[n.u - 1], done = S.done[q.id];
  if (!unitOpen(n.u)) return dialog(q.title, q.npc, `<p>Complete Unit ${n.u - 1} first.</p>`, [{ t: 'OK' }]);
  n.a.root.rotation.y = Math.atan2(P.pos.x - n.a.root.position.x, P.pos.z - n.a.root.position.z); n.a.oneShot('emote-yes', 900);
  speak(q.intro, .95);
  dialog(`${q.icon} ${q.title}`, `${q.npc} · ${q.role}`, `<p>${esc(q.intro)}</p><p class="small">Unit ${u.id}: ${esc(u.name)} · ${q.items.length} exercises${done ? ` · Completed ${'⭐'.repeat(done.s || 1)} (practice gives fewer points)` : ''}</p>`,
    [{ t: done ? 'Practice again' : 'Start mission', f: () => startQuest(q, n) }, { t: 'Later', c: 'ghost', f: () => { try { speechSynthesis.cancel(); } catch (e) { } } }]);
}
function log(q, it, chosen, ok, ms, act) {
  const right = it.t === 'type' ? it.a[0] : it.t === 'order' ? it.s : it.t === 'speak' && chosen !== it.o[0] && !it.o.includes(chosen) ? it.say : it.o[0];
  logAnswer(GAME, { activity: act || `U${q.unit || 0} ${q.title}`, item: { q: it.t === 'speak' ? `Say: ${it.say}` : (it.t === 'order' ? `Order: ${it.s}` : it.q), k: q.k }, chosen, right, ok, ms });
}
function startQuest(q, n) {
  activeQuiz = true; try { speechSynthesis.cancel(); } catch (e) { } const again = !!S.done[q.id]; let earned = 0;
  runQuest({
    title: `${q.icon} ${q.title}`, npc: q.npc, text: q.text, items: shuffle(q.items).map(i => i), k: q.k,
    onLog: (it, v, ok, ms) => log({ ...q, unit: n.u }, it, v, ok, ms),
    onRight: p => { sfx('ok'); earned += again ? Math.ceil(p / 4) : p; },
    onWrong: () => sfx('bad', .35),
    onDone: r => {
      activeQuiz = false; if (!r.done) return;
      const first = !S.done[q.id], prevS = S.done[q.id]?.s || 0;
      S.done[q.id] = { s: Math.max(prevS, r.stars), f: r.firstTry, n: r.total, at: Date.now() };
      gain(earned + (first ? 30 : 0), 'points'); sfx('win');
      if (first) celebrate(n.u, q);
      refreshMarkers(); refreshGates(); hud(); touch(); saveCloud(true);
      dialog('Mission complete!', q.npc, `<div class="stars">${'⭐'.repeat(r.stars)}</div><p>First-try answers: <b>${r.firstTry} of ${r.total}</b></p><p>You earned <b>${earned + (first ? 30 : 0)} points</b>.</p>${unlockHint(n.u)}`, [{ t: 'Continue' }]);
    }
  });
}
function unlockHint(u) {
  const out = []; if (unitDone(u) && u < 4) out.push(`🔓 <b>${esc(UNITS[u].place)}</b> is now open!`); if (solvedTotal() >= MIN_TASKS) out.push(`🧱 Creative Mode: <b>${fmt(creativeLeft())}</b> available today.`);
  return out.length ? `<p>${out.join('<br>')}</p>` : '';
}
function celebrate(u, q) {
  if (unitDone(u) && UNITS[u - 1].quests[UNITS[u - 1].quests.length - 1] && !S['cel' + u]) { S['cel' + u] = 1; S.coins += 60; toast(`🏆 Unit ${u} complete! +60 coins`, 'gold'); confetti(); }
  if (solvedTotal() === MIN_TASKS) toast('🧱 Creative Mode unlocked!', 'gold');
}
function confetti() { const box = $('fx'); for (let i = 0; i < 46; i++) { const d = document.createElement('i'); d.style.cssText = `left:${Math.random() * 100}%;background:hsl(${Math.random() * 360} 90% 60%);animation-delay:${Math.random() * .5}s`; box.appendChild(d); setTimeout(() => d.remove(), 2400); } }
async function openGem(g) {
  const pool = quickPool(highestOpen()), it = pool[Math.floor(Math.random() * pool.length)]; activeQuiz = true;
  const ok = await quickQuestion(it, '🎁 Treasure chest', (x, v, o, ms) => log({ title: 'Treasure chest', unit: x.unit, k: x.k }, x, v, o, ms, `U${x.unit} Treasure chest`)); activeQuiz = false;
  if (ok) { sfx('coin'); gain(g.big ? 40 : 20, g.big ? 'treasure' : 'chest'); if (g.big) { S.coins += 40; S.mat.gold = (S.mat.gold || 0) + 4; S.mat.crystal = (S.mat.crystal || 0) + 3; toast('💜 Explorer treasure! +40 coins, +4 🏅, +3 💎', 'gold'); } else { const ks = ['wood', 'stone', 'paint', 'clay', 'sand'], k = ks[Math.floor(Math.random() * ks.length)]; S.mat[k] = (S.mat[k] || 0) + 6; toast(`+6 ${MATS[k].icon} ${MATS[k].name}`); } S.gems.push(g.id); scene.remove(g.g); GEMS.splice(GEMS.indexOf(g), 1); touch(); } else { sfx('bad', .35); toast('The chest stays locked. Try again later!', 'warn'); }
}

/* ========== Tienda / mochila ========== */
let bagTab = 'all';
function openBag(atShop) {
  openUI(); $('bag').classList.remove('hidden'); $('bagTabs').innerHTML = SLOTS.map(([k, l]) => `<button type="button" class="tab ${k === bagTab ? 'on' : ''}" data-k="${k}">${l}</button>`).join('');
  $('bagTabs').querySelectorAll('button').forEach(b => b.onclick = () => { bagTab = b.dataset.k; openBag(); });
  $('bagCoins').textContent = S.coins;
  if (bagTab === 'mat') { $('bagGrid').innerHTML = Object.entries(MATS).map(([k, m]) => `<div class="item ${(S.mat[k] || 0) ? 'has' : ''}"><span class="ic">${m.icon}</span><b>${esc(m.name)}: ${S.mat[k] || 0}</b><small>${esc(m.where)}</small></div>`).join('') + `<p class="small" style="grid-column:1/-1">Hit trees, rocks, flowers, cactus, crystals and beach sand to collect them. Creatures drop them too. Use them to build in Creative Mode.</p>`; return; }
  $('bagGrid').innerHTML = ITEMS.filter(i => bagTab === 'all' || slotGroup(i.slot) === bagTab).map(i => {
    const has = S.owned.includes(i.id), eq = S.eq[i.slot] === i.id, locked = i.need && !unitDone(i.need), auto = i.slot.startsWith('tool');
    const btn = has ? (auto ? '<span class="own">Active</span>' : eq && (i.slot === 'weapon' || i.slot === 'power') ? '<span class="own">✔ Equipped</span>' : `<button type="button" class="btn small ${eq ? 'ghost' : 'green'}" data-eq="${i.id}">${eq ? 'Take off' : 'Equip'}</button>`) : locked ? `<span class="own">🔒 Unit ${i.need}</span>` : `<button type="button" class="btn small gold" data-buy="${i.id}" ${S.coins < i.cost ? 'disabled' : ''}>🪙 ${i.cost}</button>`;
    const stat = i.slot === 'power' ? `${i.dmg} dmg · ${i.desc}` : i.dmg ? `${i.dmg} dmg · ${i.ranged ? 'ranged' : i.sweep ? 'hits several' : 'melee'}${i.splash ? ' · splash' : ''}` : (i.desc || ({ hat: 'Accessory', cape: 'Cape', pet: 'Follows you' })[i.slot] || '');
    const where = i.world && (i.slot === 'weapon' || i.slot === 'power') ? `<small class="wld">${esc(UNITS[i.world - 1].place)}</small>` : '';
    return `<div class="item ${has ? 'has' : ''} ${locked && !has ? 'lock' : ''}"><span class="ic">${i.icon}</span><b>${esc(i.name)}</b>${where}<small>${esc(stat)}</small>${btn}</div>`;
  }).join('');
  $('bagGrid').querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const it = itemById(b.dataset.buy); if (S.coins < it.cost) return; S.coins -= it.cost; S.owned.push(it.id); if (!it.slot.startsWith('tool')) S.eq[it.slot] = it.id; sfx('coin'); toast(`${it.icon} ${it.name}!`, 'gold'); applyEquip(); hud(); touch(); openBag(); });
  $('bagGrid').querySelectorAll('[data-eq]').forEach(b => b.onclick = () => { const it = itemById(b.dataset.eq); if (S.eq[it.slot] === it.id) { if (it.slot !== 'weapon' && it.slot !== 'power') delete S.eq[it.slot]; } else S.eq[it.slot] = it.id; sfx('click'); applyEquip(); touch(); openBag(); });
}
function applyEquip() { avatar?.applyEq(S.eq); updateNetMe(); updateBeam(); }

/* ========== Registro de misiones y mapa ========== */
function openLog() {
  openUI(); $('log').classList.remove('hidden');
  $('logBody').innerHTML = UNITS.map(u => {
    const n = solvedIn(u.id), open = unitOpen(u.id);
    return `<section class="logu" style="--c:${u.color}"><h3>Unit ${u.id}: ${esc(u.name)} <span>${open ? `${n}/${TASKS_PER_UNIT}` : '🔒'}</span></h3><div class="pbar"><i style="width:${n / TASKS_PER_UNIT * 100}%"></i></div>
    <div class="qgrid">${u.quests.map(q => `<span class="${S.done[q.id] ? 'ok' : ''}">${q.icon} ${esc(q.title)} ${S.done[q.id] ? '⭐'.repeat(S.done[q.id].s) : ''}</span>`).join('')}<span class="${S.done[u.party.id] ? 'ok' : 'pty'}">👥 ${esc(u.party.title)}${S.done[u.party.id] ? ' ✓' : ' (party)'}</span></div></section>`;
  }).join('') + `<p class="small">🗺️ Explorer treasures: <b>${LANDMARKS.filter(L => S.gems.includes(`L${L.u}_${L.i}`)).length}/${LANDMARKS.length}</b> · ⚔️ Creatures defeated: <b>${S.mobs || 0}</b> · 👑 Bosses: <b>${[1, 2, 3, 4].filter(u => S.bosses[u]).map(u => BOSSES[u].name).join(', ') || 'none yet'}</b></p><p class="small">Creative Mode: ${fmt(creativeBudget())} of 10:00 earned · ${fmt(creativeLeft())} left today.</p>`;
}
const mapBase = document.createElement('canvas'); let mapReady = false;
function paintMap() {
  mapBase.width = mapBase.height = 256; const g = mapBase.getContext('2d'), im = g.createImageData(256, 256);
  for (let x = 0; x < 256; x++) for (let z = 0; z < 256; z++) {
    const wx = x * 2, wz = z * 2, h = groundHeight(wx, wz), u = unitOf(wx, wz); let c;
    if (h < SEA) c = [63, 157, 240]; else if (h > 36) c = [235, 240, 248]; else if (u === 0) c = [226, 214, 180]; else if (u === 3) c = [214 + h % 5 * 3, 122, 74]; else if (u === 2) c = [52, 142 + h % 4 * 4, 90]; else if (u === 4 && h <= SEA + 1) c = [240, 216, 144]; else c = [110 + h, 200, 80];
    const k = .82 + h / 110, i = (z * 256 + x) * 4; im.data[i] = c[0] * k; im.data[i + 1] = c[1] * k; im.data[i + 2] = c[2] * k; im.data[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); mapReady = true;
}
function drawMap(ctx, sz, full) {
  ctx.imageSmoothingEnabled = false; const scale = sz / WORLD, px = v => v * scale;
  if (full) ctx.drawImage(mapBase, 0, 0, sz, sz);
  else { const R = 58; ctx.clearRect(0, 0, sz, sz); ctx.drawImage(mapBase, (P.pos.x - R) / 2, (P.pos.z - R) / 2, R, R, 0, 0, sz, sz); }
  const T = full ? (x, z) => [px(x), px(z)] : (x, z) => [(x - P.pos.x + 58) / 116 * sz, (z - P.pos.z + 58) / 116 * sz];
  for (const u of [1, 2, 3, 4]) if (!unitOpen(u)) { if (full) { ctx.fillStyle = 'rgba(15,18,35,.55)'; ctx.fillRect(u === 1 || u === 4 ? 0 : sz / 2, u <= 2 ? 0 : sz / 2, sz / 2, sz / 2); } }
  for (const n of NPCS) { const [x, y] = T(n.a.root.position.x, n.a.root.position.z); if (!full && (x < 0 || y < 0 || x > sz || y > sz)) continue; if (n.u && !unitOpen(n.u)) continue; ctx.fillStyle = n.quest ? (S.done[n.quest.id] ? '#2ea64f' : '#ff3d71') : n.party ? '#9a55e0' : '#ffd93b'; ctx.fillRect(x - 3, y - 3, 6, 6); }
  for (const L of LANDMARKS) { if (!unitOpen(L.u)) continue; const [x, y] = T(L.x, L.z); if (!full && (x < 0 || y < 0 || x > sz || y > sz)) continue; const k = full ? 5 : 4; ctx.fillStyle = L.boss ? '#ff3d71' : S.gems.includes(`L${L.u}_${L.i}`) ? '#b9c0d6' : '#c89bff'; ctx.strokeStyle = '#1a2040'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y - k); ctx.lineTo(x + k, y); ctx.lineTo(x, y + k); ctx.lineTo(x - k, y); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  for (const p of peers.values()) { const [x, y] = T(p.pos.x, p.pos.z); ctx.fillStyle = p.inParty ? '#7ff0e6' : '#fff'; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fill(); }
  const [mx, my] = T(P.pos.x, P.pos.z); ctx.save(); ctx.translate(mx, my); ctx.rotate(-P.yaw); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, -7); ctx.lineTo(5, 6); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
function openMap() {
  openUI(); $('map').classList.remove('hidden'); const c = $('mapC'), g = c.getContext('2d'); drawMap(g, c.width, true);
  $('mapBtns').innerHTML = [`<button type="button" class="btn small" data-t="0">🏛 Hub</button>`, ...UNITS.map(u => `<button type="button" class="btn small" data-t="${u.id}" ${unitOpen(u.id) ? '' : 'disabled'} style="background:${u.color};color:#fff">${unitOpen(u.id) ? '' : '🔒 '}${esc(u.place)}</button>`)].join('');
  $('mapBtns').querySelectorAll('button').forEach(b => b.onclick = () => { if (P.zone !== 'world') { toast('Leave this zone first.', 'warn'); return; } const u = +b.dataset.t; closeModals(); if (!u) teleport(CENTER + .5, 23, CENTER + 12); else { const [x, z] = TOWNS[u]; teleport(x + .5, world.topY(x + 3, z + 7) + 1, z + 7.5); } sfx('ok'); });
}
function closeModals() { document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); }
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { sfx('click'); b.closest('.modal').classList.add('hidden'); });

/* ========== Modo creativo ========== */
const HOT = PALETTE; let hotSel = 0, crTick = 0;
function buildHotbar() {
  $('hotbar').innerHTML = HOT.map((id, i) => `<button type="button" data-i="${i}" title="${BLOCK_NAMES[id]}" aria-label="${BLOCK_NAMES[id]}"><img alt="" src="${tileCss(id, atlas.canvas)}"><i class="cnt"></i></button>`).join('');
  $('hotbar').querySelectorAll('button').forEach(b => b.onclick = () => selectHot(+b.dataset.i)); selectHot(0);
}
function hotCounts() { $('hotbar').querySelectorAll('button').forEach((b, k) => { const n = S.mat[BLOCK_MAT[HOT[k]]] || 0; b.querySelector('.cnt').textContent = n > 999 ? '999+' : n; b.classList.toggle('empty', n < 1); }); const m = BLOCK_MAT[HOT[hotSel]]; $('blockName').textContent = `${BLOCK_NAMES[HOT[hotSel]]} · ${MATS[m].icon} ${S.mat[m] || 0}`; }
function selectHot(i) { hotSel = i; if (isTouch) { document.body.classList.remove('pal'); $('bBlock').innerHTML = `<img alt="" src="${tileCss(HOT[i], atlas.canvas)}">`; } $('hotbar').querySelectorAll('button').forEach((b, k) => b.classList.toggle('on', k === i)); $('hotbar').children[i]?.scrollIntoView({ inline: 'center', block: 'nearest' }); hotCounts(); }
function talkCreative() {
  const n = solvedTotal(), left = creativeLeft(), bud = creativeBudget();
  if (n < MIN_TASKS) return dialog('🧱 Creative Island', 'Portal', `<p>Complete <b>${MIN_TASKS} missions</b> to unlock Creative Mode. You have <b>${n}</b>.</p>`, [{ t: 'OK' }]);
  const rows = UNITS.map(u => `<li>Unit ${u.id}: ${solvedIn(u.id)}/${TASKS_PER_UNIT} missions → <b>${fmt(solvedIn(u.id) / TASKS_PER_UNIT * PER_UNIT)}</b></li>`).join('');
  dialog('🧱 Creative Island', 'Portal', `<p>Time earned: <b>${fmt(bud)}</b> of 10:00. Left today: <b>${fmt(left)}</b>.</p><ul class="small">${rows}</ul><p class="small">Each unit gives up to 2:30. Solve every mission to reach 10 minutes. Time refills every day.</p><p class="small">🧱 Every block uses materials: ${Object.keys(MATS).map(k => `${MATS[k].icon} ${S.mat[k] || 0}`).join(' · ')}. Collect more in the four lands: hit trees, rocks, flowers and crystals, and defeat creatures.</p>`,
    [{ t: left > 0 ? 'Enter and build' : 'No time left today', off: left <= 0, f: enterCreative }, { t: 'Later', c: 'ghost' }]);
}
function enterCreative() {
  if (!S.kit) { S.kit = true; for (const k in STARTER_KIT) S.mat[k] = (S.mat[k] || 0) + STARTER_KIT[k]; setTimeout(() => toast('🎁 Starter kit: materials to start building!', 'gold'), 1500); touch(); }
  hotCounts(); P.zone = 'creative'; P.fly = false; $('bFly').classList.remove('on'); document.body.classList.remove('flying'); const c = ISLAND.creative; teleport(c.x + .5, c.y + 2, c.z + 6); document.body.classList.add('creative');
  toast(isTouch ? 'Aim with the dot. ➕ places, ✖ removes.' : 'Left click: remove · Right click: place · F: fly', 'gold'); playMusic('Music_SweetTalk');
}
function exitCreative(msg) { document.body.classList.remove('creative', 'pal', 'flying'); P.zone = 'world'; P.fly = false; teleport(CENTER + .5, 23, CENTER + 18); if (msg) toast(msg, 'warn'); touch(); saveCloud(true); }
const buildKey = (x, y, z) => `${x},${y},${z}`; let buildSet = new Map();
function applyBuild() { for (const [x, y, z, id] of S.build) { world.set(x, y, z, id); buildSet.set(buildKey(x, y, z), id); } }
const lookDir = () => new THREE.Vector3(-Math.sin(P.yaw) * Math.cos(P.pitch), Math.sin(P.pitch), -Math.cos(P.yaw) * Math.cos(P.pitch));
const eyePos = () => new THREE.Vector3(P.pos.x, P.pos.y + 1.6, P.pos.z);
const rayFromView = () => { const dir = new THREE.Vector3(); camera.getWorldDirection(dir); return world.raycast(camera.position, dir, P.fp ? 7 : 12); };
const inPlot = (x, y, z) => { const c = ISLAND.creative; return Math.hypot(x - c.x, z - c.z) < c.r - 2 && y >= c.y && y < c.y + 20; };
function placeBlock() {
  const h = rayFromView(); if (!h || !inPlot(h.px, h.py, h.pz)) return;
  if (S.build.length >= 1500) return toast('Block limit reached (1500).', 'warn');
  const need = BLOCK_MAT[HOT[hotSel]]; if (need && (S.mat[need] || 0) < 1) { sfx('bad', .3); return toast(`${MATS[need].icon} You need ${MATS[need].name}! Collect it in the four lands.`, 'warn'); }
  const bx = h.px, by = h.py, bz = h.pz; if (Math.abs(bx + .5 - P.pos.x) < .85 && Math.abs(bz + .5 - P.pos.z) < .85 && by >= Math.floor(P.pos.y) && by <= Math.floor(P.pos.y + 1.8)) return;
  world.set(bx, by, bz, HOT[hotSel]); if (need) S.mat[need]--; hotCounts(); S.build.push([bx, by, bz, HOT[hotSel]]); buildSet.set(buildKey(bx, by, bz), HOT[hotSel]); sfx('block', .4); dirty = true; avatar?.oneShot('interact-right', 350);
}
function breakBlock() {
  const h = rayFromView(); if (!h || !buildSet.has(buildKey(h.x, h.y, h.z))) return;
  const back = BLOCK_MAT[buildSet.get(buildKey(h.x, h.y, h.z))]; if (back) S.mat[back] = (S.mat[back] || 0) + 1;
  world.set(h.x, h.y, h.z, B.AIR); buildSet.delete(buildKey(h.x, h.y, h.z)); hotCounts(); S.build = S.build.filter(b => !(b[0] === h.x && b[1] === h.y && b[2] === h.z)); sfx('block', .3); dirty = true; avatar?.oneShot('interact-right', 350);
}

/* ========== Arena PvP ========== */
const bots = []; const cube = boxM(.9, .9, .9, '#ffd93b'); cube.material = new THREE.MeshBasicMaterial({ color: '#ffd93b' }); cube.visible = false; scene.add(cube); let cubeT = 12, dmgBuff = 0, arenaScore = 0, shots = [];
const curWeapon = () => itemById(S.eq.weapon) || itemById('w_wood');
function talkArena() {
  dialog('⚔️ Word Arena', 'Portal', `<p>Fight your classmates in a friendly duel! You respawn after each knockout.</p><p class="small">Your weapon: <b>${esc(curWeapon().name)}</b> (${curWeapon().dmg} dmg). Touch the golden <b>Power Cube</b> and answer in English for double damage and extra HP. If nobody is online, you train against bots.</p>`,
    [{ t: 'Enter arena', c: 'red', f: enterArena }, { t: 'Later', c: 'ghost' }]);
}
async function enterArena() {
  P.zone = 'arena'; P.hp = 100; arenaScore = 0; document.body.classList.add('arena'); const a = ISLAND.arena; arenaSpawn(); playMusic('Music_DeterminedStart'); hud();
  if ($('netOn').checked && !isIdleOff) { setStatus('…'); const r = await join('a-' + secRoom(), netProfile(), MAX_ARENA); if (r === 'full') toast('The arena is full. Training with bots.', 'warn'); setStatus(r === 'ok' ? 'on' : 'off'); if (r === 'ok') sendPos(true); }
  syncBots();
}
function arenaSpawn() { const a = ISLAND.arena, ang = Math.random() * 6.28; teleport(a.x + Math.cos(ang) * 20, a.y + 1.2, a.z + Math.sin(ang) * 20); P.yaw = Math.atan2(P.pos.x - a.x, P.pos.z - a.z); }
function exitArena() { document.body.classList.remove('arena'); clearBots(); cube.visible = false; P.zone = 'world'; P.dead = false; P.hp = 100; if (avatar) { avatar._busy = false; avatar._os = false; avatar.curN = ''; } teleport(CENTER + .5, 23, CENTER - 16); playMusic('Music_SweetTalk'); if ($('netOn').checked) connectWorld(); else { netLeave(); setStatus('off'); } hud(); }
function syncBots() { const others = peers.size; if (P.zone !== 'arena') return; const want = others === 0 ? 2 : 0; while (bots.length > want) { const b = bots.pop(); b.a.dispose(); } while (bots.length < want) spawnBot(bots.length); }
function clearBots() { while (bots.length) bots.pop().a.dispose(); }
function spawnBot(i) { const a = ISLAND.arena, ang = i * 3.1 + 1, av = new Avatar(4 + i * 5, 'Training Bot', '#ffb4ae'); av.applyEq({ weapon: 'w_wood' }); const b = { a: av, pos: new THREE.Vector3(a.x + Math.cos(ang) * 16, a.y + 1, a.z + Math.sin(ang) * 16), vel: new THREE.Vector3(), hp: 60, cd: 1, ground: false, dead: 0 }; av.root.position.copy(b.pos); bots.push(b); }
function updateBots(dt) {
  for (const b of bots) {
    if (b.dead > 0) { b.dead -= dt; if (b.dead <= 0) { const a = ISLAND.arena, ang = Math.random() * 6.28; b.pos.set(a.x + Math.cos(ang) * 18, a.y + 1, a.z + Math.sin(ang) * 18); b.hp = 60; b.a.curN = ''; } b.a.tick(dt); continue; }
    const dx = P.pos.x - b.pos.x, dz = P.pos.z - b.pos.z, d = Math.hypot(dx, dz), sp = d > 2 && !P.dead ? 3.1 : 0;
    b.vel.x = d ? dx / d * sp : 0; b.vel.z = d ? dz / d * sp : 0; b.vel.y -= 26 * dt; b.ground = world.move(b.pos, b.vel, Math.min(dt, .05), .3, 1.78, b.ground); if (b.ground && sp && (Math.abs(b.vel.x) < .1 && Math.abs(b.vel.z) < .1)) b.vel.y = 8;
    b.a.root.position.copy(b.pos); b.a.root.rotation.y = Math.atan2(dx, dz); b.a.base = sp ? 'walk' : 'idle'; if (!b.a._hit) b.a.play(b.a.base); b.cd -= dt;
    if (d < 2.3 && b.cd <= 0 && !P.dead) { b.cd = 1.5; b.a.oneShot('attack-melee-right', 420); hurt(6, null); }
    b.a.tick(dt);
  }
}
/* ========== Combate: armas, poderes y proyectiles (arena y mundo abierto) ========== */
const curPower = () => itemById(S.eq.power) || itemById('pw_spark');
function combatTargets() {
  const out = [];
  if (P.zone === 'arena') { for (const b of bots) if (b.dead <= 0) out.push({ kind: 'bot', ref: b, pos: b.pos, r: .7, cy: .9 }); for (const p of peers.values()) if (!p.dead && p.a.root.visible) out.push({ kind: 'peer', ref: p, pos: p.pos, r: .7, cy: .9 }); }
  else if (P.zone === 'world') for (const m of CR.list) if (!m.dead && m.ready && !m.T.passive) out.push({ kind: 'mob', ref: m, pos: m.pos, r: m.r, cy: m.cy });
  return out;
}
const alive = t => t.kind === 'bot' ? t.ref.dead <= 0 : t.kind === 'peer' ? !t.ref.dead && peers.has(t.ref.id) : !t.ref.dead && !t.ref.gone;
const centerOf = t => new THREE.Vector3(t.pos.x, t.pos.y + t.cy, t.pos.z);
function aimDir() { const d = new THREE.Vector3(); camera.getWorldDirection(d); if (!P.fp) { d.y = Math.max(d.y, -.15); d.normalize(); } return d; }
const handPos = () => { const f = new THREE.Vector3(Math.sin(avatar?.root.rotation.y || 0), 0, Math.cos(avatar?.root.rotation.y || 0)); return new THREE.Vector3(P.pos.x, P.pos.y + 1.25, P.pos.z).addScaledVector(f, .55); };
function pickTarget(dir, range, cone) {
  let best = null, bs = -1e9; const f = new THREE.Vector3(dir.x, 0, dir.z).normalize();
  for (const t of combatTargets()) { const to = new THREE.Vector3(t.pos.x - P.pos.x, 0, t.pos.z - P.pos.z), l = Math.hypot(to.x, to.z, (t.pos.y - P.pos.y) * .6); if (l > range + t.r) continue; to.normalize(); const dot = to.dot(f); if (dot < cone && l > 1.8) continue; const s = dot * 3 - l / range * 2; if (s > bs) { bs = s; best = t; } }
  return best;
}
function faceTarget(t) { if (avatar && t) avatar.root.rotation.y = Math.atan2(t.pos.x - P.pos.x, t.pos.z - P.pos.z); }
function botHit(b, dmg) { b.hp -= dmg; b.a._hit = 1; b.a.oneShot('emote-no', 260); setTimeout(() => b.a._hit = 0, 260); if (b.hp <= 0) { b.dead = 3; b.a.play('die', true); gotKo(true); } }
function hitTarget(t, dmg, o = {}) {
  if (!alive(t)) return; damageNum(centerOf(t), dmg);
  if (t.kind === 'bot') botHit(t.ref, dmg);
  else if (t.kind === 'peer') send('hit', { to: t.ref.id, dmg, by: profileName(), byId: NET.id });
  else CR.damage(t.ref, dmg, o.dir, o.slow);
}
/* Recolectar materiales: golpea árboles, rocas, flores, cristales y arena */
let harv = null; const harvBox = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.03, 1.03, 1.03)), new THREE.LineBasicMaterial({ color: '#ffffff' })); harvBox.visible = false; scene.add(harvBox);
function findHarvest() {
  harv = null; if (P.zone !== 'world' || P.dead || anyUI() || !started) { harvBox.visible = false; return; }
  const h = rayFromView(); if (h) { const id = world.get(h.x, h.y, h.z), m = HARVEST[id], d = Math.hypot(h.x + .5 - P.pos.x, h.y + .5 - P.pos.y - 1, h.z + .5 - P.pos.z); if (m && d < 5.5 && unitOpen(unitOf(h.x, h.z)) && canHarvest(h.x, h.y, h.z, id)) harv = { x: h.x, y: h.y, z: h.z, id, m }; }
  harvBox.visible = !!harv; if (harv) harvBox.position.set(harv.x + .5, harv.y + .5, harv.z + .5);
  document.body.classList.toggle('harvest', !!harv);
}
function harvest() {
  const h = harv; if (!h) return; P.cd = .32; avatar?.oneShot('attack-melee-right', 320); sfx('block', .45);
  const day = today(); if (S.harvDay.d !== day) S.harvDay = { d: day, n: 0 };
  world.set(h.x, h.y, h.z, B.AIR); burst(new THREE.Vector3(h.x + .5, h.y + .5, h.z + .5), new THREE.Color().setHSL(0, 0, .9), 6);
  if (S.harvDay.n < 600) { S.harvDay.n++; S.mat[h.m] = (S.mat[h.m] || 0) + 1; matFloat(new THREE.Vector3(h.x + .5, h.y + 1, h.z + .5), `+1 ${MATS[h.m].icon}`); dirty = true; }
  else if (S.harvDay.n++ === 600) toast('Your bag is full for today! Come back tomorrow.', 'warn');
  findHarvest();
}
function matFloat(pos, txt) { const v = pos.clone().project(camera); if (v.z > 1) return; const d = document.createElement('div'); d.className = 'dnum mat'; d.style.left = ((v.x + 1) / 2 * innerWidth) + 'px'; d.style.top = ((1 - v.y) / 2 * innerHeight) + 'px'; d.textContent = txt; $('fx').appendChild(d); setTimeout(() => d.remove(), 900); }
function attack() {
  if (P.dead || P.cd > 0 || anyUI() || P.zone === 'creative') return; const w = curWeapon();
  if (P.zone === 'world' && harv) { const near = pickTarget(aimDir(), 6, isTouch ? .1 : .45); if (!near) return harvest(); }
  P.cd = w.cd; sfx('swing', .4); avatar?.oneShot(w.ranged ? 'holding-right-shoot' : 'attack-melee-right', 380);
  const dir = aimDir(), dmg = Math.round(w.dmg * (dmgBuff > 0 ? 2 : 1));
  const tg = pickTarget(dir, w.ranged ? w.range : w.range + .5, w.ranged ? (isTouch ? .75 : .9) : (isTouch ? .1 : .45)); faceTarget(tg);
  if (w.ranged) { const o = handPos(), d = tg ? centerOf(tg).sub(o).normalize() : dir; fire({ pos: o, dir: d, speed: 38, life: w.range / 38 + .15, dmg, color: w.color, size: .24, splash: w.splash || 0, home: tg ? 6 : 0, target: tg, from: 'me', rainbow: w.rainbow }); send('shot', { o: [o.x, o.y, o.z], d: [d.x, d.y, d.z], c: w.color, s: .24 }); return; }
  if (!tg) return; sfx('hit', .5);
  const list = w.sweep ? combatTargets().filter(t => { const l = Math.hypot(t.pos.x - P.pos.x, t.pos.z - P.pos.z); return l < w.range + t.r && (l < 1.8 || new THREE.Vector3(t.pos.x - P.pos.x, 0, t.pos.z - P.pos.z).normalize().dot(new THREE.Vector3(dir.x, 0, dir.z).normalize()) > .2); }) : [tg];
  for (const t of list) hitTarget(t, dmg, { dir });
  if (w.sweep) burst(centerOf(tg), w.color, 8, w.shape === 'brush');
}
function castPower() {
  if (P.dead || P.pcd > 0 || anyUI() || P.zone === 'creative' || !started) return; const pw = curPower(); P.pcd = pw.cd; powHud();
  avatar?.oneShot('holding-right-shoot', 420); sfx('swing', .55);
  const dir = aimDir(), tg = pickTarget(dir, pw.range, isTouch ? .6 : .82); faceTarget(tg);
  const o = handPos(), d = tg ? centerOf(tg).sub(o).normalize() : dir, dmg = Math.round(pw.dmg * (dmgBuff > 0 ? 2 : 1));
  fire({ pos: o, dir: d, speed: 27, life: pw.range / 27 + .2, dmg, color: pw.color, size: .5, splash: pw.splash, slow: pw.slow, chain: pw.chain, home: tg ? 4.5 : 0, target: tg, from: 'me', rainbow: pw.rainbow, power: true });
  send('shot', { o: [o.x, o.y, o.z], d: [d.x, d.y, d.z], c: pw.color, s: .5 });
}
const projs = [], parts = [], cubeGeo = new THREE.BoxGeometry(1, 1, 1);
function fire(p) {
  const m = new THREE.Mesh(cubeGeo, new THREE.MeshBasicMaterial({ color: p.color, fog: false })); m.scale.setScalar(p.size); m.position.copy(p.pos); scene.add(m);
  if (p.power) { const halo = new THREE.Mesh(cubeGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .45, fog: false })); halo.scale.setScalar(1.5); m.add(halo); }
  projs.push({ ...p, m, pos: p.pos.clone(), dir: p.dir.clone().normalize(), t: p.life });
}
function burst(pos, color, n, rainbow) {
  for (let i = 0; i < n && parts.length < 140; i++) { const m = new THREE.Mesh(cubeGeo, new THREE.MeshBasicMaterial({ color: rainbow ? new THREE.Color().setHSL(Math.random(), .9, .6) : color, fog: false })); m.scale.setScalar(.12 + Math.random() * .14); m.position.copy(pos); scene.add(m); parts.push({ m, v: new THREE.Vector3((Math.random() - .5) * 9, Math.random() * 7, (Math.random() - .5) * 9), t: .45 + Math.random() * .3 }); }
}
function zap(a, b, color) { const m = new THREE.Mesh(cubeGeo, new THREE.MeshBasicMaterial({ color, fog: false })), l = a.distanceTo(b); m.scale.set(.09, .09, l); m.position.copy(a).lerp(b, .5); m.lookAt(b); scene.add(m); parts.push({ m, v: new THREE.Vector3(), t: .18, still: true }); }
function explode(p) {
  burst(p.pos, p.color, p.power || p.splash ? 16 : 5, p.rainbow);
  if (p.from !== 'me') return;
  const hit = []; if (p.direct && alive(p.direct)) hit.push([p.direct, p.dmg]);
  if (p.splash) for (const t of combatTargets()) if (!hit.some(h => h[0].ref === t.ref) && centerOf(t).distanceTo(p.pos) < p.splash + t.r) hit.push([t, Math.round(p.dmg * (p.direct ? .7 : 1))]);
  for (const [t, d] of hit) hitTarget(t, d, { dir: p.dir, slow: p.slow });
  if (p.chain && hit.length) { let from = hit[0][0]; const done = new Set(hit.map(h => h[0].ref)); for (let k = 1; k < p.chain; k++) { let nx = null, nd = 9; for (const t of combatTargets()) if (!done.has(t.ref)) { const dd = centerOf(t).distanceTo(centerOf(from)); if (dd < nd) { nd = dd; nx = t; } } if (!nx) break; zap(centerOf(from), centerOf(nx), p.color); hitTarget(nx, Math.round(p.dmg * .75), { dir: p.dir }); done.add(nx.ref); from = nx; } }
  if (hit.length) sfx('hit', .45);
}
function updateProjs(dt) {
  for (let i = projs.length - 1; i >= 0; i--) {
    const p = projs[i];
    if (p.target && p.home && alive(p.target)) { const want = centerOf(p.target).sub(p.pos).normalize(); p.dir.lerp(want, Math.min(1, dt * p.home)).normalize(); }
    p.pos.addScaledVector(p.dir, p.speed * dt); p.m.position.copy(p.pos); p.m.rotation.x += dt * 9; p.m.rotation.y += dt * 7; p.t -= dt;
    if (p.rainbow) p.m.material.color.setHSL((performance.now() / 260) % 1, .9, .6);
    let boom = p.t <= 0;
    if (!boom && p.from === 'me') for (const t of combatTargets()) if (centerOf(t).distanceTo(p.pos) < t.r + .3 + p.size * .5) { boom = true; p.direct = t; break; }
    if (!boom && p.from === 'mob' && !P.dead && P.zone === 'world' && p.pos.distanceTo(new THREE.Vector3(P.pos.x, P.pos.y + .95, P.pos.z)) < .75 + p.size * .5) { boom = true; hurt(p.dmg, p.by); }
    if (!boom && world.solidAt(p.pos.x, p.pos.y, p.pos.z)) boom = true;
    if (boom) { explode(p); scene.remove(p.m); p.m.material.dispose(); projs.splice(i, 1); }
  }
  for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.t -= dt; if (!q.still) { q.v.y -= 18 * dt; q.m.position.addScaledVector(q.v, dt); } if (q.t <= 0) { scene.remove(q.m); q.m.material.dispose(); parts.splice(i, 1); } }
}
function clearProjs() { for (const p of projs) { scene.remove(p.m); p.m.material.dispose(); } projs.length = 0; }
function spawnShot(o, d, color, s = .2) { fire({ pos: o, dir: d, speed: 38, life: .8, dmg: 0, color, size: s, from: 'peer', power: s > .4 }); }
function hurt(dmg, by, byId) {
  if (P.dead || P.inv > 0 || P.zone === 'creative') return; P.hp = Math.max(0, P.hp - dmg); P.lastHurt = performance.now(); sfx('hit', .6); $('dmgFlash').classList.remove('on'); void $('dmgFlash').offsetWidth; $('dmgFlash').classList.add('on'); hud();
  if (P.hp <= 0) { if (P.zone === 'arena') koSelf(by, byId); else faint(by); }
}
function faint(by) {
  P.dead = true; avatar._os = false; avatar.play('die', true); avatar._busy = true; toast(by ? `${by} knocked you out! Back to town…` : 'You fainted! Back to town…', 'warn');
  setTimeout(() => { if (P.zone !== 'world') return; P.dead = false; P.hp = 100; P.inv = 3; avatar._busy = false; avatar.curN = ''; CR.clear(); const u = unitOf(P.pos.x, P.pos.z); if (u && unitOpen(u)) { const [x, z] = TOWNS[u]; teleport(x + .5, world.topY(x + 3, z + 7) + 1, z + 7.5); } else teleport(CENTER + .5, 23, CENTER + 12); hud(); }, 2400);
}
/* Criaturas del mundo */
const CR = createCreatures({
  scene, world, loadG, flatMat, norm, P, isTouch, makeLabel, unitOf, unitOpen, SAFE, LANDMARKS, SEA,
  busy: () => !!anyUI(),
  bossReady: u => !S.bossT[u] || Date.now() - S.bossT[u] > 8 * 60000,
  hitPlayer: (dmg, name) => hurt(dmg, name),
  mobShot: (o, dir, dmg, color, name, big) => fire({ pos: o, dir, speed: big ? 16 : 19, life: 1.4, dmg, color, size: big ? .55 : .28, from: 'mob', by: name, power: big }),
  onKill: m => {
    sfx('coin', .4); burst(new THREE.Vector3(m.pos.x, m.pos.y + m.cy, m.pos.z), '#ffd93b', 10);
    S.mobs = (S.mobs || 0) + 1; const d = today(); if (S.mobDay.d !== d) S.mobDay = { d, n: 0 };
    if (m.boss) { setTimeout(() => bossReward(m.boss.u, m.boss.name), 1300); return; }
    const dr = DROPS[m.type]; if (dr) { const txt = []; for (const k in dr) { S.mat[k] = (S.mat[k] || 0) + dr[k]; txt.push(`+${dr[k]} ${MATS[k].icon}`); } matFloat(new THREE.Vector3(m.pos.x, m.pos.y + m.cy + .6, m.pos.z), txt.join(' ')); }
    const c = m.T.coins; if (S.mobDay.n + c <= 160) { S.mobDay.n += c; S.coins += c; float(`+${c} 🪙`); hud(); touch(); }
  }
});
async function bossReward(u, name) {
  S.bossT[u] = Date.now(); S.bosses[u] = (S.bosses[u] || 0) + 1; S.mat.gold = (S.mat.gold || 0) + 5; S.mat.crystal = (S.mat.crystal || 0) + 5; touch();
  if (P.zone !== 'world' || P.dead) return; toast(`🏆 You defeated the ${name}!`, 'gold'); confetti(); sfx('win');
  const pool = quickPool(highestOpen()), it = pool[Math.floor(Math.random() * pool.length)]; activeQuiz = true; openUI();
  const ok = await quickQuestion(it, `👑 ${name}'s treasure`, (x, v, o, ms) => log({ title: 'Boss treasure', unit: x.unit, k: x.k }, x, v, o, ms, `U${u} Boss: ${name}`)); activeQuiz = false;
  const coins = ok ? 80 : 30; S.coins += coins; if (ok) gain(20, 'boss'); else hud(); toast(ok ? `👑 +${coins} coins, +20 points, +5 🏅 +5 💎!` : `👑 +${coins} coins. Answer right next time for more!`, 'gold'); touch(); saveCloud(true);
}
function koSelf(by, byId) { if (P.dead) return; P.dead = true; avatar._os = false; avatar.play('die', true); avatar._busy = true; send('ko', { by: byId || '', st: 1 }); toast(by ? `Knocked out by ${by}` : 'Knocked out!', 'warn'); setTimeout(() => { if (P.zone !== 'arena') return; P.dead = false; P.hp = 100; P.inv = 2; avatar._busy = false; avatar.curN = ''; arenaSpawn(); hud(); send('ko', { st: 0 }); }, 3000); }
function gotKo(isBot) { S.kos += isBot ? 0 : 1; arenaScore++; const d = today(); if (S.koDay.d !== d) S.koDay = { d, n: 0 }; if (S.koDay.n < (isBot ? 8 : 20)) { S.koDay.n++; gain(isBot ? 3 : 8, 'KO'); } hud(); }
function updateCube(dt) { if (P.zone !== 'arena') return; if (!cube.visible) { cubeT -= dt; if (cubeT <= 0) { const a = ISLAND.arena, t = Math.random() * 6.28, r = 6 + Math.random() * 16; cube.position.set(a.x + Math.cos(t) * r, a.y + 1.2, a.z + Math.sin(t) * r); cube.visible = true; } } else { cube.rotation.y += dt * 2; cube.rotation.x += dt; } }
async function useCube() {
  cube.visible = false; cubeT = 14; const pool = quickPool(highestOpen()), it = pool[Math.floor(Math.random() * pool.length)]; activeQuiz = true;
  const ok = await quickQuestion(it, '⚡ Power Cube', (x, v, o, ms) => log({ title: 'Arena Power Cube', unit: x.unit, k: x.k }, x, v, o, ms, 'Arena Power Cube')); activeQuiz = false;
  if (ok) { dmgBuff = 12; P.hp = Math.min(100, P.hp + 35); toast('⚡ Double damage for 12 seconds!', 'gold'); sfx('coin'); hud(); }
}

/* ========== Multijugador ========== */
const peers = new Map(); let party = { code: '', }, netStatus = 'off', lastM = 0, lastSent = { x: 0, y: 0, z: 0, r: 0 }, idleT = 0, isIdleOff = false;
const profileName = () => S.name || 'Player';
const secRoom = () => (me?.section || 'open').replace(/[^a-zA-Z0-9]/g, '');
const netProfile = () => ({ n: profileName(), c: S.char, l: LEVELS(S.pts), eq: { hat: S.eq.hat, cape: S.eq.cape, weapon: S.eq.weapon, pet: S.eq.pet } });
const updateNetMe = () => { if (NET.ok) updateMe(netProfile()); };
async function connectWorld() {
  if (isIdleOff) return; setStatus('…');
  const r = party.code ? await join('p-' + party.code, netProfile(), MAX_PARTY) : await joinWorld(secRoom(), netProfile());
  setStatus(r === 'ok' ? 'on' : 'off'); if (r === 'ok') sendPos(true);
}
function setStatus(s) { netStatus = s; hudOnline(); }
function hudOnline() { $('onl').textContent = netStatus === 'on' ? `🟢 ${peers.size + 1} online${party.code ? ` · Party ${party.code}` : ''}` : netStatus === '…' ? '🟡 connecting…' : '⚪ offline'; }
function sendPos(force) { if (!NET.ok) return; const now = performance.now(), gap = P.zone === 'arena' ? 280 : 1500; const moved = Math.hypot(P.pos.x - lastSent.x, P.pos.y - lastSent.y, P.pos.z - lastSent.z) > .12 || Math.abs((avatar?.root.rotation.y || 0) - lastSent.r) > .2; if (!force && (now - lastM < gap || !moved)) { if (!force && !moved && lastSent.moving && now - lastM > 300) { lastSent.moving = false; pushPos(0, 0); } return; } pushPos(P.vel.x, P.vel.z); lastSent.moving = true; }
function pushPos(vx, vz) { lastM = performance.now(); const r = avatar?.root.rotation.y || 0; Object.assign(lastSent, { x: P.pos.x, y: P.pos.y, z: P.pos.z, r }); const q = v => Math.round(v * 10) / 10; send('m', { p: [q(P.pos.x), q(P.pos.y), q(P.pos.z), q(r), q(vx), q(vz)], z: P.zone === 'arena' ? 1 : 0, hp: P.hp }); }
netOn('join', p => {
  const a = new Avatar(p.c || 0, p.n || 'Player', p.l ? undefined : undefined); a.label.userData.set(`${p.n} · Lv ${p.l || 1}`, '#bff3ff'); a.applyEq(p.eq || {});
  peers.set(p.id, { id: p.id, a, pos: new THREE.Vector3(CENTER, -40, CENTER), target: new THREE.Vector3(CENTER, -40, CENTER), v: new THREE.Vector3(), r: 0, t: 0, name: p.n, hp: 100, dead: false, inParty: !!party.code }); hudOnline(); sendPos(true); syncBots(); { const early = pendingM.get(p.id); if (early) { pendingM.delete(p.id); NET.h.m(early); } }
  if (party.code) { toast(`${p.n} joined the party!`); renderParty(); }
});
netOn('update', p => { const x = peers.get(p.id); if (!x) return; x.name = p.n; x.a.label.userData.set(`${p.n} · Lv ${p.l || 1}`, '#bff3ff'); x.a.applyEq(p.eq || {}); });
netOn('leave', p => { const x = peers.get(p.id); if (x) { x.a.dispose(); peers.delete(p.id); } hudOnline(); syncBots(); if (party.code) renderParty(); if (pq && pq.ids.includes(p.id)) abortPQ(`${p.n || 'A teammate'} left the party.`); });
const pendingM = new Map();
netOn('m', d => { const x = peers.get(d.id); if (!x) { pendingM.set(d.id, d); return; } const [px, py, pz, r, vx, vz] = d.p; if (x.pos.y < -20) x.pos.set(px, py, pz); x.target.set(px, py, pz); x.v.set(vx, 0, vz); x.r = r; x.t = performance.now(); x.hp = d.hp; x.a.root.visible = (d.z === 1) === (P.zone === 'arena'); });
netOn('say', d => { const x = peers.get(d.id); if (x) bubble(x.a, d.t); });
netOn('hit', d => { if (d.to === NET.id && P.zone === 'arena') hurt(Math.max(0, Math.min(60, +d.dmg || 0)), d.by, d.id); });
netOn('ko', d => { const x = peers.get(d.id); if (!x) return; x.dead = !!d.st; if (d.st) { x.a.play('die', true); if (d.by === NET.id) gotKo(false); } else { x.a.curN = ''; } });
netOn('shot', d => { const x = peers.get(d.id); if (x && x.a.root.visible && x.pos.distanceTo(P.pos) < 60) spawnShot(new THREE.Vector3(...d.o), new THREE.Vector3(...d.d), d.c, Math.min(.6, +d.s || .2)); });
netOn('party', () => { if (party.code) renderParty(); });
netOn('status', s => { if (s === 'off') setStatus('off'); });
function updatePeers(dt) {
  for (const x of peers.values()) {
    x.target.x += x.v.x * dt; x.target.z += x.v.z * dt; if (performance.now() - x.t > 2400) x.v.set(0, 0, 0);
    x.pos.lerp(x.target, Math.min(1, dt * 8)); x.a.root.position.copy(x.pos); x.a.root.rotation.y = lerpAngle(x.a.root.rotation.y, x.r, Math.min(1, dt * 8));
    if (!x.dead) x.a.play(x.v.lengthSq() > .6 ? 'walk' : 'idle');
    x.a.tick(dt, x.pos.distanceTo(P.pos) < 40);
  }
}
function bubble(a, text) { const s = makeLabel(text, '#ffe27a'); s.scale.set(3.6, .8, 1); s.position.y = 2.95; a.root.add(s); setTimeout(() => { a.root.remove(s); s.material.map?.dispose(); s.material.dispose(); }, 3600); }
function openChat() { openUI(); $('chat').classList.remove('hidden'); $('chatList').innerHTML = QUICK_CHAT.map(t => `<button type="button" class="tile">${esc(t)}</button>`).join(''); $('chatList').querySelectorAll('button').forEach(b => b.onclick = () => { send('say', { t: b.textContent }); if (avatar) bubble(avatar, b.textContent); avatar.label.visible = false; $('chat').classList.add('hidden'); }); }

/* Party */
function openParty() { openUI(); $('party').classList.remove('hidden'); renderParty(); }
function renderParty() {
  const box = $('partyBody'); if (!box) return;
  if (!party.code) { box.innerHTML = `<p>Team up with up to <b>${MAX_PARTY}</b> classmates to play the cooperative missions at each town's <b>Party Beacon</b>.</p><div class="row"><button type="button" class="btn green" id="pCreate">Create a party</button></div><form id="pJoinF" class="typeform"><input id="pCode" maxlength="4" placeholder="CODE" autocapitalize="characters" aria-label="Party code"><button class="btn" type="submit">Join</button></form><p class="fb" id="pMsg"></p>`;
    $('pCreate').onclick = () => setParty(Array.from({ length: 4 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.random() * 24 | 0]).join('')); $('pJoinF').onsubmit = e => { e.preventDefault(); const c = $('pCode').value.trim().toUpperCase(); if (/^[A-Z]{4}$/.test(c)) setParty(c); else $('pMsg').textContent = 'The code has 4 letters.'; }; return; }
  const list = [`<li><b>${esc(profileName())}</b> (you)</li>`, ...[...peers.values()].map(p => `<li>${esc(p.name)} <small>${Math.round(p.pos.distanceTo(P.pos))} m away</small></li>`)].join('');
  box.innerHTML = `<p>Party code: <span class="code">${party.code}</span></p><p class="small">Tell your classmates this code.</p><ul>${list}</ul><button type="button" class="btn ghost" id="pLeave">Leave party</button>`; $('pLeave').onclick = () => setParty('');
}
async function setParty(code) {
  if (P.zone === 'arena') return toast('Leave the arena first.', 'warn');
  party.code = code; setStatus('…'); const r = code ? await join('p-' + code, netProfile(), MAX_PARTY) : await joinWorld(secRoom(), netProfile());
  if (r === 'full') { party.code = ''; toast('That party is full.', 'warn'); await joinWorld(secRoom(), netProfile()); }
  if (r === 'off') { party.code = ''; toast('No connection for party play.', 'warn'); }
  setStatus(NET.ok ? 'on' : 'off'); renderParty(); sendPos(true); hudOnline();
}
let pq = null; const pUI = partyQuizUI();
function talkParty(n) {
  const px = n.party, done = S.done[px.id];
  if (!unitOpen(n.u)) return dialog(px.title, 'Party Beacon', '<p>This land is still locked.</p>', [{ t: 'OK' }]);
  const others = [...peers.values()], close = others.filter(p => p.pos.distanceTo(P.pos) < 16), canStart = party.code && others.length >= 1 && close.length === others.length;
  const why = !party.code ? 'You need a party. Press <b>P</b> (👥) to create one.' : others.length < 1 ? 'Wait for at least one teammate.' : close.length < others.length ? 'All teammates must stand near this beacon.' : `${others.length + 1} players ready!`;
  dialog(`👥 ${px.title}`, 'Party Beacon', `<p>${esc(px.intro)}</p><p class="small">${why}${done ? ' · Already completed' : ''}</p><p class="small">Reward: +120 points each.</p>`,
    [{ t: 'Start together', off: !canStart, f: () => { const seed = Math.floor(Math.random() * 1e6), ids = [NET.id, ...others.map(p => p.id)].sort(); send('pq', { a: 'start', u: n.u, seed, ids }); startPQ(n.u, seed, ids); } }, ...(party.code ? [] : [{ t: 'Open party', c: 'purple', f: openParty }]), { t: 'Later', c: 'ghost' }]);
}
netOn('pq', d => {
  if (d.a === 'start') { if (!pq && d.ids.includes(NET.id)) { closeModals(); startPQ(d.u, d.seed, d.ids); } return; }
  if (!pq) return; if (d.a === 'vote') { pq.votes[d.id] = d.o; pqRender(); pqCheck(); }
});
function seeded(seed) { let s = seed || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function startPQ(u, seed, ids) {
  openUI(); const U = UNITS[u - 1], px = U.party, names = {}; ids.forEach(i => { names[i] = i === NET.id ? 'You' : (peers.get(i)?.name || 'Teammate'); });
  const mine = px.clues.filter((c, i) => ids[i % ids.length] === NET.id);
  pq = { u, px, ids, seed, idx: 0, votes: {}, fails: 0, firstOK: 0, names, wait: false, t0: performance.now() }; pUI.open(px.title, mine.join('\n'), names); pUI.msg('Talk with your team, compare clues and vote for the same answer.'); pqRender();
}
const pqOrder = () => shuffle(pq.px.items[pq.idx].o, seeded(pq.seed + pq.idx * 97 + 1));
function pqRender() { if (!pq) return; pUI.show(pq.px.items[pq.idx], pqOrder(), pq.votes, pq.votes[NET.id], o => { if (pq.wait) return; pq.votes[NET.id] = o; send('pq', { a: 'vote', o }); pqRender(); pqCheck(); }, pq.idx + 1, pq.px.items.length, pq.fails); }
function pqCheck() {
  if (!pq || pq.wait) return; const vals = pq.ids.map(i => pq.votes[i]); if (vals.some(v => !v)) return pUI.msg('Waiting for everyone to vote…');
  if (new Set(vals).size > 1) return pUI.msg('⚠️ Your team chose different answers. Talk and agree!', 'warn');
  const it = pq.px.items[pq.idx], ok = vals[0] === it.o[0]; pq.wait = true;
  log({ title: pq.px.title, unit: pq.u, k: 'COOP' }, it, vals[0], ok, performance.now() - pq.t0, `U${pq.u} Party: ${pq.px.title}`);
  if (ok) { sfx('ok'); if (!pq.fails) pq.firstOK++; pUI.msg('✔ Correct! Great teamwork.', 'ok'); setTimeout(() => pqNext(), 1100); return; }
  sfx('bad', .35); pq.fails++;
  if (pq.fails < 3) { pUI.msg(`✖ Not quite. Try again together! (attempt ${pq.fails + 1} of 3)`, 'warn'); setTimeout(() => { if (!pq) return; pq.votes = {}; pq.wait = false; pqRender(); }, 1300); return; }
  pUI.msg(`<b>💡 Feedback</b> ${esc(it.x)}<br>Answer: <b>${esc(it.o[0])}</b>`, 'teach'); setTimeout(() => pqNext(), 4200);
}
function pqNext() {
  if (!pq) return; pq.idx++; pq.votes = {}; pq.fails = 0; pq.wait = false; pq.t0 = performance.now();
  if (pq.idx < pq.px.items.length) { pUI.msg('Talk with your team and vote.'); return pqRender(); }
  const px = pq.px, first = !S.done[px.id], u = pq.u; pq = null; pUI.close(); S.done[px.id] = { s: 3, at: Date.now() }; gain(first ? 120 : 15, 'team'); sfx('win'); confetti(); refreshMarkers(); saveCloud(true);
  dialog('Team victory!', 'Party Beacon', `<div class="stars">👥⭐</div><p>You completed <b>${esc(px.title)}</b> together!</p>`, [{ t: 'Continue' }]);
}
function abortPQ(msg) { pq = null; pUI.close(); toast(msg, 'warn'); }
$('pqLeave').onclick = () => { if (pq) abortPQ('You left the team mission.'); };

/* ========== HUD ========== */
function hud() {
  const lvl = LEVELS(S.pts), floor = levelFloor(lvl), next = levelFloor(lvl + 1); $('hLvl').textContent = lvl; $('hXp').style.width = ((S.pts - floor) / (next - floor) * 100) + '%'; $('hPts').textContent = S.pts; $('hCoins').textContent = S.coins;
  const n = nextQuest(); $('objT').textContent = n ? `Unit ${n.u.id} · ${n.u.place}` : 'All units complete!'; $('objD').textContent = n ? `${n.q.icon} ${n.q.title}: find ${n.q.npc}` : 'Play in the arena, build, or help your party!';
  $('objP').style.width = n ? (solvedIn(n.u.id) / TASKS_PER_UNIT * 100) + '%' : '100%'; $('objC').textContent = n ? `${solvedIn(n.u.id)}/${TASKS_PER_UNIT}` : '✓';
  hpHud(); powHud(); $('arenaInfo').textContent = `KOs: ${arenaScore}`;
}
function hpHud() { const h = Math.round(P.hp); $('hp').style.width = h + '%'; $('hpN').textContent = `❤ ${h}`; }
function powHud() { const pw = curPower(), b = $('tPow'), ready = P.pcd <= 0; $('powInfo').textContent = `${pw.icon} ${ready ? (isTouch ? '' : 'R') : Math.ceil(P.pcd) + 's'}`; $('powInfo').classList.toggle('cool', !ready); if (b) { b.textContent = pw.icon; b.classList.toggle('cool', !ready); } }
let toastT = 0;
function toast(t, cls = '') { const b = $('toasts'), d = document.createElement('div'); d.className = 'toast ' + cls; d.textContent = t; b.appendChild(d); while (b.children.length > (isTouch ? 1 : 3)) b.firstChild.remove(); setTimeout(() => d.remove(), isTouch ? 2600 : 3600); }
function float(t) { const d = document.createElement('div'); d.className = 'floaty'; d.textContent = t; $('fx').appendChild(d); setTimeout(() => d.remove(), 1500); }
function damageNum(pos, n) { const v = new THREE.Vector3(pos.x, pos.y + 2, pos.z).project(camera); const d = document.createElement('div'); d.className = 'dnum'; d.style.left = ((v.x + 1) / 2 * innerWidth) + 'px'; d.style.top = ((1 - v.y) / 2 * innerHeight) + 'px'; d.textContent = n; $('fx').appendChild(d); setTimeout(() => d.remove(), 800); }

/* ========== Ciclo día/noche ========== */
let dayT = .3, biomeK = 0; const biomeC = new THREE.Color('#8fd6ff');
const BIOME = { 1: new THREE.Color('#ffe3a8'), 2: new THREE.Color('#9fe0b4'), 3: new THREE.Color('#ffb98a'), 4: new THREE.Color('#6fe3ff') };
const skyDay = new THREE.Color('#8fd6ff'), skyDusk = new THREE.Color('#ffae7a'), skyNight = new THREE.Color('#1b2350');
function updateSky(dt) {
  dayT = (dayT + dt / 420) % 1; const a = dayT * Math.PI * 2, h = Math.sin(a), light = Math.max(.42, Math.min(1, .62 + h * .75));
  world.mat.color.setScalar(light); world.matT.color.setScalar(Math.min(1, light + .05)); SKY.copy(skyDay).lerp(h > 0 ? skyDusk : skyNight, h > 0 ? Math.max(0, 1 - h * 4) : Math.min(1, -h * 3.2));
  // cada mundo tiñe el cielo y la niebla a su manera
  const bu = P.zone === 'world' ? unitOf(P.pos.x, P.pos.z) : 0; biomeK += ((BIOME[bu] ? 1 : 0) - biomeK) * Math.min(1, dt * 1.5); if (BIOME[bu]) biomeC.lerp(BIOME[bu], Math.min(1, dt * 1.5));
  SKY.lerp(biomeC, biomeK * .38 * Math.max(.2, light - .3));
  scene.fog.color.copy(SKY); sun.position.set(P.pos.x + Math.cos(a) * 170, Math.sin(a) * 150, P.pos.z - 50); sun.material.color.set(h > -.02 ? '#fff3b0' : '#dfe7ff'); clouds.material.color.setScalar(Math.max(.45, light));
}

/* ========== Bucle ========== */
const clock = new THREE.Clock(); let fpsA = 0, fpsN = 0, lowT = 0, secT = 0, miniT = 0, regenT = 0, combatT = 0, harvT = 0;
function loop() {
  requestAnimationFrame(loop); const dt = Math.min(clock.getDelta(), .1); if (!started) { renderer.render(scene, camera); return; }
  updatePlayer(dt); updateCamera(); world.update(P.pos.x, P.pos.z, viewR, 2); updateSky(dt);
  avatar?.tick(dt);
  for (const n of NPCS) { const d = Math.hypot(n.a.root.position.x - P.pos.x, n.a.root.position.z - P.pos.z); const v = d < 62 && P.zone === 'world'; n.a.root.visible = v; if (v) { n.a.tick(dt, d < 34); n.m.position.y = 2.95 + Math.sin(performance.now() / 320) * .08; } }
  for (const g of GEMS) { const v = P.zone === 'world' && Math.hypot(g.x - P.pos.x, g.z - P.pos.z) < 60; g.g.visible = v; if (v) g.g.rotation.y += dt; }
  updatePeers(dt); if (P.zone === 'arena') { updateBots(dt); updateCube(dt); if (dmgBuff > 0) dmgBuff -= dt; }
  if (hitHeld && !anyUI() && P.zone !== 'creative') attack();
  P.cd = Math.max(0, P.cd - dt); P.inv = Math.max(0, P.inv - dt); if (P.pcd > 0) { P.pcd = Math.max(0, P.pcd - dt); if (P.pcd === 0) powHud(); }
  CR.update(dt, Math.sin(dayT * Math.PI * 2) < -.05); updateProjs(dt);
  if (P.zone === 'world' && !P.dead && P.hp < 100 && performance.now() - P.lastHurt > 4000) { P.hp = Math.min(100, P.hp + 10 * dt); regenT += dt; if (regenT > .25 || P.hp >= 100) { regenT = 0; hpHud(); } }
  combatT -= dt; if (combatT <= 0) { combatT = .3; const near = P.zone === 'world' && CR.nearestDist() < 18; document.body.classList.toggle('combat', P.zone === 'world' && (near || P.hp < 100)); $('tHit').textContent = P.zone === 'creative' ? '✖' : (harv && CR.nearestDist() > 6 ? '⛏' : '⚔'); }
  if (P.zone === 'creative') { crTick += dt; if (crTick >= 1) { crTick -= 1; S.cr.used++; const l = creativeLeft(); $('crTime').textContent = fmt(l); $('crTime').classList.toggle('low', l <= 30); if (l === 60) toast('1 minute left!', 'warn'); if (l <= 0) exitCreative('⏰ Creative time is over. Solve more missions to earn more!'); } }
  harvT -= dt; if (harvT <= 0) { harvT = .15; findHarvest(); }
  findNearest(); sendPos(); if (P.zone === 'world') { beam.material.opacity = .28 + Math.sin(performance.now() / 400) * .1; }
  miniT += dt; if (miniT > .12 && mapReady) { miniT = 0; drawMap($('mini').getContext('2d'), 150, false); }
  secT += dt; if (secT > 1) { secT = 0; if (document.visibilityState === 'visible' && !isIdle()) S.time++; saveCloud(); if (S.time % 15 === 0) saveLocal(); idleCheck(); updateBeam(); if (P.pcd > 0) powHud(); }
  fpsA += dt; fpsN++; if (fpsA > 3) { const f = fpsN / fpsA; fpsA = fpsN = 0; if (f < 26 && (++lowT) > 1) { lowT = 0; if (viewR > 3) { viewR--; scene.fog.far = 18 + viewR * 16; scene.fog.near = scene.fog.far * .45; } } if (DEBUG) $('dbg').textContent = `${Math.round(f)} fps · r${viewR} · ${renderer.info.render.calls} calls`; }
  renderer.render(scene, camera); fluido.cuadro();
}
let lastInput = Date.now(); ['keydown', 'mousemove', 'touchstart', 'click'].forEach(e => addEventListener(e, () => { lastInput = Date.now(); if (isIdleOff) { isIdleOff = false; connectWorld(); toast('Reconnected!'); } }, { passive: true }));
const isIdle = () => Date.now() - lastInput > 120000;
function idleCheck() { if (!isIdleOff && Date.now() - lastInput > 240000 && NET.ok && P.zone !== 'arena' && !pq) { isIdleOff = true; netLeave(); setStatus('off'); } }

/* ========== Menú e inicio ========== */
function renderChars() {
  $('chars').innerHTML = CHARS.map((c, i) => `<button type="button" class="${i === S.char ? 'on' : ''}" data-i="${i}" aria-label="Character ${i + 1}"><img alt="" loading="lazy" src="assets/thumbs/character-${c}.png"></button>`).join('');
  $('chars').querySelectorAll('button').forEach(b => b.onclick = async () => { S.char = +b.dataset.i; renderChars(); if (previewAv) previewAv.load(S.char); sfx('click'); });
}
let previewAv = null;
async function start() {
  S.name = ($('name').value.trim().replace(/[<>]/g, '').slice(0, 14)) || S.name || 'Player'; if (me) S.name = me.first_name || S.name;
  if (!S.firstT) S.firstT = Date.now();
  saveLocal(); $('menu').classList.add('hidden'); $('hud').classList.remove('hidden');
  if (previewAv) { previewAv.dispose(); previewAv = null; }
  avatar = new Avatar(S.char, S.name); avatar.applyEq(S.eq);
  if (S.pos && S.pos[1] < 45) { const u = unitOf(S.pos[0], S.pos[2]); if (!u || unitOpen(u)) { P.pos.set(S.pos[0], S.pos[1] + .6, S.pos[2]); } }
  world.update(P.pos.x, P.pos.z, 2, 40); if (world.solidAt(P.pos.x, P.pos.y + .5, P.pos.z)) P.pos.y = world.topY(P.pos.x, P.pos.z) + .2;
  started = true; hud(); refreshMarkers(); refreshGates(); updateBeam(); playMusic('Music_SweetTalk');
  if (!isTouch) { lockPointer(); $('lockHint').classList.remove('hidden'); }
  document.getElementById('eslt-note')?.remove();
  if (isTouch) setTimeout(() => toast('Left thumb: move · Right thumb: look'), 1200);
  if (!S.seen) { S.seen = true; setTimeout(talkGuide, 500); }
  if ($('netOn').checked) connectWorld(); else setStatus('off');
  setInterval(() => { hudOnline(); if (party.code && !$('party').classList.contains('hidden')) renderParty(); }, 3000);
}
async function boot() {
  const bar = $('loadBar'); bar.style.width = '20%';
  await loadCloud(); bar.style.width = '40%';
  buildGates(); buildGems(); spawnNpcs(); applyBuild(); buildHotbar(); bar.style.width = '60%';
  setTimeout(paintMap, 30);
  await Promise.all(['a', 'p'].map(c => loadG(`assets/chars/character-${c}.glb`).catch(() => { }))); bar.style.width = '85%';
  P.yaw = Math.PI; world.update(P.pos.x, P.pos.z, 3, 60); bar.style.width = '100%';
  camera.position.set(CENTER - 22, 40, CENTER + 42); camera.lookAt(CENTER, 24, CENTER);
  $('loading').classList.add('hidden'); $('menu').classList.remove('hidden');
  $('name').value = me ? (me.first_name || me.name || '') : (S.name || ''); if (me) { $('name').disabled = true; $('who').innerHTML = `<span id="esltStatus"></span>📊 Playing as <b>${esc(me.first_name || me.name)}</b> (${esc(me.section || '')}). Your teacher will see your progress.`; }
  else { $('who').innerHTML = `<span id="esltStatus"></span>⚠️ You are not logged in. <button type="button" class="linkbtn" id="loginB">Log in</button> so your teacher sees your progress.`; $('loginB').onclick = () => openLogin(); }
  $('play').textContent = S.pts > 0 ? '▶ Continue' : '▶ Play'; renderChars(); $('play').onclick = () => { sfx('click'); start(); };
  $('bMute').onclick = toggleMute; $('bBag').onclick = () => openBag(); $('bLog').onclick = openLog; $('bMap').onclick = openMap; $('bParty').onclick = openParty; $('bChat').onclick = openChat; $('mini').onclick = openMap;
  $('crExit').onclick = () => exitCreative('Your build is saved.'); $('arExit').onclick = () => exitArena(); $('bCam').onclick = () => P.fp = !P.fp;
  $('bHelp').onclick = () => { openUI(); $('help').classList.remove('hidden'); };
  loop();
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { saveLocal(); saveCloud(true, true); flush(true); } });
if (DEBUG) window.TL = { get S() { return S; }, get avatar() { return avatar; }, THREE, applyEquip, P, world, gain, teleport, UNITS, enterArena, exitArena, enterCreative, talkCreative, refresh: () => { refreshMarkers(); refreshGates(); hud(); }, startQuest, NPCS, peers, NET, setParty, renderer, placeBlock, breakBlock, attack, bots, getNearest: () => nearest, interact, CR, LANDMARKS, castPower, GEMS, projs, start, setDay: v => dayT = v };
boot().catch(e => { console.error(e); $('loadMsg').textContent = 'Could not load the game. Refresh the page.'; });
