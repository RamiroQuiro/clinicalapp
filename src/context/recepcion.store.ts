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
 * También aplica una actualización optimista al store local.
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
  const turnosActuales = recepcionStore.get().turnosDelDia;
  const turnosActualizados = turnosActuales.map(t => {
    if (t.turnoInfo?.id === turno.turnoInfo?.id) {
      const turnoInfoActualizado = {
        ...t.turnoInfo,
        estado: nuevoEstado,
        horaLlegadaPaciente: payload.horaLlegadaPaciente,
      };
      // Retorna un nuevo objeto para el AgendaSlot
      return { ...t, turnoInfo: turnoInfoActualizado };
    }
    return t;
  });

  recepcionStore.setKey('turnosDelDia', turnosActualizados);

  try {
    const response = await fetch(`/api/turno/${turno.turnoInfo?.id}/changeState`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(`Turno ${turno.turnoInfo.id} actualizado a ${nuevoEstado} en el backend`, data);

    // Nota: Cuando el socket funcione, esta actualización optimista puede que no sea necesaria,
    // o puede servir como un fallback.
  } catch (error) {
    console.error('Error al cambiar estado del turno:', error);
    // Aquí podrías implementar una lógica para revertir la actualización optimista si el backend falla.
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
