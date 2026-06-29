import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, FileDown } from "lucide-react";
import { useDebounce } from "../hooks/useDebounce";

function Personal({ personal, loading }) {
  const navigate = useNavigate();
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 10;

  // Debounce search input by 300ms to avoid filtering on every keystroke
  const busquedaDebounced = useDebounce(busqueda, 300);

  // Memoize filtered results so they only recompute when inputs change
  const filtrados = useMemo(() => {
    let result = personal;

    if (filtroCategoria !== "Todos") {
      result = result.filter((p) => p.categoria === filtroCategoria);
    }

    if (busquedaDebounced.trim()) {
      const q = busquedaDebounced.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.apellidos.toLowerCase().includes(q) ||
          p.rfc.toLowerCase().includes(q) ||
          p.curp.toLowerCase().includes(q) ||
          p.numero_empleado.toLowerCase().includes(q)
      );
    }

    return result;
  }, [personal, filtroCategoria, busquedaDebounced]);

  // Memoize pagination calculations
  const totalPaginas = useMemo(
    () => Math.max(1, Math.ceil(filtrados.length / porPagina)),
    [filtrados.length]
  );

  const paginados = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return filtrados.slice(inicio, inicio + porPagina);
  }, [filtrados, paginaActual]);

  const inicio = (paginaActual - 1) * porPagina;

  // Generate truncated page numbers (max 7 visible)
  const pageNumbers = useMemo(() => {
    const maxVisible = 7;
    if (totalPaginas <= maxVisible) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    let start = Math.max(2, paginaActual - 1);
    let end = Math.min(totalPaginas - 1, paginaActual + 1);

    // Adjust range to always show 3 middle numbers
    if (paginaActual <= 3) {
      start = 2;
      end = 4;
    } else if (paginaActual >= totalPaginas - 2) {
      start = totalPaginas - 3;
      end = totalPaginas - 1;
    }

    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPaginas - 1) pages.push("...");

    pages.push(totalPaginas);
    return pages;
  }, [totalPaginas, paginaActual]);

  const handleCategoriaChange = useCallback((cat) => {
    setFiltroCategoria(cat);
    setPaginaActual(1);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setBusqueda(e.target.value);
    setPaginaActual(1);
  }, []);

  const handleExportar = () => {
    alert("Exportación a Excel simulada. En la versión final se generará el archivo .xlsx");
  };

  if (loading) {
    return (
      <div className="personal-page">
        <h1 className="page-title">Personal</h1>
        <p style={{ color: "var(--gris-texto)" }}>Cargando registros...</p>
      </div>
    );
  }

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
        <div className="tabs-filter" role="tablist" aria-label="Filtrar por categoría">
          {["Todos", "Preventiva", "Vial"].map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={filtroCategoria === cat}
              className={`tab-btn ${filtroCategoria === cat ? "active" : ""}`}
              onClick={() => handleCategoriaChange(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="search-box">
          <Search size={18} aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por nombre, RFC, CURP o No. empleado..."
            value={busqueda}
            onChange={handleSearchChange}
            aria-label="Buscar personal"
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table" aria-label="Listado de personal">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">Nombre</th>
              <th scope="col">Categoría</th>
              <th scope="col">No. Empleado</th>
              <th scope="col">Teléfono</th>
              <th scope="col">Fecha Ingreso</th>
            </tr>
          </thead>
          <tbody>
            {paginados.map((p) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/personal/${p.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/personal/${p.id}`);
                  }
                }}
                className="table-row-clickable"
                tabIndex={0}
                role="link"
                aria-label={`Ver ficha de ${p.nombre} ${p.apellidos}`}
              >
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
        <div className="pagination-controls" role="navigation" aria-label="Paginación">
          <button
            className="pagination-btn"
            disabled={paginaActual === 1}
            onClick={() => setPaginaActual((p) => p - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>
          {pageNumbers.map((page, idx) =>
            page === "..." ? (
              <span key={`ellipsis-${idx}`} className="pagination-btn" style={{ border: "none", cursor: "default" }}>
                …
              </span>
            ) : (
              <button
                key={page}
                className={`pagination-btn ${paginaActual === page ? "active" : ""}`}
                onClick={() => setPaginaActual(page)}
                aria-label={`Página ${page}`}
                aria-current={paginaActual === page ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}
          <button
            className="pagination-btn"
            disabled={paginaActual === totalPaginas}
            onClick={() => setPaginaActual((p) => p + 1)}
            aria-label="Página siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Personal;
