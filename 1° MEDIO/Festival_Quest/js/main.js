import * as THREE from 'three';
import { scene, buildWorld, makeChar, setProgress, colliders, animated, zoneInfo, pedestals, greatFire, ISLAND, paperLantern, camBlockers, sideInfo, gates, landmarks, roads, arena, portals } from './world.js';
import { ZONES, BOSS, ONLINE_EXTRA, SKILLS, SIDE } from './content.js';
import * as net from './net.js';
import { logAnswer, student } from './track.js';
const GAME = 'festival-quest-1m'; // id del juego en el Panel del profe

const $ = id => document.getElementById(id);
const CHARS = [['Knight', 'Knight'], ['Mage', 'Mage'], ['Ranger', 'Ranger'], ['Rogue', 'Rogue'], ['Barbarian', 'Barbarian'], ['Rogue_Hooded', 'Hooded']];
const KCOL = { E: '#1f8fd6', I: '#7a2d8f', V: '#1fb5a8', L: '#ff7a1a', Q: '#e2408f' };

// ---------------- save ----------------
const SAVE_KEY = 'festivalquest1m_v1';
function freshSave() { return { name: '', char: 'Knight', zones: {}, stats: { E: [0, 0], I: [0, 0], V: [0, 0], L: [0, 0], Q: [0, 0] }, side: {}, portals: ['plaza'], arenaIntro: false, final: false, intro: false, best: 0 }; }
let S = freshSave();
try { const raw = localStorage.getItem(SAVE_KEY); if (raw) S = Object.assign(freshSave(), JSON.parse(raw)); } catch (e) { }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
const zst = id => (S.zones[id] ||= { read: false, scrolls: [false, false, false], done: false });
const lanterns = () => ZONES.filter(z => zst(z.id).done).length;
const sst = q => (S.side[q.id] ||= { acc: false, got: [], done: false });
const helped = () => SIDE.filter(q => sst(q).done).length;
const stars = () => ZONES.reduce((n, z) => n + zst(z.id).scrolls.filter(Boolean).length, 0);

// ---------------- audio ----------------
const sfxCache = {};
function sfx(n, v = 0.6) { try { const base = sfxCache[n] ||= new Audio(`assets/audio/${n}.ogg`); const a = base.cloneNode(); a.volume = v; a.play().catch(() => { }); } catch (e) { } }
const music = new Audio(); music.loop = true; music.volume = 0.3;
function playMusic(n) { const src = `assets/audio/${n}.mp3`; if (music.dataset.n === n) return; music.dataset.n = n; music.src = src; music.play().catch(() => { }); }

// ---------------- renderer / camera ----------------
const renderer = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const cam = { yaw: 0, pitch: 0.38, dist: 8.5 };

// ---------------- state ----------------
let mode = 'menu';           // menu | story | online
let modalOpen = false;
const player = { c: null, pos: new THREE.Vector3(2, 0, 9), vy: 0, ry: Math.PI, ground: true };
const keys = {};
const stick = { x: 0, y: 0 };
const npcs = [];             // {c, pos, zi, label}
let boss = null;
const scrolls = [];          // per zone: [mesh, mesh, mesh]
let beacon;

const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.7, flatShading: true, ...extra });
function label(text, color = '#fff', size = 30, w = 2.6) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const c = cv.getContext('2d');
  c.font = `800 ${size}px Nunito, sans-serif`; c.textAlign = 'center'; c.lineWidth = 7; c.strokeStyle = 'rgba(30,15,50,.75)'; c.strokeText(text, 128, 44); c.fillStyle = color; c.fillText(text, 128, 44);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(w, w / 4, 1); s.renderOrder = 10; return s;
}

// ---------------- input ----------------
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if (modalOpen) return;
  const phrOpen = !$('phr').classList.contains('hidden');
  if (phrOpen && /^Digit\d$/.test(e.code)) { sayPhrase((+e.code.slice(5) + 9) % 10); return; }
  if (e.code === 'Escape') $('phr').classList.add('hidden');
  if (e.code === 'KeyE' || e.code === 'Enter') interact();
  if (e.code === 'KeyM' && mode !== 'menu') { mini.classList.toggle('big'); }
  if (e.code === 'KeyT') togglePhrases();
  if (e.code === 'Digit1') emote('Waving');
  if (e.code === 'Digit2') emote('Cheering');
  if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
});
addEventListener('keyup', e => { keys[e.code] = false; });
let drag = null;
const cv = $('c');
cv.addEventListener('pointerdown', e => { if (e.target === cv) { drag = { x: e.clientX, y: e.clientY, id: e.pointerId }; cv.setPointerCapture(e.pointerId); } });
cv.addEventListener('pointermove', e => { if (!drag || drag.id !== e.pointerId) return; cam.yaw -= (e.clientX - drag.x) * 0.006; cam.pitch = THREE.MathUtils.clamp(cam.pitch + (e.clientY - drag.y) * 0.004, 0.05, 1.2); drag.x = e.clientX; drag.y = e.clientY; });
cv.addEventListener('pointerup', () => drag = null); cv.addEventListener('pointercancel', () => drag = null);
cv.addEventListener('wheel', e => { cam.dist = THREE.MathUtils.clamp(cam.dist + e.deltaY * 0.01, 4, 16); }, { passive: true });
// touch joystick
const isTouch = matchMedia('(pointer: coarse)').matches || location.search.includes('touch');
if (isTouch) document.body.classList.add('touch');
if (isTouch) {
  const st = $('stick'), knob = st.firstElementChild; let sid = null;
  st.addEventListener('pointerdown', e => { sid = e.pointerId; st.setPointerCapture(sid); move(e); });
  st.addEventListener('pointermove', e => { if (e.pointerId === sid) move(e); });
  const end = () => { sid = null; stick.x = stick.y = 0; knob.style.transform = ''; };
  st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
  function move(e) { const r = st.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } stick.x = x; stick.y = y; knob.style.transform = `translate(${x * 40}px,${y * 40}px)`; }
  $('tJump').addEventListener('pointerdown', () => { keys.Space = true; setTimeout(() => keys.Space = false, 120); });
  $('tAct').addEventListener('pointerdown', () => interact());
  $('tMap').addEventListener('pointerdown', () => { if (mode !== 'menu') { sfx('click'); mini.classList.toggle('big'); } });
  $('tSay').addEventListener('pointerdown', () => togglePhrases());
  $('tWave').addEventListener('pointerdown', () => emote('Waving'));
  $('tCheer').addEventListener('pointerdown', () => emote('Cheering'));
  $('help').textContent = 'Joystick: move · Drag screen: camera';
}
$('prompt').addEventListener('click', () => interact());
$('chatBtn').onclick = () => togglePhrases();

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
function prepItem(it) { const order = shuffle(it.o.map((_, i) => i)); return { ...it, opts: order.map(i => it.o[i]), correct: order.indexOf(it.a) }; }
// it = pregunta preparada (prepItem), j = opción elegida, t0 = momento en que apareció la pregunta
function record(it, j, ok, activity, t0) {
  const k = it.k; if (!S.stats[k]) S.stats[k] = [0, 0]; S.stats[k][1]++; if (ok) S.stats[k][0]++; save();
  logAnswer(GAME, { activity, item: it, chosen: it.opts[j], right: it.opts[it.correct], ok, ms: performance.now() - t0 });
}

/** Generic activity: returns number correct. opts: {title, color, items, reading, passMin, shuffleItems} */
function runQuiz(opt) {
  return new Promise(resolve => {
    const items = (opt.shuffleItems ? shuffle(opt.items) : opt.items).map(prepItem);
    let i = 0, correct = 0; const res = [];
    const textHtml = opt.reading ? `<div class="text"><h3 style="margin:0 0 8px">${esc(opt.reading.title)}</h3>${opt.reading.text.split('\n\n').map(p => `<p>${esc(p)}</p>`).join('')}</div>` : '';
    function render() {
      const it = items[i];
      const prog = items.map((_, j) => `<i class="${j < i ? (res[j] ? 'ok' : 'no') : j === i ? 'cur' : ''}"></i>`).join('');
      const card = `<div class="qcard"><div class="progress">${prog}</div><span class="tag" style="background:${KCOL[it.k]}">${SKILLS[it.k]}</span><div class="q">${it.q}</div><div class="opts">${it.opts.map((o, j) => `<button class="opt" data-j="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join('')}</div><div id="why"></div><div class="foot" id="qfoot"></div></div>`;
      openModal(`<h2 style="color:${opt.color || 'inherit'}">${esc(opt.title)}</h2>${opt.reading ? `<div class="reading">${textHtml}${card}</div>` : card}`);
      if (opt.reading && i > 0) { const t = $('mbox').querySelector('.text'); if (t) t.scrollTop = render.scroll || 0; }
      $('mbox').querySelectorAll('.opt').forEach(b => b.onclick = () => answer(+b.dataset.j));
      render.t0 = performance.now();
    }
    function answer(j) {
      const it = items[i], ok = j === it.correct; res[i] = ok; if (ok) correct++;
      record(it, j, ok, opt.title, render.t0); sfx(ok ? 'ok' : 'bad');
      const t = $('mbox').querySelector('.text'); if (t) render.scroll = t.scrollTop;
      $('mbox').querySelectorAll('.opt').forEach((b, bj) => { b.disabled = true; if (bj === it.correct) b.classList.add('ok'); else if (bj === j) b.classList.add('no'); });
      $('why').innerHTML = `<div class="why ${ok ? 'ok' : 'no'}">${ok ? '✔ Correct!' : '✘ Not quite.'} ${it.why}</div>`;
      $('qfoot').innerHTML = `<button class="btn">${i < items.length - 1 ? 'Next ➜' : 'Finish'}</button>`;
      $('qfoot').firstChild.onclick = () => { sfx('page'); i++; if (i < items.length) render(); else finish(); };
      if (opt.onAnswer) opt.onAnswer(ok);
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
  scene.add(player.c.root);
  player.c.root.position.copy(player.pos);
}

// ---------------- story ----------------
const SCROLL_TYPES = [['vocab', 'Vocabulary scroll'], ['liu', 'Language in use scroll'], ['tags', 'Question tags scroll']];
function makeScrollMesh(color) {
  const g = new THREE.Group();
  const paper = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.9, 10), M('#fff1c9', { emissive: '#ffcc55', emissiveIntensity: 0.6 })); paper.rotation.z = Math.PI / 2;
  const r1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.15, 8), M(color)); r1.rotation.z = Math.PI / 2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 6, 28), new THREE.MeshBasicMaterial({ color })); ring.rotation.x = Math.PI / 2; ring.position.y = -1.0;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 10, 12, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 4;
  g.add(paper, r1, ring, beam); g.userData.paper = [paper, r1];
  return g;
}

async function setupStory() {
  for (let i = 0; i < ZONES.length; i++) {
    const z = ZONES[i], info = zoneInfo[i];
    const c = await makeChar(z.npc.model);
    c.root.position.copy(info.npcPos); c.root.lookAt(0, 0, 0);
    const lb = label(z.npc.name, '#fff'); lb.position.y = 3.0; c.root.add(lb);
    const mark = label('!', '#ffc23d', 60, 2.6); mark.position.y = 3.7; c.root.add(mark);
    scene.add(c.root); colliders.push({ x: info.npcPos.x, z: info.npcPos.z, r: 0.7 });
    npcs.push({ c, pos: info.npcPos, zi: i, mark });
    scrolls[i] = info.scrollPos.map(p => { const s = makeScrollMesh(z.color); s.position.set(p.x, 1.4, p.z); s.visible = false; scene.add(s); return s; });
  }
  boss = await makeChar('Rogue_Hooded', '#8a8a95');
  boss.root.position.set(0, 0, 8.4); boss.root.rotation.y = Math.PI; boss.root.visible = false;
  const bl = label(BOSS.name, '#d0d0dd'); bl.position.y = 3.0; boss.root.add(bl);
  scene.add(boss.root);
  beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 40, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd84a', transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
  beacon.position.y = 20; scene.add(beacon);
}

function refreshStory() {
  ZONES.forEach((z, i) => {
    const st = zst(z.id);
    scrolls[i].forEach((s, k) => s.visible = mode === 'story' && st.read && !st.scrolls[k]);
    const n = npcs[i]; if (n) n.mark.visible = mode === 'story' && !st.done;
    const p = pedestals[i]; const lit = mode === 'online' || st.done;
    p.lantern.userData.body.material.color.set(lit ? p.color : '#777777');
    p.lantern.userData.body.material.emissive.set(lit ? p.color : '#000000');
    p.lantern.userData.body.material.emissiveIntensity = lit ? 0.8 : 0;
  });
  const all = lanterns() === 5;
  if (boss) boss.root.visible = mode === 'story' && all && !S.final;
  const fireOn = mode === 'online' || S.final;
  greatFire.visible = fireOn; greatFire.userData.light.intensity = fireOn ? 40 : 0;
  $('cLan').textContent = `🏮 ${lanterns()}/5`; $('cStar').textContent = `⭐ ${stars()}/15`; $('cSide').textContent = `🤝 ${helped()}/${SIDE.length}`;
  refreshSide();
  const sat = mode === 'story' ? (S.final ? 1.15 : 0.25 + lanterns() * 0.15) : 1.05;
  cv.style.filter = `saturate(${sat})`;
}

function objective() {
  if (S.final) return { t: 'Festival restored!', d: 'Explore the island, or open the menu to see your certificate.', p: null };
  for (let i = 0; i < ZONES.length; i++) {
    const z = ZONES[i], st = zst(z.id), info = zoneInfo[i];
    if (st.done) continue;
    if (!st.read) return { t: `${z.name} · ${z.country}`, d: `Find <b>${z.npc.name}</b> and read the story.`, p: info.npcPos };
    const miss = st.scrolls.findIndex(s => !s);
    if (miss >= 0) {
      let best = null, bd = 1e9; st.scrolls.forEach((s, k) => { if (!s) { const d = info.scrollPos[k].distanceTo(player.pos); if (d < bd) { bd = d; best = info.scrollPos[k]; } } });
      return { t: `${z.name} · Lost scrolls`, d: `Find the glowing scrolls (${st.scrolls.filter(Boolean).length}/3).`, p: best };
    }
    return { t: `${z.name}`, d: `Go back to <b>${z.npc.name}</b> to get the lantern.`, p: info.npcPos };
  }
  return { t: 'The Great Festival Fire', d: `All lanterns are back! Face <b>${BOSS.name}</b> in the plaza.`, p: new THREE.Vector3(0, 0, 8.4) };
}

async function talkNPC(n) {
  const z = ZONES[n.zi], st = zst(z.id);
  n.c.play('Waving', 0.2, true);
  if (st.done) { await say(z.npc.name, z.color, `Thank you again! ${z.bye}`, [['Bye!']]); return; }
  if (!st.read) {
    const r = await say(z.npc.name, z.color, z.hello, [['Read the story 📖'], ['Later', 'alt']]);
    if (r !== 0) return;
    sfx('open');
    await runQuiz({ title: `${z.name} — Reading`, color: z.color, items: z.reading, reading: { title: z.title, text: z.text }, passMin: 4 });
    st.read = true; save(); refreshStory();
    await say(z.npc.name, z.color, z.after, [["I'll find them!"]]);
    toast('3 scrolls appeared! ✨');
    return;
  }
  if (st.scrolls.some(s => !s)) { await say(z.npc.name, z.color, `You still need ${st.scrolls.filter(s => !s).length} scroll(s). Look for the golden light!`, [['OK']]); return; }
  await say(z.npc.name, z.color, z.bye, [['Take the lantern 🏮']]);
  st.done = true; save(); sfx('win'); player.c.play('Cheering', 0.2, true);
  refreshStory(); toast(`🏮 Lantern ${lanterns()}/5`);
  if (lanterns() === 5) setTimeout(() => toast('Mr. Grey is waiting in the plaza…', 2500), 2000);
}

async function collectScroll(zi, k) {
  const z = ZONES[zi], st = zst(z.id);
  scrolls[zi][k].visible = false; sfx('coin');
  const [field, name] = SCROLL_TYPES[k];
  await say(name, z.color, `This scroll from <b>${z.name}</b> has 4 challenges. Get at least 3 right to keep it!`, [['Open it ✨']]);
  await runQuiz({ title: `${z.name} — ${name}`, color: z.color, items: z[field], passMin: 3, shuffleItems: true });
  st.scrolls[k] = true; save(); refreshStory(); toast('⭐ Scroll recovered!');
  if (st.scrolls.every(Boolean)) setTimeout(() => toast(`Go back to ${z.npc.name}!`), 1900);
}

// ---------------- side quests ("Festival friends") ----------------
const sideNpcs = [];   // {c, q, i, markQ, markX, beam, pos}
const got = q => sst(q).got.filter(Boolean).length;
async function setupSide() {
  for (let i = 0; i < SIDE.length; i++) {
    const q = SIDE[i], info = sideInfo[i];
    const c = await makeChar(q.npc.model, q.npc.tint);
    c.root.position.copy(info.npcPos); c.root.rotation.y = info.face;
    const lb = label(q.npc.name, '#bff6ff'); lb.position.y = 3.0; c.root.add(lb);
    const markQ = label('?', '#29d3e8', 60, 2.6); markQ.position.y = 3.7; c.root.add(markQ);
    const markX = label('!', '#ffc23d', 60, 2.6); markX.position.y = 3.7; c.root.add(markX);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 16, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#29d3e8', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide }));
    beam.position.set(info.npcPos.x, 8, info.npcPos.z); scene.add(beam);
    scene.add(c.root); colliders.push({ x: info.npcPos.x, z: info.npcPos.z, r: 0.7 });
    sideNpcs.push({ c, q, i, markQ, markX, beam, pos: info.npcPos });
  }
  // zone names on the signposts at each entrance
  gates.forEach((g, i) => { const d = g.clone().normalize(); const lb = label(ZONES[i].name, '#ffffff', 26, 3.4); lb.position.set(g.x - d.z * 3.4, 3.3, g.z + d.x * 3.4); scene.add(lb); });
}

function refreshSide() {
  const story = mode === 'story';
  SIDE.forEach((q, i) => {
    const st = sst(q), info = sideInfo[i], n = sideNpcs[i]; if (!info) return;
    const fixed = !story || st.done;
    info.problem.forEach(o => { if (o) o.visible = !fixed; });
    info.solved.forEach(o => { if (o) o.visible = fixed; });
    info.items.forEach((it, k) => it.visible = story && st.acc && !st.done && !st.got[k]);
    if (n) {
      const ready = q.collect && st.acc && got(q) >= q.collect.n;
      n.markQ.visible = story && !st.done && !ready && !(q.collect && st.acc);
      n.markX.visible = story && !st.done && !!ready;
      n.beam.visible = story && !st.done;
    }
  });
}

async function talkSide(n) {
  const q = n.q, st = sst(q), col = q.npc.tint, tag = `<div class="small" style="margin-top:8px">${q.icon} <b>${esc(q.title)}</b> · side mission</div>`;
  n.c.play('Waving', 0.2, true);
  if (st.done) { await say(q.npc.name, col, q.thanks, [['Bye!']]); return; }
  if (q.collect && !st.acc) {
    const r = await say(q.npc.name, col, q.hello + tag, [["I'll help! 🤝"], ['Not now', 'alt']]);
    if (r !== 0) return;
    st.acc = true; st.got = []; save(); refreshSide(); toast(`${q.collect.icon} Find ${q.collect.n} ${q.collect.what}!`, 2200);
    return;
  }
  if (q.collect && got(q) < q.collect.n) { await say(q.npc.name, col, `You have <b>${got(q)}/${q.collect.n}</b> ${q.collect.what}. Look for the blue light beams near here!`, [['OK']]); return; }
  if (!q.collect) {
    const r = await say(q.npc.name, col, q.hello + tag, [["Let's help! 🤝"], ['Not now', 'alt']]);
    if (r !== 0) return;
  } else await say(q.npc.name, col, q.ready, [['Read 📖']]);
  sfx('open');
  await runQuiz({ title: `${q.icon} ${q.title}`, color: '#1a8fa0', items: q.items, reading: { title: q.title, text: q.text }, passMin: q.items.length - 1 });
  st.done = true; st.acc = true; save(); refreshStory();
  sfx('win'); player.c.play('Cheering', 0.2, true); n.c.play('Cheering', 0.2, true);
  await say(q.npc.name, col, q.thanks, [[`🤝 Festival friends ${helped()}/${SIDE.length}`]]);
}

function pickSide(i, k) {
  const q = SIDE[i], st = sst(q); st.got[k] = true; save();
  sfx('coin'); player.c.play('PickUp', 0.1, true);
  refreshSide();
  const g = got(q);
  toast(g >= q.collect.n ? `${q.collect.icon} ${g}/${q.collect.n} — go back to ${q.npc.name}!` : `${q.collect.icon} ${g}/${q.collect.n}`, 1700);
}

function sideHint() {
  const act = SIDE.find(q => q.collect && sst(q).acc && !sst(q).done);
  if (act) return got(act) >= act.collect.n ? `${act.icon} Go back to ${act.npc.name}!` : `${act.collect.icon} ${act.title}: ${got(act)}/${act.collect.n} ${act.collect.what}`;
  let best = null, bd = 30;
  sideNpcs.forEach(n => { if (sst(n.q).done) return; const d = n.pos.distanceTo(player.pos); if (d < bd) { bd = d; best = n; } });
  return best ? `💬 ${best.q.npc.name} needs help nearby! (side mission)` : '';
}

// ---------------- minimap ----------------
const mini = $('mini'), mctx = mini.getContext('2d'), MR = ISLAND + 18;
let miniBg = null, lastObj = null;
function mapXY(x, z) { const S = mini.width; return [S / 2 + x / MR * S / 2, S / 2 + z / MR * S / 2]; }
function buildMiniBg() {
  const S = mini.width, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
  x.fillStyle = '#3fb3e8'; x.fillRect(0, 0, S, S);
  const circ = (r, col) => { x.fillStyle = col; x.beginPath(); x.arc(S / 2, S / 2, r / MR * S / 2, 0, 7); x.fill(); };
  circ(ISLAND + 15, '#f1d9a0'); circ(ISLAND + 7, '#6cc04a');
  landmarks.forEach(l => { const [px, pz] = mapXY(l.x, l.z); x.fillStyle = l.lake ? '#2aa6e0' : l.arena ? '#e8d3a0' : 'rgba(110,80,40,.35)'; x.beginPath(); x.arc(px, pz, Math.max(4, l.r / MR * S / 2), 0, 7); x.fill(); });
  x.strokeStyle = '#f3e6b8'; x.lineWidth = S / 90; x.lineCap = 'round'; x.lineJoin = 'round';
  roads.forEach(r => { x.beginPath(); r.pts.forEach((p, i) => { const [px, pz] = mapXY(p.x, p.z); i ? x.lineTo(px, pz) : x.moveTo(px, pz); }); x.stroke(); });
  circ(13, '#e6cf9e');
  miniBg = c;
}
function drawMini(t) {
  if (!miniBg) buildMiniBg();
  const S = mini.width, K = S / 340, big = mini.classList.contains('big');
  mctx.drawImage(miniBg, 0, 0);
  mctx.textAlign = 'center'; mctx.textBaseline = 'middle';
  ZONES.forEach((z, i) => {
    const [px, pz] = mapXY(zoneInfo[i].center.x, zoneInfo[i].center.z), done = zst(z.id).done || mode !== 'story';
    mctx.fillStyle = done ? z.color : '#8a8a8a'; mctx.beginPath(); mctx.arc(px, pz, 13 * K, 0, 7); mctx.fill(); mctx.lineWidth = 3 * K; mctx.strokeStyle = '#fff'; mctx.stroke();
    if (big) { mctx.font = `800 ${11 * K}px Nunito, sans-serif`; mctx.fillStyle = '#24183a'; mctx.fillText(z.name, px, pz + 22 * K); }
  });
  if (big) landmarks.forEach(l => { const [px, pz] = mapXY(l.x, l.z); mctx.font = `700 ${9 * K}px Nunito, sans-serif`; mctx.fillStyle = 'rgba(36,24,58,.75)'; mctx.fillText(l.name, px, pz); });
  // arena and magic portals
  { const [ax, az] = mapXY(arena.x, arena.z); mctx.strokeStyle = '#e8322f'; mctx.lineWidth = 3 * K; mctx.beginPath(); mctx.arc(ax, az, 9 * K, 0, 7); mctx.stroke(); mctx.font = `800 ${11 * K}px Nunito, sans-serif`; mctx.fillStyle = '#e8322f'; mctx.fillText('⚔', ax, az + 1); }
  portals.forEach(p => { const [px, pz] = mapXY(p.x, p.z), on = portalOpen(p); mctx.fillStyle = on ? '#a64dff' : 'rgba(120,120,120,.7)'; mctx.beginPath(); mctx.arc(px, pz, 6 * K, 0, 7); mctx.fill(); mctx.lineWidth = 2 * K; mctx.strokeStyle = '#fff'; mctx.stroke(); });
  // other players (group mates in green)
  if (mode === 'online') for (const e of ON.peers.values()) { if (!e.seen) continue; const [px, pz] = mapXY(e.pos.x, e.pos.z), mate = GROUP.id && e.data.g === GROUP.id; mctx.fillStyle = mate ? '#3fdc5a' : '#29d3e8'; mctx.beginPath(); mctx.arc(px, pz, (mate ? 7 : 5) * K, 0, 7); mctx.fill(); mctx.lineWidth = 2 * K; mctx.strokeStyle = '#fff'; mctx.stroke(); }
  if (mode === 'story') sideNpcs.forEach(n => {
    const st = sst(n.q), [px, pz] = mapXY(n.pos.x, n.pos.z);
    mctx.font = `800 ${14 * K}px Nunito, sans-serif`;
    if (st.done) { mctx.fillStyle = 'rgba(255,255,255,.9)'; mctx.fillText('✓', px, pz); return; }
    const ready = n.q.collect && st.acc && got(n.q) >= n.q.collect.n;
    mctx.fillStyle = ready ? '#ffc23d' : '#29d3e8'; mctx.beginPath(); mctx.arc(px, pz, 8 * K, 0, 7); mctx.fill(); mctx.lineWidth = 2 * K; mctx.strokeStyle = '#fff'; mctx.stroke();
    mctx.fillStyle = '#fff'; mctx.fillText(ready ? '!' : '?', px, pz + 1);
  });
  if (mode === 'story' && lastObj && lastObj.p) {
    const [px, pz] = mapXY(lastObj.p.x, lastObj.p.z), r = (9 + Math.sin(t * 5) * 2) * K;
    mctx.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; mctx.lineTo(px + Math.cos(a) * rr, pz + Math.sin(a) * rr); } mctx.closePath();
    mctx.fillStyle = '#ffc23d'; mctx.strokeStyle = '#24183a'; mctx.lineWidth = 2 * K; mctx.fill(); mctx.stroke();
  }
  const [px, pz] = mapXY(player.pos.x, player.pos.z);
  mctx.save(); mctx.translate(px, pz); mctx.rotate(Math.PI - player.ry); mctx.scale(K, K);
  mctx.fillStyle = '#ff2e93'; mctx.strokeStyle = '#fff'; mctx.lineWidth = 3; mctx.beginPath(); mctx.moveTo(0, -12); mctx.lineTo(9, 10); mctx.lineTo(0, 5); mctx.lineTo(-9, 10); mctx.closePath(); mctx.stroke(); mctx.fill();
  mctx.restore();
}
mini.addEventListener('click', () => { sfx('click'); mini.classList.toggle('big'); });

async function bossDuel() {
  const r = await say(BOSS.name, '#6d6d7a', BOSS.intro, [['Duel! ⚔️'], ['Not yet', 'alt']]);
  if (r !== 0) return;
  playMusic('m_boss');
  let grey = 8, hearts = 3;
  const items = shuffle(BOSS.items).map(prepItem);
  let idx = 0;
  const loop = () => new Promise(res => {
    const step = () => {
      if (grey <= 0) return res(true);
      if (hearts <= 0 || idx >= items.length) return res(false);
      const it = items[idx++];
      openModal(`<h2>Question Tag Duel</h2><div class="duel"><div>You ${'❤️'.repeat(hearts)}${'🤍'.repeat(3 - hearts)}</div><div style="text-align:right">${BOSS.name}<div class="hp"><i style="width:${grey / 8 * 100}%"></i></div></div></div>
      <div class="qcard"><span class="tag" style="background:${KCOL.Q}">${SKILLS.Q}</span><div class="q">${it.q}</div><div class="opts">${it.opts.map((o, j) => `<button class="opt" data-j="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join('')}</div><div id="why"></div><div class="foot" id="qfoot"></div></div>`);
      const t0 = performance.now();
      $('mbox').querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const j = +b.dataset.j, ok = j === it.correct; record({ ...it, k: 'Q' }, j, ok, 'Question Tag Duel', t0);
        $('mbox').querySelectorAll('.opt').forEach((bb, bj) => { bb.disabled = true; if (bj === it.correct) bb.classList.add('ok'); else if (bj === j) bb.classList.add('no'); });
        if (ok) { grey--; sfx('hit'); player.c.play('Melee_Unarmed_Attack_Punch_A', 0.1, true); boss.play('Hit_A', 0.1, true); } else { hearts--; sfx('bad'); player.c.play('Hit_A', 0.1, true); }
        $('mbox').querySelector('.hp i').style.width = `${Math.max(0, grey) / 8 * 100}%`;
        $('why').innerHTML = `<div class="why ${ok ? 'ok' : 'no'}">${ok ? '✔ Hit!' : '✘ Ouch!'} ${it.why}</div>`;
        $('qfoot').innerHTML = `<button class="btn">Next ➜</button>`; $('qfoot').firstChild.onclick = step;
      });
    };
    step();
  });
  const won = await loop();
  closeModal(); playMusic('m_story');
  if (!won) { await say(BOSS.name, '#6d6d7a', "Ha! Question tags are hard, aren't they? Practise and come back!", [['Try again later']]); return; }
  S.final = true; save(); refreshStory();
  boss.play('Cheering'); player.c.play('Cheering', 0.2, true); sfx('win');
  fireworks();
  await say(BOSS.name, '#6d6d7a', BOSS.win, [['🎉 See my certificate']]);
  certificate();
}

function certificate() {
  const rows = Object.entries(SKILLS).map(([k, n]) => { const [c, t] = S.stats[k] || [0, 0]; return `<tr><td><span style="color:${KCOL[k]}">●</span> ${n}</td><td>${t ? Math.round(c / t * 100) : 0}% <span class="small">(${c}/${t})</span></td></tr>`; }).join('');
  const tot = Object.values(S.stats).reduce((a, [c, t]) => [a[0] + c, a[1] + t], [0, 0]);
  openModal(`<div class="cert"><h2 style="font-size:34px">🏆 Festival Keeper Certificate</h2><div class="bubble" style="display:inline-block;margin-top:8px">This certifies that <b>${esc(S.name || 'the player')}</b> brought back the five festival lanterns and defeated Mr. Grey.<br><span class="small">${new Date().toLocaleDateString('es-CL')} · Unit 4: Traditions and Festivities · 1° medio</span></div>
  <table>${rows}<tr><td>🤝 Festival friends (side missions)</td><td>${helped()}/${SIDE.length}</td></tr><tr><td><b>Total (all attempts)</b></td><td>${tot[1] ? Math.round(tot[0] / tot[1] * 100) : 0}%</td></tr></table><div class="small">Take a screenshot and send it to your teacher.</div></div><div class="foot"><button class="btn" id="cOk">Continue</button></div>`);
  $('cOk').onclick = () => { sfx('click'); closeModal(); };
}

const fw = [];
function fireworks() {
  for (let n = 0; n < 14; n++) setTimeout(() => {
    const col = new THREE.Color().setHSL(Math.random(), 1, 0.6), N = 70, pos = new Float32Array(N * 3), vel = [];
    const o = new THREE.Vector3((Math.random() - .5) * 20, 14 + Math.random() * 8, (Math.random() - .5) * 20);
    for (let i = 0; i < N; i++) { pos.set([o.x, o.y, o.z], i * 3); vel.push(new THREE.Vector3().randomDirection().multiplyScalar(6 + Math.random() * 3)); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const p = new THREE.Points(g, new THREE.PointsMaterial({ color: col, size: 0.5, transparent: true })); scene.add(p);
    fw.push({ p, vel, life: 1.6 });
  }, n * 280);
}

// ---------------- online: one open world (same model as Wordbound) ----------------
// Everybody joins the same room (max 20). Positions every 1.5 s only while moving.
// Groups, duels and today's ranking live only in this session: nothing is stored.
const ROUND = 180000, BREAK = 15000, PERIOD = ROUND + BREAK, NL = 12;
const ON = { lan: [], score: 0, streak: 0, round: -1, peers: new Map(), lastSend: 0, lastPos: null, sentStop: true, moving: false, idleT: 0, hiddenT: null, status: 'off', pool: [], podiumShown: -1, prev: new THREE.Vector3() };
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const ONLINE_R = 62;   // online lanterns stay near the plaza
function lanPos(r, i, gen) {
  const R = mulberry(r * 7919 + i * 131 + gen * 17 + 3);
  for (let tries = 0; tries < 40; tries++) {
    const a = R() * Math.PI * 2, d = 9 + R() * (ONLINE_R - 9), x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (Math.hypot(x - arena.x, z - arena.z) < arena.r + 2) continue;
    if (colliders.every(c => Math.hypot(c.x - x, c.z - z) > c.r + 1.2)) return new THREE.Vector3(x, 0, z);
  }
  return new THREE.Vector3(0, 0, 14);
}
function setupOnlineObjects() {
  if (ON.lan.length) return;
  const cols = ['#ff2e93', '#ffd500', '#1fd1ff', '#7cff3a', '#a64dff', '#ff7a1a'];
  for (let i = 0; i < NL; i++) {
    const g = new THREE.Group(); paperLantern(0, 1.6, 0, cols[i % 6], g);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 14, 12, 1, true), new THREE.MeshBasicMaterial({ color: cols[i % 6], transparent: true, opacity: 0.15, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 7; g.add(beam);
    g.visible = false; scene.add(g);
    ON.lan.push({ g, gen: 0, hideUntil: 0 });
  }
  ON.pool = [...ZONES.flatMap(z => [...z.vocab, ...z.liu, ...z.tags]), ...BOSS.items, ...ONLINE_EXTRA];
}
const roundNow = () => Math.floor(Date.now() / PERIOD);
function placeLanterns() { const r = roundNow(); ON.lan.forEach((l, i) => { l.g.position.copy(lanPos(r, i, l.gen)); }); }
const online = () => mode === 'online' && net.NET.ok;
function me() { return { name: S.name || 'Player', char: S.char, score: ON.score, r: roundNow(), g: GROUP.id, w: ARENA.wins, d: DUEL.on ? 1 : 0, x: Math.round(player.pos.x), z: Math.round(player.pos.z) }; }

// ----- other players -----
async function buildPeer(e) {
  const p = e.data, token = (e.token || 0) + 1; e.token = token;
  const c = await makeChar(CHARS.some(x => x[0] === p.char) ? p.char : 'Knight');
  if (!ON.peers.has(e.id) || e.token !== token) return;
  if (e.c) scene.remove(e.c.root);
  e.c = c; e.lab = null; c.root.position.copy(e.pos); c.root.rotation.y = e.ry;
  c.root.visible = e.seen; scene.add(c.root); peerLabel(e);
}
function addPeer(p) {
  if (ON.peers.has(p.id)) return;
  const pos = new THREE.Vector3(p.x || 0, 0, p.z || 0);
  const e = { id: p.id, c: null, data: p, pos, target: pos.clone(), v: { x: 0, z: 0 }, ry: 0, last: performance.now(), seen: p.x !== undefined };
  ON.peers.set(p.id, e); buildPeer(e);
}
function removePeer(p) { const e = ON.peers.get(p.id); if (e) { if (e.c) scene.remove(e.c.root); ON.peers.delete(p.id); } renderBoard(); groupHUD(); }
function peerLabel(e) {
  if (!e.c) return; const mate = GROUP.id && e.data.g === GROUP.id;
  if (e.lab) e.c.root.remove(e.lab);
  const lb = label(`${mate ? '★ ' : ''}${String(e.data.name || 'Player').slice(0, 14)}`, mate ? '#7dff8a' : '#ffe7a8'); lb.position.y = 3.0; e.c.root.add(lb); e.lab = lb;
}
function bubble(c, text) {
  if (!c) return;
  const s = label(text, '#ffffff', 30, 3.4); s.position.y = 3.8; c.root.add(s);
  if (c.bubble) c.root.remove(c.bubble); c.bubble = s;
  setTimeout(() => { if (c.bubble === s) { c.root.remove(s); c.bubble = null; } }, 4500);
}
function updatePeers(dt) {
  const now = performance.now();
  for (const e of ON.peers.values()) {
    if (!e.c) continue;
    const k = Math.min(2, (now - e.last) / 1000);
    const px = e.target.x + e.v.x * k, pz = e.target.z + e.v.z * k;
    e.pos.x += (px - e.pos.x) * Math.min(1, dt * 4); e.pos.z += (pz - e.pos.z) * Math.min(1, dt * 4);
    const d = e.pos.distanceTo(player.pos), c = e.c;
    c.root.visible = e.seen && d < 140;
    if (!c.root.visible) continue;
    c.root.position.copy(e.pos);
    let dr = e.ry - c.root.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); c.root.rotation.y += dr * Math.min(1, dt * 6);
    const sp = Math.hypot(e.v.x, e.v.z) * (k < 1.9 ? 1 : 0);
    if (performance.now() > c.lockUntil) c.play(sp > 6 ? 'Running_A' : sp > 0.5 ? 'Walking_A' : 'Idle_A', 0.25);
    if (d < 70) c.mixer.update(dt);
  }
}

net.on('status', s => {
  ON.status = s;
  if (s === 'online') toast(`🌐 Online · ${net.NET.peers.size + 1} player${net.NET.peers.size ? 's' : ''}`);
  else if (s === 'full') { toast('The festival is full (20 players).<br><span style="font-size:.6em">Playing alone for now. Try again later!</span>', 3500); $('objD').innerHTML = 'The online festival is full (20 players). You can still play alone.'; }
  else if (s === 'offline') $('objD').innerHTML = 'Could not connect. You can still play alone — check the internet connection.';
  renderBoard(); onlineButtons();
});
net.on('join', p => { addPeer(p); toast(`${esc(p.name || 'Someone')} joined!`, 1200); renderBoard(); });
net.on('leave', removePeer);
net.on('update', (p, changed) => { const e = ON.peers.get(p.id); if (!e) return; e.data = p; if (changed) buildPeer(e); else peerLabel(e); groupHUD(); });
net.on('st', m => {
  const e = ON.peers.get(m.id); if (!e || !isFinite(m.x) || !isFinite(m.z)) return;
  e.target.set(m.x, 0, m.z); e.v = { x: m.vx || 0, z: m.vz || 0 }; e.ry = m.ry || 0; e.last = performance.now();
  if (!e.seen || e.pos.distanceTo(e.target) > 25) e.pos.copy(e.target);
  e.seen = true; if (e.c) e.c.root.visible = true;
});
net.on('claim', m => { if (m.r !== roundNow()) return; const l = ON.lan[m.i]; if (l && m.gen >= l.gen) { l.gen = m.gen + 1; l.hideUntil = performance.now() + 6000; l.g.visible = false; l.g.position.copy(lanPos(m.r, m.i, l.gen)); } });
net.on('emo', m => { const e = ON.peers.get(m.id); if (e && e.c) e.c.play(m.e, 0.2, true); });
net.on('say', m => { const e = ON.peers.get(m.id), t = PHRASES[m.p]; if (!e || !t) return; bubble(e.c, t); if (e.c && PH_ANIM[m.p]) e.c.play(PH_ANIM[m.p], 0.2, true); });

function goOnline() {
  if (mode !== 'online' || net.NET.ch) return;
  ON.status = 'connecting'; renderBoard();
  net.connect(me()).then(ok => { ON.lastSend = 0; ON.sentStop = false; if (ok) { $('objD').innerHTML = 'Touch the floating lanterns to answer questions. Meet other players (E), make a group, or duel them in the <b>Arena</b>!'; sendState(true); } renderBoard(); onlineButtons(); });
}
function goOffline(why) {
  if (DUEL.on) endDuel('quit', true);
  GROUP.id = null; groupHUD(); net.disconnect();
  for (const e of ON.peers.values()) if (e.c) scene.remove(e.c.root); ON.peers.clear();
  ON.status = why || 'off'; renderBoard(); onlineButtons(); $('phr').classList.add('hidden');
}
function sendState(force) {
  if (!net.NET.ok) return;
  const now = performance.now(), p = player.pos, moving = ON.moving;
  const a = player.c?.curName || 'Idle_A';
  if (moving && (force || now - ON.lastSend > 1500)) {
    const dt = Math.max(0.3, (now - ON.lastSend) / 1000), lp = ON.lastPos || p;
    const vx = ON.lastPos ? (p.x - lp.x) / dt : 0, vz = ON.lastPos ? (p.z - lp.z) / dt : 0;
    net.send('st', { x: +p.x.toFixed(1), z: +p.z.toFixed(1), ry: +player.ry.toFixed(2), vx: +vx.toFixed(1), vz: +vz.toFixed(1), a });
    ON.lastSend = now; ON.lastPos = p.clone(); ON.sentStop = false;
  } else if ((!moving && !ON.sentStop && now - ON.lastSend > 300) || (force && !moving)) {
    net.send('st', { x: +p.x.toFixed(1), z: +p.z.toFixed(1), ry: +player.ry.toFixed(2), vx: 0, vz: 0, a: 'Idle_A' });
    ON.lastSend = now; ON.lastPos = p.clone(); ON.sentStop = true;
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { ON.hiddenT = setTimeout(() => { if (net.NET.ch) goOffline('away'); }, 60000); }
  else { clearTimeout(ON.hiddenT); if (ON.status === 'away' && mode === 'online') goOnline(); }
});

function renderBoard() {
  if (mode !== 'online') return;
  const r = roundNow();
  const list = [{ name: S.name || 'You', score: ON.score, me: true }, ...[...net.NET.peers.values()].map(p => ({ name: p.name, score: p.r === r ? p.score || 0 : 0, mate: GROUP.id && p.g === GROUP.id }))].sort((a, b) => b.score - a.score);
  const t = Date.now() % PERIOD, left = Math.max(0, Math.ceil((ROUND - t) / 1000));
  const st = net.NET.ok ? `🌐 ${net.NET.peers.size + 1} online` : ON.status === 'connecting' ? '🌐 Connecting…' : ON.status === 'full' ? '🌐 Festival full' : ON.status === 'away' ? '🌐 Away (move to return)' : '🌐 Offline';
  $('board').innerHTML = `<h3>${t < ROUND ? `⏱ ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : '🏁 Round over'} · ${st}</h3><ol>${list.slice(0, 8).map(p => `<li class="${p.me ? 'me' : ''}">${p.mate ? '★ ' : ''}${esc(p.name)} — ${p.score}</li>`).join('')}</ol><div class="small">best: ${S.best} · 🏆 arena: ${ARENA.wins}</div>`;
}

// ----- quick phrases (T) -----
const PHRASES = ['Hello! 👋', "Let's go!", 'Follow me!', 'Happy festival! 🎉', 'Thank you!', 'Good job!', 'Sorry!', 'Wait for me!', 'Where are you?', 'See you later!'];
const PH_ANIM = { 0: 'Waving', 3: 'Cheering', 5: 'Cheering', 9: 'Waving' };
function sayPhrase(i) {
  if (!online()) return;
  net.send('say', { p: i }); bubble(player.c, PHRASES[i]);
  if (PH_ANIM[i]) player.c.play(PH_ANIM[i], 0.2, true);
  $('phr').classList.add('hidden'); sfx('click', 0.3);
}
function togglePhrases() {
  if (!online() || modalOpen) return;
  const el = $('phr');
  el.innerHTML = PHRASES.map((t, i) => `<button class="btn alt" data-p="${i}"><kbd>${(i + 1) % 10}</kbd> ${esc(t)}</button>`).join('');
  el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => sayPhrase(+b.dataset.p));
  el.classList.toggle('hidden');
}
function onlineButtons() {
  const on = online();
  $('chatBtn').classList.toggle('hidden', !on || isTouch);
  if ($('tSay')) $('tSay').classList.toggle('hidden', !on);
  if (!on) $('phr').classList.add('hidden');
}

let onlineBusy = false;
async function onlineQuestion(i) {
  const l = ON.lan[i]; if (onlineBusy) return; onlineBusy = true;
  const r = roundNow();
  l.g.visible = false; net.send('claim', { i, gen: l.gen, r }); l.gen++; l.hideUntil = performance.now() + 6000; l.g.position.copy(lanPos(r, i, l.gen));
  sfx('coin');
  const it = prepItem(ON.pool[Math.floor(Math.random() * ON.pool.length)]);
  await new Promise(res => {
    openModal(`<div class="qcard"><span class="tag" style="background:${KCOL[it.k]}">${SKILLS[it.k]}</span><div class="q">${it.q}</div><div class="opts">${it.opts.map((o, j) => `<button class="opt" data-j="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join('')}</div><div id="why"></div><div class="foot" id="qfoot"></div></div>`);
    const t0 = performance.now();
    $('mbox').querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const j = +b.dataset.j, ok = j === it.correct; record(it, j, ok, 'Online Festival', t0);
      $('mbox').querySelectorAll('.opt').forEach((bb, bj) => { bb.disabled = true; if (bj === it.correct) bb.classList.add('ok'); else if (bj === j) bb.classList.add('no'); });
      let pts = 0;
      if (ok && roundNow() === r) {
        ON.streak++; pts = 10 + Math.min(10, (ON.streak - 1) * 2); ON.score += pts; S.best = Math.max(S.best, ON.score); save(); net.updateMe(me());
        if (GROUP.id) net.send('grp', { t: 'pts', g: GROUP.id, n: S.name || 'Player', r });
      } else ON.streak = 0;
      sfx(ok ? 'ok' : 'bad');
      $('why').innerHTML = `<div class="why ${ok ? 'ok' : 'no'}">${ok ? `✔ +${pts} points${ON.streak > 1 ? ` (streak ×${ON.streak})` : ''}${GROUP.id ? ' · your group gets +5 👥' : ''}` : '✘ No points.'} ${it.why}</div>`;
      $('qfoot').innerHTML = `<button class="btn">Back to the festival ➜</button>`; $('qfoot').firstChild.onclick = () => { closeModal(); res(); };
    });
  });
  onlineBusy = false; renderBoard();
}

function onlineTick(dt = 0.016) {
  const r = roundNow(), t = Date.now() % PERIOD, now = performance.now();
  if (r !== ON.round) { ON.round = r; ON.score = 0; ON.streak = 0; ON.lan.forEach(l => { l.gen = 0; l.hideUntil = 0; }); placeLanterns(); net.updateMe(me()); if (ON.podiumShown >= 0 && modalOpen && !DUEL.on) closeModal(); toast('🎆 New round! Find the lanterns!'); }
  const playing = t < ROUND;
  ON.lan.forEach((l, i) => {
    l.g.visible = playing && now > l.hideUntil;
    if (l.g.visible && !modalOpen && !DUEL.on && player.pos.distanceTo(l.g.position) < 1.8) onlineQuestion(i);
  });
  if (!playing && ON.podiumShown !== r && !modalOpen && !DUEL.on) {
    ON.podiumShown = r;
    const list = [{ name: S.name || 'You', score: ON.score }, ...[...net.NET.peers.values()].filter(p => p.r === r).map(p => ({ name: p.name, score: p.score || 0 }))].sort((a, b) => b.score - a.score);
    openModal(`<div class="cert"><h2>🏁 Round finished!</h2><table>${list.slice(0, 6).map((p, i) => `<tr><td>${['🥇', '🥈', '🥉'][i] || i + 1 + '.'} ${esc(p.name)}</td><td>${p.score}</td></tr>`).join('')}</table><div class="small">A new round starts in a few seconds…</div></div><div class="foot"><button class="btn" id="pOk">OK</button></div>`);
    sfx('win'); player.c.play('Cheering', 0.2, true);
    $('pOk').onclick = () => closeModal();
  }
  // moving or idle? (players who stay away 5 minutes leave the room, to save messages)
  ON.moving = player.pos.distanceTo(ON.prev) > 0.02; ON.prev.copy(player.pos);
  ON.idleT = ON.moving || modalOpen ? 0 : ON.idleT + dt;
  if (ON.idleT > 300 && net.NET.ch) { goOffline('away'); toast('You were away, so you left the online festival.<br><span style="font-size:.6em">Move to come back!</span>', 3500); }
  if (ON.status === 'away' && ON.moving && !net.NET.ch) goOnline();
  sendState(false);
  if (now - (ON.boardT || 0) > 1000) { ON.boardT = now; renderBoard(); groupHUD(); }
}

function emote(e) { if (mode === 'menu' || !player.c) return; player.c.play(e, 0.2, true); if (online()) net.send('emo', { e }); }
$('emotes').querySelectorAll('.btn').forEach(b => b.onclick = () => emote(b.dataset.e));

// ----- groups (up to 4, only for this session) -----
const GROUP = { id: null, since: 0 };
const MAX_GROUP = 4;
function groupMates() { if (!GROUP.id) return []; return [...ON.peers.values()].filter(e => e.data.g === GROUP.id); }
function setGroup(id) { GROUP.id = id; GROUP.since = performance.now(); net.updateMe(me()); for (const e of ON.peers.values()) peerLabel(e); groupHUD(); renderBoard(); }
function groupHUD() {
  const el = $('grp'); if (!el) return;
  const mates = groupMates();
  if (GROUP.id && !mates.length && performance.now() - GROUP.since > 10000) { GROUP.id = null; net.updateMe(me()); for (const e of ON.peers.values()) peerLabel(e); }
  if (!GROUP.id || mode !== 'online') { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  const total = ON.score + mates.reduce((a, e) => a + (e.data.r === roundNow() ? e.data.score || 0 : 0), 0);
  el.innerHTML = `<b>👥 Your group · ${total} pts</b><div>★ ${esc(S.name || 'You')} — ${ON.score}</div>${mates.map(e => `<div>★ ${esc(e.data.name || 'Player')} — ${e.data.r === roundNow() ? e.data.score || 0 : 0}${e.pos.distanceTo(player.pos) > 70 ? ' <span class="small">(far)</span>' : ''}</div>`).join('')}<button class="btn alt" id="grpLeave">Leave group</button>`;
  $('grpLeave').onclick = () => { setGroup(null); toast('You left the group.'); };
}
function invite(e) {
  if (groupMates().length + 1 >= MAX_GROUP) { toast('Your group is full (4 players).'); return; }
  if (e.data.g && e.data.g === GROUP.id) { toast(`${esc(e.data.name)} is already in your group.`); return; }
  net.send('grp', { t: 'inv', to: e.id, g: GROUP.id || net.NET.id, n: S.name || 'Player' });
  toast(`👥 Invitation sent to ${esc(e.data.name)}.`, 2200); sfx('click');
}
net.on('grp', async m => {
  if (m.t === 'inv' && m.to === net.NET.id) {
    if (modalOpen || DUEL.on || (GROUP.id && groupMates().length)) { net.send('grp', { t: 'no', to: m.id }); return; }
    sfx('open');
    const r = await say('Group', '#1fb5a8', `<b>${esc(m.n)}</b> invites you to join their group. In a group, every correct answer gives <b>+5 points</b> to all the other members. Do you want to join?`, [["Yes, I'd love to!"], ['No, thanks.', 'alt']]);
    if (r === 0 && net.NET.peers.has(m.id)) { setGroup(m.g); net.send('grp', { t: 'yes', to: m.id, g: m.g }); toast(`👥 You joined ${esc(m.n)}'s group!`, 2400); sfx('win', 0.4); }
    else net.send('grp', { t: 'no', to: m.id });
  } else if (m.t === 'yes' && m.to === net.NET.id) { if (!GROUP.id) setGroup(m.g); const p = net.NET.peers.get(m.id); toast(`👥 ${esc(p ? p.name : 'Someone')} joined your group!`, 2400); sfx('win', 0.4); groupHUD(); }
  else if (m.t === 'no' && m.to === net.NET.id) { const p = net.NET.peers.get(m.id); toast(`${esc(p ? p.name : 'They')} said: "No, thanks."`, 2200); }
  else if (m.t === 'pts' && GROUP.id && m.g === GROUP.id && m.r === roundNow()) { ON.score += 5; S.best = Math.max(S.best, ON.score); save(); net.updateMe(me()); toast(`👥 +5 team points (${esc(m.n)})`, 1300); renderBoard(); }
});
function peerMenu(e) {
  const p = e.data, mate = GROUP.id && p.g === GROUP.id;
  openModal(`<h2>🎭 ${esc(p.name || 'Player')}</h2><div class="small" style="margin-bottom:10px">${p.r === roundNow() ? p.score || 0 : 0} points this round · ${p.w || 0} arena win${p.w === 1 ? '' : 's'} today${p.d ? ' · <b style="color:#c0392b">in a duel now</b>' : ''}</div>
  <div class="foot" style="justify-content:flex-start">${mate ? '<button class="btn alt" id="pmLeave">Leave group</button>' : '<button class="btn teal" id="pmInv">👥 Invite to my group</button>'}<button class="btn pink" id="pmDuel" ${p.d || DUEL.on || DUEL.pending ? 'disabled' : ''}>⚔️ Challenge to a duel</button><button class="btn" id="pmWave">👋 Say hello</button><button class="btn alt" id="pmX">Close</button></div>`);
  $('pmX').onclick = closeModal;
  if ($('pmInv')) $('pmInv').onclick = () => { closeModal(); invite(e); };
  if ($('pmLeave')) $('pmLeave').onclick = () => { closeModal(); setGroup(null); };
  $('pmDuel').onclick = () => challenge(e.id);
  $('pmWave').onclick = () => { closeModal(); sayPhrase(0); };
}

// ----- the Arena: 1 vs 1 question duels -----
// Each correct answer hits the other player. Each player checks their own answers and tells the other one.
const DUEL_HP = 100, DUEL_DMG = 20, DUEL_TIME = 90;
const DUEL = { on: false, opp: null, oppName: '', hp: DUEL_HP, oppHp: DUEL_HP, t0: 0, phase: '', pending: null, seed: 0, qs: [], qi: 0 };
const ARENA = { wins: 0, losses: 0 };
let coach = null;
const duelPool = () => [...ZONES.flatMap(z => [...z.vocab, ...z.liu, ...z.tags]), ...BOSS.items, ...ONLINE_EXTRA.filter(x => !x.q.includes('class="mini"'))];
function seededShuffle(a, seed) { const R = mulberry(seed); a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

async function setupArena() {
  coach = await makeChar('Ranger', '#e8322f');
  coach.root.position.copy(arena.coach); coach.root.lookAt(arena.x, 0, arena.z); coach.root.rotation.y += Math.PI;
  const lb = label('Coach Kai', '#ffd0c8'); lb.position.y = 3.0; coach.root.add(lb);
  const mk = label('⚔', '#ffc23d', 56, 2.6); mk.position.y = 3.7; coach.root.add(mk);
  scene.add(coach.root); colliders.push({ x: arena.coach.x, z: arena.coach.z, r: 0.7 });
  coach.pos = arena.coach;
  for (const p of portals) { const lb = label(`🌀 ${p.name}`, '#e9dcff', 26, 3.6); lb.position.set(p.x, 4.3, p.z); scene.add(lb); }
}
async function arenaFlow() {
  coach.play('Waving', 0.2, true);
  if (!S.arenaIntro) {
    await say('Coach Kai', '#e8322f', `Welcome to the <b>Arena</b>! I'm Coach Kai. Here, two players have a friendly <b>English duel</b>: you both answer the same questions, and every correct answer is a hit!<br><br>The rules: 90 seconds, 100 HP each, and a wrong answer makes you wait a little. Be fast, but think!`, [['Got it!']]);
    S.arenaIntro = true; save();
  }
  if (!online()) {
    const r = await say('Coach Kai', '#e8322f', mode === 'online' ? 'You are not connected right now, so nobody can see you. You can practise with me!' : `To duel your classmates, open <b>🌐 Online Festival</b> from the menu. For now, you can practise with me!`, [['Practise ⚔️'], ['Maybe later', 'alt']]);
    if (r === 0) await runQuiz({ title: '⚔️ Arena practice', color: '#e8322f', items: shuffle(duelPool()).slice(0, 8), passMin: 0 });
    return;
  }
  openArenaMenu();
}
function openArenaMenu() {
  const mine = { name: S.name || 'You', w: ARENA.wins, me: true };
  const list = [...net.NET.peers.values()].map(p => ({ id: p.id, name: p.name || 'Player', w: p.w || 0, d: p.d }));
  const rank = [mine, ...list].sort((a, b) => b.w - a.w).slice(0, 8);
  const rows = list.length ? list.map(p => `<div class="srow"><b>⚔️ ${esc(p.name)}</b><span class="small"> ${p.w} win${p.w === 1 ? '' : 's'} today${p.d ? ' · <b style="color:#c0392b">in a duel now</b>' : ''}</span><button class="btn pink" data-ch="${p.id}" ${p.d || DUEL.pending ? 'disabled' : ''}>Challenge!</button></div>`).join('') : '<div class="small">Nobody else is online right now. Practise with Coach Kai!</div>';
  openModal(`<h2>⚔️ The Arena</h2><div class="small" style="margin-bottom:10px">Choose a player and send a challenge. If they say yes, the duel starts: 90 seconds, same questions for both.</div>
  <div class="arenaGrid"><div><h3 style="margin:4px 0">Players online</h3>${rows}</div>
  <div><h3 style="margin:4px 0">🏆 Today's champions</h3>${rank.map((p, i) => `<div class="srow" style="${p.me ? 'border-color:#ff7a1a' : ''}">${['🥇', '🥈', '🥉'][i] || i + 1 + '.'} ${esc(p.name)} <span style="margin-left:auto">${p.w} 🏆</span></div>`).join('')}<div class="small">Your duels today: ${ARENA.wins} won · ${ARENA.losses} lost. This ranking is only for today and is not saved.</div></div></div>
  <div class="foot"><button class="btn alt" id="arPr">Practise ⚔️</button><button class="btn alt" id="arX">Close</button></div>`);
  $('arX').onclick = closeModal;
  $('arPr').onclick = async () => { closeModal(); await runQuiz({ title: '⚔️ Arena practice', color: '#e8322f', items: shuffle(duelPool()).slice(0, 8), passMin: 0 }); };
  $('mbox').querySelectorAll('[data-ch]').forEach(b => b.onclick = () => challenge(b.dataset.ch));
}
function challenge(id) {
  const p = net.NET.peers.get(id); if (!p) return;
  DUEL.pending = id; DUEL.seed = Math.floor(Math.random() * 1e9);
  net.send('duel', { t: 'req', to: id, n: S.name || 'Player', s: DUEL.seed });
  closeModal(); toast(`⚔️ Challenge sent to ${esc(p.name)}.<br><span style="font-size:.6em">Waiting for an answer…</span>`, 3000); sfx('click');
  clearTimeout(DUEL.pendT); DUEL.pendT = setTimeout(() => { if (DUEL.pending === id) { DUEL.pending = null; toast(`${esc(p.name)} didn't answer.`); } }, 20000);
}
net.on('duel', async m => {
  if (m.to !== net.NET.id) return;
  const from = net.NET.peers.get(m.id), name = from ? from.name : m.n;
  if (m.t === 'req') {
    if (DUEL.on || modalOpen) { net.send('duel', { t: 'no', to: m.id, why: 'busy' }); return; }
    sfx('open');
    const r = await say('Coach Kai', '#e8322f', `<b>${esc(name)}</b> challenges you to an English duel in the Arena! Do you want to play?`, [["Yes, let's play! ⚔️"], ['No, thank you.', 'alt']]);
    if (r === 0 && net.NET.peers.has(m.id) && !DUEL.on) { net.send('duel', { t: 'ok', to: m.id }); startDuel(m.id, 1, m.s); }
    else net.send('duel', { t: 'no', to: m.id });
  } else if (m.t === 'ok' && DUEL.pending === m.id) { DUEL.pending = null; startDuel(m.id, -1, DUEL.seed); }
  else if (m.t === 'no' && DUEL.pending === m.id) { DUEL.pending = null; toast(m.why === 'busy' ? `${esc(name)} is busy right now. Try later!` : `${esc(name)} said: "No, thank you."`, 2600); }
  else if (!DUEL.on || m.id !== DUEL.opp) return;
  else if (m.t === 'hit' && DUEL.phase === 'fight') {
    DUEL.hp = Math.max(0, DUEL.hp - DUEL_DMG); sfx('hit', 0.5); player.c.play('Hit_A', 0.1, true);
    net.send('duel', { t: 'hp', to: DUEL.opp, hp: DUEL.hp });
    if (DUEL.hp <= 0) { net.send('duel', { t: 'end', to: DUEL.opp }); endDuel('lose'); }
    duelBars();
  } else if (m.t === 'hp') { DUEL.oppHp = Math.min(DUEL.oppHp, m.hp); duelBars(); }
  else if (m.t === 'end') endDuel('win');
  else if (m.t === 'quit') endDuel('left');
});
function startDuel(opp, side, seed) {
  const p = net.NET.peers.get(opp); if (!p) return;
  closeModal();
  Object.assign(DUEL, { on: true, opp, oppName: p.name || 'Player', hp: DUEL_HP, oppHp: DUEL_HP, t0: 0, phase: 'count', qs: seededShuffle(duelPool(), seed || 1), qi: 0 });
  const ga = arena.gateA, px = -Math.sin(ga), pz = Math.cos(ga);
  player.pos.set(arena.x + px * 4.5 * side, 0, arena.z + pz * 4.5 * side); player.ry = Math.atan2(-px * side, -pz * side);
  cam.yaw = player.ry + Math.PI + 0.6; ON.lastSend = 0; ON.moving = true; sendState(true);
  net.updateMe(me()); playMusic('m_boss');
  let n = 3; const tick = () => { if (!DUEL.on) return; if (n > 0) { toast(`${n}`, 900); sfx('click'); n--; setTimeout(tick, 1000); } else { DUEL.phase = 'fight'; DUEL.t0 = performance.now(); toast('GO! ⚔️', 900); duelQuestion(); } };
  tick();
}
function duelBars() {
  const el = $('duelBars'); if (!el) return;
  const left = Math.max(0, Math.ceil(DUEL_TIME - (performance.now() - DUEL.t0) / 1000));
  el.innerHTML = `<div>${esc(S.name || 'You')} <div class="hp"><i style="width:${DUEL.hp}%;background:linear-gradient(90deg,#ff8a7a,#e2453a)"></i></div></div><div style="text-align:center;font-size:22px">⚔️<br>${left}s</div><div style="text-align:right">${esc(DUEL.oppName)} <div class="hp"><i style="width:${DUEL.oppHp}%;background:linear-gradient(90deg,#7cd0ff,#2f8fe0)"></i></div></div>`;
}
function duelQuestion() {
  if (!DUEL.on || DUEL.phase !== 'fight') return;
  const it = prepItem(DUEL.qs[DUEL.qi++ % DUEL.qs.length]);
  openModal(`<h2>⚔️ Arena duel</h2><div class="duel" id="duelBars"></div><div class="qcard"><span class="tag" style="background:${KCOL[it.k]}">${SKILLS[it.k]}</span><div class="q">${it.q}</div><div class="opts">${it.opts.map((o, j) => `<button class="opt" data-j="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join('')}</div><div id="why"></div></div>`);
  duelBars();
  const t0 = performance.now();
  $('mbox').querySelectorAll('.opt').forEach(b => b.onclick = () => {
    if (!DUEL.on) return;
    const j = +b.dataset.j, ok = j === it.correct; record(it, j, ok, 'Arena duel', t0);
    $('mbox').querySelectorAll('.opt').forEach((bb, bj) => { bb.disabled = true; if (bj === it.correct) bb.classList.add('ok'); else if (bj === j) bb.classList.add('no'); });
    if (ok) {
      DUEL.oppHp = Math.max(0, DUEL.oppHp - DUEL_DMG); net.send('duel', { t: 'hit', to: DUEL.opp });
      sfx('hit'); player.c.play('Melee_Unarmed_Attack_Punch_A', 0.1, true); duelBars();
      if (DUEL.oppHp <= 0) { clearTimeout(DUEL.winT); DUEL.winT = setTimeout(() => { if (DUEL.on) endDuel('win'); }, 3000); }
    } else sfx('bad');
    $('why').innerHTML = `<div class="why ${ok ? 'ok' : 'no'}">${ok ? '✔ Hit! −20 HP' : '✘ Missed! Wait a moment…'} ${it.why}</div>`;
    setTimeout(duelQuestion, ok ? 1100 : 2600);
  });
}
function updateDuel() {
  if (!DUEL.on) return;
  if (!net.NET.peers.has(DUEL.opp)) { endDuel('left'); return; }
  if (DUEL.phase !== 'fight') return;
  const el = performance.now() - DUEL.t0;
  if ((ON.duelT = (ON.duelT || 0) + 1) % 15 === 0) duelBars();
  if (el > DUEL_TIME * 1000) endDuel(DUEL.hp > DUEL.oppHp ? 'win' : DUEL.hp < DUEL.oppHp ? 'lose' : 'draw');
}
function endDuel(result, silent) {
  if (!DUEL.on) return;
  DUEL.on = false; DUEL.phase = ''; clearTimeout(DUEL.winT);
  if (result === 'quit') { net.send('duel', { t: 'quit', to: DUEL.opp }); closeModal(); net.updateMe(me()); return; }
  if (result === 'win' || result === 'left') { ARENA.wins++; sfx('win'); player.c.play('Cheering', 0.2, true); }
  else if (result === 'lose') { ARENA.losses++; sfx('bad'); player.c.play('Death_A', 0.1, true); }
  else sfx('star');
  net.updateMe(me()); playMusic('m_online');
  if (silent) return;
  const txt = { win: ['🏆 You win!', `Great duel against ${esc(DUEL.oppName)}!`], lose: ['You lost…', `${esc(DUEL.oppName)} wins this time. Good game!`], draw: ["Time's up: it's a draw!", 'You were both great!'], left: ['🏆 You win!', `${esc(DUEL.oppName)} left the arena.`] }[result];
  openModal(`<div class="cert"><h2>${txt[0]}</h2><div class="bubble" style="display:inline-block">${txt[1]}<br><span class="small">Your duels today: ${ARENA.wins} won · ${ARENA.losses} lost.</span></div><div class="small" style="margin-top:8px">Tip: say "Good job!" with the 💬 button (T).</div></div><div class="foot"><button class="btn" id="dOk">OK</button></div>`);
  $('dOk').onclick = () => { closeModal(); const ga = arena.gateA; player.pos.set(arena.x + Math.cos(ga) * (arena.r + 2), 0, arena.z + Math.sin(ga) * (arena.r + 2)); player.ry = ga + Math.PI / 2; };
}

// ----- magic portals -----
const portalOpen = p => mode === 'online' || p.id === 'plaza' || (S.portals || []).includes(p.id);
function checkPortals() {
  if (mode !== 'story') return;
  S.portals ||= ['plaza'];
  for (const p of portals) if (!S.portals.includes(p.id) && Math.hypot(p.x - player.pos.x, p.z - player.pos.z) < 5) { S.portals.push(p.id); save(); sfx('star'); toast(`🌀 New portal: ${esc(p.name)}`, 2000); }
}
function openPortals(here) {
  sfx('open');
  const rows = portals.map(p => {
    const on = portalOpen(p), me = here && here.id === p.id;
    return `<div class="srow" style="${on ? '' : 'opacity:.5'}"><b style="color:${p.color}">🌀</b> <b>${esc(p.name)}</b>${me ? '<span class="small" style="margin-left:auto"><b>You are here</b></span>' : on ? `<button class="btn" data-go="${p.id}">Travel ✨</button>` : '<span class="small" style="margin-left:auto">Not discovered yet</span>'}</div>`;
  }).join('');
  openModal(`<h2>🌀 Magic Portal</h2><div class="small" style="margin-bottom:10px">Where do you want to go? You can travel to any portal you have discovered. To discover a new portal, walk to it the first time.</div>${rows}<div class="foot"><button class="btn alt" id="poX">Close</button></div>`);
  $('poX').onclick = closeModal;
  $('mbox').querySelectorAll('[data-go]').forEach(b => b.onclick = () => travel(portals.find(P => P.id === b.dataset.go)));
}
function travel(P) {
  closeModal(); sfx('star', 0.5);
  const fl = document.createElement('div'); fl.style.cssText = `position:fixed;inset:0;z-index:40;pointer-events:none;background:radial-gradient(circle,#fff,${P.color});opacity:0;transition:opacity .35s`;
  document.body.appendChild(fl); requestAnimationFrame(() => fl.style.opacity = 1);
  setTimeout(() => {
    player.pos.set(P.x + Math.sin(P.rot) * 4, 0, P.z + Math.cos(P.rot) * 4); player.ry = P.rot; cam.yaw = P.rot + Math.PI;
    camera.position.set(player.pos.x - Math.sin(P.rot) * 6, 4, player.pos.z - Math.cos(P.rot) * 6);
    fl.style.opacity = 0; setTimeout(() => fl.remove(), 500);
  }, 380);
}

// ---------------- interaction ----------------
let near = null;
function findNear() {
  near = null; let best = 1e9;
  const consider = (d, max, obj) => { if (d < max && d < best) { best = d; near = obj; } };
  const pp = player.pos;
  if (mode === 'story') {
    for (const n of npcs) consider(n.pos.distanceTo(pp), 3, { t: 'npc', n, label: `Talk to ${ZONES[n.zi].npc.name}` });
    for (const n of sideNpcs) consider(n.pos.distanceTo(pp), 3, { t: 'side', n, label: sst(n.q).done ? `Talk to ${n.q.npc.name}` : `Help ${n.q.npc.name} ${n.q.icon}` });
    if (boss && boss.root.visible) consider(boss.root.position.distanceTo(pp), 3.2, { t: 'boss', label: `Challenge ${BOSS.name}` });
  }
  if (mode !== 'menu' && !DUEL.on) {
    if (coach) consider(coach.pos.distanceTo(pp), 3, { t: 'coach', label: 'Talk to Coach Kai ⚔️' });
    for (const p of portals) consider(Math.hypot(p.x - pp.x, p.z - pp.z), 2.8, { t: 'portal', p, label: 'Use the magic portal 🌀' });
    if (online()) for (const e of ON.peers.values()) if (e.c && e.c.root.visible) consider(e.pos.distanceTo(pp), 3, { t: 'peer', e, label: `Meet ${String(e.data.name || 'Player').slice(0, 14)} 🎭` });
  }
  const el = $('prompt');
  if (near && !modalOpen) { el.innerHTML = `<kbd>${isTouch ? 'Tap' : 'E'}</kbd>${esc(near.label)}`; el.classList.remove('hidden'); } else el.classList.add('hidden');
}
function interact() {
  if (modalOpen || !near) return;
  sfx('click');
  if (near.t === 'npc') talkNPC(near.n);
  if (near.t === 'boss') bossDuel();
  if (near.t === 'side') talkSide(near.n);
  if (near.t === 'coach') arenaFlow();
  if (near.t === 'portal') openPortals(near.p);
  if (near.t === 'peer') peerMenu(near.e);
}

// ---------------- loop ----------------
const clock = new THREE.Clock();
const tmp = new THREE.Vector3();
function updatePlayer(dt) {
  const c = player.c; if (!c) return;
  let f = 0, s = 0;
  if (!modalOpen && mode !== 'menu') {
    f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - stick.y;
    s = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + stick.x;
  }
  const len = Math.min(1, Math.hypot(f, s));
  const run = (keys.ShiftLeft || keys.ShiftRight || Math.hypot(stick.x, stick.y) > 0.85) ? 1 : 0;
  const speed = len * (run ? 10 : 5.2);
  if (len > 0.05) {
    const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
    const mx = (fx * f + rx * s) / Math.hypot(f, s), mz = (fz * f + rz * s) / Math.hypot(f, s);
    player.pos.x += mx * speed * dt; player.pos.z += mz * speed * dt;
    const target = Math.atan2(mx, mz);
    let d = target - player.ry; d = Math.atan2(Math.sin(d), Math.cos(d)); player.ry += d * Math.min(1, dt * 12);
  }
  // jump & gravity
  if (keys.Space && player.ground && !modalOpen && mode !== 'menu') { player.vy = 7.5; player.ground = false; c.play('Jump_Start', 0.08, true); }
  player.vy -= 22 * dt; player.pos.y += player.vy * dt;
  if (player.pos.y <= 0) { if (!player.ground && player.vy < -3) c.play('Jump_Land', 0.05, true); player.pos.y = 0; player.vy = 0; player.ground = true; }
  // collisions
  for (const col of colliders) { const dx = player.pos.x - col.x, dz = player.pos.z - col.z, d = Math.hypot(dx, dz), m = col.r + 0.45; if (d < m && d > 0.0001) { player.pos.x = col.x + dx / d * m; player.pos.z = col.z + dz / d * m; } }
  const r = Math.hypot(player.pos.x, player.pos.z); if (r > ISLAND) { player.pos.x *= ISLAND / r; player.pos.z *= ISLAND / r; }
  c.root.position.copy(player.pos); c.root.rotation.y = player.ry;
  if (performance.now() > c.lockUntil) {
    if (!player.ground) c.play('Jump_Idle', 0.15);
    else if (speed > 6) c.play('Running_A', 0.15);
    else if (speed > 0.3) c.play('Walking_A', 0.15);
    else c.play('Idle_A', 0.25);
  }
}

function updateCamera(dt) {
  if (mode === 'menu') cam.yaw += dt * 0.12;
  const t = player.pos;
  // pull the camera in when a tree or a building is between it and the player
  let dist = cam.dist;
  const dx = Math.sin(cam.yaw) * Math.cos(cam.pitch), dy = Math.sin(cam.pitch), dz = Math.cos(cam.yaw) * Math.cos(cam.pitch), hy = t.y + 1.6;
  const near = camBlockers.filter(b => Math.abs(b.x - t.x) < cam.dist + b.r && Math.abs(b.z - t.z) < cam.dist + b.r);
  if (near.length) for (let s = 1.2; s <= cam.dist; s += 0.4) { const px = t.x + dx * s, py = hy + dy * s, pz = t.z + dz * s; if (near.some(b => py > b.y0 && py < b.y1 && (b.x - px) ** 2 + (b.z - pz) ** 2 < b.r * b.r)) { dist = Math.max(1.6, s - 0.7); break; } }
  const h = Math.sin(cam.pitch) * dist, hd = Math.cos(cam.pitch) * dist;
  const want = tmp.set(t.x + Math.sin(cam.yaw) * hd, Math.max(0.6, t.y + 1.6 + h), t.z + Math.cos(cam.yaw) * hd);
  camera.position.lerp(want, Math.min(1, dt * 10));
  camera.lookAt(t.x, t.y + 1.7, t.z);
  const sun = scene.userData.sun; sun.position.set(t.x + 30, 50, t.z + 20); sun.target.position.set(t.x, 0, t.z);
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
  } else $('arrow').style.display = 'none';
  if (beacon) { beacon.visible = !!o.p; if (o.p) beacon.position.set(o.p.x, 20, o.p.z); }
}

let frame = 0;
function loop() {
  requestAnimationFrame(loop);
  step();
}
function step() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  updatePlayer(dt);
  if (player.c) player.c.mixer.update(dt);
  for (const n of [...npcs, ...sideNpcs]) { if (n.pos.distanceTo(player.pos) > 90) continue; n.c.mixer.update(dt); if (performance.now() > n.c.lockUntil) n.c.play('Idle_A', 0.3); }
  if (coach && coach.pos.distanceTo(player.pos) < 90) { coach.mixer.update(dt); if (performance.now() > coach.lockUntil) coach.play('Idle_A', 0.3); }
  if (mode === 'story') checkPortals();
  if (boss) { boss.mixer.update(dt); if (boss.root.visible && performance.now() > boss.lockUntil && !S.final) boss.play('Idle_B', 0.3); }
  for (const f of animated) f(t, dt);
  scrolls.flat().forEach(s => { if (s.visible) { s.userData.paper.forEach(p => p.rotation.y = t * 2); s.position.y = 1.4 + Math.sin(t * 2 + s.position.x) * 0.15; } });
  if (mode === 'story') {
    scrolls.forEach((arr, zi) => arr.forEach((s, k) => { if (s.visible && !modalOpen && Math.hypot(s.position.x - player.pos.x, s.position.z - player.pos.z) < 1.6) collectScroll(zi, k); }));
    sideInfo.forEach((info, i) => info.items.forEach((it, k) => {
      if (!it.visible) return;
      if (it.userData.float) { const m = it.userData.item; m.position.y = 0.9 + Math.sin(t * 2 + k) * 0.15; m.rotation.y = t * 1.8; }
      if (!modalOpen && Math.hypot(it.position.x - player.pos.x, it.position.z - player.pos.z) < 1.6) pickSide(i, k);
    }));
  }
  if (mode === 'online') {
    onlineTick(dt); updatePeers(dt); updateDuel();
    ON.lan.forEach(l => { if (l.g.visible) l.g.children[0].position.y = 1.6 + Math.sin(t * 2 + l.g.position.x) * 0.2; });
  }
  for (let i = fw.length - 1; i >= 0; i--) { const f = fw[i]; f.life -= dt; const pos = f.p.geometry.attributes.position; f.vel.forEach((v, k) => { v.y -= 6 * dt; pos.array[k * 3] += v.x * dt; pos.array[k * 3 + 1] += v.y * dt; pos.array[k * 3 + 2] += v.z * dt; }); pos.needsUpdate = true; f.p.material.opacity = Math.max(0, f.life / 1.6); if (f.life <= 0) { scene.remove(f.p); fw.splice(i, 1); } }
  if (greatFire.visible) greatFire.userData.light.intensity = 35 + Math.sin(t * 10) * 6;
  updateCamera(dt);
  findNear(); updateHUD();
  if (mode !== 'menu' && (frame++ & 1)) drawMini(t);
  if (isTouch) { const hide = modalOpen ? 'hidden' : '', tc = $('touch'); if (tc.style.visibility !== hide) tc.style.visibility = hide; }
  renderer.render(scene, camera);
}

// ---------------- menu ----------------
function buildMenu() {
  $('chars').innerHTML = CHARS.map(([m, n]) => `<button data-m="${m}" class="${S.char === m ? 'on' : ''}">${n}</button>`).join('');
  $('chars').querySelectorAll('button').forEach(b => b.onclick = async () => { sfx('click'); S.char = b.dataset.m; save(); buildMenu(); await setPlayerModel(S.char); player.c.play('Waving', 0.2, true); });
  const st = student();
  if (st && !S.name && st.first_name) { S.name = String(st.first_name).slice(0, 14); save(); }
  $('pname').value = S.name;
  $('esltStatus').innerHTML = st
    ? `📊 Hola, <b>${esc(st.first_name || st.name || '')}</b> (${esc(st.section || '')}). Tu profe verá tu avance.`
    : `⚠️ No has iniciado sesión: tu profe no verá tu avance. <a href="https://eslteacher.cl/" target="_blank" rel="noopener">Entra en eslteacher.cl</a> (Mi perfil) y vuelve a abrir el juego.`;
  $('esltStatus').classList.toggle('warn', !st);
  $('progressTxt').textContent = S.final ? '🏆 Story completed!' : `Story: 🏮 ${lanterns()}/5 lanterns · ⭐ ${stars()}/15 scrolls · 🤝 ${helped()}/${SIDE.length} friends`;
}
$('pname').addEventListener('input', e => { S.name = e.target.value.trim(); save(); });
$('bReset').onclick = () => { if (confirm('Reset your story progress?')) { const keep = { name: S.name, char: S.char, best: S.best }; S = Object.assign(freshSave(), keep); save(); refreshStory(); buildMenu(); } };
$('bStory').onclick = () => start('story');
$('bOnline').onclick = () => start('online');
$('menuBtn').onclick = () => {
  if (modalOpen) return;
  const btns = [['Continue playing'], ['Main menu', 'alt']]; if (S.final) btns.splice(1, 0, ['🏆 Certificate', 'teal']);
  say('Menu', '#7a2d8f', `Player: <b>${esc(S.name || 'Player')}</b><br>Lanterns: ${lanterns()}/5 · Scrolls: ${stars()}/15 · Festival friends: ${helped()}/${SIDE.length}`, btns).then(i => { const lab = btns[i][0]; if (lab.includes('Certificate')) certificate(); if (lab === 'Main menu') toMenu(); });
};

function toMenu() {
  if (mode === 'online') { goOffline(); ON.lan.forEach(l => l.g.visible = false); }
  mode = 'menu'; $('menu').classList.remove('hidden'); $('hud').classList.add('hidden'); $('touch').classList.add('hidden');
  player.pos.set(2, 0, 9); refreshStory(); buildMenu(); music.pause(); music.dataset.n = '';
}

async function start(m) {
  if (!S.name) { $('pname').focus(); $('pname').style.borderColor = '#d9433b'; toast('Write your name first ✍️'); return; }
  sfx('click');
  mode = m; $('menu').classList.add('hidden'); $('hud').classList.remove('hidden'); if (isTouch) $('touch').classList.remove('hidden');
  $('board').classList.toggle('hidden', m !== 'online'); $('emotes').classList.toggle('hidden', m !== 'online'); $('stats').classList.toggle('hidden', m !== 'story'); mini.classList.remove('big'); $('grp').classList.add('hidden'); $('tSay').classList.add('hidden'); $('tWave').classList.toggle('hidden', m !== 'online'); $('tCheer').classList.toggle('hidden', m !== 'online');
  cam.yaw = 0; player.pos.set(2, 0, 9); player.ry = Math.PI;
  refreshStory();
  if (m === 'story') {
    playMusic('m_story');
    if (!S.intro) {
      await say('Festival Island', '#ff7a1a', `Welcome, <b>${esc(S.name)}</b>! Every year, five festivals from around the world meet on this island: <b>Day of the Dead, Lunar New Year, Fiestas Patrias, Holi and We Tripantu</b>.<br><br>But last night, <b>Mr. Grey</b> — who thinks traditions are boring — stole their colours and blew out the Great Festival Fire. 😱`, [['What can I do?']]);
      await say('Festival Island', '#ff7a1a', `Visit each festival, <b>read its story</b> and answer the questions. Then find the <b>3 lost scrolls</b> in each zone (vocabulary, language in use and question tags) to win back its <b>lantern</b>.<br><br>The island is big! Follow the golden arrow ⬆️, the light beam and the ⭐ on the map (press <b>M</b> or tap the map to make it bigger).<br><br>On the roads you will meet people who need help 💬. Help them, too — a real Festival Keeper always helps a friend! 🤝`, [["Let's go! 🏮"]]);
      S.intro = true; save();
    }
  } else {
    playMusic('m_online');
    setupOnlineObjects(); ON.round = -1;
    $('objT').innerHTML = 'Online Festival'; $('objD').innerHTML = 'Connecting…';
    goOnline();
  }
}

// ---------------- boot ----------------
let loadPct = 0;   // el total crece mientras se descubren modelos: el porcentaje nunca retrocede
setProgress(p => { loadPct = Math.max(loadPct, Math.round(p * 100)); $('lbar').style.width = loadPct + '%'; const t = $('lpct'); if (t) t.textContent = loadPct + '%'; });
(async () => {
  await buildWorld();
  await setupStory();
  await setupSide();
  await setupArena();
  await setPlayerModel(S.char);
  camera.position.set(0, 5, 20);
  $('loading').classList.add('hidden');
  refreshStory(); buildMenu(); $('menu').classList.remove('hidden');
  loop();
  if (location.search.includes('debug')) window.FQ = { player, cam, get S() { return S; }, ZONES, zoneInfo, refreshStory, save, ON, SIDE, sideInfo, sideNpcs, sst, talkSide, step, ON, DUEL, ARENA, GROUP, portals, arena, travel, openPortals, arenaFlow, startDuel, endDuel, duelQuestion, tick: () => { onlineTick(); findNear(); } };
})();

$('bCred').onclick = () => {
  openModal(`<h2>Credits</h2><div class="bubble" style="font-size:16px">
  <b>Festival Quest: The Lost Lanterns</b> — English game for 1° medio, Unit 4 "Traditions and Festivities".<br><br>
  <b>3D models and animations:</b> KayKit by Kay Lousberg (Adventurers, Skeletons, Character Animations, Medieval Hexagon, Halloween Bits, Dungeon, Restaurant Bits, Forest Nature, City Builder Bits, Resource Bits) — CC0 · kaylousberg.itch.io<br>
  <b>Music:</b> "Lively City", "Battle Theme I", "Malicious Scheme" by Hydrogene — CC0 · hydrogene.itch.io<br>
  <b>Sound effects and jingles:</b> Kenney (Interface Sounds, RPG Audio, Music Jingles) — CC0 · kenney.nl<br>
  <b>Engine:</b> three.js (MIT) · Online: Supabase Realtime</div>
  <div class="foot"><button class="btn" id="crOk">Close</button></div>`);
  $('crOk').onclick = closeModal;
};
