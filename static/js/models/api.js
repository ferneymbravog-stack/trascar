// MODELO · Cliente de la API del servidor.
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
    headers: { Authorization: Sesion.token, "Content-Type": "application/json" },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  let datos = {};
  try { datos = await r.json(); } catch { /* respuesta sin cuerpo */ }
  if (!r.ok) {
    // Sesión vencida (por ejemplo, el servidor se reinició): volver al ingreso.
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
  borrarClientes: () => peticion("/api/clientes/borrar", "POST", {}),
  config: () => peticion("/api/config"),
  guardarConfig: (sabado_ref) => peticion("/api/config", "POST", { sabado_ref }),
};

