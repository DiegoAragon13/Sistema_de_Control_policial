// lib.rs — Entry point del backend Tauri
mod commands;
mod db;
mod models;

use std::sync::Mutex;
use rusqlite::Connection;
use tauri::Manager;

pub struct AppState {
    pub db: Mutex<Connection>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            let db_path = db::get_db_path(app.handle());
            let conn = db::init_db(&db_path)
                .expect("No se pudo inicializar la base de datos");

            app.manage(AppState {
                db: Mutex::new(conn),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Personal CRUD
            commands::personal::cmd_get_all,
            commands::personal::cmd_get_by_id,
            commands::personal::cmd_create,
            commands::personal::cmd_update,
            commands::personal::cmd_dar_baja,
            commands::personal::cmd_reactivar,
            commands::personal::cmd_import_bulk,
            // Sync / exportación .sicop
            commands::sync::cmd_exportar_sicop,
            commands::sync::cmd_get_meta,
        ])
        .run(tauri::generate_context!())
        .expect("Error al iniciar SICOP");
}
