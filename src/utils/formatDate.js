const formatDate = (fecha,tipo) => {
    const date = new Date(fecha);
    const opciones = {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
  
  if (!tipo) {
      return date.toLocaleDateString('es-AR',opciones)
  }
  if (tipo==1) {
    return date.toLocaleDateString('es-AR')
  }
  };

  export default formatDate