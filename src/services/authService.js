/**
 * authService.js — Autenticación via Tauri IPC
 */
import { invoke } from "../lib/tauri";

/**
 * Iniciar sesión.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{id, username, nombre, rol}>}
 * @throws Error con mensaje del backend si las credenciales son incorrectas
 */
export async function login(username, password) {
  return invoke("cmd_login", { input: { username, password } });
}

/**
 * Cambiar contraseña del usuario actual.
 * @param {number} idUsuario
 * @param {string} passwordActual
 * @param {string} passwordNueva
 */
export async function cambiarPassword(idUsuario, passwordActual, passwordNueva) {
  return invoke("cmd_cambiar_password", {
    idUsuario,
    passwordActual,
    passwordNueva,
  });
}
