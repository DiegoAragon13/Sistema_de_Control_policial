import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileSpreadsheet,
  LogOut,
  Shield,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Inicio", end: true },
  { to: "/personal", icon: Users, label: "Personal" },
  { to: "/agregar", icon: UserPlus, label: "Agregar Persona" },
  { to: "/importar", icon: FileSpreadsheet, label: "Importar Excel" },
];

function Layout({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  // Determine page title based on current route
  const getPageTitle = () => {
    if (location.pathname === "/") return "Panel de Control";
    if (location.pathname === "/personal") return "Gestión de Personal";
    if (location.pathname.startsWith("/personal/")) return "Ficha de Personal";
    if (location.pathname === "/agregar") return "Nuevo Registro";
    if (location.pathname === "/importar") return "Importar Datos";
    return "Sistema de Control de Personal";
  };

  return (
    <div className="app-layout">
      <aside className="sidebar" role="navigation" aria-label="Navegación principal">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Shield size={24} aria-hidden="true" />
          </div>
          <div className="sidebar-brand">
            <span className="sidebar-title">SICOP</span>
            <span className="sidebar-subtitle">Seguridad Pública</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout} aria-label="Cerrar sesión">
            <LogOut size={20} aria-hidden="true" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="top-header">
          <h2 className="header-title">{getPageTitle()}</h2>
          <div className="header-user">
            <span className="user-name">Admin</span>
            <div className="user-avatar">A</div>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
