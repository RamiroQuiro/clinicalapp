const extraerHora = (fechaISO) => {
  // Si la fecha es nula, indefinida o inválida, retorna un placeholder.
  if (!fechaISO || isNaN(new Date(fechaISO).getTime())) {
    return '--:--';
  }

  try {
    const date = new Date(fechaISO);

    // Usamos toLocaleTimeString, que es la función correcta para obtener solo la hora.
    // Esto es más robusto y no depende de frágiles `split`.
    const hora = date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      // La zona horaria se infiere del string ISO, que ya fue ajustado en el store.
      // Por lo tanto, no es necesario forzarla aquí de nuevo.
    });

    return hora;
  } catch (error) {
    console.error("Error al formatear la fecha:", fechaISO, error);
    return 'Error';
  }
};

export default extraerHora;
