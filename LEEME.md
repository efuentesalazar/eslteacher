# Nuevo diseño de eslteacher.cl

Esta carpeta es una copia de tu repositorio de GitHub (efuentesalazar/eslteacher) con el nuevo diseño ya instalado.

## Lo nuevo
- `index.html`: la nueva página de inicio. Mantiene tus cursos, juegos, las 30 palabras, Word of the day y Quick challenge, y agrega "Speak with AI".
- `assets/mundos/`: las 6 imágenes de fondo (isles, ice, dunes, neon, aurora, forest). Para cambiar un fondo, reemplaza la imagen manteniendo el mismo nombre.
- `api/pronunciation.js`: la función que conecta "Speak with AI" con la IA (Claude).
- `package.json`: le dice a Vercel qué librerías instalar para esa función.

Tu `index.html` anterior quedó respaldado en `Documents\Salesianos\respaldo-eslteacher-2026-10-28`.

## Cómo publicarlo (desde la página de GitHub)
1. Primero, en Vercel → proyecto **eslteacher** → Settings → Environment Variables, agrega:
   - Nombre: `ANTHROPIC_API_KEY`
   - Valor: tu clave de https://console.anthropic.com (Settings → API Keys)
2. Abre https://github.com/efuentesalazar/eslteacher → **Add file → Upload files**.
3. Arrastra desde esta carpeta: `index.html`, `package.json`, la carpeta `api` y la carpeta `assets`.
4. Escribe un mensaje (por ejemplo "Nuevo diseño con mundos y Speak with AI") y presiona **Commit changes**.
5. Vercel publica eslteacher.cl solo en 1–2 minutos.

Si algo sale mal, sube de nuevo el `index.html` del respaldo y el sitio vuelve a como estaba.

Si la clave de Anthropic no está configurada, la página igual funciona: Profe AI entrega una retroalimentación básica automática.

## Editar contenido
En `index.html`, busca `DATOS`: ahí están `COURSES` (cursos y juegos), `WORDS` (palabras) y `TWISTERS` (trabalenguas), con el mismo formato que antes.

## Notas
- Grabar la voz funciona en Google Chrome y Microsoft Edge (computador y Android). Safari en iPhone puede fallar; Firefox no lo permite.
- La IA no escucha el audio directamente: compara la frase con lo que el navegador entendió y desde ahí deduce qué sonidos mejorar.
- Cada intento consume un poco de saldo de la API de Anthropic. Puedes poner un límite de gasto mensual en la consola de Anthropic.
