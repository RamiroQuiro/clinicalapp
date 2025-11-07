
import { Calendar, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import TurnoCard from './TurnoCard';



function TurnosSkeletonLoader() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 border border-primary-border rounded-lg animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-primary-texto/30 rounded w-1/4"></div>
            <div className="h-4 bg-primary-texto/30 rounded w-1/6"></div>
          </div>
          <div className="h-4 bg-primary-texto/30 rounded w-1/2 mt-3"></div>
        </div>
      ))}
    </div>
  );
}

export default function TurnosDelDia({ agenda, diaSeleccionado, onChangeReagendar, handleCancelarTurno, isLoading }: { agenda: any, diaSeleccionado: Date, onChangeReagendar: (slot: any) => void, handleCancelarTurno: (slot: any) => void, isLoading: boolean }) {

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
    onChangeReagendar(slot);

  };

  const handleCancelar = async (slot: any) => {
    handleCancelarTurno(slot)
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

        {
          isLoading ? (
            <TurnosSkeletonLoader />
          ) :


            (<div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-700/50 flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 font-medium mb-1">No hay turnos agendados</p>
              <p className="text-gray-500 text-sm">Los turnos aparecerán aquí cuando se agenden</p>
            </div>)}
      </div>
    );
  }
  if (turnosOcupados.length > 0) {

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
          {
            isLoading ? (
              <TurnosSkeletonLoader />
            ) :
              turnosOcupados.map((slot: any, index: string) => (
                <TurnoCard
                  key={`${slot.hora}-${index}`}
                  slot={slot}
                  onVerDetalles={handleVerDetalles}
                  onReagendar={handleReagendar}
                  onCancelar={handleCancelar}
                  onLlamar={handleLlamar}
                  onWhatsApp={handleWhatsApp}
                />
              ))
          }
        </div>
      </div>
    );
  }
}
