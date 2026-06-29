import { useState } from "react";
import { Shield, Lock, User } from "lucide-react";

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 800);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-wrapper">
            <Shield size={36} color="#fff" />
          </div>
          <h1>Sistema de Control de Personal</h1>
          <p>Corporación de Seguridad Pública</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="usuario">Usuario</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" aria-hidden="true" />
              <input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingrese su usuario"
                autoComplete="username"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" aria-hidden="true" />
              <input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary btn-block" disabled={loading}>
            {loading ? (
              <span className="spinner-inline"></span>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
        <div className="login-footer">
          <span>Acceso restringido a personal autorizado</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
