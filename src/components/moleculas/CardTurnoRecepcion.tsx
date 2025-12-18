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

  const handleLlamarPaciente = async (turno: AgendaSlot) => {
    try {
      console.log(`Llamando a paciente ${turno.turnoInfo?.pacienteNombre} con ID ${turno.turnoInfo?.id}`);

      const response = await fetch('/api/llamar-paciente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          turnoId: turno.turnoInfo?.id,
          consultorio: 'Consultorio 1' // Podría ser dinámico según el médico
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al llamar paciente');
      }

      console.log('Paciente llamado exitosamente:', data);
      // Aquí podrías mostrar un toast o notificación de éxito

    } catch (error: any) {
      console.error('Error al llamar paciente:', error);
      // Aquí podrías mostrar un toast o notificación de error
      alert(error.message || 'No se pudo llamar al paciente');
    }
  };

  const statusInfo = getStatusInfo(slot.turnoInfo?.estado ?? '');

  return (
    <div className="space-y-3 bg-white p-4 border border-gray-200 hover:border-gray-300 rounded-lg transition-all duration-200">
      {/* Header con información del paciente y estado */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <InicialesPac
            nombre={slot.turnoInfo?.pacienteNombre || ''}
            apellido={slot.turnoInfo?.pacienteApellido || ''}
          />
          <div>
            <h3 className="font-bold text-gray-900 capitalize">
              {slot.turnoInfo?.pacienteNombre || ''} {slot.turnoInfo?.pacienteApellido || ''}
            </h3>
            <p className="mt-0.5 text-gray-600 text-sm">
              DNI: <span className="font-mono">{slot.turnoInfo?.pacienteDocumento || ''}</span>
              DNI: <span className="font-mono">{slot.turnoInfo?.pacienteDocumento}</span>
            </p>
          </div>
        </div>
        <div className={`text-xs font-medium border rounded-full px-3 py-1 ${statusInfo.colorClass}`}>
          {statusInfo.text}
        </div>
      </div>

      {/* Grid de información - Mejorado */}
      <div className="gap-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 text-sm">
        <div className="space-y-1">
          <p className="font-medium text-gray-600 text-xs">Turno</p>
          <p className="font-semibold text-gray-900">{extraerHora(slot.hora)}</p>
        </div>

        <div className="space-y-1">
          <p className="font-medium text-gray-600 text-xs">Profesional</p>
          <p className="font-semibold text-gray-900 capitalize">
            Dr. {slot.turnoInfo?.profesionalNombre} {slot.turnoInfo?.profesionalApellido}
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-medium text-gray-600 text-xs">Llegada</p>
          <p className="font-semibold text-gray-900">
            {slot.turnoInfo?.horaLlegadaPaciente
              ? extraerHora(slot.turnoInfo?.horaLlegadaPaciente)
              : '--:--'}
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-medium text-gray-600 text-xs">Motivo</p>
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
          <UserCheck className="w-4 h-4" />
          Recibir
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => handleLlamarPaciente(slot)}
          className="flex items-center gap-1 hover:bg-green-50 border-green-300 text-green-700"
        >
          <Phone className="w-4 h-4" />
          Llamar
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1 hover:bg-blue-50 border-blue-300 text-blue-700"
        >
          <MessageSquare className="w-4 h-4" />
          SMS
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1 hover:bg-purple-50 border-purple-300 text-purple-700"
        >
          <CalendarPlus2 className="w-4 h-4" />
          Reprogramar
        </Button>
      </div>

      {/* Alerta para turnos cancelados - Mejorada */}
      {slot.turnoInfo?.estado === 'cancelado' && (
        <div className="flex items-center gap-2 bg-amber-50 px-3 py-2 border border-amber-200 rounded-lg text-amber-700">
          <AlertCircle className="flex-shrink-0 w-4 h-4" />
          <span className="text-sm">Paciente llegó tarde. Evaluar reprogramación.</span>
        </div>
      )}
    </div>
  );
}