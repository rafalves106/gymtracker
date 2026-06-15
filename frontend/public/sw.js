const CACHE_NAME = "gymtracker-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  if (type === "START_TIMER_BACKGROUND") {
    const { exerciseId, remaining, defaultSeconds } = data;
    let timeLeft = remaining;
    let timerInterval = null;

    const tick = async () => {
      timeLeft -= 1;

      // Envia update para todos os clients
      const clients = await self.clients.matchAll();
      clients.forEach((client) => {
        client.postMessage({
          type: "TIMER_TICK",
          data: { exerciseId, remaining: timeLeft },
        });
      });

      if (timeLeft <= 0) {
        clearInterval(timerInterval);

        // Notifica fim do timer
        clients.forEach((client) => {
          client.postMessage({
            type: "TIMER_ENDED",
            data: { exerciseId },
          });
        });

        // Mostra notificação do sistema se permitido
        if (Notification.permission === "granted") {
          self.registration.showNotification("GymTracker", {
            body: "Tempo de descanso terminado!",
            tag: "timer-ended",
            badge: "/favicon.svg",
            icon: "/favicon.svg",
            vibrate: [200, 100, 200, 100, 400],
          });
        }
      }
    };

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(tick, 1000);
  }

  if (type === "STOP_TIMER_BACKGROUND") {
    // Timer será parado quando a página fechar a aba
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      if (clients.length > 0) {
        clients[0].focus();
      }
    }),
  );
});
