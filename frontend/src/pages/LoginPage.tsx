import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./LoginPage.css";
import { AxiosError } from "axios";

export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
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
        await login(username, password);
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
    <div className="login-page">
      <header className="login-header">
        <h1>🏋️ GymTracker</h1>
        <p>{mode === "login" ? "Entre na sua conta" : "Crie sua conta"}</p>
      </header>

      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <label>
          {mode === "login" ? "Usuário ou e-mail" : "Usuário"}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            autoCapitalize="none"
          />
        </label>

        {mode === "register" && (
          <label>
            E-mail
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
        )}

        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
          />
        </label>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}
        </button>
      </form>

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
    </div>
  );
}
