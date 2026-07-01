/**
 * Personal Service — Data abstraction layer.
 * Swap this file for SQLite/Tauri integration without touching any component.
 */

import mockPersonalData from "../data/mockPersonal";

let _store = mockPersonalData.map((p) => ({ ...p }));
let _nextId = Math.max(..._store.map((p) => p.id)) + 1;

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

export async function getAll() {
  await delay(100);
  return _store.map((p) => ({ ...p }));
}

export async function getById(id) {
  await delay(50);
  return _store.find((p) => p.id === id) || null;
}

export async function create(data) {
  await delay(400);
  const record = {
    activo: true,
    nota_baja: "",
    clave_ine: "",
    licencia_conducir: "",
    ...data,
    id: _nextId++,
  };
  _store = [..._store, record];
  return { ...record };
}

export async function update(id, data) {
  await delay(400);
  _store = _store.map((p) => (p.id === id ? { ...p, ...data } : p));
  const updated = _store.find((p) => p.id === id);
  if (!updated) throw new Error("Registro no encontrado.");
  return { ...updated };
}

/**
 * Dar de baja a un elemento (no elimina, marca activo=false).
 * @param {number} id
 * @param {string} nota - Motivo de la baja
 */
export async function darBaja(id, nota) {
  await delay(400);
  _store = _store.map((p) =>
    p.id === id ? { ...p, activo: false, nota_baja: nota } : p
  );
  const updated = _store.find((p) => p.id === id);
  if (!updated) throw new Error("Registro no encontrado.");
  return { ...updated };
}

/**
 * Reactivar un elemento dado de baja.
 * @param {number} id
 */
export async function reactivar(id) {
  await delay(400);
  _store = _store.map((p) =>
    p.id === id ? { ...p, activo: true, nota_baja: "" } : p
  );
}

export function _reset() {
  _store = mockPersonalData.map((p) => ({ ...p }));
  _nextId = Math.max(..._store.map((p) => p.id)) + 1;
}
