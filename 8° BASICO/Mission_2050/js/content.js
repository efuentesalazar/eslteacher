// ============================================================
//  MISSION 2050 · Contenidos (Unit 4 "Future matters", 8° básico, nivel B1)
//  Foco: future "will", first conditional (if / unless) y vocabulario en contexto.
//
//  Cómo editar una pregunta:
//    { k:'WILL', q:'Pregunta', o:['opción A','opción B','opción C','opción D'], a:0, why:'Explicación' }
//    k = habilidad (ver SKILLS) · a = número de la opción correcta (0 = la primera)
//  Las opciones se desordenan solas en el juego.
// ============================================================

export const SKILLS = {
  READ: 'Reading: details',
  INF: 'Reading: inference',
  VOC: 'Vocabulary in context',
  WILL: 'Future: will',
  COND: 'First conditional'
};

// Los 4 distritos. Cada uno: lectura en 4 partes (cada jugador del equipo lee una parte),
// preguntas de lectura, terminal de gramática y bóveda de vocabulario.
export const DISTRICTS = [
  {
    id: 'robot', name: 'Robot Lab', color: '#22b8ff', icon: '🤖',
    npc: { name: 'Dr. Ada Okafor', role: 'robotics engineer', char: 'character-j' },
    intro: "Welcome to the Robot Lab, agents! GLITCH has taken control of our machines. If you help me, we'll switch the lab back on. But first, I need to know: <b>will robots take our jobs?</b> Read my article together — each of you has a different part.",
    reading: {
      title: 'Will a robot take my job?',
      parts: [
        "Every week, people ask me the same question: \"Will robots take our jobs?\" My answer is always, \"Some of them, yes.\" Machines are already doing repetitive tasks in factories, warehouses and supermarkets, and experts think they will do even more by 2050.",
        "For example, self-driving trucks will probably deliver most products, and computer programs will check bank documents in seconds. However, this doesn't mean that humans will have nothing to do. History shows that new technology usually creates new kinds of work.",
        "Twenty years ago, nobody worked as an app designer or a drone pilot. In the future, there will be jobs that we can't imagine today, like robot trainers, space tour guides or \"digital detox\" coaches who help people use technology less.",
        "So what should students do now? Robots are great at following instructions, but they aren't good at being creative, solving new problems or understanding feelings. If you develop these skills, you won't need to worry about the future. You'll be ready for it."
      ],
      q: [
        { k: 'READ', q: 'According to Dr. Okafor, what are machines already doing?', o: ['Repetitive tasks in factories, warehouses and supermarkets', 'Creative work in design studios', 'Teaching classes in most schools', 'Taking care of sick and elderly people in their own homes every day'], a: 0, why: 'Part 1: "Machines are already doing repetitive tasks in factories, warehouses and supermarkets."' },
        { k: 'READ', q: 'Which future machine does the article mention?', o: ['Self-driving trucks that deliver products', 'Robots that cook in restaurants', 'Flying cars for families', 'Robot teachers in schools'], a: 0, why: 'Part 2: "self-driving trucks will probably deliver most products".' },
        { k: 'INF', q: 'Why does the writer mention app designers and drone pilots?', o: ['To show that technology creates jobs that didn\'t exist before', 'To say that those jobs will disappear soon because of robots', 'Because she worked as a drone pilot', 'To explain how robots are built'], a: 0, why: 'Nobody had those jobs twenty years ago, so new technology created them (Part 3).' },
        { k: 'INF', q: 'How does the writer feel about the future of work?', o: ['Optimistic, but she thinks students need to prepare', 'Very worried and negative', 'Angry with the robots and the scientists who build them', 'Not interested in the topic'], a: 0, why: 'She says "You\'ll be ready for it" if you develop creative and human skills (Part 4).' },
        { k: 'VOC', q: '"Machines are doing <u>repetitive</u> tasks." What does <i>repetitive</i> mean?', o: ['Done again and again in the same way', 'Very dangerous', 'Very well paid', 'Done only once'], a: 0, why: 'Repetitive = you repeat it many times. Machines are good at those tasks.' }
      ]
    },
    grammar: {
      title: 'Grammar Gate: future WILL', items: [
        { k: 'WILL', q: 'By 2050, most cars ___ themselves.', o: ['will drive', 'will driving', 'are drive', 'drive will'], a: 0, why: 'Prediction: <b>will + base verb</b> → will drive.' },
        { k: 'WILL', q: '"Don\'t worry. The robot ___ hurt you. It\'s programmed to be safe."', o: ["won't", "doesn't will", "will not to", "isn't"], a: 0, why: 'Negative: <b>won\'t (will not) + base verb</b> → won\'t hurt.' },
        { k: 'WILL', q: 'Choose the correct question.', o: ['Will people still go to school in 2050?', 'Will people still going to school in 2050?', 'Do people will still go to school in 2050?', 'People will still go to school in 2050?'], a: 0, why: 'Question: <b>Will + subject + base verb?</b>' },
        { k: 'WILL', q: '"This box is really heavy!" — "Wait, I ___ you."', o: ["'ll help", 'help', 'am help', 'will helping'], a: 0, why: 'A decision you make at the moment of speaking (an offer): <b>I\'ll help</b>.' },
        { k: 'WILL', q: '"I promise I ___ forget to charge the robot tonight."', o: ["won't", "don't", "will", "am not"], a: 0, why: 'Promises use will / won\'t: "I promise I won\'t forget."' },
        { k: 'WILL', q: '"I think robots ___ better doctors than humans one day, but I\'m not sure."', o: ['will be', 'will are', 'are being', 'be will'], a: 0, why: 'Opinion + prediction: <b>I think … will be</b>. "Be" never changes after will.' }
      ]
    },
    vocab: {
      title: 'Vocabulary Vault: jobs of the future', items: [
        { k: 'VOC', q: '"Many companies want to <u>replace</u> human workers with machines to save money." <br><i>replace</i> means…', o: ['put something new in the place of something else', 'pay more money to someone', 'repair a broken machine', 'teach someone a new skill so they can change their job'], a: 0, why: 'Replace = take the place of. The machines will do the work instead of people.' },
        { k: 'VOC', q: '"Learning to code is a useful <u>skill</u> for many future jobs." <br><i>skill</i> means…', o: ['an ability you get by learning and practice', 'a kind of computer', 'a school subject that you don\'t like very much', 'a job that pays a lot'], a: 0, why: 'A skill is something you can do well because you practiced it.' },
        { k: 'VOC', q: '"When a factory closes, <u>unemployment</u> in the town usually goes up." <br><i>unemployment</i> means…', o: ['the situation of not having a job', 'the money a factory makes', 'the number of new factories in a city', 'a type of pollution'], a: 0, why: 'Un- (not) + employment (having a job) = not having a job.' },
        { k: 'VOC', q: '"Artificial intelligence can <u>recognize</u> faces in a crowd in less than a second." <br><i>recognize</i> means…', o: ['know who someone is because you have seen them before', 'draw a picture of someone from a photo you have seen before', 'forget someone quickly', 'hide from someone'], a: 0, why: 'Recognize = identify something or someone you already know.' },
        { k: 'VOC', q: '"The new robot is so <u>reliable</u> that it has never broken down in ten years." <br><i>reliable</i> means…', o: ['you can trust it to work well', 'very cheap', 'very small and light', 'old and slow'], a: 0, why: 'It never broke down, so you can rely on (trust) it.' }
      ]
    },
    done: 'The Robot Lab is back online! The machines are working for people again.'
  },
  {
    id: 'eco', name: 'Eco Dome', color: '#3fd36b', icon: '🌱',
    npc: { name: 'Mateo Rojas', role: 'climate scientist', char: 'character-c' },
    intro: "Hi, team! Skyport is next to the sea, and GLITCH turned off our climate shield. If we don't act now, the city will be in trouble. The city council has two plans. Read the report together — remember, each of you has one part!",
    reading: {
      title: 'Two plans for a rising sea',
      parts: [
        "Skyport is a coastal city, so its people are worried about climate change. Scientists say that the sea level will rise by almost one meter by the end of this century. If the water rises that much, the lowest neighborhoods will flood several times a year.",
        "The city council has two plans. The first plan is to build a huge wall along the beach. The wall will protect the houses, but it will cost a lot of money, and it won't stop the cause of the problem: pollution from cars and factories.",
        "The second plan is to change the way people live. If Skyport uses solar and wind energy, it will produce much less carbon dioxide. The city also wants to plant 50,000 trees, because trees absorb carbon and keep the streets cool in summer.",
        "Many young people support the second plan. \"If we only build a wall, our children will have the same problem in fifty years,\" says Lucía, 15. \"Unless we reduce pollution now, the planet will keep getting warmer.\" The council will vote next month."
      ],
      q: [
        { k: 'READ', q: 'What will happen if the sea rises almost one meter?', o: ['The lowest neighborhoods will flood several times a year', 'The whole city will disappear under the sea in a few years', 'The beach will get bigger', 'Nothing important will happen'], a: 0, why: 'Part 1: "If the water rises that much, the lowest neighborhoods will flood several times a year."' },
        { k: 'READ', q: 'What is one problem with the first plan?', o: ["It's expensive and it won't stop pollution", "It won't protect the houses", 'It needs 50,000 trees', 'Young people will build it'], a: 0, why: 'Part 2: "it will cost a lot of money, and it won\'t stop the cause of the problem".' },
        { k: 'READ', q: 'Why does the city want to plant trees?', o: ['They absorb carbon and keep the streets cool', 'They will stop the sea from rising tomorrow', 'They are cheaper than solar panels', 'Tourists like green parks'], a: 0, why: 'Part 3: "trees absorb carbon and keep the streets cool in summer".' },
        { k: 'INF', q: 'What does Lucía think about the wall?', o: ["It's only a short-term solution", "It's the best plan for the future", "It's too ugly for the beach", 'It will be too small'], a: 0, why: 'She says their children will have the same problem in fifty years, so the wall doesn\'t solve the real problem.' },
        { k: 'VOC', q: '"Trees <u>absorb</u> carbon." What does <i>absorb</i> mean?', o: ['take something in', 'produce something', 'throw something away', 'paint something'], a: 0, why: 'Absorb = take in, like a sponge takes in water.' }
      ]
    },
    grammar: {
      title: 'Grammar Gate: first conditional', items: [
        { k: 'COND', q: 'If we ___ more trees, the air will be cleaner.', o: ['plant', 'will plant', 'planting', 'plants'], a: 0, why: 'First conditional: <b>If + present simple</b>, will + verb. Never "will" after "if".' },
        { k: 'COND', q: 'If people use public transport, there ___ less traffic.', o: ['will be', 'be', 'are', 'will is'], a: 0, why: 'Result clause: <b>will + base verb</b> → there will be.' },
        { k: 'COND', q: 'Choose the correct sentence.', o: ["If it doesn't rain soon, the plants will die.", "If it won't rain soon, the plants will die.", "If it don't rain soon, the plants will die.", "If it doesn't rain soon, the plants die will."], a: 0, why: 'If + present simple (doesn\'t rain), will + verb (will die).' },
        { k: 'COND', q: '___ we save water, the city will have a drought.', o: ['Unless', 'If', 'Because', 'So'], a: 0, why: '<b>Unless = if … not</b>. "Unless we save water" = "If we don\'t save water".' },
        { k: 'COND', q: 'The ice will melt ___ temperatures keep rising.', o: ['if', 'unless', 'but', 'so'], a: 0, why: 'The if-clause can go second: "The ice will melt if temperatures keep rising." (No comma needed.)' },
        { k: 'COND', q: 'What ___ if the ice at the poles melts?', o: ['will happen', 'happens will', 'will happens', 'does happen will'], a: 0, why: 'Question in the result clause: <b>What will happen</b> if …?' }
      ]
    },
    vocab: {
      title: 'Vocabulary Vault: climate', items: [
        { k: 'VOC', q: '"After months without rain, the <u>drought</u> destroyed most of the crops." <br><i>drought</i> means…', o: ['a long period with no rain', 'a very strong wind', 'a very big wave from the sea', 'a cold winter'], a: 0, why: '"Months without rain" is the clue: a drought.' },
        { k: 'VOC', q: '"Solar and wind are <u>renewable</u> energy sources, so they will never run out." <br><i>renewable</i> means…', o: ['that can be replaced naturally', 'very expensive', 'dangerous for animals', 'used only at night'], a: 0, why: 'Renewable energy comes back naturally (sun, wind), so it doesn\'t run out.' },
        { k: 'VOC', q: '"Your <u>carbon footprint</u> gets bigger every time you take a plane." <br><i>carbon footprint</i> means…', o: ['the amount of CO₂ your activities produce', 'the size of your shoes', 'a mark on the floor', 'the money you spend on travel every single year'], a: 0, why: 'Planes produce a lot of CO₂, so your carbon footprint grows.' },
        { k: 'VOC', q: '"The river <u>flooded</u> the town, and people had to leave their homes." <br><i>flood</i> means…', o: ['cover a place with water', 'clean a place', 'build walls around a place', 'make a place hotter'], a: 0, why: 'A flood is when water covers land that is usually dry.' },
        { k: 'VOC', q: '"Many species of frogs are in danger of <u>extinction</u> because of pollution." <br><i>extinction</i> means…', o: ['when a species disappears completely', 'when animals move to a new place to live', 'when animals have babies', 'when animals sleep in winter'], a: 0, why: 'Extinction = no more animals of that species are alive.' }
      ]
    },
    done: 'The Eco Dome is shining again! Clean energy is flowing through Skyport.'
  },
  {
    id: 'mars', name: 'Mars Base', color: '#ff6a3d', icon: '🚀',
    npc: { name: 'Commander Lin Zhou', role: 'astronaut', char: 'character-o' },
    intro: "Agents, welcome to the Mars Launch Base! GLITCH stopped our rocket, New Horizon. If you fix it, it will take the first colonists to Mars. Read our advertisement for volunteers — together you'll have the full information.",
    reading: {
      title: 'WANTED: Mars colonists',
      parts: [
        "WANTED: Volunteers for the first city on Mars, New Horizon. The trip will take about seven months, and you won't be able to come back to Earth for at least three years. If you join the mission, you will live and work with 99 other people from around the world.",
        "Life on Mars won't be easy. The temperature is usually below −60 °C, and there is almost no oxygen in the air. Colonists will live inside pressurized domes and will grow their own vegetables in underground greenhouses. Their water will come from ice under the surface.",
        "Every colonist will have an important job: engineers will repair machines, doctors will look after the team, and farmers will make sure that everybody has enough food. Because messages take up to 20 minutes to reach Earth, the team will have to solve problems on its own.",
        "We are looking for people who are calm, curious and good at working in teams. Don't apply if you get bored easily! But if you want to make history, this will be the adventure of your life. Applications close on June 30th."
      ],
      q: [
        { k: 'READ', q: 'How long will the trip to Mars take?', o: ['About seven months', 'About three years', 'About 20 minutes', 'About one week'], a: 0, why: 'Part 1: "The trip will take about seven months."' },
        { k: 'READ', q: 'Where will the colonists get their water?', o: ['From ice under the surface', 'From rivers on Mars', 'From Earth, by rocket', 'From the rain'], a: 0, why: 'Part 2: "Their water will come from ice under the surface."' },
        { k: 'INF', q: 'Why will the team have to solve problems on its own?', o: ['Because communication with Earth is slow', 'Because nobody on Earth wants to help', 'Because they will have no computers', 'Because the commander will be on Earth'], a: 0, why: 'Messages take up to 20 minutes, so they can\'t wait for help from Earth (Part 3).' },
        { k: 'INF', q: 'Which person would probably NOT be a good colonist?', o: ['Someone who gets bored easily and prefers to work alone', 'A calm engineer who likes teamwork', 'A curious doctor', 'A farmer who enjoys working in teams and solving problems calmly'], a: 0, why: 'The ad wants calm, curious team players and says "Don\'t apply if you get bored easily".' },
        { k: 'VOC', q: '"Applications close on June 30th. Don\'t <u>apply</u> if you get bored easily." <i>apply</i> means…', o: ['ask officially for a job or a place', 'travel to another planet', 'repair a machine', 'stay at home'], a: 0, why: 'You apply for a job: you send an official request (an application).' }
      ]
    },
    grammar: {
      title: 'Grammar Gate: will for decisions, offers and promises', items: [
        { k: 'WILL', q: '"The oxygen tank is empty!" — "Don\'t panic. I ___ a new one."', o: ["'ll get", 'get', 'am get', 'will to get'], a: 0, why: 'A quick decision at the moment of speaking: <b>I\'ll get</b> a new one.' },
        { k: 'WILL', q: '"Commander, I ___ you down. I\'ll check the engine every day."', o: ["won't let", "don't let", 'will let not', 'not will let'], a: 0, why: 'A promise: <b>I won\'t let you down</b> (= I won\'t disappoint you).' },
        { k: 'WILL', q: '"I\'ll carry your helmet," said Ana. Ana is making…', o: ['an offer', 'a prediction', 'a rule', 'a complaint'], a: 0, why: 'She offers to help: <b>I\'ll</b> + verb is often an offer.' },
        { k: 'WILL', q: 'In my opinion, humans ___ on Mars before 2060.', o: ['will live', 'living', 'lives will', 'will to live'], a: 0, why: 'Prediction: <b>will + base verb</b> (no "to").' },
        { k: 'COND', q: 'If the dust storm ___ tonight, we will stay inside the dome.', o: ['arrives', 'will arrive', 'arrive', 'arriving'], a: 0, why: 'If + present simple: <b>the dust storm arrives</b> (third person -s).' },
        { k: 'WILL', q: 'Which sentence is a promise?', o: ["I'll call you as soon as we land.", 'It will be very cold on Mars.', 'Robots will be cheaper in 2050.', 'The trip will take seven months.'], a: 0, why: '"I\'ll call you" is something the speaker promises to do. The others are predictions or facts about the future.' }
      ]
    },
    vocab: {
      title: 'Vocabulary Vault: space', items: [
        { k: 'VOC', q: '"The <u>crew</u> checked the spacecraft before the launch." <br><i>crew</i> means…', o: ['the people who work together on a ship or spacecraft', 'the engine of a rocket', 'the passengers\' luggage and the boxes of food on a spacecraft', 'the control tower'], a: 0, why: 'The crew = the team of people who work on a ship, plane or spacecraft.' },
        { k: 'VOC', q: '"Plants can\'t <u>survive</u> on Mars without protection from the cold." <br><i>survive</i> means…', o: ['continue to live', 'grow very fast', 'change color', 'travel far away'], a: 0, why: 'Survive = stay alive in a difficult situation.' },
        { k: 'VOC', q: '"Some companies want to <u>colonize</u> Mars and build cities there." <br><i>colonize</i> means…', o: ['go to live in a new place and take control of it', 'take photos of a place', 'destroy a place', 'study a place from far away with a big telescope'], a: 0, why: 'Colonize = send people to live in a new place (a colony).' },
        { k: 'VOC', q: '"The <u>surface</u> of Mars is covered in red dust." <br><i>surface</i> means…', o: ['the top or outside layer of something', 'the center of something', 'the sky above something', 'the history of something'], a: 0, why: 'The surface is the outside part, the part you can walk on.' },
        { k: 'VOC', q: '"Astronauts train for years, so they are ready for any <u>emergency</u>." <br><i>emergency</i> means…', o: ['a dangerous situation that needs action immediately', 'a long holiday', 'a type of rocket fuel that is used for very long trips', 'a happy surprise'], a: 0, why: 'In an emergency you must act fast because something dangerous is happening.' }
      ]
    },
    done: 'New Horizon is ready! Look — the rocket is taking off for Mars!'
  },
  {
    id: 'city', name: 'Smart City', color: '#b26bff', icon: '🏙️',
    npc: { name: 'Sofía Díaz', role: 'city planner', char: 'character-f' },
    intro: "Welcome downtown, agents! This is Smart Skyport. GLITCH froze the traffic lights, the pods and the apps. Unless you help us, the city won't move today! Read about a normal day here in 2050 — one part each.",
    reading: {
      title: 'A day in Smart Skyport',
      parts: [
        "It's 7:00 a.m. in Skyport, in the year 2050. Sam, 14, wakes up when her smart watch notices that she has slept enough. The watch also checks her heart rate and tells her that she is a bit dehydrated, so the fridge prepares a glass of water with vitamins.",
        "Sam doesn't take a bus to school. A small self-driving pod arrives at her door, and it picks up three other students on the way. Private cars aren't allowed downtown anymore, so the streets are quiet and full of bikes, trees and play areas.",
        "At school, there are no heavy books. Students wear light glasses that show 3D models of the human heart or ancient cities. However, Sam's favorite class is still the one without technology: on Fridays, her class goes to the community garden and grows vegetables.",
        "Not everybody loves Smart Skyport. Some people say that the city collects too much information about its citizens. \"If the city knows everything about us, we won't have any privacy,\" says Sam's grandfather. Sam thinks he has a point, but she also loves her quiet, green streets."
      ],
      q: [
        { k: 'READ', q: 'How does Sam get to school?', o: ['In a self-driving pod with other students', 'In her family\'s private car', 'On a crowded bus', 'She walks there with her grandfather every morning'], a: 0, why: 'Part 2: "A small self-driving pod arrives at her door, and it picks up three other students."' },
        { k: 'READ', q: 'Why are the streets downtown quiet?', o: ["Private cars aren't allowed there anymore", 'Nobody lives downtown', 'It is very early in the morning', 'Everybody works from home'], a: 0, why: 'Part 2: "Private cars aren\'t allowed downtown anymore, so the streets are quiet."' },
        { k: 'INF', q: 'What can we infer about Sam from her favorite class?', o: ['She enjoys learning without screens sometimes', 'She hates technology', 'She wants to be a doctor', 'She doesn\'t like working with her classmates'], a: 0, why: 'Her favorite class is "the one without technology" in the garden (Part 3).' },
        { k: 'INF', q: "What is Sam's grandfather worried about?", o: ['That people will lose their privacy', 'That Sam will be late for school', 'That the streets will be too quiet', 'That the pods are too expensive'], a: 0, why: 'He says: "we won\'t have any privacy" because the city collects too much information (Part 4).' },
        { k: 'VOC', q: '"Sam thinks he <u>has a point</u>." This means Sam thinks…', o: ['what he says is partly true', 'he is completely wrong', 'he is very old', 'he should be quiet'], a: 0, why: 'To have a point = to say something that is reasonable or partly right.' }
      ]
    },
    grammar: {
      title: 'Grammar Gate: will + first conditional', items: [
        { k: 'COND', q: 'If you ___ your smart watch, it ___ you when you need water.', o: ['wear / will tell', 'will wear / tells', 'wear / tell will', 'wearing / will tell'], a: 0, why: '<b>If + present</b> (wear), <b>will + verb</b> (will tell).' },
        { k: 'COND', q: "You won't get to school on time ___ you leave now.", o: ['unless', 'if', 'when', 'so'], a: 0, why: '<b>Unless you leave now</b> = if you don\'t leave now.' },
        { k: 'COND', q: 'Find the mistake: "If the pod <u>will be</u> late, I <u>will walk</u> to <u>school</u>."', o: ['will be → is', 'will walk → walk', 'school → the school', 'There is no mistake'], a: 0, why: 'No "will" after "if": <b>If the pod is late</b>, I will walk to school.' },
        { k: 'COND', q: 'What will you do if the city ___ your data?', o: ['sells', 'will sell', 'sell', 'selling'], a: 0, why: 'If + present simple with "the city" (it) → <b>sells</b>.' },
        { k: 'WILL', q: "I'm sure Skyport ___ the greenest city in the country by 2060.", o: ['will be', 'is being', 'be', 'will been'], a: 0, why: 'A confident prediction: <b>I\'m sure … will be</b>.' },
        { k: 'COND', q: '"If you don\'t recycle, the city will fine you." = "___ you recycle, the city will fine you."', o: ['Unless', 'If', 'When', 'Because'], a: 0, why: '<b>Unless</b> = if … not. "Unless you recycle" = "If you don\'t recycle".' }
      ]
    },
    vocab: {
      title: 'Vocabulary Vault: smart cities', items: [
        { k: 'VOC', q: '"My grandmother doesn\'t use social media because she cares about her <u>privacy</u>." <br><i>privacy</i> means…', o: ['being free to keep your personal life secret', 'having a lot of friends and followers on the internet', 'being famous online', 'being very rich'], a: 0, why: 'Privacy = your personal information stays private (secret).' },
        { k: 'VOC', q: '"<u>Wearable</u> devices, like smart watches, can count how many steps you walk." <br><i>wearable</i> means…', o: ['that you can wear on your body', 'that is very old', 'that you can eat', 'that works without electricity'], a: 0, why: 'Wear + -able = you can wear it (watch, glasses, bracelet).' },
        { k: 'VOC', q: '"<u>Downtown</u> is always busy because most shops and offices are there." <br><i>downtown</i> means…', o: ['the central part of a city', 'a small village', 'the lowest floor of a building', 'a park outside the city'], a: 0, why: 'Downtown = the city center, where shops and offices are.' },
        { k: 'VOC', q: '"Electric scooters are a <u>sustainable</u> way to travel short distances." <br><i>sustainable</i> means…', o: ['that doesn\'t damage the environment and can continue for a long time', 'very fast and dangerous', 'only for rich people who live in the most modern and expensive part of the city', 'difficult to use'], a: 0, why: 'Sustainable = good for the planet, so we can keep doing it in the future.' },
        { k: 'VOC', q: '"The app sends you a <u>notification</u> when your pod is two minutes away." <br><i>notification</i> means…', o: ['a short message that tells you something', 'a kind of ticket', 'a long phone call', 'a map of the city'], a: 0, why: 'A notification is a short message or alert on your phone.' }
      ]
    },
    done: 'Smart City is moving again! The pods, lights and apps are back.'
  }
];

// Jefe final: GLITCH escribe predicciones "rotas" y el equipo debe repararlas.
export const BOSS = {
  name: 'GLITCH',
  intro: "SO, YOU FOUND MY TOWER. I WILL CONTROL SKYPORT FOREVER! MY PREDICTIONS ARE PERFECT... OR ARE THEY? If you fix my broken sentences, my power will go down. If you make mistakes, my power will grow!",
  items: [
    { k: 'COND', q: 'GLITCH: <i>"If you will answer correctly, I will shut down."</i> Fix it!', o: ['If you answer correctly, I will shut down.', 'If you will answer correctly, I shut down.', 'If you answered correctly, I will shut down.', 'If you answering correctly, I will shut down.'], a: 0, why: 'No "will" in the if-clause: <b>If you answer</b>, I will shut down.' },
    { k: 'WILL', q: 'GLITCH: <i>"Robots will to rule the world."</i> Fix it!', o: ['Robots will rule the world.', 'Robots will ruling the world.', 'Robots rules will the world.', 'Robots will rules the world.'], a: 0, why: '<b>will + base verb</b>, without "to".' },
    { k: 'WILL', q: 'GLITCH: <i>"Humans won\'t never stop me!"</i> Fix it!', o: ['Humans will never stop me!', 'Humans won\'t never stopping me!', 'Humans will not never stop me!', 'Humans never won\'t stop me!'], a: 0, why: 'Only one negative: <b>will never</b> or <b>won\'t ever</b>.' },
    { k: 'COND', q: 'GLITCH: <i>"Unless you don\'t hurry, the city will shut down."</i> Fix it!', o: ['Unless you hurry, the city will shut down.', 'Unless you won\'t hurry, the city will shut down.', 'Unless you hurry, the city shuts down will.', 'If you hurry, the city will shut down.'], a: 0, why: '<b>Unless</b> already means "if not", so don\'t add "don\'t".' },
    { k: 'WILL', q: 'GLITCH: <i>"Will the city survives without me?"</i> Fix it!', o: ['Will the city survive without me?', 'Will the city survived without me?', 'Does the city will survive without me?', 'The city will survive without me?'], a: 0, why: 'After will, the verb has no -s: <b>Will the city survive?</b>' },
    { k: 'COND', q: 'GLITCH: <i>"If the team work together, they defeats me."</i> Fix it!', o: ['If the team works together, they will defeat me.', 'If the team will work together, they defeat me.', 'If the team work together, they will defeats me.', 'If the team working together, they defeat me.'], a: 0, why: '<b>If + present simple</b> (the team works), <b>will + verb</b> (will defeat).' },
    { k: 'VOC', q: 'GLITCH: <i>"My energy plan is perfect! It will run out in a week."</i> Which word describes a plan that will NOT run out?', o: ['sustainable', 'repetitive', 'wearable', 'pressurized'], a: 0, why: 'A sustainable plan can continue for a long time without damaging the planet.' },
    { k: 'COND', q: 'Final code! Choose the best ending: <i>"If we restore all four districts, …"</i>', o: ['…Skyport will be safe again.', '…Skyport is safe again will.', '…Skyport will safe again.', '…Skyport would been safe.'], a: 0, why: 'First conditional: If + present, <b>will + be</b>. Skyport is safe again — great job, agents!' }
  ]
};

// 12 ciudadanos en los caminos (misiones secundarias individuales: cada agente puede hacerlas por su cuenta).
export const CITIZENS = [
  { id: 'c1', name: 'Tomás', role: 'food-truck owner', char: 'character-b', text: "I'm opening a food truck that sells insect burgers! Insects need much less water and land than cows. If people try them, I think they'll love them. My friends say nobody will buy them, but I'm not worried.", q: { k: 'INF', q: 'Why does Tomás think insect burgers are a good idea?', o: ['They need fewer resources than beef', 'They are more expensive than beef', 'His friends love them', 'Cows are dangerous'], a: 0, why: 'Insects "need much less water and land than cows".' } },
  { id: 'c2', name: 'Grandma Rosa', role: 'retired teacher', char: 'character-k', text: "My grandson says I'll need a robot to help me at home when I'm older. Maybe he's right. Robots are useful: they'll clean, cook and remind me to take my medicine. But they won't laugh at my jokes!", q: { k: 'INF', q: 'What does Rosa mean when she says robots "won\'t laugh at my jokes"?', o: ["Robots can help, but they can't give real human company", 'Her jokes are not funny', 'Robots are too expensive', 'She wants a robot that tells jokes and sings songs all day'], a: 0, why: 'She values human connection, which robots can\'t really give.' } },
  { id: 'c3', name: 'Kai', role: 'drone pilot', char: 'character-d', text: "I deliver packages with drones. They're fast and quiet, but today I have a problem: this package weighs 12 kilos, and my drone can only carry 10!", q: { k: 'WILL', q: '"The package is too heavy for the drone." — Kai decides: "OK, I ___ it by bike."', o: ["'ll take", 'take', 'am take', 'will taking'], a: 0, why: 'A decision at the moment of speaking: <b>I\'ll take</b> it by bike.' } },
  { id: 'c4', name: 'Aylin', role: 'student', char: 'character-g', text: "I love the ocean. If I pass my final exams, I'll study marine biology at university. Then I'll work on a project to clean plastic from the sea. Unless we protect the oceans, many fish will disappear.", q: { k: 'COND', q: 'What will Aylin do if she passes her final exams?', o: ['She will study marine biology', 'She will become a pilot', 'She will travel to Mars', 'She will open a restaurant'], a: 0, why: '"If I pass my final exams, I\'ll study marine biology."' } },
  { id: 'c5', name: 'Pedro', role: 'bus driver', char: 'character-e', text: "Next year, the city buses will drive themselves. Am I sad? No! I won't lose my job. The company will train me, and I'll become a 'passenger assistant'. I'll help older people and tourists on the buses.", q: { k: 'READ', q: "What will happen to Pedro's job?", o: ['It will change into a new job', 'He will lose it', 'He will drive trucks', 'Nothing will change'], a: 0, why: 'He will become a "passenger assistant" after training.' } },
  { id: 'c6', name: 'Nia', role: 'vertical farmer', char: 'character-h', text: "In my vertical farm, lettuce and tomatoes grow in tall towers, with no soil and 90% less water. Everything is indoors, so storms and droughts won't destroy my crops.", q: { k: 'VOC', q: 'In Nia\'s text, <u>crops</u> means…', o: ['plants that farmers grow for food', 'tall buildings', 'farm machines', 'bad weather'], a: 0, why: 'Crops = plants grown for food, like lettuce and tomatoes.' } },
  { id: 'c7', name: 'Leo', role: 'gamer', char: 'character-a', text: "There's a big online tournament tonight, and I want to play until 3 a.m. But tomorrow I have a science test at 8...", q: { k: 'COND', q: 'Help Leo: "If I ___ to bed late, I\'ll be tired in my test."', o: ['go', 'will go', 'going', 'goes'], a: 0, why: 'If + present simple: <b>If I go</b> to bed late, I\'ll be tired.' } },
  { id: 'c8', name: 'Priya', role: 'engineer', char: 'character-i', text: "My recycling robot sorts trash five times faster than a person. But unless it gets clean materials, it won't work well. So please, wash your bottles before you recycle them!", q: { k: 'COND', q: '"Unless it gets clean materials, it won\'t work well" means…', o: ["If it doesn't get clean materials, it won't work well.", 'If it gets clean materials, it won\'t work well.', 'It never works well.', 'It works well with dirty materials.'], a: 0, why: '<b>Unless</b> = if … not.' } },
  { id: 'c9', name: 'Madame Byte', role: 'hologram fortune-teller', char: 'character-p', text: "Come closer, young agent... I see your future! You will travel to three continents, and you'll learn two new languages. And tomorrow... I'll give you a discount!", q: { k: 'WILL', q: 'What type of sentence is "You will learn two new languages"?', o: ['A prediction', 'A promise', 'An offer', 'A rule'], a: 0, why: 'She is saying what she thinks will happen in the future: a prediction.' } },
  { id: 'c10', name: 'Dr. Ben', role: 'doctor', char: 'character-l', text: "In 2050, you won't need to go to the hospital for a check-up. Your phone will scan your body and send the results to me. If there is a problem, I'll call you immediately.", q: { k: 'READ', q: 'How will people get check-ups in 2050?', o: ['Their phone will scan them and send the results', 'They will go to the hospital every week for a check-up', 'Robots will visit their homes', 'They will not need check-ups'], a: 0, why: '"Your phone will scan your body and send the results to me."' } },
  { id: 'c11', name: 'Zoe', role: 'climate activist', char: 'character-m', text: "Last summer we had three heat waves, and it was 40 °C for days. If we don't change our habits, we'll have even more heat waves every summer. Walk, ride a bike and save energy!", q: { k: 'VOC', q: 'A <u>heat wave</u> is…', o: ['a period of unusually hot weather', 'a big wave in the sea', 'a type of heater', 'a summer holiday'], a: 0, why: 'A heat wave = several days with very hot weather.' } },
  { id: 'c12', name: 'Omar', role: 'tour guide', char: 'character-n', text: "The first space hotel will open in 2045. You'll see the Earth from your window! But one night there will cost as much as a new car. I think I'll probably stay on Earth for my holidays.", q: { k: 'INF', q: 'Why will Omar probably stay on Earth?', o: ['The space hotel is too expensive', 'He is afraid of rockets', 'The hotel won\'t open', 'He doesn\'t like holidays'], a: 0, why: 'A night costs "as much as a new car", so it\'s too expensive for him.' } }
];

// Frases rápidas para comunicarse en inglés (sin chat libre).
export const PHRASES = [
  'Follow me!', 'Wait for me!', 'Come here, team!', "I'll go to the pad.", "I'll read my part.", 'Can you read your part?',
  'I think the answer is A.', 'I think the answer is B.', 'I think the answer is C.', 'I think the answer is D.',
  "I don't agree.", 'I agree!', 'Good job, team!', "I'll look for energy cells."
];
