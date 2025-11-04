import { useStore } from '@nanostores/react';
import { CheckCheck } from 'lucide-react';
import { useMemo } from 'react';
import { recepcionStore } from '../../../context/recepcion.store';
import CardSalaEsperaDetallada from '../../moleculas/CardSalaEsperaDetallada';

export default function SalaDeEspera() {
  // Obtenemos el store completo
  const { turnosDelDia } = useStore(recepcionStore);

  // Usamos useMemo para calcular la cola de espera solo cuando los turnos cambian
  const colaDeEspera = useMemo(() => {
    return turnosDelDia
      .filter(turno => turno.turnoInfo?.estado === 'sala_de_espera')
      .sort(
        (a, b) =>
          new Date(a.turnoInfo.horaLlegadaPaciente).getTime() -
          new Date(b.turnoInfo.horaLlegadaPaciente).getTime()
      );
  }, [turnosDelDia]);

  // --- Handlers para las acciones de la tarjeta ---
  const handleSubir = (turnoId: string) => {
    console.log('Subiendo en la cola al turno:', turnoId);
    // Aquí iría la lógica para reordenar el array en el store
  };

  const handleBajar = (turnoId: string) => {
    console.log('Bajando en la cola al turno:', turnoId);
    // Aquí iría la lógica para reordenar el array en el store
  };

  const handleLlamar = async (turnoId: string) => {
    console.log('Llamando al paciente del turno:', turnoId);
    try {
      await fetch('/api/turnos/llamar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turnoId, consultorio: '5' }), // Hardcodeamos consultorio 5 por ahora
      });
    } catch (error) {
      console.error('Error al llamar al paciente:', error);
    }
  };

  const handleNotificar = (turnoId: string) => {
    console.log('EVENTO: Enviando notificación SMS/Whatsapp para turno:', turnoId);
    // Aquí iría la lógica para enviar una notificación (ej. SMS)
  };

  return (
    <div className="w-full h-full p-1">
      {colaDeEspera.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <CheckCheck className="w-10 h-10 text-gray-400" />
          </div>

          <h3 className="text-lg font-semibold text-gray-700">Sala de espera vacía</h3>
          <p className="text-gray-500 mt-1">Cuando un paciente sea recepcionado, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {colaDeEspera.map((turno, index) => (
            <CardSalaEsperaDetallada
              key={turno.turnoInfo.id}
              index={index}
              turno={turno}
              onSubir={handleSubir}
              onBajar={handleBajar}
              onLlamar={handleLlamar}
              onNotificar={handleNotificar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
