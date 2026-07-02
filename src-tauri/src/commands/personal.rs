// commands/personal.rs — CRUD de personal
use rusqlite::params;
use tauri::State;
use base64::{Engine as _, engine::general_purpose::STANDARD as B64};

use crate::models::{Persona, PersonaInput, ImportResult};
use crate::AppState;

/// Convierte una fila de rusqlite a Persona
fn row_to_persona(row: &rusqlite::Row) -> rusqlite::Result<Persona> {
    let foto_blob: Option<Vec<u8>> = row.get(19)?;
    let foto_b64 = foto_blob.map(|b| B64.encode(&b));

    Ok(Persona {
        id:                   row.get(0)?,
        activo:               row.get::<_, i64>(1)? != 0,
        nota_baja:            row.get(2)?,
        categoria:            row.get(3)?,
        nombre:               row.get(4)?,
        apellidos:            row.get(5)?,
        fecha_nacimiento:     row.get(6)?,
        tipo_sangre:          row.get(7)?,
        escolaridad:          row.get(8)?,
        direccion:            row.get(9)?,
        telefono:             row.get(10)?,
        telefono_emergencia:  row.get(11)?,
        numero_empleado:      row.get(12)?,
        fecha_ingreso:        row.get(13)?,
        rfc:                  row.get(14)?,
        curp:                 row.get(15)?,
        cuip:                 row.get(16)?,
        clave_ine:            row.get(17)?,
        licencia_conducir:    row.get(18)?,
        foto:                 foto_b64,
        creado_en:            row.get(20)?,
        actualizado_en:       row.get(21)?,
    })
}

const SELECT_ALL: &str = "
    SELECT id, activo, nota_baja, categoria, nombre, apellidos,
           fecha_nacimiento, tipo_sangre, escolaridad, direccion,
           telefono, telefono_emergencia, numero_empleado, fecha_ingreso,
           rfc, curp, cuip, clave_ine, licencia_conducir,
           foto, creado_en, actualizado_en
    FROM personal
";

#[tauri::command]
pub fn cmd_get_all(state: State<AppState>) -> Result<Vec<Persona>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(&format!("{} ORDER BY apellidos, nombre", SELECT_ALL))
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], row_to_persona)
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(rows)
}

#[tauri::command]
pub fn cmd_get_by_id(id: i64, state: State<AppState>) -> Result<Option<Persona>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(&format!("{} WHERE id = ?1", SELECT_ALL))
        .map_err(|e| e.to_string())?;

    let mut rows = stmt
        .query_map(params![id], row_to_persona)
        .map_err(|e| e.to_string())?;

    match rows.next() {
        Some(r) => Ok(Some(r.map_err(|e| e.to_string())?)),
        None => Ok(None),
    }
}

#[tauri::command]
pub fn cmd_create(input: PersonaInput, state: State<AppState>) -> Result<Persona, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Decodificar foto de base64 a bytes si viene
    let foto_bytes: Option<Vec<u8>> = input.foto
        .as_deref()
        .filter(|s| !s.is_empty())
        .map(|s| B64.decode(s))
        .transpose()
        .map_err(|e| format!("Foto inválida: {}", e))?;

    conn.execute(
        "INSERT INTO personal (
            activo, nota_baja, categoria, nombre, apellidos,
            fecha_nacimiento, tipo_sangre, escolaridad, direccion,
            telefono, telefono_emergencia, numero_empleado, fecha_ingreso,
            rfc, curp, cuip, clave_ine, licencia_conducir, foto
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9,
            ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19
        )",
        params![
            input.activo.unwrap_or(true) as i64,
            input.nota_baja.unwrap_or_default(),
            input.categoria, input.nombre, input.apellidos,
            input.fecha_nacimiento, input.tipo_sangre, input.escolaridad,
            input.direccion, input.telefono, input.telefono_emergencia,
            input.numero_empleado, input.fecha_ingreso,
            input.rfc, input.curp, input.cuip,
            input.clave_ine, input.licencia_conducir,
            foto_bytes,
        ],
    ).map_err(|e| e.to_string())?;

    let new_id = conn.last_insert_rowid();
    bump_version(&conn)?;
    // Soltar el lock antes de llamar cmd_get_by_id para evitar borrow conflict
    drop(conn);

    cmd_get_by_id(new_id, state)
        .map(|o| o.ok_or_else(|| "Error al recuperar el registro creado".to_string()))?
}

#[tauri::command]
pub fn cmd_update(id: i64, input: PersonaInput, state: State<AppState>) -> Result<Persona, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let foto_bytes: Option<Vec<u8>> = input.foto
        .as_deref()
        .filter(|s| !s.is_empty())
        .map(|s| B64.decode(s))
        .transpose()
        .map_err(|e| format!("Foto inválida: {}", e))?;

    // Si no viene foto nueva, conservar la existente
    if foto_bytes.is_some() {
        conn.execute(
            "UPDATE personal SET
                activo=?1, nota_baja=?2, categoria=?3, nombre=?4, apellidos=?5,
                fecha_nacimiento=?6, tipo_sangre=?7, escolaridad=?8, direccion=?9,
                telefono=?10, telefono_emergencia=?11, numero_empleado=?12,
                fecha_ingreso=?13, rfc=?14, curp=?15, cuip=?16,
                clave_ine=?17, licencia_conducir=?18, foto=?19
            WHERE id=?20",
            params![
                input.activo.unwrap_or(true) as i64,
                input.nota_baja.unwrap_or_default(),
                input.categoria, input.nombre, input.apellidos,
                input.fecha_nacimiento, input.tipo_sangre, input.escolaridad,
                input.direccion, input.telefono, input.telefono_emergencia,
                input.numero_empleado, input.fecha_ingreso,
                input.rfc, input.curp, input.cuip,
                input.clave_ine, input.licencia_conducir,
                foto_bytes, id,
            ],
        ).map_err(|e| e.to_string())?;
    } else {
        conn.execute(
            "UPDATE personal SET
                activo=?1, nota_baja=?2, categoria=?3, nombre=?4, apellidos=?5,
                fecha_nacimiento=?6, tipo_sangre=?7, escolaridad=?8, direccion=?9,
                telefono=?10, telefono_emergencia=?11, numero_empleado=?12,
                fecha_ingreso=?13, rfc=?14, curp=?15, cuip=?16,
                clave_ine=?17, licencia_conducir=?18
            WHERE id=?19",
            params![
                input.activo.unwrap_or(true) as i64,
                input.nota_baja.unwrap_or_default(),
                input.categoria, input.nombre, input.apellidos,
                input.fecha_nacimiento, input.tipo_sangre, input.escolaridad,
                input.direccion, input.telefono, input.telefono_emergencia,
                input.numero_empleado, input.fecha_ingreso,
                input.rfc, input.curp, input.cuip,
                input.clave_ine, input.licencia_conducir, id,
            ],
        ).map_err(|e| e.to_string())?;
    }

    bump_version(&conn)?;
    drop(conn);

    cmd_get_by_id(id, state)
        .map(|o| o.ok_or_else(|| "Registro no encontrado".to_string()))?
}

#[tauri::command]
pub fn cmd_dar_baja(id: i64, nota: String, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE personal SET activo = 0, nota_baja = ?1 WHERE id = ?2",
        params![nota, id],
    ).map_err(|e| e.to_string())?;
    bump_version(&conn)
}

#[tauri::command]
pub fn cmd_reactivar(id: i64, state: State<AppState>) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE personal SET activo = 1, nota_baja = '' WHERE id = ?1",
        params![id],
    ).map_err(|e| e.to_string())?;
    bump_version(&conn)
}

#[tauri::command]
pub fn cmd_import_bulk(registros: Vec<PersonaInput>, state: State<AppState>) -> Result<ImportResult, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let mut importados = 0usize;
    let mut errores: Vec<String> = Vec::new();

    for (i, input) in registros.iter().enumerate() {
        let fila = i + 2; // +2 porque fila 1 es encabezado en Excel

        let foto_bytes: Option<Vec<u8>> = input.foto
            .as_deref()
            .filter(|s| !s.is_empty())
            .map(|s| B64.decode(s))
            .transpose()
            .ok()
            .flatten();

        match conn.execute(
            "INSERT OR IGNORE INTO personal (
                activo, nota_baja, categoria, nombre, apellidos,
                fecha_nacimiento, tipo_sangre, escolaridad, direccion,
                telefono, telefono_emergencia, numero_empleado, fecha_ingreso,
                rfc, curp, cuip, clave_ine, licencia_conducir, foto
            ) VALUES (1, '', ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
            params![
                input.categoria, input.nombre, input.apellidos,
                input.fecha_nacimiento, input.tipo_sangre, input.escolaridad,
                input.direccion, input.telefono, input.telefono_emergencia,
                input.numero_empleado, input.fecha_ingreso,
                input.rfc, input.curp, input.cuip,
                input.clave_ine, input.licencia_conducir,
                foto_bytes,
            ],
        ) {
            Ok(1) => importados += 1,
            Ok(_) => errores.push(format!("Fila {}: número de empleado '{}' ya existe, omitido.", fila, input.numero_empleado)),
            Err(e) => errores.push(format!("Fila {}: {}", fila, e)),
        }
    }

    if importados > 0 {
        bump_version(&conn)?;
    }

    Ok(ImportResult { importados, errores })
}

/// Incrementa version_db en meta cada vez que hay cambios
pub fn bump_version(conn: &rusqlite::Connection) -> Result<(), String> {
    conn.execute(
        "UPDATE meta SET version_db = version_db + 1 WHERE id = 1",
        [],
    ).map_err(|e| e.to_string())?;
    Ok(())
}
