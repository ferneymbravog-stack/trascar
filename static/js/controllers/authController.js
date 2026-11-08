// CONTROLADOR · Ingreso y registro de usuarios.
import { Api } from "../models/api.js";
import { Sesion } from "../models/sesion.js";
import { AuthView } from "../views/authView.js";

export const AuthController = {
  init({ onEntrar }) {
    AuthView.iniciar();

    AuthView.onLogin(async (usuario, clave) => {
      try {
        Sesion.guardar(await Api.login(usuario, clave));
        onEntrar();
      } catch (e) {
        AuthView.errorLogin(e.message);
      }
    });

    AuthView.onRegistro(async (d) => {
      if (d.clave !== d.clave2) return AuthView.errorRegistro("Las claves no coinciden");
      try {
        await Api.registro({ nombre: d.nombre, telefono: d.telefono, usuario: d.usuario, clave: d.clave });
        AuthView.exitoRegistro("Registrado. Ya puede ingresar.");
      } catch (e) {
        AuthView.errorRegistro(e.message);
      }
    });
  },

  async salir() {
    const t = Sesion.token;
    Sesion.cerrar();
    try { if (t) await Api.logout(t); } catch { /* ignorar */ }
    location.reload();
  },
};
