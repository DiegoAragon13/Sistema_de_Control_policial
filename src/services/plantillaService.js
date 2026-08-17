/**
 * plantillaService.js
 *
 * Genera la plantilla .xlsx con exceljs:
 *   - Columna A: foto (el comandante inserta imagen en cada celda)
 *   - Columnas B+: datos del agente
 *
 * Parsea el .xlsx llenado:
 *   - Extrae imágenes por fila y las convierte a base64
 *   - Retorna registros listos para importar con foto incluida
 */

// Lazy load — exceljs pesa ~1MB, solo se carga al usarse
let _ExcelJS = null;
async function getExcelJS() {
  if (!_ExcelJS) _ExcelJS = (await import("exceljs")).default;
  return _ExcelJS;
}

import { guardarExcel } from "./excelDialogService";
import { invoke } from "./tauriInvoke";

// ── Definición de columnas (sin la foto, que va en col A) ─────────────────────
const COLS = [
  { campo: "numero_empleado",     titulo: "No. Empleado *",        ejemplo: "POL-0001",          ancho: 14 },
  { campo: "categoria",           titulo: "Categoría *",           ejemplo: "Preventiva",         ancho: 13 },
  { campo: "nombre",              titulo: "Nombre(s) *",           ejemplo: "Carlos",             ancho: 18 },
  { campo: "apellidos",           titulo: "Apellidos *",           ejemplo: "Hernández López",    ancho: 22 },
  { campo: "fecha_nacimiento",    titulo: "Fecha Nacimiento *",    ejemplo: "1985-03-15",         ancho: 16 },
  { campo: "tipo_sangre",         titulo: "Tipo Sangre *",         ejemplo: "O+",                 ancho: 11 },
  { campo: "escolaridad",         titulo: "Escolaridad",           ejemplo: "Licenciatura",       ancho: 20 },
  { campo: "direccion",           titulo: "Dirección",             ejemplo: "Av. Juárez #245",    ancho: 28 },
  { campo: "telefono",            titulo: "Teléfono",              ejemplo: "614-123-4567",       ancho: 15 },
  { campo: "telefono_emergencia", titulo: "Tel. Emergencia",       ejemplo: "614-987-6543",       ancho: 15 },
  { campo: "fecha_ingreso",       titulo: "Fecha Ingreso *",       ejemplo: "2010-06-01",         ancho: 14 },
  { campo: "rfc",                 titulo: "RFC",                   ejemplo: "HELC850315AB1",      ancho: 16 },
  { campo: "curp",                titulo: "CURP",                  ejemplo: "HELC850315HCHRLR08", ancho: 22 },
  { campo: "clave_ine",           titulo: "Clave INE",             ejemplo: "HRLC8503152H1234",  ancho: 18 },
  { campo: "licencia_conducir",   titulo: "Licencia Conducir",     ejemplo: "CHI12345678",        ancho: 16 },
  { campo: "cuip",                titulo: "CUIP (opcional)",       ejemplo: "CUP-001234",         ancho: 14 },
];

// Columna A siempre es la foto. Los datos empiezan en B (índice 2 en exceljs).
const FOTO_COL   = 1; // columna A
const DATOS_START = 2; // columna B

// ── Generar plantilla ─────────────────────────────────────────────────────────

export async function descargarPlantilla() {
  const ExcelJS = await getExcelJS();
  const wb      = new ExcelJS.Workbook();
  wb.creator    = "SICOP";
  wb.created    = new Date();

  const ws = wb.addWorksheet("Personal", {
    pageSetup: { paperSize: 9, orientation: "landscape" },
  });

  // ── Fila 1: Título general ──
  ws.mergeCells(1, 1, 1, COLS.length + 1);
  const tituloCell = ws.getCell(1, 1);
  tituloCell.value = "DIRECCIÓN MUNICIPAL DE SEGURIDAD PÚBLICA — Plantilla de Personal SICOP";
  tituloCell.font  = { bold: true, size: 12, color: { argb: "FF111844" } };
  tituloCell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEAE0CF" } };
  tituloCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(1).height = 24;

  // ── Fila 2: Encabezados ──
  const headerRow = ws.getRow(2);
  headerRow.height = 36;

  // Columna A: encabezado Foto
  const fotoHeader = ws.getCell(2, FOTO_COL);
  fotoHeader.value = "FOTO *\n(inserta imagen\nen esta celda)";
  fotoHeader.font  = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
  fotoHeader.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FF111844" } };
  fotoHeader.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  fotoHeader.border = {
    top: { style: "medium", color: { argb: "FF4B5694" } },
    left: { style: "medium", color: { argb: "FF4B5694" } },
    bottom: { style: "medium", color: { argb: "FF4B5694" } },
    right: { style: "medium", color: { argb: "FF4B5694" } },
  };
  ws.getColumn(FOTO_COL).width = 16;

  // Columnas de datos
  COLS.forEach((col, i) => {
    const colIdx = DATOS_START + i;
    const cell   = ws.getCell(2, colIdx);
    cell.value   = col.titulo;
    cell.font    = { bold: true, size: 9, color: { argb: "FFFFFFFF" } };
    cell.fill    = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4B5694" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border  = {
      top:    { style: "thin", color: { argb: "FF7288AE" } },
      left:   { style: "thin", color: { argb: "FF7288AE" } },
      bottom: { style: "thin", color: { argb: "FF7288AE" } },
      right:  { style: "thin", color: { argb: "FF7288AE" } },
    };
    ws.getColumn(colIdx).width = col.ancho;
  });

  // ── Fila 3: Fila de ejemplo (gris claro) ──
  const ejRow = ws.getRow(3);
  ejRow.height = 80; // altura para que se vea la foto

  // Celda de foto en ejemplo
  const fotoEjCell = ws.getCell(3, FOTO_COL);
  fotoEjCell.value = "← Inserta\nla foto aquí\n(doble clic\nen la celda)";
  fotoEjCell.font  = { size: 8, italic: true, color: { argb: "FF64748B" } };
  fotoEjCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  fotoEjCell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF7F8FC" } };
  fotoEjCell.border = {
    top:    { style: "dashed", color: { argb: "FFADB5BD" } },
    left:   { style: "dashed", color: { argb: "FFADB5BD" } },
    bottom: { style: "dashed", color: { argb: "FFADB5BD" } },
    right:  { style: "dashed", color: { argb: "FFADB5BD" } },
  };

  // Datos de ejemplo
  COLS.forEach((col, i) => {
    const cell   = ws.getCell(3, DATOS_START + i);
    cell.value   = col.ejemplo;
    cell.font    = { size: 9, color: { argb: "FF94A3B8" }, italic: true };
    cell.fill    = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F9FD" } };
    cell.alignment = { vertical: "middle" };
  });

  // ── Filas 4-23: 20 filas vacías para llenar ──
  for (let r = 4; r <= 23; r++) {
    const row    = ws.getRow(r);
    row.height   = 80;

    // Celda de foto
    const fc = ws.getCell(r, FOTO_COL);
    fc.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: r % 2 === 0 ? "FFFFFFFF" : "FFFAFBFE" } };
    fc.border = {
      top:    { style: "hair", color: { argb: "FFE4E7ED" } },
      left:   { style: "thin", color: { argb: "FFADB5BD" } },
      bottom: { style: "hair", color: { argb: "FFE4E7ED" } },
      right:  { style: "thin", color: { argb: "FFADB5BD" } },
    };
    fc.alignment = { horizontal: "center", vertical: "middle" };

    // Celdas de datos
    COLS.forEach((_, i) => {
      const cell = ws.getCell(r, DATOS_START + i);
      cell.fill  = { type: "pattern", pattern: "solid", fgColor: { argb: r % 2 === 0 ? "FFFFFFFF" : "FFFAFBFE" } };
      cell.border = {
        top:    { style: "hair", color: { argb: "FFE4E7ED" } },
        left:   { style: "hair", color: { argb: "FFE4E7ED" } },
        bottom: { style: "hair", color: { argb: "FFE4E7ED" } },
        right:  { style: "hair", color: { argb: "FFE4E7ED" } },
      };
      cell.alignment = { vertical: "middle" };
      cell.font = { size: 10 };
    });
  }

  // Fijar filas 1 y 2 (encabezados siempre visibles al hacer scroll)
  ws.views = [{ state: "frozen", xSplit: 0, ySplit: 2 }];

  // ── Hoja de instrucciones ──
  const wsInst = wb.addWorksheet("Instrucciones");
  const instrucciones = [
    ["INSTRUCCIONES — Plantilla de Personal — Dirección Municipal de Seguridad Pública"],
    [""],
    ["FOTO:"],
    ["  1. Haz clic en la celda de la columna A de la fila del agente"],
    ["  2. Ve a Insertar → Imagen → Este dispositivo"],
    ["  3. Selecciona la foto del agente"],
    ["  4. Ajusta el tamaño para que quede dentro de la celda"],
    ["  5. Asegúrate que la imagen esté anclada a la celda (clic derecho → Formato de imagen → Propiedades → Mover y ajustar tamaño con celdas)"],
    [""],
    ["DATOS:"],
    ["  - Llena a partir de la fila 4 (la fila 3 es solo ejemplo, puedes borrarla)"],
    ["  - No modifiques las filas 1 y 2 (encabezados)"],
    ["  - Los campos con * son obligatorios"],
    ["  - Categoría: exactamente 'Preventiva' o 'Vial'"],
    ["  - Tipo Sangre: O+  O-  A+  A-  B+  B-  AB+  AB-"],
    ["  - Fechas: YYYY-MM-DD  (ejemplo: 1985-03-15)"],
    ["  - No. Empleado: único por agente (POL-0001, VIA-0001, etc.)"],
    [""],
    ["Si un número de empleado ya existe en el sistema se omite sin error."],
  ];
  wsInst.addRows(instrucciones);
  wsInst.getColumn(1).width = 90;
  wsInst.getRow(1).font = { bold: true, size: 12 };
  wsInst.getRow(3).font = { bold: true };
  wsInst.getRow(10).font = { bold: true };

  // Generar buffer y guardar con diálogo
  const buffer  = await wb.xlsx.writeBuffer();
  const uint8   = new Uint8Array(buffer);
  const b64     = uint8ToBase64(uint8);
  const fecha   = new Date().toISOString().slice(0, 10);

  if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
    await invoke("cmd_guardar_archivo", {
      input: {
        nombre_sugerido: `Plantilla_Personal_SICOP_${fecha}.xlsx`,
        titulo:          "Guardar plantilla de personal",
        extension:       "xlsx",
        contenido_b64:   b64,
      },
    });
    return;
  }

  // Browser fallback
  const blob = new Blob([uint8], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `Plantilla_Personal_SICOP_${fecha}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Parsear archivo llenado ───────────────────────────────────────────────────

/**
 * Lee el .xlsx llenado, extrae datos e imágenes por fila.
 * Las imágenes se asocian a la fila por su posición de ancla en la hoja.
 *
 * @param {File} archivo
 * @returns {Promise<{registros: Array, erroresFormato: string[]}>}
 */
export async function parsearExcel(archivo) {
  const ExcelJS = await getExcelJS();

  const buffer  = await archivo.arrayBuffer();
  const wb      = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const ws = wb.worksheets[0];
  if (!ws) return { registros: [], erroresFormato: ["El archivo no tiene hojas."] };

  // ── Construir mapa de imágenes: fila → base64 ──
  // exceljs ws.getImages() no detecta imágenes flotantes normales de Excel.
  // Leemos el ZIP directamente para extraerlas con precisión.
  const fotosPorFila = await extraerFotosPorFila(buffer);
  console.log(`[SICOP Import] fotosPorFila keys:`, Object.keys(fotosPorFila));

  const erroresFormato = [];
  const registros      = [];

  // Las filas de datos empiezan en la 4 (índice 3, base 1)
  // Fila 1: título, fila 2: encabezado, fila 3: ejemplo
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber <= 3) return; // saltar encabezados y ejemplo

    // Leer cada campo por posición de columna
    const get = (colOffset) => {
      const val = row.getCell(DATOS_START + colOffset).value;
      if (val === null || val === undefined) return "";
      // Si Excel devuelve un Date object, convertir a YYYY-MM-DD
      if (val instanceof Date) {
        const y = val.getFullYear();
        const m = String(val.getMonth() + 1).padStart(2, "0");
        const d = String(val.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      }
      return String(val).trim();
    };

    const obj = {};
    COLS.forEach((col, i) => { obj[col.campo] = get(i); });

    // Saltar fila completamente vacía
    if (COLS.every((col) => !obj[col.campo])) return;

    // Validaciones obligatorias
    const obligatorios = ["numero_empleado", "categoria", "nombre", "apellidos",
                          "fecha_nacimiento", "tipo_sangre", "fecha_ingreso"];
    const faltantes = obligatorios.filter((c) => !obj[c]);
    if (faltantes.length > 0) {
      erroresFormato.push(`Fila ${rowNumber}: faltan campos (${faltantes.join(", ")})`);
      return;
    }

    if (!["Preventiva", "Vial"].includes(obj.categoria)) {
      erroresFormato.push(`Fila ${rowNumber}: Categoría inválida "${obj.categoria}"`);
      return;
    }

    const sangresValidas = ["O+","O-","A+","A-","B+","B-","AB+","AB-"];
    if (!sangresValidas.includes(obj.tipo_sangre)) {
      erroresFormato.push(`Fila ${rowNumber}: Tipo de sangre inválido "${obj.tipo_sangre}"`);
      return;
    }

    // Asociar foto — clave es fila Excel 1-indexed
    const fotoB64 = fotosPorFila[rowNumber] || null;

    registros.push({
      ...obj,
      activo:    true,
      nota_baja: "",
      foto:      fotoB64,
    });
  });

  return { registros, erroresFormato };
}

// ── helpers ───────────────────────────────────────────────────────────────────

function uint8ToBase64(uint8) {
  let binary = "";
  for (let i = 0; i < uint8.byteLength; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary);
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  return uint8ToBase64(bytes);
}

// ── Extracción de fotos desde el ZIP del .xlsx ────────────────────────────────
/**
 * Lee el .xlsx como ZIP y extrae las imágenes.
 * Approach robusto:
 *   1. Busca TODOS los archivos drawing*.xml dentro del ZIP
 *   2. Si no hay drawings, busca imágenes en xl/media/ y las asigna por orden a las filas
 *   3. Si hay drawings, parsea las anclas para mapear imagen → fila
 *
 * @param {ArrayBuffer} xlsxBuffer
 * @returns {Promise<Object>} { [filaExcel1indexed]: base64string }
 */
async function extraerFotosPorFila(xlsxBuffer) {
  let JSZip;
  try {
    const mod = await import("jszip");
    JSZip = mod.default || mod;
  } catch {
    console.warn("[SICOP Import] JSZip no disponible");
    return {};
  }

  const zip = await JSZip.loadAsync(xlsxBuffer);
  const result = {};

  // Listar todo lo que hay en el ZIP para debug
  const allFiles = Object.keys(zip.files);
  console.log("[SICOP Import] Archivos en el ZIP:", allFiles.filter(f => !f.endsWith("/")));

  // ── Buscar imágenes en xl/media/ ──
  const mediaFiles = allFiles.filter(f => /^xl\/media\/image\d+\.\w+$/i.test(f)).sort();
  console.log("[SICOP Import] Imágenes en xl/media/:", mediaFiles);

  if (mediaFiles.length === 0) {
    console.log("[SICOP Import] No hay imágenes en xl/media/");
    return {};
  }

  // ── Buscar drawings para mapear imágenes a filas ──
  const drawingFiles = allFiles.filter(f => /^xl\/drawings\/drawing\d+\.xml$/i.test(f));
  console.log("[SICOP Import] Drawing files:", drawingFiles);

  // Intentar extraer el mapeo imagen→fila desde el drawing XML
  let imageToRow = {}; // imagePath → filaExcel (1-indexed)

  if (drawingFiles.length > 0) {
    for (const drawingPath of drawingFiles) {
      const drawingXml = await zip.file(drawingPath).async("string");
      console.log("[SICOP Import] Parseando:", drawingPath, "longitud:", drawingXml.length);

      // Buscar el .rels correspondiente
      const drawingBase = drawingPath.split("/").pop();
      const relsPath    = `xl/drawings/_rels/${drawingBase}.rels`;
      const relsFile    = zip.file(relsPath);

      const imageRels = {}; // rId → ruta completa
      if (relsFile) {
        const relsXml = await relsFile.async("string");
        const relRegex = /Id="([^"]+)"[^>]*Target="([^"]+)"/g;
        let m;
        while ((m = relRegex.exec(relsXml)) !== null) {
          let target = m[2];
          // Resolver rutas relativas
          if (target.startsWith("../")) {
            target = "xl/" + target.substring(3);
          } else if (!target.startsWith("xl/")) {
            target = "xl/drawings/" + target;
          }
          imageRels[m[1]] = target;
        }
        console.log("[SICOP Import] imageRels:", imageRels);
      }

      // Parsear anchors — buscar <xdr:from><xdr:row>N + r:embed="rIdX"
      // Regex más permisivo que captura cualquier anchor type
      const anchorBlocks = drawingXml.split(/<\/xdr:(?:twoCellAnchor|oneCellAnchor|absoluteAnchor)>/);

      for (const block of anchorBlocks) {
        // Buscar la fila del <from>
        const fromRowMatch = /<xdr:from>[\s\S]*?<xdr:row>(\d+)<\/xdr:row>/.exec(block);
        // Buscar el embed rId
        const embedMatch = /r:embed="([^"]+)"/.exec(block);

        if (fromRowMatch && embedMatch) {
          const fila0indexed = parseInt(fromRowMatch[1]);
          const filaExcel    = fila0indexed + 1;
          const rId          = embedMatch[1];
          const imagePath    = imageRels[rId];

          if (imagePath) {
            imageToRow[imagePath] = filaExcel;
            console.log(`[SICOP Import] Mapeado: ${imagePath} → fila ${filaExcel}`);
          }
        }
      }
    }
  }

  // ── Leer las imágenes y asignarlas ──
  const tieneMapeo = Object.keys(imageToRow).length > 0;

  if (tieneMapeo) {
    // Usar el mapeo drawing → fila
    for (const [imagePath, filaExcel] of Object.entries(imageToRow)) {
      const imgFile = zip.file(imagePath);
      if (!imgFile) continue;
      const imgBytes = await imgFile.async("uint8array");
      const b64 = uint8ToBase64(imgBytes);
      result[filaExcel] = b64;
      console.log(`[SICOP Import] Foto extraída para fila ${filaExcel} (${imgBytes.length} bytes)`);
    }
  } else {
    // Fallback: no hay mapeo de drawing → asignar imágenes por orden a filas de datos
    // Las filas de datos empiezan en fila 4 (después de título, encabezado, ejemplo)
    console.log("[SICOP Import] Sin mapeo de drawing, asignando por orden de aparición");
    for (let i = 0; i < mediaFiles.length; i++) {
      const imgFile  = zip.file(mediaFiles[i]);
      if (!imgFile) continue;
      const imgBytes = await imgFile.async("uint8array");
      const b64      = uint8ToBase64(imgBytes);
      const filaExcel = 4 + i; // fila 4 es la primera fila de datos
      result[filaExcel] = b64;
      console.log(`[SICOP Import] Foto ${i + 1} asignada a fila ${filaExcel} (${imgBytes.length} bytes)`);
    }
  }

  return result;
}
