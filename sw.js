self.addEventListener('install', (e) => {
    e.waitUntil(caches.open('sleep-pro-v1').then(c => c.addAll(['./', './index.html', './app.js', './style.css'])));
});

self.addEventListener('fetch', (e) => {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(clients.openWindow('./index.html'));
});
