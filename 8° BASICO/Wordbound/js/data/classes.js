// Classes: every style is a class with a passive bonus and two skills (keys 1 and 2).
// When you use a skill, its English name appears and is spoken.
export const CLASSES = {
  Knight: {
    name: 'Knight', icon: '🛡️', passive: { def: 0.15 }, ptxt: 'Strong armour: +15% defence.',
    skills: [
      { id: 'shield', name: 'Shield Wall', icon: '🛡️', cd: 20, desc: 'Hold up your shield. For 6 seconds, you take 60% less damage.' },
      { id: 'charge', name: 'Charge', icon: '🐎', cd: 10, desc: 'Run forward very fast and hit every enemy on your way.' }
    ]
  },
  Ranger: {
    name: 'Archer', icon: '🏹', passive: { bow: 0.15 }, ptxt: 'Sharp eyes: +15% attack with bows and crossbows.',
    skills: [
      { id: 'rain', name: 'Arrow Rain', icon: '🌧️', cd: 14, desc: 'Arrows fall from the sky on a big area in front of you.' },
      { id: 'step', name: 'Quick Step', icon: '💨', cd: 10, desc: 'Jump back, away from danger, and run faster for 4 seconds.' }
    ]
  },
  Rogue: {
    name: 'Rogue', icon: '🗡️', passive: { crit: 0.12 }, ptxt: 'Sneaky: +12% chance of a critical hit.',
    skills: [
      { id: 'shadow', name: 'Shadow Strike', icon: '🌑', cd: 10, desc: 'Appear behind the nearest enemy and hit it very hard.' },
      { id: 'smoke', name: 'Smoke Bomb', icon: '💨', cd: 20, desc: 'Disappear in a cloud of smoke. Monsters forget you for 5 seconds.' }
    ]
  },
  Mage: {
    name: 'Wizard', icon: '🔮', passive: { magic: 0.2 }, ptxt: 'Magic power: +20% attack with staffs and wands.',
    skills: [
      { id: 'fireball', name: 'Fireball', icon: '🔥', cd: 8, desc: 'Throw a big ball of fire. It explodes and hurts every enemy near it.' },
      { id: 'heal', name: 'Healing Light', icon: '✨', cd: 25, desc: 'Heal yourself and your group friends near you (35% of your health).' }
    ]
  },
  Barbarian: {
    name: 'Barbarian', icon: '🪓', passive: { hp: 0.15 }, ptxt: 'Tough: +15% health.',
    skills: [
      { id: 'whirl', name: 'Whirlwind', icon: '🌪️', cd: 9, desc: 'Spin around and hit every enemy around you.' },
      { id: 'cry', name: 'War Cry', icon: '📣', cd: 25, desc: 'Shout! You and your group friends near you hit 30% harder for 8 seconds.' }
    ]
  }
};
