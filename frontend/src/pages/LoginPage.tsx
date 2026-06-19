import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { useAuth } from "../auth/AuthContext";
import { CommonInput } from "../components/CommonInput";
import "./LoginPage.css";

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "login") {
        await login(identifier, password);
      } else {
        await register(username, email, password);
      }
      navigate("/workouts");
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      setError(
        axiosErr.response?.data?.error ??
          "Falha na autenticação. Verifique os dados.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <h1>GymTracker</h1>

        {mode === "login" ? (
          <CommonInput
            id="identifier"
            type="email"
            label="Usuário ou e-mail"
            placeholder="seu@email.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="email"
            autoCapitalize="none"
          />
        ) : (
          <>
            <CommonInput
              id="username"
              type="text"
              label="Usuário"
              placeholder="Seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              autoCapitalize="none"
            />

            <CommonInput
              id="email"
              type="email"
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </>
        )}

        <CommonInput
          id="password"
          type="password"
          label="Senha"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={undefined}
          required
          showPasswordToggle
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />

        {error && <div className="error-banner" role="alert">{error}</div>}

        <button
          type="submit"
          className="btn-primary btn-login"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Entrando..." : mode === "login" ? "Entrar" : "Cadastrar"}
        </button>

        <button
          type="button"
          className="login-switch"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError(null);
          }}
        >
          {mode === "login"
            ? "Não tem conta? Cadastre-se"
            : "Já tem conta? Entrar"}
        </button>
      </form>
    </div>
  );
}
