import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
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
  const titleId = useId();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [exercises, setExercises] = useState<CreateExerciseInput[]>([
    { ...emptyExercise },
  ]);
  const modalRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  const isDirty =
    name.trim().length > 0 ||
    exercises.some(
      (ex) =>
        ex.name.trim().length > 0 ||
        ex.targetSets !== emptyExercise.targetSets ||
        ex.targetReps !== emptyExercise.targetReps ||
        ex.restSeconds !== emptyExercise.restSeconds,
    );

  useEffect(() => {
    lastActiveRef.current = document.activeElement as HTMLElement | null;
    firstInputRef.current?.focus();

    return () => {
      lastActiveRef.current?.focus();
    };
  }, []);

  function handleClose() {
    if (isDirty && !confirm("Descartar alterações do treino em criação?")) {
      return;
    }
    onClose();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
      return;
    }

    if (e.key !== "Tab" || !modalRef.current) {
      return;
    }

    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
      return;
    }

    if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

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
    if (!name.trim()) {
      setErrorMessage("Informe o nome do treino.");
      return;
    }
    if (valid.length === 0) {
      setErrorMessage("Adicione ao menos um exercício com nome.");
      return;
    }

    setErrorMessage(null);
    onCreate({ name: name.trim(), exercises: valid });
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <form
        className="modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        onSubmit={handleSubmit}
      >
        <h3 id={titleId}>Novo treino</h3>

        {errorMessage && (
          <p className="form-error" role="status" aria-live="polite">
            {errorMessage}
          </p>
        )}

        <label>
          Nome do treino
          <input
            ref={firstInputRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
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
                onChange={(e) => {
                  updateExercise(i, "name", e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
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
          <button type="button" className="btn-secondary" onClick={handleClose}>
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
