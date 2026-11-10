/* Juegos de eslteacher.cl que registran respuestas, con el nombre en español de cada habilidad.
   Lo usan el Panel del profe (profe.html → "Análisis de juegos" y ficha del alumno) y "Mi avance" (mi-avance.html).
   PARA AGREGAR UN JUEGO: copia una línea y cambia su id (el mismo GAME del juego), nombre, cursos y habilidades
   (códigos de habilidad de máximo 4 letras). */
(function () {
  const SECTIONS = ["5°A","5°B","6°A","6°B","7°A","7°B","8°A","8°B","1°A HC","1°B HC","3°B HC"];
  // Juegos "Worlds": lectura en 3 niveles (como el Simce) + lo que practican los cofres
  function LECTURA(cofres){ return { L: "Lectura: localizar", I: "Lectura: interpretar", R: "Lectura: reflexionar", C: cofres }; }
  window.ESLT_GAMES = {
    "festival-quest-1m": { name: "Festival Quest · 1° medio", sections: ["1°A HC","1°B HC"],
      skills: { E: "Lectura explícita", I: "Lectura inferencial", V: "Vocabulario en contexto", L: "Uso del lenguaje", Q: "Question tags" } },
    "weather-heroes-5b": { name: "Weather Heroes · 5° básico", sections: ["5°A","5°B"],
      skills: { V: "Vocabulario", A: "Audición", R: "Lectura", G: "Gramática", O: "Ordenar oraciones", C: "Completar textos" } },
    "weather-worlds-5b": { name: "Weather Worlds · 5° básico", sections: ["5°A","5°B"], skills: LECTURA("Vocabulario (cofres)") },
    "travel-city-6b": { name: "Let's Travel City · 6° básico", sections: ["6°A","6°B"],
      skills: { R: "Lectura", V: "Vocabulario y estructuras", S: "Deletrear", O: "Ordenar oraciones", P: "Encontrar lugares" } },
    "past-quest-6b": { name: "Past Quest · 6° básico", sections: ["6°A","6°B"],
      skills: { reg: "Verbos regulares (-ed)", irr: "Verbos irregulares", neg: "Negativo (didn't)", int: "Preguntas (Did…? / Wh-)", adj: "Adjetivos + was/were", mix: "Repaso mixto", read: "Lectura" } },
    "ludo-world-6b": { name: "Ludo World Tour · 6° básico", sections: ["6°A","6°B"],
      skills: { voca: "Lugares y transporte", adj: "Adjetivos", past: "Pasado simple", wh: "Preguntas WH", read: "Lectura" } },
    "green-quest-7b": { name: "Green Quest · 7° básico", sections: ["7°A","7°B"],
      skills: { E: "Lectura explícita", I: "Lectura inferencial", A: "Modales: consejo (should/could)", R: "Modales: reglas (must/have to)", Z: "Zero conditional", V: "Vocabulario verde" } },
    "mission-2050-8b": { name: "Mission 2050 · 8° básico", sections: ["8°A","8°B"],
      skills: { READ: "Lectura explícita", INF: "Lectura inferencial", VOC: "Vocabulario en contexto", WILL: "Futuro will", COND: "Primer condicional" } },
    "wordbound": { name: "Wordbound · 8° básico", sections: ["8°A","8°B"],
      skills: { CONV: "Conversación (respuesta adecuada)", READ: "Comprensión lectora", LIST: "Comprensión auditiva", INST: "Seguir instrucciones", VOC: "Vocabulario en contexto" } },
    "future-worlds-8b": { name: "Future Worlds · 8° básico", sections: ["8°A","8°B"], skills: LECTURA("Condicionales (cofres)") },
    "festival-worlds-1m": { name: "Festival Worlds · 1° medio", sections: ["1°A HC","1°B HC"], skills: LECTURA("Vocabulario (cofres)") },
    "festival-worlds2-1m": { name: "Festival Worlds 2 · 1° medio", sections: ["1°A HC","1°B HC"], skills: LECTURA("Vocabulario (cofres)") },
    "traditions-1m": { name: "Traditions · 1° medio", sections: ["1°A HC","1°B HC"], skills: LECTURA("Vocabulario (cofres)") },
    "tiktok-vine-3m": { name: "TikTok vs. Vine · 3° medio", sections: ["3°B HC"], skills: LECTURA("Vocabulario (cofres)") },
    "trend-city-3m": { name: "Trend City · 3° medio", sections: ["3°B HC"],
      skills: { E: "Lectura explícita", I: "Lectura inferencial", V: "Vocabulario en contexto", L: "Uso del lenguaje (language in use)", W: "Formación de palabras" } },
    "portada": { name: "Portada: palabra del día, desafío y pronunciación (todos los cursos)", sections: SECTIONS,
      skills: { MEAN: "Vocabulario: qué significa", REV: "Vocabulario: cómo se dice en inglés", GAP: "Vocabulario: completar la oración", WRIT: "Palabra del día: escribir la palabra", PRON: "Pronunciación" } },
    "challenge-zone": { name: "Challenge Zone (todos los cursos)", sections: SECTIONS,
      skills: { SCR: "Ordenar oraciones", USE: "Uso del lenguaje", VOC: "Vocabulario en contexto", MIS: "Encontrar el error", WF: "Formación de palabras", DICT: "Dictado", READ: "Lectura" } },
    "chest-quest-ew": { name: "Chest Quest · English Week (todos los cursos)", sections: SECTIONS,
      skills: { V: "Vocabulario", G: "Gramática", R: "Lectura" } }
  };
})();
