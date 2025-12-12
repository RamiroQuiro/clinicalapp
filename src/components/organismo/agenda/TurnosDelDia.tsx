import { Calendar, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import TurnoCard from './TurnoCard';

function TurnosSkeletonLoader() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
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

export default function TurnosDelDia({
  agenda,
  diaSeleccionado,
  onChangeReagendar,
  handleCancelarTurno,
  isLoading,
}: {
  agenda: any;
  diaSeleccionado: Date;
  onChangeReagendar: (slot: any) => void;
  handleCancelarTurno: (slot: any) => void;
  isLoading: boolean;
}) {
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<any>(null);
  // console.log('agenda, dentro de TurnosDia', agenda)

  // Filtrar solo turnos agendados (excluir licencias)
  const turnosOcupados = useMemo(() => {
    return agenda
      .map((agendaProf: any) => {
        return agendaProf.agenda
          .filter(
            (slot: any) => !slot.disponible && slot.turnoInfo !== null // Solo turnos, no licencias
          )
          .sort((a: any, b: any) => a.hora.localeCompare(b.hora));
      })
      .flat();
  }, [agenda]);

  // Filtrar slots bloqueados por licencia
  const diasConLicencia = useMemo(() => {
    return agenda
      .map((agendaProf: any) => {
        return agendaProf.agenda.filter(
          (slot: any) => !slot.disponible && slot.licenciaInfo !== null
        );
      })
      .flat();
  }, [agenda]);
  console.log('turnosOcupados', turnosOcupados);
  console.log('diasConLicencia', diasConLicencia);

  // Handlers para las acciones del menú
  const handleVerDetalles = (slot: any) => {
    setTurnoSeleccionado(slot);

    // Aquí podrías abrir un modal de detalles
  };

  const handleReagendar = (slot: any) => {
    onChangeReagendar(slot);
  };

  const handleCancelar = async (slot: any) => {
    handleCancelarTurno(slot);
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

        {isLoading ? (
          <TurnosSkeletonLoader />
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-700/50 flex items-center justify-center">
              <Clock className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-400 font-medium mb-1">No hay turnos agendados</p>
            <p className="text-gray-500 text-sm">Los turnos aparecerán aquí cuando se agenden</p>
          </div>
        )}
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
          {diasConLicencia.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gray-700"></div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Licencias</span>
                <div className="h-px flex-1 bg-gray-700"></div>
              </div>
              {diasConLicencia.map((slot: any, index: number) => (
                <div
                  key={`licencia-${index}`}
                  className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-orange-300">
                          {slot.licenciaInfo?.tipo === 'vacaciones' && '🏖️ Vacaciones'}
                          {slot.licenciaInfo?.tipo === 'enfermedad' && '🏥 Enfermedad'}
                          {slot.licenciaInfo?.tipo === 'personal' && '👤 Personal'}
                          {slot.licenciaInfo?.tipo === 'capacitacion' && '📚 Capacitación'}
                          {slot.licenciaInfo?.tipo === 'otro' && '📋 Otro'}
                        </h5>
                        <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs font-medium rounded">
                          {slot.licenciaInfo?.estado}
                        </span>
                      </div>
                      {slot.licenciaInfo?.motivo && (
                        <p className="text-sm text-gray-400 mb-2">{slot.licenciaInfo.motivo}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Desde:{' '}
                          {new Date(slot.licenciaInfo?.fechaInicio).toLocaleDateString('es-AR')}
                        </span>
                        <span>
                          Hasta: {new Date(slot.licenciaInfo?.fechaFin).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-orange-500/5 rounded text-xs text-orange-300/80">
                    ⚠️ No se pueden agendar turnos durante este período
                  </div>
                </div>
              ))}
            </div>
          )}
          {isLoading ? (
            <TurnosSkeletonLoader />
          ) : (
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
          )}
        </div>

        {/* Mostrar días con licencia */}
      </div>
    );
  }
}
