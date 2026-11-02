// VISTA · Portada, galería de fotos de la camioneta y visor ampliado.
import { $, mensaje } from "../utils.js";

const CAMION = `<svg viewBox="0 0 120 60" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"><path d="M4 40V26h46l8-12h28l10 14 12 3v9z"/><circle cx="30" cy="42" r="8" fill="#1642c4"/><circle cx="90" cy="42" r="8" fill="#1642c4"/></svg>`;

export const GaleriaView = {
  iniciar() {
    $("lb").addEventListener("click", () => $("lb").classList.add("hide"));
    $("galeria").addEventListener("click", (e) => {
      const del = e.target.closest("button[data-borrar]");
      if (del) return this._borrar && this._borrar(del.dataset.borrar);
      const img = e.target.closest("img[data-nombre]");
      if (img) this.ampliar(img.dataset.nombre);
    });
  },

  onBorrar(cb) { this._borrar = cb; },
  onSubir(cb) {
    $("formFoto").addEventListener("submit", (e) => { e.preventDefault(); cb($("archivo").files[0]); });
  },

  render(fotos, esAdmin) {
    $("heroFoto").innerHTML = fotos.length
      ? `<img src="/fotos/${fotos[0]}" alt="Camioneta Trascar">`
      : `<div class="ph">${CAMION}<b>Foto de la camioneta</b><small>Aún no hay foto cargada</small></div>`;

    $("galeria").innerHTML = fotos.length
      ? fotos.map((n) => `<div class="it"><img src="/fotos/${n}" data-nombre="${n}" alt="Camioneta">${esAdmin ? `<button class="del" type="button" data-borrar="${n}">Eliminar</button>` : ""}</div>`).join("")
      : `<div class="slot">📷<br>Espacio para foto de la camioneta<br>(frente, lateral, platón…)</div>`.repeat(3);
  },

  ampliar(nombre) {
    $("lbi").src = "/fotos/" + nombre;
    $("lb").classList.remove("hide");
  },

  confirmarBorrado() { return confirm("¿Eliminar esta foto?"); },
  limpiarArchivo() { $("archivo").value = ""; },
  exito(texto) { mensaje($("fmsg"), texto, "msg"); },
  error(texto) { mensaje($("fmsg"), texto, "err"); },
};

