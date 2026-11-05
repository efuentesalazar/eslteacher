// ============================================================
//  MISSION 2050 · Future Agents  (8° básico · Unit 4 "Future matters")
//  Juego cooperativo en mundo abierto: equipos de hasta 4 agentes con código.
// ============================================================
import * as THREE from 'three';
import { scene, buildWorld, makeChar, makeRobot, setProgress, circles, boxes, animated, springs, cores, cellSpots, citizenSpots, world, WORLD_R, CORE_POS, TOWER, NOVA_POS, label, energyCell } from './world.js';
import { DISTRICTS, BOSS, CITIZENS, SKILLS, PHRASES } from './content.js';
import * as net from './net.js';
import { logAnswer, student } from './track.js';
const GAME = 'mission-2050-8b'; // id del juego en el Panel del profe

const $ = id => document.getElementById(id);
const CHARS = 'abcdefghijklmnopqr'.split('').map(l => `character-${l}`);
const TCOL = ['#ff4d8d', '#22b8ff', '#ffd23f', '#3fdc7a'];
const KCOL = { READ: '#1b6fd0', INF: '#8b5cf6', VOC: '#2ea64f', WILL: '#ff7a1a', COND: '#ff4d8d' };
const STEPS = ['read', 'gram', 'voc'];
const STEP_NAME = { read: 'Team Reading', gram: 'Grammar Gate', voc: 'Vocabulary Vault', boss: 'GLITCH Battle' };
const BOSS_POS = [TOWER[0] - 20, TOWER[1] + 20];
const thumb = c => `assets/chars/thumb/${c}.webp`;
const D = id => DISTRICTS.find(d => d.id === id);
const dist = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

// ---------------- progreso (se guarda en este equipo) ----------------
const SAVE_KEY = 'mission2050_8b_v1';
function fresh() { return { name: '', char: 'character-a', prog: { robot: 0, eco: 0, mars: 0, city: 0 }, cells: [], cit: {}, boss: false, stats: {}, stars: {}, intro: false }; }
let S = fresh();
try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { const o = JSON.parse(raw); S = Object.assign(fresh(), o); S.prog = Object.assign(fresh().prog, o.prog || {}); } } catch (e) { }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
const coresOn = () => DISTRICTS.filter(d => S.prog[d.id] >= 4).length;
const citDone = () => CITIZENS.filter(c => S.cit[c.id]).length;

// ---------------- audio ----------------
const sfxCache = {};
function sfx(n, v = 0.6) { try { const base = sfxCache[n] ||= new Audio(`assets/audio/${n}.ogg`); const a = base.cloneNode(); a.volume = v; a.play().catch(() => { }); } catch (e) { } }
const voice = n => sfx('v_' + n, 0.9);
const music = new Audio(); music.loop = true; music.volume = 0.28;
function playMusic(n) { if (music.dataset.n === n) return; music.dataset.n = n; music.src = `assets/audio/${n}.mp3`; music.play().catch(() => { }); }

// ---------------- render ----------------
const renderer = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const camera = new THREE.PerspectiveCamera(58, 1, 0.2, 2000);
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const cam = { yaw: 0, pitch: 0.36, dist: 9 };
scene.add(new THREE.HemisphereLight('#e4f4ff', '#5c8f4c', 1.15));
const sun = new THREE.DirectionalLight('#fff1d6', 2.1);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 5, far: 300 }); sun.shadow.bias = -0.0006;
scene.add(sun, sun.target);

// ---------------- estado ----------------
let mode = 'loading';      // loading | menu | lobby | play
let team = false;          // jugando en equipo
let modalOpen = false;
const player = { c: null, pos: new THREE.Vector3(0, 0, 14), vy: 0, ry: Math.PI, ground: true };
const keys = {};
const stick = { x: 0, y: 0 };
let runToggle = false, jumpQ = false;
const mixers = [];           // personajes que no son el jugador
const npcs = [];             // {kind, id, x, z, name, c, mark}
const mates = new Map();     // compañeros: id → {c, tgt, ry, anim, lab, ring, col, name}
const cellMeshes = [];
let nova = null, glitch = null;

// ---------------- entrada ----------------
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
  if (mode !== 'play' || modalOpen) return;
  if (e.code === 'Space') jumpQ = true;
  if (e.code === 'KeyE' || e.code === 'Enter') interact();
  if (e.code === 'KeyM') $('mini').classList.toggle('big');
  if (e.code === 'KeyT') togglePhrases();
  if (e.code === 'Digit1') emote('interact-right');
  if (e.code === 'Digit2') emote('emote-yes');
});
addEventListener('keyup', e => { keys[e.code] = false; });
const cv = $('c'); let drag = null;
cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', e => { if (!drag || drag.id !== e.pointerId) return; cam.yaw -= (e.clientX - drag.x) * 0.006; cam.pitch = THREE.MathUtils.clamp(cam.pitch + (e.clientY - drag.y) * 0.004, 0.05, 1.25); drag.x = e.clientX; drag.y = e.clientY; });
cv.addEventListener('pointerup', () => drag = null); cv.addEventListener('pointercancel', () => drag = null);
cv.addEventListener('wheel', e => { cam.dist = THREE.MathUtils.clamp(cam.dist + e.deltaY * 0.01, 4, 22); }, { passive: true });
const isTouch = matchMedia('(pointer: coarse)').matches;
if (isTouch) {
  const st = $('stick'), knob = st.firstElementChild; let sid = null;
  const move = e => { const r = st.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } stick.x = x; stick.y = y; knob.style.transform = `translate(${x * 40}px,${y * 40}px)`; };
  st.addEventListener('pointerdown', e => { sid = e.pointerId; st.setPointerCapture(sid); move(e); });
  st.addEventListener('pointermove', e => { if (e.pointerId === sid) move(e); });
  const end = () => { sid = null; stick.x = stick.y = 0; knob.style.transform = ''; };
  st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
  $('tJump').addEventListener('pointerdown', () => { jumpQ = true; });
  $('tAct').addEventListener('pointerdown', () => interact());
  $('tRun').addEventListener('pointerdown', () => { runToggle = !runToggle; $('tRun').classList.toggle('on', runToggle); });
  $('help').textContent = 'Joystick: move · Drag: camera · Run: go fast';
}
$('prompt').addEventListener('click', () => interact());
$('mini').addEventListener('click', () => $('mini').classList.toggle('big'));

// ---------------- ayudas de interfaz ----------------
function esc(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function toast(t, ms = 2200) { const el = $('toast'); el.innerHTML = t; el.style.opacity = 1; clearTimeout(el._t); el._t = setTimeout(() => el.style.opacity = 0, ms); }
function openModal(html) { $('mbox').innerHTML = html; $('modal').classList.remove('hidden'); modalOpen = true; }
function closeModal() { $('modal').classList.add('hidden'); modalOpen = false; }
function feed(who, text, col = '#fff') { const el = document.createElement('div'); el.innerHTML = `<b style="color:${col}">${esc(who)}:</b> ${esc(text)}`; $('feed').appendChild(el); setTimeout(() => el.remove(), 7200); while ($('feed').children.length > 5) $('feed').firstChild.remove(); }
function avatarHtml(char, icon) { return `<div class="avatar">${char ? `<img src="${thumb(char)}" alt="">` : icon || '🤖'}</div>`; }
function say(name, role, char, text, buttons) {
  return new Promise(res => {
    openModal(`<div class="speaker">${avatarHtml(char)}<div style="flex:1"><h2>${esc(name)}</h2>${role ? `<div class="role">${esc(role)}</div>` : ''}<div class="bubble">${text}</div></div></div><div class="foot">${buttons.map((b, i) => `<button class="btn ${b[1] || ''}" data-i="${i}">${b[0]}</button>`).join('')}</div>`);
    $('mbox').querySelectorAll('.foot .btn').forEach(b => b.onclick = () => { sfx('click'); closeModal(); res(+b.dataset.i); });
  });
}
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(a, r = Math.random) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function prep(it, r) { const order = shuffle(it.o.map((_, i) => i), r); return { ...it, opts: order.map(i => it.o[i]), correct: order.indexOf(it.a) }; }
function record(it, j, ok, activity, t0) {
  const k = it.k; S.stats[k] ||= [0, 0]; S.stats[k][1]++; if (ok) S.stats[k][0]++; save();
  logAnswer(GAME, { activity, item: { q: it.q, k }, chosen: it.opts[j], right: it.opts[it.correct], ok, ms: performance.now() - t0 });
}

// ---------------- equipo ----------------
const myName = () => S.name || 'Agent';
const memberList = () => net.members();
const nameOf = id => (memberList().find(m => m.id === id) || {}).name || 'a teammate';
const colOf = id => { const i = memberList().findIndex(m => m.id === id); return TCOL[(i < 0 ? 0 : i) % 4]; };
function meInfo() { return { name: myName(), char: S.char, prog: { ...S.prog }, boss: S.boss, started: mode === 'play' }; }

function posOf(id) {
  if (id === net.NET.id) return player.pos;
  const m = mates.get(id); return m && m.c ? m.c.root.position : null;
}

net.on('roster', () => {
  syncMates();
  adoptProgress();
  if (mode === 'lobby') { renderLobby(); if ([...net.NET.peers.values()].some(p => p.started)) enterPlay(); }
  if (CH) { checkAgree(); renderCH(); }
});
net.on('join', p => { if (mode === 'play') { feed('📡', `${p.name || 'An agent'} joined the team!`); sfx('beep', 0.3); } });
net.on('leave', p => { if (mode === 'play') feed('📡', `${p.name || 'An agent'} left the team.`); removeMate(p.id); });
net.on('go', () => { if (mode === 'lobby') enterPlay(); });
net.on('pos', m => { const mt = mates.get(m.id); if (!mt) return; mt.tgt.set(m.x, m.y, m.z); mt.ry = m.ry; mt.anim = m.a; mt.seen = performance.now(); });
net.on('say', m => { const mt = mates.get(m.id); feed(m.n || nameOf(m.id), m.t, colOf(m.id)); if (mt && mt.c) bubble(mt.c.root, m.t); sfx('click', 0.35); });
net.on('emo', m => { const mt = mates.get(m.id); if (mt && mt.c) mt.c.play(m.a, 0.15, true), mt.emoUntil = performance.now() + 1500; });
net.on('cell', m => collectCell(m.n, false, m.n2 || nameOf(m.id)));
net.on('pads', m => setProg(m.d, 4));
net.on('start', m => { if (mode === 'play' && m.members.includes(net.NET.id)) startChallenge(m); });
net.on('vote', m => { if (!CH || CH.cid !== m.cid) return; (CH.votes[m.i] ||= {})[m.id] = m.j; if (m.i === CH.i) { checkAgree(); renderCH(); } });
net.on('rev', m => { if (CH && CH.cid === m.cid && m.i === CH.i) reveal(m.j, false); });
net.on('next', m => { if (CH && CH.cid === m.cid && m.i > CH.i) goNext(m.i, false); });
net.on('end', m => { if (CH && CH.cid === m.cid) { CH = null; closeModal(); toast(`${esc(nameOf(m.id))} closed the challenge.`); } });

async function syncMates() {
  const list = memberList();
  for (const m of list) {
    if (m.self) continue;
    let mt = mates.get(m.id);
    const col = colOf(m.id);
    if (!mt) {
      mt = { tgt: new THREE.Vector3(m.x ?? 0, 0, m.z ?? 14), ry: 0, anim: 'idle', col: null, name: m.name, c: null };
      mates.set(m.id, mt);
      const c = await makeChar(m.char || 'character-a');
      if (mates.get(m.id) !== mt) continue;   // se fue mientras cargaba
      mt.c = c; c.root.position.copy(mt.tgt); scene.add(c.root);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.8, 24), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.06; c.root.add(ring); mt.ring = ring;
    }
    if (mt.c && (mt.col !== col || mt.name !== m.name)) {
      mt.col = col; mt.name = m.name;
      if (mt.lab) mt.c.root.remove(mt.lab);
      mt.lab = label(m.name || 'Agent', col, 2.6); mt.lab.position.y = 2.45; mt.c.root.add(mt.lab);
      mt.ring.material.color.set(col);
    }
  }
}
function removeMate(id) { const mt = mates.get(id); if (mt && mt.c) scene.remove(mt.c.root); mates.delete(id); }

function adoptProgress() {
  for (const p of net.NET.peers.values()) {
    if (p.prog) for (const d of DISTRICTS) if ((p.prog[d.id] || 0) > S.prog[d.id]) setProg(d.id, p.prog[d.id], true);
    if (p.boss && !S.boss) { S.boss = true; save(); refreshWorld(); }
  }
}

function bubble(obj, text) {
  const b = label(text.length > 26 ? text.slice(0, 25) + '…' : text, '#14203a', 4.2, 30, 'rgba(255,255,255,.95)');
  b.position.y = 3.2; obj.add(b); setTimeout(() => obj.remove(b), 4000);
}
function togglePhrases() {
  const el = $('phrases');
  if (el.classList.contains('hidden')) {
    el.innerHTML = PHRASES.map((p, i) => `<button data-i="${i}">💬 ${esc(p)}</button>`).join('');
    el.querySelectorAll('button').forEach(b => b.onclick = () => { const t = PHRASES[+b.dataset.i]; net.send('say', { t, n: myName() }); feed(myName() + ' (you)', t, colOf(net.NET.id)); if (player.c) bubble(player.c.root, t); el.classList.add('hidden'); });
    el.classList.remove('hidden');
  } else el.classList.add('hidden');
}
$('bSay').onclick = togglePhrases;
function emote(a) { if (!player.c || modalOpen) return; player.c.play(a, 0.15, true); net.send('emo', { a }); }
$('bWave').onclick = () => emote('interact-right');
$('bYes').onclick = () => emote('emote-yes');

// ---------------- progreso del equipo ----------------
function setProg(d, v, quiet = false) {
  if (v <= S.prog[d]) return;
  const before = coresOn();
  S.prog[d] = v; save(); net.updateMe({ prog: { ...S.prog } });
  refreshWorld(d === 'mars' && v >= 4 && !quiet);
  if (v >= 4 && !quiet) {
    sfx('power', 0.8); voice('objective_achieved');
    toast(`${D(d).icon} ${D(d).done}`, 4500);
    if (coresOn() === 4 && before < 4) setTimeout(() => { toast('⚡ All 4 districts are online! The GLITCH Tower shield is down!', 5000); sfx('door'); }, 4800);
  }
}
function refreshWorld(launch = false) {
  const n = Math.min(4, team ? Math.max(1, memberList().length) : 1);
  for (const d of DISTRICTS) cores[d.id] && cores[d.id].setStep(S.prog[d.id], n);
  if (world.towerField) world.towerField.set(coresOn() < 4);
  if (world.rocket) {
    if (launch) world.launch = { t0: performance.now() / 1000 };
    else if (S.prog.mars >= 4 && !world.launch) world.rocket.visible = false;
  }
  if (glitch) glitch.root.visible = !S.boss;
  for (const n of npcs) updateMark(n);
  for (let i = 0; i < cellMeshes.length; i++) if (cellMeshes[i]) cellMeshes[i].visible = !S.cells.includes(i);
  hudStats();
}

// ---------------- desafíos en equipo (todos ven lo mismo y votan) ----------------
let CH = null;
const activeIds = () => CH.members.filter(id => id === net.NET.id || net.NET.peers.has(id));

function requestChallenge(kind, d) {
  if (CH) return;
  const list = memberList();
  const center = kind === 'boss' ? BOSS_POS : cores[d].npc;
  if (team && list.length > 1) {
    const far = list.filter(m => { if (m.self) return false; const p = posOf(m.id); return !p || dist(p.x, p.z, center[0], center[1]) > 22; });
    if (far.length) {
      toast(`👥 Gather your team here first! (${list.length - far.length}/${list.length} agents)`, 3200);
      const where = kind === 'boss' ? 'the GLITCH Tower' : D(d).name;
      net.send('say', { t: `Come to ${where}, team!`, n: myName() }); feed(myName() + ' (you)', `Come to ${where}, team!`, colOf(net.NET.id));
      return;
    }
  }
  const msg = { cid: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), kind, d, seed: Math.floor(Math.random() * 1e9), members: list.map(m => m.id) };
  net.send('start', msg); startChallenge(msg);
}

function startChallenge(msg) {
  if (CH && CH.cid !== msg.cid && CH.kind === msg.kind && CH.d === msg.d && msg.cid > CH.cid) return; // dos empezaron a la vez: gana el primero
  closeModal(); $('phrases').classList.add('hidden');
  const r = rng(msg.seed);
  let src;
  if (msg.kind === 'boss') src = shuffle(BOSS.items.slice(0, 7), r).concat(BOSS.items.slice(7));
  else if (msg.kind === 'read') src = D(msg.d).reading.q;
  else src = shuffle(msg.kind === 'gram' ? D(msg.d).grammar.items : D(msg.d).vocab.items, r);
  CH = { ...msg, items: src.map(it => prep(it, r)), i: 0, votes: {}, first: {}, res: [], revealed: -1, correct: 0, peek: {}, peekPart: {}, t0: performance.now() };
  sfx('open'); if (msg.kind === 'boss') playMusic('m_boss');
  renderCH();
}

function chTitle() {
  if (CH.kind === 'boss') return '⚡ GLITCH Battle: fix the broken predictions!';
  const d = D(CH.d); return `${d.icon} ${d.name} · ${CH.kind === 'read' ? d.reading.title : CH.kind === 'gram' ? d.grammar.title : d.vocab.title}`;
}

function renderCH() {
  if (!CH) return;
  const it = CH.items[CH.i], n = CH.members.length, me = net.NET.id, myIdx = Math.max(0, CH.members.indexOf(me));
  const v = CH.votes[CH.i] || {}, done = CH.revealed === CH.i;
  const prevScroll = $('mbox').querySelector('.parts')?.scrollTop || 0;
  const prog = CH.items.map((_, j) => `<i class="${j < CH.i || (j === CH.i && done) ? (CH.res[j] ? 'ok' : 'no') : j === CH.i ? 'cur' : ''}"></i>`).join('');
  // pregunta: en gramática, vocabulario y jefe, un agente distinto "lee" cada pregunta en voz alta
  const reader = CH.members[CH.i % n];
  const seeQ = CH.kind === 'read' || n === 1 || reader === me || CH.peek[CH.i] || done;
  const qHtml = seeQ ? `<div class="q">${it.q}</div>` : `<div class="hidq">🎧 <b style="color:${colOf(reader)}">${esc(nameOf(reader))}</b> has this question. Ask: <i>"Can you read the question, please?"</i><br><button class="btn alt" id="peek" style="font-size:13px;padding:5px 10px;margin-top:6px">👀 Show me (only if you can't hear)</button></div>`;
  const roleNote = (CH.kind !== 'read' && n > 1 && reader === me && !done) ? `<div class="tstat">🎤 You are the reader! Read the question aloud for your team.</div>` : '';
  const opts = it.opts.map((o, j) => {
    const vs = CH.members.filter(id => v[id] === j).map(id => `<i style="background:${colOf(id)}">${esc((nameOf(id)[0] || '?').toUpperCase())}</i>`).join('');
    const cls = done ? (j === it.correct ? 'ok' : j === CH.agreed ? 'no' : '') : (v[me] === j ? 'mine' : '');
    return `<button class="opt ${cls}" data-j="${j}" ${done ? 'disabled' : ''}>${String.fromCharCode(65 + j)}. ${esc(o)}<span class="votes">${n > 1 ? vs : ''}</span></button>`;
  }).join('');
  let status = '';
  if (!done && n > 1) {
    const act = activeIds(), waiting = act.filter(id => v[id] === undefined);
    if (waiting.length) status = `<div class="tstat">⏳ Waiting for: ${waiting.map(id => `<b style="color:${colOf(id)}">${esc(id === me ? 'you' : nameOf(id))}</b>`).join(', ')}</div>`;
    else status = `<div class="tstat warn">🗣️ Your team doesn't agree yet. Talk in English and choose the <b>same</b> answer!</div>`;
  }
  const why = done ? `<div class="why ${CH.res[CH.i] ? 'ok' : 'no'}">${CH.res[CH.i] ? '✔ Correct, team!' : '✘ Not this time.'} ${it.why}</div>` : '';
  const foot = done ? `<button class="btn" id="next">${CH.i < CH.items.length - 1 ? 'Next ➜' : 'Finish ✔'}</button>` : '';
  const card = `<div class="qcard"><div class="progress">${prog}</div><span class="tag" style="background:${KCOL[it.k]}">${SKILLS[it.k]}</span>${qHtml}${roleNote}<div class="opts">${opts}</div>${status}${why}<div class="foot">${foot}</div></div>`;
  let body = card;
  if (CH.kind === 'read') {
    const rd = D(CH.d).reading;
    const parts = rd.parts.map((p, pi) => {
      const owner = CH.members[pi % n];
      if (owner === me || n === 1 || CH.peekPart[pi]) return `<div class="part"><b class="pn">Part ${pi + 1}${n > 1 && owner === me ? ' · your part' : ''}</b>${esc(p)}</div>`;
      return `<div class="part locked">🔒 Part ${pi + 1} belongs to <b style="color:${colOf(owner)}">${esc(nameOf(owner))}</b>. Ask: <i>"What does your part say?"</i><br><button class="btn alt" data-pp="${pi}" style="font-size:12px;padding:4px 9px">👀 Peek</button></div>`;
    }).join('');
    body = `<div class="reading"><div class="parts"><h3 style="margin:0">${esc(rd.title)}</h3>${n > 1 ? `<div class="small">Each agent has different parts. Share the information in English!</div>` : ''}${parts}</div>${card}</div>`;
  }
  const hp = CH.kind === 'boss' ? `<div class="row" style="margin-bottom:8px"><b>GLITCH power</b><div class="hp"><i style="width:${100 - CH.correct / CH.items.length * 100}%"></i></div><span class="small">Fix ${5 - Math.min(5, CH.correct)} more to win · ${CH.items.length - CH.i - (done ? 1 : 0)} left</span></div>` : '';
  openModal(`<div class="row" style="justify-content:space-between"><h2>${esc(chTitle())}</h2><button class="btn alt" id="chExit" style="font-size:13px;padding:5px 10px">✖ Exit</button></div>${hp}${n > 1 ? `<div class="small" style="margin-bottom:6px">👥 Team answer: everybody must choose the same option.</div>` : ''}${body}`);
  const pe = $('mbox').querySelector('.parts'); if (pe) pe.scrollTop = prevScroll;
  $('mbox').querySelectorAll('.opt').forEach(b => b.onclick = () => vote(+b.dataset.j));
  $('mbox').querySelectorAll('[data-pp]').forEach(b => b.onclick = () => { CH.peekPart[+b.dataset.pp] = true; renderCH(); });
  if ($('peek')) $('peek').onclick = () => { CH.peek[CH.i] = true; renderCH(); };
  if ($('next')) $('next').onclick = () => { sfx('page'); goNext(CH.i + 1, true); };
  $('chExit').onclick = () => { if (!confirm('Exit this challenge? (It closes for the whole team.)')) return; net.send('end', { cid: CH.cid }); CH = null; closeModal(); playMusic('m_explore'); };
}

function vote(j) {
  if (!CH || CH.revealed === CH.i) return;
  const it = CH.items[CH.i];
  (CH.votes[CH.i] ||= {})[net.NET.id] = j;
  if (CH.first[CH.i] === undefined) { CH.first[CH.i] = j; record(it, j, j === it.correct, chTitle(), CH.t0); }
  net.send('vote', { cid: CH.cid, i: CH.i, j });
  sfx('click'); checkAgree(); renderCH();
}
function checkAgree() {
  if (!CH || CH.revealed === CH.i) return;
  const v = CH.votes[CH.i] || {}, act = activeIds();
  if (act.length && act.every(id => v[id] !== undefined)) { const vals = act.map(id => v[id]); if (vals.every(x => x === vals[0])) reveal(vals[0], true); }
}
function reveal(j, broadcast) {
  if (!CH || CH.revealed === CH.i) return;
  CH.revealed = CH.i; CH.agreed = j;
  const ok = j === CH.items[CH.i].correct; CH.res[CH.i] = ok; if (ok) CH.correct++;
  if (broadcast) net.send('rev', { cid: CH.cid, i: CH.i, j });
  sfx(ok ? 'ok' : 'bad'); if (CH.kind === 'boss') sfx(ok ? 'zap' : 'hit', 0.5);
  renderCH();
}
function goNext(i, broadcast) {
  if (!CH) return;
  if (broadcast) net.send('next', { cid: CH.cid, i });
  CH.i = i; CH.t0 = performance.now();
  if (CH.i >= CH.items.length) finishCH(); else renderCH();
}
function finishCH() {
  const c = CH; CH = null; playMusic('m_explore');
  const total = c.items.length, ok = c.correct;
  const stars = ok === total ? 3 : ok >= Math.ceil(total * 0.6) ? 2 : 1;
  if (c.kind === 'boss') {
    if (ok >= 5) { winBoss(ok, total); return; }
    sfx('bad'); return say('GLITCH', 'angry computer program', null, `HA HA HA! You fixed only <b>${ok}</b> of my ${total} sentences. MY POWER IS BACK! If you want to defeat me, you will need at least 5. Talk to me again when you are ready.`, [['Try again later', 'alt']]);
  }
  const key = `${c.d}-${c.kind}`; S.stars[key] = Math.max(S.stars[key] || 0, stars); save();
  const step = STEPS.indexOf(c.kind) + 1;
  setProg(c.d, step);
  const d = D(c.d);
  const next = step === 1 ? 'Next: the <b>Grammar Gate</b>. Talk to ' + esc(d.npc.name) + ' again.' : step === 2 ? 'Next: the <b>Vocabulary Vault</b>. Talk to ' + esc(d.npc.name) + ' again.' : `Last step: <b>stand on the power pads</b> around the core${team && memberList().length > 1 ? ' — every agent on a different pad' : ''}!`;
  sfx('star'); if (step === 3) voice('objective_achieved');
  openModal(`<div class="cert"><h2>${d.icon} ${STEP_NAME[c.kind]} complete!</h2><div style="font-size:40px;margin:6px 0">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><p style="font-size:19px">Team result: <b>${ok}/${total}</b> correct.</p><p style="font-size:17px">${next}</p><div class="foot" style="justify-content:center"><button class="btn" id="ok">Continue</button></div></div>`);
  $('ok').onclick = () => { sfx('click'); closeModal(); };
}

// ---------------- jefe final ----------------
function winBoss(ok, total) {
  S.boss = true; save(); net.updateMe({ boss: true });
  voice('mission_completed'); sfx('win', 0.7);
  if (glitch) { const g = glitch.root; const t0 = performance.now(); const f = () => { const k = (performance.now() - t0) / 1500; g.scale.setScalar(Math.max(0.01, 1 - k)); g.rotation.y += 0.3; if (k < 1) requestAnimationFrame(f); else g.visible = false; }; f(); }
  certificate(ok, total);
}
function certificate(ok, total) {
  const names = memberList().map(m => esc(m.name || 'Agent')).join(', ');
  const rows = Object.keys(SKILLS).map(k => { const s = S.stats[k] || [0, 0]; return `<tr><td>${SKILLS[k]}</td><td>${s[1] ? Math.round(s[0] / s[1] * 100) + '%' : '—'}</td></tr>`; }).join('');
  openModal(`<div class="cert"><h2 style="font-size:32px">🏆 Mission 2050 complete!</h2><p style="font-size:18px">GLITCH is offline and Skyport is safe again.${ok ? ` Final battle: <b>${ok}/${total}</b>.` : ''}</p><p><b>Future Agents:</b> ${names}</p><table>${rows}<tr><td>🔋 Energy cells</td><td>${S.cells.length}/${cellSpots.length}</td></tr><tr><td>🤝 Citizens helped</td><td>${citDone()}/${CITIZENS.length}</td></tr></table><p class="small">Your answers (first attempt) are shown above. Keep exploring to find all the energy cells and help every citizen!</p><div class="foot" style="justify-content:center"><button class="btn" id="ok">Keep exploring</button></div></div>`);
  $('ok').onclick = () => { sfx('click'); closeModal(); };
}

// ---------------- ciudadanos (misiones individuales) ----------------
async function talkCitizen(c) {
  if (S.cit[c.id]) return say(c.name, c.role, c.char, `Thanks again, agent! ${esc(c.text.split('.')[0])}.`, [['Bye!', 'alt']]);
  const go = await say(c.name, c.role, c.char, esc(c.text), [['Answer my question', ''], ['Later', 'alt']]);
  if (go !== 0) return;
  const it = prep(c.q, Math.random), t0 = performance.now();
  openModal(`<div class="speaker">${avatarHtml(c.char)}<div style="flex:1"><h2>${esc(c.name)}</h2><div class="bubble" style="font-size:16px">${esc(c.text)}</div></div></div><div class="qcard" style="margin-top:12px"><span class="tag" style="background:${KCOL[it.k]}">${SKILLS[it.k]}</span><div class="q">${it.q}</div><div class="opts">${it.opts.map((o, j) => `<button class="opt" data-j="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join('')}</div><div id="why"></div><div class="foot" id="qf"></div></div>`);
  $('mbox').querySelectorAll('.opt').forEach(b => b.onclick = () => {
    const j = +b.dataset.j, ok = j === it.correct;
    record(it, j, ok, `Citizen: ${c.name}`, t0); sfx(ok ? 'ok' : 'bad');
    $('mbox').querySelectorAll('.opt').forEach((x, xj) => { x.disabled = true; if (xj === it.correct && ok) x.classList.add('ok'); else if (xj === j && !ok) x.classList.add('no'); });
    $('why').innerHTML = `<div class="why ${ok ? 'ok' : 'no'}">${ok ? '✔ Correct! ' + it.why : '✘ Not quite. Read the text again and try once more.'}</div>`;
    $('qf').innerHTML = ok ? '<button class="btn">Great! ✔</button>' : '<button class="btn alt">Try again</button>';
    $('qf').firstChild.onclick = () => {
      closeModal();
      if (ok) { S.cit[c.id] = true; save(); refreshWorld(); sfx('coin'); toast(`🤝 You helped ${esc(c.name)}! (${citDone()}/${CITIZENS.length})`); if (citDone() === CITIZENS.length) setTimeout(() => toast('🌟 You helped every citizen in Skyport!', 3500), 2400); }
      else talkCitizen(c);
    };
  });
}

// ---------------- personajes del mundo ----------------
async function spawnNPCs() {
  for (const d of DISTRICTS) {
    const [x, z] = cores[d.id].npc;
    const c = await makeChar(d.npc.char); c.root.position.set(x, 0, z); c.root.rotation.y = cores[d.id].npcRy; scene.add(c.root); mixers.push(c.mixer);
    const l = label(d.npc.name, '#fff', 3.2); l.position.y = 2.5; c.root.add(l);
    npcs.push({ kind: 'district', id: d.id, x, z, name: d.npc.name, c });
  }
  for (const ci of CITIZENS) {
    const [x, z, ry] = citizenSpots[ci.id];
    const c = await makeChar(ci.char); c.root.position.set(x, 0, z); c.root.rotation.y = ry; scene.add(c.root); mixers.push(c.mixer);
    const l = label(ci.name, '#fff', 2.6); l.position.y = 2.5; c.root.add(l);
    npcs.push({ kind: 'citizen', id: ci.id, x, z, name: ci.name, c, data: ci });
  }
  nova = await makeRobot(2.3, '#a8ecff');
  if (nova) { nova.root.position.set(NOVA_POS[0], 0, NOVA_POS[1]); nova.root.rotation.y = -0.6; scene.add(nova.root); nova.play('hello'); const l = label('NOVA', '#22b8ff', 2.6); l.position.y = 2.9; nova.root.add(l); }
  npcs.push({ kind: 'nova', id: 'nova', x: NOVA_POS[0], z: NOVA_POS[1], name: 'NOVA', c: nova });
  glitch = await makeRobot(7, '#ff3b6b');
  if (glitch) { glitch.root.position.set(BOSS_POS[0], 0, BOSS_POS[1]); glitch.root.rotation.y = Math.atan2(-BOSS_POS[0], -BOSS_POS[1]); scene.add(glitch.root); glitch.play('attackspin'); const l = label('GLITCH', '#ff3b6b', 5); l.position.y = 8; glitch.root.add(l); }
  circles.push({ x: BOSS_POS[0], z: BOSS_POS[1], r: 2.2 });
  npcs.push({ kind: 'boss', id: 'glitch', x: BOSS_POS[0], z: BOSS_POS[1], name: 'GLITCH', c: glitch, r: 7 });
  for (const n of npcs) { if (!n.c) continue; n.mark = label('!', '#ffd23f', 2.4, 60); n.mark.position.y = n.kind === 'boss' ? 9.5 : 3.3; n.c.root.add(n.mark); updateMark(n); }
}
function updateMark(n) {
  if (!n.mark) return;
  let show = false, t = '!';
  if (n.kind === 'district') { show = S.intro && S.prog[n.id] < 3; }
  else if (n.kind === 'citizen') { show = !S.cit[n.id]; t = '?'; }
  else if (n.kind === 'nova') show = !S.intro;
  else if (n.kind === 'boss') show = coresOn() === 4 && !S.boss;
  if (n.markT !== t) { const p = n.mark.parent, y = n.mark.position.y; p.remove(n.mark); n.mark = label(t, t === '?' ? '#7ad3ff' : '#ffd23f', 2.4, 60); n.mark.position.y = y; p.add(n.mark); n.markT = t; }
  n.mark.visible = show;
}

function spawnCells() {
  cellSpots.forEach(([x, y, z], i) => { const m = energyCell(); m.position.set(x, y, z); m.visible = !S.cells.includes(i); scene.add(m); cellMeshes[i] = m; });
}
function collectCell(i, mine, who) {
  if (S.cells.includes(i)) return;
  S.cells.push(i); save(); if (cellMeshes[i]) cellMeshes[i].visible = false; hudStats();
  if (mine) { sfx('coin'); net.send('cell', { n: i, n2: myName() }); toast(`🔋 Energy cell! (${S.cells.length}/${cellSpots.length})`, 1400); }
  else if (mode === 'play') feed('🔋', `${who} found an energy cell (${S.cells.length}/${cellSpots.length})`);
  if (S.cells.length === cellSpots.length) setTimeout(() => toast('🔋 Your team found ALL the energy cells!', 3500), 1500);
}

// ---------------- interacción ----------------
function nearest() {
  let best = null, bd = 1e9;
  for (const n of npcs) { const d = dist(player.pos.x, player.pos.z, n.x, n.z); const r = n.r || 3.4; if (d < r && d < bd) { bd = d; best = n; } }
  return best;
}
async function interact() {
  if (mode !== 'play' || modalOpen || CH) return;
  const n = nearest(); if (!n) return;
  sfx('click');
  if (n.kind === 'nova') return talkNova();
  if (n.kind === 'citizen') return talkCitizen(n.data);
  if (n.kind === 'boss') return talkBoss();
  return talkDistrict(D(n.id));
}
async function talkNova() {
  if (nova) nova.play('hello');
  const lines = [
    "Hello, agents! I'm NOVA, Skyport's helper robot. Welcome to the year <b>2050</b>!",
    "Bad news: <b>GLITCH</b>, an angry computer program, has switched off our four districts. If we don't stop it, Skyport will shut down forever!",
    "Visit the <b>Robot Lab</b> (east), the <b>Eco Dome</b> (south), <b>Mars Base</b> (west) and <b>Smart City</b> (north). In each district you will <b>read</b>, open the <b>Grammar Gate</b> and the <b>Vocabulary Vault</b>. Then stand on the power pads to switch it back on.",
    team && memberList().length > 1 ? "This is a team mission! Every agent will get <b>different information</b>, and the team must choose the <b>same answer</b>. So talk to each other in English!" : "You are playing solo today. If you play with a team next time, each agent will get different information!",
    "Explore the island, too: <b>12 citizens</b> need your help and <b>32 energy cells</b> are hidden around Skyport. Use the orange <b>springs</b> to reach the sky platforms. Good luck, agents!"
  ];
  for (let i = 0; i < lines.length; i++) { const r = await say('NOVA', 'helper robot', null, lines[i], [[i < lines.length - 1 ? 'Next ➜' : "Let's go! 🚀", '']]); if (r !== 0) break; }
  if (!S.intro) { S.intro = true; save(); refreshWorld(); voice('go'); }
}
async function talkDistrict(d) {
  const st = S.prog[d.id], npc = d.npc;
  if (!S.intro) return say(npc.name, npc.role, npc.char, 'Hello! Please talk to <b>NOVA</b> in the central plaza first. She will explain the mission.', [['OK', '']]);
  if (st >= 4) return say(npc.name, npc.role, npc.char, `${esc(d.done)} Thank you, agents!`, [['You\'re welcome!', '']]);
  if (st === 3) { const n = Math.min(4, team ? memberList().length : 1); return say(npc.name, npc.role, npc.char, n > 1 ? `Almost there! Now <b>every agent must stand on a different power pad</b> at the same time (${n} pads). Go!` : 'Almost there! <b>Stand on the glowing power pad</b> next to the core to switch the district back on.', [['On my way!', '']]); }
  const kind = STEPS[st];
  const text = st === 0 ? d.intro : st === 1 ? `Great reading, agents! Now open the <b>${esc(d.grammar.title.split(':')[0])}</b>. ${team ? 'Each of you will read some questions aloud.' : ''}` : `Excellent! The last lock is the <b>Vocabulary Vault</b>. Use the context to guess the meaning of each word.`;
  const r = await say(npc.name, npc.role, npc.char, text, [[`▶ Start: ${STEP_NAME[kind]}`, 'pink'], ['Later', 'alt']]);
  if (r === 0) requestChallenge(kind, d.id);
}
async function talkBoss() {
  if (S.boss) return say('GLITCH', 'offline', null, '…zzz… GLITCH IS OFFLINE… Skyport is safe. (You can still explore the island!)', [['Bye, GLITCH!', '']]);
  if (coresOn() < 4) return toast('⚡ The shield is up. Switch on all 4 districts first!');
  const r = await say('GLITCH', 'angry computer program', null, BOSS.intro, [['⚔️ Start the battle', 'pink'], ['Not yet', 'alt']]);
  if (r === 0) requestChallenge('boss', null);
}

// ---------------- objetivo, flecha y HUD ----------------
function objective() {
  if (!S.intro) return { t: 'Start', d: 'Talk to <b>NOVA</b>, the robot in the central plaza.', at: NOVA_POS };
  const left = DISTRICTS.filter(d => S.prog[d.id] < 4);
  if (left.length) {
    left.sort((a, b) => dist(player.pos.x, player.pos.z, ...CORE_POS[a.id]) - dist(player.pos.x, player.pos.z, ...CORE_POS[b.id]));
    const d = left[0], st = S.prog[d.id];
    const txt = st === 3 ? `${d.icon} ${d.name}: stand on the power pads${team && memberList().length > 1 ? ' with your team' : ''}!` : `${d.icon} Go to <b>${d.name}</b> and talk to ${esc(d.npc.name)} (${STEP_NAME[STEPS[st]]}).`;
    return { t: `Districts online: ${coresOn()}/4`, d: txt, at: st === 3 ? CORE_POS[d.id] : cores[d.id].npc };
  }
  if (!S.boss) return { t: 'Final mission', d: '⚡ Go to the <b>GLITCH Tower</b> (north-east) and defeat GLITCH together!', at: BOSS_POS };
  const c = CITIZENS.find(c => !S.cit[c.id]);
  if (c) return { t: 'Skyport is safe!', d: `Explore! Help the citizens (🤝 ${citDone()}/12) and find energy cells (🔋 ${S.cells.length}/${cellSpots.length}).`, at: citizenSpots[c.id] };
  return { t: 'Skyport is safe!', d: `Find all the energy cells (🔋 ${S.cells.length}/${cellSpots.length}).`, at: null };
}
let lastObj = '';
function updateHUD() {
  const o = objective();
  const key = o.t + o.d; if (key !== lastObj) { $('objT').textContent = o.t; $('objD').innerHTML = o.d; lastObj = key; }
  const ar = $('arrow');
  if (o.at && !modalOpen) {
    const dd = dist(player.pos.x, player.pos.z, o.at[0], o.at[1]);
    if (dd < 6) ar.style.display = 'none';
    else { ar.style.display = ''; const a = Math.atan2(o.at[0] - player.pos.x, o.at[1] - player.pos.z), f = Math.atan2(-Math.sin(cam.yaw), -Math.cos(cam.yaw)); ar.style.transform = `rotate(${-(a - f)}rad)`; }
  } else ar.style.display = 'none';
  const n = modalOpen ? null : nearest();
  const pr = $('prompt');
  if (n) { pr.classList.remove('hidden'); pr.innerHTML = `<kbd>${isTouch ? 'Talk' : 'E'}</kbd> ${n.kind === 'boss' ? 'Face GLITCH' : 'Talk to ' + esc(n.name)}`; } else pr.classList.add('hidden');
}
function hudStats() {
  $('cCore').textContent = `⚡ ${coresOn()}/4`; $('cCell').textContent = `🔋 ${S.cells.length}/${cellSpots.length}`; $('cCit').textContent = `🤝 ${citDone()}/${CITIZENS.length}`;
}
function teamPanel() {
  const el = $('team');
  if (!team) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  const list = memberList();
  el.innerHTML = `<h3>👥 Team ${esc(net.NET.code)}</h3>` + list.map((m, i) => { const p = posOf(m.id); const dd = m.self ? 'you' : p ? Math.round(dist(p.x, p.z, player.pos.x, player.pos.z)) + ' m' : '…'; return `<div><span class="dot" style="background:${TCOL[i % 4]}"></span>${i === 0 ? '👑 ' : ''}${esc(m.name || 'Agent')}<span class="d">${dd}</span></div>`; }).join('');
}

// minimapa: alrededor del jugador (o la isla completa con M)
const mini = $('mini'), mctx = mini.getContext('2d');
function drawMini() {
  const big = mini.classList.contains('big'), W = mini.width, gc = world.groundCanvas; if (!gc) return;
  const span = big ? 700 : 190, k = gc.width / 700;
  const cx = big ? 0 : player.pos.x, cz = big ? 0 : player.pos.z;
  const toM = (x, z) => [(x - cx) / span * W + W / 2, (z - cz) / span * W + W / 2];
  mctx.fillStyle = '#2b8fd6'; mctx.fillRect(0, 0, W, W);
  mctx.drawImage(gc, (cx - span / 2 + 350) * k, (cz - span / 2 + 350) * k, span * k, span * k, 0, 0, W, W);
  const dot = (x, z, r, col, stroke = '#14203a') => { const [mx, mz] = toM(x, z); if (mx < -10 || mz < -10 || mx > W + 10 || mz > W + 10) return; mctx.beginPath(); mctx.arc(mx, mz, r, 0, 6.28); mctx.fillStyle = col; mctx.fill(); mctx.lineWidth = 3; mctx.strokeStyle = stroke; mctx.stroke(); };
  const txt = (x, z, t, size) => { const [mx, mz] = toM(x, z); mctx.font = `${size}px sans-serif`; mctx.textAlign = 'center'; mctx.textBaseline = 'middle'; mctx.fillText(t, mx, mz); };
  cellMeshes.forEach((m, i) => { if (m && m.visible) dot(cellSpots[i][0], cellSpots[i][2], big ? 4 : 5, '#3fe8ff', '#0a5a8a'); });
  for (const n of npcs) if (n.kind === 'citizen' && !S.cit[n.id]) dot(n.x, n.z, big ? 6 : 8, '#ffffff', '#1b6fd0');
  for (const d of DISTRICTS) { const [x, z] = CORE_POS[d.id]; dot(x, z, big ? 12 : 14, S.prog[d.id] >= 4 ? d.color : '#5d6676', '#fff'); txt(x, z, d.icon, big ? 14 : 16); }
  dot(NOVA_POS[0], NOVA_POS[1], big ? 7 : 9, '#22b8ff', '#fff');
  dot(BOSS_POS[0], BOSS_POS[1], big ? 11 : 13, S.boss ? '#5d6676' : '#ff3b6b', '#fff'); txt(BOSS_POS[0], BOSS_POS[1], '⚡', big ? 13 : 15);
  for (const [id, mt] of mates) if (mt.c) dot(mt.c.root.position.x, mt.c.root.position.z, big ? 8 : 10, mt.col || '#fff', '#fff');
  const [px, pz] = toM(player.pos.x, player.pos.z);
  mctx.save(); mctx.translate(px, pz); mctx.rotate(-player.ry + Math.PI); mctx.beginPath(); mctx.moveTo(0, -14); mctx.lineTo(10, 10); mctx.lineTo(0, 5); mctx.lineTo(-10, 10); mctx.closePath(); mctx.fillStyle = team ? colOf(net.NET.id) : '#ffd23f'; mctx.fill(); mctx.lineWidth = 3; mctx.strokeStyle = '#14203a'; mctx.stroke(); mctx.restore();
}

// ---------------- física del jugador ----------------
function collide(p, r) {
  for (const c of circles) { if (!c.r) continue; const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + r; if (d < m && d > 1e-4) { p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; } }
  for (const b of boxes) {
    if (p.y >= b.h - 0.45) continue;
    if (b.floating && p.y < b.h - 1.2 && p.y + 1.8 < b.h - 0.8) continue; // por debajo de la plataforma
    const qx = Math.max(b.x - b.hw, Math.min(p.x, b.x + b.hw)), qz = Math.max(b.z - b.hd, Math.min(p.z, b.z + b.hd));
    const dx = p.x - qx, dz = p.z - qz, d = Math.hypot(dx, dz);
    if (d < r) {
      if (d > 1e-4) { p.x = qx + dx / d * r; p.z = qz + dz / d * r; }
      else { const ox = b.hw - Math.abs(p.x - b.x), oz = b.hd - Math.abs(p.z - b.z); if (ox < oz) p.x = b.x + Math.sign(p.x - b.x || 1) * (b.hw + r); else p.z = b.z + Math.sign(p.z - b.z || 1) * (b.hd + r); }
    }
  }
  const rr = Math.hypot(p.x, p.z); if (rr > WORLD_R) { p.x *= WORLD_R / rr; p.z *= WORLD_R / rr; }
}
function groundAt(x, z, y) {
  let h = 0;
  for (const b of boxes) if (Math.abs(x - b.x) < b.hw + 0.25 && Math.abs(z - b.z) < b.hd + 0.25 && y >= b.h - 0.5) h = Math.max(h, b.h);
  return h;
}
const lerpAng = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * k; };
let stepT = 0;
function updatePlayer(dt) {
  let ix = 0, iz = 0;
  if (!modalOpen) {
    if (keys.KeyW || keys.ArrowUp) iz -= 1; if (keys.KeyS || keys.ArrowDown) iz += 1;
    if (keys.KeyA || keys.ArrowLeft) ix -= 1; if (keys.KeyD || keys.ArrowRight) ix += 1;
    ix += stick.x; iz += stick.y;
  }
  const len = Math.hypot(ix, iz), run = keys.ShiftLeft || keys.ShiftRight || runToggle;
  const sp = run ? 15 : 8.5, p = player.pos;
  let moving = false;
  if (len > 0.12) {
    const k = Math.min(1, len); ix /= len; iz /= len;
    const s = Math.sin(cam.yaw), c = Math.cos(cam.yaw);
    const mx = (ix * c + iz * s) * sp * k, mz = (-ix * s + iz * c) * sp * k;
    const steps = 2; for (let i = 0; i < steps; i++) { p.x += mx * dt / steps; p.z += mz * dt / steps; collide(p, 0.45); }
    player.ry = lerpAng(player.ry, Math.atan2(mx, mz), 1 - Math.exp(-dt * 12)); moving = true;
  } else collide(p, 0.45);
  const gh = groundAt(p.x, p.z, p.y);
  if (jumpQ && player.ground && !modalOpen) { player.vy = 11; player.ground = false; sfx('step', 0.3); }
  jumpQ = false;
  player.vy -= 30 * dt; p.y += player.vy * dt;
  if (p.y <= gh) { p.y = gh; player.vy = 0; player.ground = true; } else if (p.y - gh > 0.05) player.ground = false;
  if (player.ground) for (const s of springs) if (dist(p.x, p.z, s.x, s.z) < 1.4 && p.y < 0.8) { player.vy = s.power; player.ground = false; sfx('power', 0.5); }
  const c = player.c; if (!c) return;
  c.root.position.copy(p); c.root.rotation.y = player.ry;
  if (performance.now() > c.lockUntil) c.play(!player.ground ? 'static' : moving ? (run ? 'sprint' : 'walk') : 'idle');
  if (moving && player.ground) { stepT -= dt; if (stepT <= 0) { sfx('step', 0.12); stepT = run ? 0.28 : 0.4; } }
  // celdas de energía
  for (let i = 0; i < cellMeshes.length; i++) { const m = cellMeshes[i]; if (m && m.visible && Math.abs(m.position.y - p.y - 1) < 2 && dist(p.x, p.z, m.position.x, m.position.z) < 1.7) collectCell(i, true); }
}

const tmpV = new THREE.Vector3();
function rayBox(o, d, b) { // rayo contra caja (para que la cámara no quede dentro de un edificio)
  let tmin = 0, tmax = 1;
  const mn = [b.x - b.hw, 0, b.z - b.hd], mx = [b.x + b.hw, b.h, b.z + b.hd], O = [o.x, o.y, o.z], Dd = [d.x, d.y, d.z];
  for (let a = 0; a < 3; a++) {
    if (Math.abs(Dd[a]) < 1e-6) { if (O[a] < mn[a] || O[a] > mx[a]) return 1; continue; }
    let t1 = (mn[a] - O[a]) / Dd[a], t2 = (mx[a] - O[a]) / Dd[a]; if (t1 > t2) [t1, t2] = [t2, t1];
    tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); if (tmin > tmax) return 1;
  }
  return tmin;
}
function updateCamera(dt) {
  const tgt = tmpV.copy(player.pos); tgt.y += 1.7;
  const cp = Math.cos(cam.pitch);
  const off = new THREE.Vector3(Math.sin(cam.yaw) * cp, Math.sin(cam.pitch), Math.cos(cam.yaw) * cp).multiplyScalar(cam.dist);
  let t = 1; for (const b of boxes) { if (b.h < 2.5) continue; if (Math.abs(b.x - tgt.x) > cam.dist + b.hw + 2 || Math.abs(b.z - tgt.z) > cam.dist + b.hd + 2) continue; const h = rayBox(tgt, off, b); if (h < t) t = h; }
  t = Math.max(0.22, t * 0.92);
  const want = tgt.clone().add(off.multiplyScalar(t)); want.y = Math.max(want.y, 0.6);
  camera.position.lerp(want, 1 - Math.exp(-dt * 14)); camera.lookAt(tgt);
  sun.position.set(player.pos.x + 50, 110, player.pos.z + 35); sun.target.position.copy(player.pos);
}

// ---------------- compañeros, autos, almohadillas, cohete ----------------
let sendT = 0, padT = 0, lastSent = '';
function updateMates(dt) {
  for (const mt of mates.values()) {
    if (!mt.c) continue;
    const r = mt.c.root; const before = r.position.clone();
    r.position.lerp(mt.tgt, 1 - Math.exp(-dt * 10));
    r.rotation.y = lerpAng(r.rotation.y, mt.ry || 0, 1 - Math.exp(-dt * 10));
    if (!(mt.emoUntil > performance.now())) mt.c.play(mt.anim || 'idle');
    mt.c.mixer.update(dt);
  }
}
function sendPos(dt) {
  if (!team) return;
  sendT -= dt; if (sendT > 0) return; sendT = 0.1;
  const p = player.pos, a = player.c ? player.c.curName : 'idle';
  const s = `${p.x.toFixed(1)},${p.y.toFixed(1)},${p.z.toFixed(1)},${player.ry.toFixed(2)},${a}`;
  if (s === lastSent && Math.random() > 0.1) return; lastSent = s;
  net.send('pos', { x: +p.x.toFixed(2), y: +p.y.toFixed(2), z: +p.z.toFixed(2), ry: +player.ry.toFixed(3), a });
}
function checkPads(dt) {
  padT -= dt; if (padT > 0) return; padT = 0.2;
  const list = team ? memberList() : [{ id: net.NET.id, self: true }];
  const n = Math.min(4, list.length);
  for (const d of DISTRICTS) {
    if (S.prog[d.id] !== 3) continue;
    const core = cores[d.id]; core.setStep(3, n);
    const lit = core.pads.map((pd, i) => i < n && list.some(m => { const p = posOf(m.id); return p && dist(p.x, p.z, pd.x, pd.z) < 1.7; }));
    core.lightPads(lit);
    if (lit.slice(0, n).every(Boolean)) { net.send('pads', { d: d.id }); setProg(d.id, 4); }
  }
}
function updateCars(dt) {
  if (!world.cars || !world.carPos) return;
  const people = [player.pos, ...[...mates.values()].filter(m => m.c).map(m => m.c.root.position)];
  for (const car of world.cars) {
    const ahead = world.carPos(car.s + 5, car.lane);
    const blocked = people.some(p => dist(p.x, p.z, ahead.x, ahead.z) < 3.5);
    if (!blocked) car.s += 7 * dt;
    const pos = world.carPos(car.s, car.lane); car.o.position.x = pos.x; car.o.position.z = pos.z; car.o.rotation.y = pos.ry;
  }
}
function updateRocket() {
  const L = world.launch; if (!L || !world.rocket) return;
  const t = performance.now() / 1000 - L.t0;
  world.rocketFlame.visible = true; world.rocketFlame.scale.setScalar(1 + Math.sin(t * 30) * 0.15);
  world.rocket.position.y = world.rocketY + Math.max(0, t - 1.5) ** 2 * 2.2;
  world.rocket.position.x += Math.max(0, t - 4) * 0.01;
  if (t > 14) { world.rocket.visible = false; world.launch = null; }
}

// ---------------- menú, sala de espera, inicio ----------------
function buildMenu() {
  $('chars').innerHTML = CHARS.map(c => `<button data-c="${c}" class="${c === S.char ? 'on' : ''}" title="${c}"><img src="${thumb(c)}" alt=""></button>`).join('');
  $('chars').querySelectorAll('button').forEach(b => b.onclick = () => { S.char = b.dataset.c; save(); sfx('click'); $('chars').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); setPlayerChar(); });
  $('pname').value = S.name;
  const st = student();
  if (st && !S.name) { S.name = (st.first_name || st.name || '').split(' ')[0]; $('pname').value = S.name; save(); }
  $('esltStatus').innerHTML = st
    ? `📊 Hola, <b>${esc(st.first_name || st.name || '')}</b> (${esc(st.section || '')}). Tu profe verá tu avance.`
    : `⚠️ No has iniciado sesión: tu profe no verá tu avance. <a href="https://eslteacher.cl/" target="_blank" rel="noopener">Entra en eslteacher.cl</a> (Mi perfil) y vuelve a abrir el juego.`;
  $('esltStatus').classList.toggle('warn', !st);
  $('progressTxt').textContent = S.boss ? '🏆 Mission completed!' : `Progress: ⚡ ${coresOn()}/4 · 🔋 ${S.cells.length}/${cellSpots.length} · 🤝 ${citDone()}/12`;
}
let charLoading = null;
async function setPlayerChar() {
  const want = S.char; charLoading = want;
  const c = await makeChar(want); if (charLoading !== want) return;
  if (player.c) scene.remove(player.c.root);
  player.c = c; c.root.position.copy(player.pos); c.root.rotation.y = player.ry; scene.add(c.root);
  net.updateMe({ char: S.char });
}
function needName() { const n = $('pname').value.trim(); if (!n) { $('pname').focus(); $('pname').style.borderColor = '#d9433b'; toast('✍️ Write your name first!'); return null; } S.name = n; save(); return n; }
$('pname').addEventListener('input', e => { S.name = e.target.value.trim(); save(); e.target.style.borderColor = ''; });
$('jcode').addEventListener('keydown', e => { if (e.key === 'Enter') $('bJoin').click(); });
$('bSolo').onclick = () => { if (!needName()) return; team = false; net.leaveTeam(); net.NET.me = meInfo(); enterPlay(); };
$('bCreate').onclick = async () => {
  if (!needName()) return;
  const b = $('bCreate'); b.disabled = true; b.textContent = 'Creating…';
  const code = net.newCode();
  const r = await net.joinTeam(code, meInfo(), true);
  b.disabled = false; b.textContent = '👥 Create a team';
  if (r !== 'ok') return toast(r === 'offline' ? '📡 No internet: play solo.' : '📡 Could not connect. Try again.');
  team = true; showLobby();
};
$('bJoin').onclick = async () => {
  if (!needName()) return;
  const code = net.cleanCode($('jcode').value); if (code.length < 4) { $('jcode').focus(); return toast('🔑 Write the 4-letter team code.'); }
  const b = $('bJoin'); b.disabled = true; b.textContent = 'Joining…';
  const r = await net.joinTeam(code, meInfo(), false);
  b.disabled = false; b.textContent = '🔑 Join team';
  if (r === 'notfound') return toast(`🔍 No team with code ${code}. Check the code!`, 3000);
  if (r === 'full') return toast('🚫 That team is full (4 agents).', 3000);
  if (r !== 'ok') return toast(r === 'offline' ? '📡 No internet: play solo.' : '📡 Could not connect. Try again.');
  team = true;
  if ([...net.NET.peers.values()].some(p => p.started)) enterPlay(); else showLobby();
};
function showLobby() { mode = 'lobby'; $('menu').classList.add('hidden'); $('lobby').classList.remove('hidden'); playMusic('m_lobby'); renderLobby(); }
function renderLobby() {
  $('lcode').textContent = net.NET.code;
  const list = memberList();
  $('lmembers').innerHTML = list.map((m, i) => `<li><span class="dot" style="background:${TCOL[i % 4]}"></span><img src="${thumb(m.char || 'character-a')}" alt="">${i === 0 ? '👑 ' : ''}${esc(m.name || 'Agent')}${m.self ? ' (you)' : ''}</li>`).join('') + (list.length < 4 ? `<li style="opacity:.55">➕ Waiting for more agents… (${list.length}/4)</li>` : '');
  const host = list[0] && list[0].self;
  $('bGo').classList.toggle('hidden', !host);
  $('lwait').textContent = host ? 'When everybody is here, press Start mission. (Agents can also join later.)' : `Waiting for ${list[0]?.name || 'the team leader'} to start the mission…`;
}
$('bGo').onclick = () => { net.send('go'); enterPlay(); };
$('bLeave').onclick = () => { net.leaveTeam(); team = false; mode = 'menu'; $('lobby').classList.add('hidden'); $('menu').classList.remove('hidden'); buildMenu(); };

function enterPlay() {
  mode = 'play';
  $('menu').classList.add('hidden'); $('lobby').classList.add('hidden'); $('hud').classList.remove('hidden');
  if (isTouch) $('touch').classList.remove('hidden');
  net.updateMe({ ...meInfo(), started: true });
  const idx = Math.max(0, memberList().findIndex(m => m.self));
  player.pos.set(-4 + idx * 2.7, 0, 16); player.ry = Math.PI; cam.yaw = 0; player.vy = 0;
  playMusic('m_explore'); voice('ready');
  adoptProgress(); refreshWorld(); teamPanel(); syncMates();
  toast(team ? `👥 Team ${net.NET.code}: Mission 2050 begins!` : '🚀 Mission 2050 begins!', 2600);
  if (!S.intro) setTimeout(() => { if (!modalOpen && mode === 'play') talkNova(); }, 1600);
}
$('menuBtn').onclick = async () => {
  if (modalOpen) return;
  const r = await say('Menu', '', null, `Mission progress: ⚡ ${coresOn()}/4 districts · 🔋 ${S.cells.length}/${cellSpots.length} cells · 🤝 ${citDone()}/12 citizens${S.boss ? ' · 🏆 GLITCH defeated' : ''}.`, [['▶ Resume', ''], ['🏆 My results', 'cyan'], ['🚪 Exit to menu', 'alt']]);
  if (r === 1) certificate(0, 0);
  if (r === 2) { net.leaveTeam(); for (const id of [...mates.keys()]) removeMate(id); team = false; CH = null; mode = 'menu'; $('hud').classList.add('hidden'); $('touch').classList.add('hidden'); $('menu').classList.remove('hidden'); buildMenu(); playMusic('m_lobby'); }
};
$('bReset').onclick = () => { if (!confirm('Reset your progress in Mission 2050?')) return; const keep = { name: S.name, char: S.char }; S = Object.assign(fresh(), keep); save(); location.reload(); };
$('bCred').onclick = () => say('Credits', '', null, `<b>Mission 2050 · Future Agents</b> — eslteacher.cl<br><br>3D models: Kenney (Blocky Characters, Space Kit, City Kit Commercial, Car Kit, Nature Kit, Platformer Kit) · Kay Lousberg (KayKit City Builder Bits) · Styloo (Robot Character). All CC0.<br>Sounds: Kenney (CC0). Music: CoMiGo, Music Loops (CC0).<br>Made with three.js.`, [['Close', '']]);

// ---------------- bucle principal ----------------
let last = performance.now(), frameN = 0, slowT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000; frameN++;
  if (mode === 'play') { updatePlayer(dt); updateCamera(dt); sendPos(dt); checkPads(dt); }
  else if (mode !== 'loading') {
    const a = t * 0.05; camera.position.set(Math.sin(a) * 34, 15, 16 + Math.cos(a) * 34); camera.lookAt(0, 6, -4);
    if (player.c) { player.c.root.position.copy(player.pos); player.c.play('idle'); }
  }
  if (player.c) player.c.mixer.update(dt);
  for (const m of mixers) m.update(dt);
  updateMates(dt);
  for (const f of animated) f(t, dt);
  cellMeshes.forEach(m => { if (m && m.visible) { m.rotation.y = t * 2; } });
  updateCars(dt); updateRocket();
  if (mode === 'play') {
    updateHUD();
    if (frameN % 3 === 0) drawMini();
    slowT -= dt; if (slowT <= 0) { slowT = 0.5; teamPanel(); }
  }
  renderer.render(scene, camera);
}

// ---------------- arranque ----------------
setProgress(p => { $('lbar').style.width = Math.round(p * 100) + '%'; });
(async () => {
  try { await buildWorld(); } catch (e) { console.error(e); }
  spawnCells();
  await spawnNPCs();
  await setPlayerChar();
  refreshWorld();
  $('loading').classList.add('hidden'); $('menu').classList.remove('hidden');
  mode = 'menu'; buildMenu();
  const startMusic = () => { playMusic('m_lobby'); removeEventListener('pointerdown', startMusic); };
  addEventListener('pointerdown', startMusic);
})();
requestAnimationFrame(frame);
