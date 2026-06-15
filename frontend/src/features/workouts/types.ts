export type Exercise = {
  id: string;
  name: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  order: number;
};

export type Workout = {
  id: string;
  name: string;
  scheduledDay: number | null; // 0=Domingo ... 6=Sábado (DayOfWeek do .NET)
  exercises: Exercise[];
};

export type CreateExerciseInput = {
  name: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
};
