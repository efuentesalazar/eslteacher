/* RUNEWARD · English content by level (Chilean English curriculum, Mineduc programs 5° básico – 3° medio).
   EDIT HERE to change questions.
   mc:     [skill, unit, question, [CORRECT, wrong, wrong, wrong], short explanation]   (the first option is the right one; options are shuffled in the game)
   listen: [what the game says aloud, question, [CORRECT, wrong, wrong, wrong]]
   order:  sentences the student rebuilds word by word
   read:   short texts (Lore Stones) with questions: [skill, question, [CORRECT, ...], explanation]
   Skills: VOC vocabulary · GRAM grammar · READ reading (explicit) · INF reading (inference) · LIST listening · ORD sentence building */

export const SKILLS = { VOC: 'Vocabulary', GRAM: 'Grammar', READ: 'Reading', INF: 'Reading between the lines', LIST: 'Listening', ORD: 'Sentence building' };

export const GRADES = [
  { id: '5b', name: '5° básico', band: 'A1' },
  { id: '6b', name: '6° básico', band: 'A1+' },
  { id: '7b', name: '7° básico', band: 'A2' },
  { id: '8b', name: '8° básico', band: 'A2+' },
  { id: '1m', name: '1° medio', band: 'B1' },
  { id: '3m', name: '3° medio', band: 'B1+' }
];

export const BANK = {
  /* ===================== 5° BÁSICO · My world · The place where I live · What we eat · What's the weather like? ===================== */
  '5b': {
    mc: [
      ['VOC', 'My world', "My mother's mother is my ___.", ['grandmother', 'aunt', 'sister', 'cousin'], "Your mother's mother is your grandmother."],
      ['VOC', 'My world', 'You use ___ to cut paper.', ['scissors', 'a ruler', 'an eraser', 'glue'], 'Scissors cut paper.'],
      ['VOC', 'My world', 'I feel ___. I want to sleep.', ['tired', 'hungry', 'angry', 'excited'], 'When you want to sleep, you are tired.'],
      ['GRAM', 'My world', 'She ___ my best friend.', ['is', 'am', 'are', 'be'], 'He / she / it → is.'],
      ['GRAM', 'My world', '___ you have a pencil?', ['Do', 'Does', 'Are', 'Is'], 'Questions with "you" and "have" use Do.'],
      ['VOC', 'My world', 'Math, Science and Art are school ___.', ['subjects', 'rooms', 'games', 'friends'], 'Math and Art are subjects.'],
      ['VOC', 'The place where I live', 'We cook in the ___.', ['kitchen', 'bedroom', 'bathroom', 'garden'], 'You cook in the kitchen.'],
      ['GRAM', 'The place where I live', 'There ___ two beds in my room.', ['are', 'is', 'am', 'be'], 'Plural (two beds) → there are.'],
      ['GRAM', 'The place where I live', 'The cat is ___ the table. It is on the floor, below the table.', ['under', 'on', 'next to', 'in'], 'Below = under.'],
      ['VOC', 'The place where I live', 'You sleep in the ___.', ['bedroom', 'kitchen', 'living room', 'garage'], 'Bed → bedroom.'],
      ['GRAM', 'The place where I live', 'There ___ a sofa in the living room.', ['is', 'are', 'be', 'am'], 'Singular (a sofa) → there is.'],
      ['GRAM', 'The place where I live', 'My house has ___ big garden.', ['a', 'an', 'two', 'some'], '"a" + consonant sound (big).'],
      ['VOC', 'What we eat', 'A banana is a ___.', ['fruit', 'vegetable', 'drink', 'dessert'], 'Bananas are fruit.'],
      ['GRAM', 'What we eat', "I ___ like broccoli. It's horrible!", ["don't", "doesn't", "am not", "isn't"], 'I + don\'t + verb.'],
      ['GRAM', 'What we eat', 'Can I ___ a sandwich, please?', ['have', 'has', 'having', 'to have'], 'Can I + base verb.'],
      ['VOC', 'What we eat', 'Milk, water and juice are ___.', ['drinks', 'vegetables', 'fruits', 'snacks'], 'You drink them: drinks.'],
      ['GRAM', 'What we eat', 'Is there ___ cheese in the fridge?', ['any', 'a', 'an', 'many'], 'Questions with uncountable nouns → any.'],
      ['VOC', 'What we eat', 'Carrots and lettuce are ___.', ['vegetables', 'drinks', 'desserts', 'fruits'], 'Carrots and lettuce are vegetables.'],
      ['VOC', "What's the weather like?", "It's ___. Take your umbrella!", ['rainy', 'sunny', 'hot', 'dry'], 'Umbrella → rain.'],
      ['VOC', "What's the weather like?", 'In winter it is ___.', ['cold', 'hot', 'warm', 'boiling'], 'Winter is cold.'],
      ['VOC', "What's the weather like?", "It's sunny. Wear your ___.", ['sunglasses', 'scarf', 'gloves', 'boots'], 'Sun → sunglasses.'],
      ['GRAM', "What's the weather like?", "What's the weather ___ today?", ['like', 'is', 'it', 'does'], "What's the weather like?"],
      ['GRAM', "What's the weather like?", "It's cold. You ___ wear a jacket.", ['have to', 'has to', 'having', 'to'], 'You + have to.'],
      ['VOC', "What's the weather like?", 'Spring, summer, autumn and winter are the four ___.', ['seasons', 'months', 'days', 'weeks'], 'They are seasons.']
    ],
    listen: [
      ['My sister has long brown hair.', 'What colour is her hair?', ['brown', 'black', 'blonde', 'red']],
      ['There is a lamp next to the bed.', 'Where is the lamp?', ['next to the bed', 'under the bed', 'on the sofa', 'in the kitchen']],
      ["I'd like an apple and a glass of milk, please.", 'What does the person want to drink?', ['milk', 'water', 'juice', 'tea']],
      ["Today it's windy and cold.", "What's the weather like?", ['windy and cold', 'sunny and hot', 'rainy and warm', 'snowy']],
      ['I have English on Monday and Thursday.', 'When is English?', ['Monday and Thursday', 'Tuesday and Friday', 'Monday and Wednesday', 'every day']]
    ],
    order: ['My brother is ten years old.', 'There is a big table in the kitchen.', "I like apples but I don't like grapes.", 'It is sunny and hot today.', 'She wears a hat in summer.'],
    read: [
      { title: "Tom's house", text: "Hi! I'm Tom. I live in a small house in Valparaíso with my mum, my dad and my little sister, Ana. My house has two bedrooms, a kitchen, a living room and a bathroom. My favourite room is the kitchen because my dad cooks pancakes on Sundays. In my bedroom there is a bed, a desk and a big window. I can see the sea from my window!",
        qs: [['READ', 'How many bedrooms are there in the house?', ['two', 'three', 'one', 'four'], 'The house has two bedrooms.'],
             ['READ', 'Who cooks pancakes on Sundays?', ['his dad', 'his mum', 'Tom', 'Ana'], '"my dad cooks pancakes on Sundays"'],
             ['INF', 'Where is Tom\'s house, probably?', ['near the sea', 'in the mountains', 'in a desert', 'far from the sea'], 'He can see the sea from his window.']] },
      { title: 'The weather report', text: "Good morning, Chile! Here is the weather for today. In the north it is sunny and hot, so wear a cap and drink lots of water. In Santiago it is cloudy and warm. In the south it is rainy and cold. Don't forget your raincoat and your boots! Tomorrow it will be windy in the south.",
        qs: [['READ', "What's the weather like in Santiago?", ['cloudy and warm', 'sunny and hot', 'rainy and cold', 'windy'], '"In Santiago it is cloudy and warm."'],
             ['READ', 'What do people in the south need today?', ['a raincoat and boots', 'a cap', 'sunglasses', 'a fan'], 'It is rainy and cold in the south.'],
             ['INF', 'Who is speaking?', ['a weather reporter', 'a teacher', 'a doctor', 'a chef'], 'The person gives the weather for today.']] }
    ]
  },

  /* ===================== 6° BÁSICO · Food and health · Around town · The natural world · Let's travel ===================== */
  '6b': {
    mc: [
      ['VOC', 'Food and health', 'Fruit and vegetables are ___ food.', ['healthy', 'unhealthy', 'junk', 'fast'], 'Fruit and vegetables are good for you: healthy.'],
      ['GRAM', 'Food and health', "You ___ eat so much candy. It's bad for your teeth.", ["shouldn't", 'should', 'can', 'are'], 'Advice not to do something → shouldn\'t.'],
      ['GRAM', 'Food and health', 'I ___ brush my teeth. I do it every day, three times!', ['always', 'never', 'sometimes', 'rarely'], 'Every day → always.'],
      ['VOC', 'Food and health', 'When you are sick, you go to the ___.', ['doctor', 'baker', 'mechanic', 'librarian'], 'Doctors help sick people.'],
      ['GRAM', 'Food and health', 'How ___ do you exercise? — Twice a week.', ['often', 'much', 'many', 'long'], 'How often → frequency.'],
      ['VOC', 'Around town', 'You buy bread at the ___.', ['bakery', 'bank', 'library', 'hospital'], 'Bread → bakery.'],
      ['VOC', 'Around town', 'You borrow books at the ___.', ['library', 'supermarket', 'museum', 'stadium'], 'You borrow books at a library.'],
      ['GRAM', 'Around town', 'The pharmacy is ___ the bank and the school.', ['between', 'next', 'under', 'in front'], 'Between A and B.'],
      ['GRAM', 'Around town', "You ___ swim in the river. It's dangerous!", ["can't", 'can', 'should', 'have to'], "It's not allowed → can't."],
      ['VOC', 'Around town', 'A place where you see old objects and art is a ___.', ['museum', 'park', 'mall', 'station'], 'Museums show art and history.'],
      ['VOC', 'Around town', 'Go straight on and turn ___ at the bank.', ['left', 'up', 'over', 'down'], 'Turn left / turn right.'],
      ['VOC', 'The natural world', 'A ___ lives in the ocean.', ['whale', 'camel', 'eagle', 'monkey'], 'Whales live in the ocean.'],
      ['GRAM', 'The natural world', 'An elephant is ___ than a horse.', ['bigger', 'big', 'biggest', 'more big'], 'Short adjective + -er + than.'],
      ['GRAM', 'The natural world', 'The cheetah is the ___ animal on land.', ['fastest', 'faster', 'fast', 'most fast'], 'the + adjective + -est.'],
      ['VOC', 'The natural world', 'Camels live in the ___.', ['desert', 'ocean', 'jungle', 'Antarctica'], 'Camels live in deserts.'],
      ['GRAM', 'The natural world', "Penguins ___ fly, but they can swim very well.", ["can't", 'can', "don't can", "aren't"], "Ability (no) → can't."],
      ['VOC', 'The natural world', 'The Atacama is a ___ with very little rain.', ['desert', 'forest', 'lake', 'volcano'], 'Very little rain → desert.'],
      ['VOC', "Let's travel", 'From Santiago to Easter Island, you travel by ___.', ['plane', 'bus', 'bike', 'train'], 'Easter Island is in the Pacific Ocean.'],
      ['GRAM', "Let's travel", 'Next summer we ___ visit Chiloé.', ['are going to', 'going to', 'go to', 'is going'], 'Plans → are going to + verb.'],
      ['GRAM', "Let's travel", 'Yesterday the weather ___ beautiful.', ['was', 'were', 'is', 'be'], 'Past of is → was.'],
      ['GRAM', "Let's travel", 'Last weekend we ___ a castle.', ['visited', 'visit', 'visiting', 'visits'], 'Past simple: verb + -ed.'],
      ['VOC', "Let's travel", 'You need a ___ to travel to another country.', ['passport', 'toothbrush', 'umbrella', 'pillow'], 'A passport is your travel document.'],
      ['GRAM', "Let's travel", 'We ___ at the beach last July.', ['were', 'was', 'are', 'be'], 'We → were (past).'],
      ['VOC', "Let's travel", 'A ___ is a person who travels to visit places.', ['tourist', 'driver', 'waiter', 'farmer'], 'Tourists visit places.']
    ],
    listen: [
      ['You should drink eight glasses of water every day.', 'How many glasses of water?', ['eight', 'two', 'ten', 'four']],
      ['The bank is opposite the park.', 'Where is the bank?', ['opposite the park', 'next to the park', 'behind the school', 'between the shops']],
      ['Dolphins are smarter than sharks.', 'Which animal is smarter?', ['dolphins', 'sharks', 'both are the same', 'neither']],
      ['We are going to travel by train on Friday.', 'How and when are they going to travel?', ['by train on Friday', 'by bus on Monday', 'by plane on Friday', 'by car on Sunday']],
      ['I visited my grandparents in Temuco last summer.', 'Where did the person go?', ['Temuco', 'Talca', 'Arica', 'Iquique']]
    ],
    order: ['You should eat more vegetables.', 'The cinema is next to the supermarket.', 'A giraffe is taller than a zebra.', 'We are going to visit the museum.', 'I visited my cousins last weekend.'],
    read: [
      { title: 'A trip to Torres del Paine', text: 'Last summer, Sofía and her family travelled to Torres del Paine National Park in the south of Chile. First, they flew from Santiago to Punta Arenas. Then they travelled by bus for five hours. The park was beautiful! There were huge mountains, blue lakes and many animals. Sofía saw guanacos and a condor. The weather was cold and windy, so she wore a warm jacket every day. Next year, they are going to visit the Atacama Desert.',
        qs: [['READ', 'How did they travel from Santiago to Punta Arenas?', ['by plane', 'by bus', 'by car', 'by boat'], '"they flew" = by plane.'],
             ['READ', 'Which animals did Sofía see?', ['guanacos and a condor', 'penguins and whales', 'camels and eagles', 'foxes and pumas'], '"Sofía saw guanacos and a condor."'],
             ['INF', 'How did Sofía probably feel about the trip?', ['She enjoyed it.', 'She was bored.', 'She was angry.', 'She hated the park.'], '"The park was beautiful!" shows she liked it.'],
             ['READ', 'Where are they going next year?', ['to the Atacama Desert', 'to Punta Arenas', 'to Easter Island', 'to Santiago'], '"Next year, they are going to visit the Atacama Desert."']] },
      { title: 'Healthy Leo', text: "Leo is twelve and he is very active. He always eats breakfast: usually fruit, yogurt and toast. He never drinks soda because it has a lot of sugar. After school he plays football three times a week, and on weekends he rides his bike with his dad. Leo sometimes eats chips at parties, but he knows he shouldn't eat them every day.",
        qs: [['READ', 'How often does Leo play football?', ['three times a week', 'every day', 'never', 'once a month'], '"three times a week"'],
             ['READ', "Why doesn't Leo drink soda?", ['It has a lot of sugar.', 'It is expensive.', 'He is allergic.', 'His dad says no.'], '"because it has a lot of sugar"'],
             ['INF', 'Which sentence is true about Leo?', ['He has healthy habits.', 'He never exercises.', 'He hates fruit.', 'He eats chips every day.'], 'He eats well and exercises a lot.']] }
    ]
  },

  /* ===================== 7° BÁSICO · Feelings and opinions · Healthy habits · Sports and free time · Green issues ===================== */
  '7b': {
    mc: [
      ['VOC', 'Feelings and opinions', "I'm ___ because I have a big test tomorrow.", ['nervous', 'relaxed', 'bored', 'sleepy'], 'A big test can make you nervous.'],
      ['GRAM', 'Feelings and opinions', 'The movie was very ___. I fell asleep.', ['boring', 'bored', 'bore', 'bores'], '-ing describes the thing; -ed describes how you feel.'],
      ['GRAM', 'Feelings and opinions', "I'm ___ in music. I play the guitar.", ['interested', 'interesting', 'interest', 'interests'], 'I feel → interested in.'],
      ['GRAM', 'Feelings and opinions', "I'm happy ___ I passed my exam.", ['because', 'but', 'or', 'so'], 'because = gives the reason.'],
      ['VOC', 'Feelings and opinions', 'When you are ___, you feel afraid.', ['scared', 'proud', 'excited', 'grateful'], 'Scared = afraid.'],
      ['GRAM', 'Healthy habits', 'How ___ water do you drink a day?', ['much', 'many', 'often', 'long'], 'Water is uncountable → how much.'],
      ['GRAM', 'Healthy habits', 'How ___ hours do you sleep?', ['many', 'much', 'often', 'far'], 'Hours are countable → how many.'],
      ['GRAM', 'Healthy habits', "You ___ wear a seatbelt in a car. It's the law.", ['must', "mustn't", "don't have to", "shouldn't"], 'A rule or law → must.'],
      ['GRAM', 'Healthy habits', "You ___ come to school on Saturday. There are no classes.", ["don't have to", 'must', 'have to', "mustn't"], "It's not necessary → don't have to."],
      ['VOC', 'Healthy habits', 'Running, swimming and cycling are good ___.', ['exercise', 'injuries', 'snacks', 'meals'], 'They are kinds of exercise.'],
      ['GRAM', 'Sports and free time', 'She enjoys ___ volleyball with her friends.', ['playing', 'play', 'to playing', 'plays'], 'enjoy + verb-ing.'],
      ['GRAM', 'Sports and free time', 'Yesterday I ___ a great game on TV.', ['watched', 'watch', 'watching', 'watches'], 'Yesterday → past simple.'],
      ['GRAM', 'Sports and free time', 'We ___ the match 3–1 last Sunday!', ['won', 'winned', 'win', 'wins'], 'win → won (irregular).'],
      ['VOC', 'Sports and free time', 'In ___, you hit a small ball into a hole.', ['golf', 'rugby', 'volleyball', 'boxing'], 'That is golf.'],
      ['GRAM', 'Sports and free time', "He runs very ___. He's the fastest in class.", ['quickly', 'quick', 'quicker', 'quickness'], 'Adverb (how he runs) → quickly.'],
      ['VOC', 'Sports and free time', 'My favourite free-time ___ is reading.', ['activity', 'job', 'chore', 'place'], 'Reading is an activity.'],
      ['VOC', 'Green issues', 'Put plastic bottles in the ___ bin.', ['recycling', 'kitchen', 'broken', 'empty'], 'Plastic can be recycled.'],
      ['GRAM', 'Green issues', 'If you heat ice, it ___.', ['melts', 'melt', 'melted', 'will melting'], 'Zero conditional: If + present, present.'],
      ['GRAM', 'Green issues', 'If we cut down forests, animals ___ their homes.', ['lose', 'loses', 'lost', 'losing'], 'Zero conditional: present + present.'],
      ['VOC', 'Green issues', '___ is dirty air, water or land.', ['Pollution', 'Recycling', 'Energy', 'Nature'], 'Dirty air or water = pollution.'],
      ['GRAM', 'Green issues', 'You ___ throw rubbish in the river!', ["mustn't", 'must', 'have to', "don't have to"], 'Prohibition → mustn\'t.'],
      ['VOC', 'Green issues', 'Solar panels produce clean ___.', ['energy', 'rubbish', 'smoke', 'plastic'], 'Solar panels make energy.'],
      ['GRAM', 'Green issues', 'We should ___ off the lights when we leave a room.', ['turn', 'turning', 'to turn', 'turned'], 'should + base verb.'],
      ['VOC', 'Green issues', 'Using a bag again and again is called ___.', ['reusing', 'wasting', 'burning', 'polluting'], 'Use again = reuse.']
    ],
    listen: [
      ['I felt really proud when I finished the marathon.', 'How did the speaker feel?', ['proud', 'scared', 'bored', 'angry']],
      ['You should sleep at least eight hours a night.', 'How many hours should you sleep?', ['at least eight', 'exactly six', 'ten or more', 'four']],
      ['I usually go swimming on Tuesdays and Saturdays.', 'When does the speaker go swimming?', ['Tuesdays and Saturdays', 'Mondays and Fridays', 'every day', 'only on Sundays']],
      ['If you leave the tap on, you waste water.', 'What happens if you leave the tap on?', ['you waste water', 'you save water', 'you make energy', 'you clean the river']],
      ['Last weekend I went hiking with my cousins.', 'What did the speaker do?', ['went hiking', 'played tennis', 'went swimming', 'stayed at home']]
    ],
    order: ['I feel excited about the trip.', 'You must wash your hands before eating.', 'She enjoys swimming in the summer.', 'If you recycle paper, you save trees.', 'We played football after school.'],
    read: [
      { title: 'The plastic problem', text: "Every year, millions of tonnes of plastic end up in the ocean. Fish and birds often think plastic is food, and many of them die. In Chile, a law from 2018 says that big shops must not give plastic bags to customers. Many people now take their own cloth bags when they go shopping. Students at a school in Valdivia started a beach clean-up club. Every month they collect rubbish from the beach and recycle what they can. 'If everyone does something small, we can make a big difference,' says Martina, 13.",
        qs: [['READ', 'What does the 2018 law say?', ['Big shops must not give plastic bags.', 'Shops must sell more plastic.', "People mustn't go to the beach.", 'Students must recycle at school.'], '"big shops must not give plastic bags to customers"'],
             ['READ', 'How often does the club collect rubbish?', ['every month', 'every day', 'every year', 'every week'], '"Every month they collect rubbish"'],
             ['INF', "What is Martina's main idea?", ['Small actions together can help a lot.', 'Only the government can help.', 'Plastic is not a problem.', 'Beaches are boring.'], '"If everyone does something small, we can make a big difference."']] },
      { title: "Ana's diary", text: "Saturday. Today was the final of the school basketball tournament. I was so nervous in the morning that I couldn't eat my breakfast! When the game started, our team was losing 10–20. I felt disappointed, but our coach shouted, 'Don't give up!' In the second half, we played much better. I scored the last basket and we won 35–34! Everybody was screaming. I'm exhausted now, but I'm really proud of my team.",
        qs: [['READ', "Why couldn't Ana eat her breakfast?", ['She was nervous.', 'She was sick.', 'There was no food.', 'She was late.'], '"I was so nervous... that I couldn\'t eat"'],
             ['READ', 'What was the final score?', ['35–34', '10–20', '34–35', '20–10'], '"we won 35–34"'],
             ['INF', 'What does "Don\'t give up!" mean here?', ['Keep trying.', 'Stop playing.', 'Go home.', 'Be quiet.'], 'The coach wants them to keep trying.']] }
    ]
  },

  /* ===================== 8° BÁSICO · ICT · Countries, cultures and customs · Going places · Future matters ===================== */
  '8b': {
    mc: [
      ['VOC', 'ICT', 'You need a ___ to use the internet without cables.', ['Wi-Fi connection', 'mouse', 'printer', 'speaker'], 'Wi-Fi = internet without cables.'],
      ['VOC', 'ICT', 'Never share your ___ with strangers online.', ['password', 'favourite song', 'opinion', 'homework'], 'Passwords must be secret.'],
      ['GRAM', 'ICT', 'Look! My brother ___ a video game right now.', ['is playing', 'plays', 'played', 'play'], 'Right now → present continuous.'],
      ['GRAM', 'ICT', "I ___ my phone at the moment. The battery is dead.", ['am not using', "don't use", "didn't use", 'not using'], 'At the moment → present continuous.'],
      ['VOC', 'ICT', 'You ___ an app when you copy it from the internet to your phone.', ['download', 'upload', 'delete', 'print'], 'From the internet to your phone = download.'],
      ['GRAM', 'ICT', "You ___ click on links from people you don't know.", ["shouldn't", 'should', 'must', 'have to'], 'Advice → shouldn\'t.'],
      ['GRAM', 'Countries, cultures and customs', 'Russia is the ___ country in the world.', ['largest', 'larger', 'most large', 'large'], 'Superlative: the + -est.'],
      ['GRAM', 'Countries, cultures and customs', 'For me, Spanish is ___ than English.', ['easier', 'more easy', 'easiest', 'easy'], 'easy → easier (y → ier).'],
      ['GRAM', 'Countries, cultures and customs', 'Mexico is ___ crowded than Uruguay.', ['more', 'most', 'much', 'many'], 'Long adjective → more + adjective + than.'],
      ['VOC', 'Countries, cultures and customs', 'In Japan, people usually take off their ___ before they enter a house.', ['shoes', 'hats', 'jackets', 'glasses'], 'It is a Japanese custom to take off your shoes.'],
      ['VOC', 'Countries, cultures and customs', 'A ___ is something people in a culture usually do.', ['custom', 'menu', 'passport', 'border'], 'Custom = traditional way of doing something.'],
      ['GRAM', 'Countries, cultures and customs', 'In many countries, people ___ hands when they meet.', ['shake', 'shakes', 'shaking', 'shaken'], 'People (plural) + shake.'],
      ['GRAM', 'Going places', "Look at those dark clouds! It ___ rain.", ['is going to', 'will going to', 'goes to', 'going'], 'Prediction with evidence → going to.'],
      ['GRAM', 'Going places', 'We ___ to Cusco next Friday. We have the tickets!', ['are flying', 'fly', 'flew', 'flies'], 'Fixed plans → present continuous.'],
      ['VOC', 'Going places', 'The place where you catch a plane is the ___.', ['airport', 'harbour', 'station', 'garage'], 'Planes → airport.'],
      ['VOC', 'Going places', 'A ___ ticket takes you there and back.', ['return', 'single', 'one-way', 'lost'], 'Return = there and back.'],
      ['GRAM', 'Future matters', 'I think robots ___ do many jobs in the future.', ['will', 'are', 'did', 'have'], 'Prediction → will + verb.'],
      ['GRAM', 'Future matters', 'If it rains tomorrow, we ___ at home.', ['will stay', 'stay', 'stayed', 'would stay'], 'First conditional: If + present, will + verb.'],
      ['GRAM', 'Future matters', 'If you ___ hard, you will pass the exam.', ['study', 'will study', 'studied', 'studies'], 'If + present simple.'],
      ['GRAM', 'Future matters', 'We ___ live on Mars one day, but nobody is sure.', ['might', 'must', 'should', 'have to'], 'Possibility → might.'],
      ['VOC', 'Future matters', 'A ___ car can drive by itself.', ['self-driving', 'homemade', 'second-hand', 'sports'], 'Self-driving = drives by itself.'],
      ['GRAM', 'Future matters', "Don't worry, I ___ help you with your homework.", ['will', 'am going', 'going to', 'would to'], 'Offers → will.'],
      ['VOC', 'Future matters', '___ energy comes from the sun and the wind.', ['Renewable', 'Fossil', 'Coal', 'Expensive'], 'Sun and wind never run out: renewable.'],
      ['GRAM', 'Future matters', 'Unless we protect the oceans, many species ___ disappear.', ['will', "won't", 'are', 'did'], 'Unless = if not → will disappear.']
    ],
    listen: [
      ["I'm downloading a new app to learn Japanese.", 'What is the app for?', ['learning Japanese', 'playing games', 'watching movies', 'editing photos']],
      ['Mexico City is much bigger than Buenos Aires.', 'Which city is bigger?', ['Mexico City', 'Buenos Aires', 'They are the same.', 'Santiago']],
      ['Our train leaves at half past nine.', 'When does the train leave?', ['9:30', '9:00', '10:30', '9:15']],
      ["If it's sunny on Saturday, we'll go to the beach.", 'What will they do if it is sunny?', ['go to the beach', 'stay at home', 'go to the cinema', 'visit grandma']],
      ['In the future, people will probably work from home more.', 'What will people probably do more?', ['work from home', 'travel by plane', 'sleep more', 'live on the moon']]
    ],
    order: ['She is chatting with her friends online.', 'Peru is bigger than Chile.', 'We are going to visit Cusco next year.', 'If it rains, we will stay at home.', 'I think people will live longer.'],
    read: [
      { title: 'Screen time', text: "Teenagers in Chile spend about six hours a day in front of screens. Phones are useful: we use them to study, to talk to friends and to find information. But too much screen time can be a problem. Doctors say it can cause headaches, bad sleep and less physical activity. Experts recommend some simple rules: turn off your phone one hour before bed, don't use it during meals, and take a break every 30 minutes. 'I leave my phone in another room at night,' says Diego, 14. 'Now I sleep much better.'",
        qs: [['READ', 'How many hours a day do teenagers spend in front of screens?', ['about six', 'about two', 'about ten', 'about one'], '"about six hours a day"'],
             ['READ', 'What is one problem of too much screen time?', ['bad sleep', 'better grades', 'more exercise', 'stronger eyes'], '"headaches, bad sleep and less physical activity"'],
             ['INF', 'Why does Diego sleep better now?', ["His phone doesn't disturb him at night.", 'He sleeps in another room.', 'He goes to bed later.', 'He uses his phone more.'], 'His phone is far away at night.']] },
      { title: 'A city in 2050', text: "Imagine a city in 2050. Most cars will be electric and many of them will drive themselves. Buildings will have gardens on their roofs, and solar panels will produce most of the energy. People might work from home three or four days a week, so there will be less traffic. However, some experts are worried. 'If we don't reduce pollution now, the cities of 2050 will be much hotter,' says scientist Laura Pérez. 'We need to act today.'",
        qs: [['READ', 'What will produce most of the energy?', ['solar panels', 'coal', 'cars', 'roof gardens'], '"solar panels will produce most of the energy"'],
             ['READ', 'Why will there be less traffic?', ['People might work from home.', 'Cars will be faster.', 'Roads will be closed.', 'Nobody will have a car.'], '"People might work from home... so there will be less traffic."'],
             ['INF', "What is Laura Pérez's message?", ['We must act now to avoid a bad future.', 'Cities will be perfect in 2050.', 'Robots are dangerous.', 'Pollution is not important.'], '"We need to act today."']] }
    ]
  },

  /* ===================== 1° MEDIO · Jobs · Education and lifelong learning · The arts · Traditions and festivities ===================== */
  '1m': {
    mc: [
      ['VOC', 'Jobs', 'An ___ designs buildings.', ['architect', 'plumber', 'nurse', 'lawyer'], 'Architects design buildings.'],
      ['VOC', 'Jobs', 'Someone who works without being paid is a ___.', ['volunteer', 'employee', 'boss', 'client'], 'Volunteers work for free.'],
      ['GRAM', 'Jobs', 'She ___ as a nurse for ten years, and she still loves it.', ['has worked', 'works', 'is working', 'work'], 'From the past until now → present perfect.'],
      ['GRAM', 'Jobs', 'Have you ever ___ a job interview?', ['had', 'have', 'having', 'has'], 'Have you ever + past participle.'],
      ['GRAM', 'Jobs', "I ___ my CV yet.", ["haven't finished", "didn't finish yet", "don't finish", 'am not finish'], 'yet → present perfect negative.'],
      ['VOC', 'Jobs', 'Your ___ is the money you get for your work.', ['salary', 'skill', 'career', 'uniform'], 'Salary = money for your job.'],
      ['GRAM', 'Education and lifelong learning', 'When I was a child, I ___ be afraid of the dark.', ['used to', 'use to', 'was used', 'am used'], 'Past habit or state → used to.'],
      ['GRAM', 'Education and lifelong learning', 'Did you ___ walk to school?', ['use to', 'used to', 'using', 'uses'], 'After did → use to (no d).'],
      ['GRAM', 'Education and lifelong learning', 'I study every day ___ that I can get into university.', ['so', 'because', 'but', 'although'], 'so that = purpose.'],
      ['VOC', 'Education and lifelong learning', '___ learning means learning during your whole life.', ['Lifelong', 'Homesick', 'Overtime', 'Part-time'], 'Lifelong = all your life.'],
      ['GRAM', 'Education and lifelong learning', '___ he was tired, he finished his homework.', ['Although', 'Because', 'So', 'Unless'], 'Contrast → although.'],
      ['VOC', 'The arts', 'A ___ is a person who makes statues.', ['sculptor', 'painter', 'poet', 'actor'], 'Sculptors make statues.'],
      ['GRAM', 'The arts', 'I ___ a song when the phone rang.', ['was singing', 'sang', 'am singing', 'sing'], 'Action in progress (past continuous) + interruption (past simple).'],
      ['GRAM', 'The arts', 'While they were painting the mural, it ___ to rain.', ['started', 'was starting', 'starts', 'start'], 'Short action that interrupts → past simple.'],
      ['GRAM', 'The arts', 'The Mona Lisa ___ by Leonardo da Vinci.', ['was painted', 'painted', 'is painting', 'has painted'], 'Passive: was + past participle.'],
      ['VOC', 'The arts', 'The ___ clapped at the end of the play.', ['audience', 'scenery', 'curtain', 'script'], 'The people watching = the audience.'],
      ['VOC', 'The arts', 'Violeta Parra was a famous Chilean ___ and songwriter.', ['singer', 'scientist', 'athlete', 'president'], 'She was a folk singer.'],
      ['GRAM', 'Traditions and festivities', 'You like folk music, ___?', ["don't you", 'do you', "aren't you", "isn't it"], 'Positive sentence → negative tag.'],
      ['GRAM', 'Traditions and festivities', "She isn't from Chile, ___?", ['is she', "isn't she", 'does she', "doesn't she"], 'Negative sentence → positive tag.'],
      ['GRAM', 'Traditions and festivities', 'They went to La Tirana festival, ___?', ["didn't they", 'did they', "weren't they", "don't they"], 'Past simple → didn\'t.'],
      ['VOC', 'Traditions and festivities', 'A ___ is a custom that parents pass on to their children.', ['tradition', 'rumour', 'fashion', 'schedule'], 'Tradition = passed from generation to generation.'],
      ['VOC', 'Traditions and festivities', 'During Fiestas Patrias, many Chileans dance the ___.', ['cueca', 'tango', 'salsa', 'flamenco'], 'The cueca is the national dance.'],
      ['VOC', 'Traditions and festivities', 'We Tripantu is the Mapuche ___.', ['new year', 'end of school', 'independence day', 'Halloween'], 'We Tripantu = new year (winter solstice).'],
      ['GRAM', 'Traditions and festivities', 'People ___ celebrate in the streets, but now they celebrate at home.', ['used to', 'use to', 'are used', 'using'], 'Past habit → used to.']
    ],
    listen: [
      ["I've worked as a chef for five years, and I love it.", 'What is true about the speaker?', ['a chef for five years', 'a doctor for five years', 'a chef for ten years', 'a teacher for five years']],
      ['I used to hate reading, but now I read every night.', 'What is true now?', ['The speaker reads every night.', 'The speaker still hates reading.', 'The speaker never reads.', 'The speaker reads only at school.']],
      ['The concert was cancelled because of the storm.', 'Why was the concert cancelled?', ['because of the storm', 'because the singer was sick', 'because there were no tickets', 'because it was too late']],
      ['Diwali is known as the festival of lights.', 'Diwali is the festival of…', ['lights', 'colours', 'harvest', 'music']],
      ['She was painting when the lights went out.', 'What was she doing?', ['painting', 'sleeping', 'cooking', 'dancing']]
    ],
    order: ['I have never worked in a restaurant.', 'My grandfather used to play the guitar.', 'The bridge was built in 1890.', "You are coming to the party, aren't you?", 'She was reading when I arrived.'],
    read: [
      { title: 'A career change', text: "Carla used to work in a bank in Concepción. She had a good salary, but she wasn't happy. 'I spent all day in front of a computer, and I felt that my life was passing me by,' she remembers. At the age of 38, she decided to study again. She took online courses in the evenings and on weekends, and two years later she became a tour guide in Patagonia. Now she earns less money, but she says she has never been happier. 'It's never too late to learn something new,' she says.",
        qs: [['READ', "What was Carla's first job?", ['She worked in a bank.', 'She was a tour guide.', 'She was a teacher.', 'She sold computers.'], '"Carla used to work in a bank"'],
             ['READ', 'How did she study?', ['online, in the evenings and on weekends', 'at university every morning', 'abroad, in Europe', 'with a private teacher'], '"She took online courses in the evenings and on weekends"'],
             ['INF', 'What does "my life was passing me by" suggest?', ['She felt she was missing important experiences.', 'She was very busy and successful.', 'She was ill.', 'She wanted more money.'], 'She felt her life was not going anywhere.'],
             ['INF', 'What is the main message of the text?', ['People can change and learn at any age.', 'Banks pay well.', 'Tour guides are rich.', 'Online courses are boring.'], '"It\'s never too late to learn something new."']] },
      { title: 'Holi, the festival of colours', text: "Holi is a Hindu festival that marks the arrival of spring. It is celebrated in India and Nepal, usually in March. On the night before Holi, people light bonfires to remember the victory of good over evil. The next morning, the streets fill with people who throw coloured powder and water at each other. For one day, everybody is equal: rich and poor, young and old play together. In recent years, Holi has become popular in many other countries, although some people worry that it is losing its original meaning.",
        qs: [['READ', 'When is Holi usually celebrated?', ['in March', 'in December', 'in July', 'in October'], '"usually in March"'],
             ['READ', 'What do the bonfires remember?', ['the victory of good over evil', 'the end of winter', 'a famous king', 'the harvest'], '"to remember the victory of good over evil"'],
             ['INF', 'Why do some people worry?', ['Holi might lose its original meaning as it spreads.', 'The powder is too expensive.', 'It is too cold in March.', 'Nobody celebrates it anymore.'], '"losing its original meaning"']] }
    ]
  },

  /* ===================== 3° MEDIO · Skills and achievements · Global issues · Evolution of languages · New trends ===================== */
  '3m': {
    mc: [
      ['VOC', 'My skills and achievements', 'Being able to work well with others is called ___.', ['teamwork', 'deadline', 'workload', 'overtime'], 'Working well with others = teamwork.'],
      ['VOC', 'My skills and achievements', 'A person who starts their own business is an ___.', ['entrepreneur', 'employee', 'intern', 'apprentice'], 'Entrepreneur = starts a business.'],
      ['GRAM', 'My skills and achievements', 'She ___ three awards since she started her career.', ['has won', 'won', 'wins', 'is winning'], 'since → present perfect.'],
      ['GRAM', 'My skills and achievements', "I've been learning English ___ six years.", ['for', 'since', 'during', 'ago'], 'for + a period of time.'],
      ['VOC', 'My skills and achievements', 'Her biggest ___ was winning the national science fair.', ['achievement', 'achieve', 'achievable', 'achiever'], 'Noun: achievement.'],
      ['GRAM', 'My reflections on global issues', 'If I ___ the president, I would ban single-use plastics.', ['were', 'am', 'will be', 'would be'], 'Second conditional: If I were…'],
      ['GRAM', 'My reflections on global issues', 'What would you do if you ___ a million dollars?', ['won', 'win', 'will win', 'have won'], 'Second conditional: If + past simple.'],
      ['VOC', 'My reflections on global issues', '___ is the rise in the Earth\'s temperature.', ['Global warming', 'Deforestation', 'Inflation', 'Migration'], 'Rising temperature = global warming.'],
      ['GRAM', 'My reflections on global issues', 'Millions of trees ___ every year.', ['are cut down', 'cut down', 'are cutting down', 'have cut'], 'Passive: are + past participle.'],
      ['GRAM', 'My reflections on global issues', '___ the efforts of many countries, pollution is still increasing.', ['Despite', 'Although', 'Because', 'Unless'], 'Despite + noun.'],
      ['VOC', 'My reflections on global issues', 'People who move to another country to live there are ___.', ['migrants', 'tourists', 'natives', 'guests'], 'Migrants move to live in another place.'],
      ['GRAM', 'The evolution of languages', 'He said, "I am tired." → He said that he ___ tired.', ['was', 'is', 'were', 'has been'], 'Reported speech: am → was.'],
      ['GRAM', 'The evolution of languages', 'She said, "I will call you." → She said she ___ call me.', ['would', 'will', 'can', 'should'], 'Reported speech: will → would.'],
      ['GRAM', 'The evolution of languages', '"Where do you live?" → He asked me where I ___.', ['lived', 'live', 'did live', 'do live'], 'Reported question: no do/did, tense back.'],
      ['VOC', 'The evolution of languages', "The word 'chocolate' comes from Nahuatl, an ___ language of Mexico.", ['indigenous', 'invented', 'digital', 'official'], 'Nahuatl is an indigenous language.'],
      ['VOC', 'The evolution of languages', 'A word taken from another language is a ___ word.', ['loan', 'false', 'silent', 'broken'], "Borrowed words are 'loan words'."],
      ['VOC', 'The evolution of languages', 'English is spoken ___ around the world.', ['widely', 'wide', 'width', 'widen'], 'Adverb → widely.'],
      ['VOC', 'The evolution of languages', "'LOL' and 'BRB' are examples of internet ___.", ['abbreviations', 'idioms', 'accents', 'dialects'], 'Short forms = abbreviations.'],
      ['VOC', 'New trends', 'Something that is popular only for a short time is a ___.', ['fad', 'tradition', 'classic', 'heritage'], 'A fad is a short-lived trend.'],
      ['GRAM', 'New trends', 'People ___ use landlines, but now almost everyone has a mobile.', ['used to', 'would to', 'are used to', 'use to'], 'Past habit → used to.'],
      ['VOC', 'New trends', 'When a video spreads very quickly online, it goes ___.', ['viral', 'global', 'digital', 'public'], 'go viral.'],
      ['VOC', 'New trends', '___ pressure is when friends influence what you do.', ['Peer', 'Blood', 'Air', 'Time'], 'Peer pressure.'],
      ['VOC', 'New trends', 'Fast fashion is not ___: it creates a lot of waste.', ['sustainable', 'sustain', 'sustainability', 'sustainably'], 'Adjective after "is not" → sustainable.'],
      ['GRAM', 'New trends', 'I wish I ___ more time to read.', ['had', 'have', 'will have', 'would have had'], 'wish + past simple for present wishes.']
    ],
    listen: [
      ["I've volunteered at an animal shelter since 2022.", 'Since when has the speaker volunteered?', ['since 2022', 'since 2012', 'for two years only', 'never']],
      ['If I had more free time, I would learn to play the piano.', 'What would the speaker do?', ['learn to play the piano', 'travel abroad', 'sleep more', 'learn to cook']],
      ['She told me that she was moving to Canada.', 'What did she say?', ['She was moving to Canada.', 'She had moved to Chile.', 'She was visiting Canada once.', 'She was studying French.']],
      ["Many English words, like 'avocado', come from other languages.", 'Which word is given as an example?', ['avocado', 'computer', 'house', 'water']],
      ['Trends used to last for years, but now they change every few weeks.', 'What is true about trends now?', ['They change every few weeks.', 'They last for years.', 'They never change.', 'They only change in winter.']]
    ],
    order: ['She has worked here since 2019.', 'If I were you, I would apologise.', 'He said that he was very tired.', 'The new law was approved last year.', 'Social media has changed the way we communicate.'],
    read: [
      { title: 'How English keeps changing', text: "English has borrowed words from more than 350 languages. After the Norman invasion of 1066, thousands of French words entered English, especially words related to law, food and fashion. Later, during the British Empire, English adopted words such as 'pyjamas' from Hindi and 'shampoo' from Hindustani. Today, the internet is changing the language faster than ever: new words like 'selfie' and 'unfriend' are added to dictionaries every year. Some people complain that young people are 'ruining' English, but linguists disagree. They argue that languages have always changed and that change is a sign that a language is alive.",
        qs: [['READ', 'When did many French words enter English?', ['after 1066', 'during the British Empire', 'with the internet', 'in 350 BC'], '"After the Norman invasion of 1066"'],
             ['READ', "Where does the word 'pyjamas' come from?", ['Hindi', 'French', 'Latin', 'Spanish'], "'pyjamas' from Hindi"],
             ['INF', 'What do linguists think about language change?', ['It is natural and shows a language is alive.', 'It is destroying English.', 'It should be stopped by law.', 'It only happens on the internet.'], '"change is a sign that a language is alive"'],
             ['INF', "What is the writer's main purpose?", ['to inform about how English has changed', 'to sell a dictionary', 'to criticise young people', 'to teach French'], 'The text gives information and examples.']] },
      { title: 'A desert of clothes', text: "Every year, about 39,000 tonnes of second-hand clothes end up in the Atacama Desert. Many of them come from the USA, Europe and Asia and arrive at the free zone of Iquique. Clothes that nobody buys are dumped in the desert, where they can take hundreds of years to decompose. Activists say fast fashion is to blame: brands release new collections every few weeks, and cheap clothes encourage people to buy more than they need. If consumers bought fewer clothes and repaired the ones they have, the problem would be much smaller.",
        qs: [['READ', 'Where do the clothes arrive?', ['at the free zone of Iquique', 'at the port of Valparaíso', 'in Santiago', 'in Antofagasta'], '"arrive at the free zone of Iquique"'],
             ['READ', 'How long can the clothes take to decompose?', ['hundreds of years', 'a few weeks', 'one year', 'ten years'], '"hundreds of years"'],
             ['INF', 'According to the text, what would make the problem smaller?', ['buying fewer clothes and repairing them', 'building more shops', 'burning the clothes', 'sending them back to Europe'], 'Second conditional at the end of the text.']] }
    ]
  }
};
