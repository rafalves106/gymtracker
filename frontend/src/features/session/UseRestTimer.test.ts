import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useRestTimer } from "./useRestTimer";

describe("useRestTimer", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("inicia com o valor padrão e parado", () => {
    const { result } = renderHook(() => useRestTimer(60));
    expect(result.current.remaining).toBe(60);
    expect(result.current.running).toBe(false);
  });

  it("conta regressivamente quando iniciado", () => {
    const { result } = renderHook(() => useRestTimer(10));

    act(() => result.current.start());
    expect(result.current.running).toBe(true);

    act(() => void vi.advanceTimersByTime(3000)); // 3 segundos
    expect(result.current.remaining).toBe(7);
  });

  it("para ao chegar em zero", () => {
    const { result } = renderHook(() => useRestTimer(2));

    act(() => result.current.start());
    act(() => void vi.advanceTimersByTime(2000));

    expect(result.current.remaining).toBe(0);
    expect(result.current.running).toBe(false);
  });

  it("reseta para o valor padrão", () => {
    const { result } = renderHook(() => useRestTimer(30));

    act(() => result.current.start(10));
    act(() => void vi.advanceTimersByTime(5000));
    act(() => result.current.reset());

    expect(result.current.remaining).toBe(30);
    expect(result.current.running).toBe(false);
  });
});
