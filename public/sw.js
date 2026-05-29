const CACHE_NAME = 'vocab-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                  .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
          // Si le réseau échoue et qu'on n'a pas de cache, on peut renvoyer une page d'erreur ou le root
          return cachedResponse;
        });

        return cachedResponse || fetchPromise;
      })
  );
});

// Gérer le clic sur la notification pour remettre l'application au premier plan
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});

// Stocker le timeout de notification en arrière-plan
let vocabNotificationTimeout = null;

// Écouter les messages du client React pour déclencher et planifier les notifications
self.addEventListener('message', event => {
  if (!event.data) return;

  // Déclencher immédiatement
  if (event.data.type === 'TRIGGER_NOTIFICATION') {
    self.registration.showNotification(event.data.title, {
      body: event.data.body,
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [150, 100, 150],
      tag: 'vocab-reminder',
      renotify: true,
      data: {
        url: '/'
      }
    });
  }
  
  // Planifier une notification d'inactivité (ex: 24h après)
  if (event.data.type === 'SCHEDULE_INACTIVE_NOTIFICATION') {
    if (vocabNotificationTimeout) {
      clearTimeout(vocabNotificationTimeout);
    }
    const delay = event.data.delay || 86400000; // Par défaut 24h (en ms)
    const isRecurring = event.data.recurring || false;
    
    const showAndReschedule = () => {
      self.registration.showNotification(event.data.title, {
        body: event.data.body,
        icon: '/icon.png',
        badge: '/icon.png',
        vibrate: [200, 100, 200],
        tag: 'vocab-inactive-reminder',
        renotify: true,
        data: {
          url: '/'
        }
      });
      if (isRecurring) {
        vocabNotificationTimeout = setTimeout(showAndReschedule, delay);
      }
    };

    vocabNotificationTimeout = setTimeout(showAndReschedule, delay);
  }
  
  // Annuler la notification planifiée (quand l'utilisateur revient sur l'application)
  if (event.data.type === 'CANCEL_NOTIFICATION') {
    if (vocabNotificationTimeout) {
      clearTimeout(vocabNotificationTimeout);
      vocabNotificationTimeout = null;
    }
  }
});
