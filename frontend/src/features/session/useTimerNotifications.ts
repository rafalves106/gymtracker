import { useCallback } from "react";

export const useTimerNotifications = () => {
  const notifyTimerEnded = useCallback(async (exerciseName: string) => {
    // 1. Vibração (mais rápido)
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }

    // Safari/iOS precisa de permissão explícita para notificação.
    if ("Notification" in window && Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {
        // Ignora falhas de permissão e segue apenas com vibração.
      }
    }

    // 2. Notificação sincronizada (100ms depois)
    setTimeout(async () => {
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("⏱️ Tempo de descanso acabou!", {
            body: `${exerciseName} está pronto`,
            icon: "/favicon.svg",
            badge: "/favicon.svg",
          });
        } catch {
          // Em alguns contextos iOS a notificação pode falhar; vibração já cobre feedback.
        }
      }
    }, 100);
  }, []);

  return { notifyTimerEnded };
};
