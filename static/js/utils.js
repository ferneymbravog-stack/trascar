// Utilidades de DOM compartidas por las vistas.
export const $ = (id) => document.getElementById(id);

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function mensaje(el, texto, tipo) {
  el.className = "msg-linea " + (tipo || "");
  el.textContent = texto;
}

