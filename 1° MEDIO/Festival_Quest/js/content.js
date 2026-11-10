// Festival Quest — 1° medio, Unit 4 "Traditions and festivities"
// Item: {q, o:[options], a:index of correct, why:'short explanation', k:'E'|'I'|'V'|'L'|'Q'}
// k = skill: E explicit reading, I implicit reading, V vocabulary in context, L language in use, Q question tags.

export const ZONES = [
{
 id: 'muertos', name: 'Day of the Dead', country: 'Mexico', color: '#ff8a1f',
 npc: { name: 'Señor Calaca', model: 'Skeleton_Mage' },
 hello: "¡Hola, traveller! Don't be scared of my bones, I'm a friendly skeleton. Mr. Grey stole the colours of our altar and now nobody remembers why we celebrate. Read my friend Lucía's story and help me remember!",
 after: "You remember everything! Now I need one more favour: the wind blew away my three festival scrolls. They are glowing somewhere around this zone. Bring them back!",
 bye: "Gracias, amigo! Our marigolds are orange again. Take this lantern to the Great Festival Fire.",
 title: 'A Warm Night in November',
 text: `My name is Lucía and I live in Oaxaca, in the south of Mexico. Every year, on the first and second of November, my family celebrates the Day of the Dead, or Día de los Muertos. Many tourists think it is a sad or scary holiday, but for us it is a time of joy. We believe that, for two nights, the souls of our ancestors come back to visit us.

Preparations start about two weeks before. My grandmother is in charge of the altar, which we call an ofrenda. We put it in the living room and decorate it with candles, photos of our relatives who have died, and hundreds of orange marigold flowers. Their strong smell and bright colour are supposed to guide the souls home. We also place the dead person's favourite food and drinks on the altar. My grandfather loved hot chocolate and spicy tamales, so we always prepare them for him, even though nobody eats them until the celebration is over.

On the night of November 1st, we go to the cemetery. The first time I went, I was surprised to see so many families there at midnight. People clean the graves, paint them and cover them with flowers. Some families bring guitars and sing their relatives' favourite songs. Children run around eating sugar skulls with their names written on the forehead.

The most famous symbol of the holiday is La Catrina, an elegant female skeleton with a big hat. She was created by an artist more than a hundred years ago to show that, in the end, rich and poor people are equal.

Last year my cousin from Canada spent the holiday with us. At the beginning he looked nervous, but by the end of the night he was laughing and telling funny stories about our grandfather. "I didn't know death could feel so warm," he told me.`,
 reading: [
  {k:'E', q:'When does Lucía\'s family celebrate the Day of the Dead?', o:['On November 1st and 2nd','On October 31st','Two weeks before November','Only on November 2nd'], a:0, why:'"Every year, on the first and second of November…"'},
  {k:'E', q:'According to the tradition, what do the marigold flowers do?', o:['They guide the souls home','They keep tourists away','They are food for the souls','They protect the graves from rain'], a:0, why:'"Their strong smell and bright colour are supposed to guide the souls home."'},
  {k:'E', q:'Why was La Catrina created?', o:['To show that rich and poor people are equal in the end','To scare children on Halloween and the Day of the Dead','To sell big hats to tourists','To decorate the cemetery'], a:0, why:'"…to show that, in the end, rich and poor people are equal."'},
  {k:'I', q:'What can we infer about Lucía\'s grandfather?', o:['He has died, and the family remembers him on the altar','He cooks tamales for the whole family','He lives in Canada with Lucía\'s cousin and visits every year','He doesn\'t like the Day of the Dead'], a:0, why:'Food on the altar is for relatives who have died, and they prepare his favourite food "for him".'},
  {k:'I', q:'Why does nobody eat the food on the altar until the celebration is over?', o:['Because it is an offering for the souls first','Because it is too spicy','Because it is only for tourists','Because the grandmother always forgets about it'], a:0, why:'The text doesn\'t say it directly, but the food is placed there for the visiting souls.'},
  {k:'I', q:'Why did the cousin say "I didn\'t know death could feel so warm"?', o:['His idea of death changed: he expected something sad, but he felt love and happiness','He was cold in Canada and warm in Mexico, so he decided to stay there for the whole winter','The candles made the cemetery very hot','He didn\'t enjoy the night at all'], a:0, why:'He was nervous at first, then laughed and told stories: his feelings changed.'},
 ],
 vocab: [
  {k:'V', q:'"The souls of our <b>ancestors</b> come back to visit us." <i>Ancestors</i> are…', o:['family members who lived a long time before us','our neighbours and friends','tourists who visit Mexico','young children in the family who are still at school'], a:0, why:'Ancestors = antepasados.'},
  {k:'V', q:'"My grandmother is <b>in charge of</b> the altar." This means she is…', o:['responsible for it','afraid of it','paying for it','far away from it'], a:0, why:'In charge of = a cargo de / responsable de.'},
  {k:'V', q:'Choose the best word: "Families ___ the graves with flowers and candles."', o:['decorate','destroy','forget','borrow'], a:0, why:'To decorate = adornar.'},
  {k:'V', q:'"La Catrina is an <b>elegant</b> skeleton with a big hat." <i>Elegant</i> means…', o:['stylish and well-dressed','dirty and old','small and shy','funny and noisy'], a:0, why:'Elegant = stylish, with good taste.'},
 ],
 liu: [
  {k:'L', q:'The Day of the Dead ___ in Mexico every November.', o:['is celebrated','celebrates','is celebrating','celebrated'], a:0, why:'Present simple passive: is + past participle.'},
  {k:'L', q:'The souls return ___ the night of November 1st.', o:['on','in','at','since'], a:0, why:'Use ON with specific days and dates.'},
  {k:'L', q:'La Catrina ___ by an artist more than a hundred years ago.', o:['was created','is created','created','has created'], a:0, why:'Past simple passive (…years ago): was + past participle.'},
  {k:'L', q:'My cousin, ___ lives in Canada, visited us last year.', o:['who','which','where','whose'], a:0, why:'WHO is the relative pronoun for people.'},
 ],
 tags: [
  {k:'Q', q:'The Day of the Dead is a happy celebration, ___?', o:["isn't it","doesn't it","is it","wasn't it"], a:0, why:'Positive sentence with IS → negative tag: isn\'t it?'},
  {k:'Q', q:'Your family doesn\'t eat the food on the altar, ___?', o:['does it',"doesn't it",'do they','is it'], a:0, why:'Negative sentence → positive tag. "Your family" = it.'},
  {k:'Q', q:'Marigolds have a strong smell, ___?', o:["don't they","haven't they","aren't they","do they"], a:0, why:'Present simple (have = verb) → auxiliary DO: don\'t they?'},
  {k:'Q', q:'Lucía\'s cousin was nervous at first, ___?', o:["wasn't he","didn't he","was he","isn't he"], a:0, why:'Past of BE → wasn\'t he?'},
 ],
},
{
 id: 'lunar', name: 'Lunar New Year', country: 'China', color: '#e8322f',
 npc: { name: 'Mei', model: 'Mage' },
 hello: "Xīnnián kuàilè! Happy New Year! Well… it would be, but Mr. Grey took all our red lanterns. Without them, people are forgetting our customs. Please read my story so the festival can begin again.",
 after: "Wonderful! But a gust of wind blew away three of my riddle scrolls. They're shining somewhere near the market. Can you find them?",
 bye: "Our lanterns are glowing again! Here, take this lantern. Good luck in the new year!",
 title: 'Fish, Fireworks and Red Envelopes',
 text: `Hi, I'm Mei and I'm from Chengdu, in China. The most important celebration in my country is the Spring Festival, also known as Chinese New Year or Lunar New Year. It does not have a fixed date because it follows the moon, so it falls between late January and the middle of February.

Before the festival, every family cleans the house from top to bottom. The idea is to sweep away the bad luck of the old year. However, on New Year's Day itself, nobody uses a broom, because we don't want to sweep away the good luck that has just arrived! Then we decorate the doors with red paper and couplets, short poems that wish happiness and wealth. Red is everywhere, because it is the colour of luck and it is believed to scare away evil spirits.

The most important moment is New Year's Eve dinner. Millions of people travel back to their hometowns to eat with their families, so trains and airports are incredibly crowded. My uncle works in Shanghai, which is almost two thousand kilometres from Chengdu, and he can't take holidays very often. We always eat fish, because the word for "fish" sounds like the word for "surplus", meaning we will have more than enough in the coming year. We also make dumplings together while we watch a TV show that almost everyone in China watches.

At midnight, the sky explodes with fireworks. The next morning, children greet their elders and receive red envelopes with money inside. Last year I didn't spend mine on sweets; I saved it for six months and bought a bike.

For fifteen days, there are lion dances and parades in the streets. The festival ends with the Lantern Festival, when people hang thousands of lanterns and try to solve riddles written on them. It's my favourite part, although I'm not very good at riddles!`,
 reading: [
  {k:'E', q:'Why do families clean their houses before the festival?', o:['To sweep away the bad luck of the old year','Because visitors don\'t like dust','To find their red envelopes','Because brooms are forbidden after the festival'], a:0, why:'"The idea is to sweep away the bad luck of the old year."'},
  {k:'E', q:'Why do people eat fish at New Year\'s Eve dinner?', o:['Because its name sounds like the word for "surplus"','Because it is the cheapest food','Because Mei\'s uncle is a fisherman','Because its smell scares away evil spirits at midnight'], a:0, why:'"…the word for fish sounds like the word for surplus…"'},
  {k:'E', q:'What do children receive on New Year\'s morning?', o:['Red envelopes with money','Fish and dumplings','New bikes','Lanterns with riddles'], a:0, why:'"…children greet their elders and receive red envelopes with money inside."'},
  {k:'I', q:'Why is New Year\'s Eve dinner probably very special for Mei\'s family?', o:['It may be one of the few times her uncle can be with the family','Because they only eat fish once a year','Because Mei cooks it alone','Because the family only watches TV together on that day of the year'], a:0, why:'Her uncle lives far away and rarely takes holidays, but people travel home for this dinner.'},
  {k:'I', q:'What does the bike story tell us about Mei?', o:['She is patient and plans ahead with money','She doesn\'t like sweets at all','Her parents bought her a bike with their own money','She lost her red envelope'], a:0, why:'She saved her money for six months instead of spending it.'},
  {k:'I', q:'Why don\'t people use a broom on New Year\'s Day?', o:['They believe it would remove the new good luck','Brooms are too expensive during the festival','The house is already clean, so it is not necessary','Fireworks could burn the broom'], a:0, why:'They "don\'t want to sweep away the good luck that has just arrived".'},
 ],
 vocab: [
  {k:'V', q:'"We <b>sweep away</b> the bad luck." To <i>sweep</i> means…', o:['to clean the floor with a broom','to cook with oil','to paint a wall','to sing loudly'], a:0, why:'Sweep = barrer.'},
  {k:'V', q:'"Trains and airports are incredibly <b>crowded</b>." Crowded means…', o:['full of people','very cheap','closed for the holiday','quiet and empty'], a:0, why:'Crowded = lleno de gente.'},
  {k:'V', q:'"Children greet their <b>elders</b>." Elders are…', o:['older people in the family or community','younger brothers and sisters in the family','teachers at school','neighbours\' pets'], a:0, why:'Elders = mayores.'},
  {k:'V', q:'Choose the best word: "People ___ thousands of lanterns in the streets."', o:['hang','swim','borrow','cook'], a:0, why:'To hang = colgar.'},
 ],
 liu: [
  {k:'L', q:'In China, the Spring Festival is ___ than Christmas.', o:['more important','most important','importanter','the more important'], a:0, why:'Long adjective comparative: more + adjective + than.'},
  {k:'L', q:'There are ___ people at the station that we can\'t move!', o:['so many','so much','such','too much'], a:0, why:'People is countable → so many.'},
  {k:'L', q:'My grandparents ___ make dumplings by hand, but now they buy them.', o:['used to','use to','are used','were using'], a:0, why:'USED TO = a past habit that is not true now.'},
  {k:'L', q:'Red ___ to scare away evil spirits.', o:['is believed','believes','is believing','believed'], a:0, why:'Passive: it is believed (se cree que…).'},
 ],
 tags: [
  {k:'Q', q:'Red is the colour of luck, ___?', o:["isn't it","doesn't it","is it","isn't red"], a:0, why:'Positive + IS → isn\'t it? (use a pronoun, not the noun).'},
  {k:'Q', q:'You received a red envelope, ___?', o:["didn't you","did you","haven't you","don't you"], a:0, why:'Past simple positive → didn\'t you?'},
  {k:'Q', q:'Mei can\'t solve many riddles, ___?', o:['can she',"can't she",'does she','is she'], a:0, why:'Negative modal (can\'t) → positive tag: can she?'},
  {k:'Q', q:'Let\'s watch the fireworks, ___?', o:['shall we','will you',"don't we",'do we'], a:0, why:'Suggestions with LET\'S → shall we?'},
 ],
},
{
 id: 'patrias', name: 'Fiestas Patrias', country: 'Chile', color: '#2f6fe0',
 npc: { name: 'Tomás', model: 'Ranger' },
 hello: "¡Hola, po! Fiestas Patrias are almost here, but Mr. Grey took the colours of our flags and nobody wants to dance cueca. Read my story and help Chile celebrate!",
 after: "¡Bacán! Now, three of my scrolls flew away with the kites. They're glowing somewhere near the fonda. Go and find them!",
 bye: "¡Viva Chile! The flags are red, white and blue again. This lantern is for you!",
 title: 'Empanadas, Cueca and Kites',
 text: `Hello! I'm Tomás and I live in Talca, in the centre of Chile. In September, the whole country seems to change colour. Flags appear on every house, and the smell of grilled meat fills the air. We are getting ready for the Fiestas Patrias, our national holidays on the 18th and 19th of September. The 18th remembers the First National Government Board of 1810, the first step towards independence, and the 19th is the Day of the Glories of the Army.

The heart of the celebration is the fonda, a big tent with music, food and dancing. In the countryside, people also build ramadas, simple shelters made of wooden poles and covered with branches. My family goes to the fonda near the stadium every year. My dad says that the empanadas there are the best in the region, but my mum always answers that hers are better. To be honest, I agree with my mum, but I never say it in front of my dad!

Everyone tries to dance the cueca, our national dance. Couples move in circles waving white handkerchiefs, and the man follows the woman like a rooster following a hen. When I was younger, I was too shy to dance, and I always hid behind my parents. But last year my school organised a competition, and my partner Sofía and I came second.

Another tradition is flying kites, or volantines. In the past, kite fighting was very popular: players covered their strings with glue and crushed glass to cut other kites. Nowadays this kind of string is forbidden in many cities because it has injured people, so most families just fly their kites for fun in open fields.

Finally, there are traditional games like the palo encebado, a tall greasy pole that people try to climb. Almost nobody reaches the top, but everyone laughs and tries again.`,
 reading: [
  {k:'E', q:'What is a ramada?', o:['A simple shelter made of wooden poles and branches','A big tent near the stadium where people watch football','A traditional Chilean dance','A kind of empanada'], a:0, why:'"…ramadas, simple shelters made of wooden poles and covered with branches."'},
  {k:'E', q:'What does September 18th remember?', o:['The First National Government Board of 1810','The Day of the Glories of the Army','The day the cueca was invented','The first kite competition'], a:0, why:'"The 18th remembers the First National Government Board of 1810…"'},
  {k:'E', q:'What happened in the school cueca competition?', o:['Tomás and Sofía came second','Tomás was too shy to dance','Sofía won with another partner','The competition was cancelled'], a:0, why:'"…my partner Sofía and I came second."'},
  {k:'I', q:'What can we infer about Tomás\'s opinion of the empanadas?', o:['He prefers his mum\'s, but he doesn\'t want to upset his dad','He thinks the fonda\'s empanadas are the best','He doesn\'t like empanadas','He cooks better empanadas than his parents and wants to sell them'], a:0, why:'He agrees with his mum but never says it in front of his dad.'},
  {k:'I', q:'How has Tomás changed over the years?', o:['He became more confident','He became shyer','He stopped celebrating Fiestas Patrias','He started flying kites instead of dancing'], a:0, why:'He used to hide behind his parents; last year he danced in a competition.'},
  {k:'I', q:'Why do people still try the palo encebado if almost nobody reaches the top?', o:['Because the fun is in trying and laughing together','Because the prize at the top is very expensive and useful','Because it is a school exam','Because the pole is easy to climb'], a:0, why:'"…everyone laughs and tries again" — the experience matters more than winning.'},
 ],
 vocab: [
  {k:'V', q:'"The smell of <b>grilled</b> meat fills the air." Grilled meat is…', o:['cooked over a fire','kept in the fridge','eaten raw','boiled in water'], a:0, why:'Grilled = a la parrilla.'},
  {k:'V', q:'"I was too <b>shy</b> to dance." Shy means…', o:['nervous about doing things in front of others','very tired','extremely good','angry with someone who laughed at you in public'], a:0, why:'Shy = tímido.'},
  {k:'V', q:'"This kind of string is <b>forbidden</b> in many cities." Forbidden means…', o:['not allowed','very cheap','very popular','easy to find'], a:0, why:'Forbidden = prohibido.'},
  {k:'V', q:'Choose the best word: "Couples ___ white handkerchiefs while they dance."', o:['wave','wear','swallow','build'], a:0, why:'To wave = agitar (un pañuelo, la mano).'},
 ],
 liu: [
  {k:'L', q:'While we ___ the cueca, it started to rain.', o:['were dancing','danced','dance','are dancing'], a:0, why:'Past continuous for an action in progress interrupted by another (past simple).'},
  {k:'L', q:'The pole was ___ greasy for anyone to climb.', o:['too','enough','very much','so many'], a:0, why:'TOO + adjective + for/to = more than necessary.'},
  {k:'L', q:'The Fiestas Patrias ___ every year on September 18th and 19th.', o:['take place','takes place','is taken place','taking place'], a:0, why:'Plural subject (the Fiestas) → take place.'},
  {k:'L', q:'Tomás and Sofía are one of ___ couples in the school.', o:['the best','the better','best than','the most good'], a:0, why:'Superlative of good: the best.'},
 ],
 tags: [
  {k:'Q', q:'Empanadas are delicious, ___?', o:["aren't they","don't they","are they","isn't it"], a:0, why:'Plural + ARE → aren\'t they?'},
  {k:'Q', q:'Tomás didn\'t dance when he was younger, ___?', o:['did he',"didn't he",'was he','does he'], a:0, why:'Negative past simple → positive tag: did he?'},
  {k:'Q', q:'You\'ve tried the palo encebado, ___?', o:["haven't you","didn't you","have you","aren't you"], a:0, why:'Present perfect (you have) → haven\'t you?'},
  {k:'Q', q:'Don\'t fly your kite near the cables, ___?', o:['will you',"won't you",'do you','shall we'], a:0, why:'Imperative → will you?'},
 ],
},
{
 id: 'holi', name: 'Holi', country: 'India', color: '#d23ad6',
 npc: { name: 'Priya', model: 'Rogue' },
 hello: "Namaste! This should be the most colourful place in the world, but look: everything is grey! Mr. Grey stole our coloured powders. Read my story so we can celebrate Holi again.",
 after: "Great job! Now, my little brother Ravi hid three scrolls around here as a joke. They're glowing — can you find them?",
 bye: "Look at all those colours! Thank you, friend. This lantern is yours. Bura na mano, Holi hai!",
 title: 'The Festival of Colours',
 text: `Namaste! I'm Priya and I live in Jaipur, in the north of India. If you visit my city in March, you might go home with pink hair and a green face. That's because of Holi, the Festival of Colours, which marks the end of winter and the arrival of spring.

Holi starts on the night of the full moon with Holika Dahan. People build big bonfires in the streets and gather around them to pray and sing. The fire represents the victory of good over evil. It comes from an old story about a cruel king and his sister Holika, who were defeated because a young boy never stopped believing.

The next morning, the real fun begins. People of all ages run into the streets with bags of coloured powder called gulal and water guns called pichkaris. Everyone throws colours at everyone else: friends, neighbours, even strangers. On this day, the usual rules don't apply. Rich and poor, young and old, everyone becomes the same colour! People shout "Bura na mano, Holi hai!", which means "Don't be offended, it's Holi!"

My little brother Ravi prepares his water gun a week before. This year he got up at five o'clock and hid behind the door to surprise our grandfather. Grandpa pretended to be angry, but a minute later he was chasing Ravi around the garden with a bag of blue powder.

In the afternoon, we wash, put on clean clothes and visit relatives. We share sweets like gujiya, a fried pastry filled with nuts and sugar. Holi is also a time to forgive: if you had an argument with someone, you hug them and start again.

These days, many people prefer natural colours, because some chemical powders can damage the skin and pollute rivers. My mother makes ours at home from turmeric and dried roses.`,
 reading: [
  {k:'E', q:'What does Holi mark?', o:['The end of winter and the arrival of spring','The beginning of the school year','The end of summer','The birthday of a king'], a:0, why:'"…which marks the end of winter and the arrival of spring."'},
  {k:'E', q:'What happens on the night of Holika Dahan?', o:['People build bonfires and gather to pray and sing','People throw coloured powder','Children receive presents','Families eat gujiya in the garden early in the morning'], a:0, why:'"People build big bonfires in the streets and gather around them to pray and sing."'},
  {k:'E', q:'Why do many people prefer natural colours today?', o:['Some chemical powders can damage the skin and pollute rivers','Natural colours are brighter','Chemical powders are forbidden by law in every shop in the city of Jaipur','Natural colours are cheaper in shops'], a:0, why:'"…some chemical powders can damage the skin and pollute rivers."'},
  {k:'I', q:'Why do people shout "Don\'t be offended, it\'s Holi!"?', o:['Because they throw colours at people, even strangers, who might normally get annoyed','Because they are angry with their neighbours and want to say sorry before the festival ends','Because they want people to stay at home','Because it is a prayer for the bonfire'], a:0, why:'On a normal day, throwing powder at strangers would be rude.'},
  {k:'I', q:'How did Grandpa really feel about Ravi\'s surprise?', o:['He enjoyed it and joined the game','He was really angry all day','He was scared and went inside','He didn\'t notice it'], a:0, why:'He "pretended" to be angry and then chased Ravi with blue powder.'},
  {k:'I', q:'What does the phrase "everyone becomes the same colour" suggest about Holi?', o:['It brings people together and makes differences less important','People wear the same uniform','Only rich people can celebrate it because the powders cost a lot of money','Everybody must use pink powder'], a:0, why:'Rich and poor, young and old become equal for a day.'},
 ],
 vocab: [
  {k:'V', q:'"The fire represents the <b>victory</b> of good over evil." Victory means…', o:['winning','losing','fear','a fire'], a:0, why:'Victory = victoria, triunfo.'},
  {k:'V', q:'"Don\'t be <b>offended</b>." If you are offended, you feel…', o:['upset because of what someone did','very hungry','extremely happy','sleepy'], a:0, why:'Offended = ofendido, molesto.'},
  {k:'V', q:'"Holi is also a time to <b>forgive</b>." To forgive means…', o:['to stop being angry with someone','to forget your homework','to give a present','to start an argument'], a:0, why:'Forgive = perdonar.'},
  {k:'V', q:'Choose the best word: "Some chemical powders can ___ the skin."', o:['damage','repair','paint','grow'], a:0, why:'Damage = dañar.'},
 ],
 liu: [
  {k:'L', q:'If you visit Jaipur in March, you ___ go home with pink hair.', o:['might','would','did','have'], a:0, why:'First conditional with a possibility: if + present, might + verb.'},
  {k:'L', q:'Ravi really enjoys ___ water at his family.', o:['throwing','to throw','throw','thrown'], a:0, why:'ENJOY + verb-ing.'},
  {k:'L', q:'You ___ wear your best clothes on Holi — the colours don\'t wash out easily!', o:["shouldn't",'should','must','can'], a:0, why:'Shouldn\'t = advice not to do something.'},
  {k:'L', q:'Natural colours are made ___ flowers and turmeric.', o:['from','by','of','at'], a:0, why:'MADE FROM = the original material is transformed.'},
 ],
 tags: [
  {k:'Q', q:'Holi marks the arrival of spring, ___?', o:["doesn't it","isn't it","does it","didn't it"], a:0, why:'Present simple positive (marks) → doesn\'t it?'},
  {k:'Q', q:'Ravi got up very early, ___?', o:["didn't he","wasn't he","did he","doesn't he"], a:0, why:'Past simple positive → didn\'t he?'},
  {k:'Q', q:'Everyone gets colourful on Holi, ___?', o:["don't they","doesn't he","isn't it","do they"], a:0, why:'EVERYONE/EVERYBODY → they in the tag.'},
  {k:'Q', q:'I\'m covered in blue powder, ___?', o:["aren't I","am not I","isn't I","don't I"], a:0, why:'Special case: I am → aren\'t I?'},
 ],
},
{
 id: 'tripantu', name: 'We Tripantu', country: 'Chile — Mapuche people', color: '#2fae5a',
 npc: { name: 'Ayelén', model: 'Barbarian' },
 hello: "Mari mari! Welcome to the forest. Mr. Grey covered the sky with clouds, and now the people think the sun won't return. Read my story and help us welcome the new sunrise.",
 after: "Chaltu! Thank you! Three scrolls with old stories were lost by the river. They are glowing between the trees. Please bring them back.",
 bye: "Look, the sun is coming back! Take this lantern. Feliz We Tripantu!",
 title: 'The New Sunrise',
 text: `Mari mari! My name is Ayelén and I live in a rural community near Temuco, in the Araucanía Region. I am Mapuche, and for my people the new year doesn't start on January 1st. It starts with We Tripantu, which means "the new sunrise", around the 24th of June.

In the south of Chile, June is the coldest and darkest time of the year. The night of the winter solstice is the longest night of all. After it, the days slowly start getting longer, so we celebrate the return of the sun and the beginning of a new natural cycle. Plants, animals and people begin again.

The night before, families and neighbours meet in a ruka, a traditional house with a fire in the middle. The elders tell old stories, called epew, and we share food like catuto, a bread made from wheat, and sopaipillas. Nobody is supposed to sleep that night. When I was little, I always fell asleep before midnight, and my cousins teased me about it for weeks!

Just before dawn, we walk to the river and wash our faces and bodies in the freezing water. This is called the purification. It gives us new energy and takes away the bad things of the past year. Then we turn to the east and wait for the first rays of the sun. When they appear, people shout, play the trutruka and the kultrun, and give thanks to Ñuke Mapu, Mother Earth.

For many years, this celebration was almost invisible in the rest of the country. However, since 2021 the National Day of Indigenous Peoples has been a public holiday in Chile, and many schools now organise activities about it. Last June my teacher asked me to explain We Tripantu to my class. My hands were shaking at the beginning, but at the end my classmates asked so many questions that the bell rang before I could answer all of them.`,
 reading: [
  {k:'E', q:'What does "We Tripantu" mean?', o:['The new sunrise','The longest night','Mother Earth','The traditional house'], a:0, why:'"…We Tripantu, which means the new sunrise…"'},
  {k:'E', q:'What do people do just before dawn?', o:['They wash in the freezing water of the river','They go to sleep','They build a new ruka','They eat catuto in the classroom with their teacher'], a:0, why:'"Just before dawn, we walk to the river and wash our faces and bodies…"'},
  {k:'E', q:'Since when has the National Day of Indigenous Peoples been a public holiday?', o:['Since 2021','Since January 1st','For about ten years','Since Ayelén was little'], a:0, why:'"…since 2021 the National Day of Indigenous Peoples has been a public holiday…"'},
  {k:'I', q:'Why do the Mapuche celebrate the new year in June and not in January?', o:['Because it follows nature: after the longest night, the sun starts to return','Because January is too hot to celebrate','Because the school year starts in June','Because the government decided in 2021 that all festivals should be held in June'], a:0, why:'The new cycle begins when the days start getting longer.'},
  {k:'I', q:'What can we infer from the fact that Ayelén\'s cousins teased her?', o:['Staying awake all night is an important part of the tradition','Her cousins never sleep','Ayelén doesn\'t like her cousins','Children must go to bed early so they can wake up before the sun rises'], a:0, why:'They laughed because she didn\'t follow the custom of staying awake.'},
  {k:'I', q:'How did Ayelén\'s presentation at school go?', o:['She was nervous at first, but her classmates were very interested','Nobody listened to her','She didn\'t finish because she was ill','Her teacher had to give the presentation because she forgot all her notes'], a:0, why:'Her hands were shaking, but the class asked "so many questions" that time ran out.'},
 ],
 vocab: [
  {k:'V', q:'"The night of the winter <b>solstice</b> is the longest night of all." A solstice is…', o:['the day with the longest or shortest daylight of the year','a type of traditional bread','a musical instrument','a river in the south'], a:0, why:'Solstice = solsticio.'},
  {k:'V', q:'"My cousins <b>teased</b> me about it for weeks." To tease means…', o:['to make jokes about someone to laugh at them','to help someone with homework','to give someone a present','to wake someone up'], a:0, why:'Tease = molestar en broma.'},
  {k:'V', q:'"We wash our faces in the <b>freezing</b> water." Freezing means…', o:['extremely cold','very dirty','hot and clean','deep and dangerous'], a:0, why:'Freezing = helada, muy fría.'},
  {k:'V', q:'Choose the best word: "The elders ___ old stories by the fire."', o:['tell','say','speak','talk'], a:0, why:'Collocation: tell a story (contar una historia).'},
 ],
 liu: [
  {k:'L', q:'The National Day of Indigenous Peoples ___ a public holiday since 2021.', o:['has been','was','is','had'], a:0, why:'Present perfect + SINCE for something that started in the past and continues.'},
  {k:'L', q:'A ruka is a house ___ families meet before We Tripantu.', o:['where','which','who','when'], a:0, why:'WHERE refers to a place.'},
  {k:'L', q:'Ayelén has lived in the Araucanía ___ she was born.', o:['since','for','ago','during'], a:0, why:'SINCE + a point in time.'},
  {k:'L', q:'Nobody is ___ to sleep on the night before We Tripantu.', o:['supposed','suppose','supposing','supposedly'], a:0, why:'BE SUPPOSED TO = it is expected / the rule says.'},
 ],
 tags: [
  {k:'Q', q:'We Tripantu starts around June 24th, ___?', o:["doesn't it","isn't it","does it","won't it"], a:0, why:'Present simple positive → doesn\'t it?'},
  {k:'Q', q:'The river water isn\'t warm, ___?', o:['is it',"isn't it",'does it','was it'], a:0, why:'Negative IS → positive tag: is it?'},
  {k:'Q', q:'Ayelén has explained her culture to her class, ___?', o:["hasn't she","didn't she","has she","isn't she"], a:0, why:'Present perfect → hasn\'t she?'},
  {k:'Q', q:'Nobody slept that night, ___?', o:['did they',"didn't they",'did he','was it'], a:0, why:'NOBODY makes the sentence negative → positive tag, with THEY.'},
 ],
},
];

// Final duel with Mr. Grey (question tags)
export const BOSS = {
 name: 'Mr. Grey',
 intro: "So… you brought back all five lanterns, didn't you? Traditions are boring, aren't they? If you want to light the Great Festival Fire, beat me in a Question Tag Duel!",
 win: "Nooo! Colours everywhere! Fine… festivals ARE fun, aren't they? Maybe I'll stay for the party.",
 items: [
  {k:'Q', q:"You'll come to the festival, ___?", o:["won't you","will you","don't you","aren't you"], a:0, why:"Future WILL → won't you?"},
  {k:'Q', q:'She hardly ever celebrates Halloween, ___?', o:['does she',"doesn't she",'is she',"isn't she"], a:0, why:'HARDLY EVER / NEVER are negative → positive tag.'},
  {k:'Q', q:'There is a parade tomorrow, ___?', o:["isn't there","isn't it","is there","doesn't it"], a:0, why:'THERE IS → isn\'t there?'},
  {k:'Q', q:'Nothing went wrong, ___?', o:['did it',"didn't it",'did they','was it'], a:0, why:'NOTHING → positive tag with IT.'},
  {k:'Q', q:'They had a great time at the fonda, ___?', o:["didn't they","hadn't they","did they","weren't they"], a:0, why:'Had = past simple of HAVE (main verb) → didn\'t they?'},
  {k:'Q', q:'He should wear a costume, ___?', o:["shouldn't he","should he","doesn't he","won't he"], a:0, why:'Modal SHOULD → shouldn\'t he?'},
  {k:'Q', q:"We weren't late for the parade, ___?", o:['were we',"weren't we",'did we','was we'], a:0, why:'Negative WERE → were we?'},
  {k:'Q', q:'Light the candles, ___?', o:['will you','do you',"don't you",'shall we'], a:0, why:'Imperative → will you?'},
  {k:'Q', q:'Your sister has never seen fireworks, ___?', o:['has she',"hasn't she",'did she','is she'], a:0, why:'NEVER is negative → positive tag: has she?'},
  {k:'Q', q:"I'm invited to the party, ___?", o:["aren't I","am I not","isn't I","don't I"], a:0, why:"I am → aren't I?"},
  {k:'Q', q:'It rained during the carnival, ___?', o:["didn't it","wasn't it","did it","doesn't it"], a:0, why:"Past simple positive → didn't it?"},
  {k:'Q', q:'Somebody stole the lanterns, ___?', o:["didn't they","didn't he","did they","wasn't it"], a:0, why:'SOMEBODY → they in the tag.'},
 ],
};

// Extra quick items for the online mode (mini readings + more practice)
export const ONLINE_EXTRA = [
 {k:'E', q:'<p class="mini">Thanksgiving is celebrated in the USA on the fourth Thursday of November. Families travel long distances to have a big dinner together, usually with roast turkey and pumpkin pie.</p>What do families usually eat?', o:['Turkey and pumpkin pie','Fish and dumplings','Empanadas','Sugar skulls'], a:0, why:'"…usually with roast turkey and pumpkin pie."'},
 {k:'I', q:'<p class="mini">In Australia, Christmas is in the middle of summer. Many families have a barbecue on the beach and Santa sometimes arrives on a surfboard.</p>What can we infer?', o:['Christmas traditions change depending on the climate','Australians don\'t celebrate Christmas','It always snows at Christmas in the mountains of Australia','Santa can\'t visit Australia'], a:0, why:'Summer weather → beach, barbecue, surfboard.'},
 {k:'E', q:'<p class="mini">Songkran is the Thai New Year, celebrated in April. People throw water at each other in the streets. The water represents washing away bad luck.</p>What does the water represent?', o:['Washing away bad luck','The rainy season','A water shortage','A sports competition'], a:0, why:'"The water represents washing away bad luck."'},
 {k:'I', q:'<p class="mini">During Diwali, the Festival of Lights, families in India light small oil lamps called diyas and place them on windows and doors. Some people say the lights help the goddess of wealth find their homes.</p>Why do people put the lamps on windows and doors?', o:['So that the lights can be seen from outside','Because the houses have no electricity','To cook food','To keep animals away'], a:0, why:'They want the goddess to "find" their homes: the lights must be visible.'},
 {k:'E', q:'<p class="mini">In Japan, people celebrate Hanami in spring. Friends and families have picnics under cherry trees to enjoy the pink flowers, which only last about two weeks.</p>How long do the flowers last?', o:['About two weeks','All spring','One day','Two months'], a:0, why:'"…which only last about two weeks."'},
 {k:'I', q:'<p class="mini">On St Patrick\'s Day, the river in Chicago is dyed green. People who are not Irish also wear green clothes and join the parades.</p>What does this suggest?', o:['The festival is enjoyed by people from many backgrounds','Only Irish people can celebrate it','Green is a forbidden colour in Chicago during the festival','The river is always green'], a:0, why:'People who are not Irish also join.'},
 {k:'E', q:'<p class="mini">The Carnival of Rio de Janeiro lasts five days. Samba schools practise for the whole year to prepare their costumes and dances for the parade.</p>How long do samba schools prepare?', o:['The whole year','Five days','One month','One week'], a:0, why:'"…practise for the whole year…"'},
 {k:'I', q:'<p class="mini">La Tirana is a festival in the north of Chile. Thousands of dancers wear colourful masks and dance for hours in the desert heat to honour the Virgin.</p>What can we infer about the dancers?', o:['They are very devoted and make a big effort','They are tourists who are paid to dance there','They dance only at night','They don\'t like the festival'], a:0, why:'Dancing for hours in the heat shows devotion and effort.'},
 {k:'V', q:'"On New Year\'s Eve, we <b>make a wish</b> at midnight." To make a wish means…', o:['to ask for something you want to happen','to cook a special meal','to clean the house','to buy a present'], a:0, why:'Make a wish = pedir un deseo.'},
 {k:'V', q:'"The town holds a big <b>parade</b> every year." A parade is…', o:['a public procession of people, music and floats','a type of cake','a quiet dinner','a holiday at home'], a:0, why:'Parade = desfile.'},
 {k:'V', q:'"People wear <b>costumes</b> on Halloween." A costume is…', o:['special clothes to look like someone or something else','a traditional dish','a type of candle','a short song'], a:0, why:'Costume = disfraz.'},
 {k:'L', q:'Halloween is celebrated ___ October 31st.', o:['on','in','at','by'], a:0, why:'ON + date.'},
 {k:'L', q:'Diwali usually takes place ___ October or November.', o:['in','on','at','since'], a:0, why:'IN + months.'},
 {k:'L', q:'We ___ the parade when it started to rain.', o:['were watching','watched','watch','are watching'], a:0, why:'Past continuous interrupted by past simple.'},
 {k:'L', q:'Christmas cards ___ all over the world every December.', o:['are sent','send','are sending','sent'], a:0, why:'Present simple passive (plural): are + past participle.'},
 {k:'Q', q:'This is your first carnival, ___?', o:["isn't it","is this","doesn't it","isn't this"], a:0, why:'THIS → it in the tag.'},
 {k:'Q', q:"You won't forget the cake, ___?", o:['will you',"won't you",'do you','would you'], a:0, why:"Negative WON'T → will you?"},
 {k:'Q', q:'They could see the fireworks, ___?', o:["couldn't they","could they","didn't they","can't they"], a:0, why:"Modal COULD → couldn't they?"},
 {k:'Q', q:'Nobody likes rainy parades, ___?', o:['do they',"don't they",'does he','is it'], a:0, why:'NOBODY → positive tag with THEY.'},
 {k:'Q', q:"Let's dance the cueca, ___?", o:['shall we','will you',"don't we",'let we'], a:0, why:"LET'S → shall we?"},
];

export const SKILLS = {E:'Reading — explicit', I:'Reading — implicit', V:'Vocabulary in context', L:'Language in use', Q:'Question tags'};

export { SIDE } from './side.js';
