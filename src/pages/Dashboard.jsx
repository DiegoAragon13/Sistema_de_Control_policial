import { Users, Shield, TrafficCone, CalendarPlus } from "lucide-react";
import { useState } from "react";

function Dashboard({ personal }) {
  const totalPreventiva = personal.filter((p) => p.categoria === "Preventiva").length;
  const totalViales = personal.filter((p) => p.categoria === "Vial").length;
  const anioActual = new Date().getFullYear();
  const ingresosEsteAnio = personal.filter((p) => new Date(p.fecha_ingreso).getFullYear() === anioActual).length;
  const [hovered, setHovered] = useState(null);

  const pctPreventiva = ((totalPreventiva / personal.length) * 100).toFixed(0);
  const pctVial = ((totalViales / personal.length) * 100).toFixed(0);

  const centerLabel = hovered === "preventiva"
    ? { value: totalPreventiva, label: "Preventiva", pct: `${pctPreventiva}%` }
    : hovered === "vial"
    ? { value: totalViales, label: "Vial", pct: `${pctVial}%` }
    : { value: personal.length, label: "Total", pct: "" };

  return (
    <div className="dashboard">
      <h1 className="page-title">Panel de Control</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#111844" }}>
            <Users size={28} color="#fff" />
          </div>
          <div className="stat-info">
            <span className="stat-number">{personal.length}</span>
            <span className="stat-label">Total Personal</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#4B5694" }}>
            <Shield size={28} color="#fff" />
          </div>
          <div className="stat-info">
            <span className="stat-number">{totalPreventiva}</span>
            <span className="stat-label">Preventiva</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#7288AE" }}>
            <TrafficCone size={28} color="#fff" />
          </div>
          <div className="stat-info">
            <span className="stat-number">{totalViales}</span>
            <span className="stat-label">Vial</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "#111844" }}>
            <CalendarPlus size={28} color="#fff" />
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
            {[...personal]
              .sort((a, b) => new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso))
              .slice(0, 5)
              .map((p) => (
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
            <div className="pie-chart">
              <svg viewBox="0 0 200 200" className="pie-svg">
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
                  strokeDasharray={`${(totalPreventiva / personal.length) * 502.65} 502.65`}
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
