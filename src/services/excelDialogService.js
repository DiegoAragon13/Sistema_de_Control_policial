/**
 * excelDialogService.js
 * Guarda un workbook xlsx usando el diálogo nativo del OS.
 *
 * En Tauri: llama al comando Rust cmd_guardar_archivo que abre
 *           el diálogo nativo y escribe el archivo.
 * En browser: descarga directamente (fallback desarrollo).
 */

import { invoke } from "./tauriInvoke";

/**
 * @param {Object} wb            - Workbook de SheetJS
 * @param {string} nombreSugerido - Nombre por defecto en el diálogo
 * @param {string} titulo         - Título del diálogo
 */
export async function guardarExcel(wb, nombreSugerido, titulo = "Guardar archivo") {
  const XLSX = (await import("xlsx"));

  // Generar el buffer del xlsx
  const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  const uint8  = new Uint8Array(buffer);

  // Convertir a base64 para pasarlo al backend Rust
  const b64 = uint8ToBase64(uint8);

  if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
    // Rust abre el diálogo y escribe el archivo
    await invoke("cmd_guardar_archivo", {
      input: {
        nombre_sugerido: nombreSugerido,
        titulo,
        extension: "xlsx",
        contenido_b64: b64,
      },
    });
    return;
  }

  // Browser fallback
  XLSX.writeFile(wb, nombreSugerido);
}

// ── helpers ───────────────────────────────────────────────────────────────────

function uint8ToBase64(uint8) {
  let binary = "";
  const len  = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}
