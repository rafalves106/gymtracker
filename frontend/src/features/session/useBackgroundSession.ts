import { useCallback, useEffect, useState } from "react";
import {
  saveSessionState,
  loadSessionState,
  clearSessionState,
  onSessionStorageChange,
} from "./sessionStorage";
import {
  sendNotification,
  onPageVisibilityChange,
  triggerDeviceVibration,
  requestNotificationPermission,
} from "./sessionNotifications";
import type { Session } from "./types";
import type { Workout } from "../workouts/types";

export function useBackgroundSession() {
  const [session, setSession] = useState<Session | null>(() => {
    const stored = loadSessionState();
    return stored?.session || null;
  });
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(() => {
    const stored = loadSessionState();
    return stored?.activeWorkout || null;
  });

  // Sincroniza com storage quando mudam em outra aba
  useEffect(() => {
    const unsubscribe = onSessionStorageChange((state) => {
      if (state) {
        setSession(state.session);
        setActiveWorkout(state.activeWorkout);
      } else {
        setSession(null);
        setActiveWorkout(null);
      }
    });

    return unsubscribe;
  }, []);

  // Pede permissão de notificação ao iniciar
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Monitora visibilidade de página para notificações
  useEffect(() => {
    const unsubscribe = onPageVisibilityChange((visible) => {
      // Será usado por useRestTimer para decidir se notifica
      window.dispatchEvent(
        new CustomEvent("page-visibility-change", {
          detail: { visible },
        }),
      );
    });

    return unsubscribe;
  }, []);

  const startSession = useCallback(
    (newSession: Session, workout: Workout) => {
      setSession(newSession);
      setActiveWorkout(workout);
      saveSessionState(newSession, workout);
    },
    [],
  );

  const endSession = useCallback(() => {
    setSession(null);
    setActiveWorkout(null);
    clearSessionState();
  }, []);

  const updateSession = useCallback((newSession: Session) => {
    setSession(newSession);
    if (activeWorkout) {
      saveSessionState(newSession, activeWorkout);
    }
  }, [activeWorkout]);

  return {
    session,
    activeWorkout,
    startSession,
    endSession,
    updateSession,
  };
}

// Hook para gerenciar notificações de timer
export function useTimerNotifications() {
  const [pageVisible, setPageVisible] = useState(!document.hidden);

  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as CustomEvent;
      setPageVisible(event.detail?.visible ?? !document.hidden);
    };

    window.addEventListener("page-visibility-change", handler);
    return () => window.removeEventListener("page-visibility-change", handler);
  }, []);

  const notifyTimerEnded = useCallback(
    (exerciseName: string) => {
      triggerDeviceVibration([200, 100, 200, 100, 400]); // padrão de vibração forte

      if (!pageVisible) {
        // Fora do app: notificação do sistema
        sendNotification({
          title: "GymTracker",
          body: `Tempo de descanso terminado! Volta para continuar ${exerciseName}.`,
          tag: "timer-ended",
        });
      } else {
        // Dentro do app, fora da página: notificação visual
        sendNotification({
          title: "Tempo de descanso terminado!",
          body: `${exerciseName} pronto para continuar.`,
          tag: "timer-ended-internal",
        });
      }
    },
    [pageVisible],
  );

  const notifySessionTime = useCallback(
    (exerciseName: string, timeRemaining: number) => {
      // Apenas notifica a cada 5 min se fora da página de sessão
      if (!pageVisible && timeRemaining % 300 === 0 && timeRemaining > 0) {
        const mins = Math.floor(timeRemaining / 60);
        sendNotification({
          title: "GymTracker - Sessão ativa",
          body: `${exerciseName}: ${mins}min restantes de descanso.`,
          tag: "session-timer",
        });
      }
    },
    [pageVisible],
  );

  return { notifyTimerEnded, notifySessionTime };
}
