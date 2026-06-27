import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileSpreadsheet,
  LogOut,
  Shield,
} from "lucide-react";

function Layout({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Shield size={32} />
          <span className="sidebar-title">Seguridad Pública</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            <span>Inicio</span>
          </NavLink>
          <NavLink to="/personal" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={20} />
            <span>Personal</span>
          </NavLink>
          <NavLink to="/agregar" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <UserPlus size={20} />
            <span>Agregar Persona</span>
          </NavLink>
          <NavLink to="/importar" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <FileSpreadsheet size={20} />
            <span>Importar Excel</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
      <div className="main-area">
        <header className="top-header">
          <h2 className="header-title">Sistema de Control de Personal</h2>
          <div className="header-user">
            <div className="user-avatar">A</div>
            <span className="user-name">Admin</span>
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
