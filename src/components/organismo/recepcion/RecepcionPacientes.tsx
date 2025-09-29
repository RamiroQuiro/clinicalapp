import Input from '@/components/atomos/Input';
import CardTurnoRecepcion from '@/components/moleculas/CardTurnoRecepcion';
import Section from '@/components/moleculas/Section';
import extraerHora from '@/utils/extraerHora';
import { showToast } from '@/utils/toast/toastShow';
import { useStore } from '@nanostores/react';
import { Clock } from 'lucide-react';
import { recepcionStore } from '../../../context/recepcion.store';

type Props = {
  userId: string;
};

export default function RecepcionPacientes({ userId }: Props) {
  // 1. El componente ahora lee directamente del store
  const { turnosDelDia, isLoading, pacientesEnEspera } = useStore(recepcionStore);

  // 2. La lógica de filtrado se mantiene, pero usando los datos del store
  const handleRecepcion = (slot: any) => {
    const isTurno = pacientesEnEspera.find((turno: any) => turno.id === slot.id);
    if (isTurno) {
      showToast('Turno ya recibido', { background: 'red' });
      return;
    }
    recepcionStore.setKey('pacientesEnEspera', [...pacientesEnEspera, slot]);
  };

  return (
    <div className="flex flex-  gap-4 items-start justify-between">
      <Section title="🤒 Recepcion de Pacientes" className="flex  flex-1 flex-col">
        <Input type="search" placeholder="Buscar paciente" />
        <div className="flex flex-col mt-4 gap-2">
          {turnosDelDia
            .filter((turno): any => turno.disponible == false)
            .map((turno: any) => (
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
          {pacientesEnEspera.map((turno, i) => (
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

              <Clock className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
