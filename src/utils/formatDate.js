const formatDate = (fecha) => {
    const date = new Date(fecha);
    const opciones = {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
  
    return date.toLocaleDateString('es-AR',opciones)
  };

  export default formatDate