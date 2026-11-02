// CONTROLADOR · Listado de citas, búsqueda y cambios de estado.
import { Api } from "../models/api.js";
import { CitasView } from "../views/citasView.js";

let rolActual = "";
let todas = [];
let mostradas = [];
let alCambiar = () => {};

const normalizar = (s) => String(s ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function aplicarFiltro() {
  const { texto, estado } = CitasView.filtro();
  const palabras = normalizar(texto).split(/\s+/).filter(Boolean);
  mostradas = todas.filter((c) => {
    if (estado && c.estado !== estado) return false;
    const pajar = normalizar([c.cliente, c.telefono, c.origen, c.destino, c.descripcion, c.fecha, c.estado].join(" "));
    return palabras.every((p) => pajar.includes(p));
  });
  CitasView.render(mostradas, rolActual);
  CitasView.resumen(mostradas.length, todas.length, rolActual, !!(palabras.length || estado));
}

async function cargar() {
  todas = await Api.citas();
  aplicarFiltro();
}

export const CitasController = {
  init({ onCambio }) {
    alCambiar = onCambio;
    CitasView.onFiltro(aplicarFiltro);

    CitasView.onAccion(async (id, estado) => {
      try {
        if (estado === "eliminar") {
          if (!confirm("¿Borrar esta cita definitivamente?")) return;
          await Api.eliminarCita(id);
        } else {
          await Api.cambiarEstado(id, estado);
        }
        await cargar();
        alCambiar();
      } catch (e) {
        alert(e.message);
      }
    });

    CitasView.onBorrarFiltradas(async () => {
      if (!mostradas.length) return;
      if (!confirm(`¿Borrar definitivamente las ${mostradas.length} citas que se muestran? No se puede deshacer.`)) return;
      try {
        await Api.eliminarCitas(mostradas.map((c) => c.id));
        await cargar();
        alCambiar();
      } catch (e) {
        alert(e.message);
      }
    });
  },
  entrar(rol) { rolActual = rol; return cargar(); },
  cargar,
};
