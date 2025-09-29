import Button from '@/components/atomos/Button';
import Input from '@/components/atomos/Input';
import CardTurnoRecepcion from '@/components/moleculas/CardTurnoRecepcion';
import Section from '@/components/moleculas/Section';
import type { AgendaSlot } from '@/context/agenda.store';
import extraerHora from '@/utils/extraerHora';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { Clock, View } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  fetchSalaDeEspera,
  recepcionStore,
  setPacientesEnEspera,
} from '../../../context/recepcion.store';

type Props = {
  userId: string;
};

export default function RecepcionPacientes({ userId }: Props) {
  const [pacientesEnEsperaDB, setPacientesEnEsperaDB] = useState([]);
  const { turnosDelDia, isLoading, pacientesEnEspera } = useStore(recepcionStore);

  useEffect(() => {
    const getData = async () => {
      recepcionStore.setKey('isLoading', true);
      const data = await fetchSalaDeEspera(userId);
      recepcionStore.setKey('isLoading', false);
    };
    getData();
    return () => {};
  }, [userId]);

  const handleRecepcion = (slot: AgendaSlot) => {
    const isTurno = pacientesEnEspera.find(
      (turno: AgendaSlot) => turno.turnoInfo?.id === slot.turnoInfo?.id
    );
    if (isTurno) {
      showToast('Turno ya recibido', { background: 'bg-green-600' });
      return;
    }
    setPacientesEnEspera(slot);
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
              <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  {i + 1}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-sm capitalize">
                    {turno.turnoInfo?.pacienteNombre} {turno.turnoInfo?.pacienteApellido}
                  </p>
                  <p className="text-xs text-gray-500">
                    {extraerHora(turno.turnoInfo?.horaTurno)} • DNI:{' '}
                    {turno.turnoInfo?.pacienteDocumento}
                  </p>
                </div>

                <Button onClick={() => handleAtender(turno)} variant="indigo">
                  <View className="w-" />
                </Button>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            ))}
        </div>
      </Section>
    </div>
  );
}
