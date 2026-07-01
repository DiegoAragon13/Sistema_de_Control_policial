/**
 * exportService.js
 * Genera un archivo .xlsx con una hoja por persona.
 * Cada hoja tiene el formato de expediente listo para imprimir
 * o enviar a comandantes para llenado.
 *
 * Estructura de cada hoja:
 *   Fila 1    : Encabezado institucional
 *   Filas 2-3 : Espacio reservado para foto (celda combinada A2:B8)
 *   Filas 2-8 : Datos personales (columnas C-E)
 *   Fila 9+   : Datos laborales
 *   Fila 14+  : Documentos de identidad
 *   Última    : Nota de baja si aplica
 */

// Dynamic import so xlsx (~550KB) is only loaded when the user clicks Export,
// not on initial page load. Keeps the Personal page chunk small.
let _XLSX = null;
async function getXLSX() {
  if (!_XLSX) _XLSX = await import("xlsx");
  return _XLSX;
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Aplica estilos a una celda (SheetJS no soporta estilos en la versión CE,
 *  pero dejamos la estructura lista para xlsx-js-style si se migra). */
function cell(value, type = "s") {
  return { v: value, t: type };
}

function buildHoja(persona, XLSX) {
  // SheetJS usa coordenadas A1, B2, etc. Construimos un objeto de celdas.
  const ws = {};
  const range = { s: { c: 0, r: 0 }, e: { c: 5, r: 30 } };

  // ── Utilidad para escribir celdas ──
  const set = (col, row, value) => {
    const addr = XLSX.utils.encode_cell({ c: col, r: row });
    ws[addr] = { v: value ?? "", t: typeof value === "number" ? "n" : "s" };
  };

  // ── Fila 0: Encabezado institucional ──
  set(0, 0, "CORPORACIÓN DE SEGURIDAD PÚBLICA");
  set(2, 0, "EXPEDIENTE DE PERSONAL");
  set(4, 0, `No. Empleado: ${persona.numero_empleado || ""}`);

  // ── Fila 1: Separador ──
  set(0, 1, "────────────────────────────────────────────────────────────────────────");

  // ── Filas 2-8: Espacio de foto + datos de identificación ──
  set(0, 2, "[  FOTO  ]");   // columnas A-B reservadas para foto al imprimir
  set(0, 3, "");
  set(0, 4, "");
  set(0, 5, "");
  set(0, 6, "");
  set(0, 7, "");

  // Nombre completo destacado
  set(2, 2, "NOMBRE COMPLETO:");
  set(3, 2, `${persona.nombre || ""} ${persona.apellidos || ""}`.trim());

  set(2, 3, "Categoría:");
  set(3, 3, persona.categoria || "");

  set(2, 4, "Estado:");
  set(3, 4, persona.activo === false ? "BAJA" : "ACTIVO");

  set(4, 2, "Fecha de Ingreso:");
  set(5, 2, persona.fecha_ingreso || "");

  set(4, 3, "Núm. Empleado:");
  set(5, 3, persona.numero_empleado || "");

  set(4, 4, "Tipo de Sangre:");
  set(5, 4, persona.tipo_sangre || "");

  // ── Fila 9: Separador sección ──
  set(0, 9, "── DATOS PERSONALES ─────────────────────────────────────────────────────");

  set(0, 10, "Fecha de Nacimiento:"); set(1, 10, persona.fecha_nacimiento || "");
  set(2, 10, "Escolaridad:");        set(3, 10, persona.escolaridad || "");

  set(0, 11, "Dirección:");
  set(1, 11, persona.direccion || "");

  set(0, 12, "Teléfono:");           set(1, 12, persona.telefono || "");
  set(2, 12, "Tel. Emergencia:");    set(3, 12, persona.telefono_emergencia || "");

  // ── Fila 13: Separador sección ──
  set(0, 13, "── DOCUMENTOS DE IDENTIDAD ──────────────────────────────────────────────");

  set(0, 14, "RFC:");       set(1, 14, persona.rfc || "");
  set(2, 14, "CURP:");      set(3, 14, persona.curp || "");

  set(0, 15, "Clave INE:"); set(1, 15, persona.clave_ine || "");
  set(2, 15, "Licencia:");  set(3, 15, persona.licencia_conducir || "");

  set(0, 16, "CUIP:");
  set(1, 16, persona.cuip || (persona.categoria === "Vial" ? "No aplica" : ""));

  // ── Fila 17: Separador sección ──
  set(0, 17, "── FIRMA Y VALIDACIÓN ───────────────────────────────────────────────────");

  set(0, 18, "Firma del elemento:");
  set(2, 18, "Firma del comandante:");
  set(4, 18, "Sello:");

  set(0, 19, "");
  set(0, 20, "___________________________");
  set(2, 20, "___________________________");
  set(4, 20, "___________________________");

  // ── Nota de baja (si aplica) ──
  if (persona.activo === false && persona.nota_baja) {
    set(0, 22, "── NOTA DE BAJA ─────────────────────────────────────────────────────────");
    set(0, 23, persona.nota_baja);
  }

  ws["!ref"] = XLSX.utils.encode_range(range);

  // Ancho de columnas (caracteres)
  ws["!cols"] = [
    { wch: 22 }, // A
    { wch: 28 }, // B
    { wch: 22 }, // C
    { wch: 28 }, // D
    { wch: 20 }, // E
    { wch: 20 }, // F
  ];

  // Altura de filas: fila 0 más alta (encabezado), filas 2-8 para la foto
  ws["!rows"] = [
    { hpt: 22 }, // fila 0 — encabezado
    { hpt: 6  }, // fila 1 — separador
    { hpt: 20 }, // fila 2
    { hpt: 20 }, // fila 3
    { hpt: 20 }, // fila 4
    { hpt: 20 }, // fila 5
    { hpt: 20 }, // fila 6
    { hpt: 20 }, // fila 7
    { hpt: 20 }, // fila 8
  ];

  // Combinar A2:B8 para el bloque de foto
  ws["!merges"] = [
    { s: { c: 0, r: 2 }, e: { c: 1, r: 8 } },   // bloque foto
    { s: { c: 0, r: 0 }, e: { c: 1, r: 0 } },   // encabezado izq
    { s: { c: 0, r: 11 }, e: { c: 5, r: 11 } }, // dirección full width
    { s: { c: 0, r: 1  }, e: { c: 5, r: 1  } }, // separador full width
    { s: { c: 0, r: 9  }, e: { c: 5, r: 9  } },
    { s: { c: 0, r: 13 }, e: { c: 5, r: 13 } },
    { s: { c: 0, r: 17 }, e: { c: 5, r: 17 } },
    { s: { c: 0, r: 22 }, e: { c: 5, r: 22 } },
    { s: { c: 0, r: 23 }, e: { c: 5, r: 23 } },
  ];

  return ws;
}

// ── Función principal ─────────────────────────────────────────────────────────

/**
 * Genera y descarga un archivo .xlsx con una hoja por persona.
 * @param {Array} listaPersonal - Array de objetos persona (los que están en la vista actual)
 */
export async function exportarExcel(listaPersonal) {
  if (!listaPersonal || listaPersonal.length === 0) {
    alert("No hay registros para exportar.");
    return;
  }

  const XLSX = await getXLSX();

  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "Expedientes de Personal",
    Subject: "Corporación de Seguridad Pública",
    Author: "SICOP",
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
  const fileName = `Expedientes_Personal_${fecha}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
