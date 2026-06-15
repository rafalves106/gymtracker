import { api } from "../../api/client";
import type { Session } from "./types";

export async function startSession(workoutId: string): Promise<Session> {
  const { data } = await api.post(`/sessions/start/${workoutId}`);
  return data;
}

export const pauseSession = (id: string) => mutate(id, "pause");
export const resumeSession = (id: string) => mutate(id, "resume");
export const stopSession = (id: string) => mutate(id, "stop");
export const cancelSession = (id: string) => mutate(id, "cancel");

export async function incrementSet(
  id: string,
  exerciseId: string,
): Promise<Session> {
  const { data } = await api.post(
    `/sessions/${id}/exercise/${exerciseId}/increment`,
  );
  return data;
}

export async function decrementSet(
  id: string,
  exerciseId: string,
): Promise<Session> {
  const { data } = await api.post(
    `/sessions/${id}/exercise/${exerciseId}/decrement`,
  );
  return data;
}

async function mutate(id: string, action: string): Promise<Session> {
  const { data } = await api.post(`/sessions/${id}/${action}`);
  return data;
}
