/* Service worker de eslteacher.cl
   - Siempre intenta traer la versión nueva desde internet (así tus cambios se ven al tiro).
   - Si no hay internet, muestra la última versión guardada: la palabra del día,
     el desafío y la portada funcionan sin conexión.
   Si algún día cambias mucho la página, sube el número de VERSION. */
const VERSION = "eslt-v1";
const SHELL = [
  "/", "/index.html", "/palabras.js", "/manifest.webmanifest",
  "/assets/icons/icon-192.png", "/assets/icons/icon-512.png",
  "/assets/sfx/click.ogg", "/assets/sfx/select.ogg", "/assets/sfx/correct.ogg", "/assets/sfx/wrong.ogg", "/assets/sfx/badge.ogg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;

  // Fuentes: usar la guardada y actualizar en segundo plano
  if (isFont){
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }

  // Todo lo demás: primero internet, y si falla, lo guardado
  e.respondWith(fetch(req).then(r => {
    if (r.ok && (req.mode === "navigate" || /\.(js|css|webp|png|jpg|ogg|webmanifest)$/.test(url.pathname))){
      const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy));
    }
    return r;
  }).catch(async () => (await caches.match(req, { ignoreSearch: req.mode === "navigate" })) ||
                       (req.mode === "navigate" ? caches.match("/") : Response.error())));
});
