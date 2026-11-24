// TERRA LINGUA · Criaturas de cada mundo: aparecen cerca del jugador, persiguen, atacan y sueltan monedas.
// Cada jugador ve sus propias criaturas (no se sincronizan por la red). Nunca entran a pueblos ni a zonas de misión.
import * as THREE from 'three';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const G = 'assets/mobs/graveyard/', K = { idle: 'idle', walk: 'walk', run: 'sprint', atk: 'attack-melee-right', shoot: 'holding-right-shoot', die: 'die' }, PET = { idle: 'idle', walk: 'walk', run: 'run', atk: 'eat' };
export const MOB_TYPES = {
  bee: { name: 'Angry Bee', url: 'assets/pets/animal-bee.glb', h: .85, hp: 18, dmg: 3, sp: 4.4, fly: 1.3, coins: 2, anim: PET, aggro: 10, r: .55 },
  orc: { name: 'Grumpy Orc', url: 'assets/mobs/dungeon/character-orc.glb', h: 1.75, hp: 46, dmg: 6, sp: 3.2, coins: 4, anim: K, aggro: 13, r: .6 },
  skel: { name: 'Lost Skeleton', url: G + 'character-skeleton.glb', h: 1.75, hp: 36, dmg: 4, sp: 3.1, coins: 4, anim: K, aggro: 15, r: .6, ranged: { dmg: 4, cd: 2.8, range: 14, color: '#f4f0e0' } },
  ghost: { name: 'Library Ghost', url: G + 'character-ghost.glb', h: 1.75, hp: 30, dmg: 5, sp: 3.7, fly: .5, coins: 4, anim: K, aggro: 13, r: .6, ghost: true },
  slime: { name: 'Paint Slime', proc: 'slime', h: 1, hp: 28, dmg: 4, sp: 3.4, coins: 3, aggro: 12, r: .65 },
  thief: { name: 'Art Thief', url: G + 'character-vampire.glb', h: 1.8, hp: 50, dmg: 6, sp: 3.7, coins: 5, anim: K, aggro: 14, r: .6 },
  crab: { name: 'Giant Crab', url: 'assets/pets/animal-crab.glb', h: .95, hp: 32, dmg: 4, sp: 3, coins: 3, anim: PET, aggro: 11, r: .7, beach: true },
  zombie: { name: 'Pirate Zombie', url: G + 'character-zombie.glb', h: 1.75, hp: 48, dmg: 6, sp: 2.9, coins: 4, anim: K, aggro: 13, r: .6 },
  hog: { name: 'Wild Hog', url: 'assets/pets/animal-hog.glb', h: 1.05, hp: 34, dmg: 5, sp: 4.2, coins: 3, anim: PET, aggro: 11, r: .65 },
  worm: { name: 'Giant Caterpillar', url: 'assets/pets/animal-caterpillar.glb', h: .9, hp: 24, dmg: 3, sp: 2.4, coins: 2, anim: PET, aggro: 8, r: .65 },
  keeper: { name: 'Night Keeper', url: G + 'character-keeper.glb', h: 1.8, hp: 44, dmg: 6, sp: 3.2, coins: 5, anim: K, aggro: 13, r: .6, ranged: { dmg: 4, cd: 3.2, range: 12, color: '#b9a8ff' } },
  tiger: { name: 'Canyon Tiger', url: 'assets/pets/animal-tiger.glb', h: 1.15, hp: 40, dmg: 6, sp: 4.6, coins: 4, anim: PET, aggro: 12, r: .7 },
  parrot: { name: 'Pirate Parrot', url: 'assets/pets/animal-parrot.glb', h: .8, hp: 16, dmg: 3, sp: 4.8, fly: 1.8, coins: 2, anim: PET, aggro: 11, r: .5 },
  // animales pacíficos: pasean y dan vida al paisaje (no se pueden atacar)
  cow: { name: 'Cow', url: 'assets/pets/animal-cow.glb', h: 1.2, passive: true, sp: 1.2, anim: PET, r: .7 },
  chick: { name: 'Chick', url: 'assets/pets/animal-chick.glb', h: .55, passive: true, sp: 1.6, anim: PET, r: .4 },
  pig: { name: 'Pig', url: 'assets/pets/animal-pig.glb', h: .9, passive: true, sp: 1.4, anim: PET, r: .6 },
  deer: { name: 'Deer', url: 'assets/pets/animal-deer.glb', h: 1.4, passive: true, sp: 1.8, anim: PET, r: .6 },
  bunny: { name: 'Bunny', url: 'assets/pets/animal-bunny.glb', h: .6, passive: true, sp: 2, anim: PET, r: .4 },
  beaver: { name: 'Beaver', url: 'assets/pets/animal-beaver.glb', h: .7, passive: true, sp: 1.3, anim: PET, r: .5 },
  elephant: { name: 'Elephant', url: 'assets/pets/animal-elephant.glb', h: 1.9, passive: true, sp: 1.1, anim: PET, r: .9 },
  giraffe: { name: 'Giraffe', url: 'assets/pets/animal-giraffe.glb', h: 2.4, passive: true, sp: 1.3, anim: PET, r: .7 },
  monkey: { name: 'Monkey', url: 'assets/pets/animal-monkey.glb', h: .9, passive: true, sp: 1.8, anim: PET, r: .5 }
};
// [tipo, peso, tamaño del grupo]
export const UNIT_MOBS = {
  1: [['bee', 3, 3], ['orc', 2, 1], ['hog', 2, 2], ['worm', 2, 1]],
  2: [['skel', 3, 2], ['ghost', 2, 1], ['keeper', 2, 1], ['bee', 1, 2]],
  3: [['slime', 3, 3], ['thief', 2, 1], ['tiger', 2, 1], ['worm', 1, 2]],
  4: [['crab', 3, 2], ['zombie', 2, 2], ['parrot', 2, 2], ['hog', 1, 1]]
};
export const UNIT_ANIMALS = { 1: ['cow', 'chick', 'pig'], 2: ['deer', 'bunny', 'beaver'], 3: ['elephant', 'giraffe', 'bunny'], 4: ['monkey', 'chick', 'pig'] };
const pickW = arr => { let s = arr.reduce((a, b) => a + b[1], 0) * Math.random(); for (const e of arr) { s -= e[1]; if (s <= 0) return e; } return arr[0]; };
export const BOSSES = {
  1: { type: 'orc', name: 'Orc Foreman', scale: 2, hp: 320, dmg: 9 },
  2: { type: 'ghost', name: 'Headmaster Ghost', scale: 2, hp: 300, dmg: 9 },
  3: { type: 'slime', name: 'Slime King', scale: 2.6, hp: 340, dmg: 9 },
  4: { type: 'zombie', name: 'Captain Zombie', scale: 2, hp: 360, dmg: 10 }
};
const SLIME_COLORS = ['#ff7fbe', '#7fe0ff', '#ffd93b', '#9a55e0', '#3fc463', '#ff9a2e'];

export function createCreatures(ctx) {
  const { scene, world, loadG, flatMat, norm, P, isTouch, makeLabel, unitOf, unitOpen, SAFE, LANDMARKS, SEA } = ctx;
  const list = []; let spawnT = 1.5, bossAlive = {};
  const tmp = new THREE.Vector3();

  function makeBar() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 10; const t = new THREE.CanvasTexture(c);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true, fog: false })); s.scale.set(1.1, .17, 1);
    s.userData.draw = f => { const g = c.getContext('2d'); g.clearRect(0, 0, 64, 10); g.fillStyle = 'rgba(16,20,40,.85)'; g.fillRect(0, 0, 64, 10); g.fillStyle = f > .5 ? '#3fc463' : f > .25 ? '#ffc933' : '#e8483f'; g.fillRect(2, 2, Math.max(0, 60 * f), 6); t.needsUpdate = true; };
    return s;
  }
  function slimeModel(color) {
    const g = new THREE.Group(), body = new THREE.Mesh(new THREE.BoxGeometry(1, .8, 1), new THREE.MeshLambertMaterial({ color, transparent: true, opacity: .88 }));
    body.position.y = .4; g.add(body);
    const core = new THREE.Mesh(new THREE.BoxGeometry(.5, .4, .5), new THREE.MeshLambertMaterial({ color: new THREE.Color(color).multiplyScalar(.7) })); core.position.y = .35; g.add(core);
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(.16, .2, .05), new THREE.MeshLambertMaterial({ color: '#1b1d2a' })); e.position.set(s * .2, .52, .51); g.add(e); }
    g.userData.body = body; return g;
  }

  class Mob {
    constructor(type, x, y, z, boss) {
      const T = MOB_TYPES[type]; this.type = type; this.T = T; this.boss = boss || null;
      const k = boss ? boss.scale : 1;
      this.maxHp = boss ? boss.hp : T.hp; this.hp = this.maxHp; this.dmg = boss ? boss.dmg : T.dmg; this.name = boss ? boss.name : T.name;
      this.sp = T.sp * (boss ? .85 : 1); this.aggro = boss ? 18 : T.aggro; this.r = T.r * k; this.cy = T.h * k * .55; this.hgt = T.h * k;
      this.pos = new THREE.Vector3(x, y, z); this.home = this.pos.clone(); this.vel = new THREE.Vector3(); this.kb = new THREE.Vector3();
      this.cd = 1 + Math.random(); this.rcd = 1.5 + Math.random() * 2; this.wanderT = 0; this.goal = null; this.ground = false; this.dead = false; this.deadT = 0; this.barT = 0; this.slowT = 0; this.hitT = 0; this.angryT = 0;
      this.root = new THREE.Group(); this.root.position.copy(this.pos); scene.add(this.root); this.ready = false; this.mats = [];
      this.bar = makeBar(); this.bar.position.y = this.hgt + .35; this.bar.visible = !!boss; this.bar.userData.draw(1); this.root.add(this.bar);
      if (boss) { this.label = makeLabel(`👑 ${boss.name}`, '#ffd0d0'); this.label.position.y = this.hgt + .8; this.root.add(this.label); }
      this.load(k);
    }
    async load(k) {
      const T = this.T;
      if (T.proc === 'slime') {
        const m = slimeModel(this.boss ? '#ff3d71' : SLIME_COLORS[Math.floor(Math.random() * SLIME_COLORS.length)]); m.scale.setScalar(k); this.model = m; this.root.add(m);
        m.traverse(o => { if (o.isMesh) this.mats.push([o.material, o.material.color.clone()]); }); this.ready = true; return;
      }
      let g; try { g = await loadG(T.url); } catch (e) { this.dispose(); return; }
      if (this.gone) return;
      const m = SkeletonUtils.clone(g.scene);
      m.traverse(o => { if (o.isMesh) { o.frustumCulled = false; o.material = flatMat(o.material); if (T.ghost) { o.material.transparent = true; o.material.opacity = .72; } this.mats.push([o.material, o.material.color.clone()]); } });
      norm(m, T.h * k); this.root.add(m); this.model = m;
      this.mixer = new THREE.AnimationMixer(m); this.clips = {}; g.animations.forEach(c => this.clips[c.name] = c); this.ready = true; this.play('idle');
    }
    play(n, once) {
      if (!this.mixer) return; const name = this.T.anim?.[n]; const c = name && this.clips[name]; if (!c) return; if (this.cur === n && !once) return;
      const a = this.mixer.clipAction(c); a.reset(); a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat); a.clampWhenFinished = !!once; a.fadeIn(.12).play();
      if (this.act && this.act !== a) this.act.fadeOut(.12); this.act = a; this.cur = n;
    }
    shot(n, ms) { this.busy = performance.now() + ms; this.play(n, true); }
    dispose() { this.gone = true; scene.remove(this.root); this.bar.material.map.dispose(); this.bar.material.dispose(); if (this.label) { this.label.material.map?.dispose(); this.label.material.dispose(); } }
  }

  function damage(m, dmg, dir, slow) {
    if (m.dead || !m.ready) return false;
    m.hp -= dmg; m.hitT = .14; m.barT = 4; m.angryT = 10; m.bar.visible = true; m.bar.userData.draw(Math.max(0, m.hp / m.maxHp));
    for (const [mat] of m.mats) mat.color.setRGB(1, .45, .4);
    if (dir) { const k = m.boss ? 2 : 7; m.kb.set(dir.x, 0, dir.z).normalize().multiplyScalar(k); if (!m.T.fly) m.vel.y = Math.max(m.vel.y, m.boss ? 2 : 4); }
    if (slow) { m.slowT = 2.6; for (const [mat] of m.mats) mat.color.setRGB(.55, .85, 1); }
    if (m.hp <= 0) {
      m.dead = true; m.deadT = 1.5; m.bar.visible = false; if (m.label) m.label.visible = false;
      if (m.mixer && m.T.anim.die) m.play('die', true); else if (m.model) m.model.rotation.z = Math.PI / 2;
      if (m.boss) bossAlive[m.boss.u] = null;
      ctx.onKill(m); return true;
    }
    return false;
  }

  function spawn(type, x, z, boss) {
    const y = world.topY(x, z) + (MOB_TYPES[type].fly || 0) + .05; const m = new Mob(type, x + .5, y, z + .5, boss); list.push(m); return m;
  }
  // Aparece un grupo (enjambre de abejas, pareja de slimes…) o un animal pacífico
  function trySpawn(u, animal) {
    for (let k = 0; k < 8; k++) {
      const a = Math.random() * Math.PI * 2, r = 18 + Math.random() * 24, x = Math.floor(P.pos.x + Math.cos(a) * r), z = Math.floor(P.pos.z + Math.sin(a) * r);
      if (unitOf(x, z) !== u || (!animal && SAFE(x, z)) || x < 14 || z < 14 || x > 497 || z > 497) continue;
      const top = world.topY(x, z); if (Math.abs(top - P.pos.y) > 14) continue;
      let [type, , n] = animal ? [UNIT_ANIMALS[u][Math.floor(Math.random() * 3)], 1, 1 + (Math.random() < .5 ? 1 : 0)] : pickW(UNIT_MOBS[u]);
      const wet = world.waterAt(x, top, z) || top <= SEA + 1;
      if (MOB_TYPES[type].beach && top > SEA + 4) { type = 'zombie'; n = 1; }
      if (wet && !MOB_TYPES[type].beach && !MOB_TYPES[type].fly) continue;
      for (let i = 0; i < n; i++) { const ox = x + Math.round((Math.random() - .5) * 5), oz = z + Math.round((Math.random() - .5) * 5); if (unitOf(ox, oz) === u && (animal || !SAFE(ox, oz))) spawn(type, ox, oz); }
      return;
    }
  }
  function clear() { while (list.length) list.pop().dispose(); bossAlive = {}; }

  function update(dt, night) {
    const now = performance.now(), inWorld = P.zone === 'world';
    if (!inWorld) { if (list.length) clear(); return; }
    const u = unitOf(P.pos.x, P.pos.z);
    // jefe del mundo en su lugar especial
    for (const L of LANDMARKS) if (L.boss && L.u === u && unitOpen(u) && !bossAlive[u] && ctx.bossReady(u) && Math.hypot(P.pos.x - L.x, P.pos.z - L.z) < 46) { const b = BOSSES[u]; bossAlive[u] = spawn(b.type, L.bossAt.x, L.bossAt.z, { ...b, u }); bossAlive[u].home.set(L.bossAt.x + .5, L.bossAt.y, L.bossAt.z + .5); }
    spawnT -= dt;
    if (spawnT <= 0) { spawnT = 1.4 + Math.random() * 1.2; const cap = (isTouch ? 7 : 11) + (night ? 4 : 0), foes = list.filter(m => !m.boss && !m.dead && !m.T.passive).length, pets = list.filter(m => m.T.passive).length; if (u && unitOpen(u) && !ctx.busy()) { if (foes < cap) trySpawn(u); else if (pets < (isTouch ? 3 : 6)) trySpawn(u, true); if (pets < 2 && Math.random() < .4) trySpawn(u, true); } }
    const canHit = !P.dead && !ctx.busy() && !SAFE(P.pos.x, P.pos.z);
    for (let i = list.length - 1; i >= 0; i--) {
      const m = list[i];
      if (m.dead) { m.deadT -= dt; if (m.mixer) m.mixer.update(dt); if (m.deadT < .6) m.root.position.y -= dt * 1.4; if (m.deadT <= 0) { m.dispose(); list.splice(i, 1); } continue; }
      const dx = P.pos.x - m.pos.x, dz = P.pos.z - m.pos.z, d = Math.hypot(dx, dz), far = d > (m.boss ? 95 : 72);
      if (far) { if (m.boss) bossAlive[m.boss.u] = null; m.dispose(); list.splice(i, 1); continue; }
      if (!m.ready) continue;
      if (m.hitT > 0) { m.hitT -= dt; if (m.hitT <= 0 && m.slowT <= 0) for (const [mat, c] of m.mats) mat.color.copy(c); }
      if (m.slowT > 0) { m.slowT -= dt; if (m.slowT <= 0) for (const [mat, c] of m.mats) mat.color.copy(c); }
      if (m.barT > 0 && !m.boss) { m.barT -= dt; if (m.barT <= 0) m.bar.visible = false; }
      m.cd -= dt; m.rcd -= dt; m.angryT -= dt;
      const homeD = Math.hypot(m.pos.x - m.home.x, m.pos.z - m.home.z), leash = m.boss ? 16 : 34;
      const chase = !m.T.passive && canHit && homeD < leash && (d < m.aggro || (m.angryT > 0 && d < m.aggro * 2.2)) && Math.abs(P.pos.y - m.pos.y) < 9;
      let gx = 0, gz = 0, sp = 0;
      if (chase) { const stop = m.boss ? 2.2 : 1.4; if (d > stop) { gx = dx / d; gz = dz / d; sp = m.sp * (d > 6 ? 1.15 : 1); } }
      else if (homeD > (m.boss ? 4 : 12)) { gx = (m.home.x - m.pos.x) / homeD; gz = (m.home.z - m.pos.z) / homeD; sp = m.sp * .8; }
      else { m.wanderT -= dt; if (m.wanderT <= 0) { m.wanderT = 2 + Math.random() * 4; m.goal = Math.random() < .35 ? null : [m.home.x + (Math.random() - .5) * 16, m.home.z + (Math.random() - .5) * 16]; } if (m.goal) { const wx = m.goal[0] - m.pos.x, wz = m.goal[1] - m.pos.z, wd = Math.hypot(wx, wz); if (wd > 1) { gx = wx / wd; gz = wz / wd; sp = m.sp * .45; } else m.goal = null; } }
      // nunca entran a zonas seguras (pueblos, misiones, plaza central)
      if (sp && SAFE(m.pos.x + gx * 2, m.pos.z + gz * 2)) sp = 0;
      if (m.slowT > 0) sp *= .4;
      m.vel.x = gx * sp + m.kb.x; m.vel.z = gz * sp + m.kb.z; m.kb.multiplyScalar(Math.max(0, 1 - dt * 6));
      if (m.T.fly) {
        const ty = world.topY(m.pos.x, m.pos.z) + m.T.fly * (m.boss ? 1.5 : 1) + Math.sin(now / 300 + i) * .25, wantY = chase ? Math.max(ty, P.pos.y + (m.type === 'bee' ? .9 : 0)) : ty;
        m.pos.y += (wantY - m.pos.y) * Math.min(1, dt * 3); m.vel.y = 0; m.pos.x += m.vel.x * dt; m.pos.z += m.vel.z * dt;
      } else {
        m.vel.y -= 26 * dt; const bx = m.pos.x, bz = m.pos.z;
        m.ground = world.move(m.pos, m.vel, Math.min(dt, .05), .3 * Math.min(2, m.boss ? m.boss.scale * .7 : 1), Math.min(2.6, m.hgt), m.ground);
        if (m.ground && sp && Math.hypot(m.pos.x - bx, m.pos.z - bz) < sp * dt * .3) m.vel.y = 8.5;
        if (m.T.proc === 'slime' && m.ground && sp) m.vel.y = 6.5;
        if (m.pos.y < 2) { m.pos.copy(m.home); m.pos.y = world.topY(m.home.x, m.home.z) + .1; }
      }
      m.root.position.copy(m.pos);
      if (sp || chase) m.root.rotation.y = Math.atan2(chase ? dx : m.vel.x, chase ? dz : m.vel.z);
      if (m.T.proc === 'slime' && m.model) { const b = m.model.userData.body, sq = m.ground ? 1 : 1.12; b.scale.set(2 - sq, sq, 2 - sq); }
      if (m.mixer) { if (now > (m.busy || 0)) m.play(sp > m.sp * .8 ? 'run' : sp ? 'walk' : 'idle'); if (d < 45) m.mixer.update(dt); }
      // ataques
      if (chase && canHit) {
        const reach = m.boss ? 3 : 2, dy = Math.abs(P.pos.y - m.pos.y);
        if (d < reach && dy < 2.4 && m.cd <= 0) { m.cd = m.boss ? 1.6 : 1.5; m.shot('atk', 500); setTimeout(() => { if (!m.dead && Math.hypot(P.pos.x - m.pos.x, P.pos.z - m.pos.z) < reach + .8) ctx.hitPlayer(m.dmg, m.name); }, 260); }
        else if (m.T.ranged && d > 4 && d < m.T.ranged.range && m.rcd <= 0) {
          m.rcd = m.T.ranged.cd + Math.random(); m.shot('shoot', 500);
          const o = tmp.set(m.pos.x, m.pos.y + m.cy + .3, m.pos.z), dir = new THREE.Vector3(P.pos.x - o.x, P.pos.y + 1 - o.y, P.pos.z - o.z).normalize();
          ctx.mobShot(o.clone(), dir, m.T.ranged.dmg, m.T.ranged.color, m.name);
        }
        if (m.boss && m.rcd <= 0 && d > 5 && d < 20) { m.rcd = 3.2; const o = new THREE.Vector3(m.pos.x, m.pos.y + m.cy + .6, m.pos.z), dir = new THREE.Vector3(P.pos.x - o.x, P.pos.y + 1 - o.y, P.pos.z - o.z).normalize(); ctx.mobShot(o, dir, 7, '#ff3d71', m.name, true); }
      }
    }
  }
  const nearestDist = () => { let b = 1e9; for (const m of list) if (!m.dead && !m.T.passive) b = Math.min(b, Math.hypot(m.pos.x - P.pos.x, m.pos.z - P.pos.z)); return b; };
  return { list, update, damage, clear, nearestDist, spawn };
}
