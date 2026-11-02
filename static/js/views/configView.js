// VISTA · Configuración del administrador (sábado de referencia).
import { $, mensaje } from "../utils.js";

export const ConfigView = {
  onGuardar(cb) { $("cfg").addEventListener("submit", (e) => { e.preventDefault(); cb($("sref").value); }); },
  mostrar(sabado) { $("sref").value = sabado; },
  exito(texto) { mensaje($("cmsg"), texto, "msg"); },
  error(texto) { mensaje($("cmsg"), texto, "err"); },
};

