import { Users, Shield, TrafficCone } from "lucide-react";

function Dashboard({ personal }) {
  const totalPolicias = personal.filter((p) => p.categoria === "Policía").length;
  const totalViales = personal.filter((p) => p.categoria === "Vial").length;

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
      </div>

      <div className="dashboard-sections">
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
