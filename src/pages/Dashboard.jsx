import { Users, Shield, TrafficCone, CalendarPlus } from "lucide-react";
import { useState, useMemo } from "react";

function Dashboard({ personal, loading }) {
  const [hovered, setHovered] = useState(null);

  // Memoize all computed values to prevent recalculation on every render/hover
  const totalPreventiva = useMemo(
    () => personal.filter((p) => p.categoria === "Preventiva").length,
    [personal]
  );

  const totalViales = useMemo(
    () => personal.filter((p) => p.categoria === "Vial").length,
    [personal]
  );

  const anioActual = useMemo(() => new Date().getFullYear(), []);

  const ingresosEsteAnio = useMemo(
    () => personal.filter((p) => new Date(p.fecha_ingreso).getFullYear() === anioActual).length,
    [personal, anioActual]
  );

  const pctPreventiva = useMemo(
    () => (personal.length > 0 ? ((totalPreventiva / personal.length) * 100).toFixed(0) : "0"),
    [totalPreventiva, personal.length]
  );

  const pctVial = useMemo(
    () => (personal.length > 0 ? ((totalViales / personal.length) * 100).toFixed(0) : "0"),
    [totalViales, personal.length]
  );

  const recientes = useMemo(
    () =>
      [...personal]
        .sort((a, b) => new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso))
        .slice(0, 5),
    [personal]
  );

  // This one depends on hover state but is cheap — no need to memoize
  const centerLabel =
    hovered === "preventiva"
      ? { value: totalPreventiva, label: "Preventiva", pct: `${pctPreventiva}%` }
      : hovered === "vial"
      ? { value: totalViales, label: "Vial", pct: `${pctVial}%` }
      : { value: personal.length, label: "Total", pct: "" };

  if (loading) {
    return (
      <div className="dashboard">
        <h1 className="page-title">Panel de Control</h1>
        <p style={{ color: "var(--gris-texto)" }}>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1 className="page-title">Panel de Control</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#111844" }}>
            <Users size={28} color="#fff" aria-hidden="true" />
          </div>
          <div className="stat-info">
            <span className="stat-number">{personal.length}</span>
            <span className="stat-label">Total Personal</span>
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
          <div className="recent-list">
            {recientes.map((p) => (
              <div key={p.id} className="recent-item">
                <div className="recent-avatar">
                  {p.nombre.charAt(0)}
                  {p.apellidos.charAt(0)}
                </div>
                <div className="recent-info">
                  <span className="recent-name">
                    {p.nombre} {p.apellidos}
                  </span>
                  <span className="recent-meta">
                    {p.categoria} · {p.fecha_ingreso}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Preventiva vs Vial</h3>
          <div className="pie-chart-container">
            <div className="pie-chart" role="img" aria-label={`Distribución: ${totalPreventiva} Preventiva (${pctPreventiva}%), ${totalViales} Vial (${pctVial}%)`}>
              <svg viewBox="0 0 200 200" className="pie-svg" aria-hidden="true">
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={hovered === "vial" ? "#5a7499" : "var(--azul-claro)"}
                  strokeWidth="40"
                  className="pie-segment"
                  opacity={hovered === "preventiva" ? 0.5 : 1}
                  onMouseEnter={() => setHovered("vial")}
                  onMouseLeave={() => setHovered(null)}
                />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={hovered === "preventiva" ? "#3a4578" : "var(--azul-medio)"}
                  strokeWidth="40"
                  strokeDasharray={`${personal.length > 0 ? (totalPreventiva / personal.length) * 502.65 : 0} 502.65`}
                  strokeDashoffset="0"
                  transform="rotate(-90 100 100)"
                  className="pie-segment"
                  opacity={hovered === "vial" ? 0.5 : 1}
                  onMouseEnter={() => setHovered("preventiva")}
                  onMouseLeave={() => setHovered(null)}
                />
              </svg>
              <div className="pie-center">
                <span className="pie-total">{centerLabel.value}</span>
                <span className="pie-total-label">{centerLabel.label}</span>
                {centerLabel.pct && <span className="pie-total-pct">{centerLabel.pct}</span>}
              </div>
            </div>
            <div className="pie-legend">
              <div
                className={`pie-legend-item ${hovered === "preventiva" ? "legend-active" : ""}`}
                onMouseEnter={() => setHovered("preventiva")}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="pie-dot" style={{ background: "var(--azul-medio)" }}></span>
                <span className="pie-legend-text">Preventiva</span>
                <span className="pie-legend-value">{totalPreventiva} ({pctPreventiva}%)</span>
              </div>
              <div
                className={`pie-legend-item ${hovered === "vial" ? "legend-active" : ""}`}
                onMouseEnter={() => setHovered("vial")}
                onMouseLeave={() => setHovered(null)}
              >
                <span className="pie-dot" style={{ background: "var(--azul-claro)" }}></span>
                <span className="pie-legend-text">Vial</span>
                <span className="pie-legend-value">{totalViales} ({pctVial}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
