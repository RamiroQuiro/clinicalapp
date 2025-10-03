import Input from '@/components/atomos/Input';
import CardSalaEspera from '@/components/moleculas/CardSalaEspera';
import CardTurnoRecepcion from '@/components/moleculas/CardTurnoRecepcion';
import Section from '@/components/moleculas/Section';
import type { AgendaSlot } from '@/context/agenda.store';
import { useSSE } from '@/hook/useSSE';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { recepcionStore, setTurnoEstado } from '../../../context/recepcion.store';

type Props = {
  userId: string;
};

export default function RecepcionPacientes({ userId }: Props) {
  const { turnosDelDia, isLoading, ultimaActualizacion } = useStore(recepcionStore);
  const { sseConectado } = useSSE(userId);

  console.log('🔌 Estado SSE:', sseConectado ? '🟢 Conectado' : '🔴 Desconectado');

  console.log('turnosDelDia ->', turnosDelDia);
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
      <Section title="🤒 Recepcion de Pacientes" className="flex  flex-1 flex-col">
        <Input type="search" placeholder="Buscar paciente" />
        <div className="flex flex-col mt-4 gap-2">
          {turnosDelDia
            .filter((turno): AgendaSlot => turno.disponible === false)
            .map((turno: AgendaSlot) => (
              <CardTurnoRecepcion
                key={turno.id}
                slot={turno}
                onVerDetalles={() => {}}
                onReagendar={() => {}}
                onCancelar={() => {}}
                onLlamar={() => {}}
                onRecibirPaciente={handleRecepcion}
              />
            ))}
        </div>
      </Section>
      <Section title="🚀 Proximos turnos" classContent="flex  flex-col w-1/2">
        <div className="flex flex-col gap-2  w-full">
          {turnosDelDia
            .filter((turno): AgendaSlot => turno.turnoInfo?.estado === 'sala_de_espera')
            .map((turno, i) => (
              <CardSalaEspera key={i} turno={turno} index={i} />
            ))}
        </div>
      </Section>
    </div>
  );
}
