/* Registro de respuestas para los juegos de un solo archivo (los "Worlds", Let's Travel City…).
   Se carga con: <script src="../assets/js/eslt-log.js"></script>
   y el juego llama: eslLog('id-juego', {activity, item:{q, k, id?}, chosen, right, ok})
   Usa la sesión del alumno de eslteacher.cl. Si no hay sesión, no guarda nada.
   El envío lo hace eslt-track.js (mismo archivo que usan los otros juegos). */
(function () {
  let mod = null, pend = [];
  // id corto y estable a partir de un texto
  function hash(s) { s = String(s); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  window.eslHash = hash;

  window.eslLog = function (game, d) {
    try { if (mod) mod.logAnswer(game, d); else pend.push([game, d]); } catch (e) { }
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

  function banner(st) {
    try {
      const d = document.createElement('div');
      d.setAttribute('role', 'status');
      d.style.cssText = 'position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:99999;max-width:min(560px,calc(100% - 24px));' +
        'padding:8px 14px;border-radius:12px;font:600 13px/1.4 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3);cursor:pointer;' +
        (st ? 'background:#d9f7c7;color:#1d3b10' : 'background:#ffe9a8;color:#4a3500');
      d.innerHTML = st
        ? '📊 Hola, <b></b>. Tu profe verá tu avance. <span style="opacity:.6">✕</span>'
        : '⚠️ No has iniciado sesión: tu profe no verá tu avance. <a href="https://eslteacher.cl/" target="_blank" rel="noopener" style="color:inherit">Entra en eslteacher.cl</a> (Mi perfil) y vuelve a abrir el juego. <span style="opacity:.6">✕</span>';
      if (st) d.querySelector('b').textContent = (st.first_name || st.name || '') + (st.section ? ' (' + st.section + ')' : '');
      d.onclick = e => { if (e.target.tagName !== 'A') d.remove(); };
      document.body.appendChild(d);
      setTimeout(() => d.remove(), st ? 6000 : 12000);
    } catch (e) { }
  }

  import('/assets/js/eslt-track.js').then(m => {
    mod = m; pend.forEach(a => m.logAnswer(a[0], a[1])); pend = [];
    // Con sesión, el aviso ("Jugando como…", "¿No eres tú?") lo muestra eslt-track.js; aquí solo el de "sin sesión"
    const warn = () => { if (!m.student()) banner(null); };
    if (document.body) warn(); else addEventListener('DOMContentLoaded', warn);
  }).catch(() => { });
})();
