function Dashboard({ personal }) {
  const totalPolicias = personal.filter((p) => p.categoria === "Policía").length;
  const totalViales = personal.filter((p) => p.categoria === "Vial").length;

  // Calcular antigüedad promedio en años
  const hoy = new Date();
  const antiguedadPromedio = (
    personal.reduce((sum, p) => {
      const ingreso = new Date(p.fecha_ingreso);
      return sum + (hoy - ingreso) / (1000 * 60 * 60 * 24 * 365);
    }, 0) / personal.length
  ).toFixed(1);

  // Distribución por escolaridad
  const escolaridades = {};
  personal.forEach((p) => {
    const esc = p.escolaridad.includes("Maestría") ? "Maestría" :
                p.escolaridad.includes("Licenciatura") || p.escolaridad.includes("Ingeniería") ? "Licenciatura" :
                p.escolaridad.includes("Técnico") ? "Técnico" :
                p.escolaridad.includes("Preparatoria") ? "Preparatoria" : "Secundaria";
    escolaridades[esc] = (escolaridades[esc] || 0) + 1;
  });
  const escolaridadesArr = Object.entries(escolaridades)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="dashboard">
      <h1 className="page-title">Panel de Control</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-number">{personal.length}</span>
            <span className="stat-label">Total Personal</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-number">{totalPolicias}</span>
            <span className="stat-label">Policías</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-number">{totalViales}</span>
            <span className="stat-label">Viales</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-number">{antiguedadPromedio}</span>
            <span className="stat-label">Años promedio de servicio</span>
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

        <div className="dashboard-card">
          <h3>Mayor Antigüedad</h3>
          <div className="recent-list">
            {personal
              .sort((a, b) => new Date(a.fecha_ingreso) - new Date(b.fecha_ingreso))
              .slice(0, 5)
              .map((p) => {
                const years = Math.floor((hoy - new Date(p.fecha_ingreso)) / (1000 * 60 * 60 * 24 * 365));
                return (
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
                        {years} años · {p.categoria}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div className="dashboard-sections" style={{ marginTop: "24px" }}>
        <div className="dashboard-card">
          <h3>Escolaridad</h3>
          <div className="zone-list">
            {escolaridadesArr.map(([esc, count]) => (
              <div key={esc} className="zone-item">
                <span className="zone-name">{esc}</span>
                <div className="zone-bar-container">
                  <div
                    className="zone-bar"
                    style={{ width: `${(count / personal.length) * 100}%` }}
                  ></div>
                </div>
                <span className="zone-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
