import type { Session } from "./types";
import type { Workout } from "../workouts/types";

export interface ActiveSessionState {
  session: Session;
  activeWorkout: Workout;
  timerState: {
    exerciseId: string;
    remaining: number;
    running: boolean;
    startedAt: number; // timestamp quando iniciou o timer
    defaultSeconds: number;
  } | null;
  lastUpdated: number;
}

const STORAGE_KEY = "gymtracker_active_session";
const STORAGE_TIMER_KEY = "gymtracker_timer_state";

export function saveSessionState(
  session: Session,
  workout: Workout,
): void {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      session,
      activeWorkout: workout,
      lastUpdated: Date.now(),
    }),
  );
}

export function saveTimerState(
  exerciseId: string,
  remaining: number,
  running: boolean,
  defaultSeconds: number,
): void {
  localStorage.setItem(
    STORAGE_TIMER_KEY,
    JSON.stringify({
      exerciseId,
      remaining,
      running,
      startedAt: running ? Date.now() : null,
      defaultSeconds,
      lastUpdated: Date.now(),
    }),
  );
}

export function loadSessionState(): {
  session: Session;
  activeWorkout: Workout;
} | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function loadTimerState(): {
  exerciseId: string;
  remaining: number;
  running: boolean;
  startedAt: number | null;
  defaultSeconds: number;
} | null {
  const stored = localStorage.getItem(STORAGE_TIMER_KEY);
  if (!stored) return null;

  const state = JSON.parse(stored);

  // Se timer está rodando, calcula tempo restante baseado em quanto tempo passou
  if (state.running && state.startedAt) {
    const elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
    const newRemaining = Math.max(0, state.remaining - elapsed);
    return {
      ...state,
      remaining: newRemaining,
      startedAt: Date.now(), // atualiza para que próximos cálculos sejam corretos
    };
  }

  return state;
}

export function clearSessionState(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_TIMER_KEY);
}

export function getActiveSessionId(): string | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored).session.id : null;
}

export function onSessionStorageChange(
  callback: (state: ActiveSessionState | null) => void,
): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === STORAGE_TIMER_KEY) {
      const sessionState = loadSessionState();
      const timerState = loadTimerState();

      if (sessionState) {
        callback({
          ...sessionState,
          timerState: timerState
            ? {
                exerciseId: timerState.exerciseId,
                remaining: timerState.remaining,
                running: timerState.running,
                startedAt: timerState.startedAt || 0,
                defaultSeconds: timerState.defaultSeconds,
              }
            : null,
          lastUpdated: Date.now(),
        });
      } else {
        callback(null);
      }
    }
  };

  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
