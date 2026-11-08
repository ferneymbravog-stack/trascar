"""Modelo de usuarios."""
import sqlite3
from datetime import datetime

from ..database import conexion
from ..seguridad import hash_pw


def buscar(usuario):
    with conexion() as c:
        return c.execute("SELECT * FROM usuarios WHERE usuario=?", (usuario,)).fetchone()


def listar_clientes():
    """Devuelve todos los usuarios registrados (clientes, conductor y admin) con su conteo de citas."""
    sql = """
    SELECT u.id, u.usuario, u.rol, u.nombre, u.telefono, COALESCE(u.creado, '') AS creado,
           COUNT(c.id) AS total_citas,
           SUM(CASE WHEN c.estado IN ('pendiente','confirmada') THEN 1 ELSE 0 END) AS citas_activas
    FROM usuarios u
    LEFT JOIN citas c ON c.cliente_id = u.id
    GROUP BY u.id
    ORDER BY CASE u.rol WHEN 'cliente' THEN 0 WHEN 'conductor' THEN 1 ELSE 2 END, u.id DESC
    """
    with conexion() as c:
        return [dict(r) for r in c.execute(sql).fetchall()]


def eliminar_usuario(usuario_id):
    """Elimina un cliente específico y sus citas. No permite borrar admin ni conductor."""
    with conexion(escritura=True) as c:
        u = c.execute("SELECT rol FROM usuarios WHERE id=?", (usuario_id,)).fetchone()
        if not u:
            return "no_existe"
        if u["rol"] in ("admin", "conductor"):
            return "protegido"
        c.execute("DELETE FROM citas WHERE cliente_id=?", (usuario_id,))
        c.execute("DELETE FROM sesiones WHERE usuario_id=?", (usuario_id,))
        c.execute("DELETE FROM usuarios WHERE id=?", (usuario_id,))
        return "ok"


def eliminar_clientes():
    """Borra todos los clientes y sus citas. Conserva admin y conductor."""
    with conexion(escritura=True) as c:
        c.execute("DELETE FROM citas WHERE cliente_id IN (SELECT id FROM usuarios WHERE rol='cliente')")
        c.execute("DELETE FROM sesiones WHERE rol='cliente'")
        return c.execute("DELETE FROM usuarios WHERE rol='cliente'").rowcount


def crear_cliente(usuario, nombre, telefono, clave):
    """Devuelve False si el usuario ya existe."""
    try:
        with conexion(escritura=True) as c:
            c.execute("INSERT INTO usuarios(usuario,clave,rol,nombre,telefono,creado) VALUES(?,?,'cliente',?,?,?)",
                      (usuario, hash_pw(clave), nombre, telefono, datetime.now().isoformat(timespec="minutes")))
        return True
    except sqlite3.IntegrityError:
        return False
