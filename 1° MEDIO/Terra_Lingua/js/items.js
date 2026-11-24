// TERRA LINGUA · Tienda: accesorios, herramientas y armas. "need" = unidad que debe estar completa.
export const ITEMS = [
  // Accesorios
  { id: 'h_cap', slot: 'hat', name: 'Worker Cap', icon: '🧢', cost: 60, need: 0, color: '#f4a62a', shape: 'cap' },
  { id: 'h_helmet', slot: 'hat', name: 'Safety Helmet', icon: '⛑️', cost: 140, need: 1, color: '#ffd93b', shape: 'helmet' },
  { id: 'h_grad', slot: 'hat', name: 'Graduation Cap', icon: '🎓', cost: 220, need: 2, color: '#2d2f3a', shape: 'grad' },
  { id: 'h_beret', slot: 'hat', name: 'Artist Beret', icon: '🎨', cost: 300, need: 3, color: '#d9539b', shape: 'beret' },
  { id: 'h_crown', slot: 'hat', name: 'Festival Crown', icon: '👑', cost: 520, need: 4, color: '#ffc933', shape: 'crown' },
  { id: 'c_red', slot: 'cape', name: 'Red Cape', icon: '🟥', cost: 90, need: 0, color: '#e8483f' },
  { id: 'c_green', slot: 'cape', name: 'Scholar Cape', icon: '🟩', cost: 200, need: 2, color: '#3fb56b' },
  { id: 'c_rainbow', slot: 'cape', name: 'Artist Cape', icon: '🌈', cost: 340, need: 3, color: '#9a55e0' },
  { id: 'p_cat', slot: 'pet', name: 'Cat', icon: '🐱', cost: 180, need: 1, model: 'cat' },
  { id: 'p_dog', slot: 'pet', name: 'Dog', icon: '🐶', cost: 180, need: 1, model: 'dog' },
  { id: 'p_fox', slot: 'pet', name: 'Fox', icon: '🦊', cost: 280, need: 2, model: 'fox' },
  { id: 'p_penguin', slot: 'pet', name: 'Penguin', icon: '🐧', cost: 320, need: 3, model: 'penguin' },
  { id: 'p_panda', slot: 'pet', name: 'Panda', icon: '🐼', cost: 380, need: 3, model: 'panda' },
  { id: 'p_lion', slot: 'pet', name: 'Lion', icon: '🦁', cost: 560, need: 4, model: 'lion' },
  // Herramientas (cambian cómo te mueves)
  { id: 't_boots', slot: 'tool', name: 'Speed Boots', icon: '👟', cost: 120, need: 0, desc: 'Run 25% faster.', speed: 1.25 },
  { id: 't_spring', slot: 'tool2', name: 'Spring Shoes', icon: '🦘', cost: 200, need: 1, desc: 'Jump higher.', jump: 1.3 },
  { id: 't_glider', slot: 'tool3', name: 'Glider', icon: '🪂', cost: 360, need: 2, desc: 'Hold jump in the air to glide.', glide: true },
  { id: 't_compass', slot: 'tool4', name: 'Quest Compass', icon: '🧭', cost: 100, need: 0, desc: 'A beam shows your next mission.', compass: true },
  // Armas: cada mundo trae las suyas (need = unidad que hay que completar para abrir ese mundo)
  { id: 'w_wood', slot: 'weapon', name: 'Wooden Sword', icon: '🗡️', cost: 0, need: 0, world: 1, dmg: 12, cd: .55, range: 3, color: '#c99a63', shape: 'sword' },
  { id: 'w_pick', slot: 'weapon', name: 'Miner\'s Pickaxe', icon: '⛏️', cost: 110, need: 0, world: 1, dmg: 17, cd: .62, range: 3.1, color: '#a7aeba', shape: 'pick' },
  { id: 'w_sling', slot: 'weapon', name: 'Nail Slingshot', icon: '🪃', cost: 160, need: 0, world: 1, dmg: 9, cd: .42, range: 22, color: '#e0e4ea', shape: 'sling', ranged: true },
  { id: 'w_stone', slot: 'weapon', name: 'Stone Sword', icon: '⚔️', cost: 150, need: 1, world: 2, dmg: 16, cd: .55, range: 3, color: '#a7aeba', shape: 'sword' },
  { id: 'w_quill', slot: 'weapon', name: 'Giant Quill Spear', icon: '🪶', cost: 230, need: 1, world: 2, dmg: 19, cd: .58, range: 4, color: '#f6f4ee', shape: 'spear' },
  { id: 'w_bow', slot: 'weapon', name: 'Echo Bow', icon: '🏹', cost: 300, need: 1, world: 2, dmg: 14, cd: .7, range: 26, color: '#9a6a3f', shape: 'bow', ranged: true },
  { id: 'w_hammer', slot: 'weapon', name: 'Word Hammer', icon: '🔨', cost: 260, need: 2, world: 3, dmg: 26, cd: .95, range: 3.2, color: '#7a5cff', shape: 'hammer', sweep: true },
  { id: 'w_brush', slot: 'weapon', name: 'Splash Brush', icon: '🖌️', cost: 330, need: 2, world: 3, dmg: 18, cd: .48, range: 3.3, color: '#ff7fbe', shape: 'brush', sweep: true },
  { id: 'w_blaster', slot: 'weapon', name: 'Rainbow Blaster', icon: '🌈', cost: 420, need: 2, world: 3, dmg: 11, cd: .32, range: 24, color: '#ffd93b', shape: 'blaster', ranged: true, rainbow: true },
  { id: 'w_crystal', slot: 'weapon', name: 'Crystal Blade', icon: '💎', cost: 480, need: 3, world: 4, dmg: 22, cd: .5, range: 3.4, color: '#7ff0e6', shape: 'sword' },
  { id: 'w_trident', slot: 'weapon', name: 'Sea Trident', icon: '🔱', cost: 520, need: 3, world: 4, dmg: 25, cd: .6, range: 4.2, color: '#2fd0e0', shape: 'trident' },
  { id: 'w_rocket', slot: 'weapon', name: 'Firework Launcher', icon: '🎆', cost: 600, need: 3, world: 4, dmg: 24, cd: 1.05, range: 30, color: '#ff3d71', shape: 'launcher', ranged: true, splash: 3 },
  { id: 'w_lantern', slot: 'weapon', name: 'Festival Staff', icon: '🏮', cost: 700, need: 4, world: 4, dmg: 20, cd: .6, range: 28, color: '#ff7a2e', shape: 'staff', ranged: true },
  // Poderes (clic derecho, R o ✨): proyectiles mágicos con área de efecto y tiempo de recarga
  { id: 'pw_spark', slot: 'power', name: 'Spark Ball', icon: '✨', cost: 0, need: 0, world: 1, dmg: 22, cd: 2.4, range: 26, color: '#ff9a2e', splash: 2.2, desc: 'A ball of fire.' },
  { id: 'pw_ice', slot: 'power', name: 'Ice Shard', icon: '❄️', cost: 220, need: 1, world: 2, dmg: 20, cd: 1.8, range: 28, color: '#7fe0ff', splash: 1.5, slow: true, desc: 'Freezes enemies.' },
  { id: 'pw_paint', slot: 'power', name: 'Paint Bomb', icon: '🎨', cost: 320, need: 2, world: 3, dmg: 30, cd: 3.2, range: 24, color: '#ff7fbe', splash: 3.6, rainbow: true, desc: 'Big colorful splash.' },
  { id: 'pw_star', slot: 'power', name: 'Firework Star', icon: '🎇', cost: 450, need: 3, world: 4, dmg: 38, cd: 3.8, range: 30, color: '#ffd93b', splash: 4.2, desc: 'Explodes like a firework.' },
  { id: 'pw_thunder', slot: 'power', name: 'Thunder Word', icon: '⚡', cost: 650, need: 4, world: 4, dmg: 32, cd: 3, range: 32, color: '#b9a8ff', splash: 1.6, chain: 3, desc: 'Jumps to 3 enemies.' }
];
export const itemById = id => ITEMS.find(i => i.id === id);

/* ---------- Materiales de construcción: se recolectan en el mundo y se gastan en el modo creativo ---------- */
export const MATS = {
  wood: { icon: '🪵', name: 'Wood', where: 'Trees in every land' },
  leaf: { icon: '🌿', name: 'Leaves', where: 'Tree tops, bees, caterpillars' },
  stone: { icon: '🪨', name: 'Stone', where: 'Rocks, orcs, skeletons' },
  sand: { icon: '🏖️', name: 'Sand', where: 'Fiesta Coast beaches, crabs' },
  clay: { icon: '🧱', name: 'Clay', where: 'Canvas Canyon rocks, tigers' },
  paint: { icon: '🎨', name: 'Paint', where: 'Flowers, cactus, mushrooms, coral, slimes' },
  crystal: { icon: '💎', name: 'Crystal', where: 'Crystals in Scholar Woods, ghosts, bosses' },
  gold: { icon: '🏅', name: 'Gold', where: 'Purple chests, art thieves, bosses' }
};
// Bloque del modo creativo → material que gasta (números = id de bloque de voxel.js)
export const BLOCK_MAT = { 8: 'wood', 6: 'wood', 7: 'leaf', 29: 'leaf', 1: 'leaf', 9: 'clay', 23: 'clay', 30: 'clay', 3: 'stone', 20: 'sand', 4: 'sand', 21: 'gold', 26: 'crystal', 25: 'crystal', 11: 'paint', 12: 'paint', 13: 'paint', 14: 'paint', 31: 'paint', 15: 'paint', 16: 'paint', 17: 'paint', 18: 'paint', 19: 'paint' };
// Bloque natural del mundo → material que da al recolectarlo
export const HARVEST = { 6: 'wood', 8: 'wood', 7: 'leaf', 28: 'leaf', 29: 'leaf', 3: 'stone', 27: 'stone', 4: 'sand', 23: 'clay', 26: 'crystal', 21: 'gold', 11: 'paint', 12: 'paint', 13: 'paint', 14: 'paint', 15: 'paint', 16: 'paint', 17: 'paint', 18: 'paint', 19: 'paint', 31: 'paint' };
// Lo que suelta cada criatura al ser derrotada
export const DROPS = { bee: { leaf: 2 }, orc: { stone: 3, wood: 2 }, hog: { wood: 2, leaf: 1 }, worm: { leaf: 3 }, skel: { stone: 3 }, ghost: { crystal: 1, stone: 1 }, keeper: { crystal: 1, wood: 2 }, slime: { paint: 3 }, thief: { paint: 2, gold: 1 }, tiger: { clay: 3 }, crab: { sand: 3 }, zombie: { sand: 2, wood: 2 }, parrot: { paint: 2 } };
export const STARTER_KIT = { wood: 30, leaf: 15, stone: 30, sand: 15, clay: 20, paint: 30, crystal: 4, gold: 3 };
export const SLOTS = [['all', 'All'], ['weapon', 'Weapons'], ['power', 'Powers'], ['mat', 'Materials'], ['hat', 'Hats'], ['cape', 'Capes'], ['pet', 'Pets'], ['tool', 'Tools']];
export const slotGroup = s => s.startsWith('tool') ? 'tool' : s;
export const LEVELS = pts => Math.floor(Math.sqrt(pts / 40)) + 1;
export const levelFloor = l => (l - 1) * (l - 1) * 40;
export const QUICK_CHAT = ['Hello!', 'Follow me!', 'Wait for me!', 'Help, please!', 'Good job!', 'Thank you!', 'Let\'s go!', 'I agree.', 'I don\'t agree.', 'What\'s your clue?', 'My clue says…', 'Ready?', 'Good game!', 'See you later!'];
