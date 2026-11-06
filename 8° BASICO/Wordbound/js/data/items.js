// Every item in the game.
// t: weapon | off | head | body | cape | use | misc | quest
// weapon: atk, kind (1h | 2h | magic | bow | xbow), model (assets/items), hand
// wear: body parts taken from another KayKit character (same rig) — shown on the hero.
const KN = ['Body', 'ArmLeft', 'ArmRight', 'LegLeft', 'LegRight'];
export const ITEMS = {
  // ---- weapons ----
  stick:         { n: 'Wooden Stick', t: 'weapon', kind: '1h', atk: 2, model: 'staff', tint: '#8a5a2b', tintK: 0.8, price: 2, icon: '🪵', d: 'Just a stick. Better than nothing!' },
  hunting_bow:   { n: 'Hunting Bow', t: 'weapon', kind: 'bow', atk: 5, model: 'bow_withString', hand: 'l', tint: '#8a5a2b', tintK: 0.4, price: 25, icon: '🏹', d: 'A simple bow for a new archer. Shoot from far away!' },
  apprentice_staff: { n: 'Apprentice Staff', t: 'weapon', kind: 'magic', atk: 5, model: 'staff', tint: '#c9a46a', tintK: 0.4, price: 25, icon: '🪄', d: 'The first staff of a young wizard. It shoots little balls of magic.' },
  hand_axe:      { n: 'Hand Axe', t: 'weapon', kind: '1h', atk: 6, model: 'axe_1handed', tint: '#9a9a9a', tintK: 0.3, price: 25, icon: '🪓', d: 'A small axe. Barbarians love it.' },
  parrying_dagger: { n: 'Parrying Dagger', t: 'off', atk: 2, def: 1, model: 'dagger', hand: 'l', price: 20, icon: '🗡️', d: 'A dagger for your left hand. Rogues fight with two daggers (+2 attack).' },
  iron_sword:    { n: 'Iron Sword', t: 'weapon', kind: '1h', atk: 6, model: 'sword_1handed', price: 30, icon: '🗡️', d: 'A simple, strong sword made by Tom the blacksmith.' },
  hunter_dagger: { n: "Hunter's Dagger", t: 'weapon', kind: '1h', atk: 5, speed: 1.35, model: 'dagger', price: 25, icon: '🔪', d: 'Small and very fast. Good for quick attacks.' },
  battle_axe:    { n: 'Battle Axe', t: 'weapon', kind: '1h', atk: 9, model: 'axe_1handed', price: 60, icon: '🪓', d: 'A heavy axe. It hits hard.' },
  elf_bow:       { n: 'Elven Bow', t: 'weapon', kind: 'bow', atk: 9, model: 'bow_withString', hand: 'l', price: 80, icon: '🏹', d: 'A light bow from Whisperwood. Shoot from far away!' },
  magic_wand:    { n: 'Magic Wand', t: 'weapon', kind: 'magic', atk: 8, model: 'wand', price: 70, icon: '🪄', d: 'It shoots little stars of magic.' },
  oak_staff:     { n: 'Oak Staff', t: 'weapon', kind: 'magic', atk: 12, model: 'staff', price: 120, icon: '🔮', d: 'An old staff full of forest magic.' },
  bone_blade:    { n: 'Bone Blade', t: 'weapon', kind: '1h', atk: 12, model: 'Skeleton_Blade', price: 90, icon: '🦴', d: 'A sword made of old bones. Strange but sharp.' },
  dwarf_axe:     { n: 'Dwarven Great Axe', t: 'weapon', kind: '2h', atk: 17, model: 'axe_2handed', price: 180, icon: '⚒️', d: 'A huge axe. You need two hands to use it.' },
  crossbow:      { n: 'Crossbow', t: 'weapon', kind: 'xbow', atk: 13, model: 'crossbow_1handed', price: 150, icon: '🎯', d: 'It shoots strong bolts. Made by the dwarves.' },
  great_sword:   { n: 'Great Sword', t: 'weapon', kind: '2h', atk: 20, model: 'sword_2handed', price: 240, icon: '⚔️', d: 'A long, heavy sword for brave heroes.' },
  orc_cleaver:   { n: 'Orc Cleaver', t: 'weapon', kind: '1h', atk: 16, model: 'Skeleton_Axe', tint: '#c0502a', tintK: 0.35, price: 170, icon: '🪓', d: 'The orcs of Redrock make these. Big and red.' },
  heavy_xbow:    { n: 'Heavy Crossbow', t: 'weapon', kind: 'xbow', atk: 19, model: 'crossbow_2handed', price: 260, icon: '🎯', d: 'Slow to carry, but very powerful.' },
  shadow_staff:  { n: 'Shadow Staff', t: 'weapon', kind: 'magic', atk: 22, model: 'Skeleton_Staff', price: 320, icon: '🌑', d: 'The staff of a skeleton mage. Dark magic!' },
  royal_sword:   { n: 'Royal Sword', t: 'weapon', kind: '2h', atk: 28, model: 'sword_2handed_color', price: 500, icon: '👑', d: 'The legendary sword of the old kings of Greenvale.' },

  // ---- off hand ----
  wood_shield:   { n: 'Wooden Shield', t: 'off', def: 3, model: 'shield_round', price: 20, icon: '🛡️', d: 'A round shield made of wood.' },
  badge_shield:  { n: 'Guard Shield', t: 'off', def: 5, model: 'shield_badge_color', price: 55, icon: '🛡️', d: 'The shield of the Greenvale guards.' },
  knight_shield: { n: 'Knight Shield', t: 'off', def: 8, model: 'shield_square_color', price: 110, icon: '🛡️', d: 'A big square shield. Very safe!' },
  orc_shield:    { n: 'Orc Shield', t: 'off', def: 10, model: 'shield_round_barbarian', price: 150, icon: '🛡️', d: 'A heavy shield painted with orc symbols.' },
  spike_shield:  { n: 'Spiked Shield', t: 'off', def: 12, model: 'shield_spikes_color', price: 200, icon: '🛡️', d: 'Enemies do not like these spikes.' },
  bone_shield:   { n: 'Bone Shield', t: 'off', def: 14, model: 'Skeleton_Shield_Large_A', price: 260, icon: '💀', d: 'A large shield from Mistmoor.' },
  spellbook:     { n: 'Spell Book', t: 'off', def: 2, atk: 4, model: 'spellbook_open', price: 90, icon: '📖', d: 'A book of spells. It makes your magic stronger (+4 attack).' },

  // ---- head ----
  wizard_hat:    { n: 'Wizard Hat', t: 'head', def: 1, atk: 2, wear: { from: 'Mage', parts: ['Hat'] }, price: 40, icon: '🎩', d: 'A tall, pointy hat. Wizards love it (+2 attack).' },
  iron_helmet:   { n: 'Iron Helmet', t: 'head', def: 4, wear: { from: 'Knight', parts: ['Helmet', 'HelmetVisor'] }, price: 50, icon: '⛑️', d: 'A strong metal helmet.' },
  bear_hat:      { n: 'Bear Hat', t: 'head', def: 3, hp: 10, wear: { from: 'Barbarian', parts: ['BearHat'] }, price: 45, icon: '🐻', d: 'A warm hat that looks like a bear (+10 HP).' },
  rogue_mask:    { n: 'Rogue Mask', t: 'head', def: 2, wear: { from: 'Rogue_Hooded', parts: ['Mask'] }, price: 35, icon: '🥷', d: 'A cloth mask. Very mysterious!' },
  bone_helmet:   { n: 'Bone Helmet', t: 'head', def: 7, wear: { from: 'Skeleton_Warrior', parts: ['Helmet'] }, price: 140, icon: '💀', d: 'An old helmet from a skeleton warrior.' },
  golden_helmet: { n: 'Golden Helmet', t: 'head', def: 10, hp: 20, wear: { from: 'Knight', parts: ['Helmet', 'HelmetVisor'] }, tint: '#ffcc33', tintK: 0.6, price: 300, icon: '👑', d: 'A shiny helmet for a true hero (+20 HP).' },

  // ---- body ----
  traveler_clothes: { n: "Traveller's Clothes", t: 'body', def: 1, wear: { from: 'Rogue', parts: KN }, price: 10, icon: '👕', d: 'Simple, comfortable clothes.' },
  leather_armor: { n: 'Leather Armour', t: 'body', def: 4, wear: { from: 'Ranger', parts: KN }, price: 45, icon: '🦺', d: 'Light armour. You can still run fast.' },
  fur_armor:     { n: 'Fur Armour', t: 'body', def: 5, hp: 15, wear: { from: 'Barbarian', parts: KN }, price: 70, icon: '🧥', d: 'Warm fur clothes from the north (+15 HP).' },
  mage_robes:    { n: 'Mage Robes', t: 'body', def: 3, atk: 3, wear: { from: 'Mage', parts: KN }, price: 80, icon: '🥻', d: 'Purple robes with magic symbols (+3 attack).' },
  plate_armor:   { n: 'Plate Armour', t: 'body', def: 9, wear: { from: 'Knight', parts: KN }, price: 140, icon: '🛡️', d: 'Heavy metal armour, like a knight.' },
  elven_armor:   { n: 'Elven Armour', t: 'body', def: 8, hp: 20, wear: { from: 'Ranger', parts: KN }, tint: '#9fe08a', tintK: 0.45, price: 170, icon: '🌿', d: 'Light green armour made by elves (+20 HP).' },
  dwarf_plate:   { n: 'Dwarven Plate', t: 'body', def: 13, wear: { from: 'Knight', parts: KN }, tint: '#c98a3c', tintK: 0.5, price: 260, icon: '🟫', d: 'Bronze armour from Ironhearth. Very hard!' },
  orc_armor:     { n: 'Orc War Armour', t: 'body', def: 12, hp: 30, wear: { from: 'Barbarian', parts: KN }, tint: '#d0473a', tintK: 0.45, price: 280, icon: '🟥', d: 'Red armour of the orc warriors (+30 HP).' },
  shadow_plate:  { n: 'Shadow Plate', t: 'body', def: 18, hp: 30, wear: { from: 'Knight', parts: KN }, tint: '#5a4a8a', tintK: 0.6, price: 450, icon: '🟪', d: 'Dark purple armour. The best armour in the land.' },

  // ---- cape ----
  red_cape:      { n: 'Red Cape', t: 'cape', def: 1, wear: { from: 'Knight', parts: ['Cape'] }, price: 25, icon: '🧣', d: 'A red cape. You look like a hero!' },
  green_cloak:   { n: 'Green Cloak', t: 'cape', def: 2, wear: { from: 'Ranger', parts: ['Cape'] }, price: 40, icon: '🍃', d: 'A forest cloak. Good for hiding in the trees.' },
  mage_cape:     { n: 'Starry Cape', t: 'cape', def: 2, atk: 2, wear: { from: 'Mage', parts: ['Cape'] }, price: 60, icon: '✨', d: 'A cape with stars on it (+2 attack).' },
  hooded_cloak:  { n: 'Hooded Cloak', t: 'cape', def: 3, wear: { from: 'Rogue_Hooded', parts: ['Cape'] }, price: 70, icon: '🧥', d: 'A cloak with a big hood.' },
  bone_cloak:    { n: 'Tattered Cloak', t: 'cape', def: 4, hp: 15, wear: { from: 'Skeleton_Warrior', parts: ['Cloak'] }, price: 110, icon: '🏴', d: 'An old cloak from Mistmoor (+15 HP).' },
  hero_cape:     { n: "Hero's Cape", t: 'cape', def: 6, hp: 30, wear: { from: 'Knight', parts: ['Cape'] }, tint: '#ffcc33', tintK: 0.55, price: 400, icon: '🌟', d: 'The golden cape of the Wordbound hero (+30 HP).' },

  // ---- consumables ----
  potion_s:  { n: 'Small Potion', t: 'use', heal: 40, price: 8, icon: '🧪', d: 'A red drink. It gives you 40 HP.' },
  potion_m:  { n: 'Big Potion', t: 'use', heal: 100, price: 20, icon: '⚗️', d: 'A big red drink. It gives you 100 HP.' },
  bread:     { n: 'Bread', t: 'use', heal: 20, price: 3, icon: '🍞', d: 'Fresh bread from the bakery. +20 HP.' },
  apple:     { n: 'Apple', t: 'use', heal: 12, price: 2, icon: '🍎', d: 'A sweet red apple. +12 HP.' },
  cheese:    { n: 'Cheese', t: 'use', heal: 25, price: 4, icon: '🧀', d: 'Yellow cheese. +25 HP.' },
  mushroom_soup: { n: 'Mushroom Soup', t: 'use', heal: 60, price: 12, icon: '🍲', d: 'Hot soup. +60 HP.' },

  // ---- materials (sell them or use them in missions) ----
  slime_jelly: { n: 'Slime Jelly', t: 'misc', price: 2, icon: '🟢', d: 'Sticky and green. Somebody might want it.' },
  wolf_fur:    { n: 'Wolf Fur', t: 'misc', price: 5, icon: '🐺', d: 'Soft grey fur.' },
  bone:        { n: 'Old Bone', t: 'misc', price: 4, icon: '🦴', d: 'A bone from a skeleton. Yuck!' },
  iron_ore:    { n: 'Iron Ore', t: 'misc', price: 6, icon: '🪨', d: 'A heavy grey rock with iron inside.' },
  gold_nugget: { n: 'Gold Nugget', t: 'misc', price: 25, icon: '🟡', d: 'A small piece of gold. Shiny!' },
  sand_glass:  { n: 'Desert Glass', t: 'misc', price: 8, icon: '🔶', d: 'Orange glass made by the hot sun.' },
  ghost_dust:  { n: 'Ghost Dust', t: 'misc', price: 9, icon: '✨', d: 'Silver dust. It glows in the dark.' },
  wood:        { n: 'Wood', t: 'misc', price: 2, icon: '🪵', d: 'Some pieces of wood.' },
  sparkstone:  { n: 'Sparkstone', t: 'misc', price: 30, icon: '🔹', d: 'A small blue stone full of magic. The Enchanter uses it to improve weapons and armour from +1 to +6.' },
  moonstone:   { n: 'Moonstone', t: 'misc', price: 150, icon: '🌙', d: 'A silver stone that shines at night. It improves weapons and armour from +7 to +9.' },
  starstone:   { n: 'Starstone', t: 'misc', price: 400, icon: '🌟', d: 'A very rare golden stone. Only big bosses carry it. It improves equipment from +10 to +12.' },

  // ---- quest items (you cannot sell them) ----
  egg:         { n: 'Egg', t: 'quest', icon: '🥚', d: 'A brown egg. Be careful!' },
  wheat:       { n: 'Wheat', t: 'quest', icon: '🌾', d: 'Golden wheat from the fields.' },
  black_feather: { n: 'Black Feather', t: 'quest', icon: '🪶', d: 'A long black feather. It is cold, like ice.' },
  mayor_letter: { n: "Mayor's Letter", t: 'quest', icon: '✉️', doc: 'mayor_letter', d: 'A letter from Mayor Rosa to the Elf Queen. Open it with READ.' },
  moonflower:  { n: 'Moonflower', t: 'quest', icon: '💠', d: 'A blue flower that glows like the moon.' },
  nightshade:  { n: 'Purple Nightshade', t: 'quest', icon: '🟣', d: 'A purple flower. The elves say it is poisonous!' },
  spotted_mushroom: { n: 'Spotted Mushroom', t: 'quest', icon: '🍄', d: 'A red mushroom with white spots.' },
  brown_mushroom: { n: 'Brown Mushroom', t: 'quest', icon: '🟤', d: 'A plain brown mushroom.' },
  lost_arrow:  { n: 'Lost Arrow', t: 'quest', icon: '➶', d: 'An elven arrow with green feathers.' },
  gem_forest:  { n: 'Word Gem of the Forest', t: 'quest', icon: '💚', d: 'A green gem. It holds the words of the elves.' },
  gem_stone:   { n: 'Word Gem of the Mountain', t: 'quest', icon: '🧡', d: 'An orange gem. It holds the words of the dwarves.' },
  gem_sun:     { n: 'Word Gem of the Sun', t: 'quest', icon: '💛', d: 'A yellow gem. It holds the words of the orcs.' },
  gem_moon:    { n: 'Word Gem of the Moon', t: 'quest', icon: '💜', d: 'A purple gem. It holds the words of the Bonefolk.' },
  crown:       { n: 'Crown of Words', t: 'quest', icon: '👑', d: 'The magic crown that lets all peoples understand each other.' },
  lost_hammer: { n: "Brokk's Hammer", t: 'quest', icon: '🔨', d: 'A small silver hammer with the letter B on it.' },
  water_bucket: { n: 'Bucket of Water', t: 'quest', icon: '🪣', d: 'Clean water from the oasis.' },
  caravan_box: { n: 'Caravan Box', t: 'quest', icon: '📦', d: 'A wooden box with silk and spices.' },
  diary_page:  { n: 'Diary Page', t: 'quest', icon: '📄', d: 'A page from an old diary.' },
  pumpkin:     { n: 'Orange Pumpkin', t: 'quest', icon: '🎃', d: 'A big orange pumpkin.' },
  yellow_pumpkin: { n: 'Yellow Pumpkin', t: 'quest', icon: '🟡', d: 'A yellow pumpkin. It is not ready yet.' },
  candle:      { n: 'Magic Candle', t: 'quest', icon: '🕯️', d: 'A candle that never goes out.' },
  rope:        { n: 'Rope', t: 'quest', icon: '🪢', d: 'A long, strong rope.' },
  lantern_oil: { n: 'Lantern Oil', t: 'quest', icon: '🫙', d: 'A small jar of oil for lanterns.' },
  fish:        { n: 'Silver Fish', t: 'quest', icon: '🐟', d: 'A fresh silver fish.' },
  love_letter: { n: 'Pink Letter', t: 'quest', icon: '💌', doc: 'love_letter', d: 'A letter with a pink heart. It is not for you!' },
  map_piece:   { n: 'Old Map', t: 'quest', icon: '🗺️', doc: 'marsh_map', d: 'A map of the marsh path. Open it with READ.' },
  orc_tablet:  { n: 'Stone Tablet', t: 'quest', icon: '🪧', doc: 'orc_law', d: 'The Law of Redrock, written on stone. Open it with READ.' },
  ore_sample:  { n: 'Blue Crystal', t: 'quest', icon: '💎', d: 'A blue crystal from the deep mine.' },
  silver_key:  { n: 'Silver Key', t: 'quest', icon: '🗝️', d: 'A small silver key. What does it open?' },
  dog_collar:  { n: 'Dog Collar', t: 'quest', icon: '🦮', d: 'A red collar with the name BITER on it.' },
  flower_seeds: { n: 'Flower Seeds', t: 'quest', icon: '🌱', d: 'Seeds for the grave garden.' },
  music_sheet: { n: 'Song Sheet', t: 'quest', icon: '🎼', doc: 'dwarf_song', d: 'The words of an old dwarf song. Open it with READ.' }
};
export const SLOTS = [['head', 'Head', '⛑️'], ['cape', 'Cape', '🧣'], ['body', 'Armour', '🦺'], ['weapon', 'Weapon', '🗡️'], ['off', 'Off hand', '🛡️']];
export const TYPE_NAME = { weapon: 'Weapon', off: 'Shield / book', head: 'Helmet / hat', body: 'Armour', cape: 'Cape', use: 'Food & potions', misc: 'Material', quest: 'Mission item' };

// ---- quality and upgrades ----
export const QUAL = {
  c: { name: 'Common', color: '#8a8a8a', mult: 1 },
  e: { name: 'Excellent', color: '#2f8fe0', mult: 1.35 },
  d: { name: 'Divine', color: '#e0a000', mult: 1.8 }
};
export const MAX_UP = 12;
export const isGear = id => ITEMS[id] && ['weapon', 'off', 'head', 'body', 'cape'].includes(ITEMS[id].t);
/** e = {id, q, up} or an item id */
export const entry = e => (typeof e === 'string' ? { id: e, q: 'c', up: 0 } : { id: e.id, q: e.q || 'c', up: e.up || 0 });
export function itemStat(e, k) {
  e = entry(e); const b = ITEMS[e.id] && ITEMS[e.id][k]; if (!b) return 0;
  return Math.round(b * QUAL[e.q].mult + e.up * Math.max(1, b * 0.12));
}
export function fullName(e) { e = entry(e); const it = ITEMS[e.id]; if (!isGear(e.id)) return it.n; return `${e.q !== 'c' ? QUAL[e.q].name + ' ' : ''}${it.n}${e.up ? ' +' + e.up : ''}`; }
export function itemValue(e) { e = entry(e); const it = ITEMS[e.id]; return Math.round((it.price || 2) * (isGear(e.id) ? QUAL[e.q].mult * (1 + e.up * 0.3) : 1)); }
/** What the next upgrade needs: stone, how many, gold and the chance (0-1). */
export function upgradeCost(e) {
  e = entry(e); const L = e.up + 1; if (L > MAX_UP) return null;
  const stone = L <= 6 ? 'sparkstone' : L <= 9 ? 'moonstone' : 'starstone';
  const n = L <= 6 ? 1 + Math.floor((L - 1) / 3) : 1;
  const gold = Math.round(15 * Math.pow(L, 1.6) * QUAL[e.q].mult);
  const chance = L <= 3 ? 1 : L <= 6 ? 0.85 : L <= 9 ? 0.65 : 0.4;
  return { L, stone, n, gold, chance };
}
/** Glow colour for an upgrade level. */
export function glowOf(e) {
  e = entry(e); const u = e.up;
  if (!u) return e.q === 'd' ? { color: '#ffd23a', k: 0.12 } : null;
  const color = u <= 3 ? '#ffffff' : u <= 6 ? '#4ab8ff' : u <= 9 ? '#c070ff' : '#ffc23d';
  return { color, k: 0.1 + u * 0.045, sparkle: u >= 7 };
}
// random equipment found on monsters, by level of the monster
export const TIERS = [
  ['iron_sword', 'hunter_dagger', 'wood_shield', 'badge_shield', 'leather_armor', 'traveler_clothes', 'red_cape', 'wizard_hat', 'bear_hat'],
  ['battle_axe', 'elf_bow', 'magic_wand', 'green_cloak', 'fur_armor', 'mage_robes', 'iron_helmet', 'mage_cape', 'spellbook'],
  ['dwarf_axe', 'crossbow', 'knight_shield', 'plate_armor', 'bone_blade', 'oak_staff', 'hooded_cloak', 'rogue_mask'],
  ['orc_cleaver', 'great_sword', 'heavy_xbow', 'orc_shield', 'spike_shield', 'elven_armor', 'dwarf_plate'],
  ['shadow_staff', 'bone_shield', 'bone_helmet', 'orc_armor', 'bone_cloak', 'shadow_plate', 'golden_helmet']
];
export const tierOf = lvl => lvl < 3 ? 0 : lvl < 5 ? 1 : lvl < 7 ? 2 : lvl < 9 ? 3 : 4;

// Starting equipment for each style (given by Tom the Blacksmith)
export const KITS = { Knight: ['iron_sword', 'wood_shield'], Ranger: ['hunting_bow'], Rogue: ['hunter_dagger', 'parrying_dagger'], Mage: ['apprentice_staff'], Barbarian: ['hand_axe', 'wood_shield'] };
export const KIT_TXT = {
  Knight: 'an iron sword and a wooden shield. They are not fancy, but they are strong.',
  Ranger: 'a hunting bow. You are an archer, so you can shoot from far away!',
  Rogue: 'two daggers, one for each hand. Quick and sneaky, like a real rogue!',
  Mage: 'an apprentice staff. It shoots little balls of magic. Perfect for a young wizard!',
  Barbarian: 'a hand axe and a wooden shield. Strong and simple, like a barbarian!'
};
