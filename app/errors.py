"""Error HTTP controlado: los controladores lo lanzan y el servidor lo convierte en respuesta."""


class ErrorHTTP(Exception):
    def __init__(self, codigo, mensaje):
        super().__init__(mensaje)
        self.codigo = codigo
        self.mensaje = mensaje

