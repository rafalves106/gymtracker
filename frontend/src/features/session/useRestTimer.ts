import { useCallback, useEffect, useRef, useState } from "react";
import {
  saveTimerState,
  loadTimerState,
} from "./sessionStorage";
import {
  triggerDeviceVibration,
} from "./sessionNotifications";

export interface UseRestTimerProps {
  defaultSeconds: number;
  exerciseId?: string;
  onTimerEnded?: () => void;
}

export function useRestTimer(
  input: UseRestTimerProps | number,
) {
  let config: UseRestTimerProps;
  if (typeof input === "number") {
    config = { defaultSeconds: input, exerciseId: "timer", onTimerEnded: undefined };
  } else {
    config = input;
  }

  const { defaultSeconds, exerciseId, onTimerEnded } = config;

  const [remaining, setRemaining] = useState(() => {
    const saved = loadTimerState();
    if (saved && saved.exerciseId === exerciseId) {
      return saved.remaining;
    }
    return defaultSeconds;
  });
  const [running, setRunning] = useState(() => {
    const saved = loadTimerState();
    return saved?.running && saved.exerciseId === exerciseId ? saved.running : false;
  });
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(
    (seconds = defaultSeconds) => {
      setRemaining(seconds);
      setRunning(true);
      if (exerciseId) {
        saveTimerState(exerciseId, seconds, true, defaultSeconds);
      }
    },
    [defaultSeconds, exerciseId],
  );

  const stop = useCallback(() => {
    setRunning(false);
    if (exerciseId) {
      saveTimerState(exerciseId, remaining, false, defaultSeconds);
    }
  }, [remaining, exerciseId, defaultSeconds]);

  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(defaultSeconds);
    if (exerciseId) {
      saveTimerState(
        exerciseId,
        defaultSeconds,
        false,
        defaultSeconds,
      );
    }
  }, [defaultSeconds, exerciseId]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        const newRemaining = r <= 1 ? 0 : r - 1;

        if (exerciseId) {
          saveTimerState(
            exerciseId,
            newRemaining,
            newRemaining > 0,
            defaultSeconds,
          );
        }

        if (newRemaining === 0) {
          setRunning(false);
          triggerDeviceVibration([200, 100, 200, 100, 400]);
          onTimerEnded?.();
        }

        return newRemaining;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, defaultSeconds, exerciseId, onTimerEnded]);

  return { remaining, running, start, stop, reset };
}
