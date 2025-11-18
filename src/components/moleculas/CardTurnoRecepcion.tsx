import type { AgendaSlot } from '@/context/agenda.store';
import extraerHora from '@/utils/extraerHora';
import { AlertCircle, CalendarPlus2, MessageSquare, Phone, UserCheck } from 'lucide-react';
import { useState } from 'react';
import Button from '../atomos/Button';
import InicialesPac from './InicialesPac';

interface TurnoCardProps {
  slot: AgendaSlot;
  onVerDetalles: (slot: AgendaSlot) => void;
  onReagendar: (slot: AgendaSlot) => void;
  onCancelar: (slot: AgendaSlot) => void;
  onLlamar: (slot: AgendaSlot) => void;
  onRecibirPaciente: (slot: AgendaSlot) => void;
}

// Helper function to get status info - Mejorado con colores más consistentes
const getStatusInfo = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'finalizada':
      return { text: 'Finalizada', colorClass: 'bg-green-100 text-green-800 border-green-200' };
    case 'en_consulta':
      return { text: 'En Consulta', colorClass: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'sala_de_espera':
      return { text: 'Sala de Espera', colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    case 'confirmado':
      return { text: 'Confirmado', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'pendiente':
      return { text: 'Pendiente', colorClass: 'bg-orange-100 text-orange-800 border-orange-200' };
    case 'cancelado':
      return { text: 'Cancelado', colorClass: 'bg-red-100 text-red-800 border-red-200' };
    default:
      return { text: estado, colorClass: 'bg-gray-100 text-gray-800 border-gray-200' };
  }
};

export default function CardTurnoRecepcion({ slot, onRecibirPaciente }: TurnoCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleRecibirPaciente = (turno: AgendaSlot) => {
    onRecibirPaciente(turno);
  };

  const handleLlamarPaciente = (turnoId: string, nombrePaciente: string) => {
    console.log(`Llamando a paciente ${nombrePaciente} con ID ${turnoId}`);
    // Aquí iría la llamada a la API para llamar al paciente
  };

  const statusInfo = getStatusInfo(slot.turnoInfo?.estado ?? '');

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 p-4 space-y-3">
      {/* Header con información del paciente y estado */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <InicialesPac
            nombre={slot.turnoInfo?.pacienteNombre}
            apellido={slot.turnoInfo?.pacienteApellido}
          />
          <div>
            <h3 className="font-bold text-gray-900 capitalize">
              {slot.turnoInfo?.pacienteNombre} {slot.turnoInfo?.pacienteApellido}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              DNI: <span className="font-mono">{slot.turnoInfo?.pacienteDocumento}</span>
            </p>
          </div>
        </div>
        <div className={`text-xs font-medium border rounded-full px-3 py-1 ${statusInfo.colorClass}`}>
          {statusInfo.text}
        </div>
      </div>

      {/* Grid de información - Mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        <div className="space-y-1">
          <p className="text-xs text-gray-600 font-medium">Turno</p>
          <p className="font-semibold text-gray-900">{extraerHora(slot.hora)}</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-600 font-medium">Profesional</p>
          <p className="font-semibold text-gray-900 capitalize">
            Dr. {slot.turnoInfo?.profesionalNombre} {slot.turnoInfo?.profesionalApellido}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-600 font-medium">Llegada</p>
          <p className="font-semibold text-gray-900">
            {slot.turnoInfo?.horaLlegadaPaciente
              ? extraerHora(slot.turnoInfo?.horaLlegadaPaciente)
              : '--:--'}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-600 font-medium">Motivo</p>
          <p className="font-semibold text-gray-900 truncate" title={slot.turnoInfo?.motivoConsulta}>
            {slot.turnoInfo?.motivoConsulta || 'No especificado'}
          </p>
        </div>
      </div>

      {/* Acciones - Mejoradas para ser más consistentes */}
      <div className="flex flex-wrap gap-2 pt-2">
        <Button
          size="sm"
          variant={slot.turnoInfo?.estado === 'sala_de_espera' ? 'outline' : 'primary'}
          disabled={slot.turnoInfo?.estado !== 'pendiente'}
          onClick={() => handleRecibirPaciente(slot)}
          className="flex items-center gap-1"
        >
          <UserCheck className="h-4 w-4" />
          Recibir
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleLlamarPaciente(slot.turnoInfo?.pacienteId, slot.turnoInfo?.pacienteNombre)}
          className="flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-50"
        >
          <Phone className="h-4 w-4" />
          Llamar
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
        >
          <MessageSquare className="h-4 w-4" />
          SMS
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1 border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          <CalendarPlus2 className="h-4 w-4" />
          Reprogramar
        </Button>
      </div>

      {/* Alerta para turnos cancelados - Mejorada */}
      {slot.turnoInfo?.estado === 'cancelado' && (
        <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">Paciente llegó tarde. Evaluar reprogramación.</span>
        </div>
      )}
    </div>
  );
}