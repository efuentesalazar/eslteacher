/* Past Quest — learning content (English, 6° básico, Chile). Level A1–A2.
   Topics: past simple affirmative / negative / interrogative, regular and irregular verbs,
   adjectives to describe places (+ was/were) and reading comprehension.
   Question formats:
     {t:'mc',   q, o:[CORRECT, ...distractors], tip}      first option is the correct one (shuffled in game)
     {t:'type', q, a:[accepted answers], tip}
     {t:'order',words:[...in correct order], tip}         sentence builder
     {t:'tf',   q, a:true|false, tip}
   `tip` is a short explanation in Spanish shown after answering. */

export const IRR = {
  go:'went', see:'saw', eat:'ate', find:'found', cut:'cut', fly:'flew', make:'made', sing:'sang', lose:'lost',
  write:'wrote', run:'ran', drink:'drank', take:'took', sleep:'slept', hear:'heard', blow:'blew', get:'got',
  give:'gave', swim:'swam', buy:'bought', tell:'told', hide:'hid', come:'came', break:'broke', have:'had',
  do:'did', read:'read', ride:'rode', wear:'wore', speak:'spoke', meet:'met', leave:'left', think:'thought',
  bring:'brought', catch:'caught', build:'built', feel:'felt', sit:'sat', stand:'stood', win:'won', know:'knew',
  draw:'drew', drive:'drove', forget:'forgot', grow:'grew', keep:'kept', put:'put', say:'said', begin:'began',
  teach:'taught', fall:'fell', wake:'woke', send:'sent', spend:'spent', sell:'sold', pay:'paid', sink:'sank',
  become:'became', choose:'chose', steal:'stole', throw:'threw',
};

// Regular past (spelling rules).
export function regPast(v) {
  const SPECIAL = { stop:'stopped', plan:'planned', drop:'dropped', shop:'shopped', hug:'hugged', clap:'clapped', chat:'chatted', jog:'jogged', rob:'robbed', travel:'travelled' };
  if (SPECIAL[v]) return SPECIAL[v];
  if (v.endsWith('e')) return v + 'd';
  if (/[^aeiou]y$/.test(v)) return v.slice(0, -1) + 'ied';
  return v + 'ed';
}
export const past = v => IRR[v] || regPast(v);
export const isIrr = v => !!IRR[v];

// Spanish names of the spelling rules, for tips.
export function ruleTip(v) {
  if (IRR[v]) return `"${v}" es irregular: su pasado es "${IRR[v]}". Los irregulares se memorizan (revisa tu Verb Book).`;
  const p = regPast(v);
  if (p.endsWith('ied')) return `Verbo terminado en consonante + y: cambia la y por i y agrega -ed (${v} → ${p}).`;
  if (v.endsWith('e')) return `Verbo terminado en -e: solo agrega -d (${v} → ${p}).`;
  if (p.length === v.length + 3) return `Verbo corto consonante-vocal-consonante: duplica la última letra y agrega -ed (${v} → ${p}).`;
  return `Verbo regular: agrega -ed (${v} → ${p}).`;
}

/* ---------- Grammar lessons (shown by the guide at the start of each chapter, and in the Book) ---------- */
export const LESSONS = {
  reg: { title:'Past simple: regular verbs', es:'Usamos el pasado simple para acciones terminadas en el pasado (yesterday, last week, two days ago). Los verbos regulares agregan -ed.',
    rows:[['play → played','+ ed'],['dance → danced','termina en -e: + d'],['study → studied','consonante + y → ied'],['stop → stopped','duplica la consonante + ed'],['enjoy → enjoyed','vocal + y: + ed']],
    ex:['Bella baked bread yesterday.','We danced at the party last Saturday.','The bus stopped near the fountain.'],
    extra:'Expresiones de tiempo: yesterday, yesterday morning, last night, last week, two days ago, in 2020.' },
  irr: { title:'Past simple: irregular verbs', es:'Los verbos irregulares NO agregan -ed: cambian de forma. Hay que aprenderlos de memoria.',
    rows:[['go → went','ir'],['see → saw','ver'],['eat → ate','comer'],['have → had','tener'],['make → made','hacer'],['take → took','tomar/llevar']],
    ex:['Mia went to the forest.','Nico saw a big bear!','We ate sandwiches by the lake.'],
    extra:'¡Cuidado! "goed", "eated" y "seed" no existen. Junta pergaminos para completar tu Verb Book.' },
  neg: { title:'Past simple: negative', es:'Para negar usamos didn\'t (did not) + verbo en forma BASE. El verbo principal ya no va en pasado.',
    rows:[['I didn\'t go','✔'],['I didn\'t went','✘'],['She didn\'t play','✔'],['She didn\'t played','✘']],
    ex:['Pete didn\'t catch any fish.','The children didn\'t go to school.','We didn\'t expect a storm.'],
    extra:'Fórmula: Sujeto + didn\'t + verbo base + complemento. Sirve igual para todas las personas (I, you, he, she, it, we, they).' },
  int: { title:'Past simple: questions', es:'Para preguntar usamos Did + sujeto + verbo BASE + ...? Respuestas cortas: Yes, I did. / No, I didn\'t.',
    rows:[['Did you visit the castle?','Yes, I did.'],['Did she dance?','No, she didn\'t.'],['Where did you go?','I went to the market.'],['What did they eat?','They ate cake.']],
    ex:['Did the queen dance at the party?','Where did the knight go?','Who did you meet?'],
    extra:'Palabras para preguntar: What (qué), Where (dónde), When (cuándo), Who (quién), Why (por qué), What time (a qué hora), How (cómo).' },
  adj: { title:'Adjectives to describe places + was / were', es:'Los adjetivos describen cómo es o era un lugar. En pasado usamos was (singular) y were (plural).',
    rows:[['crowded ↔ empty','lleno de gente ↔ vacío'],['noisy ↔ quiet','ruidoso ↔ tranquilo'],['clean ↔ dirty','limpio ↔ sucio'],['modern ↔ ancient','moderno ↔ antiguo'],['safe ↔ dangerous','seguro ↔ peligroso'],['cheap ↔ expensive','barato ↔ caro'],['wide ↔ narrow','ancho ↔ angosto'],['dark ↔ bright','oscuro ↔ luminoso']],
    ex:['The market was crowded and noisy.','The streets were narrow.','The forest wasn\'t safe at night.'],
    extra:'I / he / she / it → was · you / we / they → were. Negativo: wasn\'t / weren\'t. Pregunta: Was it…? Were they…?' },
  mix: { title:'Final review', es:'El Ladrón de Memorias mezcla todo: afirmativo, negativo, preguntas, verbos regulares e irregulares y adjetivos. ¡Tú puedes!',
    rows:[['+','She visited / went'],['–','She didn\'t visit / go'],['?','Did she visit / go?']], ex:['Did you see the tower? Yes, I did. It was dark and scary!'], extra:'' },
};

/* ---------- Sentence banks (subject, pronoun, verb, complement, time) for generated questions ---------- */
const S = (s, p, v, c, t = '') => ({ s, p, v, c, t });
export const SENT = {
  reg: [
    S('Bella','she','bake','fifty loaves of bread','yesterday'), S('Farmer Tom','he','clean','the barn','last Monday'),
    S('Ms. Lee','she','study','old maps','last night'), S('The children','they','play','hide-and-seek in the square','yesterday afternoon'),
    S('Max','he','watch','the village gate','all night'), S('Grandma Rose','she','tidy','her garden','last weekend'),
    S('The cat','it','jump','onto the roof','an hour ago'), S('We','we','dance','at the village party','last Saturday'),
    S('Tom and Bella','they','chat','at the bakery','yesterday'), S('My brother','he','carry','the heavy boxes','yesterday'),
    S('The baby','he','cry','all night','last night'), S('The bus','it','stop','near the fountain','ten minutes ago'),
    S('The students','they','paint','a big picture','last Friday'), S('The guard','he','close','the gate','at nine o\'clock'),
    S('Bella','she','plan','a surprise party','last week'), S('It','it','rain','a lot','yesterday'),
    S('Tom','he','fix','his old wagon','two days ago'), S('The villagers','they','clap','their hands','after the show'),
    S('Rose','she','listen','to the radio','yesterday evening'), S('The kids','they','walk','to the lake','last Sunday'),
    S('The baker','she','try','a new recipe','this morning'), S('The dog','it','drop','the ball','a minute ago'),
    S('Max','he','help','an old lady','yesterday'), S('The children','they','enjoy','the music','last night'),
    S('Ms. Lee','she','arrive','at school','at eight o\'clock'), S('Tom','he','wash','his horse','on Sunday'),
  ],
  irr: [
    S('Mia','she','go','to the forest','last Saturday'), S('Nico','he','see','a big brown bear','yesterday'),
    S('The explorers','they','eat','sandwiches by the lake','at lunchtime'), S('Leo','he','find','a lost map','this morning'),
    S('The owl','it','fly','over the trees','last night'), S('We','we','make','a small fire','at night'),
    S('The children','they','sing','songs around the fire','yesterday evening'), S('Nico','he','lose','his torch','in the dark'),
    S('Mia','she','write','a story about the forest','last night'), S('The rabbits','they','run','into their holes','very fast'),
    S('Sam','he','drink','hot chocolate','after work'), S('Leo','he','take','photos of the animals','yesterday'),
    S('The kids','they','sleep','in a tent','last night'), S('Mia','she','hear','a strange noise','in the trees'),
    S('Leo','he','give','the children a map','yesterday morning'), S('The bear','it','swim','across the lake','an hour ago'),
    S('Sam','he','buy','a new axe','last month'), S('Mia','she','tell','Nico a scary story','at night'),
    S('The squirrel','it','hide','its nuts','under the tree'), S('We','we','come','home','very late'),
    S('Nico','he','break','his torch','last night'), S('Sam','he','cut','a lot of wood','last week'),
    S('The children','they','have','a picnic','on Sunday'), S('Leo','he','ride','his bike','to the forest'),
    S('Mia','she','wear','her red boots','yesterday'), S('The explorers','they','meet','a friendly fox','last week'),
  ],
  neg: [
    S('Pete','he','catch','any fish','yesterday'), S('Captain Ana','she','sail','her boat','on Friday'),
    S('The children','they','go','to school','on Saturday'), S('Mr. Crab','he','leave','his rock','during the storm'),
    S('The villagers','they','expect','a big storm','last week'), S('Pete','he','sleep','well','on Friday night'),
    S('Ana','she','see','the broken bridge','at night'), S('We','we','cross','the river','yesterday'),
    S('The ducks','they','swim','in the river','during the storm'), S('Pete','he','have','breakfast','this morning'),
    S('Mr. Crab','he','like','the cold water','last winter'), S('The kids','they','play','near the river','yesterday'),
    S('Ana','she','find','her hat','after the storm'), S('The old man','he','hear','the thunder','last night'),
    S('The fishermen','they','work','on Saturday'), S('Ana','she','drink','her coffee','this morning'),
    S('Pete','he','buy','a new boat','last year'), S('The bridge','it','break','in the summer'),
  ],
  int: [
    S('the queen','she','dance','at the party','last night'), S('the knight','he','ride','his horse','yesterday'),
    S('the cook','she','make','a big cake','for the party'), S('Owen','he','read','the old books','last week'),
    S('the guards','they','close','the castle gate','at night'), S('the king','he','visit','the market','last month'),
    S('Lola','she','cook','fish soup','yesterday'), S('Ben','he','win','the sword contest','last Sunday'),
    S('the musicians','they','play','the guitar','at the party'), S('the queen','she','write','a letter','this morning'),
    S('the children','they','watch','the knights','yesterday'), S('Owen','he','lose','his glasses','last night'),
    S('Mortimer','he','steal','the memories','last month'), S('the princess','she','sing','a song','at dinner'),
    S('you','I','visit','the castle','yesterday'), S('you','I','see','the dragon flag','this morning'),
  ],
};

/* ---------- Hand-written questions ---------- */
export const HAND = {
  reg: [
    { t:'mc', q:'Which word is a past time expression?', o:['yesterday','tomorrow','next week','now'], tip:'yesterday = ayer. Tomorrow y next week son futuro.' },
    { t:'mc', q:'I visited my grandma two days ___.', o:['ago','last','yesterday','before'], tip:'"ago" va después del tiempo: two days ago = hace dos días.' },
    { t:'mc', q:'We cleaned the classroom ___ Friday.', o:['last','ago','yesterday','next'], tip:'"last" + día/semana/mes: last Friday = el viernes pasado.' },
    { t:'mc', q:'Which verb ends with the sound /ɪd/ (like "wan-TID")?', o:['visited','played','watched','danced'], tip:'Los verbos terminados en t o d suenan /ɪd/: visited, wanted, painted.' },
    { t:'mc', q:'Choose the correct sentence.', o:['She studied English last night.','She studyed English last night.','She study English last night.','She studies English last night.'], tip:'study → studied (consonante + y → ied).' },
    { t:'mc', q:'Choose the correct sentence.', o:['The train stopped at the station.','The train stoped at the station.','The train stopt at the station.','The train stops at the station yesterday.'], tip:'stop → stopped: se duplica la p.' },
    { t:'tf', q:'"Enjoy" in the past is "enjoied".', a:false, tip:'Vocal + y solo agrega -ed: enjoy → enjoyed, play → played.' },
    { t:'order', words:['Bella','baked','a','chocolate','cake','yesterday','.'], tip:'Sujeto + verbo en pasado + complemento + tiempo.' },
    { t:'order', words:['We','danced','at','the','party','last','night','.'], tip:'dance → danced.' },
    { t:'type', q:'Last summer, my family ___ (travel) to the beach.', a:['travelled','traveled'], tip:'travel → travelled (inglés británico) o traveled (americano).' },
  ],
  irr: [
    { t:'mc', q:'Which verb is IRREGULAR?', o:['go','play','watch','clean'], tip:'go → went. Los otros agregan -ed.' },
    { t:'mc', q:'Which verb is REGULAR?', o:['jump','eat','see','take'], tip:'jump → jumped. eat, see y take son irregulares.' },
    { t:'mc', q:'Choose the correct sentence.', o:['We saw a bear in the forest.','We seed a bear in the forest.','We see a bear in the forest yesterday.','We sawed a bear in the forest.'], tip:'see → saw.' },
    { t:'mc', q:'Choose the correct sentence.', o:['Nico ate all the cookies!','Nico eated all the cookies!','Nico eat all the cookies yesterday!','Nico ated all the cookies!'], tip:'eat → ate.' },
    { t:'tf', q:'The past of "buy" is "bought".', a:true, tip:'buy → bought, bring → brought, think → thought.' },
    { t:'tf', q:'The past of "go" is "goed".', a:false, tip:'go → went. "goed" no existe.' },
    { t:'tf', q:'"Read" in the past is written the same, but it sounds like "red".', a:true, tip:'read /riːd/ → read /red/.' },
    { t:'order', words:['Mia','went','to','the','forest','last','Saturday','.'], tip:'go → went.' },
    { t:'order', words:['The','owl','flew','over','the','trees','.'], tip:'fly → flew.' },
    { t:'mc', q:'Yesterday I ___ a strange noise in the trees.', o:['heard','heared','hear','hears'], tip:'hear → heard.' },
  ],
  neg: [
    { t:'mc', q:'I ___ go to school yesterday. It was Sunday!', o:['didn\'t','don\'t','wasn\'t','not'], tip:'Pasado negativo: didn\'t + verbo base.' },
    { t:'mc', q:'Which sentence is correct?', o:['He didn\'t go to the river.','He didn\'t went to the river.','He didn\'t goes to the river.','He not went to the river.'], tip:'Después de didn\'t el verbo va en forma base: go.' },
    { t:'mc', q:'Make it negative: "We played football."', o:['We didn\'t play football.','We didn\'t played football.','We don\'t played football.','We not played football.'], tip:'played → didn\'t play.' },
    { t:'mc', q:'Make it negative: "Ana saw the bridge."', o:['Ana didn\'t see the bridge.','Ana didn\'t saw the bridge.','Ana doesn\'t saw the bridge.','Ana not see the bridge.'], tip:'saw → didn\'t see.' },
    { t:'tf', q:'"Didn\'t" is the short form of "did not".', a:true, tip:'did not = didn\'t.' },
    { t:'order', words:['Pete','didn\'t','catch','any','fish','.'], tip:'Sujeto + didn\'t + verbo base.' },
    { t:'order', words:['The','children','didn\'t','go','to','school','.'], tip:'didn\'t go (no "didn\'t went").' },
    { t:'type', q:'She didn\'t ___ (have) breakfast this morning.', a:['have'], tip:'Después de didn\'t: verbo base → have (no "had").' },
    { t:'type', q:'Make it negative: "I ate fish." → I didn\'t ___ fish.', a:['eat'], tip:'ate → didn\'t eat.' },
    { t:'mc', q:'Find the mistake: "Mr. Crab didn\'t lost his house."', o:['lost → lose','didn\'t → don\'t','his → him','house → houses'], tip:'didn\'t + verbo base: didn\'t lose.' },
  ],
  int: [
    { t:'mc', q:'___ did you go yesterday? — I went to the castle.', o:['Where','What','Who','When'], tip:'Where = dónde (lugar).' },
    { t:'mc', q:'___ did you eat for lunch? — Pizza!', o:['What','Where','Who','Why'], tip:'What = qué.' },
    { t:'mc', q:'___ did the party start? — At eight o\'clock.', o:['What time','Where','Who','What colour'], tip:'What time = a qué hora.' },
    { t:'mc', q:'___ did you meet at the market? — I met Queen Maya.', o:['Who','What','Where','When'], tip:'Who = quién (persona).' },
    { t:'mc', q:'___ did you cry? — Because I lost my dog.', o:['Why','When','Who','Where'], tip:'Why = por qué. Se responde con because.' },
    { t:'mc', q:'Answer: "Did you visit the castle?"', o:['Yes, I did.','Yes, I visited.','Yes, I do.','Yes, I was.'], tip:'Respuesta corta: Yes, I did. / No, I didn\'t.' },
    { t:'mc', q:'Choose the question for this answer: "No, she didn\'t. She stayed at home."', o:['Did she go out?','Does she go out?','Did she went out?','Was she go out?'], tip:'Did + sujeto + verbo base.' },
    { t:'order', words:['Where','did','the','knight','go','?'], tip:'Wh- + did + sujeto + verbo base?' },
    { t:'order', words:['What','did','Lola','cook','yesterday','?'], tip:'What + did + sujeto + verbo base?' },
    { t:'order', words:['Did','you','see','the','queen','?'], tip:'Did + sujeto + verbo base?' },
    { t:'tf', q:'"Did you went to the party?" is correct.', a:false, tip:'Lo correcto: Did you go to the party?' },
  ],
  adj: [
    { t:'mc', q:'There were a lot of people in the market. It was very ___.', o:['crowded','empty','quiet','small'], tip:'crowded = lleno de gente.' },
    { t:'mc', q:'Nobody spoke in the library. It was ___.', o:['quiet','noisy','crowded','dangerous'], tip:'quiet = tranquilo, silencioso.' },
    { t:'mc', q:'The opposite of "noisy" is…', o:['quiet','crowded','dirty','modern'], tip:'noisy ↔ quiet.' },
    { t:'mc', q:'The opposite of "ancient" is…', o:['modern','old','dark','narrow'], tip:'ancient (antiguo) ↔ modern (moderno).' },
    { t:'mc', q:'The opposite of "safe" is…', o:['dangerous','clean','wide','cheap'], tip:'safe ↔ dangerous.' },
    { t:'mc', q:'The opposite of "expensive" is…', o:['cheap','beautiful','bright','busy'], tip:'expensive (caro) ↔ cheap (barato).' },
    { t:'mc', q:'The opposite of "wide" is…', o:['narrow','high','empty','dirty'], tip:'wide (ancho) ↔ narrow (angosto).' },
    { t:'mc', q:'🗑️🧃🍌 There was rubbish everywhere. The park was ___.', o:['dirty','clean','modern','quiet'], tip:'dirty = sucio.' },
    { t:'mc', q:'🚗🚌📢🔊 The city centre was very ___.', o:['noisy','quiet','empty','narrow'], tip:'noisy = ruidoso.' },
    { t:'mc', q:'🌈🎈🎨 The stalls were red, yellow, green and blue. They were ___.', o:['colourful','dark','dirty','boring'], tip:'colourful = colorido.' },
    { t:'mc', q:'Do you remember the Whispering Forest? It was ___.', o:['dark','crowded','modern','noisy'], tip:'El bosque era dark (oscuro) y quiet.' },
    { t:'mc', q:'Do you remember Willowbrook village? It was small and ___.', o:['peaceful','dangerous','crowded','noisy'], tip:'peaceful = tranquilo, en paz.' },
    { t:'mc', q:'The castle is 800 years old. It is ___.', o:['ancient','modern','new','cheap'], tip:'ancient = muy antiguo.' },
    { t:'mc', q:'The streets ___ narrow and crowded.', o:['were','was','did','is'], tip:'Plural (the streets) → were.' },
    { t:'mc', q:'The museum ___ very interesting.', o:['was','were','did','are'], tip:'Singular (the museum) → was.' },
    { t:'mc', q:'It was Sunday, so the shops ___ open.', o:['weren\'t','wasn\'t','didn\'t','don\'t'], tip:'Plural negativo → weren\'t.' },
    { t:'mc', q:'___ the hotel clean? — Yes, it was.', o:['Was','Were','Did','Does'], tip:'Pregunta con was: Was the hotel clean?' },
    { t:'mc', q:'___ the beaches beautiful? — Yes, they were.', o:['Were','Was','Did','Do'], tip:'Plural → Were…?' },
    { t:'tf', q:'"The market were crowded." is correct.', a:false, tip:'The market (singular) → was.' },
    { t:'tf', q:'"Dangerous" means "peligroso".', a:true, tip:'dangerous = peligroso; safe = seguro.' },
    { t:'order', words:['The','hotel','was','clean','and','quiet','.'], tip:'Sujeto + was + adjetivos.' },
    { t:'order', words:['The','streets','were','narrow','.'], tip:'Plural → were.' },
    { t:'type', q:'The beach was full of people. It was c_______.', a:['crowded'], tip:'crowded = lleno de gente.' },
    { t:'type', q:'Opposite of "dirty": c____', a:['clean'], tip:'dirty ↔ clean.' },
  ],
};

/* ---------- Readings ---------- */
export const READINGS = {
  1: { title:'Bella\'s Diary', kind:'diary', text:[
    'Monday, 12th October',
    'Dear Diary,',
    'Yesterday was a busy day! I opened the bakery at six o\'clock in the morning. I baked fifty loaves of bread and twenty apple pies. At ten o\'clock, Farmer Tom arrived with fresh milk and eggs. We chatted for a few minutes.',
    'In the afternoon, it rained a lot, so I stayed inside and cleaned the kitchen. Then Ms. Lee visited me with her students. They watched me work and they tried my new chocolate cookies. The children loved them!',
    'In the evening, I was very tired. I washed my hair, listened to some music and went to bed early. But this morning… I can\'t remember anything! Who took my memories?' ],
    qs:[
      { t:'mc', q:'What time did Bella open the bakery?', o:['At six o\'clock','At ten o\'clock','In the afternoon','In the evening'], tip:'"I opened the bakery at six o\'clock in the morning."' },
      { t:'mc', q:'What did Farmer Tom bring?', o:['Milk and eggs','Bread and pies','Apples','Chocolate cookies'], tip:'"Farmer Tom arrived with fresh milk and eggs."' },
      { t:'tf', q:'It rained in the afternoon.', a:true, tip:'"In the afternoon, it rained a lot."' },
      { t:'mc', q:'What did the students try?', o:['Chocolate cookies','Apple pies','Fresh milk','Bread'], tip:'"they tried my new chocolate cookies."' },
      { t:'tf', q:'Bella went to bed late.', a:false, tip:'"…and went to bed early."' },
    ] },
  2: { title:'A Night in the Forest', kind:'story', text:[
    'Last Saturday, my brother Nico and I went camping in the Whispering Forest. We took a tent, a map and some sandwiches.',
    'In the afternoon, we saw a big brown bear near the lake! We were scared, so we ran back to our tent. At night, we made a small fire and ate our sandwiches. Nico told funny stories and we sang songs.',
    'Then we heard a strange noise in the trees. It was only an owl! We slept very well. In the morning, Nico found an old silver key under a rock. Who lost it? We didn\'t know…',
    '— Mia' ],
    qs:[
      { t:'mc', q:'Where did Mia and Nico go?', o:['To the Whispering Forest','To the beach','To the castle','To the market'], tip:'"…went camping in the Whispering Forest."' },
      { t:'mc', q:'What did they see near the lake?', o:['A big brown bear','An owl','A fox','A silver key'], tip:'"we saw a big brown bear near the lake!"' },
      { t:'mc', q:'Why did they run back to the tent?', o:['Because they were scared','Because it rained','Because they were hungry','Because it was late'], tip:'"We were scared, so we ran back to our tent."' },
      { t:'mc', q:'What made the strange noise?', o:['An owl','A bear','Nico','The wind'], tip:'"It was only an owl!"' },
      { t:'tf', q:'Nico found a gold key in the tent.', a:false, tip:'He found an old SILVER key UNDER A ROCK.' },
    ] },
  3: { title:'The Willowbrook News', kind:'news', text:[
    'STORM BREAKS THE OLD BRIDGE',
    'On Friday night, a big storm hit the Silver River. The wind was very strong and the river was very high. In the morning, the villagers saw that the old wooden bridge was broken.',
    'Luckily, nobody was on the bridge, so nobody got hurt. The fishermen didn\'t go fishing that day, and the children didn\'t go to school in the castle town.',
    '"We didn\'t expect a storm like that!" said Captain Ana. Mr. Crab, the oldest resident of the river, didn\'t lose his house: he hid under a big rock. Now the villagers need new wood to repair the bridge.' ],
    qs:[
      { t:'mc', q:'When did the storm hit the river?', o:['On Friday night','On Sunday morning','Last month','On Monday'], tip:'"On Friday night, a big storm hit the Silver River."' },
      { t:'tf', q:'Somebody got hurt on the bridge.', a:false, tip:'"nobody was on the bridge, so nobody got hurt."' },
      { t:'tf', q:'The children didn\'t go to school.', a:true, tip:'"the children didn\'t go to school in the castle town."' },
      { t:'mc', q:'What did Mr. Crab do?', o:['He hid under a big rock','He lost his house','He went fishing','He repaired the bridge'], tip:'"he hid under a big rock."' },
      { t:'mc', q:'What do the villagers need now?', o:['New wood','A new boat','More fish','A big rock'], tip:'"the villagers need new wood to repair the bridge."' },
    ] },
  4: { title:'A Letter from the Queen', kind:'letter', text:[
    'Dear Explorer,',
    'Thank you for coming to my castle. Last month, something strange happened here. One night, a man in a long purple coat visited the castle. He said his name was Mortimer.',
    'He asked many questions: "Did you have a party yesterday? What did you eat? Who did you dance with?" We answered all his questions, and he wrote everything in a black book.',
    'The next day, nobody in the castle remembered anything! Did he steal our memories? I think he did. He lives in the tall tower in the north, behind the market. Please be careful.',
    'Queen Maya' ],
    qs:[
      { t:'mc', q:'What colour was the man\'s coat?', o:['Purple','Black','Red','Green'], tip:'"a man in a long purple coat"' },
      { t:'mc', q:'What was his name?', o:['Mortimer','Owen','Ben','Max'], tip:'"He said his name was Mortimer."' },
      { t:'mc', q:'Where did he write the answers?', o:['In a black book','On the wall','In a letter','On a map'], tip:'"he wrote everything in a black book."' },
      { t:'mc', q:'Which question did Mortimer ask?', o:['"Did you have a party yesterday?"','"Where is the market?"','"Do you like cake?"','"What time is it?"'], tip:'Lee las preguntas entre comillas.' },
      { t:'mc', q:'Where does Mortimer live?', o:['In the tall tower in the north','In the castle','In the forest','Near the river'], tip:'"He lives in the tall tower in the north, behind the market."' },
    ] },
  5: { title:'A Postcard from Brightwater', kind:'postcard', text:[
    'Hi Grandma Rose!',
    'I\'m in Brightwater Market now. This town is amazing! The streets are narrow and crowded, and the market is very noisy. There are colourful stalls everywhere.',
    'Yesterday I visited the old clock tower. It was beautiful, but the stairs were dark and dangerous! The food here is delicious, but it is expensive.',
    'My hotel was quiet and clean, so I slept well. Tomorrow I\'m going to the Memory Thief\'s tower. I\'m a bit scared!',
    'Love, {name}' ],
    qs:[
      { t:'mc', q:'How are the streets in Brightwater?', o:['Narrow and crowded','Wide and empty','Clean and quiet','Dark and dangerous'], tip:'"The streets are narrow and crowded."' },
      { t:'tf', q:'The market is quiet.', a:false, tip:'"the market is very noisy."' },
      { t:'mc', q:'How were the stairs of the clock tower?', o:['Dark and dangerous','Clean and safe','Colourful','Modern'], tip:'"the stairs were dark and dangerous!"' },
      { t:'mc', q:'How is the food?', o:['Delicious but expensive','Cheap and delicious','Horrible','Cheap but horrible'], tip:'"The food here is delicious, but it is expensive."' },
      { t:'mc', q:'Why did the writer sleep well?', o:['The hotel was quiet and clean','The hotel was cheap','The tower was safe','The market was empty'], tip:'"My hotel was quiet and clean, so I slept well."' },
    ] },
  6: { title:'Mortimer\'s Confession', kind:'letter', text:[
    'I am Mortimer, and I am sorry.',
    'A long time ago, I lived in Willowbrook. I had many friends. One day, I moved to this tower to study magic. I studied day and night, and I forgot my friends.',
    'Nobody visited me on my birthday. I felt very sad and lonely. So I created a magic black book and I took the village\'s memories. I wanted everybody to forget, like me.',
    'But you helped the villagers remember. Now I remember too: friends are more important than magic. Can I come back to the village?' ],
    qs:[
      { t:'mc', q:'Where did Mortimer live a long time ago?', o:['In Willowbrook','In the castle','In Brightwater','In the forest'], tip:'"A long time ago, I lived in Willowbrook."' },
      { t:'mc', q:'Why did he move to the tower?', o:['To study magic','To find a key','To sell books','To meet the queen'], tip:'"I moved to this tower to study magic."' },
      { t:'mc', q:'How did he feel on his birthday?', o:['Sad and lonely','Happy and excited','Tired','Angry and hungry'], tip:'"I felt very sad and lonely."' },
      { t:'tf', q:'His friends visited him on his birthday.', a:false, tip:'"Nobody visited me on my birthday."' },
      { t:'mc', q:'What did Mortimer learn?', o:['Friends are more important than magic','Magic is very easy','Books are dangerous','Towers are beautiful'], tip:'Última línea del texto.' },
    ] },
};

/* ---------- Chapters ---------- */
export const CHAPTERS = [
  { id:1, title:'The Quiet Village', place:'Willowbrook', adj:['quiet','small','peaceful','beautiful'], topic:'reg', music:'village',
    intro:'Willowbrook is a small, quiet and peaceful village. But this morning, nobody can remember yesterday! A thief stole the village\'s memories.',
    introEs:'Willowbrook es una aldea pequeña y tranquila. Pero hoy nadie recuerda lo que hizo ayer: ¡un ladrón robó sus recuerdos!' },
  { id:2, title:'The Whispering Forest', place:'Whispering Forest', adj:['dark','quiet','mysterious','wild'], topic:'irr', music:'forest',
    intro:'The Whispering Forest is dark and mysterious. The explorers here forgot everything too. Irregular verbs hide among the trees!',
    introEs:'El bosque es oscuro y misterioso. Los exploradores también olvidaron todo. ¡Los verbos irregulares se esconden entre los árboles!' },
  { id:3, title:'The Broken Bridge', place:'Silver River', adj:['wide','cold','deep','noisy'], topic:'neg', music:'river',
    intro:'The Silver River is wide and cold. A storm broke the old bridge. Help the river people and the bridge will come back, piece by piece.',
    introEs:'El río es ancho y frío. Una tormenta rompió el puente. Ayuda a la gente del río y el puente se reparará, pieza por pieza.' },
  { id:4, title:'The Ancient Castle', place:'Castle of Queen Maya', adj:['ancient','big','high','old'], topic:'int', music:'castle',
    intro:'The castle is ancient and big. A stranger asked the castle people many questions… and then they forgot everything. Now YOU ask the questions!',
    introEs:'El castillo es antiguo y enorme. Un extraño hizo muchas preguntas… y todos olvidaron. ¡Ahora TÚ haces las preguntas!' },
  { id:5, title:'The Busy Market', place:'Brightwater Market', adj:['crowded','noisy','colourful','busy'], topic:'adj', music:'market',
    intro:'Brightwater Market is crowded, noisy and colourful. The merchants forgot how to describe their town. Help them find the right adjectives!',
    introEs:'El mercado está lleno de gente, es ruidoso y colorido. Los comerciantes olvidaron cómo describir su pueblo. ¡Ayúdalos con los adjetivos!' },
  { id:6, title:'The Memory Thief', place:'Mortimer\'s Tower', adj:['dark','scary','dangerous','high'], topic:'mix', music:'tower',
    intro:'The tower is dark, high and dangerous. Mortimer, the Memory Thief, is waiting. Use everything you learned to get the memories back!',
    introEs:'La torre es oscura, alta y peligrosa. Mortimer, el Ladrón de Memorias, te espera. ¡Usa todo lo que aprendiste!' },
];

/* NPCs. look: {sex:'m'|'f', outfit:'Ranger'|'Peasant', alt:bool, hair, hairColor, skin}. memory = sentence said when restored. */
export const NPCS = [
  // Chapter 1
  { id:'rose', ch:1, name:'Grandma Rose', role:'guide', look:{ sex:'f', outfit:'Peasant', hair:'Hair_Buns', hairColor:0xdddddd, skin:0 },
    hello:'Oh, hello, young explorer! I\'m Grandma Rose. Something terrible happened last night…' },
  { id:'bella', ch:1, name:'Bella the Baker', topic:'reg', look:{ sex:'f', outfit:'Peasant', alt:true, hair:'Hair_Long', hairColor:0x8a4b22, skin:1 },
    hello:'I can\'t remember what I did yesterday! Did I… bake? baked? Help me, please!', memory:'Now I remember! I baked fifty loaves of bread and I chatted with Tom!' },
  { id:'tom', ch:1, name:'Farmer Tom', topic:'reg', look:{ sex:'m', outfit:'Peasant', hair:'Hair_Beard', hairColor:0x4a2a10, skin:2 },
    hello:'My cows look at me… but I can\'t remember yesterday. Can you help me?', memory:'Yes! I cleaned the barn and I fixed my old wagon!' },
  { id:'lee', ch:1, name:'Ms. Lee', topic:'reg', look:{ sex:'f', outfit:'Ranger', hair:'Hair_SimpleParted', hairColor:0x111111, skin:0 },
    hello:'I\'m a teacher, and I forgot my own lesson! Study… studyed? studied? Help!', memory:'Thank you! I studied old maps and my students painted a big picture.' },
  { id:'max', ch:1, name:'Max the Guard', topic:'reg', look:{ sex:'m', outfit:'Ranger', alt:true, hair:'Hair_Buzzed', hairColor:0x2a1a0a, skin:1 },
    hello:'Halt! Who are you? Oh… I don\'t remember why I\'m here. Help me remember yesterday!', memory:'Of course! I watched the gate all night and I helped an old lady.' },
  // Chapter 2
  { id:'leo', ch:2, name:'Ranger Leo', role:'guide', look:{ sex:'m', outfit:'Ranger', hair:'Hair_SimpleParted', hairColor:0xa0522d, skin:0 },
    hello:'Welcome to the Whispering Forest. Be careful: the irregular verbs are wild here!' },
  { id:'mia', ch:2, name:'Explorer Mia', topic:'irr', look:{ sex:'f', outfit:'Ranger', alt:true, hair:'Hair_Long', hairColor:0xe0b050, skin:1 },
    hello:'I went… goed… go? I don\'t know! I forgot everything about my trip!', memory:'I remember! I went camping and I saw a big brown bear!' },
  { id:'nico', ch:2, name:'Nico', topic:'irr', look:{ sex:'m', outfit:'Peasant', alt:true, hair:'Hair_Buzzed', hairColor:0x111111, skin:2 },
    hello:'I found something… or I finded something? Help me, please!', memory:'Yes! I found an old silver key under a rock!' },
  { id:'sam', ch:2, name:'Sam the Woodcutter', topic:'irr', look:{ sex:'m', outfit:'Peasant', hair:'Hair_Beard', hairColor:0x6b3a1a, skin:0 },
    hello:'I cut wood every day… but what did I do yesterday?', memory:'I cut a lot of wood and I drank hot chocolate. Delicious!' },
  { id:'ivy', ch:2, name:'Ivy the Botanist', topic:'irr', look:{ sex:'f', outfit:'Peasant', hair:'Hair_Buns', hairColor:0xb03020, skin:1 },
    hello:'The flowers whisper to me, but I can\'t understand them. I forgot my verbs!', memory:'I remember! I took photos of flowers and I wrote a poem.' },
  // Chapter 3
  { id:'ana', ch:3, name:'Captain Ana', role:'guide', look:{ sex:'f', outfit:'Ranger', hair:'Hair_BuzzedFemale', hairColor:0x222222, skin:2 },
    hello:'Ahoy! The storm broke our bridge. We didn\'t expect it! Help my friends and we can repair it.' },
  { id:'pete', ch:3, name:'Pete the Fisherman', topic:'neg', look:{ sex:'m', outfit:'Peasant', hair:'Hair_Beard', hairColor:0x999999, skin:1 },
    hello:'People say I caught a big fish yesterday. But I didn\'t! Or… did I?', memory:'Now I remember: I didn\'t catch any fish. I didn\'t sleep well because of the storm!' },
  { id:'crab', ch:3, name:'Mr. Crab', topic:'neg', creature:'Crab',
    hello:'Click-clack! Everybody thinks I left my rock. I didn\'t! Help me tell the truth.', memory:'Click-clack! I didn\'t leave my rock. I hid under it during the storm!' },
  { id:'kai', ch:3, name:'Kai the Builder', topic:'neg', look:{ sex:'m', outfit:'Ranger', alt:true, hair:'Hair_Buzzed', hairColor:0x553311, skin:2 },
    hello:'I need to repair the bridge, but I forgot how to say what we didn\'t do!', memory:'We didn\'t cross the river and we didn\'t lose any wood. Let\'s build!' },
  // Chapter 4
  { id:'maya', ch:4, name:'Queen Maya', role:'guide', look:{ sex:'f', outfit:'Ranger', alt:true, hair:'Hair_Long', hairColor:0x111111, skin:2 },
    hello:'Welcome to my ancient castle, explorer. A stranger asked us too many questions…' },
  { id:'ben', ch:4, name:'Sir Ben the Knight', topic:'int', look:{ sex:'m', outfit:'Ranger', hair:'Hair_SimpleParted', hairColor:0xd0a040, skin:0 },
    hello:'Did I win? Did I lose? I can\'t remember the contest! Ask me the right questions.', memory:'Did I win the sword contest? Yes, I did!' },
  { id:'lola', ch:4, name:'Lola the Cook', topic:'int', look:{ sex:'f', outfit:'Peasant', alt:true, hair:'Hair_Buns', hairColor:0x5a2a0a, skin:2 },
    hello:'What did I cook yesterday? I can\'t remember! Help me with the questions.', memory:'What did I cook? I cooked fish soup and a big cake!' },
  { id:'owen', ch:4, name:'Owen the Librarian', topic:'int', look:{ sex:'m', outfit:'Peasant', hair:'Hair_Buzzed', hairColor:0x777777, skin:1 },
    hello:'Where did I put my glasses? Did I read the old books? Questions, questions…', memory:'Did I read the old books? Yes, I did. And I found my glasses!' },
  // Chapter 5
  { id:'zara', ch:5, name:'Zara the Merchant', role:'guide', look:{ sex:'f', outfit:'Peasant', hair:'Hair_Long', hairColor:0x3a1a0a, skin:2 },
    hello:'Welcome to Brightwater Market! It\'s… it\'s… oh no, I forgot the words to describe it!' },
  { id:'omar', ch:5, name:'Omar the Fruit Seller', topic:'adj', look:{ sex:'m', outfit:'Peasant', alt:true, hair:'Hair_Beard', hairColor:0x111111, skin:2 },
    hello:'My stall is… red, yellow, green… what\'s the word?', memory:'My stall is colourful! And yesterday the market was very crowded.' },
  { id:'lily', ch:5, name:'Lily the Tourist', topic:'adj', look:{ sex:'f', outfit:'Ranger', hair:'Hair_SimpleParted', hairColor:0xe8c070, skin:0 },
    hello:'I visited many places yesterday, but I can\'t describe them!', memory:'The clock tower was ancient and the hotel was clean and quiet!' },
  { id:'hugo', ch:5, name:'Hugo the Musician', topic:'adj', look:{ sex:'m', outfit:'Ranger', alt:true, hair:'Hair_Buzzed', hairColor:0xc06020, skin:1 },
    hello:'Was the concert noisy? Were the people happy? I forgot!', memory:'The concert was noisy and the streets were crowded. It was great!' },
  { id:'tess', ch:5, name:'Tess the Guide', topic:'adj', look:{ sex:'f', outfit:'Peasant', alt:true, hair:'Hair_BuzzedFemale', hairColor:0x111111, skin:1 },
    hello:'I\'m a tour guide, and I forgot all my adjectives! Big, small… what else?', memory:'Brightwater is busy, colourful and safe. The tower in the north is dangerous!' },
  // Chapter 6
  { id:'mortimer', ch:6, name:'Mortimer, the Memory Thief', role:'boss', look:{ sex:'m', outfit:'Ranger', alt:true, hair:'Hair_Beard', hairColor:0x6a2a8a, skin:0, tint:0x7a3aaa },
    hello:'Ha ha ha! You found my tower! Did you really think you can beat me? Answer my questions… if you can!' },
];

/* Verb scrolls hidden in each zone (collect them for the Verb Book). */
export const SCROLLS = {
  1: ['play','dance','study','stop','visit','try'],
  2: ['go','see','eat','have','make','take'],
  3: ['catch','leave','sleep','find','buy','swim'],
  4: ['ride','read','write','win','lose','sing'],
  5: ['bring','think','meet','speak','wear','sell'],
  6: ['steal','forget','feel','give','tell','come'],
};
export const VERB_ES = { play:'jugar', dance:'bailar', study:'estudiar', stop:'detener', visit:'visitar', try:'intentar/probar', go:'ir', see:'ver', eat:'comer', have:'tener', make:'hacer', take:'tomar/llevar', catch:'atrapar', leave:'dejar/salir', sleep:'dormir', find:'encontrar', buy:'comprar', swim:'nadar', ride:'montar', read:'leer', write:'escribir', win:'ganar', lose:'perder', sing:'cantar', bring:'traer', think:'pensar', meet:'conocer', speak:'hablar', wear:'usar ropa', sell:'vender', steal:'robar', forget:'olvidar', feel:'sentir', give:'dar', tell:'contar/decir', come:'venir' };

/* ---------- Question generators ---------- */
const cap = s => s[0].toUpperCase() + s.slice(1);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const tail = x => (x.c + (x.t ? ' ' + x.t : '')).trim();
const words = s => s.split(' ').filter(Boolean);
const third = x => ['he','she','it'].includes(x.p);

function wrongPasts(v) {
  const p = past(v), out = new Set();
  const cands = IRR[v] ? [v + 'ed', v, regPast(v), p + 'ed', pick(Object.values(IRR))]
    : [v + 'ed', v + 'd', v.replace(/y$/, 'ied'), v + v.slice(-1) + 'ed', v.replace(/e$/, '') + 'ed', v + 's'];
  for (const c of cands) if (c !== p && c !== v + 'ded' && c !== 'eed') out.add(c);
  out.add(v);
  return shuffle([...out].filter(w => w !== p)).slice(0, 3);
}

function genAffirmative(pool) {
  const x = pick(pool), p = past(x.v), r = Math.random();
  if (r < 0.5) return { t:'type', q:`${cap(x.s)} ___ (${x.v}) ${tail(x)}.`, a:[p], tip:ruleTip(x.v) };
  if (r < 0.8) return { t:'mc', q:`${cap(x.s)} ___ ${tail(x)}.`, o:[p, ...wrongPasts(x.v)], tip:ruleTip(x.v) };
  return { t:'mc', fixed:true, q:`Is "${x.v} → ${p}" regular or irregular?`, o: isIrr(x.v) ? ['Irregular','Regular'] : ['Regular','Irregular'], tip:ruleTip(x.v), sort:true };
}
function genNegative(pool) {
  const x = pick(pool), p = past(x.v), r = Math.random();
  if (r < 0.35) return { t:'mc', q:`${cap(x.s)} ___ ${tail(x)}.`, o:[`didn't ${x.v}`, `didn't ${p}`, `${third(x) ? "doesn't" : "don't"} ${x.v}`, `not ${p}`], tip:`Negativo en pasado: didn't + verbo base (${x.v}).` };
  if (r < 0.65) return { t:'type', q:`${cap(x.s)} didn't ___ (${x.v}) ${tail(x)}.`, a:[x.v], tip:`Después de didn't el verbo va en forma base: "${x.v}", no "${p}".` };
  if (r < 0.85) return { t:'order', words:[...words(cap(x.s)), "didn't", x.v, ...words(tail(x)), '.'], tip:'Sujeto + didn\'t + verbo base + complemento.' };
  return { t:'mc', q:`Make it negative: "${cap(x.s)} ${p} ${tail(x)}."`, o:[`${cap(x.s)} didn't ${x.v} ${tail(x)}.`, `${cap(x.s)} didn't ${p} ${tail(x)}.`, `${cap(x.s)} not ${p} ${tail(x)}.`], tip:`${p} → didn't ${x.v}.` };
}
function genQuestion(pool) {
  const x = pick(pool), p = past(x.v), r = Math.random();
  const subj = x.s === 'you' ? 'you' : x.s;
  if (r < 0.3) return { t:'order', words:['Did', ...words(subj), x.v, ...words(tail(x)), '?'], tip:'Did + sujeto + verbo base + complemento?' };
  if (r < 0.55) return { t:'mc', q:'Choose the correct question.', o:[`Did ${subj} ${x.v} ${tail(x)}?`, `Did ${subj} ${p} ${tail(x)}?`, `${cap(subj)} did ${x.v} ${tail(x)}?`, `${third(x) ? 'Does' : 'Do'} ${subj} ${p} ${tail(x)}?`], tip:'Did + sujeto + verbo BASE.' };
  const yes = Math.random() < 0.5, pr = x.p === 'I' ? 'I' : x.p;
  const q = `Did ${subj} ${x.v} ${tail(x)}?`;
  if (yes) return { t:'mc', q:`${q} (✔)`, o:[`Yes, ${pr} did.`, `Yes, ${pr} ${p}.`, `Yes, ${pr} ${third(x) ? 'does' : 'do'}.`, `Yes, ${pr} was.`], tip:'Respuesta corta afirmativa: Yes, + pronombre + did.' };
  return { t:'mc', q:`${q} (✘)`, o:[`No, ${pr} didn't.`, `No, ${pr} don't.`, `No, ${pr} not.`, `No, ${pr} wasn't.`], tip:'Respuesta corta negativa: No, + pronombre + didn\'t.' };
}

const GEN = {
  reg: () => genAffirmative(SENT.reg),
  irr: () => genAffirmative(SENT.irr),
  neg: () => genNegative(SENT.neg),
  int: () => genQuestion(SENT.int),
  adj: () => pick(HAND.adj),
};

// One question for a topic: mixes hand-written and generated items.
export function makeQuestion(topic) {
  if (topic === 'mix') topic = pick(['reg','irr','neg','int','adj']);
  if (topic === 'all') topic = pick(['reg','irr','neg','int','adj']);
  const hand = HAND[topic];
  if (topic === 'adj' || Math.random() < 0.35) return JSON.parse(JSON.stringify(pick(hand)));
  return GEN[topic]();
}
export function makeSet(topic, n) {
  const out = [], seen = new Set();
  for (let k = 0; out.length < n && k < 60; k++) {
    const q = makeQuestion(topic);
    const key = (q.q || q.words.join(' ')).replace(/\(.*?\)|___|[.?!]/g, '').split(' ').filter(w => w.length > 3).slice(0, 3).join(' ');
    if (!seen.has(key)) { seen.add(key); out.push(q); }
  }
  return out;
}
export { shuffle, pick, cap };
