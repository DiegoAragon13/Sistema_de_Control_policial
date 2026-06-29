import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, User, Upload } from "lucide-react";
import { useFormSubmit } from "../hooks/useFormSubmit";
import * as personalService from "../services/personalService";

const initialForm = {
  categoria: "Preventiva",
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

function AgregarPersona({ refreshPersonal }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
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

  // --- Double-click-safe save via useFormSubmit ---
  const submitHandler = useCallback(
    async (data) => {
      await personalService.create({ ...data, foto: null });
    },
    []
  );

  const { isSubmitting: saving, error: saveError, handleSubmit } = useFormSubmit(
    submitHandler,
    {
      onSuccess: () => {
        refreshPersonal();
        navigate("/personal");
      },
    }
  );

  const onGuardar = (e) => {
    e.preventDefault();
    handleSubmit(form);
  };

  return (
    <div className="ficha-page">
      <div className="ficha-header-row">
        <button className="btn-ghost" onClick={() => navigate("/personal")}>
          <ArrowLeft size={18} aria-hidden="true" />
          Volver
        </button>
        <button
          className="btn-primary"
          onClick={onGuardar}
          disabled={saving}
          aria-busy={saving}
        >
          {saving ? <span className="spinner-inline"></span> : <><Save size={16} aria-hidden="true" /> Guardar</>}
        </button>
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
              <img src={fotoPreview} alt="Foto del nuevo elemento" className="ficha-foto" />
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
        </div>

        <div className="ficha-form">
          <h2 className="ficha-name">Nueva Persona</h2>

          <div className="form-section">
            <h3>Datos Personales</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="add-nombre">Nombre</label>
                <input id="add-nombre" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre(s)" />
              </div>
              <div className="form-group">
                <label htmlFor="add-apellidos">Apellidos</label>
                <input id="add-apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} placeholder="Apellido Paterno Materno" />
              </div>
              <div className="form-group">
                <label htmlFor="add-fecha_nacimiento">Fecha de Nacimiento</label>
                <input id="add-fecha_nacimiento" type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="add-tipo_sangre">Tipo de Sangre</label>
                <select id="add-tipo_sangre" name="tipo_sangre" value={form.tipo_sangre} onChange={handleChange}>
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="add-direccion">Dirección</label>
                <input id="add-direccion" name="direccion" value={form.direccion} onChange={handleChange} placeholder="Calle, número, colonia" />
              </div>
              <div className="form-group">
                <label htmlFor="add-telefono">Teléfono</label>
                <input id="add-telefono" name="telefono" value={form.telefono} onChange={handleChange} placeholder="614-000-0000" />
              </div>
              <div className="form-group">
                <label htmlFor="add-telefono_emergencia">Teléfono de Emergencia</label>
                <input id="add-telefono_emergencia" name="telefono_emergencia" value={form.telefono_emergencia} onChange={handleChange} placeholder="614-000-0000" />
              </div>
              <div className="form-group">
                <label htmlFor="add-escolaridad">Escolaridad</label>
                <input id="add-escolaridad" name="escolaridad" value={form.escolaridad} onChange={handleChange} placeholder="Nivel de estudios" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Datos Laborales</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="add-categoria">Categoría</label>
                <select id="add-categoria" name="categoria" value={form.categoria} onChange={handleChange}>
                  <option value="Preventiva">Preventiva</option>
                  <option value="Vial">Vial</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="add-fecha_ingreso">Fecha de Ingreso</label>
                <input id="add-fecha_ingreso" type="date" name="fecha_ingreso" value={form.fecha_ingreso} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="add-numero_empleado">Número de Empleado</label>
                <input id="add-numero_empleado" name="numero_empleado" value={form.numero_empleado} onChange={handleChange} placeholder="POL-0000 o VIA-0000" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Documentos de Identidad</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="add-rfc">RFC</label>
                <input id="add-rfc" name="rfc" value={form.rfc} onChange={handleChange} placeholder="RFC con homoclave" />
              </div>
              <div className="form-group">
                <label htmlFor="add-curp">CURP</label>
                <input id="add-curp" name="curp" value={form.curp} onChange={handleChange} placeholder="18 caracteres" />
              </div>
              <div className="form-group">
                <label htmlFor="add-cuip">CUIP</label>
                <input id="add-cuip" name="cuip" value={form.cuip} onChange={handleChange} placeholder={form.categoria === "Vial" ? "No aplica" : "Clave Única Policial"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgregarPersona;
