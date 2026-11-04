// Online mode: a class room with a 4-letter code (Supabase Realtime broadcast + presence).
// The host (usually the teacher) owns the game state: crystals, scores and the timer.
// Players walk around Willowbrook and touch memory crystals; each crystal is one question.
import * as THREE from 'three';
import { makeQuestion } from './content.js';
import { modal, closeModal, toast, runQuiz, el, esc, UI } from './ui.js';
import { sfx, voice, music } from './audio.js';

const SUPA_URL = 'https://tlihbmgokuhvppbchvrz.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaWhibWdva3VodnBwYmNodnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTMyMDAsImV4cCI6MjEwODY2OTIwMH0.ZHA6-G0S_iqGxdnPXSB_nOIoS67G2pxSYbaGcNfvLQw';
const TOPICS = { all: 'Everything / Todo', reg: 'Regular verbs', irr: 'Irregular verbs', neg: 'Negative', int: 'Questions', adj: 'Adjectives + was/were' };
const TOPIC_COL = { reg: 0x40c0ff, irr: 0xff70b0, neg: 0xff9040, int: 0x70e070, adj: 0xffd040 };
const $ = s => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 10);
const N_ORBS = 14;

let C = null;            // context from main
let sb = null, ch = null;
const S = {
  me: uid(), code: '', host: false, play: true, phase: 'off',    // off | lobby | game | end
  topic: 'all', dur: 300, endAt: 0, players: {}, remote: new Map(), orbs: [], orbMesh: new Map(),
  scores: {}, pending: null, cooldown: {}, asking: false, sendT: 0, hbT: 0, last: '', arena: null, spectator: false,
};

function send(event, payload) {
  if (!ch) return;
  ch.send({ type: 'broadcast', event, payload }).catch(() => {});
  if (S.host && ['claim', 'ans', 'hello'].includes(event)) hostHandle(event, payload); // host also handles its own requests
}

/* ---------- lobby ---------- */
function lobbyStart() {
  const box = modal(`<h2>🌐 Online Mode</h2>
    <div class="es">Juega con tu curso en tiempo real. El profesor/a crea la sala y comparte el código.</div>
    <h3>Join a room / Unirme</h3>
    <div class="row" style="justify-content:flex-start"><input id="on-code" maxlength="4" placeholder="CODE" style="font-size:28px;width:160px;text-transform:uppercase;text-align:center;letter-spacing:6px;border-radius:12px;border:3px solid var(--line);padding:6px">
    <button class="btn blue" id="on-join">Join ▶</button></div>
    <h3>Create a room / Crear sala <small>(teacher)</small></h3>
    <div class="opt"><span>Content</span><div class="chips" id="on-topic">${Object.entries(TOPICS).map(([k, v]) => `<button class="chip${k === 'all' ? ' on' : ''}" data-k="${k}">${v}</button>`).join('')}</div></div>
    <div class="opt"><span>Time</span><div class="chips" id="on-dur">${[3, 5, 8].map(m => `<button class="chip${m === 5 ? ' on' : ''}" data-k="${m * 60}">${m} min</button>`).join('')}</div></div>
    <label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="on-play" style="width:auto;margin:0"> I want to play too / Quiero jugar (si no, verás la tabla del curso)</label>
    <div class="row"><button class="btn ghost" id="on-back">← Back</button><button class="btn purple" id="on-create">Create room ✨</button></div>`, { close: false });
  const pickChip = (sel, key) => box.querySelectorAll(sel + ' .chip').forEach(b => b.onclick = () => { box.querySelectorAll(sel + ' .chip').forEach(c => c.classList.remove('on')); b.classList.add('on'); S[key] = key === 'dur' ? +b.dataset.k : b.dataset.k; sfx('select'); });
  pickChip('#on-topic', 'topic'); pickChip('#on-dur', 'dur');
  const ci = box.querySelector('#on-code'); ci.onkeydown = e => { e.stopPropagation(); if (e.key === 'Enter') box.querySelector('#on-join').click(); };
  box.querySelector('#on-back').onclick = () => leave();
  box.querySelector('#on-join').onclick = () => {
    const code = ci.value.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (code.length !== 4) { toast('The code has 4 letters. / El código tiene 4 letras.'); return; }
    connect(code, false, true);
  };
  box.querySelector('#on-create').onclick = () => {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; let code = ''; for (let i = 0; i < 4; i++) code += A[Math.floor(Math.random() * A.length)];
    connect(code, true, box.querySelector('#on-play').checked);
  };
}

function connect(code, host, play) {
  $('#hud-ch').textContent = '🌐 Room ' + code;
  if (typeof supabase === 'undefined') { toast('No internet connection to the online server. / Sin conexión.'); return; }
  S.code = code; S.host = host; S.play = play; S.spectator = host && !play; S.phase = 'lobby'; S.scores = {}; S.players = {};
  try {
    if (!sb) sb = supabase.createClient(SUPA_URL, SUPA_ANON, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { params: { eventsPerSecond: 20 } } });
    ch = sb.channel('pq6-' + code, { config: { broadcast: { self: false }, presence: { key: S.me } } });
  } catch (e) { toast('Could not connect. / No se pudo conectar.'); return; }
  for (const ev of ['p', 'start', 'orbs', 'claim', 'ans', 'scores', 'end', 'hello', 'react']) ch.on('broadcast', { event: ev }, m => { try { onMsg(ev, m.payload || {}); } catch (e) { console.warn(e); } });
  ch.on('presence', { event: 'sync' }, () => { S.players = {}; const st = ch.presenceState(); for (const k in st) S.players[k] = st[k][0]; renderLobby(); pruneRemote(); });
  ch.on('presence', { event: 'join' }, ({ key }) => { if (S.host && S.phase === 'game') setTimeout(() => sendState(), 400); });
  ch.subscribe(async status => {
    if (status === 'SUBSCRIBED') {
      await ch.track({ name: C.SAVE.name, look: C.SAVE.look, host: S.host, play: S.play });
      if (!S.host) send('hello', { id: S.me });
      renderLobby();
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') toast('Connection problem… retrying. / Problema de conexión…');
  });
  renderLobby();
}

function renderLobby() {
  if (S.phase !== 'lobby') return;
  const list = Object.entries(S.players).filter(([, p]) => p.play || !p.host).map(([, p]) => `<span>${p.host ? '👑 ' : ''}${esc(p.name)}</span>`).join('') || '<small>Waiting for players… / Esperando jugadores…</small>';
  const n = Object.values(S.players).filter(p => p.play || !p.host).length;
  const box = modal(`<h2>🌐 Room / Sala</h2>
    <div class="code">${S.code}</div>
    <div class="es" style="text-align:center">${S.host ? 'Comparte este código con tu curso. Cuando estén todos, presiona <b>Start</b>.' : 'Esperando que el profesor/a inicie el juego… Mientras tanto, ¡camina por la aldea!'}</div>
    <h3>Players (${n})</h3><div class="players">${list}</div>
    ${S.host ? `<p>Content: <b>${TOPICS[S.topic]}</b> · Time: <b>${S.dur / 60} min</b></p>` : ''}
    <div class="row"><button class="btn ghost" id="lb-leave">Leave</button>${S.host ? '<button class="btn" id="lb-start">▶ Start!</button>' : '<button class="btn blue" id="lb-walk">Walk around 🚶</button>'}</div>`, { close: false });
  box.querySelector('#lb-leave').onclick = () => leave();
  if (S.host) box.querySelector('#lb-start').onclick = () => hostStart();
  else box.querySelector('#lb-walk').onclick = () => { closeModal(); toast(`Room <b>${S.code}</b> · waiting for the start…`, 4000); };
}

/* ---------- host ---------- */
function freeSpot() {
  for (let k = 0; k < 40; k++) {
    const p = new THREE.Vector3((Math.random() - 0.5) * 56, 0, 30 - Math.random() * 70);
    const q = p.clone(); C.world.collide(q, 0.8);
    if (q.distanceTo(p) < 0.01 && !S.orbs.some(o => Math.hypot(o.x - p.x, o.z - p.z) < 5)) return p;
  }
  return new THREE.Vector3((Math.random() - 0.5) * 6, 0, 18);
}
function newOrb() {
  const p = freeSpot(), topics = ['reg', 'irr', 'neg', 'int', 'adj'];
  return { id: uid(), x: +p.x.toFixed(1), z: +p.z.toFixed(1), t: S.topic === 'all' ? topics[Math.floor(Math.random() * 5)] : S.topic, lock: null, lockAt: 0 };
}
function hostStart() {
  S.orbs = []; for (let i = 0; i < N_ORBS; i++) S.orbs.push(newOrb());
  S.scores = {};
  for (const [id, p] of Object.entries(S.players)) if (p.play || !p.host) S.scores[id] = { n: p.name, s: 0, ok: 0, ko: 0, st: 0, by: {} };
  S.endAt = Date.now() + S.dur * 1000;
  sendState(); beginGame(S.dur * 1000);
  clearTimeout(S.endTimer); S.endTimer = setTimeout(() => hostEnd(), S.dur * 1000 + 300);
}
function sendState() {
  send('start', { topic: S.topic, left: Math.max(0, S.endAt - Date.now()), orbs: S.orbs, scores: S.scores });
}
function hostHandle(ev, d) {
  if (ev === 'hello') { if (S.phase === 'game') sendState(); return; }
  if (S.phase !== 'game') return;
  const sc = S.scores[d.id] || (S.scores[d.id] = { n: (S.players[d.id] || {}).name || d.n || '?', s: 0, ok: 0, ko: 0, st: 0, by: {} });
  const o = S.orbs.find(o => o.id === d.orb);
  if (ev === 'claim') {
    if (o && (!o.lock || Date.now() - o.lockAt > 45000)) { o.lock = d.id; o.lockAt = Date.now(); }
  } else if (ev === 'ans') {
    if (!o || o.lock !== d.id) return;
    const by = sc.by[d.t] || (sc.by[d.t] = [0, 0]); by[1]++;
    if (d.ok) { sc.ok++; by[0]++; sc.s += 100 + 20 * Math.min(sc.st, 5); sc.st++; S.orbs.splice(S.orbs.indexOf(o), 1, newOrb()); }
    else { sc.ko++; sc.st = 0; o.lock = null; }
  }
  send('orbs', { orbs: S.orbs }); onMsg('orbs', { orbs: S.orbs });
  send('scores', { scores: S.scores }); onMsg('scores', { scores: S.scores });
}
function hostEnd() {
  if (!S.host || S.phase !== 'game') return;
  send('end', { scores: S.scores }); onMsg('end', { scores: S.scores });
}

/* ---------- messages ---------- */
function onMsg(ev, d) {
  if (ev === 'p') return remoteMove(d);
  if (ev === 'claim' || ev === 'ans' || ev === 'hello') { if (S.host) hostHandle(ev, d); return; }
  if (ev === 'start') { if (S.host) return; S.topic = d.topic; S.orbs = d.orbs; S.scores = d.scores || {}; beginGame(d.left); drawOrbs(); return; }
  if (ev === 'orbs') { S.orbs = d.orbs; drawOrbs(); checkLock(); return; }
  if (ev === 'scores') { S.scores = d.scores; drawBoard(); return; }
  if (ev === 'end') { S.scores = d.scores; endGame(); return; }
  if (ev === 'react') { const r = S.remote.get(d.id); if (r) r.char.play('Dance_Loop', 0.2, { once: true }); }
}

function beginGame(leftMs) {
  const wasGame = S.phase === 'game';
  S.phase = 'game'; S.endAt = Date.now() + leftMs; S.asking = false; S.pending = null;
  closeModal();
  if (!wasGame) { music('online'); sfx('jingle_chapter'); setTimeout(() => voice('go'), 400); toast(S.spectator ? 'Game started! Teacher screen 📺' : 'GO! Find the ✨ memory crystals and answer the questions!<br><small>¡Busca los cristales y responde!</small>', 4500); }
  C.P.frozen = S.spectator; C.player.root.visible = !S.spectator;
  $('#online-hud').classList.toggle('big', S.spectator);
  $('#hud-obj').innerHTML = S.spectator ? `Room <b>${S.code}</b> · Teacher screen 📺` : 'Find the <b>✨ memory crystals</b> (look for the light beams) and touch one to answer!<br><small>Busca los cristales y tócalos para responder.</small>';
  drawOrbs(); drawBoard();
}

function endGame() {
  S.phase = 'end'; clearTimeout(S.endTimer);
  if (S.asking) closeModal();
  S.asking = false;
  for (const m of S.orbMesh.values()) C.scene.remove(m); S.orbMesh.clear();
  voice('time_over'); sfx('jingle_win'); music('ending');
  const rows = Object.entries(S.scores).sort((a, b) => b[1].s - a[1].s);
  const pod = rows.slice(0, 3);
  const myRank = rows.findIndex(([id]) => id === S.me) + 1;
  const order = [pod[1], pod[0], pod[2]].map((r, i) => r ? `<div style="height:${[90, 130, 70][i]}px">${['🥈', '🥇', '🥉'][i]}<br>${esc(r[1].n)}<br><small>${r[1].s}</small></div>` : '').join('');
  const box = modal(`<h2>🏁 Time's up! / ¡Se acabó el tiempo!</h2>
    <div class="podium">${order}</div>
    ${myRank ? `<p style="text-align:center;font-size:20px">Your place: <b>#${myRank}</b> · ${S.scores[S.me].s} points</p>` : ''}
    <table class="results"><tr><th>#</th><th>Name</th><th>Points</th><th>✔</th><th>✘</th><th>%</th></tr>
    ${rows.map(([id, r], i) => `<tr${id === S.me ? ' style="font-weight:700"' : ''}><td>${i + 1}</td><td>${esc(r.n)}</td><td>${r.s}</td><td>${r.ok}</td><td>${r.ko}</td><td>${r.ok + r.ko ? Math.round(r.ok / (r.ok + r.ko) * 100) : 0}%</td></tr>`).join('')}</table>
    <div class="row">${S.host ? '<button class="btn blue" id="en-csv">⬇ Results (CSV)</button><button class="btn" id="en-again">▶ Play again</button>' : '<span class="es">Espera la próxima ronda o sal del juego.</span>'}<button class="btn ghost" id="en-leave">Leave</button></div>`, { close: false });
  box.querySelector('#en-leave').onclick = () => leave();
  if (S.host) {
    box.querySelector('#en-again').onclick = () => { S.phase = 'lobby'; renderLobby(); };
    box.querySelector('#en-csv').onclick = () => downloadCSV(rows);
  }
  // winners dance
  pod.forEach(([id]) => { if (id === S.me) C.player.play('Dance_Loop'); const r = S.remote.get(id); if (r) r.char.play('Dance_Loop'); });
}
function downloadCSV(rows) {
  const T = ['reg', 'irr', 'neg', 'int', 'adj'];
  const lines = [['rank', 'name', 'points', 'correct', 'wrong', 'accuracy', ...T.map(t => t + '_ok/total')].join(',')];
  rows.forEach(([, r], i) => lines.push([i + 1, '"' + r.n.replace(/"/g, "'") + '"', r.s, r.ok, r.ko, (r.ok + r.ko ? Math.round(r.ok / (r.ok + r.ko) * 100) : 0) + '%', ...T.map(t => r.by[t] ? `${r.by[t][0]}/${r.by[t][1]}` : '')].join(',')));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv' }));
  a.download = `past-quest-${S.code}-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
}

/* ---------- crystals ---------- */
const orbGeo = new THREE.OctahedronGeometry(0.7, 0);
const beamGeo = new THREE.CylinderGeometry(0.12, 0.25, 10, 8, 1, true);
function drawOrbs() {
  const ids = new Set(S.orbs.map(o => o.id));
  for (const [id, m] of S.orbMesh) if (!ids.has(id)) { C.scene.remove(m); S.orbMesh.delete(id); }
  for (const o of S.orbs) {
    let m = S.orbMesh.get(o.id);
    if (!m) {
      m = new THREE.Group(); m.position.set(o.x, 0, o.z);
      const c = new THREE.Mesh(orbGeo, new THREE.MeshStandardMaterial({ color: TOPIC_COL[o.t], emissive: TOPIC_COL[o.t], emissiveIntensity: 0.7, transparent: true, opacity: 0.9, roughness: 0.2 }));
      c.position.y = 1.2; c.castShadow = true; m.add(c); m.userData.c = c;
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.7, 0.9, 24), new THREE.MeshBasicMaterial({ color: TOPIC_COL[o.t], transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
      ring.rotation.x = -Math.PI / 2; ring.position.y = 0.05; m.add(ring);
      const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: TOPIC_COL[o.t], transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
      beam.position.y = 5; m.add(beam); m.userData.beam = beam;
      C.scene.add(m); S.orbMesh.set(o.id, m);
    }
    const locked = o.lock && o.lock !== S.me;
    m.userData.c.material.opacity = locked ? 0.25 : 0.9; m.userData.beam.visible = !locked;
  }
}
function checkLock() {
  if (!S.pending || S.asking) return;
  const o = S.orbs.find(o => o.id === S.pending);
  if (!o) { S.pending = null; return; }
  if (o.lock === S.me) ask(o);
  else if (o.lock) { S.pending = null; toast('Too slow! Someone else got it. / ¡Otro llegó primero!', 1800); }
}
async function ask(o) {
  S.asking = true; S.pending = null;
  const q = makeQuestion(o.t);
  const r = await runQuiz([q], { title: `✨ Memory crystal · ${TOPICS[o.t]}`, topic: o.t, fast: true, voice: false });
  closeModal(); S.asking = false;
  const ok = r.results[0];
  C.stat(o.t, ok); C.save();
  if (S.phase !== 'game') return;
  send('ans', { id: S.me, orb: o.id, ok, t: o.t, n: C.SAVE.name });
  if (ok) { sfx('coins'); C.player.play('Interact', 0.1, { once: true }); }
  else S.cooldown[o.id] = performance.now() + 5000;
}
function drawBoard() {
  const rows = Object.entries(S.scores).sort((a, b) => b[1].s - a[1].s);
  $('#on-board').innerHTML = rows.slice(0, S.spectator ? 30 : 8).map(([id, r]) => `<li class="${id === S.me ? 'me' : ''}">${esc(r.n)} — <b>${r.s}</b></li>`).join('') || '<li>…</li>';
}

/* ---------- remote players ---------- */
function remoteMove(d) {
  if (d.id === S.me) return;
  let r = S.remote.get(d.id);
  const pres = S.players[d.id];
  if (!r) {
    if (!pres) return;
    if (pres.host && !pres.play) return;
    const char = new C.Character(pres.look || {});
    char.root.position.set(d.x, 0, d.z);
    C.scene.add(char.root);
    const label = el('div', { class: 'bub name' }, esc(pres.name)); $('#bubbles').appendChild(label);
    r = { char, label, x: d.x, z: d.z, ry: d.r, a: 'i' };
    S.remote.set(d.id, r);
  }
  r.x = d.x; r.z = d.z; r.ry = d.r; r.y = d.y || 0;
  if (d.a !== r.a) { r.a = d.a; r.char.play({ i: 'Idle_Loop', w: 'Walk_Loop', j: 'Jog_Fwd_Loop', s: 'Sprint_Loop', u: 'Jump_Loop', d: 'Dance_Loop', q: 'Interact' }[d.a] || 'Idle_Loop'); }
  r.seen = performance.now();
}
function pruneRemote() {
  for (const [id, r] of S.remote) if (!S.players[id]) { C.scene.remove(r.char.root); r.label.remove(); S.remote.delete(id); }
}

/* ---------- public API ---------- */
export const Online = {
  open(ctx) {
    C = ctx;
    S.arena = C.world.box(-40, 40, -46, -42, 'arena');   // keep everybody in Willowbrook
    lobbyStart();
  },
  interact() {},
  _S: S, _end: () => hostEnd(),
  menu() {
    const box = modal(`<h2>☰ Online</h2><div class="maplist"><button id="om-res">▶ Resume</button>${S.code ? `<button disabled>Room: <b>${S.code}</b></button>` : ''}<button id="om-leave">🏠 Leave the room</button></div>`);
    box.querySelector('#om-res').onclick = () => { closeModal(); if (S.phase === 'lobby') renderLobby(); };
    box.querySelector('#om-leave').onclick = () => leave();
  },
  update(dt, T) {
    // spectator camera
    if (S.spectator && S.phase !== 'off') {
      const a = T * 0.04; C.camera.position.set(Math.sin(a) * 34, 34, -5 + Math.cos(a) * 34); C.camera.lookAt(0, 0, -5);
    }
    // send my position
    if (ch && S.play && S.phase !== 'off') {
      S.sendT += dt; S.hbT += dt;
      const nm = C.player.currentName || '';
      const a = !C.P.ground ? 'u' : nm.startsWith('Sprint') ? 's' : nm.startsWith('Jog') ? 'j' : nm.startsWith('Walk') ? 'w' : nm.startsWith('Dance') ? 'd' : nm === 'Interact' ? 'q' : 'i';
      const key = `${C.P.pos.x.toFixed(1)},${C.P.pos.z.toFixed(1)},${a}`;
      if ((S.sendT > 0.2 && key !== S.last) || S.hbT > 2) {
        S.sendT = 0; S.hbT = 0; S.last = key;
        ch.send({ type: 'broadcast', event: 'p', payload: { id: S.me, x: +C.P.pos.x.toFixed(2), z: +C.P.pos.z.toFixed(2), y: +C.P.pos.y.toFixed(2), r: +(C.P.face.toFixed(2)), a } }).catch(() => {});
      }
    }
    // remote avatars
    for (const r of S.remote.values()) {
      const p = r.char.root.position, k = 1 - Math.exp(-dt * 10);
      p.x += (r.x - p.x) * k; p.z += (r.z - p.z) * k; p.y += ((r.y || 0) - p.y) * k;
      let d = r.ry - r.char.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); r.char.root.rotation.y += d * k;
      r.char.update(dt);
      const s = C.project(p, 2.2);
      r.label.style.display = s ? '' : 'none';
      if (s) { r.label.style.left = s[0] + 'px'; r.label.style.top = s[1] + 'px'; }
    }
    // crystals
    for (const m of S.orbMesh.values()) { m.userData.c.rotation.y += dt * 1.5; m.userData.c.position.y = 1.2 + Math.sin(T * 2 + m.position.x) * 0.15; }
    if (S.phase === 'game') {
      const left = Math.max(0, S.endAt - Date.now());
      $('#on-timer').textContent = `${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}`;
      if (S.host && left <= 0) hostEnd();
      if (S.play && !S.asking && !S.pending && !UI.open) {
        for (const o of S.orbs) {
          if (o.lock || (S.cooldown[o.id] || 0) > performance.now()) continue;
          if (Math.hypot(o.x - C.P.pos.x, o.z - C.P.pos.z) < 1.5) { S.pending = o.id; send('claim', { id: S.me, orb: o.id }); setTimeout(() => { if (S.pending === o.id) S.pending = null; }, 3000); break; }
        }
      }
    } else if (S.phase === 'lobby') $('#on-timer').textContent = S.code;
  },
};

function leave() {
  try { if (ch) { ch.untrack(); sb.removeChannel(ch); } } catch (e) {}
  ch = null; S.phase = 'off'; S.code = ''; clearTimeout(S.endTimer);
  for (const r of S.remote.values()) { C.scene.remove(r.char.root); r.label.remove(); } S.remote.clear();
  for (const m of S.orbMesh.values()) C.scene.remove(m); S.orbMesh.clear(); S.orbs = [];
  if (S.arena) { const i = C.world.colliders.indexOf(S.arena); if (i >= 0) C.world.colliders.splice(i, 1); S.arena = null; }
  C.P.frozen = false; $('#online-hud').classList.remove('big'); $('#hud-obj').innerHTML = '';
  closeModal(); C.goTitle();
}
