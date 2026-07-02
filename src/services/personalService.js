/**
 * personalService.js — Capa de datos real via Tauri IPC.
 *
 * Todos los métodos llaman comandos Rust registrados en lib.rs.
 * El frontend no sabe nada de SQLite — solo llama estas funciones.
 */

import { invoke } from "../lib/tauri";

/**
 * Obtener todos los registros de personal.
 * @returns {Promise<Array>}
 */
export async function getAll() {
  return invoke("cmd_get_all");
}

/**
 * Obtener un registro por ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function getById(id) {
  return invoke("cmd_get_by_id", { id });
}

/**
 * Crear un nuevo registro.
 * @param {Object} data - PersonaInput
 * @returns {Promise<Object>} Registro creado con id asignado
 */
export async function create(data) {
  return invoke("cmd_create", { input: sanitize(data) });
}

/**
 * Actualizar un registro existente.
 * @param {number} id
 * @param {Object} data - PersonaInput
 * @returns {Promise<Object>} Registro actualizado
 */
export async function update(id, data) {
  return invoke("cmd_update", { id, input: sanitize(data) });
}

/**
 * Dar de baja a un elemento (no elimina).
 * @param {number} id
 * @param {string} nota - Motivo de la baja
 */
export async function darBaja(id, nota) {
  return invoke("cmd_dar_baja", { id, nota });
}

/**
 * Reactivar un elemento dado de baja.
 * @param {number} id
 */
export async function reactivar(id) {
  return invoke("cmd_reactivar", { id });
}

/**
 * Importar múltiples registros de un golpe (desde Excel).
 * @param {Array} registros - Array de PersonaInput
 * @returns {Promise<{importados: number, errores: string[]}>}
 */
export async function importBulk(registros) {
  return invoke("cmd_import_bulk", { registros: registros.map(sanitize) });
}

/**
 * Obtener info de versión de la DB (para el sistema .sicop).
 * @returns {Promise<{version_db: number, fecha_exportacion: string|null, creado_en: string}>}
 */
export async function getMeta() {
  return invoke("cmd_get_meta");
}

/**
 * Exportar la DB cifrada como archivo .sicop.
 * @param {string} rutaDestino - Carpeta donde guardar el archivo
 * @returns {Promise<string>} Ruta del archivo generado
 */
export async function exportarSicop(rutaDestino) {
  return invoke("cmd_exportar_sicop", { rutaDestino });
}

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Normaliza un objeto persona para que coincida con PersonaInput en Rust.
 * Elimina campos que no debe recibir el backend (id, timestamps, etc.)
 */
function sanitize(data) {
  return {
    activo:               data.activo ?? true,
    nota_baja:            data.nota_baja ?? "",
    categoria:            data.categoria ?? "Preventiva",
    nombre:               data.nombre ?? "",
    apellidos:            data.apellidos ?? "",
    fecha_nacimiento:     data.fecha_nacimiento ?? "",
    tipo_sangre:          data.tipo_sangre ?? "O+",
    escolaridad:          data.escolaridad ?? "",
    direccion:            data.direccion ?? "",
    telefono:             data.telefono ?? "",
    telefono_emergencia:  data.telefono_emergencia ?? "",
    numero_empleado:      data.numero_empleado ?? "",
    fecha_ingreso:        data.fecha_ingreso ?? "",
    rfc:                  data.rfc ?? "",
    curp:                 data.curp ?? "",
    cuip:                 data.cuip ?? "",
    clave_ine:            data.clave_ine ?? "",
    licencia_conducir:    data.licencia_conducir ?? "",
    foto:                 data.foto ?? null,
  };
}
