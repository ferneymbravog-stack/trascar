"""Acceso a SQLite, creación del esquema y respaldo automático en la nube."""
import base64
import json
import sqlite3
import threading
import urllib.request
from contextlib import contextmanager

from . import config
from .seguridad import hash_pw

_lock = threading.Lock()


def _token_github():
    if config.GITHUB_TOKEN:
        return config.GITHUB_TOKEN
    try:
        c = sqlite3.connect(config.DB)
        r = c.execute("SELECT valor FROM config WHERE clave='github_token'").fetchone()
        c.close()
        return r[0] if r else ""
    except Exception:
        return ""


def _subir_db_github(token):
    if not token or not config.GITHUB_REPO:
        return
    url = f"https://api.github.com/repos/{config.GITHUB_REPO}/contents/agenda.db"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "Trascar-App",
        "Content-Type": "application/json",
    }
    try:
        sha = None
        req_get = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req_get, timeout=10) as resp:
                sha = json.loads(resp.read().decode()).get("sha")
        except Exception:
            pass
        with open(config.DB, "rb") as f:
            contenido = base64.b64encode(f.read()).decode()
        body = {"message": "Actualizacion automatica agenda.db", "content": contenido}
        if sha:
            body["sha"] = sha
        req_put = urllib.request.Request(url, data=json.dumps(body).encode(), headers=headers, method="PUT")
        urllib.request.urlopen(req_put, timeout=15).close()
    except Exception:
        pass


def respaldar_async():
    token = _token_github()
    if token:
        threading.Thread(target=_subir_db_github, args=(token,), daemon=True).start()


@contextmanager
def conexion(escritura=False):
    with _lock:
        c = sqlite3.connect(config.DB, timeout=15)
        c.row_factory = sqlite3.Row
        try:
            yield c
            c.commit()
        finally:
            c.close()
    if escritura:
        respaldar_async()


def init_db():
    with conexion() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS usuarios(
            id INTEGER PRIMARY KEY, usuario TEXT UNIQUE, clave TEXT, rol TEXT,
            nombre TEXT, telefono TEXT, creado TEXT);
        CREATE TABLE IF NOT EXISTS config(clave TEXT PRIMARY KEY, valor TEXT);
        CREATE TABLE IF NOT EXISTS citas(
            id INTEGER PRIMARY KEY, cliente_id INTEGER, fecha TEXT, hora INTEGER,
            duracion INTEGER, origen TEXT, destino TEXT, descripcion TEXT,
            estado TEXT DEFAULT 'pendiente', creada TEXT);
        CREATE TABLE IF NOT EXISTS sesiones(
            token TEXT PRIMARY KEY, usuario_id INTEGER, rol TEXT, nombre TEXT);
        """)
        cols = [r[1] for r in c.execute("PRAGMA table_info(usuarios)").fetchall()]
        if "creado" not in cols:
            c.execute("ALTER TABLE usuarios ADD COLUMN creado TEXT")
        if not c.execute("SELECT 1 FROM usuarios").fetchone():
            for u, p, r, n in [("admin", config.CLAVE_ADMIN, "admin", "Administrador"),
                               ("conductor", config.CLAVE_CONDUCTOR, "conductor", "Conductor")]:
                c.execute("INSERT INTO usuarios(usuario,clave,rol,nombre,telefono) VALUES(?,?,?,?,'')",
                          (u, hash_pw(p), r, n))
        if not c.execute("SELECT 1 FROM config WHERE clave='ref_fijada'").fetchone():
            c.execute("INSERT OR REPLACE INTO config VALUES('sabado_ref',?)", (config.SABADO_REF_INICIAL,))
            c.execute("INSERT INTO config VALUES('ref_fijada','1')")
