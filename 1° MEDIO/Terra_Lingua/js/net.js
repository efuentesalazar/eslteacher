// TERRA LINGUA · Multijugador con canales en vivo de Supabase (sin tablas: posiciones y nombres no se guardan).
// El plan gratuito cuenta cada mensaje recibido, por eso: salas de máx. 10, posición cada 1,5 s solo al moverse
// (el resto se predice con la velocidad) y desconexión por inactividad.
const URL_DB = 'https://tlihbmgokuhvppbchvrz.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaWhibWdva3VodnBwYmNodnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTMyMDAsImV4cCI6MjEwODY2OTIwMH0.ZHA6-G0S_iqGxdnPXSB_nOIoS67G2pxSYbaGcNfvLQw';
export const MAX_ROOM = 10, MAX_PARTY = 4, MAX_ARENA = 8;

export const NET = { sb: null, ch: null, room: '', ok: false, id: Math.random().toString(36).slice(2, 10), peers: new Map(), h: {}, me: {} };
export const on = (e, f) => { NET.h[e] = f; };
const emit = (e, ...a) => NET.h[e] && NET.h[e](...a);
const EVENTS = ['m', 'say', 'hit', 'ko', 'pq', 'party', 'shot'];

function client() {
  if (typeof supabase === 'undefined') return null;
  if (!NET.sb) NET.sb = supabase.createClient(URL_DB, KEY, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { params: { eventsPerSecond: 8 } } });
  return NET.sb;
}
function sync(st) {
  const seen = new Set();
  for (const [k, v] of Object.entries(st)) {
    if (k === NET.id || !v[0]) continue; seen.add(k);
    const p = NET.peers.get(k);
    if (!p) { NET.peers.set(k, { id: k, ...v[0] }); emit('join', NET.peers.get(k)); }
    else { Object.assign(p, v[0]); emit('update', p); }
  }
  for (const k of [...NET.peers.keys()]) if (!seen.has(k)) { const p = NET.peers.get(k); NET.peers.delete(k); emit('leave', p); }
}
export function leave() {
  if (NET.ch && NET.sb) NET.sb.removeChannel(NET.ch);
  NET.ch = null; NET.ok = false; NET.room = '';
  const all = [...NET.peers.values()]; NET.peers.clear(); all.forEach(p => emit('leave', p));
}
// Entra a una sala. Resuelve 'ok', 'full' u 'off'.
export function join(room, me, max = MAX_ROOM) {
  return new Promise(resolve => {
    const sb = client(); if (!sb) { emit('status', 'off'); return resolve('off'); }
    leave(); NET.me = me;
    const ch = sb.channel('tl1m-' + room, { config: { broadcast: { self: false }, presence: { key: NET.id } } });
    NET.ch = ch; NET.room = room; let done = false; const t0 = Date.now();
    const decide = () => {
      if (done || NET.ch !== ch) return; done = true;
      const list = Object.entries(ch.presenceState()).map(([k, v]) => ({ k, t: v[0]?.t || 0 })).sort((a, b) => a.t - b.t || (a.k < b.k ? -1 : 1));
      if (list.findIndex(p => p.k === NET.id) >= max) { leave(); return resolve('full'); }
      NET.ok = true; sync(ch.presenceState()); emit('status', 'on'); resolve('ok');
    };
    ch.on('presence', { event: 'sync' }, () => { const st = ch.presenceState(); if (!done && st[NET.id]) setTimeout(decide, 500); if (NET.ok && NET.ch === ch) sync(st); });
    for (const ev of EVENTS) ch.on('broadcast', { event: ev }, m => { if (NET.ok && NET.ch === ch) emit(ev, m.payload); });
    ch.subscribe(async s => {
      if (s === 'SUBSCRIBED') await ch.track({ ...NET.me, t: t0 });
      else if ((s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') && !done) { done = true; leave(); emit('status', 'off'); resolve('off'); }
    });
    setTimeout(decide, 6000);
  });
}
// Busca la primera sala del curso con cupo
export async function joinWorld(section, me) {
  const base = 'w-' + String(section || 'open').replace(/[^a-zA-Z0-9]/g, '');
  for (let i = 0; i < 8; i++) { const r = await join(base + '-' + i, me, MAX_ROOM); if (r !== 'full') return r; }
  return 'full';
}
export const send = (e, p) => { if (NET.ok && NET.ch) NET.ch.send({ type: 'broadcast', event: e, payload: { ...p, id: NET.id } }); };
export const updateMe = me => { NET.me = me; if (NET.ok && NET.ch) NET.ch.track({ ...me, t: Date.now() }); };
