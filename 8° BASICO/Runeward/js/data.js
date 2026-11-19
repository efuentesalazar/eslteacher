/* RUNEWARD · game data: zones, monsters, bosses, recipes, buildings and story text. */

export const MAP_W = 144, MAP_H = 144, CX = 72, CY = 72;

// Sprite rectangles in 16 px tiles: [sheet, x, y, w, h]
export const SPR = {
  treeRound: ['nature', 0, 0, 2, 2], pine: ['nature', 2, 0, 2, 2], deadTree: ['nature', 4, 0, 2, 2], treeTrunk: ['nature', 6, 0, 2, 2],
  snowPine: ['nature', 8, 0, 2, 2], snowPine2: ['nature', 10, 0, 2, 2], pinkTree: ['nature', 14, 0, 2, 2], roundBush: ['nature', 16, 0, 2, 2],
  cactus: ['nature', 11, 8, 1, 2], bigRock: ['nature', 13, 8, 2, 2], greyRock: ['nature', 17, 8, 2, 2],
  bush1: ['nature', 0, 10, 1, 1], bush2: ['nature', 1, 10, 1, 1], bush3: ['nature', 2, 10, 1, 1], bush4: ['nature', 4, 10, 1, 1],
  flowerY: ['nature', 0, 11, 1, 1], flowerR: ['nature', 3, 11, 1, 1], flowerW: ['nature', 6, 11, 1, 1],
  rockBrown: ['nature', 4, 13, 1, 1], rockOrange: ['nature', 5, 13, 1, 1], rockSnow: ['nature', 4, 12, 1, 1], rockGrey: ['nature', 7, 12, 1, 1], rockDark: ['nature', 8, 12, 1, 1],
  oreIron: ['nature', 4, 14, 1, 1], oreGold: ['nature', 5, 14, 1, 1], oreDark: ['nature', 6, 14, 1, 1],
  crystalBlue: ['nature', 1, 14, 1, 1], crystalPink: ['nature', 2, 14, 1, 1], crystalOrange: ['nature', 0, 14, 1, 1],
  keep: ['house', 0, 0, 4, 3], torii: ['house', 0, 5, 2, 2], sign: ['element', 6, 3, 1, 2],
  workbench: ['camp', 8, 3, 2, 2], forge: ['element', 6, 1, 1, 1], campfire: ['camp', 0, 8, 1, 1],
  woodWall: ['dungeon', 2, 1, 1, 1], stoneWall: ['dungeon', 8, 3, 1, 1], spikes: ['dungeon', 4, 1, 1, 1],
  brazier: ['dungeon', 2, 2, 1, 1], tower: ['towers', 0, 0, 2, 2], loreStone: ['dungeon', 5, 2, 1, 1], loreDone: ['dungeon', 3, 2, 1, 1],
  runeCrystal: ['towers', 18, 4, 2, 2], barrel: ['camp', 4, 6, 2, 2], stump: ['camp', 1, 5, 2, 2]
};

/* Ground tiles (TilesetFloor): plain tile, detail tiles, path blob origin.
   Water blob origins are in TilesetWater. */
export const ZONES = [
  { id: 0, name: 'Greenvale', grade: '5b', music: 'meadow', ground: [0, 12], details: [[1, 12], [2, 12], [3, 12], [4, 12]], path: [0, 7], water: [0, 6],
    trees: ['treeRound', 'treeTrunk', 'roundBush'], rocks: ['rockBrown'], ore: null, decor: ['flowerY', 'flowerR', 'flowerW', 'bush1', 'bush2'],
    mobs: ['Slime', 'Mushroom', 'Snake'], color: '#8fb64a', lvl: '1-3' },
  { id: 1, name: 'Whisperwood', grade: '6b', music: 'forest', ground: [11, 12], details: [[12, 12], [13, 12], [14, 12], [15, 12]], path: [11, 7], water: null,
    trees: ['pine', 'pine', 'treeTrunk', 'pinkTree'], rocks: ['rockGrey'], ore: 'iron', decor: ['bush3', 'bush4', 'flowerW'],
    mobs: ['SpiderRed', 'Owl', 'Larva', 'Bamboo'], color: '#4f8a3a', lvl: '3-6' },
  { id: 2, name: 'Sunscar Dunes', grade: '7b', music: 'desert', ground: [0, 5], details: [[1, 5], [2, 5], [3, 5], [4, 5]], path: [0, 0], water: [0, 0],
    trees: ['cactus', 'cactus', 'deadTree'], rocks: ['rockOrange', 'bigRock'], ore: 'gold', decor: [],
    mobs: ['Lizard', 'Mole', 'Reptile'], color: '#e9a85a', lvl: '6-9' },
  { id: 3, name: 'Frostfang Peaks', grade: '8b', music: 'frost', ground: [0, 19], details: [[1, 19], [2, 19], [3, 19], [4, 19]], path: [0, 14], water: [13, 0],
    trees: ['snowPine', 'snowPine2'], rocks: ['rockSnow', 'greyRock'], ore: 'crystal', decor: [],
    mobs: ['Spirit', 'BlueBat', 'Eye', 'Cyclope2'], color: '#e4e4f0', lvl: '9-12' },
  { id: 4, name: 'Ashen Wastes', grade: '1m', music: 'ash', ground: [11, 19], details: [[12, 19], [13, 19], [14, 19]], path: [11, 14], water: null,
    trees: ['deadTree'], rocks: ['rockDark', 'greyRock'], ore: 'crystal', decor: [],
    mobs: ['Skull', 'Flam', 'Flam2', 'Cyclope'], color: '#8d7766', lvl: '12-15' },
  { id: 5, name: 'Hollow Citadel', grade: '3m', music: 'final', ground: [11, 19], details: [[12, 19], [13, 19]], path: [11, 14], water: null,
    trees: ['deadTree'], rocks: ['rockDark'], ore: null, decor: [],
    mobs: ['Skeleton', 'SkeletonDemon', 'Dragon'], color: '#6a4a5a', lvl: '15+' }
];

// Monsters: sheet type 'mon' (64x64, 4 frames) or 'chr' (character 64x112)
export const MOBS = {
  Slime: { hp: 1, spd: 22 }, Mushroom: { hp: 1.2, spd: 18 }, Snake: { hp: .9, spd: 30 },
  SpiderRed: { hp: 1, spd: 34 }, Owl: { hp: .9, spd: 30, shoot: 'energy' }, Larva: { hp: 1.3, spd: 18 }, Bamboo: { hp: 1.2, spd: 24 },
  Lizard: { hp: 1, spd: 36 }, Mole: { hp: 1.3, spd: 22 }, Reptile: { hp: 1.1, spd: 28, shoot: 'rock' },
  Spirit: { hp: .9, spd: 30, shoot: 'energy', float: true }, BlueBat: { hp: .8, spd: 42, float: true }, Eye: { hp: 1, spd: 20, shoot: 'energy', float: true }, Cyclope2: { hp: 1.5, spd: 22 },
  Skull: { hp: 1, spd: 34, float: true }, Flam: { hp: 1, spd: 28, shoot: 'fireball' }, Flam2: { hp: 1.2, spd: 26, shoot: 'fireball' }, Cyclope: { hp: 1.6, spd: 22 },
  Skeleton: { hp: 1.1, spd: 30, chr: true }, SkeletonDemon: { hp: 1.4, spd: 30, chr: true }, Dragon: { hp: 1.5, spd: 26, shoot: 'fireball' }
};
// Base stats by zone
export const ZSTAT = { hp: [18, 42, 85, 160, 270, 430], dmg: [5, 9, 15, 22, 31, 42], xp: [4, 7, 12, 19, 28, 40], gold: [1, 2, 3, 5, 7, 10] };

// Bosses (one per zone): idle strip frames
export const BOSSES = [
  { zone: 0, id: 'GiantSlime', name: 'Gloop the Mumbler', frames: 5, fw: 62, fh: 52, hp: 260, dmg: 9, at: [72, 54], rune: 'Rune of Words',
    taunt: 'Blub... blub... I ate all the words of Greenvale!', shoot: 'energy' },
  { zone: 1, id: 'GiantFrog', name: 'Croakmaw', frames: 5, fw: 40, fh: 40, hp: 650, dmg: 15, at: [16, 72], rune: 'Rune of Stories',
    taunt: 'Croak! Stories are for fools. Silence is better!', shoot: 'energy' },
  { zone: 2, id: 'GiantRacoon', name: 'Sandthief', frames: 6, fw: 60, fh: 60, hp: 1250, dmg: 22, at: [128, 72], rune: 'Rune of Voices',
    taunt: 'Every voice in the desert belongs to ME now!', shoot: 'rock' },
  { zone: 3, id: 'GiantSpirit', name: 'The Frostwraith', frames: 5, fw: 50, fh: 50, hp: 2300, dmg: 30, at: [72, 14], rune: 'Rune of Ideas',
    taunt: 'Your ideas will freeze forever in my ice...', shoot: 'energy' },
  { zone: 4, id: 'DemonCyclop', name: 'Cindereye', frames: 5, fw: 50, fh: 50, hp: 3800, dmg: 40, at: [84, 106], rune: 'Rune of Reason',
    taunt: 'Reason? I burned it all to ashes!', shoot: 'fireball' },
  { zone: 5, id: 'TenguRed', name: 'The Hollow King', frames: 6, fw: 82, fh: 82, hp: 6500, dmg: 52, at: [72, 132], rune: 'Crown of Meaning',
    taunt: 'So, a little Runeward. Without words, your people cannot even scream.', shoot: 'fireball' }
];

// Hero classes. sprite skins: [sheet, sheet]
export const CLASSES = {
  warrior: { name: 'Warrior', desc: 'Strong and tough. Sword attacks hit everything in front of you. Special: Whirlwind.', skins: ['Knight', 'Samurai'], hp: 120, atk: 10, spd: 62, cd: .38, special: 'Whirlwind', scd: 6 },
  ranger: { name: 'Ranger', desc: 'Fast. Shoots arrows from far away. Special: Triple Shot.', skins: ['Hunter', 'NinjaGreen'], hp: 95, atk: 8, spd: 70, cd: .32, special: 'Triple Shot', scd: 5 },
  mage: { name: 'Mage', desc: 'Fireballs explode and hit groups of enemies. Special: Rune Nova.', skins: ['SorcererOrange', 'NinjaMageBlack'], hp: 85, atk: 11, spd: 64, cd: .5, special: 'Rune Nova', scd: 7 }
};
export const WEAPON_MULT = [1, 1.6, 2.6, 4, 6, 9];
export const ARMOR_DEF = [0, .15, .3, .42, .52, .62];
export const WEAPON_NAMES = {
  warrior: ['Rusty Sword', 'Stone Blade', 'Iron Sword', 'Golden Sword', 'Crystal Sword', 'Runeblade'],
  ranger: ['Old Bow', 'Stone Bow', 'Iron Bow', 'Golden Bow', 'Crystal Bow', 'Runebow'],
  mage: ['Oak Wand', 'Stone Wand', 'Iron Staff', 'Golden Staff', 'Crystal Staff', 'Runestaff']
};
export const WEAPON_ICON = { warrior: ['sword', 'sword', 'sword2', 'katana', 'bigsword', 'bigsword'], ranger: ['bow', 'bow', 'bow2', 'bow2', 'bow2', 'bow2'], mage: ['wand', 'wand', 'tome', 'tome', 'tome', 'tome'] };
export const ARMOR_NAMES = ['Traveller Clothes', 'Padded Armour', 'Iron Mail', 'Golden Plate', 'Crystal Aegis', 'Runic Armour'];

export const ITEMS = {
  wood: 'Wood', stone: 'Stone', fiber: 'Fibre', iron: 'Iron', gold: 'Gold', crystal: 'Crystal', gem: 'Rune Shard', potion: 'Healing Potion'
};

// Crafting (each craft needs a Rune Lock question). station: null | 'workbench' | 'forge'
export const RECIPES = [
  { id: 'potion', name: 'Healing Potion ×2', icon: 'potion', cost: { fiber: 4, wood: 1 }, station: null, give: { potion: 2 }, desc: 'Heals 50% of your health (key Q).' },
  { id: 'w1', name: 'weapon', tier: 1, cost: { wood: 6, stone: 6 }, station: 'workbench' },
  { id: 'a1', name: 'armour', tier: 1, cost: { fiber: 8, wood: 4 }, station: 'workbench' },
  { id: 'w2', name: 'weapon', tier: 2, cost: { wood: 6, iron: 6 }, station: 'forge' },
  { id: 'a2', name: 'armour', tier: 2, cost: { iron: 8, fiber: 4 }, station: 'forge' },
  { id: 'w3', name: 'weapon', tier: 3, cost: { iron: 5, gold: 6 }, station: 'forge' },
  { id: 'a3', name: 'armour', tier: 3, cost: { gold: 8, iron: 4 }, station: 'forge' },
  { id: 'w4', name: 'weapon', tier: 4, cost: { gold: 5, crystal: 6 }, station: 'forge' },
  { id: 'a4', name: 'armour', tier: 4, cost: { crystal: 8, gold: 4 }, station: 'forge' },
  { id: 'w5', name: 'weapon', tier: 5, cost: { crystal: 8, gem: 3 }, station: 'forge' },
  { id: 'a5', name: 'armour', tier: 5, cost: { crystal: 6, gem: 3 }, station: 'forge' }
];

// Buildings for your keep (Build mode, key B)
export const BUILDS = [
  { id: 'workbench', name: 'Workbench', spr: 'workbench', cost: { wood: 8, stone: 4 }, hp: 200, unique: true, desc: 'Unlocks stone gear and armour.', w: 2, h: 1 },
  { id: 'forge', name: 'Forge', spr: 'forge', cost: { stone: 12, iron: 4 }, hp: 300, unique: true, desc: 'Unlocks iron, gold, crystal and rune gear.' },
  { id: 'woodWall', name: 'Wooden Wall', spr: 'woodWall', cost: { wood: 2 }, hp: 80, desc: 'Blocks enemies.' },
  { id: 'stoneWall', name: 'Stone Wall', spr: 'stoneWall', cost: { stone: 3 }, hp: 220, desc: 'A strong wall.' },
  { id: 'spikes', name: 'Spike Trap', spr: 'spikes', cost: { wood: 2, iron: 1 }, hp: 999, walk: true, desc: 'Hurts enemies that step on it.' },
  { id: 'campfire', name: 'Campfire', spr: 'campfire', cost: { wood: 5, stone: 2 }, hp: 100, desc: 'Heals you when you stand near it. Light at night.' },
  { id: 'brazier', name: 'Brazier', spr: 'brazier', cost: { wood: 2, stone: 2 }, hp: 120, desc: 'Gives light at night.' },
  { id: 'tower', name: 'Arrow Tower', spr: 'tower', cost: { wood: 10, stone: 8 }, hp: 260, desc: 'Shoots arrows at enemies near your keep.' }
];

// NPCs: [id, sheet, name, tile x, tile y, zone]
export const NPCS = [
  { id: 'elder', sheet: 'OldMan', name: 'Elder Bram', at: [69, 77] },
  { id: 'smith', sheet: 'Woman', name: 'Mira the Smith', at: [77, 76] },
  { id: 'sage', sheet: 'Monk', name: 'Sage Orin', at: [65, 70] },
  { id: 'trader', sheet: 'Noble', name: 'Pip the Trader', at: [79, 70] },
  { id: 'hunter', sheet: 'Caveman', name: 'Rook the Hunter', at: [42, 72] },
  { id: 'nomad', sheet: 'Princess', name: 'Zara the Nomad', at: [102, 72] },
  { id: 'climber', sheet: 'Eskimo', name: 'Tula the Climber', at: [72, 42] },
  { id: 'monk', sheet: 'Master', name: 'Master Kaito', at: [72, 102] }
];

export const DIALOG = {
  elder: [
    ['Welcome, Runeward! I am Elder Bram.', 'Long ago, the people of Eldmere spoke, read and sang every day. Then the Hollow King came and stole our words.', 'Without words, people forget their stories... and monsters grow from the silence.', 'Six Word Guardians protect the stolen Runes. Defeat them, and our words will come back!', 'First, build your keep. Chop trees and break rocks (key E), then open Build mode (key B) and make a Workbench.'],
    ['Good work! Now open the Craft menu (key C) and make a better weapon.', 'Every craft has a Rune Lock: answer the English question to make it.'],
    ['You are ready. Gloop the Mumbler is in the north of Greenvale. Follow the path!', 'Tip: when a Guardian raises its Word Shield, answer well to break it.'],
    ['The Rune is shining! Walls of silence fall when you bring back a Rune.', 'Look at your map (key M) to find the next Guardian.'],
    ['You saved Eldmere! Thank you, Runeward. Our words are free again.']
  ],
  smith: ['I am Mira. I make tools and armour.', 'A Workbench makes stone gear. A Forge makes iron, gold and crystal gear.', 'Iron is in Whisperwood, gold in the Sunscar Dunes and crystal in the Frostfang Peaks.'],
  sage: ['Peace, traveller. I am Sage Orin.', 'Look for the glowing Lore Stones. Read their stories and answer the questions: they give you wisdom, gold and Rune Shards.', 'Locked chests open with a Rune Lock. Read carefully!'],
  trader: ['Hello! I am Pip. I buy and sell.', 'Bring me gold coins and I give you potions and materials.'],
  hunter: ['Shh! The forest is listening. I am Rook.', 'Croakmaw lives in the far west of Whisperwood. His tongue is fast!', 'Break the dark rocks with shiny spots: that is iron.'],
  nomad: ['Welcome to the dunes. I am Zara.', 'Sandthief hides in the east. He throws rocks, so keep moving!', 'The orange ore here is gold.'],
  climber: ['Brrr! I am Tula. It is very cold up here.', 'The Frostwraith is at the top of the peaks, in the north.', 'The blue crystals are very strong. Use them in your Forge.'],
  monk: ['These were green lands once... I am Master Kaito.', 'Cindereye guards the east of the Wastes. Beyond the south, the Hollow Citadel waits.', 'The Hollow King is the strongest Guardian. Make the best armour first.']
};

export const TRADES = [
  { give: { potion: 1 }, price: 12, label: 'Healing Potion' },
  { give: { wood: 10 }, price: 8, label: '10 Wood' },
  { give: { stone: 10 }, price: 10, label: '10 Stone' },
  { give: { iron: 4 }, price: 30, label: '4 Iron', need: 1 },
  { give: { gold: 4 }, price: 55, label: '4 Gold', need: 2 },
  { give: { crystal: 4 }, price: 90, label: '4 Crystal', need: 3 }
];
