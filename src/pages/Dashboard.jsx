import { useState, useMemo, useEffect, useCallback } from "react";
import { Users, Shield, TrafficCone, CalendarPlus, Share2 } from "lucide-react";
import * as personalService from "../services/personalService";
import { invoke } from "../lib/tauri";

function Dashboard() {
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [hovered, setHovered]   = useState(null);
  const [exportandoSicop, setExportandoSicop] = useState(false);

  useEffect(() => {
    personalService.getAll()
      .then(setPersonal)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Exportar DB cifrada para la app móvil
  const handleExportarSicop = useCallback(async () => {
    if (exportandoSicop) return;
    setExportandoSicop(true);
    try {
      // Pedir carpeta destino via el comando de archivos
      const resultado = await invoke("cmd_exportar_sicop", { rutaDestino: "" });
      if (resultado) {
        alert(`Archivo generado correctamente:\n${resultado}`);
      }
    } catch (e) {
      alert("Error al exportar: " + (e.message || e));
    } finally {
      setExportandoSicop(false);
    }
  }, [exportandoSicop]);

  // Solo contar elementos ACTIVOS en todas las métricas del dashboard
  const activos         = useMemo(() => personal.filter((p) => p.activo !== false), [personal]);

  const totalPreventiva = useMemo(() => activos.filter((p) => p.categoria === "Preventiva").length, [activos]);
  const totalViales     = useMemo(() => activos.filter((p) => p.categoria === "Vial").length, [activos]);
  const anioActual      = useMemo(() => new Date().getFullYear(), []);
  const ingresosEsteAnio = useMemo(() =>
    activos.filter((p) => new Date(p.fecha_ingreso).getFullYear() === anioActual).length,
    [activos, anioActual]
  );
  const pctPreventiva = useMemo(() =>
    activos.length > 0 ? ((totalPreventiva / activos.length) * 100).toFixed(0) : "0",
    [totalPreventiva, activos.length]
  );
  const pctVial = useMemo(() =>
    activos.length > 0 ? ((totalViales / activos.length) * 100).toFixed(0) : "0",
    [totalViales, activos.length]
  );
  const recientes = useMemo(() =>
    [...activos]
      .sort((a, b) => new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso))
      .slice(0, 5),
    [activos]
  );

  const centerLabel =
    hovered === "preventiva" ? { value: totalPreventiva, label: "Preventiva", pct: `${pctPreventiva}%` } :
    hovered === "vial"       ? { value: totalViales,     label: "Vial",        pct: `${pctVial}%` } :
                               { value: activos.length,  label: "Activos",     pct: "" };

  if (loading) return (
    <div className="dashboard">
      <h1 className="page-title">Panel de Control</h1>
      <p style={{ color: "var(--gris-texto)" }}>Cargando datos...</p>
    </div>
  );

  if (error) return (
    <div className="dashboard">
      <h1 className="page-title">Panel de Control</h1>
      <div className="alert-error">{error}</div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="page-header-row">
        <h1 className="page-title">Panel de Control</h1>
        <button className="btn-secondary" onClick={handleExportarSicop} disabled={exportandoSicop}>
          {exportandoSicop ? <span className="spinner-export"></span> : <Share2 size={16} aria-hidden="true" />}
          {exportandoSicop ? "Exportando..." : "Compartir DB (.sicop)"}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#111844" }}>
            <Users size={28} color="#fff" aria-hidden="true" />
          </div>
          <div className="stat-info">
            <span className="stat-number">{activos.length}</span>
            <span className="stat-label">Total Activos</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#4B5694" }}>
            <Shield size={28} color="#fff" aria-hidden="true" />
          </div>
          <div className="stat-info">
            <span className="stat-number">{totalPreventiva}</span>
            <span className="stat-label">Preventiva</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#7288AE" }}>
            <TrafficCone size={28} color="#fff" aria-hidden="true" />
          </div>
          <div className="stat-info">
            <span className="stat-number">{totalViales}</span>
            <span className="stat-label">Vial</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#111844" }}>
            <CalendarPlus size={28} color="#fff" aria-hidden="true" />
          </div>
          <div className="stat-info">
            <span className="stat-number">{ingresosEsteAnio}</span>
            <span className="stat-label">Ingresos {anioActual}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-card">
          <h3>Ingresos Recientes</h3>
          {recientes.length === 0 ? (
            <p style={{ color: "var(--gris-texto)", fontStyle: "italic", fontSize: "0.88rem" }}>
              No hay registros aún.
            </p>
          ) : (
            <div className="recent-list">
              {recientes.map((p) => (
                <div key={p.id} className="recent-item">
                  <div className="recent-avatar">
                    {p.foto
                      ? <img src={`data:image/jpeg;base64,${p.foto}`} alt="" className="avatar-img" />
                      : <>{p.nombre.charAt(0)}{p.apellidos.charAt(0)}</>
                    }
                  </div>
                  <div className="recent-info">
                    <span className="recent-name">{p.nombre} {p.apellidos}</span>
                    <span className="recent-meta">{p.categoria} · {p.fecha_ingreso}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Preventiva vs Vial</h3>
          <div className="pie-chart-container">
            <div className="pie-chart" role="img"
              aria-label={`Distribución: ${totalPreventiva} Preventiva (${pctPreventiva}%), ${totalViales} Vial (${pctVial}%)`}>
              <svg viewBox="0 0 200 200" className="pie-svg" aria-hidden="true">
                <circle cx="100" cy="100" r="80" fill="none"
                  stroke={hovered === "vial" ? "#5a7499" : "var(--azul-claro)"}
                  strokeWidth="40" className="pie-segment"
                  opacity={hovered === "preventiva" ? 0.5 : 1}
                  onMouseEnter={() => setHovered("vial")}
                  onMouseLeave={() => setHovered(null)} />
                <circle cx="100" cy="100" r="80" fill="none"
                  stroke={hovered === "preventiva" ? "#3a4578" : "var(--azul-medio)"}
                  strokeWidth="40"
                  strokeDasharray={`${activos.length > 0 ? (totalPreventiva / activos.length) * 502.65 : 0} 502.65`}
                  strokeDashoffset="0" transform="rotate(-90 100 100)"
                  className="pie-segment"
                  opacity={hovered === "vial" ? 0.5 : 1}
                  onMouseEnter={() => setHovered("preventiva")}
                  onMouseLeave={() => setHovered(null)} />
              </svg>
              <div className="pie-center">
                <span className="pie-total">{centerLabel.value}</span>
                <span className="pie-total-label">{centerLabel.label}</span>
                {centerLabel.pct && <span className="pie-total-pct">{centerLabel.pct}</span>}
              </div>
            </div>
            <div className="pie-legend">
              {[
                { key: "preventiva", label: "Preventiva", value: totalPreventiva, pct: pctPreventiva, color: "var(--azul-medio)" },
                { key: "vial",       label: "Vial",        value: totalViales,     pct: pctVial,       color: "var(--azul-claro)" },
              ].map(({ key, label, value, pct, color }) => (
                <div key={key}
                  className={`pie-legend-item ${hovered === key ? "legend-active" : ""}`}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}>
                  <span className="pie-dot" style={{ background: color }}></span>
                  <span className="pie-legend-text">{label}</span>
                  <span className="pie-legend-value">{value} ({pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
