import { type FormEvent, useState } from "react";
import type { CreateExerciseInput } from "./types";

type Props = {
  onCreate: (data: { name: string; exercises: CreateExerciseInput[] }) => void;
  onClose: () => void;
};

const emptyExercise: CreateExerciseInput = {
  name: "",
  targetSets: 3,
  targetReps: 10,
  restSeconds: 60,
};

export function CreateWorkoutForm({ onCreate, onClose }: Props) {
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<CreateExerciseInput[]>([
    { ...emptyExercise },
  ]);

  function updateExercise(
    i: number,
    field: keyof CreateExerciseInput,
    value: string,
  ) {
    setExercises((prev) =>
      prev.map((ex, idx) =>
        idx === i
          ? { ...ex, [field]: field === "name" ? value : Number(value) }
          : ex,
      ),
    );
  }

  function addExercise() {
    setExercises((prev) => [...prev, { ...emptyExercise }]);
  }

  function removeExercise(i: number) {
    setExercises((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = exercises.filter((ex) => ex.name.trim());
    if (!name.trim() || valid.length === 0) return;
    onCreate({ name: name.trim(), exercises: valid });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h3>Novo treino</h3>

        <label>
          Nome do treino
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Treino A - Peito"
            required
          />
        </label>

        <fieldset className="exercises-fieldset">
          <legend>Exercícios</legend>
          {exercises.map((ex, i) => (
            <div key={i} className="exercise-row">
              <input
                value={ex.name}
                onChange={(e) => updateExercise(i, "name", e.target.value)}
                placeholder="Nome do exercício"
                aria-label={`Nome do exercício ${i + 1}`}
              />
              <div className="exercise-nums">
                <label>
                  Séries
                  <input
                    type="number"
                    min={1}
                    value={ex.targetSets}
                    onChange={(e) =>
                      updateExercise(i, "targetSets", e.target.value)
                    }
                  />
                </label>
                <label>
                  Reps
                  <input
                    type="number"
                    min={1}
                    value={ex.targetReps}
                    onChange={(e) =>
                      updateExercise(i, "targetReps", e.target.value)
                    }
                  />
                </label>
                <label>
                  Descanso (s)
                  <input
                    type="number"
                    min={0}
                    value={ex.restSeconds}
                    onChange={(e) =>
                      updateExercise(i, "restSeconds", e.target.value)
                    }
                  />
                </label>
              </div>
              {exercises.length > 1 && (
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeExercise(i)}
                  aria-label={`Remover exercício ${i + 1}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={addExercise}>
            + Adicionar exercício
          </button>
        </fieldset>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Criar treino
          </button>
        </div>
      </form>
    </div>
  );
}
