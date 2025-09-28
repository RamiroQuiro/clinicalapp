import type { AgendaSlot } from '@/context/agenda.store';
import extraerHora from '@/utils/extraerHora';
import { AlertCircle, CalendarPlus2, MessageSquare, Phone, UserCheck } from 'lucide-react';
import { useState } from 'react';
import Button from '../atomos/Button';

interface TurnoCardProps {
  slot: AgendaSlot;
  onVerDetalles: (slot: any) => void;
  onReagendar: (slot: any) => void;
  onCancelar: (slot: any) => void;
  onLlamar: (slot: any) => void;
  onRecibirPaciente: (slot: any) => void;
}

// Helper function to get status info (similar to CardMedicamentoV2)
const getStatusInfo = estado => {
  switch (estado?.toLowerCase()) {
    case 'confirmado':
      return { text: 'Confirmado', colorClass: 'bg-green-100 text-green-800' };
    case 'pendiente':
      return { text: 'Pendiente', colorClass: 'bg-yellow-100 text-yellow-800' };
    case 'cancelado':
      return { text: 'Cancelado', colorClass: 'bg-red-100 text-red-800' };
    default:
      return { text: estado, colorClass: 'bg-gray-100 text-gray-800' };
  }
};

export default function CardTurnoRecepcion({ slot, onRecibirPaciente }: TurnoCardProps) {
  const attentionLink = `/dashboard/consultas/aperturaPaciente/${slot.turnoInfo?.pacienteId}/new`;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const statusInfo = getStatusInfo(slot.turnoInfo?.estado);

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
          <div className="p-3 rounded-full uppercase bg-primary-bg-componentes border">
            <div>
              {slot.turnoInfo?.pacienteNombre
                .split(' ')
                .map(n => n[0])
                .join('')}
              {slot.turnoInfo?.pacienteApellido
                .split(' ')
                .map(n => n[0])
                .join('')}
            </div>
          </div>
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
          className={`text-xs text-primary-texto font-medium border  bottom-2 rounded-full px-2 py-2 bg-white right-2 ${slot.turnoInfo?.estado === 'cancelado' ? 'text-red-500' : slot.turnoInfo?.estado === 'confirmado' ? 'text-green-500' : 'text-yellow-500'}`}
        >
          {slot.turnoInfo?.estado}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div>
          <span className="text-muted-foreground">Turno:</span>
          <p className="font-medium">{extraerHora(slot.turnoInfo?.horaTurno)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Doctor:</span>
          <p className="font-medium capitalize">
            {slot.turnoInfo?.profesionalNombre} {slot.turnoInfo?.profesionalApellido}
          </p>
        </div>
        <div>
          <span className="text-muted-foreground">Llegada:</span>
          <p className="font-medium">{extraerHora(slot.turnoInfo?.horaTurno)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Motivo de Consutla:</span>
          <p className="font-medium">{slot.turnoInfo?.motivoConsulta}</p>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleRecibirPaciente(slot)}
          disabled={slot.turnoInfo?.estado === 'confirmado'}
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
