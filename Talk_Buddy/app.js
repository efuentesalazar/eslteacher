/* Talk Buddy · conversaciones cortas en inglés con una IA que corre en el computador del alumno (WebLLM + WebGPU).
   - Gratis: no usa ninguna API de pago. El modelo se descarga una vez y queda guardado en el navegador.
   - Privado: el texto de la conversación no sale del dispositivo. Al Panel del profe (solo alumnos con sesión)
     llega por cada turno: tema, si habló o escribió, cuántas palabras y si respondió en inglés con 3+ palabras.
   - Voz: reconocimiento y lectura en voz alta del propio navegador. */
import { logAnswer, student } from "/assets/js/eslt-track.js";

const GAME = "talk-buddy";
const WEBLLM = "https://esm.run/@mlc-ai/web-llm@0.2.89";
const GOAL = 8;                     // turnos del alumno para "completar" una conversación corta
const $ = id => document.getElementById(id);

/* ---------- Niveles por curso ---------- */
const LEVELS = {
  "5b": { name: "5° básico", age: "10 to 11", max: 12, rate: .85, desc: "beginner (CEFR A1). Use very short, simple sentences, the present simple and very common words." },
  "6b": { name: "6° básico", age: "11 to 12", max: 14, rate: .88, desc: "beginner (CEFR A1). Use short, simple sentences and very common words. The student is learning the past simple." },
  "7b": { name: "7° básico", age: "12 to 13", max: 18, rate: .92, desc: "elementary (CEFR A2). Use short, clear sentences and everyday words." },
  "8b": { name: "8° básico", age: "13 to 14", max: 20, rate: .95, desc: "elementary (CEFR A2). Use clear sentences and everyday words." },
  "1m": { name: "1° medio",  age: "14 to 15", max: 25, rate: 1,   desc: "pre-intermediate (CEFR A2+/B1). Use natural but clear English." },
  "3m": { name: "3° medio",  age: "16 to 17", max: 30, rate: 1,   desc: "intermediate (CEFR B1). Use natural English and some useful expressions." }
};

/* ---------- Temas ---------- */
// [emoji, tema, primera pregunta de Buddy]
const TOPICS = [
  ["👨‍👩‍👧", "My family", "Do you have brothers or sisters?"], ["🍕", "Food", "What is your favourite food?"],
  ["⚽", "Sports", "Do you like sports? Which one?"], ["🎮", "Video games", "Do you play video games? What is your favourite game?"],
  ["🐶", "Animals and pets", "Do you have a pet? What animal do you like?"], ["🎵", "Music", "What kind of music do you like?"],
  ["🏫", "School", "What is your favourite subject at school?"], ["🎬", "Movies and series", "What is a movie or series you like?"],
  ["🏖️", "Holidays and travel", "Where do you like to go on holiday?"], ["☀️", "The weather", "What's the weather like today?"],
  ["🗓️", "My weekend", "What do you usually do on the weekend?"], ["🇨🇱", "Chile", "What is your favourite place in Chile?"],
  ["🚀", "The future", "What do you want to be in the future?"], ["🎲", "Surprise me!", ""]
];
const FOLLOW = ["Can you tell me more?", "Why?", "How did you feel?", "What else do you like?", "Who was with you?", "And what about you?"];
const SURPRISE = ["superheroes", "my dream house", "space", "cooking", "dinosaurs", "a perfect day", "the sea", "robots", "birthdays", "my favourite place"];

/* ---------- Modelos (WebLLM) ---------- */
const MODELS = {
  tiny:  { base: "Qwen2.5-0.5B-Instruct", title: "🪶 Tiny", gb: [0.4, 0.5], note: "For slow or old computers · simpler answers" },
  light: { base: "Llama-3.2-1B-Instruct", title: "⚡ Fast", gb: [0.9, 1.1], note: "Works on most computers" },
  smart: { base: "Llama-3.2-3B-Instruct", title: "🧠 Smarter", gb: [2.3, 3.0], note: "Better answers · needs a good computer" }
};

/* ---------- Estado ---------- */
let webllm = null, engine = null, loadedModel = null, f16 = false;
let level = "7b", topic = "", topicLabel = "", modelKey = localStorage.getItem("tb_model") || "light";
let history = [], turns = 0, wordsTotal = 0, busy = false, lastBotAt = 0, voiceOn = localStorage.getItem("tb_voice") !== "0";

/* ================= Inicio ================= */
init();
async function init() {
  const why = await gpuProblem();
  if (why) { $("nogpu").hidden = false; $("gpuwhy").textContent = why; return; }
  level = pickLevel();
  $("level").value = level;
  $("level").onchange = () => level = $("level").value;
  const s = student();
  $("who").textContent = s ? `Playing as ${s.first_name || s.name} (${s.section}). Your teacher sees how many turns you complete, not what you write.` : "Tip: log in at eslteacher.cl so your teacher can see your progress.";
  drawTopics(); await drawModels();
  $("setup").hidden = false;
  $("start").onclick = start;
  $("custom").addEventListener("keydown", e => { if (e.key === "Enter") start(); });
  $("custom").addEventListener("input", () => { if ($("custom").value.trim()) document.querySelectorAll("#topics .chip").forEach(c => c.setAttribute("aria-pressed", "false")); });
}

async function gpuProblem() {
  if (!("gpu" in navigator)) return "WebGPU no está disponible en este navegador.";
  try {
    const ad = await navigator.gpu.requestAdapter();
    if (!ad) return "El navegador no encontró una tarjeta gráfica disponible. Si Talk Buddy funcionaba antes en este equipo, cierra TODAS las ventanas del navegador y vuelve a abrirlo (después de un error de la tarjeta gráfica, el navegador la bloquea hasta reiniciarse).";
    f16 = ad.features.has("shader-f16");
    return "";
  } catch (e) { return "Error al revisar WebGPU: " + e.message; }
}

function pickLevel() {
  const g = new URLSearchParams(location.search).get("g");
  if (g && LEVELS[g]) return g;
  const s = student(), m = s && /^(\d)°/.exec(s.section || "");
  if (m) { const n = +m[1], id = n >= 5 ? n + "b" : n + "m"; if (LEVELS[id]) return id; }
  return localStorage.getItem("tb_level") || "7b";
}

function drawTopics() {
  const box = $("topics");
  TOPICS.forEach(([ic, name], i) => {
    const b = document.createElement("button");
    b.className = "chip"; b.textContent = ic + " " + name; b.dataset.t = name;
    b.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    b.onclick = () => { box.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", "false")); b.setAttribute("aria-pressed", "true"); $("custom").value = ""; };
    box.appendChild(b);
  });
}

const modelId = k => `${MODELS[k].base}-${f16 ? "q4f16_1" : "q4f32_1"}-MLC`;

async function drawModels() {
  let cached = {};
  try { webllm = webllm || await import(WEBLLM); for (const k in MODELS) cached[k] = await webllm.hasModelInCache(modelId(k)); } catch (e) { }
  const box = $("models"); box.innerHTML = "";
  for (const k in MODELS) {
    const m = MODELS[k], b = document.createElement("button");
    b.className = "model"; b.setAttribute("aria-pressed", k === modelKey ? "true" : "false");
    b.innerHTML = `<b>${m.title}</b><span>${m.note} · ${cached[k] ? "✅ already downloaded" : "download ~" + m.gb[f16 ? 0 : 1] + " GB"}</span>`;
    b.onclick = () => { modelKey = k; localStorage.setItem("tb_model", k); box.querySelectorAll(".model").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false")); };
    box.appendChild(b);
  }
}

/* ================= Cargar el modelo y empezar ================= */
async function start() {
  const custom = $("custom").value.trim();
  const chip = document.querySelector('#topics .chip[aria-pressed="true"]');
  topicLabel = custom || (chip ? chip.dataset.t : "Surprise me!");
  topic = topicLabel === "Surprise me!" ? SURPRISE[Math.floor(Math.random() * SURPRISE.length)] : topicLabel;
  if (topicLabel === "Surprise me!") topicLabel = "Surprise: " + topic;
  if (isBad(topic)) { alert("Elige otro tema, por favor. · Please choose another topic."); return; }
  localStorage.setItem("tb_level", level);
  $("setup").hidden = true;
  unlockAudio();

  const id = modelId(modelKey);
  if (!engine || loadedModel !== id) {
    $("loading").hidden = false;
    // Pedir que el navegador no borre el modelo descargado cuando le falte espacio
    try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) { }
    try {
      webllm = webllm || await import(WEBLLM);
      const onP = r => { $("lbar").style.width = Math.round((r.progress || 0) * 100) + "%"; $("ltext").textContent = r.text || ""; };
      if (!engine) {
        engine = await webllm.CreateWebWorkerMLCEngine(new Worker(new URL("./worker.js", import.meta.url), { type: "module" }), id, { initProgressCallback: onP });
      } else { engine.setInitProgressCallback(onP); await engine.reload(id); }
      loadedModel = id;
    } catch (e) {
      console.error(e);
      $("ltitle").textContent = "😕 Buddy couldn't start";
      $("lsub").textContent = modelKey === "smart"
        ? "Puede que este computador no tenga memoria suficiente para el modelo 🧠. Recarga la página y prueba con ⚡ Fast."
        : "Revisa tu conexión a internet (la primera vez debe descargar el modelo) y recarga la página. Si sigue fallando, este computador quizás no tiene memoria suficiente.";
      $("ltext").textContent = String(e && e.message || e).slice(0, 300);
      const b = document.createElement("button"); b.className = "btn"; b.style.marginTop = "12px"; b.textContent = "↻ Reload · Recargar"; b.onclick = () => location.reload();
      $("loading").appendChild(b);
      return;
    }
    $("loading").hidden = true;
  }
  openChat();
  loadNaturalVoice();
}

/* ================= Conversación ================= */
function systemPrompt() {
  const L = LEVELS[level];
  return `You are Buddy, a friendly English conversation partner for a Chilean school student who is ${L.age} years old.
The student's English level: ${L.desc}
Today's topic: ${topic}.
Rules:
- Reply in English only, in 1 or 2 short sentences (maximum ${L.max} words in total).
- Always end with ONE easy question about the topic, so the student keeps talking.
- If the student makes a mistake, do not explain grammar. Just repeat their idea correctly in a natural way. Example: student "I go to the beach yesterday" -> you "Oh, you went to the beach yesterday! Was it sunny?"
- If the student writes in Spanish, give them the English sentence in quotes and ask them to try saying it in English.
- Be kind and encouraging. Use simple words. You may use one emoji.
- Keep everything appropriate for children. If the student talks about violence, sex, drugs or anything inappropriate, kindly go back to the topic.
- Never ask for personal information (surname, address, phone number, school name, photos or passwords).
- You are an AI, not a human. Never write lists or long explanations.`;
}

function openChat() {
  $("chat").hidden = false;
  $("ctopic").textContent = "💬 " + topicLabel;
  $("log").innerHTML = ""; $("ideas").innerHTML = "";
  turns = 0; wordsTotal = 0; updTurns();
  const t = TOPICS.find(x => x[1] === topicLabel);
  const opener = `Hi! I'm Buddy 🤖 Let's talk about ${t ? topicLabel.toLowerCase() : topic}. ${(t && t[2]) || `What do you like about ${topic}?`}`;
  history = [{ role: "user", content: "Hi Buddy!" }, { role: "assistant", content: opener }];
  setVoiceBtn();
  sys(`Level: ${LEVELS[level].name} · Write or press 🎤 and speak in English.`);
  const el = addMsg("bot", opener); addTools(el, opener);
  lastBotAt = Date.now(); speak(opener);
}

function updTurns() { $("cturns").textContent = `· ${Math.min(turns, GOAL)}/${GOAL} turns`; }

async function botTurn() {
  busy = true; lockUI(true);
  const el = addMsg("bot", ""); el.querySelector(".txt").innerHTML = '<span class="typing"><span></span><span></span><span></span></span>';
  let text = "";
  try {
    const msgs = [{ role: "system", content: systemPrompt() }, ...history.slice(0, 2), ...history.slice(2).slice(-10)];
    const stream = await engine.chat.completions.create({ messages: msgs, stream: true, temperature: 0.7, max_tokens: 110 });
    for await (const ch of stream) {
      text += ch.choices[0]?.delta?.content || "";
      el.querySelector(".txt").textContent = clean(text) || "…";
      scrollDown();
    }
  } catch (e) {
    console.error(e); text = "";
    if (/device was lost|disposed|device.*lost|DEVICE_HUNG/i.test(String(e && e.message || e))) { gpuLost(el); return; }
  }
  text = clean(text);
  if (!text || isBad(text)) text = `Let's keep talking about ${topic}! What do you like about it?`;
  // El modelo pequeño a veces olvida preguntar: se agrega una pregunta para que la conversación siga.
  else if (!text.includes("?")) text += " " + FOLLOW[Math.floor(Math.random() * FOLLOW.length)];
  el.querySelector(".txt").textContent = text;
  history.push({ role: "assistant", content: text });
  addTools(el, text);
  busy = false; lockUI(false); lastBotAt = Date.now();
  speak(text);
  if (window.matchMedia("(pointer:fine)").matches) $("say").focus();
}

function gpuLost(el) {
  el.remove(); busy = true; lockUI(true); engine = null; loadedModel = null;
  sys("😵 La tarjeta gráfica de este computador se reinició (se quedó sin memoria o tardó demasiado). Recarga la página y vuelve a intentar. Si se repite, elige 🪶 Tiny. Si al recargar dice que no hay tarjeta gráfica, cierra todas las ventanas del navegador y ábrelo de nuevo.", true);
  const b = document.createElement("button"); b.className = "btn small green"; b.style.alignSelf = "center"; b.textContent = "↻ Reload · Recargar"; b.onclick = () => location.reload();
  $("log").appendChild(b); scrollDown();
}

function clean(t) {
  t = t.replace(/^\s*(Buddy|Assistant|AI)\s*:\s*/i, "");
  t = t.split(/\n\s*(Student|User|Me|You)\s*:/i)[0];
  return t.replace(/\s+/g, " ").trim();
}

async function send(text, via) {
  text = (text || "").trim();
  if (!text || busy || !engine) return;
  $("say").value = ""; $("ideas").innerHTML = "";
  stopSpeaking();
  // Filtros antes de enviar
  if (SELF_HARM.test(text)) {
    sys("💛 Si te sientes mal o estás pasando por algo difícil, habla ahora con un adulto de confianza o con tu profe. En Chile puedes llamar gratis y a cualquier hora a la línea de prevención del suicidio: *4141.", true);
    return;
  }
  if (PERSONAL.test(text)) { sys("🔒 Don't share phone numbers, emails or addresses. · No compartas teléfonos, correos ni direcciones.", true); return; }
  if (isBad(text)) { sys("🙂 Let's keep it friendly! Try again. · Usemos palabras amables.", true); return; }

  const n = words(text), eng = looksEnglish(text);
  const me = addMsg("me", text);
  const via_ = document.createElement("span"); via_.className = "via"; via_.textContent = via === "voice" ? "🎤 spoken" : "⌨️ written"; me.appendChild(via_);
  history.push({ role: "user", content: text });
  turns++; wordsTotal += n; updTurns();
  logAnswer(GAME, {
    activity: "Conversación: " + topicLabel,
    item: { q: `${topicLabel} · turn ${turns}`, k: via === "voice" ? "SPK" : "TXT" },
    chosen: `${n} palabras${eng ? "" : " (en español o mezclado)"}`,
    right: "Responder en inglés con 3 o más palabras",
    ok: eng && n >= 3,
    ms: lastBotAt ? Date.now() - lastBotAt : null
  });
  await botTurn();
  if (turns === GOAL) endCard();
}

function endCard() {
  const d = document.createElement("div"); d.className = "end";
  d.innerHTML = `<b>🎉 Great conversation!</b><p>You answered ${turns} times and used ${wordsTotal} words in English.<br><span class="es">¡Muy bien! Puedes seguir conversando o elegir otro tema.</span></p>`;
  const r = document.createElement("div"); r.className = "row"; r.style.justifyContent = "center"; r.style.marginTop = "8px";
  const k = document.createElement("button"); k.className = "btn small"; k.textContent = "Keep talking"; k.onclick = () => d.remove();
  const n = document.createElement("button"); n.className = "btn small green"; n.textContent = "New topic"; n.onclick = newTopic;
  r.append(k, n); d.appendChild(r); $("log").appendChild(d); scrollDown();
}

/* ---------- Ayudas: ideas para responder y traducción ---------- */
async function oneShot(system, user, maxTokens) {
  const r = await engine.chat.completions.create({ messages: [{ role: "system", content: system }, { role: "user", content: user }], temperature: 0.4, max_tokens: maxTokens });
  return (r.choices[0]?.message?.content || "").trim();
}

async function ideas() {
  if (busy || !engine) return;
  const last = [...history].reverse().find(m => m.role === "assistant");
  if (!last) return;
  busy = true; lockUI(true); $("ideas").innerHTML = '<span class="es">Thinking of ideas…</span>';
  let out = "";
  try {
    out = await oneShot(`You help a Chilean student practise English. Level: ${LEVELS[level].desc}
Write 3 different short answers the student could say to the question. Each answer on its own line. Maximum ${LEVELS[level].max} words each. No numbers, no explanations.`, last.content, 90);
  } catch (e) { console.error(e); if (/lost|disposed/i.test(String(e && e.message || e))) { $("ideas").innerHTML = ""; busy = false; gpuLost(document.createElement("div")); return; } }
  const list = out.split(/\n+/).map(s => s.replace(/^\s*([-*•]|\d+[.)])\s*/, "").replace(/^["“]|["”]$/g, "").trim()).filter(s => s && s.length < 160 && !isBad(s)).slice(0, 3);
  $("ideas").innerHTML = "";
  if (!list.length) $("ideas").innerHTML = '<span class="es">No se pudieron generar ideas. Intenta de nuevo.</span>';
  list.forEach(s => {
    const b = document.createElement("button"); b.textContent = s; b.title = "Use this idea (you can change it)";
    b.onclick = () => { $("say").value = s; $("say").focus(); };
    $("ideas").appendChild(b);
  });
  busy = false; lockUI(false);
}

let translator = null, translatorOk = null;
async function translate(el, text, btn) {
  if (busy) return;
  const old = el.querySelector(".tr"); if (old) { old.remove(); return; }
  busy = true; lockUI(true); btn.textContent = "…";
  let out = "", approx = false;
  // 1° el traductor que trae Chrome (también en el equipo, más preciso); si no existe, el propio modelo
  try {
    const limit = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error("timeout")), ms))]);
    if (translatorOk !== false && "Translator" in self && await limit(Translator.availability({ sourceLanguage: "en", targetLanguage: "es" }), 3000) !== "unavailable") {
      translator = translator || await limit(Translator.create({ sourceLanguage: "en", targetLanguage: "es" }), 20000);
      out = await limit(translator.translate(text.replace(/[\u{1F000}-\u{1FAFF}]/gu, "")), 8000);
      translatorOk = true;
    }
  } catch (e) { console.warn(e); translatorOk = false; }
  if (!out) {
    approx = true;
    try { out = await oneShot("Translate the user's English text into simple Spanish from Chile. Write only the translation.", text, 120); } catch (e) { console.error(e); }
  }
  btn.textContent = "🇨🇱 Español";
  const d = document.createElement("div"); d.className = "tr"; d.textContent = out ? out + (approx ? " (traducción aproximada)" : "") : "(No se pudo traducir)";
  el.appendChild(d); scrollDown();
  busy = false; lockUI(false);
}

/* ---------- Mensajes ---------- */
function addMsg(who, text) {
  const d = document.createElement("div"); d.className = "msg " + who;
  const t = document.createElement("div"); t.className = "txt"; t.textContent = text; d.appendChild(t);
  $("log").appendChild(d); scrollDown(); return d;
}
function addTools(el, text) {
  const t = document.createElement("div"); t.className = "tools";
  const a = document.createElement("button"); a.textContent = "🔊 Listen"; a.onclick = () => speak(text, true);
  const b = document.createElement("button"); b.textContent = "🇨🇱 Español"; b.onclick = () => translate(el, text, b);
  t.append(a, b); el.appendChild(t);
}
function sys(text, warn) {
  const d = document.createElement("div"); d.className = "sys"; d.textContent = text;
  if (warn) { d.style.color = "#ffe08a"; }
  $("log").appendChild(d); scrollDown();
}
const scrollDown = () => { const l = $("log"); l.scrollTop = l.scrollHeight; };
function lockUI(on) { ["send", "help", "mic"].forEach(id => { const b = $(id); if (b) b.disabled = on; }); }

/* ---------- Filtros y conteos ---------- */
const SELF_HARM = /(suicid|kill myself|want to die|hurt myself|self[- ]?harm|matarme|me quiero morir|quiero morir(me)?|cortarme|hacerme da[ñn]o)/i;
const PERSONAL = /(\+?56\s?9[\s-]?\d{4}[\s-]?\d{4}|\b9\d{8}\b|[\w.+-]+@[\w-]+\.[\w.]+)/;
const BAD = /\b(fuck\w*|shit\w*|bitch\w*|dick|pussy|porn\w*|sex\w*|nigg\w*|puta\w*|put[oa]s?|mierda|conchetumare|ctm|culiao|weon\w*|maric\w*|pico|chucha\w*|verga)\b/i;
const isBad = t => BAD.test(t);
const words = t => (t.match(/[A-Za-zÁÉÍÓÚÑáéíóúñ']+/g) || []).length;
const ES = /\b(que|qué|el|la|los|las|es|una|un|por|para|con|yo|pero|porque|muy|también|tengo|tiene|mí|mis|cómo|como|está|estoy|gusta|hola|sí|del|al|y)\b/gi;
const EN = /\b(the|a|an|is|are|am|i|you|my|and|to|it|in|of|like|have|has|do|does|was|were|we|they|he|she|yes|no|not|my|your|what|very|too|because|but|with|for)\b/gi;
function looksEnglish(t) { const e = (t.match(EN) || []).length, s = (t.match(ES) || []).length; return e >= s; }

/* ---------- Voz: hablar (reconocimiento) ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, listening = false;
if (!SR) { $("mic").hidden = true; $("hint").textContent = "Para hablar con el micrófono usa Chrome o Edge."; }
$("mic").onclick = () => {
  if (!SR || busy) return;
  if (listening) { rec.stop(); return; }
  stopSpeaking();
  rec = new SR(); rec.lang = "en-US"; rec.interimResults = true; rec.continuous = false; rec.maxAlternatives = 1;
  let finalText = "";
  rec.onstart = () => { listening = true; $("mic").classList.add("on"); $("hint").textContent = "Listening… speak in English 🎧"; };
  rec.onresult = e => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]; if (r.isFinal) finalText += r[0].transcript; else interim += r[0].transcript;
    }
    $("say").value = (finalText + " " + interim).trim();
  };
  rec.onerror = e => {
    $("hint").textContent = e.error === "not-allowed" || e.error === "service-not-allowed" ? "Permite el uso del micrófono (ícono 🔒 junto a la dirección)."
      : e.error === "no-speech" ? "No te escuché. Presiona 🎤 e intenta otra vez." : e.error === "network" ? "El reconocimiento de voz necesita internet." : "Error del micrófono: " + e.error;
  };
  rec.onend = () => {
    listening = false; $("mic").classList.remove("on");
    if ($("hint").textContent.startsWith("Listening")) $("hint").textContent = "";
    const t = finalText.trim(); if (t) send(t, "voice");
  };
  try { rec.start(); } catch (e) { }
};

/* ---------- Voz: escuchar a Buddy ----------
   Voz natural: Kokoro (tts-worker.js) corre en el equipo, gratis; se descarga una vez (~90 MB).
   Mientras se descarga, o si el equipo no puede, se usa la voz del navegador (en Edge, las voces "Natural" son muy buenas). */
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu;
let voice = null, ttsChoice = localStorage.getItem("tb_tts") || "af_heart";
let ttsWorker = null, ttsReady = false, ttsFailed = false, ttsSlow = false, actx = null, playing = null, speakId = 0, lastSpoken = "";
function pickVoice() {
  const vs = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
  const pref = [/Natural/i, /Google US English/i, /(Aria|Jenny|Guy|Samantha|Ava)/i, /^en[-_]US/i, /^en[-_]GB/i];
  for (const p of pref) { const v = vs.find(v => p.test(v.name) || p.test(v.lang)); if (v) return v; }
  return vs[0] || null;
}
if ("speechSynthesis" in window) { voice = pickVoice(); speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); }; }

function unlockAudio() {   // se llama al presionar "Start" (los navegadores exigen un clic antes de reproducir audio)
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); } catch (e) { }
}
function loadNaturalVoice() {
  if (ttsChoice === "basic" || ttsWorker || ttsFailed) return;
  try { ttsWorker = new Worker(new URL("./tts-worker.js", import.meta.url), { type: "module" }); }
  catch (e) { ttsFailed = true; return; }
  ttsWorker.onmessage = ({ data }) => {
    if (data.type === "progress") $("hint").textContent = `🔊 Downloading natural voice… ${Math.round(data.p)}% (basic voice meanwhile)`;
    else if (data.type === "ready") {
      // Prueba de velocidad en silencio: la 1ª frase calienta el modelo, la 2ª mide si este equipo alcanza
      $("hint").textContent = "🔊 Testing the natural voice on this computer…";
      ttsWorker.postMessage({ type: "speak", id: -1, idx: 0, text: "Hello!", voice: ttsChoice, speed: 1 });
      ttsWorker.postMessage({ type: "speak", id: -2, idx: 0, text: "Nice to meet you. Let's talk!", voice: ttsChoice, speed: 1 });
    }
    else if (data.type === "audio") playPcm(data);
    else if (data.type === "error") {
      console.warn("TTS", data.msg);
      if (!ttsReady) { ttsFailed = true; $("hint").textContent = "La voz natural no funciona en este equipo; se usa la voz básica."; }
      else if (data.id === speakId) basicSpeak(lastSpoken);
    }
  };
  ttsWorker.onerror = e => { console.warn(e); ttsFailed = true; };
  ttsWorker.postMessage({ type: "load" });
}
// Las frases llegan de a una: se reproducen en orden apenas está lista la siguiente.
let queue = { id: 0, next: 0, bufs: {} }, slowScore = [];
function playPcm({ id, idx, audio, rate, ms }) {
  const ratio = ms / 1000 / (audio.length / rate);   // segundos de cálculo por segundo de audio
  if (id === -1) return;                              // calentamiento
  if (id === -2) {                                    // prueba: con más de 1,5 el alumno esperaría demasiado
    if (ratio > 1.5) { ttsSlow = true; $("hint").textContent = "Este computador es lento para la voz natural: Buddy usa la voz básica."; }
    else { ttsReady = true; $("hint").textContent = "🔊 Natural voice ready!"; setTimeout(() => { if ($("hint").textContent.startsWith("🔊 Natural")) $("hint").textContent = ""; }, 3000); }
    return;
  }
  if (id !== speakId || !actx) return;                // llegó tarde: ya se pidió otra cosa
  slowScore.push(ratio); if (slowScore.length > 3) slowScore.shift();
  if (slowScore.length >= 3 && slowScore.every(x => x > 2) && !ttsSlow) {
    ttsSlow = true; $("hint").textContent = "Este computador es lento para la voz natural: Buddy usa la voz básica.";
  }
  const buf = actx.createBuffer(1, audio.length, rate); buf.copyToChannel(audio, 0);
  queue.bufs[idx] = buf; playNext();
}
function playNext() {
  if (playing || !queue.bufs[queue.next]) return;
  const src = actx.createBufferSource(); src.buffer = queue.bufs[queue.next]; src.connect(actx.destination);
  delete queue.bufs[queue.next]; queue.next++;
  src.onended = () => { if (playing === src) { playing = null; playNext(); } };
  playing = src; src.start();
}
function speak(text, force) {
  if (!voiceOn && !force) return;
  stopSpeaking();
  text = text.replace(EMOJI, "").trim(); lastSpoken = text;
  if (ttsReady && !ttsSlow && ttsChoice !== "basic" && actx) {
    queue = { id: speakId, next: 0, bufs: {} };
    const parts = text.match(/[^.!?]+[.!?]+["')]*\s*|[^.!?]+$/g) || [text];
    parts.map(t => t.trim()).filter(Boolean).forEach((t, idx) =>
      ttsWorker.postMessage({ type: "speak", id: speakId, idx, text: t, voice: ttsChoice, speed: Math.max(.8, LEVELS[level].rate) }));
  } else basicSpeak(text);
}
function basicSpeak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; if (voice) u.voice = voice; u.rate = LEVELS[level].rate;
  speechSynthesis.speak(u);
}
function stopSpeaking() {
  if (ttsWorker) ttsWorker.postMessage({ type: "cancel", id: speakId });
  speakId++;
  if (playing) { try { playing.stop(); } catch (e) { } playing = null; }
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}
function setVoiceBtn() { $("voice").textContent = voiceOn ? "🔊 Voice on" : "🔇 Voice off"; $("voice").setAttribute("aria-pressed", voiceOn ? "true" : "false"); }
$("voice").onclick = () => { voiceOn = !voiceOn; localStorage.setItem("tb_voice", voiceOn ? "1" : "0"); setVoiceBtn(); if (!voiceOn) stopSpeaking(); };
$("tts").value = ttsChoice;
$("tts").onchange = () => { ttsChoice = $("tts").value; localStorage.setItem("tb_tts", ttsChoice); if (ttsChoice !== "basic") loadNaturalVoice(); };

/* ---------- Botones ---------- */
$("send").onclick = () => send($("say").value, "text");
$("say").addEventListener("keydown", e => { if (e.key === "Enter" && !e.isComposing) { e.preventDefault(); send($("say").value, "text"); } });
$("help").onclick = ideas;
$("newtopic").onclick = newTopic;
async function newTopic() {
  if (busy) return;
  stopSpeaking(); $("chat").hidden = true; $("custom").value = "";
  await drawModels(); $("setup").hidden = false; scrollTo(0, 0);
}
