// Offline cache for Balloon Pop.
// App shell: stale-while-revalidate (updates arrive on the next visit).
// Voice clips: cache-first, so each word is downloaded once and then played from disk.
const SHELL = 'bp-shell-v2';
const VOICES = 'bp-voices-v1';
const SHELL_FILES = [
  './', 'index.html', 'css/game.css', 'js/i18n.js', 'js/audio.js', 'js/art.js', 'js/game.js',
  'agent-api.js', 'icon.svg', 'manifest.webmanifest', 'voices/manifest.json', 'voices/manifest.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) { return c.addAll(SHELL_FILES); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== SHELL && k !== VOICES; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  if (req.url.indexOf('/voices/') !== -1 && req.url.indexOf('.mp3') !== -1) {
    e.respondWith(caches.open(VOICES).then(function (c) {
      return c.match(req).then(function (hit) {
        return hit || fetch(req).then(function (res) { if (res.ok) c.put(req, res.clone()); return res; });
      });
    }));
    return;
  }

  e.respondWith(caches.open(SHELL).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      const net = fetch(req).then(function (res) { if (res.ok) c.put(req, res.clone()); return res; }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
