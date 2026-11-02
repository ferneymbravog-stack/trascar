"""Modelo de calendario: días laborales y sábados alternados."""
from datetime import date

from ..database import conexion


def sabado_ref():
    with conexion() as c:
        return date.fromisoformat(c.execute("SELECT valor FROM config WHERE clave='sabado_ref'").fetchone()[0])


def guardar_sabado_ref(f):
    with conexion() as c:
        c.execute("UPDATE config SET valor=? WHERE clave='sabado_ref'", (f.isoformat(),))


def dia_laboral(d):
    """Lunes-viernes y domingo sí; los sábados alternan respecto a la referencia."""
    if d.weekday() != 5:
        return True
    return ((d - sabado_ref()).days // 7) % 2 == 0

