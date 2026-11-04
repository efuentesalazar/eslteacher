// UI helpers: modal, dialog, toasts, quiz runner, reading, lessons.
import { shuffle, LESSONS } from './content.js';
import { sfx, voice } from './audio.js';

const $ = s => document.querySelector(s);
export const el = (tag, attrs = {}, html = '') => { const e = document.createElement(tag); for (const k in attrs) { if (k === 'on') for (const ev in attrs.on) e.addEventListener(ev, attrs.on[ev]); else e.setAttribute(k, attrs[k]); } if (html) e.innerHTML = html; return e; };
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const UI = { open: false, spanish: true };

export function modal(html, { close = true, onClose } = {}) {
  const box = $('#modal-box');
  box.innerHTML = html;
  if (close) { const x = el('button', { class: 'x', title: 'Close' }, '✕'); x.onclick = () => { closeModal(); onClose && onClose(); }; box.appendChild(x); }
  $('#modal').classList.remove('hidden'); UI.open = true;
  return box;
}
export function closeModal() { $('#modal').classList.add('hidden'); $('#modal-box').innerHTML = ''; UI.open = false; }

export function toast(html, ms = 2600) {
  const d = el('div', {}, html); $('#toast').appendChild(d); setTimeout(() => d.remove(), ms);
}
export function banner(top, big) {
  const b = $('#banner'); b.classList.add('hidden'); void b.offsetWidth;
  b.querySelector('.b1').textContent = top; b.querySelector('.b2').textContent = big; b.classList.remove('hidden');
  clearTimeout(banner._t); banner._t = setTimeout(() => b.classList.add('hidden'), 4300);
}

// Dialog box. buttons: [{label, cls, fn}]
export function dialog(name, text, es = '', buttons = [{ label: 'OK ▶' }]) {
  return new Promise(res => {
    $('#dlg-name').textContent = name;
    $('#dlg-text').innerHTML = text;
    $('#dlg-es').textContent = UI.spanish ? es : '';
    const bt = $('#dlg-btns'); bt.innerHTML = '';
    buttons.forEach((b, i) => {
      const x = el('button', { class: 'btn ' + (b.cls || '') }, b.label);
      x.onclick = () => { sfx('click'); $('#dialog').classList.add('hidden'); UI.open = false; res(b.value ?? i); };
      bt.appendChild(x);
    });
    $('#dialog').classList.remove('hidden'); UI.open = true; sfx('talk');
    dialog.first = bt.firstChild;
  });
}
export const dialogVisible = () => !$('#dialog').classList.contains('hidden');

/* ---------- Quiz ---------- */
const norm = s => s.toLowerCase().replace(/[’`]/g, "'").replace(/[.!?]/g, '').replace(/\s+/g, ' ').trim();

// Runs a list of questions. Returns {ok, total, results:[bool]}.
// opts: {title, need, onAnswer(ok,q), single (one question, used online/boss), color}
export function runQuiz(questions, opts = {}) {
  return new Promise(resolve => {
    let i = 0; const results = [];
    const next = () => {
      if (i >= questions.length) { resolve({ ok: results.filter(Boolean).length, total: questions.length, results }); return; }
      showQuestion(questions[i], i, ok => { results.push(ok); opts.onAnswer && opts.onAnswer(ok, questions[i]); i++; next(); });
    };
    const showQuestion = (q, idx, done) => {
      const dots = questions.length > 1 ? `<div class="qdots">${questions.map((_, k) => `<i class="${k < idx ? (results[k] ? 'ok' : 'ko') : k === idx ? 'now' : ''}"></i>`).join('')}</div>` : '';
      const box = modal(`<div class="qhead"><span>${esc(opts.title || 'Challenge')}</span>${dots}</div><div id="qbody"></div><div class="fb" id="qfb"></div><div class="row" id="qnext"></div>`, { close: !!opts.closable, onClose: opts.onCancel });
      const body = box.querySelector('#qbody');
      let answered = false; const t0 = performance.now();
      const finish = (ok, shown, chosen) => {
        if (answered) return; answered = true;
        // Registro para el Panel del profe (eslteacher.cl → Análisis de juegos)
        if (window.eslLog) window.eslLog('past-quest-6b', { activity: opts.title || '', item: { q: q.t === 'order' ? 'Order: ' + q.words.join(' ') : (q.t === 'tf' ? 'True or false? ' : '') + q.q, k: q._topic || opts.topic || 'mix' }, chosen, right: shown, ok, ms: performance.now() - t0 });
        sfx(ok ? 'correct' : 'wrong'); if (opts.voice !== false) voice(ok ? 'correct' : null);
        const fb = box.querySelector('#qfb');
        fb.className = 'fb ' + (ok ? 'ok' : 'ko');
        fb.innerHTML = ok ? `<b>✔ Correct! ${['Great job!', 'Well done!', 'Excellent!', 'Super!', 'Amazing!'][Math.floor(Math.random() * 5)]}</b>${q.tip ? `<div>${esc(q.tip)}</div>` : ''}`
          : `<b>✘ Not quite.</b> Correct answer: <b>${esc(shown)}</b>${q.tip ? `<div>${esc(q.tip)}</div>` : ''}`;
        const b = el('button', { class: 'btn' }, idx + 1 < questions.length ? 'Next ▶' : 'Continue ▶');
        b.onclick = () => { sfx('click'); done(ok); };
        box.querySelector('#qnext').appendChild(b); setTimeout(() => b.focus(), 50);
        if (opts.fast) setTimeout(() => { if (document.body.contains(b)) b.click(); }, ok ? 900 : 2600);
      };
      const qtxt = s => esc(s).replace(/___/g, '<span class="gap">?</span>');
      if (q.t === 'mc' || q.t === 'tf') {
        const correct = q.t === 'tf' ? (q.a ? 'True' : 'False') : q.o[0];
        const opts2 = q.t === 'tf' ? ['True', 'False'] : (q.fixed ? q.o.slice().sort() : shuffle(q.o));
        body.innerHTML = `<div class="qtext">${q.t === 'tf' ? '<small>True or false?</small><br>' : ''}${qtxt(q.q)}</div><div class="opts ${opts2.some(o => o.length > 28) ? 'one' : ''}"></div>`;
        const wrap = body.querySelector('.opts');
        opts2.forEach((o, k) => {
          const b = el('button', { class: 'opt-b' }, `<b>${'ABCD'[k]}</b> ${esc(o)}`);
          b.onclick = () => {
            if (answered) return;
            const ok = o === correct;
            b.classList.add(ok ? 'ok' : 'ko');
            if (!ok) [...wrap.children].find(c => c.textContent.slice(2) === correct)?.classList.add('ok');
            finish(ok, correct, o);
          };
          wrap.appendChild(b);
        });
        box.onkeydown = e => { const k = '1234abcd'.indexOf(e.key.toLowerCase()); if (k >= 0 && !answered) wrap.children[k % 4]?.click(); };
      } else if (q.t === 'type') {
        body.innerHTML = `<div class="qtext">${qtxt(q.q)}</div><input class="qinput" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type here…"><div class="row"><button class="btn blue">Check ✔</button></div>`;
        const inp = body.querySelector('input'), b = body.querySelector('button');
        const check = () => { if (answered || !inp.value.trim()) return; const ok = q.a.some(a => norm(a) === norm(inp.value)); inp.classList.add(ok ? 'ok' : 'ko'); inp.disabled = true; b.remove(); finish(ok, q.a[0], inp.value); };
        b.onclick = check; inp.onkeydown = e => { if (e.key === 'Enter') check(); e.stopPropagation(); };
        setTimeout(() => inp.focus(), 60);
      } else if (q.t === 'order') {
        const target = q.words.join(' ');
        const pool = shuffle(q.words.map((w, k) => ({ w, k })));
        body.innerHTML = `<div class="qtext"><small>Put the words in order. / Ordena las palabras.</small></div><div class="tiles answer"></div><div class="tiles pool"></div><div class="row"><button class="btn ghost">↺ Reset</button><button class="btn blue">Check ✔</button></div>`;
        const ans = body.querySelector('.answer'), pl = body.querySelector('.pool');
        const [reset, check] = body.querySelectorAll('.row button');
        const chosen = [];
        const draw = () => {
          ans.innerHTML = ''; chosen.forEach((t, k) => { const b = el('button', { class: 'tile' }, esc(t.w)); b.onclick = () => { if (answered) return; chosen.splice(k, 1); sfx('select'); draw(); }; ans.appendChild(b); });
          pl.innerHTML = ''; pool.forEach(t => { const b = el('button', { class: 'tile' + (chosen.includes(t) ? ' used' : '') }, esc(t.w)); b.onclick = () => { if (answered) return; chosen.push(t); sfx('select'); draw(); }; pl.appendChild(b); });
        };
        draw();
        reset.onclick = () => { if (!answered) { chosen.length = 0; draw(); } };
        check.onclick = () => {
          if (answered || chosen.length < q.words.length) { toast('Use all the words! / ¡Usa todas las palabras!'); return; }
          const ok = norm(chosen.map(t => t.w).join(' ')) === norm(target);
          ans.style.borderColor = ok ? 'var(--green)' : 'var(--red)'; reset.remove(); check.remove();
          finish(ok, target.replace(/ ([.?!])$/, '$1'), chosen.map(t => t.w).join(' '));
        };
      }
    };
    next();
  });
}

/* ---------- Lesson card ---------- */
export function lessonHTML(key) {
  const L = LESSONS[key];
  return `<div class="lesson"><h2>📘 ${esc(L.title)}</h2><div class="es">${esc(L.es)}</div>
    <table>${L.rows.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
    ${L.ex.map(e => `<div class="ex">${esc(e)}</div>`).join('')}
    ${L.extra ? `<div class="es">💡 ${esc(L.extra)}</div>` : ''}</div>`;
}
export function showLesson(key) {
  return new Promise(res => {
    const box = modal(lessonHTML(key) + '<div class="row"><button class="btn" id="lok">I understand! ✔ <small>¡Entendido!</small></button></div>', { onClose: res });
    sfx('book');
    box.querySelector('#lok').onclick = () => { sfx('click'); closeModal(); res(); };
  });
}

/* ---------- Reading ---------- */
export function showReading(R, name) {
  return new Promise(res => {
    const paras = R.text.map(p => `<p>${esc(p.replace('{name}', name || 'Explorer'))}</p>`).join('');
    const box = modal(`<h2>📜 ${esc(R.title)}</h2><div class="text ${R.kind}">${paras}</div>
      <div class="es">Lee con atención. Después responderás ${R.qs.length} preguntas (puedes volver a leer el texto durante las preguntas).</div>
      <div class="row"><button class="btn" id="rok">I'm ready! ▶</button></div>`, { close: false });
    sfx('page');
    box.querySelector('#rok').onclick = async () => {
      sfx('click');
      const r = await runReadingQuiz(R, paras);
      res(r);
    };
  });
}
function runReadingQuiz(R, paras) {
  // Reading questions are shown next to the text.
  return new Promise(resolve => {
    let i = 0; const results = [];
    const step = () => {
      if (i >= R.qs.length) { resolve({ ok: results.filter(Boolean).length, total: R.qs.length, results }); return; }
      runQuiz([R.qs[i]], { title: `${R.title} · Question ${i + 1}/${R.qs.length}`, topic: 'read' }).then(r => { results.push(r.results[0]); i++; step(); });
      // put the text beside the question
      const box = $('#modal-box'); const body = box.querySelector('#qbody');
      const wrap = el('div', { class: 'reading' }); const t = el('div', { class: 'text ' + R.kind }, paras);
      body.parentNode.insertBefore(wrap, body); wrap.appendChild(t); wrap.appendChild(body);
      const fb = box.querySelector('#qfb'), nx = box.querySelector('#qnext'); body.appendChild(fb); body.appendChild(nx);
    };
    step();
  });
}
