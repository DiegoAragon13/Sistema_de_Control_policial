// commands/auth.rs — Autenticación con bcrypt + rate limiting
use bcrypt::{hash, verify, DEFAULT_COST};
use rusqlite::params;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::AppState;

// Máximo de intentos antes de bloquear + duración del bloqueo en minutos
const MAX_INTENTOS: i64 = 5;
const BLOQUEO_MINUTOS: i64 = 5;

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

#[tauri::command]
pub fn cmd_login(input: LoginInput, state: State<AppState>) -> Result<SesionInfo, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let username = input.username.trim().to_string();

    // Verificar si el usuario está bloqueado
    let bloqueado: bool = conn.query_row(
        "SELECT CASE
            WHEN intentos_fallidos >= ?1
            AND bloqueado_hasta > datetime('now', 'localtime')
            THEN 1 ELSE 0 END
         FROM usuarios WHERE username = ?2 AND activo = 1",
        params![MAX_INTENTOS, &username],
        |r| r.get::<_, i64>(0),
    ).unwrap_or(0) == 1;

    if bloqueado {
        return Err(format!(
            "Cuenta bloqueada por demasiados intentos. Espera {} minutos.",
            BLOQUEO_MINUTOS
        ));
    }

    // Buscar usuario activo
    let resultado = conn.query_row(
        "SELECT id, username, password_hash, nombre, rol
         FROM usuarios
         WHERE username = ?1 AND activo = 1",
        params![&username],
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

    let (id, username_db, password_hash, nombre, rol) = match resultado {
        Ok(r) => r,
        Err(_) => return Err("Usuario o contraseña incorrectos.".to_string()),
    };

    // Verificar contraseña con bcrypt
    let valida = verify(&input.password, &password_hash)
        .map_err(|_| "Error al verificar contraseña.".to_string())?;

    if !valida {
        // Incrementar intentos fallidos y establecer bloqueo
        conn.execute(
            "UPDATE usuarios SET
                intentos_fallidos = intentos_fallidos + 1,
                bloqueado_hasta = CASE
                    WHEN intentos_fallidos + 1 >= ?1
                    THEN datetime('now', 'localtime', '+' || ?2 || ' minutes')
                    ELSE bloqueado_hasta
                END
             WHERE id = ?3",
            params![MAX_INTENTOS, BLOQUEO_MINUTOS, id],
        ).ok();

        return Err("Usuario o contraseña incorrectos.".to_string());
    }

    // Login exitoso: resetear intentos fallidos
    conn.execute(
        "UPDATE usuarios SET
            intentos_fallidos = 0,
            bloqueado_hasta = NULL,
            ultimo_login = datetime('now', 'localtime')
         WHERE id = ?1",
        params![id],
    ).ok();

    Ok(SesionInfo { id, username: username_db, nombre, rol })
}

#[tauri::command]
pub fn cmd_cambiar_password(
    id_usuario: i64,
    password_actual: String,
    password_nueva: String,
    state: State<AppState>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

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
