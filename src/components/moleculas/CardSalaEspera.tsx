import type { AgendaSlot } from '@/context/agenda.store';
import extraerHora from '@/utils/extraerHora';
import { Clock, Menu, View } from 'lucide-react';

type Props = {
  turno: AgendaSlot;
  index: number;
};

export default function CardSalaEspera({ turno, index }: Props) {
  const handleAtender = (turno: AgendaSlot) => {
    window.location.href = `/api/atencion/nueva?pacienteId=${turno.turnoInfo?.pacienteId}&turnoId=${turno.turnoInfo?.id}`;
  };
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      <Menu className="w-6 h-6 active:cursor-grabbing text-primary-texto/50 -ml-2 cursor-grab" />
      <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">
        {index + 1}
      </div>

      <div className="flex-1">
        <p className="font-medium text-sm capitalize">
          {turno.turnoInfo?.pacienteNombre} {turno.turnoInfo?.pacienteApellido}
        </p>
        <p className="text-xs text-gray-500">
          {extraerHora(turno.turnoInfo?.horaTurno)} • DNI: {turno.turnoInfo?.pacienteDocumento}
        </p>
      </div>

      <View
        onClick={() => handleAtender(turno)}
        className="w-6 h-6 cursor-pointer text-primary-texto"
      />
      <Clock className="w-6 h-6 text-primary-texto cursor-pointer" />
    </div>
  );
}
