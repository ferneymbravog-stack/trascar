// CONTROLADOR · Configuración del sábado de referencia (solo admin).
import { Api } from "../models/api.js";
import { ConfigView } from "../views/configView.js";

export const ConfigController = {
  init() {
    ConfigView.onGuardar(async (sabado) => {
      try {
        await Api.guardarConfig(sabado);
        ConfigView.exito("Guardado");
      } catch (e) {
        ConfigView.error(e.message);
      }
    });
  },
  async entrar(rol) {
    if (rol === "admin") ConfigView.mostrar((await Api.config()).sabado_ref);
  },
};

