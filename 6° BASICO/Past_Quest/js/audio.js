// Music (streamed <audio>) and short sound effects (Web Audio buffers).
const A = { on: true, music: null, musicName: '', ctx: null, buf: {}, vol: { music: 0.35, sfx: 0.7 } };
try { A.on = localStorage.getItem('pq-sound') !== 'off'; } catch (e) {}

const SFX = ['click', 'correct', 'wrong', 'open', 'close', 'select', 'talk', 'coins', 'book', 'page', 'door', 'latch', 'powerup', 'jump', 'magic', 'step1', 'step2', 'jingle_win', 'jingle_chapter', 'jingle_lose'];
const VOICE = ['ready', 'go', 'correct', 'wrong', 'congratulations', 'you_win', 'mission_completed', 'level_up', 'time_over', '3', '2', '1', 'new_highscore', 'final_round'];

export function initAudio() {
  if (A.ctx) return;
  try { A.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  const load = (key, url) => fetch(url).then(r => r.arrayBuffer()).then(b => A.ctx.decodeAudioData(b)).then(d => A.buf[key] = d).catch(() => {});
  SFX.forEach(n => load(n, `assets/audio/sfx/${n}.ogg`));
  VOICE.forEach(n => load('v_' + n, `assets/audio/voice/${n}.ogg`));
}
function playBuf(key, vol = 1, rate = 1) {
  if (!A.on || !A.ctx || !A.buf[key]) return;
  if (A.ctx.state === 'suspended') A.ctx.resume();
  const s = A.ctx.createBufferSource(), g = A.ctx.createGain();
  s.buffer = A.buf[key]; s.playbackRate.value = rate; g.gain.value = vol * A.vol.sfx;
  s.connect(g).connect(A.ctx.destination); s.start();
}
export const sfx = (n, vol = 1, rate = 1) => playBuf(n, vol, rate);
let lastVoice = 0;
export const voice = n => { if (!n) return; const t = performance.now(); if (t - lastVoice < 1500) return; lastVoice = t; playBuf('v_' + n, 0.9); };

export function music(name) {
  if (A.musicName === name) { if (A.on && A.music && A.music.paused) A.music.play().catch(() => {}); return; }
  const old = A.music;
  if (old) fade(old, 0, 800, () => old.pause());
  A.musicName = name;
  if (!name) { A.music = null; return; }
  const m = new Audio(`assets/audio/music/${name}.mp3`); m.loop = true; m.volume = 0;
  A.music = m;
  if (A.on) m.play().then(() => fade(m, A.vol.music, 1200)).catch(() => {});
}
function fade(a, to, ms, done) {
  const from = a.volume, t0 = performance.now();
  const step = () => { const k = Math.min(1, (performance.now() - t0) / ms); a.volume = from + (to - from) * k; if (k < 1) requestAnimationFrame(step); else done && done(); };
  step();
}
export function toggleSound() {
  A.on = !A.on;
  try { localStorage.setItem('pq-sound', A.on ? 'on' : 'off'); } catch (e) {}
  if (A.music) { if (A.on) { A.music.volume = A.vol.music; A.music.play().catch(() => {}); } else A.music.pause(); }
  return A.on;
}
export const soundOn = () => A.on;
