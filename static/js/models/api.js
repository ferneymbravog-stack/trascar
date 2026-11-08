// MODELO · Cliente de la API del servidor (sin caché para datos en tiempo real).
import { Sesion } from "./sesion.js";

export class ApiError extends Error {
  constructor(mensaje, estado) {
    super(mensaje);
    this.estado = estado;
  }
}

async function peticion(ruta, metodo = "GET", cuerpo) {
  const r = await fetch(ruta, {
    method: metodo,
    cache: "no-store",
    headers: {
      Authorization: Sesion.token,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  let datos = {};
  try { datos = await r.json(); } catch { /* respuesta sin cuerpo */ }
  if (!r.ok) {
    if (r.status === 401 && Sesion.activa()) {
      Sesion.cerrar();
      location.reload();
    }
    throw new ApiError(datos.error || "Error", r.status);
  }
  return datos;
}

export const Api = {
  login: (usuario, clave) => peticion("/api/login", "POST", { usuario, clave }),
  logout: (token) => peticion("/api/logout", "POST", { token }),
  registro: (datos) => peticion("/api/registro", "POST", datos),
  fotos: () => peticion("/api/fotos"),
  subirFoto: (ext, data) => peticion("/api/fotos", "POST", { ext, data }),
  borrarFoto: (nombre) => peticion("/api/fotos/borrar", "POST", { nombre }),
  disponibilidad: (fecha) => peticion("/api/disponibilidad?fecha=" + encodeURIComponent(fecha)),
  citas: () => peticion("/api/citas"),
  crearCita: (datos) => peticion("/api/citas", "POST", datos),
  cambiarEstado: (id, estado) => peticion("/api/citas/estado", "POST", { id, estado }),
  eliminarCita: (id) => peticion("/api/citas/eliminar", "POST", { id }),
  eliminarCitas: (ids) => peticion("/api/citas/eliminar", "POST", { ids }),
  limpiarCitas: (alcance) => peticion("/api/citas/limpiar", "POST", { alcance }),
  usuarios: () => peticion("/api/usuarios"),
  cambiarClaveUsuario: (id, clave) => peticion("/api/usuarios/clave", "POST", { id, clave }),
  eliminarUsuario: (id) => peticion("/api/usuarios/eliminar", "POST", { id }),
  borrarClientes: () => peticion("/api/clientes/borrar", "POST", {}),
  config: () => peticion("/api/config"),
  guardarConfig: (sabado_ref) => peticion("/api/config", "POST", { sabado_ref }),
};
