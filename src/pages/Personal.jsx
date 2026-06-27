import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronLeft, ChevronRight, FileDown } from "lucide-react";

function Personal({ personal }) {
  const navigate = useNavigate();
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 10;

  // Filtrar por categoría
  let filtrados = personal;
  if (filtroCategoria !== "Todos") {
    filtrados = filtrados.filter((p) => p.categoria === filtroCategoria);
  }

  // Filtrar por búsqueda
  if (busqueda.trim()) {
    const q = busqueda.toLowerCase();
    filtrados = filtrados.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.apellidos.toLowerCase().includes(q) ||
        p.rfc.toLowerCase().includes(q) ||
        p.curp.toLowerCase().includes(q) ||
        p.numero_empleado.toLowerCase().includes(q)
    );
  }

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const inicio = (paginaActual - 1) * porPagina;
  const paginados = filtrados.slice(inicio, inicio + porPagina);

  const handleExportar = () => {
    alert("Exportación a Excel simulada. En la versión final se generará el archivo .xlsx");
  };

  return (
    <div className="personal-page">
      <div className="page-header-row">
        <h1 className="page-title">Personal</h1>
        <button className="btn-secondary" onClick={handleExportar}>
          <FileDown size={16} />
          Exportar Excel
        </button>
      </div>

      <div className="filters-bar">
        <div className="tabs-filter">
          {["Todos", "Preventiva", "Vial"].map((cat) => (
            <button
              key={cat}
              className={`tab-btn ${filtroCategoria === cat ? "active" : ""}`}
              onClick={() => {
                setFiltroCategoria(cat);
                setPaginaActual(1);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre, RFC, CURP o No. empleado..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>No. Empleado</th>
              <th>Teléfono</th>
              <th>Fecha Ingreso</th>
            </tr>
          </thead>
          <tbody>
            {paginados.map((p) => (
              <tr key={p.id} onClick={() => navigate(`/personal/${p.id}`)} className="table-row-clickable">
                <td>
                  <div className="table-avatar">
                    {p.nombre.charAt(0)}{p.apellidos.charAt(0)}
                  </div>
                </td>
                <td className="td-name">
                  {p.nombre} {p.apellidos}
                </td>
                <td>
                  <span className={`badge ${p.categoria === "Preventiva" ? "badge-policia" : "badge-vial"}`}>
                    {p.categoria}
                  </span>
                </td>
                <td>{p.numero_empleado}</td>
                <td>{p.telefono}</td>
                <td>{p.fecha_ingreso}</td>
              </tr>
            ))}
            {paginados.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-state">
                  No se encontraron registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <span className="pagination-info">
          Mostrando {filtrados.length > 0 ? inicio + 1 : 0}-{Math.min(inicio + porPagina, filtrados.length)} de {filtrados.length} registros
        </span>
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((p) => p - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i + 1}
              className={`pagination-btn ${paginaActual === i + 1 ? "active" : ""}`}
              onClick={() => setPaginaActual(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="pagination-btn"
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual((p) => p + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Personal;
