import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, User, Upload } from "lucide-react";

const initialForm = {
  categoria: "Preventiva",
  asignacion: "",
  nombre: "",
  apellidos: "",
  direccion: "",
  telefono: "",
  telefono_emergencia: "",
  fecha_nacimiento: "",
  tipo_sangre: "O+",
  escolaridad: "",
  rfc: "",
  curp: "",
  cuip: "",
  fecha_ingreso: "",
  numero_empleado: "",
};

function AgregarPersona({ personal, setPersonal }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);

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

  const handleGuardar = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      const newId = Math.max(...personal.map((p) => p.id)) + 1;
      setPersonal([...personal, { ...form, id: newId, foto: null }]);
      setSaving(false);
      navigate("/personal");
    }, 800);
  };

  return (
    <div className="ficha-page">
      <div className="ficha-header-row">
        <button className="btn-ghost" onClick={() => navigate("/personal")}>
          <ArrowLeft size={18} />
          Volver
        </button>
        <button className="btn-primary" onClick={handleGuardar} disabled={saving}>
          {saving ? <span className="spinner-inline"></span> : <><Save size={16} /> Guardar</>}
        </button>
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
        </div>

        <div className="ficha-form">
          <h2 className="ficha-name">Nueva Persona</h2>

          <div className="form-section">
            <h3>Datos Personales</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre(s)" />
              </div>
              <div className="form-group">
                <label>Apellidos</label>
                <input name="apellidos" value={form.apellidos} onChange={handleChange} placeholder="Apellido Paterno Materno" />
              </div>
              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Tipo de Sangre</label>
                <select name="tipo_sangre" value={form.tipo_sangre} onChange={handleChange}>
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Dirección</label>
                <input name="direccion" value={form.direccion} onChange={handleChange} placeholder="Calle, número, colonia" />
              </div>
              <div className="form-group">
                <label>Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="614-000-0000" />
              </div>
              <div className="form-group">
                <label>Teléfono de Emergencia</label>
                <input name="telefono_emergencia" value={form.telefono_emergencia} onChange={handleChange} placeholder="614-000-0000" />
              </div>
              <div className="form-group">
                <label>Escolaridad</label>
                <input name="escolaridad" value={form.escolaridad} onChange={handleChange} placeholder="Nivel de estudios" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Datos Laborales</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Categoría</label>
                <select name="categoria" value={form.categoria} onChange={handleChange}>
                  <option value="Preventiva">Preventiva</option>
                  <option value="Vial">Vial</option>
                </select>
              </div>
              <div className="form-group">
                <label>Asignación</label>
                <select name="asignacion" value={form.asignacion} onChange={handleChange}>
                  <option value="">Seleccionar...</option>
                  <option value="Policía Preventiva">Policía Preventiva</option>
                  <option value="Vialidad">Vialidad</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fecha de Ingreso</label>
                <input type="date" name="fecha_ingreso" value={form.fecha_ingreso} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Número de Empleado</label>
                <input name="numero_empleado" value={form.numero_empleado} onChange={handleChange} placeholder="POL-0000 o VIA-0000" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Documentos de Identidad</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>RFC</label>
                <input name="rfc" value={form.rfc} onChange={handleChange} placeholder="RFC con homoclave" />
              </div>
              <div className="form-group">
                <label>CURP</label>
                <input name="curp" value={form.curp} onChange={handleChange} placeholder="18 caracteres" />
              </div>
              <div className="form-group">
                <label>CUIP</label>
                <input name="cuip" value={form.cuip} onChange={handleChange} placeholder={form.categoria === "Vial" ? "No aplica" : "Clave Única Policial"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgregarPersona;
