// models.rs — Structs que viajan entre Rust y JavaScript (via JSON)
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Persona {
    pub id: i64,
    pub activo: bool,
    pub nota_baja: String,
    pub categoria: String,
    pub nombre: String,
    pub apellidos: String,
    pub fecha_nacimiento: String,
    pub tipo_sangre: String,
    pub escolaridad: String,
    pub direccion: String,
    pub telefono: String,
    pub telefono_emergencia: String,
    pub numero_empleado: String,
    pub fecha_ingreso: String,
    pub rfc: String,
    pub curp: String,
    pub cuip: String,
    pub clave_ine: String,
    pub licencia_conducir: String,
    /// Foto en base64 para el frontend (None si no tiene foto)
    pub foto: Option<String>,
    pub creado_en: String,
    pub actualizado_en: String,
}

/// Payload para crear o actualizar — sin id ni timestamps
#[derive(Debug, Deserialize)]
pub struct PersonaInput {
    pub activo: Option<bool>,
    pub nota_baja: Option<String>,
    pub categoria: String,
    pub nombre: String,
    pub apellidos: String,
    pub fecha_nacimiento: String,
    pub tipo_sangre: String,
    pub escolaridad: String,
    pub direccion: String,
    pub telefono: String,
    pub telefono_emergencia: String,
    pub numero_empleado: String,
    pub fecha_ingreso: String,
    pub rfc: String,
    pub curp: String,
    pub cuip: String,
    pub clave_ine: String,
    pub licencia_conducir: String,
    /// Foto como base64 string (opcional)
    pub foto: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MetaInfo {
    pub version_db: i64,
    pub fecha_exportacion: Option<String>,
    pub creado_en: String,
}

#[derive(Debug, Serialize)]
pub struct ImportResult {
    pub importados: usize,
    pub errores: Vec<String>,
}
