import * as THREE from 'three';
import { scene, buildWorld, makeChar, setProgress, colliders, animated, zoneInfo, pedestals, greatTree, smogs, greens, turbines, ISLAND, bottle, zonePos } from './world.js';
import { ZONES, BOSS, ONLINE_EXTRA, SKILLS, GRAMMAR } from './content.js';
import * as net from './net.js';

const $ = id => document.getElementById(id);
const CHARS = [['Knight', 'Knight'], ['Mage', 'Mage'], ['Ranger', 'Ranger'], ['Rogue', 'Rogue'], ['Barbarian', 'Barbarian'], ['Rogue_Hooded', 'Hooded']];
const KCOL = { E: '#1f8fd6', I: '#7a2d8f', A: '#1fb5a8', R: '#e2408f', Z: '#ff7a1a' };

// ---------------- save ----------------
const SAVE_KEY = 'greenquest7b_v1';
function freshSave() { return { name: '', char: 'Ranger', zones: {}, stats: { E: [0, 0], I: [0, 0], A: [0, 0], R: [0, 0], Z: [0, 0] }, final: false, intro: false, best: 0 }; }
let S = freshSave();
try { const raw = localStorage.getItem(SAVE_KEY); if (raw) S = Object.assign(freshSave(), JSON.parse(raw)); } catch (e) { }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }
const zst = id => (S.zones[id] ||= { read: false, scrolls: [false, false, false], done: false });
const lanterns = () => ZONES.filter(z => zst(z.id).done).length;
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
  if (e.code === 'KeyE' || e.code === 'Enter') interact();
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
const isTouch = matchMedia('(pointer: coarse)').matches;
if (isTouch) {
  const st = $('stick'), knob = st.firstElementChild; let sid = null;
  st.addEventListener('pointerdown', e => { sid = e.pointerId; st.setPointerCapture(sid); move(e); });
  st.addEventListener('pointermove', e => { if (e.pointerId === sid) move(e); });
  const end = () => { sid = null; stick.x = stick.y = 0; knob.style.transform = ''; };
  st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
  function move(e) { const r = st.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } stick.x = x; stick.y = y; knob.style.transform = `translate(${x * 40}px,${y * 40}px)`; }
  $('tJump').addEventListener('pointerdown', () => { keys.Space = true; setTimeout(() => keys.Space = false, 120); });
  $('tAct').addEventListener('pointerdown', () => interact());
  $('help').textContent = 'Joystick: move · Drag screen: camera';
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
function prepItem(it) { const order = shuffle(it.o.map((_, i) => i)); return { ...it, opts: order.map(i => it.o[i]), correct: order.indexOf(it.a) }; }
function record(k, ok) { if (!S.stats[k]) S.stats[k] = [0, 0]; S.stats[k][1]++; if (ok) S.stats[k][0]++; save(); }

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
    }
    function answer(j) {
      const it = items[i], ok = j === it.correct; res[i] = ok; if (ok) correct++;
      record(it.k, ok); sfx(ok ? 'ok' : 'bad');
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
const SCROLL_TYPES = [['should', 'Advice bag (should / could)', 'A'], ['must', 'Rules bag (must / have to)', 'R'], ['zero', 'Zero conditional bag', 'Z']];
function makeScrollMesh(color) {   // a glowing rubbish bag
  const g = new THREE.Group();
  const bag = new THREE.Mesh(new THREE.SphereGeometry(0.42, 9, 7), M('#2b2b30', { emissive: color, emissiveIntensity: 0.25 })); bag.scale.set(1, 1.15, 1);
  const knot = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.3, 6), M('#2b2b30')); knot.position.y = 0.5;
  const tie = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 5, 10), M(color)); tie.position.y = 0.4; tie.rotation.x = Math.PI / 2;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 6, 28), new THREE.MeshBasicMaterial({ color })); ring.rotation.x = Math.PI / 2; ring.position.y = -1.0;
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 10, 12, 1, true), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 4;
  const b = new THREE.Group(); b.add(bag, knot, tie);
  g.add(b, ring, beam); g.userData.paper = [b];
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
    scrolls[i] = info.bagPos.map(p => { const s = makeScrollMesh(z.color); s.position.set(p.x, 1.4, p.z); s.visible = false; scene.add(s); return s; });
  }
  boss = await makeChar('Rogue_Hooded', '#4a4440');
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
    p.crystal.userData.body.material.color.set(lit ? p.color : '#777777');
    p.crystal.userData.body.material.emissive.set(lit ? p.color : '#000000');
    p.crystal.userData.body.material.emissiveIntensity = lit ? 0.8 : 0;
    const clean = mode !== 'story' || st.done;
    (smogs[i] || []).forEach(o => o.visible = !clean);
    (greens[i] || []).forEach(o => o.visible = clean);
    if (z.id === 'energy') turbines.forEach(t => t.speed = clean ? 2.2 : 0);
  });
  const all = lanterns() === 5;
  if (boss) boss.root.visible = mode === 'story' && all && !S.final;
  const treeOn = mode === 'online' || S.final;
  if (greatTree.green) greatTree.green.visible = treeOn;
  if (greatTree.bare) greatTree.bare.visible = !treeOn;
  $('cLan').textContent = `💎 ${lanterns()}/5`; $('cStar').textContent = `🗑️ ${stars()}/15`;
  // smog: grey sky and thick fog at the start, clear blue sky at the end
  const k = mode === 'story' ? (S.final ? 1 : lanterns() / 6) : 1;
  const grey = new THREE.Color('#8f8a80'), blue = new THREE.Color('#8fd3ff');
  scene.background.copy(grey.clone().lerp(blue, k));
  scene.fog.color.copy(new THREE.Color('#9a958a').lerp(new THREE.Color('#bfe6ff'), k));
  scene.fog.near = 20 + k * 50; scene.fog.far = 90 + k * 80;
  const sat = mode === 'story' ? (S.final ? 1.15 : 0.35 + lanterns() * 0.13) : 1.05;
  cv.style.filter = `saturate(${sat})`;
}

function objective() {
  if (S.final) return { t: 'Eco Island is saved!', d: 'Explore the island, or open the menu to see your certificate.', p: null };
  for (let i = 0; i < ZONES.length; i++) {
    const z = ZONES[i], st = zst(z.id), info = zoneInfo[i];
    if (st.done) continue;
    if (!st.read) return { t: `${z.name} · ${z.topic}`, d: `Find <b>${z.npc.name}</b> and read the story.`, p: info.npcPos };
    const miss = st.scrolls.findIndex(s => !s);
    if (miss >= 0) {
      let best = null, bd = 1e9; st.scrolls.forEach((s, k) => { if (!s) { const d = info.bagPos[k].distanceTo(player.pos); if (d < bd) { bd = d; best = info.bagPos[k]; } } });
      return { t: `${z.name} · Rubbish bags`, d: `Pick up the glowing rubbish bags (${st.scrolls.filter(Boolean).length}/3).`, p: best };
    }
    return { t: `${z.name}`, d: `Go back to <b>${z.npc.name}</b> to get the Eco Crystal.`, p: info.npcPos };
  }
  return { t: 'The Great Tree', d: `All the crystals are back! Face <b>${BOSS.name}</b> next to the Great Tree.`, p: new THREE.Vector3(0, 0, 8.4) };
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
    toast('3 rubbish bags appeared! 🗑️');
    return;
  }
  if (st.scrolls.some(s => !s)) { await say(z.npc.name, z.color, `You still need to pick up ${st.scrolls.filter(s => !s).length} rubbish bag(s). Look for the light beams!`, [['OK']]); return; }
  await say(z.npc.name, z.color, z.bye, [['Take the Eco Crystal 💎']]);
  st.done = true; save(); sfx('win'); player.c.play('Cheering', 0.2, true);
  refreshStory(); toast(`💎 Eco Crystal ${lanterns()}/5`);
  if (lanterns() === 5) setTimeout(() => toast('Captain Smog is waiting at the Great Tree…', 2500), 2000);
}

async function collectScroll(zi, k) {
  const z = ZONES[zi], st = zst(z.id);
  scrolls[zi][k].visible = false; sfx('coin'); player.c.play('PickUp', 0.1, true);
  const [field, name, skill] = SCROLL_TYPES[k];
  await say(name, KCOL[skill], `<b>Quick reminder</b><div style="background:#f3faf0;border-left:5px solid ${KCOL[skill]};border-radius:8px;padding:10px 12px;margin:8px 0;font-size:17px">${GRAMMAR[skill]}</div>This bag has 4 challenges. Get at least 3 right to recycle it!`, [['Open the bag ♻️']]);
  await runQuiz({ title: `${z.name} — ${name}`, color: z.color, items: z[field], passMin: 3, shuffleItems: true });
  st.scrolls[k] = true; save(); refreshStory(); toast('♻️ Bag recycled!');
  if (st.scrolls.every(Boolean)) setTimeout(() => toast(`Go back to ${z.npc.name}!`), 1900);
}

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
      openModal(`<h2>Eco Duel</h2><div class="duel"><div>You ${'💚'.repeat(hearts)}${'🤍'.repeat(3 - hearts)}</div><div style="text-align:right">${BOSS.name}<div class="hp"><i style="width:${grey / 8 * 100}%"></i></div></div></div>
      <div class="qcard"><span class="tag" style="background:${KCOL[it.k]}">${SKILLS[it.k]}</span><div class="q">${it.q}</div><div class="opts">${it.opts.map((o, j) => `<button class="opt" data-j="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join('')}</div><div id="why"></div><div class="foot" id="qfoot"></div></div>`);
      $('mbox').querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const j = +b.dataset.j, ok = j === it.correct; record(it.k, ok);
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
  if (!won) { await say(BOSS.name, '#6d6d7a', "Cough, cough! Ha! You should practise more. If you practise, you get better… Come back later!", [['Try again later']]); return; }
  S.final = true; save(); refreshStory();
  boss.play('Cheering'); player.c.play('Cheering', 0.2, true); sfx('win');
  fireworks();
  await say(BOSS.name, '#6d6d7a', BOSS.win, [['🎉 See my certificate']]);
  certificate();
}

function certificate() {
  const rows = Object.entries(SKILLS).map(([k, n]) => { const [c, t] = S.stats[k] || [0, 0]; return `<tr><td><span style="color:${KCOL[k]}">●</span> ${n}</td><td>${t ? Math.round(c / t * 100) : 0}% <span class="small">(${c}/${t})</span></td></tr>`; }).join('');
  const tot = Object.values(S.stats).reduce((a, [c, t]) => [a[0] + c, a[1] + t], [0, 0]);
  openModal(`<div class="cert"><h2 style="font-size:34px">🏆 Eco Hero Certificate</h2><div class="bubble" style="display:inline-block;margin-top:8px">This certifies that <b>${esc(S.name || 'the player')}</b> cleaned the five zones of Eco Island, brought back the five Eco Crystals and defeated Captain Smog.<br><span class="small">${new Date().toLocaleDateString('es-CL')} · Unit 4: Green Issues · 7° básico</span></div>
  <table>${rows}<tr><td><b>Total (all attempts)</b></td><td>${tot[1] ? Math.round(tot[0] / tot[1] * 100) : 0}%</td></tr></table><div class="small">Take a screenshot and send it to your teacher.</div></div><div class="foot"><button class="btn" id="cOk">Continue</button></div>`);
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

// ---------------- online ----------------
const ROUND = 180000, BREAK = 15000, PERIOD = ROUND + BREAK, NL = 12;
const ON = { lan: [], score: 0, streak: 0, round: -1, peers: new Map(), lastSend: 0, lastSent: null, pool: [], podiumShown: -1 };
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function lanPos(r, i, gen) {
  const R = mulberry(r * 7919 + i * 131 + gen * 17 + 3);
  for (let tries = 0; tries < 40; tries++) {
    const a = R() * Math.PI * 2, d = 9 + R() * (ISLAND - 14), x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (colliders.every(c => Math.hypot(c.x - x, c.z - z) > c.r + 1.2)) return new THREE.Vector3(x, 0, z);
  }
  return new THREE.Vector3(0, 0, 14);
}
function setupOnlineObjects() {
  if (ON.lan.length) return;
  const cols = ['#ff2e93', '#ffd500', '#1fd1ff', '#7cff3a', '#a64dff', '#ff7a1a'];
  for (let i = 0; i < NL; i++) {
    const g = new THREE.Group(); bottle(cols[i % 6], g);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 14, 12, 1, true), new THREE.MeshBasicMaterial({ color: cols[i % 6], transparent: true, opacity: 0.15, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 7; g.add(beam);
    g.visible = false; scene.add(g);
    ON.lan.push({ g, gen: 0, hideUntil: 0 });
  }
  // story readings need the long text, so online uses the mini readings in ONLINE_EXTRA instead
  ON.pool = [...ZONES.flatMap(z => [...z.should, ...z.must, ...z.zero]), ...BOSS.items, ...ONLINE_EXTRA];
}
const roundNow = () => Math.floor(Date.now() / PERIOD);
function placeLanterns() { const r = roundNow(); ON.lan.forEach((l, i) => { l.g.position.copy(lanPos(r, i, l.gen)); }); }

async function addPeer(p) {
  if (ON.peers.has(p.id)) return;
  const entry = { id: p.id, c: null, target: new THREE.Vector3(0, 0, 12), ry: 0, anim: 'Idle_A', data: p };
  ON.peers.set(p.id, entry);
  const c = await makeChar(CHARS.some(x => x[0] === p.char) ? p.char : 'Knight');
  if (!ON.peers.has(p.id)) return;
  entry.c = c; c.root.position.copy(entry.target);
  const lb = label(String(p.name || 'Player').slice(0, 14), '#ffe7a8'); lb.position.y = 3.0; c.root.add(lb);
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
net.on('st', m => { const e = ON.peers.get(m.id); if (!e) return; e.target.set(m.x, 0, m.z); e.ry = m.ry; e.anim = m.a; e.last = performance.now(); });
net.on('claim', m => { if (m.r !== roundNow()) return; const l = ON.lan[m.i]; if (l && m.gen >= l.gen) { l.gen = m.gen + 1; l.hideUntil = performance.now() + 6000; l.g.visible = false; l.g.position.copy(lanPos(m.r, m.i, l.gen)); } });
net.on('emo', m => { const e = ON.peers.get(m.id); if (e && e.c) e.c.play(m.e, 0.2, true); });

function sendState(force) {
  const now = performance.now(); const p = player.pos;
  const a = player.c?.curName || 'Idle_A';
  const moved = !ON.lastSent || Math.hypot(p.x - ON.lastSent.x, p.z - ON.lastSent.z) > 0.3 || a !== ON.lastSent.a;
  if (force || (moved && now - ON.lastSend > 1000) || now - ON.lastSend > 5000) {
    net.send('st', { x: +p.x.toFixed(2), z: +p.z.toFixed(2), ry: +player.ry.toFixed(2), a });
    ON.lastSend = now; ON.lastSent = { x: p.x, z: p.z, a };
  }
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
  const l = ON.lan[i]; if (onlineBusy) return; onlineBusy = true;
  const r = roundNow();
  l.g.visible = false; net.send('claim', { i, gen: l.gen, r }); l.gen++; l.hideUntil = performance.now() + 6000; l.g.position.copy(lanPos(r, i, l.gen));
  sfx('coin');
  const it = prepItem(ON.pool[Math.floor(Math.random() * ON.pool.length)]);
  await new Promise(res => {
    openModal(`<div class="qcard"><span class="tag" style="background:${KCOL[it.k]}">${SKILLS[it.k]}</span><div class="q">${it.q}</div><div class="opts">${it.opts.map((o, j) => `<button class="opt" data-j="${j}">${String.fromCharCode(65 + j)}. ${esc(o)}</button>`).join('')}</div><div id="why"></div><div class="foot" id="qfoot"></div></div>`);
    $('mbox').querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const j = +b.dataset.j, ok = j === it.correct; record(it.k, ok);
      $('mbox').querySelectorAll('.opt').forEach((bb, bj) => { bb.disabled = true; if (bj === it.correct) bb.classList.add('ok'); else if (bj === j) bb.classList.add('no'); });
      let pts = 0;
      if (ok && roundNow() === r) { ON.streak++; pts = 10 + Math.min(10, (ON.streak - 1) * 2); ON.score += pts; S.best = Math.max(S.best, ON.score); save(); net.updateMe(me()); } else ON.streak = 0;
      sfx(ok ? 'ok' : 'bad');
      $('why').innerHTML = `<div class="why ${ok ? 'ok' : 'no'}">${ok ? `✔ +${pts} points${ON.streak > 1 ? ` (streak ×${ON.streak})` : ''}` : '✘ No points.'} ${it.why}</div>`;
      $('qfoot').innerHTML = `<button class="btn">Back to the clean-up ➜</button>`; $('qfoot').firstChild.onclick = () => { closeModal(); res(); };
    });
  });
  onlineBusy = false; renderBoard();
}

function onlineTick() {
  const r = roundNow(), t = Date.now() % PERIOD, now = performance.now();
  if (r !== ON.round) { ON.round = r; ON.score = 0; ON.streak = 0; ON.lan.forEach(l => { l.gen = 0; l.hideUntil = 0; }); placeLanterns(); net.updateMe(me()); if (ON.podiumShown >= 0 && modalOpen) closeModal(); toast('♻️ New round! Pick up the bottles!'); }
  const playing = t < ROUND;
  ON.lan.forEach((l, i) => {
    l.g.visible = playing && now > l.hideUntil;
    if (l.g.visible && !modalOpen && player.pos.distanceTo(l.g.position) < 1.8) onlineQuestion(i);
  });
  if (!playing && ON.podiumShown !== r && !modalOpen) {
    ON.podiumShown = r;
    const list = [{ name: S.name || 'You', score: ON.score }, ...[...net.NET.peers.values()].filter(p => p.r === r).map(p => ({ name: p.name, score: p.score || 0 }))].sort((a, b) => b.score - a.score);
    openModal(`<div class="cert"><h2>🏁 Round finished!</h2><table>${list.slice(0, 6).map((p, i) => `<tr><td>${['🥇', '🥈', '🥉'][i] || i + 1 + '.'} ${esc(p.name)}</td><td>${p.score}</td></tr>`).join('')}</table><div class="small">A new round starts in a few seconds…</div></div><div class="foot"><button class="btn" id="pOk">OK</button></div>`);
    sfx('win'); player.c.play('Cheering', 0.2, true);
    $('pOk').onclick = () => closeModal();
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
    for (const n of npcs) if (n.pos.distanceTo(player.pos) < 3) near = { t: 'npc', n, label: `Talk to ${ZONES[n.zi].npc.name}` };
    if (boss && boss.root.visible && boss.root.position.distanceTo(player.pos) < 3.2) near = { t: 'boss', label: `Challenge ${BOSS.name}` };
  }
  const el = $('prompt');
  if (near && !modalOpen) { el.innerHTML = `<kbd>${isTouch ? 'Tap' : 'E'}</kbd>${near.label}`; el.classList.remove('hidden'); } else el.classList.add('hidden');
}
function interact() {
  if (modalOpen || !near) return;
  sfx('click');
  if (near.t === 'npc') talkNPC(near.n);
  if (near.t === 'boss') bossDuel();
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
  const speed = len * (run ? 8 : 4.2);
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
  const h = Math.sin(cam.pitch) * cam.dist, hd = Math.cos(cam.pitch) * cam.dist;
  const want = tmp.set(t.x + Math.sin(cam.yaw) * hd, Math.max(0.6, t.y + 1.6 + h), t.z + Math.cos(cam.yaw) * hd);
  camera.position.lerp(want, Math.min(1, dt * 10));
  camera.lookAt(t.x, t.y + 1.7, t.z);
  const sun = scene.userData.sun; sun.position.set(t.x + 30, 50, t.z + 20); sun.target.position.set(t.x, 0, t.z);
}

function updateHUD() {
  if (mode !== 'story') { $('arrow').style.display = 'none'; if (beacon) beacon.visible = false; return; }
  const o = objective();
  $('objT').innerHTML = o.t; $('objD').innerHTML = o.d;
  if (o.p && o.p.distanceTo(player.pos) > 4) {
    const target = Math.atan2(o.p.x - player.pos.x, o.p.z - player.pos.z), fwd = Math.atan2(-Math.sin(cam.yaw), -Math.cos(cam.yaw));
    const diff = Math.atan2(Math.sin(target - fwd), Math.cos(target - fwd));
    $('arrow').style.display = 'block'; $('arrow').style.transform = `rotate(${-diff}rad)`;
  } else $('arrow').style.display = 'none';
  if (beacon) { beacon.visible = !!o.p; if (o.p) beacon.position.set(o.p.x, 20, o.p.z); }
}

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  updatePlayer(dt);
  if (player.c) player.c.mixer.update(dt);
  for (const n of npcs) { n.c.mixer.update(dt); if (performance.now() > n.c.lockUntil) n.c.play('Idle_A', 0.3); }
  if (boss) { boss.mixer.update(dt); if (boss.root.visible && performance.now() > boss.lockUntil && !S.final) boss.play('Idle_B', 0.3); }
  for (const f of animated) f(t, dt);
  scrolls.flat().forEach(s => { if (s.visible) { s.userData.paper.forEach(p => p.rotation.y = t * 2); s.position.y = 1.4 + Math.sin(t * 2 + s.position.x) * 0.15; } });
  if (mode === 'story') {
    scrolls.forEach((arr, zi) => arr.forEach((s, k) => { if (s.visible && !modalOpen && Math.hypot(s.position.x - player.pos.x, s.position.z - player.pos.z) < 1.6) collectScroll(zi, k); }));
  }
  if (mode === 'online') {
    onlineTick();
    for (const e of ON.peers.values()) {
      if (!e.c) continue;
      const p = e.c.root.position, d = p.distanceTo(e.target);
      if (d > 15) p.copy(e.target); else p.lerp(e.target, Math.min(1, dt * 1.6));
      let dr = e.ry - e.c.root.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); e.c.root.rotation.y += dr * Math.min(1, dt * 6);
      if (performance.now() > e.c.lockUntil) e.c.play(d > 0.15 ? (d > 2.5 ? 'Running_A' : 'Walking_A') : 'Idle_A', 0.25);
      e.c.mixer.update(dt);
    }
    ON.lan.forEach(l => { if (l.g.visible) { const b = l.g.children[0]; b.position.y = 1.4 + Math.sin(t * 2 + l.g.position.x) * 0.2; b.rotation.y = t * 1.5; } });
  }
  for (let i = fw.length - 1; i >= 0; i--) { const f = fw[i]; f.life -= dt; const pos = f.p.geometry.attributes.position; f.vel.forEach((v, k) => { v.y -= 6 * dt; pos.array[k * 3] += v.x * dt; pos.array[k * 3 + 1] += v.y * dt; pos.array[k * 3 + 2] += v.z * dt; }); pos.needsUpdate = true; f.p.material.opacity = Math.max(0, f.life / 1.6); if (f.life <= 0) { scene.remove(f.p); fw.splice(i, 1); } }
  updateCamera(dt);
  findNear(); updateHUD();
  renderer.render(scene, camera);
}

// ---------------- menu ----------------
function buildMenu() {
  $('chars').innerHTML = CHARS.map(([m, n]) => `<button data-m="${m}" class="${S.char === m ? 'on' : ''}">${n}</button>`).join('');
  $('chars').querySelectorAll('button').forEach(b => b.onclick = async () => { sfx('click'); S.char = b.dataset.m; save(); buildMenu(); await setPlayerModel(S.char); player.c.play('Waving', 0.2, true); });
  $('pname').value = S.name;
  $('progressTxt').textContent = S.final ? '🏆 Story completed!' : `Story: 💎 ${lanterns()}/5 crystals · 🗑️ ${stars()}/15 bags`;
}
$('pname').addEventListener('input', e => { S.name = e.target.value.trim(); save(); });
$('bReset').onclick = () => { if (confirm('Reset your story progress?')) { const keep = { name: S.name, char: S.char, best: S.best }; S = Object.assign(freshSave(), keep); save(); refreshStory(); buildMenu(); } };
$('bStory').onclick = () => start('story');
$('bOnline').onclick = () => start('online');
$('menuBtn').onclick = () => {
  if (modalOpen) return;
  const btns = [['Continue playing'], ['Main menu', 'alt']]; if (S.final) btns.splice(1, 0, ['🏆 Certificate', 'teal']);
  say('Menu', '#2f8f4f', `Player: <b>${esc(S.name || 'Player')}</b><br>Eco Crystals: ${lanterns()}/5 · Rubbish bags: ${stars()}/15`, btns).then(i => { const lab = btns[i][0]; if (lab.includes('Certificate')) certificate(); if (lab === 'Main menu') toMenu(); });
};

function toMenu() {
  if (mode === 'online') { net.disconnect(); for (const e of ON.peers.values()) if (e.c) scene.remove(e.c.root); ON.peers.clear(); ON.lan.forEach(l => l.g.visible = false); }
  mode = 'menu'; $('menu').classList.remove('hidden'); $('hud').classList.add('hidden'); $('touch').classList.add('hidden');
  player.pos.set(2, 0, 9); refreshStory(); buildMenu(); music.pause(); music.dataset.n = '';
}

async function start(m) {
  if (!S.name) { $('pname').focus(); $('pname').style.borderColor = '#d9433b'; toast('Write your name first ✍️'); return; }
  sfx('click');
  mode = m; $('menu').classList.add('hidden'); $('hud').classList.remove('hidden'); if (isTouch) $('touch').classList.remove('hidden');
  $('board').classList.toggle('hidden', m !== 'online'); $('emotes').classList.toggle('hidden', m !== 'online'); $('stats').classList.toggle('hidden', m !== 'story');
  cam.yaw = 0; player.pos.set(2, 0, 9); player.ry = Math.PI;
  refreshStory();
  if (m === 'story') {
    playMusic('m_story');
    if (!S.intro) {
      await say('Eco Island', '#2f8f4f', `Welcome, <b>${esc(S.name)}</b>! Eco Island was the greenest place in the world… until <b>Captain Smog</b> arrived. 😷<br><br>He covered the island with smoke, threw rubbish everywhere and stole the five <b>Eco Crystals</b>. Now the <b>Great Tree</b> in the centre is dry and dying!`, [['What can I do?']]);
      await say('Eco Island', '#2f8f4f', `Visit the five zones: <b>Whispering Forest, Blue Bay, Recycle City, Sunny Farm and Windy Hills</b>. Talk to each friend, <b>read their story</b> and answer the questions.<br><br>Then pick up the <b>3 rubbish bags</b> in each zone (should / could, must / have to and the zero conditional) to win back the <b>Eco Crystal</b>.<br><br>Follow the golden arrow ⬆️ and the light beam. Good luck, Eco Hero!`, [["Let's go! 🌱"]]);
      S.intro = true; save();
    }
  } else {
    playMusic('m_online');
    setupOnlineObjects(); ON.round = -1;
    $('objT').innerHTML = 'Online Clean-Up'; $('objD').innerHTML = 'Connecting…';
    net.connect(($('pcode').value || '').trim(), me()).then(() => { $('objD').innerHTML = 'Touch the floating plastic bottles to answer questions. Correct answers in a row = more points!'; renderBoard(); });
  }
}

// ---------------- boot ----------------
setProgress(p => { $('lbar').style.width = `${Math.round(p * 100)}%`; });
(async () => {
  await buildWorld();
  await setupStory();
  await setPlayerModel(S.char);
  camera.position.set(0, 5, 20);
  $('loading').classList.add('hidden');
  refreshStory(); buildMenu(); $('menu').classList.remove('hidden');
  loop();
  if (location.search.includes('debug')) window.GQ = { player, cam, get S() { return S; }, ZONES, zoneInfo, refreshStory, save, ON, tick: () => { onlineTick(); findNear(); } };
})();

$('bCred').onclick = () => {
  openModal(`<h2>Credits</h2><div class="bubble" style="font-size:16px">
  <b>Green Quest: Save Eco Island</b> — English game for 7° básico, Unit 4 "Green Issues".<br><br>
  <b>3D models and animations:</b> KayKit by Kay Lousberg (Adventurers, Character Animations, Forest Nature, City Builder Bits, Medieval Hexagon, Resource Bits, Restaurant Bits) — CC0 · kaylousberg.itch.io<br>
  <b>Music:</b> "Lively City", "Battle Theme I", "Malicious Scheme" by Hydrogene — CC0 · hydrogene.itch.io<br>
  <b>Sound effects and jingles:</b> Kenney (Interface Sounds, RPG Audio, Music Jingles) — CC0 · kenney.nl<br>
  <b>Engine:</b> three.js (MIT) · Online: Supabase Realtime</div>
  <div class="foot"><button class="btn" id="crOk">Close</button></div>`);
  $('crOk').onclick = closeModal;
};
