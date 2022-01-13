importScripts("/precache-manifest.69e652689d524433b9ce5c3e6a7532b9.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

/* global workbox */

if (workbox) {
  self.skipWaiting();
  console.log(`Workbox is loaded`);
  workbox.setConfig({ debug: true });
  workbox.precaching.precacheAndRoute(self.__precacheManifest);

  // workbox.routing.registerRoute(
  //   '/employees',
  //   new workbox.strategies.StaleWhileRevalidate({
  //     cacheName: 'sebastians-cache',
  //   }),
  // );

  workbox.routing.registerRoute(
    new RegExp('/images/.*.jpg'),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'sebastians-image-cache',
    }),
  );
  self.addEventListener('push', (event) => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.body.message,
      icon: 'img/icons/employees_192x192.png',
    });
  });
} else {
  console.log(`Workbox didn't load`);
}

