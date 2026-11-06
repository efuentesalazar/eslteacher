import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { load, shadowize, M } from './core.js';
import { ITEMS, entry, glowOf } from './data/items.js';

// KayKit characters share one rig (Rig_Medium), so body parts of one character
// (helmet, armour, cape) can be worn by another one. That is how equipment is shown.
export const PREFIX = { Knight: 'Knight', Mage: 'Mage', Barbarian: 'Barbarian', Ranger: 'Ranger', Rogue: 'Rogue', Rogue_Hooded: 'RogueHooded', Skeleton_Warrior: 'Skeleton_Warrior', Skeleton_Minion: 'Skeleton_Minion', Skeleton_Rogue: 'Skeleton_Rogue', Skeleton_Mage: 'Skeleton_Mage' };
const BODY = ['Body', 'ArmLeft', 'ArmRight', 'LegLeft', 'LegRight'];
const EXTRA = ['Helmet', 'HelmetVisor', 'Hat', 'BearHat', 'Cape', 'Quiver', 'Mask', 'Hood', 'Cloak'];
export const RACES = {
  human: { name: 'Human', scale: [1, 1, 1] },
  elf: { name: 'Elf', scale: [0.97, 1.06, 0.97] },
  dwarf: { name: 'Dwarf', scale: [1.14, 0.84, 1.14] },
  orc: { name: 'Orc', scale: [1.08, 1.04, 1.08], skin: '#76b84f' }
};

let animClips = null;
async function clips() {
  if (!animClips) animClips = Promise.all(['General', 'MovementBasic', 'CombatMelee', 'CombatRanged', 'Simulation', 'Special'].map(n => load(`assets/chars/anim_${n}.glb`)))
    .then(gs => { const m = {}; gs.forEach(g => g && g.animations.forEach(c => { if (c.name !== 'T-Pose') m[c.name] = c; })); return m; });
  return animClips;
}
const ONCE = /Attack|Shoot|Release|Hit_|Death|Jump_Start|Jump_Land|PickUp|Interact|Use_Item|Throw|Cheering|Waving|Awaken|Taunt|Spellcasting$|Raise|Summon|Block_Hit/;

function partName(model, p) { return `${PREFIX[model]}_${p}`; }
function findPart(root, name) { let f = null; root.traverse(o => { if (!f && o.name === name) f = o; }); return f; }
function meshesOf(node) { const a = []; if (!node) return a; node.traverse(o => { if (o.isMesh) a.push(o); }); return a; }

/**
 * Build an animated character.
 * opt: {race, tint, strip (remove hats/capes), skin, scale}
 */
export async function makeChar(model, opt = {}) {
  const g = await load(`assets/chars/${model}.glb`);
  const root = SkeletonUtils.clone(g.scene);
  shadowize(root);
  root.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.frustumCulled = false; } });
  if (opt.tint) root.traverse(m => { if (m.isMesh) m.material.color.lerp(new THREE.Color(opt.tint), opt.tintK ?? 0.6); });
  const bones = {}; root.traverse(o => { if (o.isBone || /^handslot\.[lr]$|^head$/.test(o.name)) { if (!bones[o.name] || o.isBone) bones[o.name] = o; } });
  let rig = null; root.traverse(o => { if (!rig && o.name.startsWith('Rig_')) rig = o; });
  const c = { root, model, bones, rig: rig || root, equipMeshes: {}, held: {}, hidden: new Set(), cur: null, lockUntil: 0 };
  if (opt.strip) for (const p of EXTRA) { const n = findPart(root, partName(model, p)); if (n) n.visible = false; }
  const race = RACES[opt.race];
  if (race) {
    c.root.scale.set(...race.scale);
    const skin = opt.skin || race.skin;
    if (skin) for (const p of ['Head', 'ArmLeft', 'ArmRight']) meshesOf(findPart(root, partName(model, p))).forEach(m => m.material.color.lerp(new THREE.Color(skin), p === 'Head' ? 0.55 : 0.25));
    raceExtras(c, opt.race);
  }
  if (opt.scale) c.root.scale.multiplyScalar(opt.scale);
  const mixer = new THREE.AnimationMixer(root);
  const cl = await clips();
  const actions = {};
  for (const k in cl) { actions[k] = mixer.clipAction(cl[k]); if (ONCE.test(k)) { actions[k].setLoop(THREE.LoopOnce); actions[k].clampWhenFinished = true; } }
  Object.assign(c, { mixer, actions });
  c.play = (name, fade = 0.2, once = false, speed = 1) => {
    const a = actions[name]; if (!a) return;
    if (c.cur === a && !once) return;
    a.reset().setEffectiveTimeScale(speed).fadeIn(fade).play();
    if (c.cur && c.cur !== a) c.cur.fadeOut(fade);
    c.cur = a; c.curName = name;
    if (once) c.lockUntil = performance.now() + a.getClip().duration * 1000 / speed * 0.85;
  };
  c.play('Idle_A', 0);
  return c;
}

/** Pointy ears, beards and tusks, attached to the head bone. */
function raceExtras(c, race) {
  const head = c.bones.head; if (!head) return;
  const skinM = M(race === 'orc' ? '#76b84f' : '#f2c6a0');
  if (race === 'elf') {
    for (const s of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.42, 5), skinM);
      ear.position.set(0.5 * s, 0.5, -0.02); ear.rotation.z = -s * 1.15; ear.rotation.x = -0.2; ear.castShadow = true; head.add(ear);
    }
  } else if (race === 'dwarf') {
    const beardM = M('#8a4b22');
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.26, 0.22), beardM); b1.position.set(0, 0.13, 0.43); b1.castShadow = true; head.add(b1);
    const b2 = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.42, 6), beardM); b2.position.set(0, -0.1, 0.42); b2.rotation.x = Math.PI; b2.castShadow = true; head.add(b2);
    const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.1), beardM); m1.position.set(0, 0.3, 0.52); head.add(m1);
  } else if (race === 'orc') {
    for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 5), M('#fffbe8')); t.position.set(0.15 * s, 0.3, 0.5); t.rotation.x = -0.15; head.add(t); }
  }
}

// ---------- equipment ----------
/** The hand bone where weapons go (three.js removes the dot from "handslot.r"). */
export function handSlot(c, side) { return c.bones['handslot.' + side] || c.bones['handslot' + side]; }
async function partsFrom(model) { const g = await load(`assets/chars/${model}.glb`); return g ? g.scene : null; }

/** Copy skinned meshes of another character onto this one (same rig). */
async function transplant(c, srcModel, parts, tint, tintK = 0.55) {
  const src = await partsFrom(srcModel); if (!src) return [];
  src.updateMatrixWorld(true);
  const out = [];
  for (const p of parts) {
    const node = findPart(src, partName(srcModel, p)); if (!node) continue;
    for (const sm of meshesOf(node)) {
      if (!sm.isSkinnedMesh) continue;
      const mat = sm.material.clone(); if (tint) mat.color.lerp(new THREE.Color(tint), tintK);
      const m = new THREE.SkinnedMesh(sm.geometry, mat);
      m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
      m.position.copy(sm.position); m.quaternion.copy(sm.quaternion); m.scale.copy(sm.scale);
      const bones = sm.skeleton.bones.map(b => c.bones[b.name] || c.bones.root);
      c.rig.add(m);
      m.bind(new THREE.Skeleton(bones, sm.skeleton.boneInverses), sm.bindMatrix);
      out.push(m);
    }
  }
  return out;
}

function setOwnVisible(c, parts, vis) { for (const p of parts) { const n = findPart(c.root, partName(c.model, p)); if (n && !EXTRA.includes(p)) n.visible = vis; } }

const heldCache = {};
async function heldModel(file) { const g = await load(`assets/items/${file}.gltf`); return g ? g.scene : null; }

/** Make the materials of an object glow (upgraded equipment). Returns the list to animate. */
function addGlow(c, objs, g) {
  if (!g) return;
  for (const root of objs) root.traverse(m => {
    if (!m.isMesh) return;
    m.material = m.material.clone(); m.material.emissive = new THREE.Color(g.color);
    c.glow.push({ mat: m.material, k: g.k });
  });
  if (g.sparkle && objs[0]) { const root = objs[0];
    const n = 14, pos = new Float32Array(n * 3), seeds = []; for (let i = 0; i < n; i++) seeds.push([Math.random() * 6.28, Math.random(), Math.random()]);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: g.color, size: 0.09, transparent: true, depthWrite: false }));
    pts.frustumCulled = false; (root.isSkinnedMesh ? c.rig : root).add(pts);
    c.sparkles.push({ pts, pos, seeds, skinned: root.isSkinnedMesh });
  }
}
/** Called every frame: pulsing glow and sparkles. */
export function pulseGlow(c, t) {
  if (!c || !c.glow) return;
  const p = 0.65 + 0.35 * Math.sin(t * 3.2);
  for (const g of c.glow) g.mat.emissiveIntensity = g.k * p;
  for (const s of c.sparkles) {
    for (let i = 0; i < s.seeds.length; i++) {
      const [a, o, h] = s.seeds[i], k = (t * 0.6 + o) % 1, r = s.skinned ? 0.9 : 0.35;
      s.pos[i * 3] = Math.cos(a + t * 1.5) * r; s.pos[i * 3 + 1] = (s.skinned ? 0.5 : 0) + h * (s.skinned ? 2.2 : 1.2) + k * 0.4; s.pos[i * 3 + 2] = Math.sin(a + t * 1.5) * r;
    }
    s.pts.geometry.attributes.position.needsUpdate = true; s.pts.material.opacity = 0.9;
  }
}

/**
 * Show equipment on a character. eq = {head, body, cape, weapon, off}: {id, q, up} (or item ids) or null
 */
export async function applyEquip(c, eq) {
  c.equipToken = (c.equipToken || 0) + 1; const token = c.equipToken;
  const built = {}, E = {};
  for (const slot of ['head', 'body', 'cape', 'weapon', 'off']) E[slot] = eq[slot] ? entry(eq[slot]) : null;
  for (const slot of ['head', 'body', 'cape']) {
    const it = E[slot] && ITEMS[E[slot].id];
    built[slot] = it && it.wear ? await transplant(c, it.wear.from, it.wear.parts, it.tint, it.tintK) : [];
  }
  const held = {};
  for (const slot of ['weapon', 'off']) {
    const it = E[slot] && ITEMS[E[slot].id];
    if (it && it.model) { const s = await heldModel(it.model); if (s) { const o = s.clone(true); if (it.tint) o.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.lerp(new THREE.Color(it.tint), it.tintK ?? 0.5); } }); shadowize(o); held[slot] = { o, hand: it.hand || (slot === 'off' ? 'l' : 'r') }; } }
  }
  if (token !== c.equipToken) { Object.values(built).flat().forEach(m => m.parent && m.parent.remove(m)); return; }
  // remove old
  for (const k in c.equipMeshes) c.equipMeshes[k].forEach(m => m.parent && m.parent.remove(m));
  for (const k in c.held) { const h = c.held[k]; if (h && h.o.parent) h.o.parent.remove(h.o); }
  for (const s of c.sparkles || []) s.pts.parent && s.pts.parent.remove(s.pts);
  c.equipMeshes = built; c.held = {}; c.glow = []; c.sparkles = [];
  setOwnVisible(c, BODY, !built.body.length);
  for (const slot in held) { const h = held[slot], bone = handSlot(c, h.hand === 'l' ? 'l' : 'r'); if (bone) { bone.add(h.o); c.held[slot] = h; } }
  for (const slot of ['head', 'body', 'cape']) if (E[slot]) addGlow(c, built[slot], glowOf(E[slot]));
  for (const slot of ['weapon', 'off']) if (E[slot] && held[slot]) addGlow(c, [held[slot].o], glowOf(E[slot]));
}

/** Give an NPC or enemy weapons directly (file names in assets/items). */
export async function holdItems(c, right, left) {
  for (const [file, side] of [[right, 'r'], [left, 'l']]) {
    const slot = handSlot(c, side); if (!file || !slot) continue;
    const s = await heldModel(file); if (!s) continue; const o = s.clone(true); shadowize(o); slot.add(o);
  }
}

// ---------- creatures ----------
/** A cute jelly slime (procedural). */
export function makeSlime(color, size = 1) {
  const root = new THREE.Group();
  const body = new THREE.Group(); root.add(body);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.25, metalness: 0.05, transparent: true, opacity: 0.88, flatShading: true });
  const blob = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 9, 0, Math.PI * 2, 0, Math.PI * 0.62), mat);
  blob.scale.set(1, 0.95, 1); blob.position.y = 0.05; blob.castShadow = true; body.add(blob);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.62, 0.12, 12), mat); base.position.y = 0.06; body.add(base);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), M(new THREE.Color(color).offsetHSL(0, 0, -0.2), { emissive: color, emissiveIntensity: 0.3 })); core.position.y = 0.35; body.add(core);
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), M('#ffffff')); e.position.set(0.2 * s, 0.5, 0.48); body.add(e);
    const p = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), M('#1b1030')); p.position.set(0.2 * s, 0.5, 0.57); body.add(p);
  }
  root.scale.setScalar(size * 1.3);
  return { root, body, slime: true, play() {}, mixer: null, lockUntil: 0 };
}

/** Animated animal from Styloo (dog, cow, chicken, cat). */
export async function makeAnimal(file, h, tint) {
  const g = await load(`assets/animals/${file}.glb`);
  const root = new THREE.Group();
  const inner = SkeletonUtils.clone(g.scene); shadowize(inner);
  inner.traverse(m => { if (m.isMesh) { m.frustumCulled = false; if (tint) { m.material = m.material.clone(); m.material.color.lerp(new THREE.Color(tint), 0.55); } } });
  const box = new THREE.Box3().setFromObject(inner), s = h / Math.max(0.01, box.max.y - box.min.y);
  inner.scale.setScalar(s); inner.position.y = -box.min.y * s; root.add(inner);
  const mixer = new THREE.AnimationMixer(inner), actions = {};
  g.animations.forEach(a => { actions[a.name] = mixer.clipAction(a); if (/attack|jump/i.test(a.name)) { actions[a.name].setLoop(THREE.LoopOnce); actions[a.name].clampWhenFinished = true; } });
  const c = { root, mixer, actions, cur: null, lockUntil: 0, animal: true };
  const alias = { Idle_A: ['iddle', 'idle', 'Idle'], Walking_A: ['walk', 'Walk'], Running_A: ['run', 'Run', 'walk'], Attack: ['attack1', 'attack', 'Attack'], Hit_A: [], Death_A: [] };
  c.play = (name, fade = 0.2, once = false) => {
    const list = alias[name] || [name]; let a = null; for (const n of list) if (actions[n]) { a = actions[n]; break; }
    if (!a) a = Object.values(actions)[0]; if (!a || c.cur === a && !once) return;
    a.reset().fadeIn(fade).play(); if (c.cur && c.cur !== a) c.cur.fadeOut(fade); c.cur = a;
    if (once) c.lockUntil = performance.now() + a.getClip().duration * 850;
  };
  c.play('Idle_A', 0);
  return c;
}
