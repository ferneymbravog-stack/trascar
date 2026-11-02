// CONTROLADOR · Borrado de historial, citas y clientes (solo admin).
import { Api } from "../models/api.js";
import { MantenimientoView as V } from "../views/mantenimientoView.js";

let alCambiar = () => {};

async function ejecutar(pregunta, accion, mensajeOk) {
  if (!V.confirmar(pregunta)) return;
  try {
    const r = await accion();
    V.exito(mensajeOk(r));
    alCambiar();
  } catch (e) {
    V.error(e.message);
  }
}

export const MantenimientoController = {
  init({ onCambio }) {
    alCambiar = onCambio;
    V.onHistorial(() => ejecutar(
      "¿Borrar el historial (citas completadas, canceladas y rechazadas)?",
      () => Api.limpiarCitas("historial"), (r) => `Historial borrado (${r.borradas} citas)`));
    V.onTodas(() => ejecutar(
      "¿Borrar TODAS las citas, incluso las pendientes y confirmadas? No se puede deshacer.",
      () => Api.limpiarCitas("todas"), (r) => `Se borraron ${r.borradas} citas`));
    V.onClientes(() => ejecutar(
      "¿Borrar TODOS los clientes y sus citas? Se conservan admin y conductor. No se puede deshacer.",
      () => Api.borrarClientes(), (r) => `Se borraron ${r.borrados} clientes y sus citas`));
  },
};

