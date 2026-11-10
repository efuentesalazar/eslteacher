// Registro de respuestas para el Panel del profe (eslteacher.cl/profe.html → pestaña "Análisis").
// Usa la sesión que el alumno abrió en eslteacher.cl (RUT + clave). Si no hay sesión, no guarda nada.
// Para usarlo en otro juego: import { logAnswer, student } from '/assets/js/eslt-track.js'
// y llama logAnswer(...) cada vez que el alumno responde.
// Las respuestas esperan en el dispositivo y se envían en grupos (también si se cortó internet).
// Al abrir el juego se comprueba que la sesión siga válida y se muestra de quién es
// ("¿No eres tú?" cierra la sesión, para computadores compartidos).

const DB_URL = 'https://tlihbmgokuhvppbchvrz.supabase.co';
const DB_KEY = 'sb_publishable_nGgOCuUUuXKK7gx957LYhg_Jf2V4TJC';
const QKEY = 'eslt_answer_queue';
const SKEY = 'eslt_session';

/** Alumno con sesión iniciada en eslteacher.cl, o null. */
export function student() {
  try { const s = JSON.parse(localStorage.getItem(SKEY) || 'null'); return s && s.token ? s : null; } catch (e) { return null; }
}

async function rpc(fn, args, keepalive) {
  const r = await fetch(`${DB_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST', headers: { apikey: DB_KEY, 'Content-Type': 'application/json' }, keepalive: !!keepalive,
    body: JSON.stringify(args)
  });
  return r.ok ? r.json() : null;
}

const plain = s => String(s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
// id estable de la pregunta a partir de su texto (si la pregunta cambia, cuenta como otra)
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

let queue = [];
try { queue = JSON.parse(localStorage.getItem(QKEY) || '[]'); if (!Array.isArray(queue)) queue = []; } catch (e) { }
const persist = () => { try { localStorage.setItem(QKEY, JSON.stringify(queue.slice(-600))); } catch (e) { } };

/**
 * Guarda una respuesta.
 * @param {string} game  id corto del juego, p.ej. 'festival-quest-1m'
 * @param {object} d     {activity, item:{q, k, id?}, chosen, right, ok, ms}
 */
export function logAnswer(game, d) {
  const s = student(); if (!s) return;
  const q = plain(d.item.q);
  queue.push({
    tok: s.token, g: game, row: {
      u: Date.now().toString(36) + Math.random().toString(36).slice(2, 8), t: Date.now(),
      a: plain(d.activity).slice(0, 80), i: d.item.id || hash(q), k: d.item.k || '', q,
      c: plain(d.chosen), r: plain(d.right), ok: !!d.ok, ms: Math.round(d.ms) || null
    }
  });
  persist(); schedule(8000);
}

let timer = null, busy = false;
function schedule(ms) { if (!timer) timer = setTimeout(() => { timer = null; flush(); }, ms); }

/** Envía lo pendiente. keepalive=true al cerrar la página. */
export async function flush(keepalive) {
  if (busy || !queue.length) return; busy = true;
  const { tok, g } = queue[0];
  const batch = queue.filter(x => x.tok === tok && x.g === g).slice(0, 40);
  let drop = false, again = false;
  try {
    const j = await rpc('eslt_log_answers', { p_token: tok, p_game: g, p_rows: batch.map(x => x.row) }, keepalive);
    // ok = guardado; session/bad/limit = no se podrá guardar nunca, se descarta
    if (j && (j.ok || ['session', 'bad', 'limit'].includes(j.error))) { drop = true; again = true; }
    if (j && j.error === 'session') sessionLost(tok);
  } catch (e) { /* sin internet: se reintenta más tarde */ }
  if (drop) { const sent = new Set(batch.map(x => x.row.u)); queue = queue.filter(x => !sent.has(x.row.u)); persist(); }
  busy = false;
  if (queue.length) schedule(again ? 300 : 30000);
}

/* ---------- Sesión: aviso de quién juega y de sesión vencida ---------- */
function note(html, ok, ms) {
  try {
    if (!document.body) return null;
    const old = document.getElementById('eslt-note'); if (old) old.remove();
    const d = document.createElement('div');
    d.id = 'eslt-note'; d.setAttribute('role', 'status');
    d.style.cssText = 'position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:99999;max-width:min(560px,calc(100% - 24px));' +
      'padding:8px 14px;border-radius:12px;font:600 13px/1.5 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.3);cursor:pointer;' +
      (ok ? 'background:#d9f7c7;color:#1d3b10' : 'background:#ffe9a8;color:#4a3500');
    d.innerHTML = html + ' <span style="opacity:.6">✕</span>';
    d.addEventListener('click', e => { if (!e.target.closest('a,button')) d.remove(); });
    document.body.appendChild(d);
    setTimeout(() => d.remove(), ms);
    return d;
  } catch (e) { return null; }
}

// La sesión ya no sirve (venció, o el profe entregó una clave nueva): se borra y se avisa
function sessionLost(tok) {
  const s = student(); if (!s || s.token !== tok) return;
  try { localStorage.removeItem(SKEY); } catch (e) { }
  note('⚠️ Tu sesión venció: tu profe no verá tu avance. <a href="/" style="color:inherit">Entra otra vez en eslteacher.cl</a> (Mi perfil) y vuelve a abrir el juego.', false, 20000);
}

async function leave(s) {
  if (!confirm(`¿Salir de la sesión de ${s.first_name || s.name}?\nDespués entra con tu propio RUT y clave en eslteacher.cl.`)) return;
  for (let i = 0; i < 6 && queue.some(x => x.tok === s.token); i++) await flush();   // primero se envía lo pendiente
  try { await rpc('eslt_logout', { p_token: s.token }); } catch (e) { }
  try { localStorage.removeItem(SKEY); } catch (e) { }
  location.href = '/';
}

async function checkSession() {
  const s = student(); if (!s) return;
  let j = null;
  try { j = await rpc('eslt_session_check', { p_token: s.token }); } catch (e) { return; }   // sin internet: se mantiene
  if (!j) return;
  if (!j.ok) { if (j.error === 'session') sessionLost(s.token); return; }
  const d = note('📊 Jugando como <b></b>. Tu profe verá tu avance. <button type="button" style="font:inherit;color:inherit;background:none;border:0;padding:0 2px;text-decoration:underline;cursor:pointer">¿No eres tú?</button>', true, 9000);
  if (!d) return;
  d.querySelector('b').textContent = (s.first_name || s.name || '') + (s.section ? ' (' + s.section + ')' : '');
  d.querySelector('button').addEventListener('click', () => leave(s));
}

addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(true); });
addEventListener('pagehide', () => flush(true));
if (queue.length) schedule(3000);
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', checkSession); else checkSession();
