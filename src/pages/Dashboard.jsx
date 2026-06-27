import { Users, Shield, TrafficCone, CalendarPlus } from "lucide-react";

function Dashboard({ personal }) {
  const totalPreventiva = personal.filter((p) => p.categoria === "Preventiva").length;
  const totalViales = personal.filter((p) => p.categoria === "Vial").length;
  const anioActual = new Date().getFullYear();
  const ingresosEsteAnio = personal.filter((p) => new Date(p.fecha_ingreso).getFullYear() === anioActual).length;

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
          <div className="bar-chart">
            <div className="bar-item">
              <span className="bar-label">Preventiva</span>
              <div className="bar-track">
                <div
                  className="bar-fill bar-fill-preventiva"
                  style={{ width: `${(totalPreventiva / personal.length) * 100}%` }}
                ></div>
              </div>
              <span className="bar-value">{totalPreventiva}</span>
            </div>
            <div className="bar-item">
              <span className="bar-label">Vial</span>
              <div className="bar-track">
                <div
                  className="bar-fill bar-fill-vial"
                  style={{ width: `${(totalViales / personal.length) * 100}%` }}
                ></div>
              </div>
              <span className="bar-value">{totalViales}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
