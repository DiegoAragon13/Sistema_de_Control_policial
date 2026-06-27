import { Users, Shield, TrafficCone, MapPin } from "lucide-react";

function Dashboard({ personal }) {
  const totalPolicias = personal.filter((p) => p.categoria === "Policía").length;
  const totalViales = personal.filter((p) => p.categoria === "Vial").length;
  const sectores = [...new Set(personal.map((p) => p.asignacion))];

  const porSector = sectores.map((sector) => ({
    sector,
    total: personal.filter((p) => p.asignacion === sector).length,
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
            <span className="stat-number">{totalPolicias}</span>
            <span className="stat-label">Policías</span>
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
            <MapPin size={28} color="#fff" />
          </div>
          <div className="stat-info">
            <span className="stat-number">{sectores.length}</span>
            <span className="stat-label">Corporaciones</span>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-card">
          <h3>Distribución por Corporación</h3>
          <div className="zone-list">
            {porSector.map((item) => (
              <div key={item.sector} className="zone-item">
                <span className="zone-name">{item.sector}</span>
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
