import { useStore } from '@nanostores/react';
import {
  agendaDelDia,
  fechaSeleccionada,
  setFechaYHora,
} from '@/context/agenda.store';
import { useMemo } from 'react';

// Función para formatear la hora desde un string ISO (ej: '14:30')
const formatHora = (isoString: string) => {
  const fecha = new Date(isoString);
  return fecha.toLocaleTimeString(navigator.language, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export default function HorariosDisponibles() {
  const agenda = useStore(agendaDelDia);
  const dia = useStore(fechaSeleccionada);

  const horariosDisponibles = useMemo(() => {
    return agenda.filter(slot => slot.disponible);
  }, [agenda]);

  const handleAgendarClick = (hora: string) => {
    if (!dia) return;

    // 1. Actualizamos el store con la fecha y la hora seleccionadas
    const horaFormateada = formatHora(hora);
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
              {formatHora(slot.hora)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
