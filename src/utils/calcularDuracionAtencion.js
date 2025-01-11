


const calculoDuracionAtencion = (inicioAtencion, finAtencion) => {
    const inicio = new Date(inicioAtencion)
    // Calcula la duración en milisegundos
    const duracionMilisegundos = finAtencion - inicioAtencion;

    // Convierte la duración a otros formatos
    const duracionSegundos = Math.floor(duracionMilisegundos / 1000);
    const duracionMinutos = Math.floor(duracionSegundos / 60);
    const duracionHoras = Math.floor(duracionMinutos / 60);

    // Para formato más legible:
    const horas = Math.floor(duracionMinutos / 60);
    const minutos = duracionMinutos % 60;
    const segundos = duracionSegundos % 60;
    const fin = new Date(finAtencion)


    console.log(`Duración: ${horas}h ${minutos}m ${segundos}s`);
}