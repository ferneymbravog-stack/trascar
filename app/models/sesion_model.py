"""Modelo de sesiones (persistidas en SQLite para no perderse al reiniciar)."""
import secrets
from collections import namedtuple

from ..database import conexion

Sesion = namedtuple("Sesion", "id rol nombre")


def crear(usuario):
    token = secrets.token_hex(16)
    with conexion() as c:
        c.execute("INSERT OR REPLACE INTO sesiones(token,usuario_id,rol,nombre) VALUES(?,?,?,?)",
                  (token, usuario["id"], usuario["rol"], usuario["nombre"]))
    return token


def obtener(token):
    if not token:
        return None
    with conexion() as c:
        r = c.execute("SELECT usuario_id, rol, nombre FROM sesiones WHERE token=?", (token,)).fetchone()
    return Sesion(r["usuario_id"], r["rol"], r["nombre"]) if r else None
