"""Acceso a SQLite y creación inicial del esquema."""
import sqlite3
from contextlib import contextmanager

from . import config
from .seguridad import hash_pw


@contextmanager
def conexion():
    c = sqlite3.connect(config.DB)
    c.row_factory = sqlite3.Row
    try:
        yield c
        c.commit()
    finally:
        c.close()


def init_db():
    with conexion() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS usuarios(
            id INTEGER PRIMARY KEY, usuario TEXT UNIQUE, clave TEXT, rol TEXT,
            nombre TEXT, telefono TEXT);
        CREATE TABLE IF NOT EXISTS config(clave TEXT PRIMARY KEY, valor TEXT);
        CREATE TABLE IF NOT EXISTS citas(
            id INTEGER PRIMARY KEY, cliente_id INTEGER, fecha TEXT, hora INTEGER,
            duracion INTEGER, origen TEXT, destino TEXT, descripcion TEXT,
            estado TEXT DEFAULT 'pendiente', creada TEXT);
        CREATE TABLE IF NOT EXISTS sesiones(
            token TEXT PRIMARY KEY, usuario_id INTEGER, rol TEXT, nombre TEXT);
        """)
        if not c.execute("SELECT 1 FROM usuarios").fetchone():
            for u, p, r, n in [("admin", config.CLAVE_ADMIN, "admin", "Administrador"),
                               ("conductor", config.CLAVE_CONDUCTOR, "conductor", "Conductor")]:
                c.execute("INSERT INTO usuarios(usuario,clave,rol,nombre,telefono) VALUES(?,?,?,?,'')",
                          (u, hash_pw(p), r, n))
        if not c.execute("SELECT 1 FROM config WHERE clave='ref_fijada'").fetchone():
            c.execute("INSERT OR REPLACE INTO config VALUES('sabado_ref',?)", (config.SABADO_REF_INICIAL,))
            c.execute("INSERT INTO config VALUES('ref_fijada','1')")

