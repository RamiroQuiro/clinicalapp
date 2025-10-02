// hooks/useSSE.ts
import { detenerConexionSSE, iniciarConexionSSE, recepcionStore } from '@/context/recepcion.store';
import { useStore } from '@nanostores/react';
import { useEffect } from 'react';

export function useSSE(userId?: string) {
  const { sseConectado, ultimaActualizacion } = useStore(recepcionStore);

  useEffect(() => {
    // Iniciar conexión cuando el componente se monta
    iniciarConexionSSE(userId);

    // Limpiar al desmontar
    return () => {
      detenerConexionSSE();
    };
  }, [userId]);

  return {
    sseConectado,
    ultimaActualizacion,
    reconectar: () => {
      detenerConexionSSE();
      setTimeout(() => iniciarConexionSSE(userId), 1000);
    },
  };
}
