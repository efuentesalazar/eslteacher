// Missions, dialogues and documents.
//
// Script lines:
//   'text'                 the NPC of this step speaks
//   '@me: text'            the player speaks
//   '@id: text'            another NPC speaks
//   {ask, k, o:[[answer, reaction], ...]}   choose an answer. The FIRST option is the right one
//                          (options are shuffled on screen). k = skill code (see SKILLS).
//   {listen:'line', ...}   like ask, but the NPC line is only heard (text hidden until you ask for it)
//   {doc:'id'}             open a document to read
//   {give:['item', n]}, {take:['item', n]}, {gold:n}, {xp:n}, {anim:'Cheering'}
//
// Steps:  {talk:npc, say:[...]} {bring:item, n, to:npc, say:[...]} {kill:monster, n}
//         {go:place, r, say:[...]} {equip:slot} {act:'lantern', n}
//         txt = objective text, noArrow = the player must follow directions (button "Show me" helps)

export const SKILLS = { CONV: 'Conversation', READ: 'Reading', LIST: 'Listening', INST: 'Following instructions', VOC: 'Vocabulary' };
export const SKILLS_ES = { CONV: 'Conversación (respuesta adecuada)', READ: 'Comprensión lectora', LIST: 'Comprensión auditiva', INST: 'Seguir instrucciones', VOC: 'Vocabulario en contexto' };

export const QUESTS = [
  // =====================================================================
  // CHAPTER 1 — GREENVALE
  // =====================================================================
  {
    id: 'welcome', main: true, realm: 0, title: 'A Stranger in Brightwater', giver: 'rosa', auto: true,
    intro: [
      'Oh! Hello there! I don\'t think we\'ve met. I\'m Rosa, the mayor of Brightwater.',
      { ask: 'Nice to meet you!', k: 'CONV', o: [['Nice to meet you too!', 'Ha! You have good manners. I like you already.'], ['I\'m fine, thanks.', 'Hmm... I didn\'t ask how you are. But that\'s OK!'], ['Yes, please.', 'Yes, please? I think you\'re very tired from your trip.']] },
      'You came at a bad moment, I\'m afraid. Look at the stone in the middle of the square.',
      'That is the Lingua Stone. For a thousand years, the Crown of Words sat on top of it. The Crown lets all the peoples of this land understand each other: humans, elves, dwarves, orcs... everybody.',
      'But last night somebody stole it. Now people are starting to forget words. This morning the baker asked me for "the thing... the round thing... for eating". She meant bread!',
      { ask: 'What happened to the Crown of Words?', k: 'READ', o: [['Somebody stole it last night.', 'Exactly. And we don\'t know who.'], ['It broke into pieces.', 'No, it didn\'t break. Somebody took it! Listen carefully.'], ['The mayor sold it.', 'Me?! Of course not! It was stolen.']] },
      'You look like an adventurer. Will you help us? First, you need a weapon. Go and see Tom, the blacksmith. His forge is on the east side of the square, next to the big blue house.'
    ],
    steps: [
      { talk: 'tom', txt: 'Talk to Tom the Blacksmith (east side of the square).', say: [
        'Hello, hello! Welcome to my forge. What can I do for you?',
        { ask: 'What do you say to Tom?', k: 'CONV', o: [['Hi! The mayor sent me. I need a weapon, please.', 'A weapon for a hero! Of course.'], ['Give me a sword. Now!', 'Hey! Where are your manners? Try again, nicely.'], ['I\'m a blacksmith too.', 'Really? You don\'t look like one. What do you need?']] },
        'Here you are: an iron sword and a wooden shield. They are not fancy, but they are strong.',
        { give: ['iron_sword', 1] }, { give: ['wood_shield', 1] }, { give: ['potion_s', 2] },
        'Now open your bag — press I, or tap the bag button — and equip them. Then come back so I can see you.'
      ] },
      { equip: 'weapon', txt: 'Open your bag (I) and equip the sword and the shield.' },
      { talk: 'tom', txt: 'Show Tom your new sword.', say: [
        'Look at you! A real adventurer!',
        { ask: 'Tom says: "That sword looks great on you!" What is a good answer?', k: 'CONV', o: [['Thank you so much! It\'s perfect.', 'You\'re welcome! Take good care of it.'], ['You\'re welcome.', 'Ha! No, no. I gave YOU the sword. You say "thank you".'], ['It\'s raining.', 'Is it? I don\'t think so... Are you OK?']] },
        'Oh, before you go: Farmer Ben has a problem with slimes in his fields. His farm is south-east of town. Maybe you can practise with your new sword there!'
      ] }
    ],
    reward: { xp: 40, gold: 10 }
  },
  {
    id: 'slimes', main: true, realm: 0, title: 'Slimes in the Wheat', giver: 'ben', req: ['welcome'],
    intro: [
      'Oh no, oh no, oh no! Another one!',
      { ask: 'Ben looks worried. What do you say?', k: 'CONV', o: [['What\'s wrong? Can I help you?', 'Oh, thank you for asking! Yes, please!'], ['Bye!', 'Wait! Don\'t go! I need help!'], ['What time is it?', 'Time? It\'s time for a hero! I have a problem!']] },
      'Slimes! Green, sticky slimes are eating my wheat. If they eat all of it, the town won\'t have bread this winter.',
      'They live in the field east of my farm. Can you get rid of five of them? Hit them with your sword — click, or press F.'
    ],
    steps: [
      { kill: 'slime', n: 5, txt: 'Defeat 5 green slimes in the field next to the farm.', at: [60, 54] },
      { talk: 'ben', txt: 'Go back to Farmer Ben.', say: [
        'You did it! The slimes are gone! My wheat is safe!',
        'Here, take these potions. When you are hurt, drink one — press Q.',
        { give: ['potion_s', 3] },
        'By the way, the mayor was looking for you. I think she has news about the thief.'
      ] }
    ],
    reward: { xp: 70, gold: 15 }
  },
  {
    id: 'clues', main: true, realm: 0, title: 'The Thief in the Night', giver: 'rosa', req: ['slimes'],
    intro: [
      'There you are! Guard Greg wrote a report about last night. Please read it carefully.',
      { doc: 'guard_report' },
      { ask: 'When did Greg see the stranger?', k: 'READ', o: [['At midnight.', 'Yes. Midnight, when everybody was asleep.'], ['At six in the morning.', 'No — at six in the morning the Crown was already gone. Read the report again.'], ['At lunchtime.', 'No, it was dark! Look at the report again.']] },
      { ask: 'What did the stranger look like?', k: 'READ', o: [['Tall and thin, with a long black cloak.', 'That\'s right. Not a person from Brightwater.'], ['Short and fat, with a red hat.', 'No, that sounds like Old Joe! Read again.'], ['A big green orc.', 'No, the report doesn\'t say that.']] },
      { ask: 'Where did the stranger go?', k: 'READ', o: [['Towards the Old Mill, in the south-west.', 'Yes! So that\'s the place to look for clues.'], ['Into the tavern.', 'No... Rob would be very happy, but no.'], ['North, to the forest.', 'Not yet. First the stranger went to the mill.']] },
      'Please go to the Old Mill and look for clues. Be careful!'
    ],
    steps: [
      { go: 'mill', r: 9, txt: 'Look for clues at the Old Mill (south-west of town).', say: [
        '@me: There is something on the ground... A long black feather. It\'s as cold as ice!',
        { give: ['black_feather', 1] },
        '@me: And there are strange footprints... They go west, towards Mistmoor. I should show this to the mayor.'
      ] },
      { talk: 'rosa', txt: 'Show the black feather to Mayor Rosa.', say: [
        'A black feather, cold as ice... Oh no. I have read about this in old books.',
        'Only the crows of Lord Hush have feathers like this. He is a sorcerer who hates words. He wants a world of silence.',
        { ask: 'What does Lord Hush want?', k: 'READ', o: [['A world without words, a silent world.', 'Yes. And with the Crown, he can do it.'], ['More books for his library.', 'No! He hates words. Books are full of words!'], ['A new house in Brightwater.', 'Ha! No, he doesn\'t want to live with us.']] },
        'We can\'t fight him alone. The Crown was made with four Word Gems, one from each people. If you find the gems, we can open his tower.',
        'The elves of Whisperwood know old magic. Take this letter to Queen Elowen. Whisperwood is north of here — follow the north road.',
        { give: ['mayor_letter', 1] },
        'Oh, and take this red cape. Every hero needs a cape!',
        { give: ['red_cape', 1] }
      ] }
    ],
    reward: { xp: 90, gold: 25 }
  },

  // =====================================================================
  // CHAPTER 2 — WHISPERWOOD
  // =====================================================================
  {
    id: 'password', main: true, realm: 1, title: 'The Gate of Leafhollow', auto: true, req: ['clues'],
    steps: [
      { talk: 'faelan', txt: 'Go north to Leafhollow, the elf town. Talk to the guard.', say: [
        'Stop right there, human! Nobody enters Leafhollow without the password.',
        { ask: 'What is the password? (Tip: it is in the mayor\'s letter. Open your bag and READ it.)', k: 'READ', o: [['Silver leaves sing at night.', 'Correct! Welcome to Leafhollow, friend.'], ['Green trees grow in the day.', 'Wrong! Read your letter, human.'], ['Open the door, please.', 'Polite, but wrong. I need the password.'], ['Silver rivers sleep at noon.', 'Close, but no. Read the letter again.']] },
        'Queen Elowen is in the great hall, at the end of the main path. Go and talk to her — and remember, she is a queen. Speak politely!'
      ] },
      { talk: 'elowen', txt: 'Give the mayor\'s letter to Queen Elowen.', say: [
        'A human in Leafhollow? How unusual.',
        { ask: 'How do you greet the Queen?', k: 'CONV', o: [['Good afternoon, Your Majesty. I have a letter for you.', 'Such good manners! Thank you, traveller.'], ['Hey, Queen! What\'s up?', '"What\'s up"? I am a queen, not your cousin! Try again.'], ['Give me a gem.', 'Hmm. We don\'t start conversations like that here.']] },
        { take: ['mayor_letter', 1] },
        'Rosa writes that the Crown of Words was stolen... This explains why my elves can\'t understand the birds anymore.',
        'I will help you. But first, I need YOUR help. The spirits of the forest are sick, and only moonflowers can heal them.'
      ] }
    ],
    reward: { xp: 60, gold: 15 }
  },
  {
    id: 'moonflowers', main: true, realm: 1, title: 'Moonflowers', auto: true, req: ['password'], giver: 'elowen',
    intro: [
      'Moonflowers grow in the Moonflower Glade, west of Leafhollow.',
      'Listen carefully: moonflowers are BLUE and they glow. There are also PURPLE flowers in the glade. Those are nightshade, and they are poisonous. Do not bring me nightshade!',
      { ask: 'Which flowers do you need?', k: 'INST', o: [['Three blue moonflowers. Not the purple ones.', 'Exactly. Go now, and be quick.'], ['Three purple flowers.', 'No! Purple ones are poisonous! Listen again: BLUE.'], ['Any flowers, it doesn\'t matter.', 'It matters a lot! Blue moonflowers only.']] }
    ],
    steps: [
      { bring: 'moonflower', n: 3, to: 'elowen', txt: 'Pick 3 blue moonflowers in the glade (west) and bring them to the Queen.', at: [-48, -188], say: [
        'Three moonflowers, shining like the moon. Thank you!',
        { anim: 'Cheering' },
        'The spirits will feel better tonight. Now, about the Word Gem...'
      ] }
    ],
    reward: { xp: 90, gold: 20, items: [['potion_m', 1]] }
  },
  {
    id: 'riddles', main: true, realm: 1, title: 'The Riddles of the Sage', auto: true, req: ['moonflowers'], giver: 'elowen',
    intro: [
      'Our Word Gem is hidden. Only Sage Ilyra knows where it is. She lives under the Great Tree, north of Leafhollow.',
      'She loves riddles. Listen carefully to her words — she speaks only once!'
    ],
    steps: [
      { talk: 'ilyra', txt: 'Find Sage Ilyra under the Great Tree (north of Leafhollow).', say: [
        'Ah, a visitor. The Queen told me about you. Do you want the gem? Then answer my riddles. Listen...',
        { listen: 'What has hands and a face, but cannot hold anything or smile?', k: 'LIST', ask: 'What is it?', o: [['A clock.', 'Yes! Tick, tock.'], ['A dog.', 'A dog has a face, but no hands. Listen again.'], ['A tree.', 'A tree has no face. Think again.']] },
        { listen: 'The more I dry, the wetter I get. What am I?', k: 'LIST', ask: 'What is it?', o: [['A towel.', 'Clever! A towel gets wet when it dries you.'], ['The sun.', 'The sun is never wet!'], ['A fish.', 'A fish is always wet. Try again.']] },
        { listen: 'I am tall when I am young, and short when I am old. What am I?', k: 'LIST', ask: 'What is it?', o: [['A candle.', 'Wonderful! A candle gets shorter when it burns.'], ['A person.', 'People get taller when they grow, not shorter!'], ['A mountain.', 'Mountains don\'t get old like that.']] },
        'You listen well, little hero. The gem is on the island in Wolf Lake, east of Leafhollow. But the Alpha Wolf protects it. Be brave!'
      ] },
      { kill: 'alpha_wolf', n: 1, txt: 'Defeat the Alpha Wolf at Wolf Lake (east).', at: [58, -212] },
      { talk: 'ilyra', txt: 'Tell Sage Ilyra the Alpha Wolf is gone.', say: [
        'I heard the howl from here. The wolf is gone, and you found the gem. Look how it shines!',
        { give: ['gem_forest', 1] },
        'This is the Word Gem of the Forest. The dwarves of Stonehold have another one. Their city, Ironhearth, is far to the east.',
        { ask: 'Where must you go now?', k: 'READ', o: [['East, to Ironhearth in Stonehold.', 'Yes. Safe travels!'], ['South, to the desert.', 'Not yet. First the dwarves, in the east.'], ['Back to Brightwater to sleep.', 'Sleep later! Go east.']] }
      ] }
    ],
    reward: { xp: 180, gold: 50, items: [['green_cloak', 1]] }
  },

  // =====================================================================
  // CHAPTER 3 — STONEHOLD
  // =====================================================================
  {
    id: 'gates', main: true, realm: 2, title: 'The Grumpy Gatekeeper', auto: true, req: ['riddles'],
    steps: [
      { talk: 'durin', txt: 'Travel east to Ironhearth. Talk to the gatekeeper.', say: [
        'Hmph. Another visitor. What do you want?',
        { ask: 'Ask Durin to let you in.', k: 'CONV', o: [['Excuse me, could you open the gate, please?', '...Well. Nobody says "please" these days. Fine.'], ['Open the gate!', 'Ha! Open it yourself. Oh, wait, you can\'t. Ask nicely.'], ['Can I have a sandwich?', 'A sandwich?! This is a gate, not a kitchen!']] },
        'Before you go in, tell me: where are you from?',
        { ask: 'Durin asks: "Where are you from?"', k: 'CONV', o: [['I\'m from far away, but now I\'m helping Brightwater.', 'Brightwater, eh? Good people. Short memories, but good people.'], ['I\'m fifteen.', 'I asked WHERE, not HOW OLD. Dwarves listen carefully. Do you?'], ['Yes, I am.', 'Yes you are... what? Answer my question!']] },
        'Go on in. The King is in the great hall. Don\'t touch anything!'
      ] },
      { talk: 'thrain', txt: 'Talk to King Thrain in the great hall.', say: [
        'An elf gem? In the hands of a human? Interesting...',
        { ask: 'The King says: "Why are you here?"', k: 'CONV', o: [['I\'m looking for the Word Gems to stop Lord Hush.', 'Lord Hush... So it\'s true. The darkness is back.'], ['Because I\'m hungry.', 'Then go to Helga the cook. But I don\'t think that\'s the real reason.'], ['I don\'t know.', 'You don\'t know? Then why did you walk all this way?']] },
        'I will give you our gem. But we have a terrible problem. Three of my miners are lost in the Deep Mine, and skeletons are walking in the tunnels!'
      ] }
    ],
    reward: { xp: 90, gold: 25 }
  },
  {
    id: 'miners', main: true, realm: 2, title: 'Lost in the Deep Mine', auto: true, req: ['gates'], giver: 'thrain',
    intro: [
      'The Deep Mine is north-east of the city. Listen carefully, because I will say this only once.',
      'Bram was working next to the RED CART, near the entrance of the mine.',
      'Gilda went to look at the BIG BLUE CRYSTAL. It is on the east side of the mine.',
      'And Olin... Olin always hides BEHIND THE WATERFALL when he is scared. The waterfall is north of the mine.',
      { ask: 'Where is Gilda?', k: 'LIST', o: [['Next to the big blue crystal.', 'Right. Remember the others too!'], ['Next to the red cart.', 'No, that\'s Bram. Listen again.'], ['Behind the waterfall.', 'No, that\'s Olin, the scared one.']] },
      'There are no maps of the mine. Use my directions. Now go!'
    ],
    steps: [
      { talk: 'bram', noArrow: true, txt: 'Find Bram: "next to the red cart, near the mine entrance".', at: [199, -56], say: [
        'Who\'s there?! Oh, a friend! I was so scared. The skeletons took my lamp!',
        { ask: 'Bram is scared. What do you say?', k: 'CONV', o: [['Don\'t worry, you\'re safe now. Go back to the city.', 'Thank you, thank you! I\'m going home!'], ['Ha ha, you\'re scared!', 'That\'s not very nice...'], ['Give me your money.', 'What?! Are you a skeleton too?!']] }
      ] },
      { talk: 'gilda', noArrow: true, txt: 'Find Gilda: "next to the big blue crystal, on the east side".', at: [226, -36], say: [
        'Shh! Look at this crystal. It\'s the biggest one I have ever seen!',
        'The King is worried? Oh dear. I forgot the time. I\'ll go back now. Take this piece of crystal for him.',
        { give: ['ore_sample', 1] }
      ] },
      { talk: 'olin', noArrow: true, txt: 'Find Olin: "behind the waterfall, north of the mine".', at: [212, -80], say: [
        'I... I\'m not hiding. I\'m resting. Behind a waterfall. Like everyone does.',
        'OK, I was hiding. There\'s a HUGE skeleton in the mine. It has a giant axe. They call it the Bone Foreman!',
        { ask: 'What did Olin see?', k: 'LIST', o: [['A huge skeleton with a giant axe.', 'Yes! The Bone Foreman. Tell the King!'], ['A small dog.', 'A dog? No! A GIANT skeleton!'], ['Another miner.', 'No, no, it was a monster!']] }
      ] },
      { talk: 'thrain', txt: 'Go back to King Thrain.', say: [
        'My miners are home! Thank you, friend.',
        { take: ['ore_sample', 1] },
        'But Olin says the Bone Foreman is in the mine... and it has OUR gem!'
      ] }
    ],
    reward: { xp: 160, gold: 40, items: [['iron_helmet', 1]] }
  },
  {
    id: 'foreman', main: true, realm: 2, title: 'The Bone Foreman', auto: true, req: ['miners'], giver: 'thrain',
    intro: [
      'The Bone Foreman was once a dwarf, a long, long time ago. Lord Hush took his voice and his name.',
      'Defeat him and bring back our Word Gem. You will find him deep in the mine, north of the red cart.'
    ],
    steps: [
      { kill: 'foreman', n: 1, txt: 'Defeat the Bone Foreman in the Deep Mine.', at: [218, -68] },
      { talk: 'thrain', txt: 'Return to King Thrain with the gem.', say: [
        'You did it! The Word Gem of the Mountain!',
        { give: ['gem_stone', 1] },
        { anim: 'Cheering' },
        'Take this crossbow too. It was my grandfather\'s. Now go south, to the Sunscar Desert. The orcs have the third gem. They are proud people... Be honest with them.'
      ] }
    ],
    reward: { xp: 300, gold: 90, items: [['crossbow', 1]] }
  },

  // =====================================================================
  // CHAPTER 4 — SUNSCAR
  // =====================================================================
  {
    id: 'trials', main: true, realm: 3, title: 'The Three Trials', auto: true, req: ['foreman'],
    steps: [
      { talk: 'ugra', txt: 'Travel south to the Sunscar Desert. Talk to the orc scout.', say: [
        'Stop. You are not an orc. What do you want in the desert?',
        { ask: 'Ugra wants to know why you are here.', k: 'CONV', o: [['I want to talk to your chief. I come in peace.', 'Hmm. Honest words. Follow the road to the camp.'], ['None of your business!', 'Then go home, little human.'], ['I want to buy sand.', 'Sand? Ha! Take as much as you want. Now really, why are you here?']] },
        'Chief Grukka is in the big tent, in the middle of the camp.'
      ] },
      { talk: 'grukka', txt: 'Talk to Chief Grukka in the middle of the camp.', say: [
        'A human with dwarf and elf gems. Strange. Grukka does not trust strangers.',
        'If you want the Sun Gem, you must pass three trials: the trial of STRENGTH, the trial of WISDOM and the trial of HEART.',
        { ask: 'How many trials must you pass?', k: 'LIST', o: [['Three: strength, wisdom and heart.', 'Good. You listen. That is a start.'], ['Two: strength and speed.', 'No! Three. Listen when Grukka talks!'], ['One.', 'One?! Grukka said THREE.']] },
        'First, strength. Dust bandits are attacking our caravans near the Old Ruins, in the south-west. Defeat six of them.'
      ] },
      { kill: 'bandit', n: 6, txt: 'Trial of Strength: defeat 6 dust bandits at the Old Ruins (south-west).', at: [-54, 204] },
      { talk: 'morga', txt: 'Trial of Wisdom: talk to Shaman Morga.', say: [
        'Strength is good. But wisdom is better. Read the Law of Redrock, written on this stone tablet.',
        { give: ['orc_tablet', 1] }, { doc: 'orc_law' },
        { ask: 'What must an orc do when a stranger arrives with water?', k: 'READ', o: [['Share food with the stranger.', 'Yes. A stranger with water is a friend.'], ['Fight the stranger.', 'No. Read the law again.'], ['Run away.', 'Orcs do not run away!']] },
        { ask: 'When is it forbidden to hunt?', k: 'READ', o: [['When the moon is full.', 'Correct. The full moon is for resting.'], ['In the morning.', 'No, the law says nothing about mornings.'], ['Every day.', 'Then orcs would be very hungry! Read again.']] },
        { ask: 'According to the law, who is the strongest orc?', k: 'READ', o: [['The one who keeps their word.', 'You have wisdom. Go to Little Zug for the last trial.'], ['The one with the biggest axe.', 'Ha! No. Read the last line again.'], ['The chief.', 'Not exactly. Read the last line again.']] }
      ] },
      { talk: 'zug', txt: 'Trial of Heart: talk to Little Zug.', say: [
        '*sniff* My dog... My dog Biter is lost!',
        { ask: 'Zug is crying. What do you say?', k: 'CONV', o: [['Oh no, I\'m sorry! Can you tell me what he looks like?', 'You... you will help me?'], ['Stop crying. Orcs don\'t cry.', '*cries louder*'], ['I don\'t like dogs.', 'But... Biter is the best dog in the world!']] },
        'Biter is a BROWN dog, with ONE WHITE EAR. He loves bones. Yesterday he ran towards the Old Ruins, near the big cactus, south of the camp.'
      ] },
      { talk: 'dog_ok', noArrow: true, txt: 'Find Biter: a BROWN dog with ONE WHITE EAR, near the Old Ruins.', at: [-38, 216], say: [
        '@me: A brown dog... and one white ear! You must be Biter. Come on, Zug is waiting for you!',
        'Woof! Woof!'
      ] },
      { talk: 'zug', txt: 'Bring Biter back to Little Zug.', say: [
        'BITER!!! You found him! Thank you, thank you, thank you!',
        { anim: 'Cheering' },
        'You have a big heart. I am going to tell the chief!'
      ] },
      { talk: 'grukka', txt: 'Go back to Chief Grukka.', say: [
        'Strength. Wisdom. Heart. You have all three. Grukka was wrong about you.',
        { ask: 'The chief says: "Grukka was wrong about you." What do you answer?', k: 'CONV', o: [['That\'s OK. Thank you for trusting me now.', 'Ha! Humble too. Grukka likes this human.'], ['Yes, you were very stupid.', '...Grukka is trying to say sorry. Be nice.'], ['I\'m hungry.', 'Later! Listen to the chief.']] },
        'Take the Sun Gem. And this armour — orc armour, for an orc-friend.',
        { give: ['gem_sun', 1] }, { take: ['orc_tablet', 1] },
        'The last gem is in Mistmoor, in the west. The Bonefolk live there. They are skeletons, but friendly ones. Do not attack them!'
      ] }
    ],
    reward: { xp: 420, gold: 120, items: [['orc_armor', 1]] }
  },

  // =====================================================================
  // CHAPTER 5 — MISTMOOR
  // =====================================================================
  {
    id: 'crypt', main: true, realm: 4, title: 'The Crypt of Mistmoor', auto: true, req: ['trials'],
    steps: [
      { talk: 'skully', txt: 'Travel west to Bonewick in Mistmoor. Talk to Mayor Skully.', say: [
        'AAAH! A living person! Don\'t hurt me!',
        { ask: 'Skully is scared of you. What do you say?', k: 'CONV', o: [['Sorry, I didn\'t mean to scare you. I\'m a friend.', 'Phew! My bones are still shaking. Welcome to Bonewick!'], ['Boo!', 'AAAAH! *falls into pieces* ...Not funny.'], ['Where is the gem? Tell me now!', 'You are scary AND rude. Please, be kind.']] },
        'We are the Bonefolk. We are skeletons, yes, but we are good neighbours. Lord Hush took our voices... and our Moon Gem.',
        'The Crypt Keeper guards the gem in the old crypt. Nobody remembers the way, but here is an old map. Read it carefully.',
        { give: ['map_piece', 1] }, { doc: 'marsh_map' }
      ] },
      { go: 'crypt', r: 10, noArrow: true, txt: 'Follow the directions on the old map to the crypt.', say: [
        '@me: A stone wall, and behind it... the crypt! The map was right.',
        '@me: Something is moving inside. Get ready!'
      ] },
      { kill: 'keeper', n: 1, txt: 'Defeat the Crypt Keeper.', at: [-208, -52] },
      { talk: 'skully', txt: 'Return to Mayor Skully with the Moon Gem.', say: [
        'The Moon Gem! You are a true hero!',
        { give: ['gem_moon', 1] },
        'Now you have four gems. With them, you can open the door of the Silent Tower, at the far west of Mistmoor.',
        'Lord Hush is waiting there. He will try to steal your words. Remember: words are stronger than silence.'
      ] }
    ],
    reward: { xp: 450, gold: 130, items: [['potion_m', 3]] }
  },
  {
    id: 'finale', main: true, realm: 4, title: 'Words Against Silence', auto: true, req: ['crypt'],
    steps: [
      { go: 'tower', r: 12, txt: 'Go to the Silent Tower (far west) with the four gems.', say: [
        '@me: The four gems are shining... The door is opening!',
        '@hush: So... the little hero has come to my tower. You want the Crown? Then answer me. In my world, there are no words!',
        { ask: 'Lord Hush says: "Words are useless. Nobody listens." What do you answer?', k: 'CONV', o: [['That\'s not true. Words help people understand each other.', '@hush: Grr... Your words are... annoying!'], ['OK, you\'re right.', '@hush: Ha ha! Then give up, little hero! ...No? Answer again!'], ['I like pizza.', '@hush: What? That is not an answer!']] },
        { ask: 'Lord Hush says: "Why do you fight for these strange peoples?"', k: 'CONV', o: [['Because they are my friends, and friends help each other.', '@hush: Friends... I had friends once... NO! Silence!'], ['Because I\'m bored.', '@hush: Bored? Then go home!'], ['Yesterday.', '@hush: That is not even an answer to my question!']] },
        '@hush: Enough talking! Let silence fall!'
      ] },
      { kill: 'hush', n: 1, txt: 'Defeat Lord Hush!', at: [-226, 6] },
      { talk: 'rosa', txt: 'Take the Crown of Words back to Mayor Rosa in Brightwater.', say: [
        'Is that... the Crown of Words?! You did it!',
        { take: ['gem_forest', 1] }, { take: ['gem_stone', 1] }, { take: ['gem_sun', 1] }, { take: ['gem_moon', 1] },
        'Let\'s put it back on the Lingua Stone... There! Can you hear that? People are talking again! Laughing! Singing!',
        { anim: 'Cheering' },
        'Elves, dwarves, orcs, the Bonefolk, humans... everybody can understand each other again. Thanks to you.',
        { ask: 'Rosa says: "How can we ever thank you?" What is a good answer?', k: 'CONV', o: [['You don\'t need to thank me. I was happy to help.', 'A true hero. Brightwater will never forget you.'], ['Give me all your money.', 'Ha ha! Always joking. Here, a little gift.'], ['Nice to meet you.', 'We met a long time ago, silly! But thank you.']] },
        'This is the Royal Sword of the old kings, and the Hero\'s Cape. They are yours now.'
      ] }
    ],
    reward: { xp: 900, gold: 300, items: [['royal_sword', 1], ['hero_cape', 1]] }
  },

  // =====================================================================
  // SIDE MISSIONS — GREENVALE
  // =====================================================================
  {
    id: 's_cat', realm: 0, title: 'Where Is Whiskers?', giver: 'lily', req: ['welcome'],
    intro: [
      'Excuse me... Have you seen my cat? Her name is Whiskers. She is lost!',
      'Whiskers is BLACK, with WHITE PAWS, and she has a RED RIBBON on her neck. She likes to sleep in warm places, like near the Old Mill.',
      { ask: 'What does Whiskers look like?', k: 'LIST', o: [['She\'s black, with white paws and a red ribbon.', 'Yes! Please find her!'], ['She\'s orange, with a red ribbon.', 'No, no! She is BLACK!'], ['She\'s white, with black paws.', 'The other way round! Black, with white paws.']] }
    ],
    steps: [
      { talk: 'cat_ok', noArrow: true, txt: 'Find Whiskers: black, white paws, red ribbon. She likes the area near the Old Mill.', at: [-40, 52], say: [
        '@me: Black fur, white paws and a red ribbon. You must be Whiskers!',
        'Meow!'
      ] },
      { talk: 'lily', txt: 'Tell Lily that you found Whiskers.', say: [
        'Whiskers is home! She came running! Thank you so much!',
        { ask: 'Lily says: "Thank you so much!" What do you say?', k: 'CONV', o: [['You\'re welcome! Take care of her.', 'I will! Here, I have apples for you.'], ['Thank you too.', 'Hmm? Why are you thanking me? Ha ha!'], ['I\'m sorry.', 'Sorry? Why? You found my cat!']] }
      ] }
    ],
    reward: { xp: 45, gold: 5, items: [['apple', 3]] }
  },
  {
    id: 's_bread', realm: 0, title: 'Bread Delivery', giver: 'martha', req: ['welcome'],
    intro: [
      'Oh, dear! I have three loaves of bread to deliver, but I can\'t leave the bakery. Can you help me?',
      'The first loaf is for Old Joe. He is always sitting by the well. The second is for Anna — she is wearing a red dress today, she is at the market. And the third is for the guard at the north gate.',
      { ask: 'Who gets the second loaf?', k: 'LIST', o: [['Anna, the woman in the red dress.', 'That\'s right!'], ['Old Joe.', 'No, Joe is the first one.'], ['The baker.', 'I AM the baker! Listen again, dear.']] },
      { give: ['bread', 3] }
    ],
    steps: [
      { talk: 'joe', noArrow: true, txt: 'Give bread to Old Joe, "by the well".', at: [9, 9], say: [
        'Eh? Bread? From Martha? Oh, how lovely!',
        { take: ['bread', 1] },
        { ask: 'Joe says: "Can you speak louder, please?" Which is LOUDER?', k: 'CONV', o: [['THIS BREAD IS FROM MARTHA!', 'Ah! Now I can hear you. Thank you!'], ['(whispering) this bread is from Martha...', 'What? I can\'t hear anything!'], ['Goodbye.', 'Eh? Bye? But I didn\'t hear what you said!']] }
      ] },
      { talk: 'anna', noArrow: true, txt: 'Give bread to Anna, "the woman in a red dress, at the market".', at: [-24, 7], say: [
        'Bread for me? Martha is so kind.',
        { take: ['bread', 1] },
        'Do you like my dress? I made it myself.',
        { ask: 'Anna asks: "Do you like my dress?"', k: 'CONV', o: [['Yes, I love it! The colour is beautiful.', 'Thank you! You are very sweet.'], ['Yes, I do. I don\'t.', 'Yes or no? You are very confusing!'], ['It\'s Tuesday.', 'Um... is it?']] }
      ] },
      { talk: 'greg', noArrow: true, txt: 'Give bread to the guard "at the north gate".', at: [4, -38], say: [
        'Bread! I\'m so hungry. I can\'t leave my post until six o\'clock.',
        { take: ['bread', 1] }
      ] },
      { talk: 'martha', txt: 'Go back to Martha the Baker.', say: [
        'All delivered? You are faster than my old horse! Here, take some cheese and a coin or two.'
      ] }
    ],
    reward: { xp: 60, gold: 15, items: [['cheese', 2]] }
  },
  {
    id: 's_eggs', realm: 0, title: 'The Egg Hunt', giver: 'hilda', req: ['welcome'],
    intro: [
      'My hens are naughty! They lay eggs everywhere: in the grass, behind the barrels, next to the fence...',
      'Could you find five eggs for me? I want to bake a cake for my grandson.'
    ],
    steps: [
      { bring: 'egg', n: 5, to: 'hilda', txt: 'Find 5 eggs around the farm and bring them to Granny Hilda.', at: [50, 30], say: [
        'One, two, three, four, five! Perfect! Now I can make my chocolate cake.',
        { ask: 'Hilda says: "Would you like a piece of cake later?"', k: 'CONV', o: [['Yes, please! That sounds delicious.', 'Lovely! Come back tomorrow.'], ['Yes, I would like.', 'Ha ha, you mean "Yes, I would." Or just "Yes, please!"'], ['No, I am a cake.', 'You are a... what? Oh, dear.']] }
      ] }
    ],
    reward: { xp: 50, gold: 10, items: [['potion_s', 2]] }
  },
  {
    id: 's_letter', realm: 0, title: 'A Letter for Finn', giver: 'pip', req: ['welcome'],
    intro: [
      'Phew! So many letters today. Could you take this one to Finn the Fisherman? He\'s at the fishing pond, north-east of town.',
      { give: ['love_letter', 1] }
    ],
    steps: [
      { talk: 'finn', txt: 'Take the pink letter to Finn at the fishing pond (north-east).', say: [
        'A letter? For me? Oh... I can\'t read very well. Could you read it for me, please?',
        { doc: 'love_letter' },
        { ask: 'Finn asks: "Who wrote the letter?"', k: 'READ', o: [['Anna.', 'Anna?! The girl with the beautiful red dress?!'], ['Martha.', 'Martha? No, read the end of the letter again.'], ['Pip.', 'Pip only delivers letters! Look at the name at the end.']] },
        { ask: 'Finn asks: "Where does she want to meet?"', k: 'READ', o: [['At the fishing pond.', 'Here?! At MY pond?'], ['At the tavern.', 'No... read it again, please.'], ['In Leafhollow.', 'That\'s very far! Are you sure?']] },
        { ask: 'Finn asks: "When?"', k: 'READ', o: [['On Saturday at five o\'clock.', 'Saturday at five! I need a new shirt!'], ['On Monday morning.', 'Hmm, are you sure? Read it again.'], ['Tonight.', 'Tonight? Read it again, please.']] },
        'Please, tell Anna... tell her YES! I\'m too shy to say it myself.',
        { take: ['love_letter', 1] }
      ] },
      { talk: 'anna', txt: 'Give Finn\'s answer to Anna at the market.', say: [
        'Did Finn read my letter? What did he say?',
        { ask: 'What do you tell Anna?', k: 'CONV', o: [['He says yes! He will meet you on Saturday.', 'Oh! I\'m so happy! Thank you!'], ['He says no.', 'What?! Is that true? ...Your face says it isn\'t. Tell me the truth!'], ['He likes fish.', 'Yes, I know he likes fish. But what did he SAY?']] }
      ] }
    ],
    reward: { xp: 70, gold: 20, items: [['potion_s', 2]] }
  },
  {
    id: 's_quiz', realm: 0, title: 'Quiz Night at the Inn', giver: 'rob', req: ['welcome'],
    intro: ['It\'s quiz night! Five questions, and I only say each question ONCE. Are you ready?'],
    steps: [
      { talk: 'rob', txt: 'Play Quiz Night with Rob at the inn.', say: [
        { listen: 'Question one. How many legs does a spider have?', k: 'LIST', o: [['Eight.', 'Correct!'], ['Six.', 'No, insects have six. Spiders have eight.'], ['Four.', 'No, that\'s a dog!']] },
        { listen: 'Question two. What do bees make?', k: 'LIST', o: [['Honey.', 'Sweet! Correct.'], ['Milk.', 'No, cows make milk!'], ['Bread.', 'No, Martha makes bread!']] },
        { listen: 'Question three. Which animal is the biggest: a cat, a horse or an elephant?', k: 'LIST', o: [['An elephant.', 'Yes! Elephants are huge.'], ['A cat.', 'A cat?! Ha ha, no.'], ['A horse.', 'Big, but not the biggest.']] },
        { listen: 'Question four. What do you use to cut paper?', k: 'LIST', o: [['Scissors.', 'Snip snip! Correct.'], ['A spoon.', 'A spoon is for soup!'], ['A pillow.', 'A pillow? For sleeping!']] },
        { listen: 'Last question. What colour do you get when you mix blue and yellow?', k: 'LIST', o: [['Green.', 'Correct! You are the quiz champion!'], ['Purple.', 'No, red and blue make purple.'], ['Orange.', 'No, red and yellow make orange.']] }
      ] }
    ],
    reward: { xp: 70, gold: 25, items: [['cheese', 1]] }
  },
  {
    id: 's_sam', realm: 0, title: 'The Shy Boy', giver: 'sam', req: ['welcome'],
    intro: [
      'Um... Can I ask you something? I want to invite Lily to play with me. But I\'m too shy. Can you help me choose what to say?',
      { ask: 'How can Sam start?', k: 'CONV', o: [['"Hi Lily! Do you want to play with me?"', 'Oh, that\'s nice and simple!'], ['"Lily. Play. Now."', 'That sounds like an order... I don\'t want to be rude.'], ['"I don\'t want to play with you."', 'But I DO want to play with her!']] },
      { ask: 'And what can he suggest?', k: 'CONV', o: [['"We could draw dragons together. What do you think?"', 'Yes! I love dragons!'], ['"You must draw dragons."', '"Must"? That\'s too strong. Let\'s ask, not order.'], ['"Dragons are horrible."', 'But I LOVE dragons!']] },
      'Can you go and say it to her for me? Please?'
    ],
    steps: [
      { talk: 'lily', txt: 'Invite Lily to play with Sam.', say: [
        '@me: Hi Lily! Sam wants to know: do you want to play with him? You could draw dragons together.',
        'Dragons? I LOVE dragons! Yes! Tell him I\'ll meet him at the well after lunch!',
        { ask: 'When will Lily meet Sam?', k: 'LIST', o: [['After lunch, at the well.', 'Yes!'], ['Before breakfast, at the farm.', 'No, after lunch!'], ['Tomorrow, at the mill.', 'No, silly. After lunch, at the well!']] }
      ] },
      { talk: 'sam', txt: 'Tell Sam what Lily said.', say: [
        '@me: She said yes! She\'ll meet you at the well after lunch.',
        'Really?! Wow! Thank you! You can have my dagger. I only use it to sharpen pencils.'
      ] }
    ],
    reward: { xp: 60, gold: 5, items: [['hunter_dagger', 1]] }
  },
  {
    id: 's_board_g', realm: 0, title: 'Wanted: Slime Hunter', giver: 'board_g', req: ['slimes'],
    intro: [{ doc: 'board_g' }],
    steps: [
      { kill: 'slime', n: 8, txt: 'Defeat 8 green slimes anywhere in Greenvale.' },
      { talk: 'rosa', txt: 'Get your reward from Mayor Rosa.', say: ['Eight more slimes! The farmers are very happy. Here is your reward.'] }
    ],
    reward: { xp: 80, gold: 30 }
  },

  // =====================================================================
  // SIDE MISSIONS — WHISPERWOOD
  // =====================================================================
  {
    id: 's_mush', realm: 1, title: 'Mushroom Soup', giver: 'thalia', req: ['password'],
    intro: [
      'Hello, human. I\'m making my famous mushroom soup, but I don\'t have enough mushrooms.',
      'I need FOUR mushrooms. Bring me the RED ones with WHITE SPOTS. The brown ones are not good for soup — they taste like old socks!',
      'They grow south-west of Leafhollow, on the way back to Greenvale.'
    ],
    steps: [
      { bring: 'spotted_mushroom', n: 4, to: 'thalia', txt: 'Pick 4 red mushrooms with white spots (south-west of Leafhollow).', at: [-36, -150], say: [
        'Red with white spots, four of them. Perfect! Here, take some soup. It\'s still hot!',
        { ask: 'Thalia asks: "How does the soup taste?"', k: 'CONV', o: [['It\'s delicious! Thank you.', 'I\'m glad you like it!'], ['It\'s blue.', 'Blue? The soup is brown...'], ['I\'m fine.', 'I asked about the soup, not about you!']] }
      ] }
    ],
    reward: { xp: 90, gold: 15, items: [['mushroom_soup', 2]] }
  },
  {
    id: 's_poem', realm: 1, title: 'The Poet\'s Problem', giver: 'liriel', req: ['password'],
    intro: ['Oh, inspiration, where are you? I am writing a poem for the Queen, but I can\'t find the last words. Will you help me? The words must RHYME.'],
    steps: [
      { talk: 'liriel', txt: 'Help Liriel finish the poem.', say: [
        { ask: '"The moon is up, the night is bright, / The stars are full of silver ___."', k: 'VOC', o: [['light', 'Light! Bright and light. Beautiful!'], ['dark', 'Dark? It doesn\'t rhyme with "bright".'], ['rain', 'Rain? That doesn\'t rhyme, and stars don\'t have rain.']] },
        { ask: '"I walk among the trees so green, / The oldest forest I have ___."', k: 'VOC', o: [['seen', 'Green and seen! Perfect.'], ['saw', 'Hmm, "I have saw" is not correct. And it doesn\'t rhyme.'], ['eaten', 'Eaten?! I don\'t eat forests!']] },
        { ask: '"The river sings, the sky is blue, / And all the forest sings to ___."', k: 'VOC', o: [['you', 'Blue and you! My poem is finished!'], ['me', 'Me? It doesn\'t rhyme with "blue".'], ['tree', 'Tree doesn\'t rhyme with blue, my friend.']] },
        'Thank you! The Queen will love it. Take this, it\'s a cape that shines like the stars.'
      ] }
    ],
    reward: { xp: 80, gold: 10, items: [['mage_cape', 1]] }
  },
  {
    id: 's_arrows', realm: 1, title: 'Lost Arrows', giver: 'aeron', req: ['password'],
    intro: [
      'I was practising in the woods east of the gate and... I lost my arrows. Six of them. They have green feathers.',
      'If you find them, I\'ll give you something special.'
    ],
    steps: [
      { bring: 'lost_arrow', n: 6, to: 'aeron', txt: 'Find 6 lost arrows in the woods east of the gate.', at: [36, -150], say: [
        'All six! You have good eyes. Take this bow — an elven bow. Now you can attack from far away!'
      ] }
    ],
    reward: { xp: 90, gold: 10, items: [['elf_bow', 1]] }
  },
  {
    id: 's_oak', realm: 1, title: 'The Lonely Oak', giver: 'oak', req: ['password'],
    intro: [
      'Hmmmm... A visitor... Nobody talks to me anymore... Will you talk to an old tree?'
    ],
    steps: [
      { talk: 'oak', txt: 'Have a conversation with the Old Oak.', say: [
        'Tell me... what is your name?',
        { ask: 'The Old Oak asks: "What is your name?"', k: 'CONV', o: [['My name is {name}. Nice to meet you!', 'Hmmm... {name}. A good name.'], ['I am fine.', 'I asked your name, little one, not how you feel.'], ['It\'s green.', 'Green? That is MY colour, not your name!']] },
        'What do you like doing in your free time?',
        { ask: 'The Old Oak asks: "What do you like doing in your free time?"', k: 'CONV', o: [['I like playing football and reading books.', 'Books are made of trees, you know... Hmmm, I like that.'], ['Yes, I do.', 'Yes, you do... what? Hmmm?'], ['Yesterday.', 'Yesterday is not an activity, little one.']] },
        'How do you feel today?',
        { ask: 'The Old Oak asks: "How do you feel today?"', k: 'CONV', o: [['I feel happy, but a bit tired.', 'Tired... yes. Adventures are tiring.'], ['I feel a tree.', 'You... feel a tree? You are touching me?'], ['On Monday.', 'That is a day, not a feeling.']] },
        'Thank you, {name}. It is nice to have a conversation. Take these. They grew from my roots.'
      ] }
    ],
    reward: { xp: 80, gold: 0, items: [['potion_m', 2]] }
  },
  {
    id: 's_fur', realm: 1, title: 'Warm Cloaks for Winter', giver: 'sylvi', req: ['password'],
    intro: [
      'Winter is coming, and the little elves need warm cloaks. I need wolf fur: four pieces. Wolves live around Wolf Lake and in the woods.',
      'Don\'t worry — the fur is from wolves that attack travellers.'
    ],
    steps: [
      { bring: 'wolf_fur', n: 4, to: 'sylvi', txt: 'Get 4 pieces of wolf fur (defeat wolves) and bring them to Sylvi.', say: [
        'Soft and warm! The little ones will be happy. Here, I made this cloak for you.'
      ] }
    ],
    reward: { xp: 100, gold: 20, items: [['hooded_cloak', 1]] }
  },

  // =====================================================================
  // SIDE MISSIONS — STONEHOLD
  // =====================================================================
  {
    id: 's_recipe', realm: 2, title: 'Helga\'s Pie', giver: 'helga', req: ['gates'],
    intro: [
      'I\'m making my famous pie for the King\'s birthday, but my kitchen boy ran away!',
      'Listen: I need TWO pieces of cheese and THREE apples. The cheese is in the storeroom, behind my kitchen. The apples are in the baskets next to Balin\'s stage. There\'s bread there too, but I don\'t need bread!',
      { ask: 'What does Helga need?', k: 'LIST', o: [['Two pieces of cheese and three apples.', 'Exactly! Go, go!'], ['Three pieces of cheese and two apples.', 'No, the other way round!'], ['Two loaves of bread.', 'I said I DON\'T need bread!']] }
    ],
    steps: [
      { bring: 'cheese', n: 2, to: 'helga', txt: 'Get 2 pieces of cheese (storeroom behind the kitchen).', at: [160, 22], say: ['Cheese! Wonderful. Do you have the apples too?'] },
      { bring: 'apple', n: 3, to: 'helga', txt: 'Get 3 apples (baskets next to Balin\'s stage).', at: [186, 24], say: [
        'Three apples! Now my pie will be perfect. Here, take some gold — and a big smile from Helga!'
      ] }
    ],
    reward: { xp: 110, gold: 30 }
  },
  {
    id: 's_ore', realm: 2, title: 'Iron for the Forge', giver: 'brokk', req: ['gates'],
    intro: ['My forge is hungry for iron! Bring me five pieces of iron ore from the quarry, south of the city. Then I can make you something nice.'],
    steps: [
      { bring: 'iron_ore', n: 5, to: 'brokk', txt: 'Collect 5 iron ores at the quarry (south of Ironhearth).', at: [176, 44], say: ['Good iron! Here, a battle axe, fresh from my forge.'] }
    ],
    reward: { xp: 110, gold: 20, items: [['battle_axe', 1]] }
  },
  {
    id: 's_hammer', realm: 2, title: 'The Silver Hammer', giver: 'brokk', req: ['s_ore'],
    intro: [
      'Oh no, where is my little silver hammer? It has a "B" on it, for Brokk.',
      'I think I left it next to the old anvil... The anvil is between the red cart and the mine entrance. Can you look for it?'
    ],
    steps: [
      { bring: 'lost_hammer', n: 1, to: 'brokk', noArrow: true, txt: 'Find Brokk\'s hammer: "next to the old anvil, between the red cart and the mine entrance".', at: [200, -40], say: [
        'My hammer! With the B! Thank you, friend. Take this helmet. I made it last year, but it\'s too small for my big head.'
      ] }
    ],
    reward: { xp: 90, gold: 15, items: [['bear_hat', 1]] }
  },
  {
    id: 's_song', realm: 2, title: 'The Song of the Stone', giver: 'balin', req: ['gates'],
    intro: ['La la laaa! I am learning the old Song of the Stone, but I forget some words. Listen to me sing, and tell me which word I need!'],
    steps: [
      { talk: 'balin', txt: 'Help Balin remember the song.', say: [
        { listen: 'Deep in the mountain, under the ground, the dwarves are working without a sound.', k: 'LIST', ask: 'Where are the dwarves working?', o: [['Under the ground, in the mountain.', 'Yes! Deep in the mountain!'], ['On the beach.', 'A dwarf on the beach? Ha!'], ['In the clouds.', 'Clouds? We are dwarves, not birds!']] },
        { listen: 'With hammers of iron and hearts of gold, we tell the stories our fathers told.', k: 'LIST', ask: 'What are their hearts made of, in the song?', o: [['Gold.', 'Hearts of gold! Lovely.'], ['Iron.', 'No, the HAMMERS are iron.'], ['Stone.', 'Not in this line, my friend.']] },
        { listen: 'And when the day is over, we sing and eat and sleep, until the morning calls us back into the mountain deep.', k: 'LIST', ask: 'What do they do when the day is over?', o: [['They sing, eat and sleep.', 'Exactly! You have a good ear!'], ['They go swimming.', 'Swimming? Dwarves sink like stones!'], ['They fight dragons.', 'Not in this song!']] },
        'Wonderful! Now I remember the whole song. Here\'s a little gift.'
      ] }
    ],
    reward: { xp: 100, gold: 40, items: [['spellbook', 1]] }
  },
  {
    id: 's_board_s', realm: 2, title: 'Wanted: Bone Breaker', giver: 'board_s', req: ['gates'],
    intro: [{ doc: 'board_s' }],
    steps: [
      { kill: 'minion', n: 6, txt: 'Defeat 6 skeleton miners in Stonehold.' },
      { talk: 'thrain', txt: 'Get your reward from King Thrain.', say: ['Six skeletons! My miners can work again. Here is your reward.'] }
    ],
    reward: { xp: 150, gold: 50, items: [['knight_shield', 1]] }
  },

  // =====================================================================
  // SIDE MISSIONS — SUNSCAR
  // =====================================================================
  {
    id: 's_water', realm: 3, title: 'Water Is Life', giver: 'nara', req: ['trials'],
    intro: ['The well in the camp is dry, and my old legs are tired. Please bring four buckets of water from the oasis. The oasis is south-east of the camp — look for the palm trees.'],
    steps: [
      { bring: 'water_bucket', n: 4, to: 'nara', txt: 'Fill 4 buckets at the oasis (south-east) and bring them to Old Nara.', at: [50, 188], say: [
        'Cool, clean water! Thank you, child. You have a kind heart.',
        { ask: 'Nara says: "Thank you, child." You answer:', k: 'CONV', o: [['No problem! It was a pleasure.', 'Such a nice young person!'], ['Child? I\'m not a child!', 'Ha! For Nara, everybody is a child.'], ['I\'m thirsty.', 'Then drink some water, child!']] }
      ] }
    ],
    reward: { xp: 120, gold: 25, items: [['potion_m', 1]] }
  },
  {
    id: 's_trade', realm: 3, title: 'The Art of Haggling', giver: 'kasim', req: ['trials'],
    intro: ['Welcome, my friend! In the desert, nobody pays the first price. We HAGGLE! Let me teach you. Pretend you want to buy my beautiful carpet.'],
    steps: [
      { talk: 'kasim', txt: 'Practise haggling with Kasim.', say: [
        'This carpet costs one hundred gold coins.',
        { ask: 'You think it\'s too much. What do you say?', k: 'CONV', o: [['That\'s too expensive! Can you make it cheaper?', 'Ah, you learn fast! OK... eighty gold.'], ['That\'s too cheap!', 'Too cheap?! Then pay me two hundred! Ha! No, no. Try again.'], ['I don\'t like carpets.', 'Then why are you looking at it? Try again!']] },
        { ask: 'Kasim says eighty gold. Make an offer.', k: 'CONV', o: [['I can pay fifty gold. What do you think?', 'Fifty? You break my heart! Sixty-five, and it\'s yours.'], ['I will pay one hundred and fifty.', 'More than my price? You are a terrible haggler!'], ['Give it to me for free.', 'Free?! My children need to eat!']] },
        { ask: 'Kasim says sixty-five. Accept politely.', k: 'CONV', o: [['OK, it\'s a deal. Thank you!', 'Ha ha! A deal! You are a real desert trader now.'], ['Whatever.', 'Whatever? That is not how we close a deal, friend.'], ['No deal, you thief!', 'Thief?! Ha. Be polite and you get better prices.']] },
        'You don\'t really need a carpet. But here is a gift for a good student. And now you can buy at my shop!'
      ] }
    ],
    reward: { xp: 100, gold: 40 }
  },
  {
    id: 's_caravan', realm: 3, title: 'The Lost Caravan', giver: 'kasim', req: ['s_trade'],
    intro: [
      'Bandits attacked my caravan last week. One box is still out there in the desert. I wrote what happened in my diary. Read it, and find my box!',
      { doc: 'kasim_diary' },
      { ask: 'Where did Kasim hide the box?', k: 'READ', o: [['Behind the tallest cactus, south of the camp.', 'Yes. Go and look there!'], ['Under the water of the oasis.', 'Under water?! The silk would be ruined. Read again.'], ['In the chief\'s tent.', 'No, no. Read my diary again.']] }
    ],
    steps: [
      { bring: 'caravan_box', n: 1, to: 'kasim', noArrow: true, txt: 'Find Kasim\'s box: "behind the tallest cactus, south of the camp".', at: [-16, 226], say: [
        'My box! My silk, my spices! You are a hero. Take this shield. A trader always pays his debts.'
      ] }
    ],
    reward: { xp: 120, gold: 40, items: [['spike_shield', 1]] }
  },
  {
    id: 's_glass', realm: 3, title: 'Desert Glass', giver: 'brug', req: ['trials'],
    intro: ['I make shields with desert glass. Look for orange glass in the sand south-east of the camp. Bring me five pieces!'],
    steps: [
      { bring: 'sand_glass', n: 5, to: 'brug', txt: 'Collect 5 pieces of desert glass (south-east of the camp).', at: [30, 205], say: ['Shiny! Here, an orc shield. Strong AND beautiful.'] }
    ],
    reward: { xp: 110, gold: 20, items: [['orc_shield', 1]] }
  },
  {
    id: 's_board_d', realm: 3, title: 'Wanted: Sand Slimes', giver: 'board_d', req: ['trials'],
    intro: [{ doc: 'board_d' }],
    steps: [
      { kill: 'sand_slime', n: 6, txt: 'Defeat 6 sand slimes in the desert.' },
      { talk: 'grukka', txt: 'Get your reward from Chief Grukka.', say: ['Six sand slimes. Grukka is impressed. Take this.'] }
    ],
    reward: { xp: 160, gold: 60, items: [['heavy_xbow', 1]] }
  },

  // =====================================================================
  // SIDE MISSIONS — MISTMOOR
  // =====================================================================
  {
    id: 's_name', realm: 4, title: 'Who Am I?', giver: 'mrbones', req: ['crypt'],
    intro: [
      'Excuse me... do you know who I am? Lord Hush took my name. I only remember that I wrote a diary. The pages are lost in the graveyard, south of the town.',
      'Please find three pages. Maybe they can tell me who I am.'
    ],
    steps: [
      { bring: 'diary_page', n: 3, to: 'mrbones', txt: 'Find 3 diary pages in the graveyard (south of Bonewick).', at: [-186, 44], say: [
        'You found them! Please, read them to me.',
        { doc: 'bones_diary' },
        { ask: 'What was his name?', k: 'READ', o: [['Sir Reginald Clatterbones.', 'Reginald! Yes! I remember now!'], ['Mr. Skully.', 'No, Skully is the mayor. Read the first page again.'], ['Lord Hush.', 'NO! I\'m not him! Read again, please!']] },
        { ask: 'What was his job?', k: 'READ', o: [['He was a music teacher.', 'Yes! I taught children to play the violin!'], ['He was a pirate.', 'A pirate?! No, no. Read again.'], ['He was a cook.', 'I can\'t even cook an egg. Read again!']] },
        { ask: 'What did he love most?', k: 'READ', o: [['Playing the violin for his students.', 'Yes... that makes me so happy to remember.'], ['Sleeping all day.', 'No, I was a busy person!'], ['Eating pumpkins.', 'That\'s Clatter, not me!']] },
        'Thank you, friend. I am Sir Reginald Clatterbones, music teacher! Take this cloak, I don\'t need it anymore.'
      ] }
    ],
    reward: { xp: 150, gold: 30, items: [['bone_cloak', 1]] }
  },
  {
    id: 's_lanterns', realm: 4, title: 'Light the Way', giver: 'wisp', req: ['crypt'],
    intro: [
      'The lanterns of Bonewick went out when Lord Hush came. Without light, the Bonefolk get lost at night.',
      'Here is some lantern oil. Light the five lanterns around the town — just walk to each lantern and press E.',
      { give: ['lantern_oil', 1] }
    ],
    steps: [
      { act: 'lantern', n: 5, txt: 'Light the 5 lanterns around Bonewick (walk to each one and press E).', at: [-172, 0] },
      { talk: 'wisp', txt: 'Go back to Wisp.', say: [
        'Look how beautiful Bonewick is with light! Thank you!',
        { take: ['lantern_oil', 1] }
      ] }
    ],
    reward: { xp: 130, gold: 30, items: [['potion_m', 2]] }
  },
  {
    id: 's_pumpkins', realm: 4, title: 'Pumpkin Harvest', giver: 'clatter', req: ['crypt'],
    intro: [
      'It\'s harvest time! Can you pick six pumpkins for me? They are in my field, east of the town.',
      'Only the ORANGE ones, please! The YELLOW ones are not ready yet.',
      { ask: 'Which pumpkins must you pick?', k: 'INST', o: [['Six orange pumpkins.', 'Yes! Thank you!'], ['Six yellow pumpkins.', 'No! The yellow ones are not ready!'], ['All of them.', 'No, no! Only the orange ones!']] }
    ],
    steps: [
      { bring: 'pumpkin', n: 6, to: 'clatter', txt: 'Pick 6 ORANGE pumpkins in Clatter\'s field (east of the town).', at: [-146, 34], say: ['Six orange pumpkins! Beautiful! I\'m going to make lanterns with faces!'] }
    ],
    reward: { xp: 130, gold: 25, items: [['bone_helmet', 1]] }
  },
  {
    id: 's_garden', realm: 4, title: 'The Grave Garden', giver: 'rattle', req: ['crypt'],
    intro: ['I want to plant flowers in the graveyard, but I forgot how to do it! Can you help me put the steps in order?'],
    steps: [
      { talk: 'rattle', txt: 'Help Rattle plant the garden.', say: [
        { ask: 'What do we do FIRST?', k: 'INST', o: [['First, dig a small hole in the ground.', 'Dig a hole. Got it!'], ['First, pick the flowers.', 'Pick them? They haven\'t grown yet!'], ['First, water the hole.', 'There\'s no hole yet!']] },
        { ask: 'What do we do NEXT?', k: 'INST', o: [['Next, put the seeds in the hole and cover them with soil.', 'Seeds in, soil on top. Easy!'], ['Next, eat the seeds.', 'Eat them?! I have no stomach!'], ['Next, go to sleep.', 'Not yet! We\'re working!']] },
        { ask: 'What do we do FINALLY?', k: 'INST', o: [['Finally, water the seeds every day.', 'Every day! I will. Thank you, friend!'], ['Finally, dig them up again.', 'Then they will never grow!'], ['Finally, forget about them.', 'Poor seeds!']] },
        'In spring, the graveyard will be full of colours. Here, take some ghost dust. It shines in the dark.',
        { give: ['ghost_dust', 3] }
      ] }
    ],
    reward: { xp: 110, gold: 20 }
  },
  {
    id: 's_candles', realm: 4, title: 'Ingredients for the Witch', giver: 'morwen', req: ['crypt'],
    intro: ['I\'m making a potion of courage, and I need ghost dust. Five pinches. The skeleton mages carry it, west of the town... or maybe you already have some?'],
    steps: [
      { bring: 'ghost_dust', n: 5, to: 'morwen', txt: 'Bring 5 ghost dust to Morwen the Witch.', say: [
        'Bubble, bubble... perfect! Here, take some of my best potions.'
      ] }
    ],
    reward: { xp: 140, gold: 30, items: [['potion_m', 3]] }
  },
  {
    id: 's_board_m', realm: 4, title: 'Wanted: Warrior Hunter', giver: 'board_m', req: ['crypt'],
    intro: [{ doc: 'board_m' }],
    steps: [
      { kill: 'warrior', n: 5, txt: 'Defeat 5 skeleton warriors in Mistmoor.' },
      { talk: 'skully', txt: 'Get your reward from Mayor Skully.', say: ['Five warriors! Bonewick is safer now. Thank you!'] }
    ],
    reward: { xp: 200, gold: 70, items: [['shadow_plate', 1]] }
  }
];

// Lanterns to light (s_lanterns)
export const ACTS = {
  lantern: { q: 's_lanterns', pts: [[-160, -22], [-184, -16], [-190, 12], [-176, 22], [-152, 10]] }
};

// Things to read
export const DOCS = {
  how_to_play: { title: 'How to play', icon: '📜', text: 'Walk with WASD or the arrow keys. Run with Shift. Jump with Space.\n\nTalk to people and pick things up with E. Attack with a click or F. Drink a potion with Q.\n\nOpen your bag with I, your journal with J and the big map with M.\n\nThere are magic portals 🌀 in every town. Walk to a portal to activate it. Then press E at any portal to travel to the portals you have found.\n\nYou play online with other students: you can see them in the world. Press T (or Say) to send them a quick message in English. Bosses are shared: fight them together!\n\nEvery kind of monster has a big boss 👑. Bosses are hard to beat, but they drop better treasure and magic stones. Take your stones to Elara the Enchanter (Brightwater) or Durgan the Runesmith (Ironhearth) to improve your weapons and armour up to +12.\n\nPeople with a gold ! have a main mission. People with a blue ! have a side mission. A ? means they are waiting for you.\n\nClick on an underlined word to see what it means in Spanish.' },
  guard_report: { title: 'Night report — Guard Greg', icon: '📋', text: 'Report from the north gate.\n\nAt midnight I saw a stranger in the square. The stranger was tall and thin, and was wearing a long black cloak. I could not see the face.\n\nThe stranger walked to the Lingua Stone, took something shiny and ran towards the Old Mill, in the south-west of town.\n\nI followed, but the stranger was too fast. A big black crow was flying above the stranger.\n\nAt six in the morning, the Crown of Words was not on the stone.\n\n— Greg' },
  mayor_letter: { title: 'Letter to Queen Elowen', icon: '✉️', text: 'Dear Queen Elowen,\n\nI hope you and your people are well. I am writing because something terrible happened. The Crown of Words was stolen from the Lingua Stone, and we think Lord Hush is behind it.\n\nThe person with this letter is brave and kind. Please help them.\n\nThe guards of Leafhollow will ask for the password. The password is: SILVER LEAVES SING AT NIGHT.\n\nWith friendship,\nRosa, Mayor of Brightwater' },
  love_letter: { title: 'A pink letter', icon: '💌', text: 'Dear Finn,\n\nI see you every day at the fishing pond. You are always so calm and kind with the ducks.\n\nWould you like to have a picnic with me? Let\'s meet at the fishing pond on Saturday at five o\'clock. I will bring sandwiches and apple juice.\n\nPlease say yes!\n\nAnna' },
  orc_law: { title: 'The Law of Redrock', icon: '🪧', text: 'THE LAW OF REDROCK\n\n1. An orc never lies to the chief.\n\n2. When a stranger arrives with water, share your food with the stranger. A stranger with water is a friend.\n\n3. Do not hunt when the moon is full. The full moon is for resting and telling stories.\n\n4. Protect the young and listen to the old.\n\n5. The strongest orc is not the one with the biggest axe. The strongest orc is the one who keeps their word.' },
  marsh_map: { title: 'Old map of the marsh', icon: '🗺️', text: 'THE WAY TO THE CRYPT\n\nLeave Bonewick by the NORTH road.\n\nWalk past the TWO LANTERNS.\n\nWhen you see the BIG DEAD TREE, turn LEFT (to the west).\n\nWalk straight on. The crypt is behind the STONE WALL.\n\nDo not go into the black water!' },
  kasim_diary: { title: "Kasim's diary", icon: '📓', text: 'Monday. We left Redrock Camp with three camels and four boxes of silk and spices.\n\nTuesday. Very hot. One camel was tired, so we stopped at the oasis to drink.\n\nWednesday. Bandits! They came from the Old Ruins. I took one box and ran south. I hid it behind the tallest cactus, south of the camp, and covered it with sand.\n\nThursday. We are safe at the camp, but the box is still in the desert. I must find someone brave to bring it back.' },
  dwarf_song: { title: 'The Song of the Stone', icon: '🎼', text: 'Deep in the mountain, under the ground...' },
  bones_diary: { title: 'Three diary pages', icon: '📄', text: 'Page 1\nMy name is Sir Reginald Clatterbones. Today is my birthday. I am forty years old, and my students gave me a cake!\n\nPage 2\nI love my job. I am a music teacher in Bonewick. Every morning I teach the children to play the violin. Some of them are terrible, but they try very hard.\n\nPage 3\nThe best moment of my day is when I play the violin for my students and they dance. That is what I love most in the world.' },
  board_g: { title: 'Notice Board — Brightwater', icon: '📌', text: 'WANTED: SLIME HUNTER\n\nThe slimes are back in the fields! Defeat eight green slimes anywhere in Greenvale.\n\nReward: 30 gold coins.\nAsk Mayor Rosa for your reward.' },
  board_s: { title: 'Notice Board — Ironhearth', icon: '📌', text: 'WANTED: BONE BREAKER\n\nSkeleton miners are walking in our tunnels and quarries. Defeat six of them.\n\nReward: 50 gold coins and a Knight Shield.\nBy order of King Thrain.' },
  board_d: { title: 'Notice Board — Redrock', icon: '📌', text: 'WANTED: SLIME SQUASHER\n\nSand slimes are eating our camels\' food! Kill six sand slimes.\n\nReward: 60 gold and a heavy crossbow.\nTalk to Chief Grukka.' },
  board_m: { title: 'Notice Board — Bonewick', icon: '📌', text: 'WANTED: BRAVE HERO\n\nSkeleton warriors (not our friends!) attack anyone who visits the graveyard. Please defeat five of them.\n\nReward: 70 gold and the Shadow Plate armour.\nTalk to Mayor Skully.' }
};
