// VISTA · Formulario para agendar un acarreo.
import { $, esc, mensaje } from "../utils.js";
import { esNoche, formatoHora } from "../models/horario.js";

export const AgendaView = {
  prepararFormulario() {
    const hoy = new Date();
    hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
    $("fecha").min = hoy.toISOString().slice(0, 10);
    $("dur").innerHTML = [1, 2, 3, 4].map((n) => `<option value="${n}">${n} hora(s)</option>`).join("");
  },

  onFecha(cb) { $("fecha").addEventListener("change", cb); },
  onDuracion(cb) { $("dur").addEventListener("change", cb); },
  onSolicitar(cb) { $("nueva").addEventListener("submit", (e) => { e.preventDefault(); cb(); }); },

  fecha() { return $("fecha").value; },
  duracion() { return +$("dur").value || 1; },
  datos() {
    return { fecha: $("fecha").value, duracion: this.duracion(), origen: $("origen").value, destino: $("destino").value, descripcion: $("desc").value };
  },

  limpiarHoras() { $("horas").innerHTML = ""; },

  /** Dibuja los botones de hora. `alElegir(hora)` se llama al seleccionar una libre. */
  mostrarHoras(respuesta, alElegir) {
    const caja = $("horas");
    caja.innerHTML = "";
    if (!respuesta.laboral) {
      caja.innerHTML = `<span class="err">No se trabaja: ${esc(respuesta.motivo)}</span>`;
      return;
    }
    respuesta.horas.forEach((h) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "hora" + (esNoche(h.hora) ? " noche" : "");
      b.textContent = (esNoche(h.hora) ? "🌙 " : "") + formatoHora(h.hora);
      if (!h.libre) {
        b.className = "hora ocupada";
      } else {
        b.addEventListener("click", () => {
          caja.querySelectorAll(".hora").forEach((x) => x.classList.remove("sel"));
          b.classList.add("sel");
          alElegir(h.hora);
        });
      }
      caja.appendChild(b);
    });
  },

  avisoNoche(visible) {
    const a = $("anoche");
    a.classList.toggle("hide", !visible);
    if (visible) {
      a.innerHTML = "⚠️ <span><b>Tarifa nocturna:</b> el horario elegido incluye horas de noche (8pm–6am), por lo que el valor del acarreo <b>se incrementa</b>. El conductor le confirmará el valor final.</span>";
    }
  },

  exito(texto) { mensaje($("nmsg"), texto, "msg"); },
  error(texto) { mensaje($("nmsg"), texto, "err"); },
};

