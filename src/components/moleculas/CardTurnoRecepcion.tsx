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

// Helper function to get status info (similar to CardMedicamentoV2)
const getStatusInfo = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'finalizada':
      return { text: 'Finalizada', colorClass: 'bg-green-400  text-green-100' };
    case 'en_consulta':
      return { text: 'En Consulta', colorClass: 'bg-blue-400/70 text-blue-100' };
    case 'sala_de_espera':
      return { text: 'Sala de Espera', colorClass: 'bg-yellow-200/70 text-yellow-900' };
    case 'confirmado':
      return { text: 'Confirmado', colorClass: 'bg-green-400/70 text-green-100' };
    case 'pendiente':
      return { text: 'Pendiente', colorClass: 'bg-orange-400/40 text-orange-700' };
    case 'cancelado':
      return { text: 'Cancelado', colorClass: 'bg-red-400/70 text-red-100' };
    default:
      return { text: estado, colorClass: 'bg-gray-100 text-gray-800' };
  }
};

export default function CardTurnoRecepcion({ slot, onRecibirPaciente }: TurnoCardProps) {
  const attentionLink = `/dashboard/consultas/aperturaPaciente/${slot.turnoInfo?.pacienteId}/new`;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleStatusChange = (nuevoEstado: string) => {
    console.log(`Cambiando estado del turno ${slot.turnoInfo?.id} a ${nuevoEstado}`);
    // Aquí iría la llamada a la API para actualizar el estado del turno
    setIsMenuOpen(false);
  };

  const handleRecibirPaciente = turno => {
    onRecibirPaciente(turno);
  };

  const handleLlamarPaciente = (turnoId: string, nombrePaciente: string) => {
    console.log(`Llamando a paciente ${nombrePaciente} con ID ${turnoId}`);
    // Aquí iría la llamada a la API para llamar al paciente
  };

  return (
    <div key={slot.turnoInfo?.id} className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InicialesPac
            nombre={slot.turnoInfo?.pacienteNombre}
            apellido={slot.turnoInfo?.pacienteApellido}
          />
          <div>
            <p className="font-medium capitalize">
              {slot.turnoInfo?.pacienteNombre} {slot.turnoInfo?.pacienteApellido}
            </p>
            <p className="text-sm text-muted-foreground">
              DNI: {slot.turnoInfo?.pacienteDocumento}
            </p>
          </div>
        </div>
        <div
          className={`text-xs text-primary-texto font-medium border  bottom-2 rounded-full px-2 py-1 bg-white right-2 ${getStatusInfo(slot.turnoInfo?.estado ?? '')?.colorClass}`}
        >
          {getStatusInfo(slot.turnoInfo?.estado ?? '')?.text}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Turno:</span>
          {/* FIX: Usar slot.hora que es el string ISO completo y corregido por el store */}
          <p className="font-medium">{extraerHora(slot.hora)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Doctor:</span>
          <p className="font-medium capitalize">
            {slot.turnoInfo?.profesionalNombre} {slot.turnoInfo?.profesionalApellido}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Llegada:</span>
          <p className="font-medium">
            {slot.turnoInfo?.horaLlegadaPaciente
              ? extraerHora(slot.turnoInfo?.horaLlegadaPaciente)
              : 'Pendiente'}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Motivo de Consulta:</span>
          <p className="font-medium">{slot.turnoInfo?.motivoConsulta}</p>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant={slot.turnoInfo?.estado === 'sala_de_espera' ? 'outline' : 'primary'}
          disabled={slot.turnoInfo?.estado !== 'pendiente'}
          onClick={() => handleRecibirPaciente(slot)}
        >
          <UserCheck className="h-4 w-4 mr-2" />
          Recibir
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            handleLlamarPaciente(slot.turnoInfo?.pacienteId, slot.turnoInfo?.pacienteNombre)
          }
        >
          <Phone className="h-4 w-4 mr-2" />
          Llamar
        </Button>
        <Button size="sm" variant="outline">
          <MessageSquare className="h-4 w-4 mr-2" />
          SMS
        </Button>
        <Button size="sm" variant="outline">
          <CalendarPlus2 className="h-4 w-4 mr-2" />
          Reprogramar
        </Button>
      </div>

      {slot.turnoInfo?.estado === 'cancelado' && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Paciente llegó tarde. Evaluar reprogramación.</span>
        </div>
      )}
    </div>
  );
}
