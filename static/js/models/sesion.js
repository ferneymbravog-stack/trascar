// MODELO · Sesión del usuario (guardada en localStorage).
export const Sesion = {
  get token() { return localStorage.t || ""; },
  get rol() { return localStorage.r || ""; },
  get nombre() { return localStorage.n || ""; },
  activa() { return !!(this.token && this.rol); },
  guardar({ token, rol, nombre }) {
    localStorage.t = token;
    localStorage.r = rol;
    localStorage.n = nombre;
  },
  cerrar() { localStorage.clear(); },
};

