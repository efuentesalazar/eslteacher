// TERRA LINGUA · Banco de ejercicios de 1° medio (Programa de Estudio + Student's Book).
// Textos originales inspirados en los temas de cada lección.
// CÓMO EDITAR:
//   M("pregunta", ["CORRECTA", "mala", "mala"], "retroalimentación")  -> alternativas (la primera es la correcta)
//   T("pregunta con ___", ["respuesta", "otra aceptada"], "retroalimentación")  -> escribir
//   O("Oración correcta completa.", "retroalimentación")  -> ordenar palabras
//   S("frase a decir", "pregunta si no hay micrófono", ["CORRECTA", ...], "retroalimentación")  -> pronunciación
// La retroalimentación se muestra al tercer intento fallido.

const M = (q, o, x) => ({ t: 'mc', q, o, x });
const T = (q, a, x) => ({ t: 'type', q, a, x });
const O = (s, x) => ({ t: 'order', q: 'Put the words in order.', s, x });
const S = (say, q, o, x) => ({ t: 'speak', say, q, o, x });

export const UNITS = [
  /* ===================== UNIT 1 ===================== */
  {
    id: 1, name: 'Jobs', place: 'Worktown', color: '#f4a62a', big: 'Can dream jobs come true?',
    goal: 'Help the people of Worktown find their dream jobs.',
    quests: [
      { id: 'u1v', k: 'VOC', icon: '📋', npc: 'Ms. Rivera', role: 'Job Centre manager', title: 'The Job Board',
        intro: 'Welcome to Worktown! Our job board is a mess. Can you match the words?',
        items: [
          M('A job with fewer hours than a normal week is a…', ['part-time job', 'dead-end job', 'full-time job', 'dream job'], '"Part-time" = media jornada o pocas horas. "Full-time" es jornada completa.'),
          M('A job with no chance of promotion is a…', ['dead-end job', 'well-paid job', 'challenging job', 'summer job'], '"Dead-end" = callejón sin salida: un trabajo donde no puedes progresar.'),
          M('If you leave your job because you decide to, you…', ['quit', 'get fired', 'get hired', 'earn'], '"Quit" = renunciar. "Get fired" = que te despidan.'),
          M('The money you receive every month for your work is your…', ['salary', 'savings', 'application', 'resume'], '"Salary" = sueldo. "Savings" = lo que ahorras.'),
          M('A document that lists your education and experience is a…', ['CV', 'budget', 'coupon', 'token'], 'CV o resume: documento con tu estudio y experiencia.'),
          M('Skills or certificates that make you right for a job are…', ['qualifications', 'stereotypes', 'payments', 'colleagues'], '"Qualifications" = requisitos, títulos o competencias.'),
          T('To ask formally for a job, you ___ for it.', ['apply'], 'Decimos "apply for a job" (postular a un trabajo).'),
          M('Sara loves difficult tasks. She wants a ___ job.', ['challenging', 'boring', 'tiring', 'dangerous'], '"Challenging" = desafiante, en sentido positivo.')
        ] },
      { id: 'u1g1', k: 'GRAM', icon: '❓', npc: 'Mr. Tapia', role: 'Interviewer', title: 'The Job Interview',
        intro: 'I am interviewing candidates. Confirm the information with question tags, will you?',
        items: [
          M('You are applying for the nurse position, ___?', ["aren't you", 'are you', "don't you", "isn't it"], 'Oración afirmativa → tag negativo con el mismo auxiliar: are → aren\'t you.'),
          M("You don't need special training, ___?", ['do you', "don't you", 'are you', 'did you'], 'Oración negativa → tag afirmativo: don\'t → do you.'),
          M('You worked at a bakery before, ___?', ["didn't you", 'did you', "weren't you", "don't you"], 'Pasado simple afirmativo → didn\'t + sujeto.'),
          M("Your brother wasn't at the office, ___?", ['was he', "wasn't he", 'did he', 'is he'], 'Negativo con was → tag afirmativo "was he".'),
          M('She will come tomorrow, ___?', ["won't she", 'will she', "doesn't she", "isn't she"], 'Will → won\'t en el tag.'),
          T('It\'s a nice office, ___ it?', ["isn't", 'is not'], 'It is (afirmativo) → isn\'t it?')
        ] },
      { id: 'u1g2', k: 'GRAM', icon: '⏳', npc: 'Don Lucho', role: 'Retired baker', title: 'Past Habits',
        intro: 'Ay, the old days! Tell my story correctly with "used to".',
        items: [
          M('I ___ work at a coffee shop, but now I work at a bank.', ['used to', 'use to', 'am used', 'using to'], 'Hábito pasado afirmativo: used to + verbo base.'),
          M('She ___ to like her job, but now she loves it.', ["didn't use", "didn't used", "doesn't used", "wasn't use"], 'Con didn\'t el verbo vuelve a la base: didn\'t use to.'),
          M('___ you use to volunteer at the food bank?', ['Did', 'Do', 'Were', 'Have'], 'Pregunta: Did + sujeto + use to + verbo.'),
          O('I used to read for people at the community center.', 'Sujeto + used to + verbo + complemento.'),
          M('Choose the correct sentence.', ['We used to live near the port.', 'We used to lived near the port.', 'We use to lived near the port.', 'We did used to live near the port.'], 'Después de "used to" va el verbo en forma base: live.'),
          T('He ___ to be a pilot, but he retired in 2015. (use)', ['used'], 'Es un hábito o estado pasado afirmativo: used to.')
        ] },
      { id: 'u1g3', k: 'GRAM', icon: '💰', npc: 'Valentina', role: 'Young entrepreneur', title: 'Money & Purpose',
        intro: 'I am saving for my green startup. Help me with quantity and purpose!',
        items: [
          M('I can\'t buy it. I don\'t have ___ money.', ['enough', 'no', 'too', 'very'], 'En negativa usamos "not enough" (no suficiente).'),
          M('Some volunteers receive ___ money for their work.', ['no', 'not', "don't", 'enough not'], '"No + sustantivo" = nada de: no money.'),
          M('She has ___ time to finish, so she can relax.', ['enough', 'no', 'not', 'few'], 'Si puede relajarse, tiene tiempo suficiente: enough.'),
          M('He studied English ___ he could work abroad.', ['so that', 'although', 'because of', 'until'], '"So that" expresa propósito: para que / con el fin de.'),
          O('I save money so that I can travel next year.', '"So that" une la acción con su propósito.'),
          M('I go to the bank ___ a month.', ['once', 'one', 'ever', 'since'], '"Once a month" = una vez al mes.')
        ] },
      { id: 'u1w', k: 'WF', icon: '🔧', npc: 'Ingrid', role: 'Workshop teacher', title: 'Word Workshop',
        intro: 'Build job names with -er, -ist and -ess, and compound words!',
        items: [
          T('A person who works on a farm is a farm___.', ['er', 'farmer'], 'Sufijo -er: farm → farmer.'),
          T('A person who studies science is a scient___.', ['ist', 'scientist'], 'Sufijo -ist: science → scientist.'),
          M('A woman who serves food in a restaurant is a…', ['waitress', 'waitist', 'waiter-woman', 'waitor'], 'Sufijo -ess: waitress. Hoy también se usa "server".'),
          M('Which job takes photographs?', ['photographer', 'photographist', 'photographess', 'photographor'], 'photograph + -er = photographer.'),
          M('A person who writes news is a…', ['journalist', 'journaler', 'journaless', 'journalor'], 'journal + -ist = journalist.'),
          M('Which is a compound word for a person who protects swimmers?', ['lifeguard', 'bodyguard', 'firefighter', 'salesman'], 'life + guard: salvavidas.')
        ] },
      { id: 'u1l', k: 'LIST', icon: '🎧', npc: 'DJ Paz', role: 'Radio Worktown', title: 'Radio Worktown', listen: true,
        intro: 'You are on air! Listen carefully. You can replay each audio.',
        items: [
          { ...M('What job does Alice\'s mother do?', ['She is a nurse.', 'She is a teacher.', 'She is a pilot.', 'She is a cook.'], 'Alice dice: "My mother works as a nurse".'), audio: ['A: What does your mother do, Alice?', 'B: She works as a nurse at the local hospital. It is tiring, but she loves it.'] },
          { ...M('How does she feel about her job?', ['She loves it, although it is tiring.', 'She wants to quit.', 'She thinks it is boring.', 'She got fired.'], 'Escucha: "It is tiring, but she loves it".'), audio: ['A: What does your mother do, Alice?', 'B: She works as a nurse at the local hospital. It is tiring, but she loves it.'] },
          { ...M('Where did Tomás use to volunteer?', ['At a food bank', 'At a museum', 'At a school', 'At an airport'], 'Tomás dice "I used to volunteer at the food bank".'), audio: ['A: Do you still volunteer, Tomás?', 'B: Not anymore. I used to volunteer at the food bank, but it closed last year. Now I help at an animal shelter on Saturdays.'] },
          { ...M('Where does he help now?', ['At an animal shelter', 'At the food bank', 'At a hospital', 'He does not help now'], 'Dice: "Now I help at an animal shelter on Saturdays".'), audio: ['A: Do you still volunteer, Tomás?', 'B: Not anymore. I used to volunteer at the food bank, but it closed last year. Now I help at an animal shelter on Saturdays.'] },
          { ...M('Why does the candidate want the job?', ['She enjoys working with people.', 'The salary is very high.', 'It is close to her house.', 'Her friend works there.'], 'La candidata dice: "I really enjoy working with people".'), audio: ['A: Why are you interested in this receptionist position?', 'B: I really enjoy working with people, and I am very organized.', 'A: You speak English, don\'t you?', 'B: Yes, I do. I studied it for six years.'] },
          { ...M('How long did she study English?', ['Six years', 'Two years', 'Ten years', 'Six months'], 'Dice "I studied it for six years".'), audio: ['A: Why are you interested in this receptionist position?', 'B: I really enjoy working with people, and I am very organized.', 'A: You speak English, don\'t you?', 'B: Yes, I do. I studied it for six years.'] }
        ] },
      { id: 'u1p', k: 'PRON', icon: '🎤', npc: 'Yolanda', role: 'Voice coach', title: 'Sound /j/',
        intro: 'Say the /j/ sound as in YES. Your tongue goes up, like a soft "i". Do not say "ll" or "sh"!',
        items: [
          S('yes', 'Which word starts with the sound /j/?', ['yes', 'just', 'chess', 'jet'], '/j/ suena como una "i" suave: yes. No es "ye" fuerte ni "ch".'),
          S('year', 'Which word starts with /j/?', ['year', 'ear', 'jeer', 'hear'], 'Year /jɪə/ empieza con /j/. "Ear" empieza con vocal.'),
          S('young', 'Which word starts with /j/?', ['young', 'jungle', 'hung', 'gun'], 'Young /jʌŋ/ tiene la /j/ suave; "jungle" tiene /dʒ/.'),
          S('university', 'Which word starts with /j/, even with the letter U?', ['university', 'umbrella', 'under', 'uncle'], 'U en university suena /juː/.'),
          S('Europe', 'Which word starts with the sound /j/?', ['Europe', 'Egypt', 'England', 'Italy'], 'Europe se pronuncia /ˈjʊərəp/.'),
          S('yesterday I used a computer', 'Which word begins with /j/?', ['used', 'under', 'opened', 'asked'], 'Used empieza con /juː/.')
        ] },
      { id: 'u1r', k: 'READ', icon: '📰', npc: 'Camila', role: 'Editor, The Worktown Times', title: 'Risky Jobs',
        intro: 'Read today\'s article and answer my questions.',
        text: `RISKY JOBS, REAL PEOPLE\n\nSome jobs keep our world moving, but they can be dangerous. Roofers work at great heights, so they must wear safety equipment and check the weather every morning. Forest workers cut down trees with heavy machines in isolated places, where help can take hours to arrive. Pilots seem to have a glamorous job, yet they carry the responsibility for hundreds of lives and must follow strict safety protocols so that every flight is safe.\n\nWhy do people choose these jobs? For some, the salary is the main reason. Others love adventure or feel proud of helping their community. Marta, a 34-year-old firefighter from Valparaíso, used to work in an office. "I earned enough money, but I felt empty," she says. "Now I am tired every night, but I know my work matters."`,
        items: [
          M('What must roofers do every morning?', ['Check the weather', 'Cut down trees', 'Fly a plane', 'Call a doctor'], 'El texto: "check the weather every morning".'),
          M('Why is an accident in the forest especially serious?', ['Help can take a long time to arrive.', 'Trees are expensive.', 'Workers have no salary.', 'There are too many people.'], 'Dice que están en lugares aislados y la ayuda puede tardar horas.'),
          M('What does "glamorous" suggest about a pilot\'s job?', ['It looks exciting and attractive.', 'It is boring and simple.', 'It is badly paid.', 'It is only for women.'], 'Se contrasta con "yet": parece atractivo, pero es de mucha responsabilidad.'),
          M('Why did Marta leave her office job?', ['It did not feel meaningful.', 'She got fired.', 'The salary was too low.', 'The office closed.'], '"I earned enough money, but I felt empty": le faltaba sentido.'),
          M('What is the main idea of the text?', ['People do dangerous jobs for different reasons.', 'Pilots earn more than firefighters.', 'Everybody should quit office jobs.', 'Safety equipment is too expensive.'], 'El texto presenta trabajos riesgosos y por qué la gente los elige.')
        ] }
    ],
    party: { id: 'u1x', title: 'Rescue the Job Fair', npc: 'Ms. Rivera',
      intro: 'The Job Fair signs are broken! Each teammate has a different clue. Share them by talking and choose the SAME answer together.',
      clues: ['Clue 1: Ana loves animals and studied for six years at university.', 'Clue 2: Ben is very good at fixing lights and cables.', 'Clue 3: Carla writes news stories and interviews people.', 'Clue 4: Diego used to work in a kitchen and makes delicious food.'],
      items: [
        M('Who should get the job as a journalist?', ['Carla', 'Ben', 'Ana', 'Diego'], 'Clue 3: Carla escribe noticias.'),
        M('Who should get the job as an electrician?', ['Ben', 'Carla', 'Diego', 'Ana'], 'Clue 2: Ben arregla luces y cables.'),
        M('Who is the best candidate to be a veterinarian?', ['Ana', 'Diego', 'Ben', 'Carla'], 'Clue 1: Ana ama a los animales y estudió seis años.'),
        M('Who used to have a job as a cook?', ['Diego', 'Carla', 'Ana', 'Ben'], 'Clue 4: Diego trabajaba en una cocina.')
      ] }
  },
  /* ===================== UNIT 2 ===================== */
  {
    id: 2, name: 'Education and Lifelong Learning', place: 'Scholar Woods', color: '#3fb56b', big: 'Is there an age limit for learning?',
    goal: 'Restore the Great Library of Scholar Woods.',
    quests: [
      { id: 'u2v', k: 'VOC', icon: '📚', npc: 'Prof. Aravena', role: 'Head librarian', title: 'Lost Book Titles',
        intro: 'The owls mixed up my catalog. Help me put the words back!',
        items: [
          M('Learning throughout your whole life is called…', ['lifelong learning', 'early childhood', 'homework', 'graduation'], '"Lifelong" = que dura toda la vida.'),
          M('If you leave school before finishing, you…', ['drop out', 'catch on', 'keep up', 'move forward'], '"Drop out (of school)" = abandonar los estudios.'),
          M('Money given to a student to pay for studies is a…', ['scholarship', 'salary', 'certificate', 'textbook'], '"Scholarship" = beca.'),
          M('The ability to read and write is called…', ['literacy', 'perseverance', 'attitude', 'percentage'], '"Literacy" = alfabetización.'),
          M('To continue trying even when it is hard shows…', ['perseverance', 'irresponsibility', 'laziness', 'failure'], '"Perseverance" = perseverancia.'),
          M('Something you must do by law at school is…', ['compulsory', 'reliable', 'optional', 'well known'], '"Compulsory" = obligatorio.'),
          T('Don\'t give ___! You can pass the exam.', ['up'], '"Give up" = rendirse.'),
          M('"She caught on quickly" means she…', ['understood quickly', 'ran quickly', 'left quickly', 'forgot quickly'], '"Catch on" = entender, captar.')
        ] },
      { id: 'u2g1', k: 'GRAM', icon: '🔮', npc: 'Madame Luna', role: 'Fortune owl keeper', title: 'Plans & Possibilities',
        intro: 'Look into my crystal ball. How sure are we about the future?',
        items: [
          M('I\'m not sure, but it ___ rain later.', ['might', 'must', 'will definitely', 'has'], '"Might" = posibilidad, no hay certeza.'),
          M('It will ___ rain tomorrow; the sky is very dark.', ['probably', 'never', 'ever', 'since'], '"Will probably" = muy posiblemente.'),
          M('She has already enrolled. She will ___ start classes in March.', ['definitely', 'maybe', 'hardly', 'possibly not'], 'Ya se matriculó: certeza = definitely.'),
          M('Choose the correct word order.', ['They will probably study abroad.', 'They probably will to study abroad.', 'They will study probably to abroad.', 'Probably they will to study abroad.'], 'Will + adverbio + verbo base.'),
          M('You ___ hurry. We have plenty of time.', ["needn't", "mustn't", 'should', 'have to'], '"Needn\'t" = no es necesario.'),
          O('I might take an online course next year.', 'Might + verbo base expresa posibilidad.')
        ] },
      { id: 'u2g2', k: 'GRAM', icon: '🕰️', npc: 'Grandpa Óscar', role: '72-year-old student', title: 'Never Too Late',
        intro: 'I went back to school at 70! Talk about my life with the present perfect.',
        items: [
          M('___ you ever studied online?', ['Have', 'Did', 'Do', 'Are'], 'Present perfect: Have + sujeto + participio.'),
          M('I have never ___ an exam in English.', ['taken', 'took', 'take', 'taking'], 'Participio de take: taken.'),
          M('She has worked here ___ 2010.', ['since', 'for', 'ago', 'during'], '"Since" + punto de inicio (2010).'),
          M('We have been friends ___ two years.', ['for', 'since', 'ago', 'from'], '"For" + duración (two years).'),
          M('___ have you been part of the group?', ['How long', 'How much', 'How many', 'How often'], '"How long" pregunta por duración.'),
          T('I have ___ (save) money to buy a bike.', ['saved'], 'Verbo regular: save → saved.')
        ] },
      { id: 'u2g3', k: 'GRAM', icon: '🔗', npc: 'Nayeli', role: 'Exchange student', title: 'Bridges of Words',
        intro: 'I came from Mexico to study here. Help me connect my ideas with "both" and time words.',
        items: [
          M('English is useful for ___ trade and science.', ['both', 'either', 'neither', 'so'], '"Both A and B" = tanto A como B.'),
          M('___ my sister and I study languages.', ['Both', 'Too', 'Also', 'Each'], 'Both + A and B al inicio.'),
          M('I studied French five years ___.', ['ago', 'since', 'for', 'before of'], '"Ago" va después del período en pasado.'),
          M('I study English ___ a week.', ['twice', 'two', 'second', 'double'], '"Twice a week" = dos veces por semana.'),
          O('Both teachers and students use the digital library.', 'Both + sustantivo + and + sustantivo.'),
          M('I\'ll talk to you ___.', ['later', 'ago', 'since', 'already'], '"Later" = más tarde.')
        ] },
      { id: 'u2w', k: 'WF', icon: '🧩', npc: 'Iris', role: 'Word gardener', title: 'The IR- Garden',
        intro: 'Prefix ir- makes opposites. Let\'s plant some words!',
        items: [
          T('The opposite of "responsible" is ___.', ['irresponsible'], 'ir + responsible.'),
          T('The opposite of "regular" is ___.', ['irregular'], 'ir + regular: "irregular verbs".'),
          M('Information that is not important for the topic is…', ['irrelevant', 'irregular', 'irrational', 'reliable'], '"Irrelevant" = que no viene al caso.'),
          M('A fear with no logical reason is…', ['irrational', 'irrelevant', 'responsible', 'regular'], '"Irrational" = sin lógica.'),
          M('Which compound word means a book for school?', ['textbook', 'bookmark', 'bookcase', 'notebook'], 'text + book = texto de estudio.'),
          M('Which word is a compound?', ['teenager', 'attitude', 'reliable', 'degree'], 'teen + ager = adolescente.')
        ] },
      { id: 'u2l', k: 'LIST', icon: '🎧', npc: 'Rafa', role: 'Podcast host', title: 'Podcast in the Woods', listen: true,
        intro: 'Today\'s podcast is about studying abroad. Listen!',
        items: [
          { ...M('How long has Jo been in Japan?', ['For a year', 'For a month', 'Since 2010', 'For five years'], 'Dice "I have been here for a year".'), audio: ['A: How long have you been in Japan, Jo?', 'B: I have been here for a year now. At first it was hard, but I have made great friends.'] },
          { ...M('How does Jo feel now?', ['Happier, with great friends', 'Lonely and sad', 'Ready to give up', 'Angry at school'], 'Dice "I have made great friends".'), audio: ['A: How long have you been in Japan, Jo?', 'B: I have been here for a year now. At first it was hard, but I have made great friends.'] },
          { ...M('What will Sofía probably study?', ['Science or technology', 'Music', 'Law', 'History'], 'Sofía: "Probably something in science or technology".'), audio: ['A: What will you study after school, Sofía?', 'B: Probably something in science or technology. And you?', 'A: I will definitely be a teacher. I had a fantastic English teacher, and I want to help students too.'] },
          { ...M('Why does the other student want to be a teacher?', ['A great teacher inspired them.', 'Teachers earn a lot.', 'Their parents told them to.', 'It is easy.'], '"I had a fantastic English teacher".'), audio: ['A: What will you study after school, Sofía?', 'B: Probably something in science or technology. And you?', 'A: I will definitely be a teacher. I had a fantastic English teacher, and I want to help students too.'] },
          { ...M('Why did Rosa go back to school?', ['She wanted to read to her grandchildren.', 'She needed a new job.', 'Her boss told her to.', 'She won a scholarship.'], 'Dice que quería leerles a sus nietos.'), audio: ['A: You started school at sixty-five, Rosa. Why?', 'B: I dropped out when I was ten. I wanted to read stories to my grandchildren, so I never gave up.'] },
          { ...M('When did Rosa drop out of school?', ['At age ten', 'At sixty-five', 'At fifteen', 'She never went'], '"I dropped out when I was ten".'), audio: ['A: You started school at sixty-five, Rosa. Why?', 'B: I dropped out when I was ten. I wanted to read stories to my grandchildren, so I never gave up.'] }
        ] },
      { id: 'u2p', k: 'PRON', icon: '🎤', npc: 'Trini', role: 'Tongue twister champion', title: 'Sounds /tr/ & /dr/',
        intro: 'For /tr/ and /dr/, curl your tongue back. Train! Dream! Do not separate the letters.',
        items: [
          S('train', 'Which word starts with /tr/?', ['train', 'drain', 'chain', 'rain'], '/tr/: lengua atrás, sin vibrar las cuerdas vocales.'),
          S('dream', 'Which word starts with /dr/?', ['dream', 'cream', 'team', 'tree'], '/dr/: como /tr/, pero con vibración.'),
          S('travel', 'Which word starts with /tr/?', ['travel', 'gravel', 'drive', 'level'], 'Travel /ˈtrævəl/.'),
          S('driver', 'Which word starts with /dr/?', ['driver', 'river', 'trumpet', 'diver'], 'Driver /ˈdraɪvər/.'),
          S('true', 'Which word has the same first sound as "track"?', ['true', 'drew', 'chew', 'do'], 'True y track empiezan con /tr/.'),
          S('I dream of a trip by train', 'Which word starts with /dr/?', ['dream', 'trip', 'train', 'try'], 'Dream es la única con /dr/.')
        ] },
      { id: 'u2r', k: 'READ', icon: '📖', npc: 'Abuela Rosa', role: 'Lifelong learner', title: 'The Power of Learning',
        intro: 'This story changed my life. Read it, dear.',
        text: `NEVER TOO OLD TO LEARN\n\nFor a long time, people believed that education ended when you finished school. Today, we know that the brain can keep learning at any age. Lifelong learning means continuing to develop skills and knowledge throughout your life, inside or outside a classroom.\n\nIn a small town in southern Chile, a group of grandmothers meets every Tuesday to learn how to read and use a smartphone. Most of them dropped out of school to work on their family farms. "We probably never had the chance to go past second grade," says Elsa, 68. "Now I send messages to my grandson in Canada." Their teacher, a 17-year-old volunteer, says she has learned too: "They have taught me patience and perseverance." Learning, it seems, travels in both directions.`,
        items: [
          M('What is lifelong learning?', ['Developing skills throughout your life', 'Studying only at university', 'Finishing school early', 'Learning only languages'], 'Definición en el primer párrafo.'),
          M('Why did most of the grandmothers leave school?', ['To work on family farms', 'They disliked reading', 'The school closed', 'They moved to Canada'], '"Dropped out of school to work on their family farms".'),
          M('What can Elsa do now?', ['Send messages to her grandson', 'Teach at university', 'Drive a truck', 'Speak French'], '"Now I send messages to my grandson in Canada".'),
          M('What has the young teacher learned?', ['Patience and perseverance', 'How to farm', 'A new language', 'How to fix phones'], 'Lo dice en su cita final.'),
          M('"Learning travels in both directions" suggests that…', ['teachers and students learn from each other', 'students must travel to learn', 'only old people learn', 'teachers never make mistakes'], 'La voluntaria enseña y también aprende de las abuelas.')
        ] }
    ],
    party: { id: 'u2x', title: 'The Library Code', npc: 'Prof. Aravena',
      intro: 'The Great Library is locked. Each scholar holds a different page. Talk, compare your clues and vote for the same answer.',
      clues: ['Page 1: Lía has studied Korean since 2022.', 'Page 2: Max got a scholarship for a science degree.', 'Page 3: Rocío dropped out at 15, but she went back at 30.', 'Page 4: Tom might take an online course, but he is not sure.'],
      items: [
        M('Who is an example of perseverance in education?', ['Rocío', 'Max', 'Lía', 'Tom'], 'Page 3: Rocío volvió a estudiar a los 30.'),
        M('Who received money to study?', ['Max', 'Tom', 'Rocío', 'Lía'], 'Page 2: una beca (scholarship).'),
        M('Whose plan is only a possibility?', ['Tom', 'Lía', 'Max', 'Rocío'], 'Page 4: "might" indica posibilidad.'),
        M('Whose action started in the past and continues now?', ['Lía', 'Rocío', 'Tom', 'Max'], 'Page 1: "has studied… since 2022".')
      ] }
  },
  /* ===================== UNIT 3 ===================== */
  {
    id: 3, name: 'The Arts', place: 'Canvas Canyon', color: '#d9539b', big: 'What is the purpose of art?',
    goal: 'Bring color back to the Museum of Canvas Canyon.',
    quests: [
      { id: 'u3v', k: 'VOC', icon: '🎨', npc: 'Violeta', role: 'Museum curator', title: 'The Gray Museum',
        intro: 'Someone stole the colors from my museum! Each right word brings one back.',
        items: [
          M('A person who leads an orchestra is the…', ['conductor', 'composer', 'publisher', 'sculptor'], '"Conductor" = director de orquesta.'),
          M('A person who writes music is a…', ['composer', 'scriptwriter', 'dancer', 'editor'], '"Composer" = compositor/a.'),
          M('A painting made with water-based paint is a…', ['watercolor', 'sculpture', 'mosaic', 'novel'], '"Watercolor" = acuarela.'),
          M('The raised area where actors perform is the…', ['stage', 'script', 'gallery', 'bookstore'], '"Stage" = escenario.'),
          M('The written text of a play or film is the…', ['script', 'keyboard', 'harp', 'canvas'], '"Script" = guion.'),
          M('Art made of small colored pieces is a…', ['mosaic', 'fresco', 'ballet', 'poem'], '"Mosaic" = mosaico.'),
          T('Drums are ___ instruments. (p…)', ['percussion'], 'Instrumentos de percusión: se golpean.'),
          M('A violin is a ___ instrument.', ['string', 'wind', 'percussion', 'wooden-wind'], 'Tiene cuerdas: string instrument.')
        ] },
      { id: 'u3g1', k: 'GRAM', icon: '🖌️', npc: 'Banksito', role: 'Street artist', title: 'Rules of the Wall',
        intro: 'On my wall, some things are frequent and some are not necessary. Tell me which!',
        items: [
          M('Art ___ provides a safe space. It happens every time.', ['always', 'never', 'rarely', 'hardly ever'], '"Always" = 100% de las veces.'),
          M('She ___ goes to museums; maybe once a year.', ['rarely', 'always', 'usually', 'often'], '"Rarely" = casi nunca.'),
          M('Choose the correct position.', ['He often paints at night.', 'He paints often at night always.', 'Often he does paints at night.', 'He often is paint at night.'], 'El adverbio de frecuencia va antes del verbo principal.'),
          M('You ___ know the artist\'s name to enjoy the work.', ["needn't", "mustn't", 'must', 'should'], '"Needn\'t" = no es necesario.'),
          M('People ___ rush through the exhibition; there is plenty of time.', ["needn't", 'must', 'have', "aren't"], 'No hay obligación de apurarse.'),
          O('You needn\'t buy a ticket for the street show.', 'Needn\'t + verbo base, sin "to".')
        ] },
      { id: 'u3g2', k: 'GRAM', icon: '🎻', npc: 'Maestro Soto', role: 'Instrument maker', title: 'Describe the Treasure',
        intro: 'Adjectives have an order: opinion, size, age, color, origin, material, noun!',
        items: [
          M('Choose the correct order.', ['a beautiful old wooden violin', 'a wooden old beautiful violin', 'an old wooden beautiful violin', 'a beautiful wooden old violin'], 'Opinión → edad → material.'),
          M('Choose the correct order.', ['a large red Chilean poster', 'a red large Chilean poster', 'a Chilean red large poster', 'a large Chilean red poster'], 'Tamaño → color → origen.'),
          M('It\'s an ___ musical instrument.', ['old wooden', 'wooden old', 'old wood', 'wood oldest'], 'Edad antes de material.'),
          M('Which word is a material?', ['velvet', 'elegant', 'antique', 'huge'], 'Velvet = terciopelo.'),
          O('She bought a small antique metal lamp.', 'Tamaño → edad → material → sustantivo.'),
          M('Choose the best description.', ['an amazing small silver flute', 'a silver small amazing flute', 'a small silver amazing flute', 'an amazing silver small flute'], 'Opinión → tamaño → material.')
        ] },
      { id: 'u3g3', k: 'GRAM', icon: '🏛️', npc: 'Ella', role: 'Jazz singer', title: 'Passive Stage',
        intro: 'When the action matters more than the person, we use the passive voice.',
        items: [
          M('The museum ___ every day at 9.', ['is cleaned', 'cleans', 'is clean', 'cleaned'], 'Presente pasivo: is/are + participio.'),
          M('This mural ___ in 1970.', ['was painted', 'is paint', 'painted', 'were painted'], 'Pasado pasivo singular: was + participio.'),
          M('Millions of albums ___ sold.', ['have been', 'has been', 'was', 'is'], 'Plural + have been + participio.'),
          M('Plastic ___ from oil.', ['is produced', 'produces', 'is produce', 'producing'], 'Proceso: is produced.'),
          T('The novel was ___ (write) by Isabel Allende.', ['written'], 'Participio de write: written.'),
          M('Change to passive: "Neruda wrote this poem."', ['This poem was written by Neruda.', 'This poem wrote by Neruda.', 'This poem is write by Neruda.', 'Neruda was written this poem.'], 'Objeto + was + participio + by + agente.')
        ] },
      { id: 'u3w', k: 'WF', icon: '🖼️', npc: 'Pía', role: 'Studio assistant', title: 'Name the Artist',
        intro: 'Use -er, -or and -ist to name each artist. Then find the compounds!',
        items: [
          T('A person who plays the piano is a pian___.', ['ist', 'pianist'], 'piano → pianist.'),
          T('A person who plays the drums is a drumm___.', ['er', 'drummer'], 'drum → drummer (duplica la m).'),
          M('A person who plays the violin is a…', ['violinist', 'violiner', 'violinor', 'violiness'], 'violin + -ist.'),
          M('A person who sculpts is a…', ['sculptor', 'sculpter', 'sculptist', 'sculptess'], 'Termina en -or: sculptor.'),
          M('Which compound is the area behind the stage?', ['backstage', 'onstage', 'keynote', 'bookstore'], 'back + stage.'),
          M('Which compound holds your page in a book?', ['bookmark', 'bookcase', 'headphones', 'keyboard'], 'book + mark = marcador.')
        ] },
      { id: 'u3l', k: 'LIST', icon: '🎧', npc: 'Guía Tomasa', role: 'Museum guide', title: 'Audio Guide', listen: true,
        intro: 'Put on the headphones and follow the audio guide.',
        items: [
          { ...M('When did Jonas start creating digital art?', ['Three years ago', 'Last week', 'Ten years ago', 'In 1990'], 'Dice "I started three years ago".'), audio: ['A: When did you start creating digital art, Jonas?', 'B: I started three years ago. A piece usually takes me about two weeks.'] },
          { ...M('How long does a piece take?', ['About two weeks', 'Two hours', 'Three years', 'One day'], '"Usually takes me about two weeks".'), audio: ['A: When did you start creating digital art, Jonas?', 'B: I started three years ago. A piece usually takes me about two weeks.'] },
          { ...M('What is special about this room?', ['It has antique wooden furniture.', 'It is completely empty.', 'It is a modern kitchen.', 'It has no windows.'], 'La guía menciona "antique wooden furniture".'), audio: ['Welcome to the grand salon. Please admire the magnificent antique wooden furniture and the elegant velvet curtains. You needn\'t hurry.'] },
          { ...M('What does the guide tell visitors?', ['They do not have to hurry.', 'They must leave now.', 'They cannot take a look.', 'They must buy a ticket.'], '"You needn\'t hurry" = no hay apuro.'), audio: ['Welcome to the grand salon. Please admire the magnificent antique wooden furniture and the elegant velvet curtains. You needn\'t hurry.'] },
          { ...M('Who painted the mural?', ['A group of local teenagers', 'A famous French artist', 'The mayor', 'Nobody knows'], 'Dice "was painted by a group of local teenagers".'), audio: ['This colorful mural was painted by a group of local teenagers in 2021. It was made with recycled paint, and it tells the story of our port.'] },
          { ...M('What was special about the paint?', ['It was recycled.', 'It was very expensive.', 'It came from Italy.', 'It was invisible.'], '"It was made with recycled paint".'), audio: ['This colorful mural was painted by a group of local teenagers in 2021. It was made with recycled paint, and it tells the story of our port.'] }
        ] },
      { id: 'u3p', k: 'PRON', icon: '🎤', npc: 'Bea', role: 'Choir director', title: 'Sounds /ɪ/ & /iː/',
        intro: '/iː/ is long with a smile: beat. /ɪ/ is short and relaxed: bit. Careful, they change the meaning!',
        items: [
          S('beat', 'Which word has the LONG sound /iː/?', ['beat', 'bit', 'sit', 'fill'], 'Beat: sonido largo, labios estirados.'),
          S('bit', 'Which word has the SHORT sound /ɪ/?', ['bit', 'beat', 'seat', 'feel'], 'Bit: corto y relajado.'),
          S('read', 'Which word rhymes with "feed"?', ['read', 'rid', 'red', 'rod'], 'Read (presente) /riːd/ tiene /iː/.'),
          S('sit', 'Which word has /ɪ/?', ['sit', 'seat', 'see', 'sea'], 'Sit: /ɪ/ corta.'),
          S('sheep', 'Which word has /iː/?', ['sheep', 'ship', 'chip', 'lip'], 'Sheep /ʃiːp/; ship /ʃɪp/.'),
          S('this piece is really great', 'Which word has a LONG /iː/?', ['piece', 'this', 'is', 'it'], 'Piece /piːs/.')
        ] },
      { id: 'u3r', k: 'READ', icon: '🖼️', npc: 'Lautaro', role: 'Young muralist', title: 'Art That Speaks',
        intro: 'This article explains why I paint. Read it!',
        text: `WALLS THAT SPEAK\n\nWhen teenagers cannot find the words for what they feel, art often gives them a voice. In many Chilean cities, young people paint murals about the environment, memory, and equality. These works are not hidden in a museum; they can be seen by everyone who walks past them.\n\nIn Valparaíso, a project called "Cerro Vivo" invites students to paint old walls in their neighborhoods. Before they paint, they talk to their neighbors and listen to their stories. "You needn't be a professional," says the project's coordinator. "You only need something to say." Over 40 walls have been painted so far, and residents say their streets feel safer and more alive. For many participants, art has become more than a hobby: it is a way to change the place where they live.`,
        items: [
          M('According to the text, why do teens use art?', ['To express what they feel', 'To earn money fast', 'To avoid school', 'To copy famous artists'], '"Art often gives them a voice".'),
          M('How are murals different from museum art?', ['Everyone can see them in the street.', 'They are more expensive.', 'They are always small.', 'Only artists can see them.'], '"Not hidden in a museum".'),
          M('What do students do BEFORE painting?', ['Talk to their neighbors', 'Buy a ticket', 'Take an exam', 'Visit Santiago'], '"They talk to their neighbors and listen to their stories".'),
          M('"You needn\'t be a professional" means…', ['anyone can participate', 'professionals are not allowed', 'you must study art', 'painting is forbidden'], 'No es necesario ser profesional.'),
          M('What effect has the project had?', ['Streets feel safer and more alive.', 'Fewer tourists visit.', 'Walls were demolished.', 'Students stopped studying.'], 'Lo dicen los vecinos al final.')
        ] }
    ],
    party: { id: 'u3x', title: 'The Museum Heist', npc: 'Violeta',
      intro: 'Four works of art are missing! Each detective has one witness report. Compare them and agree on the answers.',
      clues: ['Report 1: The stolen violin is small, old and wooden.', 'Report 2: The painting was made by a Chilean woman in 1950.', 'Report 3: The sculptor always works at night in the canyon.', 'Report 4: The thief wore a long red velvet coat.'],
      items: [
        M('Which is the correct description of the violin?', ['a small old wooden violin', 'a wooden small old violin', 'an old small wooden violin', 'a small wooden old violin'], 'Report 1 + orden: tamaño → edad → material.'),
        M('Which sentence is true about the painting?', ['It was painted by a Chilean woman.', 'It paints a Chilean woman.', 'It is painting in 1950.', 'It was paint by a man.'], 'Report 2, en voz pasiva.'),
        M('When does the sculptor work?', ['Always at night', 'Never at night', 'Rarely at night', 'Only in the morning'], 'Report 3.'),
        M('What did the thief wear?', ['a long red velvet coat', 'a red long velvet coat', 'a velvet long red coat', 'a long velvet red coat'], 'Report 4: tamaño → color → material.')
      ] }
  },
  /* ===================== UNIT 4 ===================== */
  {
    id: 4, name: 'Traditions and Festivities', place: 'Fiesta Coast', color: '#3f8fe0', big: 'Why do traditions matter?',
    goal: 'Light the Great Lantern and save the festival of Fiesta Coast.',
    quests: [
      { id: 'u4v', k: 'VOC', icon: '🎭', npc: 'Don Pascual', role: 'Festival organizer', title: 'Festival Preparations',
        intro: 'The festival starts soon and nothing is ready. Help me with the list!',
        items: [
          M('A place full of people is…', ['crowded', 'peaceful', 'empty', 'quiet'], '"Crowded" = lleno de gente.'),
          M('A person who travels to a holy place is a…', ['pilgrim', 'performer', 'saint', 'tourist guide'], '"Pilgrim" = peregrino/a.'),
          M('The time when crops are collected is the…', ['harvest', 'carnival', 'parade', 'greeting'], '"Harvest" = cosecha.'),
          M('Something you strongly think is true is a…', ['belief', 'mask', 'lantern', 'handshake'], '"Belief" = creencia.'),
          M('Objects made by hand are…', ['handmade', 'homework', 'moonlight', 'crowded'], 'hand + made.'),
          M('Bright explosions in the night sky are…', ['fireworks', 'lanterns', 'shipwrecks', 'costumes'], '"Fireworks" = fuegos artificiales.'),
          T('La Tirana is a religious ___ in northern Chile. (f…)', ['festivity', 'festival', 'celebration'], 'Festivity / festival = fiesta.'),
          M('To honor someone is to pay ___.', ['homage', 'attention', 'money', 'visit'], '"Pay homage" = rendir homenaje.')
        ] },
      { id: 'u4g1', k: 'GRAM', icon: '⚖️', npc: 'Mateo', role: 'Travel blogger', title: 'Yes, but…',
        intro: 'Festivals are amazing, although they can be exhausting. Contrast my ideas!',
        items: [
          M('___ it was crowded, it was so much fun.', ['Although', 'Because', 'So that', 'Both'], '"Although" presenta un contraste.'),
          M('I\'d love to go, ___ I have never been there.', ['though', 'so', 'because', 'since'], '"Though" une dos ideas en contraste.'),
          M('Choose the correct sentence.', ['Although it\'s cheap, I\'m not sure.', 'Although it\'s cheap, but I\'m not sure.', 'Although cheap it\'s, I\'m not sure.', 'It\'s although cheap I\'m not sure.'], 'No se usa "but" junto con "although".'),
          O('Although it rained, the parade continued.', 'Although + idea, + idea principal.'),
          M('___ don\'t we go to the carnival?', ['Why', 'What', 'How', 'Who'], '"Why don\'t we…?" sirve para sugerir.'),
          M('She went to the party ___ she was tired.', ['although', 'so that', 'because of', 'both'], 'Fue a pesar de estar cansada.')
        ] },
      { id: 'u4g2', k: 'GRAM', icon: '🏮', npc: 'Mei', role: 'Lantern maker', title: 'Who or Which?',
        intro: 'Give extra information about people with WHO and about things with WHICH.',
        items: [
          M('Simon is the boy ___ lives next door.', ['who', 'which', 'where', 'what'], 'Personas: who.'),
          M('The book, ___ I borrowed, is interesting.', ['which', 'who', 'where', 'when'], 'Cosas: which.'),
          M('April Fools\' Day, ___ falls on April 1st, is fun.', ['which', 'who', 'what', 'whose'], 'Información adicional sobre una cosa.'),
          M('The dancers, ___ came from Chiloé, were amazing.', ['who', 'which', 'what', 'where'], 'Dancers = personas: who.'),
          O('The lantern, which is handmade, is very colorful.', 'La cláusula con which va entre comas.'),
          T('Violeta Parra, ___ wrote "Gracias a la vida", was Chilean.', ['who'], 'Persona: who.')
        ] },
      { id: 'u4g3', k: 'GRAM', icon: '🌡️', npc: 'Sra. Huenchul', role: 'Mapuche weaver', title: 'How Much?',
        intro: 'Words like quite, really and extremely show degree. Numbers show quantity!',
        items: [
          M('In some countries, that gesture is ___ rude: never do it!', ['extremely', 'hardly', 'barely', 'a bit not'], '"Extremely" = muy alto grado.'),
          M('It\'s ___ good, but not perfect.', ['quite', 'entirely', 'extremely', 'never'], '"Quite" = bastante.'),
          M('I could ___ see the parade. There were too many people!', ['hardly', 'really', 'quite', 'entirely'], '"Hardly" = apenas.'),
          M('Which number is correct?', ['two thousand people', 'two thousands people', 'two thousands of people', 'two thousand of people'], 'Con número, thousand no lleva -s.'),
          M('"One million" visitors means…', ['1,000,000', '100,000', '10,000', '1,000'], 'One million = un millón.'),
          M('The dance was ___ wonderful. I loved it!', ['really', 'barely', 'hardly', 'not'], '"Really" intensifica.')
        ] },
      { id: 'u4w', k: 'WF', icon: '🎀', npc: 'Florencia', role: 'Costume designer', title: 'Colorful Words',
        intro: 'Add -ful and dis- to make my costumes shine!',
        items: [
          T('Full of color: color___.', ['ful', 'colorful'], 'Sufijo -ful (con una sola l).'),
          T('Full of wonder: wonder___.', ['ful', 'wonderful'], 'wonder + ful.'),
          M('Someone happy and positive is…', ['cheerful', 'careful', 'powerful', 'successful'], '"Cheerful" = alegre.'),
          T('The opposite of "agree" is ___.', ['disagree'], 'Prefijo dis-.'),
          T('The opposite of "appear" is ___.', ['disappear'], 'dis + appear.'),
          M('Not showing respect is…', ['disrespectful', 'respectless', 'unrespectful', 'irrespect'], 'dis + respect + ful.')
        ] },
      { id: 'u4l', k: 'LIST', icon: '🎧', npc: 'Radio Fiesta', role: 'Live from the coast', title: 'Live from the Festival', listen: true,
        intro: 'We are live from the festival. Listen to the reports.',
        items: [
          { ...M('When does the Chiloé festival take place?', ['In February', 'In July', 'In December', 'In May'], '"Third weekend of February".'), audio: ['Every year, on the third weekend of February, thousands of visitors come to Castro. They try traditional food like curanto and enjoy local music.'] },
          { ...M('What can visitors eat?', ['Curanto', 'Sushi', 'Pizza', 'Tacos'], 'Se menciona curanto.'), audio: ['Every year, on the third weekend of February, thousands of visitors come to Castro. They try traditional food like curanto and enjoy local music.'] },
          { ...M('Why did the speaker enjoy the carnival?', ['The music and dancing were great.', 'It was empty.', 'The food was free.', 'It was short.'], 'Dice "the music and dancing were great".'), audio: ['A: How was the carnival?', 'B: Although it was very crowded, the music and dancing were great. I hardly slept!'] },
          { ...M('"I hardly slept" means the speaker…', ['slept very little', 'slept very well', 'slept all day', 'worked hard'], '"Hardly" = casi no.'), audio: ['A: How was the carnival?', 'B: Although it was very crowded, the music and dancing were great. I hardly slept!'] },
          { ...M('In which country is bowing a common greeting?', ['Japan', 'Chile', 'Brazil', 'Spain'], 'Se menciona Japón.'), audio: ['Greetings change around the world. In Japan, people bow to show respect. In Chile, friends usually hug or give a kiss on the cheek.'] },
          { ...M('How do friends often greet each other in Chile?', ['With a hug or a kiss on the cheek', 'With a bow', 'With a high five only', 'They do not greet'], 'Dice "hug or give a kiss on the cheek".'), audio: ['Greetings change around the world. In Japan, people bow to show respect. In Chile, friends usually hug or give a kiss on the cheek.'] }
        ] },
      { id: 'u4p', k: 'PRON', icon: '🎤', npc: 'Celia', role: 'Festival announcer', title: 'Sound /ʃən/',
        intro: 'The ending -tion sounds /ʃən/, like "shun". Never "ción"!',
        items: [
          S('celebration', 'How does -tion sound in "celebration"?', ['/ʃən/ (shun)', '/sjon/ (sión)', '/tion/ (ti-on)', '/tʃon/ (chon)'], 'Celebration /ˌseləˈbreɪʃən/.'),
          S('location', 'Which word ends in the same sound as "nation"?', ['location', 'lion', 'million', 'onion'], '-tion = /ʃən/.'),
          S('destination', 'Where is the stress in "destination"?', ['des-ti-NA-tion', 'DES-ti-na-tion', 'des-TI-na-tion', 'des-ti-na-TION'], 'El acento va antes de -tion.'),
          S('information', 'Which is the stressed syllable in "information"?', ['MA', 'IN', 'FOR', 'TION'], 'in-for-MA-tion.'),
          S('imagination', 'Which word ends in /ʃən/?', ['imagination', 'imagine', 'image', 'magic'], 'Termina en -tion.'),
          S('this celebration needs imagination', 'How many words end in /ʃən/?', ['Two', 'One', 'Three', 'None'], 'Celebration e imagination.')
        ] },
      { id: 'u4r', k: 'READ', icon: '🗺️', npc: 'Antonia', role: 'Tourist guide', title: 'A Land of Festivities',
        intro: 'Before you explore, read about Chilean traditions.',
        text: `A LAND FULL OF FESTIVITIES\n\nFrom the desert to Patagonia, Chile celebrates all year round. In July, thousands of pilgrims travel to La Tirana, a small town in the Atacama Desert. Dancers, who wear colorful masks and costumes, perform for days to honor the Virgin. Although the nights are extremely cold, the streets are always full of music.\n\nFurther south, in Chiloé, neighbors still practice the minga, a tradition of working together without payment. Sometimes a whole community moves a wooden house across the land or even across the sea, using oxen and boats! Afterward, the owners thank everyone with a big meal. In June, Mapuche communities celebrate We Tripantu, which marks the new year and the return of the sun. These traditions remind us that identity is built together, and that what we inherit must be cared for.`,
        items: [
          M('Why do pilgrims go to La Tirana?', ['To honor the Virgin', 'To work in mines', 'To see the sea', 'To buy a house'], '"To honor the Virgin".'),
          M('What is a minga?', ['Working together without payment', 'A type of mask', 'A typical dish', 'A desert town'], 'Definición del párrafo 2.'),
          M('How do owners thank their neighbors?', ['With a big meal', 'With money', 'With a new house', 'With a boat'], '"Thank everyone with a big meal".'),
          M('What does We Tripantu celebrate?', ['The new year and the return of the sun', 'The end of harvest in March', 'Independence Day', 'A saint'], 'Lo dice directamente.'),
          M('What can we infer about the author\'s opinion?', ['Traditions are valuable and need care.', 'Traditions are old-fashioned.', 'Only tourists enjoy festivals.', 'Chile should have fewer festivals.'], '"What we inherit must be cared for".')
        ] }
    ],
    party: { id: 'u4x', title: 'Light the Great Lantern', npc: 'Don Pascual',
      intro: 'The Great Lantern needs four flames. Each keeper knows one tradition. Share your knowledge and vote together.',
      clues: ['Flame 1: The minga is a tradition from Chiloé.', 'Flame 2: We Tripantu, which is celebrated in June, is the Mapuche new year.', 'Flame 3: The dancers of La Tirana, who wear masks, perform in July.', 'Flame 4: Although Santiago a Mil is in January, it has shows from all over the world.'],
      items: [
        M('Where does the minga come from?', ['Chiloé', 'Santiago', 'La Tirana', 'Valparaíso'], 'Flame 1.'),
        M('When is We Tripantu celebrated?', ['In June', 'In July', 'In January', 'In February'], 'Flame 2.'),
        M('Who wears masks in La Tirana?', ['The dancers', 'The pilgrims\' children', 'The tourists', 'The cooks'], 'Flame 3.'),
        M('Which festival has international shows in January?', ['Santiago a Mil', 'We Tripantu', 'La Tirana', 'Minga'], 'Flame 4.')
      ] }
  }
];

export const ALL_QUESTS = UNITS.flatMap(u => u.quests.map(q => ({ ...q, unit: u.id })));

// Preguntas rápidas del duelo PvP, cofres y Word Gems: una mezcla de todo lo ya visto
export function quickPool(maxUnit) {
  const out = [];
  for (const u of UNITS) {
    if (u.id > maxUnit) break;
    for (const q of u.quests) {
      if (q.listen || q.text || q.k === 'PRON') continue;
      for (const it of q.items) if (it.t === 'mc') out.push({ ...it, k: q.k, unit: u.id, qid: q.id });
    }
  }
  return out;
}
