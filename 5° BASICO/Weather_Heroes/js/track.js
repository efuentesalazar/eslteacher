// Registro de respuestas para el Panel del profe (eslteacher.cl/profe.html → pestaña "Análisis").
// Usa la sesión que el alumno abrió en eslteacher.cl (RUT + clave). Si no hay sesión, no guarda nada.
// Para usarlo en otro juego: copia este archivo y llama logAnswer(...) cada vez que el alumno responde.
// Las respuestas esperan en el dispositivo y se envían en grupos (también si se cortó internet).

const DB_URL = 'https://tlihbmgokuhvppbchvrz.supabase.co';
const DB_KEY = 'sb_publishable_nGgOCuUUuXKK7gx957LYhg_Jf2V4TJC';
const QKEY = 'eslt_answer_queue';

/** Alumno con sesión iniciada en eslteacher.cl, o null. */
export function student() {
  try { const s = JSON.parse(localStorage.getItem('eslt_session') || 'null'); return s && s.token ? s : null; } catch (e) { return null; }
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
    const r = await fetch(`${DB_URL}/rest/v1/rpc/eslt_log_answers`, {
      method: 'POST', headers: { apikey: DB_KEY, 'Content-Type': 'application/json' }, keepalive: !!keepalive,
      body: JSON.stringify({ p_token: tok, p_game: g, p_rows: batch.map(x => x.row) })
    });
    const j = r.ok ? await r.json() : null;
    // ok = guardado; session/bad/limit = no se podrá guardar nunca, se descarta
    if (j && (j.ok || ['session', 'bad', 'limit'].includes(j.error))) { drop = true; again = true; }
  } catch (e) { /* sin internet: se reintenta más tarde */ }
  if (drop) { const sent = new Set(batch.map(x => x.row.u)); queue = queue.filter(x => !sent.has(x.row.u)); persist(); }
  busy = false;
  if (queue.length) schedule(again ? 300 : 30000);
}

addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(true); });
addEventListener('pagehide', () => flush(true));
if (queue.length) schedule(3000);
