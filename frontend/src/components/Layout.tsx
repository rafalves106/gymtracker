import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

export function Layout() {
  return (
    <div className="app-shell">
      <main className="app-content">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Navegação principal">
        <NavLink to="/workouts" className="nav-item">
          <span aria-hidden>📋</span>
          <span>Treinos</span>
        </NavLink>
        <NavLink to="/session" className="nav-item">
          <span aria-hidden>▶️</span>
          <span>Treinar</span>
        </NavLink>
        <NavLink to="/settings" className="nav-item">
          <span aria-hidden>⚙️</span>
          <span>Config</span>
        </NavLink>
      </nav>
    </div>
  );
}
