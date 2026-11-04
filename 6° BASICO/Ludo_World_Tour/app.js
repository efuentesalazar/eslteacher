/* Ludo World Tour — 3D online Ludo for Unit 4 "Let's Travel!" */
(() => {
"use strict";
const SB = supabase.createClient(CFG.url, CFG.key, { auth: { persistSession: false } });
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clone = (o) => JSON.parse(JSON.stringify(o));
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }, del(k) { try { localStorage.removeItem(k); } catch (e) {} } };
let off = 0; const now = () => Date.now() + off;
async function sync() { try { const t = Date.now(); const { data } = await SB.rpc("server_time"); if (data) off = new Date(data).getTime() - (t + Date.now()) / 2; } catch (e) {} }
const mmss = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
function show(id) { ["home", "lobby", "final", "tSetup", "tDash"].forEach((x) => ($("#" + x).hidden = x !== id)); $("#hud").hidden = id !== "game"; }

/* ================= SOUND (all generated, no files) ================= */
const Snd = {
  ctx: null, on: store.get("ludo_sound", true),
  init() {
    if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = (this.ctx = new C());
    this.master = c.createGain(); this.master.gain.value = this.on ? 0.9 : 0; this.master.connect(c.destination);
    this.mus = c.createGain(); this.mus.gain.value = 0.13; this.mus.connect(this.master);
    this.music();
  },
  toggle() { this.on = !this.on; store.set("ludo_sound", this.on); if (this.master) this.master.gain.value = this.on ? 0.9 : 0; $("#sndBtn").textContent = this.on ? "🔊" : "🔇"; },
  tone(f, d, type = "sine", v = 0.2, f2, w = 0, dest) {
    const c = this.ctx; if (!c) return; const t = c.currentTime + w;
    const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(dest || this.master); o.start(t); o.stop(t + d + 0.05);
  },
  noise(d, v = 0.2, w = 0, dest, hp = 1500) {
    const c = this.ctx; if (!c) return; const t = c.currentTime + w;
    if (!this.nb) { this.nb = c.createBuffer(1, c.sampleRate, c.sampleRate); const a = this.nb.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; }
    const s = c.createBufferSource(); s.buffer = this.nb; const f = c.createBiquadFilter(); f.type = "highpass"; f.frequency.value = hp;
    const g = c.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(dest || this.master); s.start(t); s.stop(t + d + 0.02);
  },
  music() { // cheerful 4-bar loop: C - G - Am - F
    const c = this.ctx, N = (n) => 440 * Math.pow(2, (n - 69) / 12), M = this.mus, e = 60 / 118 / 2;
    const bass = [48, 43, 45, 41], chord = [[60, 64, 67], [59, 62, 67], [60, 64, 69], [60, 65, 69]];
    const mel = [76, 0, 79, 76, 74, 72, 74, 0, 74, 0, 76, 74, 71, 67, 71, 0, 72, 0, 76, 79, 81, 79, 76, 0, 77, 76, 74, 72, 74, 0, 72, 0];
    let step = 0, next = c.currentTime + 0.1;
    setInterval(() => {
      while (next < c.currentTime + 0.3) {
        const s = step % 32, bar = Math.floor(s / 8), w = next - c.currentTime;
        if (s % 4 === 0) { this.tone(N(bass[bar]), e * 3.6, "triangle", 0.55, null, w, M); this.tone(140, 0.14, "sine", 0.55, 45, w, M); }
        if (s % 4 === 2) chord[bar].forEach((n) => this.tone(N(n), e * 1.6, "sine", 0.1, null, w, M));
        if (s % 8 === 4) this.noise(0.12, 0.18, w, M, 2500);
        this.noise(0.03, 0.06, w, M, 7000);
        if (mel[s]) this.tone(N(mel[s]), e * 0.95, "square", 0.07, null, w, M);
        next += e; step++;
      }
    }, 80);
  },
  fx(n) {
    if (!this.ctx) return; const T = (f, d, ty, v, f2, w) => this.tone(f, d, ty, v, f2, w);
    if (n === "roll") for (let i = 0; i < 9; i++) this.noise(0.04, 0.35, i * 0.08 + Math.random() * 0.03, null, 1800);
    if (n === "step") T(500 + Math.random() * 120, 0.09, "triangle", 0.3, 820);
    if (n === "cap") { T(900, 0.45, "square", 0.18, 110); this.noise(0.3, 0.3, 0.05, null, 400); }
    if (n === "ok") [523, 659, 784, 1047].forEach((f, i) => T(f, 0.18, "triangle", 0.35, null, i * 0.08));
    if (n === "bad") { T(260, 0.22, "sawtooth", 0.14); T(196, 0.35, "sawtooth", 0.14, null, 0.18); }
    if (n === "six") [392, 523, 659, 784, 1047].forEach((f, i) => T(f, 0.14, "square", 0.12, null, i * 0.06));
    if (n === "turn") { T(880, 0.14, "sine", 0.3); T(1320, 0.2, "sine", 0.25, null, 0.11); }
    if (n === "home") [659, 784, 988, 1319].forEach((f, i) => T(f, 0.22, "triangle", 0.35, null, i * 0.1));
    if (n === "win") [523, 523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => T(f, 0.28, "square", 0.14, null, i * 0.15));
    if (n === "click") T(700, 0.06, "sine", 0.18);
  },
};

/* ================= BOARD GEOMETRY ================= */
const CSS = ["#e53935", "#43a047", "#f9c80e", "#1e88e5"], HEX = [0xe53935, 0x43a047, 0xf9c80e, 0x1e88e5];
const PATH = [];
[[1, 6], [2, 6], [3, 6], [4, 6], [5, 6]].forEach((p) => PATH.push(p));
for (let r = 5; r >= 0; r--) PATH.push([6, r]); PATH.push([7, 0]);
for (let r = 0; r <= 5; r++) PATH.push([8, r]);
for (let c = 9; c <= 14; c++) PATH.push([c, 6]); PATH.push([14, 7]);
for (let c = 14; c >= 9; c--) PATH.push([c, 8]);
for (let r = 9; r <= 14; r++) PATH.push([8, r]); PATH.push([7, 14]);
for (let r = 14; r >= 9; r--) PATH.push([6, r]);
for (let c = 5; c >= 0; c--) PATH.push([c, 8]); PATH.push([0, 7], [0, 6]);
const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const YARD = [[0, 0], [9, 0], [9, 9], [0, 9]];
const homeCell = (s, k) => [[1 + k, 7], [7, 1 + k], [13 - k, 7], [7, 13 - k]][s];
const FIN = [[6.25, 7.5], [7.5, 6.25], [8.75, 7.5], [7.5, 8.75]];
const absOf = (s, p) => (s * 13 + p) % 52;
function cellXZ(s, p, t) { // board coords (cells), center of board = 7.5
  if (p < 0) { const [ox, oy] = YARD[s]; return [ox + 2 + 2 * (t % 2), oy + 2 + 2 * (t >> 1)]; }
  if (p <= 50) { const [c, r] = PATH[absOf(s, p)]; return [c + 0.5, r + 0.5]; }
  if (p <= 55) { const [c, r] = homeCell(s, p - 51); return [c + 0.5, r + 0.5]; }
  const [fx, fz] = FIN[s]; return [fx + ((t % 2) - 0.5) * 0.55, fz + ((t >> 1) - 0.5) * 0.55];
}

/* ================= 3D SCENE ================= */
let R, scene, cam, boardG, die, sun, clock3 = 0;
const tweens = [], parts = [], pawns = [[], [], [], []], pickables = [];
let camBase = { y: 15, z: 12.5 }, homeSpin = true;
const lin = (c) => new THREE.Color(c).convertSRGBToLinear();
const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: lin(c), roughness: 0.8, flatShading: true }, o));
function seeded(s) { return () => ((s = (s * 16807) % 2147483647) / 2147483647); }
function rr(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
function star(x, cx, cy, R1, col) { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? R1 * 0.45 : R1; x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } x.closePath(); x.fillStyle = col; x.fill(); }
function drawBoard() {
  const cv = document.createElement("canvas"); cv.width = cv.height = 1500; const x = cv.getContext("2d"), u = 100;
  const g = x.createLinearGradient(0, 0, 1500, 1500); g.addColorStop(0, "#fffdf6"); g.addColorStop(1, "#f6ecd6"); x.fillStyle = g; x.fillRect(0, 0, 1500, 1500);
  YARD.forEach(([ox, oy], s) => {
    x.fillStyle = CSS[s]; rr(x, ox * u + 8, oy * u + 8, 6 * u - 16, 6 * u - 16, 40); x.fill();
    x.fillStyle = "rgba(255,255,255,.18)"; rr(x, ox * u + 20, oy * u + 20, 6 * u - 40, 2 * u, 30); x.fill();
    x.fillStyle = "#fff"; rr(x, (ox + 1) * u, (oy + 1) * u, 4 * u, 4 * u, 36); x.fill();
    for (let i = 0; i < 4; i++) { const cx = (ox + 2 + 2 * (i % 2)) * u, cy = (oy + 2 + 2 * (i >> 1)) * u;
      x.beginPath(); x.arc(cx, cy, 0.66 * u, 0, 7); x.fillStyle = CSS[s]; x.fill(); x.beginPath(); x.arc(cx, cy, 0.48 * u, 0, 7); x.fillStyle = "rgba(255,255,255,.35)"; x.fill(); }
  });
  const cell = (c, r, fill) => { x.fillStyle = fill || "#fff"; rr(x, c * u + 4, r * u + 4, u - 8, u - 8, 12); x.fill(); x.strokeStyle = "rgba(120,100,70,.25)"; x.lineWidth = 3; x.stroke(); };
  PATH.forEach(([c, r], i) => { cell(c, r, i % 13 === 0 ? CSS[i / 13] : null); if (SAFE.has(i)) star(x, (c + 0.5) * u, (r + 0.5) * u, 0.32 * u, i % 13 === 0 ? "rgba(255,255,255,.9)" : "#cbd5e1"); });
  for (let s = 0; s < 4; s++) for (let k = 0; k < 5; k++) { const [c, r] = homeCell(s, k); cell(c, r, CSS[s]); }
  const C = 7.5 * u, tri = (a, b, col) => { x.beginPath(); x.moveTo(a[0] * u, a[1] * u); x.lineTo(b[0] * u, b[1] * u); x.lineTo(C, C); x.closePath(); x.fillStyle = col; x.fill(); };
  tri([6, 6], [6, 9], CSS[0]); tri([6, 6], [9, 6], CSS[1]); tri([9, 6], [9, 9], CSS[2]); tri([6, 9], [9, 9], CSS[3]);
  x.font = "bold 40px Fredoka, sans-serif"; x.textAlign = "center"; x.fillStyle = "rgba(0,0,0,.08)";
  return cv;
}
function dieTex(v) {
  const cv = document.createElement("canvas"); cv.width = cv.height = 128; const x = cv.getContext("2d");
  x.fillStyle = "#fff"; x.fillRect(0, 0, 128, 128); x.fillStyle = "#f1f1f6"; rr(x, 6, 6, 116, 116, 26); x.fill();
  const P = { 1: [[64, 64]], 2: [[36, 36], [92, 92]], 3: [[34, 34], [64, 64], [94, 94]], 4: [[36, 36], [92, 36], [36, 92], [92, 92]], 5: [[34, 34], [94, 34], [64, 64], [34, 94], [94, 94]], 6: [[36, 32], [92, 32], [36, 64], [92, 64], [36, 96], [92, 96]] };
  P[v].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, v === 1 ? 17 : 12, 0, 7); x.fillStyle = v === 1 ? "#e53935" : "#1f2937"; x.fill(); });
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
}
const DIE_ROT = { 1: [0, 0], 6: [Math.PI, 0], 2: [-Math.PI / 2, 0], 5: [Math.PI / 2, 0], 3: [0, Math.PI / 2], 4: [0, -Math.PI / 2] }; // [rotX, rotZ] bringing face up
function tree(x, z, k, r) {
  const g = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 0.9, 6), mat(0x8d5a2b)); trunk.position.y = 0.45; g.add(trunk);
  const greens = [0x2e9e44, 0x3fb950, 0x5cc96b];
  if (r() < 0.5) for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.9 - i * 0.22, 1.1, 7), mat(greens[i])); c.position.y = 1.1 + i * 0.6; g.add(c); }
  else { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), mat(greens[(r() * 3) | 0])); b.position.y = 1.5; g.add(b); }
  g.traverse((m) => (m.castShadow = true)); g.position.set(x, -0.4, z); g.scale.setScalar(k); g.rotation.y = r() * 6; scene.add(g);
}
function makePawn(s) {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: lin(HEX[s]), roughness: 0.28, metalness: 0.1 });
  const prof = [[0, 0], [0.34, 0], [0.36, 0.06], [0.3, 0.12], [0.2, 0.18], [0.13, 0.42], [0.11, 0.56], [0.22, 0.6], [0.22, 0.66], [0.09, 0.7], [0, 0.7]].map(([a, b]) => new THREE.Vector2(a, b));
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 24), m), head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 20, 14), m);
  head.position.y = 0.86; g.add(body, head);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.06, 8, 28), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  ring.rotation.x = Math.PI / 2; ring.position.y = 0.04; ring.visible = false; g.add(ring);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.userData.pawn = g; } });
  g.userData = { s, ring, m }; return g;
}
function init3D() {
  R = new THREE.WebGLRenderer({ canvas: $("#c3d"), antialias: true }); R.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap; R.outputEncoding = THREE.sRGBEncoding;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x8fd3ff); scene.fog = new THREE.Fog(0x8fd3ff, 34, 80);
  cam = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
  scene.add(new THREE.HemisphereLight(0xe8f6ff, 0x4f7f34, 0.8));
  sun = new THREE.DirectionalLight(0xfff4e0, 0.95); sun.position.set(10, 20, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16 }); sun.shadow.bias = -0.0006; scene.add(sun);
  const water = new THREE.Mesh(new THREE.CircleGeometry(160, 40), mat(0x3aa3f0, { roughness: 0.4 })); water.rotation.x = -Math.PI / 2; water.position.y = -2.6; scene.add(water);
  const island = new THREE.Mesh(new THREE.CylinderGeometry(25, 21, 2.4, 40), mat(0x78c84e)); island.position.y = -1.6; island.receiveShadow = true; scene.add(island);
  const cliff = new THREE.Mesh(new THREE.CylinderGeometry(21, 16, 5, 40), mat(0xb7793d)); cliff.position.y = -5.2; scene.add(cliff);
  const r = seeded(11);
  for (let i = 0; i < 60; i++) { const a = r() * 6.283, d = 13 + r() * 10; tree(Math.cos(a) * d, Math.sin(a) * d, 0.8 + r() * 0.9, r); }
  for (let i = 0; i < 9; i++) { const a = r() * 6.283, d = 17 + r() * 6, h = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4 + r() * 1.6, 0), mat(0x8a9aa8)); h.position.set(Math.cos(a) * d, -0.5, Math.sin(a) * d); h.castShadow = true; scene.add(h); }
  for (let i = 0; i < 8; i++) { const c = new THREE.Group(); for (let j = 0; j < 4; j++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1 + r(), 1), mat(0xffffff, { roughness: 1 })); b.position.set(j * 1.3, r() * 0.6, r() * 0.8); c.add(b); }
    c.position.set(-40 + r() * 80, 11 + r() * 6, -30 + r() * 40); c.userData.v = 0.2 + r() * 0.4; scene.add(c); parts.push({ cloud: c }); }
  boardG = new THREE.Group(); scene.add(boardG);
  const wood = mat(0xc4834a, { flatShading: false, roughness: 0.6 }), dark = mat(0x8a5428, { flatShading: false });
  const base = new THREE.Mesh(new THREE.BoxGeometry(16.6, 1, 16.6), wood); base.position.y = -0.5; base.castShadow = base.receiveShadow = true; boardG.add(base);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(17.2, 0.3, 17.2), dark); foot.position.y = -0.95; boardG.add(foot);
  const tex = new THREE.CanvasTexture(drawBoard()); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = R.capabilities.getMaxAnisotropy();
  const topM = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 });
  const top = new THREE.Mesh(new THREE.BoxGeometry(15, 0.16, 15), [wood, wood, topM, wood, wood, wood]); top.position.y = 0.08; top.receiveShadow = true; boardG.add(top);
  die = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), [3, 4, 1, 6, 2, 5].map((v) => new THREE.MeshStandardMaterial({ map: dieTex(v), roughness: 0.35 })));
  die.castShadow = true; die.position.set(0, 0.66, 0); boardG.add(die);
  for (let s = 0; s < 4; s++) for (let t = 0; t < 4; t++) { const p = makePawn(s); p.userData.t = t; boardG.add(p); pawns[s][t] = p; place(p, s, -1, t); }
  addEventListener("resize", resize); resize();
  R.domElement.addEventListener("pointerdown", onPick);
  requestAnimationFrame(loop);
}
function resize() {
  const w = innerWidth, h = innerHeight, a = w / h; R.setSize(w, h, false); cam.aspect = a;
  const k = a < 1 ? Math.min(2.1, 1.05 / a) : 1; camBase = { y: 15.5 * k, z: 12 * k }; cam.updateProjectionMatrix();
}
const tw = (dur, fn, done) => tweens.push({ t0: performance.now(), dur, fn, done });
function loop(t) {
  requestAnimationFrame(loop); const dt = Math.min(0.05, (t - clock3) / 1000 || 0); clock3 = t;
  for (let i = tweens.length - 1; i >= 0; i--) { const w = tweens[i], k = Math.min(1, (t - w.t0) / w.dur); w.fn(k); if (k >= 1) { tweens.splice(i, 1); w.done && w.done(); } }
  for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i];
    if (p.cloud) { p.cloud.position.x += p.cloud.userData.v * dt; if (p.cloud.position.x > 45) p.cloud.position.x = -45; continue; }
    p.life -= dt; p.v.y -= 9 * dt; p.m.position.addScaledVector(p.v, dt); p.m.rotation.x += 6 * dt; p.m.rotation.y += 5 * dt;
    if (p.life <= 0) { boardG.remove(p.m); parts.splice(i, 1); } }
  const sel = selectable(); const sec = t / 1000;
  pawns.forEach((arr, s) => arr.forEach((p, i) => { const on = sel.includes(i) && s === mySeat(); p.userData.ring.visible = on;
    if (on) { p.userData.ring.scale.setScalar(1 + 0.15 * Math.sin(sec * 6)); p.position.y = p.userData.y + 0.15 + 0.12 * Math.sin(sec * 6 + i); }
    else if (!p.userData.anim) p.position.y = p.userData.y || 0.16; }));
  if (homeSpin) { boardG.rotation.y += dt * 0.12; cam.position.set(0, camBase.y * 1.05, camBase.z * 1.15); }
  else { cam.position.set(Math.sin(sec * 0.15) * 0.6, camBase.y, camBase.z); }
  cam.lookAt(0, 0, 1);
  R.render(scene, cam);
}
function worldOf(s, p, t) { const [cx, cz] = cellXZ(s, p, t); return [cx - 7.5, cz - 7.5]; }
function place(pw, s, p, t) { const [x, z] = worldOf(s, p, t); pw.position.set(x, 0.16, z); pw.userData.y = 0.16; pw.userData.p = p; }
function restack() { // spread pawns that share a cell
  const m = {}; pawns.forEach((a, s) => a.forEach((p, t) => { if (p.userData.anim || p.userData.p < 0 || p.userData.p >= 56) return; const k = Math.round(p.position.x * 2) + ":" + Math.round(p.position.z * 2); (m[k] = m[k] || []).push(p); }));
  Object.values(m).forEach((list) => { if (list.length < 2) return; list.forEach((p, i) => { const [x, z] = worldOf(p.userData.s, p.userData.p, p.userData.t), a = (i / list.length) * 6.283; p.position.x = x + Math.cos(a) * 0.24; p.position.z = z + Math.sin(a) * 0.24; }); });
}
function hop(pw, pts, done) {
  pw.userData.anim = true; let i = 0;
  const next = () => {
    if (i >= pts.length) { pw.userData.anim = false; done && done(); return; }
    const from = pw.position.clone(), [x, z] = pts[i++];
    tw(170, (k) => { pw.position.set(from.x + (x - from.x) * k, 0.16 + Math.sin(k * Math.PI) * 0.7, from.z + (z - from.z) * k); }, () => { Snd.fx("step"); next(); });
  }; next();
}
function burst(x, z, colors, n = 46) {
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.03), new THREE.MeshBasicMaterial({ color: colors[i % colors.length] }));
    m.position.set(x, 0.8, z); boardG.add(m); parts.push({ m, life: 1.4 + Math.random() * 0.6, v: new THREE.Vector3((Math.random() - 0.5) * 6, 4 + Math.random() * 5, (Math.random() - 0.5) * 6) }); }
}
function rollDieAnim(v, done) {
  Snd.fx("roll"); const [rx, rz] = DIE_ROT[v], ry = Math.floor(Math.random() * 4) * (Math.PI / 2);
  const sx = (3 + Math.random() * 2) * 6.283, sy = (2 + Math.random() * 2) * 6.283, sz = (2 + Math.random()) * 6.283;
  tw(1000, (k) => { const e = 1 - Math.pow(1 - k, 3);
    die.position.y = 0.66 + Math.abs(Math.sin(k * Math.PI * 2.5)) * 2.4 * (1 - k);
    die.rotation.set(rx + sx * (1 - e), ry + sy * (1 - e), rz + sz * (1 - e)); }, done);
}
function onPick(ev) {
  if (!S || S.state.phase !== "move" || S.state.turn !== mySeat()) return;
  const rc = new THREE.Raycaster(), v = new THREE.Vector2((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
  rc.setFromCamera(v, cam); const hit = rc.intersectObjects(pawns[mySeat()].flatMap((p) => p.children), false)[0];
  if (hit) { const p = hit.object.userData.pawn; if (selectable().includes(p.userData.t)) doMove(p.userData.t); }
}

// test helper: screen position of the pieces you can move now
window.ludoTargets = () => selectable().map((t) => { const v = pawns[mySeat()][t].getWorldPosition(new THREE.Vector3()).project(cam); return { t, x: ((v.x + 1) / 2) * innerWidth, y: ((1 - v.y) / 2) * innerHeight }; });

/* ================= GAME RULES ================= */
const BOTS = [["Robo Max", "🤖"], ["Robo Luna", "👾"], ["Robo Leo", "🦾"]];
const legal = (st, s, d) => st.tokens[s].map((p, t) => (p < 0 ? (d === 6 || d === 1 ? t : -1) : p < 56 ? t : -1)).filter((t) => t >= 0);
const dest = (p, d) => (p < 0 ? 0 : Math.min(56, p + d));
const scoreOf = (st, s) => st.tokens[s].reduce((a, p) => a + (p < 0 ? 0 : p + 1) + (p >= 56 ? 25 : 0), 0) + (st.seats[s].caps || 0) * 10 + (st.seats[s].correct || 0) * 5;
let POOL = null;
function pool() { if (POOL) return POOL; const tp = (ROOM && ROOM.settings && ROOM.settings.topics) || Object.keys(TOPICS); POOL = QUESTIONS.map((q, i) => (tp.includes(q.t) ? i : -1)).filter((i) => i >= 0); if (!POOL.length) POOL = QUESTIONS.map((_, i) => i); return POOL; }
function newTurn(st, s) {
  st.turn = s; st.phase = "question"; st.die = null; st.qAns = null; st.turnAt = now(); st.tc = (st.tc || 0) + 1;
  const recent = st.qr || []; let qi, tries = 0; do { qi = pool()[Math.floor(Math.random() * pool().length)]; } while (recent.includes(qi) && tries++ < 30);
  st.q = qi; st.qo = shuffle(QUESTIONS[qi].o.map((_, i) => i)); st.qr = recent.concat(qi).slice(-40);
}

/* ================= ONLINE STATE ================= */
let ME = null, ROOM = null, S = null, TID = null, chan = null, roomChan = null, acting = false, busyN = 0, dieUntil = 0; const animBusy = () => busyN > 0;
const mySeat = () => (S && ME ? S.state.seats.findIndex((x) => x.pid === ME.id) : -1);
const hostSeat = () => (S ? S.state.seats.findIndex((x) => !x.bot) : -1);
const isFree = () => ME && ME.code === "FREE";
const endAt = () => (isFree() ? S && S.state.endsAt : ROOM && ROOM.ends_at ? new Date(ROOM.ends_at).getTime() : 0);
function selectable() { if (!S || animBusy()) return []; const st = S.state; if (st.phase !== "move" || st.turn !== mySeat()) return []; return legal(st, st.turn, st.die); }

async function refetch() { const { data } = await SB.from("ludo_tables").select("*").eq("id", TID).maybeSingle(); if (data) apply(data, true); }
function apply(row, force) {
  if (S && !force && row.version <= S.version) return;
  const prev = S; S = { state: row.state, version: row.version, status: row.status, created: row.created_at ? new Date(row.created_at).getTime() : prev && prev.created };
  onState(prev ? prev.state : null);
}
async function act(fn) {
  if (acting || !S) return; acting = true;
  try {
    const st = clone(S.state); const status = fn(st); if (status === false) return;
    st.seats.forEach((x, i) => { if (st.tokens) x.score = scoreOf(st, i); });
    const { data, error } = await SB.rpc("ludo_update", { p_table: TID, p_pid: ME.id, p_secret: ME.secret, p_version: S.version, p_state: st, p_status: status || null });
    if (error || data < 0) await refetch(); else apply({ state: st, version: data, status: status || S.status });
  } finally { acting = false; }
}
function startTable() {
  act((st) => {
    if (S.status !== "waiting") return false;
    let b = 0; while (st.seats.length < 4) { const [n, a] = BOTS[b++]; st.seats.push({ pid: null, name: n, avatar: a, bot: true, correct: 0, answered: 0 }); }
    st.tokens = st.seats.map(() => [-1, -1, -1, -1]); st.started = now(); if (isFree()) st.endsAt = now() + 15 * 60000;
    newTurn(st, 0); return "playing";
  });
}
// Registro para el Panel del profe (eslteacher.cl → Análisis de juegos). Solo la respuesta del propio alumno.
const qShownAt = {};
function logAns(st, i) {
  if (!window.eslLog || st.phase !== "question") return;
  const q = QUESTIONS[st.q], pas = q.p ? PASSAGES[q.p] : null;
  window.eslLog("ludo-world-6b", { activity: TOPICS[q.t] || "", item: { id: "q" + st.q, q: (pas ? "[" + pas.title + "] " : "") + q.q, k: q.t },
    chosen: q.o[st.qo[i]], right: q.o[0], ok: st.qo[i] === 0, ms: qShownAt[st.tc + ":" + st.q] ? performance.now() - qShownAt[st.tc + ":" + st.q] : null });
}
function answer(i) {
  Snd.init(); act((st) => { if (st.phase !== "question") return false; const ok = st.qo[i] === 0, se = st.seats[st.turn];
    se.answered++; if (ok) se.correct++; st.qAns = { pick: i, ok }; st.phase = ok ? "roll" : "wrong"; st.turnAt = now(); });
}
function doRoll() { Snd.init(); act((st) => { if (st.phase !== "roll") return false; const d = 1 + Math.floor(Math.random() * 6); st.die = d; st.rid = (st.rid || 0) + 1; st.phase = legal(st, st.turn, d).length ? "move" : "nomove"; st.turnAt = now(); }); }
function doMove(t) {
  act((st) => {
    if (st.phase !== "move") return false; const s = st.turn, d = st.die; if (!legal(st, s, d).includes(t)) return false;
    const from = st.tokens[s][t], to = dest(from, d); st.tokens[s][t] = to; const caps = [];
    if (to <= 50) { const a = absOf(s, to); if (!SAFE.has(a)) st.tokens.forEach((arr, o) => { if (o !== s) arr.forEach((p, k) => { if (p >= 0 && p <= 50 && absOf(o, p) === a) { arr[k] = -1; caps.push([o, k, p]); } }); }); }
    st.seats[s].caps = (st.seats[s].caps || 0) + caps.length; st.mid = (st.mid || 0) + 1; st.moved = { s, t, from, to, caps, mid: st.mid };
    if (st.tokens[s].every((p) => p >= 56)) { st.phase = "over"; st.winner = s; return "over"; }
    newTurn(st, d === 6 ? s : (s + 1) % 4);
  });
}
function nextTurn() { act((st) => { if (!["wrong", "nomove"].includes(st.phase)) return false; newTurn(st, (st.turn + 1) % 4); }); }
function finishGame() { act((st) => { if (st.phase === "over") return false; let best = 0; st.seats.forEach((_, i) => { if (scoreOf(st, i) > scoreOf(st, best)) best = i; }); st.phase = "over"; st.winner = best; return "over"; }); }
function botMove(st) {
  const s = st.turn, L = legal(st, s, st.die); let best = L[0], bs = -1e9;
  L.forEach((t) => { const p = st.tokens[s][t], to = dest(p, st.die); let sc = to - Math.max(p, 0);
    if (p < 0) sc += 30; if (to >= 56) sc += 40; if (to <= 50 && !SAFE.has(absOf(s, to))) st.tokens.forEach((a, o) => { if (o !== s) a.forEach((q) => { if (q >= 0 && q <= 50 && absOf(o, q) === absOf(s, to)) sc += 60; }); });
    sc += Math.random() * 3; if (sc > bs) { bs = sc; best = t; } });
  return best;
}

/* watchdog: runs bots, timeouts and game start/end on every client (version checks avoid duplicates) */
setInterval(() => {
  if (!S || acting || animBusy()) return;
  const st = S.state, me = mySeat(), host = hostSeat() === me, el = now() - (st.turnAt || 0);
  if (S.status === "waiting") {
    const age = now() - (S.created || now()), ready = isFree() ? st.seats.length >= 4 || age > 20000 : ROOM && ROOM.status === "playing";
    if (ready && (host || age > 30000)) startTable(); return;
  }
  if (S.status !== "playing") return;
  if (endAt() && now() > endAt() + (host ? 0 : 5000)) return finishGame();
  if (!isFree() && ROOM && ROOM.status === "ended") return finishGame();
  const cur = st.seats[st.turn], mine = st.turn === me, botTurn = cur.bot;
  const may = (wait) => mine || ((botTurn || el > wait) && host) || el > wait + 8000; // who should act
  if (st.phase === "wrong" || st.phase === "nomove") { if (el > 2400 && may(2400)) nextTurn(); return; }
  if (botTurn) {
    if (!(host || el > 9000)) return;
    if (st.phase === "question" && el > 2200) { const ok = Math.random() < 0.72; act((x) => { if (x.phase !== "question") return false; const se = x.seats[x.turn]; se.answered++; if (ok) se.correct++; x.qAns = { pick: x.qo.indexOf(ok ? 0 : x.qo.find((k) => k !== 0)), ok }; x.phase = ok ? "roll" : "wrong"; x.turnAt = now(); }); }
    else if (st.phase === "roll" && el > 1200) doRoll();
    else if (st.phase === "move" && el > 1400) doMove(botMove(st));
    return;
  }
  // human turn: auto-play when the player is away
  if (st.phase === "question" && el > 30000 && may(30000)) act((x) => { if (x.phase !== "question") return false; x.seats[x.turn].answered++; x.qAns = { pick: -1, ok: false }; x.phase = "wrong"; x.turnAt = now(); });
  else if (st.phase === "roll" && el > (mine ? 15000 : 20000) && may(20000)) doRoll();
  else if (st.phase === "move" && el > (mine ? 15000 : 20000) && may(20000)) doMove(botMove(st));
  else if (mine && st.phase === "move" && el > 1300) { const L = legal(st, st.turn, st.die), P0 = st.tokens[st.turn][L[0]]; if (L.length && L.every((t) => st.tokens[st.turn][t] === P0)) doMove(L[0]); }
}, 400);

/* ================= REACT TO STATE ================= */
let lastRid = 0, lastMid = 0, lastTc = 0, lastAns = "", builtFor = null;
function banner(txt, col) { const b = $("#banner"); b.textContent = txt; b.style.color = col || "#fff"; b.classList.remove("show"); void b.offsetWidth; b.classList.add("show"); }
function onState(prev) {
  const st = S.state;
  if (S.status === "waiting") { show("lobby"); renderLobby(); return; }
  if (!st.tokens) return;
  if (builtFor !== TID) { // first time in game: snap everything, rotate board to my color
    builtFor = TID; homeSpin = false; show("game"); const me = Math.max(0, mySeat());
    boardG.rotation.y = ((me + 1) * Math.PI) / 2; lastRid = st.rid || 0; lastMid = st.mid || 0; lastTc = st.tc || 0;
    st.tokens.forEach((a, s) => a.forEach((p, t) => place(pawns[s][t], s, p, t))); restack();
    if (st.die) { const [rx, rz] = DIE_ROT[st.die]; die.rotation.set(rx, 0, rz); }
    if (st.turn === mySeat() && st.phase !== "over") banner("YOUR TURN!", CSS[st.turn]);
  } else {
    if ((st.rid || 0) !== lastRid) { lastRid = st.rid; busyN++; dieUntil = performance.now() + 1000; rollDieAnim(st.die, () => { busyN--; if (st.die === 6) { Snd.fx("six"); banner("SIX! 🎉", "#fde047"); } if (st.phase === "nomove" && st.turn === mySeat()) banner("No moves 😅"); ui(); }); }
    if ((st.mid || 0) !== lastMid && st.moved) {
      lastMid = st.mid; const m = st.moved, pw = pawns[m.s][m.t], pts = [];
      if (m.from < 0) pts.push(worldOf(m.s, 0, m.t)); else for (let p = m.from + 1; p <= m.to; p++) pts.push(worldOf(m.s, p, m.t));
      busyN++; pw.userData.p = m.to;
      const go = () => hop(pw, pts, () => {
        busyN--; place(pw, m.s, m.to, m.t);
        (m.caps || []).forEach(([o, k]) => { const c = pawns[o][k], [x, z] = [c.position.x, c.position.z]; Snd.fx("cap"); burst(x, z, [HEX[o], 0xffffff, 0x222222]);
          banner(m.s === mySeat() ? "CAPTURED! 💥" : o === mySeat() ? "OH NO! 😱" : "CAPTURED!", CSS[m.s]);
          const [bx, bz] = worldOf(o, -1, k); c.userData.anim = true;
          tw(700, (q) => c.position.set(x + (bx - x) * q, 0.16 + Math.sin(q * Math.PI) * 3, z + (bz - z) * q), () => { c.userData.anim = false; place(c, o, -1, k); restack(); }); });
        if (m.to >= 56) { Snd.fx("home"); burst(pw.position.x, pw.position.z, [HEX[m.s], 0xfde047, 0xffffff], 60); if (m.s === mySeat()) banner("HOME! 🏠", CSS[m.s]); }
        restack(); ui();
      });
      setTimeout(go, Math.max(0, dieUntil - performance.now()));
    }
    // sync any pawn that is out of place (e.g. after reconnect)
    const capSet = st.moved ? (st.moved.caps || []).map(([o, k]) => o + ":" + k) : [];
    st.tokens.forEach((a, s) => a.forEach((p, t) => { const pw = pawns[s][t]; if (!pw.userData.anim && pw.userData.p !== p && !(st.moved && st.moved.s === s && st.moved.t === t) && !capSet.includes(s + ":" + t)) place(pw, s, p, t); }));
    if ((st.tc || 0) !== lastTc) { lastTc = st.tc; if (st.turn === mySeat() && st.phase === "question") { Snd.fx("turn"); setTimeout(() => banner("YOUR TURN!", CSS[st.turn]), 900); try { if (navigator.vibrate && navigator.userActivation && navigator.userActivation.hasBeenActive) navigator.vibrate(80); } catch (e) {} } }
  }
  const ak = st.qAns ? st.tc + ":" + st.qAns.pick : "";
  if (ak && ak !== lastAns) { lastAns = ak; Snd.fx(st.qAns.ok ? "ok" : "bad"); }
  if (st.phase === "over") setTimeout(showFinal, 2600);
  ui();
}

/* ================= UI ================= */
let qKey = "";
function ui() {
  if (!S || !S.state.tokens) return; const st = S.state, me = mySeat(), cur = st.seats[st.turn], mine = st.turn === me;
  const qLeft = st.phase === "question" ? Math.max(0, 30000 - (now() - st.turnAt)) : 0;
  $("#chips").innerHTML = st.seats.map((x, s) => `<div class="chip ${s === st.turn && st.phase !== "over" ? "turn" : ""} ${s === me ? "me" : ""}" style="color:${CSS[s]}">
    <div class="top"><span class="av">${esc(x.avatar)}</span><span class="nm" style="color:#1f2937">${esc(x.name)}</span></div>
    <div class="sub"><span>🏠 ${st.tokens[s].filter((p) => p >= 56).length}/4</span><span>⭐ ${x.score || 0}</span></div>
    ${s === st.turn && st.phase === "question" ? `<div class="bar" style="width:${(qLeft / 30000) * 100}%"></div>` : ""}</div>`).join("");
  const left = endAt() ? endAt() - now() : 0; $("#clock").textContent = "⏱ " + (endAt() ? mmss(left) : "--:--");
  // status
  let msg = "";
  if (st.phase === "over") msg = "🏁 Game over!";
  else if (mine) msg = { question: "Your turn! Answer the question 👇", roll: "Correct! Roll the dice! 🎲", move: "Tap a glowing piece to move it", wrong: "Not this time… 😅", nomove: "No moves. Next player!" }[st.phase];
  else msg = `${cur.avatar} ${cur.name} ${{ question: "is answering…", roll: "is rolling…", move: "is moving…", wrong: "missed the question", nomove: "can't move" }[st.phase] || ""}`;
  $("#status").textContent = msg;
  $("#rollBtn").hidden = !(mine && st.phase === "roll" && !animBusy());
  // question panel (everyone sees it; only the player in turn can answer)
  const showQ = st.phase === "question" || (st.qAns && ["wrong", "roll"].includes(st.phase) && now() - st.turnAt < 2300);
  const key = showQ ? st.tc + ":" + st.phase + ":" + (st.qAns ? st.qAns.pick : "") : "";
  if (key !== qKey) {
    qKey = key; const P = $("#qPanel"); P.hidden = !showQ;
    if (showQ) { const q = QUESTIONS[st.q], pas = q.p ? PASSAGES[q.p] : null; if (st.phase === "question" && !qShownAt[st.tc + ":" + st.q]) qShownAt[st.tc + ":" + st.q] = performance.now();
      P.innerHTML = `<div class="qhead"><span class="topic">${esc(TOPICS[q.t])}</span><span>${mine ? "Your question" : esc(cur.avatar + " " + cur.name + "'s question")}</span></div>
        ${pas ? `<div class="passage"><b>📖 ${esc(pas.title)}</b><br>${esc(pas.text)}</div>` : ""}<div class="q">${esc(q.q)}</div>
        <div class="opts">${st.qo.map((oi, i) => `<button data-i="${i}" ${!mine || st.qAns ? "disabled" : ""} class="${st.qAns ? (oi === 0 ? "ok" : st.qAns.pick === i ? "no" : "") : ""}">${esc(q.o[oi])}</button>`).join("")}</div>
        ${st.qAns ? `<div class="tip">${st.qAns.ok ? "✅ Correct!" : st.qAns.pick < 0 ? "⏰ Time's up!" : "❌ The answer is: " + esc(q.o[0])}${q.ex ? " 💡 " + esc(q.ex) : ""}</div>` : ""}`;
      P.querySelectorAll(".opts button").forEach((b) => (b.onclick = () => { Snd.fx("click"); P.querySelectorAll("button").forEach((x) => (x.disabled = true)); logAns(st, +b.dataset.i); answer(+b.dataset.i); })); }
  }
}
setInterval(() => { if (S && S.status === "playing") ui(); if (S && S.status === "waiting") renderLobby(); }, 250);
function renderLobby() {
  const st = S.state; $("#lobbySeats").innerHTML = [0, 1, 2, 3].map((i) => { const x = st.seats[i];
    return x ? `<div class="seat" style="background:${CSS[i]}"><span class="av">${esc(x.avatar)}</span>${esc(x.name)}${x.pid === ME.id ? " (you)" : ""}</div>` : `<div class="seat empty"><span class="av">❔</span>Waiting…</div>`; }).join("");
  const age = now() - (S.created || now());
  $("#lobbyMsg").textContent = isFree() ? (st.seats.length >= 4 ? "Starting!" : `Starting in ${Math.max(0, Math.ceil((20000 - age) / 1000))}s… robots will fill empty seats 🤖`) : ROOM && ROOM.status === "playing" ? "Starting!" : "Waiting for your teacher to start…";
}
function showFinal() {
  if (!S || $("#hud").hidden) return; const st = S.state; Snd.fx("win");
  const order = st.seats.map((x, i) => [i, scoreOf(st, i)]).sort((a, b) => b[1] - a[1]);
  $("#finTitle").textContent = st.winner === mySeat() ? "🏆 You won!" : "🏁 Trip over!";
  $("#podium").innerHTML = order.map(([i, sc], k) => { const x = st.seats[i]; return `<div class="pl" style="background:${CSS[i]}"><span class="medal">${["🥇", "🥈", "🥉", "4️⃣"][k]}</span><span class="av">${esc(x.avatar)}</span><span>${esc(x.name)}${i === mySeat() ? " (you)" : ""}</span><span class="sc">⭐ ${sc}<br>✅ ${x.correct}/${x.answered}</span></div>`; }).join("");
  $("#againBtn").hidden = !isFree(); burst(0, 0, HEX, 90); show("final"); store.del("ludo_me");
}

/* ================= JOIN / ENTER ================= */
const AV = ["🧳", "✈️", "🚲", "🚂", "🚀", "🦙", "🐧", "🦩", "🗿", "🏄", "🧭", "🦊"];
let av = AV[0];
function renderAv() { $("#avs").innerHTML = AV.map((a) => `<button class="${a === av ? "on" : ""}">${a}</button>`).join(""); $("#avs").querySelectorAll("button").forEach((b) => (b.onclick = () => { av = b.textContent; Snd.init(); Snd.fx("click"); renderAv(); })); }
async function join(code) {
  Snd.init(); const name = $("#nm").value.trim(); $("#msg").textContent = "";
  if (!name) return ($("#msg").textContent = "Please write your name.");
  if (code !== "FREE" && code.length !== 5) return ($("#msg").textContent = "The game code has 5 letters.");
  $("#playBtn").disabled = $("#joinBtn").disabled = true;
  const { data, error } = await SB.rpc("join_ludo", { p_code: code, p_name: name, p_avatar: av });
  $("#playBtn").disabled = $("#joinBtn").disabled = false;
  if (error) { const m = error.message || ""; $("#msg").textContent = /ROOM_NOT_FOUND/.test(m) ? "We can't find that code." : /ROOM_ENDED/.test(m) ? "That game is over." : /BAD_NAME/.test(m) ? "Please use your real first name." : "Connection problem. Try again."; return; }
  ME = { id: data.player_id, secret: data.secret, code: data.code, tid: data.table_id }; store.set("ludo_me", ME); store.set("ludo_last", { name, av }); enter();
}
async function enter() {
  TID = ME.tid; POOL = null; builtFor = null; S = null; qKey = "";
  const { data: room } = await SB.from("rooms").select("*").eq("code", ME.code).maybeSingle(); ROOM = room;
  const { data: row } = await SB.from("ludo_tables").select("*").eq("id", TID).maybeSingle();
  if (!room || !row || row.status === "over") { store.del("ludo_me"); ME = null; show("home"); return; }
  if (chan) SB.removeChannel(chan); if (roomChan) SB.removeChannel(roomChan);
  chan = SB.channel("t" + TID).on("postgres_changes", { event: "UPDATE", schema: "public", table: "ludo_tables", filter: "id=eq." + TID }, (m) => apply(m.new)).subscribe((s) => { if (s === "SUBSCRIBED") refetch(); });
  if (!isFree()) roomChan = SB.channel("r" + ME.code).on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: "code=eq." + ME.code }, (m) => { ROOM = m.new; }).subscribe();
  pawns.forEach((a, s) => a.forEach((p, t) => place(p, s, -1, t)));
  apply(row, true);
}

/* ================= TEACHER ================= */
let T = null, tPl = new Map(), tChan = null;
async function createRoom() {
  const topics = [...document.querySelectorAll("#tTopics input:checked")].map((i) => i.value);
  if (!topics.length) return ($("#tMsg").textContent = "Choose at least one topic.");
  const { data, error } = await SB.rpc("create_room", { p_settings: { minutes: +$("#tMin").value, topics } });
  if (error) return ($("#tMsg").textContent = "Connection problem. Try again.");
  T = { code: data.code, key: data.teacher_key }; store.set("ludo_teacher", T); dash();
}
async function dash() {
  const { data: room } = await SB.from("rooms").select("*").eq("code", T.code).maybeSingle(); if (!room) { store.del("ludo_teacher"); T = null; return show("tSetup"); }
  ROOM = room; show("tDash"); homeSpin = true;
  $("#tUrl").textContent = location.host + " → 6° básico → Ludo World Tour"; $("#tCode").textContent = T.code; $("#tQr").innerHTML = "";
  try { new QRCode($("#tQr"), { text: location.origin + location.pathname + "?code=" + T.code, width: 180, height: 180 }); } catch (e) {}
  const { data: pl } = await SB.from("players").select("*").eq("room_code", T.code); tPl = new Map((pl || []).map((p) => [p.id, p])); renderDash();
  if (tChan) SB.removeChannel(tChan);
  tChan = SB.channel("d" + T.code).on("postgres_changes", { event: "*", schema: "public", table: "players", filter: "room_code=eq." + T.code }, (m) => { if (m.eventType === "DELETE") tPl.delete(m.old.id); else tPl.set(m.new.id, m.new); renderDash(); })
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: "code=eq." + T.code }, (m) => { ROOM = m.new; renderDash(); }).subscribe();
}
function renderDash() {
  const list = [...tPl.values()].sort((a, b) => b.net_worth - a.net_worth), tables = [...new Set([...tPl.values()].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map((p) => p.table_id))];
  $("#tCount").textContent = "(" + list.length + ")";
  $("#tRows").innerHTML = list.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.avatar)} ${esc(p.name)}</td><td>${tables.indexOf(p.table_id) + 1}</td><td>⭐ ${p.net_worth}</td><td>${p.correct}/${p.answered}</td></tr>`).join("") || `<tr><td colspan="5" style="color:#64748b">Waiting for students…</td></tr>`;
  const st = ROOM.status; $("#tStart").hidden = st !== "lobby"; $("#tMore").hidden = $("#tEnd").hidden = st !== "playing";
}
setInterval(() => { if (!T || $("#tDash").hidden || !ROOM) return; const st = ROOM.status;
  if (st === "playing") { const l = new Date(ROOM.ends_at).getTime() - now(); $("#tTimer").textContent = mmss(l); if (l <= 0) tSet("ended"); }
  else $("#tTimer").textContent = st === "lobby" ? mmss((ROOM.settings.minutes || 20) * 60000) : "Game over"; }, 500);
async function tSet(status, min) { const { data } = await SB.rpc("teacher_update", { p_code: T.code, p_key: T.key, p_status: status, p_minutes: min == null ? null : min, p_settings: null }); if (data) { ROOM = data; renderDash(); } }
function csv() {
  const rows = [["Name", "Score", "Correct", "Answered", "Accuracy %"]].concat([...tPl.values()].sort((a, b) => b.net_worth - a.net_worth).map((p) => [p.name, p.net_worth, p.correct, p.answered, p.answered ? Math.round((100 * p.correct) / p.answered) : 0]));
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\r\n")], { type: "text/csv" })); a.download = "ludo-" + T.code + ".csv"; a.click();
}

/* ================= WIRING ================= */
function init() {
  init3D(); renderAv(); $("#sndBtn").textContent = Snd.on ? "🔊" : "🔇";
  $("#tTopics").innerHTML = Object.entries(TOPICS).map(([k, v]) => `<label><input type="checkbox" value="${k}" checked> ${esc(v)}</label>`).join("");
  const last = store.get("ludo_last"); if (last) { $("#nm").value = last.name || ""; if (AV.includes(last.av)) { av = last.av; renderAv(); } }
  const code = (new URLSearchParams(location.search).get("code") || "").toUpperCase(); if (code) $("#code").value = code;
  $("#playBtn").onclick = () => join("FREE");
  $("#joinBtn").onclick = () => join($("#code").value.trim().toUpperCase());
  $("#code").onkeydown = (e) => { if (e.key === "Enter") $("#joinBtn").click(); };
  $("#rollBtn").onclick = () => { $("#rollBtn").hidden = true; doRoll(); };
  $("#sndBtn").onclick = () => { Snd.init(); Snd.toggle(); };
  $("#leaveBtn").onclick = $("#homeBtn").onclick = () => { store.del("ludo_me"); location.href = location.pathname; };
  $("#againBtn").onclick = () => join("FREE");
  $("#teachBtn").onclick = () => { const t = store.get("ludo_teacher"); if (t) { T = t; dash(); } else show("tSetup"); };
  $("#tBack").onclick = () => show("home");
  $("#createBtn").onclick = createRoom;
  $("#tStart").onclick = () => tSet("playing", ROOM.settings.minutes || 20);
  $("#tMore").onclick = () => tSet("playing", Math.ceil(Math.max(0, new Date(ROOM.ends_at).getTime() - now()) / 60000) + 5);
  $("#tEnd").onclick = () => { if (confirm("End the game for everyone?")) tSet("ended"); };
  $("#tCsv").onclick = csv;
  $("#tNew").onclick = () => { store.del("ludo_teacher"); T = null; show("tSetup"); };
  document.addEventListener("keydown", (e) => { if (e.code === "Space" && !$("#rollBtn").hidden) { e.preventDefault(); $("#rollBtn").click(); } });
  sync().then(() => { const me = store.get("ludo_me"); if (me && (!code || code === me.code)) { ME = me; enter(); } else show("home"); });
  setInterval(sync, 120000);
}
init();
})();
