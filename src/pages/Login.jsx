import { useState } from "react";
import { Shield, Lock, User, AlertCircle } from "lucide-react";
import { login } from "../services/authService";

function Login({ onLogin }) {
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [intentos, setIntentos]   = useState(0);
  const MAX_INTENTOS = 5;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Bloquear temporalmente tras demasiados intentos
    if (intentos >= MAX_INTENTOS) {
      setError(`Demasiados intentos fallidos. Espera un momento e intenta de nuevo.`);
      return;
    }

    if (!username.trim() || !password) {
      setError("Ingresa tu usuario y contraseña.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sesion = await login(username.trim(), password);
      setIntentos(0);
      onLogin(sesion);
    } catch (err) {
      const nuevoIntentos = intentos + 1;
      setIntentos(nuevoIntentos);
      const restantes = MAX_INTENTOS - nuevoIntentos;
      setError(
        restantes > 0
          ? `${err.message || "Usuario o contraseña incorrectos."} (${restantes} intento${restantes !== 1 ? "s" : ""} restante${restantes !== 1 ? "s" : ""})`
          : "Cuenta bloqueada temporalmente por múltiples intentos fallidos."
      );
    } finally {
      setLoading(false);
    }
  };

  const bloqueado = intentos >= MAX_INTENTOS;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon-wrapper">
            <Shield size={36} color="#fff" aria-hidden="true" />
          </div>
          <h1>Sistema de Control de Personal</h1>
          <p>Corporación de Seguridad Pública</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group login-card-group">
            <label htmlFor="username">Usuario</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" aria-hidden="true" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(null); }}
                placeholder="Ingrese su usuario"
                autoComplete="username"
                disabled={loading || bloqueado}
                aria-invalid={!!error}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>
          </div>

          <div className="form-group login-card-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" aria-hidden="true" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                disabled={loading || bloqueado}
                aria-invalid={!!error}
              />
            </div>
          </div>

          {error && (
            <div id="login-error" role="alert" className="login-error">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary btn-block"
            disabled={loading || bloqueado}
            aria-busy={loading}
          >
            {loading ? <span className="spinner-inline"></span> : "Entrar"}
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
