// ---------- Side quests ("Festival friends") ----------
// They appear along the roads. leg = road that arrives to zone [leg]
// (0 = plaza → Day of the Dead, 1 = Day of the Dead → Lunar New Year, 2 → Fiestas Patrias, 3 → Holi, 4 → We Tripantu).
// t = position along that road (0 to 1), side = left (-1) or right (1) of the road.
// collect = the player first picks up n things near the NPC, then reads and answers.
// Each item: {k, q, o:[options], a:0 (correct is always the first; the game shuffles), why}
export const SIDE = [
{
 id:'picado', leg:0, t:0.34, side:1, title:'Papel Picado', icon:'🎏',
 npc:{ name:'Lupita', model:'Mage', tint:'#e2408f' },
 hello:"¡Ay, no! I'm Lupita. I spent all week cutting papel picado for the street party, but the wind pulled it down. Can you help me hang it again?",
 text:`Papel picado means "punched paper". It is a Mexican folk art: artists cut beautiful designs into thin, colourful tissue paper, and then they hang the sheets on long strings across streets and over altars. In the past, people cut each sheet by hand with small chisels, and an expert could cut up to fifty sheets at the same time. Today many decorations are made with machines, but families still enjoy making their own. During the Day of the Dead, papel picado represents the wind, and also how fragile life is.`,
 items:[
  {k:'E', q:'How did people make papel picado in the past?', o:['They cut the designs by hand with small chisels','They printed them with machines','They painted them on walls','They bought them from factories in other countries'], a:0, why:'"In the past, people cut each sheet by hand with small chisels…"'},
  {k:'I', q:'Why does papel picado represent "how fragile life is"?', o:['Because tissue paper breaks easily, like life','Because it is very expensive','Because it is only used once a year, in November','Because it is always black'], a:0, why:'Tissue paper is thin and easy to break — a symbol of fragile life.'},
  {k:'Q', q:'Papel picado is made of tissue paper, ___?', o:["isn't it","doesn't it","is it","wasn't it"], a:0, why:"Present passive with IS → isn't it?"},
 ],
 thanks:"¡Qué bonito! Look how it moves in the wind. Now the street is ready for the party. ¡Gracias!",
},
{
 id:'candles', leg:0, t:0.7, side:-1, title:'Candles for the Altar', icon:'🕯️',
 npc:{ name:'Abuela Carmen', model:'Rogue', tint:'#ff8a1f' },
 collect:{ n:5, what:'candles', icon:'🕯️', kind:'candle' },
 hello:"Hello, dear. I'm Carmen. I was carrying candles for my family's altar, but my basket broke and five candles rolled into the grass. My eyes aren't very good… could you find them?",
 ready:"All five candles! You have young eyes. Sit down a moment and read why candles are so important tonight.",
 text:`On the Day of the Dead, candles are one of the most important elements of the altar. Families believe that the light helps the souls of their loved ones to find the way home in the dark. Some families place one candle for each person they remember, and others put four candles in the shape of a cross to show the four directions of the world. At the cemetery, thousands of candles shine all night, so the graves look like a sea of small stars. Abuela Carmen always lights a white candle for her husband, who died ten years ago.`,
 items:[
  {k:'E', q:'According to tradition, what do the candles do?', o:['They help the souls find the way home','They keep the food warm','They scare the souls away','They are used to cook tamales for the family'], a:0, why:'"…the light helps the souls of their loved ones to find the way home in the dark."'},
  {k:'V', q:'"The graves look like a <b>sea</b> of small stars." Here, "a sea of" means…', o:['a very large number of','a place with salt water','a dark colour','a few'], a:0, why:'"A sea of…" = una gran cantidad de.'},
  {k:'L', q:"Carmen's husband, ___ died ten years ago, loved this festival.", o:['who','which','where','whose'], a:0, why:'WHO is the relative pronoun for people.'},
 ],
 thanks:"Now my altar shines again. My husband will find his way home tonight. Thank you, my dear.",
},
{
 id:'envelopes', leg:1, t:0.32, side:1, title:'Lucky Red Envelopes', icon:'🧧',
 npc:{ name:'Chen', model:'Knight', tint:'#e8322f' },
 collect:{ n:5, what:'red envelopes', icon:'🧧', kind:'envelope' },
 hello:"Ni hao! I'm Chen. I prepared red envelopes for my nephews and nieces, but a strong wind opened my bag and five envelopes flew away! Please help me find them!",
 ready:"You found them all! My nephews will be so happy. Here's something interesting about red envelopes.",
 text:`During Lunar New Year, older relatives give red envelopes, called hongbao, to children and young people who are not married. The colour red represents good luck, and the money inside is a wish for a happy and successful year. There are some rules: the money should be new, and the amount should not include the number four, because "four" sounds like the word for "death" in Chinese. Nowadays, many people send digital red envelopes with their phones, but most children still prefer to open the paper ones.`,
 items:[
  {k:'E', q:"Why shouldn't the amount of money include the number four?", o:['Because "four" sounds like the word for "death"','Because it is too much money','Because four is an even number','Because the envelopes are too small for four banknotes'], a:0, why:'"…\'four\' sounds like the word for \'death\' in Chinese."'},
  {k:'I', q:'Why do most children probably prefer paper envelopes?', o:['Opening a real envelope feels more exciting and traditional','Digital money is not real','Children don\'t have phones','Paper envelopes always have more money than digital envelopes'], a:0, why:'The text suggests that the paper tradition still feels special.'},
  {k:'Q', q:"You didn't open my envelopes, ___?", o:['did you',"didn't you",'do you','were you'], a:0, why:'Negative past simple → positive tag: did you?'},
 ],
 thanks:"Xièxie! May the new year bring you good luck — and good grades in English!",
},
{
 id:'skylantern', leg:1, t:0.68, side:-1, title:'The Stuck Lantern', icon:'🏮',
 npc:{ name:'Lin', model:'Mage', tint:'#ffcc33' },
 hello:"Oh no, look up! I'm Lin. I wrote a wish on my paper lantern, but it got stuck in that tree. Can you help me get it down?",
 text:`The Mid-Autumn Festival is celebrated in China and other Asian countries when the moon is at its fullest and brightest, usually in September. Families get together to look at the moon, eat mooncakes and carry colourful lanterns. In some places, people used to release sky lanterns with wishes written on them. However, sky lanterns can start fires and harm animals when they fall, so many cities have banned them. Today, people often choose floating lanterns on rivers, or they simply hang lanterns at home.`,
 items:[
  {k:'E', q:'What do families do during the Mid-Autumn Festival?', o:['Look at the moon, eat mooncakes and carry lanterns','Clean the house from top to bottom before the new year','Give red envelopes to children','Wash in a cold river at dawn'], a:0, why:'"Families get together to look at the moon, eat mooncakes and carry colourful lanterns."'},
  {k:'V', q:'"Many cities have <b>banned</b> them." Banned means…', o:['not allowed by law','made more popular','repaired','decorated'], a:0, why:'Ban = prohibir.'},
  {k:'L', q:'Sky lanterns ___ by many cities because they can start fires.', o:['have been banned','have banned','are banning','banned'], a:0, why:'Present perfect passive: have been + past participle.'},
 ],
 thanks:"Got it! I'll hang it at home, where it's safe. My wish? That you pass all your English tests!",
},
{
 id:'kite', leg:2, t:0.32, side:1, title:'Volantín in the Tree', icon:'🪁',
 npc:{ name:'Matías', model:'Ranger', tint:'#2f6fe0' },
 hello:"¡Oye! I'm Matías. My new volantín got stuck in that tree and Fiestas Patrias start tomorrow! Can you help me get it down?",
 text:`Flying kites, or volantines, is one of the oldest traditions of Fiestas Patrias in Chile. Children were already flying kites in Chile in the 18th century. In September, the windy spring weather is perfect for it, and the sky fills with colourful kites. Some people still practise "comisión", a competition to cut other kites' strings. However, strings covered with glass or metal are dangerous for people, birds and electric cables, so they are banned. Experts recommend flying kites in open parks, far away from trees and electric cables.`,
 items:[
  {k:'E', q:'Why is September a good month for flying kites in Chile?', o:['Because the spring weather is windy','Because there is no school','Because it is very hot','Because it never rains'], a:0, why:'"…the windy spring weather is perfect for it…"'},
  {k:'I', q:'Why do experts recommend flying kites far from electric cables?', o:['Kites and strings can cause accidents with electricity','Cables are very expensive','Birds live on the cables','Kites fly better near houses, so there are too many people'], a:0, why:'The text mentions danger to electric cables — a kite near them can cause an accident.'},
  {k:'Q', q:"You shouldn't fly your kite near cables, ___?", o:['should you',"shouldn't you",'do you','are you'], a:0, why:"Negative SHOULDN'T → positive tag: should you?"},
 ],
 thanks:"¡Bacán! It's flying again! Next time I'll go to the park, far from the trees and the cables.",
},
{
 id:'empanadas', leg:2, t:0.68, side:-1, title:'Empanadas de Pino', icon:'🥟',
 npc:{ name:'Doña Rosa', model:'Barbarian', tint:'#d52b1e' },
 collect:{ n:4, what:'ingredients', icon:'🧅', kind:'ingredient' },
 hello:"¡Hola, mijo! I'm Rosa. I'm baking empanadas for the fonda, but the dog ran off with my ingredients! I need my onions, the meat, the eggs and the olives. Can you find them?",
 ready:"Everything is here! Now I can start baking. While the oven gets hot, read my secret.",
 text:`The empanada de pino is the most popular food during Fiestas Patrias. "Pino" is the filling: minced beef cooked slowly with lots of onions, a little cumin and paprika. Before closing the empanada, cooks add a piece of boiled egg, a black olive and, in some families, a raisin. Then the empanadas are baked in a hot oven until they are golden. Doña Rosa prepares the pino the day before, because she says it tastes better when it rests overnight. Every September, Chileans eat millions of empanadas!`,
 items:[
  {k:'E', q:'What is "pino"?', o:['The filling of minced beef and onions','A kind of tree','The pastry of the empanada','A traditional dance'], a:0, why:'"\'Pino\' is the filling: minced beef cooked slowly with lots of onions…"'},
  {k:'I', q:'Why does Doña Rosa prepare the pino the day before?', o:['She thinks the flavour improves when it rests','She has no time on the same day','The oven is broken','Her family doesn\'t like food cooked on the same day'], a:0, why:'"…it tastes better when it rests overnight."'},
  {k:'L', q:'The empanadas ___ in a hot oven until they are golden.', o:['are baked','bake','are baking','baked'], a:0, why:'Present simple passive: are + past participle.'},
 ],
 thanks:"Mmm, smell that! Come back later and I'll give you the first empanada. ¡Viva Chile!",
},
{
 id:'petals', leg:3, t:0.32, side:1, title:'Natural Colours', icon:'🌸',
 npc:{ name:'Arjun', model:'Rogue', tint:'#a64dff' },
 collect:{ n:5, what:'flowers', icon:'🌸', kind:'petal' },
 hello:"Namaste! I'm Arjun. I want to make natural Holi colours for my little sister, because chemical powders hurt her skin. I need five flowers from this field. Will you help me?",
 ready:"Five beautiful flowers! Now we can make safe colours. This is how it works.",
 text:`Natural Holi colours are easy to make at home. For yellow, people mix turmeric with flour. For pink and red, they dry rose or hibiscus petals in the sun and then crush them into a fine powder. Marigold flowers give an orange colour, and dried spinach or mint leaves give green. Natural colours are softer than chemical ones, so they don't damage the skin or the eyes, and they don't pollute rivers when people wash. The only problem is that they are less bright — but most people think that's a small price to pay.`,
 items:[
  {k:'E', q:'How do people make pink and red powder?', o:['They dry petals in the sun and crush them','They mix turmeric with flour','They boil spinach leaves','They buy chemical powder'], a:0, why:'"…they dry rose or hibiscus petals in the sun and then crush them into a fine powder."'},
  {k:'V', q:'"That\'s a small <b>price to pay</b>." This expression means…', o:['a small disadvantage that is acceptable','the money you pay in a shop','a very expensive product','a big problem'], a:0, why:'A small price to pay = una pequeña desventaja que vale la pena.'},
  {k:'L', q:'Natural colours are ___ than chemical ones, but they are safer.', o:['less bright','less brighter','not as brighter','the less bright'], a:0, why:'LESS + adjective + than.'},
 ],
 thanks:"My sister will love these colours! Bura na mano, Holi hai!",
},
{
 id:'diwali', leg:3, t:0.68, side:-1, title:'Lights of Diwali', icon:'🪔',
 npc:{ name:'Anika', model:'Mage', tint:'#ff9a1a' },
 hello:"Hello! I'm Anika. Tonight is Diwali, the Festival of Lights, but the rain put out all the little lamps in front of my house! Can you help me light them again?",
 text:`Diwali is one of the biggest festivals in India, and millions of people celebrate it around the world. It usually takes place in October or November and lasts five days. People clean and decorate their homes, wear new clothes and light rows of small clay lamps called diyas. The lights represent the victory of light over darkness and of good over evil. Families also make colourful patterns on the floor, called rangoli, with coloured rice or sand. At night, fireworks fill the sky, and friends visit each other to share sweets.`,
 items:[
  {k:'E', q:'What are diyas?', o:['Small clay lamps','Colourful patterns on the floor','Traditional sweets','New clothes'], a:0, why:'"…light rows of small clay lamps called diyas."'},
  {k:'I', q:'Why do people probably clean their homes before Diwali?', o:['To welcome the festival and a new beginning in a clean house','Because the oil lamps make the house dirty during the festival','Because visitors never come','Because it rains a lot'], a:0, why:'Like other festivals, cleaning prepares the home for a good new beginning.'},
  {k:'Q', q:'Diwali lasts five days, ___?', o:["doesn't it","isn't it","does it","didn't it"], a:0, why:"Present simple positive (lasts) → doesn't it?"},
 ],
 thanks:"Look how bright they are! Happy Diwali — may your life be full of light!",
},
{
 id:'masks', leg:4, t:0.32, side:1, title:'La Tirana Masks', icon:'🎭',
 npc:{ name:'Camila', model:'Ranger', tint:'#2fae5a' },
 collect:{ n:3, what:'dance masks', icon:'🎭', kind:'mask' },
 hello:"¡Hola! I'm Camila from Iquique. Our dance group is practising for La Tirana, but we lost three masks on the way here. We can't dance without them! Can you find them?",
 ready:"Our masks! Now the group can practise. Do you know the festival of La Tirana? Read this.",
 text:`La Tirana is the biggest religious festival in the north of Chile. Every July, about 250,000 people travel to the small town of La Tirana, in the Atacama Desert. More than 200 dance groups dance for days to honour the Virgen del Carmen. The dancers wear spectacular costumes and masks of devils, animals and angels, which take months to make. The festival mixes Catholic traditions with Andean culture. Even though the sun is very strong during the day and the nights are freezing, the dancers don't stop.`,
 items:[
  {k:'E', q:'Where does the festival of La Tirana take place?', o:['In a small town in the Atacama Desert','In Santiago','In the south of Chile','On Easter Island'], a:0, why:'"…the small town of La Tirana, in the Atacama Desert."'},
  {k:'I', q:'What does "the dancers don\'t stop" tell us about them?', o:['They are very devoted and determined','They are paid a lot of money','They don\'t feel the cold','They are professional athletes'], a:0, why:'They keep dancing in extreme heat and cold: a sign of devotion.'},
  {k:'L', q:'The costumes ___ months to make.', o:['take','takes','are taking','took'], a:0, why:'Plural subject (the costumes) + present simple → take.'},
 ],
 thanks:"¡Gracias! Come to La Tirana in July and watch us dance. It's an experience you'll never forget!",
},
{
 id:'pumpkins', leg:4, t:0.68, side:-1, title:"Jack-o'-Lanterns", icon:'🎃',
 npc:{ name:'Liam', model:'Knight', tint:'#ff7a1a' },
 hello:"Hi! I'm Liam, from Ireland. I brought pumpkins to show you a Halloween tradition, but they're just plain pumpkins! Help me turn them into real jack-o'-lanterns!",
 text:`Halloween comes from Samhain, an ancient Celtic festival celebrated in Ireland more than 2,000 years ago. People believed that on the night of October 31st, the world of the living and the world of the dead were very close. To scare away bad spirits, they lit bonfires and wore costumes. In Ireland, people carved scary faces into turnips and put candles inside. When Irish families emigrated to the United States in the 19th century, they discovered that pumpkins were bigger and easier to carve — and the jack-o'-lantern was born.`,
 items:[
  {k:'E', q:'Where does Halloween come from?', o:['From Samhain, an ancient Celtic festival','From a TV show in the United States','From the Day of the Dead, a Mexican festival','From Chinese New Year'], a:0, why:'"Halloween comes from Samhain, an ancient Celtic festival…"'},
  {k:'I', q:'Why did Irish families start using pumpkins in the United States?', o:['Pumpkins were bigger and easier to carve than turnips','Turnips were forbidden in the USA until the 20th century','Pumpkins were cheaper in Ireland','They didn\'t like turnips'], a:0, why:'"…pumpkins were bigger and easier to carve…"'},
  {k:'Q', q:'People used to carve turnips, ___?', o:["didn't they","usedn't they","did they","weren't they"], a:0, why:"USED TO → didn't they?"},
 ],
 thanks:"Spooky! Now they're real jack-o'-lanterns. Happy Halloween — and remember where it comes from!",
},
];
