// Deja abrir la app sin señal: guarda en el celular la página y los íconos (los datos los guarda la propia página).
var V = 'mf-v12';
var BASE = self.registration.scope;
function conTiempo(p, ms) {
  return new Promise(function (ok, ko) {
    var t = setTimeout(function () { ko(new Error('tiempo')); }, ms);
    p.then(function (x) { clearTimeout(t); ok(x); }, function (e) { clearTimeout(t); ko(e); });
  });
}
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(V).then(function (c) {
    return Promise.all(['', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'jakarta.woff2'].map(function (p) {
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
    conTiempo(fetch(r, {cache: 'no-cache'}), 4000).then(function (res) {
      if (res.ok && !u.pathname.endsWith('/sw.js')) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(key, cp); }); }
      return res;
    }).catch(function () {
      return caches.match(key).then(function (m) { return m || caches.match(BASE) || caches.match(BASE + 'index.html'); });
    })
  );
});
