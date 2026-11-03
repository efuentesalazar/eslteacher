/* =====================================================================
   CHALLENGE ZONE — banco de ejercicios por nivel
   A1 = 5°–6° Básico · A2 = 7°–8° Básico · B1 = 1°–3° Medio
   Alineado a los objetivos y temas de las Bases Curriculares de Inglés (Mineduc).

   Cómo agregar ejercicios (copia una línea y cámbiala):
   - scramble: { s:"Oración completa." , alt:["otra forma válida"] }  (alt es opcional)
   - use:      { q:"Frase con ___ .", o:["opción 1","opción 2","opción 3"], a: índice correcto (0, 1 o 2), why:"explicación" }
   - vocab:    { t:"Texto con {1} {2} {3} {4}", a:["resp1","resp2","resp3","resp4"], x:["distractor1","distractor2"] }
   - mistake:  { s:"Oración con un error.", bad:"palabra incorrecta", fix:"corrección" (vacío "" = la palabra sobra), why:"explicación" }
   - wf:       { s:"Frase con ___ .", base:"PALABRA BASE", a:["respuesta"], why:"explicación" }
   - dict:     "Oración que se dicta."
   - read:     { title:"Título", text:"Texto…", qs:[ { q:"Pregunta", o:["a","b","c"], a: índice } ] }
   ===================================================================== */
const EXERCISES = {

/* ============================ A1 · 5°–6° Básico ============================
   Familia, escuela, rutinas, comida, clima, animales, la ciudad, vacaciones.
   Presente simple y continuo, there is/are, can, preposiciones, was/were,
   pasado simple, comparativos, a/an, much/many. */
A1: {
  scramble: [
    { s:"I get up at seven o'clock every day.", alt:["every day I get up at seven o'clock"] },
    { s:"My brother is taller than me." },
    { s:"There are twenty students in my class." },
    { s:"She is playing football in the park." },
    { s:"We have English classes on Monday." },
    { s:"Can you swim in the sea?" },
    { s:"My favourite food is pizza with cheese." },
    { s:"It is sunny and hot in summer.", alt:["in summer it is sunny and hot", "it is hot and sunny in summer"] },
    { s:"The cat is under the table." },
    { s:"He went to the beach last weekend.", alt:["last weekend he went to the beach"] },
    { s:"Do you like chocolate ice cream?" },
    { s:"My grandmother lives in a small house." },
    { s:"They were at the museum yesterday.", alt:["yesterday they were at the museum"] },
    { s:"How many brothers and sisters do you have?", alt:["how many sisters and brothers do you have"] },
    { s:"I usually take the bus to school." }
  ],
  use: [
    { q:"My sister ___ to school by bus.", o:["go","goes","going"], a:1, why:"Con he/she/it el verbo lleva -s en presente simple: goes." },
    { q:"There ___ two cats in the garden.", o:["is","are","am"], a:1, why:"There are + plural (two cats)." },
    { q:"I ___ play the guitar, but I can't play the piano.", o:["can","can't","am"], a:0, why:"Can = poder/saber hacer algo. Contrasta con can't." },
    { q:"Look! The children ___ in the park.", o:["play","are playing","plays"], a:1, why:"“Look!” indica que pasa ahora: presente continuo (are + -ing)." },
    { q:"The book is ___ the table.", o:["on","at","to"], a:0, why:"On = sobre una superficie." },
    { q:"___ you like pizza?", o:["Do","Does","Are"], a:0, why:"Preguntas en presente simple con you: Do you…?" },
    { q:"He ___ like vegetables.", o:["don't","doesn't","isn't"], a:1, why:"Negativo con he/she/it: doesn't + verbo base." },
    { q:"Yesterday I ___ at home.", o:["am","was","were"], a:1, why:"Pasado de am/is = was (I was, he was)." },
    { q:"My dog is ___ than your dog.", o:["big","bigger","biggest"], a:1, why:"Comparativo de adjetivo corto: big → bigger (se dobla la g)." },
    { q:"We ___ to the cinema last Saturday.", o:["go","went","goes"], a:1, why:"“Last Saturday” = pasado. Go es irregular: went." },
    { q:"How ___ apples do you want?", o:["much","many","any"], a:1, why:"Many con cosas que se pueden contar (apples)." },
    { q:"She has lunch ___ one o'clock.", o:["in","on","at"], a:2, why:"At + hora (at one o'clock)." },
    { q:"My birthday is ___ March.", o:["in","on","at"], a:0, why:"In + mes (in March)." },
    { q:"This is ___ apple.", o:["a","an","the"], a:1, why:"An antes de sonido vocal: an apple." },
    { q:"They ___ my best friends.", o:["is","are","am"], a:1, why:"They + are." },
    { q:"Where ___ your parents from?", o:["is","are","do"], a:1, why:"Your parents (plural) → are." },
    { q:"I ___ breakfast at seven every morning.", o:["have","has","having"], a:0, why:"I + verbo base en presente simple: have." },
    { q:"It's cold. ___ your jacket!", o:["Put on","Puts on","Putting on"], a:0, why:"Para dar instrucciones (imperativo) se usa el verbo base." },
    { q:"Elephants are ___ than mice.", o:["heavier","heavy","heaviest"], a:0, why:"Comparativo: heavy → heavier (la y cambia a i)." },
    { q:"Did you ___ your homework?", o:["do","did","does"], a:0, why:"Después de did va el verbo base: Did you do…?" }
  ],
  vocab: [
    { t:"My name is Tomás. Every morning I {1} up at seven. I have {2} with my family: bread and milk. Then I {3} my teeth and walk to {4}.",
      a:["get","breakfast","brush","school"], x:["sleep","dinner"] },
    { t:"Today it is {1} and very hot, so I'm wearing a T-shirt and {2}. In winter it is cold and it often {3}, so I take my {4}.",
      a:["sunny","shorts","rains","umbrella"], x:["snowy","scarf"] },
    { t:"This is my family. My {1} is a doctor and my dad is a teacher. I have one {2}; her name is Sofía. My {3}, my dad's mother, lives with us. We also have a dog, our favourite {4}.",
      a:["mum","sister","grandmother","pet"], x:["uncle","brother"] },
    { t:"In my town there is a big {1} where you can buy food. You can watch films at the {2}. If you are sick, you go to the {3}. On Sundays I play in the {4} with my friends.",
      a:["supermarket","cinema","hospital","park"], x:["library","bank"] },
    { t:"For lunch I eat rice, chicken and a {1} with tomato and lettuce. I drink a glass of {2}. For dessert I have an {3}. I never eat {4} food because it isn't healthy.",
      a:["salad","water","apple","junk"], x:["soup","bread"] },
    { t:"Dolphins live in the {1}. They are very {2} animals and they can learn tricks. Monkeys live in the {3} and they love to eat {4}.",
      a:["sea","intelligent","jungle","bananas"], x:["desert","slow"] }
  ],
  mistake: [
    { s:"She don't like apples.", bad:"don't", fix:"doesn't", why:"Con she: doesn't + verbo base." },
    { s:"I goes to school by bike.", bad:"goes", fix:"go", why:"Con I el verbo no lleva -s: I go." },
    { s:"There is three books on the desk.", bad:"is", fix:"are", why:"Three books es plural: there are." },
    { s:"He can plays tennis.", bad:"plays", fix:"play", why:"Después de can va el verbo base: can play." },
    { s:"My sister is tallest than me.", bad:"tallest", fix:"taller", why:"Para comparar dos cosas con “than” se usa el comparativo: taller." },
    { s:"We was at the park yesterday.", bad:"was", fix:"were", why:"We + were en pasado." },
    { s:"I have a apple in my bag.", bad:"a", fix:"an", why:"An antes de sonido vocal: an apple." },
    { s:"Yesterday I play football with my friends.", bad:"play", fix:"played", why:"“Yesterday” = pasado: played." },
    { s:"Does she likes music?", bad:"likes", fix:"like", why:"Después de does va el verbo base: Does she like…?" },
    { s:"My birthday is on May.", bad:"on", fix:"in", why:"In + mes: in May." },
    { s:"The childrens are in the classroom.", bad:"childrens", fix:"children", why:"Child es irregular: el plural es children (sin -s)." },
    { s:"They is my cousins.", bad:"is", fix:"are", why:"They + are." },
    { s:"I see a film at the cinema last night.", bad:"see", fix:"saw", why:"“Last night” = pasado. See es irregular: saw." },
    { s:"How many milk do you drink?", bad:"many", fix:"much", why:"Milk no se cuenta: much." },
    { s:"Where do you lives?", bad:"lives", fix:"live", why:"Después de do va el verbo base: Where do you live?" }
  ],
  wf: [
    { s:"My father is a good ___.", base:"TEACH", a:["teacher"], why:"-er forma la persona que hace la acción: teach → teacher." },
    { s:"I like ___ in the pool.", base:"SWIM", a:["swimming"], why:"Like + -ing. Swim dobla la m: swimming." },
    { s:"There are five ___ in my family.", base:"CHILD", a:["children"], why:"Plural irregular: child → children." },
    { s:"Today is ___ than yesterday.", base:"HOT", a:["hotter"], why:"Comparativo: hot → hotter (dobla la t)." },
    { s:"Last week we ___ to the zoo.", base:"GO", a:["went"], why:"Pasado irregular: go → went." },
    { s:"She is a famous ___.", base:"SING", a:["singer"], why:"La persona que canta: singer." },
    { s:"It is a ___ day. Let's go to the beach!", base:"SUN", a:["sunny"], why:"Clima: sun → sunny (dobla la n + y)." },
    { s:"My mum ___ dinner every evening.", base:"COOK", a:["cooks"], why:"He/she + verbo con -s: cooks." },
    { s:"A ___ works on a farm.", base:"FARM", a:["farmer"], why:"La persona que trabaja en una granja: farmer." },
    { s:"Be ___! The road is dangerous.", base:"CARE", a:["careful"], why:"-ful forma adjetivos: care → careful." },
    { s:"I brush my ___ twice a day.", base:"TOOTH", a:["teeth"], why:"Plural irregular: tooth → teeth." },
    { s:"This is the ___ day of my life!", base:"HAPPY", a:["happiest"], why:"Superlativo: happy → the happiest." },
    { s:"Yesterday it ___ all day.", base:"RAIN", a:["rained"], why:"Pasado regular: rain → rained." },
    { s:"It is very ___ today; my hat flew away!", base:"WIND", a:["windy"], why:"Clima: wind → windy." },
    { s:"The ___ is driving the bus.", base:"DRIVE", a:["driver"], why:"La persona que maneja: driver." }
  ],
  dict: [
    "I live in a small town.", "My brother likes football.", "It is cold and rainy today.",
    "We have lunch at one o'clock.", "Can you help me, please?", "There is a park near my house.",
    "She is reading a book.", "I went to the beach yesterday.", "My favourite colour is blue.",
    "The cat is sleeping on the sofa.", "Do you have any pets?", "We play in the park after school."
  ],
  read: [
    { title:"Lucas's day",
      text:"Lucas is eleven years old and he lives in Valparaíso. He gets up at half past six and has breakfast with his sister. He goes to school by bus. His favourite subject is Science because he loves animals. After school, he plays football with his friends. In the evening, he does his homework and watches TV with his family. He goes to bed at ten o'clock.",
      qs:[ { q:"How does Lucas go to school?", o:["By bike","By bus","On foot"], a:1 },
           { q:"Why does he like Science?", o:["He loves animals","He loves computers","His teacher is funny"], a:0 },
           { q:"What does he do in the evening?", o:["He plays football","He does his homework","He goes to the beach"], a:1 } ] },
    { title:"A postcard from Puerto Varas",
      text:"Dear Grandma, I'm in Puerto Varas with Mum and Dad. The weather is cold and it rains every afternoon, but the lake is beautiful! Yesterday we visited the Osorno volcano and I saw snow for the first time. Tomorrow we are going to eat kuchen in a café. I miss you! Love, Ema.",
      qs:[ { q:"Who is Ema with?", o:["Her grandmother","Her parents","Her friends"], a:1 },
           { q:"What did Ema see for the first time?", o:["A lake","Snow","A café"], a:1 },
           { q:"What are they going to do tomorrow?", o:["Visit a volcano","Eat kuchen","Swim in the lake"], a:1 } ] },
    { title:"My pet",
      text:"I have a dog called Toby. He is three years old and he is brown and white. Toby is very friendly, but he is a little lazy: he sleeps all morning! Every afternoon I take him to the park. He loves running after balls. He can't swim, so he never goes into the water.",
      qs:[ { q:"What colour is Toby?", o:["Black","Brown and white","Grey"], a:1 },
           { q:"When does Toby sleep?", o:["All morning","All afternoon","Never"], a:0 },
           { q:"What can't Toby do?", o:["Run","Swim","Play with balls"], a:1 } ] },
    { title:"Our school",
      text:"Our school is not very big, but it is nice. It has twelve classrooms, a library, a computer room and a big playground. There isn't a swimming pool, but there is a gym. My favourite place is the library because it is quiet and it has lots of comics. Classes start at eight and finish at four.",
      qs:[ { q:"What doesn't the school have?", o:["A gym","A library","A swimming pool"], a:2 },
           { q:"Why is the library the writer's favourite place?", o:["It's quiet and has comics","It has computers","It's very big"], a:0 },
           { q:"When do classes finish?", o:["At eight","At four","At twelve"], a:1 } ] }
  ]
},

/* ============================ A2 · 7°–8° Básico ============================
   Deportes y tiempo libre, sentimientos, medio ambiente, tecnología e inventos,
   viajes. Pasado simple y continuo, futuro (will / going to), condicional cero
   y primero, some/any, much/many, should, present perfect (ever, already, yet). */
A2: {
  scramble: [
    { s:"I have never been to another country." },
    { s:"We will stay at home if it rains tomorrow.", alt:["if it rains tomorrow we will stay at home"] },
    { s:"She was watching TV when I called her.", alt:["when I called her she was watching TV"] },
    { s:"You should drink more water." },
    { s:"How often do you play video games?" },
    { s:"They are going to visit their cousins next week.", alt:["next week they are going to visit their cousins"] },
    { s:"There isn't any milk in the fridge." },
    { s:"My best friend is good at playing basketball." },
    { s:"Plastic bags are very bad for the environment." },
    { s:"I didn't go to the party because I was sick." },
    { s:"What were you doing at eight o'clock last night?" },
    { s:"Solar energy is cleaner than oil." },
    { s:"We usually go camping in the summer.", alt:["in the summer we usually go camping"] },
    { s:"Have you ever eaten sushi?" },
    { s:"The telephone was invented by Alexander Graham Bell." }
  ],
  use: [
    { q:"I ___ to the gym three times a week.", o:["go","am going","went"], a:0, why:"Rutinas y frecuencia → presente simple." },
    { q:"While I ___ my homework, the lights went out.", o:["did","was doing","am doing"], a:1, why:"Acción en desarrollo interrumpida por otra: pasado continuo (was doing)." },
    { q:"If you heat ice, it ___.", o:["melts","melted","will melting"], a:0, why:"Condicional cero (hechos que siempre ocurren): if + presente, presente." },
    { q:"If we recycle more, we ___ the planet.", o:["help","will help","helped"], a:1, why:"Primer condicional (posibilidad real): if + presente, will + verbo." },
    { q:"Look at those dark clouds! It ___ rain.", o:["is going to","will","goes to"], a:0, why:"Predicción con evidencia que vemos ahora → going to." },
    { q:"I think robots ___ do our homework in the future.", o:["will","are","did"], a:0, why:"Predicción u opinión sobre el futuro (I think…) → will." },
    { q:"Is there ___ sugar in the cupboard?", o:["some","any","many"], a:1, why:"En preguntas y negativos se usa any." },
    { q:"How ___ time do we have?", o:["many","much","a few"], a:1, why:"Time no se cuenta: much." },
    { q:"You look tired. You ___ go to bed early.", o:["should","shouldn't","mustn't"], a:0, why:"Should = consejo (deberías)." },
    { q:"She has ___ finished her project.", o:["already","yet","ever"], a:0, why:"Already (ya) va entre has y el participio en oraciones afirmativas." },
    { q:"Have you finished your homework ___?", o:["already","yet","just"], a:1, why:"Yet va al final en preguntas y negativos." },
    { q:"This is the ___ film I have ever seen!", o:["better","best","good"], a:1, why:"Superlativo de good: the best." },
    { q:"He ___ his leg when he was skiing.", o:["breaks","broke","has broken"], a:1, why:"Acción terminada en un momento del pasado → pasado simple (broke)." },
    { q:"I'm not very good ___ maths.", o:["in","at","on"], a:1, why:"Good at + actividad o materia." },
    { q:"We ___ live in Santiago; now we live in La Serena.", o:["used to","use to","are used"], a:0, why:"Used to = hábito o situación del pasado que ya no ocurre." },
    { q:"She can't come because she ___ her arm.", o:["has broken","have broken","breaking"], a:0, why:"Present perfect (resultado ahora) con she → has + participio." },
    { q:"They ___ football when it started to rain.", o:["played","were playing","are playing"], a:1, why:"Acción en desarrollo interrumpida → pasado continuo." },
    { q:"Wind power is ___ than coal.", o:["cleaner","more clean","cleanest"], a:0, why:"Clean es corto: cleaner." },
    { q:"I'm really interested ___ photography.", o:["on","in","at"], a:1, why:"Interested in." },
    { q:"Don't forget ___ the lights when you leave.", o:["turn off","to turn off","turning off"], a:1, why:"Forget + to + verbo (olvidar hacer algo)." }
  ],
  vocab: [
    { t:"Our planet has big problems. Factories and cars cause air {1}. Many people throw {2} in the streets and rivers. We can help: we can {3} paper, glass and plastic, and we can save {4} by turning off the lights.",
      a:["pollution","rubbish","recycle","energy"], x:["garden","borrow"] },
    { t:"Last Saturday our team played the {1} of the school tournament. The other team was very strong, but our {2} was amazing: he stopped every ball! In the end we {3} 2–1 and we got a {4}.",
      a:["final","goalkeeper","won","trophy"], x:["referee","ticket"] },
    { t:"My grandparents didn't have a {1} phone when they were young. Today I use mine to send {2} and to search for information on the {3}. But I try not to spend too much time in front of a {4}.",
      a:["mobile","messages","internet","screen"], x:["radio","letters"] },
    { t:"Before the exam I was really {1} because I didn't sleep well. When the teacher gave us the results, I felt {2}: I got a 6.8! My mum was very {3} of me. Now I feel {4} and ready for the holidays.",
      a:["nervous","surprised","proud","relaxed"], x:["bored","angry"] },
    { t:"In February we went on a road {1} to the south of Chile. We stayed in a small {2} near a lake. Every day we went {3} in the mountains, and at night we looked at the {4} in the sky.",
      a:["trip","cabin","hiking","stars"], x:["ticket","shopping"] },
    { t:"The light bulb is one of the most important {1} in history. Before it, people used candles to {2} their houses. Thomas Edison didn't {3} the first bulb, but he made one that could last for many {4}.",
      a:["inventions","light","invent","hours"], x:["problems","sell"] }
  ],
  mistake: [
    { s:"I have see that film three times.", bad:"see", fix:"seen", why:"Present perfect: have + participio (seen)." },
    { s:"If you study, you will to pass the test.", bad:"to", fix:"", why:"Después de will va el verbo sin “to”: will pass." },
    { s:"She was cook dinner when I arrived.", bad:"cook", fix:"cooking", why:"Pasado continuo: was + -ing." },
    { s:"There aren't some apples left.", bad:"some", fix:"any", why:"En negativos se usa any." },
    { s:"He is more taller than his father.", bad:"more", fix:"", why:"Taller ya es comparativo; “more” sobra." },
    { s:"I didn't went to school yesterday.", bad:"went", fix:"go", why:"Después de didn't va el verbo base: didn't go." },
    { s:"We is going to visit Chiloé.", bad:"is", fix:"are", why:"We + are going to." },
    { s:"How much books do you have?", bad:"much", fix:"many", why:"Books se cuenta: many." },
    { s:"You should to wear a helmet.", bad:"to", fix:"", why:"Después de should va el verbo sin “to”." },
    { s:"My brother is good in maths.", bad:"in", fix:"at", why:"Good at + materia." },
    { s:"Have you ever went to Easter Island?", bad:"went", fix:"been", why:"Present perfect: have + participio. Para “visitar/ir” se usa been." },
    { s:"This is the goodest pizza in town.", bad:"goodest", fix:"best", why:"Good es irregular: the best." },
    { s:"She has finished her project yet.", bad:"yet", fix:"already", why:"En afirmativas se usa already; yet es para preguntas y negativos." },
    { s:"I'm interested on science.", bad:"on", fix:"in", why:"Interested in." },
    { s:"Plastic take hundreds of years to disappear.", bad:"take", fix:"takes", why:"Plastic es singular (it): takes." }
  ],
  wf: [
    { s:"Cars cause a lot of air ___.", base:"POLLUTE", a:["pollution"], why:"-tion forma sustantivos: pollute → pollution." },
    { s:"Edison was a famous ___.", base:"INVENT", a:["inventor"], why:"La persona que inventa: inventor." },
    { s:"The guide was very ___ and answered all our questions.", base:"HELP", a:["helpful"], why:"-ful forma adjetivos: help → helpful." },
    { s:"It's ___ to swim here. The water is too deep.", base:"DANGER", a:["dangerous"], why:"-ous forma adjetivos: danger → dangerous." },
    { s:"There was a big ___ between the two teams.", base:"COMPETE", a:["competition"], why:"Compete → competition (sustantivo)." },
    { s:"She answered the question ___.", base:"CORRECT", a:["correctly"], why:"Para describir cómo se hace algo: adverbio con -ly." },
    { s:"I felt very ___ during the long trip.", base:"BORE", a:["bored"], why:"-ed describe cómo se siente una persona: bored." },
    { s:"The film was really ___; I fell asleep.", base:"BORE", a:["boring"], why:"-ing describe la cosa que causa el sentimiento: boring." },
    { s:"This app is very ___ for students.", base:"USE", a:["useful"], why:"Use → useful (útil)." },
    { s:"We had a ___ time at the beach.", base:"WONDER", a:["wonderful"], why:"Wonder → wonderful (maravilloso)." },
    { s:"My grandfather is very ___; he walks five kilometres every day.", base:"ACT", a:["active"], why:"Act → active (activo)." },
    { s:"Please drive ___.", base:"SLOW", a:["slowly"], why:"Adverbio de modo: slow → slowly." },
    { s:"The ___ of the telephone changed communication.", base:"INVENT", a:["invention"], why:"La cosa inventada: invention." },
    { s:"It was ___ to find a seat on the bus; it was full.", base:"POSSIBLE", a:["impossible"], why:"El prefijo im- da el significado contrario." },
    { s:"The ___ scored three goals.", base:"PLAY", a:["player"], why:"La persona que juega: player." }
  ],
  dict: [
    "We should save water and energy.", "I was walking home when it started to rain.", "If you heat water, it boils.",
    "Have you ever been to the south of Chile?", "They are going to build a new park.", "My cousin is better at tennis than me.",
    "There isn't any bread left.", "I think robots will help us at home.", "She didn't come to the party last night.",
    "How often do you go to the gym?", "We usually recycle paper and plastic.", "The concert was amazing!"
  ],
  read: [
    { title:"Plastic in the ocean",
      text:"Every year, millions of tonnes of plastic end up in the ocean. Sea animals like turtles often think that plastic bags are jellyfish and eat them. Plastic can take hundreds of years to break down. Some countries, like Chile, have banned plastic bags in shops. Experts say that the best solution is to use less plastic: carry a reusable bag, say no to straws and choose products with less packaging.",
      qs:[ { q:"Why do turtles eat plastic bags?", o:["They like the taste","They think they are jellyfish","They have no other food"], a:1 },
           { q:"What has Chile done?", o:["Banned plastic bags in shops","Cleaned all its beaches","Stopped making plastic"], a:0 },
           { q:"According to experts, what is the best solution?", o:["Recycling everything","Using less plastic","Building more factories"], a:1 } ] },
    { title:"A young inventor",
      text:"When Daniela was fourteen, she noticed that her grandmother often forgot to take her medicine. So she decided to invent a solution. She built a small box that lights up and plays music when it is time to take the pills. It took her six months and many failed attempts. Last year, her invention won a national science prize. Now she wants to study engineering at university.",
      qs:[ { q:"Why did Daniela build the box?", o:["To win a prize","To help her grandmother","For a school project"], a:1 },
           { q:"How long did it take?", o:["Six weeks","Six months","One year"], a:1 },
           { q:"What does she want to do in the future?", o:["Study engineering","Become a doctor","Sell her box"], a:0 } ] },
    { title:"Esports",
      text:"Esports are competitions where people play video games professionally. Some tournaments have millions of viewers online and big prizes. Professional players train for many hours a day, just like athletes. However, doctors say that young players should take breaks, do physical exercise and sleep well, because spending too much time in front of a screen can be bad for their health.",
      qs:[ { q:"What are esports?", o:["Outdoor sports","Professional video game competitions","Sports on TV"], a:1 },
           { q:"How are professional players similar to athletes?", o:["They train for many hours","They play outside","They are very young"], a:0 },
           { q:"What do doctors recommend?", o:["Playing more","Taking breaks and exercising","Buying better computers"], a:1 } ] },
    { title:"The Atacama Desert",
      text:"The Atacama Desert in the north of Chile is one of the driest places on Earth. Some areas have not had rain for many years. Because the sky is so clear, scientists from all over the world come to study the stars in its observatories. Sometimes, after a little rain, the desert is covered in flowers. This amazing event is called the “desierto florido”.",
      qs:[ { q:"Why do scientists go to the Atacama?", o:["To study plants","To study the stars","To find water"], a:1 },
           { q:"What happens after a little rain?", o:["Flowers cover the desert","There are floods","It snows"], a:0 },
           { q:"What is true about the desert?", o:["It rains every week","It is one of the driest places on Earth","It is in the south"], a:1 } ] }
  ]
},

/* ============================ B1 · 1°–3° Medio ============================
   Festividades y tradiciones, redes sociales y noticias falsas, tecnología,
   medio ambiente y energía, salud, trabajo y futuro, turismo.
   Present perfect (for/since) y continuo, pasado perfecto, voz pasiva,
   segundo y tercer condicional, estilo indirecto, cláusulas relativas,
   used to, modales de deducción, gerundio/infinitivo, conectores. */
B1: {
  scramble: [
    { s:"I have been learning English for five years." },
    { s:"If I had more free time, I would learn to play the drums.", alt:["I would learn to play the drums if I had more free time"] },
    { s:"The festival is celebrated every year in February." },
    { s:"She told me that she was moving to another city." },
    { s:"Social media has changed the way we communicate." },
    { s:"The girl who won the competition is my cousin." },
    { s:"We used to go to the beach every summer.", alt:["every summer we used to go to the beach"] },
    { s:"I'm looking forward to seeing you again." },
    { s:"We went to the parade although it was raining.", alt:["although it was raining we went to the parade"] },
    { s:"Many traditions have been passed down from generation to generation." },
    { s:"You must not use your phone during the exam." },
    { s:"He might be late because of the traffic." },
    { s:"What would you do if you won the lottery?" },
    { s:"The video was watched by millions of people." },
    { s:"It's not worth spending so much time online." }
  ],
  use: [
    { q:"I ___ in this city since 2019.", o:["live","have lived","lived"], a:1, why:"Desde un momento del pasado hasta hoy (since) → present perfect." },
    { q:"If I ___ you, I would talk to the teacher.", o:["am","were","will be"], a:1, why:"Segundo condicional para dar consejos: If I were you…" },
    { q:"The Day of the Dead ___ in Mexico on 1 and 2 November.", o:["celebrates","is celebrated","celebrated"], a:1, why:"Voz pasiva en presente: is + participio (lo celebran las personas)." },
    { q:"She said she ___ tired.", o:["is","was","has"], a:1, why:"Estilo indirecto: el tiempo verbal retrocede (is → was)." },
    { q:"That's the man ___ car was stolen.", o:["who","which","whose"], a:2, why:"Whose indica posesión (el auto del hombre)." },
    { q:"We ___ go to the cinema a lot when we were kids.", o:["use to","used to","were used"], a:1, why:"Hábito del pasado en afirmativo: used to." },
    { q:"___ it was expensive, we bought the tickets.", o:["Although","Because","Despite"], a:0, why:"Although + oración completa; despite va con sustantivo o -ing." },
    { q:"I'm not used to ___ up so early.", o:["get","getting","got"], a:1, why:"Be used to + -ing (estar acostumbrado a)." },
    { q:"He ___ be at home; the lights are on.", o:["must","can't","mustn't"], a:0, why:"Deducción casi segura → must." },
    { q:"She ___ be in Paris; I saw her this morning!", o:["must","can't","should"], a:1, why:"Deducción de imposibilidad → can't." },
    { q:"I've lived here ___ ten years.", o:["since","for","during"], a:1, why:"For + período de tiempo; since + momento de inicio." },
    { q:"If it hadn't rained, we ___ the match.", o:["would win","would have won","will win"], a:1, why:"Tercer condicional (pasado irreal): would have + participio." },
    { q:"I enjoy ___ new places.", o:["visit","to visit","visiting"], a:2, why:"Enjoy + -ing." },
    { q:"We decided ___ a party for her birthday.", o:["have","having","to have"], a:2, why:"Decide + to + verbo." },
    { q:"The more you practise, the ___ you get.", o:["better","best","good"], a:0, why:"Estructura “the more…, the + comparativo”." },
    { q:"Have you ever ___ a horror film alone?", o:["saw","seen","see"], a:1, why:"Present perfect: have + participio (seen)." },
    { q:"There were ___ people at the concert that we couldn't move.", o:["so many","so much","such"], a:0, why:"So many + sustantivo plural contable… that." },
    { q:"By the time we arrived, the parade ___.", o:["finished","had finished","has finished"], a:1, why:"Acción anterior a otra en el pasado → pasado perfecto (had + participio)." },
    { q:"Posts on social media can ___ by anyone.", o:["see","be seen","been seen"], a:1, why:"Pasiva con modal: can + be + participio." },
    { q:"I wish I ___ speak Japanese.", o:["can","could","will"], a:1, why:"Wish + pasado (could) para deseos sobre el presente." }
  ],
  vocab: [
    { t:"Social media has become part of our daily lives. Teenagers spend hours scrolling through their {1}, liking photos and leaving {2}. However, not everything we see online is true; there is a lot of fake {3}. That's why it is important to check the {4} before sharing a post.",
      a:["feed","comments","news","source"], x:["wallet","receipt"] },
    { t:"Every year, thousands of people {1} La Tirana in the north of Chile. Dancers wear colourful {2} and masks, and the streets are full of music. The festival has its {3} in both Andean and Catholic traditions, and it has been {4} for more than a century.",
      a:["attend","costumes","roots","celebrated"], x:["uniforms","ignored"] },
    { t:"Chile is one of the leading countries in solar {1}. The Atacama Desert receives more sunlight than almost anywhere else, which makes it perfect for solar {2}. Using {3} energy helps reduce greenhouse gas {4}.",
      a:["power","plants","renewable","emissions"], x:["fossil","deserts"] },
    { t:"When choosing a {1}, it's important to think about what you are good at. Some people prefer jobs where they can work in a {2}, while others prefer to work on their own. Many young people also want a good {3} between work and personal life, and a {4} that pays the bills.",
      a:["career","team","balance","salary"], x:["holiday","uniform"] },
    { t:"Experts recommend eight to ten hours of {1} for teenagers. Staying up late using screens can affect your {2}, mood and memory. Doing regular {3} and eating a balanced {4} also help you feel better.",
      a:["sleep","concentration","exercise","diet"], x:["homework","menu"] },
    { t:"Easter Island, or Rapa Nui, is famous for its moai, huge stone {1} carved by the Rapa Nui people centuries ago. Every year, thousands of {2} visit the island, which brings money but also puts {3} on its fragile environment. Local communities work hard to {4} their culture and heritage.",
      a:["statues","tourists","pressure","preserve"], x:["buildings","destroy"] }
  ],
  mistake: [
    { s:"I have lived here since five years.", bad:"since", fix:"for", why:"For + período (five years); since + momento de inicio." },
    { s:"If I had more money, I will buy a car.", bad:"will", fix:"would", why:"Segundo condicional: if + pasado, would + verbo." },
    { s:"She said me that she was busy.", bad:"said", fix:"told", why:"Tell + persona (told me); say no lleva persona directa." },
    { s:"The festival is celebrate every year.", bad:"celebrate", fix:"celebrated", why:"Voz pasiva: is + participio (celebrated)." },
    { s:"I'm looking forward to see you.", bad:"see", fix:"seeing", why:"Look forward to + -ing." },
    { s:"This is the girl which won the prize.", bad:"which", fix:"who", why:"Who para personas; which para cosas." },
    { s:"Despite it was cold, we went out.", bad:"Despite", fix:"Although", why:"Antes de una oración completa se usa although." },
    { s:"She avoids eat junk food.", bad:"eat", fix:"eating", why:"Avoid + -ing." },
    { s:"I didn't used to like vegetables.", bad:"used", fix:"use", why:"Después de didn't va el verbo base: didn't use to." },
    { s:"Everybody have a phone nowadays.", bad:"have", fix:"has", why:"Everybody es singular: has." },
    { s:"We have visited Rapa Nui last year.", bad:"have", fix:"", why:"Con un momento terminado (last year) se usa pasado simple: We visited." },
    { s:"There is less people in the streets today.", bad:"less", fix:"fewer", why:"Fewer con sustantivos contables (people); less con incontables." },
    { s:"The news are very surprising.", bad:"are", fix:"is", why:"News es incontable y singular: the news is." },
    { s:"He must to wear a uniform.", bad:"to", fix:"", why:"Después de must va el verbo sin “to”." },
    { s:"I wish I can fly.", bad:"can", fix:"could", why:"Wish + pasado: I wish I could…" }
  ],
  wf: [
    { s:"Social media can be very ___.", base:"ADDICT", a:["addictive"], why:"-ive forma adjetivos: addict → addictive." },
    { s:"The ___ of the festival attracts many tourists.", base:"POPULAR", a:["popularity"], why:"-ity forma sustantivos: popular → popularity." },
    { s:"There was a long ___ about fake news in class.", base:"DISCUSS", a:["discussion"], why:"Discuss → discussion (sustantivo)." },
    { s:"The ___ of the moai is still a mystery.", base:"CONSTRUCT", a:["construction"], why:"Construct → construction." },
    { s:"It's ___ to share your password.", base:"RESPONSIBLE", a:["irresponsible"], why:"El prefijo ir- da el significado contrario." },
    { s:"She is a very ___ person; she always helps others.", base:"CARE", a:["caring"], why:"Caring = que se preocupa por los demás." },
    { s:"The ___ of renewable energy is growing.", base:"PRODUCE", a:["production"], why:"Produce → production." },
    { s:"Teenagers need more ___ from adults.", base:"ENCOURAGE", a:["encouragement"], why:"-ment forma sustantivos: encouragement." },
    { s:"The results were ___; nobody expected them.", base:"SURPRISE", a:["surprising"], why:"-ing describe lo que causa la sorpresa." },
    { s:"He spoke ___ about the problem.", base:"HONEST", a:["honestly"], why:"Adverbio de modo: honest → honestly." },
    { s:"The ___ of the internet changed the world.", base:"ARRIVE", a:["arrival"], why:"Arrive → arrival (llegada)." },
    { s:"Fake news can be very ___.", base:"HARM", a:["harmful"], why:"-ful forma adjetivos: harm → harmful." },
    { s:"Many people feel ___ about the future.", base:"OPTIMISM", a:["optimistic"], why:"Optimism → optimistic (adjetivo)." },
    { s:"We need to find a ___ to plastic pollution.", base:"SOLVE", a:["solution"], why:"Solve → solution." },
    { s:"Always check the ___ of the information.", base:"RELIABLE", a:["reliability"], why:"Reliable → reliability (confiabilidad)." }
  ],
  dict: [
    "I have been studying for the test all week.", "If I were you, I would apologise.", "The parade was cancelled because of the rain.",
    "She said she would call me later.", "Social media can affect our self-esteem.", "We used to celebrate my birthday at my grandparents' house.",
    "Although it was late, we kept dancing.", "The museum was visited by thousands of tourists.", "You shouldn't believe everything you read online.",
    "He must have forgotten about the meeting.", "I'm looking forward to the holidays.", "Renewable energy is the key to a cleaner future."
  ],
  read: [
    { title:"Digital detox",
      text:"More and more teenagers are trying a “digital detox”: a period of time without phones or social media. Surveys show that many young people check their phones dozens of times a day. Those who tried a week-long detox reported sleeping better and feeling less anxious. However, some said they felt isolated because they couldn't follow conversations with their friends. Experts suggest a balanced approach, such as turning off notifications or keeping phones out of the bedroom at night.",
      qs:[ { q:"What is a digital detox?", o:["A diet without sugar","Time without phones or social media","A new app"], a:1 },
           { q:"What negative effect did some people report?", o:["They slept worse","They felt isolated","They got bad grades"], a:1 },
           { q:"What do experts suggest?", o:["Never using phones","A balanced approach","Buying a new phone"], a:1 } ] },
    { title:"Día de Muertos",
      text:"Día de Muertos, or the Day of the Dead, is celebrated in Mexico on 1 and 2 November. Contrary to what many people think, it is not a sad festival. Families build altars, called ofrendas, decorated with marigold flowers, candles, photos and the favourite food of their loved ones who have died. People believe that the spirits come back to visit. UNESCO has recognised this tradition as part of the Intangible Cultural Heritage of Humanity.",
      qs:[ { q:"How is Día de Muertos described?", o:["As a sad festival","As a celebration to remember loved ones","As a religious fast"], a:1 },
           { q:"What is an ofrenda?", o:["A type of food","A decorated altar","A traditional dance"], a:1 },
           { q:"What has UNESCO done?", o:["Created the festival","Recognised it as cultural heritage","Moved it to November"], a:1 } ] },
    { title:"Fake news",
      text:"According to a well-known study by researchers at MIT, false stories spread faster than true ones on social media. One reason is that fake news is often more surprising or emotional, so people share it without thinking. To avoid being fooled, check who wrote the article, look for the same information on reliable websites and be careful with headlines that seem too shocking to be true.",
      qs:[ { q:"Why does fake news spread quickly?", o:["It is shorter","It is more surprising or emotional","It has more photos"], a:1 },
           { q:"What is one thing you should check?", o:["Who wrote the article","How many likes it has","The colour of the website"], a:0 },
           { q:"What does “too shocking to be true” suggest?", o:["The news is probably reliable","The news might be false","The news is old"], a:1 } ] },
    { title:"A gap year",
      text:"A gap year is a year that some students take between finishing school and starting university. During this time, they might travel, volunteer or work to save money. Supporters say it helps young people become more independent and discover what they really want to study. Critics argue that some students lose their study habits and find it hard to go back to the classroom. In Chile, gap years are less common than in countries like the United Kingdom or Australia.",
      qs:[ { q:"When do students take a gap year?", o:["Before primary school","Between school and university","After university"], a:1 },
           { q:"What is one advantage mentioned?", o:["Becoming more independent","Earning a lot of money","Getting better grades"], a:0 },
           { q:"What do critics say?", o:["Gap years are too expensive","Students may lose their study habits","Travelling is dangerous"], a:1 } ] }
  ]
}
};
