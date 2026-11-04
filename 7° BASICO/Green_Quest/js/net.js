// Online clean-up: no teacher setup. Players join "public" rooms automatically
// (max 6 per room to keep Supabase Realtime usage low). A class code is optional.
const SUPA_URL = 'https://tlihbmgokuhvppbchvrz.supabase.co';
const SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaWhibWdva3VodnBwYmNodnJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwOTMyMDAsImV4cCI6MjEwODY2OTIwMH0.ZHA6-G0S_iqGxdnPXSB_nOIoS67G2pxSYbaGcNfvLQw';
const MAX_ROOM = 6, MAX_ROOMS = 40;

export const NET = { sb: null, ch: null, ok: false, room: 0, id: Math.random().toString(36).slice(2, 10), peers: new Map(), handlers: {} };

function key(code, n) { return `gq7b-${(code || 'public').toLowerCase().replace(/[^a-z0-9]/g, '')}-${n}`; }

export function on(ev, fn) { NET.handlers[ev] = fn; }
const emit = (ev, ...a) => NET.handlers[ev] && NET.handlers[ev](...a);

export async function connect(code, me) {
  if (typeof supabase === 'undefined') { emit('status', 'offline'); return; }
  if (!NET.sb) NET.sb = supabase.createClient(SUPA_URL, SUPA_ANON, { auth: { persistSession: false, autoRefreshToken: false }, realtime: { params: { eventsPerSecond: 8 } } });
  for (let n = 1; n <= MAX_ROOMS; n++) {
    emit('status', `Joining clean-up room ${n}…`);
    const ok = await tryRoom(key(code, n), me);
    if (ok) { NET.room = n; emit('status', 'online'); return; }
    if (ok === null) { emit('status', 'error'); return; }
  }
  emit('status', 'full');
}

function tryRoom(name, me) {
  return new Promise(resolve => {
    const ch = NET.sb.channel(name, { config: { broadcast: { self: false }, presence: { key: NET.id } } });
    let decided = false;
    const decide = () => {
      if (decided) return; decided = true;
      const st = ch.presenceState();
      // order players by join time; if I am beyond the limit, try the next room
      const list = Object.entries(st).map(([k, v]) => ({ k, t: v[0]?.t || 0 })).sort((a, b) => a.t - b.t || (a.k < b.k ? -1 : 1));
      const idx = list.findIndex(p => p.k === NET.id);
      if (idx >= MAX_ROOM) { NET.sb.removeChannel(ch); resolve(false); return; }
      NET.ch = ch; NET.ok = true; syncPeers(ch.presenceState()); resolve(true);
    };
    ch.on('presence', { event: 'sync' }, () => {
      const st = ch.presenceState();
      if (!decided && st[NET.id]) setTimeout(decide, 700);
      if (NET.ch === ch) syncPeers(st);
    });
    for (const ev of ['st', 'claim', 'emo']) ch.on('broadcast', { event: ev }, m => { if (NET.ch === ch) emit(ev, m.payload); });
    ch.subscribe(async s => {
      if (s === 'SUBSCRIBED') { NET.joinT = Date.now(); await ch.track({ ...me, t: NET.joinT }); }
      else if ((s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') && !decided) { decided = true; NET.sb.removeChannel(ch); resolve(null); }
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
    else Object.assign(p, v[0]);
  }
  for (const k of [...NET.peers.keys()]) if (!seen.has(k)) { emit('leave', NET.peers.get(k)); NET.peers.delete(k); }
  emit('roster');
}

export function send(ev, payload) { if (NET.ok && NET.ch) NET.ch.send({ type: 'broadcast', event: ev, payload: { ...payload, id: NET.id } }); }
export async function updateMe(me) { if (NET.ok && NET.ch) await NET.ch.track({ ...me, t: NET.joinT || (NET.joinT = Date.now()) }); }
export function disconnect() { if (NET.ch) { NET.sb.removeChannel(NET.ch); } NET.ch = null; NET.ok = false; NET.peers.clear(); }
