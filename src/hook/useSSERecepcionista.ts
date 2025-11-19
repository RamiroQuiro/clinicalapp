import {
    detenerConexionSSE,
    iniciarConexionSSE,
    recepcionStore,
} from '@/context/recepcion.recepcionista.store';
import { useStore } from '@nanostores/react';
import { useEffect } from 'react';

export function useSSERecepcionista(userId?: string) {
    const { sseConectado, ultimaActualizacion } = useStore(recepcionStore);

    useEffect(() => {
        iniciarConexionSSE(userId);
        return () => detenerConexionSSE();
    }, [userId]);

    return {
        sseConectado, ultimaActualizacion, reconectar: () => {
            detenerConexionSSE();
            setTimeout(() => iniciarConexionSSE(userId), 1000);
        }
    };
}