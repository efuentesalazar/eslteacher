// Past Quest – The Memory Thief. Third-person 3D adventure to practise the past simple.
import * as THREE from 'three';
import { loadLibrary, Character, model, LIB, SKINS, HAIRS, HAIR_COLORS } from './chars.js';
import { World, ZONES, zoneAt, SPOTS } from './world.js';
import { CHAPTERS, NPCS, READINGS, LESSONS, SCROLLS, VERB_ES, makeSet, makeQuestion, past, isIrr } from './content.js';
import { UI, modal, closeModal, toast, banner, dialog, dialogVisible, runQuiz, showLesson, showReading, lessonHTML, el, esc } from './ui.js';
import { initAudio, sfx, voice, music, toggleSound, soundOn } from './audio.js';
import { Online } from './online.js';

const $ = s => document.querySelector(s);
const show = (s, on = true) => $(s).classList.toggle('hidden', !on);
const TOUCH = matchMedia('(hover:none)').matches;

/* ---------- renderer ---------- */
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, TOUCH ? 1.5 : 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ec9ff);
scene.fog = new THREE.Fog(0xcfe6ff, 40, 140);
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
const hemi = new THREE.HemisphereLight(0xffffff, 0x557744, 1.5); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d6, 2.4);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 120 });
sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

/* ---------- save ---------- */
const KEY = 'pastquest-6b-v1';
const DEFAULT_LOOK = { sex: 'f', outfit: 'Ranger', alt: false, hair: 'Hair_SimpleParted', hairColor: 0x5a2a0a, skin: 1 };
let SAVE = { name: '', look: { ...DEFAULT_LOOK }, ch: 1, guide: {}, done: {}, read: {}, scrolls: {}, stars: 0, stats: {}, spanish: true };
try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) SAVE = { ...SAVE, ...s }; } catch (e) {}
UI.spanish = SAVE.spanish !== false;
if (SAVE.low === undefined) SAVE.low = TOUCH;
function applyQuality() { sun.castShadow = !SAVE.low; renderer.setPixelRatio(SAVE.low ? 1 : Math.min(devicePixelRatio, 2)); resize(); }
applyQuality();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SAVE)); } catch (e) {} };
function stat(topic, ok) { const s = SAVE.stats[topic] || (SAVE.stats[topic] = [0, 0]); s[1]++; if (ok) s[0]++; }
const TOPIC_OF = q => q._topic;

/* ---------- state ---------- */
let MODE = 'loading';     // loading | title | creator | story | online
let world, player, preview;
const npcs = {};          // id -> {def, char|obj, pos, marker, label}
const scrolls = [];
const crowd = [];
const keys = {};
const cam = { yaw: 0, pitch: 0.35, dist: 6.5, target: new THREE.Vector3() };
const P = { pos: new THREE.Vector3(0, 0, 24), vy: 0, ground: true, face: Math.PI, moving: false, stepT: 0, frozen: false };
let battle = null;
const clock = new THREE.Clock();
let T = 0;

/* ---------- boot ---------- */
(async function boot() {
  try {
    await loadLibrary(p => { $('#loadbar').style.width = Math.round(p * 100) + '%'; });
  } catch (e) {
    $('#loadtxt').textContent = 'Error loading the game. Open it from a web server (not by double-click). / Error al cargar.';
    console.error(e); return;
  }
  world = new World(scene);
  for (let c = 1; c < SAVE.ch; c++) world.openGate(c, true);
  if (SAVE.read[3]) world.setBridge(1); else world.setBridge(countDone(3) / 3 * 0.85);
  spawnNPCs(); spawnCrowd(); spawnScrolls();
  player = new Character(SAVE.look); scene.add(player.root);
  window.PQ = { scene, world, camera, player, SAVE, npcs, P, Online, renderer };
  show('#loading', false);
  goTitle();
  renderer.setAnimationLoop(loop);
})();

/* ---------- NPCs ---------- */
function spawnNPCs() {
  for (const def of NPCS) {
    const [x, z, r] = SPOTS.npc[def.id];
    let obj, char = null;
    if (def.creature) { obj = new THREE.Group(); const m = model(def.creature, 0.45); obj.add(m); }
    else { char = new Character(def.look); obj = char.root; if (def.role === 'boss') obj.scale.setScalar(1.15); }
    obj.position.set(x, 0, z); obj.rotation.y = r;
    scene.add(obj);
    const label = el('div', { class: 'bub name' }, esc(def.name)); $('#bubbles').appendChild(label);
    const mark = el('div', { class: 'mark' }, '!'); $('#bubbles').appendChild(mark);
    npcs[def.id] = { def, char, obj, home: new THREE.Vector3(x, 0, z), rot: r, label, mark, bubble: null };
    world.circle(x, z, 0.6);
  }
}
function npcState(id) {
  const n = npcs[id], d = n.def;
  if (d.role === 'guide' || d.role === 'boss') return SAVE.ch < d.ch ? 'locked' : (!SAVE.guide[d.ch] || (allDone(d.ch) && !SAVE.read[d.ch]) ? 'guide' : SAVE.read[d.ch] ? 'done' : 'idle');
  if (SAVE.ch < d.ch) return 'locked';
  if (SAVE.done[id]) return 'done';
  return SAVE.guide[d.ch] ? 'quest' : 'idle';
}
const villagers = ch => NPCS.filter(n => n.ch === ch && !n.role);
const countDone = ch => villagers(ch).filter(n => SAVE.done[n.id]).length;
const allDone = ch => countDone(ch) === villagers(ch).length;
const guideOf = ch => NPCS.find(n => n.ch === ch && (n.role === 'guide' || n.role === 'boss'));

function spawnCrowd() {
  const looks = [{ sex: 'm', outfit: 'Peasant', hair: 'Hair_Buzzed', hairColor: 0x2a1a0a, skin: 0 }, { sex: 'f', outfit: 'Peasant', alt: true, hair: 'Hair_Long', hairColor: 0xe0b050, skin: 0 },
    { sex: 'm', outfit: 'Ranger', alt: true, hair: 'Hair_SimpleParted', hairColor: 0x111111, skin: 2 }, { sex: 'f', outfit: 'Ranger', hair: 'Hair_Buns', hairColor: 0x5a2a0a, skin: 1 },
    { sex: 'm', outfit: 'Peasant', alt: true, hair: 'Hair_Beard', hairColor: 0x999999, skin: 1 }, { sex: 'f', outfit: 'Peasant', hair: 'Hair_Buns', hairColor: 0xb03020, skin: 2 },
    { sex: 'm', outfit: 'Ranger', hair: 'Hair_Buzzed', hairColor: 0xe0b050, skin: 0 }, { sex: 'f', outfit: 'Ranger', alt: true, hair: 'Hair_BuzzedFemale', hairColor: 0x111111, skin: 2 }];
  looks.forEach((l, i) => {
    const c = new Character(l); const a = i / looks.length * Math.PI * 2;
    c.root.position.set(Math.cos(a) * 6, 0, -245 + Math.sin(a) * 6); scene.add(c.root);
    crowd.push({ c, tgt: null, wait: Math.random() * 3 });
  });
}
function updateCrowd(dt) {
  for (const p of crowd) {
    const pos = p.c.root.position;
    p.c.root.visible = Math.abs(pos.z - P.pos.z) < 60; if (!p.c.root.visible) continue;
    p.c.update(dt);
    if (!p.tgt) { p.wait -= dt; if (p.wait <= 0) { p.tgt = new THREE.Vector3((Math.random() - 0.5) * 22, 0, -245 + (Math.random() - 0.5) * 30); p.c.play('Walk_Loop'); } else continue; }
    const d = p.tgt.clone().sub(pos); d.y = 0; const L = d.length();
    if (L < 0.5) { p.tgt = null; p.wait = 1 + Math.random() * 4; p.c.play(Math.random() < 0.3 ? 'Idle_Talking_Loop' : 'Idle_Loop'); continue; }
    d.multiplyScalar(1 / L); pos.addScaledVector(d, 1.3 * dt); world.collide(pos, 0.35);
    p.c.root.rotation.y = Math.atan2(d.x, d.z);
  }
}

/* ---------- scrolls (verb collectibles) ---------- */
function spawnScrolls() {
  for (const ch in SCROLLS) SCROLLS[ch].forEach((verb, i) => {
    const [x, z] = SPOTS.scrolls[ch][i];
    const g = new THREE.Group(); g.position.set(x, 0, z);
    const m = model('Scroll_1', 1.6); m.position.y = 0.9; g.add(m);
    const glow = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.05, 20), new THREE.MeshBasicMaterial({ color: 0xffe080, transparent: true, opacity: 0.55 }));
    glow.position.y = 0.05; g.add(glow);
    scene.add(g);
    scrolls.push({ verb, ch: +ch, g, m, got: !!SAVE.scrolls[verb] });
    if (SAVE.scrolls[verb]) g.visible = false;
  });
}
function updateScrolls() {
  for (const s of scrolls) {
    if (s.got || !s.g.visible) continue;
    s.m.rotation.y = T * 1.5; s.m.position.y = 0.9 + Math.sin(T * 2 + s.g.position.x) * 0.15;
    if (MODE === 'story' && s.g.position.distanceTo(P.pos) < 1.4) {
      s.got = true; s.g.visible = false; SAVE.scrolls[s.verb] = 1; SAVE.stars += 1; save(); sfx('powerup');
      toast(`📜 <b>${s.verb} → ${past(s.verb)}</b> (${VERB_ES[s.verb] || ''}) · ${isIrr(s.verb) ? 'irregular' : 'regular'} · +1 ⭐`, 4200);
      hud();
    }
  }
}

/* ---------- input ---------- */
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if (MODE !== 'story' && MODE !== 'online') return;
  if (e.code === 'KeyE' || e.code === 'Enter') { if (dialogVisible()) dialog.first?.click(); else if (!UI.open) interact(); }
  if (e.code === 'Space' && !UI.open) jump();
  if (e.code === 'KeyB' && !UI.open && MODE === 'story') openBook();
  if (e.code === 'KeyM' && !UI.open && MODE === 'story') openMap();
  if (e.code === 'Escape' && !UI.open) openPause();
});
addEventListener('keyup', e => { keys[e.code] = false; });
let drag = null;
canvas.addEventListener('pointerdown', e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); initAudio(); });
canvas.addEventListener('pointermove', e => {
  if (!drag || drag.id !== e.pointerId) return;
  cam.yaw -= (e.clientX - drag.x) * 0.006; cam.pitch = THREE.MathUtils.clamp(cam.pitch + (e.clientY - drag.y) * 0.004, 0.05, 1.2);
  drag.x = e.clientX; drag.y = e.clientY;
});
canvas.addEventListener('pointerup', () => drag = null);
canvas.addEventListener('wheel', e => { cam.dist = THREE.MathUtils.clamp(cam.dist + e.deltaY * 0.004, 3, 11); }, { passive: true });
// touch joystick
const stick = { x: 0, y: 0, id: null };
const sEl = $('#stick'), kEl = $('#knob');
sEl.addEventListener('pointerdown', e => { stick.id = e.pointerId; sEl.setPointerCapture(e.pointerId); moveStick(e); initAudio(); });
sEl.addEventListener('pointermove', e => { if (e.pointerId === stick.id) moveStick(e); });
const endStick = () => { stick.id = null; stick.x = stick.y = 0; kEl.style.left = kEl.style.top = '40px'; };
sEl.addEventListener('pointerup', endStick); sEl.addEventListener('pointercancel', endStick);
function moveStick(e) {
  const r = sEl.getBoundingClientRect(); let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  const L = Math.hypot(dx, dy), M = 50; if (L > M) { dx *= M / L; dy *= M / L; }
  stick.x = dx / M; stick.y = -dy / M; kEl.style.left = 40 + dx + 'px'; kEl.style.top = 40 + dy + 'px';
}
$('#t-act').onclick = () => { if (dialogVisible()) dialog.first?.click(); else if (!UI.open) interact(); };
$('#t-jump').onclick = () => jump();
$('#prompt').onclick = () => { if (!UI.open) interact(); };

function jump() { if (P.ground && !UI.open && !P.frozen) { P.vy = 6.5; P.ground = false; sfx('jump', 0.4); player.play('Jump_Loop', 0.1); } }

/* ---------- player update ---------- */
function updatePlayer(dt) {
  let ix = 0, iy = 0;
  if (!UI.open && !P.frozen) {
    if (keys.KeyW || keys.ArrowUp) iy += 1; if (keys.KeyS || keys.ArrowDown) iy -= 1;
    if (keys.KeyA || keys.ArrowLeft) ix -= 1; if (keys.KeyD || keys.ArrowRight) ix += 1;
    ix += stick.x; iy += stick.y;
  }
  const L = Math.hypot(ix, iy);
  const sprint = keys.ShiftLeft || keys.ShiftRight || Math.hypot(stick.x, stick.y) > 0.95;
  P.moving = L > 0.15;
  if (P.moving) {
    ix /= Math.max(1, L); iy /= Math.max(1, L);
    const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
    const dx = fx * iy + rx * ix, dz = fz * iy + rz * ix, dl = Math.hypot(dx, dz) || 1;
    const speed = (sprint ? 7.5 : 4.6) * Math.min(1, L);
    P.pos.x += dx / dl * speed * dt; P.pos.z += dz / dl * speed * dt;
    const want = Math.atan2(dx, dz);
    let d = want - P.face; d = Math.atan2(Math.sin(d), Math.cos(d)); P.face += d * Math.min(1, dt * 12);
    if (P.ground) {
      player.play(sprint ? 'Sprint_Loop' : L < 0.5 ? 'Walk_Loop' : 'Jog_Fwd_Loop', 0.2);
      P.stepT -= dt; if (P.stepT <= 0) { P.stepT = sprint ? 0.28 : 0.36; sfx(Math.random() < 0.5 ? 'step1' : 'step2', 0.18, 0.9 + Math.random() * 0.2); }
    }
  } else if (P.ground && ['Walk_Loop', 'Jog_Fwd_Loop', 'Sprint_Loop', 'Jump_Loop'].includes(player.currentName)) player.play('Idle_Loop', 0.25);
  // gravity
  P.vy -= 18 * dt; P.pos.y += P.vy * dt;
  if (P.pos.y <= 0) { if (!P.ground) { P.ground = true; if (!P.moving) player.play('Idle_Loop', 0.15); } P.pos.y = 0; P.vy = 0; }
  world.collide(P.pos, 0.4);
  player.root.position.copy(P.pos); player.root.rotation.y = P.face;
  player.update(dt);
}

function updateCamera(dt) {
  const tgt = P.pos.clone(); tgt.y += 1.5;
  cam.target.lerp(tgt, 1 - Math.exp(-dt * 10));
  const cp = Math.cos(cam.pitch);
  const off = new THREE.Vector3(Math.sin(cam.yaw) * cp, Math.sin(cam.pitch), Math.cos(cam.yaw) * cp).multiplyScalar(cam.dist);
  camera.position.copy(cam.target).add(off);
  if (camera.position.y < 0.6) camera.position.y = 0.6;
  camera.lookAt(cam.target);
}

/* ---------- ambience ---------- */
const amb = { sky: new THREE.Color(0x8ec9ff), fog: new THREE.Color(0xcfe6ff), near: 40, far: 140, hemi: 1.5, sun: new THREE.Color(0xfff1d6), sunI: 2.4 };
function updateAmbience(dt, z, instant = false) {
  const Z = zoneAt(z), k = instant ? 1 : 1 - Math.exp(-dt * 1.5);
  amb.sky.lerp(new THREE.Color(Z.sky), k); amb.fog.lerp(new THREE.Color(Z.fog), k); amb.sun.lerp(new THREE.Color(Z.sun), k);
  amb.near += (Z.near - amb.near) * k; amb.far += (Z.far - amb.far) * k; amb.hemi += (Z.hemi - amb.hemi) * k; amb.sunI += (Z.sunI - amb.sunI) * k;
  camera.far = Math.min(400, amb.far + 20); camera.updateProjectionMatrix();
  scene.background.copy(amb.sky); scene.fog.color.copy(amb.fog); scene.fog.near = amb.near; scene.fog.far = amb.far;
  hemi.intensity = amb.hemi; sun.color.copy(amb.sun); sun.intensity = amb.sunI;
  sun.position.set(P.pos.x + 18, 30, P.pos.z + 12); sun.target.position.set(P.pos.x, 0, P.pos.z);
  if (MODE === 'story' && !battle) {
    const ch = CHAPTERS[Z.ch - 1];
    if (curZone !== Z.ch) { curZone = Z.ch; music(ch.music); $('#hud-ch').textContent = `Chapter ${ch.id} · ${ch.place}`; if (SAVE.ch >= Z.ch) { banner(`Chapter ${ch.id}`, ch.title); } }
  }
}
let curZone = 0;

/* ---------- markers / labels ---------- */
const v3 = new THREE.Vector3();
function project(pos, h) {
  v3.copy(pos); v3.y += h; v3.project(camera);
  if (v3.z > 1) return null;
  return [(v3.x * 0.5 + 0.5) * innerWidth, (-v3.y * 0.5 + 0.5) * innerHeight];
}
function updateLabels() {
  const storyOn = MODE === 'story';
  for (const id in npcs) {
    const n = npcs[id], d = n.obj.position.distanceTo(P.pos);
    const vis = storyOn && n.obj.visible && d < 30;
    const p = vis ? project(n.obj.position, n.def.creature ? 1.2 : 2.25 * n.obj.scale.y) : null;
    n.label.style.display = p && d < 14 ? '' : 'none';
    const st = storyOn ? npcState(id) : 'locked';
    const sym = st === 'quest' ? '!' : st === 'guide' ? '?' : st === 'done' ? '✔' : '';
    n.mark.style.display = p && sym ? '' : 'none';
    if (p) {
      n.label.style.left = p[0] + 'px'; n.label.style.top = p[1] + 'px';
      n.mark.style.left = p[0] + 'px'; n.mark.style.top = (p[1] - 22) + 'px';
      n.mark.textContent = sym; n.mark.className = 'mark' + (st === 'done' ? ' done' : st === 'guide' ? ' guide' : '');
      if (n.bubble) { n.bubble.style.display = ''; n.bubble.style.left = p[0] + 'px'; n.bubble.style.top = (p[1] - 30) + 'px'; }
    } else if (n.bubble) n.bubble.style.display = 'none';
  }
}
function say(id, text, ms = 6000) {
  const n = npcs[id]; if (n.bubble) n.bubble.remove();
  n.bubble = el('div', { class: 'bub' }, esc(text)); $('#bubbles').appendChild(n.bubble);
  const b = n.bubble; setTimeout(() => { if (n.bubble === b) { b.remove(); n.bubble = null; } }, ms);
}

/* ---------- interaction ---------- */
function nearestNPC() {
  let best = null, bd = 3.2;
  for (const id in npcs) { const n = npcs[id]; if (!n.obj.visible) continue; const d = n.obj.position.distanceTo(P.pos); if (d < bd) { bd = d; best = id; } }
  return best;
}
function updatePrompt() {
  if (MODE !== 'story' || UI.open || battle) { show('#prompt', false); return; }
  const id = nearestNPC();
  if (id) { $('#prompt').innerHTML = `<kbd>${TOUCH ? '💬' : 'E'}</kbd> Talk to ${esc(npcs[id].def.name)}`; show('#prompt'); }
  else show('#prompt', false);
}
function faceEachOther(id) {
  const n = npcs[id]; const d = P.pos.clone().sub(n.obj.position);
  n.obj.rotation.y = Math.atan2(d.x, d.z); P.face = Math.atan2(-d.x, -d.z);
}
async function interact() {
  if (MODE === 'online') return Online.interact();
  const id = nearestNPC(); if (!id || UI.open) return;
  faceEachOther(id);
  const n = npcs[id], d = n.def;
  n.char && n.char.play('Idle_Talking_Loop');
  try {
    if (SAVE.ch < d.ch) await dialog(d.name, 'Hello! Come back later, explorer.', 'Vuelve más tarde.');
    else if (d.role === 'guide') await talkGuide(d);
    else if (d.role === 'boss') await talkBoss(d);
    else await talkVillager(d);
  } finally { if (n.char && !n.dancing) n.char.play('Idle_Loop'); hud(); }
}

async function talkGuide(d) {
  const ch = CHAPTERS[d.ch - 1];
  if (!SAVE.guide[d.ch]) {
    await dialog(d.name, d.hello, '');
    await dialog(d.name, ch.intro, ch.introEs);
    await dialog(d.name, `Here is a little lesson about <b>${LESSONS[ch.topic].title}</b>. Read it carefully!`, 'Lee esta pequeña lección con atención.');
    await showLesson(ch.topic);
    SAVE.guide[d.ch] = 1; save();
    const names = villagers(d.ch).map(v => v.name).join(', ');
    await dialog(d.name, `Now, please help these people: <b>${esc(names)}</b>. Look for the <b style="color:#e0a000">!</b> above their heads.`, 'Ayuda a las personas que tienen un signo ! sobre su cabeza.');
    return;
  }
  if (!allDone(d.ch)) {
    const r = await dialog(d.name, `You restored <b>${countDone(d.ch)} of ${villagers(d.ch).length}</b> memories. Keep going!`, 'Sigue ayudando a la gente.', [{ label: '📘 Review the lesson', cls: 'blue', value: 'L' }, { label: 'OK ▶', value: 'ok' }]);
    if (r === 'L') await showLesson(ch.topic);
    return;
  }
  if (!SAVE.read[d.ch]) {
    await dialog(d.name, `Wonderful! Everybody remembers now. I found this… <b>${esc(READINGS[d.ch].title)}</b>. Read it and answer the questions.`, 'Lee el texto y responde las preguntas (necesitas 3 correctas).');
    const r = await showReading(READINGS[d.ch], SAVE.name);
    r.results.forEach(ok => stat('read', ok));
    closeModal();
    if (r.ok >= 3) { SAVE.stars += r.ok; save(); await completeChapter(d.ch); }
    else { sfx('jingle_lose'); await dialog(d.name, `You got ${r.ok}/${r.total}. Let's read it again, slowly. You can do it!`, 'Obtuviste menos de 3. Léelo de nuevo con calma, ¡tú puedes!'); }
    return;
  }
  await dialog(d.name, 'Thank you, explorer! The road to the north is open.', 'El camino al norte está abierto.', [{ label: 'OK ▶' }]);
}

async function talkVillager(d) {
  const n = npcs[d.id];
  if (!SAVE.guide[d.ch]) { const g = guideOf(d.ch); await dialog(d.name, `I'm so confused… Please talk to <b>${esc(g.name)}</b> first.`, `Habla primero con ${g.name}.`); return; }
  if (SAVE.done[d.id]) {
    const r = await dialog(d.name, esc(d.memory), '', [{ label: '🔁 Practise again', cls: 'blue', value: 'p' }, { label: 'Bye! 👋', value: 'b' }]);
    if (r === 'p') await challenge(d, true);
    return;
  }
  const r = await dialog(d.name, esc(d.hello), 'Responde 4 preguntas. Necesitas 3 correctas para devolverle su memoria.', [{ label: 'I can help! ▶', value: 'y' }, { label: 'Not now', cls: 'ghost', value: 'n' }]);
  if (r === 'y') await challenge(d, false);
}

async function challenge(d, practice) {
  const n = npcs[d.id];
  const qs = makeSet(d.topic, 4); qs.forEach(q => q._topic = d.topic);
  const res = await runQuiz(qs, { title: `${d.name} · ${LESSONS[d.topic].title}`, onAnswer: (ok, q) => stat(q._topic, ok) });
  closeModal();
  if (res.ok >= 3) {
    SAVE.stars += res.ok;
    if (!practice) {
      SAVE.done[d.id] = 1; sfx('coins'); sfx('jingle_win', 0.6); voice('mission_completed');
      n.dancing = true; n.char ? n.char.play('Dance_Loop') : null; setTimeout(() => { n.dancing = false; n.char && n.char.play('Idle_Loop'); }, 6000);
      say(d.id, d.memory, 7000);
      toast(`✨ Memory restored! +${res.ok} ⭐`);
      if (d.ch === 3) world.setBridge(countDone(3) / 3 * 0.85);
      if (allDone(d.ch)) setTimeout(() => toast(`All memories restored! Go back to <b>${esc(guideOf(d.ch).name)}</b>.`, 5000), 1500);
    } else { toast(`Great practice! +${res.ok} ⭐`); sfx('coins'); }
    save();
  } else {
    sfx('jingle_lose');
    await dialog(d.name, `You got ${res.ok}/4. Oh no, I still can't remember… Try again! Tip: open the 📘 Book to review.`, 'Necesitas 3 de 4. Revisa el libro 📘 y vuelve a intentarlo.');
  }
  hud();
}

async function completeChapter(ch) {
  SAVE.read[ch] = 1; SAVE.ch = Math.max(SAVE.ch, ch + 1); save();
  sfx('jingle_chapter'); voice('level_up');
  if (ch === 3) world.setBridge(1);
  world.openGate(ch);
  if (ch === 6) return ending();
  const next = CHAPTERS[ch];
  await new Promise(res => {
    const box = modal(`<h2>🏆 Chapter ${ch} complete!</h2><p style="font-size:20px">You restored all the memories in <b>${esc(CHAPTERS[ch - 1].place)}</b>.</p>
      <p style="font-size:18px">⭐ Stars: <b>${SAVE.stars}</b> · 📜 Scrolls: <b>${Object.keys(SAVE.scrolls).length}</b>/36</p>
      <div class="es">${ch === 3 ? '¡El puente está reparado! ' : '¡La niebla mágica desapareció! '}Siguiente: <b>Chapter ${next.id} – ${esc(next.title)}</b>. Camina hacia el norte ⬆.</div>
      <div class="row"><button class="btn" id="cok">Continue ▶</button></div>`, { close: false });
    box.querySelector('#cok').onclick = () => { sfx('click'); closeModal(); res(); };
  });
  hud();
}

/* ---------- boss battle ---------- */
async function talkBoss(d) {
  if (SAVE.done.mortimer) {
    if (!SAVE.read[6]) {
      await dialog('Mortimer', 'Please… read my letter. I want to say something.', 'Lee la carta de Mortimer.');
      const r = await showReading(READINGS[6], SAVE.name); closeModal();
      r.results.forEach(ok => stat('read', ok));
      if (r.ok >= 3) { SAVE.stars += r.ok; await completeChapter(6); }
      else await dialog('Mortimer', `You got ${r.ok}/${r.total}. Please read it again…`, 'Léelo otra vez.');
    } else await dialog('Mortimer', 'Thank you for being my friend. See you in Willowbrook!', '');
    return;
  }
  if (!SAVE.guide[6]) { SAVE.guide[6] = 1; save(); await showLesson('mix'); }
  await dialog(d.name, d.hello, '¡Responde bien para vencer a Mortimer! Cada error te quita un corazón.', [{ label: '⚔️ Battle!', cls: 'purple' }]);
  await bossBattle();
}
async function bossBattle() {
  const m = npcs.mortimer;
  battle = { hp: 8, max: 8, hearts: 5 };
  music('boss'); voice('ready');
  show('#hearts'); show('#bossbar');
  const draw = () => { $('#hearts').textContent = '❤️'.repeat(battle.hearts) + '🖤'.repeat(5 - battle.hearts); $('#bosshp').style.width = (battle.hp / battle.max * 100) + '%'; };
  draw();
  P.frozen = true;
  // stand in front of Mortimer
  P.pos.set(m.obj.position.x, 0, m.obj.position.z + 6); P.face = Math.PI; m.obj.rotation.y = 0;
  cam.yaw = 0.6; cam.pitch = 0.3; cam.dist = 8;
  while (battle.hp > 0 && battle.hearts > 0) {
    const q = makeQuestion('mix');
    const r = await runQuiz([q], { title: `⚔️ Battle · Mortimer ${battle.hp}/${battle.max} ❤️ ${battle.hearts}`, topic: 'mix', fast: true, voice: false });
    stat('boss', r.results[0]);
    closeModal();
    await spellShot(r.results[0]);
    if (r.results[0]) battle.hp--; else battle.hearts--;
    draw();
  }
  P.frozen = false;
  const won = battle.hp <= 0;
  show('#hearts', false); show('#bossbar', false);
  battle = null; curZone = 0;
  if (won) {
    sfx('jingle_win'); voice('you_win');
    m.char.play('Death01', 0.2, { once: true, then: 'Sitting_Idle_Loop' });
    SAVE.done.mortimer = 1; SAVE.stars += 5; save();
    await new Promise(r => setTimeout(r, 2200));
    await dialog('Mortimer', 'Oh… you are so strong. I… I am sorry. Please, read my letter.', 'Mortimer está arrepentido. Lee su carta.');
    await talkBoss(npcs.mortimer.def);
  } else {
    sfx('jingle_lose');
    await dialog('Mortimer', 'Ha ha ha! You need more practice! Come back when you are ready.', 'Perdiste todos tus corazones. Repasa el libro 📘 y vuelve a intentarlo.');
  }
  hud();
}
function spellShot(good) {
  return new Promise(res => {
    const m = npcs.mortimer;
    const from = good ? P.pos.clone() : m.obj.position.clone(), to = good ? m.obj.position.clone() : P.pos.clone();
    from.y = to.y = 1.4;
    (good ? player : m.char).play('Spell_Simple_Shoot', 0.1, { once: true });
    sfx('magic');
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), new THREE.MeshBasicMaterial({ color: good ? 0x60e0ff : 0xc060ff }));
    const light = new THREE.PointLight(good ? 0x60e0ff : 0xc060ff, 10, 8); ball.add(light);
    ball.position.copy(from); scene.add(ball);
    const t0 = T + 0.35;
    const tick = () => {
      const k = Math.min(1, Math.max(0, (T - t0) / 0.5));
      ball.position.lerpVectors(from, to, k); ball.position.y += Math.sin(k * Math.PI) * 1.2;
      if (k < 1) requestAnimationFrame(tick);
      else { scene.remove(ball); (good ? m.char : player).play('Hit_Chest', 0.05, { once: true }); sfx(good ? 'coins' : 'wrong', 0.6); setTimeout(res, 700); }
    };
    tick();
  });
}

async function ending() {
  music('ending'); voice('congratulations');
  // everybody celebrates around the fountain
  const ids = Object.keys(npcs).filter(id => npcs[id].char);
  ids.forEach((id, i) => {
    const a = i / ids.length * Math.PI * 2, n = npcs[id];
    n.obj.position.set(Math.cos(a) * 6.5, 0, Math.sin(a) * 6.5); n.obj.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
    n.char.play('Dance_Loop'); n.dancing = true;
  });
  if (npcs.mortimer.char) { const old = npcs.mortimer; scene.remove(old.obj); const c = new Character({ ...old.def.look, tint: null }); c.root.position.copy(old.obj.position); c.root.rotation.y = old.obj.rotation.y; scene.add(c.root); c.play('Dance_Loop'); old.char = c; old.obj = c.root; }
  P.pos.set(0, 0, 9); P.face = Math.PI; cam.yaw = 0; curZone = 1;
  await new Promise(res => {
    const box = modal(`<h2>🎉 THE END – You saved Willowbrook!</h2>
      <p style="font-size:19px">Thanks to you, everybody remembers yesterday again. Mortimer learned that friends are more important than magic, and now he lives in the village.</p>
      <div class="es">¡Felicitaciones, ${esc(SAVE.name || 'explorer')}! Completaste Past Quest. Puedes seguir explorando, juntar los pergaminos que falten o practicar con los aldeanos.</div>
      <p style="font-size:18px">⭐ Total stars: <b>${SAVE.stars}</b> · 📜 Scrolls: <b>${Object.keys(SAVE.scrolls).length}/36</b></p>
      ${progressHTML()}
      <div class="row"><button class="btn" id="eok">Celebrate! 🎶</button></div>`, { close: false });
    box.querySelector('#eok').onclick = () => { closeModal(); res(); };
  });
  banner('Past Quest', 'The End');
}

/* ---------- HUD ---------- */
function objective() {
  if (MODE !== 'story') return '';
  if (battle) return 'Answer correctly to defeat Mortimer!';
  const c = Math.min(SAVE.ch, 6), g = guideOf(c), ch = CHAPTERS[c - 1];
  if (SAVE.read[6]) return '🎉 You finished the story! Explore, collect scrolls and practise.';
  const zc = zoneAt(P.pos.z).ch;
  if (zc < c) return `Go north ⬆ to <b>${esc(ch.place)}</b> (Chapter ${c}).`;
  if (c === 6) return SAVE.done.mortimer ? 'Talk to <b>Mortimer</b> again.' : 'Face <b>Mortimer, the Memory Thief</b>, in front of the tower!';
  if (!SAVE.guide[c]) return `Talk to <b>${esc(g.name)}</b> <span style="color:#4a8ef0">?</span>`;
  if (!allDone(c)) return `Help the people with <b style="color:#e0a000">!</b> — memories: <b>${countDone(c)}/${villagers(c).length}</b>`;
  return `Go back to <b>${esc(g.name)}</b> and read <b>“${esc(READINGS[c].title)}”</b>.`;
}
function hud() {
  $('#hud-stars').textContent = SAVE.stars;
  $('#hud-scrolls').textContent = Object.keys(SAVE.scrolls).length + '/36';
  $('#hud-obj').innerHTML = objective();
  $('#btn-sound').textContent = soundOn() ? '🔊' : '🔇';
}

/* ---------- menus ---------- */
function setMode(m) {
  MODE = m;
  show('#title', m === 'title'); show('#creator', m === 'creator');
  show('#hud', m === 'story' || m === 'online'); show('#touch', TOUCH && (m === 'story' || m === 'online'));
  show('#online-hud', m === 'online');
  $('#hud-right').querySelectorAll('[data-act=book],[data-act=map]').forEach(b => b.style.display = m === 'story' ? '' : 'none');
  $('#hud-right').querySelectorAll('.pill').forEach(b => b.style.display = m === 'story' ? '' : 'none');
  player.root.visible = m === 'story' || m === 'online';
  for (const id in npcs) npcs[id].obj.visible = m !== 'online';
  for (const s of scrolls) s.g.visible = m !== 'online' && !s.got;
  if (m !== 'story' && m !== 'online') { show('#prompt', false); }
}
function goTitle() {
  closeModal(); show('#dialog', false); UI.open = false;
  setMode('title'); music('menu');
  updateAmbience(0, 0, true);
}
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  initAudio(); sfx('click');
  const act = a.dataset.act;
  if (act === 'story') { if (!SAVE.name) openCreator('story'); else startStory(); }
  if (act === 'online') { if (!SAVE.name) openCreator('online'); else startOnline(); }
  if (act === 'avatar') openCreator('title');
  if (act === 'teacher') teacherGuide();
  if (act === 'credits') credits();
  if (act === 'back') goTitle();
  if (act === 'book') openBook();
  if (act === 'map') openMap();
  if (act === 'pause') openPause();
  if (act === 'sound') { toggleSound(); hud(); }
});

function startStory() {
  setMode('story');
  const c = Math.min(SAVE.ch, 6);
  const sp = SAVE.pos && zoneAt(SAVE.pos[1]).ch <= SAVE.ch ? SAVE.pos : SPOTS.spawn[c];
  P.pos.set(sp[0], 0, sp[1]); P.face = Math.PI; cam.yaw = 0; cam.pitch = 0.35; cam.dist = 6.5; cam.target.copy(P.pos);
  curZone = 0; updateAmbience(0, P.pos.z, true);
  hud();
  if (!SAVE.guide[1]) setTimeout(() => toast('Welcome! Walk to <b>Grandma Rose</b> and press <b>E</b> to talk.<br><small>Camina hacia la abuela Rose y presiona E para hablar.</small>', 6000), 4500);
}
async function startOnline() {
  setMode('online');
  P.pos.set(0, 0, 10); P.face = Math.PI; cam.yaw = 0; cam.target.copy(P.pos);
  updateAmbience(0, 0, true);
  music('online');
  $('#hud-ch').textContent = '🌐 Online'; $('#hud-obj').innerHTML = '';
  Online.open({ scene, world, camera, P, cam, player, SAVE, Character, setMode, goTitle, hud, project, stat, save });
}

/* ---------- avatar creator ---------- */
let creatorNext = 'title';
function openCreator(next) {
  creatorNext = next; setMode('creator'); music('menu');
  const L = { ...DEFAULT_LOOK, ...SAVE.look };
  $('#cr-name').value = SAVE.name || '';
  const chips = (sel, items, key, fmt) => {
    const box = $(sel); box.innerHTML = '';
    items.forEach(([v, label, color]) => {
      const b = el('button', { class: 'chip' + (L[key] === v ? ' on' : '') }, label || '');
      if (color !== undefined) b.style.background = color;
      b.onclick = () => { L[key] = v; sfx('select'); [...box.children].forEach(c => c.classList.remove('on')); b.classList.add('on'); rebuild(); };
      box.appendChild(b);
    });
  };
  chips('#cr-sex', [['f', 'Girl'], ['m', 'Boy']], 'sex');
  chips('#cr-outfit', [['Ranger', '🏹 Ranger'], ['Peasant', '🌾 Villager']], 'outfit');
  chips('#cr-alt', [[false, 'Colour 1'], [true, 'Colour 2']], 'alt');
  chips('#cr-hair', HAIRS.map(h => [h, h.replace('Hair_', '').replace('BuzzedFemale', 'Short').replace('SimpleParted', 'Parted').replace('none', 'Bald')]), 'hair');
  chips('#cr-hc', HAIR_COLORS.map(c => [c, '', '#' + c.toString(16).padStart(6, '0')]), 'hairColor');
  chips('#cr-skin', SKINS.map((s, i) => [i, '', ['#f2c9a8', '#c98e62', '#7a4a2a'][i]]), 'skin');
  const rebuild = () => {
    if (preview) scene.remove(preview.root);
    preview = new Character(L); preview.root.position.set(0, 0, 16); preview.root.rotation.y = 0.4; scene.add(preview.root);
    preview.play(Math.random() < 0.5 ? 'Idle_Loop' : 'Idle_Talking_Loop');
  };
  rebuild();
  $('#cr-ok').onclick = () => {
    const name = $('#cr-name').value.trim();
    if (!name) { toast('Write your name! / ¡Escribe tu nombre!'); $('#cr-name').focus(); return; }
    SAVE.name = name.slice(0, 14); SAVE.look = L; save();
    scene.remove(player.root); player = new Character(L); scene.add(player.root); window.PQ.player = player;
    scene.remove(preview.root); preview = null; sfx('powerup');
    if (creatorNext === 'story') startStory(); else if (creatorNext === 'online') startOnline(); else goTitle();
  };
}

function openBook(tab = 'grammar') {
  const unlocked = CHAPTERS.filter(c => SAVE.ch >= c.id || SAVE.guide[c.id]);
  const box = modal(`<h2>📘 My Book</h2><div class="tabs"><button data-t="grammar">Grammar</button><button data-t="verbs">Verb Book</button><button data-t="progress">My progress</button></div><div id="bk"></div>`);
  sfx('book');
  const render = t => {
    box.querySelectorAll('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t));
    const bk = box.querySelector('#bk');
    if (t === 'grammar') bk.innerHTML = unlocked.map(c => lessonHTML(c.topic)).join('<hr>');
    if (t === 'verbs') {
      const all = Object.values(SCROLLS).flat();
      bk.innerHTML = `<div class="es">Junta los 📜 pergaminos del mundo para completar tu libro de verbos. Tienes ${Object.keys(SAVE.scrolls).length}/36.</div><div class="verbs">${all.map(v => SAVE.scrolls[v] ? `<div><b>${v} → ${past(v)}</b>${VERB_ES[v] || ''} · ${isIrr(v) ? 'irregular' : 'regular'}</div>` : `<div class="lock"><b>???</b>Chapter ${Object.keys(SCROLLS).find(k => SCROLLS[k].includes(v))}</div>`).join('')}</div>`;
    }
    if (t === 'progress') bk.innerHTML = progressHTML();
    box.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { sfx('page'); render(b.dataset.t); });
  };
  render(tab);
}
function progressHTML() {
  const names = { reg: 'Regular verbs', irr: 'Irregular verbs', neg: 'Negative', int: 'Questions', adj: 'Adjectives & was/were', read: 'Reading', boss: 'Final battle' };
  return `<h3>My progress</h3>` + Object.entries(names).map(([k, n]) => {
    const s = SAVE.stats[k] || [0, 0]; const pct = s[1] ? Math.round(s[0] / s[1] * 100) : 0;
    return `<div class="stat"><span>${n}</span><div><i style="width:${pct}%"></i></div><b>${s[1] ? pct + '%' : '–'}</b><small>(${s[0]}/${s[1]})</small></div>`;
  }).join('');
}
function openMap() {
  const box = modal(`<h2>🗺️ Map · Fast travel</h2><div class="maplist">${CHAPTERS.map(c => {
    const st = SAVE.read[c.id] ? '✔ complete' : SAVE.ch >= c.id ? '▶ current' : '🔒 locked';
    return `<button data-c="${c.id}" ${SAVE.ch >= c.id ? '' : 'disabled'}><span><b>${c.id}. ${esc(c.title)}</b> <small>${esc(c.place)} · ${c.adj.join(', ')}</small></span><span class="tag">${st}</span></button>`;
  }).join('')}</div>`);
  box.querySelectorAll('[data-c]').forEach(b => b.onclick = () => {
    const c = +b.dataset.c, sp = SPOTS.spawn[c]; P.pos.set(sp[0], 0, sp[1]); P.face = Math.PI; cam.yaw = 0; cam.target.copy(P.pos); curZone = 0;
    sfx('magic'); closeModal(); hud();
  });
}
function openPause() {
  if (MODE === 'online') return Online.menu();
  const box = modal(`<h2>☰ Menu</h2><div class="maplist">
    <button id="p-res">▶ Resume / Continuar</button>
    <button id="p-es">🇨🇱 Spanish help: <b>${UI.spanish ? 'ON' : 'OFF'}</b></button>
    <button id="p-gq">⚙️ Graphics: <b>${SAVE.low ? 'LOW (fast)' : 'HIGH'}</b></button>
    <button id="p-av">🧑 Change my explorer</button>
    <button id="p-ti">🏠 Title screen</button>
    <button id="p-rs" style="color:#c03030">🗑️ Reset my progress</button></div>`);
  box.querySelector('#p-res').onclick = () => closeModal();
  box.querySelector('#p-es').onclick = () => { UI.spanish = !UI.spanish; SAVE.spanish = UI.spanish; save(); closeModal(); openPause(); };
  box.querySelector('#p-gq').onclick = () => { SAVE.low = !SAVE.low; save(); applyQuality(); closeModal(); openPause(); };
  box.querySelector('#p-av').onclick = () => { closeModal(); openCreator('story'); };
  box.querySelector('#p-ti').onclick = () => { SAVE.pos = [P.pos.x, P.pos.z]; save(); goTitle(); };
  box.querySelector('#p-rs').onclick = () => { if (confirm('Delete all progress? / ¿Borrar todo el progreso?')) { localStorage.removeItem(KEY); location.reload(); } };
}
function teacherGuide() {
  modal(`<h2>🍎 Guía docente</h2>
  <p><b>Past Quest</b> es una aventura 3D en tercera persona para 6° básico. El estudiante recorre 6 capítulos y devuelve los recuerdos de "ayer" a los aldeanos respondiendo preguntas.</p>
  <table class="results"><tr><th>Capítulo</th><th>Contenido</th><th>Lectura</th></tr>
  ${CHAPTERS.map(c => `<tr><td>${c.id}. ${esc(c.title)}</td><td>${esc(LESSONS[c.topic].title)}</td><td>${esc(READINGS[c.id].title)}</td></tr>`).join('')}</table>
  <h3>Cómo funciona</h3>
  <ul><li>Cada capítulo: guía (lección breve en español) → 3–4 personajes con 4 preguntas (aprueba con 3) → lectura con 5 preguntas (aprueba con 3) → se abre el siguiente lugar.</li>
  <li>Tipos de pregunta: alternativas, completar escribiendo, ordenar palabras, verdadero/falso, regular/irregular.</li>
  <li>Los adjetivos para describir lugares aparecen en todo el juego (cada zona tiene sus adjetivos) y se trabajan a fondo en el capítulo 5 con was/were.</li>
  <li>Pergaminos 📜: 36 verbos para coleccionar (Verb Book). El progreso se guarda en el navegador de cada equipo. En "📘 Book → My progress" se ve el % de logro por contenido.</li>
  <li>Capítulo 6: batalla final con preguntas mezcladas (5 corazones).</li></ul>
  <h3>Modo en línea (clase)</h3>
  <ul><li>El profesor/a crea una sala y comparte el código de 4 letras. Puede jugar o solo mirar la tabla ("Teacher screen", ideal para proyectar).</li>
  <li>Los estudiantes entran con su nombre y el código. Todos aparecen en la aldea y compiten por los cristales de memoria ✨: cada cristal es una pregunta.</li>
  <li>El profesor elige contenido y duración. Al final se muestra el podio y se puede descargar un CSV con los resultados por estudiante.</li></ul>
  <p><small>Controles: WASD/flechas, Shift correr, Espacio saltar, E hablar, arrastrar el mouse para mover la cámara. En tablet/celular aparece un joystick.</small></p>`);
}
function credits() {
  modal(`<h2>Credits</h2><p>Game design & code: made with Claude for Colegio Salesianos.</p>
  <ul><li>3D characters, animations, village, nature and props: <b>Quaternius</b> (CC0) – quaternius.com</li>
  <li>UI sounds, RPG sounds, voice-over, jingles: <b>Kenney</b> (CC0) – kenney.nl</li>
  <li>Music: <b>Hydrogene</b> "High Quality 16-bit RPG Music", <b>Blue Lava</b> "Melodic Autumn", <b>CoMiGo</b> "Music Loops", <b>rosko vair</b> "Cinematic Piano BGM" (all CC0)</li>
  <li>Engine: three.js · Online: Supabase Realtime</li></ul>`);
}

/* ---------- main loop ---------- */
function loop() {
  const dt = Math.min(clock.getDelta(), 0.05); T += dt;
  if (!world) return;
  world.update(T, dt);
  if (MODE === 'title') {
    const a = T * 0.05; camera.position.set(Math.sin(a) * 26, 11, Math.cos(a) * 26); camera.lookAt(0, 2, -4);
    P.pos.set(0, 0, 0); updateAmbience(dt, 0);
  } else if (MODE === 'creator') {
    if (preview) { preview.update(dt); preview.root.rotation.y += dt * 0.4; }
    const w = innerWidth < 800; camera.position.set(w ? 0 : 1.1, 1.3, w ? 21 : 19.6); camera.lookAt(w ? 0 : 1.1, w ? 0.6 : 1.0, 16);
    P.pos.set(0, 0, 16); updateAmbience(dt, 16);
  } else if (MODE === 'story' || MODE === 'online') {
    updatePlayer(dt); updateCamera(dt); updateAmbience(dt, P.pos.z);
    if (MODE === 'online') Online.update(dt, T);
  }
  if (MODE !== 'online' && MODE !== 'loading') {
    for (const id in npcs) { const n = npcs[id]; const near = n.obj.position.distanceTo(MODE === 'title' ? camera.position : P.pos) < 55; n.obj.visible = near && MODE !== 'online'; if (near) { n.char ? n.char.update(dt) : (n.obj.children[0].position.y = Math.abs(Math.sin(T * 3)) * 0.15); } }
  }
  if (MODE === 'story') {
    updateCrowd(dt); updateScrolls(); updatePrompt();
    if (Math.floor(T * 2) !== Math.floor((T - dt) * 2)) { $('#hud-obj').innerHTML = objective(); if (Math.floor(T) % 10 === 0) { SAVE.pos = [P.pos.x, P.pos.z]; save(); } }
  }
  updateLabels();
  renderer.render(scene, camera);
}
