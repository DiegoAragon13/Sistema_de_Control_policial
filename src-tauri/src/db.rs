// db.rs — Inicialización y conexión a SQLite
use rusqlite::{Connection, Result, params};
use std::fs;
use tauri::Manager;
use bcrypt;

pub fn get_db_path(app: &tauri::AppHandle) -> std::path::PathBuf {
    let data_dir = app
        .path()
        .app_data_dir()
        .expect("No se pudo obtener AppData");
    fs::create_dir_all(&data_dir).ok();
    data_dir.join("sicop.db")
}

pub fn init_db(path: &std::path::Path) -> Result<Connection> {
    let conn = Connection::open(path)?;

    // Configuración de rendimiento y seguridad
    conn.execute_batch("
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        PRAGMA synchronous = NORMAL;
        PRAGMA cache_size = -8000;
    ")?;

    // Migrations en orden
    conn.execute_batch(include_str!("../migrations/001_initial.sql"))?;
    conn.execute_batch(include_str!("../migrations/002_usuarios.sql"))?;

    // Generar hash real de bcrypt para el admin por defecto
    // Solo si la contraseña aún es el placeholder o si el hash no es bcrypt válido
    seed_admin(&conn);

    Ok(conn)
}

/// Asegura que exista el usuario admin con un hash bcrypt verificable.
/// Intenta verificar la contraseña por defecto — si falla, regenera el hash.
fn seed_admin(conn: &Connection) {
    let hash_actual: Option<String> = conn.query_row(
        "SELECT password_hash FROM usuarios WHERE id = 1",
        [],
        |r| r.get::<_, String>(0),
    ).ok();

    let necesita_rehash = match hash_actual {
        None => true,
        Some(ref h) => {
            // Verificar que el hash realmente valida la contraseña por defecto
            !bcrypt::verify("Admin1234!", h).unwrap_or(false)
        }
    };

    if necesita_rehash {
        if let Ok(nuevo_hash) = bcrypt::hash("Admin1234!", 10) {
            conn.execute(
                "UPDATE usuarios SET password_hash = ?1 WHERE id = 1",
                params![nuevo_hash],
            ).ok();
        }
    }
}
