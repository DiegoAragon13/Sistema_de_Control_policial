// db.rs — Inicialización y conexión a SQLite
use rusqlite::{Connection, Result, params};
use std::fs;
use tauri::Manager;
use bcrypt;
use log;

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

/// Asegura que exista al menos un usuario admin funcional.
/// Si no hay usuarios O si el admin no puede autenticarse con Admin1234!, lo recrea.
fn seed_admin(conn: &Connection) {
    // Verificar si existe el usuario admin
    let admin_exists: bool = conn.query_row(
        "SELECT COUNT(*) FROM usuarios WHERE username = 'admin'",
        [],
        |r| r.get::<_, i64>(0),
    ).unwrap_or(0) > 0;

    if !admin_exists {
        // No existe — crear desde cero
        let hash = bcrypt::hash("Admin1234!", 10).expect("Error generando hash bcrypt");
        conn.execute(
            "INSERT INTO usuarios (username, password_hash, nombre, rol)
             VALUES ('admin', ?1, 'Administrador', 'admin')",
            params![hash],
        ).expect("Error insertando admin");
        log::info!("[SICOP] Usuario admin creado con contraseña por defecto.");
    } else {
        log::info!("[SICOP] Usuario admin ya existe, no se modifica.");
    }
}
