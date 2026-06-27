import { Users, Shield, TrafficCone, CalendarPlus } from "lucide-react";

function Dashboard({ personal }) {
  const totalPreventiva = personal.filter((p) => p.categoria === "Preventiva").length;
  const totalViales = personal.filter((p) => p.categoria === "Vial").length;
  const anioActual = new Date().getFullYear();
  const ingresosEsteAnio = personal.filter((p) => new Date(p.fecha_ingreso).getFullYear() === anioActual).length;
  const corporaciones = [...new Set(personal.map((p) => p.asignacion))];

  const porCorporacion = corporaciones.map((corp) => ({
    corp,
    total: personal.filter((p) => p.asignacion === corp).length,
  }));

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
            <span className="stat-label">Viales</span>
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
          <h3>Distribución por Corporación</h3>
          <div className="zone-list">
            {porCorporacion.map((item) => (
              <div key={item.corp} className="zone-item">
                <span className="zone-name">{item.corp}</span>
                <div className="zone-bar-container">
                  <div
                    className="zone-bar"
                    style={{ width: `${(item.total / personal.length) * 100}%` }}
                  ></div>
                </div>
                <span className="zone-count">{item.total}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dashboard-card">
          <h3>Ingresos Recientes</h3>
          <div className="recent-list">
            {personal
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
      </div>
    </div>
  );
}

export default Dashboard;
