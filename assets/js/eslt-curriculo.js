/* CURRÍCULO DE INGLÉS (Programas de Estudio del Mineduc) conectado con los juegos de eslteacher.cl.
   Lo usan el Panel del profe (ficha del alumno y pestaña "Currículum") y "Mi avance".

   Qué hay aquí:
   1. OA: los Objetivos de Aprendizaje de cada curso, por eje, con un enunciado resumido.
      Fuente: Programas de Estudio de 5° y 6° básico, 7° y 8° básico, 1° medio (16 OA cada uno) y 3° medio (4 OA).
   2. TIPOS: qué tipo de evidencia entrega cada habilidad de cada juego (lectura explícita, vocabulario, gramática…).
   3. TIPO_A_OA: a qué OA aporta cada tipo de evidencia, según el curso del alumno.

   IMPORTANTE: la relación juego → OA es una propuesta pedagógica, no viene en los programas. Revísala y ajústala:
   para cambiarla, edita TIPOS (por juego) o TIPO_A_OA (por ciclo). Los juegos solo entregan evidencia de una parte
   de cada OA y casi nada de expresión oral y escrita: esos objetivos se evalúan en clases.
   AL AGREGAR UN JUEGO: suma sus habilidades en TIPOS. */
(function () {
  // ---------- 1. Objetivos de Aprendizaje ----------
  const BASICA = {                       // 5° y 6° básico
    ejes: [
      { name: "Comprensión auditiva", oa: [1, 2, 3, 4] },
      { name: "Comprensión de lectura", oa: [5, 6, 7, 8, 9] },
      { name: "Expresión oral", oa: [10, 11, 12, 13] },
      { name: "Expresión escrita", oa: [14, 15, 16] }
    ],
    oa: {
      1: "Escuchar y comprender información explícita en textos orales simples (diálogos, canciones, cuentos, textos expositivos).",
      2: "Identificar en los textos escuchados el tema, ideas generales, información específica, vocabulario y sonidos del inglés.",
      3: "Escuchar usando estrategias para comprender (predecir, usar claves del contexto y apoyo visual).",
      4: "Reaccionar a los textos escuchados, expresando preferencias u opiniones y haciendo conexiones personales.",
      5: "Leer y comprender textos no literarios simples, con apoyo visual, sobre los temas del año.",
      6: "Leer comprensivamente textos no literarios, identificando propósito, ideas generales, información explícita y vocabulario.",
      7: "Leer comprensivamente textos literarios simples (rimas, cuentos, tiras cómicas), identificando tema, personajes, secuencia y vocabulario.",
      8: "Reaccionar a los textos leídos, expresando preferencias u opiniones y haciendo conexiones personales.",
      9: "Usar estrategias para comprender los textos leídos (prelectura, lectura y poslectura).",
      10: "Reproducir y producir textos orales (canciones, rimas, diálogos) para familiarizarse con los sonidos del inglés.",
      11: "Expresarse oralmente en diálogos, presentaciones o actividades grupales sobre los temas del año.",
      12: "Participar en diálogos con pares y profesores (saludar, expresar gustos, pedir y dar información, describir).",
      13: "Demostrar conocimiento y uso del vocabulario aprendido.",
      14: "Completar y escribir textos breves de acuerdo a un modelo y con apoyo visual.",
      15: "Escribir para realizar funciones (describir, expresar gustos y cantidades, dar información).",
      16: "Utilizar los pasos del proceso de escritura (organizar ideas, escribir, corregir y publicar)."
    }
  };
  const MEDIA = {                        // 7° básico, 8° básico y 1° medio
    ejes: [
      { name: "Comunicación oral", oa: [1, 2, 3, 4, 5, 6, 7, 8] },
      { name: "Comprensión de lectura", oa: [9, 10, 11, 12] },
      { name: "Expresión escrita", oa: [13, 14, 15, 16] }
    ],
    oa: {
      1: "Demostrar comprensión de ideas generales e información explícita en textos orales.",
      2: "Identificar palabras y frases clave, expresiones, vocabulario temático, conectores y sonidos en textos orales.",
      3: "Identificar en los textos escuchados propósito, tema, información específica, secuencias y relaciones entre ideas.",
      4: "Usar estrategias para apoyar la comprensión de los textos escuchados.",
      5: "Presentar información en forma oral, usando recursos multimodales, con pronunciación inteligible.",
      6: "Participar en interacciones y exposiciones, usando estrategias para expresarse con claridad y fluidez.",
      7: "Reaccionar a textos leídos o escuchados en exposiciones, discusiones y conversaciones.",
      8: "Demostrar conocimiento y uso del lenguaje en conversaciones, discusiones y exposiciones.",
      9: "Demostrar comprensión de ideas generales e información explícita en textos escritos.",
      10: "Demostrar comprensión de textos no literarios: ideas generales, información específica, relaciones entre ideas y vocabulario.",
      11: "Demostrar comprensión de textos literarios: tema, personajes, entorno, trama y vocabulario.",
      12: "Usar estrategias para apoyar la comprensión de los textos leídos (prelectura, lectura y poslectura).",
      13: "Escribir historias e información relevante, usando recursos multimodales.",
      14: "Escribir una variedad de textos breves siguiendo los pasos del proceso de escritura.",
      15: "Escribir para informar, expresar opiniones y narrar, con estructuras, conectores, ortografía y puntuación adecuadas.",
      16: "Demostrar conocimiento y uso del lenguaje en sus textos escritos."
    }
  };
  const TERCERO = {                      // 3° medio
    ejes: [{ name: "Comprensión y producción de textos", oa: [1, 2, 3, 4] }],
    oa: {
      1: "Comprender información central de textos orales y escritos en contextos relacionados con sus intereses e inquietudes.",
      2: "Producir textos orales y escritos breves y claros para expresar una postura personal crítica que respeta otras posturas.",
      3: "Utilizar su conocimiento del inglés en la comprensión y producción de textos orales y escritos breves y claros.",
      4: "Producir y comprender con fluidez textos orales y escritos en situaciones comunicativas, para interactuar."
    }
  };
  const LEVELS = {
    "5basico": { name: "5° básico", ...BASICA, ciclo: "basica" }, "6basico": { name: "6° básico", ...BASICA, ciclo: "basica" },
    "7basico": { name: "7° básico", ...MEDIA, ciclo: "media" }, "8basico": { name: "8° básico", ...MEDIA, ciclo: "media" },
    "1medio": { name: "1° medio", ...MEDIA, ciclo: "media" }, "3medio": { name: "3° medio", ...TERCERO, ciclo: "tercero" }
  };
  // "5°A" → "5basico" · "1°B HC" → "1medio"
  function levelOf(section) {
    const m = /^(\d)°/.exec(String(section || "")); if (!m) return null;
    const n = +m[1], k = (n >= 5 ? n + "basico" : n + "medio");
    return LEVELS[k] ? k : null;
  }

  // ---------- 2. Tipo de evidencia de cada habilidad de cada juego ----------
  const HABILIDADES = {                  // visión general, igual para todos los cursos
    LISTEN: "Comprensión auditiva", READ: "Comprensión de lectura", VOCAB: "Vocabulario",
    GRAM: "Gramática y uso del lenguaje", WRITE: "Escritura (palabras y oraciones)", SPEAK: "Expresión oral"
  };
  // tipo de evidencia → habilidad general
  const TIPO_HAB = { LISTEN: "LISTEN", DICT: "LISTEN", INSTR: "READ", READ_EXP: "READ", READ_INF: "READ", READ_REF: "READ",
    VOCAB: "VOCAB", GRAM: "GRAM", WRITE: "WRITE", PRON: "SPEAK", CONV: "SPEAK" };
  const WORLDS = { L: "READ_EXP", I: "READ_INF", R: "READ_REF", C: "VOCAB" };
  const TIPOS = {
    "festival-quest-1m": { E: "READ_EXP", I: "READ_INF", V: "VOCAB", L: "GRAM", Q: "GRAM" },
    "weather-heroes-5b": { V: "VOCAB", A: "LISTEN", R: "READ_EXP", G: "GRAM", O: "WRITE", C: "WRITE" },
    "weather-worlds-5b": WORLDS,
    "travel-city-6b": { R: "READ_EXP", V: "VOCAB", S: "WRITE", O: "WRITE", P: "LISTEN" },
    "past-quest-6b": { reg: "GRAM", irr: "GRAM", neg: "GRAM", int: "GRAM", adj: "GRAM", mix: "GRAM", read: "READ_EXP" },
    "ludo-world-6b": { voca: "VOCAB", adj: "VOCAB", past: "GRAM", wh: "GRAM", read: "READ_EXP" },
    "green-quest-7b": { E: "READ_EXP", I: "READ_INF", A: "GRAM", R: "GRAM", Z: "GRAM", V: "VOCAB" },
    "mission-2050-8b": { READ: "READ_EXP", INF: "READ_INF", VOC: "VOCAB", WILL: "GRAM", COND: "GRAM" },
    "wordbound": { CONV: "CONV", READ: "READ_EXP", LIST: "LISTEN", INST: "INSTR", VOC: "VOCAB" },
    "future-worlds-8b": { ...WORLDS, C: "GRAM" },
    "festival-worlds-1m": WORLDS, "festival-worlds2-1m": WORLDS, "traditions-1m": WORLDS, "tiktok-vine-3m": WORLDS,
    "trend-city-3m": { E: "READ_EXP", I: "READ_INF", V: "VOCAB", L: "GRAM", W: "GRAM" },
    "chest-quest-ew": { V: "VOCAB", G: "GRAM", R: "READ_EXP" },
    "portada": { MEAN: "VOCAB", REV: "VOCAB", GAP: "VOCAB", WRIT: "WRITE", PRON: "PRON" },
    "challenge-zone": { SCR: "WRITE", USE: "GRAM", VOC: "VOCAB", MIS: "GRAM", WF: "VOCAB", DICT: "DICT", READ: "READ_EXP" }
  };

  // ---------- 3. A qué OA aporta cada tipo de evidencia, según el ciclo ----------
  const TIPO_A_OA = {
    basica:  { LISTEN: [1, 2], DICT: [2], INSTR: [6], READ_EXP: [5, 6], READ_INF: [6], READ_REF: [8], VOCAB: [13], GRAM: [15], WRITE: [14], PRON: [10], CONV: [12] },
    media:   { LISTEN: [1, 3], DICT: [2], INSTR: [10], READ_EXP: [9, 10], READ_INF: [10], READ_REF: [7], VOCAB: [10], GRAM: [16], WRITE: [15], PRON: [5], CONV: [8] },
    tercero: { LISTEN: [1], DICT: [1], INSTR: [1], READ_EXP: [1], READ_INF: [1], READ_REF: [1], VOCAB: [3], GRAM: [3], WRITE: [2], PRON: [2], CONV: [4] }
  };

  const MIN = 5;                         // con menos preguntas no se asigna un nivel de logro
  const estado = (ok, t) => !t ? "none" : t < MIN ? "few" : ok / t >= .75 ? "lv2" : ok / t >= .5 ? "lv1" : "lv0";
  const ESTADOS = { lv2: "Logrado", lv1: "En proceso", lv0: "Por lograr", few: "Evidencia insuficiente", none: "Sin evidencia en los juegos" };

  /* Perfil curricular de un alumno.
     rows: [[juego, habilidad, correctas, total], …] al primer intento.  section: "5°A", "1°B HC"…
     Devuelve { level, levelName, habilidades:[{id,name,ok,t,p,estado}], ejes:[{name, ok, t, p, oas:[{n, code, text, ok, t, p, estado, juegos:[ids]}]}], sinMapa:[…] } */
  function perfil(rows, section) {
    const lk = levelOf(section), L = lk && LEVELS[lk];
    const hab = {}, oa = {}, sinMapa = [];
    (rows || []).forEach(([g, k, ok, t]) => {
      const tipo = (TIPOS[g] || {})[k];
      if (!tipo) { sinMapa.push(g + ":" + k); return; }
      const h = TIPO_HAB[tipo]; hab[h] = hab[h] || [0, 0]; hab[h][0] += ok; hab[h][1] += t;
      if (L) (TIPO_A_OA[L.ciclo][tipo] || []).forEach(n => {
        const o = oa[n] = oa[n] || { ok: 0, t: 0, juegos: new Set() }; o.ok += ok; o.t += t; o.juegos.add(g);
      });
    });
    const pct = (a, b) => b ? Math.round(a / b * 100) : null;
    return {
      level: lk, levelName: L ? L.name : null, sinMapa,
      habilidades: Object.keys(HABILIDADES).map(id => { const v = hab[id] || [0, 0]; return { id, name: HABILIDADES[id], ok: v[0], t: v[1], p: pct(v[0], v[1]), estado: estado(v[0], v[1]) }; }),
      ejes: !L ? [] : L.ejes.map(e => {
        const oas = e.oa.map(n => { const o = oa[n] || { ok: 0, t: 0, juegos: new Set() };
          return { n, code: "OA " + n, text: L.oa[n], ok: o.ok, t: o.t, p: pct(o.ok, o.t), estado: estado(o.ok, o.t), juegos: [...o.juegos] }; });
        const s = oas.reduce((a, o) => [a[0] + o.ok, a[1] + o.t], [0, 0]);
        return { name: e.name, ok: s[0], t: s[1], p: pct(s[0], s[1]), estado: estado(s[0], s[1]), conEvidencia: oas.filter(o => o.t >= MIN).length, oas };
      })
    };
  }

  // De la respuesta de la base ([{game, skills_first:{hab:[ok,total]}}]) a filas [juego, habilidad, ok, total]
  const rowsFromGames = games => (games || []).flatMap(g => Object.entries(g.skills_first || {}).map(([k, v]) => [g.game, k, v[0], v[1]]));

  // ---------- Presentación (la usan la ficha del panel y "Mi avance") ----------
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function css() {
    if (document.getElementById("cur-css")) return;
    const st = document.createElement("style"); st.id = "cur-css";
    st.textContent = `
.cur-h{font-size:15px;font-weight:600;margin:16px 0 4px}
.cur-row{display:grid;grid-template-columns:minmax(150px,1.3fr) 2fr minmax(150px,auto);gap:10px;align-items:center;font-size:14px;margin:7px 0}
.cur-row>span:last-child{text-align:right}
.cur-bar{height:12px;border-radius:6px;background:rgba(128,128,128,.25);overflow:hidden}
.cur-bar i{display:block;height:100%;border-radius:6px}
.cur-bar i.lv2{background:#58cc02}.cur-bar i.lv1{background:#ffc800}.cur-bar i.lv0{background:#ff6b7f}.cur-bar i.few{background:rgba(128,128,128,.6)}
.cur-chip{display:inline-block;padding:2px 9px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}
.cur-chip.lv2{background:#22521c;color:#cff7bd}.cur-chip.lv1{background:#5e4c10;color:#ffeaa6}.cur-chip.lv0{background:#6a2130;color:#ffdbe0}
.cur-chip.few,.cur-chip.none{background:rgba(128,128,128,.22)}
.cur-eje{display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:18px;font-weight:600;font-size:15px}
.cur-eje small{font-weight:400;font-size:12px;opacity:.75}
.cur-oa{display:grid;grid-template-columns:52px 1fr auto;gap:10px;align-items:start;padding:9px 0;border-top:1px solid rgba(128,128,128,.3);font-size:14px;line-height:1.4}
.cur-oa b{white-space:nowrap}
.cur-oa small{display:block;font-size:12px;opacity:.75;margin-top:2px}
.cur-oa.st-none>span,.cur-oa.st-none>b{opacity:.6}
.cur-oa>div{text-align:right}
.cur-note{font-size:12px;opacity:.75;margin-top:14px;line-height:1.5}
@media (max-width:560px){.cur-row{grid-template-columns:1fr auto}.cur-row .cur-bar{grid-column:1/-1;order:3}.cur-oa{grid-template-columns:46px 1fr}.cur-oa>div{grid-column:2;text-align:left}}
@media print{.cur-chip,.cur-bar,.cur-bar i{-webkit-print-color-adjust:exact;print-color-adjust:exact}}`;
    document.head.appendChild(st);
  }
  const chip = (e, p) => `<span class="cur-chip ${e}">${ESTADOS[e]}${p != null && (e === "lv0" || e === "lv1" || e === "lv2") ? " · " + p + "%" : ""}</span>`;
  // Barras de las seis habilidades generales
  function habHTML(p) {
    css();
    return p.habilidades.map(h => `<div class="cur-row"><span>${esc(h.name)}</span>
      <div class="cur-bar">${h.t ? `<i class="${h.estado}" style="width:${Math.max(3, h.p)}%"></i>` : ""}</div>
      <span>${h.t ? `<b>${h.p}%</b> <small>(${h.ok} de ${h.t})</small> ` : ""}${h.t >= MIN ? "" : chip(h.estado)}</span></div>`).join("");
  }
  // Lista de OA por eje. opt.gname(id) entrega el nombre corto de cada juego
  function oaHTML(p, opt) {
    css();
    const gname = (opt && opt.gname) || (id => id);
    if (!p.level) return `<p class="cur-note">No se reconoce el curso de este alumno, así que no se pueden mostrar sus Objetivos de Aprendizaje.</p>`;
    return p.ejes.map(e => `<div class="cur-eje"><span>${esc(e.name)}</span><small>${e.conEvidencia} de ${e.oas.length} objetivos con evidencia suficiente</small></div>
      ${e.oas.map(o => `<div class="cur-oa st-${o.estado}"><b>${o.code}</b>
        <span>${esc(o.text)}${o.t ? `<small>${o.ok} de ${o.t} correctas al primer intento · ${o.juegos.map(g => esc(gname(g))).join(", ")}</small>` : ""}</span>
        <div>${chip(o.estado, o.p)}</div></div>`).join("")}`).join("");
  }
  function perfilHTML(p, opt) {
    return `<div class="cur-h">Habilidades</div>${habHTML(p)}
      <div class="cur-h" style="margin-top:22px">Objetivos de Aprendizaje${p.levelName ? " · " + esc(p.levelName) : ""}</div>${oaHTML(p, opt)}
      <p class="cur-note">Logrado: 75% o más · En proceso: 50 a 74% · Por lograr: menos de 50%, medido con el primer intento de cada pregunta y con al menos ${MIN} preguntas.
      Esto muestra la evidencia que entregan los juegos y ejercicios del sitio, que cubren solo una parte de cada objetivo; la expresión oral y escrita se evalúan en clases.</p>`;
  }

  window.ESLT_CURR = { LEVELS, HABILIDADES, ESTADOS, MIN, levelOf, perfil, estado, rowsFromGames, habHTML, oaHTML, perfilHTML };
})();
