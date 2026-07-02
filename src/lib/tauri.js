/**
 * tauri.js — Wrapper IPC
 *
 * Detecta si la app corre dentro de Tauri (app de escritorio)
 * o en el navegador (desarrollo con `npm run dev` sin Tauri).
 *
 * En modo Tauri: usa @tauri-apps/api/core invoke() real.
 * En modo browser: lanza un error claro para que el dev sepa
 * que esa función requiere el backend.
 */

let _invoke = null;

async function getInvoke() {
  if (_invoke) return _invoke;

  // window.__TAURI_INTERNALS__ existe solo dentro del proceso Tauri
  if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
    const mod = await import("@tauri-apps/api/core");
    _invoke = mod.invoke;
  } else {
    // Modo browser sin Tauri — stub que avisa claramente
    _invoke = async (cmd, args) => {
      console.warn(`[TAURI STUB] invoke("${cmd}", ${JSON.stringify(args)})`);
      throw new Error(
        `El comando "${cmd}" requiere el backend Tauri. ` +
        `Ejecuta "npx tauri dev" en lugar de "npm run dev".`
      );
    };
  }

  return _invoke;
}

/**
 * Llama a un comando Rust del backend.
 * @param {string} command - Nombre del comando registrado en lib.rs
 * @param {object} args - Argumentos (serializados a JSON)
 * @returns {Promise<any>}
 */
export async function invoke(command, args = {}) {
  const fn = await getInvoke();
  return fn(command, args);
}
