import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Upload, User } from "lucide-react";
import { useFormSubmit } from "../hooks/useFormSubmit";
import * as personalService from "../services/personalService";

function FichaPersona({ personal, refreshPersonal }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const persona = personal.find((p) => p.id === parseInt(id));

  const [form, setForm] = useState(persona || {});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (persona) setForm(persona);
  }, [persona]);

  // --- Double-click-safe save via useFormSubmit ---
  const saveHandler = useCallback(
    async (data) => {
      await personalService.update(data.id, data);
    },
    []
  );

  const { isSubmitting: saving, error: saveError, handleSubmit: handleGuardar } = useFormSubmit(
    saveHandler,
    {
      onSuccess: () => {
        refreshPersonal();
        navigate("/personal");
      },
    }
  );

  // --- Double-click-safe delete ---
  const handleEliminar = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await personalService.remove(persona.id);
      await refreshPersonal();
      setShowDeleteModal(false);
      navigate("/personal");
    } catch {
      setDeleting(false);
    }
  }, [deleting, persona, refreshPersonal, navigate]);

  if (!persona) {
    return (
      <div className="ficha-page">
        <p>Persona no encontrada.</p>
        <button className="btn-secondary" onClick={() => navigate("/personal")}>
          Volver al listado
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="ficha-page">
      <div className="ficha-header-row">
        <button className="btn-ghost" onClick={() => navigate("/personal")}>
          <ArrowLeft size={18} aria-hidden="true" />
          Volver
        </button>
        <div className="ficha-actions">
          <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 size={16} aria-hidden="true" />
            Eliminar
          </button>
          <button
            className="btn-primary"
            onClick={() => handleGuardar(form)}
            disabled={saving}
            aria-busy={saving}
          >
            {saving ? <span className="spinner-inline"></span> : <><Save size={16} aria-hidden="true" /> Guardar</>}
          </button>
        </div>
      </div>

      {saveError && (
        <div role="alert" style={{ color: "var(--rojo)", marginBottom: "16px", fontWeight: 600 }}>
          {saveError}
        </div>
      )}

      <div className="ficha-content">
        <div className="ficha-sidebar">
          <div className="ficha-foto-container">
            {fotoPreview ? (
              <img src={fotoPreview} alt={`Foto de ${form.nombre}`} className="ficha-foto" />
            ) : (
              <div className="ficha-foto-placeholder">
                <User size={64} aria-hidden="true" />
              </div>
            )}
          </div>
          <label className="btn-secondary btn-upload">
            <Upload size={16} aria-hidden="true" />
            Cargar Foto
            <input type="file" accept="image/*" onChange={handleFoto} hidden aria-label="Seleccionar fotografía" />
          </label>
          <div className="ficha-badge-container">
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
                <label htmlFor="edit-cuip">CUIP</label>
                <input id="edit-cuip" name="cuip" value={form.cuip || ""} onChange={handleChange} placeholder={form.categoria === "Vial" ? "No aplica" : ""} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)} role="presentation">
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <h3 id="delete-modal-title">¿Estás seguro?</h3>
            <p>Se eliminará el registro de <strong>{persona.nombre} {persona.apellidos}</strong>. Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleEliminar} disabled={deleting} aria-busy={deleting}>
                {deleting ? <span className="spinner-inline"></span> : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FichaPersona;
