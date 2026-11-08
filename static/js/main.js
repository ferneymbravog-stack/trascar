// Punto de entrada: conecta controladores, vistas y sincronización en tiempo real 24/7.
import { Sesion } from "./models/sesion.js";
import { AuthController } from "./controllers/authController.js";
import { AgendaController } from "./controllers/agendaController.js";
import { CitasController } from "./controllers/citasController.js";
import { ConfigController } from "./controllers/configController.js";
import { GaleriaController } from "./controllers/galeriaController.js";
import { MantenimientoController } from "./controllers/mantenimientoController.js";
import { UsuariosController } from "./controllers/usuariosController.js";
import { LayoutView } from "./views/layoutView.js";

let temporizadorVivo = null;

async function refrescarEnVivo() {
  if (!Sesion.activa() || document.hidden) return;
  try {
    await Promise.all([
      CitasController.cargar(),
      UsuariosController.cargar(),
    ]);
  } catch { /* ignorar fallos momentáneos de red */ }
}

async function entrar() {
  const rol = Sesion.rol;
  LayoutView.mostrarApp(Sesion.nombre, rol);
  AgendaController.entrar(rol);
  await Promise.all([
    CitasController.entrar(rol),
    UsuariosController.entrar(rol),
    ConfigController.entrar(rol),
    GaleriaController.entrar(rol),
  ]);
  if (temporizadorVivo) clearInterval(temporizadorVivo);
  temporizadorVivo = setInterval(refrescarEnVivo, 10000);
}

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) refrescarEnVivo();
});

AuthController.init({ onEntrar: entrar });
AgendaController.init({ onCreada: () => { CitasController.cargar(); UsuariosController.cargar(); } });
CitasController.init({ onCambio: () => { AgendaController.recargarHoras(); UsuariosController.cargar(); } });
UsuariosController.init({ onCambio: () => { CitasController.cargar(); AgendaController.recargarHoras(); } });
ConfigController.init();
MantenimientoController.init({
  onCambio: () => {
    CitasController.cargar();
    UsuariosController.cargar();
    AgendaController.recargarHoras();
  },
});
GaleriaController.init();
LayoutView.onSalir(() => AuthController.salir());

// La portada con la foto es pública; el resto depende de la sesión.
if (Sesion.activa()) entrar();
else {
  LayoutView.mostrarAuth();
  GaleriaController.entrar("");
}
