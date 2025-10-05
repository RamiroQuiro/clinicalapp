import type { AgendaSlot } from '@/context/agenda.store';
import { useElapsedTime } from '@/hook/useElapsedTime';
import extraerHora from '@/utils/extraerHora';
import { ArrowDown, ArrowUp, Bell, Clock, Megaphone } from 'lucide-react';
import BotonIndigo from './BotonIndigo';
import InicialesPac from './InicialesPac';

// Props para la nueva tarjeta detallada
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
  // Usamos el hook para calcular el tiempo de espera desde la hora de llegada
  const tiempoEnEspera = useElapsedTime(turno.turnoInfo?.horaLlegadaPaciente);

  return (
    <div key={turno.turnoInfo?.id} className="border bg-white rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold">
            {index + 1}
          </div>
          <InicialesPac
            nombre={turno.turnoInfo?.pacienteNombre || ''}
            apellido={turno.turnoInfo?.pacienteApellido || ''}
          />
          <div>
            <p className="font-bold text-lg capitalize text-gray-800">
              {turno.turnoInfo?.pacienteNombre || ''} {turno.turnoInfo?.pacienteApellido || ''}
            </p>
            <p className="text-sm text-gray-500">DNI: {turno.turnoInfo?.pacienteDocumento || ''}</p>
          </div>
        </div>
        <div className="capitalize">
          <BotonIndigo className="capitalize">
            Dr. {turno?.turnoInfo?.profesionalNombre} {turno?.turnoInfo?.profesionalApellido}
          </BotonIndigo>
        </div>
      </div>

      {/* Sección de Tiempos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center bg-gray-50 p-3 rounded-lg">
        <div>
          <p className="text-xs text-gray-500">Turno</p>
          <p className="font-semibold text-gray-800">{extraerHora(turno.hora)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Llegada</p>
          <p className="font-semibold text-gray-800">
            {extraerHora(turno.turnoInfo?.horaLlegadaPaciente)}
          </p>
        </div>
        <div className="col-span-2 md:col-span-2 flex items-center justify-center gap-2 text-orange-600">
          <Clock className="w-5 h-5" />
          <p className="font-bold text-lg">{tiempoEnEspera}</p>
        </div>
      </div>

      {/* Sección de Acciones */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <div className="flex gap-2">
          <button
            onClick={() => onSubir(turno.turnoInfo.id)}
            className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors"
          >
            <ArrowUp className="w-4 h-4" /> Subir
          </button>
          <button
            onClick={() => onBajar(turno.turnoInfo.id)}
            className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md transition-colors"
          >
            <ArrowDown className="w-4 h-4" /> Bajar
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onLlamar(turno.turnoInfo.id)}
            className="flex items-center gap-2 text-sm bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-md transition-colors"
          >
            <Megaphone className="w-4 h-4" /> Llamar ahora
          </button>
          <button
            onClick={() => onNotificar(turno.turnoInfo.id)}
            className="flex items-center gap-2 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded-md transition-colors"
          >
            <Bell className="w-4 h-4" /> Notificar
          </button>
        </div>
      </div>
    </div>
  );
}
