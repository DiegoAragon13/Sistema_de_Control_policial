import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Upload, User } from "lucide-react";

function FichaPersona({ personal, setPersonal }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const persona = personal.find((p) => p.id === parseInt(id));

  const [form, setForm] = useState(persona || {});
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);

  useEffect(() => {
    if (persona) setForm(persona);
  }, [persona]);

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

  const handleGuardar = () => {
    setSaving(true);
    setTimeout(() => {
      setPersonal(personal.map((p) => (p.id === form.id ? { ...form } : p)));
      setSaving(false);
      navigate("/personal");
    }, 800);
  };

  const handleEliminar = () => {
    setPersonal(personal.filter((p) => p.id !== persona.id));
    setShowDeleteModal(false);
    navigate("/personal");
  };

  return (
    <div className="ficha-page">
      <div className="ficha-header-row">
        <button className="btn-ghost" onClick={() => navigate("/personal")}>
          <ArrowLeft size={18} />
          Volver
        </button>
        <div className="ficha-actions">
          <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>
            <Trash2 size={16} />
            Eliminar
          </button>
          <button className="btn-primary" onClick={handleGuardar} disabled={saving}>
            {saving ? <span className="spinner-inline"></span> : <><Save size={16} /> Guardar</>}
          </button>
        </div>
      </div>

      <div className="ficha-content">
        <div className="ficha-sidebar">
          <div className="ficha-foto-container">
            {fotoPreview ? (
              <img src={fotoPreview} alt="Foto" className="ficha-foto" />
            ) : (
              <div className="ficha-foto-placeholder">
                <User size={64} />
              </div>
            )}
          </div>
          <label className="btn-secondary btn-upload">
            <Upload size={16} />
            Cargar Foto
            <input type="file" accept="image/*" onChange={handleFoto} hidden />
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
                <label>Nombre</label>
                <input name="nombre" value={form.nombre || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Apellidos</label>
                <input name="apellidos" value={form.apellidos || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Tipo de Sangre</label>
                <select name="tipo_sangre" value={form.tipo_sangre || ""} onChange={handleChange}>
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input name="direccion" value={form.direccion || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input name="telefono" value={form.telefono || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Teléfono de Emergencia</label>
                <input name="telefono_emergencia" value={form.telefono_emergencia || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Escolaridad</label>
                <input name="escolaridad" value={form.escolaridad || ""} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Datos Laborales</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Categoría</label>
                <select name="categoria" value={form.categoria || ""} onChange={handleChange}>
                  <option value="Preventiva">Preventiva</option>
                  <option value="Vial">Vial</option>
                </select>
              </div>
              <div className="form-group">
                <label>Asignación</label>
                <select name="asignacion" value={form.asignacion || ""} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  <option value="Policía Preventiva">Policía Preventiva</option>
                  <option value="Vialidad">Vialidad</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Ingreso</label>
                <input type="date" name="fecha_ingreso" value={form.fecha_ingreso || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Número de Empleado</label>
                <input name="numero_empleado" value={form.numero_empleado || ""} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Documentos de Identidad</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>RFC</label>
                <input name="rfc" value={form.rfc || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>CURP</label>
                <input name="curp" value={form.curp || ""} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>CUIP</label>
                <input name="cuip" value={form.cuip || ""} onChange={handleChange} placeholder={form.categoria === "Vial" ? "No aplica" : ""} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Estás seguro?</h3>
            <p>Se eliminará el registro de <strong>{persona.nombre} {persona.apellidos}</strong>. Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</button>
              <button className="btn-danger" onClick={handleEliminar}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FichaPersona;
