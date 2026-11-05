// Trend City: The Hype Files — 3° medio, Unit 4 "What impact do trends have?"
// Contenidos del juego. Para editar una pregunta, cambia el texto entre comillas.
// Pregunta de alternativas: { k, q, o:[opciones], a: índice de la correcta (0 = primera), why: explicación }
// Pregunta para escribir:   { k, t:1, q, a:['respuesta', 'otra respuesta aceptada'], why }
// k = habilidad: E lectura (información explícita), I lectura (inferencia), V vocabulario en contexto,
//                L language in use, W formación de palabras (word formation)

export const SKILLS = { E: 'Reading: key details', I: 'Reading: inference', V: 'Vocabulary in context', L: 'Language in use', W: 'Word formation' };

// ---------------- MAIN MISSIONS (one per district) ----------------
export const CH = [
  {
    id: 'hype', name: 'Hype Square', place: 'Downtown', color: '#ff3d8b', icon: '📱',
    npc: { name: 'Sofía', model: 'e' },
    hello: `Hi! I'm Sofía, I write for <b>The Critical Eye</b> too. Look around: everybody is staring at those giant screens. HYPE tells them what to wear, what to watch, what to like… and they just obey. Before we can stop HYPE, we need to understand <b>why we follow trends</b>. I found this article. Read it carefully!`,
    title: 'Why Do We Follow Trends?',
    text: `Think about the last time you bought something because "everyone" had it — a pair of trainers, a phone case, or a song you played a hundred times. You are not alone. Trends are new styles, ideas or behaviours that become popular very quickly and then, often, disappear just as quickly. They have always existed, but today they travel faster than ever. A dance that starts in a bedroom in Seoul on Monday can be copied by teenagers in Santiago by Wednesday.

Psychologists say that following trends is part of being human. We are social animals, and for most of history being accepted by the group helped people to survive. That is why we often look at what others are doing before we decide what to do ourselves. This is called "social proof": if many people like something, we think it must be good. When a video has millions of views, we are more likely to watch it, even if we know nothing about it.

Another powerful feeling is FOMO, the "fear of missing out". When our friends are talking about a new series, a viral challenge or a concert, we don't want to be the only person who doesn't understand the joke. Many teenagers admit that they have bought things they didn't really need just because they didn't want to feel left out.

Trends also help us to build our identity. Adolescence is a time when young people try different styles to discover who they are. Wearing a certain brand, listening to a type of music or using particular slang can be a way of saying "this is my group". In this sense, trends are not always negative. They can bring people together, inspire creativity and give us new ideas. Many artists, designers and musicians started by experimenting with a trend and then giving it their own personal touch.

However, trends have a darker side. Because they change so quickly, they can make us feel that what we have is never enough. Last month's jacket suddenly looks "old", and we feel pressure to buy again. Companies know this very well, and they spend huge amounts of money on advertising and influencers so that we keep wanting more. Some trends can even be dangerous, like online challenges that encourage people to do risky things for a few seconds of fame.

So, should we stop following trends? Not necessarily. Experts suggest asking ourselves a few simple questions before we join one: Do I really like this, or do I only like it because others do? Will I still use it in six months? Who benefits if I follow this trend? The answers can help us to enjoy the fun side of trends without losing our own personality — or our money.`,
    reading: [
      { k: 'E', q: 'According to the text, what makes today\'s trends different from trends in the past?', o: ['They spread much faster than before.', 'They are more expensive than before.', 'They only affect teenagers.', 'They last much longer than before.'], a: 0, why: 'Paragraph 1: "They have always existed, but today they travel faster than ever."' },
      { k: 'I', q: 'Why does the writer mention a dance that starts "in a bedroom in Seoul"?', o: ['To show how quickly a trend can travel around the world.', 'To recommend a popular Korean dance.', 'To explain why teenagers dance at home.', 'To compare Chile and Korea.'], a: 0, why: 'The example shows that a trend can go from Korea to Chile in only two days.' },
      { k: 'E', q: 'Why, according to psychologists, do people tend to copy the group?', o: ['Because in the past, being accepted by the group helped people to survive.', 'Because copying others is cheaper.', 'Because people are not able to make decisions.', 'Because advertising tells them to.'], a: 0, why: 'Paragraph 2: "being accepted by the group helped people to survive."' },
      { k: 'V', q: 'In paragraph 2, <b>"social proof"</b> means…', o: ['thinking something is good because many people like it.', 'showing photos to prove where you were.', 'a test that checks how social you are.', 'a document that proves your identity.'], a: 0, why: '"If many people like something, we think it must be good."' },
      { k: 'E', q: 'Which POSITIVE effect of trends does the writer mention?', o: ['They can inspire creativity.', 'They help us to save money.', 'They make us sleep better.', 'They stop advertising.'], a: 0, why: 'Paragraph 4: "They can bring people together, inspire creativity and give us new ideas."' },
      { k: 'I', q: '"Last month\'s jacket suddenly looks <i>old</i>." What does the writer suggest with this sentence?', o: ['The jacket is the same; trends change how we see it.', 'Jackets become damaged very quickly.', 'People should buy a new jacket every month.', 'Old clothes are always better quality.'], a: 0, why: 'The jacket has not changed — the pressure of new trends makes it "look" old.' },
      { k: 'V', q: 'In paragraph 5, the word <b>"risky"</b> is closest in meaning to…', o: ['dangerous', 'expensive', 'funny', 'famous'], a: 0, why: 'Risky = possibly dangerous.' },
      { k: 'I', q: 'What is the writer\'s main purpose in this article?', o: ['To help readers think carefully before they follow a trend.', 'To convince readers to stop following trends completely.', 'To advertise new products for teenagers.', 'To explain how to become an influencer.'], a: 0, why: '"Should we stop following trends? Not necessarily." The writer gives questions to think critically.' },
    ],
    after: `Great work! But HYPE has hidden <b>3 evidence files</b> around Hype Square. Follow the pink light beams, open the files and prove you know the language of trends!`,
    bye: `You did it! Here is the first <b>Truth File</b>. Now people know why they follow trends. Next stop: the <b>Pixel District</b>, where social media never sleeps. 📱`,
    tip: `<b>Present perfect vs. past simple</b><br>• Past simple = a finished time: <i>I <u>bought</u> it <u>last week</u>.</i><br>• Present perfect = until now / no time given: <i>I <u>have listened</u> to it fifty times <u>since Monday</u>.</i><br>• <i>used to</i> = a past habit that is not true now: <i>People <u>used to</u> buy CDs.</i>`,
    vocab: [
      { k: 'V', q: 'The new trainers became so popular that they ______ out in just two hours.', o: ['sold', 'ran', 'went', 'gave'], a: 0, why: '"Sell out" = every item is sold.' },
      { k: 'V', q: 'Many teenagers feel ______ pressure to dress like their friends.', o: ['peer', 'pair', 'mate', 'crowd'], a: 0, why: '"Peer pressure" = pressure from people of your own age or group.' },
      { k: 'V', q: 'Her dance video went ______ and got ten million views in a week.', o: ['viral', 'popular', 'famous', 'public'], a: 0, why: '"Go viral" is a fixed expression.' },
      { k: 'V', q: 'Brands pay influencers to ______ their products to their followers.', o: ['promote', 'remind', 'pretend', 'prevent'], a: 0, why: 'Promote = advertise, make something popular.' },
      { k: 'V', q: 'Oversized jackets are really ______ fashion this season.', o: ['in', 'on', 'at', 'by'], a: 0, why: '"In fashion" = fashionable now.' },
    ],
    liu: [
      { k: 'L', t: 1, q: 'Write ONE word: Trends have existed ______ thousands of years.', a: ['for'], why: '"For" + a period of time (for thousands of years).' },
      { k: 'L', t: 1, q: 'Write ONE word: People ______ to buy music on CDs, but now they stream it.', a: ['used'], why: '"Used to" = a past habit that is not true now.' },
      { k: 'L', q: 'I ______ this song fifty times since Monday!', o: ['have listened to', 'listened to', 'was listening to', 'listen to'], a: 0, why: '"Since Monday" = until now → present perfect.' },
      { k: 'L', t: 1, q: 'Complete with 2–5 words, using <b>BEEN</b>:<div class="mini">I started following this influencer two years ago.<br>I ______ this influencer for two years. (BEEN)</div>', a: ['have been following', "'ve been following", 'have been following her', 'have been following him'], why: 'Present perfect continuous: I <b>have been following</b> … for two years.' },
      { k: 'L', q: 'When ______ you first hear about this trend?', o: ['did', 'have', 'were', 'has'], a: 0, why: '"When" asks about a finished past time → past simple (did you hear).' },
    ],
    wf: [
      { k: 'W', t: 1, q: 'Teenagers are often very ______ to what their friends think. (SENSE)', a: ['sensitive'], why: 'Adjective: sensitive (to).' },
      { k: 'W', t: 1, q: 'The ______ of the new phone was huge: everybody wanted one. (POPULAR)', a: ['popularity'], why: 'Noun after "the … of": popularity.' },
      { k: 'W', t: 1, q: 'It is ______ to copy dangerous challenges just for likes. (RESPONSIBLE)', a: ['irresponsible'], why: 'Negative adjective: irresponsible.' },
      { k: 'W', t: 1, q: 'Many young people feel ______ when they can\'t check their phones. (ANXIETY)', a: ['anxious'], why: 'Adjective after "feel": anxious.' },
      { k: 'W', t: 1, q: 'She has a very ______ style — nobody dresses like her. (ORIGIN)', a: ['original'], why: 'Adjective before a noun: original.' },
    ],
  },
  {
    id: 'pixel', name: 'Pixel District', place: 'Social media', color: '#7b5cff', icon: '💬',
    npc: { name: 'Mateo', model: 'c' },
    hello: `Hey, I'm Mateo. I make videos about video games… or I did, before HYPE took over my feed. Now I can't stop scrolling! 😵 Social media gave me friends and a community, but it also keeps me awake all night. Read this and help me understand <b>how social media helps us and how it hurts us</b>.`,
    title: 'Connected… But at What Cost?',
    text: `Imagine a day without social media. No messages from friends, no funny videos, no photos of your cousin's new puppy. For many teenagers, this sounds almost impossible. In Chile, as in many countries, most young people check their phones dozens of times a day, and platforms like Instagram, TikTok and WhatsApp have become part of everyday life. But is this a good thing?

There is no doubt that social media can help us. It allows us to stay in touch with friends and family who live far away. It gives a voice to people who were not heard before: young activists have used it to organise campaigns about the environment, education and human rights. It is also a huge classroom. You can learn to play the guitar, cook a new recipe or practise English with videos made by people from all over the world. For small businesses, such as a family bakery or a teenager who sells handmade jewellery, a good Instagram account can mean many more customers.

However, the same tools can also hurt us. One of the biggest problems is comparison. On social media, people usually show only the best moments of their lives: perfect holidays, perfect bodies, perfect grades. When we compare our normal, messy lives with these edited images, we can start to feel that we are not good enough. Many studies have connected heavy use of social media with anxiety, low self-esteem and poor sleep, especially among teenagers. In 2023, the US Surgeon General — the country's top doctor — warned that teenagers who spend more than three hours a day on social media face double the risk of mental health problems such as depression and anxiety.

Another problem is that social media apps are designed to keep us scrolling. Algorithms learn what we like and show us more and more of it. Features like endless feeds, notifications and "likes" work in a similar way to a slot machine: we never know when the next exciting thing will appear, so we keep looking. That is why it is so easy to open an app "just for a minute" and close it an hour later.

Finally, there are risks to our safety and privacy. Cyberbullying can follow a person home and continue twenty-four hours a day. Fake news spreads quickly because shocking stories get more clicks than true but boring ones. And every photo or comment we post leaves a "digital footprint" that can be very difficult to delete.

The answer is not to throw our phones into the sea. Social media is a tool, and like any tool it can be used well or badly. Turning off notifications, setting time limits, following accounts that make us feel good and talking to someone we trust when something online upsets us are small steps that can make a big difference. The goal is simple: we should control our phones, not the other way round.`,
    reading: [
      { k: 'E', q: 'According to paragraph 2, how can social media help small businesses?', o: ['It can help them to find more customers.', 'It gives them money from the government.', 'It makes their products cheaper.', 'It teaches them to bake.'], a: 0, why: '"A good Instagram account can mean many more customers."' },
      { k: 'E', q: 'What did the US Surgeon General warn about in 2023?', o: ['Teens who use social media more than 3 hours a day face double the risk of mental health problems.', 'Teens should not use social media at all.', 'Social media makes teenagers better students.', 'Phones damage teenagers\' eyes.'], a: 0, why: 'Paragraph 3: "more than three hours a day … double the risk".' },
      { k: 'I', q: 'Why can posts on social media make people feel "not good enough"?', o: ['Because people usually post only edited, perfect moments.', 'Because most posts are written in English.', 'Because people never post photos.', 'Because influencers are rude.'], a: 0, why: 'We compare our real "messy lives" with "edited images".' },
      { k: 'I', q: 'Why does the writer compare social media apps to a slot machine?', o: ['Because we never know when something exciting will appear, so we keep looking.', 'Because you can win money on them.', 'Because they are only for adults.', 'Because they make a lot of noise.'], a: 0, why: '"We never know when the next exciting thing will appear, so we keep looking."' },
      { k: 'V', q: 'A <b>"digital footprint"</b> is…', o: ['the record of what you do online, which is hard to delete.', 'a photo of your feet.', 'an app that counts your steps.', 'a password for your account.'], a: 0, why: '"Every photo or comment we post leaves a digital footprint that can be very difficult to delete."' },
      { k: 'E', q: 'According to the text, why does fake news spread quickly?', o: ['Shocking stories get more clicks than true but boring ones.', 'Journalists write too many stories.', 'Algorithms delete true stories.', 'People never read the news.'], a: 0, why: 'Paragraph 5 gives this reason.' },
      { k: 'E', q: 'Which of these is NOT one of the writer\'s suggestions?', o: ['Delete all your social media accounts.', 'Turn off notifications.', 'Set time limits.', 'Talk to someone you trust.'], a: 0, why: '"The answer is not to throw our phones into the sea." The writer does not suggest deleting everything.' },
      { k: 'I', q: '"We should control our phones, not the other way round." This means…', o: ['we should not let our phones control us.', 'we should buy phones with more control options.', 'phones should control our time.', 'we should turn our phones upside down.'], a: 0, why: '"The other way round" = the opposite: phones controlling us.' },
    ],
    after: `That's so true… I need to change some habits. HYPE hid <b>3 evidence files</b> in the Pixel District. Find the purple light beams and show what you know!`,
    bye: `Here is the second <b>Truth File</b>! I've turned off my notifications already. 😎 Now, the <b>Mega Mall</b>… HYPE's favourite place to make people buy, buy, buy.`,
    tip: `<b>Conditionals</b><br>• 1st (real future): <i>If I <u>see</u> bullying, I <u>will</u> report it.</i><br>• 2nd (imaginary): <i>If you <u>spent</u> less time online, you <u>would</u> sleep better.</i><br>• <i>unless</i> = if … not: <i>You can't join <u>unless</u> you are invited.</i><br>• <i>I wish</i> + past perfect = regret about the past: <i>I wish I <u>hadn't posted</u> that.</i>`,
    vocab: [
      { k: 'V', q: 'Turn off your ______ when you study, so your phone doesn\'t distract you.', o: ['notifications', 'announcements', 'advertisements', 'invitations'], a: 0, why: 'Notifications = the alerts that apps send to your phone.' },
      { k: 'V', q: 'He spent the whole night ______ through videos instead of sleeping.', o: ['scrolling', 'sliding', 'rolling', 'running'], a: 0, why: '"Scroll through" = move up/down a screen.' },
      { k: 'V', q: 'Cyberbullies sometimes hide behind ______ accounts.', o: ['fake', 'false', 'wrong', 'lying'], a: 0, why: 'Collocation: a fake account.' },
      { k: 'V', q: 'Posting your home address online can put your ______ at risk.', o: ['privacy', 'private', 'secret', 'intimacy'], a: 0, why: 'Noun: privacy (your personal information).' },
      { k: 'V', q: 'She ______ thousands of followers after her cooking videos went viral.', o: ['gained', 'won', 'earned', 'raised'], a: 0, why: 'Collocation: gain followers.' },
    ],
    liu: [
      { k: 'L', q: 'If you ______ less time on your phone, you would sleep better.', o: ['spent', 'spend', 'will spend', 'would spend'], a: 0, why: 'Second conditional: If + past simple, would + verb.' },
      { k: 'L', q: 'If I see someone being bullied online, I ______ report it.', o: ['will', 'would', 'had', 'am'], a: 0, why: 'First conditional: If + present, will + verb.' },
      { k: 'L', t: 1, q: 'Write ONE word: ______ you post something online, it can stay there forever.', a: ['once', 'if', 'when'], why: '"Once / If / When you post something…"' },
      { k: 'L', t: 1, q: 'Complete with 2–5 words, using <b>UNLESS</b>:<div class="mini">You can only join the group chat if you are invited.<br>You can\'t join the group chat ______ invited. (UNLESS)</div>', a: ['unless you are', "unless you're", 'unless you get', 'unless you have been'], why: 'Unless = if … not: <b>unless you are</b> invited.' },
      { k: 'L', q: 'I wish I ______ so much time on social media yesterday.', o: ["hadn't spent", "didn't spend", "haven't spent", "wouldn't spend"], a: 0, why: 'Regret about the past: wish + past perfect.' },
    ],
    wf: [
      { k: 'W', t: 1, q: 'Social media can be a great ______ tool for students. (EDUCATE)', a: ['educational'], why: 'Adjective: educational.' },
      { k: 'W', t: 1, q: 'Always check if the information is ______ before you share it. (RELY)', a: ['reliable'], why: 'Adjective: reliable (you can trust it).' },
      { k: 'W', t: 1, q: 'Comparing yourself with influencers can lower your self-______. (CONFIDENT)', a: ['confidence'], why: 'Noun: self-confidence.' },
      { k: 'W', t: 1, q: 'One big ______ of social media is how fast fake news spreads. (ADVANTAGE)', a: ['disadvantage'], why: 'It is a negative point → disadvantage.' },
      { k: 'W', t: 1, q: 'A lot of photos online are ______ edited to look better. (HEAVY)', a: ['heavily'], why: 'Adverb before a participle: heavily edited.' },
    ],
  },
  {
    id: 'mall', name: 'Mega Mall', place: 'Shopping', color: '#ff8a1f', icon: '🛍️',
    npc: { name: 'Valentina', model: 'n' },
    hello: `Welcome to the Mega Mall! I'm Valentina, I work here. Every week HYPE announces a new "must-have" and people buy bags of clothes they wear only once. Last week it was neon socks, this week it's giant bags… 😩 Read this and discover <b>the impact of trends on our society</b>.`,
    title: 'From Microtrends to Mountains of Waste',
    text: `Twenty years ago, most clothing shops changed their collections two or four times a year: spring, summer, autumn and winter. Today, some fast fashion companies release new designs every week, and some online stores add thousands of new items in a single day. Welcome to the age of microtrends.

A microtrend is a style that becomes extremely popular for a very short time — sometimes only a few weeks — usually after it appears in viral videos. One week everybody wants a particular kind of bag; the next week the algorithm shows something new and the bag is forgotten. Because these trends move so fast, the clothes connected to them are often made quickly and cheaply, and they are not designed to last.

This system has changed the way society consumes. According to the Ellen MacArthur Foundation, clothing production roughly doubled between 2000 and 2014, while the number of times a piece of clothing is worn before it is thrown away fell by about 36 percent. In other words, we are buying more and using less. Many people now see clothes as disposable, like a plastic cup that you use once and then throw away.

The environment pays a high price. Producing a single cotton T-shirt can require around 2,700 litres of water — what one person drinks in about two and a half years. Many cheap garments are made of polyester, a type of plastic made from oil. When these clothes are washed, they release tiny plastic fibres called microplastics, which end up in rivers and oceans. The United Nations Environment Programme estimates that the fashion industry is responsible for between 2 and 8 percent of the world's greenhouse gas emissions.

Trends also affect us socially. When clothes are so cheap, it is easy to forget that real people made them, often in difficult conditions. Constant new trends also increase the pressure to always look "updated", which can be expensive for families and stressful for young people.

Fortunately, society is also starting to react. Second-hand shopping, which was once seen as something only for people with little money, has become popular, especially among young people. In Chile, ferias and "ropa americana" shops are full of teenagers looking for unique clothes. Clothing swaps, repair workshops and apps for selling used clothes are growing. Some designers now talk about "slow fashion": buying fewer, better-quality clothes and keeping them for longer.

Trends will not disappear, and they don't need to. But if society learns to enjoy fashion without treating clothes as rubbish, our planet — and our wallets — will thank us.`,
    reading: [
      { k: 'E', q: 'How often do some fast fashion companies release new designs today?', o: ['Every week.', 'Twice a year.', 'Four times a year.', 'Once a year.'], a: 0, why: 'Paragraph 1: "some fast fashion companies release new designs every week".' },
      { k: 'V', q: 'A <b>microtrend</b> is…', o: ['a style that is extremely popular for a very short time.', 'a very small piece of clothing.', 'a trend that only a few people follow.', 'a type of microscope.'], a: 0, why: 'Paragraph 2 defines it: popular "for a very short time".' },
      { k: 'I', q: 'Why are clothes connected to microtrends often of low quality?', o: ['Because the trend will end soon, so they are made quickly and cheaply.', 'Because designers don\'t like them.', 'Because they are made of cotton.', 'Because people wear them too often.'], a: 0, why: '"Because these trends move so fast … made quickly and cheaply, and not designed to last."' },
      { k: 'E', q: 'According to the Ellen MacArthur Foundation, what happened between 2000 and 2014?', o: ['Production roughly doubled, but clothes were worn fewer times.', 'People bought fewer clothes.', 'Clothes became more expensive.', 'Production fell by 36 percent.'], a: 0, why: '"Production roughly doubled … the number of times a piece of clothing is worn … fell by about 36 percent."' },
      { k: 'V', q: 'In paragraph 3, <b>"disposable"</b> means…', o: ['made to be thrown away after a short time.', 'easy to find in shops.', 'very expensive.', 'made by hand.'], a: 0, why: '"…like a plastic cup that you use once and then throw away."' },
      { k: 'E', q: 'What happens when polyester clothes are washed?', o: ['They release microplastics that reach rivers and oceans.', 'They become cotton.', 'They use 2,700 litres of water.', 'They change colour.'], a: 0, why: 'Paragraph 4: "they release tiny plastic fibres called microplastics".' },
      { k: 'I', q: 'Why does the writer say second-hand shopping "was once seen as something only for people with little money"?', o: ['To show that attitudes towards second-hand clothes have changed.', 'To say that second-hand clothes are still only for poor people.', 'To complain about the prices in ferias.', 'To explain why teenagers don\'t like ferias.'], a: 0, why: 'Now it "has become popular, especially among young people" — attitudes changed.' },
      { k: 'I', q: 'What is the writer\'s opinion in the last paragraph?', o: ['Trends can continue, but we must stop treating clothes as rubbish.', 'All trends should be banned.', 'Fashion is not important for society.', 'Only expensive clothes are good.'], a: 0, why: '"Trends will not disappear, and they don\'t need to. But…"' },
    ],
    after: `Wow, I didn't know a T-shirt needed so much water! HYPE has hidden <b>3 evidence files</b> around the mall. Look for the orange light beams!`,
    bye: `Third <b>Truth File</b>! 🛍️ I'm organising a clothing swap in the mall next week. But wait… who actually <i>makes</i> all these clothes? Go to <b>Factory Row</b> and find Don Jorge.`,
    tip: `<b>The passive</b>: be + past participle<br>• Present: <i>T-shirts <u>are produced</u> every day.</i><br>• Past: <i>This dress <u>was worn</u> only twice.</i><br>• Use it when the action is more important than who does it. Add <i>by</i> for the person: <i>…<u>by</u> some brands.</i>`,
    vocab: [
      { k: 'V', q: 'Many cheap clothes are made from ______ materials like polyester.', o: ['synthetic', 'imitation', 'false', 'invented'], a: 0, why: 'Synthetic = made artificially, not natural (e.g. polyester).' },
      { k: 'V', q: 'Fast fashion clothes are often treated as ______, like a plastic cup.', o: ['disposable', 'available', 'reusable', 'reliable'], a: 0, why: 'Disposable = used once and thrown away.' },
      { k: 'V', q: 'Buying fewer, better clothes helps to ______ waste.', o: ['reduce', 'fall', 'drop off', 'lower down'], a: 0, why: 'Reduce + object (reduce waste). "Fall" has no object.' },
      { k: 'V', q: 'Ferias sell ______ clothes at very low prices.', o: ['second-hand', 'second-time', 'used-up', 'old-hand'], a: 0, why: 'Second-hand = used before by another person.' },
      { k: 'V', q: 'Consumers can ______ a difference by changing their habits.', o: ['make', 'do', 'take', 'get'], a: 0, why: 'Collocation: make a difference.' },
    ],
    liu: [
      { k: 'L', q: 'Millions of T-shirts ______ every year.', o: ['are produced', 'produce', 'are producing', 'have produce'], a: 0, why: 'Passive present: are + produced.' },
      { k: 'L', t: 1, q: 'Write ONE word: The jeans I\'m wearing were made ______ Bangladesh.', a: ['in'], why: 'Made in + country.' },
      { k: 'L', q: 'This dress ______ only twice before it was thrown away.', o: ['was worn', 'wore', 'has worn', 'is wearing'], a: 0, why: 'Passive past: was + worn.' },
      { k: 'L', t: 1, q: 'Complete with 2–5 words, using <b>ARE</b>:<div class="mini">People throw away tonnes of clothes every day.<br>Tonnes of clothes ______ every day. (ARE)</div>', a: ['are thrown away', 'are thrown out', 'are thrown'], why: 'Passive: tonnes of clothes <b>are thrown away</b>.' },
      { k: 'L', q: 'New designs ______ online every week by some brands.', o: ['are released', 'release', 'are releasing', 'released'], a: 0, why: 'Passive with "by": are released by some brands.' },
    ],
    wf: [
      { k: 'W', t: 1, q: 'Fast fashion causes serious ______ damage. (ENVIRONMENT)', a: ['environmental'], why: 'Adjective before a noun: environmental damage.' },
      { k: 'W', t: 1, q: 'Polyester is not ______, so it stays in nature for many years. (BIODEGRADE)', a: ['biodegradable'], why: 'Adjective: biodegradable.' },
      { k: 'W', t: 1, q: 'We need to change our ______ habits. (CONSUME)', a: ['consumption', 'consumer', 'consuming'], why: 'Consumption habits / consumer habits.' },
      { k: 'W', t: 1, q: 'These cheap shirts are ______ made and fall apart quickly. (POOR)', a: ['poorly'], why: 'Adverb: poorly made.' },
      { k: 'W', t: 1, q: 'Second-hand shopping has become very ______ among teenagers. (FASHION)', a: ['fashionable'], why: 'Adjective: fashionable.' },
    ],
  },
  {
    id: 'factory', name: 'Factory Row', place: 'Labour laws', color: '#2fb6a3', icon: '🧵',
    npc: { name: 'Don Jorge', model: 'a' },
    hello: `Buenas, young reporter. I'm Jorge. I've worked in textile factories for thirty years and I'm a union leader now. HYPE wants clothes faster and cheaper every day… and someone always pays for that. Read this article about <b>labour laws and fast fashion</b>. Workers need people who know their rights.`,
    title: 'Who Made My Clothes?',
    text: `On 24 April 2013, an eight-storey building called Rana Plaza collapsed near Dhaka, the capital of Bangladesh. The building contained several clothing factories that made garments for famous international brands. The day before, workers had seen large cracks in the walls, but managers told them to go back to work. More than 1,100 people died, most of them young women. It was one of the worst industrial disasters in history, and it made millions of people ask a simple question: who made my clothes?

To produce cheap clothes quickly, many brands use factories in countries where wages are very low and labour laws are weak or not respected. Investigations have found garment workers who work twelve hours a day or more, who are not paid for overtime and who can lose their jobs if they complain or join a union. In some places, children are also employed. These are examples of labour exploitation.

Labour laws exist to protect workers from these situations. In Chile, the main set of rules is the Labour Code (Código del Trabajo). It says, for example, that every employer must give the worker a written contract, that workers have the right to a minimum wage and to paid holidays, and that they can form or join a union. A government agency, the Dirección del Trabajo, inspects workplaces and can fine companies that break the rules.

Chilean labour laws have also changed in recent years. The "40 Hours Law" is reducing the maximum working week step by step: from 45 hours to 44 in 2024, to 42 in April 2026, and finally to 40 hours in 2028. Overtime is only allowed in limited cases, and it must be paid at a higher rate. Another law, the Ley Karin (2024), requires companies to prevent and investigate harassment and violence at work. Teenagers are protected too: young people aged 15 to 17 can only work with their parents' permission, and during the school year they cannot work more than 30 hours a week.

Of course, a law is only useful if people know about it and if it is respected. That is why unions, journalists and organisations like Fashion Revolution are so important. Every year, around the anniversary of Rana Plaza, Fashion Revolution invites consumers to ask brands #WhoMadeMyClothes and to demand more transparency about their factories.

As consumers, we also have power. We can find out where and how our clothes are made, support brands that pay fair wages, and buy less but better. Next time you see a T-shirt that costs less than a sandwich, remember: someone, somewhere, paid the real price.`,
    reading: [
      { k: 'E', q: 'What happened the day before Rana Plaza collapsed?', o: ['Workers saw cracks in the walls, but managers told them to go back to work.', 'The factories closed for a holiday.', 'The government inspected the building.', 'Workers organised a strike.'], a: 0, why: 'Paragraph 1: "workers had seen large cracks… managers told them to go back to work."' },
      { k: 'V', q: 'In paragraph 2, <b>"exploitation"</b> means…', o: ['treating workers unfairly to get more profit.', 'exploring new countries.', 'paying workers more money.', 'teaching workers new skills.'], a: 0, why: 'Low wages, no overtime pay, losing your job for complaining = exploitation.' },
      { k: 'E', q: 'Which of these does the Chilean Labour Code require?', o: ['Every employer must give the worker a written contract.', 'Every worker must join a union.', 'Workers must work overtime.', 'Companies must sell cheap clothes.'], a: 0, why: 'Paragraph 3: "every employer must give the worker a written contract".' },
      { k: 'E', q: 'Since April 2026, what is the maximum ordinary working week in Chile?', o: ['42 hours', '45 hours', '44 hours', '40 hours'], a: 0, why: '"…to 42 in April 2026, and finally to 40 hours in 2028."' },
      { k: 'I', q: 'Why does the writer say "a law is only useful if people know about it and if it is respected"?', o: ['Because laws alone are not enough; people must know them and companies must follow them.', 'Because most laws are useless.', 'Because only lawyers can understand laws.', 'Because unions write the laws.'], a: 0, why: 'That is why unions, journalists and organisations "are so important".' },
      { k: 'E', q: 'What does Fashion Revolution ask consumers to do?', o: ['Ask brands #WhoMadeMyClothes and demand transparency.', 'Stop buying clothes forever.', 'Visit factories in Bangladesh.', 'Work in clothing factories.'], a: 0, why: 'Paragraph 5.' },
      { k: 'I', q: 'Camila is 16. She wants a part-time job during the school year. According to the text…', o: ['she needs her parents\' permission and can\'t work more than 30 hours a week.', 'she can\'t work until she is 18.', 'she can work 42 hours a week like adults.', 'she doesn\'t need a contract.'], a: 0, why: '15–17: parents\' permission and max. 30 hours a week during the school year.' },
      { k: 'I', q: '"Someone, somewhere, paid the real price." What does the writer mean?', o: ['Very cheap clothes often mean that workers suffered to make them.', 'The shop paid for your T-shirt.', 'The T-shirt was really expensive.', 'Sandwiches are too expensive.'], a: 0, why: 'If you pay very little, the "real price" is paid by workers (low wages, danger).' },
    ],
    after: `Exactly. Knowing your rights is the first step to defending them. HYPE's managers have hidden <b>3 evidence files</b> around the factory. Find the green light beams!`,
    bye: `Here is the fourth <b>Truth File</b>, compañero. 🧵 But the story doesn't end in the shop… Follow the highway east, to the <b>Atacama Desert</b>. Ask for Camila. You'll see where fast fashion ends.`,
    tip: `<b>Obligation & permission</b><br>• <i>must / have to</i> = it is necessary (a rule).<br>• <i>don't have to</i> = it is NOT necessary (you can choose).<br>• <i>mustn't / aren't allowed to</i> = it is prohibited.<br><b>Relative pronouns</b>: <i>who</i> (people), <i>which/that</i> (things), <i>where</i> (places), <i>whose</i> (possession).`,
    vocab: [
      { k: 'V', q: 'Workers who stay extra hours should be paid for ______.', o: ['overtime', 'extra time', 'overwork', 'part-time'], a: 0, why: 'Overtime = hours worked after your normal working day. "Extra time" is for football!' },
      { k: 'V', q: 'Workers have the right to ______ a union.', o: ['join', 'enter', 'attend', 'belong'], a: 0, why: 'Join a union (belong TO a union).' },
      { k: 'V', q: 'The working ______ in the factory were terrible: no windows and no breaks.', o: ['conditions', 'situations', 'positions', 'occasions'], a: 0, why: 'Collocation: working conditions.' },
      { k: 'V', q: 'The company was ______ for breaking labour laws.', o: ['fined', 'paid', 'priced', 'charged up'], a: 0, why: 'Be fined = have to pay money as a punishment.' },
      { k: 'V', q: 'Every worker should sign a written ______ with the employer.', o: ['contract', 'deal', 'promise', 'treaty'], a: 0, why: 'An employment contract.' },
    ],
    liu: [
      { k: 'L', q: 'Employers ______ give workers a written contract. It\'s the law.', o: ['must', 'might', 'could', "needn't"], a: 0, why: 'Must = obligation (a rule/law).' },
      { k: 'L', q: 'Workers ______ work overtime every day; it is only allowed in limited cases.', o: ["aren't allowed to", "don't have to", "needn't", 'mustn\'t to'], a: 0, why: "Aren't allowed to = it's prohibited. (Mustn't is never followed by 'to'.)" },
      { k: 'L', t: 1, q: 'Write ONE word: Rana Plaza was a building ______ contained several clothing factories.', a: ['which', 'that'], why: 'Relative pronoun for things: which / that.' },
      { k: 'L', t: 1, q: 'Complete with 2–5 words, using <b>HAVE</b>:<div class="mini">It isn\'t necessary for teenagers to work during the holidays.<br>Teenagers ______ work during the holidays. (HAVE)</div>', a: ["don't have to", 'do not have to'], why: "Don't have to = it is not necessary." },
      { k: 'L', q: 'The workers, ______ had seen cracks in the walls, were told to go back inside.', o: ['who', 'which', 'whose', 'where'], a: 0, why: 'Who = relative pronoun for people.' },
    ],
    wf: [
      { k: 'W', t: 1, q: 'The ______ of garment workers is a global problem. (EXPLOIT)', a: ['exploitation'], why: 'Noun: exploitation.' },
      { k: 'W', t: 1, q: 'It is ______ to make young children work in factories. (LEGAL)', a: ['illegal'], why: 'Negative adjective: illegal.' },
      { k: 'W', t: 1, q: 'The managers were ______ for the disaster. (RESPONSIBILITY)', a: ['responsible'], why: 'Adjective: be responsible for.' },
      { k: 'W', t: 1, q: 'Brands should be more ______ about where their clothes are made. (TRANSPARENCY)', a: ['transparent'], why: 'Adjective: transparent.' },
      { k: 'W', t: 1, q: 'The Ley Karin protects ______ from harassment at work. (EMPLOY)', a: ['employees', 'employee'], why: 'Noun for the people who work: employees.' },
    ],
  },
  {
    id: 'atacama', name: 'Atacama Desert', place: 'Fast fashion in Chile', color: '#e0a53a', icon: '🏜️',
    npc: { name: 'Camila', model: 'f' },
    hello: `You came all the way to the desert! I'm Camila, I'm an environmental activist from Alto Hospicio. Look at those mountains… they're not rocks. They're <b>clothes</b>. Millions of them. Read this to understand <b>what fast fashion is doing to Chile</b>.`,
    title: 'The Desert Where Clothes Go to Die',
    text: `The Atacama Desert in northern Chile is the driest non-polar desert in the world. It is famous for its clear skies, its astronomical observatories and its incredible landscapes. But in recent years, photos of a very different kind have travelled around the world: huge mountains of clothes — jeans, jackets, sweaters, even ski boots — lying in the sand near the city of Alto Hospicio.

How did they get there? The story begins far away, in the shops of the United States, Europe and Asia. When clothes are not sold, or when people give away clothes they no longer want, many of them are sent to other countries as second-hand clothing. Chile is one of the biggest importers of used clothes in Latin America. Many arrive at the port of Iquique, where the free trade zone, ZOFRI, allows companies to import goods without paying the usual taxes.

Some of these clothes are sold in Chile or sent to other countries in the region. But a large part is in such bad condition, or simply so unfashionable, that nobody wants to buy it. According to reports from 2021, about 59,000 tonnes of clothing arrived in Iquique every year, and around 39,000 tonnes ended up in illegal dumps in the desert.

This creates serious problems. Most fast fashion is made of synthetic materials like polyester, which can take around 200 years to break down. In the meantime, the clothes release chemicals and microplastics into the ground and the air. Sometimes the piles are set on fire, producing toxic smoke that affects the health of the people who live nearby. The mayor of Alto Hospicio has said that his community has become "the world's backyard".

However, the desert is also a place of new ideas. Several Chilean entrepreneurs have started businesses that use this waste as a resource. For example, Ecocitex, founded by Rosario Hevia, turns old textiles into new yarn without using water or dyes, and EcoFibra makes insulation panels for houses from discarded clothes. Local organisations and artists have also used the clothing mountains to raise awareness, organising clean-ups and even a fashion show in the desert.

Many people believe that textiles should be included in Chile's Extended Producer Responsibility Law (Ley REP), which already makes companies responsible for the waste from products such as tyres and packaging. If companies had to pay for the waste their clothes create, perhaps they would produce less and design clothes that last longer.

The Atacama is thousands of kilometres away from the shops where most of these clothes were first sold. But the problem is connected to every one of us. Each time we buy a T-shirt we will only wear once, we are adding a little more to a mountain far away.`,
    reading: [
      { k: 'E', q: 'Why is ZOFRI important in this story?', o: ['Companies can import goods there without paying the usual taxes.', 'It is a factory that makes clothes.', 'It is an observatory in the desert.', 'It recycles all the clothes.'], a: 0, why: 'Paragraph 2: ZOFRI "allows companies to import goods without paying the usual taxes".' },
      { k: 'E', q: 'According to the 2021 reports, how much clothing ended up in illegal dumps every year?', o: ['About 39,000 tonnes', 'About 59,000 tonnes', 'About 200 tonnes', 'About 2,700 tonnes'], a: 0, why: '59,000 tonnes arrived; around 39,000 ended up in the desert.' },
      { k: 'I', q: 'Why does nobody want to buy a large part of the imported clothes?', o: ['They are in bad condition or out of fashion.', 'They are too expensive.', 'They are made in Chile.', 'They are new.'], a: 0, why: '"…in such bad condition, or simply so unfashionable, that nobody wants to buy it."' },
      { k: 'V', q: 'In paragraph 4, <b>"break down"</b> means…', o: ['decompose; slowly disappear into nature', 'stop working, like a car', 'start crying', 'become cheaper'], a: 0, why: 'Here, break down = decompose.' },
      { k: 'E', q: 'How do the clothing piles affect people\'s health?', o: ['When they are set on fire, they produce toxic smoke.', 'People get cold in the desert.', 'People wear dirty clothes.', 'The clothes block the roads.'], a: 0, why: 'Paragraph 4: "toxic smoke that affects the health of the people who live nearby".' },
      { k: 'I', q: 'What does the mayor mean by "the world\'s backyard"?', o: ['Other countries\' rubbish ends up in his community.', 'Alto Hospicio has beautiful gardens.', 'Tourists from all over the world visit the city.', 'The city is very big.'], a: 0, why: 'A backyard is where people put things they don\'t want — the world\'s waste goes there.' },
      { k: 'E', q: 'What does Ecocitex do?', o: ['It turns old textiles into new yarn without water or dyes.', 'It makes insulation panels.', 'It imports clothes through ZOFRI.', 'It organises fashion shows.'], a: 0, why: 'Paragraph 5. (EcoFibra makes the insulation panels.)' },
      { k: 'I', q: 'What is the main idea of the last paragraph?', o: ['Our own buying habits are connected to the problem in the desert.', 'The Atacama is too far away to matter.', 'Shops should move to the desert.', 'T-shirts should be more expensive.'], a: 0, why: '"The problem is connected to every one of us."' },
    ],
    after: `Now you see it. HYPE's trucks have hidden <b>3 evidence files</b> among the clothing mountains. Find the golden light beams — be careful, the piles are huge!`,
    bye: `This is the last <b>Truth File</b>. 🏜️ You have the whole story now: trends, social media, consumption, workers and the desert. Go back to <b>Hype Square</b>. It's time to face <b>HYPE</b>!`,
    tip: `<b>Contrast linkers</b><br>• <i>Although</i> + sentence: <i><u>Although</u> it's a desert, it's full of clothes.</i><br>• <i>Despite / In spite of</i> + noun or -ing: <i><u>Despite</u> the problem, …</i><br>• <i>However,</i> starts a new sentence: <i>It's beautiful. <u>However,</u> …</i><br><b>Passive</b>: <i>The clothes <u>are imported</u> through ZOFRI.</i>`,
    vocab: [
      { k: 'V', q: 'Thousands of tonnes of clothes are ______ illegally in the desert.', o: ['dumped', 'poured', 'thrown up', 'left over'], a: 0, why: 'Dump = leave rubbish in a place where you shouldn\'t.' },
      { k: 'V', q: 'Polyester can take 200 years to ______ down.', o: ['break', 'fall', 'turn', 'put'], a: 0, why: 'Break down = decompose.' },
      { k: 'V', q: 'The smoke from the burning clothes is ______ to local people\'s health.', o: ['harmful', 'harmless', 'careful', 'useful'], a: 0, why: 'Harmful = causes damage.' },
      { k: 'V', q: 'Ecocitex uses old clothes as a ______ to make new yarn.', o: ['resource', 'source', 'recourse', 'reserve'], a: 0, why: 'Resource = something useful you can use to make things.' },
      { k: 'V', q: 'Volunteers organised a ______ to remove rubbish from the desert.', o: ['clean-up', 'wash-up', 'make-up', 'pick-up'], a: 0, why: 'A clean-up = an event to clean a place.' },
    ],
    liu: [
      { k: 'L', q: '______ the Atacama is the driest desert in the world, it is full of clothes made from plastic.', o: ['Although', 'Despite', 'However', 'In spite'], a: 0, why: 'Although + a full sentence.' },
      { k: 'L', q: '______ the problem, many people still buy clothes they don\'t need.', o: ['Despite', 'Although', 'However', 'Even though'], a: 0, why: 'Despite + noun (the problem).' },
      { k: 'L', t: 1, q: 'Write ONE word: The clothes are sent to Chile ______ second-hand clothing.', a: ['as'], why: '"As" = in the role of: sent as second-hand clothing.' },
      { k: 'L', t: 1, q: 'Complete with 2–5 words, using <b>ARE</b>:<div class="mini">Companies import the clothes without paying the usual taxes.<br>The clothes ______ without paying the usual taxes. (ARE)</div>', a: ['are imported', 'are imported by companies'], why: 'Passive: the clothes <b>are imported</b>.' },
      { k: 'L', q: 'The desert is beautiful. ______, it has become a dumping ground.', o: ['However', 'Although', 'Despite', 'Because'], a: 0, why: '"However," starts a new sentence and shows contrast.' },
    ],
    wf: [
      { k: 'W', t: 1, q: 'The burning piles produce ______ smoke. (TOXIN)', a: ['toxic'], why: 'Adjective: toxic.' },
      { k: 'W', t: 1, q: 'Rosario Hevia is a very ______ entrepreneur. (SUCCESS)', a: ['successful'], why: 'Adjective: successful.' },
      { k: 'W', t: 1, q: 'Textile waste causes serious ______ in the desert. (POLLUTE)', a: ['pollution'], why: 'Noun: pollution.' },
      { k: 'W', t: 1, q: 'The clothes ______ release chemicals into the ground. (SLOW)', a: ['slowly'], why: 'Adverb: slowly.' },
      { k: 'W', t: 1, q: 'We need more ______ about the impact of fast fashion. (AWARE)', a: ['awareness'], why: 'Noun: awareness.' },
    ],
  },
];

// ---------------- FINAL BOSS: HYPE ----------------
export const BOSS = {
  name: 'HYPE',
  intro: `<b>BZZZT!</b> So, you are the little reporter who has been collecting <b>Truth Files</b>… 🤖<br><br>I am HYPE. I decide what is cool. I decide what you buy, what you watch, what you feel. Without me, your life would be <i>so boring</i>.<br><br>Let's have a debate. Answer correctly and my signal gets weaker. Make 3 mistakes and the city is mine forever!`,
  win: `NOOOO… my signal… is… disappearing… 📉<br><br>People are looking up from their screens. They are asking questions. They are <b>thinking for themselves</b>!<br><br>…Fine. Maybe trends can be fun when people <i>choose</i> them. Congratulations, reporter.`,
  items: [
    { k: 'I', q: 'HYPE: <i>"Everybody is buying it, so it must be good!"</i><br>What is the best reply?', o: ['Popularity doesn\'t prove quality — that\'s just social proof.', 'You\'re right, I\'ll buy two.', 'Nobody is buying it.', 'Good things are always expensive.'], a: 0, why: 'Social proof: we think something is good just because many people like it.' },
    { k: 'L', q: 'HYPE: <i>"If you ______ my latest trend, you\'ll be left out!"</i>', o: ["don't follow", "won't follow", "didn't follow", "wouldn't follow"], a: 0, why: 'First conditional: If + present simple, will + verb.' },
    { k: 'I', q: 'HYPE: <i>"Clothes are so cheap that nobody gets hurt."</i><br>What is the best reply?', o: ['Very low prices often mean low wages and environmental damage.', 'Cheap clothes are always better.', 'Only shops get hurt.', 'Expensive clothes hurt people.'], a: 0, why: '"Someone, somewhere, paid the real price."' },
    { k: 'L', q: 'Your T-shirt ______ in a factory where workers earn very little.', o: ['was made', 'made', 'has make', 'was making'], a: 0, why: 'Passive past: was made.' },
    { k: 'V', q: 'HYPE: <i>"Just one more video!"</i> The feature that never ends and keeps you scrolling is the endless ______.', o: ['feed', 'food', 'field', 'flood'], a: 0, why: 'An endless feed.' },
    { k: 'I', q: 'HYPE: <i>"Second-hand clothes are only for people with no money!"</i><br>What is the best reply?', o: ['Many young people choose second-hand to be original and to reduce waste.', 'Yes, that\'s why they are bad.', 'Second-hand clothes are more expensive.', 'Nobody buys second-hand clothes.'], a: 0, why: 'Attitudes have changed: second-hand is now popular among teenagers.' },
    { k: 'L', q: '______ HYPE\'s promises, the trend disappeared after two weeks.', o: ['Despite', 'Although', 'However', 'Even'], a: 0, why: 'Despite + noun phrase.' },
    { k: 'E', q: 'HYPE: <i>"In Chile, bosses can make you work as many hours as they want!"</i><br>What is the correct fact?', o: ['Since April 2026, the maximum ordinary week is 42 hours.', 'There is no limit in Chile.', 'The limit is 50 hours.', 'Workers can only work 20 hours.'], a: 0, why: '40 Hours Law: 44 (2024) → 42 (April 2026) → 40 (2028).' },
    { k: 'L', q: 'Workers ______ be paid extra for overtime — it\'s the law.', o: ['must', 'might', "can't", "needn't"], a: 0, why: 'Must = obligation.' },
    { k: 'I', q: 'HYPE: <i>"Your phone controls you now!"</i><br>What is the best reply?', o: ['Not if I turn off notifications and set my own limits.', 'Yes, and I love it.', 'I don\'t have a phone, so I can\'t be controlled.', 'Phones can\'t be turned off.'], a: 0, why: '"We should control our phones, not the other way round."' },
    { k: 'V', q: 'I won\'t let you ______ me into buying things I don\'t need!', o: ['pressure', 'press', 'push up', 'force on'], a: 0, why: 'Pressure somebody into doing something.' },
    { k: 'L', q: 'If everybody bought fewer clothes, the desert ______ cleaner.', o: ['would be', 'will be', 'is', 'was'], a: 0, why: 'Second conditional: If + past simple, would + verb.' },
    { k: 'W', t: 1, q: 'HYPE: <i>"Your opinions are so ______!"</i> (PREDICT)<br>Write the word that means "easy to guess".', a: ['predictable'], why: 'Adjective: predictable.' },
    { k: 'I', q: 'HYPE: <i>"The desert is far away. It\'s not your problem."</i><br>What is the best reply?', o: ['Every clothing item I buy and throw away can end up there.', 'True, the desert doesn\'t matter.', 'Only the mayor can solve it.', 'Clothes disappear in the desert.'], a: 0, why: '"The problem is connected to every one of us."' },
  ],
};

// ---------------- SIDE MISSIONS ----------------
// collect = cosas que hay que juntar antes de leer. pos = lugar del mapa (x, z).
export const SIDE = [
  {
    id: 'detox', icon: '📵', title: 'My 48-Hour Digital Detox', pos: [90, 90], kind: 'park',
    npc: { name: 'Tomás', model: 'b' },
    collect: { n: 4, kind: 'phone', what: 'phones', icon: '📱' },
    hello: `Help! My friends and I tried a digital detox challenge. We hid our <b>4 phones</b> in this park… and now we can't find them! 😅 Can you look for them?`,
    ready: `You found all the phones! Thanks! Here's the diary I wrote during the detox. Read it!`,
    text: `Last weekend, my friends and I decided to try something crazy: a 48-hour digital detox. No phones, no tablets, no social media. We hid our phones in the park so we wouldn't be tempted to use them.

The first few hours were really hard. I kept reaching into my pocket to check notifications that weren't there. I felt nervous, as if I was missing something important. My friend Javi said he could feel "phantom vibrations".

But on Saturday afternoon, something changed. We played football for three hours, and nobody stopped to film it. We talked — really talked — about things we had never discussed before. In the evening, I finally finished a novel I had started months ago.

On Sunday night, I slept nine hours for the first time in weeks. When I turned my phone on again, I had 214 notifications. Guess what? Almost none of them were important.

I'm not going to give up my phone forever. But now I leave it in the kitchen when I go to bed, and I've turned off most notifications. I've realised that I don't need to know everything the moment it happens.`,
    items: [
      { k: 'E', q: 'Why did they hide their phones in the park?', o: ['So they wouldn\'t be tempted to use them.', 'Because their parents told them to.', 'Because the phones were broken.', 'To play a hide-and-seek game.'], a: 0, why: '"…so we wouldn\'t be tempted to use them."' },
      { k: 'V', q: '"Phantom vibrations" probably means…', o: ['feeling your phone vibrate when it isn\'t vibrating.', 'a scary film.', 'a new type of phone.', 'music with a lot of bass.'], a: 0, why: 'A phantom is something that seems real but isn\'t there.' },
      { k: 'I', q: 'What surprised the writer when he turned his phone on again?', o: ['Most of the 214 notifications were not important.', 'He had no notifications.', 'His phone was broken.', 'His friends were angry.'], a: 0, why: '"Almost none of them were important."' },
      { k: 'E', q: 'What has the writer changed since the detox?', o: ['He leaves his phone in the kitchen at night.', 'He has sold his phone.', 'He has deleted all his apps.', 'He sleeps with his phone.'], a: 0, why: 'Last paragraph.' },
    ],
    thanks: `I feel so much better without notifications at night. You should try it too! 😴`,
  },
  {
    id: 'fakenews', icon: '🔍', title: 'Fake News Detective', pos: [150, -90], kind: 'corner',
    npc: { name: 'ADA', model: 'h' },
    hello: `Beep! I am ADA, a friendly AI. Not all robots work for HYPE! 🤖 HYPE is spreading fake news all over the Pixel District. Read my guide to spotting fake news and help me teach the citizens.`,
    text: `Have you ever shared a story online and then discovered it wasn't true? Don't worry — it happens to millions of people. Fake news is false information that is presented as if it were real news. Some people create it to make money from clicks; others want to influence what we think or who we vote for.

Fake news spreads fast because it is designed to make us feel strong emotions: surprise, fear or anger. When we feel these emotions, we share first and think later. Researchers at MIT found that false stories on Twitter spread much faster than true ones, mainly because people found them more surprising.

So how can you protect yourself? First, stop. Before you share, take a few seconds to breathe. Second, investigate the source: Who published this? Is it a real news organisation? Third, look for other sources. If something big really happened, several reliable media will report it. Finally, check the date and the photos — many "new" stories use old pictures from different places.

In a world full of information, your best tool is not a better phone. It's your critical thinking.`,
    items: [
      { k: 'E', q: 'According to the text, why do some people create fake news?', o: ['To make money from clicks or to influence opinions.', 'Because they are journalists.', 'To practise their writing.', 'Because they are bored.'], a: 0, why: 'Paragraph 1 gives these two reasons.' },
      { k: 'I', q: 'Why do strong emotions help fake news to spread?', o: ['Because we share first and think later.', 'Because emotional stories are always true.', 'Because angry people don\'t use phones.', 'Because emotions make stories shorter.'], a: 0, why: '"We share first and think later."' },
      { k: 'E', q: 'What is the FIRST step the text recommends?', o: ['Stop and take a few seconds before sharing.', 'Look for other sources.', 'Check the photos.', 'Buy a better phone.'], a: 0, why: '"First, stop."' },
      { k: 'V', q: '"Critical thinking" is the ability to…', o: ['analyse information carefully before believing it.', 'criticise other people.', 'think very quickly.', 'remember a lot of facts.'], a: 0, why: 'Critical thinking = analysing and questioning information.' },
    ],
    thanks: `Excellent! Stop, check the source, compare and check dates. Your brain is faster than any algorithm. Beep-boop! 💙`,
  },
  {
    id: 'ad', icon: '#️⃣', title: 'Is It an Ad?', pos: [30, -150], kind: 'corner',
    npc: { name: 'Benja', model: 'm' },
    hello: `Hi! I'm Benja, I have 50K followers. 😎 A brand offered me money to say I love their energy drink… but I've never tried it! My friend says I have to tell my followers it's an ad. Can you read this and help me decide?`,
    text: `When your favourite influencer says, "I can't live without this face cream!", are they giving you a sincere opinion or are they being paid? This is one of the most important questions in the world of social media marketing.

Influencer marketing is a huge business. Brands pay content creators to show their products because followers trust influencers more than traditional adverts. A recommendation from someone you watch every day feels like advice from a friend, not like an advert on TV.

The problem appears when the audience doesn't know that the influencer is being paid. That is why many countries ask influencers to label sponsored content clearly with words like "#ad", "#publicidad" or "paid partnership". In Chile, SERNAC, the national consumer service, has published guidelines saying that advertising on social media must be easy to identify.

Being honest can actually help influencers. Studies suggest that followers don't mind sponsored posts if the creator really uses the product and is transparent about the deal. What followers hate is feeling tricked. In the end, an influencer's most valuable product is not a cream or a drink: it's trust.`,
    items: [
      { k: 'I', q: 'Why do brands prefer influencers to traditional adverts?', o: ['Followers trust influencers as if they were friends.', 'Influencers are cheaper than TV.', 'Influencers never show products.', 'People don\'t watch TV.'], a: 0, why: '"…feels like advice from a friend, not like an advert on TV."' },
      { k: 'E', q: 'What does SERNAC say about advertising on social media?', o: ['It must be easy to identify.', 'It is not allowed.', 'It must be in English.', 'Only big brands can use it.'], a: 0, why: 'Paragraph 3.' },
      { k: 'V', q: '<b>"Sponsored"</b> content is content that…', o: ['a company pays for.', 'is very popular.', 'is about sports.', 'is fake.'], a: 0, why: 'Sponsored = paid for by a company.' },
      { k: 'I', q: 'What should Benja do, according to the text?', o: ['Only accept deals for products he really uses and label them as ads.', 'Accept all deals and say nothing.', 'Stop making videos.', 'Say he loves the drink without trying it.'], a: 0, why: 'Followers accept ads if the creator "really uses the product and is transparent".' },
    ],
    thanks: `Decision made: I said NO to the energy drink. My followers trust me, and that's worth more than money. #NotAnAd 😄`,
  },
  {
    id: 'feria', icon: '👕', title: 'Second-hand Saturday', pos: [-150, -90], kind: 'park',
    npc: { name: 'Fernanda', model: 'e', tint: '#ff6fa8' },
    collect: { n: 4, kind: 'shirt', what: 'clothes for the swap', icon: '👕' },
    hello: `¡Hola! I'm Fernanda and I'm organising a clothing swap in this park. But the wind blew away <b>4 pieces of clothing</b>! 🌬️ Can you find them for me?`,
    ready: `You found them all! Thank you! While I hang them up, read the flyer for our swap.`,
    text: `CLOTHING SWAP — SATURDAY, 11 AM TO 3 PM

Have you got clothes in your wardrobe that you never wear? Jeans that are too small, a jacket you bought for a party and never used again, a T-shirt from a trend that is already over? Don't throw them away — swap them!

How does it work? Bring up to five clean items in good condition. For each item, you will receive a token. Then use your tokens to choose "new" clothes brought by other people. It's free, it's fun and it's good for the planet.

Why swap? Every year, millions of clothes that could still be worn end up in landfills. When you swap, you give your clothes a second life and you get something different without buying anything new. You can also find unique pieces that nobody else is wearing.

Rules: We don't accept dirty or broken clothes, underwear or shoes. Anything that isn't swapped at the end of the day will be donated to a local charity.

Bring a friend, bring a bag — and leave HYPE's trends at home!`,
    items: [
      { k: 'E', q: 'How many items can each person bring?', o: ['Up to five.', 'Only one.', 'As many as they want.', 'Exactly ten.'], a: 0, why: '"Bring up to five clean items…"' },
      { k: 'E', q: 'What do you receive for each item you bring?', o: ['A token.', 'Money.', 'A new T-shirt.', 'A free ticket.'], a: 0, why: '"For each item, you will receive a token."' },
      { k: 'E', q: 'Which of these can you NOT bring to the swap?', o: ['Shoes', 'A jacket', 'Jeans', 'A T-shirt'], a: 0, why: 'Rules: no dirty or broken clothes, underwear or shoes.' },
      { k: 'I', q: 'What happens to the clothes that nobody takes?', o: ['They are given to a charity.', 'They are thrown away.', 'They are sold online.', 'The owners take them home.'], a: 0, why: '"…will be donated to a local charity."' },
    ],
    thanks: `Look how many people came! This jacket had a first life in a feria, a second life with me… and now a third life with someone new. 💖`,
  },
  {
    id: 'repair', icon: '🧷', title: 'The Repair Café', pos: [-30, 150], kind: 'park',
    npc: { name: 'Don Lucho', model: 'i' },
    collect: { n: 3, kind: 'spool', what: 'spools of thread', icon: '🧵' },
    hello: `Good afternoon! I'm Lucho. I fix clothes for free at my Repair Café. But I dropped my <b>3 spools of thread</b> on the way here. Could you bring them back, please?`,
    ready: `My spools! Now I can work. Please read this little article about why repairing matters.`,
    text: `My grandmother never threw anything away. When a sock had a hole, she fixed it. When trousers were too long, she shortened them. For her generation, repairing clothes was normal. Today, many young people have never held a needle.

Repair Cafés want to change that. The idea started in Amsterdam in 2009, when a journalist called Martine Postma organised a free meeting where volunteers helped people fix their broken things: clothes, toasters, bicycles, lamps. Today there are thousands of Repair Cafés around the world.

Repairing has many benefits. First, it saves money: sewing a button costs almost nothing. Second, it reduces waste, because clothes stay in use for longer. Third, it teaches useful skills and brings neighbours together. Many visitors say they came to fix a jacket but stayed for the conversation.

Some fashion brands have noticed this trend too, and now offer repair services for their products. Perhaps the coolest trend of all is not buying the newest thing, but making the old thing last.`,
    items: [
      { k: 'E', q: 'Where and when did the first Repair Café start?', o: ['In Amsterdam, in 2009.', 'In Santiago, in 2019.', 'In London, in 1990.', 'In Paris, in 2009.'], a: 0, why: 'Paragraph 2.' },
      { k: 'I', q: 'Why does the writer mention his grandmother?', o: ['To show that repairing used to be normal.', 'To say she was a famous designer.', 'To explain how to make socks.', 'To say she threw everything away.'], a: 0, why: '"For her generation, repairing clothes was normal."' },
      { k: 'E', q: 'Which benefit of repairing is NOT mentioned?', o: ['It makes you famous on social media.', 'It saves money.', 'It reduces waste.', 'It brings neighbours together.'], a: 0, why: 'Fame on social media is not mentioned.' },
      { k: 'V', q: '"Making the old thing <b>last</b>" means…', o: ['making it continue to be useful for a long time.', 'putting it at the end.', 'making it the newest.', 'throwing it away last.'], a: 0, why: 'Last (verb) = continue to exist or work.' },
    ],
    thanks: `Look: a button, two stitches, and this shirt has many more years of life. Come back with anything you want to fix! 🧷`,
  },
  {
    id: 'rider', icon: '🛵', title: 'Rights on Wheels', pos: [-150, 30], kind: 'corner',
    npc: { name: 'Diego', model: 'k' },
    hello: `Hey! I'm Diego, I deliver food with an app. 🛵 I work a lot, but I'm not sure what my rights are. Am I an employee or not? Read this and tell me what you think.`,
    text: `You see them everywhere: riders with big boxes on their backs, delivering food and packages ordered through apps. This type of work, organised through digital platforms, is often called the "gig economy". It offers flexibility: workers can choose when to connect and how many hours to work. For students or people who need extra money, this can be very attractive.

However, gig work also has disadvantages. In many countries, platforms considered riders as independent contractors, not employees. This meant that they did not always have health insurance, paid holidays or protection if they had an accident on the road. Their income could also change a lot from one week to another, depending on the app's algorithm.

In 2022, Chile approved a law for digital platform workers (Ley 21.431). It recognises that these workers can be either dependent (employees) or independent, depending on how they work, and it gives both groups some protections, such as social security and accident insurance. The law also says that workers have the right to know how the app's algorithm assigns orders and calculates payments.

The gig economy is still changing, and many workers say more improvements are needed. But one thing is clear: a modern job still needs old rights.`,
    items: [
      { k: 'V', q: 'The <b>"gig economy"</b> is…', o: ['work organised through digital platforms and apps.', 'a type of music concert.', 'the economy of a big city.', 'a bank for young people.'], a: 0, why: 'Paragraph 1 explains it.' },
      { k: 'E', q: 'What is one ADVANTAGE of gig work?', o: ['Workers can choose when and how much to work.', 'Income is always the same.', 'It always includes paid holidays.', 'There are no accidents.'], a: 0, why: '"It offers flexibility…"' },
      { k: 'E', q: 'What right does Ley 21.431 give platform workers?', o: ['To know how the algorithm assigns orders and calculates payments.', 'To work without any rules.', 'To use the app for free.', 'To deliver only in the morning.'], a: 0, why: 'Paragraph 3.' },
      { k: 'I', q: '"A modern job still needs old rights." What does the writer mean?', o: ['New types of work still need basic protections like insurance.', 'Old jobs are better than new ones.', 'Riders should use old bicycles.', 'Laws are too old for apps.'], a: 0, why: 'Even app jobs need protections like social security and insurance.' },
    ],
    thanks: `So I have rights even if I work with an app! I'm going to ask the platform how its algorithm calculates my pay. Gracias! 🛵`,
  },
  {
    id: 'challenge', icon: '⚠️', title: 'The Challenge Trap', pos: [150, 30], kind: 'corner',
    npc: { name: 'Nico', model: 'r' },
    hello: `I'm Nico! HYPE says if I do the "Ninja Roof Jump Challenge" I'll get a million views! 🥷 My mum says it's dangerous… Who's right? Read this before I jump!`,
    text: `Viral challenges have been part of the internet for years. Some are fun and even positive: in 2014, the Ice Bucket Challenge raised more than 100 million dollars for research into ALS, a serious disease. Dance challenges, cooking challenges and "draw this in your style" challenges help people to be creative and to connect with others.

But some challenges are dangerous. Over the years, doctors have reported injuries — and even deaths — caused by challenges that encouraged people to hold their breath, eat dangerous products or jump from high places. Why would anyone take such risks?

Experts point to the teenage brain. The part of the brain that controls impulses and thinks about consequences, the prefrontal cortex, continues developing until our mid-twenties. At the same time, teenagers are very sensitive to social rewards like likes and comments. This combination can make a risky challenge seem like a great idea.

Before you join a challenge, ask yourself: Could someone get hurt? Would I do this if nobody was watching? If the answer to the first question is yes, or the answer to the second is no, it's not worth it. No number of views is worth your health.`,
    items: [
      { k: 'E', q: 'What was positive about the Ice Bucket Challenge?', o: ['It raised over 100 million dollars for ALS research.', 'It taught people to swim.', 'It was the first challenge ever.', 'It was very dangerous.'], a: 0, why: 'Paragraph 1.' },
      { k: 'E', q: 'Until what age does the prefrontal cortex continue developing?', o: ['Until our mid-twenties.', 'Until we are ten.', 'Until we are fifteen.', 'It never stops.'], a: 0, why: 'Paragraph 3.' },
      { k: 'I', q: 'Why can risky challenges seem like a good idea to teenagers?', o: ['Their brains are still developing control and they are sensitive to likes.', 'Teenagers are never afraid.', 'Their parents tell them to do it.', 'Challenges are always safe.'], a: 0, why: 'The combination of a developing brain and sensitivity to social rewards.' },
      { k: 'I', q: 'Nico wants to jump from a roof. What would the writer tell him?', o: ['Don\'t do it — someone could get hurt.', 'Do it, but film it well.', 'Do it only at night.', 'Ask HYPE for advice.'], a: 0, why: '"Could someone get hurt? … it\'s not worth it."' },
    ],
    thanks: `OK, OK… no roof jumping. I'll do a drawing challenge instead! My ninja drawings are awesome. 🥷✏️`,
  },
  {
    id: 'sleep', icon: '🌙', title: 'Screens Before Bed', pos: [90, 150], kind: 'corner',
    npc: { name: 'Joaquín', model: 'c', tint: '#4fb3ff' },
    hello: `Yaaawn… 😴 I'm Joaquín. I go to bed at 11, but I fall asleep at 3 because I keep watching videos. Then I sleep in class. Is my phone the problem? Read this with me.`,
    text: `Sleep experts recommend that teenagers sleep between eight and ten hours a night. However, surveys in many countries show that most teenagers sleep much less, especially on school nights. One of the main reasons is the phone in their hands at bedtime.

Screens affect sleep in several ways. First, they emit blue light, which can reduce the production of melatonin, the hormone that tells our body it is time to sleep. Second, the content itself keeps our brain active: an exciting video, an argument in a group chat or a game we want to win make it difficult to relax. Third, and probably most importantly, screens simply take time. "Five more minutes" can easily become two hours.

Lack of sleep has serious effects. It makes it harder to concentrate and remember information, it affects our mood and it can even weaken our immune system. Students who sleep badly often feel irritable and get lower grades.

The solution is simple, but not easy: stop using screens at least an hour before going to sleep, charge your phone outside your bedroom and use an alarm clock instead. Your brain will thank you in the morning.`,
    items: [
      { k: 'E', q: 'How many hours should teenagers sleep, according to experts?', o: ['Between eight and ten hours.', 'Between five and six hours.', 'Exactly seven hours.', 'Twelve hours.'], a: 0, why: 'Paragraph 1.' },
      { k: 'V', q: '<b>Melatonin</b> is…', o: ['a hormone that tells the body it is time to sleep.', 'a type of blue light.', 'a sleeping app.', 'a vitamin in food.'], a: 0, why: 'Paragraph 2 defines it.' },
      { k: 'I', q: 'According to the writer, what is probably the MOST important way screens affect sleep?', o: ['They simply take time away from sleeping.', 'Blue light damages the eyes.', 'Phones are too heavy.', 'Videos are boring.'], a: 0, why: '"Third, and probably most importantly, screens simply take time."' },
      { k: 'E', q: 'Which advice does the text give?', o: ['Charge your phone outside your bedroom.', 'Watch calm videos in bed.', 'Sleep with the phone under your pillow.', 'Drink coffee at night.'], a: 0, why: 'Last paragraph.' },
    ],
    thanks: `Tonight my phone sleeps in the kitchen. And I bought an old-school alarm clock! ⏰ Goodnight, HYPE.`,
  },
  {
    id: 'wears', icon: '🔁', title: 'The 30 Wears Test', pos: [-90, -150], kind: 'corner',
    npc: { name: 'Pablo', model: 'p' },
    hello: `Ahoy! I'm Pablo, a theatre actor. 🏴‍☠️ I've worn this costume in 200 shows! People laugh, but I think clothes should be used a lot. Have you heard of the "30 wears" test? Read about it!`,
    text: `Before you buy a new piece of clothing, ask yourself a simple question: "Will I wear this at least 30 times?" If the answer is yes, buy it. If the answer is no, think again.

This is the idea behind #30wears, a campaign started in 2015 by Livia Firth, a British activist and founder of Eco-Age, a consultancy for sustainable fashion. She noticed that many people buy clothes for one special occasion — a party, a holiday, a photo for social media — and then never wear them again.

The test is useful because it changes the way we think about price. A jacket that costs 60,000 pesos and that you wear 60 times costs you 1,000 pesos per wear. A cheap top that costs 6,000 pesos but that you wear only once costs 6,000 pesos per wear. Suddenly, the "cheap" option is the expensive one!

The 30 wears test doesn't mean you can never buy anything new. It means buying clothes you really love, that go with other things in your wardrobe and that are made well enough to survive 30 washes. It's a small question that can make a big difference.`,
    items: [
      { k: 'E', q: 'Who started the #30wears campaign?', o: ['Livia Firth', 'Rosario Hevia', 'Martine Postma', 'HYPE'], a: 0, why: 'Paragraph 2.' },
      { k: 'I', q: 'Why might many people wear some clothes only once?', o: ['They buy them for one special occasion or photo.', 'The clothes are too expensive.', 'They don\'t like washing clothes.', 'Shops don\'t allow it.'], a: 0, why: '"…for one special occasion… and then never wear them again."' },
      { k: 'E', q: 'What is the cost per wear of a 60,000-peso jacket worn 60 times?', o: ['1,000 pesos', '6,000 pesos', '60,000 pesos', '600 pesos'], a: 0, why: '60,000 ÷ 60 = 1,000 pesos per wear.' },
      { k: 'I', q: 'What does the writer mean by "the cheap option is the expensive one"?', o: ['If you wear something only once, it costs more per wear.', 'Cheap clothes always cost more in shops.', 'Expensive clothes are always better.', 'Prices change every week.'], a: 0, why: 'Cost per wear: 6,000 per wear vs 1,000 per wear.' },
    ],
    thanks: `Exactly! My costume cost a lot, but after 200 shows, it was a bargain. Arrr! 🏴‍☠️`,
  },
  {
    id: 'job', icon: '📝', title: 'My First Summer Job', pos: [-90, 150], kind: 'corner',
    npc: { name: 'Javiera', model: 'f', tint: '#ffcf4a' },
    hello: `Hi, I'm Javiera, I'm 17. A shop offered me a summer job, but they don't want to give me a contract and they want me to work 12 hours a day. 😟 Is that OK? Read my email from the Dirección del Trabajo.`,
    text: `Dear Javiera,

Thank you for writing to us. It is great that you want to work during your summer holidays. Here is some important information about your rights as a 17-year-old worker in Chile.

First, as you are under 18, you need written permission from your parents or legal guardian, and you must have finished, or be currently attending, school. Second, your employer must give you a written contract. Working without a contract is not legal, and it leaves you without protection if there is a problem.

Third, there are limits to your working hours. Adolescent workers cannot work more than 8 hours a day, and they cannot work at night or do jobs that are dangerous for their health or safety. During the school year, the limit is 30 hours a week. A day of 12 hours is not allowed.

Finally, you have the right to be paid at least the proportional minimum wage and to be treated with respect.

If the shop does not respect these rules, you can make a complaint at any office of the Dirección del Trabajo. Your name can be kept confidential.

Kind regards,
Dirección del Trabajo — Youth Information Service`,
    items: [
      { k: 'E', q: 'What does Javiera need because she is under 18?', o: ['Written permission from her parents or guardian.', 'A university degree.', 'Her own car.', 'Permission from her teacher.'], a: 0, why: 'Paragraph 2.' },
      { k: 'E', q: 'What is the maximum number of hours an adolescent can work in one day?', o: ['8 hours', '12 hours', '10 hours', '6 hours'], a: 0, why: '"…cannot work more than 8 hours a day."' },
      { k: 'I', q: 'What should Javiera do about the shop\'s offer?', o: ['Ask for a written contract and refuse 12-hour days.', 'Accept everything because it\'s only summer.', 'Work without telling her parents.', 'Work at night instead.'], a: 0, why: 'A contract is required and 12 hours a day is not allowed.' },
      { k: 'V', q: 'If her name is kept <b>"confidential"</b>, it means…', o: ['it is kept secret.', 'it is published online.', 'it is changed.', 'it is spelled correctly.'], a: 0, why: 'Confidential = private, secret.' },
    ],
    thanks: `I talked to the shop. Now I have a contract, 6 hours a day and my parents signed the permission. Knowing my rights changed everything! 💪`,
  },
  {
    id: 'bully', icon: '🛡️', title: 'Stop Cyberbullying', pos: [150, 150], kind: 'corner',
    npc: { name: 'Officer Rojas', model: 'j' },
    hello: `Good afternoon. I'm Officer Rojas, from the cybercrime team. Since HYPE arrived, we have more reports of cyberbullying. Young people need to know what to do. Will you read our guide?`,
    text: `Cyberbullying is bullying that happens through digital devices: messages, comments, fake profiles, embarrassing photos or videos shared without permission, or excluding someone from a group chat on purpose. Unlike traditional bullying, it can happen 24 hours a day, it can reach a huge audience in minutes, and the bully can hide behind an anonymous account.

The effects can be very serious. Victims of cyberbullying often feel lonely, anxious and ashamed. Some stop going to school or lose interest in activities they used to love.

If you are a victim: don't answer the bully, because that's often what they want. Take screenshots as evidence, block the person and report the account to the platform. Most importantly, talk to an adult you trust — a parent, a teacher or a school counsellor.

If you are a witness, you also have power. Don't like or share the hurtful content. Send a private message to the victim to show your support, and report what you saw. Bullies need an audience; when the audience disappears, the bullying often stops.

Remember: behind every screen there is a real person.`,
    items: [
      { k: 'E', q: 'How is cyberbullying different from traditional bullying?', o: ['It can happen 24 hours a day and reach many people quickly.', 'It only happens at school.', 'It is never serious.', 'It only happens on weekends.'], a: 0, why: 'Paragraph 1.' },
      { k: 'E', q: 'Why should a victim take screenshots?', o: ['To have evidence.', 'To share them with everyone.', 'To make the bully angry.', 'To post them on Instagram.'], a: 0, why: '"Take screenshots as evidence."' },
      { k: 'I', q: 'Why does the guide say "bullies need an audience"?', o: ['If nobody likes or shares the content, the bullying often stops.', 'Bullies want to become actors.', 'Bullies only act in theatres.', 'Witnesses should watch more.'], a: 0, why: '"When the audience disappears, the bullying often stops."' },
      { k: 'I', q: 'What is the main message of the last sentence?', o: ['We should remember that online actions hurt real people.', 'Screens are dangerous.', 'Everybody should buy a new screen.', 'Only real people use the internet.'], a: 0, why: '"Behind every screen there is a real person."' },
    ],
    thanks: `Thank you, reporter. Remember: don't answer, save evidence, block, report and talk to someone you trust. 🛡️`,
  },
  {
    id: 'recycle', icon: '♻️', title: 'Textile Rescue', pos: [255, 34], kind: 'desert',
    npc: { name: 'Rocío', model: 'd' },
    collect: { n: 5, kind: 'scrap', what: 'bags of textile scraps', icon: '🧶' },
    hello: `Hi! I'm Rocío, a volunteer. I wear this yellow suit to protect myself from the dust. 😷 We're collecting textile waste to recycle it. Can you bring me <b>5 bags of scraps</b> from around here?`,
    ready: `Fantastic! Five bags saved from the desert! Here's the information sheet we give to new volunteers.`,
    text: `What happens to clothes after we stop wearing them? Only a very small percentage of all clothing is recycled into new clothes — the Ellen MacArthur Foundation estimates that it is less than 1 percent. The rest is burned, buried in landfills or, in places like the Atacama, dumped in the open.

Why is it so difficult to recycle clothes? One reason is that many garments are made of mixed materials, for example cotton and polyester together. Separating these fibres is complicated and expensive. Buttons, zips and prints make the process even harder.

Still, new technologies are appearing. Some companies cut old clothes into small pieces and turn them into fibres for insulation, mattresses or new yarn. Others are developing chemical processes to separate polyester from cotton.

Recycling, however, should be the last option. The best order is: reduce (buy less), reuse (wear it again, swap it, sell it), repair (fix it) and, only at the end, recycle. The greenest piece of clothing is the one that is already in your wardrobe.`,
    items: [
      { k: 'E', q: 'According to the Ellen MacArthur Foundation, how much clothing is recycled into new clothes?', o: ['Less than 1 percent.', 'About 50 percent.', 'About 10 percent.', 'Almost all of it.'], a: 0, why: 'Paragraph 1.' },
      { k: 'I', q: 'Why are mixed materials a problem for recycling?', o: ['Separating the fibres is complicated and expensive.', 'Mixed materials are too heavy.', 'They are always dirty.', 'They can\'t be washed.'], a: 0, why: 'Paragraph 2.' },
      { k: 'E', q: 'What should we do FIRST, according to the best order?', o: ['Reduce: buy less.', 'Recycle.', 'Repair.', 'Throw it away.'], a: 0, why: '"The best order is: reduce, reuse, repair and, only at the end, recycle."' },
      { k: 'I', q: '"The greenest piece of clothing is the one that is already in your wardrobe." This means…', o: ['using what you already have is the most sustainable choice.', 'green clothes are the best.', 'you should keep your clothes in a wardrobe.', 'you should paint your clothes green.'], a: 0, why: 'No new production = no new resources or waste.' },
    ],
    thanks: `Every bag counts! Reduce, reuse, repair… and recycle only at the end. ♻️ Thanks, reporter!`,
  },
];

// ---------------- ONLINE: extra quick questions ----------------
export const ONLINE_EXTRA = [
  { k: 'V', q: 'Something that is popular for a very short time is a ______.', o: ['microtrend', 'microwave', 'micromanager', 'microphone'], a: 0, why: 'Microtrend.' },
  { k: 'V', q: 'Fear of missing out = ______', o: ['FOMO', 'YOLO', 'LOL', 'DIY'], a: 0, why: 'FOMO = Fear Of Missing Out.' },
  { k: 'L', q: 'She ______ her phone since 7 a.m.', o: ['has been using', 'is using', 'used', 'uses'], a: 0, why: 'Since + starting point → present perfect continuous.' },
  { k: 'L', q: 'Clothes ______ to Iquique from the USA and Europe.', o: ['are sent', 'send', 'are sending', 'sent'], a: 0, why: 'Passive: are sent.' },
  { k: 'V', q: 'A group of workers that defends their rights is a ______.', o: ['union', 'unit', 'unity', 'uniform'], a: 0, why: 'A (trade) union.' },
  { k: 'L', q: 'If I ______ an influencer, I would always label my ads.', o: ['were', 'am', 'will be', 'have been'], a: 0, why: 'Second conditional: If I were…' },
  { k: 'V', q: 'Clothes that someone else used before are ______.', o: ['second-hand', 'handmade', 'hand-held', 'brand-new'], a: 0, why: 'Second-hand.' },
  { k: 'L', q: '______ it was cheap, I didn\'t buy it.', o: ['Although', 'Despite', 'However', 'Because of'], a: 0, why: 'Although + sentence.' },
  { k: 'V', q: 'The money a worker receives every month is their ______.', o: ['salary', 'price', 'cost', 'bill'], a: 0, why: 'Salary / wage.' },
  { k: 'L', q: 'You ______ share other people\'s photos without permission. It\'s wrong!', o: ["mustn't", "don't have to", "needn't", 'have to'], a: 0, why: "Mustn't = prohibition." },
  { k: 'V', q: 'A computer program that decides what you see in your feed is an ______.', o: ['algorithm', 'alphabet', 'album', 'alarm'], a: 0, why: 'Algorithm.' },
  { k: 'L', q: 'The influencer ______ I follow only posts honest reviews.', o: ['who', 'which', 'where', 'whose'], a: 0, why: 'Who = people.' },
  { k: 'V', q: 'Clothes that are made to last a long time are ______.', o: ['durable', 'disposable', 'portable', 'available'], a: 0, why: 'Durable = long-lasting.' },
  { k: 'L', q: 'The Atacama is the driest desert, ______?', o: ["isn't it", 'is it', "doesn't it", "wasn't it"], a: 0, why: 'Question tag: positive sentence with "is" → isn\'t it?' },
];

// ---------------- BUS STOPS (fast travel) ----------------
export const STOPS = [
  { name: 'Hype Square', x: 16, z: 47 },
  { name: 'Pixel District', x: 106, z: -70 },
  { name: 'Mega Mall', x: -106, z: -70 },
  { name: 'Factory Row', x: -106, z: 70 },
  { name: 'Suburbs', x: 106, z: 70 },
  { name: 'Atacama Highway', x: 232, z: 13 },
];
