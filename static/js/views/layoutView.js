// VISTA · Estructura general: encabezado, sesión y paneles visibles según el rol.
import { $ } from "../utils.js";
import { NOMBRES_ROL } from "../models/horario.js";

export const LayoutView = {
  onSalir(cb) { $("btnSalir").addEventListener("click", cb); },

  mostrarAuth() {
    $("auth").classList.remove("hide");
    $("app").classList.add("hide");
    $("quien").classList.add("hide");
  },

  mostrarApp(nombre, rol) {
    $("auth").classList.add("hide");
    $("app").classList.remove("hide");
    $("quien").classList.remove("hide");
    $("quienNombre").textContent = nombre;
    $("quienRol").textContent = NOMBRES_ROL[rol] || rol;
    $("avatar").textContent = (nombre || "?").trim().charAt(0).toUpperCase();
    $("nueva").classList.toggle("hide", rol === "conductor");
    $("cfg").classList.toggle("hide", rol !== "admin");
    $("mant").classList.toggle("hide", rol !== "admin");
    $("formFoto").classList.toggle("hide", rol !== "admin");
  },
};

