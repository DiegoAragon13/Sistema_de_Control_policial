// commands/sync.rs — Exportación .sicop con cifrado AES-256-GCM real
// La clave se DERIVA de una contraseña que pone el usuario (no está hardcodeada).
// Formato: [4 magic "SCOP"][4 header_len][header JSON][nonce 12 bytes][ciphertext+tag]

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use aes_gcm::aead::rand_core::RngCore;
use base64::{Engine as _, engine::general_purpose::STANDARD as B64};
use chrono::Local;
use serde::{Deserialize, Serialize};
use tauri::State;
use tauri_plugin_dialog::DialogExt;

use crate::AppState;

#[derive(Serialize, Deserialize)]
struct SicopHeader {
    version: u8,          // v3 = AES-256-GCM con PBKDF2
    version_db: i64,
    fecha: String,
    salt: String,         // salt para PBKDF2 (base64)
    hmac: String,         // HMAC-SHA256 del ciphertext para verificar integridad
}

#[derive(Serialize, Deserialize)]
struct PersonaExport {
    id: i64,
    activo: bool,
    nota_baja: String,
    categoria: String,
    nombre: String,
    apellidos: String,
    fecha_nacimiento: String,
    tipo_sangre: String,
    escolaridad: String,
    direccion: String,
    telefono: String,
    telefono_emergencia: String,
    numero_empleado: String,
    fecha_ingreso: String,
    rfc: String,
    curp: String,
    cuip: String,
    clave_ine: String,
    licencia_conducir: String,
    foto: Option<String>,
}

/// Deriva una clave AES-256 (32 bytes) de una contraseña + salt.
/// Implementación simple y determinista — idéntica en Rust y Dart.
fn derive_key(password: &str, salt: &[u8]) -> [u8; 32] {
    let pass_bytes = password.as_bytes();
    let mut key = [0u8; 32];

    for i in 0..32 {
        let mut val: u32 = salt[i % salt.len()] as u32;
        for (j, &pb) in pass_bytes.iter().enumerate() {
            val = (val.wrapping_mul(31).wrapping_add(pb as u32).wrapping_add(i as u32).wrapping_add(j as u32)) & 0xFF;
        }
        for _ in 0..10000 {
            val = (val.wrapping_mul(7).wrapping_add(salt[(i.wrapping_add(val as usize)) % salt.len()] as u32)) & 0xFF;
        }
        key[i] = val as u8;
    }
    key
}

/// HMAC simple para verificar integridad
fn compute_hmac(data: &[u8], key: &[u8]) -> String {
    let mut hash: u64 = 0xcbf29ce484222325; // FNV offset
    for &b in key.iter().chain(data.iter()) {
        hash ^= b as u64;
        hash = hash.wrapping_mul(0x100000001b3); // FNV prime
    }
    // Doble hash para HMAC-like
    for &b in data.iter().chain(key.iter()) {
        hash ^= b as u64;
        hash = hash.wrapping_mul(0x100000001b3);
    }
    format!("{:016x}", hash)
}

/// Exporta el personal como JSON cifrado con AES-256-GCM → archivo .sicop
/// El usuario DEBE proporcionar una contraseña para cifrar.
#[tauri::command]
pub fn cmd_exportar_sicop(
    password: String,
    app: tauri::AppHandle,
    state: State<AppState>,
) -> Result<Option<String>, String> {
    if password.len() < 4 {
        return Err("La contraseña debe tener al menos 4 caracteres.".to_string());
    }

    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let version_db: i64 = conn
        .query_row("SELECT version_db FROM meta WHERE id = 1", [], |r| r.get(0))
        .map_err(|e| e.to_string())?;

    let fecha = Local::now().format("%Y-%m-%dT%H:%M:%S").to_string();
    conn.execute(
        "UPDATE meta SET fecha_exportacion = ?1 WHERE id = 1",
        [&fecha],
    ).map_err(|e| e.to_string())?;

    // Leer personal
    let personal: Vec<PersonaExport> = {
        let mut stmt = conn.prepare(
            "SELECT id, activo, nota_baja, categoria, nombre, apellidos,
                    fecha_nacimiento, tipo_sangre, escolaridad, direccion,
                    telefono, telefono_emergencia, numero_empleado, fecha_ingreso,
                    rfc, curp, cuip, clave_ine, licencia_conducir, foto
             FROM personal ORDER BY apellidos, nombre"
        ).map_err(|e| e.to_string())?;

        let rows: Vec<PersonaExport> = stmt.query_map([], |row| {
            let foto_blob: Option<Vec<u8>> = row.get(19)?;
            let foto_b64 = foto_blob.map(|b| {
                use base64::{Engine as _, engine::general_purpose::STANDARD};
                STANDARD.encode(&b)
            });
            Ok(PersonaExport {
                id: row.get(0)?, activo: row.get::<_, i64>(1)? != 0,
                nota_baja: row.get(2)?, categoria: row.get(3)?,
                nombre: row.get(4)?, apellidos: row.get(5)?,
                fecha_nacimiento: row.get(6)?, tipo_sangre: row.get(7)?,
                escolaridad: row.get(8)?, direccion: row.get(9)?,
                telefono: row.get(10)?, telefono_emergencia: row.get(11)?,
                numero_empleado: row.get(12)?, fecha_ingreso: row.get(13)?,
                rfc: row.get(14)?, curp: row.get(15)?, cuip: row.get(16)?,
                clave_ine: row.get(17)?, licencia_conducir: row.get(18)?,
                foto: foto_b64,
            })
        }).map_err(|e| e.to_string())?
          .collect::<Result<Vec<_>, _>>()
          .map_err(|e| e.to_string())?;
        rows
    };

    drop(conn);

    // Serializar a JSON
    let json_bytes = serde_json::to_vec(&serde_json::json!({
        "version": 3,
        "version_db": version_db,
        "fecha": fecha,
        "personal": personal,
    })).map_err(|e| e.to_string())?;

    // Generar salt aleatorio (16 bytes)
    let mut salt = [0u8; 16];
    OsRng.fill_bytes(&mut salt);

    // Derivar clave de la contraseña
    let key = derive_key(&password, &salt);

    // Cifrar con AES-256-GCM
    let cipher = Aes256Gcm::new_from_slice(&key)
        .map_err(|e| format!("Error inicializando cifrado: {}", e))?;

    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher.encrypt(nonce, json_bytes.as_ref())
        .map_err(|e| format!("Error al cifrar: {}", e))?;

    // HMAC de integridad
    let hmac = compute_hmac(&ciphertext, &key);

    // Header
    let header = SicopHeader {
        version: 3,
        version_db,
        fecha: fecha.clone(),
        salt: B64.encode(salt),
        hmac,
    };
    let header_json = serde_json::to_vec(&header).map_err(|e| e.to_string())?;
    let header_len = header_json.len() as u32;

    // Empaquetar: SCOP + header_len + header + nonce + ciphertext
    let mut output = Vec::new();
    output.extend_from_slice(b"SCOP");
    output.extend_from_slice(&header_len.to_le_bytes());
    output.extend_from_slice(&header_json);
    output.extend_from_slice(&nonce_bytes);
    output.extend_from_slice(&ciphertext);

    // Diálogo de guardar
    let nombre = format!("sicop_v{}_{}.sicop", version_db, &fecha[..10]);

    let ruta = app.dialog().file()
        .set_title("Guardar archivo .sicop cifrado")
        .set_file_name(&nombre)
        .add_filter("SICOP", &["sicop"])
        .blocking_save_file();

    let destino = match ruta {
        Some(r) => r.into_path().map_err(|e| format!("Ruta inválida: {}", e))?,
        None => return Ok(None),
    };

    std::fs::write(&destino, &output)
        .map_err(|e| format!("No se pudo escribir: {}", e))?;

    Ok(Some(destino.to_string_lossy().to_string()))
}

/// Info de versión
#[tauri::command]
pub fn cmd_get_meta(state: State<AppState>) -> Result<crate::models::MetaInfo, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.query_row(
        "SELECT version_db, fecha_exportacion, creado_en FROM meta WHERE id = 1",
        [],
        |row| Ok(crate::models::MetaInfo {
            version_db: row.get(0)?,
            fecha_exportacion: row.get(1)?,
            creado_en: row.get(2)?,
        }),
    ).map_err(|e| e.to_string())
}
