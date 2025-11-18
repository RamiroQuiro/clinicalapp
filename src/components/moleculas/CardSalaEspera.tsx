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

  const esEspontaneo = turno.turnoInfo?.tipoDeTurno?.toLowerCase() === 'espontaneo';

  return (
    <Card className={`flex items-center justify-between p-3 gap-3 border-l-4 rounded-lg ${esEspontaneo
        ? 'border-l-orange-500 bg-white hover:bg-orange-50'
        : 'border-l-blue-500 bg-white hover:bg-blue-50'
      }`}>

      {/* Número y badge */}
      <div className="flex items-center gap-2 min-w-[90px]">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${esEspontaneo ? 'bg-orange-100 text-orange-800 border border-orange-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
          {index + 1}
        </div>

        <div className={`text-xs font-semibold px-2 py-1 rounded-full ${esEspontaneo
            ? 'bg-orange-100 text-orange-800 border border-orange-200'
            : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
          {esEspontaneo ? 'Hoy' : 'Program.'}
        </div>
      </div>

      {/* Información del paciente */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm capitalize truncate">
            {turno.turnoInfo?.pacienteNombre} {turno.turnoInfo?.pacienteApellido}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>DNI: {turno.turnoInfo?.pacienteDocumento}</span>
          <span>•</span>
          <span className="truncate">{turno.turnoInfo?.motivoConsulta || 'Sin motivo'}</span>
        </div>
      </div>

      {/* HORAS - Diferente según tipo de turno */}
      <div className="flex items-center gap-4">
        {!esEspontaneo && (
          <div className="text-right">
            <p className="text-xs font-semibold text-gray-600">
              {extraerHora(turno.hora)} {/* Hora del turno programado */}
            </p>
            <p className="text-xs text-gray-400">Turno</p>
          </div>
        )}

        <div className="text-right">
          <p className="text-xs font-semibold text-gray-600">
            {extraerHora(turno.turnoInfo?.horaLlegadaPaciente) || '--:--'}
          </p>
          <p className="text-xs text-gray-400">
            {esEspontaneo ? 'Ingreso' : 'Llegada'}
          </p>
        </div>

        <button
          onClick={() => handleAtender(turno)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${esEspontaneo
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          title="Atender paciente"
        >
          <SquareArrowOutUpRight className="w-4 h-4" />
          Atender
        </button>
      </div>
    </Card>
  );
}