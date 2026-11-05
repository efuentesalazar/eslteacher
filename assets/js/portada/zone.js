/* Portada de eslteacher.cl · parte de index.html (se cargan en orden: datos, juego, mundos, voz, diagnostico, zone, perfil) */
/* =====================================================================
   CHALLENGE ZONE — 7 tipos de ejercicio por nivel (contenido en ejercicios.js)
   ===================================================================== */
const ZLEVELS = {
  A1: { label:"A1 · 5°–6° Básico", courses:["5basico","6basico"] },
  A2: { label:"A2 · 7°–8° Básico", courses:["7basico","8basico"] },
  B1: { label:"B1 · 1°–3° Medio",  courses:["1medio","3medio"] }
};
const ZTYPES = [
  { id:"scramble", icon:"🧩", name:"Sentence scramble",     es:"Ordena las palabras",       n:5, skill:"Gramática" },
  { id:"use",      icon:"✏️", name:"Language in use",       es:"Elige la forma correcta",   n:6, skill:"Gramática" },
  { id:"vocab",    icon:"📖", name:"Vocabulary in context", es:"Completa el texto",         n:1, skill:"Vocabulario" },
  { id:"mistake",  icon:"🔍", name:"Find the mistake",      es:"Toca la palabra incorrecta", n:5, skill:"Gramática" },
  { id:"wf",       icon:"🔤", name:"Word formation",        es:"Transforma la palabra",     n:5, skill:"Vocabulario" },
  { id:"dict",     icon:"🎧", name:"Dictation",             es:"Escucha y escribe",         n:5, skill:"Audición" },
  { id:"read",     icon:"📚", name:"Mini reading",          es:"Lee y responde",            n:1, skill:"Lectura" }
];
function zDefaultLevel(){
  const c = (store.get("session", null) || {}).course;
  return Object.keys(ZLEVELS).find(k => ZLEVELS[k].courses.includes(c)) || "A1";
}
let zLevel = store.get("zLevel", "") || zDefaultLevel();
let zr = null;                                                  // ronda en curso
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const zNorm = s => norm(s).replace(/[’']/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

function zRenderLevels(){
  $("zn-levels").innerHTML = Object.entries(ZLEVELS).map(([k, L]) =>
    `<button class="chip ${k === zLevel ? "on" : ""}" type="button" data-l="${k}">${L.label}</button>`).join("");
  $("zn-levels").querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
    zLevel = b.dataset.l; store.set("zLevel", zLevel); zRenderLevels(); zMenu();
  }));
}
function zMenu(){
  zr = null;
  $("zn-play").classList.add("hidden"); $("zn-end").classList.add("hidden"); $("zn-menu").classList.remove("hidden"); $("zn-levels").classList.remove("hidden");
  const st = stats.zone || {};
  $("zn-menu").innerHTML = ZTYPES.map(t => {
    const s = st[t.id], pct = s && s.done ? Math.round(s.ok / s.done * 100) : null;
    return `<button class="zn-card" type="button" data-t="${t.id}"><span class="ic">${t.icon}</span>
      <span><b>${t.name}</b><small>${t.es}</small>${pct !== null ? `<em class="${pct >= 80 ? "good" : ""}">Logro ${pct}% · ${s.rounds || 0} ${s.rounds === 1 ? "ronda" : "rondas"}</em>` : `<em>Nuevo</em>`}</span></button>`;
  }).join("");
  $("zn-menu").querySelectorAll(".zn-card").forEach(b => b.addEventListener("click", () => zStart(b.dataset.t)));
}
// Elige ejercicios sin repetir los recientes (se recuerda qué vio el alumno en este nivel)
function zPick(type, n){
  const pool = EXERCISES[zLevel][type], key = zLevel + "." + type;
  const seen = store.get("zSeen", {}); let used = seen[key] || [];
  let fresh = pool.map((_, i) => i).filter(i => !used.includes(i));
  if (fresh.length < n){ used = []; fresh = pool.map((_, i) => i); }
  const pick = shuffle(fresh).slice(0, n);
  seen[key] = [...used, ...pick]; rawSet("zSeen", seen);
  return pick.map(i => pool[i]);
}
function zStart(type){
  const T = ZTYPES.find(t => t.id === type);
  zr = { T, items: zPick(type, T.n), i: 0, ok: 0, total: 0 };
  $("zn-menu").classList.add("hidden"); $("zn-levels").classList.add("hidden"); $("zn-end").classList.add("hidden");
  $("zn-play").classList.remove("hidden");
  $("zn-title").textContent = `${T.icon} ${T.name} · ${zLevel}`;
  zShow();
  document.querySelector("#zone .panel").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}
$("zn-back").addEventListener("click", zMenu);

function zShow(){
  const it = zr.items[zr.i];
  $("zn-count").textContent = `${zr.i + 1}/${zr.items.length}`;
  $("zn-bar").style.width = (zr.i / zr.items.length * 100) + "%";
  $("zn-msg").textContent = ""; $("zn-body").innerHTML = ""; $("zn-foot").innerHTML = "";
  Z[zr.T.id](it);
}
// Registrar resultado del ejercicio actual y mostrar "Siguiente"
function zDone(ok, total, why){
  zr.ok += ok; zr.total += total;
  if (ok === total){ sfx("correct"); confetti(30, $("zn-foot")); } else { sfx("wrong"); }
  if (ok) addXP(5 * ok);
  if (why) $("zn-body").insertAdjacentHTML("beforeend", `<div class="zn-why">💡 ${why}</div>`);
  const last = zr.i >= zr.items.length - 1;
  $("zn-foot").innerHTML = `<button class="btn play" id="zn-next" type="button">${last ? "Ver resultado 🏁" : "Siguiente →"}</button>`;
  $("zn-next").addEventListener("click", () => { if (last) zEnd(); else { zr.i++; zShow(); } });
  $("zn-next").focus();
}
function zCheckBtn(label, fn){
  $("zn-foot").innerHTML = `<button class="btn play" id="zn-check" type="button">✓ ${label || "Check"}</button>`;
  $("zn-check").addEventListener("click", fn);
}

const Z = {
  /* 🧩 Ordenar palabras: tocar para mover entre las palabras sueltas y la oración */
  scramble(it){
    const end = (it.s.match(/[.?!]$/) || [""])[0];
    // La primera palabra va en minúscula (para no dar pistas), salvo "I" / "I'm"
    const toks = it.s.replace(/[.?!]$/, "").split(" ").map((w, i) => i === 0 && !/^I('|$)/.test(w) ? w[0].toLowerCase() + w.slice(1) : w);
    let pool = shuffle(toks.map((w, i) => ({ w, i })));
    if (pool.map(p => p.w).join(" ") === toks.join(" ")) pool = pool.reverse();
    const line = [];
    $("zn-body").innerHTML = `<p class="zn-q">Ordena las palabras para formar la oración <span class="cap">${end === "?" ? "· es una pregunta" : ""}</span></p>
      <div class="zn-line" id="zs-line"></div><div class="zn-pool" id="zs-pool"></div>`;
    const draw = () => {
      $("zs-line").innerHTML = line.map((p, k) => `<button class="zn-chip" type="button" data-k="${k}">${esc(p.w)}</button>`).join("") + (line.length === toks.length ? `<span class="zn-chip" style="box-shadow:none;background:none">${end}</span>` : "");
      $("zs-pool").innerHTML = pool.map((p, k) => `<button class="zn-chip" type="button" data-k="${k}">${esc(p.w)}</button>`).join("");
      $("zs-line").querySelectorAll("button").forEach(b => b.onclick = () => { pool.push(...line.splice(+b.dataset.k, 1)); sfx("select"); draw(); });
      $("zs-pool").querySelectorAll("button").forEach(b => b.onclick = () => { line.push(...pool.splice(+b.dataset.k, 1)); sfx("select"); draw(); });
      $("zn-check").disabled = line.length !== toks.length;
    };
    zCheckBtn("Check", () => {
      const ans = zNorm(line.map(p => p.w).join(" "));
      const ok = [it.s, ...(it.alt || [])].some(x => zNorm(x) === ans);
      $("zs-line").classList.add(ok ? "ok" : "bad"); $("zs-pool").innerHTML = "";
      $("zs-line").querySelectorAll("button").forEach(b => b.disabled = true);
      zDone(ok ? 1 : 0, 1, ok ? "" : `La oración correcta es: <b>${esc(it.s)}</b>`);
      if (!ok) shake($("zs-line"));
    });
    draw();
  },

  /* ✏️ Language in use: elegir la opción correcta */
  use(it){
    const order = shuffle(it.o.map((o, i) => i));
    $("zn-body").innerHTML = `<p class="zn-q">${esc(it.q).replace("___", '<span class="gapb">___</span>')}</p>
      <div class="opts">${order.map((i, k) => `<button class="opt" type="button" data-i="${i}"><i>${"ABC"[k]}</i>${esc(it.o[i])}</button>`).join("")}</div>`;
    $("zn-body").querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => {
      const ok = +b.dataset.i === it.a;
      $("zn-body").querySelectorAll(".opt").forEach(x => { x.disabled = true; if (+x.dataset.i === it.a) x.classList.add("ok"); });
      if (!ok){ b.classList.add("bad"); shake(b); }
      $("zn-body").querySelector(".gapb").textContent = it.o[it.a];
      zDone(ok ? 1 : 0, 1, esc(it.why));
    }));
  },

  /* 📖 Vocabulario en contexto: completar los espacios del texto */
  vocab(it){
    const bank = shuffle([...it.a, ...it.x]);
    const html = esc(it.t).replace(/\{(\d)\}/g, (_, n) =>
      `<select data-g="${n - 1}" aria-label="Espacio ${n}"><option value="">(${n}) …</option>${bank.map(w => `<option>${esc(w)}</option>`).join("")}</select>`);
    $("zn-body").innerHTML = `<p class="hint">Elige la palabra correcta para cada espacio. Palabras: <b>${bank.map(esc).join(" · ")}</b></p><p class="zn-text">${html}</p>`;
    zCheckBtn("Check", () => {
      const sels = [...$("zn-body").querySelectorAll("select")];
      if (sels.some(s => !s.value)){ $("zn-msg").textContent = "Completa todos los espacios antes de revisar."; return; }
      let ok = 0;
      sels.forEach(s => {
        const right = it.a[+s.dataset.g], good = s.value === right; ok += good;
        s.classList.add(good ? "ok" : "bad"); s.disabled = true;
        if (!good) s.insertAdjacentHTML("afterend", `<span class="fixw">→ ${esc(right)}</span>`);
      });
      zDone(ok, sels.length, ok === sels.length ? "" : `Acertaste ${ok} de ${sels.length}. Lee el texto otra vez con las palabras correctas.`);
    });
  },

  /* 🔍 Encontrar el error: tocar la palabra incorrecta */
  mistake(it){
    const toks = it.s.split(" ");
    const badIdx = toks.findIndex(t => t.replace(/[.,?!]/g, "").toLowerCase() === it.bad.toLowerCase());
    $("zn-body").innerHTML = `<p class="zn-q">Toca la palabra que está mal</p>
      <div class="zn-words">${toks.map((t, k) => `<button type="button" data-k="${k}">${esc(t)}</button>`).join("")}</div>`;
    $("zn-body").querySelectorAll(".zn-words button").forEach(b => b.addEventListener("click", () => {
      const k = +b.dataset.k, ok = k === badIdx;
      $("zn-body").querySelectorAll(".zn-words button").forEach(x => x.disabled = true);
      const wrongBtn = $("zn-body").querySelector(`[data-k="${badIdx}"]`);
      wrongBtn.classList.add(ok ? "ok" : "bad");
      if (!ok){ b.classList.add("miss"); shake(b); wrongBtn.classList.add("bad"); }
      const fixed = toks.map((t, j) => j === badIdx ? (it.fix ? `<span class="zn-fix">${esc(t.replace(it.bad, it.fix))}</span>` : "") : esc(t)).filter(Boolean).join(" ");
      zDone(ok ? 1 : 0, 1, `${ok ? "¡Bien visto! " : `El error estaba en “${esc(it.bad)}”. `}${it.fix ? "" : "Esa palabra sobra. "}${esc(it.why)}<br>✔ ${fixed}`);
    }));
  },

  /* 🔤 Formación de palabras: escribir la forma correcta */
  wf(it){
    $("zn-body").innerHTML = `<p class="zn-q">${esc(it.s).replace("___", '<span class="gapb">___</span>')} <span class="zn-base">${esc(it.base)}</span></p>
      <input class="zn-input" id="zw-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Escribe la palabra transformada…">`;
    // 3 intentos: tras cada error se da una pista; la respuesta solo aparece al final
    let tries = 0;
    const check = () => {
      const inp = $("zw-in"), v = inp.value.trim().toLowerCase();
      if (!v){ $("zn-msg").textContent = "Escribe una palabra."; return; }
      if (v === it.base.toLowerCase()){ $("zn-msg").textContent = "Tienes que transformar la palabra (agrega un prefijo o sufijo)."; shake(inp); return; }
      if (!/^[a-z'-]+$/.test(v)){ $("zn-msg").textContent = "Escribe solo una palabra, sin números ni espacios."; shake(inp); return; }
      tries++;
      const ok = it.a.includes(v);
      if (!ok && tries < 3){
        const ans = it.a[0];
        $("zn-msg").innerHTML = tries === 1
          ? `✘ Todavía no. Pista: empieza con <b>${esc(ans[0])}</b> y tiene <b>${ans.length}</b> letras. Te quedan 2 intentos.`
          : `✘ Otra pista: <b>${esc(ans.slice(0, Math.ceil(ans.length / 2)))}${"_".repeat(ans.length - Math.ceil(ans.length / 2))}</b>. Último intento.`;
        sfx("wrong"); shake(inp); inp.select();
        return;
      }
      $("zn-msg").textContent = "";
      inp.classList.add(ok ? "ok" : "bad"); inp.disabled = true;
      $("zn-body").querySelector(".gapb").textContent = it.a[0];
      zDone(ok ? 1 : 0, 1, `${ok ? (tries > 1 ? `¡Bien! (en el intento ${tries}) ` : "") : `Respuesta: <b>${esc(it.a[0])}</b>. `}${esc(it.why)}`);
    };
    $("zw-in").addEventListener("keydown", e => { if (e.key === "Enter" && !$("zw-in").disabled) check(); });
    zCheckBtn("Check", check);
    setTimeout(() => { const x = $("zw-in"); if (x) x.focus(); }, 50);
  },

  /* 🎧 Dictado: escuchar y escribir (se aceptan errores mínimos de tipeo) */
  dict(s){
    $("zn-body").innerHTML = `<p class="zn-q">Escucha la oración y escríbela</p>
      <div class="row"><button class="btn talk" type="button" id="zd-play">🔊 Listen</button><button class="btn ghost" type="button" id="zd-slow">🐢 Slow</button></div>
      <input class="zn-input" id="zd-in" autocomplete="off" autocapitalize="sentences" spellcheck="false" placeholder="Escribe lo que escuchas…">`;
    $("zd-play").addEventListener("click", () => speak(s, .9));
    $("zd-slow").addEventListener("click", () => speakSlow(s));
    // 2 intentos: en el primero solo se marcan las palabras correctas; la oración completa aparece al final
    let tries = 0;
    const check = () => {
      const v = $("zd-in").value.trim();
      if (!v){ $("zn-msg").textContent = "Escribe la oración que escuchaste."; return; }
      tries++;
      const res = align(words(s), words(v));
      const good = res.filter(r => r.status === "ok").length, ok = good === res.length && words(v).length === res.length;
      if (!ok && tries < 2){
        const partial = res.map(r => r.status === "ok" ? `<span class="w-ok">${esc(r.word)}</span>` : `<span class="w-miss">${"_".repeat(Math.max(3, r.word.length))}</span>`).join(" ");
        $("zn-msg").innerHTML = `✘ Llevas ${good} de ${res.length} palabras. Escucha otra vez y corrige (último intento):<div class="zn-dict">${partial}</div>`;
        sfx("wrong"); shake($("zd-in")); $("zd-in").focus();
        return;
      }
      $("zn-msg").textContent = "";
      $("zd-in").classList.add(ok ? "ok" : "bad"); $("zd-in").disabled = true;
      const shown = res.map(r => `<span class="${r.status === "ok" ? "w-ok" : r.status === "unclear" ? "w-bad" : "w-miss"}">${esc(r.word)}</span>`).join(" ");
      zDone(ok ? 1 : 0, 1, `${ok ? "¡Perfecto! " : `Acertaste ${good} de ${res.length} palabras. `}<div class="zn-dict">${shown}</div>`);
    };
    $("zd-in").addEventListener("keydown", e => { if (e.key === "Enter" && !$("zd-in").disabled) check(); });
    zCheckBtn("Check", check);
    setTimeout(() => speak(s, .9), 400);
  },

  /* 📚 Lectura: texto breve con 3 preguntas */
  read(it){
    const picks = {};
    $("zn-body").innerHTML = `<div class="zn-reading"><h4>${esc(it.title)}</h4><p>${esc(it.text)}</p></div>
      ${it.qs.map((q, qi) => `<div class="zn-rq" data-q="${qi}"><p>${qi + 1}. ${esc(q.q)}</p>
        ${q.o.map((o, oi) => `<button class="opt" type="button" data-o="${oi}"><i>${"ABC"[oi]}</i>${esc(o)}</button>`).join("")}</div>`).join("")}`;
    $("zn-body").querySelectorAll(".zn-rq").forEach(box => box.querySelectorAll(".opt").forEach(b => b.addEventListener("click", () => {
      picks[box.dataset.q] = +b.dataset.o; box.querySelectorAll(".opt").forEach(x => x.classList.toggle("pick", x === b)); sfx("select");
    })));
    zCheckBtn("Check", () => {
      if (Object.keys(picks).length < it.qs.length){ $("zn-msg").textContent = "Responde las 3 preguntas antes de revisar."; return; }
      let ok = 0;
      $("zn-body").querySelectorAll(".zn-rq").forEach(box => {
        const q = it.qs[+box.dataset.q], p = picks[box.dataset.q]; ok += p === q.a;
        box.querySelectorAll(".opt").forEach(x => { x.disabled = true; x.classList.remove("pick");
          if (+x.dataset.o === q.a) x.classList.add("ok"); else if (+x.dataset.o === p) x.classList.add("bad"); });
      });
      zDone(ok, it.qs.length, ok === it.qs.length ? "" : `Acertaste ${ok} de ${it.qs.length}. Vuelve al texto y busca la respuesta correcta.`);
    });
  }
};

// Fin de la ronda: puntaje, estrellas, XP extra y estadísticas
function zEnd(){
  const pct = zr.total ? Math.round(zr.ok / zr.total * 100) : 0, T = zr.T;
  const bonus = pct === 100 ? 20 : pct >= 80 ? 10 : 0;
  if (bonus) addXP(bonus);
  stats.zone = stats.zone || {};
  const s = stats.zone[T.id] = stats.zone[T.id] || { done: 0, ok: 0, best: 0, rounds: 0 };
  s.done += zr.total; s.ok += zr.ok; s.rounds++; s.best = Math.max(s.best, pct);
  stats.zoneRounds = (stats.zoneRounds || 0) + 1;
  if (pct === 100) stats.zonePerfect = (stats.zonePerfect || 0) + 1;
  store.set("stats", stats);
  $("zn-bar").style.width = "100%";
  $("zn-play").classList.add("hidden"); $("zn-end").classList.remove("hidden");
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct > 0 ? 1 : 0;
  $("zn-end").innerHTML = `<div class="zn-end">
      <span class="cap">${T.icon} ${T.name} · ${zLevel}</span>
      <div class="big">${zr.ok}/${zr.total}</div>
      <div class="stars">${"⭐".repeat(stars)}${"☆".repeat(3 - stars)}</div>
      <p class="lead" style="margin:0 auto">${pct === 100 ? "¡Ronda perfecta! 💯" : pct >= 80 ? "¡Excelente trabajo!" : pct >= 60 ? "¡Bien! Sigue practicando para llegar a las 3 estrellas." : "¡Buen intento! Repite la ronda: cada vez será más fácil."}
        ${bonus ? `<br><b>+${bonus} XP extra</b>` : ""}</p>
      <div class="row" style="justify-content:center">
        <button class="btn play" id="zn-again" type="button">↻ Otra ronda</button>
        <button class="btn ghost" id="zn-menu-btn" type="button">Elegir otro ejercicio</button>
      </div></div>`;
  $("zn-again").addEventListener("click", () => zStart(T.id));
  $("zn-menu-btn").addEventListener("click", zMenu);
  if (pct >= 80){ sfx("badge"); confetti(pct === 100 ? 200 : 120); }
  checkBadges();
}
// Resumen por habilidad para el reporte del profe (ej. "Gramática 80% · Lectura 67%")
function zoneSummary(){
  const by = {};
  ZTYPES.forEach(t => { const s = (stats.zone || {})[t.id]; if (s && s.done){ by[t.skill] = by[t.skill] || { ok: 0, done: 0 }; by[t.skill].ok += s.ok; by[t.skill].done += s.done; } });
  return Object.entries(by).map(([k, v]) => `${k} ${Math.round(v.ok / v.done * 100)}% (${v.done})`).join(" · ");
}
zRenderLevels(); zMenu();

