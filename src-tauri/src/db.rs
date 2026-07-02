// db.rs — Inicialización y conexión a SQLite
use rusqlite::{Connection, Result};
use std::fs;
use tauri::Manager;

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

    // Configuración de rendimiento
    conn.execute_batch("
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        PRAGMA synchronous = NORMAL;
        PRAGMA cache_size = -8000;
    ")?;

    // Ejecutar migration inicial
    conn.execute_batch(include_str!("../migrations/001_initial.sql"))?;

    Ok(conn)
}
