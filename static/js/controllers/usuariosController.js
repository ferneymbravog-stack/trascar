// CONTROLADOR · Gestión y visualización de usuarios registrados (solo admin).
import { Api } from "../models/api.js";
import { UsuariosView } from "../views/usuariosView.js";
import { $ } from "../utils.js";

let rolActual = "";
let todos = [];
let alCambiar = () => {};

const normalizar = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function aplicarFiltro() {
  const palabras = normalizar(UsuariosView.filtro()).split(/\s+/).filter(Boolean);
  const mostrados = todos.filter((u) => {
    const pajar = normalizar([u.id, u.nombre, u.usuario, u.telefono, u.rol, u.creado].join(" "));
    return palabras.every((p) => pajar.includes(p));
  });
  UsuariosView.render(mostrados);
  UsuariosView.resumen(mostrados.length, todos);
}

async function cargar() {
  if (rolActual !== "admin") return;
  todos = await Api.usuarios();
  aplicarFiltro();
}

export const UsuariosController = {
  init({ onCambio }) {
    alCambiar = onCambio;
    UsuariosView.onBuscar(aplicarFiltro);
    UsuariosView.onAccion(async (accion, id, nombre) => {
      if (accion === "ver") {
        $("buscar").value = nombre;
        $("buscar").dispatchEvent(new Event("input"));
        $("ttl").scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (accion === "clave") {
        const nueva = prompt(`Escriba la nueva clave para "${nombre}" (mínimo 6 caracteres):`);
        if (!nueva) return;
        try {
          await Api.cambiarClaveUsuario(id, nueva);
          alert(`Clave actualizada para ${nombre}.`);
        } catch (e) {
          alert(e.message);
        }
        return;
      }
      if (accion === "eliminar") {
        if (!confirm(`¿Eliminar definitivamente a "${nombre}" y todas sus citas?`)) return;
        try {
          await Api.eliminarUsuario(id);
          await cargar();
          alCambiar();
        } catch (e) {
          alert(e.message);
        }
      }
    });
  },
  entrar(rol) {
    rolActual = rol;
    return cargar();
  },
  cargar,
};
