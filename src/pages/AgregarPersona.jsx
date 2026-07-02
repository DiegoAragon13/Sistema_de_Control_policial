import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft, User, Upload } from "lucide-react";
import { useFormSubmit } from "../hooks/useFormSubmit";
import * as personalService from "../services/personalService";

const initialForm = {
  categoria: "Preventiva", nombre: "", apellidos: "",
  direccion: "", telefono: "", telefono_emergencia: "",
  fecha_nacimiento: "", tipo_sangre: "O+", escolaridad: "",
  rfc: "", curp: "", cuip: "", clave_ine: "", licencia_conducir: "",
  fecha_ingreso: "", numero_empleado: "",
};

function AgregarPersona() {
  const navigate = useNavigate();
  const [form, setForm]               = useState(initialForm);
  const [fotoPreview, setFotoPreview] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const submitHandler = useCallback(async (data) => {
    await personalService.create({
      ...data,
      foto: fotoPreview ? fotoPreview.replace(/^data:image\/\w+;base64,/, "") : null,
    });
  }, [fotoPreview]);

  const { isSubmitting: saving, error: saveError, handleSubmit } = useFormSubmit(submitHandler, {
    onSuccess: () => navigate("/personal"),
  });

  const onGuardar = (e) => { e.preventDefault(); handleSubmit(form); };

  return (
    <div className="ficha-page">
      <div className="ficha-header-row">
        <button className="btn-ghost" onClick={() => navigate("/personal")}>
          <ArrowLeft size={18} aria-hidden="true" /> Volver
        </button>
        <button className="btn-primary" onClick={onGuardar} disabled={saving} aria-busy={saving}>
          {saving ? <span className="spinner-inline"></span> : <><Save size={16} aria-hidden="true" /> Guardar</>}
        </button>
      </div>

      {saveError && <div role="alert" className="alert-error">{saveError}</div>}

      <div className="ficha-content">
        <div className="ficha-sidebar">
          <div className="ficha-foto-container">
            {fotoPreview
              ? <img src={fotoPreview} alt="Foto del nuevo elemento" className="ficha-foto" />
              : <div className="ficha-foto-placeholder"><User size={64} aria-hidden="true" /></div>}
          </div>
          <label className="btn-secondary btn-upload">
            <Upload size={16} aria-hidden="true" /> Cargar Foto
            <input type="file" accept="image/*" onChange={handleFoto} hidden aria-label="Seleccionar fotografía" />
          </label>
        </div>

        <div className="ficha-form">
          <h2 className="ficha-name">Nueva Persona</h2>

          <div className="form-section">
            <h3>Datos Personales</h3>
            <div className="form-grid">
              {[
                { id: "nombre",              label: "Nombre",               placeholder: "Nombre(s)" },
                { id: "apellidos",           label: "Apellidos",            placeholder: "Apellido Paterno Materno" },
                { id: "fecha_nacimiento",    label: "Fecha de Nacimiento",  type: "date" },
                { id: "direccion",           label: "Dirección",            placeholder: "Calle, número, colonia" },
                { id: "telefono",            label: "Teléfono",             placeholder: "614-000-0000" },
                { id: "telefono_emergencia", label: "Teléfono de Emergencia", placeholder: "614-000-0000" },
                { id: "escolaridad",         label: "Escolaridad",          placeholder: "Nivel de estudios" },
              ].map(({ id: field, label, type = "text", placeholder }) => (
                <div key={field} className="form-group">
                  <label htmlFor={`add-${field}`}>{label}</label>
                  <input id={`add-${field}`} type={type} name={field}
                    value={form[field]} onChange={handleChange} placeholder={placeholder} />
                </div>
              ))}
              <div className="form-group">
                <label htmlFor="add-tipo_sangre">Tipo de Sangre</label>
                <select id="add-tipo_sangre" name="tipo_sangre" value={form.tipo_sangre} onChange={handleChange}>
                  {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
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
                <input id="add-numero_empleado" name="numero_empleado" value={form.numero_empleado}
                  onChange={handleChange} placeholder="POL-0000 o VIA-0000" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Documentos de Identidad</h3>
            <div className="form-grid">
              {[
                { id: "rfc",               label: "RFC",                         placeholder: "RFC con homoclave" },
                { id: "curp",              label: "CURP",                        placeholder: "18 caracteres" },
                { id: "clave_ine",         label: "Clave de INE",                placeholder: "Clave de elector" },
                { id: "licencia_conducir", label: "Núm. Licencia de Conducir",   placeholder: "Número de licencia" },
              ].map(({ id: field, label, placeholder }) => (
                <div key={field} className="form-group">
                  <label htmlFor={`add-${field}`}>{label}</label>
                  <input id={`add-${field}`} name={field} value={form[field]}
                    onChange={handleChange} placeholder={placeholder} />
                </div>
              ))}
              <div className="form-group">
                <label htmlFor="add-cuip">CUIP <span className="label-optional">(opcional)</span></label>
                <input id="add-cuip" name="cuip" value={form.cuip} onChange={handleChange}
                  placeholder={form.categoria === "Vial" ? "No aplica para Vial" : "Clave Única Policial"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgregarPersona;
