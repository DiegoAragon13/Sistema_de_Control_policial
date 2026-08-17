// commands/sync.rs — Exportación .sicop cifrada con AES-256-GCM
use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use aes_gcm::aead::rand_core::RngCore;
use base64::{Engine as _, engine::general_purpose::STANDARD as B64};
use chrono::Local;
use serde::{Deserialize, Serialize};
use std::{fs, io::Read};
use tauri::State;

use crate::AppState;
use crate::db::get_db_path;

// Clave AES-256 derivada de una passphrase fija del sistema.
// En producción esto vendría de un secreto almacenado de forma segura.
// 32 bytes exactos para AES-256.
const SICOP_KEY: &[u8; 32] = b"SICOP_SEG_PUB_KEY_2026_CHIHUAHUA";

#[derive(Serialize, Deserialize)]
struct SicopHeader {
    version: u8,       // versión del formato del archivo
    version_db: i64,   // versión de la base de datos
    fecha: String,     // fecha de exportación ISO 8601
    nonce: String,     // nonce AES-GCM en base64
}

/// Exporta la DB cifrada como archivo .sicop
/// Abre diálogo nativo de guardar y retorna la ruta del archivo generado
#[tauri::command]
pub fn cmd_exportar_sicop(
    app: tauri::AppHandle,
    state: State<AppState>,
) -> Result<Option<String>, String> {
    use tauri_plugin_dialog::DialogExt;

    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Obtener versión actual
    let version_db: i64 = conn
        .query_row("SELECT version_db FROM meta WHERE id = 1", [], |r| r.get(0))
        .map_err(|e| e.to_string())?;

    // Actualizar fecha de exportación
    let fecha = Local::now().format("%Y-%m-%dT%H:%M:%S").to_string();
    conn.execute(
        "UPDATE meta SET fecha_exportacion = ?1 WHERE id = 1",
        [&fecha],
    ).map_err(|e| e.to_string())?;

    // Soltar el lock antes de leer el archivo de DB
    drop(conn);

    // Leer el archivo .db completo
    let db_path = get_db_path(&app);
    let mut db_bytes = Vec::new();
    fs::File::open(&db_path)
        .map_err(|e| format!("No se pudo abrir la DB: {}", e))?
        .read_to_end(&mut db_bytes)
        .map_err(|e| format!("Error al leer la DB: {}", e))?;

    // Cifrar con AES-256-GCM
    let key = Key::<Aes256Gcm>::from_slice(SICOP_KEY);
    let cipher = Aes256Gcm::new(key);

    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, db_bytes.as_ref())
        .map_err(|e| format!("Error al cifrar: {}", e))?;

    // Construir el header
    let header = SicopHeader {
        version: 1,
        version_db,
        fecha: fecha.clone(),
        nonce: B64.encode(nonce_bytes),
    };
    let header_json = serde_json::to_vec(&header)
        .map_err(|e| e.to_string())?;

    // Formato del archivo .sicop:
    // [4 bytes: longitud del header] [header JSON] [ciphertext]
    let header_len = header_json.len() as u32;
    let mut output = Vec::new();
    output.extend_from_slice(&header_len.to_le_bytes());
    output.extend_from_slice(&header_json);
    output.extend_from_slice(&ciphertext);

    // Abrir diálogo nativo de guardar
    let nombre_sugerido = format!("sicop_v{}_{}.sicop", version_db, &fecha[..10]);

    let ruta = app
        .dialog()
        .file()
        .set_title("Guardar archivo .sicop para móvil")
        .set_file_name(&nombre_sugerido)
        .add_filter("SICOP", &["sicop"])
        .blocking_save_file();

    let destino = match ruta {
        Some(r) => r.into_path().map_err(|e| format!("Ruta inválida: {}", e))?,
        None => return Ok(None), // usuario canceló
    };

    fs::write(&destino, &output)
        .map_err(|e| format!("No se pudo escribir el archivo: {}", e))?;

    Ok(Some(destino.to_string_lossy().to_string()))
}

/// Obtiene la info de versión de la DB actual
#[tauri::command]
pub fn cmd_get_meta(state: State<AppState>) -> Result<crate::models::MetaInfo, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT version_db, fecha_exportacion, creado_en FROM meta WHERE id = 1",
        [],
        |row| {
            Ok(crate::models::MetaInfo {
                version_db:       row.get(0)?,
                fecha_exportacion: row.get(1)?,
                creado_en:        row.get(2)?,
            })
        },
    ).map_err(|e| e.to_string())
}
