// VISTA · Módulo de usuarios registrados y resumen general (solo administrador).
import { $, esc } from "../utils.js";

const ETIQUETA_ROL = {
  cliente: '<span class="tag completada">Cliente</span>',
  conductor: '<span class="tag confirmada">Conductor</span>',
  admin: '<span class="tag pendiente">Admin</span>',
};

export const UsuariosView = {
  onBuscar(cb) { $("buscarUsuario").addEventListener("input", cb); },
  filtro() { return $("buscarUsuario").value; },

  onAccion(cb) {
    $("tablaUsuarios").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-accion]");
      if (b) cb(b.dataset.accion, +b.dataset.uid, b.dataset.unombre);
    });
  },

  resumen(mostrados, listaCompleta) {
    const clientes = listaCompleta.filter((u) => u.rol === "cliente");
    const totalCitas = listaCompleta.reduce((s, u) => s + (u.total_citas || 0), 0);
    const pendientes = listaCompleta.reduce((s, u) => s + (u.pendientes || 0), 0);
    const confComp = listaCompleta.reduce((s, u) => s + (u.confirmadas || 0) + (u.completadas || 0), 0);

    $("stClientes").textContent = clientes.length;
    $("stTotalCitas").textContent = totalCitas;
    $("stPendientes").textContent = pendientes;
    $("stConfirmadas").textContent = confComp;
    $("contadorUsuarios").textContent = `Personas registradas: ${listaCompleta.length} (${clientes.length} clientes) · Mostrando ${mostrados}`;
  },

  render(lista) {
    const cabecera = "<thead><tr><th>#</th><th>Nombre completo</th><th>Usuario</th><th>Teléfono / Contacto</th><th>Rol</th><th>Actividad de citas</th><th>Fecha registro</th><th>Acciones</th></tr></thead>";
    if (!lista.length) {
      $("tablaUsuarios").innerHTML = cabecera + '<tbody><tr><td colspan="8" class="vacio">No se encontraron personas registradas.</td></tr></tbody>';
      return;
    }
    const filas = lista.map((u) => {
      const fechaReg = u.creado ? esc(u.creado.replace("T", " ")) : "—";
      const telLimpio = String(u.telefono || "").replace(/\D/g, "");
      const waNum = telLimpio.length === 10 ? "57" + telLimpio : telLimpio;
      const htmlTel = u.telefono
        ? `<a class="tel-link" href="tel:${esc(u.telefono)}">${esc(u.telefono)}</a>` +
          (waNum ? ` <a class="wa-badge" href="https://wa.me/${waNum}" target="_blank" rel="noopener">WhatsApp</a>` : "")
        : "—";

      const desglose = u.total_citas
        ? `<b>${u.total_citas} total</b> · <small>${u.pendientes || 0} pend · ${u.confirmadas || 0} conf · ${u.completadas || 0} comp · ${u.canceladas || 0} canc` +
          (u.ultima_cita ? `<br>Última: ${esc(u.ultima_cita)}` : "") + `</small>`
        : "Sin citas";

      let acciones = `<button type="button" class="btn-ghost btn-sm" data-accion="ver" data-uid="${u.id}" data-unombre="${esc(u.nombre)}">🔍 Citas</button>`;
      acciones += ` <button type="button" class="btn-ghost btn-sm" data-accion="clave" data-uid="${u.id}" data-unombre="${esc(u.nombre)}">🔑 Clave</button>`;
      if (u.rol === "cliente") {
        acciones += ` <button type="button" class="btn-del" data-accion="eliminar" data-uid="${u.id}" data-unombre="${esc(u.nombre)}">🗑 Eliminar</button>`;
      }

      return `<tr>
        <td data-l="ID">#${u.id}</td>
        <td data-l="Nombre"><b>${esc(u.nombre)}</b></td>
        <td data-l="Usuario"><code>@${esc(u.usuario)}</code></td>
        <td data-l="Teléfono"><span>${htmlTel}</span></td>
        <td data-l="Rol">${ETIQUETA_ROL[u.rol] || esc(u.rol)}</td>
        <td data-l="Citas"><span>${desglose}</span></td>
        <td data-l="Registro">${fechaReg}</td>
        <td class="celda-acc"><div class="acciones">${acciones}</div></td>
      </tr>`;
    }).join("");
    $("tablaUsuarios").innerHTML = cabecera + "<tbody>" + filas + "</tbody>";
  },
};
