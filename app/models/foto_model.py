"""Modelo de fotos de la camioneta (archivos en la carpeta fotos/)."""
import os
import secrets
from datetime import datetime

from .. import config


def listar():
    if not os.path.isdir(config.FOTOS):
        return []
    return sorted(f for f in os.listdir(config.FOTOS) if os.path.splitext(f)[1].lower() in config.EXT_FOTO)


def guardar(ext, contenido):
    os.makedirs(config.FOTOS, exist_ok=True)
    nombre = f"{int(datetime.now().timestamp())}_{secrets.token_hex(3)}{ext}"
    with open(os.path.join(config.FOTOS, nombre), "wb") as f:
        f.write(contenido)
    return nombre


def ruta_segura(nombre):
    """Ruta del archivo si existe y es imagen válida; si no, None."""
    nombre = os.path.basename(str(nombre))
    ruta = os.path.join(config.FOTOS, nombre)
    if os.path.splitext(nombre)[1].lower() not in config.EXT_FOTO or not os.path.isfile(ruta):
        return None
    return ruta


def borrar(nombre):
    ruta = ruta_segura(nombre)
    if ruta:
        os.remove(ruta)

