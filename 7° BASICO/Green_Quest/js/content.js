// Green Quest — 7° básico, Unit 4 "Green Issues"
// Item: {k, q, o:[options], a:index of correct, why:'short explanation'}
// k = skill: E explicit reading, I implicit reading,
//            A modals for advice (should / shouldn't / could),
//            R modals for rules (must / mustn't / have to / don't have to),
//            Z zero conditional, V green vocabulary (recycling).

export const ZONES = [
{
 id: 'forest', name: 'Whispering Forest', topic: 'Forests and wildfires', color: '#2fae5a',
 npc: { name: 'Leo', model: 'Ranger' },
 hello: "Hi! I'm Leo. This forest was full of birds and foxes, but Captain Smog covered it with smoke and now people are forgetting to take care of it. Please read my story and help me!",
 after: "Great reading! Now look: Captain Smog left three rubbish bags in my forest. They're glowing between the trees. Can you pick them up?",
 bye: "The air is clean again and I can hear the birds! Take this Eco Crystal to the Great Tree.",
 title: 'Trees for Tomorrow',
 text: `Hi! My name is Leo and I am thirteen years old. I live in a small town near Concepción, in the south of Chile. Behind my house there is a big forest with tall trees, birds and foxes. When I was little, I played there every weekend with my older sister, Camila.

Two summers ago, something terrible happened. It was very hot and dry, and a fire started near the road. Someone threw a cigarette out of a car window. The wind was strong, so the fire moved very fast. In two days, it burned more than five hundred hectares of forest. We had to leave our house for a week. When we came back, the forest was black and silent. There were no birds.

Last year, my school started a project called "Trees for Tomorrow". Every Saturday, students, parents and teachers go to the burnt forest and plant native trees, like quillay, peumo and boldo. These trees are strong and they don't need much water. At first, I didn't want to go because I had to get up at seven o'clock on a Saturday! But now it is my favourite day of the week.

Our teacher, Mr. Soto, always says: "If you plant a tree, you give a home to a bird." Together, we have planted more than two thousand trees. Some of them are already taller than me.

Last Saturday, Camila and I saw a small fox between the young trees. We didn't say anything. We just looked at each other and smiled.`,
 reading: [
  {k:'E', q:"Where does Leo live?", o:["In a small town near Concepción","In the centre of Santiago","Inside the forest","In a town in the north of Chile"], a:0, why:'"I live in a small town near Concepción, in the south of Chile."'},
  {k:'E', q:"How did the fire start?", o:["Someone threw a cigarette out of a car window","A storm hit a tree","Leo's family made a barbecue","A fox knocked over a candle"], a:0, why:'"Someone threw a cigarette out of a car window."'},
  {k:'E', q:"Why do they plant quillay, peumo and boldo?", o:["They are strong and don't need much water","They grow very fast","They have delicious fruit","They are cheap to buy"], a:0, why:'"These trees are strong and they don\'t need much water."'},
  {k:'I', q:"Why was the forest \"silent\" after the fire?", o:["The animals were dead or had gone away","Everybody was sleeping","It was the middle of the night","The wind stopped blowing"], a:0, why:'The text says "There were no birds": no animals, no sounds.'},
  {k:'I', q:"How did Leo's feelings about the project change?", o:["At first he didn't want to go, but now he loves it","He always loved it from the first day","At first he loved it, but now he is bored","He never liked it"], a:0, why:'"At first, I didn\'t want to go…" → "now it is my favourite day of the week."'},
  {k:'I', q:"Why did Leo and Camila smile when they saw the fox?", o:["It showed that the forest was coming back to life","The fox was very funny","They wanted to take the fox home","They were afraid of the fox"], a:0, why:'After the fire there were no animals. The fox is a sign that their work is helping.'},
 ],
 should: [
  {k:'A', q:"We're going camping in the forest this weekend. — You ___ take all your rubbish home with you.", o:["should","shouldn't","should to","shoulds"], a:0, why:'SHOULD + verb = good advice. No "to" after should.'},
  {k:'A', q:"It's very hot and windy today. You ___ light a fire in the forest.", o:["shouldn't","should","could","don't should"], a:0, why:"SHOULDN'T = it's a bad idea. A fire on a hot, windy day is dangerous."},
  {k:'A', q:"I want to help the forest, but I don't know how. — You ___ join Leo's tree-planting group.", o:["could","couldn't","could to","can to"], a:0, why:'COULD + verb = a possible idea (a suggestion).'},
  {k:'A', q:"Camila is always tired after planting trees. Which advice is correct?", o:["She should go to bed earlier.","She should to go to bed earlier.","She shoulds go to bed earlier.","She should going to bed earlier."], a:0, why:'Should + base verb (go). Should never changes: I should, she should, they should.'},
 ],
 must: [
  {k:'R', q:"A sign in the national park says: <b>NO FIRES</b>. What does it mean?", o:["You mustn't make a fire here.","You don't have to make a fire here.","You must make a fire here.","You have to make a fire here."], a:0, why:"MUSTN'T = it is prohibited. It's against the rules."},
  {k:'R', q:"In the national park, visitors ___ stay on the paths. It's the rule.", o:["must","mustn't","don't have to","musts"], a:0, why:"MUST = it is necessary. It's a rule."},
  {k:'R', q:"Planting trees on Saturday is for volunteers. You ___ go, but it's really fun!", o:["don't have to","mustn't","have to","must"], a:0, why:"DON'T HAVE TO = it isn't necessary, but you can if you want. It's NOT the same as mustn't!"},
  {k:'R', q:"Leo ___ get up at seven o'clock on Saturdays.", o:["has to","have to","must to","haves to"], a:0, why:"He / she / it → HAS TO."},
 ],
 zero: [
  {k:'Z', q:"If trees ___ water, they die.", o:["don't get","won't get","didn't get","doesn't get"], a:0, why:"Zero conditional: If + present simple, present simple. Trees = they → don't get."},
  {k:'Z', q:"If it doesn't rain for a long time, the ground ___ very dry.", o:["gets","will gets","got","getting"], a:0, why:"Facts that are always true: present simple in both parts."},
  {k:'Z', q:"Complete the fact: \"If you cut down too many trees, …\"", o:["animals lose their homes.","animals will lost their homes.","animals losing their homes.","animals lost their homes yesterday."], a:0, why:"Present simple in the result: animals lose."},
  {k:'Z', q:"Which sentence is a correct zero conditional?", o:["If plants get sun and water, they grow.","If plants will get sun and water, they grow.","If plants get sun and water, they grew.","If plants getting sun and water, they grow."], a:0, why:"If + present simple, present simple. Don't use WILL after IF."},
 ],
},
{
 id: 'ocean', name: 'Blue Bay', topic: 'Plastic in the ocean', color: '#1f8fd6',
 npc: { name: 'Marina', model: 'Mage' },
 hello: "Hello! I'm Marina. This bay was blue and clean, but Captain Smog threw plastic everywhere. The turtles are in danger! Read my story and help me save them.",
 after: "Thank you! Captain Smog dropped three rubbish bags near the water. Please pick them up before the waves take them to the sea!",
 bye: "Look, the water is blue again and the turtle is safe! This Eco Crystal is for you.",
 title: 'The Turtle and the Bag',
 text: `Hello! I'm Marina and I'm twelve. I live in La Serena, a city on the coast of Chile. I love the sea. Every summer I swim, surf and look for shells on the beach with my best friend, Diego.

Last January, Diego and I found a sea turtle on the sand. It wasn't moving very much. When we looked carefully, we saw a plastic bag around its neck. I called my uncle, who works at a marine rescue centre. He came quickly and cut the bag with special scissors. Then he took the turtle to the centre. After three weeks, it was healthy again, and we watched it swim back into the ocean. It was the best day of my summer.

My uncle told us something that surprised me. Every year, about eight million tonnes of plastic go into the oceans. Turtles often eat plastic bags because they look like jellyfish, their favourite food. If a turtle eats plastic, it can't eat real food and it gets sick.

After that day, Diego and I decided to do something. Now, on the first Sunday of every month, we organise a beach clean-up with our classmates. We bring gloves and big bags, and we separate the rubbish: plastic, glass and cans. Last month, we collected forty kilos of rubbish in only two hours! Most of it was bottle caps, straws and cigarette ends.

Before, my mum bought water in plastic bottles every week. Now everybody in my family uses a metal bottle. It's a small change, but small changes add up.`,
 reading: [
  {k:'E', q:"What was around the turtle's neck?", o:["A plastic bag","A fishing net","A metal bottle","A piece of glass"], a:0, why:'"…we saw a plastic bag around its neck."'},
  {k:'E', q:"Why do turtles eat plastic bags?", o:["Because they look like jellyfish","Because they are very hungry in summer","Because plastic tastes good","Because they want to play with them"], a:0, why:'"Turtles often eat plastic bags because they look like jellyfish, their favourite food."'},
  {k:'E', q:"How much rubbish did they collect last month?", o:["Forty kilos in two hours","Eight million tonnes","Forty bags in one day","Two kilos in forty minutes"], a:0, why:'"…we collected forty kilos of rubbish in only two hours!"'},
  {k:'I', q:"Why did Marina call her uncle?", o:["Because he knows how to help sea animals","Because he lives next to the beach","Because she wanted to go home","Because he sells plastic bags"], a:0, why:'He works at a marine rescue centre, so he can help the turtle.'},
  {k:'I', q:"What does Marina mean with \"small changes add up\"?", o:["Many small actions together make a big difference","Small changes are not important","Only big changes can help the planet","Metal bottles are very small"], a:0, why:'One metal bottle is small, but many people doing it every day help a lot.'},
  {k:'I', q:"What kind of person is Marina?", o:["She is active: she does something to solve problems","She is lazy and doesn't care about the sea","She is afraid of animals","She doesn't like her friends"], a:0, why:'She saves a turtle, organises clean-ups and changes her habits.'},
 ],
 should: [
  {k:'A', q:"Diego's hands are dirty after the clean-up. — You ___ wash them before you eat.", o:["should","shouldn't","should to","shoulds"], a:0, why:"SHOULD + verb = good advice."},
  {k:'A', q:"You ___ throw plastic bags in the sea. Turtles eat them!", o:["shouldn't","should","could","shouldn't to"], a:0, why:"SHOULDN'T + verb = a bad idea."},
  {k:'A', q:"I want to use less plastic. Any ideas? — You ___ use a metal bottle.", o:["could","couldn't","could to","coulds"], a:0, why:"COULD + verb = a possible idea (a suggestion)."},
  {k:'A', q:"\"I found a hurt bird on the beach!\" Which advice is correct?", o:["You should call the rescue centre.","You should calling the rescue centre.","You should to call the rescue centre.","You could to call the rescue centre."], a:0, why:'Should / could + base verb, without "to".'},
 ],
 must: [
  {k:'R', q:"A sign on the beach says: <b>DON'T LEAVE RUBBISH HERE</b>. What does it mean?", o:["You mustn't leave rubbish on the beach.","You don't have to leave rubbish on the beach.","You have to leave rubbish on the beach.","You must leave rubbish on the beach."], a:0, why:"MUSTN'T = it's prohibited."},
  {k:'R', q:"At the clean-up, everyone ___ wear gloves. Glass can cut your hands!", o:["must","mustn't","don't have to","must to"], a:0, why:"MUST = it's necessary. It's a safety rule."},
  {k:'R', q:"The clean-up is on Sunday, so we ___ go to school that day.", o:["don't have to","mustn't","have to","has to"], a:0, why:"There's no school on Sunday: it isn't necessary → DON'T HAVE TO."},
  {k:'R', q:"There's a red flag on the beach today. You ___ swim. It's dangerous!", o:["mustn't","don't have to","must","have to"], a:0, why:"MUSTN'T = it's prohibited."},
 ],
 zero: [
  {k:'Z', q:"If a turtle ___ plastic, it gets sick.", o:["eats","eat","will eat","ate"], a:0, why:"A turtle = it → eats. If + present simple, present simple."},
  {k:'Z', q:"If you leave plastic on the beach, the waves ___ it into the sea.", o:["take","will took","taking","took"], a:0, why:"Zero conditional: present simple in both parts."},
  {k:'Z', q:"If water gets very cold (0 °C), it ___.", o:["freezes","will freezes","freezing","froze"], a:0, why:"A scientific fact → present simple: it freezes."},
  {k:'Z', q:"Complete the fact: \"If you recycle plastic bottles, …\"", o:["they become new things, like T-shirts.","they will became new things.","they becomes new things.","they becoming new things."], a:0, why:"They → become (present simple)."},
 ],
},
{
 id: 'city', name: 'Recycle City', topic: 'Rubbish and recycling', color: '#e8a21a',
 npc: { name: 'Sam', model: 'Rogue' },
 hello: "Hey! I'm Sam, from the Green Team. Captain Smog mixed all the rubbish in our city and now nobody recycles. Read my story and help us clean the streets!",
 after: "Awesome! Now, Captain Smog hid three rubbish bags between the buildings. Find them and put them in the right bins!",
 bye: "The streets are clean and the bins are working again. Here's your Eco Crystal, Green Team member!",
 title: 'The Green Team',
 text: `Hi, I'm Sam and I go to Saint John's School in Santiago. Last year, our English teacher, Ms. Rivas, asked us a question: "How much rubbish does our school produce in one week?" Nobody knew the answer, so we decided to find out.

For five days, my class weighed all the rubbish bins at the end of every day. The result was a shock: 300 kilos in one week! Most of it was paper, plastic bottles and food from lunch. Ms. Rivas explained that almost all this rubbish goes to a landfill, a huge hole in the ground outside the city. If rubbish stays in a landfill, it takes a very long time to disappear. A plastic bottle, for example, needs about 450 years.

So we created "The Green Team". First, we put three coloured bins in every corridor: blue for paper, yellow for plastic and green for glass. We made posters about the three Rs: Reduce, Reuse and Recycle. Then we started a compost bin in the school garden for fruit and vegetable peels.

At the beginning, it was difficult. Many students threw everything in the same bin, and some of them laughed at us. But we didn't give up. Every Monday, we gave a short talk in each classroom.

After three months, we weighed the rubbish again. This time there were only 120 kilos! The principal was so happy that she gave our class a prize: a trip to a recycling plant. Now, before I throw something away, I always ask myself: "Can I use this again?"`,
 reading: [
  {k:'E', q:"How much rubbish did the school produce in one week at the beginning?", o:["300 kilos","120 kilos","450 kilos","30 kilos"], a:0, why:'"The result was a shock: 300 kilos in one week!"'},
  {k:'E', q:"What is the blue bin for?", o:["Paper","Plastic","Glass","Food"], a:0, why:'"…blue for paper, yellow for plastic and green for glass."'},
  {k:'E', q:"What prize did the class get?", o:["A trip to a recycling plant","New coloured bins","A party at school","A day without classes"], a:0, why:'"…she gave our class a prize: a trip to a recycling plant."'},
  {k:'I', q:"Why did some students laugh at the Green Team?", o:["They didn't think the project was important","The posters were very funny","The Green Team told jokes","They wanted to join the team"], a:0, why:'They didn\'t take the project seriously at first and threw everything in the same bin.'},
  {k:'I', q:"\"But we didn't give up.\" What does this show about the Green Team?", o:["They continued working, even when it was difficult","They stopped the project","They were angry with the students","They changed schools"], a:0, why:'Give up = stop trying. They didn\'t stop: they gave talks every Monday.'},
  {k:'I', q:"Why does Sam now ask \"Can I use this again?\"", o:["He learned that reusing things means less rubbish","He doesn't have money to buy new things","His teacher gives him a test every day","He likes old things more than new things"], a:0, why:'The project changed his habits: reusing = reducing rubbish.'},
 ],
 should: [
  {k:'A', q:"Many students throw everything in the same bin. — They ___ separate their rubbish.", o:["should","shouldn't","should to","shoulds"], a:0, why:"SHOULD + verb = good advice."},
  {k:'A', q:"You ___ throw old batteries in the normal bin. They are dangerous for the environment.", o:["shouldn't","should","could","shouldn't to"], a:0, why:"SHOULDN'T = it's a bad idea."},
  {k:'A', q:"I have a lot of old clothes. — You ___ give them to a second-hand shop.", o:["could","couldn't","could to","coulds"], a:0, why:"COULD = a possible idea (a suggestion)."},
  {k:'A', q:"Which sentence is correct?", o:["You should reuse your plastic bags.","You should to reuse your plastic bags.","You shoulds reuse your plastic bags.","You should reusing your plastic bags."], a:0, why:'Should + base verb (reuse).'},
 ],
 must: [
  {k:'R', q:"School rule: students ___ put paper in the blue bin.", o:["must","mustn't","don't have to","must to"], a:0, why:"MUST = it's a rule, it's necessary."},
  {k:'R', q:"A sign on the street says: <b>NO LITTERING</b>. What does it mean?", o:["You mustn't throw rubbish on the street.","You don't have to throw rubbish on the street.","You must throw rubbish on the street.","You have to clean the street."], a:0, why:"MUSTN'T = it's prohibited. Littering = throwing rubbish on the ground."},
  {k:'R', q:"You ___ buy new boxes for recycling. You can use old ones!", o:["don't have to","mustn't","have to","has to"], a:0, why:"DON'T HAVE TO = it isn't necessary."},
  {k:'R', q:"Sam ___ give a talk every Monday. It's his job in the Green Team.", o:["has to","have to","must to","is have to"], a:0, why:"He / she / it → HAS TO."},
 ],
 zero: [
  {k:'Z', q:"If you recycle paper, you ___ trees.", o:["save","saves","will saved","saved"], a:0, why:"You → save. If + present simple, present simple."},
  {k:'Z', q:"If rubbish ___ in a landfill, it takes many years to disappear.", o:["stays","stay","will stay","stayed"], a:0, why:"Rubbish = it → stays."},
  {k:'Z', q:"If you put fruit peels in a compost bin, they ___ into soil for plants.", o:["turn","turns","will turned","turning"], a:0, why:"They → turn (present simple)."},
  {k:'Z', q:"Which sentence is correct?", o:["If people don't recycle, landfills get bigger.","If people won't recycle, landfills get bigger.","If people don't recycle, landfills got bigger.","If people doesn't recycle, landfills get bigger."], a:0, why:"People = they → don't recycle. Present simple in both parts."},
 ],
},
{
 id: 'farm', name: 'Sunny Farm', topic: 'Saving water', color: '#8a5a2b',
 npc: { name: 'Pedro', model: 'Barbarian' },
 hello: "Hello, friend! I'm Pedro. Captain Smog stole the rain clouds and now my farm is very dry. Read my story and help me bring the water back!",
 after: "Thanks! But Captain Smog dropped three rubbish bags in my fields. They're glowing near the plants. Please pick them up!",
 bye: "The plants are green again! Water is like gold, remember. Take this Eco Crystal!",
 title: 'Every Drop Counts',
 text: `Hello! I'm Pedro and I live on a small farm in the Valparaíso Region with my parents and my grandmother. We grow avocados, tomatoes and lettuce, and we have six chickens and an old dog called Pirata.

When my grandmother was young, there was a river near the farm with lots of water all year. Today, the river is almost dry in summer. In the last fifteen years, it hasn't rained much in the centre of Chile. Scientists call this a "mega-drought". Avocado trees need a lot of water, so some farmers in our area had to stop growing them.

My family decided to change the way we use water. First, my dad installed drip irrigation. With this system, small tubes give water directly to the roots of each plant, drop by drop. It uses half the water of the old system. We also collect rainwater from the roof in big tanks, and we water the garden early in the morning or in the evening. If you water plants at midday, the sun dries the water very fast.

At home, we have some rules too. We take five-minute showers, and we turn off the tap when we brush our teeth. My grandmother uses the water from washing vegetables to water her flowers. She always says: "Water is like gold. You mustn't waste it."

Last week, it rained for the first time in four months. Pirata ran in circles in the garden, and my grandmother stood outside with her face up to the sky, laughing like a little girl.`,
 reading: [
  {k:'E', q:"What does Pedro's family grow?", o:["Avocados, tomatoes and lettuce","Apples, grapes and potatoes","Only avocados","Flowers and trees"], a:0, why:'"We grow avocados, tomatoes and lettuce…"'},
  {k:'E', q:"What is drip irrigation?", o:["Small tubes that give water to the roots, drop by drop","A big tank on the roof","A machine that makes rain","A river near the farm"], a:0, why:'"…small tubes give water directly to the roots of each plant, drop by drop."'},
  {k:'E', q:"When does the family water the garden?", o:["Early in the morning or in the evening","At midday","Only when it rains","Every hour"], a:0, why:'"…we water the garden early in the morning or in the evening."'},
  {k:'I', q:"Why did some farmers stop growing avocados?", o:["There isn't enough water for avocado trees now","People don't like avocados","Avocados are too expensive to sell","The chickens ate the avocados"], a:0, why:'Avocado trees need a lot of water, and there is a mega-drought.'},
  {k:'I', q:"Why does the grandmother say \"Water is like gold\"?", o:["Because water is very valuable now","Because the water is yellow","Because she sells water","Because gold is in the river"], a:0, why:'Gold is precious. With the drought, water is precious too.'},
  {k:'I', q:"Why was the grandmother laughing in the rain?", o:["She was very happy because rain is rare now","She was cold and wet","Pirata made a funny face","She lost her umbrella"], a:0, why:'It rained "for the first time in four months": rain is a special event now.'},
 ],
 should: [
  {k:'A', q:"It's 1 p.m. and very sunny. — You ___ water the plants now. Wait until the evening!", o:["shouldn't","should","could","shouldn't to"], a:0, why:"SHOULDN'T = it's a bad idea. The sun dries the water."},
  {k:'A', q:"Our water bill is very high! — You ___ take shorter showers.", o:["should","shouldn't","should to","shoulds"], a:0, why:"SHOULD + verb = good advice."},
  {k:'A', q:"What can I do with the water from washing vegetables? — You ___ use it to water the flowers.", o:["could","couldn't","could to","can to"], a:0, why:"COULD = a possible idea (a suggestion)."},
  {k:'A', q:"Pedro's cousin leaves the tap on when he brushes his teeth. Which advice is correct?", o:["He should turn off the tap.","He should turns off the tap.","He should to turn off the tap.","He shoulds turn off the tap."], a:0, why:'Should never changes and the verb is in base form: he should turn.'},
 ],
 must: [
  {k:'R', q:"Grandma's rule: \"Water is like gold. You ___ waste it.\"", o:["mustn't","don't have to","must","have to"], a:0, why:"MUSTN'T = it's prohibited (in Grandma's house!)."},
  {k:'R', q:"During the drought, families in some towns ___ use less water. It's the law.", o:["have to","don't have to","has to","haves to"], a:0, why:"Families = they → HAVE TO (it's necessary, it's a rule)."},
  {k:'R', q:"It rained a lot last night, so we ___ water the garden today.", o:["don't have to","mustn't","have to","must"], a:0, why:"The plants have water: it isn't necessary → DON'T HAVE TO."},
  {k:'R', q:"Pedro ___ feed the chickens every morning. It's his job on the farm.", o:["has to","have to","must to","don't have to"], a:0, why:"He → HAS TO."},
 ],
 zero: [
  {k:'Z', q:"If you water plants at midday, the sun ___ the water very fast.", o:["dries","dry","will dries","dried"], a:0, why:"The sun = it → dries."},
  {k:'Z', q:"If it ___ rain, rivers get dry.", o:["doesn't","don't","won't","didn't"], a:0, why:"It → doesn't rain. Present simple in both parts."},
  {k:'Z', q:"If chickens eat well, they ___ more eggs.", o:["produce","produces","will produced","producing"], a:0, why:"They → produce."},
  {k:'Z', q:"Which sentence is a zero conditional?", o:["If you use drip irrigation, you save water.","If you use drip irrigation, you saved water.","If you will use drip irrigation, you save water.","If you using drip irrigation, you save water."], a:0, why:"If + present simple, present simple."},
 ],
},
{
 id: 'energy', name: 'Windy Hills', topic: 'Clean energy', color: '#7a4fd6',
 npc: { name: 'Max', model: 'Knight' },
 hello: "Hi there! I'm Max. Captain Smog stopped our wind turbines and solar panels, and now the island burns coal and makes black smoke. Read my story and help us get clean energy back!",
 after: "You're a real energy detective! Now find the three rubbish bags that Captain Smog left on the hills.",
 bye: "The turbines are turning and the sun is shining on the panels again! Here's the last Eco Crystal.",
 title: 'Power from the Sun and the Wind',
 text: `Hi! I'm Max and I live in Calama, in the Atacama Desert. It's one of the sunniest places in the world. Here, it almost never rains, and the sky is blue nearly every day of the year.

Near my city there are enormous solar parks with thousands of solar panels. My mum works at one of them as an engineer. She says that the panels change sunlight into electricity, and this electricity travels hundreds of kilometres to cities like Santiago. In other parts of Chile, there are wind farms with giant white turbines. Solar and wind energy are renewable: the sun and the wind never run out.

Why is this important? A lot of the electricity in the world still comes from burning coal, oil and gas. When we burn them, they produce gases like CO2. These gases trap heat around the Earth, like a blanket. This is called the greenhouse effect, and it is making our planet warmer. If the planet gets warmer, the ice in the mountains melts and the sea level rises.

Last month, my class did an "energy detective" project. We checked our homes for wasted energy. In my house, I found the TV on standby all night, chargers in the sockets with no phones, and lights on in empty rooms. My little brother was the worst: he always leaves the fridge door open! Now we have a "switch-off" chart on the fridge, and the person with the most stars chooses the film on Friday night.

Last month our electricity bill was 20% lower. And I won the chart, of course!`,
 reading: [
  {k:'E', q:"Where does Max live?", o:["In Calama, in the Atacama Desert","In Santiago","Near a wind farm in the south","In a city on the coast"], a:0, why:'"I live in Calama, in the Atacama Desert."'},
  {k:'E', q:"What does Max's mum do?", o:["She is an engineer at a solar park","She is a science teacher","She sells solar panels","She works at a coal plant"], a:0, why:'"My mum works at one of them as an engineer."'},
  {k:'E', q:"What do gases like CO2 do?", o:["They trap heat around the Earth, like a blanket","They make electricity","They clean the air","They make the planet colder"], a:0, why:'"These gases trap heat around the Earth, like a blanket."'},
  {k:'I', q:"Why is Calama a good place for solar parks?", o:["Because it is sunny almost every day","Because it rains a lot","Because there is a lot of wind","Because it is very cold"], a:0, why:'Solar panels need sunlight, and the sky is blue "nearly every day".'},
  {k:'I', q:"Why did the family make a \"switch-off\" chart with a prize?", o:["To motivate everyone to save energy","To decide who cleans the fridge","To learn maths","To watch more TV"], a:0, why:'A prize (choosing the film) makes saving energy fun.'},
  {k:'I', q:"\"And I won the chart, of course!\" What does this show?", o:["Max saved the most energy and he is proud of it","Max doesn't care about the chart","Max's brother won the chart","Max doesn't like films"], a:0, why:'The winner has the most stars. "Of course" shows he is proud.'},
 ],
 should: [
  {k:'A', q:"My phone is fully charged. — You ___ unplug the charger.", o:["should","shouldn't","should to","shoulds"], a:0, why:"SHOULD + verb = good advice."},
  {k:'A', q:"You ___ leave the lights on in empty rooms. It wastes energy.", o:["shouldn't","should","could","shouldn't to"], a:0, why:"SHOULDN'T = it's a bad idea."},
  {k:'A', q:"It's a sunny day and my school is only 1 km away. — You ___ walk or ride your bike!", o:["could","couldn't","could to","coulds"], a:0, why:"COULD = a possible idea (a suggestion)."},
  {k:'A', q:"Max's brother always leaves the fridge door open. Which advice is correct?", o:["He should close it quickly.","He should closes it quickly.","He should to close it quickly.","He should closing it quickly."], a:0, why:"Should + base verb (close)."},
 ],
 must: [
  {k:'R', q:"A sign at the solar park says: <b>DANGER — DO NOT TOUCH</b>. What does it mean?", o:["You mustn't touch the solar panels.","You don't have to touch the solar panels.","You must touch the solar panels.","You have to touch the solar panels."], a:0, why:"MUSTN'T = it's prohibited."},
  {k:'R', q:"Workers at the solar park ___ wear a helmet. It's a safety rule.", o:["have to","has to","don't have to","mustn't"], a:0, why:"Workers = they → HAVE TO."},
  {k:'R', q:"The sun is free, so a solar park ___ buy coal or gas.", o:["doesn't have to","mustn't","has to","don't has to"], a:0, why:"It isn't necessary → DOESN'T HAVE TO (it → doesn't)."},
  {k:'R', q:"Max's family rule: \"Everyone ___ switch off the TV at night.\"", o:["must","mustn't","musts","must to"], a:0, why:"MUST + verb = it's a rule. Must never changes."},
 ],
 zero: [
  {k:'Z', q:"If we burn coal and oil, they ___ CO2.", o:["produce","produces","will produced","produced"], a:0, why:"They → produce. Present simple in both parts."},
  {k:'Z', q:"If the planet gets warmer, ice in the mountains ___.", o:["melts","melt","will melts","melting"], a:0, why:"Ice = it → melts."},
  {k:'Z', q:"If you ___ the TV on standby, it still uses energy.", o:["leave","leaves","will leave","left"], a:0, why:"You → leave. If + present simple."},
  {k:'Z', q:"If there ___ any wind, wind turbines don't produce electricity.", o:["isn't","aren't","won't","doesn't"], a:0, why:"There isn't any wind (wind is uncountable → is)."},
 ],
},
];

// Short grammar reminders shown before each rubbish bag
export const GRAMMAR = {
 A: `<b>should / shouldn't + verb</b> → advice (consejo)<br><i>You should recycle. You shouldn't waste water.</i><br><br><b>could + verb</b> → a possible idea (sugerencia)<br><i>You could walk to school.</i><br><br>⚠️ No "to" after should / could: <s>should to go</s>`,
 R: `<b>must / have to + verb</b> → it's necessary, it's a rule<br><i>You must stay on the path. She has to get up early.</i><br><br><b>mustn't</b> → it's prohibited (prohibido)<br><i>You mustn't make fires.</i><br><br><b>don't have to</b> → it isn't necessary (no es necesario)<br><i>You don't have to come, but you can.</i>`,
 Z: `<b>Zero conditional</b> → facts that are always true<br><b>If + present simple, present simple</b><br><i>If you heat ice, it melts.<br>If plants don't get water, they die.</i><br><br>⚠️ Don't use <s>will</s> in zero conditional facts.`,
};

// Final duel with Captain Smog (modals + zero conditional)
export const BOSS = {
 name: 'Captain Smog',
 intro: "Ha! So you cleaned all five zones… I don't care! You don't have to recycle, you don't have to save water, and if you burn rubbish, it just disappears! Prove I'm wrong in an Eco Duel!",
 win: "Cough, cough… The smoke is going away! OK, OK… if you take care of the planet, it takes care of you. Maybe I should change… Can I join the Green Team?",
 items: [
  {k:'A', q:"Captain Smog drives his car to the shop next door. He ___ walk!", o:["should","shouldn't","should to","must to"], a:0, why:"SHOULD = good advice."},
  {k:'R', q:"You ___ throw rubbish in the river. It's against the law.", o:["mustn't","don't have to","must","have to"], a:0, why:"MUSTN'T = it's prohibited."},
  {k:'Z', q:"If you burn plastic, it ___ toxic smoke.", o:["produces","produce","will produces","produced"], a:0, why:"It → produces. Present simple in both parts."},
  {k:'R', q:"It's Saturday. Students ___ wear their school uniform.", o:["don't have to","mustn't","have to","has to"], a:0, why:"There's no school: it isn't necessary → DON'T HAVE TO."},
  {k:'A', q:"You ___ buy so many plastic toys. They break quickly.", o:["shouldn't","should","could","shouldn't to"], a:0, why:"SHOULDN'T = it's a bad idea."},
  {k:'Z', q:"If people ___ trees, there is more oxygen.", o:["plant","plants","will plant","planted"], a:0, why:"People = they → plant."},
  {k:'R', q:"My sister ___ feed the dog every morning. It's her job.", o:["has to","have to","must to","haves to"], a:0, why:"She → HAS TO."},
  {k:'A', q:"I want to save energy. — You ___ dry your clothes in the sun.", o:["could","couldn't","could to","coulds"], a:0, why:"COULD = a possible idea."},
  {k:'Z', q:"If you mix blue and yellow, you ___ green.", o:["get","gets","will got","getting"], a:0, why:"You → get."},
  {k:'R', q:"\"You don't have to bring a bag.\" What does it mean?", o:["It isn't necessary to bring a bag.","It's prohibited to bring a bag.","You must bring a bag.","You should bring two bags."], a:0, why:"DON'T HAVE TO = not necessary. MUSTN'T = prohibited."},
  {k:'Z', q:"Which sentence is correct?", o:["If ice gets warm, it melts.","If ice will get warm, it melts.","If ice gets warm, it melted.","If ice get warm, it melts."], a:0, why:"If + present simple, present simple. Ice = it → gets, melts."},
  {k:'R', q:"Drivers ___ stop at a red light.", o:["must","mustn't","don't have to","must to"], a:0, why:"MUST = it's a rule."},
  {k:'A', q:"Which sentence is correct?", o:["We should use both sides of the paper.","We should to use both sides of the paper.","We shoulds use both sides of the paper.","We should using both sides of the paper."], a:0, why:"Should + base verb."},
  {k:'Z', q:"If plants ___ light, they die.", o:["don't get","doesn't get","won't get","didn't get"], a:0, why:"Plants = they → don't get."},
 ],
};

// Extra quick items for the online mode (mini readings)
export const ONLINE_EXTRA = [
 {k:'E', q:'<p class="mini">Bees are very important for the planet. They carry pollen from flower to flower, and this helps plants make fruit. About one third of the food we eat depends on bees.</p>How much of our food depends on bees?', o:['About one third','All of it','Only honey','About half'], a:0, why:'"About one third of the food we eat depends on bees."'},
 {k:'I', q:'<p class="mini">In 2017, Kenya made plastic bags illegal. Before that, many cows in the cities got sick because they ate plastic bags from the streets.</p>Why did Kenya probably make plastic bags illegal?', o:['To protect animals and the environment','Because plastic bags were too expensive','Because cows like paper bags','To sell more bags'], a:0, why:'The text connects plastic bags with sick cows.'},
 {k:'E', q:'<p class="mini">The Great Pacific Garbage Patch is an area of floating rubbish in the Pacific Ocean. It is about three times bigger than France.</p>How big is it?', o:['About three times bigger than France','As big as a city','Three kilometres long','Smaller than France'], a:0, why:'"…about three times bigger than France."'},
 {k:'I', q:'<p class="mini">Sofía\'s family has two bins in the kitchen. The small one is for normal rubbish. The big one is for recycling, and it is always full.</p>What can we infer?', o:['They recycle more than they throw away','They never recycle','They have a very small kitchen','They don\'t produce rubbish'], a:0, why:'The recycling bin is bigger and always full.'},
 {k:'E', q:'<p class="mini">A dripping tap can waste up to 15 litres of water a day. That\'s more than 5,000 litres in one year!</p>How much water can a dripping tap waste in a day?', o:['Up to 15 litres','5,000 litres','1 litre','50 litres'], a:0, why:'"…up to 15 litres of water a day."'},
 {k:'I', q:'<p class="mini">Every year, millions of people switch off their lights for one hour during Earth Hour. Cities like Paris and Sydney also switch off the lights of their famous buildings.</p>Why do cities switch off famous buildings?', o:['So many people see the message and think about energy','Because the buildings are closed','Because they have no electricity','To make the buildings cleaner'], a:0, why:'Famous buildings in the dark get everybody\'s attention.'},
 {k:'E', q:'<p class="mini">Torres del Paine National Park, in Chile, had big fires in 2005 and 2011. Both fires started because of careless tourists.</p>How did the fires start?', o:['Because of careless tourists','Because of a storm','Because of a volcano','Because of very hot weather only'], a:0, why:'"Both fires started because of careless tourists."'},
 {k:'I', q:'<p class="mini">Tomás bought a very cheap T-shirt online. After two washes, it had holes. "Next time, I\'ll go to a second-hand shop," he said.</p>What did Tomás learn?', o:['Very cheap clothes don\'t last long','He should buy more T-shirts online','Second-hand clothes have holes','He shouldn\'t wash his clothes'], a:0, why:'The cheap T-shirt broke fast, so he wants a better option.'},
 {k:'E', q:'<p class="mini">Glass is a fantastic material for recycling. You can recycle it again and again, and it never loses its quality.</p>How many times can you recycle glass?', o:['Again and again, with no limit','Only once','Two times','Never'], a:0, why:'"You can recycle it again and again…"'},
 {k:'I', q:'<p class="mini">When Ana\'s school put solar panels on the roof, the electricity bill went down by half. The school used the extra money to buy new computers.</p>What can we infer?', o:['Solar panels helped the school save money','The computers use solar energy only','The school has no electricity now','Solar panels are free'], a:0, why:'Lower bill → extra money → new computers.'},
 {k:'A', q:'My room is very hot in summer. — You ___ open the window instead of using the air conditioner.', o:['could','couldn\'t','could to','coulds'], a:0, why:'COULD = a possible idea.'},
 {k:'R', q:'In the library, you ___ eat or drink. It\'s a rule.', o:['mustn\'t','don\'t have to','must','have to'], a:0, why:'MUSTN\'T = it\'s prohibited.'},
 {k:'Z', q:'If you heat water to 100 °C, it ___.', o:['boils','boil','will boils','boiled'], a:0, why:'Scientific fact: present simple. It → boils.'},
];


// ---------- Side quests ("Helping hands") ----------
// They appear along the roads. leg = road that arrives to zone [leg] (0 = plaza → forest, 1 = forest → bay, …).
// t = position along that road (0 to 1), side = left (-1) or right (1) of the road.
// collect = the player first picks up n things near the NPC, then answers the questions.
export const SIDE = [
{
 id:'campfire', leg:0, t:0.34, side:1, title:'Campfire Trouble', icon:'🔥',
 npc:{ name:'Tomás', model:'Barbarian', tint:'#d9822b' },
 hello:"Help! I'm Tomás. My friends and I camped here last night and we forgot to put out our campfire! The grass is very dry and the wind is getting stronger…",
 text:`Tomás and his friends camped here last night. In the morning they wanted to go to the lake, so they left very quickly. But their campfire is still burning! The grass around it is very dry, and the wind is starting to blow. Tomás has a bucket of water, but he is nervous and he doesn't know what to do. Remember: a small fire can become a big forest fire in a few minutes.`,
 items:[
  {k:'I', q:"Why is the campfire dangerous now?", o:["The grass is dry and the wind is blowing","It is raining very hard","Tomás is sleeping next to it","There are too many people at the lake"], a:0, why:'"The grass around it is very dry, and the wind is starting to blow."'},
  {k:'R', q:"Campers ___ leave a fire burning when they go. It's very dangerous!", o:["mustn't","don't have to","must","could"], a:0, why:'"mustn\'t" = it is prohibited / very important NOT to do it.'},
  {k:'Z', q:"If you pour water on a small fire, it ___ out.", o:["goes","went","is going to","go"], a:0, why:'Zero conditional: If + present simple, present simple → "it goes out".'},
 ],
 thanks:"Phew! The fire is out. From now on, I always check the fire before I leave. Thank you, Eco Hero!",
},
{
 id:'seeds', leg:0, t:0.7, side:-1, title:'The Lost Seeds', icon:'🌱',
 npc:{ name:'Rosa', model:'Mage', tint:'#e85d9c' },
 collect:{ n:5, what:'seed packets', icon:'🌱', kind:'seed' },
 hello:"Hello! I'm Rosa. I'm taking native seeds to Leo's forest, but there was a hole in my bag! I dropped five seed packets near the road. Can you find them for me?",
 ready:"You found all five packets! Thank you! Before I go, read this about my seeds.",
 text:`Rosa collects seeds from native trees, like quillay and boldo, and she gives them to schools. Native trees are important because birds and insects can live in them, and they don't need much water. Rosa says that people shouldn't plant only pine trees, because big pine forests burn very easily. You could plant a native tree in your school, too!`,
 items:[
  {k:'E', q:"Why are native trees important, according to Rosa?", o:["Birds and insects can live in them","They grow very fast","They are cheap","They have big fruit"], a:0, why:'"…birds and insects can live in them, and they don\'t need much water."'},
  {k:'A', q:"Rosa says people ___ plant only pine trees.", o:["shouldn't","should","must","have to"], a:0, why:'"shouldn\'t" = it is not a good idea. Pine forests burn very easily.'},
  {k:'A', q:"Your friend says: \"I want to help the forest.\" Choose the best advice.", o:["You could plant a native tree.","You could to plant a tree.","You couldn't planting a tree.","You plant could a tree."], a:0, why:'could + verb (without "to") = a possible idea.'},
 ],
 thanks:"Now Leo's forest will have hundreds of new trees. Look, I planted some seeds here, too!",
},
{
 id:'picnic', leg:1, t:0.32, side:1, title:'Picnic Rubbish', icon:'🥤',
 npc:{ name:'Diego', model:'Rogue', tint:'#f2c21a' },
 collect:{ n:6, what:'pieces of rubbish', icon:'🥤', kind:'litter' },
 hello:"Hi, I'm Diego. A big group had a picnic here yesterday and they left all their rubbish on the grass! The wind is blowing it towards the sea. Please help me pick up the six pieces!",
 ready:"The grass is clean! Do you know where that rubbish goes when nobody picks it up? Read this.",
 text:`Every year, millions of tonnes of plastic go into the oceans. A lot of this plastic comes from the land: from streets, beaches and picnic areas. When it rains, or when the wind blows, the rubbish travels to rivers and then to the sea. Plastic doesn't disappear. It breaks into very small pieces, called microplastics, and fish eat them.`,
 items:[
  {k:'E', q:"How does rubbish from the land get to the sea?", o:["Rain and wind take it to rivers, and then to the sea","Ships carry it to the sea","Fish take it to the sea","It never gets to the sea"], a:0, why:'"…the rubbish travels to rivers and then to the sea."'},
  {k:'Z', q:"If plastic goes into the sea, fish ___ it.", o:["eat","ate","are eat","eating"], a:0, why:'Zero conditional: If + present, present → "fish eat it".'},
  {k:'I', q:"What is the main idea of the text?", o:["Rubbish we leave on land can end up in the ocean","Picnics are bad for people","Fish like eating plastic","Plastic disappears in a few days"], a:0, why:'The text explains the journey of rubbish from the land to the sea.'},
 ],
 thanks:"And look, now there's a bin here. If people use a bin, the sea stays clean!",
},
{
 id:'net', leg:1, t:0.68, side:-1, title:'The Ghost Net', icon:'🕸️',
 npc:{ name:'Jack', model:'Knight', tint:'#3a7bd5' },
 hello:"Ahoy! I'm Jack, a fisherman. Look at that poor seagull! It's stuck in an old fishing net. Help me to free it!",
 text:`Fishermen sometimes lose their nets in the sea. People call them "ghost nets", because nobody uses them, but they keep catching animals for many years. Turtles, birds and dolphins get stuck in them and they can't escape. In Chile, some fishermen now take their old nets to recycling centres. The nets become new things, like skateboards and sunglasses!`,
 items:[
  {k:'I', q:"Why are they called \"ghost nets\"?", o:["Nobody uses them, but they still catch animals","They are white and invisible","They only appear at night","Ghosts use them to fish"], a:0, why:'"…nobody uses them, but they keep catching animals for many years."'},
  {k:'R', q:"Fishermen ___ throw old nets into the sea. It's against the rules.", o:["mustn't","don't have to","must","should"], a:0, why:'"mustn\'t" = it is prohibited.'},
  {k:'E', q:"What can old fishing nets become?", o:["Skateboards and sunglasses","Paper and cardboard","Food for fish","New boats"], a:0, why:'"The nets become new things, like skateboards and sunglasses!"'},
 ],
 thanks:"Look! The seagull is free! I'll take this net to the recycling centre. Thanks, friend!",
},
{
 id:'sort', leg:2, t:0.33, side:1, title:'Sort It Out!', icon:'♻️',
 npc:{ name:'Mia', model:'Rogue_Hooded', tint:'#9b59d0' },
 hello:"Hi! I'm Mia. My class collected rubbish for Recycling Day, but everything is mixed up! Can you help me put each thing in the right bin?",
 text:`Recycling bins in Chile often have different colours. The BLUE bin is for paper and cardboard, like newspapers and boxes. The YELLOW bin is for plastic, like bottles and yoghurt pots. The GREEN bin is for glass, like jars and glass bottles. Food waste, like banana skins, is not for these bins: you can put it in a compost bin to make soil for plants.`,
 items:[
  {k:'V', q:"Where does an empty glass jar go?", o:["In the green bin","In the blue bin","In the yellow bin","In the compost bin"], a:0, why:'"The GREEN bin is for glass, like jars and glass bottles."'},
  {k:'V', q:"Where does a cardboard box go?", o:["In the blue bin","In the green bin","In the yellow bin","In the compost bin"], a:0, why:'"The BLUE bin is for paper and cardboard."'},
  {k:'E', q:"What can you do with a banana skin?", o:["Put it in a compost bin","Put it in the yellow bin","Put it in the blue bin","Throw it in the river"], a:0, why:'"…you can put it in a compost bin to make soil for plants."'},
  {k:'Z', q:"If you recycle paper, people ___ fewer trees.", o:["cut","cuts","cutting","are cut"], a:0, why:'Zero conditional: If + present, present → "people cut".'},
 ],
 thanks:"Perfect! Everything is in the right bin. If we sort our rubbish, we can recycle more!",
},
{
 id:'car', leg:2, t:0.68, side:-1, title:'Engine Off!', icon:'🚗',
 npc:{ name:'Hugo', model:'Barbarian', tint:'#7d8a96' },
 hello:"Hi! I'm Hugo. I'm waiting for my sister. I always leave the engine on when I wait — it's more comfortable! Why are you looking at me like that?",
 text:`When a car engine is on but the car isn't moving, we say it is "idling". An idling car uses fuel and produces smoke, but it doesn't go anywhere! This smoke is bad for the air and for our lungs. In some cities, drivers must turn off the engine when they stop for more than one minute. It is also a good way to save money.`,
 items:[
  {k:'E', q:"What does \"idling\" mean?", o:["The engine is on, but the car isn't moving","The car is very old","The car is moving very fast","The driver is sleeping"], a:0, why:'"When a car engine is on but the car isn\'t moving, we say it is idling."'},
  {k:'R', q:"In some cities, drivers ___ turn off the engine when they stop for more than a minute.", o:["must","mustn't","don't have to","could"], a:0, why:'"must" = it is a rule. It is obligatory.'},
  {k:'Z', q:"If you turn off the engine, the car ___ fuel.", o:["doesn't use","didn't use","not use","don't uses"], a:0, why:'Zero conditional: If + present, present → "the car doesn\'t use fuel".'},
 ],
 thanks:"You're right! Engine off. The air smells better already, and I'm saving money!",
},
{
 id:'tap', leg:3, t:0.33, side:1, title:'The Leaking Tap', icon:'🚰',
 npc:{ name:'Elena', model:'Mage', tint:'#8e7cc3' },
 hello:"Hello, dear! I'm Elena. The tap in my garden doesn't stop dripping, and the farm is so dry this year! Can you help me?",
 text:`A tap that drips one drop every second wastes more than 10,000 litres of water in a year. That is enough water for one person to drink for fourteen years! Fixing a tap is usually easy and cheap: you only have to change a small piece called a washer. Elena's family also collects rainwater in a big barrel. They use it to water the vegetables.`,
 items:[
  {k:'E', q:"How much water does a dripping tap waste in a year?", o:["More than 10,000 litres","About 100 litres","Fourteen litres","One drop"], a:0, why:'"…wastes more than 10,000 litres of water in a year."'},
  {k:'I', q:"Why does Elena's family collect rainwater?", o:["To save tap water, because water is valuable","Because they like the sound of rain","To drink it every day","Because the barrel is pretty"], a:0, why:'They use the rainwater for the vegetables, so they don\'t waste tap water.'},
  {k:'A', q:"Elena's tap is dripping. She ___ it as soon as possible.", o:["should fix","should to fix","should fixes","shoulds fix"], a:0, why:'should + verb (without "to", without -s).'},
 ],
 thanks:"No more drips! Thank you, dear. Every drop counts, as Pedro says.",
},
{
 id:'bees', leg:3, t:0.68, side:-1, title:'Flowers for the Bees', icon:'🐝',
 npc:{ name:'Nico', model:'Ranger', tint:'#f0b400' },
 collect:{ n:4, what:'flowers planted', icon:'🌼', kind:'flower' },
 hello:"Bzzz! I'm Nico, the beekeeper. My bees can't find any flowers here, so they're hungry. I prepared four places with soil. Can you plant flowers there?",
 ready:"Beautiful flowers! My bees are already flying to them. Now, read why bees are so important.",
 text:`Bees are very small, but they have a very big job. When they fly from flower to flower, they carry pollen. This helps plants make fruit and vegetables, like apples, tomatoes and avocados. But bees are in danger. Some chemicals that farmers use kill them, and there are fewer wild flowers every year. If there are no bees, we don't have many of our favourite foods.`,
 items:[
  {k:'E', q:"Why are bees important?", o:["They carry pollen, so plants can make fruit","They make the flowers grow taller","They eat the bad insects","They clean the air"], a:0, why:'"…they carry pollen. This helps plants make fruit and vegetables."'},
  {k:'Z', q:"If there are no flowers, bees ___ food.", o:["don't find","didn't found","not find","doesn't find"], a:0, why:'Zero conditional: If + present, present → "bees don\'t find food".'},
  {k:'A', q:"What could you do to help bees?", o:["You could plant wild flowers.","You could use more chemicals.","You could cut all the flowers.","You could kill the insects."], a:0, why:'Wild flowers give bees food.'},
 ],
 thanks:"Bzzz! Thank you! Happy bees, happy farm!",
},
{
 id:'lights', leg:4, t:0.33, side:1, title:'Lights On, Nobody Home', icon:'💡',
 npc:{ name:'Sofía', model:'Rogue', tint:'#1fb5a8' },
 hello:"Hi! I'm Sofía. My neighbours went on holiday for a week… and they left all the lights on! I have their key. Can you help me save some energy?",
 text:`In Chile, part of our electricity still comes from coal and gas. When we burn them, they produce CO2, a gas that makes the planet warmer. So when we save electricity, we also help the planet. Simple things make a difference: turn off the lights when you leave a room, unplug chargers, and use LED light bulbs. They use 80% less energy than old bulbs.`,
 items:[
  {k:'I', q:"Why does saving electricity help the planet?", o:["We burn less coal and gas, so there is less CO2","Electricity is very expensive","The lights are too bright","Coal is good for the planet"], a:0, why:'Coal and gas produce CO2 → less electricity = less CO2.'},
  {k:'R', q:"In our school, the last person in the room ___ turn off the lights. It's a rule.", o:["has to","have to","doesn't have to","mustn't"], a:0, why:'"has to" (he / she / the person) = it is obligatory.'},
  {k:'Z', q:"If you use LED bulbs, you ___ less energy.", o:["use","used","uses","are use"], a:0, why:'Zero conditional: If + present, present → "you use less energy".'},
 ],
 thanks:"All off! The house is dark and quiet now. My neighbours will be happy — and the planet, too!",
},
{
 id:'bike', leg:4, t:0.68, side:-1, title:'The Broken Bike', icon:'🚲',
 npc:{ name:'Ana', model:'Knight', tint:'#e2408f' },
 collect:{ n:3, what:'bike parts', icon:'🔧', kind:'part' },
 hello:"Hi, I'm Ana! I ride my bike to school every day, but I fell and three parts of my bike flew away! Can you find the wheel, the chain and the bell?",
 ready:"You found everything! My bike is ready. Let me tell you why I love it.",
 text:`Ana lives three kilometres from her school. Her dad wanted to take her by car, but Ana prefers her bike. "Bikes don't make smoke, they don't need petrol, and they make you strong," she says. In her city there is a new bike lane, so it is safe. Ana thinks her school should have more bike parking, because now there are only ten places for four hundred students.`,
 items:[
  {k:'I', q:"Why does Ana prefer her bike?", o:["It's clean, cheap and healthy","It's faster than a car","Her dad doesn't have a car","She doesn't like her school"], a:0, why:'No smoke (clean), no petrol (cheap), it makes you strong (healthy).'},
  {k:'A', q:"Ana thinks her school ___ more bike parking.", o:["should have","should has","should to have","shoulds have"], a:0, why:'should + verb (base form).'},
  {k:'Z', q:"If you ride a bike, you ___ any smoke.", o:["don't make","didn't make","doesn't make","not make"], a:0, why:'Zero conditional: If + present, present → "you don\'t make".'},
 ],
 thanks:"See you at school! Remember: if you cycle, you breathe cleaner air!",
},
];

export const SKILLS = {E:'Reading — explicit', I:'Reading — implicit', A:'Modals — advice (should / could)', R:'Modals — rules (must / have to)', Z:'Zero conditional', V:'Green vocabulary'};
