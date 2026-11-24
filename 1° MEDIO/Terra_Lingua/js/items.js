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
  // Armas para la arena
  { id: 'w_wood', slot: 'weapon', name: 'Wooden Sword', icon: '🗡️', cost: 0, need: 0, dmg: 12, cd: .55, range: 3, color: '#c99a63', shape: 'sword' },
  { id: 'w_stone', slot: 'weapon', name: 'Stone Sword', icon: '⚔️', cost: 150, need: 1, dmg: 16, cd: .55, range: 3, color: '#a7aeba', shape: 'sword' },
  { id: 'w_hammer', slot: 'weapon', name: 'Word Hammer', icon: '🔨', cost: 260, need: 2, dmg: 26, cd: .95, range: 3.2, color: '#7a5cff', shape: 'hammer' },
  { id: 'w_bow', slot: 'weapon', name: 'Echo Bow', icon: '🏹', cost: 340, need: 2, dmg: 14, cd: .7, range: 24, color: '#9a6a3f', shape: 'bow', ranged: true },
  { id: 'w_crystal', slot: 'weapon', name: 'Crystal Blade', icon: '💎', cost: 480, need: 3, dmg: 22, cd: .5, range: 3.4, color: '#7ff0e6', shape: 'sword' },
  { id: 'w_lantern', slot: 'weapon', name: 'Festival Staff', icon: '🏮', cost: 700, need: 4, dmg: 20, cd: .6, range: 28, color: '#ff7a2e', shape: 'staff', ranged: true }
];
export const itemById = id => ITEMS.find(i => i.id === id);
export const SLOTS = [['all', 'All'], ['hat', 'Hats'], ['cape', 'Capes'], ['pet', 'Pets'], ['tool', 'Tools'], ['weapon', 'Weapons']];
export const slotGroup = s => s.startsWith('tool') ? 'tool' : s;
export const LEVELS = pts => Math.floor(Math.sqrt(pts / 40)) + 1;
export const levelFloor = l => (l - 1) * (l - 1) * 40;
export const QUICK_CHAT = ['Hello!', 'Follow me!', 'Wait for me!', 'Help, please!', 'Good job!', 'Thank you!', 'Let\'s go!', 'I agree.', 'I don\'t agree.', 'What\'s your clue?', 'My clue says…', 'Ready?', 'Good game!', 'See you later!'];
