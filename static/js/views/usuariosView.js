// VISTA · Módulo de usuarios registrados (solo administrador).
import { $, esc } from "../utils.js";

const ETIQUETA_ROL = {
  cliente: '<span class="tag completada">Cliente</span>',
  conductor: '<span class="tag confirmada">Conductor</span>',
  admin: '<span class="tag pendiente">Admin</span>',
};

export const UsuariosView = {
  onBuscar(cb) { $("buscarUsuario").addEventListener("input", cb); },
  filtro() { return $("buscarUsuario").value; },

  onEliminar(cb) {
    $("tablaUsuarios").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-uid]");
      if (b) cb(+b.dataset.uid, b.dataset.unombre);
    });
  },

  resumen(mostrados, totalClientes) {
    $("contadorUsuarios").textContent = `Clientes registrados: ${totalClientes} · Mostrando ${mostrados}`;
  },

  render(lista) {
    const cabecera = "<thead><tr><th>Nombre</th><th>Usuario</th><th>Teléfono</th><th>Rol</th><th>Citas</th><th>Registro</th><th></th></tr></thead>";
    if (!lista.length) {
      $("tablaUsuarios").innerHTML = cabecera + '<tbody><tr><td colspan="7" class="vacio">No se encontraron usuarios.</td></tr></tbody>';
      return;
    }
    const filas = lista.map((u) => {
      const fechaReg = u.creado ? esc(u.creado.replace("T", " ")) : "—";
      const infoCitas = `${u.total_citas} total` + (u.citas_activas ? ` (${u.citas_activas} activa${u.citas_activas > 1 ? "s" : ""})` : "");
      const btnBorrar = u.rol === "cliente"
        ? `<button type="button" class="btn-del" data-uid="${u.id}" data-unombre="${esc(u.nombre)}">🗑 Eliminar</button>`
        : "";
      return `<tr>
        <td data-l="Nombre"><b>${esc(u.nombre)}</b></td>
        <td data-l="Usuario"><code>@${esc(u.usuario)}</code></td>
        <td data-l="Teléfono">${esc(u.telefono || "—")}</td>
        <td data-l="Rol">${ETIQUETA_ROL[u.rol] || esc(u.rol)}</td>
        <td data-l="Citas">${infoCitas}</td>
        <td data-l="Registro">${fechaReg}</td>
        <td class="celda-acc">${btnBorrar}</td>
      </tr>`;
    }).join("");
    $("tablaUsuarios").innerHTML = cabecera + "<tbody>" + filas + "</tbody>";
  },
};

