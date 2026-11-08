"""Tabla de rutas: (método, ruta) -> (controlador, roles permitidos).

roles = None  -> ruta pública
roles = ()    -> cualquier usuario con sesión
roles = (...) -> solo esos roles
"""
from .controllers import auth_controller, cita_controller, config_controller, foto_controller

RUTAS = {
    ("GET", "/api/ping"): (lambda p: (200, {"ok": True}), None),
    ("POST", "/api/login"): (auth_controller.login, None),
    ("POST", "/api/logout"): (auth_controller.logout, None),
    ("POST", "/api/registro"): (auth_controller.registro, None),
    ("GET", "/api/fotos"): (foto_controller.listar, None),
    ("POST", "/api/fotos"): (foto_controller.subir, ("admin",)),
    ("POST", "/api/fotos/borrar"): (foto_controller.borrar, ("admin",)),
    ("GET", "/api/disponibilidad"): (cita_controller.disponibilidad, ()),
    ("GET", "/api/citas"): (cita_controller.listar, ()),
    ("POST", "/api/citas"): (cita_controller.crear, ("cliente", "admin")),
    ("POST", "/api/citas/estado"): (cita_controller.cambiar_estado, ()),
    ("POST", "/api/citas/eliminar"): (cita_controller.eliminar, ("admin",)),
    ("POST", "/api/citas/limpiar"): (cita_controller.limpiar, ("admin",)),
    ("GET", "/api/usuarios"): (auth_controller.listar_usuarios, ("admin",)),
    ("POST", "/api/usuarios/clave"): (auth_controller.cambiar_clave_usuario, ("admin",)),
    ("POST", "/api/usuarios/eliminar"): (auth_controller.eliminar_usuario, ("admin",)),
    ("POST", "/api/clientes/borrar"): (auth_controller.borrar_clientes, ("admin",)),
    ("GET", "/api/config"): (config_controller.obtener, ("admin",)),
    ("POST", "/api/config"): (config_controller.guardar, ("admin",)),
}
