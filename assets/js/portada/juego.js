/* Portada de eslteacher.cl · parte de index.html (se cargan en orden: datos, juego, mundos, voz, diagnostico, zone, perfil) */
/* =====================================================================
   SENSACIÓN DE JUEGO — sonidos, confeti, puntos (XP), palabras difíciles y medallas.
   Todo se guarda solo en el navegador del alumno.
   ===================================================================== */
let xp = store.get("xp", 0), stats = store.get("stats", {}), hard = store.get("hard", {});
let muted = store.get("muted", false), gotBadges = store.get("badges", []);

/* Sonidos (Kenney, CC0). Si el navegador no puede abrir .ogg (iPhone antiguo), se sintetizan. */
const SFX = ["click", "select", "correct", "wrong", "badge"];
const SYNTH = { click:[[700,.04]], select:[[540,.06]], correct:[[660,.09],[990,.16]], wrong:[[240,.12],[170,.2]], badge:[[523,.1],[659,.1],[784,.1],[1046,.3]] };
let actx = null; const sfxBuf = {};
function audioInit(){
  if (actx){ if (actx.state === "suspended") actx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  actx = new AC();
  SFX.forEach(k => fetch("assets/sfx/" + k + ".ogg")
    .then(r => r.ok ? r.arrayBuffer() : Promise.reject())
    .then(b => new Promise((res, rej) => actx.decodeAudioData(b, res, rej)))
    .then(buf => { sfxBuf[k] = buf; }).catch(() => {}));
}
addEventListener("pointerdown", audioInit, { passive:true });
addEventListener("keydown", audioInit);
function sfx(name){
  if (muted || !actx) return;
  if (actx.state === "suspended") actx.resume();
  if (sfxBuf[name]){
    const src = actx.createBufferSource(), g = actx.createGain();
    src.buffer = sfxBuf[name]; g.gain.value = name === "click" || name === "select" ? .35 : .6;
    src.connect(g); g.connect(actx.destination); src.start(); return;
  }
  let t = actx.currentTime;
  (SYNTH[name] || []).forEach(([f, d]) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = name === "wrong" ? "square" : "triangle"; o.frequency.value = f;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(name === "wrong" ? .07 : .16, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + d + .02); t += d * .85;
  });
}

/* Confeti */
const fxCanvas = document.getElementById("fx"), fxc = fxCanvas.getContext("2d");
let parts = [], fxRun = false;
function sizeFx(){ const d = Math.min(devicePixelRatio || 1, 2); fxCanvas.width = innerWidth * d; fxCanvas.height = innerHeight * d; fxc.setTransform(d, 0, 0, d, 0, 0); }
sizeFx(); addEventListener("resize", sizeFx);
const CONF = ["#58cc02", "#ffc800", "#ff4b4b", "#a560ff", "#3dd3ff", "#ff5fd2"];
function confetti(n = 80, el){
  if (reduced) return;
  let x = innerWidth / 2, y = innerHeight * .4;
  if (el){ const r = el.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
  for (let i = 0; i < n; i++){
    const a = -Math.PI / 2 + (Math.random() - .5) * (el ? 1.6 : 2.4), v = (el ? 5 : 8) + Math.random() * (el ? 6 : 10);
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6, vr: (Math.random() - .5) * .35,
      w: 6 + Math.random() * 6, h: 4 + Math.random() * 6, c: CONF[i % CONF.length], life: 0 });
  }
  if (!fxRun){ fxRun = true; requestAnimationFrame(fxTick); }
}
function fxTick(){
  fxc.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter(p => p.life < 150 && p.y < innerHeight + 30);
  parts.forEach(p => {
    p.life++; p.vy += .24; p.vx *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
    fxc.save(); fxc.translate(p.x, p.y); fxc.rotate(p.r); fxc.globalAlpha = Math.max(0, 1 - p.life / 150);
    fxc.fillStyle = p.c; fxc.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); fxc.restore();
  });
  if (parts.length) requestAnimationFrame(fxTick); else { fxRun = false; fxc.clearRect(0, 0, innerWidth, innerHeight); }
}
const replay = (el, cls) => { if (!el || reduced) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
const shake = el => replay(el, "shake");

/* Puntos */
function addXP(n){
  if (!n) return;
  xp += n; store.set("xp", xp); renderMe(); replay($("me-xp"), "bump");
}
function renderMe(){
  const av = (store.get("profile", {}).avatar) || "🙂", sess = store.get("session", null);
  $("me-av").textContent = av; $("tab-av").textContent = av;
  $("me").title = sess ? `${sess.first_name} · ${sess.section}` : "Mi perfil · Ingresa con tu RUT";
  $("me-streak").lastElementChild.textContent = dayStreak();
  $("me-xp").lastElementChild.textContent = xp;
}

/* Palabras difíciles: las que el alumno falla vuelven en el desafío hasta acertarlas 2 veces */
const hardList = () => Object.keys(hard).map(Number).filter(i => i >= 0 && i < WORDS.length);
function updHardN(){ $("qz-hard-n").textContent = hardList().length; }
function markHard(i){ hard[i] = 2; store.set("hard", hard); updHardN(); }
function clearHard(i){
  if (!hard[i]) return;
  if (--hard[i] <= 0){
    delete hard[i]; stats.hardCleared = (stats.hardCleared || 0) + 1; store.set("stats", stats);
    toast("🎯 ¡Dominaste “" + WORDS[i][1] + "”! Ya no está en tus palabras difíciles.");
  }
  store.set("hard", hard); updHardN();
}

/* Medallas */
const BADGES = [
  ["first",    "🌱", "Primera palabra completa",       s => s.words >= 1],
  ["words10",  "📚", "10 palabras completas",          s => s.words >= 10],
  ["streak3",  "🔥", "Racha de 3 días",                s => s.streak >= 3],
  ["streak7",  "🌟", "Racha de 7 días",                s => s.streak >= 7],
  ["quiz5",    "⚡", "5 seguidas en el desafío",       s => s.best >= 5],
  ["quiz10",   "🚀", "10 seguidas en el desafío",      s => s.best >= 10],
  ["correct50","🎯", "50 respuestas correctas",        s => s.correct >= 50],
  ["pron90",   "🎙", "90 o más en pronunciación",      s => s.pron >= 90],
  ["hard5",    "💪", "5 palabras difíciles dominadas", s => s.hardCleared >= 5],
  ["xp500",    "🏆", "500 XP",                         s => s.xp >= 500],
  ["zone10",   "🧠", "10 rondas en Challenge Zone",    s => s.zoneRounds >= 10],
  ["zone100",  "💯", "Ronda perfecta en Challenge Zone", s => s.zonePerfect >= 1]
];
const wordsCompleted = () => Object.values(wpDone).filter(p => STEPS.every(s => p[s])).length;
const badgeStats = () => ({ words: wordsCompleted(), streak: dayStreak(), best, correct: stats.correct || 0,
  pron: stats.pronBest || 0, hardCleared: stats.hardCleared || 0, xp,
  zoneRounds: stats.zoneRounds || 0, zonePerfect: stats.zonePerfect || 0 });
function checkBadges(){
  const s = badgeStats(); let delay = 600;
  BADGES.forEach(([id, ic, name, test]) => {
    if (gotBadges.includes(id) || !test(s)) return;
    gotBadges.push(id); store.set("badges", gotBadges);
    setTimeout(() => { sfx("badge"); confetti(180); toast(`🏅 ¡Nueva medalla! ${ic} ${name}`); }, delay);
    delay += 2500;
  });
}

