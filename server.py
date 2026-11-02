"""Agenda de acarreos Trascar - Toyota Hilux 1994.

Arquitectura MVC:
  app/models/       Modelos: acceso a datos y reglas del dominio
  app/controllers/  Controladores: validan la petición y orquestan los modelos
  static/           Vistas: HTML, CSS y JavaScript (con su propio MVC en static/js)

Roles: admin, conductor, cliente. Solo librería estándar. Ejecutar: python server.py
"""
from app.database import init_db
from app.http_server import ejecutar

if __name__ == "__main__":
    init_db()
    ejecutar()
