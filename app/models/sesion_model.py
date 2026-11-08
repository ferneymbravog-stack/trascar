"""Modelo de sesiones con invalidación segura."""
import secrets
from collections import namedtuple

from ..database import conexion

Sesion = namedtuple("Sesion", "id rol nombre")


def crear(usuario):
    token = secrets.token_hex(24)
    with conexion(escritura=True) as c:
        c.execute("INSERT OR REPLACE INTO sesiones(token,usuario_id,rol,nombre) VALUES(?,?,?,?)",
                  (token, usuario["id"], usuario["rol"], usuario["nombre"]))
    return token


def obtener(token):
    if not token:
        return None
    with conexion() as c:
        r = c.execute("SELECT usuario_id, rol, nombre FROM sesiones WHERE token=?", (token,)).fetchone()
    return Sesion(r["usuario_id"], r["rol"], r["nombre"]) if r else None


def eliminar(token):
    if not token:
        return
    with conexion(escritura=True) as c:
        c.execute("DELETE FROM sesiones WHERE token=?", (token,))
