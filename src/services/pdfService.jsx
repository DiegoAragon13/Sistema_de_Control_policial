/**
 * pdfService.js
 * Genera el PDF de perfil de un elemento usando @react-pdf/renderer.
 * Incluye la marca de agua de la estrella institucional.
 *
 * Estructura del PDF:
 *   - Encabezado: logo + nombre de la corporación
 *   - Foto del elemento (si tiene) centrada arriba
 *   - Datos personales, laborales y documentos en bloques
 *   - Marca de agua: Estrella Seguridad.png al 8% de opacidad
 *   - Pie de página con fecha y número de empleado
 */

import {
  pdf,
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import estrellaUrl from "../assets/Estrella Seguridad.png";
import { invoke } from "../lib/tauri";

// ── Paleta de colores ──────────────────────────────────────────────────────
const AZUL_OSCURO = "#111844";
const AZUL_MEDIO  = "#4B5694";
const AZUL_CLARO  = "#7288AE";
const GRIS_TEXTO  = "#64748b";
const GRIS_BORDE  = "#e4e7ed";
const BLANCO      = "#ffffff";

// ── Estilos ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    backgroundColor: BLANCO,
    padding: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1e293b",
    position: "relative",
  },

  // ── Marca de agua ──
  watermark: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: 340,
    height: 340,
    transform: "translate(-170, -170)",
    opacity: 0.06,
  },

  // ── Encabezado ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: AZUL_OSCURO,
    paddingBottom: 10,
    marginBottom: 16,
    gap: 12,
  },
  headerLogo: {
    width: 44,
    height: 44,
  },
  headerTexts: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: AZUL_OSCURO,
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 9,
    color: GRIS_TEXTO,
    marginTop: 2,
  },
  headerNumEmpleado: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: AZUL_MEDIO,
    alignSelf: "flex-end",
  },

  // ── Foto del elemento ──
  fotoSection: {
    alignItems: "center",
    marginBottom: 18,
  },
  fotoContainer: {
    width: 110,
    height: 130,
    borderWidth: 1.5,
    borderColor: GRIS_BORDE,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#f7f8fc",
    alignItems: "center",
    justifyContent: "center",
  },
  fotoImg: {
    width: 110,
    height: 130,
    objectFit: "cover",
  },
  fotoPlaceholderText: {
    fontSize: 9,
    color: GRIS_TEXTO,
    textAlign: "center",
  },
  nombreCompleto: {
    fontSize: 15,
    fontFamily: "Helvetica-Bold",
    color: AZUL_OSCURO,
    marginTop: 8,
    textAlign: "center",
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    justifyContent: "center",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  badgePreventiva: {
    color: AZUL_OSCURO,
  },
  badgeVial: {
    color: AZUL_CLARO,
  },
  badgeActivo: {
    color: "#065f46",
  },
  badgeBaja: {
    color: "#991b1b",
  },

  // ── Secciones de datos ──
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: AZUL_MEDIO,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: GRIS_BORDE,
    paddingBottom: 4,
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
  },
  campo: {
    width: "50%",
    paddingRight: 12,
    marginBottom: 7,
  },
  campoFullWidth: {
    width: "100%",
    marginBottom: 7,
  },
  campoLabel: {
    fontSize: 7.5,
    color: GRIS_TEXTO,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  campoValor: {
    fontSize: 9.5,
    color: "#1e293b",
  },
  campoVacio: {
    fontSize: 9.5,
    color: "#b0b8c4",
    fontStyle: "italic",
  },

  // ── Nota de baja ──
  bajaBanner: {
    backgroundColor: "rgba(239,68,68,0.06)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
    borderRadius: 4,
    padding: 8,
    marginBottom: 14,
  },
  bajaTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#991b1b",
    marginBottom: 3,
  },
  bajaNota: {
    fontSize: 9,
    color: "#b91c1c",
  },

  // ── Firmas ──
  firmasSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: GRIS_BORDE,
  },
  firmaItem: {
    alignItems: "center",
    width: 140,
  },
  firmaLinea: {
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    width: 130,
    marginBottom: 4,
  },
  firmaLabel: {
    fontSize: 8,
    color: GRIS_TEXTO,
    textAlign: "center",
  },

  // ── Pie de página ──
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: GRIS_BORDE,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7.5,
    color: GRIS_TEXTO,
  },
});

// ── Helpers ───────────────────────────────────────────────────────────────

function Campo({ label, valor, fullWidth = false }) {
  const esVacio = !valor || String(valor).trim() === "";
  return (
    <View style={fullWidth ? s.campoFullWidth : s.campo}>
      <Text style={s.campoLabel}>{label}</Text>
      <Text style={esVacio ? s.campoVacio : s.campoValor}>
        {esVacio ? "—" : valor}
      </Text>
    </View>
  );
}

// ── Componente PDF ────────────────────────────────────────────────────────

function PerfilPDF({ persona }) {
  const fotoSrc = persona.foto
    ? `data:image/jpeg;base64,${persona.foto}`
    : null;

  const fechaGeneracion = new Date().toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <Document
      title={`Perfil — ${persona.nombre} ${persona.apellidos}`}
      author="SICOP"
      subject="Expediente de Personal"
    >
      <Page size="LETTER" style={s.page}>

        {/* ── Marca de agua ── */}
        <Image src={estrellaUrl} style={s.watermark} />

        {/* ── Encabezado ── */}
        <View style={s.header}>
          <Image src={estrellaUrl} style={s.headerLogo} />
          <View style={s.headerTexts}>
            <Text style={s.headerTitle}>DIRECCIÓN MUNICIPAL DE SEGURIDAD PÚBLICA</Text>
            <Text style={s.headerSub}>Sistema de Control de Personal — SICOP</Text>
          </View>
          <Text style={s.headerNumEmpleado}>{persona.numero_empleado}</Text>
        </View>

        {/* ── Banner de baja ── */}
        {persona.activo === false && (
          <View style={s.bajaBanner}>
            <Text style={s.bajaTitle}>⚠ ELEMENTO DADO DE BAJA</Text>
            {persona.nota_baja && <Text style={s.bajaNota}>{persona.nota_baja}</Text>}
          </View>
        )}

        {/* ── Foto + nombre ── */}
        <View style={s.fotoSection}>
          <View style={s.fotoContainer}>
            {fotoSrc ? (
              <Image src={fotoSrc} style={s.fotoImg} />
            ) : (
              <Text style={s.fotoPlaceholderText}>Sin fotografía</Text>
            )}
          </View>
          <Text style={s.nombreCompleto}>
            {persona.nombre} {persona.apellidos}
          </Text>
          <View style={s.badgeRow}>
            <Text style={[s.badge, persona.categoria === "Preventiva" ? s.badgePreventiva : s.badgeVial]}>
              {persona.categoria}
            </Text>
            <Text style={[s.badge, persona.activo === false ? s.badgeBaja : s.badgeActivo]}>
              {persona.activo === false ? "BAJA" : "ACTIVO"}
            </Text>
          </View>
        </View>

        {/* ── Datos Personales ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Datos Personales</Text>
          <View style={s.grid}>
            <Campo label="Fecha de Nacimiento" valor={persona.fecha_nacimiento} />
            <Campo label="Tipo de Sangre"      valor={persona.tipo_sangre} />
            <Campo label="Escolaridad"          valor={persona.escolaridad} />
            <Campo label="Teléfono"             valor={persona.telefono} />
            <Campo label="Teléfono Emergencia"  valor={persona.telefono_emergencia} />
            <Campo label="Dirección"            valor={persona.direccion} fullWidth />
          </View>
        </View>

        {/* ── Datos Laborales ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Datos Laborales</Text>
          <View style={s.grid}>
            <Campo label="Categoría"        valor={persona.categoria} />
            <Campo label="Fecha de Ingreso" valor={persona.fecha_ingreso} />
            <Campo label="Núm. Empleado"    valor={persona.numero_empleado} />
          </View>
        </View>

        {/* ── Documentos de Identidad ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Documentos de Identidad</Text>
          <View style={s.grid}>
            <Campo label="RFC"                     valor={persona.rfc} />
            <Campo label="CURP"                    valor={persona.curp} />
            <Campo label="Clave INE"               valor={persona.clave_ine} />
            <Campo label="Licencia de Conducir"    valor={persona.licencia_conducir} />
            <Campo label="CUIP"
              valor={persona.cuip || (persona.categoria === "Vial" ? "No aplica" : "")} />
          </View>
        </View>

        {/* ── Pie de página ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>DIRECCIÓN MUNICIPAL DE SEGURIDAD PÚBLICA — SICOP</Text>
          <Text style={s.footerText}>Generado: {fechaGeneracion}</Text>
        </View>

      </Page>
    </Document>
  );
}

// ── Función pública ───────────────────────────────────────────────────────

/**
 * Genera y guarda el PDF del perfil.
 * En Tauri: llama cmd_guardar_archivo (Rust abre el diálogo nativo).
 * En browser: descarga directamente.
 */
export async function generarPDFPerfil(persona) {
  const blob   = await pdf(<PerfilPDF persona={persona} />).toBlob();
  const buffer = await blob.arrayBuffer();
  const uint8  = new Uint8Array(buffer);

  const nombreSugerido = `Perfil_${persona.numero_empleado}_${persona.nombre}_${persona.apellidos}.pdf`
    .replace(/\s+/g, "_");

  if (typeof window !== "undefined" && window.__TAURI_INTERNALS__) {
    // Convertir a base64 y mandar a Rust
    let binary = "";
    for (let i = 0; i < uint8.byteLength; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const b64 = btoa(binary);

    await invoke("cmd_guardar_archivo", {
      input: {
        nombre_sugerido: nombreSugerido,
        titulo:          "Guardar perfil PDF",
        extension:       "pdf",
        contenido_b64:   b64,
      },
    });
    return;
  }

  // Browser fallback
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = nombreSugerido;
  link.click();
  URL.revokeObjectURL(url);
}
