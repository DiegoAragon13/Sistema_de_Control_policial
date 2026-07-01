import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, UserX, UserCheck, Upload, User, AlertTriangle } from "lucide-react";
import { useFormSubmit } from "../hooks/useFormSubmit";
import * as personalService from "../services/personalService";

function FichaPersona({ personal, refreshPersonal }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const persona = personal.find((p) => p.id === parseInt(id));

  const [form, setForm] = useState(persona || {});
  const [showBajaModal, setShowBajaModal] = useState(false);
  const [showReactivarModal, setShowReactivarModal] = useState(false);
  const [notaBaja, setNotaBaja] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);

  useEffect(() => {
    if (persona) setForm(persona);
  }, [persona]);

  const saveHandler = useCallback(async (data) => {
    await personalService.update(data.id, data);
  }, []);

  const { isSubmitting: saving, error: saveError, handleSubmit: handleGuardar } = useFormSubmit(
    saveHandler,
    { onSuccess: () => { refreshPersonal(); navigate("/personal"); } }
  );

  const handleDarBaja = useCallback(async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      await personalService.darBaja(persona.id, notaBaja.trim() || "Sin motivo especificado.");
      await refreshPersonal();
      setShowBajaModal(false);
      setNotaBaja("");
      navigate("/personal");
    } catch {
      setProcesando(false);
    }
  }, [procesando, persona, notaBaja, refreshPersonal, navigate]);

  const handleReactivar = useCallback(async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      await personalService.reactivar(persona.id);
      await refreshPersonal();
      setShowReactivarModal(false);
      navigate("/personal");
    } catch {
      setProcesando(false);
    }
  }, [procesando, persona, refreshPersonal, navigate]);

  if (!persona) {
    return (
      <div className="ficha-page">
        <p>Persona no encontrada.</p>
        <button className="btn-secondary" onClick={() => navigate("/personal")}>Volver al listado</button>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const esBaja = !form.activo;

  return (
    <div className="ficha-page">
      <div className="ficha-header-row">
        <button className="btn-ghost" onClick={() => navigate("/personal")}>
          <ArrowLeft size={18} aria-hidden="true" />
          Volver
        </button>
        <div className="ficha-actions">
          {esBaja ? (
            <button className="btn-reactivar" onClick={() => setShowReactivarModal(true)}>
              <UserCheck size={16} aria-hidden="true" />
              Reactivar
            </button>
          ) : (
            <button className="btn-danger" onClick={() => setShowBajaModal(true)}>
              <UserX size={16} aria-hidden="true" />
              Dar de Baja
            </button>
          )}
          <button className="btn-primary" onClick={() => handleGuardar(form)} disabled={saving} aria-busy={saving}>
            {saving ? <span className="spinner-inline"></span> : <><Save size={16} aria-hidden="true" /> Guardar</>}
          </button>
        </div>
      </div>

      {saveError && (
        <div role="alert" className="alert-error">{saveError}</div>
      )}

      {/* Banner de baja */}
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
              : <div className="ficha-foto-placeholder"><User size={64} aria-hidden="true" /></div>
            }
          </div>
          <label className="btn-secondary btn-upload">
            <Upload size={16} aria-hidden="true" />
            Cargar Foto
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
              <div className="form-group">
                <label htmlFor="edit-nombre">Nombre</label>
                <input id="edit-nombre" name="nombre" value={form.nombre || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-apellidos">Apellidos</label>
                <input id="edit-apellidos" name="apellidos" value={form.apellidos || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-fecha_nacimiento">Fecha de Nacimiento</label>
                <input id="edit-fecha_nacimiento" type="date" name="fecha_nacimiento" value={form.fecha_nacimiento || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-tipo_sangre">Tipo de Sangre</label>
                <select id="edit-tipo_sangre" name="tipo_sangre" value={form.tipo_sangre || ""} onChange={handleChange}>
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-direccion">Dirección</label>
                <input id="edit-direccion" name="direccion" value={form.direccion || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-telefono">Teléfono</label>
                <input id="edit-telefono" name="telefono" value={form.telefono || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-telefono_emergencia">Teléfono de Emergencia</label>
                <input id="edit-telefono_emergencia" name="telefono_emergencia" value={form.telefono_emergencia || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-escolaridad">Escolaridad</label>
                <input id="edit-escolaridad" name="escolaridad" value={form.escolaridad || ""} onChange={handleChange} />
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
              <div className="form-group">
                <label htmlFor="edit-rfc">RFC</label>
                <input id="edit-rfc" name="rfc" value={form.rfc || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-curp">CURP</label>
                <input id="edit-curp" name="curp" value={form.curp || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-clave_ine">Clave de INE</label>
                <input id="edit-clave_ine" name="clave_ine" value={form.clave_ine || ""} onChange={handleChange} placeholder="Clave de elector" />
              </div>
              <div className="form-group">
                <label htmlFor="edit-licencia_conducir">Núm. Licencia de Conducir</label>
                <input id="edit-licencia_conducir" name="licencia_conducir" value={form.licencia_conducir || ""} onChange={handleChange} placeholder="Número de licencia" />
              </div>
              <div className="form-group">
                <label htmlFor="edit-cuip">
                  CUIP <span className="label-optional">(opcional)</span>
                </label>
                <input id="edit-cuip" name="cuip" value={form.cuip || ""} onChange={handleChange}
                  placeholder={form.categoria === "Vial" ? "No aplica para Vial" : "Clave Única Policial"} />
              </div>
            </div>
          </div>

          {/* Nota de baja solo visible si está dado de baja */}
          {esBaja && (
            <div className="form-section">
              <h3>Motivo de Baja</h3>
              <div className="form-group">
                <label htmlFor="edit-nota_baja">Nota</label>
                <textarea
                  id="edit-nota_baja"
                  name="nota_baja"
                  value={form.nota_baja || ""}
                  onChange={handleChange}
                  rows={3}
                  className="textarea-baja"
                  placeholder="Motivo de la baja..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Dar de baja */}
      {showBajaModal && (
        <div className="modal-overlay" onClick={() => setShowBajaModal(false)} role="presentation">
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="baja-modal-title">
            <h3 id="baja-modal-title">Dar de baja a {persona.nombre} {persona.apellidos}</h3>
            <p>El registro no se eliminará. Quedará marcado como baja y podrá ser consultado.</p>
            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label htmlFor="modal-nota-baja">Motivo de la baja <span className="label-optional">(opcional)</span></label>
              <textarea
                id="modal-nota-baja"
                value={notaBaja}
                onChange={(e) => setNotaBaja(e.target.value)}
                rows={3}
                className="textarea-baja"
                placeholder="Ej: Renuncia voluntaria, terminación de contrato, etc."
                autoFocus
              />
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
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="reactivar-modal-title">
            <h3 id="reactivar-modal-title">Reactivar a {persona.nombre} {persona.apellidos}</h3>
            <p>El elemento volverá a aparecer como activo en el sistema. Se borrará la nota de baja.</p>
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
