import * as THREE from 'three';
import { scene, buildWorld, buildTraffic, updateTraffic, makeChar, phoneFor, setProgress, colliders, camBlockers, animated, zoneInfo, landmarks, mapRects, stopInfo, cars, walkers, piles, hype, clampWalk, sideSpot, MAP, STREETS, textTex } from './world.js';
import { CH, BOSS, SIDE, SKILLS, ONLINE_EXTRA } from './content.js';
import * as net from './net.js';
import { logAnswer, student } from './track.js';
const GAME = 'trend-city-3m'; // id del juego en el Panel del profe

const $ = id => document.getElementById(id);
const CHARS = [['b', 'Leo'], ['e', 'Ana'], ['c', 'Max'], ['f', 'Jo'], ['k', 'Sam'], ['n', 'Kim'], ['m', 'Ben'], ['q', 'Alex'], ['r', 'Ninja']];
const KCOL = { E: '#1f8fd6', I: '#7a2d8f', V: '#1fb5a8', L: '#ff7a1a', W: '#e2408f' };
const FILES = [['vocab', 'Vocabulary in context'], ['liu', 'Language in use'], ['wf', 'Word formation']];

// ---------------- save ----------------
const SAVE_KEY = 'trendcity3m_v1';
function freshSave() { return { name: '', char: 'b', ch: {}, stats: { E: [0, 0], I: [0, 0], V: [0, 0], L: [0, 0], W: [0, 0] }, side: {}, final: false, intro: false, best: 0 }; }
let S = freshSave();
try { const raw = localStorage.getItem(SAVE_KEY); if (raw) S = Object.assign(freshSave(), JSON.parse(raw)); } catch (e) { }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
const cst = id => (S.ch[id] ||= { read: false, files: [false, false, false], done: false });
const truths = () => CH.filter(c => cst(c.id).done).length;
const evid = () => CH.reduce((n, c) => n + cst(c.id).files.filter(Boolean).length, 0);
const sst = q => (S.side[q.id] ||= { acc: false, got: [], done: false });
const helped = () => SIDE.filter(q => sst(q).done).length;

// ---------------- audio ----------------
const sfxCache = {};
function sfx(n, v = 0.6) { try { const base = sfxCache[n] ||= new Audio(`assets/audio/${n}.ogg`); const a = base.cloneNode(); a.volume = v; a.play().catch(() => { }); } catch (e) { } }
const music = new Audio(); music.loop = true; music.volume = 0.32;
function playMusic(n) { if (music.dataset.n === n) return; music.dataset.n = n; music.src = `assets/audio/${n}.mp3`; music.play().catch(() => { }); }

// ---------------- renderer / camera ----------------
const renderer = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 600);
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const cam = { yaw: 0, pitch: 0.36, dist: 9 };

// ---------------- state ----------------
let mode = 'menu';           // menu | story | online
let modalOpen = false;
const START = new THREE.Vector3(0, 0, 44);
const player = { c: null, pos: START.clone(), vy: 0, ry: Math.PI, ground: true };
const keys = {}, stick = { x: 0, y: 0 };
const npcs = [];             // main mission NPCs {c, pos, ci, mark}
const files = [];            // per chapter: [mesh, mesh, mesh]
let boss = null, beacon;

const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true, ...extra });
function label(text, color = '#fff', size = 30, w = 2.6) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const c = cv.getContext('2d');
  c.font = `800 ${size}px Nunito, sans-serif`; c.textAlign = 'center'; c.lineWidth = 7; c.strokeStyle = 'rgba(20,15,50,.8)'; c.strokeText(text, 128, 44); c.fillStyle = color; c.fillText(text, 128, 44);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(w, w / 4, 1); s.renderOrder = 10; return s;
}

// ---------------- input ----------------
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if (modalOpen) return;
  if (e.code === 'KeyE' || e.code === 'Enter') interact();
  if (e.code === 'KeyM' && mode !== 'menu') mini.classList.toggle('big');
  if (e.code === 'Digit1') emote('emote-yes');
  if (e.code === 'Digit2') emote('interact-right');
  if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; });
let drag = null;
const cv = $('c');
cv.addEventListener('pointerdown', e => { if (e.target === cv) { drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; cv.setPointerCapture(e.pointerId); } });
cv.addEventListener('pointermove', e => { if (!drag || drag.id !== e.pointerId) return; cam.yaw -= (e.clientX - drag.x) * 0.006; cam.pitch = THREE.MathUtils.clamp(cam.pitch + (e.clientY - drag.y) * 0.004, 0.05, 1.25); drag.x = e.clientX; drag.y = e.clientY; });
cv.addEventListener('pointerup', () => drag = null); cv.addEventListener('pointercancel', () => drag = null);
cv.addEventListener('wheel', e => { cam.dist = THREE.MathUtils.clamp(cam.dist + e.deltaY * 0.01, 4, 20); }, { passive: true });
const isTouch = matchMedia('(pointer: coarse)').matches || location.search.includes('touch');
if (isTouch) {
  const st = $('stick'), knob = st.firstElementChild; let sid = null;
  st.addEventListener('pointerdown', e => { sid = e.pointerId; st.setPointerCapture(sid); move(e); });
  st.addEventListener('pointermove', e => { if (e.pointerId === sid) move(e); });
  const end = () => { sid = null; stick.x = stick.y = 0; knob.style.transform = ''; };
  st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
  function move(e) { const r = st.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } stick.x = x; stick.y = y; knob.style.transform = `translate(${x * 40}px,${y * 40}px)`; }
  $('tJump').addEventListener('pointerdown', () => { keys.Space = true; setTimeout(() => keys.Space = false, 120); });
  $('tAct').addEventListener('pointerdown', () => interact());
  $('help').textContent = 'Joystick: move (push far = run) · Drag screen: camera';
}
$('prompt').addEventListener('click', () => interact());

// ---------------- UI helpers ----------------
function toast(t, ms = 1800) { const el = $('toast'); el.innerHTML = t; el.style.opacity = 1; clearTimeout(el._t); el._t = setTimeout(() => el.style.opacity = 0, ms); }
function openModal(html) { $('mbox').innerHTML = html; $('modal').classList.remove('hidden'); modalOpen = true; $('mbox').scrollTop = 0; }
function closeModal() { $('modal').classList.add('hidden'); modalOpen = false; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function avatar(name, color) { return `<div class="avatar" style="background:${color}">${esc(name[0])}</div>`; }
function say(name, color, text, buttons) {
  return new Promise(res => {
    openModal(`<div class="speaker">${avatar(name, color)}<div style="flex:1"><h2>${esc(name)}</h2><div class="bubble">${text}</div></div></div><div class="foot">${buttons.map((b, i) => `<button class="btn ${b[1] || ''}" data-i="${i}">${b[0]}</button>`).join('')}</div>`);
    $('mbox').querySelectorAll('.foot .btn').forEach(b => b.onclick = () => { sfx('click'); closeModal(); res(+b.dataset.i); });
  });
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function prepItem(it) { if (it.t) return { ...it }; const order = shuffle(it.o.map((_, i) => i)); return { ...it, opts: order.map(i => it.o[i]), correct: order.indexOf(it.a) }; }
const norm = s => String(s || '').toLowerCase().replace(/[’`´]/g, "'").replace(/[.!?,;]+$/g, '').replace(/\s+/g, ' ').trim();
// it = prepared question, chosen/right = text, t0 = when it appeared
function record(it, chosen, right, ok, activity, t0) {
  const k = it.k; if (!S.stats[k]) S.stats[k] = [0, 0]; S.stats[k][1]++; if (ok) S.stats[k][0]++; save();
  logAnswer(GAME, { activity, item: it, chosen, right, ok, ms: performance.now() - t0 });
}

/** Card for one question (multiple choice or typed). onDone(ok) is called once. */
function cardHtml(it, head = '') {
  const body = it.t
    ? `<div class="typed"><input type="text" id="tAns" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type your answer…"><button class="btn teal" id="tChk">Check ✔</button></div>`
    : `<div class="opts">${it.opts.map((o, j) => `<button class="opt" data-j="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join('')}</div>`;
  return `<div class="qcard">${head}<span class="tag" style="background:${KCOL[it.k]}">${SKILLS[it.k]}</span><div class="q">${it.q}</div>${body}<div id="why"></div><div class="foot" id="qfoot"></div></div>`;
}
function bindCard(it, activity, onDone, okText = '✔ Correct!', noText = '✘ Not quite.') {
  const t0 = performance.now();
  const finish = (ok, chosen) => {
    const right = it.t ? it.a[0] : it.opts[it.correct];
    record(it, chosen, right, ok, activity, t0); sfx(ok ? 'ok' : 'bad');
    const extra = !ok && it.t ? ` Answer: <b>${esc(it.a[0])}</b>.` : '';
    $('why').innerHTML = `<div class="why ${ok ? 'ok' : 'no'}">${ok ? okText : noText}${extra} ${it.why}</div>`;
    onDone(ok);
  };
  if (it.t) {
    const inp = $('tAns'), btn = $('tChk');
    setTimeout(() => inp.focus(), 60);
    // 3 tries with hints; the answer is only shown after the last one
    let tries = 0; const wrong = [];
    const check = () => {
      const v = inp.value; if (!norm(v)) { inp.focus(); return; }
      const base = (String(it.q).match(/\(([A-Z'-]+)\)\s*$/) || [])[1];
      if (base && norm(v) === base.toLowerCase()) { $('why').innerHTML = `<div class="why no">Change the word ${esc(base)}: add a prefix or suffix.</div>`; inp.select(); return; }
      tries++;
      const ok = it.a.some(a => norm(a) === norm(v));
      if (!ok && tries < 3) {
        wrong.push(v); const ans = it.a[0], half = Math.ceil(ans.length / 2);
        $('why').innerHTML = `<div class="why no">✘ Not yet. ${tries === 1
          ? `Hint: it starts with <b>${esc(ans[0])}</b> and has <b>${ans.length}</b> letters. 2 tries left.`
          : `Hint: <b>${esc(ans.slice(0, half))}${'_'.repeat(ans.length - half)}</b>. Last try.`}</div>`;
        sfx('bad'); inp.select(); return;
      }
      inp.disabled = true; btn.disabled = true; inp.classList.add(ok ? 'ok' : 'no');
      finish(ok, [...wrong, v].join(' → '));
    };
    btn.onclick = check; inp.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') check(); });
  } else {
    $('mbox').querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const j = +b.dataset.j, ok = j === it.correct;
      $('mbox').querySelectorAll('.opt').forEach((bb, bj) => { bb.disabled = true; if (bj === it.correct) bb.classList.add('ok'); else if (bj === j) bb.classList.add('no'); });
      finish(ok, it.opts[j]);
    });
  }
}

/** Activity with several questions. opt: {title, color, items, reading, passMin, shuffleItems, tip} → resolves number correct */
function runQuiz(opt) {
  return new Promise(resolve => {
    const items = (opt.shuffleItems ? shuffle(opt.items) : opt.items).map(prepItem);
    let i = 0, correct = 0; const res = [];
    const textHtml = opt.reading ? `<div class="text"><h3 style="margin:0 0 8px">${esc(opt.reading.title)}</h3>${opt.reading.text.split('\n\n').map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}</div>` : '';
    function render() {
      const it = items[i];
      const prog = `<div class="progress">${items.map((_, j) => `<i class="${j < i ? (res[j] ? 'ok' : 'no') : j === i ? 'cur' : ''}"></i>`).join('')}</div>`;
      const card = cardHtml(it, prog);
      openModal(`<h2 style="color:${opt.color || 'inherit'}">${esc(opt.title)}</h2>${opt.tip && i === 0 ? `<div class="tip">💡 ${opt.tip}</div>` : ''}${opt.reading ? `<div class="reading">${textHtml}${card}</div>` : card}`);
      if (opt.reading && i > 0) { const t = $('mbox').querySelector('.text'); if (t) t.scrollTop = render.scroll || 0; }
      bindCard(it, opt.title, ok => {
        res[i] = ok; if (ok) correct++;
        const t = $('mbox').querySelector('.text'); if (t) render.scroll = t.scrollTop;
        $('qfoot').innerHTML = `<button class="btn">${i < items.length - 1 ? 'Next ➜' : 'Finish'}</button>`;
        $('qfoot').firstChild.onclick = () => { sfx('page'); i++; if (i < items.length) render(); else finish(); };
        $('qfoot').firstChild.focus();
      });
    }
    function finish() {
      const pass = correct >= (opt.passMin ?? 0);
      openModal(`<h2>${pass ? '🎉 Well done!' : '💪 Almost there!'}</h2><div class="bubble" style="font-size:22px">You got <b>${correct}/${items.length}</b> correct.${pass ? '' : `<br>You need at least ${opt.passMin}. Read again and try once more — the options will change order.`}</div><div class="foot"><button class="btn">${pass ? 'Continue' : 'Try again'}</button></div>`);
      sfx(pass ? 'star' : 'bad');
      $('mbox').querySelector('.foot .btn').onclick = () => { closeModal(); if (pass) resolve(correct); else runQuiz(opt).then(resolve); };
    }
    render();
  });
}

// ---------------- characters ----------------
async function setPlayerModel(model) {
  if (player.c) scene.remove(player.c.root);
  player.c = await makeChar(model);
  scene.add(player.c.root); player.c.root.position.copy(player.pos);
}

// ---------------- story ----------------
function makeFileMesh(color) {
  const g = new THREE.Group(), it = new THREE.Group();
  const folder = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 0.08), M(color, { emissive: color, emissiveIntensity: 0.45 }));
  const tab = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.08), M(color)); tab.position.set(-0.22, 0.38, 0);
  const paper = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.55, 0.1), M('#ffffff', { emissive: '#ffffff', emissiveIntensity: 0.3 })); paper.position.y = 0.06;
  const q = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTex('?', { w: 128, h: 128, bg: 'rgba(0,0,0,0)', fg: color, size: 110, stroke: '#ffffff' }), depthTest: false })); q.position.y = 0.95; q.scale.setScalar(0.8);
  it.add(folder, tab, paper, q);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.05, 6, 28), new THREE.MeshBasicMaterial({ color })); ring.rotation.x = Math.PI / 2; ring.position.y = -1.35;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 16, 12, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 6.5;
  g.add(it, ring, beam); g.userData.item = it;
  return g;
}

async function setupStory() {
  for (let i = 0; i < CH.length; i++) {
    const ch = CH[i], info = zoneInfo[i];
    const c = await makeChar(ch.npc.model);
    c.root.position.copy(info.npcPos); c.root.rotation.y = info.face;
    if (ch.id === 'mall' || ch.id === 'pixel') phoneFor(c, ch.color);
    const lb = label(ch.npc.name, '#fff'); lb.position.y = 2.6; c.root.add(lb);
    const mark = label('!', '#ffc23d', 60, 2.6); mark.position.y = 3.3; c.root.add(mark);
    scene.add(c.root); colliders.push({ x: info.npcPos.x, z: info.npcPos.z, r: 0.7 });
    npcs.push({ c, pos: info.npcPos, ci: i, mark });
    files[i] = info.itemPos.map(p => { const s = makeFileMesh(ch.color); s.position.set(p.x, 1.4, p.z); s.visible = false; scene.add(s); return s; });
  }
  boss = await makeChar('g', null, 6);
  boss.root.position.set(0, 0, 17); boss.root.visible = false;
  const bl = label(BOSS.name, '#ff6fa8', 40, 4); bl.position.y = 7; boss.root.add(bl);
  scene.add(boss.root);
  beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 50, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd84a', transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
  beacon.position.y = 25; scene.add(beacon);
  // bus stop labels
  stopInfo.forEach(s => { const l = label(`🚌 ${s.name}`, '#bfe6ff', 24, 4); l.position.set(s.pos.x, 3.6, s.pos.z); scene.add(l); });
}

let screenT = 0, screenI = 0;
const HYPE_TXT = [['HYPE', '#ff3d8b'], ['BUY', '#ffe03d'], ['SCROLL', '#35e6ff'], ['LIKE ❤', '#ff3d8b'], ['FOLLOW', '#b45cff'], ['OBEY', '#ff3d8b']];
function updateScreens(t) {
  if (t - screenT < 1.6) return; screenT = t; screenI++;
  const free = mode === 'story' && S.final;
  hype.screens.forEach((s, k) => {
    if (free) s.tex.userData.draw(['THINK', 'FOR', 'YOURSELF'], { bg: '#0f3d2a', fg: '#7dffb0', size: 110 });
    else if (mode === 'online') s.tex.userData.draw(['TREND', 'RUSH'], { bg: '#14092b', fg: ['#35e6ff', '#ff3d8b'][(screenI + k) % 2], size: 130 });
    else { const [txt, col] = HYPE_TXT[(screenI + k) % HYPE_TXT.length]; s.tex.userData.draw([txt], { bg: '#14092b', fg: col, size: txt.length > 5 ? 120 : 160 }); }
  });
  if (hype.ring) hype.ring.visible = !free;
}

function refreshStory() {
  CH.forEach((ch, i) => {
    const st = cst(ch.id);
    files[i].forEach((s, k) => s.visible = mode === 'story' && st.read && !st.files[k]);
    const n = npcs[i]; if (n) n.mark.visible = mode === 'story' && !st.done;
  });
  if (boss) boss.root.visible = mode === 'story' && truths() === CH.length && !S.final;
  walkers.forEach(w => w.phone.visible = !(mode === 'story' && S.final));
  $('cTruth').textContent = `📁 ${truths()}/${CH.length}`; $('cEv').textContent = `🔎 ${evid()}/15`; $('cSide').textContent = `🤝 ${helped()}/${SIDE.length}`;
  refreshSide(); screenT = -9;
  const sat = mode === 'story' ? (S.final ? 1.15 : 0.35 + truths() * 0.14) : 1.05;
  cv.style.filter = `saturate(${sat})`;
}

function objective() {
  if (S.final) return { t: 'The city is free!', d: 'Explore Trend City, finish the side missions, or open the menu to see your press card.', p: null };
  for (let i = 0; i < CH.length; i++) {
    const ch = CH[i], st = cst(ch.id), info = zoneInfo[i];
    if (st.done) continue;
    if (!st.read) return { t: `${ch.icon} ${ch.name} · ${ch.place}`, d: `Find <b>${ch.npc.name}</b> and read the article.`, p: info.npcPos };
    if (st.files.some(f => !f)) {
      let best = null, bd = 1e9; st.files.forEach((f, k) => { if (!f) { const d = info.itemPos[k].distanceTo(player.pos); if (d < bd) { bd = d; best = info.itemPos[k]; } } });
      return { t: `${ch.icon} ${ch.name} · Evidence files`, d: `Find the glowing evidence files (${st.files.filter(Boolean).length}/3).`, p: best };
    }
    return { t: `${ch.icon} ${ch.name}`, d: `Go back to <b>${ch.npc.name}</b> to get the Truth File.`, p: info.npcPos };
  }
  return { t: '🤖 The final debate', d: `You have all 5 Truth Files! Face <b>HYPE</b> at the Trend Tower.`, p: new THREE.Vector3(0, 0, 17) };
}

async function talkNPC(n) {
  const ch = CH[n.ci], st = cst(ch.id);
  n.c.play('interact-right', 0.2, true);
  if (st.done) { await say(ch.npc.name, ch.color, `Thank you again! ${ch.bye}`, [['Bye!']]); return; }
  const prev = CH.slice(0, n.ci).find(c => !cst(c.id).done);
  if (!st.read && prev) { await say(ch.npc.name, ch.color, `Hi, reporter! I've heard about you. But first, help <b>${prev.npc.name}</b> in <b>${prev.name}</b>. Come back later — I'll be here! 😉`, [['OK']]); return; }
  if (!st.read) {
    const r = await say(ch.npc.name, ch.color, ch.hello, [['Read the article 📖'], ['Later', 'alt']]);
    if (r !== 0) return;
    sfx('open');
    await runQuiz({ title: `${ch.icon} ${ch.title}`, color: ch.color, items: ch.reading, reading: { title: ch.title, text: ch.text }, passMin: 6 });
    st.read = true; save(); refreshStory();
    await say(ch.npc.name, ch.color, ch.after, [["I'll find them! 🔎"]]);
    toast('3 evidence files appeared! ✨');
    return;
  }
  if (st.files.some(f => !f)) { await say(ch.npc.name, ch.color, `You still need ${st.files.filter(f => !f).length} evidence file(s). Look for the light beams! (Press <b>M</b> for the map.)`, [['OK']]); return; }
  await say(ch.npc.name, ch.color, ch.bye, [['Take the Truth File 📁']]);
  st.done = true; save(); sfx('win'); player.c.play('emote-yes', 0.2, true);
  refreshStory(); toast(`📁 Truth File ${truths()}/${CH.length}`);
  if (truths() === CH.length) setTimeout(() => toast('HYPE is waiting at the Trend Tower…', 2600), 2000);
}

async function collectFile(ci, k) {
  const ch = CH[ci], st = cst(ch.id);
  files[ci][k].visible = false; sfx('coin');
  const [field, name] = FILES[k];
  await say(`Evidence file: ${name}`, ch.color, `This file from <b>${ch.name}</b> has 5 challenges${k ? ' (some answers must be <b>typed</b>)' : ''}. Get at least <b>4</b> right to keep it!`, [['Open it 📂']]);
  await runQuiz({ title: `${ch.icon} ${name}`, color: ch.color, items: ch[field], passMin: 4, shuffleItems: true, tip: k === 1 ? ch.tip : null });
  st.files[k] = true; save(); refreshStory(); toast('🔎 Evidence saved!');
  if (st.files.every(Boolean)) setTimeout(() => toast(`Go back to ${ch.npc.name}!`), 1900);
}

// ---------------- side missions ----------------
const sideNpcs = [];   // {c, q, markQ, markX, beam, pos, items[]}
const got = q => sst(q).got.filter(Boolean).length;
function collectible(kind, k) {
  const g = new THREE.Group(), item = new THREE.Group();
  if (kind === 'phone') { item.add(new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.06), M('#1b1b22'))); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.6), new THREE.MeshBasicMaterial({ color: ['#5ee7ff', '#ff6fa8', '#ffe03d', '#7dffb0'][k % 4] })); s.position.z = 0.035; item.add(s); }
  else if (kind === 'shirt') { const c = ['#e23b3b', '#2f6fe0', '#2ea64f', '#ffcf4a'][k % 4]; const b = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.08), M(c)); const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.08), M(c)); s1.position.set(-0.42, 0.22, 0); const s2 = s1.clone(); s2.position.x = 0.42; item.add(b, s1, s2); }
  else if (kind === 'spool') { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.4, 12), M(['#e2408f', '#1fb5a8', '#ffcf4a'][k % 3])); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 12), M('#c9a46a')); a.position.y = 0.22; const b = a.clone(); b.position.y = -0.22; item.add(c, a, b); }
  else { const b = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), M('#2b2b30', { roughness: 0.4 })); b.scale.y = 1.2; const knot = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 6), M('#2b2b30')); knot.position.y = 0.55; const tag = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.02), M('#2ea64f')); tag.position.set(0.3, 0.2, 0.32); item.add(b, knot, tag); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 6, 24), new THREE.MeshBasicMaterial({ color: '#29d3e8' })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.05;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 10, 10, 1, true), new THREE.MeshBasicMaterial({ color: '#29d3e8', transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 5;
  g.add(item, ring, beam); g.userData.item = item; g.visible = false; scene.add(g); return g;
}
function freeSpot(x, z, pad = 1.2) {
  if (colliders.some(c => c.r !== undefined ? Math.hypot(c.x - x, c.z - z) < c.r + pad : Math.abs(c.x - x) < c.hx + pad && Math.abs(c.z - z) < c.hz + pad)) return false;
  const p = { x, z }; clampWalk(p); return Math.abs(p.x - x) < 0.01 && Math.abs(p.z - z) < 0.01;
}
async function setupSide() {
  let r = 99;
  const R = () => { r = (r * 16807) % 2147483647; return (r - 1) / 2147483646; };
  for (const q of SIDE) {
    const sp = sideSpot(q), pos = new THREE.Vector3(sp.x, 0, sp.z);
    const c = await makeChar(q.npc.model, q.npc.tint);
    c.root.position.copy(pos); c.root.rotation.y = sp.face;
    const lb = label(q.npc.name, '#bff6ff'); lb.position.y = 2.6; c.root.add(lb);
    const markQ = label('?', '#29d3e8', 60, 2.6); markQ.position.y = 3.3; c.root.add(markQ);
    const markX = label('!', '#ffc23d', 60, 2.6); markX.position.y = 3.3; c.root.add(markX);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 18, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#29d3e8', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
    beam.position.set(pos.x, 9, pos.z); scene.add(beam);
    scene.add(c.root); colliders.push({ x: pos.x, z: pos.z, r: 0.7 });
    const items = [];
    if (q.collect) for (let k = 0; k < q.collect.n; k++) {
      let x = pos.x, z = pos.z;
      for (let tries = 0; tries < 80; tries++) { const a = R() * Math.PI * 2, d = 7 + R() * (q.kind === 'park' ? 12 : 16); x = pos.x + Math.cos(a) * d; z = pos.z + Math.sin(a) * d; if (freeSpot(x, z) && items.every(o => Math.hypot(o.position.x - x, o.position.z - z) > 4)) break; }
      const g = collectible(q.collect.kind, k); g.position.set(x, 0, z); items.push(g);
    }
    sideNpcs.push({ c, q, markQ, markX, beam, pos, items });
  }
}
function refreshSide() {
  const story = mode === 'story';
  sideNpcs.forEach(n => {
    const q = n.q, st = sst(q);
    n.items.forEach((it, k) => it.visible = story && st.acc && !st.done && !st.got[k]);
    const ready = q.collect && st.acc && got(q) >= q.collect.n;
    n.markQ.visible = story && !st.done && !ready && !(q.collect && st.acc);
    n.markX.visible = story && !st.done && !!ready;
    n.beam.visible = story && !st.done;
  });
}
async function talkSide(n) {
  const q = n.q, st = sst(q), col = q.npc.tint || '#1a8fa0', tag = `<div class="small" style="margin-top:8px">${q.icon} <b>${esc(q.title)}</b> · side mission</div>`;
  n.c.play('interact-right', 0.2, true);
  if (st.done) { await say(q.npc.name, col, q.thanks, [['Bye!']]); return; }
  if (q.collect && !st.acc) {
    const r = await say(q.npc.name, col, q.hello + tag, [["I'll help! 🤝"], ['Not now', 'alt']]);
    if (r !== 0) return;
    st.acc = true; st.got = []; save(); refreshSide(); toast(`${q.collect.icon} Find ${q.collect.n} ${q.collect.what}!`, 2200); return;
  }
  if (q.collect && got(q) < q.collect.n) { await say(q.npc.name, col, `You have <b>${got(q)}/${q.collect.n}</b> ${q.collect.what}. Look for the blue light beams near here!`, [['OK']]); return; }
  if (!q.collect) { const r = await say(q.npc.name, col, q.hello + tag, [["Let's read! 📖"], ['Not now', 'alt']]); if (r !== 0) return; }
  else await say(q.npc.name, col, q.ready, [['Read 📖']]);
  sfx('open');
  await runQuiz({ title: `${q.icon} ${q.title}`, color: '#1a8fa0', items: q.items, reading: { title: q.title, text: q.text }, passMin: 3 });
  st.done = true; st.acc = true; save(); refreshStory();
  sfx('win'); player.c.play('emote-yes', 0.2, true); n.c.play('emote-yes', 0.2, true);
  await say(q.npc.name, col, q.thanks, [[`🤝 Side missions ${helped()}/${SIDE.length}`]]);
}
function pickSide(n, k) {
  const q = n.q, st = sst(q); st.got[k] = true; save();
  sfx('coin'); player.c.play('pick-up', 0.1, true); refreshSide();
  const g = got(q); toast(g >= q.collect.n ? `${q.collect.icon} ${g}/${q.collect.n} — go back to ${q.npc.name}!` : `${q.collect.icon} ${g}/${q.collect.n}`, 1700);
}
function sideHint() {
  const act = SIDE.find(q => q.collect && sst(q).acc && !sst(q).done);
  if (act) return got(act) >= act.collect.n ? `${act.icon} Go back to ${act.npc.name}!` : `${act.collect.icon} ${act.title}: ${got(act)}/${act.collect.n} ${act.collect.what}`;
  let best = null, bd = 35;
  sideNpcs.forEach(n => { if (sst(n.q).done) return; const d = n.pos.distanceTo(player.pos); if (d < bd) { bd = d; best = n; } });
  return best ? `💬 ${best.q.npc.name} needs help nearby! (side mission)` : '';
}

// ---------------- bus (fast travel) ----------------
async function takeBus(stop) {
  const others = stopInfo.filter(s => s !== stop);
  const r = await say('🚌 City Bus', '#2f6fe0', `Where do you want to go? The bus is free for reporters! 😄`, [...others.map(s => [s.name]), ['Cancel', 'alt']]);
  if (r >= others.length) return;
  const dest = others[r];
  cv.style.transition = 'opacity .35s'; cv.style.opacity = 0; sfx('page');
  await new Promise(res => setTimeout(res, 380));
  const a = dest.g.rotation.y; player.pos.set(dest.pos.x + Math.sin(a) * 2.5, 0, dest.pos.z + Math.cos(a) * 2.5);
  cam.yaw = a; player.ry = a + Math.PI;
  cv.style.opacity = 1; toast(`🚌 ${dest.name}`);
}

// ---------------- minimap ----------------
const mini = $('mini'), mctx = mini.getContext('2d');
const MW = MAP.maxX - MAP.minX, MH = MAP.maxZ - MAP.minZ;
let miniBg = null, lastObj = null;
function mapXY(x, z) { return [(x - MAP.minX) / MW * mini.width, (z - MAP.minZ) / MH * mini.height]; }
function buildMiniBg() {
  const c = document.createElement('canvas'); c.width = mini.width; c.height = mini.height; const x = c.getContext('2d');
  const K = mini.width / MW;
  x.fillStyle = '#86b85a'; x.fillRect(0, 0, c.width, c.height);
  mapRects.forEach(r => { x.fillStyle = r.col; const [px, pz] = mapXY(r.x, r.z); if (r.r) { x.beginPath(); x.arc(px, pz, r.r * K, 0, 7); x.fill(); } else x.fillRect(px - r.hx * K, pz - r.hz * K, r.hx * 2 * K, r.hz * 2 * K); });
  miniBg = c;
}
function drawMini(t) {
  if (!miniBg) buildMiniBg();
  const W = mini.width, K = W / 520, big = mini.classList.contains('big');
  mctx.drawImage(miniBg, 0, 0);
  mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
  if (big) landmarks.forEach(l => { const [px, pz] = mapXY(l.x, l.z); mctx.font = `800 ${(l.bus ? 12 : 10) * K}px Nunito, sans-serif`; mctx.lineWidth = 3 * K; mctx.strokeStyle = 'rgba(255,255,255,.85)'; mctx.strokeText(l.name, px, pz); mctx.fillStyle = '#1b1a3a'; mctx.fillText(l.name, px, pz); });
  if (mode === 'story') {
    CH.forEach((ch, i) => { const [px, pz] = mapXY(zoneInfo[i].npcPos.x, zoneInfo[i].npcPos.z), done = cst(ch.id).done; mctx.fillStyle = done ? ch.color : '#8a8a8a'; mctx.beginPath(); mctx.arc(px, pz, 9 * K, 0, 7); mctx.fill(); mctx.lineWidth = 2.5 * K; mctx.strokeStyle = '#fff'; mctx.stroke(); mctx.font = `${10 * K}px sans-serif`; mctx.fillText(ch.icon, px, pz + 1); });
    sideNpcs.forEach(n => {
      const st = sst(n.q), [px, pz] = mapXY(n.pos.x, n.pos.z); mctx.font = `800 ${12 * K}px Nunito, sans-serif`;
      if (st.done) { mctx.fillStyle = 'rgba(255,255,255,.95)'; mctx.fillText('✓', px, pz); return; }
      const ready = n.q.collect && st.acc && got(n.q) >= n.q.collect.n;
      mctx.fillStyle = ready ? '#ffc23d' : '#29d3e8'; mctx.beginPath(); mctx.arc(px, pz, 6.5 * K, 0, 7); mctx.fill(); mctx.lineWidth = 2 * K; mctx.strokeStyle = '#fff'; mctx.stroke();
      mctx.fillStyle = '#fff'; mctx.fillText(ready ? '!' : '?', px, pz + 1);
    });
    if (lastObj && lastObj.p) {
      const [px, pz] = mapXY(lastObj.p.x, lastObj.p.z), r = (8 + Math.sin(t * 5) * 2) * K;
      mctx.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; mctx.lineTo(px + Math.cos(a) * rr, pz + Math.sin(a) * rr); } mctx.closePath();
      mctx.fillStyle = '#ffc23d'; mctx.strokeStyle = '#1b1a3a'; mctx.lineWidth = 2 * K; mctx.fill(); mctx.stroke();
    }
  }
  if (mode === 'online') ON.tok.forEach(l => { if (!l.g.visible) return; const [px, pz] = mapXY(l.g.position.x, l.g.position.z); mctx.fillStyle = '#ff3d8b'; mctx.beginPath(); mctx.arc(px, pz, 4 * K, 0, 7); mctx.fill(); });
  if (mode === 'online') for (const e of ON.peers.values()) if (e.c) { const [px, pz] = mapXY(e.c.root.position.x, e.c.root.position.z); mctx.fillStyle = '#35e6ff'; mctx.beginPath(); mctx.arc(px, pz, 4 * K, 0, 7); mctx.fill(); }
  const [px, pz] = mapXY(player.pos.x, player.pos.z);
  mctx.save(); mctx.translate(px, pz); mctx.rotate(Math.PI - player.ry); mctx.scale(K * (big ? 0.9 : 1.2), K * (big ? 0.9 : 1.2));
  mctx.fillStyle = '#ff2e93'; mctx.strokeStyle = '#fff'; mctx.lineWidth = 3; mctx.beginPath(); mctx.moveTo(0, -11); mctx.lineTo(8, 9); mctx.lineTo(0, 4); mctx.lineTo(-8, 9); mctx.closePath(); mctx.stroke(); mctx.fill();
  mctx.restore();
}
mini.addEventListener('click', () => { sfx('click'); mini.classList.toggle('big'); });

// ---------------- final debate ----------------
async function bossDuel() {
  const r = await say(BOSS.name, '#e2408f', BOSS.intro, [['Start the debate! 🎤'], ['Not yet', 'alt']]);
  if (r !== 0) return;
  playMusic('m_boss');
  let hp = 8, hearts = 3, idx = 0;
  const items = shuffle(BOSS.items).map(prepItem);
  const won = await new Promise(res => {
    const step = () => {
      if (hp <= 0) return res(true);
      if (hearts <= 0 || idx >= items.length) return res(false);
      const it = items[idx++];
      const head = `<div class="duel"><div>You ${'❤️'.repeat(hearts)}${'🤍'.repeat(3 - hearts)}</div><div style="text-align:right">HYPE's signal<div class="hp"><i style="width:${hp / 8 * 100}%"></i></div></div></div>`;
      openModal(`<h2>🎤 The Great Debate</h2>${cardHtml(it, head)}`);
      bindCard(it, 'Final debate vs HYPE', ok => {
        if (ok) { hp--; sfx('hit'); player.c.play('attack-melee-right', 0.1, true); boss.play('emote-no', 0.1, true); } else { hearts--; player.c.play('emote-no', 0.1, true); }
        $('mbox').querySelector('.hp i').style.width = `${Math.max(0, hp) / 8 * 100}%`;
        $('qfoot').innerHTML = `<button class="btn">Next ➜</button>`; $('qfoot').firstChild.onclick = step; $('qfoot').firstChild.focus();
      }, '✔ Great argument!', '✘ HYPE wins this point.');
    };
    step();
  });
  closeModal(); playMusic('m_story');
  if (!won) { await say(BOSS.name, '#e2408f', 'HA! Your arguments are not strong enough. Read your Truth Files again and come back! 😈', [['Try again later']]); return; }
  S.final = true; save(); refreshStory();
  boss.play('die', 0.2, true); player.c.play('emote-yes', 0.2, true); sfx('win');
  fireworks();
  await say(BOSS.name, '#e2408f', BOSS.win, [['🎉 See my press card']]);
  certificate();
}
function certificate() {
  const rows = Object.entries(SKILLS).map(([k, n]) => { const [c, t] = S.stats[k] || [0, 0]; return `<tr><td><span style="color:${KCOL[k]}">●</span> ${n}</td><td>${t ? Math.round(c / t * 100) : 0}% <span class="small">(${c}/${t})</span></td></tr>`; }).join('');
  const tot = Object.values(S.stats).reduce((a, [c, t]) => [a[0] + c, a[1] + t], [0, 0]);
  openModal(`<div class="cert"><h2 style="font-size:32px">🪪 Critical Eye Press Card</h2><div class="bubble" style="display:inline-block;margin-top:8px">This certifies that <b>${esc(S.name || 'the reporter')}</b> collected the five Truth Files, defeated HYPE in a debate and freed Trend City.<br><span class="small">${new Date().toLocaleDateString('es-CL')} · Unit 4: What impact do trends have? · 3° medio</span></div>
  <table>${rows}<tr><td>🤝 Side missions</td><td>${helped()}/${SIDE.length}</td></tr><tr><td><b>Total (all attempts)</b></td><td>${tot[1] ? Math.round(tot[0] / tot[1] * 100) : 0}%</td></tr></table><div class="small">Take a screenshot and send it to your teacher.</div></div><div class="foot"><button class="btn" id="cOk">Continue</button></div>`);
  $('cOk').onclick = () => { sfx('click'); closeModal(); };
}
const fw = [];
function fireworks() {
  for (let n = 0; n < 16; n++) setTimeout(() => {
    const col = new THREE.Color().setHSL(Math.random(), 1, 0.6), N = 80, pos = new Float32Array(N * 3), vel = [];
    const o = new THREE.Vector3((Math.random() - .5) * 30, 30 + Math.random() * 20, (Math.random() - .5) * 30);
    for (let i = 0; i < N; i++) { pos.set([o.x, o.y, o.z], i * 3); vel.push(new THREE.Vector3().randomDirection().multiplyScalar(8 + Math.random() * 4)); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ color: col, size: 0.8, transparent: true })); scene.add(p);
    fw.push({ p, vel, life: 1.8 });
  }, n * 260);
}

// ---------------- online: Trend Rush ----------------
const ROUND = 180000, BREAK = 15000, PERIOD = ROUND + BREAK, NT = 14, ON_R = 110;
const ON = { tok: [], score: 0, streak: 0, round: -1, peers: new Map(), lastSend: 0, lastSent: null, pool: [], podiumShown: -1 };
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function tokPos(r, i, gen) {
  const R = mulberry(r * 7919 + i * 131 + gen * 17 + 3);
  for (let tries = 0; tries < 60; tries++) { const x = (R() * 2 - 1) * ON_R, z = (R() * 2 - 1) * ON_R; if (freeSpot(x, z, 1.4)) return new THREE.Vector3(x, 0, z); }
  return new THREE.Vector3(0, 0, 30);
}
function setupOnlineObjects() {
  if (ON.tok.length) return;
  const cols = ['#ff3d8b', '#35e6ff', '#b45cff', '#ffe03d', '#3dff8b'];
  for (let i = 0; i < NT; i++) {
    const col = cols[i % 5], g = new THREE.Group();
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTex('#', { w: 128, h: 128, bg: 'rgba(0,0,0,0)', fg: col, size: 120, stroke: '#ffffff' }), depthWrite: false })); s.scale.setScalar(1.6); s.position.y = 1.6; g.add(s);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 16, 12, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 8; g.add(beam);
    g.visible = false; scene.add(g); ON.tok.push({ g, gen: 0, hideUntil: 0 });
  }
  ON.pool = [...CH.flatMap(c => [...c.vocab, ...c.liu, ...c.wf]), ...BOSS.items, ...ONLINE_EXTRA];
}
const roundNow = () => Math.floor(Date.now() / PERIOD);
function placeTokens() { const r = roundNow(); ON.tok.forEach((l, i) => l.g.position.copy(tokPos(r, i, l.gen))); }
async function addPeer(p) {
  if (ON.peers.has(p.id)) return;
  const entry = { id: p.id, c: null, target: START.clone(), ry: 0, data: p };
  ON.peers.set(p.id, entry);
  const c = await makeChar(CHARS.some(x => x[0] === p.char) ? p.char : 'b');
  if (!ON.peers.has(p.id)) return;
  entry.c = c; c.root.position.copy(entry.target);
  const lb = label(String(p.name || 'Player').slice(0, 14), '#ffe7a8'); lb.position.y = 2.6; c.root.add(lb);
  scene.add(c.root);
}
function removePeer(p) { const e = ON.peers.get(p.id); if (e) { if (e.c) scene.remove(e.c.root); ON.peers.delete(p.id); } renderBoard(); }
net.on('status', s => {
  if (s === 'online') { toast(`🌐 Online · Room ${net.NET.room}`); sendState(true); }
  else if (s === 'offline' || s === 'error') $('objD').innerHTML = 'Could not connect. You can still play alone — check the internet connection.';
  else if (s === 'full') $('objD').innerHTML = 'All rooms are full right now. Playing alone.';
  else $('objD').innerHTML = s;
});
net.on('join', p => { addPeer(p); toast(`${esc(p.name)} joined!`, 1200); });
net.on('leave', p => removePeer(p));
net.on('roster', () => { for (const p of net.NET.peers.values()) { const e = ON.peers.get(p.id); if (e) e.data = p; else addPeer(p); } renderBoard(); });
net.on('st', m => { const e = ON.peers.get(m.id); if (!e) return; e.target.set(m.x, 0, m.z); e.ry = m.ry; });
net.on('claim', m => { if (m.r !== roundNow()) return; const l = ON.tok[m.i]; if (l && m.gen >= l.gen) { l.gen = m.gen + 1; l.hideUntil = performance.now() + 6000; l.g.visible = false; l.g.position.copy(tokPos(m.r, m.i, l.gen)); } });
net.on('emo', m => { const e = ON.peers.get(m.id); if (e && e.c) e.c.play(m.e, 0.2, true); });
function sendState(force) {
  const now = performance.now(), p = player.pos, a = player.c?.curName || 'idle';
  const moved = !ON.lastSent || Math.hypot(p.x - ON.lastSent.x, p.z - ON.lastSent.z) > 0.3 || a !== ON.lastSent.a;
  if (force || (moved && now - ON.lastSend > 1000) || now - ON.lastSend > 5000) { net.send('st', { x: +p.x.toFixed(2), z: +p.z.toFixed(2), ry: +player.ry.toFixed(2), a }); ON.lastSend = now; ON.lastSent = { x: p.x, z: p.z, a }; }
}
function me() { return { name: S.name || 'Player', char: S.char, score: ON.score, r: roundNow() }; }
function renderBoard() {
  if (mode !== 'online') return;
  const r = roundNow();
  const list = [{ name: S.name || 'You', score: ON.score, me: true }, ...[...net.NET.peers.values()].map(p => ({ name: p.name, score: p.r === r ? p.score || 0 : 0 }))].sort((a, b) => b.score - a.score);
  const t = Date.now() % PERIOD, left = Math.max(0, Math.ceil((ROUND - t) / 1000));
  $('board').innerHTML = `<h3>${t < ROUND ? `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : '🏁 Round over'} · Room ${net.NET.room || '–'}</h3><ol>${list.slice(0, 8).map(p => `<li class="${p.me ? 'me' : ''}">${esc(p.name)} — ${p.score}</li>`).join('')}</ol><div class="small">${list.length} player(s) · best: ${S.best}</div>`;
}
let onlineBusy = false;
async function onlineQuestion(i) {
  const l = ON.tok[i]; if (onlineBusy) return; onlineBusy = true;
  const r = roundNow();
  l.g.visible = false; net.send('claim', { i, gen: l.gen, r }); l.gen++; l.hideUntil = performance.now() + 6000; l.g.position.copy(tokPos(r, i, l.gen));
  sfx('coin');
  const it = prepItem(ON.pool[Math.floor(Math.random() * ON.pool.length)]);
  await new Promise(res => {
    openModal(`<h2>#️⃣ Trend Rush</h2>${cardHtml(it)}`);
    bindCard(it, 'Online Trend Rush', ok => {
      let pts = 0;
      if (ok && roundNow() === r) { ON.streak++; pts = (it.t ? 15 : 10) + Math.min(10, (ON.streak - 1) * 2); ON.score += pts; S.best = Math.max(S.best, ON.score); save(); net.updateMe(me()); } else ON.streak = 0;
      $('why').insertAdjacentHTML('afterbegin', `<div class="why ${ok ? 'ok' : 'no'}" style="margin-bottom:6px">${ok ? `+${pts} points${ON.streak > 1 ? ` (streak ×${ON.streak})` : ''}${it.t ? ' · typed bonus!' : ''}` : 'No points this time.'}</div>`);
      $('qfoot').innerHTML = `<button class="btn">Back to the city ➜</button>`; $('qfoot').firstChild.onclick = () => { closeModal(); res(); }; $('qfoot').firstChild.focus();
    });
  });
  onlineBusy = false; renderBoard();
}
function onlineTick() {
  const r = roundNow(), t = Date.now() % PERIOD, now = performance.now();
  if (r !== ON.round) { ON.round = r; ON.score = 0; ON.streak = 0; ON.tok.forEach(l => { l.gen = 0; l.hideUntil = 0; }); placeTokens(); net.updateMe(me()); if (ON.podiumShown >= 0 && modalOpen) closeModal(); toast('#️⃣ New round! Grab the trend tokens!'); }
  const playing = t < ROUND;
  ON.tok.forEach((l, i) => { l.g.visible = playing && now > l.hideUntil; if (l.g.visible && !modalOpen && player.pos.distanceTo(l.g.position) < 1.9) onlineQuestion(i); });
  if (!playing && ON.podiumShown !== r && !modalOpen) {
    ON.podiumShown = r;
    const list = [{ name: S.name || 'You', score: ON.score }, ...[...net.NET.peers.values()].filter(p => p.r === r).map(p => ({ name: p.name, score: p.score || 0 }))].sort((a, b) => b.score - a.score);
    openModal(`<div class="cert"><h2>🏁 Round finished!</h2><table>${list.slice(0, 6).map((p, i) => `<tr><td>${['🥇', '🥈', '🥉'][i] || i + 1 + '.'} ${esc(p.name)}</td><td>${p.score}</td></tr>`).join('')}</table><div class="small">A new round starts in a few seconds…</div></div><div class="foot"><button class="btn" id="pOk">OK</button></div>`);
    sfx('win'); player.c.play('emote-yes', 0.2, true); $('pOk').onclick = () => closeModal();
  }
  sendState(false);
  if (now - (ON.boardT || 0) > 1000) { ON.boardT = now; renderBoard(); }
}
function emote(e) { if (mode === 'menu' || !player.c) return; player.c.play(e, 0.2, true); if (mode === 'online') net.send('emo', { e }); }
$('emotes').querySelectorAll('.btn').forEach(b => b.onclick = () => emote(b.dataset.e));

// ---------------- interaction ----------------
let near = null;
function findNear() {
  near = null;
  if (mode === 'story') {
    for (const n of npcs) if (n.pos.distanceTo(player.pos) < 3) near = { t: 'npc', n, label: `Talk to ${CH[n.ci].npc.name}` };
    for (const n of sideNpcs) if (n.pos.distanceTo(player.pos) < 3) near = { t: 'side', n, label: sst(n.q).done ? `Talk to ${n.q.npc.name}` : `Help ${n.q.npc.name} ${n.q.icon}` };
    if (boss && boss.root.visible && boss.root.position.distanceTo(player.pos) < 5) near = { t: 'boss', label: `Debate with ${BOSS.name} 🎤` };
  }
  if (mode !== 'menu' && !near) for (const s of stopInfo) if (s.pos.distanceTo(player.pos) < 3.2) near = { t: 'bus', s, label: 'Take the bus 🚌' };
  const el = $('prompt');
  if (near && !modalOpen) { el.innerHTML = `<kbd>${isTouch ? 'Tap' : 'E'}</kbd>${near.label}`; el.classList.remove('hidden'); } else el.classList.add('hidden');
}
function interact() {
  if (modalOpen || !near) return;
  sfx('click');
  if (near.t === 'npc') talkNPC(near.n);
  if (near.t === 'boss') bossDuel();
  if (near.t === 'side') talkSide(near.n);
  if (near.t === 'bus') takeBus(near.s);
}

// ---------------- loop ----------------
const clock = new THREE.Clock(), tmp = new THREE.Vector3();
function collide(p, rad = 0.45) {
  for (const c of colliders) {
    if (c.r !== undefined) { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + rad; if (d < m && d > 1e-4) { p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; } }
    else {
      const dx = p.x - c.x, dz = p.z - c.z; if (Math.abs(dx) > c.hx + rad || Math.abs(dz) > c.hz + rad) continue;
      const qx = THREE.MathUtils.clamp(dx, -c.hx, c.hx), qz = THREE.MathUtils.clamp(dz, -c.hz, c.hz);
      const ex = dx - qx, ez = dz - qz, d = Math.hypot(ex, ez);
      if (d > 1e-4) { if (d < rad) { p.x = c.x + qx + ex / d * rad; p.z = c.z + qz + ez / d * rad; } }
      else { const px = c.hx + rad - Math.abs(dx), pz = c.hz + rad - Math.abs(dz); if (px < pz) p.x = c.x + Math.sign(dx || 1) * (c.hx + rad); else p.z = c.z + Math.sign(dz || 1) * (c.hz + rad); }
    }
  }
  for (const car of cars) { if (!car.g.visible) continue; const cp = car.g.position, along = car.axis === 'x'; const hx = along ? 2.3 : 1.1, hz = along ? 1.1 : 2.3; const dx = p.x - cp.x, dz = p.z - cp.z; if (Math.abs(dx) < hx + rad && Math.abs(dz) < hz + rad) { const px = hx + rad - Math.abs(dx), pz = hz + rad - Math.abs(dz); if (px < pz) p.x = cp.x + Math.sign(dx || 1) * (hx + rad); else p.z = cp.z + Math.sign(dz || 1) * (hz + rad); } }
  clampWalk(p);
}
function updatePlayer(dt) {
  const c = player.c; if (!c) return;
  let f = 0, s = 0;
  if (!modalOpen && mode !== 'menu') {
    f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - stick.y;
    s = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + stick.x;
  }
  const len = Math.min(1, Math.hypot(f, s));
  const run = (keys.ShiftLeft || keys.ShiftRight || Math.hypot(stick.x, stick.y) > 0.85) ? 1 : 0;
  const speed = len * (run ? 12 : 5.5);
  if (len > 0.05) {
    const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
    const mx = (fx * f + rx * s) / Math.hypot(f, s), mz = (fz * f + rz * s) / Math.hypot(f, s);
    player.pos.x += mx * speed * dt; player.pos.z += mz * speed * dt;
    let d = Math.atan2(mx, mz) - player.ry; d = Math.atan2(Math.sin(d), Math.cos(d)); player.ry += d * Math.min(1, dt * 12);
  }
  if (keys.Space && player.ground && !modalOpen && mode !== 'menu') { player.vy = 7.5; player.ground = false; }
  player.vy -= 22 * dt; player.pos.y += player.vy * dt;
  if (player.pos.y <= 0) { player.pos.y = 0; player.vy = 0; player.ground = true; }
  collide(player.pos);
  c.root.position.copy(player.pos); c.root.rotation.y = player.ry;
  if (performance.now() > c.lockUntil) {
    if (speed > 7) c.play('sprint', 0.15); else if (speed > 0.3 || !player.ground) c.play('walk', 0.15); else c.play('idle', 0.25);
  }
}
function updateCamera(dt) {
  if (mode === 'menu') cam.yaw += dt * 0.1;
  const t = player.pos;
  let dist = cam.dist;
  const dx = Math.sin(cam.yaw) * Math.cos(cam.pitch), dy = Math.sin(cam.pitch), dz = Math.cos(cam.yaw) * Math.cos(cam.pitch), hy = t.y + 1.6;
  const R = cam.dist + 30, nb = camBlockers.filter(b => Math.abs(b.x - t.x) < R && Math.abs(b.z - t.z) < R);
  const inside = (b, px, py, pz) => py > b.y0 && py < b.y1 && (b.r !== undefined ? (b.x - px) ** 2 + (b.z - pz) ** 2 < b.r * b.r : Math.abs(b.x - px) < b.hx + 0.3 && Math.abs(b.z - pz) < b.hz + 0.3);
  if (nb.length) for (let s = 1.2; s <= cam.dist; s += 0.4) { const px = t.x + dx * s, py = hy + dy * s, pz = t.z + dz * s; if (nb.some(b => inside(b, px, py, pz))) { dist = Math.max(1.6, s - 0.7); break; } }
  const h = Math.sin(cam.pitch) * dist, hd = Math.cos(cam.pitch) * dist;
  const want = tmp.set(t.x + Math.sin(cam.yaw) * hd, Math.max(0.6, t.y + 1.6 + h), t.z + Math.cos(cam.yaw) * hd);
  camera.position.lerp(want, Math.min(1, dt * 10));
  camera.lookAt(t.x, t.y + 1.5, t.z);
  const sun = scene.userData.sun; sun.position.set(t.x + 30, 60, t.z + 20); sun.target.position.set(t.x, 0, t.z);
}
function updateHUD() {
  if (mode !== 'story') { $('arrow').style.display = 'none'; if (beacon) beacon.visible = false; return; }
  const o = objective(); lastObj = o;
  const hint = S.final ? '' : sideHint();
  $('objT').innerHTML = o.t; $('objD').innerHTML = o.d + (hint ? `<span class="sideHint">${hint}</span>` : '');
  if (o.p && o.p.distanceTo(player.pos) > 4) {
    const target = Math.atan2(o.p.x - player.pos.x, o.p.z - player.pos.z), fwd = Math.atan2(-Math.sin(cam.yaw), -Math.cos(cam.yaw));
    const diff = Math.atan2(Math.sin(target - fwd), Math.cos(target - fwd));
    $('arrow').style.display = 'block'; $('arrow').style.transform = `rotate(${-diff}rad)`;
    $('dist').textContent = `${Math.round(o.p.distanceTo(player.pos))} m`;
  } else { $('arrow').style.display = 'none'; $('dist').textContent = ''; }
  if (beacon) { beacon.visible = !!o.p; if (o.p) beacon.position.set(o.p.x, 25, o.p.z); }
  if (!S.final && music.dataset.n !== 'm_boss') playMusic(player.pos.x > 190 ? 'm_desert' : 'm_story');
}

let frame = 0;
function loop() { requestAnimationFrame(loop); step(); }
function step() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  updatePlayer(dt);
  if (player.c) player.c.mixer.update(dt);
  for (const n of [...npcs, ...sideNpcs]) { if (n.pos.distanceTo(player.pos) > 80) continue; n.c.mixer.update(dt); if (performance.now() > n.c.lockUntil) n.c.play('idle', 0.3); }
  if (boss && boss.root.visible) { boss.mixer.update(dt); if (performance.now() > boss.lockUntil) boss.play('idle', 0.3); boss.root.rotation.y = Math.atan2(player.pos.x - boss.root.position.x, player.pos.z - boss.root.position.z); }
  for (const f of animated) f(t, dt);
  updateTraffic(dt, player.pos);
  updateScreens(t);
  if (mode === 'story') {
    files.forEach((arr, ci) => arr.forEach((s, k) => {
      if (!s.visible) return;
      s.userData.item.rotation.y = t * 2; s.userData.item.position.y = Math.sin(t * 2 + s.position.x) * 0.15;
      if (!modalOpen && Math.hypot(s.position.x - player.pos.x, s.position.z - player.pos.z) < 1.8) collectFile(ci, k);
    }));
    sideNpcs.forEach(n => n.items.forEach((it, k) => {
      if (!it.visible) return;
      const m = it.userData.item; m.position.y = 0.9 + Math.sin(t * 2 + k) * 0.15; m.rotation.y = t * 1.8;
      if (!modalOpen && Math.hypot(it.position.x - player.pos.x, it.position.z - player.pos.z) < 1.7) pickSide(n, k);
    }));
  }
  if (mode === 'online') {
    onlineTick();
    for (const e of ON.peers.values()) {
      if (!e.c) continue;
      const p = e.c.root.position, d = p.distanceTo(e.target);
      if (d > 15) p.copy(e.target); else p.lerp(e.target, Math.min(1, dt * 1.6));
      let dr = e.ry - e.c.root.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); e.c.root.rotation.y += dr * Math.min(1, dt * 6);
      if (performance.now() > e.c.lockUntil) e.c.play(d > 0.15 ? (d > 2.5 ? 'sprint' : 'walk') : 'idle', 0.25);
      e.c.mixer.update(dt);
    }
    ON.tok.forEach(l => { if (l.g.visible) l.g.children[0].position.y = 1.6 + Math.sin(t * 2 + l.g.position.x) * 0.25; });
  }
  for (let i = fw.length - 1; i >= 0; i--) { const f = fw[i]; f.life -= dt; const pos = f.p.geometry.attributes.position; f.vel.forEach((v, k) => { v.y -= 6 * dt; pos.array[k * 3] += v.x * dt; pos.array[k * 3 + 1] += v.y * dt; pos.array[k * 3 + 2] += v.z * dt; }); pos.needsUpdate = true; f.p.material.opacity = Math.max(0, f.life / 1.8); if (f.life <= 0) { scene.remove(f.p); fw.splice(i, 1); } }
  if (window.__freeCam) { camera.position.copy(window.__freeCam.p); camera.lookAt(window.__freeCam.t); } else updateCamera(dt);
  findNear(); updateHUD();
  if (mode !== 'menu' && (frame++ & 1)) drawMini(t);
  renderer.render(scene, camera);
}

// ---------------- menu ----------------
function buildMenu() {
  $('chars').innerHTML = CHARS.map(([m, n]) => `<button data-m="${m}" class="${S.char === m ? 'on' : ''}">${n}</button>`).join('');
  $('chars').querySelectorAll('button').forEach(b => b.onclick = async () => { sfx('click'); S.char = b.dataset.m; save(); buildMenu(); await setPlayerModel(S.char); player.c.play('emote-yes', 0.2, true); });
  const st = student();
  if (st && !S.name && st.first_name) { S.name = String(st.first_name).slice(0, 14); save(); }
  $('pname').value = S.name;
  $('esltStatus').innerHTML = st
    ? `📊 Hola, <b>${esc(st.first_name || st.name || '')}</b> (${esc(st.section || '')}). Tu profe verá tu avance.`
    : `⚠️ No has iniciado sesión: tu profe no verá tu avance. <a href="https://eslteacher.cl/" target="_blank" rel="noopener">Entra en eslteacher.cl</a> (Mi perfil) y vuelve a abrir el juego.`;
  $('esltStatus').classList.toggle('warn', !st);
  $('progressTxt').textContent = S.final ? '🏆 Story completed!' : `Story: 📁 ${truths()}/${CH.length} · 🔎 ${evid()}/15 · 🤝 ${helped()}/${SIDE.length}`;
}
$('pname').addEventListener('input', e => { S.name = e.target.value.trim(); save(); });
$('bReset').onclick = () => { if (confirm('Reset your story progress?')) { const keep = { name: S.name, char: S.char, best: S.best }; S = Object.assign(freshSave(), keep); save(); refreshStory(); buildMenu(); } };
$('bStory').onclick = () => start('story');
$('bOnline').onclick = () => start('online');
$('menuBtn').onclick = () => {
  if (modalOpen) return;
  const btns = [['Continue playing'], ['Main menu', 'alt']]; if (S.final) btns.splice(1, 0, ['🪪 Press card', 'teal']);
  say('Menu', '#7a2d8f', `Reporter: <b>${esc(S.name || 'Player')}</b><br>Truth Files: ${truths()}/${CH.length} · Evidence: ${evid()}/15 · Side missions: ${helped()}/${SIDE.length}<br><span class="small">Tip: use the 🚌 bus stops to travel fast.</span>`, btns).then(i => { const lab = btns[i][0]; if (lab.includes('Press card')) certificate(); if (lab === 'Main menu') toMenu(); });
};
function toMenu() {
  if (mode === 'online') { net.disconnect(); for (const e of ON.peers.values()) if (e.c) scene.remove(e.c.root); ON.peers.clear(); ON.tok.forEach(l => l.g.visible = false); }
  mode = 'menu'; $('menu').classList.remove('hidden'); $('hud').classList.add('hidden'); $('touch').classList.add('hidden');
  player.pos.copy(START); refreshStory(); buildMenu(); music.pause(); music.dataset.n = '';
}
async function start(m) {
  if (!S.name) { $('pname').focus(); $('pname').style.borderColor = '#d9433b'; toast('Write your name first ✍️'); return; }
  sfx('click');
  mode = m; $('menu').classList.add('hidden'); $('hud').classList.remove('hidden'); if (isTouch) $('touch').classList.remove('hidden');
  $('board').classList.toggle('hidden', m !== 'online'); $('emotes').classList.toggle('hidden', m !== 'online'); $('stats').classList.toggle('hidden', m !== 'story'); mini.classList.remove('big');
  cam.yaw = 0; player.pos.copy(START); player.ry = Math.PI;
  refreshStory();
  if (m === 'story') {
    playMusic('m_story');
    if (!S.intro) {
      await say('Prof. Rivera · Editor', '#7a2d8f', `Welcome to <b>The Critical Eye</b>, ${esc(S.name)}! You are our newest reporter. 📰<br><br>We have a big problem. An AI called <b>HYPE</b> has taken control of the giant screens of Trend City. Everybody is buying, scrolling and copying whatever HYPE says. Nobody stops to <b>think</b>.`, [['What can I do?']]);
      await say('Prof. Rivera · Editor', '#7a2d8f', `Investigate the 5 districts: <b>Hype Square, Pixel District, Mega Mall, Factory Row</b> and the <b>Atacama Desert</b>. In each one, read the article, answer the questions and find <b>3 evidence files</b> to win a <b>Truth File</b>.<br><br>With 5 Truth Files you can defeat HYPE in a debate. The city is BIG: follow the golden arrow ⬆️, the light beam and the ⭐ on the map (<b>M</b>). Run with <b>Shift</b> and use the <b>🚌 bus stops</b> to travel fast.<br><br>People with a <b>?</b> need help — side missions are good reporting too! 🤝`, [["Let's investigate! 🔎"]]);
      S.intro = true; save();
    }
  } else {
    playMusic('m_online');
    setupOnlineObjects(); ON.round = -1;
    $('objT').innerHTML = '#️⃣ Trend Rush (online)'; $('objD').innerHTML = 'Connecting…';
    net.connect(($('pcode').value || '').trim(), me()).then(() => { $('objD').innerHTML = 'Touch the floating <b>#</b> tokens around Hype Square to answer questions. Fast and correct = more points! Typed answers give a bonus.'; renderBoard(); });
  }
}

// ---------------- boot ----------------
setProgress(p => { $('lbar').style.width = `${Math.round(p * 100)}%`; });
(async () => {
  await buildWorld();
  await setupStory();
  await setupSide();
  await buildTraffic();
  await setPlayerModel(S.char);
  camera.position.set(0, 6, 60);
  $('loading').classList.add('hidden');
  refreshStory(); buildMenu(); $('menu').classList.remove('hidden');
  loop();
  if (location.search.includes('debug')) window.TC = { THREE, camera, player, cam, get S() { return S; }, CH, zoneInfo, refreshStory, save, ON, SIDE, sideNpcs, sst, cst, step, near: () => near, interact, colliders, stopInfo };
})();

$('bCred').onclick = () => {
  openModal(`<h2>Credits</h2><div class="bubble" style="font-size:15px">
  <b>Trend City: The Hype Files</b> — English game for 3° medio, Unit 4 "What impact do trends have?". Original texts written for this game, based on information from the Ellen MacArthur Foundation, UNEP, the US Surgeon General (2023), Fashion Revolution, the Dirección del Trabajo (Ley 21.561 "40 horas", Ley Karin, Ley 21.431) and press reports about the Atacama Desert (AFP, 2021). Exercise types inspired by Cambridge B2 First (Reading and Use of English), adapted to B1.<br><br>
  <b>3D models:</b> Kenney (City Kit Commercial, City Kit Suburban, City Kit Roads, Car Kit, Mini Market, Factory Kit, Furniture Kit, Nature Kit, Blocky Characters) — CC0 · kenney.nl<br>
  <b>Fast fashion props (Poly Pizza, poly.pizza):</b> T-Shirts by sirkitree; Clothes hanger, Sewing machine and Billboard by Poly by Google (CC-BY 3.0). Mannequin by reyshapes (CC0).<br>
  <b>Music:</b> "Sweet Talk", "Space Rangers", "Determined Start", "Staring at Reflections" by CoMiGo — CC0 · comigo.itch.io<br>
  <b>Sound effects:</b> Kenney (Interface Sounds, RPG Audio, Music Jingles) — CC0<br>
  <b>Engine:</b> three.js (MIT) · Online: Supabase Realtime</div>
  <div class="foot"><button class="btn" id="crOk">Close</button></div>`);
  $('crOk').onclick = closeModal;
};
