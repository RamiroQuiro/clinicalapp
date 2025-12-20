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
    <div className="space-y-3 bg-white p-4 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200">
      {/* Header con número y información del paciente */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="flex justify-center items-center bg-blue-100 rounded-full w-8 h-8 font-bold text-blue-800 text-sm">
            {index + 1}
          </div>

          <div>
            <h3 className="font-bold text-gray-900 capitalize">
              {turno.turnoInfo?.pacienteNombre || ''} {turno.turnoInfo?.pacienteApellido || ''}
            </h3>
            <p className="mt-0.5 text-gray-600 text-sm">
              DNI: <span className="font-mono">{turno.turnoInfo?.pacienteDocumento || ''}</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <BotonIndigo className="bg-indigo-100 hover:bg-indigo-200 border border-indigo-200 text-indigo-800 text-sm capitalize">
            Dr. {turno?.turnoInfo?.profesionalNombre} {turno?.turnoInfo?.profesionalApellido}
          </BotonIndigo>
        </div>
      </div>

      {/* Sección de Tiempos - Versión sobria */}
      <div className="gap-2 grid grid-cols-3 bg-gray-50 p-3 rounded-lg">
        <div className="text-center">
          <p className="font-medium text-gray-600 text-xs">Turno</p>
          <p className="font-semibold text-gray-900 text-sm">{extraerHora(turno.hora)}</p>
        </div>

        <div className="text-center">
          <p className="font-medium text-gray-600 text-xs">Llegada</p>
          <p className="font-semibold text-gray-900 text-sm">
            {turno.turnoInfo?.horaLlegadaPaciente ? extraerHora(turno.turnoInfo.horaLlegadaPaciente) : '--:--'}
          </p>
        </div>

        <div className="text-center">
          <div className="flex justify-center items-center gap-1 text-amber-600">
            <Clock className="w-4 h-4" />
            <p className="font-medium text-xs">Espera</p>
          </div>
          <p className="font-semibold text-amber-700 text-sm">{tiempoEnEspera}</p>
        </div>
      </div>

      {/* Sección de Acciones - Versión sobria */}
      <div className="flex lg:flex-row flex-col flex-wrap xl:justify-between xl:items-center gap-2 pt-1">
        <div className="flex gap-1">
          <button
            onClick={() => onSubir(turno.turnoInfo.id)}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
            <span>Subir</span>
          </button>
          <button
            onClick={() => onBajar(turno.turnoInfo.id)}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 border border-gray-300 rounded-md text-gray-700 text-sm transition-colors"
          >
            <ArrowDown className="w-4 h-4" />
            <span>Bajar</span>
          </button>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onLlamar(turno.turnoInfo.id)}
            className="flex items-center gap-1 bg-green-100 hover:bg-green-200 px-3 py-2 border border-green-300 rounded-md text-green-800 text-sm transition-colors"
          >
            <Megaphone className="w-4 h-4" />
            <span>Llamar</span>
          </button>
          <button
            onClick={() => onNotificar(turno.turnoInfo.id)}
            className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 px-3 py-2 border border-amber-300 rounded-md text-amber-800 text-sm transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>Notificar</span>
          </button>
        </div>
      </div>

      {/* Indicador sutil para el próximo turno */}
      {index === 0 && (
        <div className="flex items-center gap-2 bg-green-50 px-2 py-1 border border-green-200 rounded w-fit font-medium text-green-700 text-xs">
          <div className="bg-green-500 rounded-full w-1.5 h-1.5"></div>
          Próximo a atender
        </div>
      )}
    </div>
  );
}