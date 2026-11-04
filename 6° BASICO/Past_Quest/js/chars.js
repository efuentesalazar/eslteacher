// Characters: Quaternius base head + fantasy outfit + hairstyle, all bound to one skeleton
// and animated with the Universal Animation Library.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const loader = new GLTFLoader();
export const LIB = { parts: {}, clips: {}, tex: {} };
const FILES = ['chars-base', 'chars-outfits', 'chars-hair', 'anims', 'village', 'nature', 'props', 'platformer'];

export async function loadLibrary(onProgress) {
  let done = 0;
  const tl = new THREE.TextureLoader();
  const tex = async (n) => { const t = await tl.loadAsync(`assets/textures/${n}.webp`); t.flipY = false; t.colorSpace = THREE.SRGBColorSpace; return t; };
  await Promise.all([
    ...FILES.map(async f => {
      const g = await loader.loadAsync(`assets/models/${f}.glb`);
      LIB[f] = g;
      // GLTFLoader makes duplicate names unique (pelvis_1...). Restore the original names so bones match.
      const nodes = g.parser.json.nodes;
      g.scene.traverse(o => {
        const a = g.parser.associations.get(o);
        if (a && a.nodes !== undefined && nodes[a.nodes].name) o.name = THREE.PropertyBinding.sanitizeNodeName(nodes[a.nodes].name);
      });
      for (const c of g.scene.children) LIB.parts[c.name] = c;
      onProgress && onProgress(++done / (FILES.length + 2));
    }),
    tex('ranger_alt').then(t => { LIB.tex.Ranger = t; onProgress && onProgress(++done / (FILES.length + 2)); }),
    tex('peasant_alt').then(t => { LIB.tex.Peasant = t; onProgress && onProgress(++done / (FILES.length + 2)); }),
  ]);
  for (const a of LIB.anims.animations) {
    a.tracks = a.tracks.filter(t => !t.name.startsWith('root.'));
    LIB.clips[a.name] = a;
  }
  // Static models cast/receive shadows.
  for (const f of ['village', 'nature', 'props', 'platformer']) LIB[f].scene.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // Nature vertex colours hold wind data, not colour.
  LIB.nature.scene.traverse(o => { if (o.isMesh) { o.material.vertexColors = false; o.material.needsUpdate = true; } });
}

export const SKINS = [1.35, 1.0, 0.62];          // light, medium, dark (multiplies the skin texture)
export const HAIRS = ['Hair_SimpleParted', 'Hair_Long', 'Hair_Buns', 'Hair_Buzzed', 'Hair_BuzzedFemale', 'none'];
export const HAIR_COLORS = [0x2a1a0a, 0x5a2a0a, 0xa0522d, 0xe0b050, 0x111111, 0xb03020, 0xdddddd, 0x3a6ad0];

const matCache = new Map();
function material(src, key, fn) {
  const k = src.uuid + '|' + key;
  if (!matCache.has(k)) { const m = src.clone(); fn(m); matCache.set(k, m); }
  return matCache.get(k);
}

// Copy skinned meshes of a part onto the target skeleton (bones matched by name).
function graft(part, bones, parent, matFn) {
  part.traverse(o => {
    if (!o.isSkinnedMesh) return;
    const sk = new THREE.Skeleton(o.skeleton.bones.map(b => bones[b.name]), o.skeleton.boneInverses);
    const m = new THREE.SkinnedMesh(o.geometry, matFn ? matFn(o.material) : o.material);
    m.name = o.name;
    m.position.copy(o.position); m.quaternion.copy(o.quaternion); m.scale.copy(o.scale);
    m.castShadow = true; m.frustumCulled = false;
    parent.add(m);
    m.bind(sk, o.bindMatrix);
  });
}

export class Character {
  // look: {sex:'m'|'f', outfit:'Ranger'|'Peasant', alt, hair, hairColor, skin, tint}
  constructor(look) {
    this.look = look;
    this.root = new THREE.Group();
    const base = SkeletonUtils.clone(LIB.parts[look.sex === 'f' ? 'base_f' : 'base_m']);
    this.model = base;
    this.root.add(base);
    const bones = {};
    base.traverse(o => { if (o.isBone) bones[o.name] = o; });
    this.bones = bones;
    const skinMul = SKINS[look.skin ?? 1];
    const hairCol = new THREE.Color(look.hairColor ?? 0x2a1a0a);
    const skinFn = m => material(m, 'skin' + skinMul, x => x.color.setScalar(skinMul));
    const meshParent = base.getObjectByName('Armature') || base;
    base.traverse(o => {
      if (!o.isSkinnedMesh) return;
      o.castShadow = true; o.frustumCulled = false;
      if (/Superhero/i.test(o.material.name)) o.material = skinFn(o.material);
      if (/Hair/i.test(o.material.name)) o.material = material(o.material, 'hair' + hairCol.getHex(), x => { x.map = null; x.color.copy(hairCol); });
    });
    // Outfit
    const outfit = LIB.parts[(look.sex === 'f' ? 'Female_' : 'Male_') + (look.outfit || 'Ranger')];
    graft(outfit, bones, meshParent, m => {
      if (/Regular/i.test(m.name)) return skinFn(m);
      if (look.alt || look.tint) return material(m, 'alt' + !!look.alt + (look.tint || ''), x => {
        if (look.alt) { x.map = LIB.tex[look.outfit || 'Ranger']; }
        if (look.tint) x.color.set(look.tint);
      });
      return m;
    });
    // Hair
    if (look.hair && look.hair !== 'none' && LIB.parts[look.hair]) {
      if (!(look.outfit === 'Ranger' && look.hair === 'Hair_Long'))
        graft(LIB.parts[look.hair], bones, meshParent, m => material(m, 'hair' + hairCol.getHex(), x => { x.map = null; x.color.copy(hairCol); }));
    }
    this.mixer = new THREE.AnimationMixer(base);
    this.actions = {};
    this.current = null;
    this.play('Idle_Loop', 0);
  }
  action(name) {
    if (!this.actions[name]) { const c = LIB.clips[name]; if (!c) return null; this.actions[name] = this.mixer.clipAction(c); }
    return this.actions[name];
  }
  play(name, fade = 0.2, { once = false, speed = 1, then = 'Idle_Loop' } = {}) {
    const a = this.action(name); if (!a) return;
    if (this.current === a && !once) { a.timeScale = speed; return; }
    a.reset(); a.timeScale = speed;
    a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    a.clampWhenFinished = once;
    if (this.current && this.current !== a) this.current.crossFadeTo(a, fade, false);
    a.play();
    this.current = a; this.currentName = name;
    if (once) {
      const dur = a.getClip().duration / speed;
      clearTimeout(this._t);
      this._t = setTimeout(() => { if (this.current === a) this.play(then, 0.25); }, Math.max(0, dur - 0.25) * 1000);
    }
  }
  update(dt) { this.mixer.update(dt); }
}

// Static model clone by name (shares geometry/material).
export function model(name, scale = 1) {
  const src = LIB.parts[name];
  if (!src) { console.warn('missing model', name); return new THREE.Group(); }
  let skinned = false; src.traverse(o => { if (o.isSkinnedMesh) skinned = true; });
  const m = skinned ? SkeletonUtils.clone(src) : src.clone(true);
  m.scale.setScalar(scale);
  return m;
}
