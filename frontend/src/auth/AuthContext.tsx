import { createContext, useContext, useState, type ReactNode } from "react";
import { api } from "../api/client";

type AuthCtx = {
  token: string | null;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx>(null!);
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );

  function save(t: string) {
    localStorage.setItem("token", t);
    setToken(t);
  }

  async function login(usernameOrEmail: string, password: string) {
    const { data } = await api.post("/auth/login", {
      usernameOrEmail,
      password,
    });
    save(data.token);
  }

  async function register(username: string, email: string, password: string) {
    const { data } = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    save(data.token);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return (
    <Ctx.Provider value={{ token, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}
