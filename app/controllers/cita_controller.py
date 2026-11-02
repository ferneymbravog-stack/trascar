"""Controlador de citas: disponibilidad, listado, creación y cambio de estado."""
from datetime import date, datetime

from .. import config
from ..errors import ErrorHTTP
from ..models import calendario_model, cita_model


def disponibilidad(p):
    try:
        d = date.fromisoformat(p.query.get("fecha", ""))
    except ValueError:
        raise ErrorHTTP(400, "Fecha inválida")
    if not calendario_model.dia_laboral(d):
        return 200, {"laboral": False, "motivo": "Sábado sin servicio (los sábados se alternan)", "horas": []}
    ocupadas = cita_model.horas_ocupadas(d)
    horas = [{"hora": h, "libre": h not in ocupadas}
             for h in range(config.HORA_INICIO, config.HORA_FIN) if h not in config.HORAS_BLOQUEADAS]
    return 200, {"laboral": True, "horas": horas}


def listar(p):
    return 200, cita_model.listar(p.usuario.rol, p.usuario.id)


def crear(p):
    d, u = p.cuerpo, p.usuario
    try:
        fecha = date.fromisoformat(d.get("fecha", ""))
        hora = int(d.get("hora"))
        dur = int(d.get("duracion", 1))
    except (ValueError, TypeError):
        raise ErrorHTTP(400, "Datos inválidos")
    if fecha < date.today() or (fecha == date.today() and hora <= datetime.now().hour):
        raise ErrorHTTP(400, "No se puede agendar en el pasado")
    if not calendario_model.dia_laboral(fecha):
        raise ErrorHTTP(400, "Ese día no se trabaja")
    if not 1 <= dur <= config.MAX_DURACION:
        raise ErrorHTTP(400, f"Duración entre 1 y {config.MAX_DURACION} horas")
    rango = range(hora, hora + dur)
    if any(h in config.HORAS_BLOQUEADAS for h in rango) or hora < config.HORA_INICIO or hora + dur > config.HORA_FIN:
        raise ErrorHTTP(400, "Horario no permitido (pico y placa: 6-8am y 6-8pm). Servicio las demás horas del día")
    if set(rango) & cita_model.horas_ocupadas(fecha):
        raise ErrorHTTP(400, "Ese horario ya está ocupado")
    origen, destino = str(d.get("origen", "")).strip(), str(d.get("destino", "")).strip()
    if not origen or not destino:
        raise ErrorHTTP(400, "Indique origen y destino")
    cliente = int(d.get("cliente_id") or u.id) if u.rol == "admin" else u.id
    cita_model.crear(cliente, fecha, hora, dur, origen, destino, str(d.get("descripcion", "")).strip(),
                     "confirmada" if u.rol == "admin" else "pendiente")
    return 200, {"ok": True}


def eliminar(p):
    """Borra una cita (`id`) o varias (`ids`), por ejemplo las que resultan de una búsqueda."""
    crudos = p.cuerpo.get("ids") if "ids" in p.cuerpo else [p.cuerpo.get("id")]
    try:
        ids = [int(i) for i in crudos]
    except (TypeError, ValueError):
        raise ErrorHTTP(400, "Identificadores inválidos")
    n = cita_model.eliminar_varias(ids)
    if not n:
        raise ErrorHTTP(404, "Cita no existe")
    return 200, {"ok": True, "borradas": n}


def limpiar(p):
    alcance = p.cuerpo.get("alcance")
    if alcance == "historial":
        n = cita_model.eliminar_historial()
    elif alcance == "todas":
        n = cita_model.eliminar_todas()
    else:
        raise ErrorHTTP(400, "Alcance inválido")
    return 200, {"ok": True, "borradas": n}


def cambiar_estado(p):
    nuevo, cita_id, u = p.cuerpo.get("estado"), p.cuerpo.get("id"), p.usuario
    cita = cita_model.obtener(cita_id)
    if not cita:
        raise ErrorHTTP(404, "Cita no existe")
    permitido = (
        (u.rol == "admin" and nuevo in ("confirmada", "rechazada", "completada", "cancelada"))
        or (u.rol == "conductor" and nuevo in ("confirmada", "rechazada") and cita["estado"] == "pendiente")
        or (u.rol == "conductor" and nuevo == "completada" and cita["estado"] == "confirmada")
        or (u.rol == "cliente" and nuevo == "cancelada" and cita["cliente_id"] == u.id
            and cita["estado"] in ("pendiente", "confirmada")))
    if not permitido:
        raise ErrorHTTP(403, "No permitido")
    cita_model.cambiar_estado(cita_id, nuevo)
    return 200, {"ok": True}
