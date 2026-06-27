import { useState } from "react";
import { FileSpreadsheet, Upload, CheckCircle } from "lucide-react";

function ImportarExcel() {
  const [archivo, setArchivo] = useState(null);
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setArchivo(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setArchivo(file);
  };

  const handleImportar = () => {
    setImportando(true);
    setResultado(null);
    setTimeout(() => {
      setImportando(false);
      setResultado({
        exito: true,
        mensaje: "Se importaron 18 registros correctamente.",
        detalles: "12 Policías y 6 Viales agregados al sistema.",
      });
      setArchivo(null);
    }, 1500);
  };

  const handleReset = () => {
    setArchivo(null);
    setResultado(null);
  };

  return (
    <div className="importar-page">
      <h1 className="page-title">Importar desde Excel</h1>
      <p className="page-subtitle">
        Sube un archivo .xlsx con los datos del personal para importarlos al sistema.
      </p>

      {resultado ? (
        <div className="import-result">
          <div className="result-card success">
            <CheckCircle size={48} color="#22c55e" />
            <h3>{resultado.mensaje}</h3>
            <p>{resultado.detalles}</p>
            <button className="btn-primary" onClick={handleReset}>
              Importar otro archivo
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`dropzone ${dragOver ? "drag-over" : ""} ${archivo ? "has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            {archivo ? (
              <div className="dropzone-file">
                <FileSpreadsheet size={40} color="#4B5694" />
                <span className="file-name">{archivo.name}</span>
                <button className="btn-ghost" onClick={handleReset}>Cambiar archivo</button>
              </div>
            ) : (
              <div className="dropzone-empty">
                <Upload size={40} color="#7288AE" />
                <p>Arrastra tu archivo .xlsx aquí</p>
                <span>o</span>
                <label className="btn-secondary">
                  Seleccionar archivo
                  <input type="file" accept=".xlsx,.xls" onChange={handleFileSelect} hidden />
                </label>
              </div>
            )}
          </div>

          {archivo && (
            <div className="import-actions">
              <button className="btn-primary btn-lg" onClick={handleImportar} disabled={importando}>
                {importando ? (
                  <>
                    <span className="spinner-inline"></span>
                    Importando...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet size={18} />
                    Importar Datos
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ImportarExcel;
