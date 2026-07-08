import { useState, useCallback } from "react";
import { FileSpreadsheet, Upload, CheckCircle, Download, AlertTriangle, X } from "lucide-react";
import { descargarPlantilla, parsearExcel } from "../services/plantillaService";
import * as personalService from "../services/personalService";

function ImportarExcel() {
  const [archivo, setArchivo]     = useState(null);
  const [dragOver, setDragOver]   = useState(false);
  const [parseando, setParseando] = useState(false);
  const [preview, setPreview]     = useState(null);   // { registros, erroresFormato }
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);   // { importados, errores }
  const [descargando, setDescargando] = useState(false);

  // ── Descargar plantilla ───────────────────────────────────────────────────
  const handleDescargarPlantilla = useCallback(async () => {
    if (descargando) return;
    setDescargando(true);
    try {
      await descargarPlantilla();
    } catch (e) {
      alert("Error al generar la plantilla: " + e.message);
    } finally {
      setDescargando(false);
    }
  }, [descargando]);

  // ── Selección de archivo ──────────────────────────────────────────────────
  const seleccionarArchivo = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.match(/\.xlsx?$/i)) {
      alert("Solo se aceptan archivos .xlsx o .xls");
      return;
    }
    setArchivo(file);
    setResultado(null);
    setPreview(null);
    setParseando(true);
    try {
      const resultado = await parsearExcel(file);
      setPreview(resultado);
    } catch (e) {
      alert("Error al leer el archivo: " + e.message);
      setArchivo(null);
    } finally {
      setParseando(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    seleccionarArchivo(e.dataTransfer.files[0]);
  }, [seleccionarArchivo]);

  const handleFileSelect = useCallback((e) => {
    seleccionarArchivo(e.target.files[0]);
  }, [seleccionarArchivo]);

  // ── Importar registros ────────────────────────────────────────────────────
  const handleImportar = useCallback(async () => {
    if (importando || !preview?.registros?.length) return;
    setImportando(true);
    try {
      const res = await personalService.importBulk(preview.registros);
      setResultado(res);
      setArchivo(null);
      setPreview(null);
    } catch (e) {
      alert("Error al importar: " + e.message);
    } finally {
      setImportando(false);
    }
  }, [importando, preview]);

  const handleReset = () => {
    setArchivo(null);
    setPreview(null);
    setResultado(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="importar-page">
      <div className="importar-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: 6 }}>Importar desde Excel</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Descarga la plantilla, llénala con los datos del personal y súbela para importarlos al sistema.
          </p>
        </div>
        <button
          className="btn-secondary"
          onClick={handleDescargarPlantilla}
          disabled={descargando}
          style={{ flexShrink: 0, alignSelf: "flex-start" }}
        >
          {descargando
            ? <span className="spinner-export"></span>
            : <Download size={16} aria-hidden="true" />}
          {descargando ? "Generando..." : "Descargar Plantilla"}
        </button>
      </div>

      {/* Resultado de importación */}
      {resultado && (
        <div className="import-result">
          <div className="result-card">
            <CheckCircle size={48} color="var(--verde)" aria-hidden="true" />
            <h3>
              {resultado.importados > 0
                ? `${resultado.importados} registro${resultado.importados !== 1 ? "s" : ""} importado${resultado.importados !== 1 ? "s" : ""} correctamente`
                : "No se importó ningún registro nuevo"}
            </h3>
            {resultado.errores?.length > 0 && (
              <div className="import-errores">
                <p style={{ fontWeight: 600, color: "var(--rojo)", marginBottom: 8 }}>
                  {resultado.errores.length} registro{resultado.errores.length !== 1 ? "s" : ""} omitido{resultado.errores.length !== 1 ? "s" : ""}:
                </p>
                <ul className="errores-lista">
                  {resultado.errores.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <button className="btn-primary" onClick={handleReset}>
              Importar otro archivo
            </button>
          </div>
        </div>
      )}

      {/* Zona de carga */}
      {!resultado && (
        <>
          <div
            className={`dropzone ${dragOver ? "drag-over" : ""} ${archivo ? "has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={!archivo ? () => document.getElementById("file-input").click() : undefined}
            style={!archivo ? { cursor: "pointer" } : {}}
          >
            {parseando ? (
              <div className="dropzone-empty">
                <span className="spinner-export" style={{ width: 32, height: 32, borderWidth: 3 }}></span>
                <p>Leyendo archivo...</p>
              </div>
            ) : archivo ? (
              <div className="dropzone-file">
                <FileSpreadsheet size={40} color="#4B5694" aria-hidden="true" />
                <span className="file-name">{archivo.name}</span>
                <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                  <X size={14} aria-hidden="true" /> Cambiar archivo
                </button>
              </div>
            ) : (
              <div className="dropzone-empty">
                <Upload size={40} color="#7288AE" aria-hidden="true" />
                <p>Arrastra tu archivo .xlsx aquí</p>
                <span>o haz clic para seleccionar</span>
              </div>
            )}
          </div>

          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            hidden
          />

          {/* Preview de lo que se va a importar */}
          {preview && !parseando && (
            <div className="import-preview">
              {/* Errores de formato */}
              {preview.erroresFormato.length > 0 && (
                <div className="preview-errores">
                  <div className="preview-errores-header">
                    <AlertTriangle size={16} aria-hidden="true" />
                    <strong>{preview.erroresFormato.length} fila{preview.erroresFormato.length !== 1 ? "s" : ""} con errores de formato (se omitirán):</strong>
                  </div>
                  <ul className="errores-lista">
                    {preview.erroresFormato.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}

              {/* Resumen de registros válidos */}
              {preview.registros.length > 0 ? (
                <div className="preview-resumen">
                  <div className="preview-stat">
                    <span className="preview-num">{preview.registros.length}</span>
                    <span className="preview-label">registro{preview.registros.length !== 1 ? "s" : ""} listos para importar</span>
                  </div>
                  <div className="preview-stat">
                    <span className="preview-num">
                      {preview.registros.filter((r) => r.categoria === "Preventiva").length}
                    </span>
                    <span className="preview-label">Preventiva</span>
                  </div>
                  <div className="preview-stat">
                    <span className="preview-num">
                      {preview.registros.filter((r) => r.categoria === "Vial").length}
                    </span>
                    <span className="preview-label">Vial</span>
                  </div>
                </div>
              ) : (
                <div className="alert-error" style={{ marginTop: 16 }}>
                  No se encontraron registros válidos en el archivo.
                </div>
              )}

              {preview.registros.length > 0 && (
                <div className="import-actions">
                  <button
                    className="btn-primary btn-lg"
                    onClick={handleImportar}
                    disabled={importando}
                    aria-busy={importando}
                  >
                    {importando ? (
                      <><span className="spinner-inline"></span> Importando...</>
                    ) : (
                      <><FileSpreadsheet size={18} aria-hidden="true" /> Importar {preview.registros.length} registros</>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ImportarExcel;
