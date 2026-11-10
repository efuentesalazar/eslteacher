/* Portada de eslteacher.cl · parte de index.html (se cargan en orden: datos, juego, mundos, voz, diagnostico, zone, perfil) */
/* =====================================================================
   PERFIL DEL ALUMNO (sin cuenta) + REPORTE PARA EL PROFE
   ===================================================================== */
const AVATARS = ["🙂","😎","🤖","🦊","🐼","🐸","🦄","🐱","🐶","🐲","👾","🧙","🦸","🥷","🧑‍🚀","⚽"];
let pickAv = "🙂", lastFocus = null;

/* ---- Base de datos: llamadas a las funciones eslt_* ---- */
async function db(fn, args){
  const r = await fetch(`${DB_URL}/rest/v1/rpc/${fn}`, {
    method: "POST", headers: { "apikey": DB_KEY, "Content-Type": "application/json" }, body: JSON.stringify(args) });
  if (!r.ok) throw new Error("http " + r.status);
  return r.json();
}
const getSession = () => store.get("session", null);
// RUT chileno: valida el dígito verificador (módulo 11) antes de enviarlo
function rutOk(rut){
  const s = String(rut).toUpperCase().replace(/[^0-9K]/g, "");
  if (s.length < 8 || s.length > 10) return false;
  const body = s.slice(0, -1), dv = s.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  let sum = 0, m = 2;
  for (let i = body.length - 1; i >= 0; i--){ sum += +body[i] * m; m = m === 7 ? 2 : m + 1; }
  const r = 11 - (sum % 11), exp = r === 11 ? "0" : r === 10 ? "K" : String(r);
  return dv === exp;
}
function renderLogin(){
  const s = getSession();
  $("login").classList.toggle("hidden", !!s);
  $("who").classList.toggle("hidden", !s);
  if (s){
    $("who-name").textContent = s.name; $("who-sec").textContent = s.section;
    $("who-av").textContent = pickAv;
  } else {
    $("l-section").innerHTML = `<option value="">— Elige tu curso —</option>` + SECTIONS.map(x => `<option>${x.id}</option>`).join("");
    const last = store.get("lastSection", ""); if (last) $("l-section").value = last;
  }
  $("p-report-note").textContent = s ? "“Enviar reporte al profe” manda tu progreso directo a tu profesor."
                                     : "Para enviar tu reporte, primero ingresa con tu curso, RUT y clave.";
}
$("login").addEventListener("submit", async e => {
  e.preventDefault();
  const section = $("l-section").value, rut = $("l-rut").value.trim(), pin = $("l-pin").value.trim(), msg = $("l-msg");
  if (!section){ msg.textContent = "Elige tu curso."; shake($("l-section")); return; }
  if (!rutOk(rut)){ msg.textContent = "Revisa tu RUT. Escríbelo con guion, ej: 12345678-9"; shake($("l-rut")); return; }
  if (!/^\d{4}$/.test(pin)){ msg.textContent = "La clave tiene 4 números."; shake($("l-pin")); return; }
  $("l-go").disabled = true; msg.textContent = "Entrando…";
  try {
    const r = await db("eslt_login", { p_section: section, p_rut: rut, p_pin: pin });
    if (r.ok){
      // Si el progreso de este dispositivo es de OTRO alumno, no se mezcla
      const owner = store.get("owner", null);
      if (owner && owner !== r.sid) resetLocalProgress();
      store.set("owner", r.sid); store.set("rev", 0);
      store.set("session", { token: r.token, sid: r.sid, name: r.name, first_name: r.first_name, section: r.section, course: r.course });
      store.set("lastSection", section);
      $("l-rut").value = ""; $("l-pin").value = ""; msg.textContent = "";
      sfx("correct"); confetti(80);
      toast(`👋 ¡Hola, ${r.first_name}! Tu progreso se guardará en la nube.`);
      if (COURSES.some(c => c.id === r.course && c.games.length)){ currentCourse = r.course; $("q").value = ""; renderCourses(); renderGames(); }
      renderLogin(); renderMe();
      pullProgress();
    } else {
      sfx("wrong"); shake($("login"));
      msg.textContent = r.error === "locked_day" ? "Demasiados intentos hoy. Pídele a tu profe que te desbloquee o te dé una clave nueva."
                      : r.error === "locked" ? "Demasiados intentos. Espera 15 minutos o pide ayuda a tu profe."
                                             : "Curso, RUT o clave incorrectos. Revisa e inténtalo otra vez.";
    }
  } catch (err){
    msg.textContent = "No se pudo conectar. Revisa tu internet e inténtalo otra vez.";
  } finally { $("l-go").disabled = false; }
});
// Al salir: se guarda lo último en la nube y se borra el progreso de este dispositivo
// (así, en un computador compartido, el siguiente alumno parte desde su propio progreso)
$("logout").addEventListener("click", async () => {
  const s = getSession(); if (!s) return;
  const b = $("logout"); b.disabled = true; b.textContent = "Guardando…";
  const saved = await pushProgress(true);
  if (!saved && !confirm("No se pudo guardar tu último avance en la nube (¿sin internet?). Si sales ahora, se perderá lo de hoy en este dispositivo. ¿Salir igual?")){
    b.disabled = false; b.textContent = "Salir"; return;
  }
  db("eslt_logout", { p_token: s.token }).catch(() => {});
  resetLocalProgress(); store.set("session", null); store.set("owner", null); store.set("rev", 0);
  location.reload();
});

function openProfile(){
  const profile = store.get("profile", {});
  pickAv = profile.avatar || "🙂";
  renderLogin();
  $("p-avatars").innerHTML = AVATARS.map(a => `<button type="button" class="${a === pickAv ? "on" : ""}" data-a="${a}" aria-label="Avatar ${a}">${a}</button>`).join("");
  $("p-avatars").querySelectorAll("button").forEach(b => b.addEventListener("click", () => {
    pickAv = b.dataset.a; $("p-avatars").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
  }));
  const s = badgeStats();
  $("p-xp").textContent = xp; $("p-streak").textContent = s.streak; $("p-words").textContent = s.words;
  $("p-badges").innerHTML = BADGES.map(([id, ic, name]) => `<div class="badge ${gotBadges.includes(id) ? "got" : ""}"><i>${ic}</i>${esc(name)}</div>`).join("");
  const hl = hardList();
  $("p-hard-wrap").classList.toggle("hidden", !hl.length);
  $("p-hard").innerHTML = hl.map(i => `<span>${WORDS[i][0]} ${esc(WORDS[i][1])}</span>`).join("");
  const ts = topSounds(5);
  $("p-snd-wrap").classList.toggle("hidden", !ts.length);
  $("p-snd").innerHTML = ts.map(([k, c]) => `<span title="${esc(SOUNDS[k].how)}">${esc(SOUNDS[k].ipa)} ${esc(SOUNDS[k].label)} · ${c}</span>`).join("");
  lastFocus = document.activeElement;
  $("profile").classList.add("on");
  setTimeout(() => (getSession() ? $("p-close") : $("l-section")).focus(), 60);
}
function closeProfile(){
  if (!$("profile").classList.contains("on")) return;
  $("profile").classList.remove("on");
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}
$("me").addEventListener("click", openProfile);
$("tab-me").addEventListener("click", openProfile);
$("p-close").addEventListener("click", closeProfile);
$("profile").addEventListener("click", e => { if (e.target.id === "profile") closeProfile(); });
$("p-save").addEventListener("click", () => {
  store.set("profile", { ...store.get("profile", {}), avatar: pickAv }); renderMe();
  sfx("correct"); toast("✅ ¡Perfil guardado!");
  closeProfile();
});
// Envía el reporte a la base de datos del profe
$("p-report").addEventListener("click", async () => {
  const sess = getSession();
  if (!sess){ toast("🔑 Primero ingresa con tu curso, RUT y clave (arriba)."); shake($("login")); $("l-section").focus(); return; }
  const report = reportSummary();
  const b = $("p-report"); b.disabled = true; const label = b.textContent; b.textContent = "Enviando…";
  try {
    const r = await db("eslt_submit_report", { p_token: sess.token, p_report: report });
    if (r.ok){ sfx("badge"); confetti(140); toast("📤 ¡Reporte enviado! Tu profe ya puede verlo."); }
    else if (r.error === "session"){
      store.set("session", null); renderLogin(); renderMe();
      toast("🔑 Tu sesión expiró. Ingresa otra vez con tu RUT y clave.");
    }
    else if (r.error === "wait") toast("⏳ Ya enviaste un reporte hace un momento. Espera unos segundos.");
    else toast("No se pudo enviar el reporte. Inténtalo otra vez.");
  } catch (err){
    toast("📶 Sin conexión: no se pudo enviar el reporte. Inténtalo cuando tengas internet.");
  } finally { b.disabled = false; b.textContent = label; }
});

/* =====================================================================
   MODO PROYECTOR — palabra del día o desafío en pantalla completa
   ===================================================================== */
function projOn(id){
  $(id).classList.add("proj"); document.body.classList.add("projecting");
  const de = document.documentElement;
  if (de.requestFullscreen && !document.fullscreenElement) de.requestFullscreen().catch(() => {});
}
function projOff(){
  document.querySelectorAll(".panel.proj").forEach(p => p.classList.remove("proj"));
  document.body.classList.remove("projecting");
  if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
}
document.querySelectorAll("[data-proj]").forEach(b => b.addEventListener("click", () => projOn(b.dataset.proj)));
document.querySelectorAll("[data-proj-exit]").forEach(b => b.addEventListener("click", projOff));
document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && document.body.classList.contains("projecting")) projOff(); });
addEventListener("keydown", e => { if (e.key === "Escape"){ projOff(); closeProfile(); } });

/* =====================================================================
   SONIDOS: botón silenciar + clic en botones y pestañas
   ===================================================================== */
function renderMute(){
  $("mute").textContent = muted ? "🔇" : "🔊";
  $("mute").setAttribute("aria-label", muted ? "Activar sonidos" : "Silenciar sonidos");
}
$("mute").addEventListener("click", () => { muted = !muted; store.set("muted", muted); renderMute(); if (!muted){ audioInit(); sfx("select"); } });
document.addEventListener("click", e => {
  const el = e.target.closest(".chip, .btn, .tabbar a, .tabbar button, .links a, .avatars button");
  if (!el || el.id === "mute" || el.matches("#wp-check, #wp-check2, #rec, #p-save")) return;
  sfx(el.classList.contains("chip") || el.closest(".avatars") ? "select" : "click");
});

/* =====================================================================
   APP INSTALABLE (PWA) — se puede agregar a la pantalla de inicio
   ===================================================================== */
if ("serviceWorker" in navigator && location.protocol === "https:")
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
/* Botones "Download app": instalan en un toque cuando el navegador lo permite (Android, Chrome, Edge);
   si no (iPhone, Safari, Firefox), muestran los pasos para ese dispositivo. */
let installEvt = null;
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
const appBtns = () => document.querySelectorAll("[data-app]");
if (standalone) appBtns().forEach(b => b.classList.add("hidden"));          // ya está abierta como app
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; $("app-go").classList.remove("hidden"); });

const UA = navigator.userAgent;
const APP_STEPS = {
  ios: { title: "📱 iPhone o iPad", steps: [
    "Abre <b>eslteacher.cl</b> en <b>Safari</b> (también funciona en Chrome con iOS 16.4 o superior).",
    "Toca el botón <b>Compartir</b> ⬆️ (abajo en iPhone, arriba en iPad).",
    "Desliza hacia abajo y toca <b>“Agregar a inicio”</b> ➕.",
    "Toca <b>“Agregar”</b>. ¡Listo! Busca el ícono <b>ESL Teacher</b> en tu pantalla."] },
  android: { title: "🤖 Android", steps: [
    "Abre <b>eslteacher.cl</b> en <b>Chrome</b>.",
    "Toca el menú <b>⋮</b> (arriba a la derecha).",
    "Toca <b>“Instalar app”</b> o <b>“Agregar a la pantalla principal”</b>.",
    "Confirma con <b>“Instalar”</b>. El ícono aparece junto a tus otras apps."] },
  desktop: { title: "💻 Computador (Chrome o Edge)", steps: [
    "Abre <b>eslteacher.cl</b> en <b>Chrome</b> o <b>Microsoft Edge</b>.",
    "Haz clic en el ícono <b>Instalar</b> 🖥️⬇ a la derecha de la barra de direcciones,<br>o en el menú <b>⋮ / …</b> → <b>“Instalar ESL Teacher”</b> (en Edge: Aplicaciones → Instalar este sitio como aplicación).",
    "Confirma con <b>“Instalar”</b>. Se abre en su propia ventana y queda en el menú Inicio."] },
  mac: { title: "🍎 Mac con Safari", steps: [
    "En Safari, abre el menú <b>Archivo</b> → <b>“Agregar al Dock”</b> (macOS Sonoma o superior).",
    "O usa Chrome o Edge y sigue los pasos para computador."] },
  firefox: { title: "🦊 Firefox", steps: [
    "Firefox para computador no instala apps web.",
    "Abre <b>eslteacher.cl</b> en <b>Chrome</b> o <b>Edge</b> e instálala desde ahí. En Android, Firefox sí permite: menú ⋮ → <b>“Instalar”</b>."] }
};
const appDevice = () => isIOS ? "ios" : /Android/i.test(UA) ? "android" : /Firefox\//.test(UA) ? "firefox"
  : (/Macintosh/.test(UA) && /Safari\//.test(UA) && !/Chrome|Edg\//.test(UA)) ? "mac" : "desktop";
const stepsHTML = k => `<div class="app-steps"><h4>${APP_STEPS[k].title}</h4><ol>${APP_STEPS[k].steps.map(s => `<li>${s}</li>`).join("")}</ol></div>`;
let appFocus = null;
function openApp(){
  const dev = appDevice();
  appFocus = document.activeElement;
  $("app-steps").innerHTML = installEvt ? "" : stepsHTML(dev);
  $("app-other").innerHTML = Object.keys(APP_STEPS).filter(k => k !== dev || installEvt).map(stepsHTML).join("");
  $("app-go").classList.toggle("hidden", !installEvt);
  closeShare(); $("appdl").classList.add("on");
  setTimeout(() => (installEvt ? $("app-go") : $("app-close")).focus(), 60);
}
function closeApp(){
  if (!$("appdl").classList.contains("on")) return;
  $("appdl").classList.remove("on");
  if (appFocus && appFocus.focus) appFocus.focus();
}
async function installNow(){
  if (!installEvt) return openApp();
  installEvt.prompt();
  const { outcome } = await installEvt.userChoice;
  installEvt = null; $("app-go").classList.add("hidden");
  if (outcome !== "accepted") toast("Puedes instalarla cuando quieras desde el botón 📲 Download app.");
  closeApp();
}
// En un toque si el navegador lo permite; si no, la guía paso a paso
appBtns().forEach(b => b.addEventListener("click", () => installEvt ? installNow() : openApp()));
$("app-go").addEventListener("click", installNow);
$("app-close").addEventListener("click", closeApp);
$("appdl").addEventListener("click", e => { if (e.target.id === "appdl") closeApp(); });
addEventListener("keydown", e => { if (e.key === "Escape") closeApp(); });
addEventListener("appinstalled", () => {
  appBtns().forEach(b => b.classList.add("hidden")); closeApp(); sfx("badge"); confetti(120);
  toast("🎉 ¡App instalada! Búscala en tu pantalla de inicio como “ESL Teacher”.");
});

/* =====================================================================
   PROGRESO EN LA NUBE + REPORTE AUTOMÁTICO
   - Con sesión iniciada, cada avance se guarda solo unos segundos después.
   - Cada guardado actualiza el reporte del día en el panel del profe.
   - Si el alumno usa dos dispositivos, se combinan (se queda lo mejor de cada uno).
   ===================================================================== */
const SYNC_KEYS = ["xp", "stats", "hard", "badges", "wpDone", "daysDone", "best", "attempts", "profile"];
let applying = false, syncTimer = null, syncing = false, syncPending = false;

function reportSummary(){
  const s = badgeStats();
  return { xp, streak: s.streak, days_total: daysDone.length, words: s.words, best, correct: s.correct,
    pron_best: stats.pronBest || 0, pron_avg: stats.pronCount ? Math.round(stats.pronSum / stats.pronCount) : 0,
    pron_count: stats.pronCount || 0, badges: gotBadges.length, hard_words: hardList().map(i => WORDS[i][1]).join(", "),
    sound_issues: topSounds(5).map(([k, c]) => `${SOUNDS[k].label} (${c})`).join(", "),
    zone_summary: zoneSummary() };
}
// Sonidos que más le cuestan al alumno: [[clave, veces], ...]
const topSounds = (n = 3) => Object.entries(stats.sounds || {}).filter(([k]) => SOUNDS[k]).sort((a, b) => b[1] - a[1]).slice(0, n);
const localData = () => ({ v: 1, xp, stats, hard, badges: gotBadges, wpDone, daysDone, best, attempts,
  avatar: store.get("profile", {}).avatar || null });

// Combina dos progresos quedándose con lo mejor de cada uno
function mergeData(a, b){
  if (!b) return a; if (!a) return b;
  const n = v => +v || 0, sa = a.stats || {}, sb = b.stats || {};
  const pron = n(sa.pronCount) >= n(sb.pronCount) ? sa : sb;          // el promedio debe venir de un mismo lado
  const wp = { ...(b.wpDone || {}) };
  Object.entries(a.wpDone || {}).forEach(([i, steps]) => { wp[i] = { ...(wp[i] || {}), ...steps }; });
  const hd = { ...(b.hard || {}) };
  Object.entries(a.hard || {}).forEach(([i, c]) => { hd[i] = Math.max(n(hd[i]), n(c)); });
  return {
    v: 1, xp: Math.max(n(a.xp), n(b.xp)), best: Math.max(n(a.best), n(b.best)),
    stats: { correct: Math.max(n(sa.correct), n(sb.correct)), pronBest: Math.max(n(sa.pronBest), n(sb.pronBest)),
             pronCount: n(pron.pronCount), pronSum: n(pron.pronSum), hardCleared: Math.max(n(sa.hardCleared), n(sb.hardCleared)),
             sounds: [...new Set([...Object.keys(sa.sounds || {}), ...Object.keys(sb.sounds || {})])]
                       .reduce((o, k) => (o[k] = Math.max(n((sa.sounds || {})[k]), n((sb.sounds || {})[k])), o), {}),
             // Challenge Zone: por tipo se queda el lado con más ejercicios hechos
             zone: [...new Set([...Object.keys(sa.zone || {}), ...Object.keys(sb.zone || {})])]
                       .reduce((o, k) => { const x = (sa.zone || {})[k] || {}, y = (sb.zone || {})[k] || {};
                         const m = n(x.done) >= n(y.done) ? x : y; o[k] = { ...m, best: Math.max(n(x.best), n(y.best)) }; return o; }, {}),
             zoneRounds: Math.max(n(sa.zoneRounds), n(sb.zoneRounds)), zonePerfect: Math.max(n(sa.zonePerfect), n(sb.zonePerfect)) },
    badges: [...new Set([...(a.badges || []), ...(b.badges || [])])],
    daysDone: [...new Set([...(a.daysDone || []), ...(b.daysDone || [])])].sort().slice(-400),
    wpDone: wp, hard: hd,
    attempts: (a.attempts || []).length ? a.attempts : (b.attempts || []),
    avatar: a.avatar || b.avatar || null
  };
}
// Aplica un progreso a la página (variables, almacenamiento y pantalla)
function applyData(d){
  applying = true;
  xp = d.xp || 0; stats = d.stats || {}; hard = d.hard || {}; gotBadges = d.badges || [];
  wpDone = d.wpDone || {}; daysDone = d.daysDone || []; best = d.best || 0; attempts = d.attempts || [];
  store.set("xp", xp); store.set("stats", stats); store.set("hard", hard); store.set("badges", gotBadges);
  store.set("wpDone", wpDone); store.set("daysDone", daysDone); store.set("best", best); store.set("attempts", attempts);
  if (d.avatar) store.set("profile", { ...store.get("profile", {}), avatar: d.avatar });
  applying = false;
  renderMe(); renderProgress(); updHardN();
  $("qz-best").textContent = best;
  $("history").textContent = attempts.length ? "Your last scores · Tus últimos puntajes: " + attempts.join(" · ") : "";
}
function resetLocalProgress(){
  applyData({ xp: 0, stats: {}, hard: {}, badges: [], wpDone: {}, daysDone: [], best: 0, attempts: [] });
  store.set("profile", {});
}
function setSync(text, warn){ const el = $("sync"); if (el){ el.textContent = text; el.classList.toggle("warn", !!warn); } }

// Cada vez que cambia algo del progreso, se programa un guardado
const rawSet = store.set;
store.set = (k, v) => { rawSet(k, v); if (!applying && SYNC_KEYS.includes(k)) scheduleSync(); };
function scheduleSync(delay = 4000){
  if (!getSession()) return;
  syncPending = true; setSync("⏳ Guardando…");
  clearTimeout(syncTimer); syncTimer = setTimeout(() => pushProgress(), delay);
}
function endSession(){
  store.set("session", null); renderLogin(); renderMe();
  toast("🔑 Tu sesión expiró. Ingresa otra vez con tu RUT y clave para seguir guardando en la nube.");
}
// Envía el progreso a la nube. Devuelve true si quedó guardado.
async function pushProgress(final = false){
  const sess = getSession(); if (!sess) return false;
  if (syncing){ if (!final) scheduleSync(2000); return false; }
  syncing = true; clearTimeout(syncTimer);
  try {
    for (let tries = 0; tries < 4; tries++){
      const r = await db("eslt_save_progress", { p_token: sess.token, p_data: localData(), p_summary: reportSummary(), p_rev: store.get("rev", 0) });
      if (r.ok){ rawSet("rev", r.rev); syncPending = false; setSync("☁️ Guardado en la nube · " + new Date().toLocaleTimeString("es-CL", { hour:"2-digit", minute:"2-digit" })); return true; }
      if (r.error === "conflict"){ applyData(mergeData(localData(), r.data)); rawSet("rev", r.rev); continue; }   // otro dispositivo guardó antes: combinar y reintentar
      if (r.error === "wait"){ await new Promise(res => setTimeout(res, 3500)); continue; }
      if (r.error === "session"){ endSession(); return false; }
      break;
    }
    setSync("⚠️ No se pudo guardar. Se reintentará.", true); if (!final) scheduleSync(20000); return false;
  } catch (e){
    setSync("📶 Sin conexión: se guardará cuando vuelva internet.", true); if (!final) scheduleSync(30000); return false;
  } finally { syncing = false; }
}
// Trae el progreso de la nube y lo combina con el de este dispositivo
async function pullProgress(){
  const sess = getSession(); if (!sess) return;
  setSync("⏳ Sincronizando…");
  try {
    const r = await db("eslt_load_progress", { p_token: sess.token });
    if (!r.ok){ if (r.error === "session") endSession(); return; }
    // Misma forma y mismo orden de claves para poder comparar (la base de datos reordena las claves)
    const stable = v => Array.isArray(v) ? v.map(stable) : v && typeof v === "object"
      ? Object.keys(v).sort().reduce((o, k) => (o[k] = stable(v[k]), o), {}) : v;
    const canon = d => JSON.stringify(stable(mergeData(d, d)));
    const local = localData(), merged = r.data ? mergeData(local, r.data) : local;
    if (r.data) applyData(merged);
    rawSet("rev", r.rev || 0);
    const hasLocal = local.xp > 0 || local.daysDone.length > 0 || Object.keys(local.wpDone).length > 0;
    // Se sube solo si este dispositivo aportó algo que la nube no tenía
    if (r.data ? canon(merged) !== canon(r.data) : hasLocal) pushProgress();
    else setSync("☁️ Guardado en la nube");
    checkBadges();
  } catch (e){ setSync("📶 Sin conexión: se sincronizará después.", true); }
}
addEventListener("online", () => { if (syncPending) pushProgress(); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && syncPending) pushProgress(true); });

/* =====================================================================
   COMPARTIR — en celular abre el menú del teléfono (WhatsApp, Instagram,
   Telegram…); en computador muestra enlaces, copiar enlace y código QR.
   ===================================================================== */
const SHARE = {
  url: "https://eslteacher.cl/",
  title: "ESL Teacher · Play & Learn English",
  text: "🎮 ESL Teacher: juegos para aprender inglés, palabra del día, desafíos y práctica de pronunciación. ¡Pruébalo!"
};
const SHARE_LINKS = {
  whatsapp: `https://wa.me/?text=${encodeURIComponent(SHARE.text + " " + SHARE.url)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE.url)}`,
  telegram: `https://t.me/share/url?url=${encodeURIComponent(SHARE.url)}&text=${encodeURIComponent(SHARE.text)}`,
  x:        `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE.text)}&url=${encodeURIComponent(SHARE.url)}`,
  email:    `mailto:?subject=${encodeURIComponent(SHARE.title)}&body=${encodeURIComponent(SHARE.text + "\n\n" + SHARE.url)}`
};
document.querySelectorAll("#share [data-net]").forEach(a => { if (SHARE_LINKS[a.dataset.net]) a.href = SHARE_LINKS[a.dataset.net]; });
const canNativeShare = !!navigator.share;
const isTouch = matchMedia("(pointer: coarse)").matches;
async function copyLink(msg){
  try { await navigator.clipboard.writeText(SHARE.url); }
  catch(e){ const i = $("sh-url"); i.select(); try { document.execCommand("copy"); } catch(_){} }
  sfx("correct"); toast(msg || "📋 ¡Enlace copiado! Pégalo donde quieras compartirlo.");
}
async function nativeShare(){
  try { await navigator.share({ title: SHARE.title, text: SHARE.text, url: SHARE.url }); return true; }
  catch(e){ return e && e.name === "AbortError"; }        // si el alumno cancela, no se abre nada más
}
let qrDone = false, shareFocus = null;
function makeQR(){
  if (qrDone) return; qrDone = true;
  const draw = () => {
    try {
      const qr = qrcode(0, "M"); qr.addData(SHARE.url); qr.make();
      const url = qr.createDataURL(8, 2);
      $("sh-qr").innerHTML = `<img src="${url}" alt="Código QR de eslteacher.cl">`;
      $("sh-qr-dl").href = url; $("sh-qr-dl").classList.remove("hidden");
    } catch(e){ $("sh-qr-wrap").classList.add("hidden"); }
  };
  if (window.qrcode) return draw();
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
  s.onload = draw; s.onerror = () => $("sh-qr-wrap").classList.add("hidden");
  document.head.appendChild(s);
}
function openShare(){
  shareFocus = document.activeElement;
  $("sh-more").classList.toggle("hidden", !canNativeShare);
  $("share").classList.add("on"); makeQR();
  setTimeout(() => $("sh-close").focus(), 60);
}
function closeShare(){
  if (!$("share").classList.contains("on")) return;
  $("share").classList.remove("on");
  if (shareFocus && shareFocus.focus) shareFocus.focus();
}
document.querySelectorAll("[data-share]").forEach(b => b.addEventListener("click", async () => {
  // En celular: directo al menú de compartir del teléfono (incluye WhatsApp e Instagram)
  if (canNativeShare && isTouch && await nativeShare()) return;
  openShare();
}));
$("sh-close").addEventListener("click", closeShare);
$("share").addEventListener("click", e => { if (e.target.id === "share") closeShare(); });
$("sh-copy").addEventListener("click", () => copyLink());
$("sh-url").addEventListener("focus", e => e.target.select());
$("sh-more").addEventListener("click", nativeShare);
// Instagram no permite compartir enlaces desde una página web: se copia el enlace y se explica cómo pegarlo
$("share").querySelector('[data-net="instagram"]').addEventListener("click", async () => {
  if (canNativeShare && isTouch && await nativeShare()) return;
  copyLink("📸 Enlace copiado. En Instagram, pégalo en un mensaje o en tu historia con el sticker “Enlace”.");
});
addEventListener("keydown", e => { if (e.key === "Escape") closeShare(); });

renderMute(); renderMe(); updHardN(); checkBadges();
if (getSession()) pullProgress();
