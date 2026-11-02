// VISTA · Panel del administrador para borrar información.
import { $, mensaje } from "../utils.js";

export const MantenimientoView = {
  onHistorial(cb) { $("btnHistorial").addEventListener("click", cb); },
  onTodas(cb) { $("btnTodas").addEventListener("click", cb); },
  onClientes(cb) { $("btnClientes").addEventListener("click", cb); },
  confirmar(texto) { return confirm(texto); },
  exito(texto) { mensaje($("mmsg"), texto, "msg"); },
  error(texto) { mensaje($("mmsg"), texto, "err"); },
};

