import Button from '@/components/atomos/Button';
import ModalReact from '@/components/moleculas/ModalReact';
import { Card, CardContent } from '@/components/organismo/Card';
import { showToast } from '@/utils/toast/toastShow';
import { format } from 'date-fns';
import { Calendar, Clock, FileWarning, User } from 'lucide-react';
import { useState } from 'react';

interface TurnoConflicto {
  id: string;
  fecha: Date;
  hora: string;
  paciente: string;
  motivo: string;
  estado: string;
}

interface ModalReagendarTurnosProps {
  isOpen: boolean;
  onClose: () => void;
  turnos: TurnoConflicto[];
  onCancelarLicencia: () => void;
  onTurnoCancelado?: () => void; // Callback para actualizar la lista
}

export default function ModalReagendarTurnos({
  isOpen,
  onClose,
  turnos,
  onCancelarLicencia,
  onTurnoCancelado,
}: ModalReagendarTurnosProps) {
  const [cancelando, setCancelando] = useState<string | null>(null);

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleCancelarTurno = async (turnoId: string) => {
    if (!confirm('¿Estás seguro de cancelar este turno?')) return;

    setCancelando(turnoId);
    try {
      const responseFetch = await fetch(`/api/agenda/turnos/cancelar?id=${turnoId}`, {
        method: 'DELETE',
      });
      const responseJson = await responseFetch.json();
      if (!responseFetch.ok) throw new Error('Error al cancelar turno');

      showToast('Turno cancelado correctamente', { background: 'bg-green-600' });

      // Notificar que se canceló un turno
      if (onTurnoCancelado) {
        onTurnoCancelado(responseJson.data);
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al cancelar turno', { background: 'bg-red-600' });
    } finally {
      setCancelando(null);
    }
  };

  const handleReagendar = (fecha: Date) => {
    // Formatear fecha para la URL (YYYY-MM-DD)
    const fechaFormateada = format(new Date(fecha), 'yyyy-MM-dd');
    // Redirigir a la agenda con la fecha del turno
    window.location.href = `/dashboard/agenda?fecha=${fechaFormateada}`;
  };

  const handleIrAgenda = () => {
    window.location.href = '/dashboard/agenda';
  };

  return (
    <ModalReact
      id="modal-reagendar-turnos"
      icon={<FileWarning className="text-orange-500" />}
      title="Turnos en Conflicto"
      onClose={onClose}
    >
      <CardContent className="flex-1 overflow-y-auto ">
        <div className="mb-4">
          <p className="text-gray-700">
            No se puede crear la licencia porque hay{' '}
            <span className="font-bold">{turnos.length} turno(s) agendado(s)</span> en ese período.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Debes cancelar o reagendar estos turnos antes de crear la licencia.
          </p>
        </div>

        <div className="space-y-3">
          {turnos.map(turno => (
            <Card key={turno.id} className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Paciente */}
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold">{turno.paciente}</span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          turno.estado === 'confirmado'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {turno.estado}
                      </span>
                    </div>

                    {/* Fecha y Hora */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(turno.fecha)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{turno.hora}</span>
                      </div>
                    </div>

                    {/* Motivo */}
                    {turno.motivo && <p className="text-sm text-gray-500 italic">{turno.motivo}</p>}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReagendar(turno.fecha)}
                      disabled={cancelando === turno.id}
                    >
                      Reagendar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleCancelarTurno(turno.id)}
                      disabled={cancelando === turno.id}
                    >
                      {cancelando === turno.id ? 'Cancelando...' : 'Cancelar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>

      <div className="  flex flex-col justify-between items-start gap-3 ">
        <p className="text-sm text-gray-600 bg-orange-400/20 p-2 rounded w-full text-center">
          💡 Tip: Puedes reagendar o cancelar los turnos desde la agenda
        </p>
        <div className="flex gap-2 w-full items-center justify-end">
          <Button variant="outline" onClick={onCancelarLicencia}>
            Cancelar Licencia
          </Button>
          <Button onClick={handleIrAgenda}>Ir a Agenda</Button>
        </div>
      </div>
    </ModalReact>
  );
}
