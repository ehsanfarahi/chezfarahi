// Le Camion Doré — Service Worker
// Handles Web Push notifications for order-ready alerts


self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title || "Le Camion Doré", {
      body:             data.body,
      icon:             "/favicon.svg",
      badge:            "/favicon.svg",
      vibrate:          [300, 100, 300, 100, 300],
      tag:              `order-${data.orderNumber}`,
      requireInteraction: true,
      data: {
        orderNumber: data.orderNumber,
        url:         data.url || "/",
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If app already open, navigate it to the target URL
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Otherwise open a new tab at the target URL
        return clients.openWindow(targetUrl);
      })
  );
});

self.addEventListener("install",  () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));




















// self.addEventListener("push", (event) => {
//   if (!event.data) return;

//   const data = event.data.json();

//   event.waitUntil(
//     self.registration.showNotification(data.title || "Le Camion Doré", {
//       body: data.body,
//       icon: "/favicon.svg",
//       badge: "/favicon.svg",
//       vibrate: [300, 100, 300, 100, 300],
//       tag: `order-${data.orderNumber}`,
//       requireInteraction: true, // stays visible until dismissed
//       data: { orderNumber: data.orderNumber, url: "/" },
//       actions: [
//         { action: "view", title: "Voir ma commande" },
//       ],
//     })
//   );
// });

// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();

//   event.waitUntil(
//     clients
//       .matchAll({ type: "window", includeUncontrolled: true })
//       .then((clientList) => {
//         // If app is already open, focus it
//         for (const client of clientList) {
//           if (client.url.includes(self.location.origin) && "focus" in client) {
//             return client.focus();
//           }
//         }
//         // Otherwise open a new tab
//         return clients.openWindow("/");
//       })
//   );
// });

// self.addEventListener("install", () => self.skipWaiting());
// self.addEventListener("activate", (event) => event.waitUntil(clients.claim()));