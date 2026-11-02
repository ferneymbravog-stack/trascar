"""Modelo de citas (acarreos agendados)."""
from datetime import datetime

from ..database import conexion


def horas_ocupadas(d):
    ocupadas = set()
    with conexion() as c:
        for r in c.execute("SELECT hora,duracion FROM citas WHERE fecha=? AND estado IN ('pendiente','confirmada')",
                           (d.isoformat(),)):
            ocupadas.update(range(r["hora"], r["hora"] + r["duracion"]))
    return ocupadas


def listar(rol, usuario_id):
    sql = ("SELECT c.*, u.nombre cliente, u.telefono FROM citas c "
           "JOIN usuarios u ON u.id=c.cliente_id ")
    args = ()
    if rol == "cliente":
        sql += "WHERE cliente_id=? "
        args = (usuario_id,)
    elif rol == "conductor":
        sql += "WHERE estado IN ('pendiente','confirmada','completada') "
    sql += "ORDER BY fecha DESC, hora"
    with conexion() as c:
        return [dict(r) for r in c.execute(sql, args)]


def crear(cliente_id, fecha, hora, duracion, origen, destino, descripcion, estado):
    with conexion() as c:
        c.execute("INSERT INTO citas(cliente_id,fecha,hora,duracion,origen,destino,descripcion,estado,creada) "
                  "VALUES(?,?,?,?,?,?,?,?,?)",
                  (cliente_id, fecha.isoformat(), hora, duracion, origen, destino, descripcion,
                   estado, datetime.now().isoformat()))


def obtener(cita_id):
    with conexion() as c:
        return c.execute("SELECT * FROM citas WHERE id=?", (cita_id,)).fetchone()


def cambiar_estado(cita_id, estado):
    with conexion() as c:
        c.execute("UPDATE citas SET estado=? WHERE id=?", (estado, cita_id))


def eliminar(cita_id):
    return eliminar_varias([cita_id])


def eliminar_varias(ids):
    if not ids:
        return 0
    with conexion() as c:
        return c.execute(f"DELETE FROM citas WHERE id IN ({','.join('?' * len(ids))})", ids).rowcount


def eliminar_historial():
    """Borra las citas ya finalizadas (completadas, canceladas y rechazadas)."""
    with conexion() as c:
        return c.execute("DELETE FROM citas WHERE estado IN ('completada','cancelada','rechazada')").rowcount


def eliminar_todas():
    with conexion() as c:
        return c.execute("DELETE FROM citas").rowcount

