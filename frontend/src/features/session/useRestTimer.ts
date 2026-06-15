import { useCallback, useEffect, useRef, useState } from "react";

export function useRestTimer(defaultSeconds: number) {
  const [remaining, setRemaining] = useState(defaultSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = useCallback(
    (seconds = defaultSeconds) => {
      setRemaining(seconds);
      setRunning(true);
    },
    [defaultSeconds],
  );

  const stop = useCallback(() => setRunning(false), []);

  const reset = useCallback(() => {
    setRunning(false);
    setRemaining(defaultSeconds);
  }, [defaultSeconds]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          navigator.vibrate?.(400); // feedback ao fim do descanso
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  return { remaining, running, start, stop, reset };
}
