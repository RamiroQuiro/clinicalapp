const formatDate = (fecha,tipo) => {
    const date = new Date(fecha);
    const opciones = {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
  
    const opcionesConHora = { // NEW OPTIONS FOR DATE AND TIME
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false // Use 24-hour format
    };

  if (!tipo) {
      return date.toLocaleDateString('es-AR',opciones)
  }
  if (tipo==1) {
    return date.toLocaleDateString('es-AR')
  }
  if (tipo==='datetime') { // NEW TYPE FOR DATE AND TIME
    return date.toLocaleString('es-AR', opcionesConHora);
  }
  };

  export default formatDate