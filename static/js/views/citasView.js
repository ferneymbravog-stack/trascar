// VISTA · Tabla de citas (se muestra como tarjetas en celular).
import { $, esc } from "../utils.js";
import { formatoHora } from "../models/horario.js";

const TITULOS = { conductor: "Agenda del conductor", admin: "Todas las citas", cliente: "Mis citas" };

function acciones(c, rol) {
  const boton = (estado, clase, texto) => `<button type="button" class="btn-${clase}" data-id="${c.id}" data-estado="${estado}">${texto}</button>`;
  let a = "";
  if ((rol === "admin" || rol === "conductor") && c.estado === "pendiente") {
    a += boton("confirmada", "ok", "Confirmar") + boton("rechazada", "no", "Rechazar");
  }
  if ((rol === "admin" || rol === "conductor") && c.estado === "confirmada") a += boton("completada", "ok", "Completar");
  if (rol !== "conductor" && ["pendiente", "confirmada"].includes(c.estado)) a += boton("cancelada", "no", "Cancelar");
  if (rol === "admin") a += boton("eliminar", "del", "🗑 Borrar");
  return a;
}

export const CitasView = {
  onAccion(cb) {
    $("tabla").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-id]");
      if (b) cb(+b.dataset.id, b.dataset.estado);
    });
  },

  onFiltro(cb) {
    $("buscar").addEventListener("input", cb);
    $("filtroEstado").addEventListener("change", cb);
  },
  onBorrarFiltradas(cb) { $("btnBorrarFiltradas").addEventListener("click", cb); },
  filtro() { return { texto: $("buscar").value, estado: $("filtroEstado").value }; },

  /** Resumen sobre la lista: "Mostrando X de Y" y botón para borrar lo mostrado (solo admin). */
  resumen(mostradas, total, rol, hayFiltro) {
    $("contador").textContent = `Mostrando ${mostradas} de ${total} citas`;
    $("btnBorrarFiltradas").classList.toggle("hide", !(rol === "admin" && hayFiltro && mostradas > 0));
    $("btnBorrarFiltradas").textContent = `🗑 Borrar las ${mostradas} citas mostradas`;
  },

  render(lista, rol) {
    $("ttl").textContent = TITULOS[rol] || "Citas";
    const cabecera = "<thead><tr><th>Fecha</th><th>Hora</th><th>Cliente</th><th>Ruta</th><th>Detalle</th><th>Estado</th><th></th></tr></thead>";
    if (!lista.length) {
      $("tabla").innerHTML = cabecera + '<tbody><tr><td colspan="7" class="vacio">Aún no hay citas.</td></tr></tbody>';
      return;
    }
    const filas = lista.map((c) => {
      const a = acciones(c, rol);
      return `<tr>
        <td data-l="Fecha">${esc(c.fecha)}</td>
        <td data-l="Hora">${formatoHora(c.hora)} – ${formatoHora(c.hora + c.duracion)}</td>
        <td data-l="Cliente"><span>${esc(c.cliente)}<br>${esc(c.telefono)}</span></td>
        <td data-l="Ruta">${esc(c.origen)} → ${esc(c.destino)}</td>
        <td data-l="Detalle">${esc(c.descripcion)}</td>
        <td data-l="Estado"><span class="tag ${esc(c.estado)}">${esc(c.estado)}</span></td>
        <td class="celda-acc">${a ? `<div class="acciones">${a}</div>` : ""}</td>
      </tr>`;
    }).join("");
    $("tabla").innerHTML = cabecera + "<tbody>" + filas + "</tbody>";
  },
};

