/* Ajuste automático de calidad para los juegos 3D de eslteacher.cl.
   Mide la fluidez mientras se juega. Si baja, reduce primero las sombras y después
   la resolución; si el equipo va sobrado, intenta subir de nuevo.
   Recuerda el nivel de cada juego en ese navegador.

   Uso:
     import { crearFluido } from '/assets/js/eslt-fluido.js';
     const fluido = crearFluido({ renderer, juego: 'mi-juego', sol: () => sun, maxPixelRatio: 2 });
     // en el loop, justo después de renderer.render(...):
     fluido.cuadro();

   Para ver los FPS y el nivel en pantalla, abre el juego con ?fps=1 */

const NIVELES = [
  { pr: Infinity, sombra: 2048 },
  { pr: Infinity, sombra: 1024 },
  { pr: 1.25, sombra: 1024 },
  { pr: 1, sombra: 1024 },
  { pr: 1, sombra: 0 },      // sin sombras
  { pr: 0.8, sombra: 0 },
  { pr: 0.65, sombra: 0 }
];
export const NIVEL_BAJO = 4;

const VENTANA = 1500;        // ms de cada medición
const CALENTAR = 1200;       // ms que se ignoran tras cambiar de nivel
const PAUSA = 700;           // un cuadro más largo que esto es una carga o pausa, no se mide
const FPS_BAJO = 42, FPS_MUY_BAJO = 24, FPS_SOBRADO = 57;
const ESPERA_SUBIR = 20000;  // ms estables antes de intentar más calidad
const PRUEBA_SUBIR = 15000;  // si vuelve a caer en este tiempo, no se insiste

const leer = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { } };

function equipoModesto() {
  const tactil = matchMedia('(hover:none)').matches;
  const ram = navigator.deviceMemory, nucleos = navigator.hardwareConcurrency;
  return tactil || (ram && ram <= 4) || (nucleos && nucleos <= 4);
}

export function crearFluido({ renderer, juego, sol, maxPixelRatio = renderer.getPixelRatio() }) {
  const clave = 'eslt-fluido:' + juego;
  const guardado = parseInt(leer(clave), 10);
  let nivel = guardado >= 0 && guardado < NIVELES.length ? guardado : (equipoModesto() ? 2 : 0);
  let piso = 0, techo = 0, aplicadoSol = null, aplicadoSombra = -1, usaSombras = false, sombraBase = 0;
  let ultimo = 0, inicioV = 0, cuadros = 0, lentas = 0, estable = 0, ignorarHasta = 0, subidoEn = 0, fps = 0;

  function aplicarSol() {
    const s = sol && sol();
    if (!s) return;
    // Respeta lo que trae cada juego: nunca activa sombras ni las hace más grandes
    if (s !== aplicadoSol) { aplicadoSol = s; usaSombras = s.castShadow; sombraBase = s.shadow.mapSize.x; aplicadoSombra = -1; }
    if (!usaSombras) return;
    const quiere = Math.min(NIVELES[nivel].sombra, sombraBase);
    if (quiere === aplicadoSombra) return;
    if (quiere) {
      if (s.shadow.mapSize.x !== quiere) {
        s.shadow.mapSize.set(quiere, quiere);
        if (s.shadow.map) { s.shadow.map.dispose(); s.shadow.map = null; }
      }
    }
    s.castShadow = quiere > 0;
    aplicadoSombra = quiere;
  }

  function aplicar() {
    const pr = Math.min(window.devicePixelRatio || 1, maxPixelRatio, NIVELES[nivel].pr);
    if (renderer.getPixelRatio() !== pr) renderer.setPixelRatio(pr);
    aplicarSol();
    reiniciar();
  }

  function reiniciar() {
    const t = performance.now();
    ignorarHasta = t + CALENTAR; inicioV = 0; cuadros = 0; lentas = 0; estable = 0; ultimo = 0;
  }

  function cambiar(n) {
    nivel = Math.max(piso, Math.min(NIVELES.length - 1, n));
    if (piso === 0) guardar(clave, nivel);
    aplicar();
  }

  function medir(t) {
    fps = cuadros * 1000 / (t - inicioV);
    const dur = t - inicioV;
    inicioV = t; cuadros = 0;
    if (fps < FPS_BAJO) {
      estable = 0; lentas++;
      if ((fps < FPS_MUY_BAJO || lentas >= 2) && nivel < NIVELES.length - 1) {
        if (subidoEn && t - subidoEn < PRUEBA_SUBIR) techo = nivel + 1; // esa calidad no se sostiene
        subidoEn = 0;
        cambiar(nivel + 1);
      }
      return;
    }
    lentas = 0;
    estable = fps >= FPS_SOBRADO ? estable + dur : 0;
    if (estable >= ESPERA_SUBIR && nivel > Math.max(piso, techo)) { subidoEn = t; cambiar(nivel - 1); }
  }

  let panel = null;
  if (new URLSearchParams(location.search).has('fps')) {
    panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;left:6px;bottom:6px;z-index:99999;padding:3px 7px;border-radius:5px;background:#000b;color:#7dff9a;font:12px monospace;pointer-events:none';
    document.body.appendChild(panel);
  }
  const pintar = () => { if (panel) panel.textContent = `${Math.round(fps)} FPS · nivel ${nivel} · ${renderer.getPixelRatio().toFixed(2)}x · sombras ${aplicadoSombra > 0 ? aplicadoSombra : 'no'}`; };

  document.addEventListener('visibilitychange', reiniciar);
  aplicar();

  const api = {
    cuadro() {
      if (aplicadoSol !== (sol && sol())) aplicarSol();
      // En segundo plano el navegador frena los cuadros: eso no es lentitud del equipo
      if (document.hidden || !document.hasFocus()) { ultimo = 0; inicioV = 0; cuadros = 0; return; }
      const t = performance.now();
      const dt = ultimo ? t - ultimo : 0;
      ultimo = t;
      if (t < ignorarHasta || dt > PAUSA) { inicioV = 0; cuadros = 0; return; }
      if (!inicioV) { inicioV = t; return; }
      cuadros++;
      if (t - inicioV >= VENTANA) { medir(t); pintar(); }
    },
    // Opción manual "gráficos bajos": no deja subir de ese nivel
    fijarPiso(n) {
      if (n === piso) return;
      piso = n; techo = 0; subidoEn = 0;
      cambiar(n);
    },
    get nivel() { return nivel; },
    get fps() { return fps; }
  };
  window.esltFluido = api;
  return api;
}
