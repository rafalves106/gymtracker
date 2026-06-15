import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { LoginPage } from "./LoginPage";
import { AuthProvider } from "../auth/AuthContext";

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  it("renderiza o formulário de login", () => {
    renderLogin();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("mostra erro ao logar com senha incorreta", async () => {
    renderLogin();

    await userEvent.type(screen.getByLabelText(/usuário ou e-mail/i), "joao");
    await userEvent.type(screen.getByLabelText(/senha/i), "errada");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Credenciais inválidas.",
    );
  });

  it("alterna para o modo de cadastro", async () => {
    renderLogin();
    await userEvent.click(screen.getByText(/não tem conta/i));
    expect(
      screen.getByRole("button", { name: "Cadastrar" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^e-mail$/i)).toBeInTheDocument();
  });
});
