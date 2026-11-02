// CONTROLADOR · Agendar un acarreo y mostrar disponibilidad de horas.
import { Api } from "../models/api.js";
import { incluyeNoche } from "../models/horario.js";
import { AgendaView } from "../views/agendaView.js";

let horaElegida = null;
let alCrear = () => {};

function actualizarAviso() {
  AgendaView.avisoNoche(incluyeNoche(horaElegida, AgendaView.duracion()));
}

async function recargarHoras() {
  horaElegida = null;
  actualizarAviso();
  if (!AgendaView.fecha()) return AgendaView.limpiarHoras();
  try {
    const r = await Api.disponibilidad(AgendaView.fecha());
    AgendaView.mostrarHoras(r, (h) => { horaElegida = h; actualizarAviso(); });
  } catch (e) {
    AgendaView.error(e.message);
  }
}

async function solicitar() {
  try {
    if (horaElegida === null) throw new Error("Elija una hora");
    await Api.crearCita({ ...AgendaView.datos(), hora: horaElegida });
    AgendaView.exito("Solicitud enviada");
    await recargarHoras();
    alCrear();
  } catch (e) {
    AgendaView.error(e.message);
  }
}

export const AgendaController = {
  init({ onCreada }) {
    alCrear = onCreada;
    AgendaView.onFecha(recargarHoras);
    AgendaView.onDuracion(actualizarAviso);
    AgendaView.onSolicitar(solicitar);
  },
  entrar() { AgendaView.prepararFormulario(); },
  recargarHoras,
};

