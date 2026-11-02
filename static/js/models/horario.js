// MODELO · Reglas de horario (tarifa nocturna y formato de horas).

/** Nocturno: de 8pm a 6am. */
export function esNoche(h) {
  h %= 24;
  return h >= 20 || h < 6;
}

/** 13 -> "1:00 pm" */
export function formatoHora(h) {
  h %= 24;
  return ((h % 12) || 12) + ":00 " + (h < 12 ? "am" : "pm");
}

/** ¿Alguna hora del rango [inicio, inicio+duracion) es nocturna? */
export function incluyeNoche(inicio, duracion) {
  if (inicio === null) return false;
  return Array.from({ length: duracion || 1 }, (_, i) => inicio + i).some(esNoche);
}

export const NOMBRES_ROL = { admin: "Administrador", conductor: "Conductor", cliente: "Cliente" };

