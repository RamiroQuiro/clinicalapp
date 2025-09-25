import { agendaDelDia, fechaSeleccionada, setFechaYHora } from '@/context/agenda.store';
import { formatUtcToAppTime } from '@/utils/agendaTimeUtils';
import { useStore } from '@nanostores/react';
import { useMemo } from 'react';

export default function HorariosDisponibles() {
  const agenda = useStore(agendaDelDia);
  const dia = useStore(fechaSeleccionada);
  console.log('agenda del dia', agenda);

  const horariosDisponibles = useMemo(() => {
    return agenda.filter(slot => slot.disponible);
  }, [agenda]);

  console.log('horarios disponibles', horariosDisponibles);
  const handleAgendarClick = (hora: string) => {
    if (!dia) return;

    // 1. Actualizamos el store con la fecha y la hora seleccionadas (ya en formato correcto)
    const horaFormateada = formatUtcToAppTime(hora, 'HH:mm');
    setFechaYHora(dia, horaFormateada);

    // 2. Abrimos el modal usando el ID correcto que genera Modal.astro
    const modal = document.getElementById('dialog-modal-modalNuevoTurno') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  if (horariosDisponibles.length === 0) {
    return <p className="text-center text-sm text-gray-400">No hay horarios disponibles.</p>;
  }

  return (
    <div className="w-full">
      <ul className="grid grid-cols-3 gap-2">
        {horariosDisponibles.map(slot => (
          <li key={slot.hora}>
            <button
              onClick={() => handleAgendarClick(slot.hora)}
              className="w-full px-3 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors duration-200"
            >
              {formatUtcToAppTime(slot.hora, 'HH:mm')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
