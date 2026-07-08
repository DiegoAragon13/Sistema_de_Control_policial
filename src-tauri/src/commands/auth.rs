// commands/auth.rs — Autenticación con bcrypt
use bcrypt::{hash, verify, DEFAULT_COST};
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::AppState;

#[derive(Debug, Serialize)]
pub struct SesionInfo {
    pub id:       i64,
    pub username: String,
    pub nombre:   String,
    pub rol:      String,
}

#[derive(Debug, Deserialize)]
pub struct LoginInput {
    pub username: String,
    pub password: String,
}

/// Verifica credenciales y retorna info del usuario si son correctas.
/// Retorna error con mensaje genérico para no dar pistas sobre qué campo falló.
#[tauri::command]
pub fn cmd_login(input: LoginInput, state: State<AppState>) -> Result<SesionInfo, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Buscar usuario activo
    let resultado = conn.query_row(
        "SELECT id, username, password_hash, nombre, rol
         FROM usuarios
         WHERE username = ?1 AND activo = 1",
        params![input.username.trim()],
        |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
            ))
        },
    );

    let (id, username, password_hash, nombre, rol) = match resultado {
        Ok(r) => r,
        Err(_) => return Err("Usuario o contraseña incorrectos.".to_string()),
    };

    // Verificar contraseña con bcrypt
    let valida = verify(&input.password, &password_hash)
        .map_err(|_| "Error al verificar contraseña.".to_string())?;

    if !valida {
        return Err("Usuario o contraseña incorrectos.".to_string());
    }

    // Registrar último login
    conn.execute(
        "UPDATE usuarios SET ultimo_login = datetime('now', 'localtime') WHERE id = ?1",
        params![id],
    ).ok();

    Ok(SesionInfo { id, username, nombre, rol })
}

/// Cambia la contraseña del usuario autenticado.
#[tauri::command]
pub fn cmd_cambiar_password(
    id_usuario: i64,
    password_actual: String,
    password_nueva: String,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Verificar contraseña actual
    let hash_actual: String = conn.query_row(
        "SELECT password_hash FROM usuarios WHERE id = ?1",
        params![id_usuario],
        |r| r.get(0),
    ).map_err(|_| "Usuario no encontrado.".to_string())?;

    let valida = verify(&password_actual, &hash_actual)
        .map_err(|_| "Error al verificar contraseña.".to_string())?;

    if !valida {
        return Err("La contraseña actual es incorrecta.".to_string());
    }

    if password_nueva.len() < 8 {
        return Err("La nueva contraseña debe tener al menos 8 caracteres.".to_string());
    }

    let nuevo_hash = hash(&password_nueva, DEFAULT_COST)
        .map_err(|e| format!("Error al cifrar contraseña: {}", e))?;

    conn.execute(
        "UPDATE usuarios SET password_hash = ?1 WHERE id = ?2",
        params![nuevo_hash, id_usuario],
    ).map_err(|e| e.to_string())?;

    Ok(())
}
