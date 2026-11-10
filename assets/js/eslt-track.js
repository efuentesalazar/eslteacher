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

/* ---------- Ingreso dentro del juego (mismo curso + RUT + clave que en eslteacher.cl) ---------- */
const SECTIONS = ['5°A', '5°B', '6°A', '6°B', '7°A', '7°B', '8°A', '8°B', '1°A HC', '1°B HC', '3°B HC'];   // misma lista que assets/js/portada/datos.js
const PROGRESS_KEYS = ['xp', 'stats', 'hard', 'badges', 'wpDone', 'daysDone', 'best', 'attempts', 'profile'];
const ls = { get(k) { try { return JSON.parse(localStorage.getItem('eslt_' + k)); } catch (e) { return null; } },
             set(k, v) { try { localStorage.setItem('eslt_' + k, JSON.stringify(v)); } catch (e) { } } };
// RUT chileno: valida el dígito verificador antes de enviarlo
function rutOk(rut) {
  const s = String(rut).toUpperCase().replace(/[^0-9K]/g, '');
  if (s.length < 8 || s.length > 10) return false;
  const body = s.slice(0, -1), dv = s.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  let sum = 0, m = 2;
  for (let i = body.length - 1; i >= 0; i--) { sum += +body[i] * m; m = m === 7 ? 2 : m + 1; }
  const r = 11 - (sum % 11);
  return dv === (r === 11 ? '0' : r === 10 ? 'K' : String(r));
}

/** Abre el formulario de ingreso sobre el juego. Al entrar, el juego se recarga con la sesión. */
export function openLogin() {
  if (document.getElementById('eslt-login') || !document.body) return;
  const ov = document.createElement('div');
  ov.id = 'eslt-login'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Entrar con tu RUT');
  ov.style.cssText = 'position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:16px;background:rgba(5,5,15,.78);overflow:auto;font:500 15px/1.45 system-ui,sans-serif';
  const field = 'display:block;width:100%;box-sizing:border-box;min-height:46px;margin:4px 0 12px;padding:8px 12px;border-radius:12px;border:2px solid #3a3a5c;background:#0f0f1f;color:#fff;font:inherit;font-size:16px';
  const label = 'display:block;font-size:12px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#b9b9d6';
  const last = ls.get('lastSection') || '';
  ov.innerHTML = `<form novalidate autocomplete="off" style="width:min(380px,100%);background:#17172e;color:#fff;border-radius:20px;border-top:5px solid #58cc02;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.6);text-align:left">
      <h2 style="margin:0 0 4px;font:700 22px/1.2 system-ui,sans-serif">🔑 Entrar · Log in</h2>
      <p style="margin:0 0 14px;color:#b9b9d6;font-size:14px">Ingresa para que tu profe vea tu avance en este juego.</p>
      <label style="${label}" for="eslt-l-sec">Curso · Course</label>
      <select id="eslt-l-sec" style="${field}"><option value="">— Elige tu curso —</option>${SECTIONS.map(x => `<option${x === last ? ' selected' : ''}>${x}</option>`).join('')}</select>
      <label style="${label}" for="eslt-l-rut">RUT</label>
      <input id="eslt-l-rut" maxlength="12" placeholder="Ej: 12345678-9" autocapitalize="characters" spellcheck="false" style="${field}">
      <label style="${label}" for="eslt-l-pin">Clave · 4 dígitos</label>
      <input id="eslt-l-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="••••" autocomplete="off" style="${field}">
      <p id="eslt-l-msg" aria-live="polite" style="min-height:20px;margin:0 0 10px;color:#ffd166;font-size:14px"></p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button type="submit" style="flex:1;min-height:46px;border:0;border-radius:14px;background:#58cc02;color:#fff;font:700 15px system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 0 #3f9a00">→ Entrar</button>
        <button type="button" id="eslt-l-no" style="min-height:46px;padding:0 16px;border:2px solid #3a3a5c;border-radius:14px;background:none;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer">Ahora no</button>
      </div>
      <p style="margin:12px 0 0;color:#8f8fb0;font-size:12px">Tu clave te la entrega tu profesor. Tu RUT no se guarda en este dispositivo.</p>
    </form>`;
  const $ = id => ov.querySelector('#' + id), msg = t => { $('eslt-l-msg').textContent = t; };
  const close = () => ov.remove();
  // Las teclas no deben llegar al juego mientras se escribe (WASD, espacio, Enter…)
  ['keydown', 'keyup', 'keypress'].forEach(t => ov.addEventListener(t, e => { if (t === 'keydown' && e.key === 'Escape') close(); e.stopPropagation(); }));
  ['pointerdown', 'mousedown', 'touchstart', 'click', 'wheel'].forEach(t => ov.addEventListener(t, e => e.stopPropagation()));
  $('eslt-l-no').addEventListener('click', close);
  ov.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault();
    const section = $('eslt-l-sec').value, rut = $('eslt-l-rut').value.trim(), pin = $('eslt-l-pin').value.trim();
    if (!section) { msg('Elige tu curso.'); $('eslt-l-sec').focus(); return; }
    if (!rutOk(rut)) { msg('Revisa tu RUT. Escríbelo con guion, ej: 12345678-9'); $('eslt-l-rut').focus(); return; }
    if (!/^\d{4}$/.test(pin)) { msg('La clave tiene 4 números.'); $('eslt-l-pin').focus(); return; }
    const go = ov.querySelector('[type=submit]'); go.disabled = true; msg('Entrando…');
    let r = null;
    try { r = await rpc('eslt_login', { p_section: section, p_rut: rut, p_pin: pin }); } catch (err) { }
    go.disabled = false;
    if (!r) { msg('No se pudo conectar. Revisa tu internet e inténtalo otra vez.'); return; }
    if (!r.ok) {
      msg(r.error === 'locked_day' ? 'Demasiados intentos hoy. Pídele a tu profe que te desbloquee o te dé una clave nueva.'
        : r.error === 'locked' ? 'Demasiados intentos. Espera 15 minutos o pide ayuda a tu profe.'
        : 'Curso, RUT o clave incorrectos. Revisa e inténtalo otra vez.');
      return;
    }
    // Igual que en la portada: si el progreso guardado en este equipo es de OTRO alumno, no se mezcla
    const owner = ls.get('owner');
    if (owner && owner !== r.sid) PROGRESS_KEYS.forEach(k => { try { localStorage.removeItem('eslt_' + k); } catch (err) { } });
    ls.set('owner', r.sid); ls.set('rev', 0); ls.set('lastSection', section);
    ls.set('session', { token: r.token, sid: r.sid, name: r.name, first_name: r.first_name, section: r.section, course: r.course });
    location.reload();
  });
  document.body.appendChild(ov);
  setTimeout(() => (last ? $('eslt-l-rut') : $('eslt-l-sec')).focus(), 60);
}
// El aviso "Entra en eslteacher.cl" del menú de cada juego ahora abre el ingreso aquí mismo
addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('#esltStatus a');
  if (a && !student()) { e.preventDefault(); openLogin(); }
}, true);

async function checkSession() {
  const s = student();
  if (!s) {
    const d = note('⚠️ No has iniciado sesión: tu profe no verá tu avance. <button type="button" style="font:inherit;font-weight:700;color:#fff;background:#3f9a00;border:0;border-radius:8px;padding:3px 10px;margin-left:4px;cursor:pointer">🔑 Entrar aquí</button>', false, 20000);
    if (d) d.querySelector('button').addEventListener('click', () => { d.remove(); openLogin(); });
    return;
  }
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
// En la portada no se muestra el aviso: ahí la sesión se ve y se comprueba en "Mi perfil"
if (!window.ESLT_PORTADA) { if (document.readyState === 'loading') addEventListener('DOMContentLoaded', checkSession); else checkSession(); }
