"""Controlador de configuración (sábado de referencia)."""
from datetime import date

from ..errors import ErrorHTTP
from ..models import calendario_model


def obtener(p):
    return 200, {"sabado_ref": calendario_model.sabado_ref().isoformat()}


def guardar(p):
    try:
        f = date.fromisoformat(p.cuerpo.get("sabado_ref", ""))
    except ValueError:
        raise ErrorHTTP(400, "Fecha inválida")
    if f.weekday() != 5:
        raise ErrorHTTP(400, "Debe ser un sábado")
    calendario_model.guardar_sabado_ref(f)
    return 200, {"ok": True}

