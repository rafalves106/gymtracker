import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { useBackgroundSession } from "../features/session/useBackgroundSession";
import {
  startSession,
  pauseSession,
  resumeSession,
  stopSession,
  cancelSession,
  incrementSet,
  decrementSet,
} from "../features/session/api";
import { ExerciseCard } from "../features/session/ExerciseCard";
import type { Workout } from "../features/workouts/types";
import "../features/session/Session.css";

export function SessionPage() {
  const qc = useQueryClient();
  const {
    session,
    activeWorkout,
    startSession: bgStartSession,
    endSession: bgEndSession,
    updateSession: bgUpdateSession,
  } = useBackgroundSession();

  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(
    activeWorkout?.exercises?.[0]?.id ?? null,
  );

  const { data: todayWorkouts = [], isLoading } = useQuery<Workout[]>({
    queryKey: ["today"],
    queryFn: async () => (await api.get("/workouts/today")).data,
  });

  const startMut = useMutation({
    mutationFn: (w: Workout) => startSession(w.id),
    onSuccess: (s, w) => {
      setActiveExerciseId(
        w.exercises.slice().sort((a, b) => a.order - b.order)[0]?.id ?? null,
      );
      bgStartSession(s, w);
    },
  });

  const controlMut = useMutation({
    mutationFn: ({ action, id }: { action: string; id: string }) => {
      switch (action) {
        case "pause":
          return pauseSession(id);
        case "resume":
          return resumeSession(id);
        case "stop":
          return stopSession(id);
        case "cancel":
          return cancelSession(id);
        default:
          throw new Error("ação inválida");
      }
    },
    onSuccess: (s, { action }) => {
      if (action === "stop" || action === "cancel") {
        setActiveExerciseId(null);
        bgEndSession();
        qc.invalidateQueries({ queryKey: ["today"] });
      } else {
        bgUpdateSession(s);
      }
    },
  });

  const setMut = useMutation({
    mutationFn: ({ dir, exId }: { dir: "inc" | "dec"; exId: string }) =>
      dir === "inc"
        ? incrementSet(session!.id, exId)
        : decrementSet(session!.id, exId),
    onSuccess: (s) => {
      bgUpdateSession(s);
    },
  });

  if (!session || !activeWorkout) {
    return (
      <div className="session-page">
        <h2>Treinar</h2>
        {isLoading ? (
          <p>Carregando...</p>
        ) : todayWorkouts.length === 0 ? (
          <p className="empty-state">
            Nenhum treino agendado para hoje.
            <br />
            Vá em <strong>Treinos</strong> e arraste um treino para hoje.
          </p>
        ) : (
          todayWorkouts.map((w) => (
            <div key={w.id} className="today-card">
              <div>
                <h3>{w.name}</h3>
                <small>{w.exercises.length} exercícios</small>
              </div>
              <button
                className="today-start-btn"
                onClick={() => startMut.mutate(w)}
                disabled={startMut.isPending}
              >
                Iniciar
              </button>
            </div>
          ))
        )}
      </div>
    );
  }

  const paused = session.status === "Paused";
  const sortedExercises = activeWorkout.exercises
    .slice()
    .sort((a, b) => a.order - b.order);

  const setsOf = (exId: string) =>
    session.progress.find((p) => p.exerciseId === exId)?.completedSets ?? 0;

  const firstPending =
    sortedExercises.find((ex) => setsOf(ex.id) < ex.targetSets) ??
    sortedExercises[0] ??
    null;

  const activeExercise =
    sortedExercises.find((ex) => ex.id === activeExerciseId) ?? firstPending;

  const nextExercises = sortedExercises.filter((ex) => ex.id !== activeExercise?.id);

  const totalSets = sortedExercises.reduce((sum, ex) => sum + ex.targetSets, 0);
  const completedSets = sortedExercises.reduce(
    (sum, ex) => sum + Math.min(setsOf(ex.id), ex.targetSets),
    0,
  );
  const completedExercises = sortedExercises.filter(
    (ex) => setsOf(ex.id) >= ex.targetSets,
  ).length;
  const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <div className="session-page">
      <header className="session-head">
        <div>
          <h2>{activeWorkout.name}</h2>
          <p className="session-subtitle">
            {completedExercises} de {sortedExercises.length} exercícios concluídos
          </p>
        </div>
        <span className={`status-badge ${session.status.toLowerCase()}`}>
          {paused ? "Pausado" : "Em andamento"}
        </span>
      </header>

      <section className="session-progress" aria-label="Progresso geral da sessão">
        <div className="progress-row">
          <span>Séries concluídas</span>
          <strong>
            {completedSets} de {totalSets}
          </strong>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Progresso de séries"
          aria-valuemin={0}
          aria-valuemax={totalSets}
          aria-valuenow={completedSets}
        >
          <span className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </section>

      {activeExercise ? (
        <ExerciseCard
          exercise={activeExercise}
          completedSets={setsOf(activeExercise.id)}
          disabled={paused}
          onIncrement={() => setMut.mutate({ dir: "inc", exId: activeExercise.id })}
          onDecrement={() => setMut.mutate({ dir: "dec", exId: activeExercise.id })}
        />
      ) : null}

      <section className="next-exercises" aria-labelledby="next-exercises-title">
        <h3 id="next-exercises-title">Próximos exercícios</h3>
        {nextExercises.length === 0 ? (
          <p className="next-empty">
            Todos os exercícios deste treino já foram concluídos.
          </p>
        ) : (
          <div className="next-list">
            {nextExercises.map((ex) => {
              const exSets = setsOf(ex.id);
              const exDone = exSets >= ex.targetSets;
              return (
                <article key={ex.id} className={`next-card ${exDone ? "is-done" : ""}`}>
                  <div className="next-main">
                    <h4>{ex.name}</h4>
                    <p>{ex.targetReps} reps</p>
                  </div>
                  <p className="next-progress">
                    {exDone ? "Concluído" : "Próximo exercício"}
                    <span>
                      {exSets} de {ex.targetSets} séries
                    </span>
                  </p>
                  <button
                    className="next-start-btn"
                    type="button"
                    onClick={() => setActiveExerciseId(ex.id)}
                    disabled={exDone}
                    aria-label={`Iniciar foco no exercício ${ex.name}`}
                  >
                    Iniciar
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <footer className="session-controls" aria-label="Controles da sessão">
        <button
          className="btn-success final-action"
          onClick={() => controlMut.mutate({ action: "stop", id: session.id })}
          disabled={controlMut.isPending}
        >
          Finalizar sessão
        </button>

        <div className="session-controls-secondary">
          {paused ? (
            <button
              className="btn-secondary"
              onClick={() => controlMut.mutate({ action: "resume", id: session.id })}
              disabled={controlMut.isPending}
            >
              Retomar
            </button>
          ) : (
            <button
              className="btn-secondary"
              onClick={() => controlMut.mutate({ action: "pause", id: session.id })}
              disabled={controlMut.isPending}
            >
              Pausar
            </button>
          )}

          <button
            className="btn-danger"
            onClick={() => {
              if (
                confirm(
                  "Cancelar o treino? O progresso não será salvo como concluído.",
                )
              ) {
                controlMut.mutate({ action: "cancel", id: session.id });
              }
            }}
            disabled={controlMut.isPending}
          >
            Cancelar sessão
          </button>
        </div>
      </footer>
    </div>
  );
}
