# Diseño de eslteacher.cl

Esta carpeta es una copia de tu repositorio de GitHub (efuentesalazar/eslteacher).

## Qué hay
- `index.html`: la página de inicio con los 6 mundos, tus cursos y juegos, Word of the day, Quick challenge y la práctica de pronunciación "Speak & shine".
- `assets/mundos/`: las 6 imágenes de fondo (isles, ice, dunes, neon, aurora, forest). Para cambiar un fondo, reemplaza la imagen manteniendo el mismo nombre.

La práctica de pronunciación es gratis: usa el reconocimiento de voz del navegador y calcula el puntaje y los consejos en el mismo computador del alumno. No usa ninguna API de pago.

## Palabra del día (palabras.js)
- `palabras.js` tiene las 365 palabras, una por cada día del año (1 de enero = palabra 1; 28 de octubre = palabra 301).
- Formato de cada línea: `["emoji", "palabra", "significado", "ejemplo"]`. El ejemplo debe contener la palabra exacta, porque se usa en el ejercicio "Complete".
- Los alumnos practican cada palabra en 3 pasos: completar la oración, escribir su propia oración y decirla en voz alta. Al completar los 3 pasos de la palabra de hoy suman un día a su racha.
- Quick challenge pregunta sobre las palabras de los últimos 30 días (o las 365, si el alumno lo elige), y la palabra de hoy aparece al inicio y cada 4 preguntas.

## Editar contenido
En `index.html`, busca `DATOS`: ahí están `COURSES` (cursos y juegos) y `TWISTERS` (trabalenguas).

## Novedades (29-10-2026)
- **Letra**: Fredoka (títulos) y Lexend (texto, muy legible). JetBrains Mono solo para números.
- **Botones con color y relieve**: verde = jugar/revisar, morado = escuchar/hablar, amarillo = pista, rojo = grabar.
- **Color por mundo**: cada sección tiene su color (celeste, naranjo, rosa neón, verde aurora…) y la barra superior lo toma al hacer scroll. Se cambian en el CSS, buscando `#worlds{--accent`.
- **Sonidos y confeti** al acertar o fallar, con botón 🔊/🔇 arriba. Sonidos de Kenney (CC0, libres) en `assets/sfx/`.
- **Perfil sin cuenta** (botón con el avatar arriba, o "Yo" en celular): apodo, curso, avatar, XP, racha, medallas y palabras difíciles. Se guarda solo en el dispositivo del alumno.
- **Reporte para el profe**: en el perfil, copia un resumen del progreso para pegarlo en Classroom.
- **Mis palabras difíciles**: las palabras que el alumno falla vuelven en el desafío hasta que las acierta 2 veces.
- **Modo proyector** (📺 Proyectar): palabra del día o desafío en pantalla completa con letra gigante. Esc para salir.
- **Barra inferior en celular** y botones más grandes para tocar.
- **App instalable** (`manifest.webmanifest` + `sw.js`): se puede agregar a la pantalla de inicio y funciona sin internet con la última versión vista.
- **Más liviana en celular**: fondos reducidos en `assets/mundos/m/` (47–88 KB) y cada fondo se descarga solo al acercarse a ese mundo.
- **Vista previa al compartir** el enlace por WhatsApp (`assets/og-image.jpg`) e íconos (`favicon.ico`, `assets/icons/`).
- Si cambias una imagen de `assets/mundos/`, cambia también su versión chica en `assets/mundos/m/` (mismo nombre).

## Novedades (30-10-2026)
- **Capturas de los juegos** en `assets/games/` (800x450). Cada juego en `COURSES` tiene `shot:"nombre"`. Al presionar un juego, su captura crece hasta llenar la pantalla y luego se abre.
- **Ingreso de alumnos**: en Mi perfil eligen su curso (5°A … 3°B HC), escriben su RUT y su clave de 4 dígitos.
- **Reporte al profe**: el botón "Enviar reporte al profe" guarda el progreso en la base de datos.
- **Panel del profe**: `eslteacher.cl/profe.html` (con tu clave). Filtros por curso, búsqueda, historial y descarga a Excel.
- Base de datos: Supabase, proyecto `reinos-del-saber-8basico`, esquema privado `eslt` (separado del juego). El RUT se guarda cifrado (no se puede leer) y las claves con bcrypt. Máx. 8 intentos fallidos cada 15 minutos por RUT.
- **Carpeta privada** `Documents\Salesianos\eslteacher-PRIVADO` (NO subir a GitHub): listas de claves por curso para repartir y la clave del panel.
- **Progreso en la nube** (30-10-2026): con sesión iniciada, cada avance se guarda solo a los pocos segundos. Si el alumno usa otro dispositivo, al ingresar se combina lo mejor de ambos. Al presionar "Salir" se borra el progreso de ese equipo (queda en la nube), para que en computadores compartidos no se mezclen alumnos.
- **Reporte automático**: cada guardado actualiza un reporte por alumno por día. En el panel aparecen como "🔄 Automático"; los del botón como "📤 Enviado". La columna "Días activos" cuenta los días con práctica.
- **Voz natural** (02-11-2026): la página elige la voz más natural del navegador (Edge: "Aria/Jenny Online (Natural)", Chrome: "Google US English", iPhone: voces "Enhanced"). En "Speak & shine" hay un selector "🗣 Voice" para cambiarla.
- **Retroalimentación técnica de pronunciación**: compara lo que había que decir con lo que entendió el reconocedor y detecta el sonido que falló (th, v/b, s inicial, h, y/j, sh, ch, z, r/l, w, ng, consonante final, -s, -ed, i corta/larga, æ, ʌ, palabras cortas). Muestra símbolo fonético, cómo poner boca y lengua, un par mínimo para escuchar y un trabalenguas del sonido. Los sonidos con más errores aparecen en el perfil del alumno y en el panel ("Sonidos a mejorar").
- **Challenge Zone** (02-11-2026): sección nueva con 7 tipos de ejercicio (Sentence scramble, Language in use, Vocabulary in context, Find the mistake, Word formation, Dictation, Mini reading) en 3 niveles según el currículum: A1 (5°–6°), A2 (7°–8°), B1 (1°–3° Medio). El nivel se elige solo según el curso del alumno, y puede cambiarse. Cada ronda da XP, estrellas y puede dar 2 medallas nuevas. El panel muestra el logro por habilidad (Gramática, Vocabulario, Audición, Lectura).
- Fondo de la Challenge Zone: imagen de laser tag de bloques creada con Canva (`assets/mundos/zone.webp` y `assets/mundos/m/zone.webp`), con disparos láser, chispas y letreros de neón animados encima (`ZONE_SHOTS` y `ZONE_NEON` en index.html).
- Los ejercicios están en `ejercicios.js` (105 por nivel). Al inicio del archivo se explica cómo agregar más: se copia una línea y se cambia el contenido.
- Si llega un alumno nuevo o cambia la nómina: pídele a Claude que vuelva a importar `NÓMINAS DE CURSOS.xlsx` (las claves existentes no cambian).

## Publicar cambios
Sube los archivos modificados a https://github.com/efuentesalazar/eslteacher (Add file → Upload files → Commit changes). Vercel publica eslteacher.cl solo en 1–2 minutos.

## Notas
- Grabar la voz funciona en Google Chrome y Microsoft Edge (computador y Android). Safari en iPhone puede fallar; Firefox no lo permite.
- El respaldo de la página anterior está en `Documents\Salesianos\respaldo-eslteacher-2026-10-28`.
- El respaldo de antes de las novedades del 29-10-2026 está en `Documents\Salesianos\respaldo-eslteacher-2026-10-29`.

## Novedades (03-11-2026)
- **Weather Heroes** (5° básico, Unit 4): juego 3D en `5° BASICO/Weather_Heroes/` con modo historia y modo online por salas. Los ejercicios se editan en `5° BASICO/Weather_Heroes/js/content.js`. Captura en `assets/games/weather-heroes.webp`.

## Novedades (04-11-2026)
- **Past Quest** (6° básico, pasado simple): aventura 3D con modo historia (6 capítulos) y modo online por salas. Publicado como proyecto Vercel aparte (`past-quest-6basico`, https://past-quest-6basico.vercel.app). En el sitio solo hay un acceso: `6° BASICO/Past_Quest.html` (redirige) y la captura `assets/games/past-quest.webp`. El código del juego está en `Documents\Salesianos\Past Quest 6 basico`.

## Novedades (04-11-2026)
- **Festival Quest** (1° medio, Unit 4 "Traditions and festivities"): juego 3D en `1° MEDIO/Festival_Quest/` con modo historia (5 festivales: Day of the Dead, Lunar New Year, Fiestas Patrias, Holi y We Tripantu) y modo online sin salas (se entra solo, máximo 6 por sala; código de curso opcional). Lecturas B1 con preguntas explícitas e implícitas, vocabulary in context, language in use y question tags. Los contenidos se editan en `1° MEDIO/Festival_Quest/js/content.js`. Captura en `assets/games/festival-quest.webp`.

## Novedades (04-11-2026)
- **Green Quest** (7° básico, Unit 4 "Green Issues"): juego 3D en `7° BASICO/Green_Quest/` con modo historia (5 zonas: Whispering Forest, Blue Bay, Recycle City, Sunny Farm y Windy Hills; jefe final Captain Smog) y modo online sin salas (máximo 6 por sala; código de curso opcional). Lecturas A2 con preguntas explícitas e implícitas, modales (should / shouldn't / could / must / mustn't / have to / don't have to) y zero conditional. Los contenidos se editan en `7° BASICO/Green_Quest/js/content.js`. Captura en `assets/games/green-quest.webp`. Código original en `Documents\Salesianos\Green Quest 7 basico`. Versión 2 (04-11-2026): mundo abierto mucho más grande, minimapa y 10 misiones secundarias en los caminos (`SIDE` en content.js).

- **Festival Quest v2** (04-11-2026): isla más grande con caminos, 6 lugares para explorar, minimapa (tecla M) y 10 misiones secundarias "Festival friends" (lecturas B1 cortas). Las misiones se editan en `1° MEDIO/Festival_Quest/js/side.js`.

## Novedades (04-11-2026): Análisis de juegos
- **Cada respuesta queda guardada**: en Festival Quest (1° medio), cada pregunta que responde un alumno con sesión iniciada en eslteacher.cl se guarda con la pregunta, la opción elegida, si acertó, la habilidad y el tiempo que tardó. Si se corta internet, las respuestas esperan en el equipo y se envían después.
- En el menú del juego aparece si el alumno tiene sesión iniciada ("Tu profe verá tu avance") o un aviso para que entre primero en eslteacher.cl → Mi perfil.
- **Panel del profe → pestaña "📊 Análisis de juegos"**: elige juego, curso y período. Muestra:
  - Qué hacer esta semana: habilidades que conviene volver a enseñar (con la pregunta más difícil y el error más elegido), grupos de apoyo por habilidad, quiénes no han jugado y fortalezas del grupo.
  - Mapa de calor alumno × habilidad (Necesita apoyo < 50% · En proceso 50–74% · Logrado ≥ 75%).
  - Preguntas más difíciles según el acierto al primer intento, con la respuesta errónea más elegida (la idea equivocada del grupo).
  - Logro por día. "⬇ Descargar Excel" baja el mapa de calor y las preguntas.
- Base de datos: tabla `eslt.answers` y funciones `eslt_log_answers` (juego) y `eslt_teacher_analysis` (panel).
- **Agregar otro juego**: copia `assets/js/eslt-track.js` dentro del juego, importa `logAnswer` y llámalo cada vez que el alumno responde (ver `1° MEDIO/Festival_Quest/js/main.js`, función `record`). Luego agrega el juego a `GAMES` en `profe.html` (id, nombre, cursos y nombres de las habilidades). El juego debe publicarse dentro de eslteacher.cl para usar la sesión del alumno.
- **Weather Heroes (5° básico)** también registra respuestas (id `weather-heroes-5b`). Como el alumno reintenta hasta acertar, se guarda cada intento; el panel usa el primer intento para medir lo que sabía. Habilidades: Vocabulario (unir y preguntas de vocabulario), Audición (listen), Lectura (preguntas de textos), Gramática (lecciones "Language in use"), Ordenar oraciones y Completar textos.

## Novedades (04-11-2026, tarde): más juegos con datos
- Ahora registran respuestas también: **Green Quest** (7° básico), **Weather Worlds** (5° básico), **Let's Travel City** (6° básico), **Future Worlds** (8° básico), **Festival Worlds**, **Festival Worlds 2** y **Traditions** (1° medio) y **TikTok vs. Vine** (3° medio).
- En los juegos "Worlds" se registran las preguntas de lectura con su nivel de comprensión (**Localizar · Interpretar · Reflexionar**) y los cofres (vocabulario; en Future Worlds, condicionales). En Let's Travel City: lectura, vocabulario, deletrear, ordenar oraciones y encontrar lugares.
- Los juegos de un solo archivo cargan `assets/js/eslt-log.js` (una línea antes de `</head>`) y llaman `eslLog(...)`. Al abrir el juego aparece arriba un aviso: si el alumno inició sesión ("Tu profe verá tu avance") o no.
- **Chest Quest (English Week)** también envía cada respuesta al panel (id `chest-quest-ew`, todos los cursos; habilidades Vocabulario, Gramática y Lectura). Sigue funcionando igual con su propio servidor y su panel `english-week-2026-panel.html`; esto solo agrega una copia de cada respuesta para verla junto a los demás juegos.
- Pendientes: Past Quest y Ludo World Tour (6° básico) y Realms of Knowledge están en otra dirección web y no ven la sesión de eslteacher.cl: necesitan que la portada les pase la sesión al abrirlos.

## Novedades (04-11-2026, noche): juegos en otra dirección
- **Past Quest** (pastquest6basico.eslteacher.cl, id `past-quest-6b`) y **Ludo World Tour** (juego.eslteacher.cl, id `ludo-world-6b`) registran respuestas.
- Cómo reciben la sesión: `6° BASICO/Past_Quest.html` y `6° BASICO/Travel_Tycoon.html` piden a la base un **código de un solo uso** (vence en 3 min) y abren el juego con `#eslt=código`. El juego (archivo `eslt-remote.js`, copia de `assets/js/eslt-remote.js`) lo canjea por una **sesión de 6 horas** y borra el código de la dirección. Si el alumno abre el juego directo (sin pasar por eslteacher.cl), ve un aviso de que su profe no verá su avance.
- Base de datos: tabla `eslt.handoffs` y funciones `eslt_handoff_create` / `eslt_handoff_redeem`.
- Estos dos juegos se publican en Vercel desde sus carpetas (no desde GitHub).

## Novedades (04-11-2026): Past Quest y Ludo World Tour ahora viven en eslteacher.cl
- **Past Quest** está en `6° BASICO/Past_Quest/` y **Ludo World Tour** en `6° BASICO/Ludo_World_Tour/`. Se publican con GitHub como todo lo demás y usan directamente la sesión del alumno (`assets/js/eslt-log.js`).
- Las direcciones antiguas (pastquest6basico.eslteacher.cl y juego.eslteacher.cl) redirigen a las nuevas. Past Quest trae el avance de la historia guardado en el navegador del alumno (`#pqsave=`), solo si en la nueva dirección aún no hay avance.
- `6° BASICO/Past_Quest.html` y `Travel_Tycoon.html` quedan como redirecciones a las nuevas carpetas.
- Regla desde ahora: **todo juego nuevo se publica dentro de eslteacher.cl** (ver `Documents\Salesianos\CLAUDE.md`).

## Qué datos se guardan (04-11-2026)
- **Solo se guardan las respuestas de alumnos con sesión iniciada** en eslteacher.cl (RUT + clave). Si un alumno juega sin sesión, el juego no envía nada y la base rechaza cualquier envío sin sesión válida.
- **Ludo World Tour** necesita guardar a los jugadores mientras dura la partida (nombre escrito, puntaje). Esos datos se **borran solos al día siguiente** (tarea diaria `limpiar-partidas-ludo` a las 03:00 en el proyecto Supabase `travel-tycoon-6basico`; nunca borra la sala permanente FREE). Si usas el modo clase, descarga el CSV el mismo día.
- **Chest Quest** (English Week) mantiene su servidor y panel propios, con los datos de quienes juegan el evento.
- **Realms of Knowledge** tiene cuentas propias (pendiente de unir a la sesión de eslteacher.cl).
- Corrección: en Ludo World Tour el código QR y el botón de salir apuntaban a la portada tras la mudanza; ahora apuntan al juego.

## Novedades (05-11-2026)
- **Trend City: The Hype Files** (3° medio, Unit 4 "What impact do trends have?"): juego 3D de mundo abierto en `3° MEDIO/Trend_City/` (id del panel `trend-city-3m`). Ciudad de 6×6 manzanas con 5 distritos (Hype Square, Pixel District, Mega Mall, Factory Row, Suburbs), autos, peatones, paraderos de bus para viajar rápido y una carretera al desierto de Atacama (ZOFRI y montañas de ropa).
- **Modo historia**: el alumno es reportero del diario "The Critical Eye" e investiga a HYPE, una IA que controla las tendencias. 5 misiones principales (The impact of trends on us · Social media: how it helps and hurts us · The impact of trends on society · Labour laws and fast fashion · Fast fashion in Chile), cada una con una lectura B1 larga (8 preguntas explícitas, inferenciales y de vocabulario) y 3 "archivos de evidencia" estilo FCE: Vocabulary in context, Language in use (con key word transformations escritas y un recuadro de gramática) y Word formation (respuestas escritas). Debate final contra HYPE y 12 misiones secundarias con lecturas cortas.
- **Modo online "Trend Rush"**: sin salas ni profe conectado: los alumnos entran solos (máximo 6 por sala; código de curso opcional). Rondas de 3 minutos tomando fichas # en Hype Square.
- Habilidades en el panel: E lectura explícita, I lectura inferencial, V vocabulario en contexto, L language in use, W formación de palabras.
- Los contenidos se editan en `3° MEDIO/Trend_City/js/content.js`. Captura en `assets/games/trend-city.webp`. Créditos (Kenney CC0, Poly Pizza CC-BY, música CoMiGo CC0) en el botón Credits del juego y en `CREDITOS.md` de la carpeta.

## Novedades (05-11-2026): celular en horizontal
- **Pantalla completa automática**: en celular o tablet, al girar la pantalla a horizontal el juego pasa a pantalla completa (con el primer toque, porque el navegador lo exige; aparece el aviso "Toca la pantalla…"). Al volver a vertical, sale de la pantalla completa. En computador no cambia nada. En iPhone Safari no existe esta función, así que ahí no hace nada.
- Archivo `assets/js/eslt-fullscreen.js`, cargado en todos los juegos del sitio (una línea antes de `</head>`). Para un juego nuevo: `<script src="../assets/js/eslt-fullscreen.js" defer></script>` (o `../../` si el juego está en su propia carpeta).
- Menús que se cortaban arriba en horizontal: corregidos en Trend City, Festival Quest, Green Quest y Past Quest (además, versión compacta de menú, HUD y preguntas para pantallas bajas).
- Realms of Knowledge está en otro sitio (realms*.eslteacher.cl) y no se cambió.

## Novedades (05-11-2026)
- **Mission 2050** (8° básico, Unit 4 "Future matters"): juego 3D cooperativo de mundo abierto en `8° BASICO/Mission_2050/`. Isla de Skyport (~700 m) con 4 distritos (Robot Lab, Eco Dome, Mars Base, Smart City), torre final de GLITCH, 12 ciudadanos con misiones cortas y 32 celdas de energía (algunas en plataformas a las que se llega con resortes).
- **Equipos**: un alumno presiona "Create a team" y recibe un código de 4 letras; los demás lo escriben en "Join team" (máximo 4). Se ven moverse en tiempo real, con nombre y color, en el mapa y en el minimapa. Se comunican con frases rápidas en inglés (sin chat libre). También hay modo solo.
- **Cooperación**: en la lectura cada agente recibe partes distintas del texto; en gramática y vocabulario cada pregunta la "lee" un agente distinto; la respuesta se confirma solo cuando todo el equipo elige la misma opción. Para encender cada distrito, cada agente debe pararse en una almohadilla distinta.
- Nivel B1: future will (predicciones, promesas, ofertas, decisiones), first conditional (if / unless) y vocabulario en contexto. Los contenidos se editan en `8° BASICO/Mission_2050/js/content.js`.
- Los equipos usan canales en vivo de Supabase (sin tablas: no se guarda nada de quien juega sin sesión). Las respuestas de alumnos con sesión van al Panel del profe ("mission-2050-8b": READ, INF, VOC, WILL, COND). Captura en `assets/games/mission-2050.webp`.
