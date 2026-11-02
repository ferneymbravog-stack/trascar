// CONTROLADOR · Fotos de la camioneta (todos las ven; el admin las sube y elimina).
import { Api } from "../models/api.js";
import { GaleriaView } from "../views/galeriaView.js";

let esAdmin = false;

async function cargar() {
  GaleriaView.render(await Api.fotos(), esAdmin);
}

function leerArchivo(archivo) {
  return new Promise((ok, fallo) => {
    const lector = new FileReader();
    lector.onload = () => ok(lector.result);
    lector.onerror = () => fallo(new Error("No se pudo leer el archivo"));
    lector.readAsDataURL(archivo);
  });
}

export const GaleriaController = {
  init() {
    GaleriaView.iniciar();

    GaleriaView.onSubir(async (archivo) => {
      if (!archivo) return GaleriaView.error("Elija un archivo");
      try {
        await Api.subirFoto(archivo.name.split(".").pop(), await leerArchivo(archivo));
        GaleriaView.exito("Foto subida");
        GaleriaView.limpiarArchivo();
        await cargar();
      } catch (e) {
        GaleriaView.error(e.message);
      }
    });

    GaleriaView.onBorrar(async (nombre) => {
      if (!GaleriaView.confirmarBorrado()) return;
      try {
        await Api.borrarFoto(nombre);
        await cargar();
      } catch (e) {
        GaleriaView.error(e.message);
      }
    });
  },
  entrar(rol) { esAdmin = rol === "admin"; return cargar(); },
  cargar,
};

