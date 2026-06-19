import { api } from "../../api/client";
import type { Workout, CreateExerciseInput } from "./types";

export async function fetchWorkouts(): Promise<Workout[]> {
  const { data } = await api.get("/workouts");
  return data;
}

export async function createWorkout(input: {
  name: string;
  exercises: CreateExerciseInput[];
}): Promise<Workout> {
  const { data } = await api.post("/workouts", input);
  return data;
}

export async function updateWorkout(
  workoutId: string,
  input: { name: string; exercises: CreateExerciseInput[] },
): Promise<Workout> {
  const { data } = await api.put(`/workouts/${workoutId}`, input);
  return data;
}

export async function deleteWorkout(workoutId: string): Promise<void> {
  await api.delete(`/workouts/${workoutId}`);
}

export async function assignDay(
  workoutId: string,
  day: number | null,
): Promise<void> {
  await api.put(`/workouts/${workoutId}/day`, { day });
}
