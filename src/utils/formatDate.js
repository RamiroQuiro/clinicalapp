const formatDate = (fecha, tipo) => {
  // Si la fecha no existe, no devuelvas nada o un placeholder.
  if (!fecha) {
    return 'N/A';
  }

  let date;
  // Si la 'fecha' es un número (timestamp), asegúrate de que esté en milisegundos.
  // Un timestamp en segundos (como los de Unix) es mucho más pequeño.
  if (typeof fecha === 'number') {
    // Heurística: si el número es menor a un umbral razonable, probablemente esté en segundos.
    if (fecha < 1000000000000) {
      date = new Date(fecha * 1000); // Convertir segundos a milisegundos
    } else {
      date = new Date(fecha); // Ya está en milisegundos
    }
  } else {
    // Si es un string (ej: "2025-09-09T12:00:00.000Z"), new Date() lo parsea.
    date = new Date(fecha);
  }

  // Verifica si la fecha resultante es válida.
  if (isNaN(date.getTime())) {
    return 'Fecha inválida';
  }
  const opciones = {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const opcionesConHora = {
    // NEW OPTIONS FOR DATE AND TIME
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false, // Use 24-hour format
  };

  if (!tipo) {
    return date.toLocaleDateString('es-AR', opciones);
  }
  if (tipo == 1) {
    return date.toLocaleDateString('es-AR');
  }
  if (tipo === 'datetime') {
    // NEW TYPE FOR DATE AND TIME
    return date.toLocaleString('es-AR', opcionesConHora);
  }
};

export default formatDate;
