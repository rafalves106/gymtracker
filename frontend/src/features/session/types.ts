export type ExerciseProgress = {
  exerciseId: string;
  completedSets: number;
};

export type Session = {
  id: string;
  workoutId: string;
  status: "Running" | "Paused" | "Completed" | "Cancelled";
  startedAt: string;
  finishedAt: string | null;
  progress: ExerciseProgress[];
};
