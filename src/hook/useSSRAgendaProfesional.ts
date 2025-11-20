import {
    agendaStore,
    detenerConexionSSE,
    iniciarConexionSSE,
} from '@/context/agenda.store';
import { useStore } from '@nanostores/react';
import { useEffect } from 'react';

import { registrarHandlersAgenda } from '@/context/agenda.store';

export function useSSRAgendaProfesional(userId?: string) {
    const { sseConectado, ultimaActualizacion } = useStore(agendaStore);

    useEffect(() => {
        registrarHandlersAgenda();
        iniciarConexionSSE(userId);
        return () => detenerConexionSSE();
    }, [userId]);

    return {
        sseConectado, ultimaActualizacion, reconectar: () => {
            detenerConexionSSE();
            setTimeout(() => {
                registrarHandlersAgenda();     // por si acaso, idempotente
                iniciarConexionSSE(userId);
            }, 1000);
        }
    };
}