import Input from '@/components/atomos/Input';
import CardSalaEsperaDetallada from '@/components/moleculas/CardSalaEsperaDetallada';
import CardTurnoRecepcion from '@/components/moleculas/CardTurnoRecepcion';
import Section from '@/components/moleculas/Section';
import type { AgendaSlot } from '@/context/agenda.store';
import { useSSE } from '@/hook/useSSE';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { CheckCheck, Clock } from 'lucide-react';
import { useMemo } from 'react';
import { recepcionStore, setTurnoEstado } from '../../../context/recepcion.store';

type Props = {
  userId: string;
};

export default function RecepcionPacientes({ userId }: Props) {
  const { turnosDelDia, isLoading, ultimaActualizacion } = useStore(recepcionStore);
  const { sseConectado } = useSSE(userId);

  // ✅ USAREMOS useMemo para derivar el estado de forma eficiente
  const turnosAgendadosDia = useMemo(() => {
    return turnosDelDia
      .filter(turno => !turno.disponible)
      .sort((a, b) => new Date(a.hora).getTime() - new Date(b.hora).getTime());
  }, [turnosDelDia]);

  const colaDeEspera = useMemo(() => {
    return (
      turnosDelDia
        .filter(turno => turno.turnoInfo?.estado === 'sala_de_espera')
        // Opcional: ordenar la cola de espera también, por ejemplo por hora de llegada
        .sort(
          (a, b) =>
            new Date(a.turnoInfo.horaLlegadaPaciente).getTime() -
            new Date(b.turnoInfo.horaLlegadaPaciente).getTime()
        )
    );
  }, [turnosDelDia]);

  console.log('🔌 Estado SSE:', sseConectado ? '🟢 Conectado' : '🔴 Desconectado');
  console.log('Ultima actualizacion ->', ultimaActualizacion);

  const handleRecepcion = (slot: AgendaSlot) => {
    if (slot.turnoInfo?.estado === 'confirmado') return;
    const isIdTurnoEspera = turnosDelDia.filter(
      (turno): AgendaSlot =>
        turno.turnoInfo?.estado === 'sala_de_espera' && turno.turnoInfo?.id === slot.turnoInfo?.id
    );
    if (isIdTurnoEspera.length) {
      showToast('Turno ya en sala de espera', { background: 'bg-yellow-600' });
      return;
    }

    setTurnoEstado(slot, 'sala_de_espera');
  };

  const handleAtender = (slot: AgendaSlot) => {
    window.location.href = `/api/atencion/nueva?pacienteId=${slot.turnoInfo?.pacienteId}&turnoId=${slot.turnoInfo?.id}`;
  };
  return (
    <div className="flex flex-  gap-2 items-start justify-between">
      <Section title="🤒 Recepcion de Pacientes" className="flex  flex-1 min-w-[50%]  flex-col">
        <Input type="search" placeholder="Buscar paciente" />
        <div key={1} className="flex flex-col mt-4 gap-2">
          {turnosAgendadosDia.length === 0 ? (
            <div className="w-full">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 font-medium mb-1">No hay turnos agendados</p>
                <p className="text-gray-500 text-sm">
                  Los turnos aparecerán aquí cuando se agenden
                </p>
              </div>
            </div>
          ) : (
            turnosAgendadosDia
              .sort((a, b) => {
                return a.turnoInfo?.estado === 'sala_de_espera' ? 1 : -1;
              })
              .map((turno: AgendaSlot) => (
                <CardTurnoRecepcion
                  key={turno.turnoInfo.id}
                  slot={turno}
                  onVerDetalles={() => { }}
                  onReagendar={() => { }}
                  onCancelar={() => { }}
                  onLlamar={() => { }}
                  onRecibirPaciente={handleRecepcion}
                />
              ))
          )}
        </div>
      </Section>
      <Section title="🚀 Proximos turnos" classContent="flex flex-1 min-w-[50%]  flex-col ">
        <div key={2} className="flex flex-col gap-2  w-full">
          {colaDeEspera.length === 0 ? (
            <div className="w-full">
              <div className="text-center py-5">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <CheckCheck className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400 font-medium mb-1">No hay turnos Recepcionados</p>
                <p className="text-gray-500 text-sm">Los turnos recepcionados aparecerán aquí</p>
              </div>
            </div>
          ) : (
            colaDeEspera.map((turno: AgendaSlot, i: number) => (
              <CardSalaEsperaDetallada
                key={i}
                turno={turno}
                index={i}
                onAtender={() => { }}
                onSubir={() => { }}
                onBajar={() => { }}
                onNotificar={() => { }}
                onLlamar={() => { }}
              />
            ))
          )}
        </div>
      </Section>
    </div>
  );
}
