/* Portada de eslteacher.cl · parte de index.html (se cargan en orden: datos, juego, mundos, voz, diagnostico, zone, perfil) */
/* =====================================================================
   MUNDOS — escenas ilustradas en SVG (todo el color vive aquí)
   ===================================================================== */
function rnd(seed){ return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
const lg = (id, stops) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o,c,a=1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("")}</linearGradient>`;
const rg = (id, stops) => `<radialGradient id="${id}">${stops.map(([o,c,a=1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join("")}</radialGradient>`;
const L = (d, inner) => `<g class="L" data-d="${d}">${inner}</g>`;
function stars(seed, n, maxY, color="#fff"){
  const r = rnd(seed); let o = "";
  for (let i = 0; i < n; i++) o += `<circle cx="${(r()*1600)|0}" cy="${(r()*maxY)|0}" r="${(r()*1.6+.4).toFixed(1)}" fill="${color}" opacity="${(r()*.6+.4).toFixed(2)}"/>`;
  return `<g class="twinkle">${o}</g>`;
}
function cloud(x, y, s, op=.9){
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity="${op}"><ellipse cx="0" cy="0" rx="120" ry="38"/><ellipse cx="-50" cy="-22" rx="60" ry="40"/><ellipse cx="40" cy="-30" rx="70" ry="50"/></g>`;
}

const SCENES = {
  isles: () => `<defs>${lg("is-sky",[[0,"#3c8de0"],[.55,"#9fd2ff"],[1,"#ffe6bf"]])}${rg("is-sun",[[0,"#fff8dc",.95],[1,"#fff8dc",0]])}
      ${lg("is-fall",[[0,"#fff",.9],[1,"#fff",0]])}${lg("is-rock",[[0,"#7a6a8c"],[1,"#3a3150"]])}</defs>
    <rect width="1600" height="900" fill="url(#is-sky)"/>
    <circle cx="1180" cy="230" r="320" fill="url(#is-sun)"/>
    ${L(.12, `<g fill="#86b6e0" opacity=".85">
        <path d="M120 470 q90 -40 180 0 q-40 90 -90 120 q-60 -40 -90 -120z"/><rect x="190" y="420" width="16" height="50"/><path d="M186 420 l12 -24 l12 24z"/>
        <path d="M1320 520 q70 -30 150 0 q-30 70 -75 95 q-50 -30 -75 -95z"/></g>
      <g class="drift2">${cloud(300,250,.9,.7)}${cloud(1400,330,.7,.6)}</g>`)}
    ${L(.4, `<g class="bob"><g transform="translate(1080 400) scale(.9)">
        <path d="M-380 70 Q-230 400 0 500 Q210 400 380 70Z" fill="url(#is-rock)"/>
        <path d="M-300 120 Q-150 300 0 360 Q120 300 260 130" fill="none" stroke="#2c2540" stroke-width="6" opacity=".5"/>
        <rect x="236" y="70" width="22" height="420" fill="url(#is-fall)"/>
        <ellipse cx="0" cy="70" rx="390" ry="72" fill="#4fae52"/><ellipse cx="-10" cy="58" rx="350" ry="52" fill="#76d06a"/>
        <g fill="#2f8a44"><circle cx="-300" cy="40" r="34"/><circle cx="-262" cy="30" r="26"/><circle cx="300" cy="44" r="30"/><circle cx="-200" cy="56" r="18"/></g>
        <g>
          <rect x="-150" y="-110" width="300" height="170" fill="#f3efe6"/><rect x="-150" y="-110" width="300" height="20" fill="#e2dccd"/>
          <rect x="-190" y="-170" width="70" height="230" fill="#f7f4ec"/><path d="M-200 -170 L-155 -250 L-110 -170Z" fill="#3a6fd6"/>
          <rect x="120" y="-170" width="70" height="230" fill="#f7f4ec"/><path d="M110 -170 L155 -250 L200 -170Z" fill="#3a6fd6"/>
          <rect x="-50" y="-280" width="100" height="200" fill="#fbf9f3"/><path d="M-64 -280 L0 -400 L64 -280Z" fill="#2f5fc4"/>
          <path d="M0 -400 v-50" stroke="#333" stroke-width="3"/><path d="M0 -450 l44 12 l-44 12z" fill="#ff6b5b"/>
          <g fill="#2b3a5a"><rect x="-14" y="-240" width="28" height="44" rx="14"/><rect x="-170" y="-130" width="16" height="26" rx="8"/><rect x="140" y="-130" width="16" height="26" rx="8"/>
          <rect x="-26" y="0" width="52" height="60" rx="26"/><rect x="-100" y="-60" width="16" height="24" rx="8"/><rect x="84" y="-60" width="16" height="24" rx="8"/></g>
        </g></g></g>`)}
    ${L(.9, `<g class="bob" style="animation-delay:-3s"><path d="M130 760 q60 -24 120 0 q-24 60 -60 80 q-40 -24 -60 -80z" fill="#5a4b70"/><ellipse cx="190" cy="760" rx="62" ry="14" fill="#6cc864"/></g>
      <g class="bob" style="animation-delay:-5s"><path d="M1380 700 q40 -16 84 0 q-16 44 -42 58 q-28 -16 -42 -58z" fill="#5a4b70"/><ellipse cx="1422" cy="700" rx="44" ry="10" fill="#6cc864"/></g>
      <g class="drift">${cloud(700,860,1.6,.95)}${cloud(1500,880,1.3,.9)}${cloud(-40,840,1.2,.9)}</g>`)}`,

  ice: () => `<defs>${lg("ic-sky",[[0,"#061430"],[.6,"#2b5d98"],[1,"#c4dcf2"]])}${rg("ic-moon",[[0,"#eaf4ff",.9],[1,"#eaf4ff",0]])}</defs>
    <rect width="1600" height="900" fill="url(#ic-sky)"/>${stars(7,90,380)}
    <circle cx="420" cy="200" r="200" fill="url(#ic-moon)"/><circle cx="420" cy="200" r="54" fill="#f3f8ff"/>
    ${L(.15, `<path d="M0 620 L180 420 L320 560 L520 340 L700 560 L900 380 L1100 580 L1300 400 L1600 600 V900 H0Z" fill="#7fa5cf"/>`)}
    ${L(.45, `<g transform="translate(980 220)">
        <path d="M0 520 L60 120 L90 0 L120 120 L180 520Z" fill="#e6f3ff"/><path d="M90 0 L120 120 L180 520 L90 520Z" fill="#a9cbea"/>
        <path d="M-160 520 L-110 220 L-80 140 L-50 220 L0 520Z" fill="#dcedfc"/><path d="M-80 140 L-50 220 L0 520 L-80 520Z" fill="#9fc2e4"/>
        <path d="M180 520 L230 260 L260 180 L290 260 L340 520Z" fill="#dcedfc"/><path d="M260 180 L290 260 L340 520 L260 520Z" fill="#9fc2e4"/>
        <path d="M-300 520 L-260 340 L-240 290 L-220 340 L-180 520Z" fill="#cfe4f8"/><path d="M340 520 L380 360 L400 300 L420 360 L460 520Z" fill="#cfe4f8"/>
        <g fill="#5fd3ff" class="pulse"><rect x="80" y="200" width="20" height="40" rx="10"/><rect x="-90" y="300" width="16" height="30" rx="8"/><rect x="252" y="320" width="16" height="30" rx="8"/></g>
      </g>`)}
    ${L(.8, `<path d="M0 760 Q300 690 640 740 T1200 720 T1600 740 V900 H0Z" fill="#eef6ff"/><path d="M0 820 Q400 770 900 810 T1600 800 V900 H0Z" fill="#d7e8f8"/>
      <g fill="#fff">${(() => { const r = rnd(3); let o=""; for (let i=0;i<70;i++) o += `<circle class="fall" style="animation-delay:-${(r()*9).toFixed(1)}s;animation-duration:${(6+r()*6).toFixed(1)}s" cx="${(r()*1600)|0}" cy="${(r()*100)|0}" r="${(r()*2.4+1).toFixed(1)}" opacity=".85"/>`; return o; })()}</g>`)}`,

  dunes: () => `<defs>${lg("du-sky",[[0,"#2a1640"],[.45,"#c0507a"],[1,"#f7b267"]])}${rg("du-sun",[[0,"#ffe2a0",1],[.4,"#ffc76e",.6],[1,"#ffc76e",0]])}</defs>
    <rect width="1600" height="900" fill="url(#du-sky)"/>${stars(11,40,240)}
    <circle cx="800" cy="560" r="420" fill="url(#du-sun)"/><circle cx="800" cy="560" r="130" fill="#ffd98a"/>
    ${L(.15, `<g fill="#9a4a5a"><path d="M560 600 L700 380 L840 600Z"/><path d="M820 600 L900 470 L980 600Z"/></g>
      <g class="bob" style="animation-duration:9s"><ellipse cx="1200" cy="300" rx="70" ry="70" fill="none" stroke="#ffe2a8" stroke-width="6" opacity=".9"/><ellipse cx="1200" cy="300" rx="50" ry="50" fill="#ffe2a8" opacity=".15"/></g>`)}
    ${L(.4, `<path d="M0 640 Q300 560 620 640 T1200 620 T1600 640 V900 H0Z" fill="#e7a15e"/><path d="M0 700 Q420 620 860 700 T1600 690 V900 H0Z" fill="#d2803f"/>`)}
    ${L(.85, `<path d="M0 780 Q360 700 760 780 T1600 770 V900 H0Z" fill="#b6632e"/><path d="M0 850 Q500 790 1000 840 T1600 830 V900 H0Z" fill="#8c4824"/>
      <g fill="#5a2c18"><rect x="220" y="700" width="12" height="80"/><path d="M226 700 q-40 10 -60 -20 q40 0 60 20 q20 -30 60 -20 q-20 30 -60 20z"/></g>`)}`,

  neon: () => `<defs>${lg("ne-sky",[[0,"#05010f"],[.5,"#1f0a3d"],[.8,"#6a1b6e"],[1,"#ff5f8f"]])}${lg("ne-sun",[[0,"#ffd166"],[1,"#ff3d8b"]])}</defs>
    <rect width="1600" height="900" fill="url(#ne-sky)"/>${stars(5,70,360)}
    ${L(.1, `<circle cx="800" cy="520" r="230" fill="url(#ne-sun)"/>
      <g fill="#1f0a3d">${[0,1,2,3,4,5].map(i => `<rect x="560" y="${540 + i*30}" width="480" height="${6 + i*2}"/>`).join("")}</g>`)}
    ${L(.4, (() => { const r = rnd(9); let o = `<g fill="#0b0420">`; let x = 0; while (x < 1600){ const w = 50 + r()*90, h = 140 + r()*320; o += `<rect x="${x|0}" y="${(700-h)|0}" width="${w|0}" height="${(h+20)|0}"/>`; x += w + 6; } o += `</g><g class="twinkle">`;
        for (let i = 0; i < 260; i++) o += `<rect x="${(r()*1600)|0}" y="${(380 + r()*300)|0}" width="5" height="7" fill="${r() > .5 ? "#ff8fd8" : "#6ff0ff"}" opacity="${(r()*.7+.2).toFixed(2)}"/>`;
        return o + `</g>`; })())}
    ${L(.85, `<rect x="0" y="700" width="1600" height="200" fill="#08021a"/>
      <g stroke="#ff3d8b" stroke-width="2" opacity=".7">${Array.from({length:21},(_,i) => `<line x1="800" y1="700" x2="${-800 + i*160}" y2="900"/>`).join("")}
      ${[706,716,732,756,792,840,900].map(y => `<line x1="0" y1="${y}" x2="1600" y2="${y}"/>`).join("")}</g>`)}`,

  aurora: () => `<defs>${lg("au-sky",[[0,"#01040c"],[.7,"#04202e"],[1,"#0a3a46"]])}${lg("au-a",[[0,"#3dffb0",0],[.5,"#3dffb0",.75],[1,"#46c8ff",0]])}${lg("au-b",[[0,"#b46bff",0],[.5,"#46c8ff",.55],[1,"#3dffb0",0]])}</defs>
    <rect width="1600" height="900" fill="url(#au-sky)"/>${stars(13,160,520)}
    ${L(.2, `<g class="wave"><path d="M-100 380 C200 140 500 420 800 220 S1300 120 1700 300 L1700 420 C1300 260 1000 460 800 360 S300 320 -100 520Z" fill="url(#au-a)"/></g>
      <g class="wave" style="animation-delay:-4s;animation-duration:12s"><path d="M-100 300 C300 200 600 360 900 160 S1400 260 1700 140 L1700 240 C1400 360 1100 300 900 280 S300 300 -100 400Z" fill="url(#au-b)"/></g>`)}
    ${L(.5, `<path d="M0 640 L200 470 L330 560 L520 400 L700 580 L880 440 L1080 600 L1280 450 L1460 560 L1600 500 V900 H0Z" fill="#06202c"/>
      <path d="M520 400 L560 440 L540 450 L500 420Z M1280 450 L1320 490 L1290 494Z" fill="#cde9ff" opacity=".7"/>`)}
    ${L(.85, `<rect x="0" y="700" width="1600" height="200" fill="#031118"/>
      <g opacity=".35" transform="translate(0 1400) scale(1 -1)"><path d="M-100 860 C300 760 600 920 900 740 S1400 820 1700 720 L1700 800 C1400 900 1100 860 900 840 S300 860 -100 940Z" fill="url(#au-a)"/></g>
      <path d="M0 700 L180 650 L300 690 L460 640 L600 700Z M1100 700 L1260 660 L1400 690 L1600 650 V700Z" fill="#020b10"/>`)}`,

  forest: () => `<defs>${lg("fo-sky",[[0,"#ff9e7a"],[.45,"#ffd59a"],[1,"#e7f5d8"]])}${rg("fo-sun",[[0,"#fff4cf",1],[1,"#fff4cf",0]])}</defs>
    <rect width="1600" height="900" fill="url(#fo-sky)"/>
    <circle cx="1100" cy="430" r="300" fill="url(#fo-sun)"/><circle cx="1100" cy="430" r="90" fill="#fff1c4"/>
    ${L(.12, `<g class="drift2">${cloud(400,200,.8,.75)}${cloud(1300,160,.6,.7)}</g>
      <path d="M0 560 Q300 470 640 540 T1300 520 T1600 540 V900 H0Z" fill="#a6d48e"/>`)}
    ${L(.4, `<path d="M0 620 Q360 540 760 620 T1600 600 V900 H0Z" fill="#6fb764"/>
      <g fill="#3f8f4f">${Array.from({length:14},(_,i) => { const x = 60 + i*115, h = 90 + (i*37 % 70); return `<path d="M${x} ${620 - h} L${x+38} ${640} L${x-38} ${640}Z"/>`; }).join("")}</g>
      <g transform="translate(1180 560)"><rect x="0" y="0" width="90" height="60" fill="#fff4e0"/><path d="M-12 2 L45 -40 L102 2Z" fill="#c4553f"/><rect x="36" y="24" width="18" height="36" fill="#6b3d2a"/><rect x="62" y="14" width="16" height="14" fill="#ffd36e" class="pulse"/></g>`)}
    ${L(.85, `<path d="M0 760 Q420 680 860 760 T1600 750 V900 H0Z" fill="#3f8f4f"/><path d="M0 830 Q500 770 1000 820 T1600 810 V900 H0Z" fill="#2a6b3e"/>
      <g fill="#1f5a33">${[90,210,1400,1520].map((x,i) => `<path d="M${x} ${560+i*20} L${x+70} 860 L${x-70} 860Z"/>`).join("")}</g>
      <g class="drift" fill="none" stroke="#3a2a2a" stroke-width="3"><path d="M600 300 q12 -10 24 0 q12 -10 24 0"/><path d="M680 260 q10 -8 20 0 q10 -8 20 0"/><path d="M560 250 q8 -6 16 0 q8 -6 16 0"/></g>`)}`,

  // Respaldo dibujado de la Challenge Zone (si la imagen no carga): arena neón con plataformas
  zone: () => `<defs>${lg("zn-sky",[[0,"#0b0526"],[.6,"#2a0f5c"],[1,"#5b1f8f"]])}</defs>
    <rect width="1600" height="900" fill="url(#zn-sky)"/>${stars(17,80,420)}
    ${L(.2, `<g fill="#1c0b40">${[[120,520,260],[520,430,300],[980,480,280],[1340,400,220]].map(([x,y,w]) => `<rect x="${x}" y="${y}" width="${w}" height="40"/><rect x="${x}" y="${y}" width="${w}" height="6" fill="#5ff4ff" class="glowpulse"/>`).join("")}</g>`)}
    ${L(.6, `<rect x="0" y="700" width="1600" height="200" fill="#12062e"/>
      <g stroke="#b98cff" stroke-width="2" opacity=".5">${Array.from({length:17},(_,i) => `<line x1="800" y1="700" x2="${-800 + i*200}" y2="900"/>`).join("")}
      ${[712,730,760,800,850,900].map(y => `<line x1="0" y1="${y}" x2="1600" y2="${y}"/>`).join("")}</g>`)}`
};

/* Partículas animadas sobre las imágenes (dan vida a cada mundo) */
function specks(seed, n, { color = "#fff", rmin = 1, rmax = 3, cls = "twinkle", ymin = 0, ymax = 900, op = .8, dur = [3, 7] }){
  const r = rnd(seed); let o = "";
  for (let i = 0; i < n; i++){
    const c = Array.isArray(color) ? color[(r() * color.length) | 0] : color;
    o += `<circle class="${cls}" style="animation-delay:-${(r()*10).toFixed(1)}s;animation-duration:${(dur[0] + r()*(dur[1]-dur[0])).toFixed(1)}s"
      cx="${(r()*1600)|0}" cy="${(ymin + r()*(ymax-ymin))|0}" r="${(rmin + r()*(rmax-rmin)).toFixed(1)}" fill="${c}" opacity="${(op*(.4+r()*.6)).toFixed(2)}"/>`;
  }
  return o;
}
const FX = {
  isles:  () => `<g class="drift">${cloud(200,880,1.8,.55)}${cloud(1300,900,1.6,.5)}</g><g class="drift2">${cloud(800,940,2,.45)}</g>${specks(21, 30, { color:"#fff6d8", rmax:2.2, cls:"rise", dur:[10,18] })}`,
  ice:    () => specks(3, 110, { color:"#fff", rmin:1, rmax:3.2, cls:"fall", ymin:-100, ymax:100, op:.9, dur:[6,13] }),
  dunes:  () => specks(8, 60, { color:["#ffd9a0","#fff1d0"], rmax:2.2, cls:"blow", dur:[8,16] }),
  neon:   () => specks(9, 70, { color:["#ff5fd2","#5ff4ff","#fff"], rmax:2, cls:"rise", dur:[7,14] }),
  aurora: () => specks(13, 120, { color:"#fff", rmax:1.8, ymax:480, dur:[2,5] }),
  forest: () => specks(5, 45, { color:"#ffe58a", rmin:1.5, rmax:3.5, cls:"firefly", ymin:350, ymax:880, dur:[3,7] }),
  zone:   () => zoneFX()
};
/* Disparos láser de la Challenge Zone: cada rayo cruza de un jugador a otro y deja una chispa al impactar.
   [x1, y1, x2, y2, color, retraso en segundos, duración] */
// Coinciden con los rayos dibujados en la imagen (assets/mundos/zone.webp), así parece que los jugadores disparan
const ZONE_SHOTS = [
  [ 527, 540,  747, 453, "#5ff4ff", 0.0, 3.4],   // jugador azul (adelante) → jugador verde
  [ 273, 283,  733, 393, "#ffb347", 1.3, 3.9],   // jugador naranjo (arriba izq.) → centro
  [1220, 507,  973, 440, "#ff5fd2", 2.2, 3.7],   // jugador rosado (derecha) → bloque amarillo
  [1060, 187,  800, 247, "#ff4b6e", 0.7, 4.3],   // jugador rojo (fondo) → muro
  [ 760, 430,  560, 530, "#b6ff5f", 2.9, 4.6]    // jugador verde responde → jugador azul
];
// Letreros de neón de la imagen que parpadean: [x, y, ancho, alto, color]
const ZONE_NEON = [[153, 87, 120, 60, "#ff5fd2"], [1260, 120, 110, 75, "#7dff8a"], [550, 370, 50, 26, "#5ff4ff"], [1550, 290, 40, 40, "#7dff8a"]];
function zoneFX(){
  const beams = ZONE_SHOTS.map(([x1, y1, x2, y2, c, d, t]) => {
    const st = `animation-delay:${d}s;animation-duration:${t}s`;
    return `<g opacity=".55"><line class="laser" pathLength="100" style="${st}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="16" stroke-linecap="round" filter="url(#zn-blur)"/></g>
      <line class="laser" pathLength="100" style="${st}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
      <circle class="spark" style="${st}" cx="${x2}" cy="${y2}" r="22" fill="${c}" opacity=".9" filter="url(#zn-blur)"/>
      <circle class="spark" style="${st}" cx="${x2}" cy="${y2}" r="7" fill="#fff"/>`;
  }).join("");
  return `<defs><filter id="zn-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
      <linearGradient id="zn-sweep" x1="0" x2="1"><stop offset="0" stop-color="#b98cff" stop-opacity="0"/><stop offset=".5" stop-color="#b98cff" stop-opacity=".18"/><stop offset="1" stop-color="#b98cff" stop-opacity="0"/></linearGradient></defs>
    <rect class="sweep" x="0" y="0" width="420" height="900" fill="url(#zn-sweep)" transform="skewX(-18)"/>
    ${ZONE_NEON.map(([x, y, w, h, c], i) => `<ellipse class="glowpulse" style="animation-delay:-${i * .9}s;animation-duration:${2.2 + i * .5}s" cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="${c}" opacity=".5" filter="url(#zn-blur)"/>`).join("")}
    ${beams}
    ${specks(29, 50, { color:["#5ff4ff","#ff5fd2","#b98cff","#fff"], rmax:2.2, cls:"rise", dur:[8,15] })}`;
}

/* Construir el escenario y el HUD */
const sections = [...document.querySelectorAll("main section")];
const stage = $("stage");
// En celular se usan fondos más livianos (assets/mundos/m/)
const bgFolder = matchMedia("(max-width: 760px)").matches ? "assets/mundos/m/" : "assets/mundos/";
sections.forEach((s, i) => {
  const key = s.dataset.scene;
  const div = document.createElement("div");
  div.className = "scene sc-" + key;
  // El dibujo SVG queda de respaldo; si existe la imagen en assets/mundos/, se muestra encima
  div.innerHTML = `<svg class="draw" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${SCENES[key]()}</svg>
    <div class="photo"><img alt="" decoding="async"></div>
    <svg class="fx" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${FX[key] ? FX[key]() : ""}</svg>`;
  stage.appendChild(div);
  const img = div.querySelector(".photo img");
  img.addEventListener("load", () => div.classList.add("has-photo"));
  img.addEventListener("error", () => { const p = div.querySelector(".photo"); if (p) p.remove(); });
  s._scene = div; s._img = img; s._layers = [...div.querySelectorAll(".draw .L")];
  s._loadBg = () => { if (!s._bgOn){ s._bgOn = true; img.src = bgFolder + key + ".webp"; } };
  if (!i) { img.fetchPriority = "high"; s._loadBg(); }
});
// Cada fondo se descarga solo cuando el alumno se acerca a ese mundo
// En computador se precargan todos después de unos segundos (transiciones suaves); en celular no, para ahorrar datos
const nextBgs = () => sections.forEach(s => s._loadBg());
if (bgFolder === "assets/mundos/")
  addEventListener("load", () => setTimeout(() => ("requestIdleCallback" in window ? requestIdleCallback(nextBgs) : nextBgs()), 4000));
$("hud").innerHTML = sections.map((s, i) =>
  `<a href="#${s.id}" data-i="${i}"><b>${s.dataset.name}</b>${String(i+1).padStart(2,"0")}</a>`).join("");
const hudLinks = [...document.querySelectorAll("#hud a")];
const navLinks = [...document.querySelectorAll(".links a")];
const tabLinks = [...document.querySelectorAll("#tabbar a")];
let lastBest = -1;

/* =====================================================================
   NAVEGACIÓN POR MUNDOS
   Cada sección es una pantalla. Al elegir otra, se abre un portal
   circular desde el punto donde se hizo clic y aparece el nuevo mundo.
   ===================================================================== */
const ids = sections.map(s => s.id);
const EASE_IO = "cubic-bezier(0.77, 0, 0.175, 1)";   // movimiento en pantalla
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";   // entradas y salidas
const PORTAL_MS = 820;
let current = -1, nav = null, lastPt = null;
document.body.classList.add("paged");
const ring = document.createElement("div"); ring.id = "portal-ring"; ring.setAttribute("aria-hidden", "true");
document.body.appendChild(ring);

addEventListener("pointerdown", e => { lastPt = { x: e.clientX, y: e.clientY, t: performance.now() }; }, { passive:true, capture:true });

function setAccent(i){
  const cs = getComputedStyle(sections[i]);
  document.documentElement.style.setProperty("--accent", cs.getPropertyValue("--accent").trim());
  document.documentElement.style.setProperty("--accent-d", cs.getPropertyValue("--accent-d").trim());
}
function markNav(i){
  const id = sections[i].id;
  hudLinks.forEach((a, k) => a.classList.toggle("on", k === i));
  navLinks.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + id));
  tabLinks.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + id));
}
function revealIn(s){ s.classList.remove("in"); void s.offsetWidth; s.classList.add("in"); }
function preload(i){ sections[i]._loadBg(); const n = sections[(i + 1) % sections.length]; if (n) setTimeout(() => n._loadBg(), 1500); }

// Mostrar una sección sin animación (al cargar la página)
function showNow(i){
  sections.forEach((s, k) => {
    const on = k === i;
    s.classList.toggle("active", on);
    s._scene.classList.toggle("active", on);
    s._scene.style.opacity = on ? 1 : 0; s._scene.style.transform = "";
  });
  current = i; preload(i); markNav(i); setAccent(i); revealIn(sections[i]);
}

// Paralaje suave del fondo al bajar dentro de una sección larga
let ticking = false;
function parallax(){
  ticking = false;
  const s = sections[current]; if (!s || reduced) return;
  const y = Math.min(scrollY, innerHeight) * .06;
  if (s._scene.classList.contains("has-photo")) s._img.style.transform = `translate3d(0, ${(-y).toFixed(1)}px, 0) scale(1.1)`;
  else s._layers.forEach(l => { l.style.transform = `translate(0px, ${(-y * l.dataset.d * 2).toFixed(1)}px)`; });
}
addEventListener("scroll", () => { if (!ticking){ ticking = true; requestAnimationFrame(parallax); } }, { passive:true });

// Sonido del portal (sintetizado, respeta el botón de silencio)
function portalSound(){
  if (muted || !actx) return;
  try {
    if (actx.state === "suspended") actx.resume();
    const t = actx.currentTime, len = .7, buf = actx.createBuffer(1, actx.sampleRate * len, actx.sampleRate), d = buf.getChannelData(0);
    for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / d.length);
    const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
    src.buffer = buf; f.type = "bandpass"; f.Q.value = 6;
    f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(2600, t + len * .8);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.22, t + .08); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    src.connect(f); f.connect(g); g.connect(actx.destination); src.start(t); src.stop(t + len);
  } catch(e){}
}

// Volver arriba al instante (sin depender de scroll-behavior: instant, que Safari antiguo no conoce)
function toTop(){ const h = document.documentElement, prev = h.style.scrollBehavior; h.style.scrollBehavior = "auto"; scrollTo(0, 0); h.style.scrollBehavior = prev; }

// Origen del portal: el punto del clic, o el centro de la pantalla
function originFor(el){
  if (lastPt && performance.now() - lastPt.t < 900) return lastPt;
  if (el && el.getBoundingClientRect){ const r = el.getBoundingClientRect(); if (r.width) return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  return { x: innerWidth / 2, y: innerHeight / 2 };
}

function goTo(id, opts = {}){
  const i = ids.indexOf(id); if (i < 0) return;
  if (nav) nav.finish();                                   // si hay un portal abriéndose, se completa al instante
  if (opts.push !== false){
    const url = i === 0 ? location.pathname + location.search : "#" + id;
    if (location.hash !== (i === 0 ? "" : "#" + id)) history.pushState({ id }, "", url);
  }
  if (i === current){ scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); return; }

  const from = sections[current], to = sections[i], o = opts.origin || originFor(opts.el);
  preload(i); markNav(i); setAccent(i);
  // Si la imagen del nuevo mundo aún se descarga, se espera un momento (máx. 0,9 s) para que el portal no se abra vacío
  const img = to._img;
  if (!opts.ready && img && img.src && !img.complete){
    nav = { finish(){ nav = null; } };
    const token = nav;
    Promise.race([img.decode ? img.decode().catch(() => {}) : null, new Promise(r => setTimeout(r, 900))])
      .then(() => { if (nav === token){ nav = null; goTo(id, { ...opts, origin: o, push: false, ready: true }); } });
    return;
  }
  portalSound();

  // Preparar la nueva pantalla: queda fija encima, con su mundo dentro, recortada en un círculo
  to.classList.add("active", "portal"); to.classList.remove("in");
  to.insertBefore(to._scene, to.firstChild);
  to._scene.classList.add("active"); to._scene.style.opacity = 1;
  to.classList.toggle("tall", to.scrollHeight > to.clientHeight + 4);
  const R = Math.hypot(Math.max(o.x, innerWidth - o.x), Math.max(o.y, innerHeight - o.y)) + 24;
  const anims = [];
  let done = false, revealT;

  const cleanup = () => {
    if (done) return; done = true; clearTimeout(revealT);
    anims.forEach(a => { try { a.cancel(); } catch(e){} });
    stage.appendChild(to._scene);
    to.classList.remove("portal", "tall");
    from.classList.remove("active"); from._scene.classList.remove("active"); from._scene.style.opacity = 0;
    from.style.opacity = ""; from.style.transform = "";
    ring.style.opacity = 0;
    current = i; toTop();
    if (!to.classList.contains("in")) to.classList.add("in");
    parallax();
    const h = to.querySelector(".title, h1, h2"); if (h){ h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    nav = null;
  };
  nav = { finish: cleanup };

  if (reduced || !CSS.supports("clip-path", "circle(1px at 1px 1px)")){
    // Movimiento reducido: solo un fundido corto
    anims.push(to.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "ease" }));
    anims.push(from.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease", fill: "forwards" }));
    revealT = setTimeout(() => to.classList.add("in"), 60);
    anims[0].finished.then(cleanup, () => {});
    return;
  }

  const at = `at ${o.x.toFixed(0)}px ${o.y.toFixed(0)}px`;
  // 1. El portal se abre desde el punto del clic
  anims.push(to.animate([{ clipPath: `circle(0px ${at})` }, { clipPath: `circle(${R.toFixed(0)}px ${at})` }],
    { duration: PORTAL_MS, easing: EASE_IO, fill: "forwards" }));
  // 2. El nuevo mundo se acerca desde dentro del portal
  anims.push(to._scene.animate([{ transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: PORTAL_MS + 200, easing: EASE_OUT }));
  // 3. El mundo anterior se aleja
  anims.push(from.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(.94)" }], { duration: 420, easing: EASE_OUT, fill: "forwards" }));
  anims.push(from._scene.animate([{ transform: "scale(1)" }, { transform: "scale(1.12)" }], { duration: PORTAL_MS, easing: EASE_OUT, fill: "forwards" }));
  // 4. Anillo de luz en el borde del portal
  ring.style.left = o.x + "px"; ring.style.top = o.y + "px";
  ring.style.width = ring.style.height = (R * 2).toFixed(0) + "px";
  anims.push(ring.animate([
    { transform: "translate(-50%, -50%) scale(0)", opacity: 1 },
    { transform: "translate(-50%, -50%) scale(.75)", opacity: 1, offset: .7 },
    { transform: "translate(-50%, -50%) scale(1)", opacity: 0 }
  ], { duration: PORTAL_MS, easing: EASE_IO }));
  // 5. El título y los paneles entran escalonados cuando el portal ya está abierto a la mitad
  revealT = setTimeout(() => to.classList.add("in"), PORTAL_MS * .38);
  anims[0].finished.then(cleanup, () => {});
}

// Todos los enlaces internos (#worlds, #word, …) abren un portal en vez de bajar
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]'); if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey) return;
  const id = a.getAttribute("href").slice(1);
  if (!ids.includes(id)) return;
  e.preventDefault(); goTo(id, { el: a });
});
addEventListener("popstate", () => goTo(location.hash.slice(1) || ids[0], { push: false, origin: { x: innerWidth / 2, y: innerHeight / 2 } }));

// Botón "siguiente mundo" al final de cada sección
const NAMES = { hero: "Home · Inicio", worlds: "Worlds", word: "Word of the day", challenge: "Quick challenge", zone: "Challenge Zone", speak: "Speak", how: "How to play" };
sections.forEach((s, k) => {
  if (k === 0 || k === sections.length - 1) return;
  const n = sections[k + 1], a = document.createElement("a");
  a.className = "btn ghost sm next-world"; a.href = "#" + n.id;
  a.innerHTML = `Next world · ${esc(NAMES[n.id] || n.dataset.name)} <span aria-hidden="true">→</span>`;
  s.appendChild(a);
});

showNow(Math.max(0, ids.indexOf(location.hash.slice(1))));

/* =====================================================================
   MUNDOS / CURSOS
   ===================================================================== */
let currentCourse = COURSES.find(c => c.games.length)?.id || COURSES[0].id;
function gameRow(c, g, showCourse){
  const href = encodeURI(c.folder + "/" + g.file);
  const shot = g.shot ? `assets/games/${g.shot}.webp` : "";
  return `<a class="game ${shot ? "has-shot" : ""}" href="${href}" data-shot="${shot}" data-title="${esc(g.title)}">
      ${shot ? `<span class="thumb"><img src="${shot}" alt="${esc(g.title)}" loading="lazy" decoding="async"><span class="ic" aria-hidden="true">${g.icon}</span></span>`
             : `<span class="ic" aria-hidden="true">${g.icon}</span>`}
      <span><h4>${esc(g.title)} ${g.isNew ? `<span class="tag">New</span>` : ""}</h4>
        <p>${esc(g.desc)}</p>
        <span class="cap">${showCourse ? esc(c.num + " " + c.level) + " · " : ""}${g.unit ? esc(g.unit) : ""}</span></span>
      <span class="btn play">▶ Play</span>
    </a>`;
}
const soonRow = `<div class="game soon" aria-hidden="true"><span class="ic">🔒</span>
    <span><h4>Coming soon</h4><p>Un nuevo juego viene en camino · A new game is on its way!</p></span></div>`;
function renderCourses(){
  $("courses").innerHTML = COURSES.map(c => {
    const n = c.games.length;
    return `<button class="chip ${c.id === currentCourse ? "on" : ""}" data-id="${c.id}" type="button">${c.icon} ${esc(c.num)} ${esc(c.level)} <small>${n ? n : "soon"}</small></button>`;
  }).join("");
  $("courses").querySelectorAll(".chip").forEach(b => b.addEventListener("click", () => {
    currentCourse = b.dataset.id; $("q").value = ""; renderCourses(); renderGames();
  }));
}
// Si el alumno ingresó con su RUT, se abren los juegos de su curso
{ const pc = (store.get("session", null) || {}).course; if (pc && COURSES.some(c => c.id === pc && c.games.length)) currentCourse = pc; }
function renderGames(){
  const q = norm($("q").value.trim());
  if (q){
    const hits = [];
    COURSES.forEach(c => c.games.forEach(g => { if (norm(g.title + " " + g.desc + " " + (g.unit||"") + " " + c.num + " " + c.level).includes(q)) hits.push([c,g]); }));
    $("games").innerHTML = hits.length ? hits.map(([c,g]) => gameRow(c,g,true)).join("")
      : `<div class="empty">🤔 No games found · No encontramos juegos con ese nombre.</div>`;
    return;
  }
  const c = COURSES.find(x => x.id === currentCourse);
  $("games").innerHTML = c.games.length ? c.games.map(g => gameRow(c,g,false)).join("") + soonRow
    : `<div class="empty">🚧 New games coming soon · ¡Pronto habrá juegos nuevos!</div>`;
}
$("q").addEventListener("input", renderGames);

/* Al presionar un juego: su captura crece hasta llenar la pantalla y luego se abre el juego */
$("games").addEventListener("click", e => {
  const a = e.target.closest("a.game");
  if (!a || !a.dataset.shot || reduced || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
  e.preventDefault();
  const r = a.querySelector(".thumb").getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "launch";
  el.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background-image:url("${a.dataset.shot}")`;
  el.innerHTML = `<b>${a.dataset.title}<small>Loading world… · Cargando…</small></b>`;
  document.body.appendChild(el);
  sfx("badge");
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("full")));
  setTimeout(() => { location.href = a.href; }, 900);
});
// Si el alumno vuelve con el botón "atrás", se quita la transición
addEventListener("pageshow", () => document.querySelectorAll(".launch").forEach(x => x.remove()));
renderCourses(); renderGames();

