import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  assignDay,
} from "../features/workouts/api";
import { WeekBoard } from "../features/workouts/WeekBoard";
import { CreateWorkoutForm } from "../features/workouts/CreateWorkoutForm";
import { EditWorkoutForm } from "../features/workouts/EditWorkoutForm";
import "../features/workouts/Workouts.css";
import type { CreateExerciseInput, Workout } from "../features/workouts/types";

export function WorkoutsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: fetchWorkouts,
  });

  const createMut = useMutation({
    mutationFn: createWorkout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["today"] });
      setShowForm(false);
    },
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; exercises: CreateExerciseInput[] };
    }) => updateWorkout(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["today"] });
      setEditingWorkout(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteWorkout(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["today"] });
      setEditingWorkout(null);
    },
  });

  const assignMut = useMutation({
    mutationFn: ({ id, day }: { id: string; day: number | null }) =>
      assignDay(id, day),
    onMutate: async ({ id, day }) => {
      await qc.cancelQueries({ queryKey: ["workouts"] });
      const prev = qc.getQueryData<Workout[]>(["workouts"]);
      qc.setQueryData<Workout[]>(["workouts"], (old) =>
        old?.map((w) => (w.id === id ? { ...w, scheduledDay: day } : w)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(["workouts"], ctx?.prev),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["today"] });
    },
  });

  return (
    <div className="workouts-page">
      <header className="page-header">
        <h2>Meus treinos</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Novo
        </button>
      </header>

      <p className="hint">
        Arraste um treino para um dia da semana para agendá-lo. 💡
      </p>

      {isLoading ? (
        <p>Carregando...</p>
      ) : workouts.length === 0 ? (
        <p className="empty-state">
          Nenhum treino ainda. Crie o primeiro no botão <strong>+ Novo</strong>!
        </p>
      ) : (
        <WeekBoard
          workouts={workouts}
          onAssign={(id, day) => assignMut.mutate({ id, day })}
          onEdit={(workout) => setEditingWorkout(workout)}
          onDelete={(workout) => {
            if (confirm(`Excluir treino "${workout.name}"?`)) {
              deleteMut.mutate(workout.id);
            }
          }}
        />
      )}

      {showForm && (
        <CreateWorkoutForm
          onCreate={(data) => createMut.mutate(data)}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingWorkout && (
        <EditWorkoutForm
          workout={editingWorkout}
          onSave={(data) => updateMut.mutate({ id: editingWorkout.id, data })}
          onDelete={() => {
            if (confirm(`Excluir treino "${editingWorkout.name}"?`)) {
              deleteMut.mutate(editingWorkout.id);
            }
          }}
          onClose={() => setEditingWorkout(null)}
        />
      )}
    </div>
  );
}
