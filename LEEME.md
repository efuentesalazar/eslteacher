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

## Publicar cambios
Sube los archivos modificados a https://github.com/efuentesalazar/eslteacher (Add file → Upload files → Commit changes). Vercel publica eslteacher.cl solo en 1–2 minutos.

## Notas
- Grabar la voz funciona en Google Chrome y Microsoft Edge (computador y Android). Safari en iPhone puede fallar; Firefox no lo permite.
- El respaldo de la página anterior está en `Documents\Salesianos\respaldo-eslteacher-2026-10-28`.
- El respaldo de antes de las novedades del 29-10-2026 está en `Documents\Salesianos\respaldo-eslteacher-2026-10-29`.
