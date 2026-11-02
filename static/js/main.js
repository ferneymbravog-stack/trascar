// Punto de entrada: conecta controladores y vistas.
import { Sesion } from "./models/sesion.js";
import { AuthController } from "./controllers/authController.js";
import { AgendaController } from "./controllers/agendaController.js";
import { CitasController } from "./controllers/citasController.js";
import { ConfigController } from "./controllers/configController.js";
import { GaleriaController } from "./controllers/galeriaController.js";
import { MantenimientoController } from "./controllers/mantenimientoController.js";
import { LayoutView } from "./views/layoutView.js";

async function entrar() {
  const rol = Sesion.rol;
  LayoutView.mostrarApp(Sesion.nombre, rol);
  AgendaController.entrar(rol);
  await Promise.all([CitasController.entrar(rol), ConfigController.entrar(rol), GaleriaController.entrar(rol)]);
}

AuthController.init({ onEntrar: entrar });
AgendaController.init({ onCreada: () => CitasController.cargar() });
CitasController.init({ onCambio: () => AgendaController.recargarHoras() });
ConfigController.init();
MantenimientoController.init({ onCambio: () => { CitasController.cargar(); AgendaController.recargarHoras(); } });
GaleriaController.init();
LayoutView.onSalir(() => AuthController.salir());

// La portada con la foto es pública; el resto depende de la sesión.
if (Sesion.activa()) entrar();
else {
  LayoutView.mostrarAuth();
  GaleriaController.entrar("");
}

