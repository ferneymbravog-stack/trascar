// VISTA · Formularios de ingreso y registro.
import { $, mensaje } from "../utils.js";

export const AuthView = {
  iniciar() {
    // Mostrar / ocultar claves
    document.querySelectorAll(".eye").forEach((b) =>
      b.addEventListener("click", () => {
        const ids = b.dataset.target.split(",");
        const ver = $(ids[0]).type === "password";
        ids.forEach((i) => ($(i).type = ver ? "text" : "password"));
        document.querySelectorAll(`.eye[data-target="${b.dataset.target}"]`).forEach((x) => (x.textContent = ver ? "🙈" : "👁"));
      })
    );
    // Aviso en vivo de coincidencia de claves
    ["rc", "rc2"].forEach((i) => $(i).addEventListener("input", () => this.coincidencia()));
  },

  coincidencia() {
    const m = $("cmatch");
    if (!$("rc2").value) { m.textContent = ""; return; }
    const ok = $("rc").value === $("rc2").value;
    m.className = "match " + (ok ? "msg" : "err");
    m.textContent = ok ? "✔ Las claves coinciden" : "✖ Las claves no coinciden";
  },

  onLogin(cb) {
    $("formLogin").addEventListener("submit", (e) => { e.preventDefault(); cb($("lu").value, $("lc").value); });
  },
  onRegistro(cb) {
    $("formRegistro").addEventListener("submit", (e) => { e.preventDefault(); cb(this.datosRegistro()); });
  },
  datosRegistro() {
    return { nombre: $("rn").value, telefono: $("rt").value, usuario: $("ru").value, clave: $("rc").value, clave2: $("rc2").value };
  },

  errorLogin(texto) { mensaje($("lmsg"), texto, "err"); },
  errorRegistro(texto) { mensaje($("amsg"), texto, "err"); },
  exitoRegistro(texto) {
    mensaje($("amsg"), texto, "msg");
    $("formRegistro").reset();
    $("cmatch").textContent = "";
  },
};

