import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { decodeToken } from "../auth/jwt";
import { useTheme } from "../theme/useTheme";
import "../features/settings/Settings.css";

export function SettingsPage() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const user = decodeToken(token);
  const { theme, toggle } = useTheme();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="settings-page">
      <h2>Configurações</h2>

      {/* Dados da conta */}
      <section className="settings-section" aria-labelledby="account-title">
        <h3 id="account-title">Conta</h3>
        <div className="account-card">
          <div className="avatar" aria-hidden>
            {user?.username?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <dl className="account-info">
            <dt>Usuário</dt>
            <dd>{user?.username}</dd>
            <dt>E-mail</dt>
            <dd>{user?.email}</dd>
            {user?.isMaster && (
              <>
                <dt>Tipo</dt>
                <dd>
                  <span className="master-badge">Administrador</span>
                </dd>
              </>
            )}
          </dl>
        </div>
      </section>

      {/* Preferências (placeholder para refinarmos depois) */}
      <section className="settings-section" aria-labelledby="prefs-title">
        <h3 id="prefs-title">Preferências</h3>

        <div className="pref-row">
          <span>Tema {theme === "dark" ? "escuro" : "claro"}</span>
          <button
            className="theme-toggle"
            onClick={toggle}
            role="switch"
            aria-checked={theme === "light"}
            aria-label="Alternar tema claro e escuro"
          >
            <span className="theme-toggle-thumb">
              {theme === "dark" ? "🌙" : "☀️"}
            </span>
          </button>
        </div>
      </section>

      {/* Sair */}
      <section className="settings-section">
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Sair da conta
        </button>
      </section>

      <footer className="settings-footer">
        <small>GymTracker • MVP v0.1</small>
      </footer>
    </div>
  );
}
