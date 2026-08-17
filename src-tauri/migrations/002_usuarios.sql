-- ============================================================
-- SICOP — Migration 002: Tabla de usuarios
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT    NOT NULL UNIQUE,
    password_hash TEXT   NOT NULL,
    nombre       TEXT    NOT NULL DEFAULT '',
    rol          TEXT    NOT NULL DEFAULT 'operador'
                         CHECK (rol IN ('admin', 'operador')),
    activo       INTEGER NOT NULL DEFAULT 1,
    intentos_fallidos INTEGER NOT NULL DEFAULT 0,
    bloqueado_hasta   TEXT,
    creado_en    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    ultimo_login TEXT
);

-- El usuario admin se crea desde Rust (seed_admin en db.rs)
-- con un hash bcrypt real. NO insertar aquí con hash placeholder.
