// Hype Horde — 3° medio, Unit 4 "What impact do trends have?"
// Preguntas de vocabulario que aparecen al subir de nivel.
// Para editar una pregunta, cambia el texto entre comillas.
// Formato: { k: habilidad, q: pregunta, o: [opciones], a: índice de la correcta (0 = primera), why: explicación }
// Las opciones se desordenan solas en el juego.
// k = habilidad:  DEF = significado (definición → palabra)
//                 CTX = palabra en contexto (completar la oración)
//                 COL = colocaciones / expresiones fijas (go viral, peer pressure…)
//                 SYN = sinónimos y antónimos

export const SKILLS = { DEF: 'Meaning', CTX: 'Word in context', COL: 'Collocations', SYN: 'Synonyms & opposites' };

export const VOCAB = [
  // ---------- DEF: definition → word ----------
  { k: 'DEF', q: 'A person who is paid by brands because many people follow them online.', o: ['influencer', 'consumer', 'supplier', 'employee'], a: 0, why: 'An <b>influencer</b> has many followers and promotes products.' },
  { k: 'DEF', q: 'Cheap clothes that copy catwalk styles and are produced very quickly.', o: ['fast fashion', 'high fashion', 'second-hand clothes', 'uniform'], a: 0, why: '<b>Fast fashion</b> = cheap, quick, trendy clothes.' },
  { k: 'DEF', q: 'Something that is popular for a very short time and then disappears.', o: ['fad', 'tradition', 'habit', 'custom'], a: 0, why: 'A <b>fad</b> is a short-lived trend.' },
  { k: 'DEF', q: 'A person who buys goods or services.', o: ['consumer', 'producer', 'retailer', 'designer'], a: 0, why: 'A <b>consumer</b> buys and uses products.' },
  { k: 'DEF', q: 'The money you receive for your work every month.', o: ['salary', 'bill', 'discount', 'loan'], a: 0, why: '<b>Salary</b> = regular pay for a job.' },
  { k: 'DEF', q: 'A factory where workers have long hours, low pay and bad conditions.', o: ['sweatshop', 'workshop', 'warehouse', 'headquarters'], a: 0, why: 'A <b>sweatshop</b> exploits its workers.' },
  { k: 'DEF', q: 'Clothes that someone else owned and used before you.', o: ['second-hand', 'brand-new', 'tailor-made', 'designer'], a: 0, why: '<b>Second-hand</b> = previously owned.' },
  { k: 'DEF', q: 'The fear that other people are having fun or experiences without you.', o: ['FOMO', 'jealousy', 'nostalgia', 'boredom'], a: 0, why: '<b>FOMO</b> = fear of missing out.' },
  { k: 'DEF', q: 'To look quickly through a lot of posts on a screen, often for a long time.', o: ['scroll', 'browse a shop', 'skip', 'download'], a: 0, why: 'To <b>scroll</b> = move content up or down on a screen.' },
  { k: 'DEF', q: 'A place where large amounts of rubbish are left on the ground.', o: ['landfill', 'harbour', 'market', 'factory'], a: 0, why: 'A <b>landfill</b> (or dump) is where waste is buried or piled.' },
  { k: 'DEF', q: 'A short message or post that a company pays for, to sell something.', o: ['advertisement', 'review', 'headline', 'comment'], a: 0, why: 'An <b>advertisement</b> (ad) is paid promotion.' },
  { k: 'DEF', q: 'The group of people who follow an account on social media.', o: ['followers', 'shareholders', 'neighbours', 'colleagues'], a: 0, why: 'Your <b>followers</b> see your posts.' },

  // ---------- CTX: word in context ----------
  { k: 'CTX', q: 'Thousands of tonnes of unwanted clothes are ______ in the Atacama Desert every year.', o: ['dumped', 'donated', 'designed', 'delivered'], a: 0, why: '<b>Dumped</b> = thrown away carelessly.' },
  { k: 'CTX', q: 'Workers in some factories earn less than the minimum ______.', o: ['wage', 'price', 'cost', 'fee'], a: 0, why: '<b>Minimum wage</b> = the lowest pay allowed by law.' },
  { k: 'CTX', q: 'Many teenagers feel ______ when they compare their lives with perfect photos online.', o: ['insecure', 'confident', 'relaxed', 'generous'], a: 0, why: '<b>Insecure</b> = not confident about yourself.' },
  { k: 'CTX', q: 'This T-shirt is very cheap, but its ______ on the environment is huge.', o: ['impact', 'image', 'income', 'issue'], a: 0, why: '<b>Impact on</b> = a strong effect on something.' },
  { k: 'CTX', q: 'Before you buy, ask yourself: do I really ______ this, or do I just want it?', o: ['need', 'owe', 'lend', 'waste'], a: 0, why: 'Needs vs. wants: do I really <b>need</b> it?' },
  { k: 'CTX', q: 'The brand ______ that its clothes were "green", but it was not true.', o: ['claimed', 'denied', 'refused', 'avoided'], a: 0, why: '<b>Claimed</b> = said something is true (without proof).' },
  { k: 'CTX', q: 'Repairing your clothes helps to ______ waste.', o: ['reduce', 'increase', 'produce', 'replace'], a: 0, why: '<b>Reduce</b> waste = make less of it.' },
  { k: 'CTX', q: 'Labour laws ______ workers from dangerous conditions.', o: ['protect', 'prevent', 'provide', 'promote'], a: 0, why: 'Laws <b>protect</b> people from danger.' },
  { k: 'CTX', q: 'The video was so ______ that people shared it all over the world in one day.', o: ['catchy', 'boring', 'private', 'faded'], a: 0, why: '<b>Catchy</b> = easy to remember and attractive.' },
  { k: 'CTX', q: 'Synthetic fabrics like polyester can take hundreds of years to ______.', o: ['decompose', 'decorate', 'develop', 'decide'], a: 0, why: '<b>Decompose</b> = break down naturally.' },
  { k: 'CTX', q: 'She ______ the account because it only posted fake news.', o: ['unfollowed', 'unlocked', 'unpacked', 'unplugged'], a: 0, why: 'To <b>unfollow</b> = stop following an account.' },
  { k: 'CTX', q: 'Companies collect our personal ______ every time we click "like".', o: ['data', 'dates', 'notes', 'votes'], a: 0, why: 'Personal <b>data</b> = information about you.' },

  // ---------- COL: collocations ----------
  { k: 'COL', q: 'Her post went ______ overnight: two million views!', o: ['viral', 'popular', 'online', 'famous'], a: 0, why: 'Fixed expression: <b>go viral</b>.' },
  { k: 'COL', q: 'Teenagers often buy things because of peer ______.', o: ['pressure', 'stress', 'force', 'weight'], a: 0, why: 'Collocation: <b>peer pressure</b>.' },
  { k: 'COL', q: 'Influencers try to ______ a trend so their followers copy it.', o: ['set', 'put', 'do', 'take'], a: 0, why: '<b>Set a trend</b> = start a new fashion.' },
  { k: 'COL', q: 'Those trainers ______ out of fashion two years ago.', o: ['went', 'came', 'got', 'made'], a: 0, why: '<b>Go out of fashion</b> = stop being popular.' },
  { k: 'COL', q: 'You should ______ attention to where your clothes are made.', o: ['pay', 'make', 'give', 'take'], a: 0, why: 'Collocation: <b>pay attention to</b>.' },
  { k: 'COL', q: 'Many workers in the fashion industry work long ______.', o: ['hours', 'times', 'days off', 'clocks'], a: 0, why: 'Collocation: <b>work long hours</b>.' },
  { k: 'COL', q: 'Please ______ a comment below and tell us your opinion!', o: ['leave', 'let', 'put on', 'drop off'], a: 0, why: 'Collocation: <b>leave a comment</b>.' },
  { k: 'COL', q: 'Buying less is a good way to ______ money and the planet.', o: ['save', 'keep up', 'spend', 'earn'], a: 0, why: '<b>Save money</b> = not spend it.' },
  { k: 'COL', q: 'Some apps are designed to make us ______ addicted.', o: ['become', 'make', 'do', 'have'], a: 0, why: '<b>Become addicted (to)</b> = start to need something.' },
  { k: 'COL', q: 'It is important to ______ a break from social media sometimes.', o: ['take', 'do', 'make', 'get on'], a: 0, why: 'Collocation: <b>take a break</b>.' },
  { k: 'COL', q: 'Workers went on ______ to ask for better pay.', o: ['strike', 'holiday', 'work', 'shift'], a: 0, why: '<b>Go on strike</b> = stop working as a protest.' },
  { k: 'COL', q: 'This jacket is ______ of date — nobody wears that style now.', o: ['out', 'off', 'over', 'up'], a: 0, why: '<b>Out of date</b> = old-fashioned.' },

  // ---------- SYN: synonyms & opposites ----------
  { k: 'SYN', q: 'Choose the SYNONYM of <b>trendy</b>.', o: ['fashionable', 'old-fashioned', 'expensive', 'comfortable'], a: 0, why: '<b>Trendy</b> = fashionable, in style.' },
  { k: 'SYN', q: 'Choose the OPPOSITE of <b>sustainable</b>.', o: ['harmful', 'eco-friendly', 'green', 'renewable'], a: 0, why: 'Sustainable ≠ <b>harmful</b> to the planet.' },
  { k: 'SYN', q: 'Choose the SYNONYM of <b>to purchase</b>.', o: ['to buy', 'to sell', 'to borrow', 'to return'], a: 0, why: '<b>Purchase</b> = buy (more formal).' },
  { k: 'SYN', q: 'Choose the OPPOSITE of <b>durable</b>.', o: ['fragile', 'strong', 'long-lasting', 'solid'], a: 0, why: 'Durable (lasts a long time) ≠ <b>fragile</b>.' },
  { k: 'SYN', q: 'Choose the SYNONYM of <b>exploit</b> (workers).', o: ['take advantage of', 'look after', 'pay well', 'train'], a: 0, why: '<b>Exploit</b> = treat unfairly to get benefit.' },
  { k: 'SYN', q: 'Choose the SYNONYM of <b>fake</b>.', o: ['false', 'real', 'honest', 'original'], a: 0, why: '<b>Fake</b> = false, not real.' },
  { k: 'SYN', q: 'Choose the OPPOSITE of <b>cheap</b>.', o: ['expensive', 'free', 'low-cost', 'affordable'], a: 0, why: 'Cheap ≠ <b>expensive</b>.' },
  { k: 'SYN', q: 'Choose the SYNONYM of <b>waste</b> (noun).', o: ['rubbish', 'treasure', 'profit', 'goods'], a: 0, why: '<b>Waste</b> = rubbish, things thrown away.' },
  { k: 'SYN', q: 'Choose the SYNONYM of <b>huge</b>.', o: ['enormous', 'tiny', 'average', 'narrow'], a: 0, why: '<b>Huge</b> = enormous, very big.' },
  { k: 'SYN', q: 'Choose the OPPOSITE of <b>reliable</b> (information).', o: ['untrustworthy', 'accurate', 'true', 'checked'], a: 0, why: 'Reliable ≠ <b>untrustworthy</b>.' },
  { k: 'SYN', q: 'Choose the SYNONYM of <b>to encourage</b>.', o: ['to motivate', 'to stop', 'to ignore', 'to warn'], a: 0, why: '<b>Encourage</b> = motivate, support.' },
  { k: 'SYN', q: 'Choose the OPPOSITE of <b>increase</b>.', o: ['decrease', 'grow', 'rise', 'expand'], a: 0, why: 'Increase ≠ <b>decrease</b>.' },
];
