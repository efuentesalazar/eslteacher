/* Weather Heroes — Unit 4 "What's the weather like?" (5° básico)
   All the English content of the game lives here, so a teacher can edit it.

   Exercise types:
   mcq    { t:'mcq', q, o:[correct, wrong, wrong, wrong], why, pic? }
   listen { t:'listen', say, q, o:[...], why }         (the game reads "say" aloud)
   order  { t:'order', s:"Sentence in the right order.", es }   (es = pista en español)
   gap    { t:'gap', text:"It's ___ today. I wear my ___.", a:['hot','cap'], extra:['cold'] }
   match  { t:'match', pairs:[['sunny','☀️'], ...] }
   read   { t:'read', title, text:[...], qs:[{q, o, why}] }
   The first option in "o" is always the correct one (the game shuffles them).
*/

export const CLOTHES = {
  cap:        { name: 'cap',        icon: '🧢', slot: 'head'  },
  beanie:     { name: 'wool hat',   icon: '🧶', slot: 'head'  },
  sunglasses: { name: 'sunglasses', icon: '🕶️', slot: 'eyes'  },
  scarf:      { name: 'scarf',      icon: '🧣', slot: 'neck'  },
  tshirt:     { name: 'T-shirt',    icon: '👕', slot: 'body'  },
  jacket:     { name: 'jacket',     icon: '🧥', slot: 'body', color: 0x3b6fd8 },
  raincoat:   { name: 'raincoat',   icon: '🦺', slot: 'body', color: 0xf5c518 },
  coat:       { name: 'coat',       icon: '🧥', slot: 'body', color: 0xb5382f },
  gloves:     { name: 'gloves',     icon: '🧤', slot: 'hands' },
  umbrella:   { name: 'umbrella',   icon: '☂️', slot: 'hands' },
  sandals:    { name: 'sandals',    icon: '🩴', slot: 'feet'  },
  boots:      { name: 'boots',      icon: '🥾', slot: 'feet'  },
};
export const SLOTS = ['head', 'eyes', 'neck', 'body', 'hands', 'feet'];

/* Zones of the open map. dir = where the zone is from the town. */
export const ZONES = {
  town:   { name: 'Sunnyvale Town',   season: '',        icon: '🏘️', temp: 20, weather: "It's sunny and warm.",
            need: [], forbid: [] },
  desert: { name: 'Sunny Desert',     season: 'summer',  icon: '☀️', temp: 35, weather: "It's sunny and hot.",
            need: ['cap', 'sunglasses', 'tshirt'], forbid: ['coat', 'jacket', 'raincoat', 'scarf', 'gloves', 'beanie', 'boots'],
            tooBad: "It's sunny and very hot! 🥵", feel: '🥵' },
  forest: { name: 'Rainy Forest',     season: 'spring',  icon: '🌧️', temp: 15, weather: "It's rainy and cloudy. It's stormy, too!",
            need: ['raincoat', 'umbrella', 'boots'], forbid: ['sandals', 'sunglasses'],
            tooBad: "It's raining! You're wet! 💦", feel: '💦' },
  snow:   { name: 'Snowy Mountains',  season: 'winter',  icon: '❄️', temp: -2, weather: "It's snowy and very cold.",
            need: ['coat', 'scarf', 'gloves', 'beanie', 'boots'], forbid: ['tshirt', 'sandals', 'sunglasses'],
            tooBad: "It's snowing! You're very cold! 🥶", feel: '🥶' },
  hills:  { name: 'Windy Hills',      season: 'autumn',  icon: '💨', temp: 12, weather: "It's windy and cloudy. It's cool.",
            need: ['jacket'], forbid: ['umbrella', 'tshirt', 'sandals'],
            tooBad: "It's windy and cool! Brrr! 💨", feel: '💨' },
};

/* Dialogues and lessons. Each zone: reading, language in use, vocabulary (collect + use in context), crystal challenge. */
export const STORY = {
  intro: [
    "Hello! I'm Professor Sky, the weather reporter of Sunnyvale. ☀️",
    "Oh no! Last night a big storm broke my Weather Machine. The four Season Crystals flew away! 💎",
    "Without them, the weather is crazy! Can you help me? Find the Summer, Spring, Autumn and Winter crystals.",
    "The Sunny Desert is in the north. The Rainy Forest is in the west. The Windy Hills are in the east. The Snowy Mountains are in the south.",
    "But first, visit Mia's Clothes Shop. You need the right clothes for every kind of weather!",
  ],
  introEs: 'El Profesor Sky necesita tu ayuda: una tormenta rompió su Máquina del Clima y los 4 cristales de las estaciones se perdieron. Visita la tienda de Mia y luego explora las 4 zonas del mapa.',
  allCrystals: [
    "You found the four Season Crystals! Thank you, Weather Hero! 🎉",
    "Now, one last thing: let's read today's weather report for Chile together.",
  ],
  ending: [
    "The Weather Machine is working again! Look at the sky... a rainbow! 🌈",
    "Sunny days, rainy days, windy days and snowy days... now you know what to wear and what to say!",
    "You are a real Weather Hero. See you soon!",
  ],
};

export const LESSONS = {
  /* ---------- TOWN ---------- */
  warmup: {
    title: 'Weather Words', npc: 'sky', kind: 'Vocabulary',
    ex: [
      { t: 'match', pairs: [['sunny', '☀️'], ['rainy', '🌧️'], ['snowy', '❄️'], ['windy', '💨'], ['cloudy', '☁️'], ['stormy', '⛈️']] },
      { t: 'mcq', pic: '🌧️', q: "What's the weather like?", o: ["It's rainy.", "It's sunny.", "It's snowy.", "It's hot."], why: 'The picture shows rain: rainy.' },
      { t: 'mcq', pic: '☁️', q: "What's the weather like?", o: ["It's cloudy.", "It's windy.", "It's stormy.", "It's snowy."], why: 'Clouds → cloudy.' },
      { t: 'mcq', pic: '🌡️ 35°', q: 'Is it hot or cold?', o: ["It's hot.", "It's cold.", "It's snowy.", "It's cool."], why: '35 degrees is very hot!' },
      { t: 'listen', say: "What's the weather like today? It's windy.", q: 'What did you hear?', o: ["It's windy.", "It's rainy.", "It's sunny.", "It's snowy."], why: 'Listen again: "It\'s windy".' },
    ],
  },
  clothes: {
    title: 'Clothes for the Weather', npc: 'mia', kind: 'Vocabulary',
    ex: [
      { t: 'match', pairs: [['coat', '🧥'], ['scarf', '🧣'], ['gloves', '🧤'], ['boots', '🥾'], ['umbrella', '☂️'], ['sunglasses', '🕶️'], ['cap', '🧢'], ['T-shirt', '👕']] },
      { t: 'mcq', q: "It's snowy. What do you wear?", o: ['A coat and gloves.', 'A T-shirt and sandals.', 'Sunglasses and a cap.', 'Shorts.'], why: 'When it is snowy and cold, we wear warm clothes.' },
      { t: 'mcq', q: "It's rainy. What do you take?", o: ['An umbrella.', 'Sunglasses.', 'Sandals.', 'A kite.'], why: 'An umbrella keeps you dry.' },
      { t: 'mcq', q: "It's sunny and hot. What do you wear?", o: ['A cap and sunglasses.', 'A scarf and gloves.', 'A wool hat.', 'Boots and a coat.'], why: 'A cap and sunglasses protect you from the sun.' },
    ],
  },

  /* ---------- SUNNY DESERT (summer) ---------- */
  desertRead: {
    title: 'A Postcard from the Desert', npc: 'carlos', kind: 'Reading', zone: 'desert',
    ex: [{
      t: 'read', title: '📮 A Postcard from the Desert',
      text: [
        'Dear Grandma,',
        "Greetings from the Sunny Desert! The weather is very hot today. It's 35 degrees! There are no clouds in the sky, and it never rains here.",
        "I'm wearing my cap, my sunglasses and a T-shirt. I drink a lot of water.",
        'At night it is cold, so I wear a sweater in my tent. Tomorrow I\'m going to visit the big cactus forest.',
        'Love, Carlos',
      ],
      qs: [
        { q: "What's the weather like in the desert?", o: ["It's sunny and hot.", "It's rainy and cold.", "It's snowy.", "It's windy and cloudy."], why: '"The weather is very hot... no clouds in the sky."' },
        { q: 'What is the temperature?', o: ['35 degrees', '25 degrees', '13 degrees', '53 degrees'], why: '"It\'s 35 degrees!"' },
        { q: 'Does it rain in the desert?', o: ['No, it never rains there.', 'Yes, every day.', 'Yes, in the afternoon.', 'Yes, in winter.'], why: '"...it never rains here."' },
        { q: 'What does Carlos wear at night?', o: ['A sweater.', 'A T-shirt.', 'A raincoat.', 'Sandals.'], why: '"At night it is cold, so I wear a sweater."' },
        { q: 'Why does Carlos wear a sweater at night?', o: ["Because it's cold at night.", "Because it's raining.", "Because it's windy.", 'Because he is at school.'], why: '"At night it is cold, so..." — SO shows the reason.' },
      ],
    }],
  },
  desertLang: {
    title: "Sofía's Lemonade Stand", npc: 'sofia', kind: 'Language in use', zone: 'desert',
    ex: [
      { t: 'mcq', q: "What ___ the weather like today?", o: ['is', 'are', 'am', 'do'], why: "We say: What IS the weather like? → What's the weather like?" },
      { t: 'order', s: "It's sunny and hot today.", es: 'Hoy está soleado y caluroso.' },
      { t: 'mcq', q: 'In summer, ___ very hot in the desert.', o: ["it's", 'it', 'is it', 'its'], why: "it's = it is. In summer, it's hot." },
      { t: 'gap', text: "It's very ___ today. I'm ___ my sunglasses and my ___.", a: ['hot', 'wearing', 'cap'], extra: ['cold', 'wear', 'scarf'] },
      { t: 'mcq', q: "When it's hot, I ___ ice cream.", o: ['eat', 'eats', 'eating', 'to eat'], why: 'I eat / you eat / we eat. (He eats.)' },
      { t: 'order', s: "What's the weather like in summer?", es: '¿Cómo es el clima en verano?' },
    ],
  },
  desertVocab: {
    title: 'Words in the Sand', npc: 'tomas', kind: 'Vocabulary in context', zone: 'desert',
    collect: { model: 'star', words: [
      ['sunny', '☀️', "It's sunny. The sun is shining!"],
      ['hot', '🥵', "It's very hot. Drink water!"],
      ['summer', '🏖️', 'Summer is the hottest season.'],
      ['sunglasses', '🕶️', 'Wear your sunglasses. The sun is bright!'],
      ['thermometer', '🌡️', 'The thermometer says 35 degrees.'],
    ] },
    ex: [
      { t: 'gap', text: "Summer is my favorite season. It's ___ and ___. I put on my ___ because the sun is very bright. The ___ says 35 degrees!", a: ['sunny', 'hot', 'sunglasses', 'thermometer'], extra: ['snowy', 'gloves'] },
      { t: 'mcq', q: 'The sun is very bright. I need my ___.', o: ['sunglasses', 'gloves', 'umbrella', 'scarf'], why: 'Sunglasses protect your eyes from the sun.' },
      { t: 'mcq', q: 'December, January and February are ___ in Chile.', o: ['summer', 'winter', 'autumn', 'spring'], why: 'In Chile, summer is in December, January and February.' },
    ],
  },
  desertCrystal: {
    title: 'Summer Crystal Challenge', kind: 'Crystal', zone: 'desert', crystal: 'summer',
    ex: [
      { t: 'listen', say: "It's sunny and hot. It's thirty-five degrees.", q: 'What is the temperature?', o: ['35 degrees', '25 degrees', '15 degrees', '5 degrees'], why: 'Thirty-five = 35.' },
      { t: 'mcq', pic: '☀️', q: 'Is it sunny?', o: ['Yes, it is.', "No, it isn't.", 'Yes, it does.', 'Yes, I am.'], why: 'Is it...? → Yes, it is. / No, it isn\'t.' },
      { t: 'mcq', q: "It's hot. Don't wear your ___!", o: ['coat', 'T-shirt', 'cap', 'sunglasses'], why: 'A coat is for cold weather.' },
      { t: 'order', s: 'I wear a cap when it is sunny.', es: 'Uso gorro cuando está soleado.' },
    ],
  },

  /* ---------- RAINY FOREST (spring) ---------- */
  forestRead: {
    title: "The Ranger's Diary", npc: 'lucas', kind: 'Reading', zone: 'forest',
    ex: [{
      t: 'read', title: '📔 A Rainy Day in the Forest',
      text: [
        'Monday, 10th September',
        "Today it's raining in the forest. It's cloudy and cool, about 15 degrees.",
        'In the afternoon there was a storm with thunder and lightning! The animals were in their homes.',
        "I'm wearing my raincoat and my boots, and I have a big umbrella. I love the rain because the plants and flowers grow.",
        'After the rain, I saw a beautiful rainbow. Spring is my favorite season!',
      ],
      qs: [
        { q: "What's the weather like in the forest?", o: ["It's rainy and cloudy.", "It's sunny and hot.", "It's snowy.", "It's foggy and hot."], why: '"It\'s raining... It\'s cloudy and cool."' },
        { q: 'What happened in the afternoon?', o: ['There was a storm.', 'It snowed.', 'It was sunny.', 'There was a party.'], why: '"In the afternoon there was a storm."' },
        { q: 'What is Lucas wearing?', o: ['A raincoat and boots.', 'A coat and a scarf.', 'Sandals and shorts.', 'A cap and sunglasses.'], why: '"I\'m wearing my raincoat and my boots."' },
        { q: 'Why does Lucas love the rain?', o: ['Because the plants and flowers grow.', 'Because he can swim.', "Because it's hot.", "Because there's no school."], why: '"...because the plants and flowers grow."' },
        { q: 'What did he see after the rain?', o: ['A rainbow.', 'A snowman.', 'A cactus.', 'The moon.'], why: '"After the rain, I saw a beautiful rainbow."' },
        { q: "What is Lucas's favorite season?", o: ['Spring', 'Summer', 'Autumn', 'Winter'], why: '"Spring is my favorite season!"' },
      ],
    }],
  },
  forestLang: {
    title: "Rosa's Duck Pond", npc: 'rosa', kind: 'Language in use', zone: 'forest',
    ex: [
      { t: 'mcq', pic: '🌧️', q: 'Look! It ___.', o: ['is raining', 'rain', 'raining', 'are raining'], why: 'Right now → is + -ing: It is raining.' },
      { t: 'order', s: "It's raining in the forest.", es: 'Está lloviendo en el bosque.' },
      { t: 'mcq', q: 'Is it raining? — Yes, it ___.', o: ['is', 'does', "it's", 'are'], why: 'Short answer: Yes, it is.' },
      { t: 'gap', text: "Look outside! It's ___. Put ___ your raincoat and take your ___.", a: ['raining', 'on', 'umbrella'], extra: ['in', 'sunglasses', 'sunny'] },
      { t: 'listen', say: "It's raining and cloudy. Take your umbrella!", q: 'What do you need?', o: ['An umbrella.', 'Sunglasses.', 'Sandals.', 'A cap.'], why: '"Take your umbrella!"' },
      { t: 'mcq', q: "It's ___ now. I can see lightning! ⚡", o: ['stormy', 'sunny', 'snowy', 'hot'], why: 'Thunder and lightning → stormy.' },
    ],
  },
  forestVocab: {
    title: 'Lost Raindrops', npc: 'pablo', kind: 'Vocabulary in context', zone: 'forest',
    collect: { model: 'jewel', words: [
      ['rainy', '🌧️', "It's rainy today."],
      ['cloud', '☁️', 'A big gray cloud is in the sky.'],
      ['umbrella', '☂️', 'Take your umbrella. It\'s raining!'],
      ['raincoat', '🦺', 'My yellow raincoat keeps me dry.'],
      ['rainbow', '🌈', 'After the rain, there is a rainbow.'],
    ] },
    ex: [
      { t: 'gap', text: 'In spring, it is often ___ in the forest. Big gray ___s cover the sky. I wear my yellow ___ and I take my ___. After the rain, I can see a ___!', a: ['rainy', 'cloud', 'raincoat', 'umbrella', 'rainbow'], extra: ['sunny', 'kite'] },
      { t: 'mcq', q: 'September, October and November are ___ in Chile.', o: ['spring', 'summer', 'autumn', 'winter'], why: 'In Chile, spring is in September, October and November.' },
      { t: 'mcq', q: 'My feet are wet! I need my ___.', o: ['boots', 'cap', 'scarf', 'sunglasses'], why: 'Boots keep your feet dry.' },
    ],
  },
  forestCrystal: {
    title: 'Spring Crystal Challenge', kind: 'Crystal', zone: 'forest', crystal: 'spring',
    ex: [
      { t: 'listen', say: "It's cloudy and it's raining. It's fifteen degrees.", q: "What's the weather like?", o: ["It's cloudy and rainy.", "It's sunny and hot.", "It's snowy and cold.", "It's windy."], why: 'Cloudy + raining.' },
      { t: 'mcq', q: 'Is it sunny in the forest today?', o: ["No, it isn't. It's raining.", 'Yes, it is.', "No, it's snowing.", 'Yes, it does.'], why: 'In the Rainy Forest it is raining.' },
      { t: 'order', s: 'Take your umbrella when it is rainy.', es: 'Lleva tu paraguas cuando llueve.' },
      { t: 'mcq', q: 'After the rain, I can see a ___. 🌈', o: ['rainbow', 'snowman', 'kite', 'cactus'], why: 'Rain + sun = rainbow!' },
    ],
  },

  /* ---------- SNOWY MOUNTAINS (winter) ---------- */
  snowRead: {
    title: "Ana's Email", npc: 'ana', kind: 'Reading', zone: 'snow',
    ex: [{
      t: 'read', title: '📧 An Email from the Mountains',
      text: [
        'Hi Mateo!',
        "How are you? I'm in the Snowy Mountains with my family. It's winter here and it's very cold. It's minus two degrees! It's snowing and it's windy, too.",
        "I'm wearing my warm coat, my wool hat, a scarf and gloves.",
        'In the morning, we ski and we make a big snowman. In the evening, we drink hot chocolate next to the fire.',
        "What's the weather like in your city? Write soon!",
        'Ana',
      ],
      qs: [
        { q: 'Where is Ana?', o: ['In the Snowy Mountains.', 'In the desert.', 'At school.', 'At the beach.'], why: '"I\'m in the Snowy Mountains with my family."' },
        { q: 'What season is it?', o: ['Winter', 'Summer', 'Spring', 'Autumn'], why: '"It\'s winter here."' },
        { q: 'What is the temperature?', o: ['Minus two degrees.', 'Twenty degrees.', 'Two hundred degrees.', 'Twelve degrees.'], why: '"It\'s minus two degrees!" (−2°)' },
        { q: 'What does Ana do in the morning?', o: ['She skis and makes a snowman.', 'She swims.', 'She flies a kite.', 'She sleeps.'], why: '"In the morning, we ski and we make a big snowman."' },
        { q: 'What do they drink in the evening?', o: ['Hot chocolate.', 'Cold lemonade.', 'Orange juice.', 'Milk.'], why: '"...we drink hot chocolate next to the fire."' },
        { q: 'What question does Ana ask Mateo?', o: ["What's the weather like in your city?", 'How old are you?', 'What is your name?', 'Do you like pizza?'], why: 'Look at the end of the email.' },
      ],
    }],
  },
  snowLang: {
    title: "Diego's Penguins", npc: 'diego', kind: 'Language in use', zone: 'snow',
    ex: [
      { t: 'mcq', q: 'Is it snowing? — Yes, it ___.', o: ['is', "isn't", 'does', 'snowing'], why: 'Yes, it is. / No, it isn\'t.' },
      { t: 'mcq', pic: '☀️', q: 'Is it snowy today?', o: ["No, it isn't. It's sunny.", 'Yes, it is.', 'Yes, it snowy.', 'No, it is.'], why: 'The picture shows the sun, so: No, it isn\'t.' },
      { t: 'order', s: 'Is it cold in winter?', es: '¿Hace frío en invierno?' },
      { t: 'mcq', q: "It's cold. ___ on your coat!", o: ['Put', 'Puts', 'Putting', 'To put'], why: 'Instructions start with the verb: Put on your coat!' },
      { t: 'mcq', q: '___ forget your gloves!', o: ["Don't", "Doesn't", 'Not', 'No'], why: "Negative instruction: Don't + verb." },
      { t: 'gap', text: 'Is it cold today? Yes, it ___. Put on your ___ and your ___.', a: ['is', 'coat', 'gloves'], extra: ["isn't", 'shorts', 'sandals'] },
    ],
  },
  snowVocab: {
    title: 'Snowflake Hunt', npc: 'nico', kind: 'Vocabulary in context', zone: 'snow',
    collect: { model: 'snowflake', words: [
      ['snowy', '❄️', "It's snowy. Everything is white!"],
      ['cold', '🥶', "It's very cold today."],
      ['coat', '🧥', 'Put on your warm coat.'],
      ['scarf', '🧣', 'A scarf keeps your neck warm.'],
      ['gloves', '🧤', 'Wear gloves on your hands.'],
    ] },
    ex: [
      { t: 'gap', text: "Winter in the mountains is very ___. It's ___ and everything is white. I put on my ___, a ___ around my neck and ___ on my hands.", a: ['cold', 'snowy', 'coat', 'scarf', 'gloves'], extra: ['hot', 'sandals'] },
      { t: 'mcq', q: 'June, July and August are ___ in Chile.', o: ['winter', 'summer', 'spring', 'autumn'], why: 'In Chile, winter is in June, July and August.' },
      { t: 'mcq', q: 'My hands are cold! I need my ___.', o: ['gloves', 'sunglasses', 'cap', 'sandals'], why: 'Gloves are for your hands.' },
    ],
  },
  snowCrystal: {
    title: 'Winter Crystal Challenge', kind: 'Crystal', zone: 'snow', crystal: 'winter',
    ex: [
      { t: 'listen', say: "It's snowing in the mountains. It's minus two degrees. Put on your coat and your gloves!", q: 'What do you need?', o: ['A coat and gloves.', 'A cap and sunglasses.', 'An umbrella.', 'Sandals.'], why: '"Put on your coat and your gloves!"' },
      { t: 'mcq', q: 'In winter, it ___ cold.', o: ['is', 'are', 'am', 'be'], why: 'it is → it\'s.' },
      { t: 'order', s: "It's snowing. Put on your scarf!", es: 'Está nevando. ¡Ponte la bufanda!' },
      { t: 'mcq', q: "Is it hot in the Snowy Mountains?", o: ["No, it isn't. It's cold.", 'Yes, it is.', "No, it's sunny.", 'Yes, it hot.'], why: 'It is −2 degrees: cold!' },
    ],
  },

  /* ---------- WINDY HILLS (autumn) ---------- */
  hillsRead: {
    title: "Leo's Kite Day", npc: 'leo', kind: 'Reading', zone: 'hills',
    ex: [{
      t: 'read', title: "🪁 Leo's Kite Day",
      text: [
        'My name is Leo and I live in the Windy Hills. Today is a cloudy and windy day. It\'s cool, about 12 degrees.',
        "It's perfect weather for flying a kite!",
        'In Chile, autumn is in March, April and May. The leaves on the trees are orange, yellow and brown, and the wind blows them everywhere.',
        "I'm wearing my jacket and a sweater. I can't use my umbrella here because the wind is very strong.",
        'Oh no! The wind took my four kites! Can you find them?',
      ],
      qs: [
        { q: "What's the weather like today?", o: ["It's cloudy and windy.", "It's sunny and hot.", "It's snowy and cold.", "It's rainy and stormy."], why: '"Today is a cloudy and windy day."' },
        { q: 'Why is it a perfect day?', o: ['For flying a kite.', 'For swimming.', 'For skiing.', 'For sleeping.'], why: '"It\'s perfect weather for flying a kite!"' },
        { q: 'When is autumn in Chile?', o: ['March, April and May.', 'June, July and August.', 'September, October and November.', 'December, January and February.'], why: '"In Chile, autumn is in March, April and May."' },
        { q: 'What color are the leaves?', o: ['Orange, yellow and brown.', 'Green and blue.', 'White.', 'Pink and purple.'], why: '"The leaves... are orange, yellow and brown."' },
        { q: "Why can't Leo use his umbrella?", o: ['Because the wind is very strong.', "Because it's sunny.", "Because he hasn't got an umbrella.", "Because it's snowing."], why: '"...because the wind is very strong."' },
        { q: "What is Leo's problem?", o: ['The wind took his kites.', 'He lost his jacket.', 'He is hungry.', 'It is raining.'], why: '"The wind took my four kites!"' },
      ],
    }],
  },
  hillsLang: {
    title: "Grandpa Joe's Farm", npc: 'joe', kind: 'Language in use', zone: 'hills',
    ex: [
      { t: 'mcq', q: '___ autumn, the leaves fall from the trees.', o: ['In', 'On', 'At', 'The'], why: 'Seasons and months use IN: in autumn, in May.' },
      { t: 'match', pairs: [['spring', '🌸'], ['summer', '🏖️'], ['autumn', '🍂'], ['winter', '⛄']] },
      { t: 'order', s: "When it's windy, I fly my kite.", es: 'Cuando hay viento, elevo mi volantín.' },
      { t: 'mcq', q: "It's windy. The trees ___ moving.", o: ['are', 'is', 'am', 'be'], why: 'The trees (plural) → are.' },
      { t: 'listen', say: "It's cloudy and windy today. It's twelve degrees.", q: 'What is the temperature?', o: ['12 degrees', '20 degrees', '2 degrees', '21 degrees'], why: 'Twelve = 12.' },
      { t: 'mcq', q: "When it's cold, I ___ a jacket.", o: ['wear', 'wears', 'wearing', 'am wear'], why: 'I wear / you wear / we wear.' },
    ],
  },
  hillsVocab: {
    title: "Leo's Lost Kites", npc: 'leo', kind: 'Vocabulary in context', zone: 'hills', after: 'hillsRead',
    collect: { model: 'kite', words: [
      ['windy', '💨', "It's windy. My hair is moving!"],
      ['kite', '🪁', 'I fly my kite on windy days.'],
      ['leaves', '🍂', 'In autumn, the leaves fall.'],
      ['jacket', '🧥', 'Wear a jacket. It\'s cool today.'],
    ] },
    ex: [
      { t: 'gap', text: "Autumn is here! It's ___ today, so I fly my ___. The orange ___ fall from the trees. I'm wearing a warm ___.", a: ['windy', 'kite', 'leaves', 'jacket'], extra: ['sunny', 'sandals'] },
      { t: 'mcq', q: "It's windy! Don't use your ___!", o: ['umbrella', 'jacket', 'kite', 'boots'], why: 'The wind can break your umbrella.' },
      { t: 'mcq', q: "It's not hot and it's not cold. It's ___.", o: ['cool', 'freezing', 'hot', 'snowy'], why: 'Cool = a little cold (12 degrees).' },
    ],
  },
  hillsCrystal: {
    title: 'Autumn Crystal Challenge', kind: 'Crystal', zone: 'hills', crystal: 'autumn',
    ex: [
      { t: 'listen', say: "It's windy and cloudy. Wear your jacket and fly your kite!", q: 'What can you do?', o: ['Fly a kite.', 'Make a snowman.', 'Swim in the sea.', 'Eat ice cream.'], why: '"...fly your kite!"' },
      { t: 'mcq', q: "What's the weather like in autumn?", o: ["It's windy and cool.", "It's very hot.", "It's snowy.", "It's always sunny."], why: 'In the Windy Hills, autumn is windy and cool.' },
      { t: 'order', s: 'The leaves are orange in autumn.', es: 'Las hojas son naranjas en otoño.' },
      { t: 'mcq', q: 'March, April and May are ___ in Chile.', o: ['autumn', 'summer', 'spring', 'winter'], why: 'In Chile, autumn is in March, April and May.' },
    ],
  },

  /* ---------- FINAL ---------- */
  final: {
    title: 'The Weather Report for Chile', npc: 'sky', kind: 'Final', final: true,
    ex: [
      {
        t: 'read', title: '📺 Weather Report — Chile', listen: true,
        text: [
          'Good morning! Here is the weather for Chile today.',
          "In Arica, in the north, it's sunny and hot: 28 degrees. Don't forget your sunglasses!",
          "In Santiago, it's cloudy and cool: 16 degrees.",
          "In Puerto Montt, it's raining all day. Take your umbrella!",
          "In Punta Arenas, in the south, it's snowing and it's very cold: minus one degree. Put on your coat!",
          'Have a nice day!',
        ],
        qs: [
          { q: 'Where is it sunny and hot?', o: ['In Arica.', 'In Santiago.', 'In Puerto Montt.', 'In Punta Arenas.'], why: '"In Arica... it\'s sunny and hot."' },
          { q: "What's the weather like in Puerto Montt?", o: ["It's raining.", "It's snowing.", "It's sunny.", "It's windy."], why: '"In Puerto Montt, it\'s raining all day."' },
          { q: 'Which city is the coldest?', o: ['Punta Arenas', 'Arica', 'Santiago', 'Puerto Montt'], why: 'Punta Arenas: minus one degree.' },
          { q: 'What is the temperature in Santiago?', o: ['16 degrees', '28 degrees', '6 degrees', '−1 degree'], why: '"In Santiago... 16 degrees."' },
          { q: 'What do you need in Punta Arenas?', o: ['A coat.', 'Sunglasses.', 'Sandals.', 'A T-shirt.'], why: '"Put on your coat!"' },
        ],
      },
      { t: 'order', s: "What's the weather like in your city?", es: '¿Cómo está el clima en tu ciudad?' },
      { t: 'gap', text: "Today in my city it's ___. I'm wearing my ___. My favorite ___ is summer.", a: ['sunny', 'cap', 'season'], extra: ['snowing', 'month'] },
    ],
  },
};

/* NPCs: who they are, where they stand, which lessons they give (in order). */
export const NPCS = {
  sky:    { name: 'Professor Sky', skin: 'r', zone: 'town',   pos: [6, -10],    lessons: ['warmup', 'final'], role: 'story' },
  mia:    { name: 'Mia',           skin: 'c', zone: 'town',   pos: [-19, 9],    lessons: ['clothes'], role: 'shop' },
  carlos: { name: 'Carlos',        skin: 'e', zone: 'desert', pos: [8, -112],   lessons: ['desertRead'] },
  sofia:  { name: 'Sofía',         skin: 'f', zone: 'desert', pos: [-22, -135], lessons: ['desertLang'] },
  tomas:  { name: 'Tomás',         skin: 'h', zone: 'desert', pos: [24, -150],  lessons: ['desertVocab'] },
  lucas:  { name: 'Lucas',         skin: 'i', zone: 'forest', pos: [-110, 8],   lessons: ['forestRead'] },
  rosa:   { name: 'Rosa',          skin: 'j', zone: 'forest', pos: [-136, -22], lessons: ['forestLang'] },
  pablo:  { name: 'Pablo',         skin: 'k', zone: 'forest', pos: [-150, 26],  lessons: ['forestVocab'] },
  ana:    { name: 'Ana',           skin: 'l', zone: 'snow',   pos: [-8, 112],   lessons: ['snowRead'] },
  diego:  { name: 'Diego',         skin: 'm', zone: 'snow',   pos: [14, 134],   lessons: ['snowLang'] },
  nico:   { name: 'Nico',          skin: 'n', zone: 'snow',   pos: [-14, 152],  lessons: ['snowVocab'] },
  leo:    { name: 'Leo',           skin: 'o', zone: 'hills',  pos: [110, -8],   lessons: ['hillsRead', 'hillsVocab'] },
  joe:    { name: 'Grandpa Joe',   skin: 'p', zone: 'hills',  pos: [136, 24],   lessons: ['hillsLang'] },
};
export const NPC_HELLO = {
  carlos: "Hi! I'm Carlos, an explorer. It's so hot here! I'm writing a postcard to my grandma. Can you read it?",
  sofia: "Hello! Would you like some lemonade? It's perfect when it's hot! Let's practice how to talk about the weather.",
  tomas: "Hi! The wind took my word stars. They're in the desert sand. Can you find 5 stars? ⭐",
  lucas: "Hello! I'm Lucas, the park ranger. Here's my diary about today's rainy day.",
  rosa: "Hi! My ducks love the rain! 🦆 Let's talk about the weather right now.",
  pablo: "Oh no! My magic raindrops are lost in the forest. Can you find 5 blue raindrops? 💧",
  ana: "Hi! I'm Ana. Brrr, it's cold! I'm writing an email to my friend Mateo. Can you read it?",
  diego: "Hello! I take care of the penguins. 🐧 They love the snow! Let's practice questions about the weather.",
  nico: "Hi! I lost my word snowflakes. Can you find 5 snowflakes in the mountains? ❄️",
  leo: "Hi! I'm Leo. I love windy days! Read about my day.",
  joe: "Howdy! I'm Grandpa Joe. I know all the seasons. Let's learn about them!",
  mia: "Welcome to Mia's Clothes Shop! Choose the right clothes for every kind of weather. 👕🧥🧣",
  sky: "Hello, Weather Hero!",
};

/* Extra quick questions for the online Weather Orbs. */
export const QUICK = [
  { t: 'mcq', pic: '☀️', q: "What's the weather like?", o: ["It's sunny.", "It's rainy.", "It's snowy.", "It's stormy."] },
  { t: 'mcq', pic: '❄️', q: "What's the weather like?", o: ["It's snowy.", "It's sunny.", "It's hot.", "It's windy."] },
  { t: 'mcq', pic: '💨', q: "What's the weather like?", o: ["It's windy.", "It's snowy.", "It's hot.", "It's rainy."] },
  { t: 'mcq', pic: '⛈️', q: "What's the weather like?", o: ["It's stormy.", "It's sunny.", "It's snowy.", "It's hot."] },
  { t: 'mcq', pic: '🌫️', q: "What's the weather like?", o: ["It's foggy.", "It's sunny.", "It's hot.", "It's snowy."] },
  { t: 'mcq', pic: '🌡️ −5°', q: 'Is it hot?', o: ["No, it isn't. It's cold.", 'Yes, it is.', "No, it's hot.", 'Yes, it cold.'] },
  { t: 'mcq', pic: '🧣', q: 'What is it?', o: ['A scarf.', 'A cap.', 'A boot.', 'A glove.'] },
  { t: 'mcq', pic: '🧤', q: 'What are they?', o: ['Gloves.', 'Boots.', 'Sunglasses.', 'Scarves.'] },
  { t: 'mcq', pic: '🕶️', q: 'What are they?', o: ['Sunglasses.', 'Gloves.', 'Boots.', 'Umbrellas.'] },
  { t: 'mcq', pic: '☂️', q: 'What is it?', o: ['An umbrella.', 'A coat.', 'A kite.', 'A cap.'] },
  { t: 'mcq', q: "It's cold. Put on your ___.", o: ['coat', 'sandals', 'sunglasses', 'T-shirt'] },
  { t: 'mcq', q: "It's raining. Take your ___.", o: ['umbrella', 'sunglasses', 'kite', 'sandals'] },
  { t: 'mcq', q: 'What ___ the weather like today?', o: ['is', 'are', 'am', 'be'] },
  { t: 'mcq', q: 'Is it windy? — No, it ___.', o: ["isn't", 'is', "doesn't", "aren't"] },
  { t: 'mcq', q: 'Look! It ___ now.', o: ['is snowing', 'snow', 'snowing', 'are snowing'] },
  { t: 'mcq', q: '___ winter, it is cold.', o: ['In', 'On', 'At', 'For'] },
  { t: 'mcq', q: 'In Chile, summer is in ___.', o: ['December, January and February', 'June, July and August', 'March, April and May', 'September, October and November'] },
  { t: 'mcq', q: 'In Chile, winter is in ___.', o: ['June, July and August', 'December, January and February', 'March, April and May', 'September, October and November'] },
  { t: 'mcq', q: "It's hot. I'm wearing a ___.", o: ['T-shirt', 'coat', 'scarf', 'wool hat'] },
  { t: 'mcq', q: "When it's windy, I fly my ___.", o: ['kite', 'umbrella', 'snowman', 'sunglasses'] },
  { t: 'mcq', q: 'Which season has snow?', o: ['Winter', 'Summer', 'Spring', 'Autumn'] },
  { t: 'mcq', q: "It's twelve degrees. It's ___.", o: ['cool', 'very hot', 'freezing', 'stormy'] },
  { t: 'mcq', q: "___ forget your umbrella!", o: ["Don't", 'Not', 'No', "Doesn't"] },
  { t: 'mcq', q: 'There is thunder and lightning. It is ___.', o: ['stormy', 'sunny', 'snowy', 'foggy'] },
  { t: 'listen', say: "It's snowing.", q: 'What did you hear?', o: ["It's snowing.", "It's sunny.", "It's raining.", "It's windy."] },
  { t: 'listen', say: "It's sunny and hot.", q: 'What did you hear?', o: ["It's sunny and hot.", "It's rainy and cold.", "It's windy and cool.", "It's snowy."] },
  { t: 'listen', say: "Put on your scarf.", q: 'What did you hear?', o: ['Put on your scarf.', 'Put on your cap.', 'Take your umbrella.', 'Wear your boots.'] },
  { t: 'listen', say: "It's twenty degrees.", q: 'What is the temperature?', o: ['20°', '12°', '2°', '30°'] },
  { t: 'order', s: "What's the weather like today?" },
  { t: 'order', s: "It's cold and snowy." },
  { t: 'order', s: 'Take your umbrella, please.' },
];

/* Online "Weather Calls": everybody runs to the right place. */
export const CALLS = [
  { zone: 'snow',   say: "It's snowing and it's very cold! Run to the place where it's snowing!" },
  { zone: 'desert', say: "It's sunny and hot! Run to the place where you need sunglasses!" },
  { zone: 'forest', say: "It's raining! Run to the place where you need an umbrella!" },
  { zone: 'hills',  say: "It's windy! Run to the place where you can fly a kite!" },
  { zone: 'snow',   say: "Run to the place where you can make a snowman!" },
  { zone: 'desert', say: "Run to the place where it's thirty-five degrees!" },
  { zone: 'forest', say: "Run to the place where you can see a rainbow after the rain!" },
  { zone: 'hills',  say: "Run to the place where the leaves are orange and it's autumn!" },
];

export const PHRASES = [
  "What's the weather like?", "It's sunny here! ☀️", "It's raining here! 🌧️", "It's snowing here! ❄️", "It's windy here! 💨",
  "I'm cold! 🥶", "I'm hot! 🥵", "Let's go to the desert!", "Let's go to the mountains!", 'Follow me!', 'Good job!', 'Thank you!', 'Hello!', 'Bye!',
];
