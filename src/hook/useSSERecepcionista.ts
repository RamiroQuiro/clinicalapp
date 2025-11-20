import {
    detenerConexionSSE,
    iniciarConexionSSE,
    recepcionStore,
} from '@/context/recepcion.recepcionista.store';
import { useStore } from '@nanostores/react';
import { useEffect } from 'react';

import { registrarHandlersRecepcionista } from '@/context/recepcion.recepcionista.store';

export function useSSERecepcionista(userId?: string) {
    const { sseConectado, ultimaActualizacion } = useStore(recepcionStore);

    useEffect(() => {
        registrarHandlersRecepcionista();       // 1) registrar handlers
        iniciarConexionSSE(userId);             // 2) luego conectar
        return () => detenerConexionSSE();
    }, [userId]);

    return {
        sseConectado, ultimaActualizacion, reconectar: () => {
            detenerConexionSSE();
            setTimeout(() => {
                registrarHandlersRecepcionista();     // por si acaso, idempotente
                iniciarConexionSSE(userId);
            }, 1000);
        }
    };
}