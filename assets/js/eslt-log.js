/* Registro de respuestas para los juegos de un solo archivo (los "Worlds", Let's Travel City…).
   Se carga con: <script src="../assets/js/eslt-log.js"></script>
   y el juego llama: eslLog('id-juego', {activity, item:{q, k, id?}, chosen, right, ok})
   Usa la sesión del alumno de eslteacher.cl. Si no hay sesión, no guarda nada.
   El envío, el aviso de sesión ("Jugando como…" / "No has iniciado sesión") y el ingreso
   dentro del juego los hace eslt-track.js (mismo archivo que usan los otros juegos). */
(function () {
  let mod = null, pend = [];
  // id corto y estable a partir de un texto
  function hash(s) { s = String(s); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  window.eslHash = hash;

  // Tiempo de respuesta: estos juegos muestran las alternativas como botones ".opt".
  // Se anota el momento en que aparecen en pantalla y, al responder, se calcula cuánto tardó el alumno.
  // (Si el juego ya envía "ms", se respeta. En ejercicios sin alternativas queda sin tiempo.)
  let shownAt = 0;
  try {
    new MutationObserver(list => {
      for (const m of list) for (const n of m.addedNodes) {
        if (n.nodeType === 1 && (n.matches('.opt') || n.querySelector('.opt'))) { shownAt = performance.now(); return; }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) { }

  window.eslLog = function (game, d) {
    try {
      if (d && d.ms == null && shownAt) { const ms = performance.now() - shownAt; if (ms > 0 && ms < 600000) d.ms = ms; }
      shownAt = 0;
      if (mod) mod.logAnswer(game, d); else pend.push([game, d]);
    } catch (e) { }
  };

  // Cofres (#chestB): lee la pregunta y las opciones desde la pantalla
  window.eslChest = function (game, k, chestId, i, correct) {
    try {
      const box = document.getElementById('chestB'); if (!box) return;
      const txt = sel => { const e = box.querySelector(sel); return e ? e.innerText.trim() : ''; };
      const opt = j => { const b = box.querySelector('.opt[data-i="' + j + '"] span'); return b ? b.innerText.trim() : String(j); };
      const q = txt('.vsent') || txt('.stem'); // la oración del cofre; si no hay, la pregunta
      window.eslLog(game, { activity: 'Cofres', item: { id: 'c' + chestId, q, k }, chosen: opt(i), right: opt(correct), ok: i === correct });
    } catch (e) { }
  };

  import('/assets/js/eslt-track.js').then(m => {
    mod = m; pend.forEach(a => m.logAnswer(a[0], a[1])); pend = [];
  }).catch(() => { });
})();
