"""Utilidades de contraseñas."""
import hashlib
import secrets


def hash_pw(pw, salt=None):
    salt = salt or secrets.token_hex(8)
    h = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 100_000).hex()
    return f"{salt}${h}"


def check_pw(pw, guardada):
    salt, _ = guardada.split("$")
    return secrets.compare_digest(hash_pw(pw, salt), guardada)

