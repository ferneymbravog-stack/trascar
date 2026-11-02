"""Controlador de fotos de la camioneta."""
import base64

from .. import config
from ..errors import ErrorHTTP
from ..models import foto_model


def listar(p):
    return 200, foto_model.listar()


def subir(p):
    try:
        ext = "." + str(p.cuerpo.get("ext", "")).lower().lstrip(".")
        contenido = base64.b64decode(str(p.cuerpo.get("data", "")).split(",")[-1])
    except (ValueError, TypeError):
        raise ErrorHTTP(400, "Imagen inválida")
    if ext not in config.EXT_FOTO or not contenido or len(contenido) > config.MAX_BYTES_FOTO:
        raise ErrorHTTP(400, "Use JPG, PNG o WEBP de máximo 5 MB")
    if len(foto_model.listar()) >= config.MAX_FOTOS:
        raise ErrorHTTP(400, f"Máximo {config.MAX_FOTOS} fotos; elimine alguna")
    foto_model.guardar(ext, contenido)
    return 200, {"ok": True}


def borrar(p):
    foto_model.borrar(p.cuerpo.get("nombre", ""))
    return 200, {"ok": True}

