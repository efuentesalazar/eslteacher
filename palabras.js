/* =====================================================================
   PALABRAS DEL DÍA — 365 palabras, una por cada día del año.
   El 1 de enero muestra la palabra 1, el 2 de enero la 2, etc.
   Formato: ["emoji", "palabra", "significado en español", "ejemplo en inglés"]
   Importante: el ejemplo debe contener la palabra exacta (se usa para el ejercicio de completar).
   ===================================================================== */
const WORDS = [
  ["⏰", "time", "tiempo / hora", "What time is it?"],  // 1
  ["🌟", "be", "ser / estar", "I want to be a teacher."],  // 2
  ["👍", "good", "bueno", "Good job, everyone!"],  // 3
  ["📅", "year", "año", "This year I want to read ten books."],  // 4
  ["🤲", "have", "tener", "I have two brothers."],  // 5
  ["📅", "today", "hoy", "Today is Monday."],  // 6
  ["👎", "bad", "malo", "Don't worry, it's not a bad day."],  // 7
  ["☀️", "day", "día", "Have a nice day!"],  // 8
  ["✍️", "do", "hacer", "I do my homework after school."],  // 9
  ["🗓️", "week", "semana", "There are seven days in a week."],  // 10
  ["💬", "say", "decir", "Can you say it again, please?"],  // 11
  ["🆕", "new", "nuevo", "I have a new bike."],  // 12
  ["🎄", "month", "mes", "December is my favorite month."],  // 13
  ["🚶", "go", "ir", "We go to the beach in summer."],  // 14
  ["🏚️", "old", "viejo / antiguo", "This house is very old."],  // 15
  ["🌅", "morning", "mañana", "I eat breakfast in the morning."],  // 16
  ["🏅", "get", "conseguir / obtener", "I get good grades in English."],  // 17
  ["🌄", "tomorrow", "mañana", "See you tomorrow!"],  // 18
  ["🌙", "night", "noche", "The stars shine at night."],  // 19
  ["🧁", "make", "hacer / fabricar", "Let's make a cake for Mom."],  // 20
  ["🐘", "big", "grande", "An elephant is very big."],  // 21
  ["👥", "people", "gente / personas", "Many people live in the city."],  // 22
  ["💡", "know", "saber / conocer", "I know the answer!"],  // 23
  ["🎩", "man", "hombre", "The man is wearing a hat."],  // 24
  ["🐭", "small", "pequeño", "My cat is small and fluffy."],  // 25
  ["🤔", "think", "pensar / creer", "I think it will rain today."],  // 26
  ["👩", "woman", "mujer", "That woman is my aunt."],  // 27
  ["⏪", "yesterday", "ayer", "Yesterday I went to the park."],  // 28
  ["📏", "long", "largo", "The Nile is a very long river."],  // 29
  ["📸", "take", "tomar / llevar", "Take a photo of the mountains."],  // 30
  ["🧒", "child", "niño / niña", "Every child loves to play."],  // 31
  ["👀", "see", "ver", "I can see the ocean from my window."],  // 32
  ["🧑‍🤝‍🧑", "friend", "amigo / amiga", "My best friend is very funny."],  // 33
  ["✂️", "short", "corto / bajo", "My hair is short."],  // 34
  ["🎈", "come", "venir", "Can you come to my house on Saturday?"],  // 35
  ["👨‍👩‍👧", "family", "familia", "I love my family."],  // 36
  ["🪁", "high", "alto", "The kite is flying high."],  // 37
  ["🥤", "want", "querer", "I want a glass of water."],  // 38
  ["👩‍⚕️", "mother", "madre", "My mother is a nurse."],  // 39
  ["⚡", "now", "ahora", "Let's go now!"],  // 40
  ["🔭", "look", "mirar", "Look at the sky!"],  // 41
  ["🎸", "father", "padre", "My father plays the guitar."],  // 42
  ["🦒", "tall", "alto (estatura)", "My brother is very tall."],  // 43
  ["💻", "use", "usar", "We use computers in class."],  // 44
  ["👦", "brother", "hermano", "My brother is older than me."],  // 45
  ["🧒", "young", "joven", "My grandma looks young."],  // 46
  ["👧", "sister", "hermana", "My sister likes to paint."],  // 47
  ["🔎", "find", "encontrar", "I can't find my pencil."],  // 48
  ["👶", "baby", "bebé", "The baby is sleeping."],  // 49
  ["🎁", "give", "dar", "Give me your hand."],  // 50
  ["🤩", "great", "genial / grandioso", "We had a great time at the beach."],  // 51
  ["🪥", "always", "siempre", "I always brush my teeth."],  // 52
  ["🧑‍🏫", "teacher", "profesor / profesora", "Our teacher is very kind."],  // 53
  ["📖", "tell", "contar / decir", "Tell me a story, please."],  // 54
  ["❗", "important", "importante", "Sleep is very important."],  // 55
  ["🎓", "student", "estudiante", "Every student has a locker."],  // 56
  ["💼", "work", "trabajar", "My parents work in Santiago."],  // 57
  ["🩺", "doctor", "doctor / doctora", "The doctor says I am fine."],  // 58
  ["📞", "call", "llamar", "I call my grandma every Sunday."],  // 59
  ["😄", "happy", "feliz", "I am happy to see you."],  // 60
  ["🏠", "house", "casa", "My house has a red door."],  // 61
  ["💪", "try", "intentar / probar", "Try again, you can do it!"],  // 62
  ["🚫", "never", "nunca", "Never give up!"],  // 63
  ["🏡", "home", "hogar / casa", "Let's go home."],  // 64
  ["😢", "sad", "triste", "The movie was sad."],  // 65
  ["🙋", "ask", "preguntar / pedir", "Ask the teacher if you have a question."],  // 66
  ["🏫", "school", "colegio / escuela", "School starts in March."],  // 67
  ["📓", "need", "necesitar", "I need a new notebook."],  // 68
  ["🍰", "easy", "fácil", "This exercise is easy."],  // 69
  ["🪟", "classroom", "sala de clases", "Our classroom has big windows."],  // 70
  ["😊", "feel", "sentir(se)", "I feel happy today."],  // 71
  ["📘", "book", "libro", "This book is about dragons."],  // 72
  ["🧗", "difficult", "difícil", "The test was difficult."],  // 73
  ["🚪", "leave", "salir / dejar", "We leave school at four o'clock."],  // 74
  ["🔄", "sometimes", "a veces", "Sometimes I walk to school."],  // 75
  ["✏️", "pencil", "lápiz", "Can I borrow your pencil?"],  // 76
  ["📚", "put", "poner", "Put your books on the table."],  // 77
  ["🪨", "hard", "duro / difícil", "Learning a language is hard work."],  // 78
  ["💧", "water", "agua", "I drink a lot of water."],  // 79
  ["🗄️", "keep", "guardar / mantener", "Keep your room clean."],  // 80
  ["🍲", "food", "comida", "Chilean food is very tasty."],  // 81
  ["🌅", "beautiful", "hermoso / bello", "What a beautiful sunset!"],  // 82
  ["🔔", "begin", "comenzar", "The class will begin at eight."],  // 83
  ["🥖", "bread", "pan", "I buy bread every morning."],  // 84
  ["👵", "often", "a menudo", "I often visit my grandma."],  // 85
  ["🤣", "funny", "gracioso", "My uncle tells funny jokes."],  // 86
  ["🤝", "help", "ayudar", "Can you help me with this exercise?"],  // 87
  ["🥛", "milk", "leche", "Cats like milk."],  // 88
  ["🗣️", "talk", "hablar / conversar", "I talk with my friends at lunch."],  // 89
  ["🍎", "apple", "manzana", "An apple a day is good for you."],  // 90
  ["💖", "kind", "amable", "Be kind to everyone."],  // 91
  ["🥣", "breakfast", "desayuno", "I have cereal for breakfast."],  // 92
  ["↩️", "turn", "girar / doblar", "Turn left at the corner."],  // 93
  ["🐬", "smart", "inteligente", "Dolphins are smart animals."],  // 94
  ["🥪", "lunch", "almuerzo", "What's for lunch today?"],  // 95
  ["🏁", "start", "empezar", "Let's start the game!"],  // 96
  ["⏰", "usually", "normalmente", "I usually wake up at seven."],  // 97
  ["🍝", "dinner", "cena", "We have dinner at eight."],  // 98
  ["🖼️", "show", "mostrar", "Show me your drawing."],  // 99
  ["💪", "strong", "fuerte", "Ants are very strong."],  // 100
  ["🌍", "world", "mundo", "I want to travel around the world."],  // 101
  ["👂", "hear", "oír", "I can hear the birds."],  // 102
  ["🇨🇱", "country", "país", "Chile is a beautiful country."],  // 103
  ["🐆", "fast", "rápido", "Cheetahs are very fast."],  // 104
  ["⚽", "play", "jugar / tocar", "We play football at break time."],  // 105
  ["📍", "place", "lugar", "This is my favorite place."],  // 106
  ["🏃", "run", "correr", "I run in the park every morning."],  // 107
  ["🐢", "slow", "lento", "Turtles are slow."],  // 108
  ["🔁", "again", "otra vez", "Can you play that song again?"],  // 109
  ["🚦", "street", "calle", "Look both ways before you cross the street."],  // 110
  ["📦", "move", "mover(se) / mudarse", "We will move to a new house."],  // 111
  ["🚗", "car", "auto", "Our car is blue."],  // 112
  ["🔥", "hot", "caluroso", "It's very hot in summer."],  // 113
  ["🍦", "like", "gustar", "I like chocolate ice cream."],  // 114
  ["🚌", "bus", "bus / micro", "I take the bus to school."],  // 115
  ["🏡", "live", "vivir", "I live in Chile."],  // 116
  ["🧊", "cold", "frío", "The water is cold."],  // 117
  ["🚆", "train", "tren", "The train is very fast."],  // 118
  ["✨", "believe", "creer", "I believe in you!"],  // 119
  ["🤝", "together", "juntos", "Let's work together."],  // 120
  ["💰", "money", "dinero / plata", "I need money for the movies."],  // 121
  ["🧥", "warm", "cálido / abrigado", "Wear a warm jacket."],  // 122
  ["🩱", "bring", "traer", "Bring your swimsuit tomorrow."],  // 123
  ["👷", "job", "trabajo / empleo", "My dream job is to be a vet."],  // 124
  ["❓", "happen", "suceder / pasar", "What will happen next?"],  // 125
  ["❄️", "freezing", "helado / muy frío", "It's freezing outside!"],  // 126
  ["🎮", "game", "juego", "This game is so much fun!"],  // 127
  ["✏️", "write", "escribir", "Write your name on the paper."],  // 128
  ["🎵", "music", "música", "I listen to music every day."],  // 129
  ["🍎", "healthy", "saludable", "Fruit is a healthy snack."],  // 130
  ["📍", "here", "aquí", "Come here, please."],  // 131
  ["🪑", "sit", "sentarse", "Please sit next to me."],  // 132
  ["🎤", "song", "canción", "This song is my favorite."],  // 133
  ["🍕", "delicious", "delicioso", "This pizza is delicious!"],  // 134
  ["🧍", "stand", "estar de pie / pararse", "Stand up and stretch."],  // 135
  ["🎬", "movie", "película", "Let's watch a movie tonight."],  // 136
  ["📷", "picture", "foto / imagen", "Take a picture of us!"],  // 137
  ["🔑", "lose", "perder", "Don't lose your keys!"],  // 138
  ["⭐", "amazing", "increíble", "Your work is amazing!"],  // 139
  ["📱", "phone", "teléfono", "My phone is in my backpack."],  // 140
  ["💳", "pay", "pagar", "I pay for the bus with my card."],  // 141
  ["👉", "there", "allí / allá", "The library is over there."],  // 142
  ["🖥️", "computer", "computador", "I use the computer to do research."],  // 143
  ["🤝", "friendly", "amigable", "My classmates are very friendly."],  // 144
  ["👋", "meet", "conocer / reunirse", "Nice to meet you!"],  // 145
  ["❓", "question", "pregunta", "Can I ask a question?"],  // 146
  ["🧠", "learn", "aprender", "I learn new words every day."],  // 147
  ["😮", "surprised", "sorprendido", "She was surprised by the gift."],  // 148
  ["🔤", "word", "palabra", "Learn one new word every day."],  // 149
  ["🍂", "change", "cambiar", "Leaves change color in autumn."],  // 150
  ["📛", "name", "nombre", "What's your name?"],  // 151
  ["⏰", "early", "temprano", "I wake up early on Mondays."],  // 152
  ["💡", "understand", "entender", "I understand the question now."],  // 153
  ["💯", "very", "muy", "I am very happy today."],  // 154
  ["🔢", "number", "número", "Seven is my lucky number."],  // 155
  ["📺", "watch", "mirar / ver", "We watch movies on Friday nights."],  // 156
  ["⌛", "late", "tarde", "Don't be late for class."],  // 157
  ["🎨", "color", "color", "Blue is my favorite color."],  // 158
  ["👣", "follow", "seguir", "Follow me, I know the way."],  // 159
  ["💡", "idea", "idea", "That's a great idea!"],  // 160
  ["❄️", "different", "diferente", "Every snowflake is different."],  // 161
  ["🛑", "stop", "parar / detener", "Stop the music, please."],  // 162
  ["📜", "story", "historia / cuento", "Grandma tells the best story."],  // 163
  ["🎨", "create", "crear", "Let's create a poster for the fair."],  // 164
  ["👯", "same", "mismo", "We have the same shoes!"],  // 165
  ["🎶", "really", "realmente / de verdad", "I really like this song."],  // 166
  ["🧩", "problem", "problema", "No problem, I can help."],  // 167
  ["🌎", "speak", "hablar (un idioma)", "I speak Spanish and English."],  // 168
  ["✋", "hand", "mano", "Raise your hand to speak."],  // 169
  ["🆓", "free", "libre / gratis", "The museum is free on Sundays."],  // 170
  ["📕", "read", "leer", "I read a book before bed."],  // 171
  ["🪖", "head", "cabeza", "Wear a helmet to protect your head."],  // 172
  ["⏳", "spend", "gastar / pasar (tiempo)", "I spend time with my family on weekends."],  // 173
  ["😋", "full", "lleno", "I'm full, thank you."],  // 174
  ["👁️", "eye", "ojo", "I have something in my eye."],  // 175
  ["📖", "open", "abrir", "Open your books to page ten."],  // 176
  ["🤷", "maybe", "quizás", "Maybe it will snow tomorrow."],  // 177
  ["🙂", "face", "cara", "Wash your face every morning."],  // 178
  ["🫙", "empty", "vacío", "The bottle is empty."],  // 179
  ["🚶‍♀️", "walk", "caminar", "I walk to school with my sister."],  // 180
  ["❤️", "heart", "corazón", "My heart beats fast when I run."],  // 181
  ["🧠", "remember", "recordar", "Can you remember the new words?"],  // 182
  ["🏋️", "body", "cuerpo", "Exercise is good for your body."],  // 183
  ["✔️", "right", "correcto / derecho", "That's the right answer!"],  // 184
  ["🚪", "door", "puerta", "Knock on the door."],  // 185
  ["❤️", "love", "amar / encantar", "I love my dog."],  // 186
  ["❌", "wrong", "incorrecto", "Oops, wrong answer. Try again."],  // 187
  ["🪟", "window", "ventana", "Open the window, it's hot."],  // 188
  ["🙏", "please", "por favor", "Can you help me, please?"],  // 189
  ["🛍️", "buy", "comprar", "I want to buy a new jacket."],  // 190
  ["🍽️", "table", "mesa", "Put the plates on the table."],  // 191
  ["✅", "true", "verdadero", "Is it true or false?"],  // 192
  ["⏰", "wait", "esperar", "Wait for me at the door."],  // 193
  ["🪑", "chair", "silla", "This chair is very comfortable."],  // 194
  ["📨", "send", "enviar", "Send me a message later."],  // 195
  ["🚦", "ready", "listo", "Are you ready to play?"],  // 196
  ["🛏️", "bed", "cama", "Make your bed every morning."],  // 197
  ["🧱", "build", "construir", "Birds build nests in spring."],  // 198
  ["🛋️", "room", "pieza / habitación", "My room is small but cozy."],  // 199
  ["💐", "thanks", "gracias", "Thanks for your help!"],  // 200
  ["📵", "busy", "ocupado", "My dad is busy today."],  // 201
  ["🏠", "stay", "quedarse", "Stay at home if you are sick."],  // 202
  ["🏙️", "city", "ciudad", "Santiago is a big city."],  // 203
  ["🍁", "fall", "caer(se)", "Be careful, don't fall!"],  // 204
  ["🥱", "tired", "cansado", "I'm tired after the game."],  // 205
  ["🏘️", "town", "pueblo", "My grandparents live in a small town."],  // 206
  ["✂️", "cut", "cortar", "Cut the paper in half."],  // 207
  ["🌳", "park", "parque", "Let's play in the park."],  // 208
  ["🍔", "hungry", "hambriento / con hambre", "I'm hungry, let's eat!"],  // 209
  ["🙆", "reach", "alcanzar", "I can't reach the top shelf."],  // 210
  ["🏖️", "beach", "playa", "We go to the beach in January."],  // 211
  ["😔", "sorry", "perdón / lo siento", "Sorry, I'm late."],  // 212
  ["🤷", "decide", "decidir", "You decide which game we play."],  // 213
  ["🥤", "thirsty", "sediento / con sed", "I'm thirsty, can I have some water?"],  // 214
  ["🏞️", "river", "río", "The river is cold and clear."],  // 215
  ["🍓", "sell", "vender", "They sell fresh fruit at the market."],  // 216
  ["🌊", "sea", "mar", "I can swim in the sea."],  // 217
  ["😠", "angry", "enojado", "Don't be angry, it was an accident."],  // 218
  ["🧑‍🏫", "explain", "explicar", "Can you explain the rules?"],  // 219
  ["🌊", "ocean", "océano", "The Pacific Ocean is huge."],  // 220
  ["🤞", "hope", "esperar (desear)", "I hope you have a great day."],  // 221
  ["😨", "scared", "asustado", "My dog is scared of fireworks."],  // 222
  ["🏔️", "mountain", "montaña", "Aconcagua is a very tall mountain."],  // 223
  ["🎉", "because", "porque", "I'm happy because it's Friday."],  // 224
  ["🎒", "carry", "llevar / cargar", "I carry my lunch in a bag."],  // 225
  ["🌲", "tree", "árbol", "Birds live in that tree."],  // 226
  ["🤩", "excited", "emocionado", "I'm excited about the trip!"],  // 227
  ["🚗", "drive", "conducir / manejar", "My dad can drive a truck."],  // 228
  ["🌸", "flower", "flor", "This flower smells sweet."],  // 229
  ["🪴", "garden", "jardín", "We grow tomatoes in our garden."],  // 230
  ["💥", "break", "romper", "Be careful not to break the glass."],  // 231
  ["😑", "bored", "aburrido", "I'm bored, let's play a game."],  // 232
  ["🐘", "animal", "animal", "The elephant is a huge animal."],  // 233
  ["🍽️", "eat", "comer", "We eat lunch at one o'clock."],  // 234
  ["🐶", "but", "pero", "I like cats, but I love dogs."],  // 235
  ["🧐", "interesting", "interesante", "This book is very interesting."],  // 236
  ["🐕", "dog", "perro", "My dog loves to run."],  // 237
  ["🥛", "drink", "beber", "Drink water when you exercise."],  // 238
  ["🐈", "cat", "gato", "The cat is sleeping on the sofa."],  // 239
  ["💛", "favorite", "favorito", "Pizza is my favorite food."],  // 240
  ["😴", "sleep", "dormir", "I sleep eight hours every night."],  // 241
  ["🐦", "bird", "pájaro", "A bird is singing outside."],  // 242
  ["👩‍🍳", "cook", "cocinar", "My grandpa likes to cook empanadas."],  // 243
  ["👟", "dirty", "sucio", "My shoes are dirty."],  // 244
  ["🐟", "fish", "pez / pescado", "I have a red fish."],  // 245
  ["☔", "if", "si (condición)", "If it rains, we stay inside."],  // 246
  ["🧹", "clean", "limpiar", "Let's clean the classroom together."],  // 247
  ["🐴", "horse", "caballo", "The horse runs very fast."],  // 248
  ["🤫", "quiet", "tranquilo / silencioso", "Please be quiet in the library."],  // 249
  ["🧼", "wash", "lavar", "Wash your hands before eating."],  // 250
  ["☀️", "sun", "sol", "The sun is very strong today."],  // 251
  ["📝", "study", "estudiar", "I study for my English test."],  // 252
  ["🔊", "loud", "fuerte / ruidoso", "The music is too loud."],  // 253
  ["🌕", "moon", "luna", "The moon is full tonight."],  // 254
  ["🏊", "teach", "enseñar", "Can you teach me to swim?"],  // 255
  ["⭐", "star", "estrella", "Make a wish on a star."],  // 256
  ["👫", "with", "con", "I go to school with my brother."],  // 257
  ["⛑️", "safe", "seguro", "Wear a helmet to be safe."],  // 258
  ["🧳", "visit", "visitar", "We visit my cousins in the south."],  // 259
  ["☁️", "sky", "cielo", "The sky is blue and clear."],  // 260
  ["🎨", "choose", "elegir", "Choose your favorite color."],  // 261
  ["⚠️", "dangerous", "peligroso", "Swimming alone is dangerous."],  // 262
  ["🌧️", "rain", "lluvia", "I love the sound of rain."],  // 263
  ["💃", "dance", "bailar", "We dance cueca in September."],  // 264
  ["❄️", "snow", "nieve", "There is snow on the Andes."],  // 265
  ["🤑", "rich", "rico (con dinero)", "The king was very rich."],  // 266
  ["🎶", "sing", "cantar", "We sing songs in English class."],  // 267
  ["🌬️", "wind", "viento", "The wind is very strong today."],  // 268
  ["🎧", "without", "sin", "I can't live without music."],  // 269
  ["🏊‍♂️", "swim", "nadar", "I swim in the lake in summer."],  // 270
  ["🌦️", "weather", "clima / tiempo", "What's the weather like today?"],  // 271
  ["🥺", "poor", "pobre", "The poor cat was wet and cold."],  // 272
  ["🎨", "draw", "dibujar", "I like to draw animals."],  // 273
  ["🍃", "season", "estación (del año)", "Spring is my favorite season."],  // 274
  ["🏋️", "heavy", "pesado", "This box is very heavy."],  // 275
  ["🎂", "birthday", "cumpleaños", "Happy birthday to you!"],  // 276
  ["🚲", "ride", "andar (en bici / a caballo)", "I ride my bike to school."],  // 277
  ["🥳", "party", "fiesta", "Are you coming to my party?"],  // 278
  ["✈️", "travel", "viajar", "I want to travel to London."],  // 279
  ["🏷️", "cheap", "barato", "These apples are cheap today."],  // 280
  ["👋", "everyone", "todos", "Hello, everyone!"],  // 281
  ["🎁", "gift", "regalo", "Thank you for the gift!"],  // 282
  ["🎉", "celebrate", "celebrar", "We celebrate my birthday in June."],  // 283
  ["💸", "expensive", "caro", "That phone is too expensive."],  // 284
  ["🏝️", "holiday", "vacaciones / feriado", "Summer holiday starts in December."],  // 285
  ["♻️", "recycle", "reciclar", "I recycle bottles and paper."],  // 286
  ["🏟️", "team", "equipo", "Our team won the match."],  // 287
  ["🦁", "brave", "valiente", "The firefighter was very brave."],  // 288
  ["🌱", "grow", "crecer", "Plants grow with water and sun."],  // 289
  ["🏐", "ball", "pelota", "Pass me the ball."],  // 290
  ["🎁", "something", "algo", "I have something for you."],  // 291
  ["🏆", "win", "ganar", "Our team wants to win the game."],  // 292
  ["🥇", "proud", "orgulloso", "I'm proud of you!"],  // 293
  ["🏅", "sport", "deporte", "Football is a popular sport in Chile."],  // 294
  ["🚪", "close", "cerrar", "Close the door, please."],  // 295
  ["🍏", "health", "salud", "Sleep is important for your health."],  // 296
  ["🍀", "lucky", "afortunado / con suerte", "Today is my lucky day!"],  // 297
  ["🙈", "forget", "olvidar", "Don't forget your homework!"],  // 298
  ["🗺️", "language", "idioma", "English is an international language."],  // 299
  ["🎧", "listen", "escuchar", "Listen to the song carefully."],  // 300
  ["🌟", "famous", "famoso", "Gabriela Mistral is a famous poet."],  // 301
  ["📒", "lesson", "lección / clase", "Today's lesson is about animals."],  // 302
  ["📭", "nothing", "nada", "There is nothing in the box."],  // 303
  ["✅", "answer", "responder", "Answer the questions in English."],  // 304
  ["📝", "homework", "tarea", "I finish my homework before dinner."],  // 305
  ["🪜", "careful", "cuidadoso", "Be careful on the stairs."],  // 306
  ["🎹", "practice", "practicar", "I practice the piano every day."],  // 307
  ["💯", "test", "prueba", "I studied a lot for the test."],  // 308
  ["😎", "enjoy", "disfrutar", "Enjoy your holiday!"],  // 309
  ["📄", "paper", "papel", "Write your answer on the paper."],  // 310
  ["🫶", "honest", "honesto", "Always be honest."],  // 311
  ["🍪", "share", "compartir", "Share your snack with a friend."],  // 312
  ["👕", "clothes", "ropa", "Put your clothes in the closet."],  // 313
  ["✅", "everything", "todo", "Everything is ready!"],  // 314
  ["🎨", "creative", "creativo", "My sister is very creative."],  // 315
  ["😁", "smile", "sonreír", "Smile for the photo!"],  // 316
  ["👟", "shoes", "zapatos", "These shoes are new."],  // 317
  ["😂", "laugh", "reír", "My friends make me laugh."],  // 318
  ["👔", "shirt", "camisa / polera", "I wear a white shirt to school."],  // 319
  ["🌈", "wonderful", "maravilloso", "What a wonderful day!"],  // 320
  ["👒", "hat", "sombrero / gorro", "Wear a hat in the sun."],  // 321
  ["😢", "cry", "llorar", "The baby started to cry."],  // 322
  ["🌑", "dark", "oscuro", "It gets dark early in winter."],  // 323
  ["☔", "umbrella", "paraguas", "Take your umbrella, it's raining!"],  // 324
  ["🦘", "jump", "saltar", "Kangaroos can jump very high."],  // 325
  ["🚪", "someone", "alguien", "Someone is at the door."],  // 326
  ["🧳", "suitcase", "maleta", "My suitcase is ready for the trip."],  // 327
  ["🧗", "climb", "escalar / trepar", "We climb the hill to see the view."],  // 328
  ["🔆", "bright", "brillante / luminoso", "The sun is very bright."],  // 329
  ["🗺️", "map", "mapa", "Let's check the map to find the museum."],  // 330
  ["🕊️", "fly", "volar", "Birds fly south in winter."],  // 331
  ["⚪", "round", "redondo", "The Earth is round."],  // 332
  ["🎒", "backpack", "mochila", "My backpack is very heavy today."],  // 333
  ["🧤", "catch", "atrapar", "Catch the ball!"],  // 334
  ["📚", "library", "biblioteca", "I borrow books from the library."],  // 335
  ["🤾", "throw", "lanzar", "Throw the ball to me."],  // 336
  ["🧸", "soft", "suave", "My cat's fur is soft."],  // 337
  ["1️⃣", "first", "primero", "First, wash your hands."],  // 338
  ["🎭", "tradition", "tradición", "Fiestas Patrias is a Chilean tradition."],  // 339
  ["🥅", "kick", "patear", "Kick the ball into the goal."],  // 340
  ["🍯", "sweet", "dulce", "Honey is sweet."],  // 341
  ["🌍", "planet", "planeta", "We must take care of our planet."],  // 342
  ["🐷", "save", "ahorrar / salvar", "I save money in my piggy bank."],  // 343
  ["🐶", "pet", "mascota", "My pet is a small dog."],  // 344
  ["🥐", "fresh", "fresco", "I like fresh bread."],  // 345
  ["🗓️", "plan", "planear", "Let's plan a trip to the beach."],  // 346
  ["🌈", "rainbow", "arcoíris", "After the rain, we saw a rainbow."],  // 347
  ["🔚", "last", "último", "This is the last question."],  // 348
  ["🏁", "finish", "terminar", "Finish your work before break."],  // 349
  ["🍳", "kitchen", "cocina", "Mom is cooking in the kitchen."],  // 350
  ["📣", "popular", "popular", "This song is very popular."],  // 351
  ["🚌", "arrive", "llegar", "The bus will arrive soon."],  // 352
  ["🛁", "bathroom", "baño", "The bathroom is upstairs."],  // 353
  ["🔓", "possible", "posible", "Everything is possible if you try."],  // 354
  ["🔁", "return", "volver / devolver", "Return the book to the library."],  // 355
  ["🧦", "floor", "piso / suelo", "Don't leave your clothes on the floor."],  // 356
  ["👍", "agree", "estar de acuerdo", "I agree with you."],  // 357
  ["🔑", "key", "llave", "I lost the key to my house."],  // 358
  ["🎖️", "special", "especial", "Today is a special day."],  // 359
  ["➡️", "next", "siguiente / próximo", "See you next week!"],  // 360
  ["🌈", "imagine", "imaginar", "Imagine a world without plastic."],  // 361
  ["📦", "box", "caja", "The toys are in the box."],  // 362
  ["😊", "nice", "lindo / agradable", "Nice to see you again!"],  // 363
  ["🛡️", "protect", "proteger", "We must protect wild animals."],  // 364
  ["🛍️", "bag", "bolso / bolsa", "Use a reusable bag for shopping."]  // 365
];
