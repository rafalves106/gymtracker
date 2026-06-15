import "@testing-library/jest-dom";
import { afterEach, afterAll, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./server";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

Object.defineProperty(navigator, "vibrate", {
  value: () => true,
  writable: true,
});
