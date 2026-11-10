/* Portada de eslteacher.cl · parte de index.html (se cargan en orden: datos, juego, mundos, voz, diagnostico, zone, perfil) */
/* =====================================================================
   DIAGNÓSTICO DE SONIDOS
   Compara la palabra que había que decir con la que entendió el reconocedor
   y deduce qué sonido falló (ej. think → "tink" = /θ/ pronunciada como /t/).
   ===================================================================== */
const SOUNDS = {
  th:  { ipa:"/θ/ · /ð/", label:"th", tw:"th", pair:["think","sink"],
         how:"Pon la punta de la lengua entre los dientes y sopla sin cortar el aire. /θ/ es sin voz (think), /ð/ con voz (this). No es t, d ni s." },
  v:   { ipa:"/v/", label:"v", tw:"v / w", pair:["very","berry"],
         how:"Apoya los dientes de arriba sobre el labio inferior y haz vibrar la garganta. En la /b/ se juntan los dos labios; en la /v/ no." },
  sc:  { ipa:"/s/ + consonante", label:"s inicial", tw:"s + consonante", pair:["school","eschool"],
         how:"Empieza directo con un siseo largo, sin vocal antes: sss-chool, sss-pain. No digas “es”." },
  h:   { ipa:"/h/", label:"h aspirada", tw:"h aspirada", pair:["hat","at"],
         how:"La h inglesa es un soplido suave, como empañar un vidrio: h-hat. No la omitas, pero tampoco la hagas áspera como la j española." },
  y:   { ipa:"/j/", label:"y", tw:"y / j", pair:["yes","Jess"],
         how:"La lengua casi toca el paladar, como una “i” muy rápida: yes = /jes/. No la pronuncies como “sh” ni como “ll”." },
  j:   { ipa:"/dʒ/", label:"j", tw:"y / j", pair:["jam","yam"],
         how:"Pega la lengua al paladar y suéltala con voz, como una “ch” vibrante: jam /dʒæm/." },
  sh:  { ipa:"/ʃ/", label:"sh", tw:"sh / s", pair:["ship","chip"],
         how:"Labios redondeados hacia afuera y aire continuo, como pedir silencio: shhh. Si cortas el aire, suena “ch”." },
  ch:  { ipa:"/tʃ/", label:"ch", tw:"ch", pair:["chair","share"],
         how:"Empieza con la lengua pegada (como una t) y suelta de golpe: ch-air. Es un sonido corto, no continuo." },
  z:   { ipa:"/z/", label:"z sonora", tw:"z sonora", pair:["zoo","Sue"],
         how:"Mismo lugar que la s, pero vibrando la garganta como una abeja: zzz. Pon la mano en el cuello y siente la vibración." },
  rl:  { ipa:"/r/ · /l/", label:"r / l", tw:"r / l / y", pair:["right","light"],
         how:"/r/: curva la lengua hacia atrás sin tocar nada y sin vibrar. /l/: la punta toca justo detrás de los dientes de arriba." },
  w:   { ipa:"/w/", label:"w", tw:"v / w", pair:["wood","good"],
         how:"Redondea los labios como para decir “u” y ábrelos rápido: w-ood. No agregues “g” ni “b” antes." },
  ng:  { ipa:"/ŋ/", label:"ng final", tw:"ng final", pair:["sing","sin"],
         how:"Termina con la parte de atrás de la lengua contra el paladar blando, sin soltar una g fuerte: sing /sɪŋ/." },
  fin: { ipa:"consonante final", label:"sonido final", tw:"b / l", pair:["big","bee"],
         how:"En inglés la última consonante cambia el significado: pronúnciala clara y corta, sin agregar vocal: big /bɪɡ/, no “bi” ni “bigue”." },
  s:   { ipa:"-s /s/ /z/", label:"-s final", tw:"s + consonante", pair:["cats","cat"],
         how:"La -s del plural y de he/she/it (she plays) siempre se pronuncia: cats /s/, dogs /z/." },
  ed:  { ipa:"-ed /t/ /d/ /ɪd/", label:"-ed", tw:"-ed", pair:["walked","walk"],
         how:"Después de p, k, s, sh, ch, f suena /t/ (walked); después de t o d suena /ɪd/ (wanted); en los demás casos /d/ (played). Nunca “ed” completo." },
  ii:  { ipa:"/ɪ/ · /iː/", label:"i corta / i larga", tw:"i corta / i larga", pair:["ship","sheep"],
         how:"/ɪ/ (ship) es corta y relajada, casi entre “i” y “e”. /iː/ (sheep) es larga y tensa, sonriendo. Cambiar la duración cambia la palabra." },
  ae:  { ipa:"/æ/", label:"a abierta", tw:"a abierta /æ/", pair:["cat","cut"],
         how:"Abre bien la boca y estira los labios, entre “a” y “e”: cat /kæt/. No es la “a” del español." },
  uh:  { ipa:"/ʌ/", label:"u corta", tw:"u corta /ʌ/", pair:["cup","cap"],
         how:"Sonido corto y neutro, boca medio abierta, como una “a” relajada: cup /kʌp/. No es una “u”." },
  weak:{ ipa:"/ə/ formas débiles", label:"palabras cortas", tw:"", pair:null,
         how:"Palabras como the, a, to, of y and se dicen suaves y pegadas a la siguiente: to the park = /tə ðə pɑːk/. No las omitas, pero tampoco las acentúes." }
};
const WEAK = new Set(["the","a","an","to","of","and","for","at","can","was","were","are","is","from","some","them","her","his","as","but","or","than","that","you","your","do","does","has","have"]);

// ¿Reemplazando "from" por alguna opción en la palabra correcta se obtiene lo que se escuchó?
function swapNear(w, h, from, toList){
  if (!w.includes(from)) return null;
  for (const to of toList){
    const c = w.split(from).join(to);
    if (c === h || (c.length > 3 && h.length > 3 && lev(c, h) <= 1)) return to;
  }
  return null;
}
// Devuelve { key, detail } con el sonido que falló, o null si no se reconoce un patrón
// Vocales "aproximadas" para comparar cómo suena (see≈si, sue≈zoo≈u)
const loose = s => s.replace(/ee|ea|ie|ey|y$/g, "i").replace(/oo|ou|ue|ew/g, "u").replace(/e$/, "");
function diagnose(w, h){
  if (!w || !h || w === h) return null;
  let r;
  // Sonidos iniciales en palabras cortas (she → see, chair → share, would → good, zoo → sue)
  if (/^sh/.test(w) && /^s[^h]/.test(h) && lev(loose(w.slice(2)), loose(h.slice(1))) <= 1)
    return { key:"sh", detail:"Tu /ʃ/ (sh) sonó como /s/: redondea los labios." };
  if (/^ch/.test(w) && /^sh/.test(h) && lev(loose(w.slice(2)), loose(h.slice(2))) <= 2)
    return { key:"ch", detail:"Tu /tʃ/ (ch) sonó como “sh”: corta el aire al empezar." };
  if (/^w/.test(w) && w.length >= 4 && /^(gu|g|b)/.test(h) && lev(loose(w.slice(1)), loose(h.replace(/^(gu|g|b)/, ""))) <= 2)
    return { key:"w", detail:"Agregaste un sonido “g/b” antes de la /w/." };
  if (/^z/.test(w) && /^s/.test(h) && lev(loose(w.slice(1)), loose(h.slice(1))) <= 1)
    return { key:"z", detail:"Tu /z/ sonó como /s/: falta la vibración." };
  if (/[bdgkptfvszmx]$/.test(w) && w.length <= 5 && h[0] === w[0] && /[aeiouy]$/.test(h) && lev(loose(w.slice(0, -1)), loose(h)) <= 1)
    return { key:"fin", detail:"Se perdió la consonante final." };
  if (/ed$/.test(w) && w.length > 4 && (h === w.slice(0, -2) || h === w.slice(0, -1)))
    return { key:"ed", detail:"No se escuchó la terminación -ed." };
  if (/[^s]s$/.test(w) && w.length > 3 && h === w.slice(0, -1))
    return { key:"s", detail:"No se escuchó la -s final." };
  if (!h.includes("th") && (r = swapNear(w, h, "th", ["t","d","f","s","z"])))
    return { key:"th", detail:`Tu /θ/ sonó como /${r}/.` };
  if (/^s[ptkcmnlw]/.test(w) && /^[ei]s/.test(h) && lev(h.slice(1), w) <= 1)
    return { key:"sc", detail:"Agregaste una vocal antes de la s inicial." };
  if (!h.includes("v") && swapNear(w, h, "v", ["b"]))
    return { key:"v", detail:"Tu /v/ sonó como /b/." };
  if (!h.includes("sh") && (r = swapNear(w, h, "sh", ["ch","s"])))
    return { key:"sh", detail:`Tu /ʃ/ (sh) sonó como “${r}”.` };
  if (!h.includes("ch") && swapNear(w, h, "ch", ["sh"]))
    return { key:"ch", detail:"Tu /tʃ/ (ch) sonó como “sh”: corta el aire al empezar." };
  if (/^y/.test(w) && /^(j|g[ei])/.test(h) && lev("j" + w.slice(1), h.replace(/^g/, "j")) <= 1)
    return { key:"y", detail:"Tu /j/ (y) sonó como /dʒ/ (j)." };
  if (/^j/.test(w) && /^y/.test(h) && lev("y" + w.slice(1), h) <= 1)
    return { key:"j", detail:"Tu /dʒ/ (j) sonó como /j/ (y)." };
  if (/^h/.test(w) && !/^(hour|honest|honou?r|heir)/.test(w) && /^[aeiou]/.test(h) && (lev(w.slice(1), h) <= 1 || lev(loose(w.slice(1)), loose(h)) <= 1))
    return { key:"h", detail:"No se escuchó la h inicial." };
  if (/^w/.test(w) && /^(gu|g|b)/.test(h) && lev(w.slice(1), h.replace(/^(gu|g|b)/, "")) <= 1)
    return { key:"w", detail:"Agregaste un sonido “g/b” antes de la /w/." };
  if ((r = swapNear(w, h, "r", ["l"])) || (r = swapNear(w, h, "l", ["r"])))
    return { key:"rl", detail:`Se confundió /r/ con /l/.` };
  if (!h.includes("z") && swapNear(w, h, "z", ["s"]))
    return { key:"z", detail:"Tu /z/ sonó como /s/: falta la vibración." };
  if (/ng$/.test(w) && (h === w.slice(0, -1) || h === w.slice(0, -2) + "n"))
    return { key:"ng", detail:"Tu /ŋ/ final sonó como /n/." };
  if (swapNear(w, h, "i", ["ee","ea"]) || swapNear(w, h, "ee", ["i"]) || swapNear(w, h, "ea", ["i"]))
    return { key:"ii", detail:/ee|ea/.test(w) ? "Tu /iː/ larga sonó corta." : "Tu /ɪ/ corta sonó larga." };
  if (/[^aeiou]a[^aeiouwyr]($|[^aeiou])/.test(w) && swapNear(w, h, "a", ["u","e","o"]))
    return { key:"ae", detail:"Tu /æ/ no se abrió lo suficiente." };
  if (/[^aeiou]u[^aeiou]($|[^aeiou])/.test(w) && swapNear(w, h, "u", ["a","o"]))
    return { key:"uh", detail:"Tu /ʌ/ sonó como otra vocal." };
  if (/[bdgkptfvszmx]$/.test(w) && h.length < w.length && w.startsWith(h.replace(/[aeiouy]$/, "")) && h.length >= 2)
    return { key:"fin", detail:"Se perdió la consonante final." };
  return null;
}

/* Consejo general según la ortografía (cuando no se detecta un error de sonido concreto) */
function soundTip(w){
  if (/th/.test(w)) return ["th", "Pon la punta de la lengua entre los dientes y sopla suavemente: think /θ/, this /ð/. No es 't' ni 'd'."];
  if (/^s[ptkcmnlw]/.test(w)) return ["s + consonante", "No agregues una 'e' al inicio: di “s-chool”, no “eschool”. Empieza con un siseo: sss…"];
  if (/v/.test(w)) return ["v", "Muerde suavemente el labio inferior con los dientes de arriba y haz vibrar: /v/. En inglés la v no suena como b."];
  if (/sh/.test(w)) return ["sh", "Redondea los labios como cuando pides silencio: shhh."];
  if (/^h/.test(w)) return ["h", "La h inglesa sí suena: es como una 'j' muy suave, un suspiro: h-ello."];
  if (/^j|dg|ge$/.test(w)) return ["j /dʒ/", "La j inglesa suena como una 'ch' más vibrante: jump = /dʒʌmp/."];
  if (/^y/.test(w)) return ["y", "La y inicial suena como una 'i' rápida: yes = “iés”, no “shés”."];
  if (/^w|wh/.test(w)) return ["w", "Redondea los labios como para decir 'u' y abre rápido: w = 'u' rápida."];
  if (/ed$/.test(w)) return ["-ed", "La terminación -ed tiene tres sonidos: /t/ (walked), /d/ (played), /ɪd/ (wanted). Casi nunca es “ed”."];
  if (/r/.test(w)) return ["r", "La r inglesa no vibra: curva la lengua hacia atrás sin tocar el paladar."];
  if (/z/.test(w)) return ["z", "La z inglesa zumba como una abeja: zzz."];
  if (/[tdkpgbsz]$/.test(w)) return ["sonido final", "Pronuncia la consonante del final, no la elimines: “big”, no “bi”."];
  if (/i[^aeiou]/.test(w)) return ["i corta /ɪ/", "La i corta es más relajada que la i española, casi entre 'i' y 'e'."];
  return ["ritmo", "Escucha el modelo en modo 🐢 lento y repite sílaba por sílaba."];
}

function localFeedback(text, heard, conf){
  const res = align(words(text), words(heard));
  const n = res.length || 1, ok = res.filter(r => r.status === "ok").length, unc = res.filter(r => r.status === "unclear").length;
  let score = Math.round((ok + unc * .35) / n * 100);
  if (conf > 0 && score > 0) score = Math.round(score * .85 + conf * 15);
  score = Math.max(0, Math.min(100, score));
  const level = score >= 85 ? "excellent" : score >= 60 ? "good" : "keep_practicing";
  // Diagnóstico palabra por palabra
  const wordsOut = res.map(r => {
    if (r.status === "ok") return r;
    if (r.status === "missing" && WEAK.has(r.word)) return { ...r, issue: "weak", detail: `No se escuchó “${r.word}”.` };
    const d = r.status === "unclear" ? diagnose(r.word, r.heard) : null;
    if (d) return { ...r, issue: d.key, detail: d.detail };
    const [hint, tip] = soundTip(r.word);                           // sin patrón claro: consejo general
    return { ...r, issue: null, hint, tip,
      detail: r.status === "missing" ? `No se escuchó “${r.word}”.` : `Sonó como “${r.heard}”.` };
  });
  const problems = wordsOut.filter(w => w.status !== "ok");
  // Sonidos con error (sin repetir), ordenados por cuántas veces aparecen
  const counts = {};
  problems.forEach(p => { if (p.issue) counts[p.issue] = (counts[p.issue] || 0) + 1; });
  const issues = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  const main = issues[0] ? SOUNDS[issues[0]] : null;
  const summary_es = level === "excellent" ? "¡Excelente! Se entendió todo muy claro. Sigue así y prueba una frase más difícil."
    : main ? `${level === "good" ? "¡Muy bien! Se entendió casi todo." : "¡Buen intento!"} Lo principal a mejorar es el sonido ${main.ipa} (${main.label}). Mira cómo hacerlo abajo.`
    : level === "good" ? `¡Muy bien! Se entendió casi todo. Revisa ${problems.length === 1 ? "esta palabra" : "estas palabras"}: ${problems.map(p => p.word).join(", ")}.`
    : "¡Buen intento! Escucha el modelo en modo lento, repite por partes y vuelve a grabar. ¡Tú puedes!";
  const summary_en = level === "excellent" ? "Excellent! Very clear pronunciation." : level === "good" ? "Very good! Almost everything was clear." : "Good try! Listen again and practice slowly.";
  const tips = problems.length
    ? ["Escucha el modelo en 🐢 lento, repite primero las palabras marcadas y luego la frase completa."]
    : ["Ahora intenta decirlo un poco más rápido y con más entonación, como en una conversación real."];
  // Trabalenguas del sonido que más costó
  const tw = main && main.tw ? TWISTERS.find(t => t[1].startsWith("Practica: " + main.tw)) : null;
  return { score, level, summary_es, summary_en, words: wordsOut, issues, tips_es: tips,
    next_phrase: tw && tw[0] !== text ? tw[0] : "", next_label: main ? `Trabalenguas para practicar ${main.ipa}` : "" };
}

function evaluate(){
  const fb = $("fb"); fb.classList.remove("hidden");
  const data = localFeedback(target.text, heardText, confidence);
  renderFeedback(data);
  // Panel del profe: qué había que decir y qué entendió el reconocedor (no se registran las frases propias)
  if (mode !== "own") logPortada("portada", { activity: "Speak & shine · " + mode, item: { k: "PRON", q: "Say: " + target.text },
    chosen: heardText, right: target.text, ok: data.level !== "keep_practicing" });
  attempts =[...attempts, data.score].slice(-8); store.set("attempts", attempts);
  $("history").textContent = "Your last scores · Tus últimos puntajes: " + attempts.join(" · ");
  stats.pronBest = Math.max(stats.pronBest || 0, data.score);
  stats.pronCount = (stats.pronCount || 0) + 1; stats.pronSum = (stats.pronSum || 0) + data.score;
  // Contar los sonidos con error, para el perfil y el panel del profe
  stats.sounds = stats.sounds || {};
  (data.issues || []).forEach(k => { stats.sounds[k] = (stats.sounds[k] || 0) + 1; });
  store.set("stats", stats);
  addXP(Math.round(data.score / 10));
  if (data.score >= 85){ sfx("correct"); confetti(130); } else if (data.score < 60) sfx("wrong");
  checkBadges();
  // Si la frase venía de la palabra del día y salió bien, se marca el paso 3
  if (wpSay && wpSay.text === target.text && data.score >= 60){
    const already = (wpDone[wpSay.i] || {}).say;
    markStep(wpSay.i, "say");
    if (!already) toast("⭐ ¡Paso 3 listo! Dijiste la palabra del día en voz alta.");
  }
}

function renderFeedback(d){
  const label = { excellent:"Excellent · Excelente", good:"Good · Bien", keep_practicing:"Keep practicing · Sigue practicando" }[d.level] || "";
  const problems = (d.words || []).filter(w => w.status !== "ok");
  // Una tarjeta por sonido con error (máx. 3) + consejos generales para palabras sin patrón claro
  const cards = (d.issues || []).slice(0, 3).map(k => {
    const S = SOUNDS[k], ex = problems.filter(p => p.issue === k);
    const twi = S.tw ? TWISTERS.findIndex(t => t[1].startsWith("Practica: " + S.tw)) : -1;
    return `<div class="snd">
      <div class="snd-h"><b>${esc(S.ipa)}</b><span>${esc(S.label)}</span></div>
      <p class="snd-what">${ex.map(p => `<b>${esc(p.word)}</b>${p.heard ? ` → oí “${esc(p.heard)}”` : ""}`).join(" · ")}<br>${esc(ex[0].detail)}</p>
      <p class="snd-how"><span class="cap">Cómo se hace</span>${esc(S.how)}</p>
      <div class="row">
        ${S.pair ? `<button class="btn ghost sm" type="button" data-pair="${esc(S.pair.join("|"))}">🔊 ${esc(S.pair[0])} / ${esc(S.pair[1])}</button>` : ""}
        ${twi >= 0 ? `<button class="btn talk sm" type="button" data-tw="${twi}">🎯 Practicar <span class="ipa">${esc(S.ipa)}</span></button>` : ""}
      </div>
    </div>`;
  }).join("");
  const generic = problems.filter(p => !p.issue && p.tip).slice(0, 2);
  $("fb").innerHTML = `
    <div class="score"><b>${d.score}</b><div style="flex:1"><span class="cap">${label} · /100</span><div class="meter"><i style="width:0"></i></div></div></div>
    <div class="teacher"><span class="avatar">${d.level === "excellent" ? "🏆" : d.level === "good" ? "👍" : "💪"}</span><div><p>${esc(d.summary_es)}</p>${d.summary_en ? `<p class="en">${esc(d.summary_en)}</p>` : ""}</div></div>
    <div class="wchips">${(d.words || []).map(w => `<span class="wc ${w.status}" title="${w.heard ? "Escuché: " + esc(w.heard) : ""}">${w.status === "ok" ? "✓" : w.status === "unclear" ? "~" : "✕"} ${esc(w.word)}${w.status === "unclear" && w.heard ? ` → ${esc(w.heard)}` : ""}</span>`).join("")}</div>
    ${cards ? `<div class="snds">${cards}</div>` : ""}
    ${generic.length ? `<ul class="tips">${generic.map(w => `<li><span><b>${esc(w.word)}</b> <span class="hint">${esc(w.detail)}</span><br>${esc(w.tip)}</span></li>`).join("")}</ul>` : ""}
    ${(d.tips_es || []).length ? `<div><span class="cap">Profe tips · Consejos</span><ul class="tips" style="margin-top:10px">${d.tips_es.map(t => `<li><span>${esc(t)}</span></li>`).join("")}</ul></div>` : ""}
    <div class="row">
      <button class="btn talk" id="fb-again" type="button">↻ Try again</button>
      <button class="btn ghost" id="fb-hear" type="button">🔊 Hear model</button>
      ${d.next_phrase ? `<button class="btn ghost" id="fb-next" type="button">Next: “${esc(d.next_phrase)}” →</button>` : ""}
    </div>
    <p class="note">El reconocimiento de voz del navegador puede equivocarse a veces. Si crees que lo dijiste bien, ¡inténtalo otra vez!</p>`;
  requestAnimationFrame(() => { const m = $("fb").querySelector(".meter i"); if (m) m.style.width = d.score + "%"; });
  $("fb-again").addEventListener("click", () => $("rec").click());
  $("fb-hear").addEventListener("click", () => speak(target.text, .8));
  const nx = $("fb-next"); if (nx) nx.addEventListener("click", () => { setTarget(d.next_phrase, d.next_label || "Trabalenguas para practicar ese sonido"); });
  // Par mínimo: escuchar las dos palabras seguidas para notar la diferencia
  $("fb").querySelectorAll("[data-pair]").forEach(b => b.addEventListener("click", () => {
    const [a, c] = b.dataset.pair.split("|"); speak(`${a}. ... ${c}. ... ${a}.`, .75);
  }));
  $("fb").querySelectorAll("[data-tw]").forEach(b => b.addEventListener("click", () => {
    const t = TWISTERS[+b.dataset.tw]; setTarget(t[0], t[1]); $("t-phrase").scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  }));
}
if (attempts.length) $("history").textContent = "Your last scores · Tus últimos puntajes: " + attempts.join(" · ");

