/**
 * Personal Service — Data abstraction layer.
 *
 * Currently operates on an in-memory array (mock).
 * When SQLite or another persistence layer is added,
 * only this file needs to change. Components remain untouched.
 */

import mockPersonalData from "../data/mockPersonal";

// In-memory store (simulates DB)
let _store = [...mockPersonalData];
let _nextId = Math.max(..._store.map((p) => p.id)) + 1;

// --- Simulated async delay (mimics DB/IPC latency) ---
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all personnel records.
 * @returns {Promise<Array>}
 */
export async function getAll() {
  await delay(100);
  return [..._store];
}

/**
 * Get a single person by ID.
 * @param {number} id
 * @returns {Promise<Object|null>}
 */
export async function getById(id) {
  await delay(50);
  return _store.find((p) => p.id === id) || null;
}

/**
 * Add a new person.
 * @param {Object} data - Person data (without id)
 * @returns {Promise<Object>} The created record with id
 */
export async function create(data) {
  await delay(400);
  const record = { ...data, id: _nextId++ };
  _store = [..._store, record];
  return record;
}

/**
 * Update an existing person.
 * @param {number} id
 * @param {Object} data - Fields to update
 * @returns {Promise<Object>} The updated record
 */
export async function update(id, data) {
  await delay(400);
  _store = _store.map((p) => (p.id === id ? { ...p, ...data } : p));
  const updated = _store.find((p) => p.id === id);
  if (!updated) throw new Error("Registro no encontrado.");
  return updated;
}

/**
 * Delete a person by ID.
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function remove(id) {
  await delay(300);
  _store = _store.filter((p) => p.id !== id);
}

/**
 * Reset store to initial mock data (useful for testing).
 */
export function _reset() {
  _store = [...mockPersonalData];
  _nextId = Math.max(..._store.map((p) => p.id)) + 1;
}
