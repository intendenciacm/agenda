// Permite abrir la agenda sin señal: guarda en el celular la página de entrada (no guarda datos: eso lo hace la página).
var V = 'ag-v4';
var BASE = self.registration.scope;
function conTiempo(p, ms) {
  return new Promise(function (ok, ko) {
    var t = setTimeout(function () { ko(new Error('tiempo')); }, ms);
    p.then(function (x) { clearTimeout(t); ok(x); }, function (e) { clearTimeout(t); ko(e); });
  });
}
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(['', 'index.html', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', 'apple-touch-icon.png', 'jakarta.woff2'].map(function (p) {
      return fetch(BASE + p, {cache: 'no-store'}).then(function (r) { if (r.ok) return c.put(BASE + p, r); }).catch(function () {});
    }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.indexOf(new URL(BASE).pathname) !== 0) return;
  var key = u.origin + u.pathname;   // sin ?k=
  e.respondWith(
    conTiempo(fetch(r), 5000).then(function (res) {
      if (res.ok && !u.pathname.endsWith('/sw.js')) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(key, cp); }); }
      return res;
    }).catch(function () {
      return caches.match(key).then(function (m) {
        return m || caches.match(BASE) || caches.match(BASE + 'index.html') || caches.match(BASE + 'app.html');
      });
    })
  );
});
