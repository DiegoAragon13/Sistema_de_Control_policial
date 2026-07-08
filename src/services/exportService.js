/**
 * exportService.js
 * Genera un .xlsx con una hoja por persona en formato de expediente.
 *
 * Estructura de cada hoja:
 *   Filas 0-1  : Encabezado institucional
 *   Filas 2-12 : Bloque de foto (A2:B12 combinado) + nombre y datos clave al lado
 *   Filas 13+  : Datos personales, laborales, documentos
 *   Últimas    : Firmas / sello
 */

import { guardarExcel } from "./excelDialogService";

let _XLSX = null;
async function getXLSX() {
  if (!_XLSX) _XLSX = await import("xlsx");
  return _XLSX;
}

// ── Constructor de hoja ───────────────────────────────────────────────────────

function buildHoja(persona, XLSX) {
  const ws    = {};
  const range = { s: { c: 0, r: 0 }, e: { c: 5, r: 35 } };

  const set = (col, row, value) => {
    const addr = XLSX.utils.encode_cell({ c: col, r: row });
    ws[addr] = { v: value ?? "", t: typeof value === "number" ? "n" : "s" };
  };

  // ── Fila 0: Encabezado ──
  set(0, 0, "CORPORACIÓN DE SEGURIDAD PÚBLICA");
  set(3, 0, "EXPEDIENTE DE PERSONAL");
  set(5, 0, persona.activo === false ? "★ BAJA ★" : "ACTIVO");

  // ── Fila 1: separador ──
  set(0, 1, "─────────────────────────────────────────────────────────────────────");

  // ── Filas 2-12: FOTO (columnas A-B) + datos básicos (columnas C-F) ──
  // La columna A-B es el bloque de foto (se deja vacío, se combina visualmente)
  set(0, 2, "[  FOTOGRAFÍA  ]");
  // Las celdas A3-B12 quedan vacías para el bloque combinado

  // Nombre completo destacado al lado de la foto
  set(2, 2, `${persona.nombre || ""} ${persona.apellidos || ""}`.trim().toUpperCase());

  set(2, 4,  "Categoría:");      set(3, 4,  persona.categoria || "");
  set(2, 5,  "Núm. Empleado:");  set(3, 5,  persona.numero_empleado || "");
  set(2, 6,  "Fecha Ingreso:");  set(3, 6,  persona.fecha_ingreso || "");
  set(2, 7,  "Tipo Sangre:");    set(3, 7,  persona.tipo_sangre || "");
  set(4, 4,  "Estado:");         set(5, 4,  persona.activo === false ? "BAJA" : "ACTIVO");
  set(4, 5,  "Teléfono:");       set(5, 5,  persona.telefono || "");
  set(4, 6,  "Tel. Emergencia:"); set(5, 6, persona.telefono_emergencia || "");

  // ── Fila 13: separador ──
  set(0, 13, "── DATOS PERSONALES ────────────────────────────────────────────────");

  set(0, 14, "Nombre completo:");  set(1, 14, `${persona.nombre || ""} ${persona.apellidos || ""}`);
  set(0, 15, "Fecha Nacimiento:"); set(1, 15, persona.fecha_nacimiento || "");
  set(2, 15, "Escolaridad:");      set(3, 15, persona.escolaridad || "");
  set(0, 16, "Dirección:");        set(1, 16, persona.direccion || "");

  // ── Fila 17: separador ──
  set(0, 17, "── DOCUMENTOS DE IDENTIDAD ─────────────────────────────────────────");

  set(0, 18, "RFC:");        set(1, 18, persona.rfc || "");
  set(2, 18, "CURP:");       set(3, 18, persona.curp || "");
  set(0, 19, "Clave INE:");  set(1, 19, persona.clave_ine || "");
  set(2, 19, "Licencia:");   set(3, 19, persona.licencia_conducir || "");
  set(0, 20, "CUIP:");
  set(1, 20, persona.cuip || (persona.categoria === "Vial" ? "No aplica" : ""));

  // ── Fila 21: separador ──
  set(0, 21, "── FIRMA Y VALIDACIÓN ──────────────────────────────────────────────");

  set(0, 22, "Firma del elemento:");
  set(2, 22, "Firma del comandante:");
  set(4, 22, "Sello:");

  set(0, 24, "___________________________");
  set(2, 24, "___________________________");
  set(4, 24, "___________________________");

  // ── Nota de baja ──
  if (persona.activo === false && persona.nota_baja) {
    set(0, 26, "── NOTA DE BAJA ────────────────────────────────────────────────────");
    set(0, 27, persona.nota_baja);
  }

  ws["!ref"]  = XLSX.utils.encode_range(range);
  ws["!cols"] = [
    { wch: 20 }, // A — etiquetas / bloque foto
    { wch: 26 }, // B — valores
    { wch: 20 }, // C
    { wch: 26 }, // D
    { wch: 18 }, // E
    { wch: 18 }, // F
  ];
  ws["!rows"] = [
    { hpt: 22 }, // 0 encabezado
    { hpt: 6  }, // 1 separador
    { hpt: 72 }, // 2 fila de inicio del bloque foto — alta para dar espacio
    { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 },
    { hpt: 18 }, { hpt: 18 }, { hpt: 18 }, { hpt: 18 },
    { hpt: 18 }, { hpt: 18 }, // 12
  ];

  ws["!merges"] = [
    // Bloque de foto: A3:B13 (filas 2 a 12, columnas 0 a 1)
    { s: { c: 0, r: 2 }, e: { c: 1, r: 12 } },
    // Nombre completo: C3:F3 (columnas 2 a 5, fila 2)
    { s: { c: 2, r: 2 }, e: { c: 5, r: 3 } },
    // Separadores full width
    { s: { c: 0, r: 1  }, e: { c: 5, r: 1  } },
    { s: { c: 0, r: 0  }, e: { c: 2, r: 0  } },
    { s: { c: 0, r: 13 }, e: { c: 5, r: 13 } },
    { s: { c: 0, r: 16 }, e: { c: 5, r: 16 } },
    { s: { c: 0, r: 17 }, e: { c: 5, r: 17 } },
    { s: { c: 0, r: 21 }, e: { c: 5, r: 21 } },
    { s: { c: 0, r: 26 }, e: { c: 5, r: 26 } },
    { s: { c: 0, r: 27 }, e: { c: 5, r: 27 } },
  ];

  return ws;
}

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Genera y guarda (con diálogo nativo) un .xlsx con una hoja por persona.
 * @param {Array} listaPersonal
 */
export async function exportarExcel(listaPersonal) {
  if (!listaPersonal || listaPersonal.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }

  const XLSX = await getXLSX();

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title:       "Expedientes de Personal",
    Subject:     "Corporación de Seguridad Pública",
    Author:      "SICOP",
    CreatedDate: new Date(),
  };

  listaPersonal.forEach((persona) => {
    const ws = buildHoja(persona, XLSX);
    const nombreHoja = `${persona.numero_empleado || `ID${persona.id}`}`
      .replace(/[:\\/?*[\]]/g, "")
      .substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
  });

  const fecha = new Date().toISOString().slice(0, 10);
  await guardarExcel(wb, `Expedientes_Personal_${fecha}.xlsx`, "Guardar expedientes de personal");
}
