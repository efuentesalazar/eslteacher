// The world: six zones from south (village) to north (Mortimer's tower). North is -z.
import * as THREE from 'three';
import { model, LIB } from './chars.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Seeded random so the world is the same for everybody (also online).
let seed = 12345;
const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const rr = (a, b) => a + rnd() * (b - a);
const pathX = z => Math.sin(z * 0.035) * 3 * (1 - Math.min(1, Math.max(0, 1 - (Math.abs(z + 186) - 22) / 10)));

export const ZONES = [
  { ch: 1, z0: 34, z1: -44, sky: 0x8ec9ff, fog: 0xcfe6ff, near: 40, far: 140, hemi: 1.5, sun: 0xfff1d6, sunI: 2.4, ground: [0x6fae4a, 0x86bf55] },
  { ch: 2, z0: -44, z1: -112, sky: 0x46664e, fog: 0x3f5c48, near: 12, far: 70, hemi: 0.9, sun: 0xc8e0b0, sunI: 1.1, ground: [0x3d6b33, 0x4b7c3a] },
  { ch: 3, z0: -112, z1: -152, sky: 0x9fd4f0, fog: 0xc8e8f4, near: 30, far: 120, hemi: 1.4, sun: 0xffffff, sunI: 2.2, ground: [0x67a84c, 0x7cb85a] },
  { ch: 4, z0: -152, z1: -214, sky: 0x9fb4d0, fog: 0xb8c6d8, near: 30, far: 120, hemi: 1.2, sun: 0xfff0e0, sunI: 2.0, ground: [0x7a9a55, 0x8aa863] },
  { ch: 5, z0: -214, z1: -276, sky: 0xffc98a, fog: 0xffe0b8, near: 35, far: 130, hemi: 1.5, sun: 0xffd9a0, sunI: 2.4, ground: [0x8ab05a, 0x9cc068] },
  { ch: 6, z0: -276, z1: -336, sky: 0x2a1840, fog: 0x3a2050, near: 10, far: 65, hemi: 0.7, sun: 0xc0a0ff, sunI: 0.9, ground: [0x3a3a42, 0x4a4450] },
];
export const zoneAt = z => ZONES.find(Z => z <= Z.z0 && z > Z.z1) || (z > 0 ? ZONES[0] : ZONES[5]);

// Positions of NPCs, spawn points and scrolls.
export const SPOTS = {
  spawn: { 1: [0, 24], 2: [0, -48], 3: [0, -116], 4: [0, -156], 5: [0, -218], 6: [0, -280] },
  npc: {
    rose: [3, 14, Math.PI], bella: [-8.5, -1, Math.PI / 2], tom: [-20, 15, Math.PI / 2], lee: [9, -15, -Math.PI / 2], max: [5, -36, Math.PI],
    leo: [3, -52, Math.PI], mia: [-8, -79, Math.PI / 2], nico: [11, -94, -Math.PI / 2], sam: [-14, -62, Math.PI / 2], ivy: [13, -69, -Math.PI / 2],
    ana: [5, -119, Math.PI], pete: [-13, -131, 0], crab: [11, -132, 0], kai: [-4, -128, Math.PI / 2],
    maya: [0, -196, 0], ben: [-11, -184, Math.PI / 2], lola: [11, -184, -Math.PI / 2], owen: [9, -199, -Math.PI / 4],
    zara: [4, -221, Math.PI], omar: [-9, -238, Math.PI / 2], lily: [11, -250, -Math.PI / 2], hugo: [-7, -259, Math.PI / 2], tess: [8, -266, -Math.PI / 2],
    mortimer: [0, -306, 0],
  },
  scrolls: {
    1: [[-24, 4], [22, 8], [-6, -26], [24, -30], [-26, -38], [16, 26]],
    2: [[-20, -56], [20, -60], [-2, -70], [24, -86], [-22, -100], [6, -106]],
    3: [[-26, -118], [22, -122], [-20, -130], [26, -132], [14, -116], [-8, -120]],
    4: [[-26, -160], [24, -168], [-14, -200], [15, -192], [-4, -176], [24, -208]],
    5: [[-26, -224], [24, -232], [-18, -268], [20, -242], [0, -256], [-24, -250]],
    6: [[-20, -284], [20, -288], [-24, -298], [22, -300], [-12, -292], [12, -294]],
  },
};

export const GATES = [ // fog walls; open when chapter `ch` is complete
  { z: -44, ch: 1 }, { z: -112, ch: 2 }, { z: -214, ch: 4 }, { z: -276, ch: 5 },
];

export class World {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.gates = [];
    this.anim = [];   // per-frame callbacks (water, fog, fire)
    this.root = new THREE.Group();
    scene.add(this.root);
    this.inst = new Map(); // instanced scatter: name -> matrices
    seed = 12345;
    this.ground(); this.paths(); this.bounds();
    this.village(); this.forest(); this.river(); this.castle(); this.market(); this.tower();
    this.flushInstances();
    for (const g of GATES) this.addGate(g);
    this.optimize();
  }

  // Merge static meshes by material and 40 m chunk: thousands of draw calls become a few dozen.
  optimize() {
    this.root.updateMatrixWorld(true);
    const groups = new Map(), wp = new THREE.Vector3();
    this.root.traverse(o => {
      if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || Array.isArray(o.material) || o.material.isShaderMaterial) return;
      for (let p = o; p && p !== this.root; p = p.parent) if (p.userData.dynamic) return;
      const g = o.geometry; if (g.morphAttributes && Object.keys(g.morphAttributes).length) return;
      const chunk = Math.floor(o.getWorldPosition(wp).z / 30);
      const key = [o.material.uuid, chunk, Object.keys(g.attributes).sort().join(','), !!g.index, o.castShadow].join('|');
      if (!groups.has(key)) groups.set(key, []); groups.get(key).push(o);
    });
    let before = 0, after = 0;
    for (const list of groups.values()) {
      before += list.length;
      if (list.length < 2) { after++; continue; }
      const geos = list.map(o => { const g = o.geometry.clone(); g.applyMatrix4(o.matrixWorld); return g; });
      const merged = mergeGeometries(geos, false);
      geos.forEach(g => g.dispose());
      if (!merged) { after += list.length; continue; }
      const m = new THREE.Mesh(merged, list[0].material);
      m.castShadow = list[0].castShadow; m.receiveShadow = true;
      this.root.add(m);
      for (const o of list) o.parent.remove(o);
      after++;
    }
    console.log('world meshes', before, '->', after);
  }

  /* ---------- helpers ---------- */
  put(name, x, z, ry = 0, s = 1, y = 0, parent = this.root) {
    const m = model(name, s); m.position.set(x, y, z); m.rotation.y = ry; parent.add(m); return m;
  }
  circle(x, z, r) { this.colliders.push({ t: 'c', x, z, r }); }
  box(x0, x1, z0, z1, tag) { const b = { t: 'b', x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1), tag }; this.colliders.push(b); return b; }
  scatter(name, x, z, s = 1, ry = rnd() * Math.PI * 2) {
    if (!this.inst.has(name)) this.inst.set(name, []);
    this.inst.get(name).push(new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry), new THREE.Vector3(s, s, s)));
  }
  flushInstances() {
    const p = new THREE.Vector3();
    for (const [name, all] of this.inst) {
      const src = LIB.parts[name]; if (!src) continue;
      src.updateMatrixWorld(true);
      const inv = src.matrixWorld.clone().invert();
      // split by 30 m chunks so far-away trees are culled
      const chunks = new Map();
      for (const m of all) { p.setFromMatrixPosition(m); const k = Math.floor(p.z / 30); if (!chunks.has(k)) chunks.set(k, []); chunks.get(k).push(m); }
      for (const list of chunks.values()) src.traverse(o => {
        if (!o.isMesh) return;
        const rel = inv.clone().multiply(o.matrixWorld);
        const im = new THREE.InstancedMesh(o.geometry, o.material, list.length);
        list.forEach((m, i) => im.setMatrixAt(i, m.clone().multiply(rel)));
        im.castShadow = !/Grass|Clover|Flower|Fern|Pebble|RockPath/.test(name); im.receiveShadow = true;
        im.computeBoundingSphere();
        this.root.add(im);
      });
    }
  }
  tree(x, z, kind, s = 1) { this.scatter(kind, x, z, s * rr(0.85, 1.2)); if (!/Bush|Grass|Flower|Fern|Mushroom|Clover|Plant|Pebble/.test(kind)) this.circle(x, z, 0.7 * s); }
  freeSpot(x, z, minPath = 5) { return Math.abs(x - pathX(z)) > minPath; }

  /* ---------- base terrain ---------- */
  ground() {
    const W = 110, L = 380, g = new THREE.PlaneGeometry(W, L, 55, 190);
    g.rotateX(-Math.PI / 2); g.translate(0, 0, -151);
    const col = [], c = new THREE.Color(), pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), Z = zoneAt(z);
      c.set(Z.ground[0]).lerp(new THREE.Color(Z.ground[1]), (Math.sin(x * 0.3) * Math.cos(z * 0.23) + 1) / 2 * 0.8 + rnd() * 0.2);
      if (Math.abs(x) > 36) { c.multiplyScalar(0.85); pos.setY(i, (Math.abs(x) - 36) * 0.25 * (0.6 + 0.4 * Math.sin(z * 0.2))); }
      col.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }));
    m.receiveShadow = true; this.root.add(m);
  }
  paths() {
    const pts = [], col = [], idx = [];
    const c1 = new THREE.Color(0xc9a46a), c2 = new THREE.Color(0xb08850);
    let i = 0;
    for (let z = 34; z >= -330; z -= 2, i++) {
      const x = pathX(z), w = 2.2 + Math.sin(z * 0.4) * 0.3;
      pts.push(x - w, 0.03, z, x + w, 0.03, z);
      const c = (i % 2 ? c1 : c2).clone(); if (z < -276) c.multiplyScalar(0.45); col.push(c.r, c.g, c.b, c.r, c.g, c.b);
      if (i > 0) idx.push(2 * i - 2, 2 * i - 1, 2 * i, 2 * i - 1, 2 * i + 1, 2 * i);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true })); m.receiveShadow = true; this.root.add(m);
    // plazas
    const plaza = (x, z, r, color) => { const p = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshLambertMaterial({ color })); p.rotation.x = -Math.PI / 2; p.position.set(x, 0.04, z); p.receiveShadow = true; this.root.add(p); };
    plaza(0, 0, 9, 0xbfa77d); plaza(0, -245, 11, 0xc9b089); plaza(0, -186, 12, 0xb8a888); plaza(0, -304, 9, 0x4a4256);
  }
  bounds() {
    this.box(-60, -34, 40, -340); this.box(34, 60, 40, -340);
    this.box(-60, 60, 34, 45); this.box(-60, 60, -334, -345);
    // tree walls along the borders
    for (let z = 32; z > -330; z -= 5) for (const side of [-1, 1]) {
      const x = side * rr(34, 40), Z = zoneAt(z);
      const kind = Z.ch === 6 ? 'DeadTree_' + (1 + Math.floor(rnd() * 2)) : Z.ch === 2 ? 'Pine_' + (1 + Math.floor(rnd() * 3)) : (rnd() < 0.5 ? 'CommonTree_' + (1 + Math.floor(rnd() * 4)) : 'Pine_' + (1 + Math.floor(rnd() * 3)));
      this.scatter(kind, x, z, rr(1, 1.4));
      if (rnd() < 0.6) this.scatter('Bush_Common', x - side * rr(2, 4), z + rr(-2, 2), rr(1, 1.6));
    }
  }

  /* ---------- buildings ---------- */
  house(x, z, ry, { brick = false, roof = true, w = 3 } = {}) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.rotation.y = ry; this.root.add(G);
    const H = w; // half size (w=3 -> 6x6)
    const st = brick ? 'Wall_UnevenBrick_' : 'Wall_Plaster_';
    const xs = H === 3 ? [-2, 0, 2] : [-1, 1];
    for (const a of xs) {
      this.put(a === 0 || (H === 2 && a === 1) ? st + 'Door_Round' : st + 'Window_Wide_Round', a, H, 0, 1, 0, G);
      this.put(rnd() < 0.5 ? st + 'Straight' : st + 'Window_Wide_Round', a, -H, Math.PI, 1, 0, G);
      this.put(brick ? st + 'Straight' : (rnd() < 0.4 ? 'Wall_Plaster_WoodGrid' : st + 'Straight'), -H, a, -Math.PI / 2, 1, 0, G);
      this.put(st + (rnd() < 0.5 ? 'Straight' : 'Window_Wide_Round'), H, a, Math.PI / 2, 1, 0, G);
    }
    for (const [cx, cz] of [[-H, -H], [H, -H], [-H, H], [H, H]]) this.put(brick ? 'Corner_Exterior_Brick' : 'Corner_Exterior_Wood', cx, cz, 0, 1, 0, G);
    if (roof) {
      if (H === 3) { this.put('Roof_RoundTiles_6x6', 0, 0, 0, 1, 3.05, G); this.put('Roof_Front_Brick6', 0, H, 0, 1, 3.05, G); this.put('Roof_Front_Brick6', 0, -H, Math.PI, 1, 3.05, G); }
      else { this.put('Roof_RoundTiles_4x4', 0, 0, 0, 1, 3.05, G); this.put('Roof_Front_Brick4', 0, H, 0, 1, 3.05, G); this.put('Roof_Front_Brick4', 0, -H, Math.PI, 1, 3.05, G); }
      if (rnd() < 0.6) this.put('Prop_Chimney', H - 1.2, -0.8, 0, 0.8, 4.2, G);
    }
    const door = this.put('Door_1_Round', -0.53, H + 0.03, 0, 1, 0, G); door.position.x = (H === 2 ? 1 : 0) - 0.53;
    const e = H + 0.4;
    this.box(x - e, x + e, z - e, z + e);
    return G;
  }
  // square tower of stacked walls
  stoneTower(x, z, levels = 3, half = 2, roofScale = 1) {
    const G = new THREE.Group(); G.position.set(x, 0, z); this.root.add(G);
    const xs = half === 2 ? [-1, 1] : [-2, 0, 2];
    for (let l = 0; l < levels; l++) for (const a of xs) {
      const win = l > 0 && a === xs[0] && l % 2 === 1;
      const n = win ? 'Wall_UnevenBrick_Window_Wide_Round' : 'Wall_UnevenBrick_Straight';
      this.put(n, a, half, 0, 1, l * 3.1, G); this.put(n, a, -half, Math.PI, 1, l * 3.1, G);
      this.put(n, -half, a, -Math.PI / 2, 1, l * 3.1, G); this.put(n, half, a, Math.PI / 2, 1, l * 3.1, G);
    }
    for (let l = 0; l < levels; l++) for (const [cx, cz] of [[-half, -half], [half, -half], [-half, half], [half, half]]) this.put('Corner_Exterior_Brick', cx, cz, 0, 1, l * 3.1, G);
    this.put('Roof_Tower_RoundTiles', 0, 0, 0, roofScale * half / 2.6, levels * 3.1, G);
    this.box(x - half - 0.4, x + half + 0.4, z - half - 0.4, z + half + 0.4);
    return G;
  }
  wallRun(x0, z0, x1, z1, levels = 2) { // straight castle wall from (x0,z0) to (x1,z1) along an axis
    const horiz = z0 === z1, len = horiz ? Math.abs(x1 - x0) : Math.abs(z1 - z0), n = Math.round(len / 2);
    for (let i = 0; i < n; i++) for (let l = 0; l < levels; l++) {
      const t = (i + 0.5) / n;
      const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      this.put('Wall_UnevenBrick_Straight', x, z, horiz ? 0 : Math.PI / 2, 1, l * 3.1);
      this.put('Wall_UnevenBrick_Straight', x, z, horiz ? Math.PI : -Math.PI / 2, 1, l * 3.1);
    }
    const t = 0.5;
    if (horiz) this.box(Math.min(x0, x1), Math.max(x0, x1), z0 - t, z0 + t); else this.box(x0 - t, x0 + t, Math.min(z0, z1), Math.max(z0, z1));
  }
  fence(x0, z0, x1, z1) {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 2.05)), ry = Math.atan2(-(z1 - z0), x1 - x0);
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; this.put('Prop_WoodenFence_Single', x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, ry); }
    if (Math.abs(x1 - x0) < 0.01) this.box(x0 - 0.2, x0 + 0.2, z0, z1); else if (Math.abs(z1 - z0) < 0.01) this.box(x0, x1, z0 - 0.2, z0 + 0.2);
  }
  fire(x, z) {
    const G = new THREE.Group(); G.position.set(x, 0, z); G.userData.dynamic = true; this.root.add(G);
    for (let i = 0; i < 5; i++) { const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1, 6), new THREE.MeshLambertMaterial({ color: 0x5a3a1a })); log.rotation.z = Math.PI / 2; log.rotation.y = i * Math.PI / 5; log.position.y = 0.1; G.add(log); }
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 7), new THREE.MeshBasicMaterial({ color: 0xffa020, transparent: true, opacity: 0.9 }));
    flame.position.y = 0.5; G.add(flame);
    const light = new THREE.PointLight(0xff9030, 12, 14, 1.6); light.position.y = 1.2; G.add(light);
    this.anim.push(t => { const f = 0.85 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.07; flame.scale.set(f, f * 1.1, f); light.intensity = 12 * f; });
    this.circle(x, z, 0.8);
  }

  /* ---------- zone 1: Willowbrook ---------- */
  village() {
    this.house(-14, -1, Math.PI / 2);                 // bakery
    this.house(14, -2, -Math.PI / 2, { brick: true });
    this.house(-14, -17, Math.PI / 2, { w: 2 });
    this.house(15, -17, -Math.PI / 2);                 // school
    this.house(-15, 27, Math.PI / 2, { w: 2, brick: true });
    this.house(16, 14, -Math.PI / 2, { w: 2 });
    this.house(-16, -33, Math.PI / 2);
    this.house(17, -31, -Math.PI / 2, { w: 2, brick: true });
    // fountain
    const fb = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.7, 24), new THREE.MeshLambertMaterial({ color: 0x9a9a9a })); fb.position.set(0, 0.35, 0); fb.castShadow = fb.receiveShadow = true; this.root.add(fb);
    const fw = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.1, 24), new THREE.MeshLambertMaterial({ color: 0x4aa8e0, emissive: 0x103050 })); fw.position.set(0, 0.68, 0); this.root.add(fw);
    const fc = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 1.8, 12), new THREE.MeshLambertMaterial({ color: 0xb0b0b0 })); fc.position.set(0, 1.2, 0); fc.castShadow = true; this.root.add(fc);
    this.circle(0, 0, 2.7);
    // bakery stall
    this.put('Stall_Cart_Empty', -9, 4, Math.PI / 2); this.circle(-9, 4, 1.2);
    this.put('Barrel_Apples', -9.5, -5); this.put('Barrel', -10.5, -6); this.circle(-10, -5.5, 1);
    this.put('Bench', 5, 5, -Math.PI / 4); this.put('Bench', -5, 6, Math.PI / 4);
    // farm
    this.fence(-30, 8, -30, 24); this.fence(-30, 24, -22, 24); this.fence(-30, 8, -22, 8);
    this.put('Prop_Wagon', -24, 18, 0.3); this.circle(-24, 17, 1.6); this.circle(-24, 19.5, 1.2);
    this.put('FarmCrate_Apple', -22, 11); this.put('FarmCrate_Carrot', -23.2, 11.3); this.circle(-22.6, 11.2, 1);
    this.put('Bucket_Wooden_1', -21, 13);
    // school
    this.put('BookStand', 8.5, -12, -Math.PI / 2); this.put('Book_Stack_1', 9, -18); this.circle(8.6, -12, 0.6);
    // gate area
    this.put('Torch_Metal', 3, -40); this.put('Torch_Metal', -3, -40); this.put('Banner_1', 7, -40); this.put('Banner_2', -7, -40);
    this.put('WeaponStand', 8, -36, -Math.PI / 2); this.circle(8, -36, 0.8);
    // nature
    for (let i = 0; i < 70; i++) { const x = rr(-32, 32), z = rr(-42, 32); if (!this.freeSpot(x, z, 4) || (Math.abs(x) < 11 && Math.abs(z) < 11)) continue; this.scatter(rnd() < 0.5 ? 'Grass_Common_Short' : 'Flower_3_Group', x, z, rr(0.8, 1.3)); }
    for (let i = 0; i < 26; i++) { const x = rr(-32, 32), z = rr(-42, 32); if (Math.abs(x) < 21 || !this.freeSpot(x, z, 6)) continue; this.tree(x, z, ['CommonTree_1', 'CommonTree_2', 'CommonTree_3', 'Bush_Common_Flowers'][Math.floor(rnd() * 4)]); }
  }

  /* ---------- zone 2: Whispering Forest ---------- */
  forest() {
    const kinds = ['Pine_1', 'Pine_2', 'Pine_3', 'Pine_1', 'Pine_2', 'CommonTree_4', 'DeadTree_1'];
    const keep = Object.entries(SPOTS.npc).filter(([k]) => ['leo', 'mia', 'nico', 'sam', 'ivy'].includes(k)).map(([, v]) => v).concat(SPOTS.scrolls[2]);
    for (let i = 0; i < 170; i++) {
      const x = rr(-33, 33), z = rr(-48, -110);
      if (!this.freeSpot(x, z, 4.5) || keep.some(([a, b]) => Math.hypot(a - x, b - z) < 5)) continue;
      this.tree(x, z, kinds[Math.floor(rnd() * kinds.length)], rr(0.9, 1.3));
    }
    for (let i = 0; i < 120; i++) {
      const x = rr(-33, 33), z = rr(-46, -110); if (!this.freeSpot(x, z, 3)) continue;
      this.scatter(['Fern_1', 'Mushroom_Common', 'Mushroom_Laetiporus', 'Grass_Wispy_Tall', 'Plant_1_Big', 'Clover_1', 'Plant_7_Big'][Math.floor(rnd() * 7)], x, z, rr(0.8, 1.4));
    }
    for (let i = 0; i < 14; i++) { const x = rr(-30, 30), z = rr(-50, -108); if (!this.freeSpot(x, z, 5)) continue; this.scatter('Rock_Medium_' + (1 + Math.floor(rnd() * 3)), x, z, rr(0.6, 1)); this.circle(x, z, 1.2); }
    this.fire(-5, -79);
    this.put('Bag', -6.5, -77.5); this.put('Chest_Wood', 12, -96, -Math.PI / 2, 1); this.circle(12, -96, 0.8);
    this.put('Workbench', -16, -59, Math.PI / 2); this.circle(-16, -59, 1.3);
    this.put('Pickaxe_Bronze' in LIB.parts ? 'Pickaxe_Bronze' : 'Sword_Bronze', -15, -64);
    for (let i = 0; i < 10; i++) this.scatter('Flower_4_Group', 13 + rr(-3, 3), -69 + rr(-4, 4), rr(0.9, 1.3));
  }

  /* ---------- zone 3: Silver River ---------- */
  river() {
    const RZ0 = -135, RZ1 = -149;
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const cx = cv.getContext('2d'); cx.fillStyle = '#3b8fd0'; cx.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 40; i++) { cx.strokeStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.25})`; cx.lineWidth = 2; cx.beginPath(); const y = Math.random() * 128, x = Math.random() * 128; cx.moveTo(x, y); cx.quadraticCurveTo(x + 10, y - 4, x + 24, y); cx.stroke(); }
    const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(10, 1.5); tex.colorSpace = THREE.SRGBColorSpace;
    const water = new THREE.Mesh(new THREE.PlaneGeometry(120, RZ0 - RZ1), new THREE.MeshLambertMaterial({ map: tex, transparent: true, opacity: 0.92, emissive: 0x0a2a44 }));
    water.rotation.x = -Math.PI / 2; water.position.set(0, 0.12, (RZ0 + RZ1) / 2); this.root.add(water);
    const bed = new THREE.Mesh(new THREE.PlaneGeometry(120, RZ0 - RZ1 + 1), new THREE.MeshLambertMaterial({ color: 0x1a4a6a })); bed.rotation.x = -Math.PI / 2; bed.position.set(0, 0.06, (RZ0 + RZ1) / 2); this.root.add(bed);
    this.anim.push((t, dt) => { tex.offset.x += dt * 0.05; tex.offset.y = Math.sin(t * 0.5) * 0.02; });
    for (let x = -36; x <= 36; x += rr(2.5, 4)) for (const z of [RZ0 + 0.3, RZ1 - 0.3]) { if (Math.abs(x - pathX(-142)) < 3) continue; this.scatter(['Rock_Medium_1', 'Rock_Medium_2', 'Pebble_Round_3'][Math.floor(rnd() * 3)], x, z + rr(-0.5, 0.5), rr(0.4, 0.8)); }
    for (let i = 0; i < 40; i++) { const x = rr(-32, 32), z = rr(-114, -133); if (!this.freeSpot(x, z, 4)) continue; this.scatter(rnd() < 0.5 ? 'Grass_Wispy_Tall' : 'Grass_Common_Short', x, z, rr(0.8, 1.3)); }
    for (let i = 0; i < 12; i++) { const x = rr(-32, 32), z = rr(-114, -132); if (Math.abs(x) < 17 || !this.freeSpot(x, z, 6)) continue; this.tree(x, z, rnd() < 0.5 ? 'CommonTree_2' : 'Pine_2'); }
    this.riverBlock = this.box(-34, 34, RZ0 + 0.5, RZ1 - 0.5, 'river');
    // bridge segments (shown one by one in chapter 3)
    this.bridge = []; const BX = this.BX = pathX(-142);
    const n = 7, len = RZ0 - RZ1 + 2;
    for (let i = 0; i < n; i++) {
      const seg = this.put(i === 0 || i === n - 1 ? 'Bridge_Modular' : 'Bridge_Modular_Center', BX, RZ0 + 1 - (i + 0.5) * len / n, i === n - 1 ? Math.PI : 0, 1, 0);
      seg.scale.set(1, 1, (len / n) / 2.25); seg.visible = false; seg.userData.dynamic = true; this.bridge.push(seg);
    }
    this.put('Crate_Wooden', -3.6, -129); this.put('Crate_Wooden', -3.4, -130.4, 0.4); this.circle(-3.5, -129.7, 1);
    this.put('Barrel', -14.5, -132.5); this.put('Bucket_Wooden_1', -12, -133.5); this.circle(-14.5, -132.5, 0.6);
    this.put('Rock_Medium_2', 12.5, -133.5, 0, 0.7);
  }
  setBridge(fraction) {
    const k = Math.round(fraction * this.bridge.length);
    this.bridge.forEach((s, i) => s.visible = i < k);
    if (fraction >= 1 && this.riverBlock) {
      // keep the river blocked except the bridge lane
      this.colliders.splice(this.colliders.indexOf(this.riverBlock), 1); this.riverBlock = null;
      this.box(-34, this.BX - 1.4, -135.5, -148.5); this.box(this.BX + 1.4, 34, -135.5, -148.5);
    }
  }

  /* ---------- zone 4: castle ---------- */
  castle() {
    const X = 20, ZS = -166, ZN = -206;
    this.wallRun(-X, ZS, -3, ZS); this.wallRun(3, ZS, X, ZS);
    this.wallRun(-X, ZN, -3, ZN); this.wallRun(3, ZN, X, ZN);
    this.wallRun(-X, ZS, -X, ZN); this.wallRun(X, ZS, X, ZN);
    for (const z of [ZS, ZN]) { this.put('Wall_Arch', 0, z, 0, 1, 0); this.put('Wall_Arch', 0, z, Math.PI); for (const s of [-1, 1]) { this.put('Wall_UnevenBrick_Straight', s * 2, z, 0, 1, 0); this.put('Wall_UnevenBrick_Straight', s * 2, z, Math.PI, 1, 0); this.put('Wall_UnevenBrick_Straight', s * 2, z, 0, 1, 3.1); this.put('Wall_UnevenBrick_Straight', 0, z, 0, 1, 3.1); } this.box(-3, -1.05, z - 0.5, z + 0.5); this.box(1.05, 3, z - 0.5, z + 0.5); }
    for (const [x, z] of [[-X, ZS], [X, ZS], [-X, ZN], [X, ZN]]) this.stoneTower(x, z, 3);
    this.stoneTower(-4.5, ZS, 2, 1.0); this.stoneTower(4.5, ZS, 2, 1.0);
    // courtyard
    this.put('Banner_1', -3, -202); this.put('Banner_2', 3, -202);
    this.put('Dummy', -14, -181); this.put('Dummy', -14, -187); this.circle(-14, -181, 0.6); this.circle(-14, -187, 0.6);
    this.put('WeaponStand', -16, -184, Math.PI / 2); this.circle(-16, -184, 0.8);
    this.put('Shield_Wooden', -16.5, -186.5);
    this.put('Table_Large', 15, -184, Math.PI / 2); this.circle(15, -184, 1.6);
    this.put('Cauldron', 14.5, -180); this.circle(14.5, -180, 0.8);
    this.put('Pot_1', 15.2, -186);
    this.put('Bookcase_2', 12, -203, 0); this.put('Bookcase_2', 14.2, -203, 0); this.box(10.8, 15.4, -204, -202.5);
    this.put('BookStand', 9.5, -201, -Math.PI / 4); this.circle(9.5, -201, 0.6);
    for (const x of [-15, -9, 9, 15]) { this.put(x < 0 ? 'Banner_1' : 'Banner_2', x, -204.5); this.put(x < 0 ? 'Banner_2' : 'Banner_1', x, -167.5, Math.PI); }
    for (const [x, z] of [[-17, -170], [17, -170], [-17, -202], [17, -199]]) { this.put('Barrel', x, z); this.put('Barrel', x + 0.9, z + 0.4); this.put('Crate_Wooden', x + 0.3, z + 1.2); this.circle(x + 0.4, z + 0.5, 1.4); }
    for (const [x, z, r] of [[-6, -190, Math.PI / 2], [6, -190, -Math.PI / 2]]) { this.put('Bench', x, z, r); this.circle(x, z, 0.9); }
    for (const [x, z] of [[-8, -176], [8, -176], [-8, -198], [8, -196]]) { this.tree(x, z, 'Bush_Common_Flowers', 1.2); this.circle(x, z, 0.8); }
    for (const [x, z] of [[-6, -172], [6, -172], [-6, -200], [6, -200]]) { this.put('Torch_Metal', x, z); this.circle(x, z, 0.3); }
    for (let i = 0; i < 18; i++) { const x = rr(-33, 33), z = rr(-152, -214); if (Math.abs(x) < 24 && z < -160 && z > -210) continue; if (!this.freeSpot(x, z, 4)) continue; this.tree(x, z, rnd() < 0.5 ? 'CommonTree_1' : 'Pine_3'); }
  }

  /* ---------- zone 5: Brightwater market ---------- */
  market() {
    const C = -245;
    this.house(-17, C + 14, Math.PI / 2, { brick: true }); this.house(17, C + 13, -Math.PI / 2);
    this.house(-17, C - 2, Math.PI / 2, { w: 2 }); this.house(18, C - 4, -Math.PI / 2, { w: 2, brick: true });
    this.house(-17, C - 18, Math.PI / 2); this.house(17, C - 20, -Math.PI / 2, { brick: true });
    this.stoneTower(-26, C + 2, 4, 2); // clock tower
    const stalls = [[-8, C + 7, Math.PI / 2], [-9, C - 6, Math.PI / 2], [9, C + 6, -Math.PI / 2], [10, C - 7, -Math.PI / 2], [-4, C - 14, 0], [5, C + 14, Math.PI]];
    const goods = ['Barrel_Apples', 'FarmCrate_Apple', 'FarmCrate_Carrot', 'Coin_Pile', 'Potion_1', 'Vase_2'];
    stalls.forEach(([x, z, r], i) => {
      this.put(i % 2 ? 'Stall_Empty' : 'Stall_Cart_Empty', x, z, r); this.circle(x, z, 1.4);
      const g = goods[i % goods.length];
      this.put(g, x + Math.sin(r) * 1.4 + 0.6, z + Math.cos(r) * 1.4);
    });
    // colourful canopies
    const cols = [0xe04848, 0xf0c030, 0x40a0e0, 0x50c060, 0xd060c0, 0xf08030];
    stalls.forEach(([x, z, r], i) => { const c = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 1.6), new THREE.MeshLambertMaterial({ color: cols[i] })); c.position.set(x, 2.66, z); c.rotation.y = r; c.castShadow = true; this.root.add(c); });
    for (const [x, z] of [[-3, C + 20], [3, C + 20], [-3, C - 25], [3, C - 25]]) { this.put('Banner_' + (1 + (x > 0)), x, z); }
    this.put('Crate_Wooden', -12, C + 2); this.put('Barrel', 12.5, C + 1); this.put('Barrel', 13, C + 2.2); this.circle(-12, C + 2, 0.8); this.circle(12.7, C + 1.6, 1);
    // bunting lines
    for (let k = 0; k < 6; k++) { const flag = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 3), new THREE.MeshLambertMaterial({ color: cols[k] })); flag.rotation.x = Math.PI; }
    for (let i = 0; i < 30; i++) { const x = rr(-32, 32), z = rr(-216, -274); if (Math.abs(x) < 22 || !this.freeSpot(x, z, 5)) continue; this.scatter(rnd() < 0.5 ? 'Bush_Common_Flowers' : 'Flower_3_Group', x, z, rr(0.8, 1.3)); }
    this.crowd = []; // filled by main (wandering people)
  }

  /* ---------- zone 6: Mortimer's tower ---------- */
  tower() {
    this.stoneTower(0, -318, 6, 3, 1.2);
    for (let i = 0; i < 40; i++) { const x = rr(-33, 33), z = rr(-280, -330); if (Math.hypot(x, z + 304) < 12 || !this.freeSpot(x, z, 4)) continue; this.tree(x, z, ['DeadTree_1', 'DeadTree_2', 'TwistedTree_1', 'Rock_Medium_3'][Math.floor(rnd() * 4)], rr(0.8, 1.2)); }
    for (const [x, z] of [[-6, -298], [6, -298], [-8, -308], [8, -308]]) { this.put('CandleStick_Stand', x, z); this.circle(x, z, 0.4); const l = new THREE.PointLight(0xb070ff, 6, 10, 1.5); l.position.set(x, 2, z); this.root.add(l); }
    // magic circle
    const ring = new THREE.Mesh(new THREE.RingGeometry(6, 6.4, 64), new THREE.MeshBasicMaterial({ color: 0xb070ff, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.06, -304); ring.userData.dynamic = true; this.root.add(ring);
    this.anim.push(t => { ring.material.opacity = 0.45 + Math.sin(t * 2) * 0.25; ring.rotation.z = t * 0.2; });
  }

  /* ---------- magic fog gates ---------- */
  addGate(g) {
    const mat = new THREE.ShaderMaterial({
      transparent: true, side: THREE.DoubleSide, depthWrite: false,
      uniforms: { t: { value: 0 }, a: { value: 1 } },
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
      fragmentShader: `varying vec2 vUv; uniform float t; uniform float a;
        float n(vec2 p){ return sin(p.x*6.0+t*1.3)*sin(p.y*9.0-t*1.7)+sin((p.x+p.y)*13.0+t*2.1)*0.5; }
        void main(){ float v = n(vUv*vec2(8.0,1.0)); float fade = smoothstep(0.0,0.25,vUv.y)*(1.0-smoothstep(0.6,1.0,vUv.y));
          vec3 c = mix(vec3(0.45,0.25,0.85), vec3(0.75,0.6,1.0), v*0.5+0.5);
          gl_FragColor = vec4(c, (0.45+0.25*v)*fade*a); }`,
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(72, 7), mat); m.position.set(0, 3, g.z); this.root.add(m);
    const col = this.box(-36, 36, g.z - 0.6, g.z + 0.6, 'gate');
    const gate = { ...g, mesh: m, col, open: false };
    this.anim.push((t, dt) => { mat.uniforms.t.value = t; if (gate.open && mat.uniforms.a.value > 0) { mat.uniforms.a.value -= dt * 0.6; if (mat.uniforms.a.value <= 0) m.visible = false; } });
    this.gates.push(gate);
  }
  openGate(ch, instant = false) {
    for (const g of this.gates) if (g.ch === ch && !g.open) {
      g.open = true; const i = this.colliders.indexOf(g.col); if (i >= 0) this.colliders.splice(i, 1);
      if (instant) g.mesh.visible = false;
    }
  }

  /* ---------- physics ---------- */
  collide(p, r = 0.4) {
    for (const c of this.colliders) {
      if (c.t === 'c') {
        const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + r;
        if (d < m && d > 1e-4) { p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; }
      } else {
        if (p.x > c.x0 - r && p.x < c.x1 + r && p.z > c.z0 - r && p.z < c.z1 + r) {
          const l = p.x - (c.x0 - r), rt = (c.x1 + r) - p.x, f = p.z - (c.z0 - r), b = (c.z1 + r) - p.z, mn = Math.min(l, rt, f, b);
          if (mn === l) p.x = c.x0 - r; else if (mn === rt) p.x = c.x1 + r; else if (mn === f) p.z = c.z0 - r; else p.z = c.z1 + r;
        }
      }
    }
  }
  update(t, dt) { for (const f of this.anim) f(t, dt); }
}
