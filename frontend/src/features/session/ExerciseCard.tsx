import { useRestTimer } from "./useRestTimer";
import { useTimerNotifications } from "./useBackgroundSession";
import type { Exercise } from "../workouts/types";

type Props = {
  exercise: Exercise;
  completedSets: number;
  disabled: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
};

export function ExerciseCard({
  exercise,
  completedSets,
  disabled,
  onIncrement,
  onDecrement,
}: Props) {
  const { notifyTimerEnded } = useTimerNotifications();
  const timer = useRestTimer({
    defaultSeconds: exercise.restSeconds,
    exerciseId: exercise.id,
    onTimerEnded: () => notifyTimerEnded(exercise.name),
  });
  const done = completedSets >= exercise.targetSets;

  function handleSetDone() {
    onIncrement();
    timer.start(); // inicia o descanso automaticamente
  }

  const mins = Math.floor(timer.remaining / 60);
  const secs = timer.remaining % 60;
  const timeLabel = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <article className={`exercise-card ${done ? "done" : ""}`}>
      <header className="exercise-card-head">
        <h3>{exercise.name}</h3>
        <span className="target">
          {exercise.targetReps} reps • {exercise.restSeconds}s descanso
        </span>
      </header>

      {/* Contador de séries */}
      <div
        className="sets-counter"
        role="group"
        aria-label={`Séries de ${exercise.name}`}
      >
        <button
          className="counter-btn"
          onClick={onDecrement}
          disabled={disabled || completedSets === 0}
          aria-label="Reduzir série concluída"
        >
          −
        </button>
        <span className="sets-display" aria-live="polite">
          {completedSets} / {exercise.targetSets}
        </span>
        <button
          className="counter-btn add"
          onClick={handleSetDone}
          disabled={disabled}
          aria-label="Adicionar série concluída"
        >
          +
        </button>
      </div>

      {/* Timer de descanso */}
      <div className="rest-timer" aria-live="assertive">
        <span className={`rest-time ${timer.remaining === 0 ? "ended" : ""}`}>
          ⏱️ {timeLabel}
        </span>
        <div className="rest-actions">
          {!timer.running ? (
            <button
              onClick={() => timer.start()}
              disabled={disabled}
              aria-label="Iniciar descanso"
            >
              ▶
            </button>
          ) : (
            <button onClick={timer.stop} aria-label="Pausar descanso">
              ⏸
            </button>
          )}
          <button onClick={timer.reset} aria-label="Resetar descanso">
            ↻
          </button>
        </div>
      </div>
    </article>
  );
}
