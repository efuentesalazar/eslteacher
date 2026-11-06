// Places, people, monsters and things to pick up.
// North = -z (top of the map), East = +x.

export const PLACES = {
  brightwater: { x: 0, z: 0, name: 'Brightwater', town: 0 },
  farm: { x: 46, z: 36, name: "Ben's Farm" },
  mill: { x: -50, z: 40, name: 'Old Mill' },
  pond: { x: 42, z: -48, name: 'Fishing Pond' },
  arena: { x: -50, z: -74, name: 'Arena' },
  leafhollow: { x: 0, z: -172, name: 'Leafhollow', town: 1 },
  glade: { x: -48, z: -188, name: 'Moonflower Glade' },
  wolflake: { x: 50, z: -196, name: 'Wolf Lake' },
  sagetree: { x: 0, z: -224, name: 'The Great Tree' },
  ironhearth: { x: 172, z: 0, name: 'Ironhearth', town: 2 },
  mine: { x: 208, z: -48, name: 'Deep Mine' },
  quarry: { x: 175, z: 42, name: 'Quarry' },
  redrock: { x: 0, z: 172, name: 'Redrock Camp', town: 3 },
  oasis: { x: 50, z: 188, name: 'Oasis' },
  ruins: { x: -52, z: 200, name: 'Old Ruins' },
  bonewick: { x: -172, z: 0, name: 'Bonewick', town: 4 },
  graveyard: { x: -186, z: 44, name: 'Graveyard' },
  crypt: { x: -206, z: -44, name: 'The Crypt' },
  tower: { x: -226, z: 0, name: 'Silent Tower' }
};

// People. model = KayKit character. race: human | elf | dwarf | orc | bone (skeleton folk)
// kind: animal | tree | board for special ones.
export const NPCS = {
  // ----- Greenvale (humans) -----
  rosa: { name: 'Mayor Rosa', model: 'Mage', tint: '#2f6fe0', x: -5, z: 6, color: '#2f6fe0', chat: ['Brightwater is a small town, but we have big hearts.', 'Without the Crown of Words, my neighbours are forgetting how to talk to each other.', 'If you need anything, come and talk to me. My door is always open.'] },
  tom: { name: 'Tom the Blacksmith', model: 'Barbarian', x: 17, z: -11, color: '#b5651d', shop: 'tom', hold: ['axe_1handed'], chat: ['Hot iron, strong arms! That is my motto.', 'Do you want to buy something? I have the best swords in Greenvale.', 'Remember: a good shield can save your life.'] },
  ben: { name: 'Farmer Ben', model: 'Ranger', tint: '#8a6a3c', x: 41, z: 28, color: '#7a9a2a', chat: ['My wheat is the best in the land. Well... it was.', 'Every morning I get up at five o\'clock to feed the animals.', 'The cows are calm today. That is a good sign.'] },
  hilda: { name: 'Granny Hilda', model: 'Mage', tint: '#c9b4e0', x: 54, z: 26, color: '#a46fd0', scale: 0.92, chat: ['My hens are the happiest hens in Greenvale!', 'When I was young, I walked to Leafhollow and back in one day.', 'Would you like a cup of tea? Oh, I have no cups. Never mind.'] },
  lily: { name: 'Little Lily', model: 'Rogue', tint: '#ff8fc0', x: -11, z: 13, color: '#ff6fa8', scale: 0.72, chat: ['I am seven years old! How old are you?', 'My favourite colour is pink. And purple. And blue!', 'Do you have a pet? I have a cat!'] },
  sam: { name: 'Shy Sam', model: 'Rogue', tint: '#6fa8ff', x: -27, z: -5, color: '#4f8fe0', scale: 0.78, chat: ['Oh! Hi... I am Sam.', 'I like drawing dragons. But I never show my drawings to anyone.'] },
  martha: { name: 'Martha the Baker', model: 'Mage', tint: '#f3c08a', x: -17, z: 15, color: '#e08a3c', shop: 'martha', chat: ['Fresh bread! Hot bread! Come and get it!', 'I start baking at four in the morning. The town loves my cinnamon rolls.', 'Bread is better when you share it.'] },
  joe: { name: 'Old Joe', model: 'Barbarian', tint: '#c8c8c8', x: 9, z: 9, color: '#888888', scale: 0.95, chat: ['Eh? What? Speak up, young one!', 'This well is older than me. And I am VERY old.', 'In my day, we did not have heroes. We had... farmers.'] },
  anna: { name: 'Anna', model: 'Mage', tint: '#e8322f', x: -24, z: 7, color: '#e8322f', chat: ['I love the market on Saturdays. It is so busy!', 'Do you like my red dress? I made it myself.', 'I am waiting for somebody... but he is very shy.'] },
  greg: { name: 'Guard Greg', model: 'Knight', x: 4, z: -38, color: '#5577aa', hold: ['sword_1handed', 'shield_badge_color'], chat: ['North road: to Whisperwood. Be careful with the wolves.', 'I am on duty from six in the morning to six in the evening.', 'Nothing gets past Guard Greg! Well... except that thief.'] },
  finn: { name: 'Finn the Fisherman', model: 'Ranger', tint: '#3a8fb0', x: 35, z: -43, color: '#3a8fb0', chat: ['Shh! You will scare the fish.', 'Yesterday I caught a fish THIS big. Really!', 'The best time for fishing is early in the morning.'] },
  rob: { name: 'Rob the Innkeeper', model: 'Barbarian', tint: '#e0b080', x: 16, z: 24, color: '#c07a3a', chat: ['Welcome to the Sleepy Pony Inn!', 'We have soup, bread and the best apple juice in town.', 'Every Friday we have a quiz night. Everybody comes!'] },
  enchanter: { name: 'Elara the Enchanter', model: 'Mage', tint: '#ffd23a', x: -15, z: -13, color: '#c08a00', upgrader: true, hold: ['wand'], chat: ['Magic stones make metal stronger. And shinier!', 'At +12, your sword will shine like the sun.'] },
  vera: { name: 'Captain Vera', model: 'Knight', tint: '#c0392b', x: -42.3, z: -56.3, color: '#c0392b', arena: true, hold: ['sword_2handed'], chat: [] },
  pip: { name: 'Pip the Postman', model: 'Rogue', tint: '#ffd23a', x: 6, z: -14, color: '#e0b020', chat: ['Letters, letters, letters! I deliver them all.', 'I walk twenty kilometres every day. My feet hurt!'] },
  board_g: { name: 'Notice Board', kind: 'board', x: 9, z: -5, color: '#8a5a2b' },
  cat_ok: { name: 'Black cat', kind: 'animal', file: 'cat', tint: '#202020', tintK: 0.85, paws: true, ribbon: true, x: -40, z: 52, color: '#333' },
  cat_x1: { name: 'Black cat', kind: 'animal', file: 'cat', tint: '#202020', tintK: 0.85, x: 28, z: 44, color: '#333', decoy: { q: 's_cat', text: 'This cat is black, but it has black paws and no red ribbon. It is not Whiskers.' } },
  cat_x2: { name: 'Orange cat', kind: 'animal', file: 'cat', tint: '#ff8a2a', tintK: 0.6, ribbon: true, x: -30, z: -36, color: '#f80', decoy: { q: 's_cat', text: 'This cat has a red ribbon, but it is ORANGE. Whiskers is black.' } },

  // ----- Whisperwood (elves) -----
  faelan: { name: 'Guard Faelan', model: 'Ranger', race: 'elf', tint: '#4caf50', x: 4, z: -146, color: '#2e8b57', hold: [null, 'bow_withString'], chat: ['The forest is listening. Always.', 'Elves can see a leaf fall from a hundred metres away.'] },
  elowen: { name: 'Queen Elowen', model: 'Mage', race: 'elf', tint: '#f4f1e0', x: 0, z: -184, color: '#7fbf7f', chat: ['Welcome to Leafhollow, friend of the forest.', 'The trees are old and wise. We must protect them.', 'Silence is not peace. Words are peace.'] },
  ilyra: { name: 'Sage Ilyra', model: 'Mage', race: 'elf', tint: '#9a6fe0', x: 3, z: -218, color: '#8a5fd0', chat: ['Questions are more interesting than answers.', 'I have lived under this tree for three hundred years.'] },
  thalia: { name: 'Thalia the Herbalist', model: 'Rogue', race: 'elf', tint: '#a0d080', x: -13, z: -166, color: '#6fae3f', chat: ['Every plant in the forest has a name and a use.', 'Never eat a mushroom if you do not know its name!'] },
  liriel: { name: 'Liriel the Poet', model: 'Mage', race: 'elf', tint: '#ffb0e0', x: 12, z: -164, color: '#e070b0', chat: ['Roses are red, violets are blue... I need a new rhyme!', 'A poem is a painting made of words.'] },
  aeron: { name: 'Aeron the Archer', model: 'Ranger', race: 'elf', x: 16, z: -152, color: '#2f9e6f', hold: [null, 'bow_withString'], chat: ['I never miss. Well, almost never.', 'Breathe in, aim, breathe out, shoot.'] },
  nim: { name: 'Nim the Merchant', model: 'Rogue_Hooded', race: 'elf', tint: '#5fbf8f', x: -9, z: -178, color: '#3f9f6f', shop: 'nim', chat: ['Elven things for good adventurers!', 'Everything I sell is made by hand, with love.'] },
  sylvi: { name: 'Sylvi the Tailor', model: 'Mage', race: 'elf', tint: '#d0e8ff', x: -16, z: -156, color: '#6f8fdf', chat: ['A good cloak keeps you warm and hidden.', 'I can make anything with a needle and some thread.'] },
  oak: { name: 'Old Oak', kind: 'tree', x: -24, z: -205, color: '#7a5a2a' },
  board_w: { name: 'Notice Board', kind: 'board', x: 8, z: -160, color: '#8a5a2b' },

  // ----- Stonehold (dwarves) -----
  durin: { name: 'Durin the Gatekeeper', model: 'Knight', race: 'dwarf', tint: '#9a7a4a', x: 146, z: 5, color: '#9a7a4a', hold: ['axe_2handed'], chat: ['Hmph.', 'I have guarded this gate for ninety-two years. Nobody gets in without good manners.'] },
  thrain: { name: 'King Thrain', model: 'Knight', race: 'dwarf', tint: '#ffcc33', x: 196, z: -3, color: '#d4a017', chat: ['Ironhearth was built stone by stone, word by word.', 'A dwarf never forgets a friend. Or an enemy.'] },
  bram: { name: 'Bram the Miner', model: 'Barbarian', race: 'dwarf', tint: '#7a7a7a', x: 199, z: -56, color: '#777', hold: ['axe_1handed'], chat: ['Dig, dig, dig! That is my life.'] },
  gilda: { name: 'Gilda the Miner', model: 'Rogue', race: 'dwarf', tint: '#c06030', x: 226, z: -36, color: '#c06030', chat: ['Look at this crystal! Isn\'t it beautiful?'] },
  olin: { name: 'Olin the Miner', model: 'Ranger', race: 'dwarf', tint: '#5070a0', x: 212, z: -80, color: '#5070a0', chat: ['I am not scared. I am... resting.'] },
  durgan: { name: 'Durgan the Runesmith', model: 'Knight', race: 'dwarf', tint: '#7a5af0', x: 178, z: -14, color: '#6a4ad0', upgrader: true, hold: ['Skeleton_Axe'], chat: ['Runes and hammers. That is all a dwarf needs.', 'Bring me stones, and I will make your armour sing!'] },
  helga: { name: 'Helga the Cook', model: 'Barbarian', race: 'dwarf', tint: '#e0a070', x: 168, z: 14, color: '#d07a3a', chat: ['A hungry dwarf is an angry dwarf!', 'My mushroom pie is famous in all of Stonehold.'] },
  brokk: { name: 'Brokk the Smith', model: 'Barbarian', race: 'dwarf', tint: '#5a4a3a', x: 164, z: -14, color: '#a0522d', shop: 'brokk', hold: ['axe_1handed'], chat: ['Dwarven steel is the strongest steel.', 'Do you want an axe? Everybody wants an axe.'] },
  balin: { name: 'Balin the Bard', model: 'Mage', race: 'dwarf', tint: '#3a8f5a', x: 182, z: 16, color: '#3a8f5a', chat: ['La la laaa! Oh, hello!', 'Dwarves sing when they work. It makes the stone softer.'] },
  board_s: { name: 'Notice Board', kind: 'board', x: 160, z: 8, color: '#8a5a2b' },

  // ----- Sunscar (orcs) -----
  ugra: { name: 'Ugra the Scout', model: 'Barbarian', race: 'orc', tint: '#b8873a', x: 4, z: 146, color: '#b8873a', hold: ['Skeleton_Axe'], chat: ['Orcs say what they think. No time for pretty words.', 'The sun is hot. The sand is hot. Everything is hot!'] },
  grukka: { name: 'Chief Grukka', model: 'Barbarian', race: 'orc', tint: '#8f2a20', x: 0, z: 192, color: '#c0392b', scale: 1.15, hold: ['axe_2handed'], chat: ['Grukka is chief because Grukka is strong AND clever.', 'Respect is earned, not given.'] },
  morga: { name: 'Shaman Morga', model: 'Mage', race: 'orc', tint: '#7a3a8a', x: -15, z: 180, color: '#8e44ad', hold: ['staff'], chat: ['The stars tell stories. Orcs listen.', 'Wisdom is a quiet kind of strength.'] },
  zug: { name: 'Little Zug', model: 'Rogue', race: 'orc', tint: '#d0a060', x: 12, z: 165, color: '#d4a040', scale: 0.7, chat: ['I am going to be a great warrior! Like the chief!'] },
  kasim: { name: 'Kasim the Trader', model: 'Rogue_Hooded', tint: '#e0a030', x: 22, z: 176, color: '#e0a030', shop: 'kasim', chat: ['Silk! Spices! Glass from the desert!', 'I have travelled to every corner of the land.'] },
  nara: { name: 'Old Nara', model: 'Mage', race: 'orc', tint: '#a08060', x: -9, z: 158, color: '#a08060', scale: 0.92, chat: ['Water is life in the desert.', 'When I was young, the oasis was twice as big.'] },
  brug: { name: 'Brug the Crafter', model: 'Barbarian', race: 'orc', tint: '#506070', x: -22, z: 164, color: '#506070', chat: ['I make shields. Strong ones. Ugly ones. But strong!'] },
  board_d: { name: 'Notice Board', kind: 'board', x: 14, z: 150, color: '#8a5a2b' },
  dog_ok: { name: 'Brown dog', kind: 'animal', file: 'dog', tint: '#8a5a2b', tintK: 0.5, whiteEar: true, x: -38, z: 216, color: '#8a5a2b' },
  dog_x1: { name: 'Black dog', kind: 'animal', file: 'dog', tint: '#222222', tintK: 0.8, x: 62, z: 204, color: '#222', decoy: { q: 'trials', text: 'This dog is BLACK. Biter is brown, with one white ear.' } },
  dog_x2: { name: 'Brown dog', kind: 'animal', file: 'dog', tint: '#8a5a2b', tintK: 0.5, x: -64, z: 180, color: '#8a5a2b', decoy: { q: 'trials', text: 'This dog is brown, but both ears are brown. Biter has ONE WHITE ear.' } },

  // ----- Mistmoor (the Bonefolk) -----
  skully: { name: 'Mayor Skully', model: 'Skeleton_Minion', race: 'bone', x: -166, z: 6, color: '#b8b0d0', chat: ['Boo! Ha ha, just kidding. We are friendly here.', 'Being a skeleton is not easy. You get cold very quickly.'] },
  mrbones: { name: 'Mr. Bones', model: 'Skeleton_Rogue', race: 'bone', x: -180, z: -10, color: '#9a90b8', chat: ['Who am I? Where am I? Why am I?'] },
  morwen: { name: 'Morwen the Witch', model: 'Mage', tint: '#3a2a5a', x: -158, z: -15, color: '#6a3a9a', shop: 'morwen', hold: ['wand'], chat: ['Potions! Fresh potions! Only slightly bubbly.', 'Do not touch the green bottle. Trust me.'] },
  rattle: { name: 'Rattle the Gardener', model: 'Skeleton_Minion', race: 'bone', x: -182, z: 30, color: '#a0c080', chat: ['Even in Mistmoor, flowers can grow.'] },
  clatter: { name: 'Clatter', model: 'Skeleton_Rogue', race: 'bone', x: -150, z: 24, color: '#e08a3c', chat: ['Pumpkins! I love pumpkins. I cannot eat them, but I love them.'] },
  wisp: { name: 'Wisp the Lantern Keeper', model: 'Skeleton_Mage', race: 'bone', x: -158, z: 12, color: '#7fd0ff', chat: ['Light is a gift. Darkness is just light that is sleeping.'] },
  board_m: { name: 'Notice Board', kind: 'board', x: -162, z: -6, color: '#8a5a2b' }
};

// Monsters. Every zone respawns its monsters some time after they die.
export const MONSTERS = {
  dummy:      { name: 'Training Dummy', kind: 'dummy', hp: 9999, atk: 0, xp: 0, lvl: 1, gold: [0, 0], loot: [] },
  slime:      { name: 'Green Slime', kind: 'slime', color: '#5fd35a', size: 1, hp: 22, atk: 4, xp: 9, lvl: 1, gold: [1, 3], loot: [['slime_jelly', 0.6], ['potion_s', 0.12], ['apple', 0.2]] },
  blue_slime: { name: 'Blue Slime', kind: 'slime', color: '#4aa8ff', size: 1.2, hp: 38, atk: 6, xp: 14, lvl: 3, gold: [2, 5], loot: [['slime_jelly', 0.6], ['potion_s', 0.2]] },
  wolf:       { name: 'Grey Wolf', kind: 'animal', file: 'dog', tint: '#7a7f8a', h: 1.3, hp: 48, atk: 8, xp: 18, lvl: 4, gold: [2, 6], loot: [['wolf_fur', 0.7], ['potion_s', 0.15]] },
  alpha_wolf: { name: 'Alpha Wolf', kind: 'animal', file: 'dog', tint: '#3a3f4a', h: 2.6, hp: 200, atk: 13, xp: 120, lvl: 6, gold: [30, 40], loot: [['wolf_fur', 1], ['potion_m', 1]], boss: true },
  minion:     { name: 'Skeleton Miner', kind: 'char', model: 'Skeleton_Minion', hold: ['Skeleton_Blade'], hp: 70, atk: 11, xp: 26, lvl: 6, gold: [3, 8], loot: [['bone', 0.6], ['iron_ore', 0.3], ['potion_s', 0.2], ['bone_blade', 0.04], ['iron_helmet', 0.04]] },
  foreman:    { name: 'Bone Foreman', kind: 'char', model: 'Skeleton_Warrior', hold: ['Skeleton_Axe', 'Skeleton_Shield_Large_B'], scale: 1.7, hp: 380, atk: 18, xp: 220, lvl: 8, gold: [60, 80], loot: [['potion_m', 1], ['gold_nugget', 1]], boss: true },
  sand_slime: { name: 'Sand Slime', kind: 'slime', color: '#f0b040', size: 1.35, hp: 75, atk: 13, xp: 28, lvl: 7, gold: [3, 8], loot: [['sand_glass', 0.55], ['potion_s', 0.2]] },
  bandit:     { name: 'Dust Bandit', kind: 'char', model: 'Rogue_Hooded', tint: '#a07040', hold: ['dagger'], hp: 105, atk: 15, xp: 34, lvl: 8, gold: [6, 14], loot: [['potion_s', 0.3], ['sand_glass', 0.25], ['rogue_mask', 0.05], ['hunter_dagger', 0.05]] },
  sk_rogue:   { name: 'Skeleton Raider', kind: 'char', model: 'Skeleton_Rogue', hold: ['Skeleton_Blade'], hp: 95, atk: 14, xp: 30, lvl: 8, gold: [4, 10], loot: [['bone', 0.6], ['potion_s', 0.2]] },
  warrior:    { name: 'Skeleton Warrior', kind: 'char', model: 'Skeleton_Warrior', hold: ['Skeleton_Axe', 'Skeleton_Shield_Small_A'], hp: 150, atk: 19, xp: 42, lvl: 10, gold: [8, 16], loot: [['bone', 0.6], ['ghost_dust', 0.3], ['potion_m', 0.12], ['bone_helmet', 0.05], ['bone_shield', 0.04]] },
  sk_mage:    { name: 'Skeleton Mage', kind: 'char', model: 'Skeleton_Mage', hold: ['Skeleton_Staff'], ranged: true, hp: 120, atk: 20, xp: 46, lvl: 10, gold: [8, 18], loot: [['ghost_dust', 0.6], ['potion_m', 0.15], ['bone_cloak', 0.04]] },
  keeper:     { name: 'Crypt Keeper', kind: 'char', model: 'Skeleton_Warrior', tint: '#6a4a9a', hold: ['Skeleton_Blade', 'Skeleton_Shield_Large_A'], scale: 1.8, hp: 600, atk: 24, xp: 350, lvl: 11, gold: [90, 120], loot: [['potion_m', 2], ['ghost_dust', 3]], boss: true },
  hush:       { name: 'Lord Hush', kind: 'char', model: 'Skeleton_Mage', tint: '#2a1a4a', hold: ['Skeleton_Staff'], scale: 2.1, ranged: true, hp: 950, atk: 27, xp: 800, lvl: 13, gold: [200, 250], loot: [], boss: true, summon: 'minion' }
};

// Where monsters live. q/step: bosses only appear during that quest step.
export const ZONES = [
  { m: 'slime', x: 60, z: 54, r: 14, n: 6 },
  { m: 'slime', x: -84, z: -26, r: 14, n: 5 },
  { m: 'dummy', x: -33.8, z: -60.8, r: 3, n: 2 },
  { m: 'slime', x: 70, z: -20, r: 12, n: 4 },
  { m: 'wolf', x: -30, z: -112, r: 12, n: 3 },
  { m: 'wolf', x: 34, z: -122, r: 12, n: 3 },
  { m: 'blue_slime', x: -58, z: -150, r: 14, n: 5 },
  { m: 'wolf', x: 66, z: -172, r: 14, n: 4 },
  { m: 'wolf', x: -70, z: -210, r: 12, n: 3 },
  { m: 'alpha_wolf', x: 58, z: -212, r: 2, n: 1, q: 'riddles', step: 1 },
  { m: 'minion', x: 214, z: -56, r: 14, n: 5 },
  { m: 'minion', x: 140, z: -56, r: 12, n: 3 },
  { m: 'minion', x: 130, z: 50, r: 12, n: 3 },
  { m: 'foreman', x: 218, z: -68, r: 2, n: 1, q: 'foreman', step: 0 },
  { m: 'sand_slime', x: 42, z: 134, r: 14, n: 5 },
  { m: 'sand_slime', x: 70, z: 160, r: 12, n: 3 },
  { m: 'bandit', x: -54, z: 204, r: 13, n: 5 },
  { m: 'sk_rogue', x: -44, z: 138, r: 12, n: 3 },
  { m: 'sk_rogue', x: 110, z: 120, r: 12, n: 3 },
  { m: 'minion', x: -136, z: 46, r: 12, n: 4 },
  { m: 'warrior', x: -196, z: 58, r: 12, n: 4 },
  { m: 'sk_mage', x: -214, z: -22, r: 10, n: 3 },
  { m: 'warrior', x: -120, z: -60, r: 12, n: 3 },
  { m: 'sk_mage', x: -110, z: 100, r: 12, n: 2 },
  { m: 'keeper', x: -208, z: -52, r: 2, n: 1, q: 'crypt', step: 2 },
  { m: 'hush', x: -226, z: 6, r: 2, n: 1, q: 'finale', step: 1 }
];

// Things you pick up during missions. They only appear while that mission is active.
export const PICKS = [
  { item: 'egg', q: 's_eggs', x: 50, z: 30, r: 14, n: 8 },
  { item: 'moonflower', q: 'moonflowers', x: -48, z: -188, r: 12, n: 5 },
  { item: 'nightshade', q: 'moonflowers', x: -48, z: -188, r: 12, n: 6 },
  { item: 'spotted_mushroom', q: 's_mush', x: -36, z: -150, r: 16, n: 6 },
  { item: 'brown_mushroom', q: 's_mush', x: -36, z: -150, r: 16, n: 6 },
  { item: 'lost_arrow', q: 's_arrows', x: 36, z: -150, r: 18, n: 8 },
  { item: 'iron_ore', q: 's_ore', x: 176, z: 44, r: 12, n: 8 },
  { item: 'cheese', q: 's_recipe', x: 160, z: 22, r: 5, n: 3 },
  { item: 'apple', q: 's_recipe', x: 186, z: 24, r: 5, n: 4 },
  { item: 'bread', q: 's_recipe', x: 186, z: 24, r: 5, n: 3 },
  { item: 'lost_hammer', q: 's_hammer', x: 200, z: -40, r: 0.5, n: 1 },
  { item: 'water_bucket', q: 's_water', x: 50, z: 188, r: 11, n: 6, ring: 11 },
  { item: 'sand_glass', q: 's_glass', x: 30, z: 205, r: 16, n: 7 },
  { item: 'caravan_box', q: 's_caravan', x: -16, z: 226, r: 0.5, n: 1 },
  { item: 'diary_page', q: 's_name', x: -186, z: 44, r: 14, n: 3 },
  { item: 'pumpkin', q: 's_pumpkins', x: -146, z: 34, r: 10, n: 8 },
  { item: 'yellow_pumpkin', q: 's_pumpkins', x: -146, z: 34, r: 10, n: 6 }
];

// Signs with directions (reading in the world).
export const SIGNS = [
  { x: 6, z: -24, lines: ['↑ North: Whisperwood (Elves)', '→ East: Fishing Pond'] },
  { x: -16, z: -24, lines: ['↖ The Arena', 'Duels: 1 vs 1'] },
  { x: 24, z: 6, lines: ['→ East: Stonehold (Dwarves)', '↘ Ben\'s Farm'] },
  { x: -6, z: 24, lines: ['↓ South: Sunscar Desert (Orcs)', '↙ Old Mill'] },
  { x: -24, z: -6, lines: ['← West: Mistmoor', 'Danger! Skeletons!'] },
  { x: 6, z: -140, lines: ['Leafhollow ↑', '← Moonflower Glade', '→ Wolf Lake'] },
  { x: 140, z: 8, lines: ['Ironhearth →', '↑ Deep Mine (north-east)', '↓ Quarry'] },
  { x: -6, z: 140, lines: ['Redrock Camp ↓', '↘ Oasis', '↙ Old Ruins'] },
  { x: -140, z: -8, lines: ['← Bonewick', 'Graveyard: south of the town'] }
];

// Portals: walk close to one to activate it. Then you can travel between active portals.
export const PORTALS = [
  { id: 'p_bright', name: 'Brightwater', realm: 0, x: -10, z: -8, color: '#ffd23a', lvl: '1–3' },
  { id: 'p_arena', name: 'Arena', realm: 0, x: -47.4, z: -50.4, color: '#ff5a3a', lvl: 'PvP' },
  { id: 'p_leaf', name: 'Leafhollow', realm: 1, x: -7, z: -162, color: '#5fe07a', lvl: '3–6' },
  { id: 'p_wolf', name: 'Wolf Lake', realm: 1, x: 34, z: -186, color: '#5fe07a', lvl: '5–7' },
  { id: 'p_iron', name: 'Ironhearth', realm: 2, x: 178, z: 6, color: '#ff9a3a', lvl: '5–8' },
  { id: 'p_mine', name: 'Deep Mine', realm: 2, x: 190, z: -32, color: '#ff9a3a', lvl: '6–9' },
  { id: 'p_red', name: 'Redrock Camp', realm: 3, x: -10, z: 167, color: '#ffe14a', lvl: '7–10' },
  { id: 'p_bone', name: 'Bonewick', realm: 4, x: -175, z: 4, color: '#b07cff', lvl: '9–12' },
  { id: 'p_tower', name: 'Silent Tower', realm: 4, x: -210, z: 16, color: '#b07cff', lvl: '12+' }
];
