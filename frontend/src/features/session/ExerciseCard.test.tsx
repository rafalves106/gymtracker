import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ExerciseCard } from "./ExerciseCard";
import type { Exercise } from "../workouts/types";

const exercise: Exercise = {
  id: "ex-1",
  name: "Supino reto",
  targetSets: 4,
  targetReps: 10,
  restSeconds: 60,
  order: 0,
};

describe("ExerciseCard", () => {
  it("exibe o nome e a meta do exercício", () => {
    render(
      <ExerciseCard
        exercise={exercise}
        completedSets={0}
        disabled={false}
        onIncrement={() => {}}
        onDecrement={() => {}}
      />,
    );
    expect(screen.getByText("Supino reto")).toBeInTheDocument();
    expect(screen.getByText("0 / 4")).toBeInTheDocument();
  });

  it("chama onIncrement ao adicionar uma série", async () => {
    const onIncrement = vi.fn();
    render(
      <ExerciseCard
        exercise={exercise}
        completedSets={1}
        disabled={false}
        onIncrement={onIncrement}
        onDecrement={() => {}}
      />,
    );
    await userEvent.click(screen.getByLabelText("Adicionar série concluída"));
    expect(onIncrement).toHaveBeenCalledOnce();
  });

  it("desabilita o botão de reduzir quando não há séries", () => {
    render(
      <ExerciseCard
        exercise={exercise}
        completedSets={0}
        disabled={false}
        onIncrement={() => {}}
        onDecrement={() => {}}
      />,
    );
    expect(screen.getByLabelText("Reduzir série concluída")).toBeDisabled();
  });

  it("desabilita os controles quando a sessão está pausada", () => {
    render(
      <ExerciseCard
        exercise={exercise}
        completedSets={2}
        disabled={true}
        onIncrement={() => {}}
        onDecrement={() => {}}
      />,
    );
    expect(screen.getByLabelText("Adicionar série concluída")).toBeDisabled();
    expect(screen.getByLabelText("Reduzir série concluída")).toBeDisabled();
  });
});
