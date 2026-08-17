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

// Campos obligatorios con su label para mostrar en error
const OBLIGATORIOS = [
  { campo: "nombre",            label: "Nombre" },
  { campo: "apellidos",         label: "Apellidos" },
  { campo: "numero_empleado",   label: "Número de Empleado" },
  { campo: "categoria",         label: "Categoría" },
  { campo: "fecha_nacimiento",  label: "Fecha de Nacimiento" },
  { campo: "tipo_sangre",       label: "Tipo de Sangre" },
  { campo: "fecha_ingreso",     label: "Fecha de Ingreso" },
  { campo: "clave_ine",         label: "Clave de INE" },
  { campo: "licencia_conducir", label: "Licencia de Conducir" },
];

// Validaciones de formato (longitud y patrón)
const VALIDACIONES_FORMATO = {
  telefono:            { longitud: 10, label: "Teléfono", mensaje: "Debe tener 10 dígitos", opcional: true },
  telefono_emergencia: { longitud: 10, label: "Tel. Emergencia", mensaje: "Debe tener 10 dígitos", opcional: true },
};

function AgregarPersona() {
  const navigate = useNavigate();
  const [form, setForm]               = useState(initialForm);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [erroresValidacion, setErroresValidacion] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Limpiar error de ese campo al escribir
    if (erroresValidacion[e.target.name]) {
      setErroresValidacion({ ...erroresValidacion, [e.target.name]: null });
    }
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Validar antes de enviar
  const validar = () => {
    const errores = {};

    // 1. Campos obligatorios vacíos
    for (const { campo, label } of OBLIGATORIOS) {
      if (!form[campo] || !form[campo].trim()) {
        errores[campo] = `${label} es obligatorio`;
      }
    }

    // 2. Validaciones de formato (longitud)
    for (const [campo, regla] of Object.entries(VALIDACIONES_FORMATO)) {
      const valor = (form[campo] || "").replace(/[\s\-]/g, ""); // quitar espacios y guiones
      if (!valor && regla.opcional) continue; // si es opcional y vacío, skip
      if (!valor && !regla.opcional) continue; // si obligatorio y vacío, ya lo capturó arriba
      if (valor && valor.length !== regla.longitud) {
        errores[campo] = regla.mensaje;
      }
    }

    setErroresValidacion(errores);
    return Object.keys(errores).length === 0;
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

  const onGuardar = (e) => {
    e.preventDefault();
    if (!validar()) return;
    handleSubmit(form);
  };

  const tieneError = (campo) => !!erroresValidacion[campo];
  const esObligatorio = (campo) => OBLIGATORIOS.some((o) => o.campo === campo);

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

      {Object.keys(erroresValidacion).length > 0 && (
        <div role="alert" className="alert-error">
          Completa los campos obligatorios marcados en rojo.
        </div>
      )}

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
                { id: "nombre",              label: "Nombre",                placeholder: "Nombre(s)" },
                { id: "apellidos",           label: "Apellidos",             placeholder: "Apellido Paterno Materno" },
                { id: "fecha_nacimiento",    label: "Fecha de Nacimiento",   type: "date" },
                { id: "direccion",           label: "Dirección",             placeholder: "Calle, número, colonia" },
                { id: "telefono",            label: "Teléfono",              placeholder: "614-000-0000" },
                { id: "telefono_emergencia", label: "Teléfono de Emergencia", placeholder: "614-000-0000" },
                { id: "escolaridad",         label: "Escolaridad",           placeholder: "Nivel de estudios" },
              ].map(({ id: field, label, type = "text", placeholder }) => (
                <div key={field} className={`form-group ${tieneError(field) ? "form-group-error" : ""}`}>
                  <label htmlFor={`add-${field}`}>
                    {label} {esObligatorio(field) && <span className="label-required">*</span>}
                  </label>
                  <input id={`add-${field}`} type={type} name={field}
                    value={form[field]} onChange={handleChange} placeholder={placeholder}
                    aria-invalid={tieneError(field)}
                    aria-describedby={tieneError(field) ? `err-${field}` : undefined} />
                  {tieneError(field) && (
                    <span id={`err-${field}`} className="field-error">{erroresValidacion[field]}</span>
                  )}
                </div>
              ))}
              <div className={`form-group ${tieneError("tipo_sangre") ? "form-group-error" : ""}`}>
                <label htmlFor="add-tipo_sangre">Tipo de Sangre <span className="label-required">*</span></label>
                <select id="add-tipo_sangre" name="tipo_sangre" value={form.tipo_sangre} onChange={handleChange}
                  aria-invalid={tieneError("tipo_sangre")}>
                  {["O+","O-","A+","A-","B+","B-","AB+","AB-"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {tieneError("tipo_sangre") && (
                  <span className="field-error">{erroresValidacion.tipo_sangre}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Datos Laborales</h3>
            <div className="form-grid">
              <div className={`form-group ${tieneError("categoria") ? "form-group-error" : ""}`}>
                <label htmlFor="add-categoria">Categoría <span className="label-required">*</span></label>
                <select id="add-categoria" name="categoria" value={form.categoria} onChange={handleChange}
                  aria-invalid={tieneError("categoria")}>
                  <option value="Preventiva">Preventiva</option>
                  <option value="Vial">Vial</option>
                </select>
                {tieneError("categoria") && (
                  <span className="field-error">{erroresValidacion.categoria}</span>
                )}
              </div>
              <div className={`form-group ${tieneError("fecha_ingreso") ? "form-group-error" : ""}`}>
                <label htmlFor="add-fecha_ingreso">Fecha de Ingreso <span className="label-required">*</span></label>
                <input id="add-fecha_ingreso" type="date" name="fecha_ingreso" value={form.fecha_ingreso}
                  onChange={handleChange} aria-invalid={tieneError("fecha_ingreso")} />
                {tieneError("fecha_ingreso") && (
                  <span className="field-error">{erroresValidacion.fecha_ingreso}</span>
                )}
              </div>
              <div className={`form-group ${tieneError("numero_empleado") ? "form-group-error" : ""}`}>
                <label htmlFor="add-numero_empleado">Número de Empleado <span className="label-required">*</span></label>
                <input id="add-numero_empleado" name="numero_empleado" value={form.numero_empleado}
                  onChange={handleChange} placeholder="POL-0000 o VIA-0000"
                  aria-invalid={tieneError("numero_empleado")} />
                {tieneError("numero_empleado") && (
                  <span className="field-error">{erroresValidacion.numero_empleado}</span>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Documentos de Identidad</h3>
            <div className="form-grid">
              {[
                { id: "rfc",               label: "RFC",                       placeholder: "RFC con homoclave" },
                { id: "curp",              label: "CURP",                      placeholder: "18 caracteres" },
                { id: "clave_ine",         label: "Clave de INE",              placeholder: "Clave de elector" },
                { id: "licencia_conducir", label: "Núm. Licencia de Conducir", placeholder: "Número de licencia" },
              ].map(({ id: field, label, placeholder }) => (
                <div key={field} className={`form-group ${tieneError(field) ? "form-group-error" : ""}`}>
                  <label htmlFor={`add-${field}`}>
                    {label} {esObligatorio(field) && <span className="label-required">*</span>}
                  </label>
                  <input id={`add-${field}`} name={field} value={form[field]}
                    onChange={handleChange} placeholder={placeholder}
                    aria-invalid={tieneError(field)}
                    aria-describedby={tieneError(field) ? `err-${field}` : undefined} />
                  {tieneError(field) && (
                    <span id={`err-${field}`} className="field-error">{erroresValidacion[field]}</span>
                  )}
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
