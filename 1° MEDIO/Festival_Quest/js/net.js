// Online festival: ONE open room for everybody (no codes, no teacher setup). Supabase Realtime, no tables:
// nothing about the players is stored. The free plan has a message limit shared with the whole site,
// so: max 20 players at once and few messages (positions every 1.5 s, only while moving).
const SUPA_URL = 'https://tlihbmgokuhvppbchvrz.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaWhibWdva3VodnBwYmNodnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTMyMDAsImV4cCI6MjEwODY2OTIwMH0.ZHA6-G0S_iqGxdnPXSB_nOIoS67G2pxSYbaGcNfvLQw';
const ROOM = 'festivalquest-world-v1';
export const MAX_PLAYERS = 20;

export const NET = { sb: null, ch: null, ok: false, id: Math.random().toString(36).slice(2, 10), peers: new Map(), handlers: {}, joinT: 0 };
export function on(ev, fn) { NET.handlers[ev] = fn; }
const emit = (ev, ...a) => NET.handlers[ev] && NET.handlers[ev](...a);

export function connect(me) {
  return new Promise(resolve => {
    if (typeof supabase === 'undefined') { emit('status', 'offline'); return resolve(false); }
    if (NET.ch) return resolve(NET.ok);
    if (!NET.sb) NET.sb = supabase.createClient(SUPA_URL, SUPA_ANON, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { params: { eventsPerSecond: 5 } } });
    const ch = NET.sb.channel(ROOM, { config: { broadcast: { self: false }, presence: { key: NET.id } } });
    NET.ch = ch; let decided = false;
    const decide = () => {
      if (decided) return; decided = true;
      const list = Object.entries(ch.presenceState()).map(([k, v]) => ({ k, t: v[0]?.t || 0 })).sort((a, b) => a.t - b.t || (a.k < b.k ? -1 : 1));
      if (list.findIndex(p => p.k === NET.id) >= MAX_PLAYERS) { disconnect(); emit('status', 'full'); return resolve(false); }
      NET.ok = true; syncPeers(ch.presenceState()); emit('status', 'online'); resolve(true);
    };
    ch.on('presence', { event: 'sync' }, () => { const st = ch.presenceState(); if (!decided && st[NET.id]) setTimeout(decide, 600); if (NET.ok && NET.ch === ch) syncPeers(st); });
    for (const ev of ['st', 'say', 'claim', 'emo', 'duel', 'grp']) ch.on('broadcast', { event: ev }, m => { if (NET.ok && NET.ch === ch) emit(ev, m.payload); });
    ch.subscribe(async s => {
      if (s === 'SUBSCRIBED') { NET.joinT = Date.now(); await ch.track({ ...me, t: NET.joinT }); }
      else if ((s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') && !decided) { decided = true; disconnect(); emit('status', 'offline'); resolve(false); }
    });
    setTimeout(() => { if (!decided) decide(); }, 6000);
  });
}
function syncPeers(st) {
  const seen = new Set();
  for (const [k, v] of Object.entries(st)) {
    if (k === NET.id || !v[0]) continue; seen.add(k);
    const p = NET.peers.get(k);
    if (!p) { NET.peers.set(k, { id: k, ...v[0] }); emit('join', NET.peers.get(k)); }
    else { const changed = p.char !== v[0].char; Object.assign(p, v[0]); emit('update', p, changed); }
  }
  for (const k of [...NET.peers.keys()]) if (!seen.has(k)) { const p = NET.peers.get(k); NET.peers.delete(k); emit('leave', p); }
}
export function send(ev, payload) { if (NET.ok && NET.ch) NET.ch.send({ type: 'broadcast', event: ev, payload: { ...payload, id: NET.id } }); }
export function updateMe(me) { if (NET.ok && NET.ch) NET.ch.track({ ...me, t: NET.joinT }); }
export function disconnect() { if (NET.ch && NET.sb) NET.sb.removeChannel(NET.ch); NET.ch = null; NET.ok = false; const all = [...NET.peers.values()]; NET.peers.clear(); for (const p of all) emit('leave', p); }
