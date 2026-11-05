// Pantalla completa automática en celular/tablet al girar la pantalla a horizontal.
// Los navegadores solo permiten pantalla completa después de un toque del alumno, así que
// al girar se intenta de inmediato y, si el navegador no lo deja, se activa con el primer toque.
// Al volver a vertical se sale de la pantalla completa (solo si la puso este script).
// Uso: <script src="../assets/js/eslt-fullscreen.js" defer></script> antes de </head>.
(function () {
  if (window.__esltFS) return; window.__esltFS = true;
  var d = document, el = d.documentElement;
  var req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req) return;                                         // iPhone: Safari no lo permite
  var touch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  if (!touch) return;                                       // computador: no cambia nada
  var land = matchMedia('(orientation: landscape)');
  var mine = false, hint = null;
  var isFS = function () { return !!(d.fullscreenElement || d.webkitFullscreenElement); };

  function enter() {
    if (isFS() || !land.matches) return;
    try {
      var p = req.call(el, { navigationUI: 'hide' });
      if (p && p.then) p.then(function () { mine = true; show(); }, function () { show(); });
      else { mine = true; }
    } catch (e) { }
  }
  function leave() {
    if (!isFS() || !mine) return;
    var ex = d.exitFullscreen || d.webkitExitFullscreen; mine = false;
    try { var p = ex.call(d); if (p && p.catch) p.catch(function () { }); } catch (e) { }
  }
  function show() {
    var need = land.matches && !isFS();
    if (need && !hint && d.body) {
      hint = d.createElement('div');
      hint.textContent = '⛶ Toca la pantalla para jugar en pantalla completa';
      hint.style.cssText = 'position:fixed;left:50%;bottom:10px;transform:translateX(-50%);z-index:2147483647;background:rgba(20,15,46,.88);color:#fff;font:700 13px/1.3 system-ui,sans-serif;padding:7px 14px;border-radius:20px;pointer-events:none;box-shadow:0 3px 10px rgba(0,0,0,.35);white-space:nowrap';
      d.body.appendChild(hint);
    }
    if (hint) hint.style.display = need ? 'block' : 'none';
  }
  function onTouch() { if (land.matches && !isFS()) enter(); }
  function onRotate() { if (land.matches) enter(); else leave(); show(); }

  d.addEventListener('touchend', onTouch, true);
  d.addEventListener('click', onTouch, true);
  if (land.addEventListener) land.addEventListener('change', onRotate); else land.addListener(onRotate);
  d.addEventListener('fullscreenchange', function () { if (!isFS()) mine = false; show(); });
  d.addEventListener('webkitfullscreenchange', function () { if (!isFS()) mine = false; show(); });
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', show); else show();
})();
