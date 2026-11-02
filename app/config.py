"""Configuración general de la aplicación Trascar."""
import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB = os.environ.get("TRASCAR_DB", os.path.join(BASE, "agenda.db"))
STATIC = os.path.join(BASE, "static")
FOTOS = os.environ.get("TRASCAR_FOTOS", os.path.join(BASE, "fotos"))
PORT = int(os.environ.get("PORT", os.environ.get("TRASCAR_PORT", "8000")))
# En el servidor de producción se usa 127.0.0.1 (solo Nginx puede entrar); en el PC, 0.0.0.0.
HOST = os.environ.get("TRASCAR_HOST", "0.0.0.0")
# Claves iniciales de admin y conductor (solo se usan al crear la base de datos).
CLAVE_ADMIN = os.environ.get("TRASCAR_CLAVE_ADMIN", "admin123")
CLAVE_CONDUCTOR = os.environ.get("TRASCAR_CLAVE_CONDUCTOR", "conductor123")

# Horas de servicio: las 24 horas, excepto 6-8am y 6-8pm (pico y placa).
HORA_INICIO, HORA_FIN = 0, 24
HORAS_BLOQUEADAS = list(range(6, 8)) + list(range(18, 20))
MAX_DURACION = 4

# Sábado de referencia inicial: ese sábado SÍ se trabaja, el siguiente no, y así alternando.
SABADO_REF_INICIAL = "2026-10-31"

EXT_FOTO = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
MAX_FOTOS = 6
MAX_BYTES_FOTO = 5_000_000

TIPOS_ESTATICOS = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    **EXT_FOTO,
}

