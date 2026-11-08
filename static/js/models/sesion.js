// MODELO · Sesión segura en memoria (al recargar o cerrar la página se cierra el perfil).
let _token = "";
let _rol = "";
let _nombre = "";

// Limpiar cualquier sesión antigua que haya quedado guardada en el navegador
try {
  localStorage.clear();
  sessionStorage.clear();
} catch { /* ignorar */ }

export const Sesion = {
  get token() { return _token; },
  get rol() { return _rol; },
  get nombre() { return _nombre; },
  activa() { return !!(_token && _rol); },
  guardar({ token, rol, nombre }) {
    _token = token || "";
    _rol = rol || "";
    _nombre = nombre || "";
  },
  cerrar() {
    if (_token && navigator.sendBeacon) {
      try {
        navigator.sendBeacon("/api/logout", JSON.stringify({ token: _token }));
      } catch { /* ignorar */ }
    }
    _token = "";
    _rol = "";
    _nombre = "";
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch { /* ignorar */ }
  },
};

// Invalidar el token en el servidor apenas se recargue o cierre la pestaña
window.addEventListener("pagehide", () => Sesion.cerrar());
