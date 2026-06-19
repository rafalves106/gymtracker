import { useCallback } from "react";

export const useTimerNotifications = () => {
  const notifyTimerEnded = useCallback(async (exerciseName: string) => {
    // 1. Vibração (mais rápido)
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }

    // 2. Notificação sincronizada (100ms depois)
    setTimeout(async () => {
      if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification("⏱️ Tempo de descanso acabou!", {
          body: `${exerciseName} está pronto`,
          icon: "/icon-192.png",
          badge: "/badge-72.png",
        });
      }
    }, 100);
  }, []);

  return { notifyTimerEnded };
};
