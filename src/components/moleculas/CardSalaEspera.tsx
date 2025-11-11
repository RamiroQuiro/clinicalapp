import type { AgendaSlot } from '@/context/agenda.store';
import extraerHora from '@/utils/extraerHora';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Card } from '../organismo/Card';

type Props = {
  turno: AgendaSlot;
  index: number;
};

export default function CardSalaEspera({ turno, index }: Props) {
  const handleAtender = (turno: AgendaSlot) => {
    window.location.href = `/api/atencion/nueva?pacienteId=${turno.turnoInfo?.pacienteId}&turnoId=${turno.turnoInfo?.id}`;
  };
  return (
    <Card className="flex items-center justify-between p-3 gap-3 border rounded-lg">

      <div className="flex items-center gap-2">

        <div className="bg-primary-100/20 border-primary-100 border text-primary-100 w-8 h-8 rounded-full flex items-center justify-center font-bold">
          {index + 1}
        </div>

        <p className="text-xs font-semibold text-gray-500">{extraerHora(turno.turnoInfo?.horaLlegadaPaciente)}</p>

      </div>

      <div className="flex-1 flex flex-col items-start">
        <p className="font-medium text-sm capitalize">
          {turno.turnoInfo?.pacienteNombre} {turno.turnoInfo?.pacienteApellido}
        </p>
        <p className="text-xs font-semibold text-gray-500">
          DNI: {turno.turnoInfo?.pacienteDocumento}
        </p>
      </div>
      <div className="flex-1 flex flex-col items-start">
        <p className="text-xs font-semibold text-gray-500">
          {turno.turnoInfo?.tipoDeTurno} {turno.turnoInfo?.motivoConsulta}
        </p>
      </div>
      <div title="Atender" className="bg-primary-100/20 p-2 border-primary-100 border text-primary-100 w-8 h-8 rounded-full flex items-center justify-center font-bold">
        <SquareArrowOutUpRight
          onClick={() => handleAtender(turno)}

          className="w-6 h-6 cursor-pointer text-primary-100"
        />
      </div>
    </Card>
  );
}
