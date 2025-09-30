import { computed, map } from 'nanostores';
import { io } from 'socket.io-client';

// Asumo que tienes un tipo 'Turno' o similar. Usaré 'any' por ahora.
type Turno = any;

// --- 1. CONEXIÓN AL SERVIDOR DE SOCKETS ---
// Se crea una única instancia del socket para toda la aplicación.
const socket = io('http://localhost:5000');

// --- 2. DEFINICIÓN DEL STORE ---
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

// --- 3. STORES COMPUTADOS (VISTAS FILTRADAS AUTOMÁTICAS) ---
// Estos stores se actualizan solos cada vez que 'turnosDelDia' cambia.

export const pacientesEnEspera = computed(recepcionStore, $store =>
  $store.turnosDelDia.filter(t => t.estado === 'sala_de_espera')
);

export const turnosPendientes = computed(recepcionStore, $store =>
  $store.turnosDelDia.filter(t => t.estado === 'pendiente' || t.estado === 'confirmado')
);

export const turnosEnConsulta = computed(recepcionStore, $store =>
  $store.turnosDelDia.filter(t => t.estado === 'en_consulta')
);

// --- 4. ACCIONES (LÓGICA DE NEGOCIO) ---

export async function fetchTurnosDelDia(fecha: string) {
  recepcionStore.setKey('isLoading', true);
  try {
    // Usamos el endpoint que ya tienes para obtener los turnos del día
    const response = await fetch(`/api/agenda?fecha=${fecha}`);
    if (!response.ok) throw new Error('Respuesta de red no fue ok');
    const data = await response.json();

    // Guardamos la lista completa en nuestro único store de verdad.
    recepcionStore.setKey('turnosDelDia', data);
  } catch (error: any) {
    recepcionStore.setKey('error', error.message);
  } finally {
    recepcionStore.setKey('isLoading', false);
  }
}

/**
 * Cambia el estado de un turno.
 * ESTA FUNCIÓN AHORA USA WEBSOCKETS en lugar de fetch.
 * @param turnoId - El ID del turno a modificar.
 * @param nuevoEstado - El nuevo estado a asignar.
 */
export function updateTurnoStatus(turnoId: string, nuevoEstado: string) {
  const payload: { turnoId: string; estado: string; horaLlegadaPaciente?: string } = {
    turnoId: turnoId,
    estado: nuevoEstado,
  };

  // Si el nuevo estado es 'sala_de_espera', añadimos la hora de llegada.
  if (nuevoEstado === 'sala_de_espera') {
    payload.horaLlegadaPaciente = new Date().toISOString();
  }

  // Emitimos el evento al servidor de sockets, que se encargará de llamar a la API.
  socket.emit('cambiar-estado-turno', payload);
}

// --- 5. OYENTE DE WEBSOCKETS (LA MAGIA DEL TIEMPO REAL) ---
// Este código se configura una vez y mantiene el store sincronizado.

socket.on('connect', () => {
  console.log('✅ Conectado al servidor de sockets desde el store.');
});

socket.on('turno-actualizado', turnoActualizado => {
  console.log('EVENTO RECIBIDO: turno-actualizado', turnoActualizado);

  // Al recibir la notificación de que un turno cambió, la forma más
  // simple y robusta de actualizar la UI es volver a pedir la lista completa.
  // Así nos aseguramos de que el estado del frontend es un reflejo fiel de la DB.
  const hoy = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
  fetchTurnosDelDia(hoy);
});

socket.on('disconnect', () => {
  console.log('❌ Desconectado del servidor de sockets.');
});
