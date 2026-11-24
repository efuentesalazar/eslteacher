// TERRA LINGUA · Ventana de ejercicios. Regla: 2 intentos sin pista; al 3.er error se muestra la retroalimentación.
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const shuffle = (a, r = Math.random) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const norm = s => String(s).toLowerCase().replace(/[’`]/g, "'").replace(/[.,!?;:"¿¡]/g, '').replace(/\s+/g, ' ').trim();

/* ---------- Voz ---------- */
let voices = [];
const loadV = () => { try { voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); } catch (e) { } };
if ('speechSynthesis' in window) { loadV(); speechSynthesis.onvoiceschanged = loadV; }
const pick = alt => { const good = voices.filter(v => /natural|online|google|enhanced/i.test(v.name)); const l = good.length ? good : voices; return l.length ? l[alt % l.length] : null; };
export function speak(lines, rate = .92) {
  if (!('speechSynthesis' in window)) return false;
  speechSynthesis.cancel();
  (Array.isArray(lines) ? lines : [lines]).forEach(line => {
    const m = /^([AB]): (.*)$/.exec(line), u = new SpeechSynthesisUtterance(m ? m[2] : line), alt = m && m[1] === 'B' ? 1 : 0;
    u.lang = 'en-US'; u.rate = rate; u.pitch = alt ? 1.18 : .96; const v = pick(alt); if (v) u.voice = v; speechSynthesis.speak(u);
  });
  return true;
}
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function listen() {
  return new Promise((res, rej) => {
    const r = new SR(); r.lang = 'en-US'; r.interimResults = false; r.maxAlternatives = 4;
    r.onresult = e => res([...e.results[0]].map(x => x.transcript)); r.onerror = e => rej(e.error); r.onnomatch = () => res([]);
    r.start();
  });
}
function similarity(a, b) {
  a = norm(a); b = norm(b); if (a === b) return 1;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[a.length][b.length] / Math.max(a.length, b.length, 1);
}

/* ---------- Render de un ejercicio ---------- */
// Llama onAnswer(valorElegido, correcto). Devuelve funciones para marcar el resultado.
function renderItem(it, box, onAnswer, opts = {}) {
  box.innerHTML = '';
  const q = document.createElement('div'); q.className = 'qtext'; q.innerHTML = esc(it.q).replace(/_{3,}/g, '<span class="gap">_____</span>'); box.appendChild(q);
  if (it.audio) {
    const row = document.createElement('div'); row.className = 'audio-row';
    row.innerHTML = '<button type="button" class="btn purple" id="qPlay">🔊 Play audio</button><button type="button" class="btn ghost" id="qSlow">🐢 Slower</button>';
    box.appendChild(row); row.querySelector('#qPlay').onclick = () => speak(it.audio); row.querySelector('#qSlow').onclick = () => speak(it.audio, .72);
    if (!opts.noAuto) setTimeout(() => speak(it.audio), 250);
  }
  const area = document.createElement('div'); area.className = 'answers'; box.appendChild(area);
  const mcq = (list) => {
    area.classList.add('grid');
    (opts.fixed || shuffle(list)).forEach(o => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'opt'; b.textContent = o; b.dataset.v = o;
      b.onclick = () => { if (!b.disabled) onAnswer(o, o === it.o[0], b); }; area.appendChild(b);
    });
  };
  if (it.t === 'mc') mcq(it.o);
  else if (it.t === 'type') {
    const f = document.createElement('form'); f.className = 'typeform';
    f.innerHTML = '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type your answer…" aria-label="Your answer"><button class="btn green" type="submit">Check</button>';
    const input = f.querySelector('input');
    f.onsubmit = e => { e.preventDefault(); const v = input.value.trim(); if (!v) return; onAnswer(v, it.a.some(a => norm(a) === norm(v)), null); input.select(); };
    area.appendChild(f); setTimeout(() => input.focus(), 60);
  } else if (it.t === 'order') {
    const words = it.s.split(' '), slot = document.createElement('div'), bank = document.createElement('div'); slot.className = 'slot'; bank.className = 'bank';
    const refresh = () => { chk.disabled = bank.children.length > 0; };
    const tile = w => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tile'; b.textContent = w; b.onclick = () => { (b.parentNode === bank ? slot : bank).appendChild(b); refresh(); }; return b; };
    let mixed = shuffle(words); if (mixed.join(' ') === it.s && words.length > 1) mixed = [...mixed.slice(1), mixed[0]];
    mixed.forEach(w => bank.appendChild(tile(w)));
    const chk = document.createElement('button'); chk.type = 'button'; chk.className = 'btn green'; chk.textContent = 'Check'; chk.disabled = true;
    chk.onclick = () => { const v = [...slot.children].map(c => c.textContent).join(' '); onAnswer(v, norm(v) === norm(it.s), null); };
    area.append(slot, bank, chk);
  } else if (it.t === 'speak') {
    if (SR && !opts.noMic) {
      const w = document.createElement('div'); w.className = 'say'; w.innerHTML = `<span class="sayword">${esc(it.say)}</span>
        <div class="row"><button type="button" class="btn purple" id="spL">🔊 Listen</button><button type="button" class="btn red" id="spR">🎤 Say it</button><button type="button" class="btn ghost" id="spN">No mic</button></div><div class="heard" aria-live="polite"></div>`;
      area.appendChild(w); q.textContent = 'Listen, then say it aloud.';
      w.querySelector('#spL').onclick = () => speak(it.say, .85);
      w.querySelector('#spN').onclick = () => renderItem(it, box, onAnswer, { ...opts, noMic: true });
      const rec = w.querySelector('#spR'), heard = w.querySelector('.heard');
      rec.onclick = async () => {
        rec.disabled = true; rec.textContent = '● Listening…'; heard.textContent = '';
        try {
          const alts = await listen(); const best = alts.length ? Math.max(...alts.map(a => similarity(a, it.say))) : 0;
          heard.textContent = alts[0] ? `I heard: "${alts[0]}"` : 'I did not hear anything.';
          if (alts.length) onAnswer(alts[0], best >= .72, null);
        } catch (e) { heard.textContent = e === 'not-allowed' ? 'The microphone is blocked. Press "No mic".' : 'Try again, or press "No mic".'; }
        rec.disabled = false; rec.textContent = '🎤 Say it';
      };
    } else {
      const l = document.createElement('button'); l.type = 'button'; l.className = 'btn purple'; l.textContent = '🔊 Listen: ' + it.say; l.onclick = () => speak(it.say, .85); box.insertBefore(l, area); mcq(it.o);
    }
  }
}

/* ---------- Misión individual ---------- */
// cfg: {title, npc, text?, items, k, onLog(item, chosen, ok, ms, attempt), onDone(result)}
export function runQuest(cfg) {
  const ov = $('quiz'), body = $('qBody'), fb = $('qFb'), nextBtn = $('qNext');
  ov.classList.remove('hidden'); $('qTitle').textContent = cfg.title; $('qWho').textContent = cfg.npc || '';
  const reading = $('qReading'); reading.classList.toggle('hidden', !cfg.text); if (cfg.text) reading.textContent = cfg.text;
  ov.classList.toggle('has-text', !!cfg.text);
  let queue = cfg.items.map((it, i) => ({ it, i, fails: 0 })), solved = 0, firstTry = 0, cur = null, t0 = 0, locked = false;
  const total = cfg.items.length;
  const bar = () => { $('qProg').style.width = (solved / total * 100) + '%'; $('qCount').textContent = `${solved} / ${total}`; };
  const close = res => { ov.classList.add('hidden'); try { speechSynthesis.cancel(); } catch (e) { } $('qClose').onclick = null; cfg.onDone(res); };
  $('qClose').onclick = () => { if (confirm('Leave this mission? Your answers here will not be saved.')) close({ done: false }); };
  function next() {
    fb.className = 'fb'; fb.textContent = ''; nextBtn.classList.add('hidden'); locked = false;
    if (!queue.length) return close({ done: true, total, firstTry, stars: firstTry === total ? 3 : firstTry >= total * .7 ? 2 : 1 });
    cur = queue[0]; t0 = performance.now(); bar(); body.scrollTop = 0;
    renderItem(cur.it, body, answer);
  }
  function answer(val, ok, btn) {
    if (locked) return;
    cur.attempt = (cur.attempt || 0) + 1;
    cfg.onLog && cfg.onLog(cur.it, val, ok, performance.now() - t0, cur.attempt);
    if (ok) {
      locked = true; if (btn) btn.classList.add('right'); queue.shift(); solved++;
      const isFirst = cur.attempt === 1 && !cur.again; if (isFirst) firstTry++;
      cfg.onRight && cfg.onRight(isFirst ? 10 : (cur.again ? 2 : cur.attempt === 2 ? 6 : 3));
      fb.className = 'fb ok'; fb.textContent = isFirst ? '✔ Excellent!' : '✔ Correct!'; bar();
      setTimeout(next, 750); return;
    }
    cfg.onWrong && cfg.onWrong();
    if (btn) { btn.classList.add('wrong'); btn.disabled = true; }
    cur.fails++;
    if (cur.fails < 3) { fb.className = 'fb warn'; fb.textContent = cur.fails === 1 ? '✖ Not quite. Try again! (attempt 2 of 3)' : '✖ One more try! (attempt 3 of 3)'; fb.scrollIntoView({ block: 'nearest' }); return; }
    // Tercer error: retroalimentación y la pregunta vuelve al final de la misión
    locked = true;
    const right = cur.it.t === 'type' ? cur.it.a[0] : cur.it.t === 'order' ? cur.it.s : (cur.it.t === 'speak' && !body.querySelector('.opt')) ? cur.it.say : cur.it.o[0];
    body.querySelectorAll('.opt').forEach(b => { b.disabled = true; if (b.dataset.v === right) b.classList.add('right'); });
    fb.className = 'fb teach'; fb.innerHTML = `<b>💡 Feedback</b> ${esc(cur.it.x)}<br><span>Answer: <b>${esc(right)}</b>. This question will come back at the end.</span>`;
    nextBtn.classList.remove('hidden'); nextBtn.scrollIntoView({ block: 'nearest' }); nextBtn.onclick = () => { const c = queue.shift(); queue.push({ it: c.it, i: c.i, fails: 0, again: true }); next(); };
  }
  bar(); next();
}

/* ---------- Pregunta rápida (cofres y arena): 1 intento, siempre explica ---------- */
export function quickQuestion(it, title, onLog) {
  return new Promise(resolve => {
    const ov = $('quick'), box = $('qkBody'), f = $('qkFb'); ov.classList.remove('hidden'); $('qkTitle').textContent = title; f.className = 'fb'; f.textContent = '';
    const t0 = performance.now();
    renderItem(it, box, (v, ok, btn) => {
      onLog && onLog(it, v, ok, performance.now() - t0, 1);
      box.querySelectorAll('.opt').forEach(b => { b.disabled = true; if (b.dataset.v === it.o[0]) b.classList.add('right'); });
      if (!ok && btn) btn.classList.add('wrong');
      f.className = 'fb ' + (ok ? 'ok' : 'teach'); f.innerHTML = ok ? '✔ Correct!' : `<b>💡</b> ${esc(it.x)}`;
      setTimeout(() => { ov.classList.add('hidden'); resolve(ok); }, ok ? 800 : 2600);
    });
  });
}

/* ---------- Misión en party: todos deben votar lo mismo ---------- */
export function partyQuizUI() {
  const ov = $('pquiz');
  return {
    open(title, clue, members) { ov.classList.remove('hidden'); $('pqTitle').textContent = title; $('pqClue').textContent = clue; this.members = members; },
    show(it, order, votes, myVote, onVote, n, total, fails) {
      $('pqCount').textContent = `Question ${n} of ${total}` + (fails ? ` · attempt ${fails + 1} of 3` : '');
      $('pqQ').textContent = it.q; const a = $('pqA'); a.innerHTML = '';
      order.forEach(o => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'opt' + (myVote === o ? ' mine' : '');
        const names = Object.entries(votes).filter(([, v]) => v === o).map(([k]) => this.members[k] || '?');
        b.innerHTML = `${esc(o)}${names.length ? `<small>${names.map(esc).join(', ')}</small>` : ''}`; b.onclick = () => onVote(o); a.appendChild(b);
      });
    },
    msg(html, cls = '') { const f = $('pqFb'); f.className = 'fb ' + cls; f.innerHTML = html; },
    close() { ov.classList.add('hidden'); }
  };
}
