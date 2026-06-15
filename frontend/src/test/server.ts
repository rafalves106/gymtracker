import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const server = setupServer(
  http.post("/api/auth/login", async ({ request }) => {
    const body = (await request.json()) as {
      usernameOrEmail: string;
      password: string;
    };
    if (body.password === "correta") {
      return HttpResponse.json({ token: "fake.jwt.token" });
    }
    return HttpResponse.json(
      { error: "Credenciais inválidas." },
      { status: 401 },
    );
  }),
);
