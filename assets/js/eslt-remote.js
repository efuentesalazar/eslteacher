/* Registro de respuestas para juegos publicados en OTRA dirección
   (p.ej. pastquest6basico.eslteacher.cl, juego.eslteacher.cl).
   - eslteacher.cl abre el juego con  #eslt=<código de un solo uso>  (ver 6° BASICO/Past_Quest.html).
   - Este archivo canjea el código por una sesión corta (6 h) del alumno y la guarda en este sitio.
   - El juego llama: eslLog('id-juego', {activity, item:{q, k, id?}, chosen, right, ok, ms?})
   Copia este archivo dentro del juego y cárgalo con <script src="eslt-remote.js"></script>. */
(function () {
  const DB_URL = 'https://tlihbmgokuhvppbchvrz.supabase.co';
  const DB_KEY = 'sb_publishable_nGgOCuUUuXKK7gx957LYhg_Jf2V4TJC';
  const SKEY = 'eslt_session', QKEY = 'eslt_answer_queue';

  const ls = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  function student() {
    const s = ls.get(SKEY); if (!s || !s.token) return null;
    if (s.expires && Date.parse(s.expires) < Date.now()) { ls.set(SKEY, null); return null; }
    return s;
  }
  async function rpc(fn, args, keepalive) {
    const r = await fetch(DB_URL + '/rest/v1/rpc/' + fn, {
      method: 'POST', headers: { apikey: DB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(args), keepalive: !!keepalive
    });
    return r.ok ? r.json() : null;
  }

  // 1) Canjear el código que viene en la dirección (y borrarlo de la barra)
  let ready = true, pend = [];
  const m = location.hash.match(/(?:^#|&)eslt=([a-f0-9]{40})/);
  if (m) {
    const rest = location.hash.slice(1).split('&').filter(p => p.indexOf('eslt=') !== 0).join('&');
    try { history.replaceState(null, '', location.pathname + location.search + (rest ? '#' + rest : '')); } catch (e) { }
    ls.set(SKEY, null); // nuevo ingreso: nunca mezclar con el alumno anterior de este equipo
    ready = false;
    rpc('eslt_handoff_redeem', { p_code: m[1] }).then(j => {
      if (j && j.ok) ls.set(SKEY, { token: j.token, sid: j.sid, name: j.name, first_name: j.first_name, section: j.section, course: j.course, expires: j.expires });
    }).catch(() => { }).then(() => { ready = true; pend.forEach(a => log(a[0], a[1])); pend = []; showBanner(); });
  }

  // 2) Cola de respuestas: se envían en grupos (también si se cortó internet)
  const plain = s => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  function hash(s) { s = String(s); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
  let queue = ls.get(QKEY); if (!Array.isArray(queue)) queue = [];
  const persist = () => ls.set(QKEY, queue.slice(-600));
  let timer = null, busy = false;
  const schedule = ms => { if (!timer) timer = setTimeout(() => { timer = null; flush(); }, ms); };

  function log(game, d) {
    const s = student(); if (!s) return;
    const q = plain(d.item && d.item.q);
    queue.push({ tok: s.token, g: game, row: {
      u: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), t: Date.now(),
      a: plain(d.activity).slice(0, 80), i: (d.item && d.item.id) || hash(q), k: (d.item && d.item.k) || '', q,
      c: plain(d.chosen), r: plain(d.right), ok: !!d.ok, ms: Math.round(d.ms) || null } });
    persist(); schedule(8000);
  }
  async function flush(keepalive) {
    if (busy || !queue.length) return; busy = true;
    const tok = queue[0].tok, g = queue[0].g;
    const batch = queue.filter(x => x.tok === tok && x.g === g).slice(0, 40);
    let drop = false;
    try {
      const j = await rpc('eslt_log_answers', { p_token: tok, p_game: g, p_rows: batch.map(x => x.row) }, keepalive);
      if (j && (j.ok || ['session', 'bad', 'limit'].indexOf(j.error) >= 0)) drop = true;
    } catch (e) { }
    if (drop) { const sent = new Set(batch.map(x => x.row.u)); queue = queue.filter(x => !sent.has(x.row.u)); persist(); }
    busy = false;
    if (queue.length) schedule(drop ? 300 : 30000);
  }
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(true); });
  addEventListener('pagehide', () => flush(true));
  if (queue.length) schedule(3000);

  window.eslStudent = student;
  window.eslHash = hash;
  window.eslLog = function (game, d) { try { if (ready) log(game, d); else pend.push([game, d]); } catch (e) { } };

  // 3) Aviso arriba: si el profe verá el avance o no
  function showBanner() {
    const go = () => {
      try {
        const st = student(), el = document.createElement('div');
        el.setAttribute('role', 'status');
        el.style.cssText = 'position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:99999;max-width:min(560px,calc(100% - 24px));' +
          'padding:8px 14px;border-radius:12px;font:600 13px/1.4 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3);cursor:pointer;' +
          (st ? 'background:#d9f7c7;color:#1d3b10' : 'background:#ffe9a8;color:#4a3500');
        el.innerHTML = st ? '📊 Hola, <b></b>. Tu profe verá tu avance. <span style="opacity:.6">✕</span>'
          : '⚠️ Tu profe no verá tu avance: abre este juego desde <a href="https://eslteacher.cl/" target="_blank" rel="noopener" style="color:inherit">eslteacher.cl</a> con tu sesión iniciada (Mi perfil). <span style="opacity:.6">✕</span>';
        if (st) el.querySelector('b').textContent = (st.first_name || st.name || '') + (st.section ? ' (' + st.section + ')' : '');
        el.onclick = e => { if (e.target.tagName !== 'A') el.remove(); };
        document.body.appendChild(el); setTimeout(() => el.remove(), st ? 6000 : 12000);
      } catch (e) { }
    };
    if (document.body) go(); else addEventListener('DOMContentLoaded', go);
  }
  if (ready) showBanner();
})();
