"""Modelo de usuarios."""
import sqlite3

from ..database import conexion
from ..seguridad import hash_pw


def buscar(usuario):
    with conexion() as c:
        return c.execute("SELECT * FROM usuarios WHERE usuario=?", (usuario,)).fetchone()


def eliminar_clientes():
    """Borra todos los clientes y sus citas. Conserva admin y conductor."""
    with conexion() as c:
        c.execute("DELETE FROM citas WHERE cliente_id IN (SELECT id FROM usuarios WHERE rol='cliente')")
        return c.execute("DELETE FROM usuarios WHERE rol='cliente'").rowcount


def crear_cliente(usuario, nombre, telefono, clave):
    """Devuelve False si el usuario ya existe."""
    try:
        with conexion() as c:
            c.execute("INSERT INTO usuarios(usuario,clave,rol,nombre,telefono) VALUES(?,?,'cliente',?,?)",
                      (usuario, hash_pw(clave), nombre, telefono))
        return True
    except sqlite3.IntegrityError:
        return False

