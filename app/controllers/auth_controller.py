"""Controlador de autenticación y gestión de usuarios."""
from ..errors import ErrorHTTP
from ..models import sesion_model, usuario_model
from ..seguridad import check_pw


def login(p):
    u = usuario_model.buscar(str(p.cuerpo.get("usuario", "")).strip().lower())
    if not u or not check_pw(str(p.cuerpo.get("clave", "")), u["clave"]):
        raise ErrorHTTP(401, "Usuario o clave incorrectos")
    token = sesion_model.crear(u)
    return 200, {"token": token, "rol": u["rol"], "nombre": u["nombre"]}


def listar_usuarios(p):
    return 200, usuario_model.listar_clientes()


def eliminar_usuario(p):
    try:
        uid = int(p.cuerpo.get("id"))
    except (TypeError, ValueError):
        raise ErrorHTTP(400, "ID de usuario inválido")
    res = usuario_model.eliminar_usuario(uid)
    if res == "no_existe":
        raise ErrorHTTP(404, "El usuario no existe")
    if res == "protegido":
        raise ErrorHTTP(400, "No se puede eliminar al administrador ni al conductor")
    return 200, {"ok": True}


def borrar_clientes(p):
    return 200, {"ok": True, "borrados": usuario_model.eliminar_clientes()}


def registro(p):
    d = p.cuerpo
    usuario = str(d.get("usuario", "")).strip().lower()
    nombre = str(d.get("nombre", "")).strip()
    telefono = str(d.get("telefono", "")).strip()
    clave = str(d.get("clave", ""))
    if not (usuario and nombre and telefono) or len(clave) < 6:
        raise ErrorHTTP(400, "Complete todos los campos (clave mínimo 6 caracteres)")
    if not usuario_model.crear_cliente(usuario, nombre, telefono, clave):
        raise ErrorHTTP(400, "Ese usuario ya existe")
    return 200, {"ok": True}
