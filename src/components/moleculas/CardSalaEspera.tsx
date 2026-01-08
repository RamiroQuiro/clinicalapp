import type { AgendaSlot } from '@/context/agenda.store';
import extraerHora from '@/utils/extraerHora';
import { SquareArrowOutUpRight, Volume2 } from 'lucide-react';
import Button from '../atomos/Button';
import { Card } from '../organismo/Card';

type Props = {
  turno: AgendaSlot;
  index: number;
  onLlamarPaciente?: (turno: AgendaSlot) => void;
};

export default function CardSalaEspera({ turno, index, onLlamarPaciente }: Props) {
  const handleAtender = (turno: AgendaSlot) => {
    window.location.href = `/api/atencion/nueva?pacienteId=${turno.turnoInfo?.pacienteId}&turnoId=${turno.turnoInfo?.id}`;
  };

  const handleLlamar = () => {
    if (onLlamarPaciente) {
      onLlamarPaciente(turno);
    }
  };

  const esEspontaneo = turno.turnoInfo?.tipoDeTurno?.toLowerCase() === 'espontaneo';

  return (
    <Card
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 gap-3 border-l-4 rounded-lg ${
        esEspontaneo
          ? 'border-l-orange-500 bg-white hover:bg-orange-50'
          : 'border-l-blue-500 bg-white hover:bg-blue-50'
      }`}
    >
      {/* Número y badge - Responsive */}
      <div className="flex flex-col flex-1 items-start gap-2 min-w-[90px]">
        <div className="flex justify-start items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
              esEspontaneo
                ? 'bg-orange-100 text-orange-800 border border-orange-300'
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}
          >
            {index + 1}
          </div>

          <div
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              esEspontaneo
                ? 'bg-orange-100 text-orange-800 border border-orange-200'
                : 'bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            {esEspontaneo ? 'Hoy' : 'Programado'}
          </div>
        </div>
        {/* Información del paciente - Responsive */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex flex-col sm:flex-col sm:items-start gap-2">
            <p className="font-medium text-sm truncate capitalize">
              {turno.turnoInfo?.pacienteNombre} {turno.turnoInfo?.pacienteApellido}
            </p>
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <span>DNI: {turno.turnoInfo?.pacienteDocumento}</span>
              <span>•</span>
              <span className="truncate">{turno.turnoInfo?.motivoConsulta || 'Sin motivo'}</span>
            </div>
          </div>
        </div>
      </div>
      {/* HORAS y ACCIONES - Responsive */}
      <div className="flex flex-row :flex-col justify-between items-center sm:items-center gap-4 w-auto 500">
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          {!esEspontaneo && (
            <div className="text-left">
              <p className="font-semibold text-gray-600 text-xs">{extraerHora(turno.hora)}</p>
              <p className="text-gray-400 text-xs">Turno</p>
            </div>
          )}

          <div className="text-left">
            <p className="font-semibold text-gray-600 text-xs">
              {extraerHora(turno.turnoInfo?.horaLlegadaPaciente) || '--:--'}
            </p>
            <p className="text-gray-400 text-xs">{esEspontaneo ? 'Ingreso' : 'Llegada'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          {/* Botón de llamar - Nuevo */}
          <Button
            onClick={handleLlamar}
            variant="green"
            className={`flex items-center gap-1 px-3 w-full py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap `}
            title="Llamar paciente"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Llamar</span>
          </Button>

          {/* Botón de atender - Existente */}
          <Button
            variant={esEspontaneo ? 'secondary' : 'primary'}
            onClick={() => handleAtender(turno)}
            className={`flex items-center gap-1 px-3 w-full py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap `}
            title="Atender paciente"
          >
            <SquareArrowOutUpRight className="w-4 h-4" />
            <span className="hidden sm:inline">Atender</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
