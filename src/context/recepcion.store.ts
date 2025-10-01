import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import { computed, map } from 'nanostores';
import { io } from 'socket.io-client';
import type { AgendaSlot } from './agenda.store';

// --- TIPOS ---
type Turno = {
  id: string;
  estado:
    | 'pendiente'
    | 'confirmado'
    | 'en_consulta'
    | 'sala_de_espera'
    | 'finalizado'
    | 'cancelado'
    | 'ausente'
    | 'demorado';
  horaLlegadaPaciente?: string;
  [key: string]: any;
};
interface RecepcionStore {
  turnosDelDia: Turno[];
  isLoading: boolean;
  pestanaActiva: 'pacientes' | 'recepcion' | 'salaDeEspera';
  error: string | null;
}
// --- SOCKET ---
const socket = io(); // Se conecta automáticamente al mismo host/puerto que el frontend

// --- STORE PRINCIPAL ---
export const recepcionStore = map<RecepcionStore>({
  turnosDelDia: [],
  isLoading: true,
  pestanaActiva: 'recepcion',
  error: null,
});

// --- STORES COMPUTADOS ---
export const pacientesEnEspera = computed(recepcionStore, $store =>
  $store.turnosDelDia.filter(t => t.estado === 'sala_de_espera')
);

export const turnosPendientes = computed(recepcionStore, $store =>
  $store.turnosDelDia.filter(t => t.estado === 'pendiente' || t.estado === 'confirmado')
);

export const turnosEnConsulta = computed(recepcionStore, $store =>
  $store.turnosDelDia.filter(t => t.estado === 'en_consulta')
);

// --- ACCIONES ---
export async function fetchTurnosDelDia(fecha: string) {
  recepcionStore.setKey('isLoading', true);
  try {
    const response = await fetch(`/api/agenda?fecha=${fecha}`);
    if (!response.ok) throw new Error('Respuesta de red no fue ok');
    const data = await response.json();
    recepcionStore.setKey('turnosDelDia', data);
  } catch (error: any) {
    recepcionStore.setKey('error', error.message);
  } finally {
    recepcionStore.setKey('isLoading', false);
  }
}

/**
 * Cambia el estado de un turno y envía la actualización al backend.
 */
export async function setTurnoEstado(turno: AgendaSlot, nuevoEstado: Turno['estado']) {
  const payload = {
    ...turno,
    estado: nuevoEstado,
    horaLlegadaPaciente:
      nuevoEstado === 'sala_de_espera'
        ? new Date(getFechaEnMilisegundos()).toISOString()
        : undefined,
  };

  try {
    const response = await fetch(`/api/turno/${turno.turnoInfo?.id}/changeState`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(`Turno ${turno.turnoInfo.id} actualizado a ${nuevoEstado}`, data);

    // La emisión del evento ahora la hace el backend.
    // socket.emit('turno-actualizado', data);
  } catch (error) {
    console.error('Error al cambiar estado del turno:', error);
  }
}

// --- OYENTES DEL SOCKET ---
// Actualiza el store automáticamente cuando llega un cambio de estado
socket.on('connect', () => console.log('✅ Conectado al servidor de sockets desde el store.'));

socket.on('turno-actualizado', (turnoActualizado: Turno) => {
  console.log('EVENTO RECIBIDO: turno-actualizado', turnoActualizado);
  recepcionStore.setKey('turnosDelDia', store =>
    store.turnosDelDia.map(t =>
      t.turnoInfo && t.turnoInfo.id === turnoActualizado.id
        ? { ...t, turnoInfo: { ...t.turnoInfo, ...turnoActualizado } }
        : t
    )
  );
});

socket.on('disconnect', () => console.log('❌ Desconectado del servidor de sockets.'));
