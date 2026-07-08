/**
 * plantillaService.js
 * Genera la plantilla .xlsx vacía para que los comandantes
 * llenen los datos de su personal y luego la importen.
 *
 * También parsea un .xlsx ya llenado y retorna los registros
 * listos para pasarlos a personalService.importBulk().
 */

import { guardarExcel } from "./excelDialogService";

// Lazy load para no bloquear la carga inicial
let _XLSX = null;
async function getXLSX() {
  if (!_XLSX) _XLSX = await import("xlsx");
  return _XLSX;
}

// ── Columnas de la plantilla ──────────────────────────────────────────────────

const COLUMNAS = [
  { campo: "numero_empleado",     titulo: "No. Empleado *",          ejemplo: "POL-0001",           ancho: 16 },
  { campo: "categoria",           titulo: "Categoría *",             ejemplo: "Preventiva",          ancho: 14 },
  { campo: "nombre",              titulo: "Nombre(s) *",             ejemplo: "Carlos",              ancho: 18 },
  { campo: "apellidos",           titulo: "Apellidos *",             ejemplo: "Hernández López",     ancho: 22 },
  { campo: "fecha_nacimiento",    titulo: "Fecha Nacimiento *",      ejemplo: "1985-03-15",          ancho: 18 },
  { campo: "tipo_sangre",         titulo: "Tipo Sangre *",           ejemplo: "O+",                  ancho: 12 },
  { campo: "escolaridad",         titulo: "Escolaridad",             ejemplo: "Licenciatura",        ancho: 22 },
  { campo: "direccion",           titulo: "Dirección",               ejemplo: "Av. Juárez #245",     ancho: 30 },
  { campo: "telefono",            titulo: "Teléfono",                ejemplo: "614-123-4567",        ancho: 16 },
  { campo: "telefono_emergencia", titulo: "Tel. Emergencia",         ejemplo: "614-987-6543",        ancho: 16 },
  { campo: "fecha_ingreso",       titulo: "Fecha Ingreso *",         ejemplo: "2010-06-01",          ancho: 16 },
  { campo: "rfc",                 titulo: "RFC",                     ejemplo: "HELC850315AB1",       ancho: 16 },
  { campo: "curp",                titulo: "CURP",                    ejemplo: "HELC850315HCHRLR08",  ancho: 22 },
  { campo: "clave_ine",           titulo: "Clave INE",               ejemplo: "HRLC8503152H1234",   ancho: 20 },
  { campo: "licencia_conducir",   titulo: "Licencia Conducir",       ejemplo: "CHI12345678",         ancho: 18 },
  { campo: "cuip",                titulo: "CUIP (opcional)",         ejemplo: "CUP-001234",          ancho: 16 },
];

// ── Generar plantilla ─────────────────────────────────────────────────────────

/**
 * Descarga una plantilla .xlsx vacía con encabezados, fila de ejemplo
 * y validaciones donde es posible.
 */
export async function descargarPlantilla() {
  const XLSX = await getXLSX();
  const wb   = XLSX.utils.book_new();

  // ── Hoja principal: Datos ──
  const wsData = {};
  const range  = { s: { c: 0, r: 0 }, e: { c: COLUMNAS.length - 1, r: 2 } };

  COLUMNAS.forEach((col, ci) => {
    // Fila 0: encabezado
    wsData[XLSX.utils.encode_cell({ c: ci, r: 0 })] = {
      v: col.titulo,
      t: "s",
    };
    // Fila 1: fila de ejemplo en gris
    wsData[XLSX.utils.encode_cell({ c: ci, r: 1 })] = {
      v: col.ejemplo,
      t: "s",
    };
    // Fila 2: primera fila vacía para que el usuario empiece aquí
    wsData[XLSX.utils.encode_cell({ c: ci, r: 2 })] = { v: "", t: "s" };
  });

  wsData["!ref"]  = XLSX.utils.encode_range(range);
  wsData["!cols"] = COLUMNAS.map((col) => ({ wch: col.ancho }));
  wsData["!rows"] = [
    { hpt: 20 }, // encabezado
    { hpt: 16 }, // fila ejemplo
    { hpt: 16 }, // primera fila vacía
  ];

  XLSX.utils.book_append_sheet(wb, wsData, "Personal");

  // ── Hoja de instrucciones ──
  const wsInfo = XLSX.utils.aoa_to_sheet([
    ["INSTRUCCIONES — Plantilla de Personal SICOP"],
    [""],
    ["1. Llena los datos en la hoja 'Personal' a partir de la fila 3 (la fila 2 es un ejemplo)."],
    ["2. No modifiques los encabezados de la fila 1."],
    ["3. Puedes borrar la fila 2 (ejemplo) antes de importar."],
    ["4. Los campos marcados con * son obligatorios."],
    ["5. Categoría debe ser exactamente: Preventiva  o  Vial"],
    ["6. Tipo Sangre: O+  O-  A+  A-  B+  B-  AB+  AB-"],
    ["7. Fechas en formato: YYYY-MM-DD  (ej: 1985-03-15)"],
    ["8. No. Empleado debe ser único (ej: POL-0001 o VIA-0001)"],
    ["9. Si un número de empleado ya existe en el sistema, ese registro se omite sin error."],
    [""],
    ["Campos opcionales: Escolaridad, Dirección, Teléfonos, RFC, CURP, Clave INE, Licencia, CUIP"],
  ]);
  wsInfo["!cols"] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, "Instrucciones");

  const fecha    = new Date().toISOString().slice(0, 10);
  const nombreSugerido = `Plantilla_Personal_SICOP_${fecha}.xlsx`;

  await guardarExcel(wb, nombreSugerido, "Guardar plantilla de personal");
}

// ── Parsear archivo llenado ───────────────────────────────────────────────────

/**
 * Lee un .xlsx llenado por el comandante y retorna un array de PersonaInput.
 * Omite filas completamente vacías y la fila de ejemplo si detecta que es igual.
 *
 * @param {File} archivo - El File object del input
 * @returns {Promise<{registros: Array, erroresFormato: string[]}>}
 */
export async function parsearExcel(archivo) {
  const XLSX = await getXLSX();

  const buffer = await archivo.arrayBuffer();
  const wb     = XLSX.read(buffer, { type: "array", cellDates: false });

  // Leer la primera hoja (Personal)
  const sheetName = wb.SheetNames[0];
  const ws        = wb.Sheets[sheetName];
  const filas     = XLSX.utils.sheet_to_json(ws, {
    header: 1,      // array of arrays
    defval: "",
    blankrows: false,
  });

  if (filas.length < 2) {
    return { registros: [], erroresFormato: ["El archivo no tiene datos. Usa la plantilla oficial."] };
  }

  // La fila 0 son los encabezados — mapeamos por posición
  const campoPorColumna = COLUMNAS.map((c) => c.campo);
  const erroresFormato  = [];
  const registros       = [];

  // Empezar desde fila índice 1 (saltar encabezado)
  for (let i = 1; i < filas.length; i++) {
    const fila    = filas[i];
    const nroFila = i + 1; // para mensajes (Excel usa 1-indexed)

    // Saltar fila completamente vacía
    if (fila.every((c) => String(c).trim() === "")) continue;

    // Saltar fila de ejemplo (si el primer campo dice "POL-0001" y el tercero "Carlos")
    const esEjemplo =
      String(fila[0]).trim() === "POL-0001" &&
      String(fila[2]).trim() === "Carlos";
    if (esEjemplo) continue;

    // Construir objeto
    const obj = {};
    campoPorColumna.forEach((campo, ci) => {
      obj[campo] = String(fila[ci] ?? "").trim();
    });

    // Validaciones básicas
    const obligatorios = ["numero_empleado", "categoria", "nombre", "apellidos",
                          "fecha_nacimiento", "tipo_sangre", "fecha_ingreso"];
    const faltantes = obligatorios.filter((c) => !obj[c]);

    if (faltantes.length > 0) {
      erroresFormato.push(`Fila ${nroFila}: faltan campos obligatorios (${faltantes.join(", ")})`);
      continue;
    }

    if (!["Preventiva", "Vial"].includes(obj.categoria)) {
      erroresFormato.push(`Fila ${nroFila}: Categoría debe ser "Preventiva" o "Vial", se encontró "${obj.categoria}"`);
      continue;
    }

    const sangresValidas = ["O+","O-","A+","A-","B+","B-","AB+","AB-"];
    if (!sangresValidas.includes(obj.tipo_sangre)) {
      erroresFormato.push(`Fila ${nroFila}: Tipo de sangre inválido "${obj.tipo_sangre}"`);
      continue;
    }

    registros.push({
      ...obj,
      activo:    true,
      nota_baja: "",
      foto:      null,
    });
  }

  return { registros, erroresFormato };
}
