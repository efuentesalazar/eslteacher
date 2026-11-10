/* Portada de eslteacher.cl · parte de index.html (se cargan en orden: datos, juego, mundos, voz, diagnostico, zone, perfil) */
/* =====================================================================
   DATOS — edita aquí tus cursos, juegos y palabras (igual que antes)
   ===================================================================== */
const COURSES = [
  { id:"5basico", num:"5°", level:"Básico", folder:"5° BASICO", icon:"☀️",
    games:[
      { title:"Weather Heroes", desc:"3D adventure! Fix the Weather Machine, wear the right clothes and play online with your class.", icon:"🌈", unit:"Unit 4", file:"Weather_Heroes/index.html", shot:"weather-heroes", isNew:true },
      { title:"Weather Worlds", desc:"Explore the worlds and learn weather words.", icon:"🌦️", unit:"Unit 4", file:"Game_Weather_Worlds_Unit4.html", shot:"weather-worlds", isNew:true }
    ]},
  { id:"6basico", num:"6°", level:"Básico", folder:"6° BASICO", icon:"✈️",
    games:[
      { title:"Past Quest", desc:"3D adventure! Use the past simple to get the village's memories back. Story mode and online mode.", icon:"🧭", unit:"Past simple", file:"Past_Quest/index.html", shot:"past-quest", isNew:true },
      { title:"Let's Travel City", desc:"Travel around the city and describe places.", icon:"🏙️", unit:"Unit 4", file:"Lets_Travel_City.html", shot:"lets-travel-city", isNew:true },
      { title:"Ludo World Tour", desc:"3D Ludo online! Answer in English to roll the dice.", icon:"🎲", unit:"Unit 4", file:"Ludo_World_Tour/index.html", shot:"ludo-world-tour", isNew:true }
    ]},
  { id:"7basico", num:"7°", level:"Básico", folder:"7° BASICO", icon:"🌱",
    games:[
      { title:"Green Quest", desc:"Open-world 3D adventure! Explore Eco Island, help 10 people on the roads and defeat Captain Smog: A2 readings, should / must / have to and the zero conditional. Story mode and online mode.", icon:"🌳", unit:"Unit 4", file:"Green_Quest/index.html", shot:"green-quest", isNew:true },
      { title:"Realms of Knowledge", desc:"Choose your race, read, fight and evolve in English! (B1)", icon:"🗡️", file:"Realms_of_Knowledge.html", shot:"realms-of-knowledge", isNew:true }
    ]},
  { id:"8basico", num:"8°", level:"Básico", folder:"8° BASICO", icon:"🌍",
    games:[
      { title:"Wordbound", desc:"3D open-world RPG! Explore five realms, meet elves, dwarves, orcs and friendly skeletons, and complete 40 missions: talk, listen, read and follow directions in English. Equip armour and weapons, fight monsters and bring back the Crown of Words.", icon:"⚔️", unit:"Adventure", file:"Wordbound/index.html", shot:"wordbound", isNew:true },
      { title:"Mission 2050", desc:"Cooperative 3D open world! Create a team with a code, explore Skyport 2050 together and defeat GLITCH: B1 readings, future will, first conditional and vocabulary in context. Team or solo.", icon:"🤖", unit:"Unit 4", file:"Mission_2050/index.html", shot:"mission-2050", isNew:true },
      { title:"Future Worlds", desc:"Explore Neo City, Green Valley and Fossil Valley!", icon:"🚀", file:"Future_Worlds.html", shot:"future-worlds", isNew:true },
      { title:"Realms of Knowledge", desc:"Choose your race, read, fight and evolve in English!", icon:"🗡️", file:"Realms_of_Knowledge.html", shot:"realms-of-knowledge", isNew:true }
    ]},
  { id:"1medio", num:"1°", level:"Medio", folder:"1° MEDIO", icon:"🎉",
    games:[
      { title:"Festival Quest", desc:"3D open world! Bring back the 5 festival lanterns and help 10 festival friends on the roads: B1 readings, vocabulary, language in use and question tags. Story mode and online mode.", icon:"🏮", unit:"Unit 4", file:"Festival_Quest/index.html", shot:"festival-quest", isNew:true },
      { title:"Festival Worlds", desc:"Discover festivals around the world.", icon:"🎪", unit:"Unit 4", file:"Mundo_Unit4_Festival_Worlds.html", shot:"festival-worlds" },
      { title:"Festival Worlds 2", desc:"More festivals, more challenges!", icon:"🎆", unit:"Unit 4", file:"Festival_Worlds_2.html", shot:"festival-worlds-2", isNew:true },
      { title:"Traditions", desc:"Learn about traditions from different cultures.", icon:"🏮", unit:"Unit 4", file:"Mundo_Unit4_Traditions_1.html", shot:"traditions" },
      { title:"Realms of Knowledge", desc:"Choose your race, read, fight and evolve in English! (B1)", icon:"🗡️", file:"Realms_of_Knowledge.html", shot:"realms-of-knowledge", isNew:true }
    ]},
  { id:"3medio", num:"3°", level:"Medio", folder:"3° MEDIO", icon:"💬",
    games:[
      { title:"Trend City", desc:"3D open world! Investigate HYPE, the AI that controls the trends: social media, fast fashion, labour laws and the Atacama clothing mountains. B1 readings, FCE-style vocabulary, language in use and word formation, 12 side missions. Story mode and online mode.", icon:"📰", unit:"Unit 4", file:"Trend_City/index.html", shot:"trend-city", isNew:true },
      { title:"TikTok vs. Vine", desc:"Compare social media apps and share your opinions in English.", icon:"📱", unit:"Unit 4", file:"Mundo_Unit4_TikTok_vs_Vine.html", shot:"tiktok-vs-vine", isNew:true },
      { title:"Realms of Knowledge", desc:"Choose your race, read, fight and evolve in English! (B1)", icon:"🗡️", file:"Realms_of_Knowledge.html", shot:"realms-of-knowledge", isNew:true }
    ]},
  { id:"englishweek", num:"English Week", level:"2026", folder:"English Week 2026", icon:"🏆",
    games:[
      { title:"Chest Quest", desc:"Explore the UK, the USA and Australia. Open chests and answer in English!", icon:"🗝️", unit:"English Week", file:"english-week-2026.html", shot:"chest-quest", isNew:true }
    ]}
];
/* Capturas de los juegos: assets/games/<shot>.webp (800x450). Para un juego nuevo, agrega su captura ahí. */

/* Cursos del colegio (para ingresar con RUT). "course" conecta cada curso con sus juegos. */
const SECTIONS = [
  { id:"5°A", course:"5basico" }, { id:"5°B", course:"5basico" },
  { id:"6°A", course:"6basico" }, { id:"6°B", course:"6basico" },
  { id:"7°A", course:"7basico" }, { id:"7°B", course:"7basico" },
  { id:"8°A", course:"8basico" }, { id:"8°B", course:"8basico" },
  { id:"1°A HC", course:"1medio" }, { id:"1°B HC", course:"1medio" },
  { id:"3°B HC", course:"3medio" }
];
/* Base de datos (Supabase). La clave "publishable" es pública por diseño: solo permite llamar
   las funciones eslt_* (ingresar, enviar reporte), nunca leer la nómina. */
const DB_URL = "https://tlihbmgokuhvppbchvrz.supabase.co";
const DB_KEY = "sb_publishable_nGgOCuUUuXKK7gx957LYhg_Jf2V4TJC";

/* Las 365 palabras del día están en palabras.js */

const TWISTERS = [
  ["She sells seashells by the seashore.","Practica: sh / s"],
  ["Three thin thinkers think thick thoughts.","Practica: th"],
  ["Very well, Victor, we will vote.","Practica: v / w"],
  ["I think this is the third Thursday.","Practica: th"],
  ["Red lorry, yellow lorry.","Practica: r / l / y"],
  ["How much wood would a woodchuck chuck?","Practica: w / ch"],
  ["Big black bugs bleed blue blood.","Practica: b / l"],
  ["Six sticky skeletons.","Practica: s + consonante (sin 'e' al inicio)"],
  ["Is this the ship or the sheep?","Practica: i corta / i larga"],
  ["The fat cat sat on a black hat.","Practica: a abierta /æ/"],
  ["Uncle Gus runs up to the bus.","Practica: u corta /ʌ/"],
  ["Harry has a happy hamster at home.","Practica: h aspirada"],
  ["Zebras zigzag at the zoo.","Practica: z sonora"],
  ["The king is singing a long song.","Practica: ng final"],
  ["She walked, played and wanted to rest.","Practica: -ed"],
  ["Yes, Jack, your yellow jacket is in the yard.","Practica: y / j"],
  ["Chips and cheese for Charlie's chair.","Practica: ch"]
];


/* ====== De aquí hacia abajo no es necesario cambiar nada ====== */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
const store = { get(k, d){ try { const v = localStorage.getItem("eslt_" + k); return v == null ? d : JSON.parse(v); } catch(e){ return d; } },
                set(k, v){ try { localStorage.setItem("eslt_" + k, JSON.stringify(v)); } catch(e){} } };
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Registro de respuestas para el Panel del profe → "Análisis de juegos" (el mismo que usan los juegos).
   Solo guarda si el alumno inició sesión. Juegos: "portada" (palabra del día, desafío, pronunciación)
   y "challenge-zone". Para registrar algo nuevo: logPortada(juego, {activity, item:{q, k, id?}, chosen, right, ok, ms}). */
window.ESLT_PORTADA = true;            // la portada ya comprueba la sesión por su cuenta (perfil.js)
let trackMod = null; const trackPend = [];
function logPortada(game, d){
  try { if (trackMod) trackMod.logAnswer(game, d); else if (trackPend.length < 200) trackPend.push([game, d]); } catch(e){}
}
import("/assets/js/eslt-track.js").then(m => { trackMod = m; trackPend.splice(0).forEach(a => m.logAnswer(a[0], a[1])); }).catch(() => {});

