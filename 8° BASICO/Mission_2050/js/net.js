// Equipos en línea: canales en vivo de Supabase Realtime (sin tablas: nada queda guardado).
// Un alumno crea el equipo y recibe un código de 4 letras; los demás se unen con ese código.
// Máximo 4 agentes por equipo. Todos ven a sus compañeros moverse en tiempo real.
const SUPA_URL = 'https://tlihbmgokuhvppbchvrz.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaWhibWdva3VodnBwYmNodnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTMyMDAsImV4cCI6MjEwODY2OTIwMH0.ZHA6-G0S_iqGxdnPXSB_nOIoS67G2pxSYbaGcNfvLQw';
export const MAX_TEAM = 4;
const EVENTS = ['pos', 'go', 'start', 'vote', 'rev', 'next', 'pads', 'cell', 'say', 'emo', 'end'];

export const NET = { sb: null, ch: null, ok: false, code: '', id: Math.random().toString(36).slice(2, 10), peers: new Map(), handlers: {}, me: {}, joinT: 0 };

export function on(ev, fn) { NET.handlers[ev] = fn; }
const emit = (ev, ...a) => NET.handlers[ev] && NET.handlers[ev](...a);

// sin letras que se confunden (O/0, I/1, L)
const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export function newCode() { let s = ''; for (let i = 0; i < 4; i++) s += ABC[Math.floor(Math.random() * ABC.length)]; return s; }
export function cleanCode(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6); }

/**
 * Entra al equipo. create=true para quien lo crea.
 * Devuelve 'ok' | 'full' | 'notfound' | 'error' | 'offline'.
 */
export function joinTeam(code, me, create) {
  if (typeof supabase === 'undefined') return Promise.resolve('offline');
  if (!NET.sb) NET.sb = supabase.createClient(SUPA_URL, SUPA_ANON, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { params: { eventsPerSecond: 12 } } });
  leaveTeam();
  NET.code = code; NET.me = me;
  return new Promise(resolve => {
    const ch = NET.sb.channel(`m2050-${code.toLowerCase()}`, { config: { broadcast: { self: false }, presence: { key: NET.id } } });
    let decided = false;
    const finish = r => { if (decided) return; decided = true; if (r !== 'ok') { NET.sb.removeChannel(ch); } resolve(r); };
    const decide = () => {
      const st = ch.presenceState();
      const list = Object.entries(st).map(([k, v]) => ({ k, t: v[0]?.t || 0 })).sort((a, b) => a.t - b.t || (a.k < b.k ? -1 : 1));
      const idx = list.findIndex(p => p.k === NET.id);
      if (idx >= MAX_TEAM) return finish('full');
      if (!create && list.length < 2) return finish('notfound');
      NET.ch = ch; NET.ok = true; syncPeers(st); finish('ok');
    };
    ch.on('presence', { event: 'sync' }, () => {
      const st = ch.presenceState();
      if (!decided && st[NET.id]) setTimeout(() => { if (!decided) decide(); }, create ? 300 : 1500);
      if (NET.ch === ch) syncPeers(st);
    });
    for (const ev of EVENTS) ch.on('broadcast', { event: ev }, m => { if (NET.ch === ch) emit(ev, m.payload); });
    ch.subscribe(async s => {
      if (s === 'SUBSCRIBED') { NET.joinT = NET.joinT || Date.now(); await ch.track({ ...NET.me, t: NET.joinT }); }
      else if ((s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') && !decided) finish('error');
    });
    setTimeout(() => { if (!decided) { if (ch.presenceState()[NET.id]) decide(); else finish('error'); } }, 8000);
  });
}

function syncPeers(st) {
  const seen = new Set();
  for (const [k, v] of Object.entries(st)) {
    if (k === NET.id || !v[0]) continue; seen.add(k);
    const p = NET.peers.get(k);
    if (!p) { NET.peers.set(k, { id: k, ...v[0] }); emit('join', NET.peers.get(k)); }
    else Object.assign(p, v[0]);
  }
  for (const k of [...NET.peers.keys()]) if (!seen.has(k)) { emit('leave', NET.peers.get(k)); NET.peers.delete(k); }
  emit('roster');
}

/** Lista del equipo (yo incluido), ordenada por hora de llegada: el primero es quien creó el equipo. */
export function members() {
  const all = [{ id: NET.id, ...NET.me, t: NET.joinT || 0, self: true }];
  for (const p of NET.peers.values()) all.push(p);
  return all.sort((a, b) => (a.t || 0) - (b.t || 0) || (a.id < b.id ? -1 : 1));
}

export function send(ev, payload = {}) { if (NET.ok && NET.ch) NET.ch.send({ type: 'broadcast', event: ev, payload: { ...payload, id: NET.id } }); }
export async function updateMe(patch) { Object.assign(NET.me, patch); if (NET.ok && NET.ch) await NET.ch.track({ ...NET.me, t: NET.joinT }); }
export function leaveTeam() { if (NET.ch && NET.sb) NET.sb.removeChannel(NET.ch); NET.ch = null; NET.ok = false; NET.peers.clear(); NET.joinT = 0; }
