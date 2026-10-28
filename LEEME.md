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

## Publicar cambios
Sube los archivos modificados a https://github.com/efuentesalazar/eslteacher (Add file → Upload files → Commit changes). Vercel publica eslteacher.cl solo en 1–2 minutos.

## Notas
- Grabar la voz funciona en Google Chrome y Microsoft Edge (computador y Android). Safari en iPhone puede fallar; Firefox no lo permite.
- El respaldo de la página anterior está en `Documents\Salesianos\respaldo-eslteacher-2026-10-28`.
