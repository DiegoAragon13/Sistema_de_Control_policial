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
    creado_en    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    ultimo_login TEXT
);

-- Usuario admin por defecto
-- Contraseña: Admin1234!
-- (hash bcrypt generado con cost=12)
-- CAMBIA ESTA CONTRASEÑA EN PRODUCCIÓN desde la pantalla de configuración
INSERT OR IGNORE INTO usuarios (id, username, password_hash, nombre, rol)
VALUES (
    1,
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4oX5Rqfz4K',
    'Administrador',
    'admin'
);
