import { useStore } from '@nanostores/react';
import { agendaDelDia, fechaSeleccionada } from '@/context/agenda.store';
import { useMemo } from 'react';

// Función para formatear la hora desde un string ISO
const formatHora = (isoString: string) => {
  const fecha = new Date(isoString);
  return fecha.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export default function TurnosDelDia() {
  const agenda = useStore(agendaDelDia);
  const diaSeleccionado = useStore(fechaSeleccionada);

  // Filtramos para quedarnos solo con los turnos ocupados
  const turnosOcupados = useMemo(() => {
    return agenda.filter(slot => !slot.disponible);
  }, [agenda]);

  const formattedDate = diaSeleccionado
    ? new Intl.DateTimeFormat('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(diaSeleccionado)
    : 'Seleccione una fecha';

  return (
    <div className="w-full">
      <h4 className="text-lg font-semibold mb-4 text-primary-100 capitalize">
        {formattedDate}
      </h4>
      {turnosOcupados.length > 0 ? (
        <ul className="space-y-2">
          {turnosOcupados.map(slot => (
            <li
              key={slot.hora}
              className="flex items-center justify-between gap-4 p-3 border rounded-md w-full bg-primary-bg-componentes shadow-sm border-primary-100/20"
            >
              <span className="font-mono text-base w-16">
                {formatHora(slot.hora)}
              </span>
              <div className="flex-grow">
                <p className="font-bold text-white">
                  {slot.turnoInfo?.paciente}
                </p>
                <p className="text-sm text-gray-400">
                  Duración: {slot.turnoInfo?.duracion} min
                </p>
              </div>
              <div className="w-32 text-right">
                <button className="text-xs text-gray-500 hover:text-white">
                  Ver Detalles
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-sm text-gray-400">No hay turnos agendados para este día.</p>
      )}
    </div>
  );
}
