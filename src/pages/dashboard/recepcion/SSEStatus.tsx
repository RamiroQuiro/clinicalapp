// components/SSEStatus.tsx
import { recepcionStore } from '@/context/recepcion.store';
import { useSSE } from '@/hook/useSSE';
import { useStore } from '@nanostores/react';

export default function SSEStatus() {
  const { estaConectado, ultimaActualizacion, sseConectado } = useStore(recepcionStore);

  // Conectar automáticamente
  useSSE({
    userId: 'usuario-demo',
    onTurnoActualizado: () => {},
    onConectado: () => {},
    onError: () => {},
  });

  return (
    <div className="fixed top-4 right-4 p-4 bg-white border rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${estaConectado ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="font-semibold">SSE: {estaConectado ? 'Conectado' : 'Desconectado'}</span>
      </div>

      <div className="text-xs text-gray-600 space-y-1">
        <div>Eventos recibidos: {ultimaActualizacion}</div>
        {ultimaActualizacion && (
          <div>Último: {new Date(ultimaActualizacion).toLocaleTimeString()}</div>
        )}
      </div>
    </div>
  );
}
