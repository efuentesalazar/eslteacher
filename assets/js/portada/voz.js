/* Portada de eslteacher.cl · parte de index.html (se cargan en orden: datos, juego, mundos, voz, diagnostico, zone, perfil) */
/* =====================================================================
   VOZ (texto a voz)
   ===================================================================== */
const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
let voices = [];
function loadVoices(){ try { voices = speechSynthesis.getVoices(); } catch(e){} if (typeof renderVoices === "function") renderVoices(); }
if ("speechSynthesis" in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
/* Elegir la voz más natural disponible.
   Edge: "Microsoft Aria/Jenny… Online (Natural)" · Chrome: "Google US English" · iPhone/Mac: voces "Enhanced/Premium".
   Las voces antiguas de Windows (David, Zira, Mark) suenan robóticas y quedan al final. */
function voiceScore(v){
  let s = /^en[-_]US/i.test(v.lang) ? 30 : /^en[-_](GB|AU|CA|IE|NZ)/i.test(v.lang) ? 20 : 10;
  if (/natural|neural/i.test(v.name)) s += 60;
  else if (/premium|enhanced/i.test(v.name)) s += 50;
  else if (/google/i.test(v.name)) s += 45;
  else if (/online/i.test(v.name)) s += 40;
  else if (/samantha|ava|allison|susan|karen|daniel|serena|moira/i.test(v.name)) s += 25;   // buenas voces de Apple
  if (/david|zira|mark|hazel|george|desktop/i.test(v.name) && !/online|natural/i.test(v.name)) s -= 25;
  if (/novelty|whisper|bad news|bells|boing|bubbles|cellos|jester|organ|trinoids|zarvox|albert|fred|junior|ralph|kathy|bahh|superstar|grandma|grandpa|rocko|shelley|flo|eddy|reed|sandy/i.test(v.name)) s -= 80;
  return s;
}
function englishVoices(){ return voices.filter(v => /^en[-_]/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a)); }
function pickVoice(local){
  if (!voices.length) loadVoices();
  const list = englishVoices().filter(v => !local || v.localService);
  const chosen = store.get("voice", "");
  return (chosen && !local && list.find(v => v.name === chosen)) || list[0];
}
// Avisos en fila: si llegan varios juntos, se muestran uno tras otro
const toastQ = []; let toastAt = 0;
function toast(msg){
  toastQ.push(msg);
  if (toastQ.length === 1) setTimeout(showToast, Math.max(0, toastAt + 2800 - Date.now()));
}
function showToast(){
  let el = document.getElementById("toast");
  if (!el){ el = document.createElement("div"); el.id = "toast"; el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
  el.textContent = toastQ[0]; el.classList.add("on"); toastAt = Date.now();
  clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), 7000);
  toastQ.shift();
  if (toastQ.length) setTimeout(showToast, 2800);
}
// Lectura lenta: varias voces (sobre todo las "online") casi no cambian con rate,
// así que además se lee por trozos de 2–3 palabras, con una pausa entre cada uno.
function slowParts(t){
  const parts = [];
  t.replace(/([,;:.?!])\s+/g, "$1\n").split("\n").forEach(seg => {
    const w = seg.split(/\s+/).filter(Boolean);
    for (let i = 0; i < w.length; i += 3) parts.push(w.slice(i, i + 3).join(" "));
  });
  return parts.length ? parts : [t];
}
function speakSlow(t){ speak(slowParts(t), .7); }
function speak(t, rate = .9){
  if (!("speechSynthesis" in window)){ toast("Este navegador no puede leer en voz alta."); return; }
  if (listening && rec){ try { rec.abort(); } catch(e){} }
  const parts = Array.isArray(t) ? t : [t];
  const v = pickVoice();
  let started = false;
  const mk = (txt, voice) => {
    const x = new SpeechSynthesisUtterance(txt); x.lang = "en-US"; x.rate = rate; x.volume = 1;
    if (voice){ x.voice = voice; x.lang = voice.lang; }
    return x;
  };
  const utts = parts.map(p => mk(p, v));
  const u = utts[0];
  u.onstart = () => { started = true; };
  // Las voces "online" necesitan internet: si fallan, se repite con una voz del dispositivo
  u.onerror = e => {
    if (started || !v || v.localService || e.error === "interrupted" || e.error === "canceled") return;
    const lv = pickVoice(true); if (!lv) return;
    speechSynthesis.cancel();
    parts.forEach(p => speechSynthesis.speak(mk(p, lv)));
  };
  const sayAll = () => utts.forEach(x => speechSynthesis.speak(x));
  // En iPhone, cancel() justo antes de speak() puede tragarse la voz nueva:
  // solo se cancela si algo está sonando, y se espera un momento antes de hablar.
  if (speechSynthesis.speaking || speechSynthesis.pending){
    speechSynthesis.cancel();
    setTimeout(sayAll, 150);
  } else {
    speechSynthesis.resume();
    sayAll();                                 // directo dentro del toque (Safari lo exige)
  }
  if (isIOS){
    if (!store.get("ttsTip", false)){ store.set("ttsTip", true); toast("🔊 ¿No se escucha? Desactiva el modo silencio del iPhone (interruptor lateral) y sube el volumen."); }
    setTimeout(() => { if (!started) toast("🔊 No se escucha la voz: revisa que el iPhone no esté en modo silencio y que el volumen esté alto."); }, 1800);
  }
}

/* =====================================================================
   PALABRA DEL DÍA
   ===================================================================== */
// Una palabra por día: el 1 de enero es la palabra 1, el 31 de diciembre la 365
function dayOfYear(d = new Date()){
  return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 86400000);
}
const todayIndex = (dayOfYear() - 1) % WORDS.length;
const todayKey = new Date().toLocaleDateString("en-CA");      // AAAA-MM-DD
let wIndex = todayIndex;
const wordRe = (w, suffix = "") => new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + suffix + "\\b", "i");
const dateOf = i => new Date(new Date().getFullYear(), 0, i + 1).toLocaleDateString("es-CL", { day:"numeric", month:"long" });

// Progreso: qué pasos se hicieron con cada palabra, y qué días se completó la palabra del día
let wpDone = store.get("wpDone", {});            // { indice: { complete:1, write:1, say:1 } }
let daysDone = store.get("daysDone", []);        // ["2026-10-28", ...]
const STEPS = ["complete", "write", "say"];
function markStep(i, step){
  const first = !(wpDone[i] || {})[step];
  wpDone[i] = { ...(wpDone[i] || {}), [step]: 1 }; store.set("wpDone", wpDone);
  if (first) addXP(15);
  if (i === todayIndex && STEPS.every(s => wpDone[i][s]) && !daysDone.includes(todayKey)){
    daysDone = [...daysDone, todayKey].slice(-400); store.set("daysDone", daysDone);
    addXP(30); sfx("badge"); confetti(160);
    toast("🏆 ¡Completaste la palabra del día! +30 ⭐ · Racha: " + dayStreak() + (dayStreak() === 1 ? " día" : " días"));
  }
  renderProgress(); renderMe(); checkBadges();
}
function dayStreak(){
  let n = 0; const d = new Date();
  if (!daysDone.includes(d.toLocaleDateString("en-CA"))) d.setDate(d.getDate() - 1);   // la racha sigue viva si hoy aún no practicas
  while (daysDone.includes(d.toLocaleDateString("en-CA"))){ n++; d.setDate(d.getDate() - 1); }
  return n;
}
function renderProgress(){
  const p = wpDone[wIndex] || {};
  const labels = { complete:"1 · Complete", write:"2 · Write", say:"3 · Say it" };
  $("wp-tabs").querySelectorAll(".chip").forEach(c => { c.textContent = labels[c.dataset.p] + (p[c.dataset.p] ? " ✓" : ""); });
  const done = STEPS.filter(s => p[s]).length, st = dayStreak();
  $("wp-progress").textContent = `${done}/3 completado` + (st ? ` · 🔥 Racha: ${st} ${st === 1 ? "día" : "días"}` : "");
}

function showWord(){
  const [e, w, es, ex] = WORDS[wIndex];
  $("w-emoji").textContent = e; $("w-word").textContent = w;
  $("w-es").textContent = es; $("w-ex").textContent = "“" + ex + "”";
  const isToday = wIndex === todayIndex;
  $("w-day").textContent = (isToday ? "⭐ Today · " : "") + `Day ${wIndex + 1} · 365 · ${dateOf(wIndex)}`;
  $("w-today").classList.toggle("hidden", isToday);
  // Ejercicio 1: completar la oración
  $("wp-gap").innerHTML = esc(ex).replace(wordRe(esc(w)), "<b>_____</b>");
  $("wp-in").value = ""; $("wp-msg1").textContent = ""; hintLevel = 0;
  // Ejercicio 2: oración propia
  $("wp-word2").textContent = "“" + w + "”";
  $("wp-sent").value = ""; $("wp-msg2").textContent = ""; $("wp-sent-actions").classList.add("hidden");
  renderProgress();
}
$("w-next").addEventListener("click", () => { wIndex = (wIndex + 1) % WORDS.length; showWord(); });
$("w-prev").addEventListener("click", () => { wIndex = (wIndex - 1 + WORDS.length) % WORDS.length; showWord(); });
$("w-today").addEventListener("click", () => { wIndex = todayIndex; showWord(); });
$("w-say").addEventListener("click", () => { const [,w,,ex] = WORDS[wIndex]; speak(w + ". " + ex, .85); });
if (!("speechSynthesis" in window)) $("w-say").classList.add("hidden");

// Pestañas de práctica
function showPane(p){
  $("wp-tabs").querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c.dataset.p === p));
  document.querySelectorAll(".wp-pane").forEach(el => el.classList.toggle("hidden", el.dataset.p !== p));
}
$("wp-tabs").querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => showPane(c.dataset.p)));

// 1 · Completar
let hintLevel = 0;
function checkGap(){
  const w = WORDS[wIndex][1], v = norm($("wp-in").value.trim()).replace(/[^a-z' -]/g, "");
  if (!v){ $("wp-msg1").textContent = "Escribe la palabra que falta."; return; }
  logPortada("portada", { activity: "Word of the day", item: { id: "w:" + w, k: "WRIT", q: WORDS[wIndex][3].replace(wordRe(w), "_____") },
    chosen: $("wp-in").value.trim(), right: w, ok: v === norm(w) });
  if (v === norm(w)){
    $("wp-msg1").textContent = "✅ ¡Correcto! “" + WORDS[wIndex][3] + "”";
    sfx("correct"); confetti(60, $("wp-check"));
    speak(WORDS[wIndex][3], .9); markStep(wIndex, "complete");
    setTimeout(() => showPane("write"), 1600);
  } else {
    $("wp-msg1").textContent = "❌ Casi. Mira la palabra de arriba o usa la pista 💡 e inténtalo otra vez.";
    sfx("wrong"); shake($("wp-in").parentElement); markHard(wIndex);
  }
}
$("wp-check").addEventListener("click", checkGap);
$("wp-in").addEventListener("keydown", e => { if (e.key === "Enter") checkGap(); });
$("wp-hint").addEventListener("click", () => {
  const w = WORDS[wIndex][1]; hintLevel = Math.min(hintLevel + 1, w.length);
  $("wp-msg1").textContent = "💡 Empieza con: " + w.slice(0, hintLevel) + "_".repeat(w.length - hintLevel) + `  (${w.length} letras)`;
});

// 2 · Escribir una oración propia
function checkSentence(){
  const [, w, , ex] = WORDS[wIndex], s = $("wp-sent").value.trim();
  const n = s.split(/\s+/).filter(Boolean).length;
  $("wp-sent-actions").classList.add("hidden");
  if (!s){ $("wp-msg2").textContent = "Escribe una oración en inglés."; return; }
  if (!wordRe(w, "(s|es|ed|d|ing|'s)?").test(s)){ $("wp-msg2").textContent = `Tu oración debe usar la palabra “${w}”. ¡Inténtalo!`; return; }
  if (n < 4){ $("wp-msg2").textContent = "Escribe una oración un poco más larga (mínimo 4 palabras)."; return; }
  if (norm(s).replace(/[^a-z ]/g, "") === norm(ex).replace(/[^a-z ]/g, "")){ $("wp-msg2").textContent = "Esa es la oración de ejemplo 😉 Crea una distinta, sobre ti o tu día."; return; }
  const tips = [];
  if (!/^[A-Z¿¡"“]/.test(s)) tips.push("empieza con mayúscula");
  if (!/[.!?]["”]?$/.test(s)) tips.push("termina con un punto (.), ! o ?");
  $("wp-msg2").textContent = "✅ ¡Muy bien! Usaste “" + w + "” en tu propia oración." + (tips.length ? " Tip: " + tips.join(" y ") + "." : "");
  $("wp-sent-actions").classList.remove("hidden");
  sfx("correct"); confetti(60, $("wp-check2"));
  store.set("lastSentence", { i: wIndex, s });
  markStep(wIndex, "write");
}
$("wp-check2").addEventListener("click", checkSentence);
$("wp-sent").addEventListener("keydown", e => { if (e.key === "Enter") checkSentence(); });
$("wp-sent-listen").addEventListener("click", () => speak($("wp-sent").value.trim(), .9));

// 3 · Decirlo en voz alta (usa la sección Speak)
let wpSay = null;   // recuerda qué frase se envió desde la palabra del día
function goSpeak(text, meaning, m){
  wpSay = { i: wIndex, text };
  setMode(m, false); if (m === "own") $("own-in").value = text;
  setTarget(text, meaning);
  goTo("speak");
}
$("wp-say-word").addEventListener("click", () => { const [, w, es] = WORDS[wIndex]; goSpeak(w, "⭐ Word of the day · " + es, "words"); });
$("wp-say-ex").addEventListener("click", () => { const [, w, es, ex] = WORDS[wIndex]; goSpeak(ex, "⭐ Word of the day: " + w + " (" + es + ")", "sentences"); });
$("wp-sent-say").addEventListener("click", () => goSpeak($("wp-sent").value.trim(), "⭐ Tu oración con “" + WORDS[wIndex][1] + "”", "own"));
$("w-challenge").addEventListener("click", () => {
  qzForce = wIndex; newQuiz();
  goTo("challenge");
});
showWord();

/* =====================================================================
   DESAFÍO RÁPIDO — conectado con la palabra del día
   Preguntas sobre las palabras de los últimos 30 días (o las 365),
   y la palabra de hoy aparece al inicio y cada 4 preguntas.
   ===================================================================== */
let qz = null, streak = 0, best = store.get("best", 0), qzMode = "recent", qzCount = 0, qzForce = null;
const rnd1 = n => Math.floor(Math.random() * n);
function quizPool(){
  if (qzMode === "hard") return hardList();
  if (qzMode === "all") return WORDS.map((_, i) => i);
  return Array.from({ length: 30 }, (_, k) => (todayIndex - k + WORDS.length) % WORDS.length);
}
function distractors(a, field, n = 2){
  const used = new Set([norm(WORDS[a][field])]), out = [];
  while (out.length < n){
    const i = rnd1(WORDS.length), v = norm(WORDS[i][field]);
    if (i !== a && !used.has(v)){ used.add(v); out.push(i); }
  }
  return out;
}
function newQuiz(){
  qzCount++;
  let a;
  const hardNow = hardList();
  if (qzMode === "hard" && !hardNow.length){
    toast("🎉 ¡No tienes palabras difíciles! Las que falles aparecerán aquí para repasarlas.");
    qzMode = "recent"; $("qz-modes").querySelectorAll(".chip[data-q]").forEach(x => x.classList.toggle("on", x.dataset.q === "recent"));
  }
  if (qzForce !== null){ a = qzForce; qzForce = null; }
  else if (qzMode !== "hard" && (qzCount === 1 || qzCount % 4 === 0)) a = todayIndex;
  // Repaso: de vez en cuando vuelve una palabra que el alumno falló
  else if (qzMode !== "hard" && hardNow.length && Math.random() < .3){ const p = hardNow.filter(i => !qz || i !== qz.a); a = p.length ? p[rnd1(p.length)] : hardNow[0]; }
  else { let pool = quizPool().filter(i => !qz || i !== qz.a); if (!pool.length) pool = quizPool(); a = pool[rnd1(pool.length)]; }
  const [e, w, es, ex] = WORDS[a];
  const type = ["meaning", "reverse", "gap"][rnd1(3)];
  const field = type === "meaning" ? 2 : 1;            // opciones en español o en inglés
  const opts = [a, ...distractors(a, field)].sort(() => Math.random() - .5);
  qz = { a, opts, done: false, type, field, t0: Date.now() };
  const tag = a === todayIndex ? `<span class="qtag">⭐ Word of the day</span>` : hard[a] ? `<span class="qtag hard">🎯 Repaso</span>` : "";
  if (type === "meaning"){
    $("qz-type").textContent = "What does it mean? · ¿Qué significa?";
    $("qz-q").innerHTML = `${tag}${e} What does <em>${esc(w)}</em> mean?`;
  } else if (type === "reverse"){
    $("qz-type").textContent = "Say it in English · ¿Cómo se dice en inglés?";
    $("qz-q").innerHTML = `${tag}${e} How do you say <em>${esc(es)}</em> in English?`;
  } else {
    $("qz-type").textContent = "Complete the sentence · Completa la oración";
    $("qz-q").innerHTML = `${tag}${esc(ex).replace(wordRe(esc(w)), "<em>_____</em>")}`;
  }
  $("qz-opts").innerHTML = opts.map((i, k) => `<button class="opt" type="button" data-i="${i}"><i>${"ABC"[k]}</i>${esc(WORDS[i][field])}</button>`).join("");
  $("qz-opts").querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => answer(b)));
}
function answer(b){
  if (qz.done) return; qz.done = true;
  const ok = +b.dataset.i === qz.a;
  { // queda en el Panel del profe (solo con sesión iniciada)
    const [, w, es, ex] = WORDS[qz.a];
    logPortada("portada", { activity: "Quick challenge", ms: Date.now() - qz.t0,
      item: { k: { meaning: "MEAN", reverse: "REV", gap: "GAP" }[qz.type],
              q: qz.type === "meaning" ? `What does “${w}” mean?` : qz.type === "reverse" ? `How do you say “${es}” in English?` : ex.replace(wordRe(w), "_____") },
      chosen: WORDS[+b.dataset.i][qz.field], right: WORDS[qz.a][qz.field], ok });
  }
  $("qz-opts").querySelectorAll(".opt").forEach(x => { if (+x.dataset.i === qz.a) x.classList.add("ok"); });
  if (!ok){ b.classList.add("bad"); shake(b); sfx("wrong"); markHard(qz.a); }
  else {
    sfx("correct"); addXP(10); clearHard(qz.a);
    stats.correct = (stats.correct || 0) + 1; store.set("stats", stats);
    if ((streak + 1) % 5 === 0) confetti(120); else confetti(40, b);
  }
  streak = ok ? streak + 1 : 0; if (streak > best){ best = streak; store.set("best", best); }
  $("qz-streak").textContent = streak; $("qz-best").textContent = best;
  if (ok && !reduced){ const s = $("qz-streak"); s.classList.remove("bump"); void s.offsetWidth; s.classList.add("bump"); }
  if (ok) speak(WORDS[qz.a][1]);
  checkBadges();
  setTimeout(() => { if (qz.done) newQuiz(); }, ok ? 1100 : 2200);
}
$("qz-modes").querySelectorAll(".chip[data-q]").forEach(c => c.addEventListener("click", () => {
  qzMode = c.dataset.q;
  $("qz-modes").querySelectorAll(".chip[data-q]").forEach(x => x.classList.toggle("on", x === c));
  newQuiz();
}));
$("qz-next").addEventListener("click", newQuiz);
$("qz-best").textContent = best;
newQuiz();

/* =====================================================================
   PRÁCTICA DE PRONUNCIACIÓN — todo se calcula en el navegador (gratis)
   ===================================================================== */
let mode = "words", target = { text:"", meaning:"" }, attempts = store.get("attempts", []);

function setTarget(text, meaning = ""){
  target = { text, meaning };
  $("t-phrase").textContent = text; $("t-meaning").textContent = meaning;
  $("heard").textContent = ""; $("fb").classList.add("hidden");
}
function randomTarget(){
  if (mode === "words"){ const w = WORDS[Math.floor(Math.random()*WORDS.length)]; setTarget(w[1], w[2]); }
  else if (mode === "sentences"){ const w = WORDS[Math.floor(Math.random()*WORDS.length)]; setTarget(w[3], "Palabra clave: " + w[1] + " (" + w[2] + ")"); }
  else if (mode === "twisters"){ const t = TWISTERS[Math.floor(Math.random()*TWISTERS.length)]; setTarget(t[0], t[1]); }
}
function setMode(m, pick = true){
  mode = m;
  $("modes").querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c.dataset.m === m));
  $("own").classList.toggle("hidden", m !== "own");
  $("t-new").classList.toggle("hidden", m === "own");
  if (m === "own"){ setTarget($("own-in").value.trim() || "Write your own sentence below ↓", ""); $("own-in").focus(); }
  else if (pick) randomTarget();
}
$("modes").querySelectorAll(".chip").forEach(c => c.addEventListener("click", () => setMode(c.dataset.m)));
$("own-set").addEventListener("click", () => { const v = $("own-in").value.trim(); if (v) setTarget(v, "Tu frase · Your sentence"); });
$("own-in").addEventListener("keydown", e => { if (e.key === "Enter") $("own-set").click(); });
$("t-listen").addEventListener("click", () => speak(target.text, .9));
$("t-slow").addEventListener("click", () => speakSlow(target.text));

/* Selector de voz: la recomendada (más natural) queda primera y elegida por defecto */
function renderVoices(){
  const sel = document.getElementById("voice-sel"); if (!sel) return;
  const list = englishVoices();
  document.getElementById("voice-wrap").classList.toggle("hidden", list.length < 2);
  const chosen = store.get("voice", "");
  sel.innerHTML = list.map((v, i) => {
    const nice = v.name.replace(/^Microsoft\s+/, "").replace(/\s*-\s*English.*$/, "").replace(/\s*\(.*?English.*?\)/, "");
    return `<option value="${esc(v.name)}" ${(chosen ? v.name === chosen : i === 0) ? "selected" : ""}>${i === 0 ? "⭐ " : ""}${esc(nice)} · ${v.lang}${voiceScore(v) >= 70 ? " · natural" : ""}${!v.localService ? " · online" : ""}</option>`;
  }).join("");
}
$("voice-sel").addEventListener("change", e => { store.set("voice", e.target.value); speak("Hello! This is my voice.", .95); });
renderVoices();
$("t-new").addEventListener("click", randomTarget);
setTarget(WORDS[wIndex][1], WORDS[wIndex][2]);

/* Reconocimiento de voz del navegador */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, listening = false, heardText = "", alternatives = [], confidence = 0;
if (!SR){
  $("sr-note").textContent = "Tu navegador no permite grabar voz aquí. Usa Google Chrome o Microsoft Edge (computador o Android) para practicar tu pronunciación.";
  $("rec").disabled = true;
} else {
  $("sr-note").textContent = "Consejo: habla claro, cerca del micrófono y en un lugar sin ruido. El navegador pedirá permiso para usar el micrófono.";
}
function setListening(on){
  listening = on;
  $("rec").classList.toggle("live", on);
  $("rec-label").textContent = on ? "■ Stop · Detener" : "● Record · Grabar";
}
$("rec").addEventListener("click", () => {
  if (listening){ rec && rec.stop(); return; }
  if (!target.text || mode === "own" && !$("own-in").value.trim() && target.text.startsWith("Write your own")){ $("own-in").focus(); return; }
  if ("speechSynthesis" in window && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
  heardText = ""; alternatives = []; confidence = 0;
  rec = new SR(); rec.lang = "en-US"; rec.interimResults = true; rec.maxAlternatives = 3; rec.continuous = false;
  rec.onresult = e => {
    let fin = "", interim = "";
    for (let i = 0; i < e.results.length; i++){
      const r = e.results[i];
      if (r.isFinal){ fin += r[0].transcript; confidence = r[0].confidence || 0; alternatives = Array.from({length:r.length}, (_, k) => r[k].transcript); }
      else interim += r[0].transcript;
    }
    heardText = (fin || interim).trim();
    $("heard").textContent = "I heard · Escuché: “" + heardText + "”";
  };
  rec.onerror = e => {
    const msg = { "not-allowed":"Necesito permiso para usar el micrófono. Revisa el ícono 🔒 junto a la dirección del sitio.",
      "no-speech":"No te escuché. Presiona Grabar y habla un poco más fuerte.", "audio-capture":"No encontré un micrófono conectado.",
      "network":"Se necesita internet para reconocer tu voz." }[e.error] || "Hubo un problema con el micrófono. Intenta otra vez.";
    $("heard").textContent = msg;
  };
  rec.onend = () => { setListening(false); if (heardText) evaluate(); };
  try { rec.start(); setListening(true); $("heard").textContent = "Listening… · Te escucho…"; } catch(e){ setListening(false); }
});

/* Comparación palabra por palabra */
const words = s => norm(s).replace(/[^a-z0-9'\s-]/g, " ").replace(/-/g, " ").split(/\s+/).filter(Boolean);
function lev(a, b){
  const m = a.length, n = b.length; if (!m || !n) return Math.max(m, n);
  let prev = Array.from({length:n+1}, (_, j) => j);
  for (let i = 1; i <= m; i++){ const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j]+1, cur[j-1]+1, prev[j-1] + (a[i-1] === b[j-1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
// Dos palabras cuentan como iguales si coinciden, o si difieren en 1 letra SIN que esa letra sea un error
// de sonido típico (así "tree" ya no pasa por "three", ni "sit" por "seat")
const same = (a, b) => a === b || a.replace(/'/g,"") === b.replace(/'/g,"") ||
  (Math.max(a.length,b.length) > 4 && lev(a,b) <= 1 && !diagnose(a, b));
function align(tw, hw){
  const m = tw.length, n = hw.length, dp = Array.from({length:m+1}, () => new Array(n+1).fill(0));
  for (let i = m-1; i >= 0; i--) for (let j = n-1; j >= 0; j--) dp[i][j] = same(tw[i], hw[j]) ? dp[i+1][j+1] + 1 : Math.max(dp[i+1][j], dp[i][j+1]);
  const out = []; let i = 0, j = 0, pendT = [], pendH = [];
  const flush = () => { pendT.forEach((w, k) => out.push({ word:w, status: pendH[k] ? "unclear" : "missing", heard: pendH[k] || "" })); pendT = []; pendH = []; };
  while (i < m && j < n){
    if (same(tw[i], hw[j])){ flush(); out.push({ word:tw[i], status:"ok", heard:hw[j] }); i++; j++; }
    else if (dp[i+1][j] >= dp[i][j+1]) pendT.push(tw[i++]); else pendH.push(hw[j++]);
  }
  while (i < m) pendT.push(tw[i++]); while (j < n) pendH.push(hw[j++]); flush();
  return out;
}

