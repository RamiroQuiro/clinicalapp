import { computed, map } from 'nanostores';
import { io } from 'socket.io-client';

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

// --- SOCKET ---
const socket = io(); // Se conecta automáticamente al mismo host/puerto que el frontend

// --- STORE PRINCIPAL ---
export const recepcionStore = map<{
  turnosDelDia: Turno[];
  isLoading: boolean;
  pestanaActiva: 'pacientes' | 'recepcion' | 'salaDeEspera';
  error: string | null;
}>({
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
export async function setTurnoEstado(turno: Turno, nuevoEstado: Turno['estado']) {
  const payload = {
    ...turno,
    estado: nuevoEstado,
    horaLlegadaPaciente: nuevoEstado === 'sala_de_espera' ? new Date().toISOString() : undefined,
  };

  try {
    const response = await fetch(`/api/turno/${turno.id}/changeState`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(`Turno ${turno.id} actualizado a ${nuevoEstado}`, data);

    // Emitimos evento para notificar al resto de clientes conectados
    socket.emit('turno-actualizado', data);
  } catch (error) {
    console.error('Error al cambiar estado del turno:', error);
  }
}

// --- OYENTES DEL SOCKET ---
// Actualiza el store automáticamente cuando llega un cambio de estado
socket.on('connect', () => console.log('✅ Conectado al servidor de sockets desde el store.'));

socket.on('turno-actualizado', (turnoActualizado: Turno) => {
  console.log('EVENTO RECIBIDO: turno-actualizado', turnoActualizado);
  recepcionStore.setKey('turnosDelDia', $store =>
    $store.turnosDelDia.map(t => (t.id === turnoActualizado.id ? { ...t, ...turnoActualizado } : t))
  );
});

socket.on('disconnect', () => console.log('❌ Desconectado del servidor de sockets.'));
