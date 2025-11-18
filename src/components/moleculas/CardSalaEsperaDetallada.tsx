import type { AgendaSlot } from '@/context/agenda.store';
import { useElapsedTime } from '@/hook/useElapsedTime';
import extraerHora from '@/utils/extraerHora';
import { ArrowDown, ArrowUp, Bell, Clock, Megaphone } from 'lucide-react';
import BotonIndigo from './BotonIndigo';

type Props = {
  turno: AgendaSlot;
  index: number;
  onAtender: (turno: AgendaSlot) => void;
  onSubir: (turnoId: string) => void;
  onBajar: (turnoId: string) => void;
  onNotificar: (turnoId: string) => void;
  onLlamar: (turnoId: string) => void;
};

export default function CardSalaEsperaDetallada({
  turno,
  index,
  onAtender,
  onSubir,
  onBajar,
  onNotificar,
  onLlamar,
}: Props) {
  const tiempoEnEspera = useElapsedTime(turno.turnoInfo?.horaLlegadaPaciente);

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 p-4 space-y-3">
      {/* Header con número y información del paciente */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>

          <div>
            <h3 className="font-bold text-gray-900 capitalize">
              {turno.turnoInfo?.pacienteNombre || ''} {turno.turnoInfo?.pacienteApellido || ''}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              DNI: <span className="font-mono">{turno.turnoInfo?.pacienteDocumento || ''}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <BotonIndigo className="capitalize text-sm bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border border-indigo-200">
            Dr. {turno?.turnoInfo?.profesionalNombre} {turno?.turnoInfo?.profesionalApellido}
          </BotonIndigo>
        </div>
      </div>

      {/* Sección de Tiempos - Versión sobria */}
      <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium">Turno</p>
          <p className="font-semibold text-gray-900 text-sm">{extraerHora(turno.hora)}</p>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-600 font-medium">Llegada</p>
          <p className="font-semibold text-gray-900 text-sm">
            {turno.turnoInfo?.horaLlegadaPaciente ? extraerHora(turno.turnoInfo.horaLlegadaPaciente) : '--:--'}
          </p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-amber-600">
            <Clock className="w-4 h-4" />
            <p className="text-xs font-medium">Espera</p>
          </div>
          <p className="font-semibold text-amber-700 text-sm">{tiempoEnEspera}</p>
        </div>
      </div>

      {/* Sección de Acciones - Versión sobria */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2 pt-1">
        <div className="flex gap-1">
          <button
            onClick={() => onSubir(turno.turnoInfo.id)}
            className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors border border-gray-300"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Subir</span>
          </button>
          <button
            onClick={() => onBajar(turno.turnoInfo.id)}
            className="flex items-center gap-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors border border-gray-300"
          >
            <ArrowDown className="w-4 h-4" />
            <span>Bajar</span>
          </button>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onLlamar(turno.turnoInfo.id)}
            className="flex items-center gap-1 text-sm bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-md transition-colors border border-green-300"
          >
            <Megaphone className="w-4 h-4" />
            <span>Llamar</span>
          </button>
          <button
            onClick={() => onNotificar(turno.turnoInfo.id)}
            className="flex items-center gap-1 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-2 rounded-md transition-colors border border-amber-300"
          >
            <Bell className="w-4 h-4" />
            <span>Notificar</span>
          </button>
        </div>
      </div>

      {/* Indicador sutil para el próximo turno */}
      {index === 0 && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-medium w-fit border border-green-200">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          Próximo a atender
        </div>
      )}
    </div>
  );
}