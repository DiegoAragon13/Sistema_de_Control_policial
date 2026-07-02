-- ============================================================
-- SICOP — Schema inicial v1
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- Tabla: meta
-- Versión de la base de datos para el sistema de sincronización
-- con la app móvil. Siempre tiene un solo registro (id=1).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meta (
    id                  INTEGER PRIMARY KEY CHECK (id = 1),
    version_db          INTEGER NOT NULL DEFAULT 1,
    fecha_exportacion   TEXT,
    creado_en           TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

INSERT OR IGNORE INTO meta (id, version_db) VALUES (1, 1);

-- ------------------------------------------------------------
-- Tabla: personal
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS personal (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Estado
    activo              INTEGER NOT NULL DEFAULT 1,   -- 1=activo, 0=baja
    nota_baja           TEXT    NOT NULL DEFAULT '',

    -- Categoría
    categoria           TEXT    NOT NULL DEFAULT 'Preventiva'
                                CHECK (categoria IN ('Preventiva', 'Vial')),

    -- Datos personales
    nombre              TEXT    NOT NULL DEFAULT '',
    apellidos           TEXT    NOT NULL DEFAULT '',
    fecha_nacimiento    TEXT    NOT NULL DEFAULT '',
    tipo_sangre         TEXT    NOT NULL DEFAULT ''
                                CHECK (tipo_sangre IN ('O+','O-','A+','A-','B+','B-','AB+','AB-','')),
    escolaridad         TEXT    NOT NULL DEFAULT '',
    direccion           TEXT    NOT NULL DEFAULT '',
    telefono            TEXT    NOT NULL DEFAULT '',
    telefono_emergencia TEXT    NOT NULL DEFAULT '',

    -- Datos laborales
    numero_empleado     TEXT    NOT NULL DEFAULT '' UNIQUE,
    fecha_ingreso       TEXT    NOT NULL DEFAULT '',

    -- Documentos de identidad
    rfc                 TEXT    NOT NULL DEFAULT '',
    curp                TEXT    NOT NULL DEFAULT '',
    cuip                TEXT    NOT NULL DEFAULT '',
    clave_ine           TEXT    NOT NULL DEFAULT '',
    licencia_conducir   TEXT    NOT NULL DEFAULT '',

    -- Foto como BLOB (JPEG comprimido, nullable)
    foto                BLOB,

    -- Timestamps
    creado_en           TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    actualizado_en      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_personal_nombre
    ON personal (nombre, apellidos);
CREATE INDEX IF NOT EXISTS idx_personal_numero_empleado
    ON personal (numero_empleado);
CREATE INDEX IF NOT EXISTS idx_personal_rfc
    ON personal (rfc);
CREATE INDEX IF NOT EXISTS idx_personal_curp
    ON personal (curp);
CREATE INDEX IF NOT EXISTS idx_personal_categoria
    ON personal (categoria);
CREATE INDEX IF NOT EXISTS idx_personal_activo
    ON personal (activo);

-- Trigger para actualizar actualizado_en automáticamente
CREATE TRIGGER IF NOT EXISTS trg_personal_updated
    AFTER UPDATE ON personal
    FOR EACH ROW
BEGIN
    UPDATE personal
    SET actualizado_en = datetime('now', 'localtime')
    WHERE id = OLD.id;
END;
