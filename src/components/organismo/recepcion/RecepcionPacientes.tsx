import Input from '@/components/atomos/Input';
import CardSalaEspera from '@/components/moleculas/CardSalaEspera';
import CardTurnoRecepcion from '@/components/moleculas/CardTurnoRecepcion';
import Section from '@/components/moleculas/Section';
import type { AgendaSlot } from '@/context/agenda.store';
import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';
import { recepcionStore, updateTurnoStatus } from '../../../context/recepcion.store';

type Props = {
  userId: string;
};

export default function RecepcionPacientes({ userId }: Props) {
  const [pacientesEnEsperaDB, setPacientesEnEsperaDB] = useState([]);
  const { turnosDelDia, isLoading } = useStore(recepcionStore);

  useEffect(() => {
    const getData = async () => {
      recepcionStore.setKey('isLoading', true);
      recepcionStore.setKey('isLoading', false);
    };
    getData();
    return () => {};
  }, [userId]);

  const handleRecepcion = (slot: AgendaSlot) => {
    updateTurnoStatus(slot.turnoInfo?.id ?? '', 'sala_de_espera');
  };

  const handleAtender = (slot: AgendaSlot) => {
    window.location.href = `/api/atencion/nueva?pacienteId=${slot.turnoInfo?.pacienteId}&turnoId=${slot.turnoInfo?.id}`;
  };
  return (
    <div className="flex flex-  gap-4 items-start justify-between">
      <Section title="🤒 Recepcion de Pacientes" className="flex  flex-1 flex-col">
        <Input type="search" placeholder="Buscar paciente" />
        <div className="flex flex-col mt-4 gap-2">
          {turnosDelDia
            .filter((turno): AgendaSlot => turno.disponible == false)
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
