import * as THREE from 'three';
import { scene, colliders, camBlockers, animated, WORLD_R, REALMS, realmWeights, realmAt, H, setProgress, label, M, load, roads, shadowize, prop } from './core.js';
import { buildWorld, world, noticeBoard } from './world.js';
import { makeChar, applyEquip, holdItems, makeSlime, makeAnimal, RACES, pulseGlow } from './chars.js';
import { ITEMS, SLOTS, TYPE_NAME, QUAL, MAX_UP, isGear, entry, itemStat, fullName, itemValue, upgradeCost, TIERS, tierOf, KITS, KIT_TXT } from './data/items.js';
import { PLACES, NPCS, MONSTERS, ZONES, PICKS, PORTALS } from './data/world_data.js';
import { QUESTS, DOCS, ACTS, SKILLS, SKILLS_ES } from './data/quests.js';
import { GLOSS } from './data/gloss.js';
import { logAnswer, student } from './track.js';
import * as net from './net.js';
const GAME = 'wordbound'; // id del juego en el Panel del profe

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const LOOKS = [['Knight', 'Knight', '🛡️'], ['Ranger', 'Ranger', '🏹'], ['Rogue', 'Rogue', '🗡️'], ['Mage', 'Mage', '🔮'], ['Barbarian', 'Barbarian', '🪓']];
const RACE_ICON = { human: '🧑', elf: '🧝', dwarf: '🧔', orc: '👹' };
const QBY = Object.fromEntries(QUESTS.map(q => [q.id, q]));
const NODROP = new Set(['gem_forest', 'gem_stone', 'gem_sun', 'gem_moon', 'crown', 'mayor_letter', 'map_piece', 'orc_tablet', 'lantern_oil']);
const SHOPS = {
  tom: ['iron_sword', 'battle_axe', 'wood_shield', 'badge_shield', 'iron_helmet', 'traveler_clothes', 'leather_armor', 'plate_armor', 'red_cape', 'potion_s'],
  martha: ['bread', 'apple', 'cheese', 'potion_s'],
  nim: ['elf_bow', 'magic_wand', 'oak_staff', 'wizard_hat', 'mage_robes', 'elven_armor', 'green_cloak', 'mage_cape', 'potion_s', 'potion_m'],
  brokk: ['dwarf_axe', 'great_sword', 'crossbow', 'knight_shield', 'iron_helmet', 'fur_armor', 'dwarf_plate', 'potion_m'],
  kasim: ['orc_cleaver', 'heavy_xbow', 'rogue_mask', 'hooded_cloak', 'orc_shield', 'spike_shield', 'potion_m'],
  morwen: ['shadow_staff', 'bone_shield', 'bone_helmet', 'golden_helmet', 'shadow_plate', 'bone_cloak', 'potion_s', 'potion_m']
};

// ======================= SAVE =======================
const SAVE_KEY = 'wordbound_v1';
function fresh() { return { name: '', race: 'human', look: 'Knight', lvl: 1, xp: 0, gold: 20, hp: 95, inv: [], eq: { head: null, body: null, cape: null, weapon: null, off: null }, q: {}, track: null, flags: {}, read: {}, reveal: {}, phr: [], stats: {}, pos: null, town: 0, visited: [0], lit: [], portals: ['p_bright'], done: false, online: true, voice: true, rate: 0.92, music: 0.3 }; }
let S = fresh();
try { const raw = localStorage.getItem(SAVE_KEY); if (raw) S = Object.assign(fresh(), JSON.parse(raw)); } catch (e) { }
// old saves kept equipment as plain ids: give them quality and level
for (const k in S.eq) if (S.eq[k]) S.eq[k] = entry(S.eq[k]);
if (S.q.welcome && S.q.welcome.st === 'done' && !Object.keys(S.flags).some(k => k.startsWith('kit_'))) S.flags.kit_Knight = true; // they already got the sword
S.inv = S.inv.map(x => isGear(x.id) ? { q: 'c', up: 0, ...x } : x);
function save() { try { S.pos = [+player.pos.x.toFixed(1), +player.pos.z.toFixed(1)]; localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }

// ======================= AUDIO + VOICE =======================
const sfxCache = {};
function sfx(n, v = 0.55) { try { const b = sfxCache[n] ||= new Audio(`assets/audio/${n}.ogg`); const a = b.cloneNode(); a.volume = v; a.play().catch(() => { }); } catch (e) { } }
const music = new Audio(); music.loop = true;
function playMusic(n) { music.volume = S.music; if (music.dataset.n === n) return; music.dataset.n = n; music.src = `assets/audio/${n}.mp3`; music.play().catch(() => { }); }
let voices = [];
function loadVoices() { try { voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); } catch (e) { } }
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
const VOICE = { elf: [1.25, 1], dwarf: [0.7, 0.95], orc: [0.55, 0.9], bone: [1.45, 1.05], human: [1, 1], kid: [1.6, 1.05], me: [1.1, 1] };
function speak(text, who = 'human', force) {
  if ((!S.voice && !force) || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[*_]/g, ''));
    const pref = voices.find(v => /en-GB/i.test(v.lang) && /Google|Natural|Online/i.test(v.name)) || voices.find(v => /en-GB/i.test(v.lang)) || voices.find(v => /en-US/i.test(v.lang)) || voices[0];
    if (pref) u.voice = pref; u.lang = pref ? pref.lang : 'en-GB';
    const [p, r] = VOICE[who] || VOICE.human; u.pitch = p; u.rate = S.rate * r;
    speechSynthesis.speak(u);
  } catch (e) { }
}

// ======================= RENDERER / CAMERA =======================
const renderer = new THREE.WebGLRenderer({ canvas: $('c'), antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 600);
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();
const cam = { yaw: 0, pitch: 0.36, dist: 9 };

// ======================= STATE =======================
let mode = 'menu';            // menu | play
let dlgOpen = false, modalOpen = false;
const busy = () => dlgOpen || modalOpen;
const player = { c: null, pos: new THREE.Vector3(3, 0, 10), vy: 0, jumpY: 0, ry: Math.PI, ground: true, atkCd: 0, combo: 0, dead: false, hurtT: 0 };
const keys = {}, stick = { x: 0, y: 0 };
const npcs = {};              // id -> {c, pos, def, marks}
const monsters = [];
const zoneState = ZONES.map(() => ({ spawned: false, mons: [] }));
const projectiles = [], floaters = [], groundItems = [], picks = [];
let focus = null;             // dialogue camera focus
let beacon;

// ======================= STATS / INVENTORY =======================
const gear = k => Object.values(S.eq).reduce((s, e) => s + (e ? itemStat(e, k) : 0), 0);
const wid = slot => S.eq[slot] && S.eq[slot].id;
const maxHP = () => 80 + S.lvl * 15 + gear('hp');
const atk = () => Math.round(3 + S.lvl * 1.5 + gear('atk'));
const def = () => gear('def');
const xpNext = () => 60 + S.lvl * S.lvl * 25;
const stackable = id => ['use', 'misc', 'quest'].includes(ITEMS[id].t);
const count = id => S.inv.filter(s => s.id === id).reduce((a, s) => a + s.n, 0);
const iname = id => ITEMS[id] ? ITEMS[id].n : id;
function addItem(id, n = 1, quiet, extra) {
  if (!ITEMS[id]) return;
  const e = { id, q: (extra && extra.q) || 'c', up: (extra && extra.up) || 0 };
  if (stackable(id)) { const s = S.inv.find(s => s.id === id); if (s) s.n += n; else S.inv.push({ id, n }); }
  else for (let i = 0; i < n; i++) S.inv.push({ ...e, n: 1 });
  if (!quiet) logLine(`+${n > 1 ? n + ' ' : ''}${ITEMS[id].icon} <span style="color:${isGear(id) && e.q !== 'c' ? QUAL[e.q].color : 'inherit'}">${esc(fullName(e))}</span>`);
  save(); hudDirty = true; checkSteps();
}
function removeItem(id, n = 1) {
  for (let i = S.inv.length - 1; i >= 0 && n > 0; i--) { const s = S.inv[i]; if (s.id !== id) continue; const k = Math.min(n, s.n); s.n -= k; n -= k; if (s.n <= 0) S.inv.splice(i, 1); }
  save(); hudDirty = true;
}
async function refreshEquip() {
  if (!player.c) return;
  await applyEquip(player.c, S.eq);
  if (preview.c) applyEquip(preview.c, S.eq);
  net.updateMe(myInfo());
  S.hp = Math.min(S.hp, maxHP()); hudDirty = true;
}
function equipFromInv(idx) {
  const s = S.inv[idx]; if (!s) return; const it = ITEMS[s.id];
  const slot = it.t; if (!['head', 'body', 'cape', 'weapon', 'off'].includes(slot)) return;
  S.inv.splice(idx, 1);
  if (S.eq[slot]) S.inv.push({ ...S.eq[slot], n: 1 });
  S.eq[slot] = entry({ id: s.id, q: s.q, up: s.up });
  if (slot === 'weapon' && ['2h', 'bow', 'xbow'].includes(it.kind) && S.eq.off) { S.inv.push({ ...S.eq.off, n: 1 }); S.eq.off = null; toast('Two hands needed: shield removed'); }
  if (slot === 'off' && S.eq.weapon && ['2h', 'bow', 'xbow'].includes(ITEMS[wid('weapon')].kind)) { S.inv.push({ ...S.eq.weapon, n: 1 }); S.eq.weapon = null; toast('Your weapon needs two hands: weapon removed'); }
  sfx('equip'); save(); refreshEquip(); checkSteps();
}
function unequip(slot) { if (!S.eq[slot]) return; S.inv.push({ ...S.eq[slot], n: 1 }); S.eq[slot] = null; sfx('equip'); save(); refreshEquip(); }
function useItem(idx) {
  const s = S.inv[idx]; if (!s) return; const it = ITEMS[s.id];
  if (it.t !== 'use') return;
  if (S.hp >= maxHP()) { toast('Your health is already full ❤️'); return; }
  S.hp = Math.min(maxHP(), S.hp + it.heal); removeItem(s.id, 1); sfx('ok'); floatText(`+${it.heal}`, player.pos, '#5fe07a'); hudDirty = true;
}
function quickPotion() {
  if (busy() || player.dead) return;
  const order = ['potion_m', 'potion_s', 'mushroom_soup', 'cheese', 'bread', 'apple'];
  const id = order.find(id => count(id) > 0); if (!id) { toast('No potions! Buy some in a shop.'); return; }
  useItem(S.inv.findIndex(s => s.id === id));
}
function dropItem(idx, n) {
  const s = S.inv[idx]; if (!s) return;
  if (NODROP.has(s.id)) { toast('You can\'t drop this. It is very important!'); return false; }
  n = Math.min(n, s.n); removeItem(s.id, n);
  const a = player.ry, p = player.pos.clone().add(new THREE.Vector3(Math.sin(a) * 1.4, 0, Math.cos(a) * 1.4));
  spawnGround(s.id, n, p, { q: s.q, up: s.up }); sfx('drop'); player.c.play('PickUp', 0.1, true);
  return true;
}

// ======================= HUD HELPERS =======================
function toast(t, ms = 2000) { const el = $('toast'); el.innerHTML = t; el.style.opacity = 1; clearTimeout(el._t); el._t = setTimeout(() => el.style.opacity = 0, ms); }
function banner(a, b) { const el = $('banner'); el.querySelector('h2').textContent = a; el.querySelector('div').textContent = b; el.style.opacity = 1; clearTimeout(el._t); el._t = setTimeout(() => el.style.opacity = 0, 3200); }
function logLine(t) { const el = document.createElement('div'); el.innerHTML = t; $('log').appendChild(el); setTimeout(() => el.remove(), 3500); while ($('log').children.length > 5) $('log').firstChild.remove(); }
let hudDirty = true;
function drawHUD() {
  hudDirty = false;
  $('cName').textContent = `${RACE_ICON[S.race]} ${S.name || 'Hero'}`; $('cLv').textContent = `Lv ${S.lvl}`;
  const mh = maxHP(); $('hpb').firstChild.style.width = `${Math.max(0, S.hp) / mh * 100}%`; $('hpb').lastChild.textContent = `${Math.ceil(Math.max(0, S.hp))} / ${mh} HP`;
  $('xpb').firstChild.style.width = `${S.xp / xpNext() * 100}%`; $('xpb').lastChild.textContent = `${S.xp} / ${xpNext()} XP`;
  $('cGold').textContent = `🪙 ${S.gold}`; $('cStats').textContent = `⚔️ ${atk()} · 🛡️ ${def()}`;
  $('potN').textContent = ['potion_s', 'potion_m'].reduce((a, id) => a + count(id), 0);
  drawTracker();
}

// ======================= GLOSSARY =======================
const GKEYS = Object.keys(GLOSS).filter(k => !k.endsWith('_'));
function glossify(text) {
  return esc(text).replace(/\b([A-Za-z]+)\b/g, (w) => {
    const l = w.toLowerCase(); let m = GLOSS[l];
    if (!m && l.endsWith('s')) m = GLOSS[l.slice(0, -1)];
    if (!m && l.endsWith('ed')) m = GLOSS[l.slice(0, -2)] || GLOSS[l.slice(0, -1)];
    return m ? `<span class="g" data-es="${esc(m)}">${w}</span>` : w;
  });
}
document.addEventListener('click', e => {
  const g = e.target.closest && e.target.closest('.g'); const pop = $('gpop');
  if (!g) { pop.classList.add('hidden'); return; }
  e.stopPropagation(); pop.textContent = `${g.textContent} = ${g.dataset.es}`; pop.classList.remove('hidden');
  const r = g.getBoundingClientRect(); pop.style.left = `${Math.min(innerWidth - pop.offsetWidth - 8, r.left)}px`; pop.style.top = `${r.top - 40}px`;
  clearTimeout(pop._t); pop._t = setTimeout(() => pop.classList.add('hidden'), 3500);
}, true);

// ======================= RECORD ANSWERS =======================
function record(k, q, chosen, right, ok, activity, t0) {
  const st = S.stats[k] ||= [0, 0]; st[1]++; if (ok) st[0]++; save();
  logAnswer(GAME, { activity, item: { q, k }, chosen, right, ok, ms: performance.now() - (t0 || performance.now()) });
}

// ======================= DIALOGUE =======================
function speaker(id) {
  if (id === 'me') return { name: S.name || 'You', color: '#e09a1a', icon: RACE_ICON[S.race], voice: 'me' };
  if (id === 'narrator') return { name: 'Wordbound', color: '#6b3a10', icon: '📖', voice: 'human' };
  const n = NPCS[id]; if (n) return { name: n.name, color: n.color || '#888', icon: n.kind === 'animal' ? (n.file === 'cat' ? '🐱' : '🐶') : n.kind === 'tree' ? '🌳' : n.kind === 'board' ? '📌' : n.name.replace(/^(Mayor|Guard|Queen|King|Chief|Sage|Little|Old|Shy|Granny|Shaman|Mr\.) /, '')[0], voice: n.scale && n.scale < 0.8 ? 'kid' : (n.race || 'human') };
  const m = MONSTERS[id]; if (m) return { name: m.name, color: '#5a2a8a', icon: '💀', voice: 'orc' };
  return { name: id, color: '#888', icon: '?', voice: 'human' };
}
const fill = t => String(t).replace(/\{name\}/g, S.name || 'friend');
function parseLine(s, def) { const m = /^@(\w+):\s*(.*)$/s.exec(s); return m ? [m[1], m[2]] : [def, s]; }
let dlgCtx = { tag: '' };
function dlgFrame(who, inner) {
  const sp = speaker(who);
  $('dlg').innerHTML = `<div class="face" style="background:${sp.color}">${esc(sp.icon)}</div><div class="body"><div class="who">${esc(sp.name)}${dlgCtx.tag ? `<span class="qtag">${esc(dlgCtx.tag)}</span>` : ''}</div>${inner}</div>`;
  $('dlg').classList.remove('hidden'); dlgOpen = true;
}
function line(who, text) {
  text = fill(text);
  return new Promise(res => {
    dlgFrame(who, `<div class="txt">${glossify(text)}</div><div class="row"><button class="tool" id="dSpk">🔊</button><span class="sp"></span><button class="btn" id="dNext">Next ▶</button></div>`);
    speak(text, speaker(who).voice);
    $('dSpk').onclick = () => speak(text, speaker(who).voice, true);
    const go = () => { sfx('click', 0.3); dlgNext = null; res(); };
    $('dNext').onclick = go; dlgNext = go;
  });
}
let dlgNext = null, dlgPick = null;
function endDialog() { $('dlg').classList.add('hidden'); dlgOpen = false; dlgNext = dlgPick = null; focus = null; try { speechSynthesis.cancel(); } catch (e) { } }

/** el = {ask, listen, k, o:[[text, reaction]...]} — first option is right */
function askQ(who, el, activity) {
  return new Promise(res => {
    const order = el.o.map((_, i) => i).sort(() => Math.random() - 0.5);
    const listen = el.listen ? fill(el.listen) : null;
    let shown = !listen, t0 = performance.now(), tries = 0;
    const wrong = new Set();
    const render = (msg, msgWho) => {
      const top = listen ? `<div class="txt ${shown ? '' : 'listen'}">${shown ? glossify(listen) : '👂 Listen carefully… (press 🔊 to hear it again)'}</div>` : (msg ? '' : '');
      const reaction = msg ? `<div class="txt" style="color:#8d2620">${esc(speaker(msgWho).name)}: ${glossify(msg)}</div>` : '';
      dlgFrame(who, `${top}${reaction}<div class="q">${glossify(fill(el.ask || ''))}</div><div class="opts">${order.map((i, j) => `<button class="opt ${wrong.has(i) ? 'no' : ''}" data-i="${i}" ${wrong.has(i) ? 'disabled' : ''}><kbd>${j + 1}</kbd>${esc(fill(el.o[i][0]))}</button>`).join('')}</div>
        <div class="row" style="margin-top:6px"><button class="tool" id="dSpk">🔊 ${listen ? 'Listen again' : 'Listen'}</button>${listen && !shown ? '<button class="tool" id="dShow">👁 Show text</button>' : ''}<span class="sp"></span><span class="small">${SKILLS[el.k] || ''}</span></div>`);
      $('dSpk').onclick = () => speak(listen || fill(el.ask || el.o.map(o => o[0]).join('. ')), speaker(who).voice, true);
      if ($('dShow')) $('dShow').onclick = () => { shown = true; render(msg, msgWho); };
      $('dlg').querySelectorAll('.opt').forEach(b => b.onclick = () => choose(+b.dataset.i));
      dlgPick = j => { const i = order[j]; if (i !== undefined && !wrong.has(i)) choose(i); };
    };
    const choose = async i => {
      dlgPick = null; tries++;
      const ok = i === 0, [txt, react] = el.o[i];
      record(el.k || 'CONV', fill(el.ask || listen || ''), fill(txt), fill(el.o[0][0]), ok, activity, t0);
      if (ok) {
        sfx('ok'); if (el.k === 'CONV') addPhrase(fill(txt), fill(el.ask || ''));
        if (react) { const [rw, rt] = parseLine(react, who); await line(rw, rt); }
        res(true);
      } else {
        sfx('bad'); wrong.add(i); t0 = performance.now();
        const [rw, rt] = react ? parseLine(react, who) : [who, 'Hmm, no. Try again!'];
        speak(fill(rt), speaker(rw).voice); render(fill(rt), rw);
      }
    };
    render(); if (listen) setTimeout(() => speak(listen, speaker(who).voice, true), 250);
  });
}
function addPhrase(en, ctx) { if (!S.phr.some(p => p.en === en)) { S.phr.push({ en, ctx: ctx.slice(0, 90) }); logLine('📗 New phrase in your phrasebook'); } }

/** Run a script (list of lines). who = default speaker. */
async function runScript(lines, who, q) {
  dlgCtx = { tag: q ? `${q.main ? '⭐' : '🔷'} ${q.title}` : '' };
  const act = q ? q.title : 'Conversation';
  for (const el of lines) {
    if (typeof el === 'string') { const [w, t] = parseLine(el, who); await line(w, t); }
    else if (el.ask || el.listen) await askQ(who, el, act);
    else if (el.doc) { $('dlg').classList.add('hidden'); await openDoc(el.doc); $('dlg').classList.remove('hidden'); }
    else if (el.kit) { await line(who, `Here you are: ${KIT_TXT[S.look] || KIT_TXT.Knight}`); for (const id of KITS[S.look] || KITS.Knight) addItem(id, 1); S.flags['kit_' + S.look] = true; sfx('coin'); }
    else if (el.give) { addItem(el.give[0], el.give[1]); sfx('coin'); }
    else if (el.take) removeItem(el.take[0], el.take[1]);
    else if (el.gold) { S.gold += el.gold; sfx('gold'); }
    else if (el.xp) gainXP(el.xp);
    else if (el.anim) { player.c.play(el.anim, 0.2, true); const n = npcs[who]; if (n && n.c.play) n.c.play(el.anim, 0.2, true); }
  }
  endDialog(); hudDirty = true;
}
async function say(who, text) { dlgCtx = { tag: '' }; await line(who, text); endDialog(); }
async function choice(who, text, opts) {
  return new Promise(res => {
    dlgFrame(who, `<div class="txt">${glossify(fill(text))}</div><div class="opts">${opts.map((o, j) => `<button class="opt" data-j="${j}"><kbd>${j + 1}</kbd>${esc(o)}</button>`).join('')}</div>`);
    speak(fill(text), speaker(who).voice);
    const pick = j => { dlgPick = null; sfx('click', 0.3); endDialog(); res(j); };
    $('dlg').querySelectorAll('.opt').forEach(b => b.onclick = () => pick(+b.dataset.j));
    dlgPick = j => { if (j < opts.length) pick(j); };
  });
}

// ======================= MODAL / DOCUMENTS =======================
function openModal(html, wide) { $('mbox').innerHTML = html; $('mbox').style.width = wide ? 'min(1020px,100%)' : 'min(760px,100%)'; $('modal').classList.remove('hidden'); modalOpen = true; $('mbox').scrollTop = 0; }
function closeModal() { $('modal').classList.add('hidden'); modalOpen = false; bagOpen = false;focus = null;  try { speechSynthesis.cancel(); } catch (e) { } hudDirty = true; }
$('modal').addEventListener('pointerdown', e => { if (e.target === $('modal') && !$('modal').dataset.lock) closeModal(); });
function openDoc(id) {
  const d = DOCS[id]; if (!d) return Promise.resolve();
  S.read[id] = true; save(); sfx('book');
  return new Promise(res => {
    openModal(`<h2>${d.icon} ${esc(d.title)}</h2><div class="doc">${d.text.split('\n').filter(Boolean).map(p => `<p>${glossify(p)}</p>`).join('')}</div>
      <div class="foot"><span class="small" style="flex:1;align-self:center">Tip: click an underlined word to see it in Spanish.</span><button class="btn alt" id="docSpk">🔊 Read aloud</button><button class="btn" id="docOk">Close</button></div>`);
    $('docSpk').onclick = () => speak(d.text, 'human', true);
    $('modal').dataset.lock = '1';
    $('docOk').onclick = () => { delete $('modal').dataset.lock; closeModal(); res(); };
  });
}

// ======================= XP / LEVEL =======================
function gainXP(n) {
  S.xp += n; logLine(`✨ +${n} XP`);
  while (S.xp >= xpNext()) { S.xp -= xpNext(); S.lvl++; S.hp = maxHP(); sfx('levelup', 0.7); net.updateMe(myInfo()); banner(`Level ${S.lvl}!`, 'You feel stronger. ⚔️ +1.5 attack · ❤️ +15 HP'); if (player.c) player.c.play('Cheering', 0.2, true); }
  hudDirty = true; save();
}

// ======================= QUEST ENGINE =======================
const isDone = id => S.q[id]?.st === 'done';
const isActive = id => S.q[id]?.st === 'active';
const available = q => !S.q[q.id] && (q.req || []).every(isDone);
const activeQuests = () => QUESTS.filter(q => isActive(q.id)).sort((a, b) => (b.main ? 1 : 0) - (a.main ? 1 : 0));
const stepOf = q => q.steps[S.q[q.id].step];
function checkAuto() { for (const q of QUESTS) if (q.auto && !q.intro && available(q)) startQuest(q); }
function startQuest(q) {
  S.q[q.id] = { st: 'active', step: 0, cnt: 0 };
  if (q.main || !S.track || !isActive(S.track)) S.track = q.id;
  sfx('page'); toast(`${q.main ? '⭐ Main mission' : '🔷 Side mission'}<br><span style="font-size:.7em">${esc(q.title)}</span>`, 2600);
  save(); hudDirty = true; checkSteps();
}
async function advance(q) {
  const st = S.q[q.id]; st.step++; st.cnt = 0;
  if (st.step >= q.steps.length) return complete(q);
  save(); hudDirty = true; sfx('star', 0.4);
  logLine(`📜 ${esc(stepOf(q).txt || 'New objective')}`);
  checkSteps();
}
async function complete(q) {
  S.q[q.id].st = 'done'; const r = q.reward || {};
  sfx('win'); toast(`✅ Mission complete!<br><span style="font-size:.7em">${esc(q.title)}</span>`, 2800);
  if (r.gold) { S.gold += r.gold; logLine(`🪙 +${r.gold} gold`); }
  (r.items || []).forEach(([id, n]) => addItem(id, n, false, { q: q.id === 'finale' ? 'd' : (q.main || q.giver?.startsWith('board')) ? 'e' : 'c' }));
  if (r.xp) gainXP(r.xp);
  if (S.track === q.id) S.track = null;
  if (q.id === 'finale') { S.done = true; if (world.crown) world.crown.visible = true; setTimeout(certificate, 1500); }
  checkAuto(); save(); hudDirty = true;
  if (!S.track) { const nx = activeQuests()[0]; if (nx) S.track = nx.id; }
}
/** Steps that complete by themselves (equip, go). */
let goBusy = false;
function checkSteps() {
  for (const q of activeQuests()) {
    const s = stepOf(q); if (!s) continue;
    if (s.equip && S.eq[s.equip]) { advance(q); return; }
    if (s.go && !goBusy && !busy()) { const p = PLACES[s.go]; if (Math.hypot(p.x - player.pos.x, p.z - player.pos.z) < (s.r || 8)) { goBusy = true; if (s.noArrow) record('INST', s.txt, 'Arrived', 'Arrived', true, q.title); runScript(s.say || [], 'me', q).then(() => { goBusy = false; advance(q); }); return; } }
  }
}
function onKill(type) {
  for (const q of activeQuests()) { const s = stepOf(q); if (s && s.kill === type) { const st = S.q[q.id]; st.cnt++; logLine(`⚔️ ${MONSTERS[type].name}: ${Math.min(st.cnt, s.n)}/${s.n}`); if (st.cnt >= s.n) advance(q); else { save(); hudDirty = true; } } }
}
/** Main entry when the player talks to someone. */
async function talkTo(id) {
  const n = NPCS[id], N = npcs[id];
  if (N && N.c && N.c.root && n.kind !== 'board' && n.kind !== 'tree') { N.c.root.rotation.y = Math.atan2(player.pos.x - N.pos.x, player.pos.z - N.pos.z); if (N.c.play && !n.kind) N.c.play('Waving', 0.2, true); }
  player.ry = Math.atan2(N.pos.x - player.pos.x, N.pos.z - player.pos.z);
  focus = N.pos;
  // a wrong animal (cat / dog)
  if (n.decoy && isActive(n.decoy.q)) {
    const s = stepOf(QBY[n.decoy.q]);
    if (s && s.talk && NPCS[s.talk].kind === 'animal') { record('INST', s.txt, n.name, NPCS[s.talk].name, false, QBY[n.decoy.q].title); sfx('bad'); await say('me', n.decoy.text); return; }
  }
  for (const q of activeQuests()) {
    const s = stepOf(q); if (!s) continue;
    if (s.talk === id) {
      if (s.noArrow) record('INST', s.txt, n.name, n.name, true, q.title);
      await runScript(s.say || [], id, q); await advance(q); return;
    }
    if (s.bring && s.to === id) {
      const have = count(s.bring);
      if (have >= s.n) {
        const bad = PICKS.filter(p => p.q === q.id && p.item !== s.bring && count(p.item) > 0).map(p => p.item);
        if (bad.length) { record('INST', s.txt, iname(bad[0]), iname(s.bring), false, q.title); await say(id, `Thank you... but wait! You also picked ${iname(bad[0])}. I didn't ask for that! Open your bag and drop it, please.`); }
        else if (PICKS.some(p => p.q === q.id)) record('INST', s.txt, iname(s.bring), iname(s.bring), true, q.title);
        removeItem(s.bring, s.n); await runScript(s.say || [], id, q); await advance(q);
      } else await say(id, `You have ${have} of ${s.n}: ${iname(s.bring)}. ${s.txt}`);
      return;
    }
  }
  const offer = QUESTS.find(q => q.giver === id && available(q) && q.intro);
  if (offer) {
    await runScript(offer.intro, id, offer);
    if (offer.main) startQuest(offer);
    else { dlgCtx = { tag: `🔷 ${offer.title}` }; const r = await choice(id, n.kind === 'board' ? 'Do you accept this mission?' : 'So... will you help me?', ["Yes, I'll help!", 'Not now, sorry.']); if (r === 0) startQuest(offer); }
    return;
  }
  // players who changed their style later get the starting weapons of the new style once
  if (id === 'tom' && isDone('welcome') && !S.flags['kit_' + S.look]) {
    await runScript([`Hey, you look different! A real ${{ Knight: 'knight', Ranger: 'archer', Rogue: 'rogue', Mage: 'wizard', Barbarian: 'barbarian' }[S.look] || 'hero'}! You need the right weapons for that.`, { kit: true }, 'Open your bag (I) and equip them. Good luck!'], 'tom');
    return;
  }
  if (n.upgrader) return upgradeFlow(id);
  if (n.shop) return shopFlow(id);
  if (n.kind === 'board') { const act = QUESTS.find(q => q.giver === id && isActive(q.id)); await say(id, act ? `You accepted: "${act.title}". Good luck!` : 'There are no new notices here. Come back later!'); return; }
  if (n.kind === 'animal') { await say(id, n.file === 'cat' ? 'Meow! Purrr...' : 'Woof! Woof!'); return; }
  if (n.kind === 'tree') { await say(id, 'Hmmmm... The wind tells me stories, {name}. Thank you for listening.'); return; }
  const chat = n.chat || ['Hello!'];
  N.chatI = ((N.chatI ?? -1) + 1) % chat.length;
  await say(id, chat[N.chatI]);
}

// ======================= SHOP =======================
async function shopFlow(id) {
  if (!S.flags['shop_' + id]) {
    dlgCtx = { tag: '🛒 Shop' };
    await askQ(id, { ask: 'What do you say to the shopkeeper?', k: 'CONV', o: [['Hello! Could I see what you have, please?', 'Of course! Have a look.'], ['Give me things.', 'Hmm... "please" is a magic word, you know.'], ['I am a shop.', 'You are a... shop? No, I am the shop! Ha!']] }, 'Shopping');
    endDialog(); S.flags['shop_' + id] = true; save();
  }
  openShop(id);
}
function openShop(id) {
  const list = SHOPS[id] || [], n = NPCS[id];
  const render = () => {
    const sell = S.inv.map((s, i) => ({ ...s, i })).filter(s => ITEMS[s.id].t !== 'quest');
    openModal(`<button class="btn alt x" id="xx">✕</button><h2>🛒 ${esc(n.name)}</h2><div class="small" style="margin-bottom:8px">You have <b>🪙 ${S.gold}</b> gold.</div>
    <div class="shop"><div><h3 style="margin:4px 0">Buy</h3>${list.map(k => { const it = ITEMS[k]; return `<div class="srow"><div class="ic">${icon(k)}</div><div class="nm">${esc(it.n)}<small>${statLine(it)}</small></div><button class="btn" data-b="${k}" ${S.gold < it.price ? 'disabled' : ''}>🪙 ${it.price}</button></div>`; }).join('')}</div>
    <div><h3 style="margin:4px 0">Sell</h3>${sell.length ? sell.map(s => { const it = ITEMS[s.id], p = Math.max(1, Math.floor(itemValue(s) / 2)); return `<div class="srow"><div class="ic">${icon(s.id)}</div><div class="nm" style="color:${isGear(s.id) ? QUAL[s.q].color : 'inherit'}">${esc(fullName(s))}${s.n > 1 ? ` ×${s.n}` : ''}<small>${TYPE_NAME[it.t]}</small></div><button class="btn alt" data-s="${s.i}">+🪙 ${p}</button></div>`; }).join('') : '<div class="small">Nothing to sell. (Mission items cannot be sold.)</div>'}</div></div>`, true);
    $('xx').onclick = closeModal;
    $('mbox').querySelectorAll('[data-b]').forEach(b => b.onclick = () => { const it = ITEMS[b.dataset.b]; if (S.gold < it.price) return; S.gold -= it.price; addItem(b.dataset.b, 1); sfx('gold'); render(); });
    $('mbox').querySelectorAll('[data-s]').forEach(b => b.onclick = () => { const i = +b.dataset.s, s = S.inv[i]; S.gold += Math.max(1, Math.floor(itemValue(s) / 2)); if (isGear(s.id)) S.inv.splice(i, 1); else removeItem(s.id, 1); save(); sfx('gold'); render(); });
  };
  render();
}
function qStyle(e) { e = entry(e); if (!isGear(e.id)) return ''; const c = QUAL[e.q].color; return e.q === 'c' ? '' : `border-color:${c};box-shadow:inset 0 0 12px ${c}55`; }
function statLine(it) { const a = []; if (it.atk) a.push(`⚔️ +${it.atk}`); if (it.def) a.push(`🛡️ +${it.def}`); if (it.hp) a.push(`❤️ +${it.hp}`); if (it.heal) a.push(`💗 heals ${it.heal}`); return `${TYPE_NAME[it.t]}${a.length ? ' · ' + a.join(' ') : ''}`; }


// ======================= UPGRADES (Enchanter) =======================
const LUCKY = [
  { q: 'My sword is good, but your sword is ___ than mine.', o: ['better', 'gooder', 'best'] },
  { q: 'A dragon is ___ than a cat.', o: ['bigger', 'big', 'biggest'] },
  { q: 'This is the ___ shield in the whole land!', o: ['strongest', 'stronger', 'strong'] },
  { q: 'Gold is ___ than iron.', o: ['more expensive', 'expensiver', 'most expensive'] },
  { q: 'When metal is very, very hot, it ___.', o: ['glows', 'sleeps', 'sings'] },
  { q: 'A ___ is a person who makes things with metal.', o: ['blacksmith', 'baker', 'farmer'] },
  { q: 'If something is "divine", it is ___.', o: ['very special, like magic from the gods', 'very small', 'broken'] },
  { q: 'What is the opposite of "strong"?', o: ['weak', 'tall', 'happy'] },
  { q: 'What is the opposite of "heavy"?', o: ['light', 'dark', 'long'] },
  { q: 'You wear it on your head to protect it. It is a ___.', o: ['helmet', 'glove', 'boot'] },
  { q: '"Excellent" means ___.', o: ['very, very good', 'a little bad', 'very old'] },
  { q: 'I ___ my sword every morning, so it shines.', o: ['polish', 'eat', 'plant'] },
  { q: "This armour is too ___. I can't run with it!", o: ['heavy', 'light', 'quick'] },
  { q: "The magic didn't work. It ___.", o: ['failed', 'won', 'grew'] },
  { q: 'To make something better is to ___ it.', o: ['improve', 'break', 'lose'] },
  { q: 'The stone shines in the dark. It is very ___.', o: ['bright', 'quiet', 'soft'] },
  { q: 'Ten plus two is ___.', o: ['twelve', 'twenty', 'eleven'] },
  { q: 'Which one is the sharpest?', o: ['a knife', 'a ball', 'a pillow'] },
  { q: 'A shield ___ you from arrows.', o: ['protects', 'teaches', 'cooks'] },
  { q: 'Before a battle, a good hero ___ a potion in the bag.', o: ['keeps', 'forgets', 'drinks all of'] }
];
async function upgradeFlow(id) {
  if (!S.flags['up_' + id]) {
    await runScript([
      id === 'durgan' ? 'Hmph. A visitor with a dull sword. I am Durgan. I put runes on weapons and armour to make them stronger.' : 'Welcome, traveller! I am Elara. I use magic stones to make weapons and armour stronger, and shinier!',
      'Each time I improve something, it gets +1, up to +12. And it shines more! But be careful: after +3, the magic does not always work.',
      { ask: 'How do you ask for an upgrade?', k: 'CONV', o: [['Excuse me, could you make my sword stronger, please?', 'Of course! That is what I do best.'], ['Sword. Stronger. Now.', 'Hmm... a little "please" helps the magic, you know.'], ['I want to buy a cake.', 'A cake? I am an enchanter, not a baker!']] }
    ], id);
    S.flags['up_' + id] = true; save();
  }
  openUpgrade(id);
}
let upSel = null, upLucky = 0;
function upEntry() { if (!upSel) return null; return upSel.slot ? S.eq[upSel.slot] : S.inv[upSel.i]; }
const glowOfColor = u => u <= 3 ? '#ffffff' : u <= 6 ? '#4ab8ff' : u <= 9 ? '#c070ff' : '#ffc23d';
function openUpgrade(id, msg) {
  bagOpen = true;
  const n = NPCS[id], list = [];
  for (const [k] of SLOTS) if (S.eq[k]) list.push({ slot: k, e: S.eq[k] });
  S.inv.forEach((x, i) => { if (isGear(x.id)) list.push({ i, e: x }); });
  if (upSel && !upEntry()) upSel = null;
  if (!upSel && list[0]) upSel = list[0].slot ? { slot: list[0].slot } : { i: list[0].i };
  const E = upEntry(), cost = E && upgradeCost(E);
  const row = x => { const on = upSel && (x.slot ? upSel.slot === x.slot : upSel.i === x.i); return `<div class="srow" data-sel="${x.slot ? 's:' + x.slot : 'i:' + x.i}" style="cursor:pointer;${qStyle(x.e)};${on ? 'border-color:#e09a1a;background:#fff8e0' : ''}"><div class="ic">${icon(x.e.id)}</div><div class="nm" style="color:${QUAL[entry(x.e).q].color}">${esc(fullName(x.e))}<small>${x.slot ? '✔ equipped' : 'in your bag'}</small></div></div>`; };
  let panel = '<div class="small">You have no weapons or armour to improve.</div>';
  if (E) {
    const it = ITEMS[E.id], nxt = cost ? { ...entry(E), up: E.up + 1 } : null;
    const st = ['atk', 'def', 'hp'].filter(k => it[k]).map(k => `${{ atk: '⚔️ Attack', def: '🛡️ Defence', hp: '❤️ Health' }[k]}: <b>${itemStat(E, k)}</b>${nxt ? ` ➜ <b style="color:#2ea64f">${itemStat(nxt, k)}</b>` : ''}`).join('<br>');
    if (!cost) panel = `<h3 style="color:${QUAL[entry(E).q].color}">${esc(fullName(E))}</h3><div class="detail">${st}<br><br>🌟 This item is at the maximum level (+${MAX_UP}). It can't be improved any more!</div>`;
    else {
      const have = count(cost.stone), chance = Math.min(1, cost.chance + upLucky);
      const ok = have >= cost.n && S.gold >= cost.gold;
      const lq = upLucky ? '<div class="small" style="color:#2ea64f;font-weight:900;align-self:center">🍀 Lucky bonus: +15% for this try!</div>' : cost.chance < 1 ? '<button class="btn blue" id="upQ">🍀 Answer a question for +15% luck</button>' : '';
      panel = `<h3 style="color:${QUAL[entry(E).q].color}">${esc(fullName(E))} ➜ +${cost.L}</h3>
      <div class="detail" style="min-height:0">${st}</div>
      <div class="detail" style="min-height:0">Needs: ${ITEMS[cost.stone].icon} <b>${cost.n} ${esc(ITEMS[cost.stone].n)}</b> <span class="small">(you have ${have})</span> · 🪙 <b>${cost.gold}</b> <span class="small">(you have ${S.gold})</span><br>Chance: <b style="color:${chance >= 0.85 ? '#2ea64f' : chance >= 0.6 ? '#c08000' : '#d9433b'}">${Math.round(chance * 100)}%</b>${cost.chance < 1 ? ' <span class="small">(if it fails, you lose the stone and the gold, but not the item)</span>' : ''}</div>
      <div id="upQbox"></div>
      <div class="foot" style="justify-content:flex-start">${lq}<button class="btn green" id="upGo" ${ok ? '' : 'disabled'}>✨ Upgrade!</button></div>`;
    }
  }
  const shopRows = ['sparkstone', 'moonstone'].map(k => `<div class="srow"><div class="ic">${ITEMS[k].icon}</div><div class="nm">${esc(ITEMS[k].n)}<small>you have ${count(k)}</small></div><button class="btn" data-buy="${k}" ${S.gold < ITEMS[k].price ? 'disabled' : ''}>🪙 ${ITEMS[k].price}</button></div>`).join('');
  openModal(`<button class="btn alt x" id="xx">✕</button><h2>✨ ${esc(n.name)}</h2>${msg ? `<div class="doc" style="font-family:Nunito;font-size:18px;margin-bottom:10px">${msg}</div>` : ''}
  <div class="inv"><div><div class="doll" id="doll" style="height:340px"><canvas id="pv"></canvas><div id="upFx" style="position:absolute;inset:0;border-radius:14px;pointer-events:none;opacity:0;transition:opacity .5s"></div></div>
  <div class="stats"><span>⚔️ ${atk()}</span><span>🛡️ ${def()}</span><span>❤️ ${maxHP()}</span><span>🪙 ${S.gold}</span></div>
  <h3 style="margin:10px 0 4px">Magic stones</h3>${shopRows}<div class="small">🌟 Starstones (+10 to +12) only come from bosses 👑.</div></div>
  <div><div style="max-height:210px;overflow:auto;margin-bottom:8px">${list.map(row).join('')}</div>${panel}</div></div>`, true);
  $('xx').onclick = closeModal;
  ensurePreview($('pv'));
  $('mbox').querySelectorAll('[data-sel]').forEach(b => b.onclick = () => { const [t, v] = b.dataset.sel.split(':'); upSel = t === 's' ? { slot: v } : { i: +v }; upLucky = 0; sfx('click', 0.3); openUpgrade(id); });
  $('mbox').querySelectorAll('[data-buy]').forEach(b => b.onclick = () => { const k = b.dataset.buy; if (S.gold < ITEMS[k].price) return; S.gold -= ITEMS[k].price; addItem(k, 1, true); sfx('gold'); openUpgrade(id); });
  if ($('upQ')) $('upQ').onclick = () => {
    const L = LUCKY[Math.floor(Math.random() * LUCKY.length)], order = [0, 1, 2].sort(() => Math.random() - 0.5), t0 = performance.now();
    $('upQ').remove();
    $('upQbox').innerHTML = `<div class="detail" style="min-height:0"><b>${glossify(L.q)}</b><div style="display:grid;gap:6px;margin-top:6px">${order.map(i => `<button class="btn alt" style="text-align:left" data-a="${i}">${esc(L.o[i])}</button>`).join('')}</div></div>`;
    speak(L.q.replace('___', 'blank'), 'human');
    $('upQbox').querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const ok = b.dataset.a === '0'; record('VOC', L.q, L.o[+b.dataset.a], L.o[0], ok, 'Enchanter: lucky question', t0);
      if (ok) { upLucky = 0.15; sfx('ok'); openUpgrade(id, `🍀 Correct! "${esc(L.o[0])}". Your luck is better for this try.`); }
      else { sfx('bad'); openUpgrade(id, `Not quite. The answer was "<b>${esc(L.o[0])}</b>". No bonus this time.`); }
    });
  };
  if ($('upGo')) $('upGo').onclick = () => {
    const E2 = upEntry(), c2 = upgradeCost(E2); if (!c2 || count(c2.stone) < c2.n || S.gold < c2.gold) return;
    $('upGo').disabled = true;
    removeItem(c2.stone, c2.n); S.gold -= c2.gold;
    const win = Math.random() < Math.min(1, c2.chance + upLucky); upLucky = 0;
    const fx = $('upFx');
    if (win) {
      E2.up++; sfx('levelup', 0.7);
      fx.style.background = `radial-gradient(circle, ${glowOfColor(E2.up)}dd, transparent 70%)`; fx.style.opacity = 1;
      if (upSel.slot) { refreshEquip(); if (player.c) player.c.play('Cheering', 0.2, true); }
      save(); hudDirty = true;
      setTimeout(() => openUpgrade(id, `✨ <b>Success!</b> Your ${esc(fullName(E2))} is stronger now. ${E2.up >= 10 ? 'It shines like the sun!' : E2.up >= 7 ? 'Look how it sparkles!' : E2.up >= 4 ? 'It glows blue now!' : 'It is shining!'}${upSel.slot ? '' : ' (Equip it to see it shine on your hero.)'}`), 900);
    } else {
      sfx('bad'); fx.style.background = 'radial-gradient(circle, #33333399, transparent 70%)'; fx.style.opacity = 1; save(); hudDirty = true;
      setTimeout(() => openUpgrade(id, `💨 Oh no... the magic failed. Your ${esc(fullName(E2))} is still +${E2.up}. Don't give up, try again!`), 700);
    }
  };
}

// ======================= ICONS (3D thumbnails) =======================
const THUMB = {};
function icon(id) { const it = ITEMS[id]; return THUMB[id] ? `<img src="${THUMB[id]}" alt="">` : `<span>${it.icon}</span>`; }
async function makeThumbs() {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); r.setSize(128, 128); r.outputColorSpace = THREE.SRGBColorSpace;
  const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight('#ffffff', '#886644', 2)); const dl = new THREE.DirectionalLight('#fff', 2); dl.position.set(2, 3, 4); sc.add(dl);
  const cm = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
  for (const [id, it] of Object.entries(ITEMS)) {
    if (!it.model) continue;
    const g = await load(`assets/items/${it.model}.gltf`); if (!g) continue;
    const o = g.scene.clone(true); if (it.tint) o.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.lerp(new THREE.Color(it.tint), it.tintK ?? 0.5); } });
    const piv = new THREE.Group(); piv.add(o); sc.add(piv);
    const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()), sz = b.getSize(new THREE.Vector3()).length();
    o.position.sub(c); piv.rotation.set(0.3, 0.7, it.t === 'weapon' ? -0.6 : 0);
    cm.position.set(0, 0, sz * 1.9); cm.lookAt(0, 0, 0); r.render(sc, cm);
    THUMB[id] = r.domElement.toDataURL(); sc.remove(piv);
  }
  r.dispose(); r.forceContextLoss();
}

// ======================= INVENTORY (with 3D hero) =======================
const preview = { r: null, sc: null, cam: null, c: null, yaw: 0.4, key: '' };
let bagOpen = false, bagSel = -1, bagSlot = null;
async function ensurePreview(canvas) {
  if (!preview.r) {
    preview.sc = new THREE.Scene();
    preview.sc.add(new THREE.HemisphereLight('#fff', '#a08060', 1.6)); const d = new THREE.DirectionalLight('#fff4e0', 2.2); d.position.set(2, 4, 3); preview.sc.add(d);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.4, 0.15, 32), M('#c9a46a')); disc.position.y = -0.08; preview.sc.add(disc);
    preview.cam = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  }
  // one renderer for the whole game: its canvas moves into each window (browsers allow only a few 3D canvases)
  if (!preview.r) {
    preview.r = new THREE.WebGLRenderer({ antialias: true, alpha: true }); preview.r.setPixelRatio(Math.min(devicePixelRatio, 2));
    preview.r.toneMapping = THREE.ACESFilmicToneMapping;
    const cv = preview.r.domElement; cv.style.width = '100%'; cv.style.height = '100%'; cv.style.borderRadius = '14px'; cv.style.cursor = 'grab';
    let drag = null;
    cv.onpointerdown = e => { drag = e.clientX; cv.setPointerCapture(e.pointerId); };
    cv.onpointermove = e => { if (drag !== null) { preview.yaw += (e.clientX - drag) * 0.012; drag = e.clientX; } };
    cv.onpointerup = () => drag = null;
  }
  if (canvas !== preview.r.domElement) { canvas.replaceWith(preview.r.domElement); canvas = preview.r.domElement; }
  const key = S.look + S.race;
  if (preview.key !== key) { if (preview.c) preview.sc.remove(preview.c.root); preview.c = await makeChar(S.look, { race: S.race, strip: true }); preview.sc.add(preview.c.root); preview.key = key; }
  await applyEquip(preview.c, S.eq);
  const w = canvas.clientWidth || 300, h = canvas.clientHeight || 400; preview.r.setSize(w, h, false); preview.cam.aspect = w / h; preview.cam.updateProjectionMatrix();
}
function renderPreview(dt) {
  if (!bagOpen || !preview.r || !preview.c) return;
  preview.c.mixer.update(dt); if (performance.now() > preview.c.lockUntil) preview.c.play('Idle_A', 0.3);
  const d = 6.2; preview.cam.position.set(Math.sin(preview.yaw) * d, 2.1, Math.cos(preview.yaw) * d); preview.cam.lookAt(0, 1.15, 0);
  preview.r.render(preview.sc, preview.cam);
}
const SLOT_POS = { head: 'left:8px;top:10px', cape: 'right:8px;top:10px', body: 'left:8px;top:150px', weapon: 'left:8px;bottom:12px', off: 'right:8px;bottom:12px' };
function openBag() {
  if (mode !== 'play' || dlgOpen) return;
  bagOpen = true;
  const cells = []; for (let i = 0; i < Math.max(30, S.inv.length); i++) { const s = S.inv[i]; cells.push(s ? `<div class="cell ${ITEMS[s.id].t === 'quest' ? 'q' : ''} ${i === bagSel ? 'sel' : ''}" data-i="${i}" draggable="true" title="${esc(fullName(s))}" style="${qStyle(s)}">${icon(s.id)}${s.up ? `<i class="up">+${s.up}</i>` : ''}${s.n > 1 ? `<b>${s.n}</b>` : ''}</div>` : `<div class="cell empty"></div>`); }
  openModal(`<button class="btn alt x" id="xx">✕</button><h2>🎒 Your bag</h2>
  <div class="inv"><div><div class="doll" id="doll"><canvas id="pv"></canvas>${SLOTS.map(([k, n, ic]) => `<div class="slot ${S.eq[k] ? 'full' : ''}" data-slot="${k}" style="${SLOT_POS[k]};${S.eq[k] ? qStyle(S.eq[k]) : ''}">${S.eq[k] ? icon(S.eq[k].id) + (S.eq[k].up ? `<i class="up">+${S.eq[k].up}</i>` : '') : ic}<small>${n}</small></div>`).join('')}</div>
   <div class="stats"><span>❤️ ${Math.ceil(S.hp)}/${maxHP()}</span><span>⚔️ ${atk()}</span><span>🛡️ ${def()}</span><span>🪙 ${S.gold}</span></div><div class="small" style="text-align:center;margin-top:4px">Drag the hero to turn around.</div></div>
   <div><div class="grid" id="grid">${cells.join('')}</div><div id="det" class="detail"></div>
   <div id="dropZone" class="detail" style="min-height:0;text-align:center;font-weight:900;border-style:dashed;color:#8d2620">🗑 Drag an item here to drop it on the ground</div></div></div>`, true);
  $('xx').onclick = closeModal;
  ensurePreview($('pv'));
  $('grid').querySelectorAll('.cell[data-i]').forEach(c => {
    c.onclick = () => { bagSel = +c.dataset.i; bagSlot = null; $('grid').querySelectorAll('.cell').forEach(x => x.classList.toggle('sel', x === c)); showDetail(); };
    c.ondblclick = () => { bagSel = +c.dataset.i; const it = ITEMS[S.inv[bagSel].id]; if (it.t === 'use') useItem(bagSel); else equipFromInv(bagSel); bagSel = -1; openBag(); };
    c.ondragstart = e => e.dataTransfer.setData('text', c.dataset.i);
  });
  $('mbox').querySelectorAll('.slot').forEach(s => { s.onclick = () => { bagSlot = s.dataset.slot; bagSel = -1; showDetail(); }; });
  const doll = $('doll'), dz = $('dropZone');
  doll.ondragover = dz.ondragover = e => e.preventDefault();
  doll.ondrop = e => { e.preventDefault(); const i = +e.dataTransfer.getData('text'); const it = ITEMS[S.inv[i]?.id]; if (it && SLOTS.some(s => s[0] === it.t)) { equipFromInv(i); bagSel = -1; openBag(); } };
  dz.ondrop = e => { e.preventDefault(); const i = +e.dataTransfer.getData('text'); const s = S.inv[i]; if (s && dropItem(i, s.n)) { bagSel = -1; openBag(); } };
  showDetail();
}
function showDetail() {
  const el = $('det'); if (!el) return;
  let id = null, eqd = false, E = null;
  if (bagSlot && S.eq[bagSlot]) { E = S.eq[bagSlot]; id = E.id; eqd = true; } else if (bagSel >= 0 && S.inv[bagSel]) { E = S.inv[bagSel]; id = E.id; }
  if (!id) { el.innerHTML = `<div class="small">Click an item to see it. Double-click to equip or use it. Your bag has ${S.inv.length} things.</div>`; return; }
  const it = ITEMS[id], s = S.inv[bagSel];
  const b = [];
  if (eqd) b.push(`<button class="btn alt" id="dUn">Take off</button>`);
  else {
    if (SLOTS.some(x => x[0] === it.t)) b.push(`<button class="btn green" id="dEq">Equip</button>`);
    if (it.t === 'use') b.push(`<button class="btn green" id="dUse">Use</button>`);
    if (it.doc) b.push(`<button class="btn blue" id="dRead">📖 Read</button>`);
    if (!NODROP.has(id)) { b.push(`<button class="btn red" id="dDrop">Drop</button>`); if (s.n > 1) b.push(`<button class="btn red" id="dDropAll">Drop all (${s.n})</button>`); }
  }
  const gearIt = isGear(id), cur = gearIt && !eqd && S.eq[it.t];
  const cmp = k => { if (!cur) return ''; const d = itemStat(E, k) - itemStat(cur, k); return d ? ` <b style="color:${d > 0 ? '#2ea64f' : '#d9433b'}">(${d > 0 ? '+' : ''}${d})</b>` : ''; };
  const stats = gearIt ? ['atk', 'def', 'hp'].filter(k => itemStat(E, k) || (cur && itemStat(cur, k))).map(k => `${{ atk: '⚔️', def: '🛡️', hp: '❤️' }[k]} ${itemStat(E, k)}${cmp(k)}`).join(' · ') : '';
  el.innerHTML = `<h3 style="color:${gearIt ? QUAL[entry(E).q].color : 'inherit'}">${it.icon} ${esc(gearIt ? fullName(E) : it.n)}${eqd ? ' <span class="small">(equipped)</span>' : ''}</h3><div class="tags">${gearIt ? `${TYPE_NAME[it.t]} · ${QUAL[entry(E).q].name} · ${stats}${cur ? ' <span class="small">vs. what you wear</span>' : ''}` : statLine(it)}${it.price && it.t !== 'quest' ? ` · worth 🪙 ${itemValue(E)}` : ''}</div><div>${glossify(it.d)}</div><div class="foot" style="margin-top:8px">${b.join('')}</div>`;
  const on = (k, f) => { if ($(k)) $(k).onclick = f; };
  on('dUn', () => { unequip(bagSlot); bagSlot = null; openBag(); });
  on('dEq', () => { equipFromInv(bagSel); bagSel = -1; openBag(); });
  on('dUse', () => { useItem(bagSel); if (!S.inv[bagSel] || S.inv[bagSel].id !== id) bagSel = -1; openBag(); });
  on('dRead', async () => { closeModal(); await openDoc(it.doc); openBag(); });
  on('dDrop', () => { if (dropItem(bagSel, 1)) { if (!S.inv[bagSel] || S.inv[bagSel].id !== id) bagSel = -1; openBag(); } });
  on('dDropAll', () => { if (dropItem(bagSel, s.n)) { bagSel = -1; openBag(); } });
}

// ======================= GROUND ITEMS / PICKS =======================
function emojiSprite(e, size = 1) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 96; const c = cv.getContext('2d'); c.font = '72px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, 48, 54);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true })); s.scale.setScalar(size); return s;
}
function lootMesh(id) {
  const g = new THREE.Group();
  const sack = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), M('#a0703a')); sack.scale.y = 0.8; sack.position.y = 0.25; sack.castShadow = true;
  const tie = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 0.18, 6), M('#7a5230')); tie.position.y = 0.55;
  const sp = emojiSprite(ITEMS[id].icon, 0.7); sp.position.y = 1.15;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 6, 20), new THREE.MeshBasicMaterial({ color: '#ffd468' })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.05;
  g.add(sack, tie, sp, ring); g.userData.sp = sp; return g;
}
function spawnGround(id, n, p, extra) {
  const m = lootMesh(id); m.position.set(p.x, H(p.x, p.z), p.z); scene.add(m);
  groundItems.push({ id, n, extra, mesh: m, pos: m.position, t0: performance.now() });
  if (extra && extra.q && extra.q !== 'c') m.children.forEach(o => { if (o.geometry && o.geometry.type === 'TorusGeometry') o.material = new THREE.MeshBasicMaterial({ color: QUAL[extra.q].color }); });
}
function pickGround(g) {
  scene.remove(g.mesh); groundItems.splice(groundItems.indexOf(g), 1);
  addItem(g.id, g.n, false, g.extra); sfx('coin'); player.c.play('PickUp', 0.1, true);
}
const PICKMODEL = { pumpkin: 'hw/pumpkin_orange', yellow_pumpkin: 'hw/pumpkin_yellow', iron_ore: 'rb/Iron_Nugget_Large', caravan_box: 'dg/box_small_decorated', lost_hammer: null, cheese: null, water_bucket: 'hx/bucket_water' };
function pickMesh(item) {
  const g = new THREE.Group(), it = ITEMS[item];
  const flower = (col) => { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 4), M('#3f9a3a')); st.position.y = 0.3; g.add(st); for (let k = 0; k < 6; k++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 4), M(col, { emissive: col, emissiveIntensity: 0.6 })); const a = k / 6 * 6.28; p.position.set(Math.cos(a) * 0.15, 0.62, Math.sin(a) * 0.15); p.scale.y = 0.4; g.add(p); } };
  const mush = (cap, spots) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.3, 6), M('#f3ead8')); s.position.y = 0.15; const c = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 6, 0, 6.28, 0, Math.PI / 2), M(cap)); c.position.y = 0.28; g.add(s, c); if (spots) for (let k = 0; k < 5; k++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.045, 5, 4), M('#ffffff')); const a = k / 5 * 6.28; d.position.set(Math.cos(a) * 0.16, 0.42, Math.sin(a) * 0.16); g.add(d); } };
  if (item === 'moonflower') flower('#4ab8ff'); else if (item === 'nightshade') flower('#9a3ad0');
  else if (item === 'spotted_mushroom') mush('#d9302a', true); else if (item === 'brown_mushroom') mush('#8a5a2b', false);
  else if (item === 'egg') { const e = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), M('#f3e3c8')); e.scale.y = 1.3; e.position.y = 0.2; g.add(e); }
  else if (item === 'diary_page') { const p = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.02, 0.6), M('#fff8e0', { emissive: '#fff0b0', emissiveIntensity: 0.3 })); p.position.y = 0.05; p.rotation.y = 0.4; g.add(p); }
  else if (item === 'sand_glass') { const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.22), M('#ff9a3a', { emissive: '#ff7a1a', emissiveIntensity: 0.5 })); c.position.y = 0.25; g.add(c); }
  else if (item === 'lost_arrow') { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1, 4), M('#a0703a')); a.rotation.z = 1.3; a.position.y = 0.3; const f = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 4), M('#3fbf5a')); f.position.set(0.48, 0.42, 0); g.add(a, f); }
  else if (PICKMODEL[item]) prop(PICKMODEL[item], 0, 0, item.includes('pumpkin') ? 0.7 : 0.5, { parent: g, y: 0, ry: 0 });
  else { const s = emojiSprite(it.icon, 0.7); s.position.y = 0.5; g.add(s); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 6, 20), new THREE.MeshBasicMaterial({ color: '#7fe0ff', transparent: true, opacity: 0.8 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.04; g.add(ring);
  shadowize(g); return g;
}
function buildPicks() {
  PICKS.forEach((p, k) => {
    for (let i = 0; i < p.n; i++) {
      let x, z;
      if (p.ring) { const a = i / p.n * Math.PI * 2; x = p.x + Math.cos(a) * p.ring; z = p.z + Math.sin(a) * p.ring; }
      else { const a = (i * 2.399 + k * 1.3), d = p.r * Math.sqrt((i + 0.5) / p.n); x = p.x + Math.cos(a) * d; z = p.z + Math.sin(a) * d; }
      const m = pickMesh(p.item); m.position.set(x, H(x, z), z); m.visible = false; scene.add(m);
      picks.push({ p, item: p.item, mesh: m, pos: m.position, taken: false });
    }
  });
}
function refreshPicks() {
  for (const k of picks) k.mesh.visible = isActive(k.p.q) && !k.taken;
  // if a mission still needs items but all were taken (dropped, eaten…), bring them back
  for (const q of activeQuests()) { const s = stepOf(q); if (!s || !s.bring) continue; const mine = picks.filter(k => k.p.q === q.id && k.item === s.bring); if (mine.length && mine.every(k => k.taken) && count(s.bring) < s.n) mine.forEach(k => k.taken = false); }
}
function takePick(k) {
  k.taken = true; k.mesh.visible = false; addItem(k.item, 1); sfx('coin'); player.c.play('PickUp', 0.1, true);
}

// ======================= NPCs =======================
function markSprite(t, col) { const s = label(t, col, 60, 2.4); s.visible = false; return s; }
async function setupNPCs() {
  for (const [id, n] of Object.entries(NPCS)) {
    const y = H(n.x, n.z), pos = new THREE.Vector3(n.x, y, n.z);
    let c, h = 3.0;
    if (n.kind === 'animal') {
      c = await makeAnimal(n.file, n.file === 'cat' ? 0.75 : 1.1, n.tint);
      const b = new THREE.Box3().setFromObject(c.root), sz = b.getSize(new THREE.Vector3());
      if (n.ribbon) { const r = new THREE.Mesh(new THREE.TorusGeometry(sz.x * 0.28, 0.05, 6, 14), M('#e8322f')); r.position.set(0, sz.y * 0.62, sz.z * 0.28); c.root.add(r); }
      if (n.paws) for (const [a, bb] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 4), M('#ffffff')); p.position.set(a * sz.x * 0.28, 0.05, bb * sz.z * 0.33); c.root.add(p); }
      if (n.whiteEar) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 5), M('#ffffff')); e.position.set(sz.x * 0.18, sz.y * 1.0, sz.z * 0.35); c.root.add(e); }
      h = 1.6; c.root.rotation.y = Math.random() * 6;
    } else if (n.kind === 'tree') {
      c = { root: new THREE.Group() }; await prop('fo/Tree_4_B_Color1', 0, 0, 13, { parent: c.root, y: 0, ry: 0 });
      for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), M('#fff')); e.position.set(s * 0.45, 3.2, 0.95); const p = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5), M('#2a1a0a')); p.position.set(s * 0.45, 3.2, 1.18); c.root.add(e, p); }
      const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.08, 6, 12, Math.PI), M('#3a2410')); mouth.position.set(0, 2.5, 1.05); mouth.rotation.z = Math.PI; c.root.add(mouth);
      c.root.rotation.y = Math.atan2(-n.x, -175 - n.z); colliders.push({ x: n.x, z: n.z, r: 1.4 }); h = 7;
    } else if (n.kind === 'board') {
      c = { root: noticeBoard(n.x, n.z) }; h = 3.4; pos.y = 0;
    } else {
      c = await makeChar(n.model, { race: n.race === 'bone' ? null : n.race, tint: n.tint, tintK: 0.45, scale: n.scale });
      if (n.hold) await holdItems(c, n.hold[0], n.hold[1]);
      c.root.rotation.y = Math.atan2(REALMS[realmAt(n.x, n.z)].town.x - n.x, REALMS[realmAt(n.x, n.z)].town.z - n.z);
      h = 2.9 * (n.scale || 1) * (n.race === 'dwarf' ? 0.85 : 1);
      colliders.push({ x: n.x, z: n.z, r: 0.6 });
    }
    if (n.kind !== 'board') { c.root.position.copy(pos); scene.add(c.root); }
    const holder = new THREE.Group(); holder.position.set(n.x, y + h, n.z); scene.add(holder);
    if (n.kind !== 'animal') { const lb = label(n.name, n.kind === 'board' ? '#ffe7a8' : '#ffffff', 28, 3); holder.add(lb); }
    const mMain = markSprite('!', '#ffc23d'), mSide = markSprite('!', '#45b8ff'), mQ = markSprite('?', '#ffc23d'), mQs = markSprite('?', '#45b8ff');
    [mMain, mSide, mQ, mQs].forEach(m => { m.position.y = 0.75; holder.add(m); });
    npcs[id] = { c, pos, def: n, marks: { mMain, mSide, mQ, mQs }, holder };
  }
}
function refreshMarks() {
  const want = {}; // id -> 'main'|'side'|'qm'|'qs'
  for (const q of activeQuests()) { const s = stepOf(q); if (!s) continue; let t = s.talk || (s.bring && count(s.bring) >= s.n ? s.to : null); if (t && !s.noArrow && !want[t]) want[t] = q.main ? 'qm' : 'qs'; }
  for (const q of QUESTS) if (q.giver && q.intro && available(q) && !want[q.giver]) want[q.giver] = q.main ? 'main' : 'side';
  for (const [id, N] of Object.entries(npcs)) { const w = want[id]; N.marks.mMain.visible = w === 'main'; N.marks.mSide.visible = w === 'side'; N.marks.mQ.visible = w === 'qm'; N.marks.mQs.visible = w === 'qs'; N.want = w; }
  refreshPicks();
  world.lanterns.forEach((l, i) => l.set(S.lit.includes(i)));
  world.portals.forEach(P => { const on = S.portals.includes(P.def.id); if (P.on !== on) P.set(on); });
  if (world.crown) { world.crown.visible = !!S.done; world.crown.userData.light.intensity = S.done ? 25 : 0; }
}

// ======================= MONSTERS =======================
// ---------- bosses: every kind of monster has a big, strong boss ----------
const ELITE_NAMES = { slime: 'King Slime', blue_slime: 'Frost Slime King', wolf: 'Old Greyfang', minion: 'Skeleton Overseer', sand_slime: 'Dune Slime Lord', bandit: 'Bandit Captain', sk_rogue: 'Raider Chief', warrior: 'Bone General', sk_mage: 'Grave Sorcerer' };
const ELITE_ZONE = {};   // the first zone of each monster kind also has its boss
ZONES.forEach((z, i) => { if (!z.q && ELITE_NAMES[z.m] && ELITE_ZONE[z.m] === undefined) ELITE_ZONE[z.m] = i; });
function eliteDef(type) {
  const b = MONSTERS[type];
  return { ...b, name: ELITE_NAMES[type], elite: true, hp: b.hp * 5, atk: Math.round(b.atk * 1.6), xp: b.xp * 6, lvl: b.lvl + 2, gold: [b.gold[0] * 6, b.gold[1] * 8],
    size: b.size ? b.size * 1.7 : undefined, h: b.h ? b.h * 1.6 : undefined, scale: b.kind === 'char' ? (b.scale || 1) * 1.55 : undefined };
}
function rollQuality(elite) { const r = Math.random(); return elite ? (r < 0.3 ? 'd' : r < 0.85 ? 'e' : 'c') : (r < 0.03 ? 'd' : r < 0.2 ? 'e' : 'c'); }
function monLabel(m) {
  const cv = m.lcv || (m.lcv = document.createElement('canvas')); cv.width = 256; cv.height = 64; const c = cv.getContext('2d'); c.clearRect(0, 0, 256, 64);
  c.font = '800 22px Nunito, sans-serif'; c.textAlign = 'center'; c.lineWidth = 5; c.strokeStyle = 'rgba(0,0,0,.7)';
  const t = `${m.d.elite ? '👑 ' : ''}${m.d.name} · Lv ${m.d.lvl}`; c.strokeText(t, 128, 24); c.fillStyle = m.d.elite ? '#ffd23a' : m.d.boss ? '#e0b0ff' : (m.d.lvl > S.lvl + 2 ? '#ff7a6a' : '#ffffff'); c.fillText(t, 128, 24);
  c.fillStyle = 'rgba(0,0,0,.6)'; c.fillRect(48, 36, 160, 12); c.fillStyle = '#e2453a'; c.fillRect(50, 38, 156 * Math.max(0, m.hp / m.d.hp), 8);
  if (!m.lab) { const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; m.lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true })); m.lab.scale.set(2.6, 0.65, 1); m.lab.renderOrder = 9; scene.add(m.lab); }
  else m.lab.material.map.needsUpdate = true;
}
async function createMonster(zi, elite) {
  const z = ZONES[zi], d = elite ? eliteDef(z.m) : MONSTERS[z.m];
  let c;
  if (d.kind === 'slime') c = makeSlime(d.color, d.size);
  else if (d.kind === 'animal') c = await makeAnimal(d.file, d.h, d.tint);
  else { c = await makeChar(d.model, { tint: d.tint, tintK: 0.5 }); if (d.hold) await holdItems(c, d.hold[0], d.hold[1]); if (d.scale) c.root.scale.setScalar(d.scale); }
  const m = { d, type: z.m, zi, c, home: new THREE.Vector3(z.x, 0, z.z), pos: new THREE.Vector3(), hp: d.hp, state: 'idle', t: 0, cd: 0, wander: null, scale: d.scale || (d.kind === 'slime' ? d.size : d.h ? d.h / 1.3 : 1), dead: false, deadT: 0 };
  if (elite) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.07, 6, 28), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.85 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = 0.08; c.root.add(ring); m.ring = ring;
    c.root.traverse(o => { if (o.isMesh && o !== ring && o.material && o.material.emissive) { o.material = o.material.clone(); o.material.emissive = new THREE.Color('#ffb020'); o.material.emissiveIntensity = 0.12; } });
  }
  placeMonster(m); scene.add(c.root); monLabel(m); monsters.push(m);
  return m;
}
function placeMonster(m) {
  const z = ZONES[m.zi]; const a = Math.random() * 6.28, r = Math.random() * z.r;
  m.pos.set(z.x + Math.cos(a) * r, 0, z.z + Math.sin(a) * r); m.pos.y = H(m.pos.x, m.pos.z);
  m.hp = m.d.hp; m.hitByMe = false; m.dead = false; m.deadT = 0; m.state = 'idle'; m.cd = 0; m.windup = undefined; m.c.root.visible = true; m.c.root.position.copy(m.pos);
  if (m.d.kind === 'slime') m.c.root.scale.setScalar(m.scale * 1.3); else if (m.d.kind === 'animal') m.c.root.rotation.z = 0;
  if (m.c.mixer) { m.c.mixer.stopAllAction(); m.c.cur = null; m.c.lockUntil = 0; }
  if (m.c.play) m.c.play('Idle_A', 0);
  if (m.lab) { m.lab.visible = true; monLabel(m); }
}
function zoneOn(z) { if (!z.q) return true; return isActive(z.q) && S.q[z.q].step === z.step; }
function updateZones() {
  ZONES.forEach((z, i) => {
    const zs = zoneState[i], d = Math.hypot(z.x - player.pos.x, z.z - player.pos.z);
    const on = zoneOn(z);
    if (!zs.spawned && on && d < 85) { zs.spawned = true; for (let k = 0; k < z.n; k++) createMonster(i).then(m => zs.mons.push(m)); if (ELITE_ZONE[z.m] === i) createMonster(i, true).then(m => zs.mons.push(m)); }
    for (const m of zs.mons) { const vis = on && d < 120 && !(m.dead && m.deadT > 2.5); m.c.root.visible = vis; if (m.lab) m.lab.visible = vis && !m.dead && m.pos.distanceTo(player.pos) < 40; m.active = on && d < 120; }
  });
}
const RANGE = { slime: 1.5, animal: 2, char: 2.1 };
function updateMonsters(dt, t) {
  const pp = player.pos; let boss = null;
  for (const m of monsters) {
    if (!m.active) continue;
    const c = m.c, dx = pp.x - m.pos.x, dz = pp.z - m.pos.z, dist = Math.hypot(dx, dz);
    if (m.dead) {
      m.deadT += dt;
      if (m.d.kind === 'slime') { const k = Math.max(0, 1 - m.deadT * 2); c.root.scale.setScalar(m.scale * 1.3 * k + 0.001); }
      if (!m.d.boss && m.deadT > (m.d.elite ? 150 : 45) && dist > 30) placeMonster(m);
      if (c.mixer) c.mixer.update(dt);
      continue;
    }
    const frozen = busy() || player.dead;
    const reach = (RANGE[m.d.kind] || 2) * Math.max(1, m.scale * 0.8);
    const aggro = m.d.boss ? 18 : m.d.elite ? 14 : 11;
    if (m.state === 'idle' && dist < aggro && !frozen) { m.state = 'chase'; if (c.play && m.d.kind === 'char' && /Skeleton/.test(m.d.model)) c.play('Skeletons_Taunt', 0.2, true); }
    if (m.state === 'chase' && (Math.hypot(m.pos.x - m.home.x, m.pos.z - m.home.z) > ZONES[m.zi].r + 30 || player.dead)) m.state = 'return';
    let moving = false, speed = m.d.kind === 'slime' ? 3 : m.d.kind === 'animal' ? 5.5 : m.d.boss ? 3.6 : 4;
    const now = performance.now();
    if (m.state === 'chase' && !frozen) {
      if (m.d.boss || m.d.elite) boss = m;
      const face = Math.atan2(dx, dz);
      if (m.d.ranged && dist < 18 && dist > 6) {
        c.root.rotation.y = face; m.cd -= dt;
        if (m.cd <= 0) { m.cd = m.d.boss ? 1.8 : 2.6; if (c.play) c.play('Ranged_Magic_Shoot', 0.1, true); setTimeout(() => { if (!m.dead) shoot(m.pos.clone().add(new THREE.Vector3(0, 1.6 * m.scale, 0)), pp.clone().add(new THREE.Vector3(0, 1.2, 0)), 'enemy', m.d.atk, '#b070ff'); }, 350); }
        if (m.d.summon && !m.summoned2 && m.hp < m.d.hp * 0.66) { m.summoned2 = true; summon(m); }
        if (m.d.summon && !m.summoned3 && m.hp < m.d.hp * 0.33) { m.summoned3 = true; summon(m); }
      } else if (dist > reach) {
        moving = true; m.pos.x += dx / dist * speed * dt; m.pos.z += dz / dist * speed * dt; c.root.rotation.y = face;
      } else {
        c.root.rotation.y = face; m.cd -= dt;
        if (m.cd <= 0) {
          m.cd = m.d.boss ? 1.4 : 1.7;
          if (c.play) c.play(m.d.kind === 'animal' ? 'Attack' : m.d.model && m.hold2 ? 'Melee_2H_Attack_Chop' : 'Melee_1H_Attack_Chop', 0.1, true);
          m.windup = 0.4;
        }
      }
      if (m.windup !== undefined && m.windup > 0) { m.windup -= dt; if (m.windup <= 0) { if (dist < reach + 1) hurtPlayer(m.d.atk, m); if (m.d.kind === 'slime') m.hop = 0.3; } }
    } else if (m.state === 'return') {
      const hx = m.home.x - m.pos.x, hz = m.home.z - m.pos.z, hd = Math.hypot(hx, hz);
      if (hd < 2) { m.state = 'idle'; m.hp = m.d.hp; monLabel(m); } else { moving = true; m.pos.x += hx / hd * speed * dt; m.pos.z += hz / hd * speed * dt; c.root.rotation.y = Math.atan2(hx, hz); }
    } else if (m.state === 'idle') {
      m.t -= dt;
      if (m.t <= 0) { m.t = 3 + Math.random() * 5; const a = Math.random() * 6.28, r = Math.random() * ZONES[m.zi].r; m.wander = Math.random() < 0.6 ? new THREE.Vector3(m.home.x + Math.cos(a) * r, 0, m.home.z + Math.sin(a) * r) : null; }
      if (m.wander) { const wx = m.wander.x - m.pos.x, wz = m.wander.z - m.pos.z, wd = Math.hypot(wx, wz); if (wd > 0.5) { moving = true; speed *= 0.35; m.pos.x += wx / wd * speed * dt; m.pos.z += wz / wd * speed * dt; c.root.rotation.y = Math.atan2(wx, wz); } else m.wander = null; }
    }
    // keep away from the player body
    if (dist < 1.1 * Math.max(1, m.scale)) { m.pos.x -= dx / dist * 0.05; m.pos.z -= dz / dist * 0.05; }
    m.pos.y = H(m.pos.x, m.pos.z); c.root.position.copy(m.pos);
    if (m.d.kind === 'slime') { const hop = moving ? Math.abs(Math.sin(t * 9 + m.zi)) * 0.45 : Math.abs(Math.sin(t * 2 + m.zi)) * 0.06; c.body.position.y = hop; c.body.scale.set(1 + (moving ? 0 : 0.04), 1 - hop * 0.3, 1); }
    else if (c.play && now > c.lockUntil) c.play(moving ? (m.state === 'chase' ? 'Running_A' : 'Walking_A') : (m.d.boss || m.state === 'chase' ? 'Idle_B' : 'Idle_A'), 0.25);
    if (c.mixer && dist < 70) c.mixer.update(dt);
    if (m.lab) m.lab.position.set(m.pos.x, m.pos.y + (m.d.kind === 'slime' ? 1.7 * m.scale : m.d.kind === 'animal' ? m.d.h * 1.2 + 0.6 : 3.1 * m.scale), m.pos.z);
  }
  const bb = $('bossbar');
  if (boss) { bb.classList.remove('hidden'); $('bossName').textContent = `${boss.d.elite ? '👑 ' : ''}${boss.d.name}`; bb.querySelector('i').style.width = `${boss.hp / boss.d.hp * 100}%`; if (music.dataset.n !== 'm_boss') playMusic('m_boss'); }
  else if (!bb.classList.contains('hidden')) { bb.classList.add('hidden'); playMusic(REALMS[curRealm].music); }
}
async function summon(m) {
  for (let k = 0; k < 2; k++) {
    const extra = await createMonster(ZONES.findIndex(z => z.m === 'minion'));
    const a = Math.random() * 6.28; extra.pos.set(m.pos.x + Math.cos(a) * 5, 0, m.pos.z + Math.sin(a) * 5); extra.home.copy(extra.pos); extra.zi = m.zi; extra.state = 'chase'; extra.active = true; extra.summoned = true;
    if (extra.c.play) extra.c.play('Skeletons_Awaken_Standing', 0, true);
  }
  toast('Lord Hush calls his skeletons!');
}
function damageMonster(m, dmg, crit) {
  if (m.dead) return;
  m.hp -= dmg; m.state = 'chase'; monLabel(m);
  floatText(`${crit ? '💥' : ''}${dmg}`, m.pos.clone().add(new THREE.Vector3(0, 2 * m.scale, 0)), crit ? '#ffd23a' : '#ffffff');
  sfx(m.d.kind === 'slime' ? 'squish' : m.d.kind === 'char' ? 'clang' : 'punch', 0.5);
  if (m.c.play && m.hp > 0 && Math.random() < 0.5) m.c.play('Hit_A', 0.1, true);
  if (m.d.elite) { m.hitByMe = true; const now = performance.now(); if (m.hp <= 0) net.send('boss', { z: m.zi, dead: 1 }); else if (now - (m.syncT || 0) > 1500) { m.syncT = now; net.send('boss', { z: m.zi, hp: Math.round(m.hp) }); } }
  if (m.hp <= 0) killMonster(m);
}
function killMonster(m, noLoot) {
  m.dead = true; m.deadT = 0; m.state = 'dead'; if (m.lab) m.lab.visible = false;
  if (m.c.play) m.c.play(m.d.kind === 'char' && /Skeleton/.test(m.d.model) ? 'Skeletons_Death' : 'Death_A', 0.1, true);
  if (m.d.kind === 'animal') m.c.root.rotation.z = Math.PI / 2;
  if (noLoot) return;   // another player beat this boss and you did not help
  const [g0, g1] = m.d.gold; const gold = g0 + Math.floor(Math.random() * (g1 - g0 + 1)); S.gold += gold; logLine(`🪙 +${gold}`); sfx('gold', 0.4);
  gainXP(m.d.xp);
  const drops = m.d.loot.filter(([id, p]) => Math.random() < p).map(([id]) => [id, 1]);
  const tier = tierOf(m.d.lvl), pickT = t => TIERS[Math.min(4, t)][Math.floor(Math.random() * TIERS[Math.min(4, t)].length)];
  if (Math.random() < 0.05) drops.push(['sparkstone', 1]);
  if (Math.random() < 0.035) drops.push([pickT(tier), 1]);
  if (m.d.elite || m.d.boss) {
    drops.push(['sparkstone', 2 + Math.floor(Math.random() * 2)], ['potion_m', 1]);
    if (tier >= 2 || m.d.boss) drops.push(['moonstone', 1]);
    if ((tier >= 3 && Math.random() < 0.35) || m.type === 'hush' || m.type === 'keeper') drops.push(['starstone', 1]);
    drops.push([pickT(tier + (Math.random() < 0.3 ? 1 : 0)), 1]);
    if (Math.random() < 0.5) drops.push([pickT(tier), 1]);
    toast(`👑 ${esc(m.d.name)} defeated!<br><span style="font-size:.6em">Look at the treasure on the ground!</span>`, 2600);
  }
  drops.forEach(([id, n], i) => { const a = i * 2.1, extra = isGear(id) ? { q: rollQuality(m.d.elite || m.d.boss), up: (m.d.elite || m.d.boss) && Math.random() < 0.4 ? 1 + Math.floor(Math.random() * 3) : 0 } : null; spawnGround(id, n, m.pos.clone().add(new THREE.Vector3(Math.cos(a) * (0.9 + i * 0.15), 0, Math.sin(a) * (0.9 + i * 0.15))), extra); });
  if (!m.summoned) onKill(m.type);
  if (m.d.boss || m.d.elite) { if (m.d.boss) S.flags['boss_' + m.type] = true; sfx('win'); }
  if (m.summoned) setTimeout(() => { scene.remove(m.c.root); monsters.splice(monsters.indexOf(m), 1); }, 3000);
  save(); hudDirty = true;
}

// ======================= COMBAT =======================
const MELEE = { '1h': ['Melee_1H_Attack_Chop', 'Melee_1H_Attack_Slice_Diagonal', 'Melee_1H_Attack_Stab'], '2h': ['Melee_2H_Attack_Chop', 'Melee_2H_Attack_Slice', 'Melee_2H_Attack_Spin'], fist: ['Melee_Unarmed_Attack_Punch_A', 'Melee_Unarmed_Attack_Kick'], dual: ['Melee_Dualwield_Attack_Chop', 'Melee_Dualwield_Attack_Slice', 'Melee_Dualwield_Attack_Stab'] };
function nearestMonster(maxD, front) {
  let best = null, bd = maxD;
  for (const m of monsters) { if (!m.active || m.dead || !m.c.root.visible) continue; const d = m.pos.distanceTo(player.pos); if (front) { const a = Math.atan2(m.pos.x - player.pos.x, m.pos.z - player.pos.z), df = Math.abs(Math.atan2(Math.sin(a - player.ry), Math.cos(a - player.ry))); if (df > 1.2 && d > 4) continue; } if (d < bd) { bd = d; best = m; } }
  return best;
}
function attack() {
  if (mode !== 'play' || busy() || player.dead) return;
  const now = performance.now(); if (now < player.atkCd) return;
  const w = S.eq.weapon && ITEMS[wid('weapon')], kind = w ? w.kind : 'fist';
  const ranged = ['bow', 'xbow', 'magic'].includes(kind);
  player.atkCd = now + (kind === '2h' ? 950 : ranged ? 750 : kind === 'fist' ? 450 : 560) / (w?.speed || 1);
  const target = nearestMonster(ranged ? 24 : 5, ranged);
  if (target) player.ry = Math.atan2(target.pos.x - player.pos.x, target.pos.z - player.pos.z);
  const roll = () => { const crit = Math.random() < 0.1; return [Math.max(1, Math.round(atk() * (0.85 + Math.random() * 0.3) * (crit ? 1.8 : 1))), crit]; };
  if (ranged) {
    player.c.play(kind === 'bow' ? 'Ranged_Bow_Release' : kind === 'xbow' ? 'Ranged_1H_Shoot' : 'Ranged_Magic_Shoot', 0.08, true, 1.4);
    sfx('swing', 0.4);
    setTimeout(() => {
      const from = player.pos.clone().add(new THREE.Vector3(Math.sin(player.ry) * 0.8, 1.5, Math.cos(player.ry) * 0.8));
      const to = target ? target.pos.clone().add(new THREE.Vector3(0, 1 * target.scale, 0)) : from.clone().add(new THREE.Vector3(Math.sin(player.ry) * 20, 0, Math.cos(player.ry) * 20));
      const [dm, cr] = roll(); shoot(from, to, 'player', dm, kind === 'magic' ? '#7fd8ff' : '#ffe08a', kind, cr);
    }, 180);
  } else {
    const dual = kind === '1h' && S.eq.off && ITEMS[wid('off')].model === 'dagger';
    const list = dual ? MELEE.dual : MELEE[kind] || MELEE['1h']; player.combo = (player.combo + 1) % list.length;
    player.c.play(list[player.combo], 0.06, true, 1.35); sfx('swing', 0.45);
    setTimeout(() => {
      const reach = kind === '2h' ? 3.4 : 2.8;
      for (const m of monsters) {
        if (!m.active || m.dead) continue; const d = Math.hypot(m.pos.x - player.pos.x, m.pos.z - player.pos.z);
        if (d > reach + 0.4 * m.scale) continue;
        const a = Math.atan2(m.pos.x - player.pos.x, m.pos.z - player.pos.z), df = Math.abs(Math.atan2(Math.sin(a - player.ry), Math.cos(a - player.ry)));
        if (df < 1.3 || kind === '2h' && player.combo === 2) { const [dm, cr] = roll(); damageMonster(m, dm, cr); }
      }
    }, 230);
  }
}
function shoot(from, to, side, dmg, color, kind, crit) {
  const dir = to.clone().sub(from).normalize();
  let mesh;
  if (kind === 'bow' || kind === 'xbow') { mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 4), M('#8a5a2b')); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); }
  else { mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(side === 'enemy' ? 0.35 : 0.25, 0), new THREE.MeshBasicMaterial({ color })); const l = new THREE.PointLight(color, 4, 6); mesh.add(l); }
  mesh.position.copy(from); scene.add(mesh);
  projectiles.push({ mesh, vel: dir.multiplyScalar(side === 'enemy' ? 15 : 28), side, dmg, life: 1.6, crit });
}
function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]; p.life -= dt; p.mesh.position.addScaledVector(p.vel, dt); p.mesh.rotation.x += dt * 8;
    let hit = false;
    if (p.side === 'player') { for (const m of monsters) { if (!m.active || m.dead) continue; const c = m.pos.clone(); c.y += 1 * m.scale; if (c.distanceTo(p.mesh.position) < 1 + 0.5 * m.scale) { damageMonster(m, p.dmg, p.crit); hit = true; break; } } }
    else if (!busy()) { const c = player.pos.clone(); c.y += 1.1; if (c.distanceTo(p.mesh.position) < 1.1) { hurtPlayer(p.dmg); hit = true; } }
    if (hit || p.life <= 0 || p.mesh.position.y < H(p.mesh.position.x, p.mesh.position.z)) { scene.remove(p.mesh); projectiles.splice(i, 1); }
  }
}
function hurtPlayer(raw) {
  if (player.dead || busy()) return;
  const dmg = Math.max(1, Math.round(raw * 20 / (20 + def()) * (0.85 + Math.random() * 0.3)));
  S.hp -= dmg; hudDirty = true; player.hurtT = 0.35;
  floatText(`-${dmg}`, player.pos.clone().add(new THREE.Vector3(0, 2.4, 0)), '#ff6b5a'); sfx('hit', 0.5);
  if (performance.now() > player.c.lockUntil) player.c.play('Hit_A', 0.1, true);
  if (S.hp <= 0) faint();
}
async function faint() {
  player.dead = true; S.hp = 0; player.c.play('Death_A', 0.1, true); sfx('bad');
  const lost = Math.floor(S.gold * 0.1); S.gold -= lost;
  await new Promise(r => setTimeout(r, 1600));
  const T = REALMS[S.town].town;
  await new Promise(res => { openModal(`<h2>💫 You fainted!</h2><div class="doc">The people of ${esc(REALMS[S.town].name)} found you and took care of you. You lost ${lost} gold.<br><br>Tip: wear better armour, drink potions (Q) and level up by helping people.</div><div class="foot"><button class="btn" id="okF">Get up</button></div>`); $('modal').dataset.lock = '1'; $('okF').onclick = () => { delete $('modal').dataset.lock; closeModal(); res(); }; });
  player.pos.set(T.x + 5, 0, T.z + 7); S.hp = maxHP(); player.dead = false; player.c.play('Idle_A', 0.2);
  for (const m of monsters) if (m.state === 'chase') m.state = 'return';
  hudDirty = true; save();
}
function floatText(t, pos, color) {
  const s = label(t, color, 40, 2.2); s.position.copy(pos); scene.add(s); floaters.push({ s, life: 1 });
}

// ======================= INTERACTION =======================
let near = null;
function findNear() {
  near = null; if (mode !== 'play' || player.dead) return showPrompt();
  let bd = 99; const pp = player.pos;
  const consider = (d, max, obj) => { if (d < max && d < bd) { bd = d; near = obj; } };
  for (const [id, N] of Object.entries(npcs)) { const n = N.def, max = n.kind === 'tree' ? 5 : n.kind === 'animal' ? 2.4 : 3.2; const d = Math.hypot(N.pos.x - pp.x, N.pos.z - pp.z); consider(d, max, { t: 'npc', id, label: n.kind === 'animal' ? `Look at the ${n.file}` : n.kind === 'board' ? 'Read the notice board' : `Talk to ${n.name}` }); }
  for (const s of world.signs) consider(Math.hypot(s.x - pp.x, s.z - pp.z), 2.6, { t: 'sign', s, label: 'Read the sign' });
  for (const k of picks) if (k.mesh.visible) consider(Math.hypot(k.pos.x - pp.x, k.pos.z - pp.z), 2, { t: 'pick', k, label: `Pick up: ${iname(k.item)}` });
  for (const g of groundItems) consider(Math.hypot(g.pos.x - pp.x, g.pos.z - pp.z), 2, { t: 'ground', g, label: `Pick up: ${fullName({ id: g.id, ...(g.extra || {}) })}${g.n > 1 ? ` ×${g.n}` : ''}` });
  for (const P of world.portals) {
    const d = Math.hypot(P.x - pp.x, P.z - pp.z);
    if (d < 6 && !S.portals.includes(P.def.id)) { S.portals.push(P.def.id); P.set(true); sfx('star'); banner('Portal activated!', `${P.def.name} — now you can travel here with any portal 🌀`); gainXP(20); save(); }
    consider(d, 4.3, { t: 'portal', P, label: `Use the portal 🌀 (${P.def.name})` });
  }
  if (isActive('s_lanterns')) world.lanterns.forEach((l, i) => { if (!S.lit.includes(i)) consider(Math.hypot(l.x - pp.x, l.z - pp.z), 2.6, { t: 'lantern', i, label: 'Light the lantern 🕯️' }); });
  showPrompt();
}
const isTouch = matchMedia('(pointer: coarse)').matches;
function showPrompt() { const el = $('prompt'); if (near && !busy()) { el.innerHTML = `<kbd>${isTouch ? 'Tap' : 'E'}</kbd>${esc(near.label)}`; el.classList.remove('hidden'); } else el.classList.add('hidden'); }
async function interact() {
  if (dlgOpen) { if (dlgNext) dlgNext(); return; }
  if (busy() || !near || mode !== 'play') return;
  const n = near; sfx('click', 0.3);
  if (n.t === 'npc') await talkTo(n.id);
  else if (n.t === 'sign') { await say('narrator', `The sign says: ${n.s.lines.join(' · ')}`); }
  else if (n.t === 'pick') {
    const q = QBY[n.k.p.q], s = q && isActive(q.id) && stepOf(q);
    if (s && s.bring) record('INST', s.txt, iname(n.k.item), iname(s.bring), n.k.item === s.bring, q.title);
    takePick(n.k);
  }
  else if (n.t === 'ground') pickGround(n.g);
  else if (n.t === 'portal') openPortals(n.P);
  else if (n.t === 'lantern') {
    S.lit.push(n.i); world.lanterns[n.i].set(true); sfx('star'); player.c.play('Interact', 0.1, true);
    const q = QBY.s_lanterns, s = stepOf(q); if (s && s.act) { S.q.s_lanterns.cnt++; logLine(`🕯️ ${S.q.s_lanterns.cnt}/${s.n}`); if (S.q.s_lanterns.cnt >= s.n) advance(q); }
    save();
  }
  hudDirty = true; refreshMarks();
}

// ======================= TRACKER / ARROW =======================
function objective() {
  const list = activeQuests(); let q = S.track && isActive(S.track) ? QBY[S.track] : list[0];
  if (!q) {
    const offer = QUESTS.find(x => x.main && x.giver && available(x) && x.intro);
    if (offer) return { q: null, title: '⭐ Main story', text: `Talk to ${NPCS[offer.giver].name}.`, p: npcs[offer.giver]?.pos };
    return { q: null, title: S.done ? '🏆 The land is saved!' : 'Explore', text: S.done ? 'Explore, finish side missions and help people. Look for blue ! marks.' : 'Look for people with a ! above their heads.', p: null };
  }
  const s = stepOf(q), st = S.q[q.id]; let p = null, text = s.txt || '';
  if (s.talk) p = npcs[s.talk]?.pos;
  else if (s.bring) { const have = count(s.bring); text += ` (${Math.min(have, s.n)}/${s.n})`; p = have >= s.n ? npcs[s.to]?.pos : s.at ? new THREE.Vector3(s.at[0], 0, s.at[1]) : null; }
  else if (s.kill) { text += ` (${st.cnt}/${s.n})`; if (s.at) p = new THREE.Vector3(s.at[0], 0, s.at[1]); else { let bd = 1e9; ZONES.forEach(z => { if (z.m === s.kill && !z.q) { const d = Math.hypot(z.x - player.pos.x, z.z - player.pos.z); if (d < bd) { bd = d; p = new THREE.Vector3(z.x, 0, z.z); } } }); } }
  else if (s.go) p = new THREE.Vector3(PLACES[s.go].x, 0, PLACES[s.go].z);
  else if (s.act) { text += ` (${st.cnt}/${s.n})`; let bd = 1e9; world.lanterns.forEach((l, i) => { if (!S.lit.includes(i)) { const d = Math.hypot(l.x - player.pos.x, l.z - player.pos.z); if (d < bd) { bd = d; p = new THREE.Vector3(l.x, 0, l.z); } } }); }
  const hidden = s.noArrow && !S.reveal[q.id + st.step];
  return { q, title: `${q.main ? '⭐' : '🔷'} ${q.title}`, text, p: hidden ? null : p, hidden };
}
let lastObj = null;
function drawTracker() {
  const o = objective(); lastObj = o;
  $('track').innerHTML = `<div class="qt ${o.q && !o.q.main ? 'side' : 'main'}">${esc(o.title)}</div><div class="od">${glossify(o.text)}</div>${o.hidden ? '<button class="btn alt" id="reveal">🧭 I\'m lost: show me</button>' : ''}`;
  if ($('reveal')) $('reveal').onclick = () => { S.reveal[o.q.id + S.q[o.q.id].step] = true; save(); hudDirty = true; };
}
function updateArrow() {
  const o = lastObj;
  if (!o || !o.p || mode !== 'play') { $('arrow').style.display = 'none'; if (beacon) beacon.visible = false; return; }
  const d = Math.hypot(o.p.x - player.pos.x, o.p.z - player.pos.z);
  if (d > 5) { const target = Math.atan2(o.p.x - player.pos.x, o.p.z - player.pos.z), fwd = Math.atan2(-Math.sin(cam.yaw), -Math.cos(cam.yaw)); const diff = Math.atan2(Math.sin(target - fwd), Math.cos(target - fwd)); $('arrow').style.display = 'block'; $('arrow').style.transform = `rotate(${-diff}rad)`; } else $('arrow').style.display = 'none';
  if (beacon) { beacon.visible = d > 6; beacon.position.set(o.p.x, H(o.p.x, o.p.z) + 25, o.p.z); }
}


// ======================= PORTALS =======================
function openPortals(here) {
  sfx('open');
  const waiting = r => Object.values(npcs).filter(N => N.want && realmAt(N.pos.x, N.pos.z) === r).length;
  const rows = PORTALS.map(p => {
    const on = S.portals.includes(p.id), me = here && here.def.id === p.id, R = REALMS[p.realm], w = waiting(p.realm);
    return `<div class="srow" style="${on ? '' : 'opacity:.5'}"><div class="ic" style="color:${p.color}">🌀</div><div class="nm">${esc(p.name)}<small>${esc(R.name)} · land of ${esc(R.people)} · level ${p.lvl}${on && w ? ` · <b style="color:#a86a00">${w} ${w > 1 ? 'people need' : 'person needs'} help</b>` : ''}</small></div>${me ? '<span class="small"><b>You are here</b></span>' : on ? `<button class="btn blue" data-go="${p.id}">Go ➜</button>` : '<span class="small">Not discovered yet</span>'}</div>`;
  }).join('');
  openModal(`<button class="btn alt x" id="xx">✕</button><h2>🌀 Magic Portal</h2><div class="doc" style="font-family:Nunito;font-size:17px;margin-bottom:10px">${glossify('Where do you want to go? You can travel to any portal you have discovered. To discover a new portal, walk to it the first time.')}</div>${rows}`);
  $('xx').onclick = closeModal;
  $('mbox').querySelectorAll('[data-go]').forEach(b => b.onclick = () => travel(world.portals.find(P => P.def.id === b.dataset.go)));
}
function travel(P) {
  closeModal(); sfx('levelup', 0.5);
  const fl = document.createElement('div'); fl.style.cssText = `position:fixed;inset:0;z-index:40;pointer-events:none;background:radial-gradient(circle,#fff,${P.def.color});opacity:0;transition:opacity .35s`;
  document.body.appendChild(fl); requestAnimationFrame(() => fl.style.opacity = 1);
  setTimeout(() => {
    player.pos.set(P.x + Math.sin(P.rot) * 4, 0, P.z + Math.cos(P.rot) * 4); player.pos.y = H(player.pos.x, player.pos.z);
    player.ry = P.rot; cam.yaw = P.rot + Math.PI; camera.position.set(player.pos.x - Math.sin(P.rot) * 6, player.pos.y + 4, player.pos.z - Math.cos(P.rot) * 6);
    for (const m of monsters) if (m.state === 'chase') m.state = 'return';
    S.town = P.def.realm; save(); hudDirty = true;
    fl.style.opacity = 0; setTimeout(() => fl.remove(), 500);
  }, 380);
}

// ======================= MAP =======================
const mini = $('mini'), mctx = mini.getContext('2d'), MR = WORLD_R + 14;
let mapBg = null;
function buildMapBg() {
  const S2 = 420, c = document.createElement('canvas'); c.width = c.height = S2; const x = c.getContext('2d'), img = x.createImageData(S2, S2);
  const cols = REALMS.map(r => { const h = parseInt(r.color.slice(1), 16); return { r: (h >> 16 & 255) / 255, g: (h >> 8 & 255) / 255, b: (h & 255) / 255 }; });
  for (let j = 0; j < S2; j++) for (let i = 0; i < S2; i++) {
    const wx = (i / S2 * 2 - 1) * MR, wz = (j / S2 * 2 - 1) * MR, d = Math.hypot(wx, wz), k = (j * S2 + i) * 4;
    let r = 63, g = 179, b = 232;
    if (d < WORLD_R + 4) { const w = realmWeights(wx, wz); r = g = b = 0; w.forEach((v, n) => { r += cols[n].r * v * 255; g += cols[n].g * v * 255; b += cols[n].b * v * 255; }); if (d > WORLD_R - 3) { r = 234; g = 211; b = 154; } }
    img.data[k] = r; img.data[k + 1] = g; img.data[k + 2] = b; img.data[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  const mp = (wx, wz) => [(wx / MR + 1) / 2 * S2, (wz / MR + 1) / 2 * S2];
  x.strokeStyle = '#f3e1b0'; x.lineWidth = 3; x.lineCap = 'round';
  roads.forEach(r => { x.beginPath(); r.pts.forEach((p, i) => { const [a, b] = mp(p.x, p.z); i ? x.lineTo(a, b) : x.moveTo(a, b); }); x.stroke(); });
  world.lakes.forEach(l => { const [a, b] = mp(l.x, l.z); x.fillStyle = l.color; x.beginPath(); x.arc(a, b, l.r / MR * S2 / 2, 0, 7); x.fill(); });
  mapBg = c;
}
function mapXY(wx, wz, S2) { return [(wx / MR + 1) / 2 * S2, (wz / MR + 1) / 2 * S2]; }
function drawMapTo(ctx, S2, big, t) {
  if (!mapBg) buildMapBg();
  ctx.drawImage(mapBg, 0, 0, S2, S2); const K = S2 / 420;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const p of Object.values(PLACES)) { const [a, b] = mapXY(p.x, p.z, S2); if (p.town !== undefined) { ctx.fillStyle = '#fff8e0'; ctx.strokeStyle = '#6b3a10'; ctx.lineWidth = 2 * K; ctx.beginPath(); ctx.arc(a, b, 6 * K, 0, 7); ctx.fill(); ctx.stroke(); } if (big) { ctx.font = `${p.town !== undefined ? 900 : 700} ${(p.town !== undefined ? 15 : 11) * K / 1.6}px Nunito`; ctx.fillStyle = '#2a1d12'; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 3; ctx.strokeText(p.name, a, b + 14 * K / 1.4); ctx.fillText(p.name, a, b + 14 * K / 1.4); } }
  if (big) REALMS.forEach((r, i) => { if (!i) return; const [a, b] = mapXY(r.town.x * 0.62, r.town.z * 0.62, S2); ctx.font = `900 ${20 * K / 1.6}px Cinzel`; ctx.fillStyle = 'rgba(42,29,18,.55)'; ctx.fillText(r.name.toUpperCase(), a, b); });
  for (const P of world.portals) { const [a, b] = mapXY(P.x, P.z, S2); ctx.fillStyle = P.on ? P.def.color : '#888'; ctx.strokeStyle = '#2a1d12'; ctx.lineWidth = 1.5 * K; ctx.beginPath(); ctx.arc(a, b, 5 * K, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2a1d12'; ctx.font = `900 ${8 * K}px Nunito`; ctx.fillText('🌀', a, b + 0.5); }
  for (const [id, N] of Object.entries(npcs)) { if (!N.want) continue; const [a, b] = mapXY(N.pos.x, N.pos.z, S2); ctx.fillStyle = N.want === 'main' || N.want === 'qm' ? '#ffc23d' : '#45b8ff'; ctx.beginPath(); ctx.arc(a, b, 5.5 * K, 0, 7); ctx.fill(); ctx.strokeStyle = '#2a1d12'; ctx.lineWidth = 1.5 * K; ctx.stroke(); ctx.fillStyle = '#2a1d12'; ctx.font = `900 ${9 * K}px Nunito`; ctx.fillText(N.want[0] === 'q' ? '?' : '!', a, b + 0.5); }
  if (lastObj && lastObj.p) { const [a, b] = mapXY(lastObj.p.x, lastObj.p.z, S2), r = (8 + Math.sin(t * 5) * 2) * K; ctx.beginPath(); for (let k = 0; k < 10; k++) { const an = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; ctx.lineTo(a + Math.cos(an) * rr, b + Math.sin(an) * rr); } ctx.closePath(); ctx.fillStyle = '#ffc23d'; ctx.strokeStyle = '#2a1d12'; ctx.lineWidth = 2; ctx.fill(); ctx.stroke(); }
  const [px, pz] = mapXY(player.pos.x, player.pos.z, S2);
  ctx.save(); ctx.translate(px, pz); ctx.rotate(Math.PI - player.ry); ctx.scale(K * 1.2, K * 1.2); ctx.fillStyle = '#ff2e63'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(7, 8); ctx.lineTo(0, 4); ctx.lineTo(-7, 8); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
}
function drawMini(t) {
  const S2 = mini.width, zoom = 3.2;
  mctx.save(); mctx.fillStyle = '#3fb3e8'; mctx.fillRect(0, 0, S2, S2);
  const [px, pz] = mapXY(player.pos.x, player.pos.z, S2);
  mctx.translate(S2 / 2, S2 / 2); mctx.scale(zoom, zoom); mctx.translate(-px, -pz);
  drawMapTo(mctx, S2, false, t); mctx.restore();
}
function openMap() {
  if (mode !== 'play' || dlgOpen) return;
  openModal(`<button class="btn alt x" id="xx">✕</button><h2>🗺️ The Five Realms</h2><canvas id="bigmap" width="900" height="900"></canvas><div class="small" style="text-align:center;margin-top:6px">⭐ = your objective · 🌀 portal · <b style="color:#c08000">!</b> main mission · <b style="color:#1a7ac0">!</b> side mission · ? = someone is waiting for you</div>`, true);
  $('xx').onclick = closeModal;
  const draw = () => { if (!modalOpen || !$('bigmap')) return; drawMapTo($('bigmap').getContext('2d'), 900, true, performance.now() / 1000); requestAnimationFrame(draw); }; draw();
}
mini.addEventListener('click', () => openMap());

// ======================= JOURNAL =======================
let jTab = 'q', jSel = null;
function openJournal() {
  if (mode !== 'play' || dlgOpen) return;
  const tabs = `<div class="tabs"><button data-t="q" class="${jTab === 'q' ? 'on' : ''}">📜 Missions</button><button data-t="p" class="${jTab === 'p' ? 'on' : ''}">📗 Phrasebook (${S.phr.length})</button><button data-t="s" class="${jTab === 's' ? 'on' : ''}">📊 My English</button><button data-t="h" class="${jTab === 'h' ? 'on' : ''}">❓ Help</button></div>`;
  let body = '';
  if (jTab === 'q') {
    const act = activeQuests(), done = QUESTS.filter(q => isDone(q.id));
    if (!jSel || !QBY[jSel]) jSel = (act[0] || done[0] || {}).id;
    const it = q => `<div class="qitem ${jSel === q.id ? 'on' : ''} ${isDone(q.id) ? 'done' : ''}" data-q="${q.id}"><span class="${q.main ? 'm' : 's'}">${q.main ? '⭐' : '🔷'}</span> ${esc(q.title)}${isDone(q.id) ? ' ✓' : ''}${S.track === q.id ? ' 🧭' : ''}</div>`;
    const q = QBY[jSel];
    let det = '<div class="small">No missions yet. Talk to people!</div>';
    if (q) {
      const st = S.q[q.id]; const steps = q.steps.map((s, i) => i < st.step || isDone(q.id) ? `<div>✅ <s>${esc(s.txt || '')}</s></div>` : i === st.step ? `<div>➡️ <b>${glossify(s.txt || '')}</b></div>` : '').join('');
      det = `<h3 style="margin:0">${q.main ? '⭐' : '🔷'} ${esc(q.title)}</h3><div class="small">${q.giver ? `From: ${esc(NPCS[q.giver]?.name || '')} · ` : ''}${esc(REALMS[q.realm].name)}</div><div class="detail">${steps}</div>
      <div class="small" style="margin-top:6px">Reward: ${q.reward?.xp || 0} XP · 🪙 ${q.reward?.gold || 0}${(q.reward?.items || []).map(([id]) => ` · ${ITEMS[id].icon} ${esc(ITEMS[id].n)}`).join('')}</div>
      ${isActive(q.id) && S.track !== q.id ? '<div class="foot"><button class="btn" id="trk">🧭 Follow this mission</button></div>' : ''}`;
    }
    const avail = QUESTS.filter(x => x.giver && x.intro && available(x)).slice(0, 8);
    body = `<div class="qlist"><div><b>Active</b>${act.map(it).join('') || '<div class="small">—</div>'}<b>Completed (${done.length}/${QUESTS.length})</b>${done.map(it).join('') || '<div class="small">—</div>'}${avail.length ? `<b>People who need help</b>${avail.map(x => `<div class="small">${x.main ? '⭐' : '🔷'} ${esc(NPCS[x.giver].name)} (${esc(REALMS[x.realm].name)})</div>`).join('')}` : ''}</div><div>${det}</div></div>`;
  } else if (jTab === 'p') {
    body = S.phr.length ? `<div class="small" style="margin-bottom:8px">Useful phrases you used well in conversations. Press 🔊 to hear them.</div>${S.phr.map((p, i) => `<div class="phr"><button class="tool" data-say="${i}" style="border:0;background:#f1e0bd;border-radius:8px;cursor:pointer">🔊</button> ${esc(p.en)}<small>${esc(p.ctx)}</small></div>`).join('')}` : '<div class="small">Your phrasebook is empty. Choose good answers in conversations to add phrases here!</div>';
  } else if (jTab === 's') {
    const rows = Object.keys(SKILLS).map(k => { const [c, t] = S.stats[k] || [0, 0], p = t ? Math.round(c / t * 100) : 0; return `<div class="phr">${esc(SKILLS[k])} <small>${esc(SKILLS_ES[k])}</small><div class="bar2" style="height:14px"><i style="width:${p}%;background:linear-gradient(90deg,#7ee08a,#2ea64f)"></i><b>${p}% (${c}/${t})</b></div></div>`; }).join('');
    body = `${rows}<div class="small">Missions: ${QUESTS.filter(q => isDone(q.id)).length}/${QUESTS.length} · Level ${S.lvl} · Documents read: ${Object.keys(S.read).length}</div>${S.done ? '<div class="foot"><button class="btn" id="cert">🏆 Certificate</button></div>' : ''}`;
  } else body = `<div class="doc">${DOCS.how_to_play.text.split('\n').filter(Boolean).map(p => `<p>${glossify(p)}</p>`).join('')}</div>`;
  openModal(`<button class="btn alt x" id="xx">✕</button><h2>📜 Journal</h2>${tabs}${body}`, true);
  $('xx').onclick = closeModal;
  $('mbox').querySelectorAll('.tabs button').forEach(b => b.onclick = () => { jTab = b.dataset.t; openJournal(); });
  $('mbox').querySelectorAll('[data-q]').forEach(b => b.onclick = () => { jSel = b.dataset.q; openJournal(); });
  $('mbox').querySelectorAll('[data-say]').forEach(b => b.onclick = () => speak(S.phr[+b.dataset.say].en, 'me', true));
  if ($('trk')) $('trk').onclick = () => { S.track = jSel; save(); hudDirty = true; openJournal(); };
  if ($('cert')) $('cert').onclick = certificate;
}
function certificate() {
  const rows = Object.keys(SKILLS).map(k => { const [c, t] = S.stats[k] || [0, 0]; return `<tr><td>${esc(SKILLS[k])} <span class="small">(${esc(SKILLS_ES[k])})</span></td><td style="text-align:right;font-weight:900">${t ? Math.round(c / t * 100) : 0}%</td></tr>`; }).join('');
  openModal(`<div style="text-align:center"><h2 style="font-size:32px">🏆 Hero of the Five Realms</h2><div class="doc" style="font-family:Nunito">This certifies that <b>${esc(S.name)}</b> brought back the Crown of Words and defeated Lord Hush.<br><span class="small">${new Date().toLocaleDateString('es-CL')} · Level ${S.lvl} · Missions ${QUESTS.filter(q => isDone(q.id)).length}/${QUESTS.length}</span><table style="margin:12px auto;border-collapse:collapse">${rows}</table><div class="small">Take a screenshot and send it to your teacher.</div></div></div><div class="foot"><button class="btn" id="cOk">Continue</button></div>`);
  $('cOk').onclick = closeModal;
}

// ======================= INPUT =======================
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  keys[e.code] = true;
  if (['Space', 'ArrowUp', 'ArrowDown', 'Tab'].includes(e.code)) e.preventDefault();
  if (dlgOpen) {
    if (/^Digit[1-4]$/.test(e.code) && dlgPick) dlgPick(+e.code.slice(5) - 1);
    if (['Enter', 'Space', 'KeyE'].includes(e.code) && dlgNext) dlgNext();
    return;
  }
  if (modalOpen) { if (e.code === 'Escape' && !$('modal').dataset.lock) closeModal(); else if ((e.code === 'KeyI' || e.code === 'Tab') && bagOpen) closeModal(); else if (e.code === 'KeyJ' && $('mbox').querySelector('.tabs')) closeModal(); else if (e.code === 'KeyM' && $('bigmap')) closeModal(); return; }
  if (mode !== 'play') return;
  if (e.code === 'KeyT') togglePhrases();
  if (/^Digit\d$/.test(e.code) && !$('phr').classList.contains('hidden')) { sayPhrase((+e.code.slice(5) + 9) % 10); return; }
  if (e.code === 'KeyE') interact();
  if (e.code === 'KeyF') attack();
  if (e.code === 'KeyQ') quickPotion();
  if (e.code === 'KeyI' || e.code === 'Tab') openBag();
  if (e.code === 'KeyJ') openJournal();
  if (e.code === 'KeyM') openMap();
});
addEventListener('keyup', e => { keys[e.code] = false; });
const cv = $('c'); let drag = null;
cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, id: e.pointerId, sx: e.clientX, sy: e.clientY, t: performance.now() }; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointermove', e => { if (!drag || drag.id !== e.pointerId) return; cam.yaw -= (e.clientX - drag.x) * 0.006; cam.pitch = THREE.MathUtils.clamp(cam.pitch + (e.clientY - drag.y) * 0.004, 0.05, 1.2); drag.x = e.clientX; drag.y = e.clientY; });
cv.addEventListener('pointerup', e => { if (drag && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 8 && performance.now() - drag.t < 350 && !isTouch && e.button === 0) attack(); drag = null; });
cv.addEventListener('pointercancel', () => drag = null);
cv.addEventListener('wheel', e => { cam.dist = THREE.MathUtils.clamp(cam.dist + e.deltaY * 0.01, 4, 18); }, { passive: true });
if (isTouch) {
  const st = $('stick'), knob = st.firstElementChild; let sid = null;
  const move = e => { const r = st.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } stick.x = x; stick.y = y; knob.style.transform = `translate(${x * 40}px,${y * 40}px)`; };
  st.addEventListener('pointerdown', e => { sid = e.pointerId; st.setPointerCapture(sid); move(e); });
  st.addEventListener('pointermove', e => { if (e.pointerId === sid) move(e); });
  const end = () => { sid = null; stick.x = stick.y = 0; knob.style.transform = ''; };
  st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
  $('tJump').addEventListener('pointerdown', () => { keys.Space = true; setTimeout(() => keys.Space = false, 120); });
  $('tAct').addEventListener('pointerdown', () => interact());
  $('tAtk').addEventListener('pointerdown', () => attack());
  $('tPot').addEventListener('pointerdown', () => quickPotion());
}
$('prompt').addEventListener('click', () => interact());
$('potBtn').onclick = quickPotion; $('chatBtn').onclick = togglePhrases; $('onl').onclick = () => { if (!S.online) { S.online = true; save(); goOnline(); } else if (!net.NET.ok) goOnline(); }; $('bBag').onclick = openBag; $('bJour').onclick = openJournal; $('bMap').onclick = openMap;
$('bMenu').onclick = () => {
  if (busy()) return;
  openModal(`<h2>☰ Menu</h2><div class="foot" style="justify-content:flex-start">
   <button class="btn" id="m1">▶ Continue</button><button class="btn alt" id="m2">🔊 Voice: ${S.voice ? 'ON' : 'OFF'}</button><button class="btn alt" id="m3">🐢 Voice speed: ${S.rate < 0.8 ? 'slow' : 'normal'}</button><button class="btn alt" id="m4">🎵 Music: ${S.music > 0 ? 'ON' : 'OFF'}</button><button class="btn alt" id="m7">🌐 Online: ${S.online ? 'ON' : 'OFF'}</button>
   ${S.done ? '<button class="btn blue" id="m6">🏆 Certificate</button>' : ''}<button class="btn red" id="m5">🏠 Save and exit</button></div>
   <div class="small" style="margin-top:10px">The game saves automatically on this device.</div>`);
  $('m1').onclick = closeModal;
  $('m2').onclick = () => { S.voice = !S.voice; save(); $('bMenu').onclick(); closeModal(); $('bMenu').onclick(); };
  $('m3').onclick = () => { S.rate = S.rate < 0.8 ? 0.92 : 0.72; save(); closeModal(); $('bMenu').onclick(); };
  $('m4').onclick = () => { S.music = S.music > 0 ? 0 : 0.3; music.volume = S.music; save(); closeModal(); $('bMenu').onclick(); };
  $('m5').onclick = () => { save(); closeModal(); toMenu(); };
  $('m7').onclick = () => { S.online = !S.online; save(); if (S.online) goOnline(); else goOffline(); closeModal(); $('bMenu').onclick(); };
  if ($('m6')) $('m6').onclick = certificate;
};

// ======================= PLAYER / CAMERA =======================
const tmp = new THREE.Vector3();
function updatePlayer(dt) {
  const c = player.c; if (!c) return;
  let f = 0, s = 0;
  const canMove = mode === 'play' && !busy() && !player.dead;
  if (canMove) { f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - stick.y; s = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + stick.x; }
  const len = Math.min(1, Math.hypot(f, s));
  const run = (keys.ShiftLeft || keys.ShiftRight || Math.hypot(stick.x, stick.y) > 0.85) ? 1 : 0;
  const attacking = performance.now() < c.lockUntil && /Attack|Shoot|Release/.test(c.curName || '');
  const speed = len * (run ? 10 : 5.4) * (attacking ? 0.35 : 1);
  ONL.moving = speed > 0.3 || !player.ground;
  if (len > 0.05 || attacking) { ONL.idleT = 0; if (ONL.status === 'away') goOnline(); } else ONL.idleT += dt;
  if (len > 0.05) {
    const fx = -Math.sin(cam.yaw), fz = -Math.cos(cam.yaw), rx = Math.cos(cam.yaw), rz = -Math.sin(cam.yaw);
    const mx = (fx * f + rx * s) / Math.hypot(f, s), mz = (fz * f + rz * s) / Math.hypot(f, s);
    player.pos.x += mx * speed * dt; player.pos.z += mz * speed * dt;
    if (!attacking) { const target = Math.atan2(mx, mz); let d = target - player.ry; d = Math.atan2(Math.sin(d), Math.cos(d)); player.ry += d * Math.min(1, dt * 12); }
  }
  if (keys.Space && player.ground && canMove) { player.vy = 7.5; player.ground = false; c.play('Jump_Start', 0.08, true); }
  player.vy -= 22 * dt; player.jumpY += player.vy * dt;
  if (player.jumpY <= 0) { if (!player.ground && player.vy < -3) c.play('Jump_Land', 0.05, true); player.jumpY = 0; player.vy = 0; player.ground = true; }
  for (const col of colliders) { const dx = player.pos.x - col.x, dz = player.pos.z - col.z; if (Math.abs(dx) > col.r + 1 || Math.abs(dz) > col.r + 1) continue; const d = Math.hypot(dx, dz), m = col.r + 0.45; if (d < m && d > 0.0001) { player.pos.x = col.x + dx / d * m; player.pos.z = col.z + dz / d * m; } }
  const r = Math.hypot(player.pos.x, player.pos.z); if (r > WORLD_R) { player.pos.x *= WORLD_R / r; player.pos.z *= WORLD_R / r; }
  player.pos.y = H(player.pos.x, player.pos.z) + player.jumpY;
  c.root.position.copy(player.pos); c.root.rotation.y = player.ry;
  if (performance.now() > c.lockUntil && !player.dead) {
    const w = S.eq.weapon && ITEMS[wid('weapon')];
    if (!player.ground) c.play('Jump_Idle', 0.15);
    else if (speed > 6) c.play('Running_A', 0.15);
    else if (speed > 0.3) c.play('Walking_A', 0.15);
    else c.play(w && w.kind === '2h' ? 'Melee_2H_Idle' : 'Idle_A', 0.25);
  }
  if (player.hurtT > 0) { player.hurtT -= dt; cv.style.filter = `saturate(1.2) brightness(${1 + player.hurtT})`; } else cv.style.filter = '';
  // health comes back slowly when nobody is fighting you
  if (!player.dead && S.hp < maxHP() && !monsters.some(m => m.state === 'chase' && !m.dead && m.active)) { S.hp = Math.min(maxHP(), S.hp + dt * (2 + S.lvl * 0.4)); if (Math.random() < 0.05) hudDirty = true; }
}
function updateCamera(dt) {
  if (mode === 'menu') { cam.yaw += dt * 0.1; }
  let t = player.pos, dist = cam.dist, yaw = cam.yaw, pitch = cam.pitch;
  if (focus) { tmp.copy(player.pos).lerp(focus, 0.5); t = tmp.clone(); t.y = player.pos.y; const a = Math.atan2(focus.x - player.pos.x, focus.z - player.pos.z); yaw = a + Math.PI / 2 + 0.6; dist = 8; pitch = 0.3; }
  const dx = Math.sin(yaw) * Math.cos(pitch), dy = Math.sin(pitch), dz = Math.cos(yaw) * Math.cos(pitch), hy = t.y + 1.6;
  const nb = camBlockers.filter(b => Math.abs(b.x - t.x) < dist + b.r && Math.abs(b.z - t.z) < dist + b.r);
  if (nb.length) for (let s = 1.2; s <= dist; s += 0.4) { const px = t.x + dx * s, py = hy + dy * s, pz = t.z + dz * s; if (nb.some(b => py > b.y0 && py < b.y1 && (b.x - px) ** 2 + (b.z - pz) ** 2 < b.r * b.r)) { dist = Math.max(1.8, s - 0.7); break; } }
  const h = Math.sin(pitch) * dist, hd = Math.cos(pitch) * dist;
  const want = new THREE.Vector3(t.x + Math.sin(yaw) * hd, 0, t.z + Math.cos(yaw) * hd);
  want.y = Math.max(H(want.x, want.z) + 0.7, t.y + 1.6 + h);
  camera.position.lerp(want, Math.min(1, dt * (focus ? 4 : 10)));
  camera.lookAt(t.x, t.y + 1.7, t.z);
  const sun = scene.userData.sun; sun.position.set(player.pos.x + 30, player.pos.y + 50, player.pos.z + 20); sun.target.position.copy(player.pos);
}
// atmosphere: fog and sky change with the realm
const cFog = new THREE.Color(), cSky = new THREE.Color(), tc = new THREE.Color();
let curRealm = 0;
function updateAtmosphere(dt) {
  const w = realmWeights(player.pos.x, player.pos.z); let near = 0, far = 0; cFog.setRGB(0, 0, 0); cSky.setRGB(0, 0, 0);
  w.forEach((v, i) => { const r = REALMS[i]; tc.set(r.fog); cFog.r += tc.r * v; cFog.g += tc.g * v; cFog.b += tc.b * v; tc.set(r.sky); cSky.r += tc.r * v; cSky.g += tc.g * v; cSky.b += tc.b * v; near += r.fogNear * v; far += r.fogFar * v; });
  scene.fog.color.lerp(cFog, Math.min(1, dt * 2)); scene.background.lerp(cSky, Math.min(1, dt * 2));
  scene.fog.near += (near - scene.fog.near) * Math.min(1, dt * 2); scene.fog.far += (far - scene.fog.far) * Math.min(1, dt * 2);
  const r = realmAt(player.pos.x, player.pos.z);
  if (r !== curRealm && mode === 'play') {
    curRealm = r; const R = REALMS[r];
    banner(R.name, `Land of ${R.people}`); playMusic(R.music); $('realmName').textContent = R.name;
    if (!S.visited.includes(r)) { S.visited.push(r); gainXP(30); }
  }
  // the nearest town where you can wake up after fainting
  const T = REALMS[r].town; if (Math.hypot(T.x - player.pos.x, T.z - player.pos.z) < 30 && S.town !== r) { S.town = r; save(); }
}


// ======================= ONLINE (one open world) =======================
const PHRASES = ['Hello! 👋', "Let's go!", 'Follow me!', 'Help me, please!', 'Thank you!', 'Good job!', 'Sorry!', 'Wait for me!', 'Where are you?', 'See you later!'];
const PH_ANIM = { 0: 'Waving', 5: 'Cheering', 9: 'Waving' };
const ONL = { peers: new Map(), lastSend: 0, lastPos: null, moving: false, idleT: 0, status: 'off', hiddenT: null };
function myInfo() { return { name: S.name || 'Hero', race: S.race, look: S.look, lvl: S.lvl, x: Math.round(player.pos.x), z: Math.round(player.pos.z), eq: Object.fromEntries(Object.entries(S.eq).map(([k, e]) => [k, e ? [e.id, e.q, e.up] : null])) }; }
function eqFrom(p) { const eq = {}; for (const k in p.eq || {}) { const v = p.eq[k]; eq[k] = v && ITEMS[v[0]] ? { id: v[0], q: v[1], up: Math.min(MAX_UP, +v[2] || 0) } : null; } return eq; }
async function buildPeer(e) {
  const p = e.data, token = (e.token || 0) + 1; e.token = token;
  const c = await makeChar(LOOKS.some(l => l[0] === p.look) ? p.look : 'Knight', { race: RACES[p.race] ? p.race : 'human', strip: true });
  await applyEquip(c, eqFrom(p));
  if (!ONL.peers.has(e.id) || e.token !== token) return;
  const wasVisible = e.c ? e.c.root.visible : false;
  if (e.c) scene.remove(e.c.root);
  e.c = c; c.root.position.copy(e.pos); c.root.rotation.y = e.ry;
  const lb = label(`${String(p.name || 'Hero').slice(0, 14)} · Lv ${p.lvl || 1}`, '#9fe8ff', 26, 3); lb.position.y = 3.1; c.root.add(lb);
  c.root.visible = wasVisible || e.seen; scene.add(c.root);
}
function addPeer(p) {
  if (ONL.peers.has(p.id)) return;
  const pos = new THREE.Vector3(p.x || 0, 0, p.z || 0);
  const e = { id: p.id, c: null, data: p, pos, target: pos.clone(), v: { x: 0, z: 0 }, ry: 0, last: performance.now(), seen: p.x !== undefined };
  ONL.peers.set(p.id, e); buildPeer(e);
}
function removePeer(p) { const e = ONL.peers.get(p.id); if (e) { if (e.c) scene.remove(e.c.root); ONL.peers.delete(p.id); } onlineHUD(); }
function bubble(c, text) {
  if (!c) return;
  const s = label(text, '#ffffff', 30, 3.4); s.position.y = 3.8; c.root.add(s);
  if (c.bubble) c.root.remove(c.bubble); c.bubble = s;
  setTimeout(() => { if (c.bubble === s) { c.root.remove(s); c.bubble = null; } }, 4500);
}
net.on('join', p => { addPeer(p); logLine(`🌐 ${esc(p.name || 'Someone')} joined the world`); onlineHUD(); });
net.on('leave', removePeer);
net.on('update', (p, changed) => { const e = ONL.peers.get(p.id); if (!e) return; e.data = p; if (changed || e.lvl !== p.lvl) { e.lvl = p.lvl; buildPeer(e); } });
net.on('st', m => {
  const e = ONL.peers.get(m.id); if (!e || !isFinite(m.x) || !isFinite(m.z)) return;
  e.target.set(m.x, 0, m.z); e.v = { x: m.vx || 0, z: m.vz || 0 }; e.ry = m.ry || 0; e.last = performance.now();
  if (!e.seen || e.pos.distanceTo(e.target) > 25) e.pos.copy(e.target);
  e.seen = true; if (e.c) e.c.root.visible = true;
});
net.on('say', m => {
  const e = ONL.peers.get(m.id), t = PHRASES[m.p]; if (!e || !t) return;
  bubble(e.c, t); logLine(`💬 ${esc(e.data.name || 'Someone')}: ${esc(t)}`);
  if (e.c && PH_ANIM[m.p]) e.c.play(PH_ANIM[m.p], 0.2, true);
});
net.on('boss', m => {
  const zs = zoneState[m.z]; if (!zs) return;
  const b = zs.mons.find(x => x.d.elite); if (!b || b.dead) return;
  if (m.dead) killMonster(b, !b.hitByMe);
  else if (m.hp < b.hp) { b.hp = Math.max(1, m.hp); monLabel(b); }
});
net.on('status', s => {
  ONL.status = s;
  if (s === 'full') toast('The online world is full (20 players).<br><span style="font-size:.6em">You are playing alone for now. Try again later!</span>', 3500);
  if (s === 'online') { logLine(`🌐 You are online with ${NET_count()} other player(s)`); }
  onlineHUD();
});
const NET_count = () => net.NET.peers.size;
function goOnline() { if (!S.online || mode !== 'play' || net.NET.ch) return; ONL.status = 'connecting'; onlineHUD(); net.connect(myInfo()).then(() => { ONL.lastSend = 0; sendState(true); }); }
function goOffline(why) { net.disconnect(); for (const e of ONL.peers.values()) if (e.c) scene.remove(e.c.root); ONL.peers.clear(); ONL.status = why || 'off'; onlineHUD(); }
function onlineHUD() {
  const el = $('onl'); if (!el) return;
  const on = net.NET.ok;
  el.innerHTML = !S.online ? '🌐 Offline' : on ? `🌐 Online · ${NET_count() + 1} player${NET_count() ? 's' : ''}` : ONL.status === 'connecting' ? '🌐 Connecting…' : ONL.status === 'full' ? '🌐 World full' : ONL.status === 'away' ? '🌐 Away (move to return)' : '🌐 Offline';
  el.classList.toggle('on', on);
  $('chatBtn').classList.toggle('hidden', !on || mode !== 'play');
  if (!on) $('phr').classList.add('hidden');
}
function sendState(force) {
  if (!net.NET.ok) return;
  const now = performance.now(), p = player.pos, moving = ONL.moving;
  const a = player.c?.curName || 'Idle_A';
  if (moving && (force || now - ONL.lastSend > 1500)) {
    const dt = Math.max(0.3, (now - ONL.lastSend) / 1000), lp = ONL.lastPos || p;
    const vx = ONL.lastPos ? (p.x - lp.x) / dt : 0, vz = ONL.lastPos ? (p.z - lp.z) / dt : 0;
    net.send('st', { x: +p.x.toFixed(1), z: +p.z.toFixed(1), ry: +player.ry.toFixed(2), vx: +vx.toFixed(1), vz: +vz.toFixed(1), a });
    ONL.lastSend = now; ONL.lastPos = p.clone(); ONL.sentStop = false;
  } else if (!moving && !ONL.sentStop && now - ONL.lastSend > 300) {
    net.send('st', { x: +p.x.toFixed(1), z: +p.z.toFixed(1), ry: +player.ry.toFixed(2), vx: 0, vz: 0, a: 'Idle_A' });
    ONL.lastSend = now; ONL.lastPos = p.clone(); ONL.sentStop = true;
  }
}
function updatePeers(dt) {
  const now = performance.now();
  for (const e of ONL.peers.values()) {
    if (!e.c) continue;
    const k = Math.min(2, (now - e.last) / 1000);
    const px = e.target.x + e.v.x * k, pz = e.target.z + e.v.z * k;
    e.pos.x += (px - e.pos.x) * Math.min(1, dt * 4); e.pos.z += (pz - e.pos.z) * Math.min(1, dt * 4);
    e.pos.y = H(e.pos.x, e.pos.z);
    const d = e.pos.distanceTo(player.pos), c = e.c;
    c.root.visible = e.seen && d < 140;
    if (!c.root.visible) continue;
    c.root.position.copy(e.pos);
    let dr = e.ry - c.root.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); c.root.rotation.y += dr * Math.min(1, dt * 6);
    const sp = Math.hypot(e.v.x, e.v.z) * (k < 1.9 ? 1 : 0);
    if (performance.now() > c.lockUntil) c.play(sp > 6 ? 'Running_A' : sp > 0.5 ? 'Walking_A' : 'Idle_A', 0.25);
    if (d < 70) { c.mixer.update(dt); pulseGlow(c, clock.elapsedTime); }
  }
}
function sayPhrase(i) {
  if (!net.NET.ok) return;
  net.send('say', { p: i }); bubble(player.c, PHRASES[i]); speak(PHRASES[i].replace(/[^\w' !?,.]/g, ''), 'me', true);
  if (PH_ANIM[i]) player.c.play(PH_ANIM[i], 0.2, true);
  $('phr').classList.add('hidden'); sfx('click', 0.3);
}
function togglePhrases() {
  if (!net.NET.ok || busy()) return;
  const el = $('phr');
  el.innerHTML = PHRASES.map((t, i) => `<button class="btn alt" data-p="${i}"><kbd>${(i + 1) % 10}</kbd> ${esc(t)}</button>`).join('');
  el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => sayPhrase(+b.dataset.p));
  el.classList.toggle('hidden');
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { ONL.hiddenT = setTimeout(() => { if (net.NET.ch) goOffline('away'); }, 60000); }
  else { clearTimeout(ONL.hiddenT); if (ONL.status === 'away') goOnline(); }
});

// ======================= LOOP =======================
const clock = new THREE.Clock(); let frame = 0, slowT = 0;
function loop() { requestAnimationFrame(loop); step(); }
function step() {
  const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
  updatePlayer(dt); if (player.c) player.c.mixer.update(dt);
  for (const N of Object.values(npcs)) { if (!N.c.mixer) continue; const d = Math.hypot(N.pos.x - player.pos.x, N.pos.z - player.pos.z); N.c.root.visible = d < 150; N.holder.visible = d < 60; if (d > 55) continue; N.c.mixer.update(dt); if (performance.now() > N.c.lockUntil) N.c.play('Idle_A', 0.3); }
  if (mode === 'play') { updateMonsters(dt, t); updateProjectiles(dt); updatePeers(dt); sendState(false); if (ONL.idleT > 300 && net.NET.ch) { goOffline('away'); toast('You were away, so you left the online world.<br><span style="font-size:.6em">Move to come back!</span>', 3500); } }
  for (const f of animated) f(t, dt);
  for (const k of picks) if (k.mesh.visible) { k.mesh.rotation.y = t * 1.2; }
  for (const g of groundItems) { g.mesh.userData.sp.position.y = 1.15 + Math.sin(t * 3 + g.pos.x) * 0.12; }
  for (let i = floaters.length - 1; i >= 0; i--) { const f = floaters[i]; f.life -= dt; f.s.position.y += dt * 1.6; f.s.material.opacity = Math.min(1, f.life * 2); if (f.life <= 0) { scene.remove(f.s); floaters.splice(i, 1); } }
  slowT += dt;
  if (mode === 'play') updateAtmosphere(dt);
  if (slowT > 0.3 && mode === 'play') { slowT = 0; updateZones(); checkSteps(); findNear(); refreshMarks(); if (frame % 10 === 0) save(); }
  updateCamera(dt);
  if (hudDirty && mode === 'play') drawHUD();
  if (mode === 'play') { updateArrow(); if (frame & 1) drawMini(t); }
  pulseGlow(player.c, t); if (bagOpen && preview.c) pulseGlow(preview.c, t);
  renderPreview(dt);
  frame++;
  renderer.render(scene, camera);
}

// ======================= MENU =======================
async function setPlayerModel() {
  if (player.c) scene.remove(player.c.root);
  player.c = await makeChar(S.look, { race: S.race, strip: true });
  scene.add(player.c.root); player.c.root.position.copy(player.pos);
  await applyEquip(player.c, menuEquip());
}
/** In the menu, a hero without weapons shows the weapons of the chosen style. */
function menuEquip() { if (mode !== 'menu' || S.eq.weapon) return S.eq; const k = KITS[S.look] || KITS.Knight; return { ...S.eq, weapon: k[0], off: k[1] || null }; }
function buildMenu() {
  $('races').innerHTML = Object.entries(RACES).map(([k, r]) => `<button data-r="${k}" class="${S.race === k ? 'on' : ''}"><span>${RACE_ICON[k]}</span>${r.name}</button>`).join('');
  $('looks').innerHTML = LOOKS.map(([k, n, ic]) => `<button data-l="${k}" class="${S.look === k ? 'on' : ''}"><span>${ic}</span>${n}</button>`).join('');
  $('races').querySelectorAll('button').forEach(b => b.onclick = async () => { sfx('click'); S.race = b.dataset.r; save(); buildMenu(); await setPlayerModel(); player.c.play('Cheering', 0.2, true); });
  $('looks').querySelectorAll('button').forEach(b => b.onclick = async () => { sfx('click'); S.look = b.dataset.l; save(); buildMenu(); await setPlayerModel(); player.c.play('Waving', 0.2, true); });
  const st = student();
  if (st && !S.name && st.first_name) { S.name = String(st.first_name).slice(0, 14); save(); }
  $('pname').value = S.name;
  $('esltStatus').innerHTML = st ? `📊 Hola, <b>${esc(st.first_name || st.name || '')}</b> (${esc(st.section || '')}). Tu profe verá tu avance.` : `⚠️ No has iniciado sesión: tu profe no verá tu avance. <a href="https://eslteacher.cl/" target="_blank" rel="noopener">Entra en eslteacher.cl</a> (Mi perfil) y vuelve a abrir el juego.`;
  $('esltStatus').classList.toggle('warn', !st);
  const nd = QUESTS.filter(q => isDone(q.id)).length;
  $('progressTxt').textContent = nd || S.lvl > 1 ? `Level ${S.lvl} · Missions ${nd}/${QUESTS.length}${S.done ? ' · 🏆' : ''}` : 'A new adventure!';
  $('bPlay').textContent = nd || S.flags.intro ? '▶ Continue' : '▶ Play';
}
$('pname').addEventListener('input', e => { S.name = e.target.value.trim(); save(); });
$('bReset').onclick = async () => { if (!confirm('Start a new game? Your progress will be deleted.')) return; const keep = { name: S.name, race: S.race, look: S.look }; S = Object.assign(fresh(), keep); player.pos.set(3, 0, 10); save(); await setPlayerModel(); refreshMarks(); buildMenu(); };
$('bOpt').onclick = () => { S.voice = !S.voice; save(); toast(`Voice ${S.voice ? 'ON 🔊' : 'OFF 🔇'}`); };
$('bCred').onclick = () => {
  openModal(`<button class="btn alt x" id="xx">✕</button><h2>Credits</h2><div class="doc" style="font-family:Nunito;font-size:15px">
  <b>Wordbound</b> — an English adventure for eslteacher.cl.<br><br>
  <b>3D models and animations:</b> KayKit by Kay Lousberg (Adventurers, Skeletons, Character Animations, Medieval Hexagon, Forest Nature, Halloween Bits, Dungeon, Resource Bits) — CC0 · kaylousberg.itch.io<br>
  <b>Animals:</b> Styloo Animal Asset Pack — styloo.itch.io<br>
  <b>Music:</b> High Quality 16-bit RPG Music by Hydrogene — CC0 · hydrogene.itch.io<br>
  <b>Sound effects:</b> Kenney (Interface Sounds, RPG Audio, Impact Sounds, Music Jingles) — CC0 · kenney.nl<br>
  <b>Voices:</b> the voices of your own device (speech synthesis).<br>
  <b>Engine:</b> three.js (MIT)</div>`);
  $('xx').onclick = closeModal;
};
$('bPlay').onclick = () => start();
function toMenu() {
  mode = 'menu'; endDialog(); goOffline(); $('menu').classList.remove('hidden'); $('hud').classList.add('hidden'); $('touch').classList.add('hidden');
  buildMenu(); playMusic('m_menu');
}
async function start() {
  if (!S.name) { $('pname').focus(); $('pname').style.borderColor = '#d9433b'; toast('Write your name first ✍️'); return; }
  sfx('click'); try { speechSynthesis.cancel(); } catch (e) { }
  mode = 'play'; $('menu').classList.add('hidden'); $('hud').classList.remove('hidden'); if (isTouch) $('touch').classList.remove('hidden');
  if (S.pos) player.pos.set(S.pos[0], 0, S.pos[1]); else player.pos.set(3, 0, 10);
  cam.yaw = player.ry + Math.PI; curRealm = -1; S.hp = Math.max(1, Math.min(S.hp, maxHP()));
  refreshEquip();
  hudDirty = true; refreshMarks();
  goOnline(); onlineHUD();
  if (!S.flags.intro) {
    S.flags.intro = true; save();
    focus = new THREE.Vector3(0, H(0, 0), 0);
    dlgCtx = { tag: '' };
    await line('narrator', `Welcome to the Five Realms, {name}! Here, humans, elves, dwarves, orcs and the Bonefolk live together. For a thousand years they understood each other thanks to the magic Crown of Words.`);
    await line('narrator', 'But something has happened. People are forgetting words. And you have just arrived in Brightwater, the human town in the middle of the land...');
    await line('narrator', 'Talk to people with a gold ! above their heads. Listen to them (🔊), read carefully and choose your answers well. Click on underlined words if you need help in Spanish.');
    endDialog(); await openDoc('how_to_play');
  }
  checkAuto(); hudDirty = true;
}

// ======================= BOOT =======================
setProgress(p => { $('lbar').style.width = `${Math.round(p * 100)}%`; });
(async () => {
  await buildWorld();
  await setupNPCs();
  buildPicks();
  beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 50, 14, 1, true), new THREE.MeshBasicMaterial({ color: '#ffd84a', transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide }));
  beacon.visible = false; scene.add(beacon);
  if (S.pos) player.pos.set(S.pos[0], 0, S.pos[1]);
  await setPlayerModel();
  makeThumbs();
  camera.position.set(0, 8, 24);
  $('loading').classList.add('hidden');
  refreshMarks(); buildMenu(); $('menu').classList.remove('hidden');
  playMusic('m_menu');
  loop();
  if (location.search.includes('debug')) window.WB = { net, ONL, sayPhrase, get st() { return { mode, dlgOpen, modalOpen, near: near && near.label, slowT } }, player, cam, get S() { return S; }, set S(v) { S = v; }, QBY, talkTo, addItem, monsters, npcs, startQuest, advance, complete, refreshMarks, step, save, interact, attack, ITEMS };
})();
