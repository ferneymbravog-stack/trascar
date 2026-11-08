"""Servidor HTTP: sirve la vista estática, despacha la API y mantiene vivo el servicio 24/7."""
import json
import os
import threading
import time
import urllib.request
from collections import namedtuple
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs

from . import config
from .errors import ErrorHTTP
from .models import foto_model, sesion_model
from .rutas import RUTAS

Peticion = namedtuple("Peticion", "usuario cuerpo query")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    # ---------- respuestas ----------
    def _enviar(self, codigo, cuerpo, tipo, cache=False):
        self.send_response(codigo)
        self.send_header("Content-Type", tipo)
        self.send_header("Content-Length", str(len(cuerpo)))
        if not cache:
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        self.end_headers()
        self.wfile.write(cuerpo)

    def _json(self, codigo, datos):
        self._enviar(codigo, json.dumps(datos, ensure_ascii=False).encode(), "application/json; charset=utf-8")

    def _archivo(self, ruta):
        ext = os.path.splitext(ruta)[1].lower()
        with open(ruta, "rb") as f:
            self._enviar(200, f.read(), config.TIPOS_ESTATICOS.get(ext, "application/octet-stream"))

    # ---------- entrada ----------
    def _cuerpo(self):
        n = int(self.headers.get("Content-Length") or 0)
        try:
            return json.loads(self.rfile.read(n) or b"{}")
        except ValueError:
            return {}

    def do_GET(self):
        self._despachar("GET")

    def do_POST(self):
        self._despachar("POST")

    def _estatico(self, ruta):
        """Sirve la vista (static/) y las fotos. Devuelve True si respondió."""
        if ruta.startswith("/fotos/"):
            archivo = foto_model.ruta_segura(ruta[7:])
            if archivo:
                self._archivo(archivo)
                return True
            return False
        rel = "index.html" if ruta in ("/", "") else ruta.lstrip("/")
        archivo = os.path.realpath(os.path.join(config.STATIC, rel))
        if archivo.startswith(os.path.realpath(config.STATIC) + os.sep) and os.path.isfile(archivo):
            self._archivo(archivo)
            return True
        return False

    def _despachar(self, metodo):
        ruta, _, qs = self.path.partition("?")
        if metodo == "GET" and not ruta.startswith("/api/") and self._estatico(ruta):
            return
        definicion = RUTAS.get((metodo, ruta))
        if not definicion:
            return self._json(404, {"error": "No encontrado"})
        controlador, roles = definicion
        usuario = sesion_model.obtener(self.headers.get("Authorization", ""))
        if roles is not None:
            if not usuario:
                return self._json(401, {"error": "Inicie sesión"})
            if roles and usuario.rol not in roles:
                return self._json(403, {"error": "No permitido"})
        query = {k: v[0] for k, v in parse_qs(qs).items()}
        cuerpo = self._cuerpo() if metodo == "POST" else {}
        try:
            codigo, datos = controlador(Peticion(usuario, cuerpo, query))
        except ErrorHTTP as e:
            return self._json(e.codigo, {"error": e.mensaje})
        self._json(codigo, datos)


def _keep_alive_24_7():
    """Hace ping periódico a la URL pública para evitar que el servidor entre en reposo."""
    url = config.PUBLIC_URL.rstrip("/") + "/api/ping"
    while True:
        time.sleep(480)  # cada 8 minutos
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Trascar-KeepAlive"})
            urllib.request.urlopen(req, timeout=10).close()
        except Exception:
            pass


def ejecutar():
    threading.Thread(target=_keep_alive_24_7, daemon=True).start()
    print(f"Agenda Trascar en http://localhost:{config.PORT}")
    ThreadingHTTPServer((config.HOST, config.PORT), Handler).serve_forever()
