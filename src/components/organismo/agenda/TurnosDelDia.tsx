import {
  agendaDelDia,
  fechaSeleccionada,
  setFechaYHora,
  setPaciente,
} from '@/context/agenda.store';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { Calendar, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import TurnoCard from './TurnoCard';

export default function TurnosDelDia() {
  const agenda = useStore(agendaDelDia);
  const diaSeleccionado = useStore(fechaSeleccionada);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<any>(null);

  const turnosOcupados = useMemo(() => {
    return agenda.filter(slot => !slot.disponible).sort((a, b) => a.hora.localeCompare(b.hora));
  }, [agenda]);

  // Handlers para las acciones del menú
  const handleVerDetalles = (slot: any) => {
    setTurnoSeleccionado(slot);

    // Aquí podrías abrir un modal de detalles
  };

  const handleReagendar = (slot: any) => {
    if (!diaSeleccionado) return;
    setPaciente({
      id: slot.turnoInfo.pacienteId,
      nombre: `${slot.turnoInfo.pacienteNombre} ${slot.turnoInfo.pacienteApellido}`,
    });
    setFechaYHora();
    document.getElementById('dialog-modal-modalNuevoTurno')?.showModal();
  };

  const handleCancelar = async (slot: any) => {
    try {
      const responseFetch = await fetch(`/api/agenda/turnos/cancelar?id=${slot.turnoInfo.id}`, {
        method: 'DELETE',
      });

      if (!responseFetch.ok) {
        showToast('Error al cancelar el turno', { background: 'bg-red-500' });
        throw new Error('Error al cancelar el turno');
      }

      const data = await responseFetch.json();
      console.log('Turno cancelado exitosamente:', data);
      agendaDelDia.set([...agendaDelDia.get().filter(slot => slot.turnoInfo?.id !== data.data.id)]);
      showToast('Turno cancelado exitosamente', { background: 'bg-green-500' });
    } catch (error) {
      console.error('Error al cancelar el turno:', error);
      showToast('Error al cancelar el turno', { background: 'bg-red-500' });
    }
  };

  const handleLlamar = (slot: any) => {
    console.log('Llamar al paciente:', slot);
    // Integración con teléfono
  };

  const handleWhatsApp = (slot: any) => {
    const fechaTurno = new Date(slot.hora);
    const pacienteNombre = slot.turnoInfo?.paciente || 'Paciente';

    const fechaFormateada = fechaTurno.toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const horaFormateada = fechaTurno.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const mensaje = `¡Hola ${pacienteNombre}! 👋
  
  *Recordatorio de Turno Médico* 🏥
  
  *Fecha:* ${fechaFormateada}
  *Hora:* ${horaFormateada}
  *Duración:* ${slot.turnoInfo?.duracion || 30} minutos
  *Profesional:* Dr. ${slot.turnoInfo?.profesionalNombre} ${slot.turnoInfo?.profesionalApellido}
  
  *Agregar a calendario:*
  📅 https://calendar.google.com/calendar/render?action=TEMPLATE&dates=20241215T140000Z/20241215T143000Z&text=Consulta+Médica
  
  Llegar 15 minutos antes. Confirmar asistencia respondiendo este mensaje.
  
  ¿Preguntas? Respondé aquí.`;

    const telefono = slot.turnoInfo?.pacienteCelular || '3855815662';
    const linkWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    window.open(linkWhatsApp, '_blank');
  };
  const formattedDate = diaSeleccionado
    ? new Intl.DateTimeFormat('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(diaSeleccionado)
    : 'Seleccione una fecha';

  if (turnosOcupados.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary-300" />
          <h4 className="text-lg font-semibold text-primary-100 capitalize">{formattedDate}</h4>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-700/50 flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-400 font-medium mb-1">No hay turnos agendados</p>
          <p className="text-gray-500 text-sm">Los turnos aparecerán aquí cuando se agenden</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header con contador */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-300" />
          <h4 className="text-lg font-semibold text-primary-100 capitalize">{formattedDate}</h4>
        </div>
        <span className="px-2 py-1 bg-primary-500/20 text-primary-300 text-xs font-medium rounded-full">
          {turnosOcupados.length} turno{turnosOcupados.length !== 1 ? 's' : ''}
        </span>
      </div>
      {/* Lista de turnos */}
      <div className="space-y-2">
        {turnosOcupados.map((slot, index) => (
          <TurnoCard
            key={`${slot.hora}-${index}`}
            slot={slot}
            onVerDetalles={handleVerDetalles}
            onReagendar={handleReagendar}
            onCancelar={handleCancelar}
            onLlamar={handleLlamar}
            onWhatsApp={handleWhatsApp}
          />
        ))}
      </div>
      {/* Resumen del día
      <div className="mt-4 p-3 bg-primary-bg-componentes text-primary-textoTitle rounded-lg border ">
        <div className="flex justify-between text-sm border-b border-primary-200">
          <span>Total de horas:</span>
          <span className="font-medium">
            {turnosOcupados.reduce((total, slot) => total + (slot.turnoInfo?.duracion || 30), 0)}{' '}
            min
          </span>
        </div>
        <div className="flex justify-between text-sm border-b border-primary-200 mt-1">
          <span>Promedio por turno:</span>
          <span className="font-medium">
            {Math.round(
              turnosOcupados.reduce((total, slot) => total + (slot.turnoInfo?.duracion || 30), 0) /
                turnosOcupados.length
            )}{' '}
            min
          </span>
        </div>
      </div> */}
    </div>
  );
}
