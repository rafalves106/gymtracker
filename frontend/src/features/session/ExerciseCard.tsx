import { useRestTimer } from "./useRestTimer";
import { useTimerNotifications } from "./useTimerNotifications";
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
    timer.start();
  }

  const mins = Math.floor(timer.remaining / 60);
  const secs = timer.remaining % 60;
  const timeLabel = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <article
      className={`exercise-card exercise-card-focus ${done ? "done" : ""}`}
    >
      <header className="exercise-card-head">
        <p className="exercise-eyebrow">Exercício ativo</p>
        <h3>{exercise.name}</h3>
        <span className="target">
          Meta: {exercise.targetReps} reps • {exercise.targetSets} séries
        </span>
      </header>

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
          −1 série
        </button>

        <div className="sets-summary">
          <span className="sets-display" aria-live="polite">
            {completedSets} / {exercise.targetSets}
          </span>
          <span className="sets-text">
            {completedSets} de {exercise.targetSets} séries
          </span>
        </div>

        <button
          className="counter-btn add"
          onClick={handleSetDone}
          disabled={disabled}
          aria-label="Adicionar série concluída"
        >
          +1 série
        </button>
      </div>

      <div className="rest-block" aria-live="assertive">
        <div className={`rest-circle ${timer.remaining === 0 ? "ended" : ""}`}>
          <span className="rest-label">Descanso</span>
          <span className="rest-value">{timeLabel}</span>
        </div>

        <div
          className="rest-actions"
          role="group"
          aria-label="Controles do descanso"
        >
          {!timer.running ? (
            <button
              onClick={() => timer.start()}
              disabled={disabled}
              aria-label="Iniciar descanso"
            >
              Iniciar descanso
            </button>
          ) : (
            <button onClick={timer.stop} aria-label="Pausar descanso">
              Pausar descanso
            </button>
          )}
          <button onClick={timer.reset} aria-label="Resetar descanso">
            Resetar descanso
          </button>
        </div>
      </div>
    </article>
  );
}
