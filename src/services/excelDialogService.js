/**
 * excelDialogService.js
 * Utilidad compartida para guardar archivos .xlsx con diálogo nativo.
 *
 * En Tauri: abre el diálogo de "Guardar como" del sistema operativo.
 * En browser: descarga directamente (fallback para desarrollo).
 */

/**
 * Guarda un workbook xlsx mostrando el diálogo nativo de guardar.
 * @param {Object} wb - Workbook de SheetJS
 * @param {string} nombreSugerido - Nombre de archivo por defecto
 * @param {string} titulo - Título del diálogo
 */
export async function guardarExcel(wb, nombreSugerido, titulo = "Guardar archivo") {
  const XLSX = (await import("xlsx")).default || (await import("xlsx"));

  // ── Tauri: diálogo nativo del OS ──
  if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
    const { save }      = await import("@tauri-apps/plugin-dialog");
    const { writeFile } = await import("@tauri-apps/plugin-fs");

    const ruta = await save({
      title: titulo,
      defaultPath: nombreSugerido,
      filters: [{ name: "Excel", extensions: ["xlsx"] }],
    });

    if (!ruta) return; // usuario canceló

    // Generar el buffer del xlsx
    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    await writeFile(ruta, new Uint8Array(buffer));
    return;
  }

  // ── Browser fallback (npm run dev sin Tauri) ──
  XLSX.writeFile(wb, nombreSugerido);
}
