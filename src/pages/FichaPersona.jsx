import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserX, UserCheck, Upload, User, AlertTriangle, FileText } from "lucide-react";
import { useFormSubmit } from "../hooks/useFormSubmit";
import * as personalService from "../services/personalService";
// pdfService se carga solo cuando el usuario hace clic en "Descargar PDF"
// para no añadir 1.4MB al chunk inicial de FichaPersona
const getPDFService = () => import("../services/pdfService.jsx");

function FichaPersona() {
  const { id } = useParams();
  const navigate = useNavigate();
  const personaId = parseInt(id);

  const [persona, setPersona]           = useState(null);
  const [form, setForm]                 = useState({});
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [showBajaModal, setShowBajaModal]           = useState(false);
  const [showReactivarModal, setShowReactivarModal] = useState(false);
  const [notaBaja, setNotaBaja]         = useState("");
  const [procesando, setProcesando]     = useState(false);
  const [fotoPreview, setFotoPreview]   = useState(null);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // Cargar persona desde SQLite
  const cargar = useCallback(() => {
    setLoading(true);
    personalService.getById(personaId)
      .then((p) => {
        if (!p) { setError("Persona no encontrada."); return; }
        setPersona(p);
        setForm(p);
        if (p.foto) setFotoPreview(`data:image/jpeg;base64,${p.foto}`);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [personaId]);

  useEffect(() => { cargar(); }, [cargar]);

  // Guardar cambios — protegido contra doble clic
  const saveHandler = useCallback(async (data) => {
    await personalService.update(personaId, {
      ...data,
      // Si el usuario cargó foto nueva, viene como base64 puro (sin prefijo)
      foto: fotoPreview && !fotoPreview.startsWith("data:")
        ? fotoPreview
        : fotoPreview
          ? fotoPreview.replace(/^data:image\/\w+;base64,/, "")
          : null,
    });
  }, [personaId, fotoPreview]);

  const { isSubmitting: saving, error: saveError, handleSubmit: handleGuardar } = useFormSubmit(
    saveHandler,
    { onSuccess: () => navigate("/personal") }
  );

  const handleDarBaja = useCallback(async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      await personalService.darBaja(personaId, notaBaja.trim() || "Sin motivo especificado.");
      setShowBajaModal(false);
      setNotaBaja("");
      navigate("/personal");
    } catch (e) {
      setError(e.message);
      setProcesando(false);
    }
  }, [procesando, personaId, notaBaja, navigate]);

  const handleReactivar = useCallback(async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      await personalService.reactivar(personaId);
      setShowReactivarModal(false);
      navigate("/personal");
    } catch (e) {
      setError(e.message);
      setProcesando(false);
    }
  }, [procesando, personaId, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDescargarPDF = useCallback(async () => {
    if (generandoPDF) return;
    setGenerandoPDF(true);
    try {
      const { generarPDFPerfil } = await getPDFService();
      const personaConFoto = {
        ...form,
        foto: fotoPreview
          ? fotoPreview.replace(/^data:image\/\w+;base64,/, "")
          : persona?.foto || null,
      };
      await generarPDFPerfil(personaConFoto);
    } catch (e) {
      alert("Error al generar el PDF: " + e.message);
    } finally {
      setGenerandoPDF(false);
    }
  }, [generandoPDF, form, fotoPreview, persona]);

  if (loading) return <div className="ficha-page"><p style={{ color: "var(--gris-texto)" }}>Cargando...</p></div>;

  if (error && !persona) return (
    <div className="ficha-page">
      <div className="alert-error">{error}</div>
      <button className="btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate("/personal")}>
        Volver al listado
      </button>
    </div>
  );

  const esBaja = !form.activo;

  return (
    <div className="ficha-page">
      <div className="ficha-header-row">
        <button className="btn-ghost" onClick={() => navigate("/personal")}>
          <ArrowLeft size={18} aria-hidden="true" /> Volver
        </button>
        <div className="ficha-actions">
          <button className="btn-secondary" onClick={handleDescargarPDF} disabled={generandoPDF} aria-busy={generandoPDF}>
            {generandoPDF ? <span className="spinner-export"></span> : <FileText size={16} aria-hidden="true" />}
            {generandoPDF ? "Generando..." : "Descargar PDF"}
          </button>
          {esBaja ? (
            <button className="btn-reactivar" onClick={() => setShowReactivarModal(true)}>
              <UserCheck size={16} aria-hidden="true" /> Reactivar
            </button>
          ) : (
            <button className="btn-danger" onClick={() => setShowBajaModal(true)}>
              <UserX size={16} aria-hidden="true" /> Dar de Baja
            </button>
          )}
          <button className="btn-primary" onClick={() => handleGuardar(form)} disabled={saving} aria-busy={saving}>
            {saving ? <span className="spinner-inline"></span> : <><Save size={16} aria-hidden="true" /> Guardar</>}
          </button>
        </div>
      </div>

      {saveError && <div role="alert" className="alert-error">{saveError}</div>}

      {esBaja && (
        <div className="baja-banner" role="alert">
          <AlertTriangle size={18} aria-hidden="true" />
          <div>
            <strong>Elemento dado de baja</strong>
            {form.nota_baja && <span> — {form.nota_baja}</span>}
          </div>
        </div>
      )}

      <div className={`ficha-content ${esBaja ? "ficha-baja" : ""}`}>
        <div className="ficha-sidebar">
          <div className="ficha-foto-container">
            {fotoPreview
              ? <img src={fotoPreview} alt={`Foto de ${form.nombre}`} className="ficha-foto" />
              : <div className="ficha-foto-placeholder"><User size={64} aria-hidden="true" /></div>}
          </div>
          <label className="btn-secondary btn-upload">
            <Upload size={16} aria-hidden="true" /> Cargar Foto
            <input type="file" accept="image/*" onChange={handleFoto} hidden aria-label="Seleccionar fotografía" />
          </label>
          <div className="ficha-badge-container">
            {esBaja && <span className="badge badge-baja">BAJA</span>}
            <span className={`badge ${form.categoria === "Preventiva" ? "badge-policia" : "badge-vial"}`}>
              {form.categoria}
            </span>
            <span className="ficha-employee-number">{form.numero_empleado}</span>
          </div>
        </div>

        <div className="ficha-form">
          <h2 className="ficha-name">{form.nombre} {form.apellidos}</h2>

          <div className="form-section">
            <h3>Datos Personales</h3>
            <div className="form-grid">
              {[
                { id: "nombre",              label: "Nombre" },
                { id: "apellidos",           label: "Apellidos" },
                { id: "fecha_nacimiento",    label: "Fecha de Nacimiento",    type: "date" },
                { id: "direccion",           label: "Dirección" },
                { id: "telefono",            label: "Teléfono" },
                { id: "telefono_emergencia", label: "Teléfono de Emergencia" },
                { id: "escolaridad",         label: "Escolaridad" },
              ].map(({ id: field, label, type = "text" }) => (
                <div key={field} className="form-group">
                  <label htmlFor={`edit-${field}`}>{label}</label>
                  <input id={`edit-${field}`} type={type} name={field}
                    value={form[field] || ""} onChange={handleChange} />
                </div>
              ))}
              <div className="form-group">
                <label htmlFor="edit-tipo_sangre">Tipo de Sangre</label>
                <select id="edit-tipo_sangre" name="tipo_sangre" value={form.tipo_sangre || ""} onChange={handleChange}>
                  {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Datos Laborales</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="edit-categoria">Categoría</label>
                <select id="edit-categoria" name="categoria" value={form.categoria || ""} onChange={handleChange}>
                  <option value="Preventiva">Preventiva</option>
                  <option value="Vial">Vial</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-fecha_ingreso">Fecha de Ingreso</label>
                <input id="edit-fecha_ingreso" type="date" name="fecha_ingreso" value={form.fecha_ingreso || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-numero_empleado">Número de Empleado</label>
                <input id="edit-numero_empleado" name="numero_empleado" value={form.numero_empleado || ""} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Documentos de Identidad</h3>
            <div className="form-grid">
              {[
                { id: "rfc",               label: "RFC" },
                { id: "curp",              label: "CURP" },
                { id: "clave_ine",         label: "Clave de INE" },
                { id: "licencia_conducir", label: "Núm. Licencia de Conducir" },
              ].map(({ id: field, label }) => (
                <div key={field} className="form-group">
                  <label htmlFor={`edit-${field}`}>{label}</label>
                  <input id={`edit-${field}`} name={field} value={form[field] || ""} onChange={handleChange} />
                </div>
              ))}
              <div className="form-group">
                <label htmlFor="edit-cuip">CUIP <span className="label-optional">(opcional)</span></label>
                <input id="edit-cuip" name="cuip" value={form.cuip || ""} onChange={handleChange}
                  placeholder={form.categoria === "Vial" ? "No aplica para Vial" : "Clave Única Policial"} />
              </div>
            </div>
          </div>

          {esBaja && (
            <div className="form-section">
              <h3>Motivo de Baja</h3>
              <div className="form-group">
                <label htmlFor="edit-nota_baja">Nota</label>
                <textarea id="edit-nota_baja" name="nota_baja" value={form.nota_baja || ""}
                  onChange={handleChange} rows={3} className="textarea-baja" placeholder="Motivo de la baja..." />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Dar de baja */}
      {showBajaModal && (
        <div className="modal-overlay" onClick={() => setShowBajaModal(false)} role="presentation">
          <div className="modal" onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-labelledby="baja-modal-title">
            <h3 id="baja-modal-title">Dar de baja a {persona?.nombre} {persona?.apellidos}</h3>
            <p>El registro no se eliminará. Quedará marcado como baja y podrá ser consultado.</p>
            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label htmlFor="modal-nota-baja">Motivo <span className="label-optional">(opcional)</span></label>
              <textarea id="modal-nota-baja" value={notaBaja} onChange={(e) => setNotaBaja(e.target.value)}
                rows={3} className="textarea-baja" autoFocus
                placeholder="Ej: Renuncia voluntaria, terminación de contrato..." />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => { setShowBajaModal(false); setNotaBaja(""); }} disabled={procesando}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleDarBaja} disabled={procesando} aria-busy={procesando}>
                {procesando ? <span className="spinner-inline"></span> : <><UserX size={15} aria-hidden="true" /> Confirmar Baja</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reactivar */}
      {showReactivarModal && (
        <div className="modal-overlay" onClick={() => setShowReactivarModal(false)} role="presentation">
          <div className="modal" onClick={(e) => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-labelledby="reactivar-modal-title">
            <h3 id="reactivar-modal-title">Reactivar a {persona?.nombre} {persona?.apellidos}</h3>
            <p>El elemento volverá a aparecer como activo. Se borrará la nota de baja.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowReactivarModal(false)} disabled={procesando}>
                Cancelar
              </button>
              <button className="btn-reactivar" onClick={handleReactivar} disabled={procesando} aria-busy={procesando}>
                {procesando ? <span className="spinner-inline"></span> : <><UserCheck size={15} aria-hidden="true" /> Confirmar Reactivación</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FichaPersona;
