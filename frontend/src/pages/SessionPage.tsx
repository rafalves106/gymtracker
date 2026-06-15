import { useState, useEffect } from "react";
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
import type { Session } from "../features/session/types";
import type { Workout } from "../features/workouts/types";
import "../features/session/Session.css";

export function SessionPage() {
  const qc = useQueryClient();
  const {
    session: bgSession,
    activeWorkout: bgWorkout,
    startSession: bgStartSession,
    endSession: bgEndSession,
    updateSession: bgUpdateSession,
  } = useBackgroundSession();
  const [session, setSession] = useState<Session | null>(bgSession);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(bgWorkout);

  // Sincroniza com background session storage
  useEffect(() => {
    setSession(bgSession);
  }, [bgSession]);

  useEffect(() => {
    setActiveWorkout(bgWorkout);
  }, [bgWorkout]);

  // Busca os treinos de hoje
  const { data: todayWorkouts = [], isLoading } = useQuery<Workout[]>({
    queryKey: ["today"],
    queryFn: async () => (await api.get("/workouts/today")).data,
  });

  const startMut = useMutation({
    mutationFn: (w: Workout) => startSession(w.id),
    onSuccess: (s, w) => {
      setSession(s);
      setActiveWorkout(w);
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
        setSession(null);
        setActiveWorkout(null);
        bgEndSession();
        qc.invalidateQueries({ queryKey: ["today"] });
      } else {
        setSession(s);
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
      setSession(s);
      bgUpdateSession(s);
    },
  });

  // ----- Sem sessão ativa: lista os treinos de hoje -----
  if (!session || !activeWorkout) {
    return (
      <div className="session-page">
        <h2>Treinar</h2>
        {isLoading ? (
          <p>Carregando...</p>
        ) : todayWorkouts.length === 0 ? (
          <p className="empty-state">
            Nenhum treino agendado para hoje. 💤
            <br />
            Vá em <strong>Treinos</strong> e arraste um treino para hoje!
          </p>
        ) : (
          todayWorkouts.map((w) => (
            <div key={w.id} className="today-card">
              <div>
                <h3>{w.name}</h3>
                <small>{w.exercises.length} exercícios</small>
              </div>
              <button
                className="btn-primary"
                onClick={() => startMut.mutate(w)}
                disabled={startMut.isPending}
              >
                ▶ Iniciar
              </button>
            </div>
          ))
        )}
      </div>
    );
  }

  // ----- Sessão ativa -----
  const paused = session.status === "Paused";
  const setsOf = (exId: string) =>
    session.progress.find((p) => p.exerciseId === exId)?.completedSets ?? 0;

  return (
    <div className="session-page">
      <header className="session-head">
        <div>
          <h2>{activeWorkout.name}</h2>
          <span className={`status-badge ${session.status.toLowerCase()}`}>
            {paused ? "Pausado" : "Em andamento"}
          </span>
        </div>
      </header>

      <div className="exercises-list">
        {activeWorkout.exercises
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              completedSets={setsOf(ex.id)}
              disabled={paused}
              onIncrement={() => setMut.mutate({ dir: "inc", exId: ex.id })}
              onDecrement={() => setMut.mutate({ dir: "dec", exId: ex.id })}
            />
          ))}
      </div>

      {/* Controles da sessão */}
      <div className="session-controls">
        {paused ? (
          <button
            className="btn-primary"
            onClick={() =>
              controlMut.mutate({ action: "resume", id: session.id })
            }
          >
            ▶ Retomar
          </button>
        ) : (
          <button
            className="btn-secondary"
            onClick={() =>
              controlMut.mutate({ action: "pause", id: session.id })
            }
          >
            ⏸ Pausar
          </button>
        )}
        <button
          className="btn-success"
          onClick={() => controlMut.mutate({ action: "stop", id: session.id })}
        >
          ✓ Finalizar
        </button>
        <button
          className="btn-danger"
          onClick={() => {
            if (
              confirm(
                "Cancelar o treino? O progresso não será salvo como concluído.",
              )
            )
              controlMut.mutate({ action: "cancel", id: session.id });
          }}
        >
          ✕ Cancelar
        </button>
      </div>
    </div>
  );
}
