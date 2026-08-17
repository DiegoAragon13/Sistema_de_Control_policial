// commands/archivos.rs
// Guardar archivos con diálogo nativo del OS desde Rust.
// El frontend manda los bytes en base64, Rust abre el diálogo y escribe.

use base64::{Engine as _, engine::general_purpose::STANDARD as B64};
use serde::Deserialize;
use tauri_plugin_dialog::DialogExt;

#[derive(Deserialize)]
pub struct GuardarArchivoInput {
    /// Nombre de archivo sugerido en el diálogo (ej: "Perfil_POL001.pdf")
    pub nombre_sugerido: String,
    /// Título del diálogo de guardar
    pub titulo: String,
    /// Extensión sin punto (ej: "pdf" o "xlsx")
    pub extension: String,
    /// Contenido del archivo como base64
    pub contenido_b64: String,
}

/// Abre el diálogo nativo de "Guardar como" y escribe el archivo.
/// Retorna la ruta donde se guardó, o None si el usuario canceló.
#[tauri::command]
pub fn cmd_guardar_archivo(
    input: GuardarArchivoInput,
    app: tauri::AppHandle,
) -> Result<Option<String>, String> {
    // Decodificar base64 → bytes
    let bytes = B64.decode(&input.contenido_b64)
        .map_err(|e| format!("Error al decodificar archivo: {}", e))?;

    // Mostrar diálogo nativo de guardar (bloqueante en el hilo actual)
    let ruta = app
        .dialog()
        .file()
        .set_title(&input.titulo)
        .set_file_name(&input.nombre_sugerido)
        .add_filter(&input.extension.to_uppercase(), &[&input.extension])
        .blocking_save_file();

    let ruta_path = match ruta {
        Some(r) => r.into_path().map_err(|e| format!("Ruta inválida: {}", e))?,
        None => return Ok(None), // usuario canceló
    };

    // Escribir el archivo
    std::fs::write(&ruta_path, &bytes)
        .map_err(|e| format!("Error al escribir archivo: {}", e))?;

    Ok(Some(ruta_path.to_string_lossy().to_string()))
}
