const extraerHora = fecha => {
  const date = new Date(fecha);

  const hora = date.toLocaleDateString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return hora.split(',')[1];
};
export default extraerHora;
