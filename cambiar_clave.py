"""Cambia la clave de un usuario (admin, conductor o cliente).

Uso:  python cambiar_clave.py admin NuevaClaveSegura
"""
import sys

from app.database import conexion, init_db
from app.seguridad import hash_pw

if len(sys.argv) != 3 or len(sys.argv[2]) < 6:
    sys.exit("Uso: python cambiar_clave.py USUARIO NUEVA_CLAVE   (clave de mínimo 6 caracteres)")

init_db()
with conexion() as c:
    n = c.execute("UPDATE usuarios SET clave=? WHERE usuario=?", (hash_pw(sys.argv[2]), sys.argv[1].lower())).rowcount
print("Clave actualizada." if n else "Ese usuario no existe.")

