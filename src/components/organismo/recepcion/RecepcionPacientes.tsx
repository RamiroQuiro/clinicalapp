import Input from '@/components/atomos/Input';
import CardTurnoRecepcion from '@/components/moleculas/CardTurnoRecepcion';
import Section from '@/components/moleculas/Section';
import extraerHora from '@/utils/extraerHora';
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
            <div
              key={turno.id}
              className="border flex items-center justify-between rounded-lg px-4 py-2 "
            >
              <div className="w- h- rounded-lg bg-white flex-col font-medium shadow-sm  border br flex  gap-2 items-center justify-center text-wite p-2">
                <Clock className="w-5 h-5 " />
                <span className="text-sm font-medium leading-none">
                  {extraerHora(turno.turnoInfo?.horaTurno)}
                </span>
              </div>
              <div className="w- h-  font-medium flex flex-col text-primary-textoTitle items-start  g flex-1 justify-center text-wite px-2">
                <p className="font-medium capitalize">
                  {turno.turnoInfo?.pacienteNombre} {turno.turnoInfo?.pacienteApellido}
                </p>
                <p className="text-sm text-muted-foreground">
                  DNI: {turno.turnoInfo?.pacienteDocumento}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`p-2 px-4 rounded-full uppercase  border`}>
                  <p className="font-medium text-xl capitalize">{i + 1}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
