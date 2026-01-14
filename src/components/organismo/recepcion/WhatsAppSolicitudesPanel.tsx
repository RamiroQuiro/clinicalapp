import { Badge } from '@/components/atomos/Badge';
import { Button } from '@/components/atomos/Button';
import formatDate from '@/utils/formatDate';
import { Check, Clock, Loader2, MessageSquare, ServerCrash, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../Card';

interface Solicitud {
  id: string;
  nombrePaciente: string;
  numeroTelefono: string;
  fechaHora: string;
  created_at: string;
  userMedicoId: string;
  nombreMedico: string;
}

const WhatsAppSolicitudesPanel = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/whatsapp/solicitudes');
        if (!response.ok) {
          throw new Error('No se pudo conectar con el servidor.');
        }
        const data = await response.json();
        setSolicitudes(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitudes();
    // TODO: Add SSE listener here to refetch or update solicitudes in real-time
  }, []);

  const handleConfirm = (solicitudId: string) => {
    console.log(`Confirmando solicitud: ${solicitudId}`);
    // Future logic to create the appointment
  };

  const handleReject = (solicitudId: string) => {
    console.log(`Rechazando solicitud: ${solicitudId}`);
    // Future logic to update status to 'rechazada'
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-sm font-semibold">Cargando solicitudes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-red-500">
        <ServerCrash className="w-8 h-8 mb-2" />
        <p className="text-sm font-semibold">Error al cargar datos</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-green-500" />
          <span>Solicitudes de WhatsApp</span>
        </h2>
        <p className="text-sm text-gray-500">Nuevas solicitudes de turnos para confirmar.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {solicitudes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <MessageSquare className="w-12 h-12 mb-2" />
            <p className="font-bold">No hay solicitudes pendientes</p>
            <p className="text-sm">Las nuevas solicitudes de WhatsApp aparecerán aquí.</p>
          </div>
        ) : (
          solicitudes.map(solicitud => (
            <Card key={solicitud.id} className="bg-white shadow-md animate-aparecer">
              <CardHeader>
                <CardTitle className="text-base flex justify-between items-center">
                  <span>{solicitud.nombrePaciente}</span>
                  <Badge
                    variant="outline"
                    className="text-xs bg-amber-100 text-amber-800 border-amber-200"
                  >
                    Pendiente
                  </Badge>
                </CardTitle>
                <CardDescription>{solicitud.numeroTelefono}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>
                    Solicitado: <strong>{formatDate(solicitud.created_at, { time: true })}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>
                    Profesional: <strong>{solicitud.nombreMedico}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>
                    Horario pedido: <strong>{solicitud.fechaHora}</strong>
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleReject(solicitud.id)}>
                  <X className="w-4 h-4 mr-1" />
                  Rechazar
                </Button>
                <Button variant="default" size="sm" onClick={() => handleConfirm(solicitud.id)}>
                  <Check className="w-4 h-4 mr-1" />
                  Confirmar Turno
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default WhatsAppSolicitudesPanel;
