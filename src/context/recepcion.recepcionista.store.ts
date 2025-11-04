import { sseService } from '@/services/sse.services';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import { computed, map } from 'nanostores';

import type { AgendaSlot } from './agenda.store';


// --- TIPOS ---
export interface Profesional {
  id: string;
  nombre: string;
  apellido: string;
  especialidad?: string;
  abreviatura?: string;
}

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
  turnosDelDia: AgendaSlot[];
  isLoading: boolean;
  pestanaActiva: 'pacientes' | 'recepcion' | 'agenda';
  medicoSeleccionadoId: string | null; // null para 'Todos'
  error: string | null;
  sseConectado: boolean;
  ultimaActualizacion: string | null;
  profesionales: Profesional[];
}

// --- STORE PRINCIPAL ---
export const recepcionStore = map<RecepcionStore>({
  turnosDelDia: [],
  isLoading: true,
  pestanaActiva: 'recepcion', // El default ahora es la sala de espera
  medicoSeleccionadoId: null, // Por defecto se muestran todos
  error: null,
  sseConectado: false,
  ultimaActualizacion: null,
  profesionales: [],
});

// --- ACCIÓN PARA CAMBIAR MÉDICO ---
export function setMedicoSeleccionado(id: string | null) {
  recepcionStore.setKey('medicoSeleccionadoId', id);
}

// --- ACCIÓN PARA INICIALIZAR PROFESIONALES ---
export function setProfesionales(profesionales: Profesional[]) {
  recepcionStore.setKey('profesionales', profesionales);
}


// --- ACCIÓN PARA CAMBIAR PESTAÑA ---
export function setPestanaActiva(pestana: RecepcionStore['pestanaActiva']) {
  recepcionStore.setKey('pestanaActiva', pestana);
}

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

// --- MANEJADOR DE EVENTOS SSE ---
export function manejarEventoSSE(evento: any) {
  console.log('📥 Evento SSE recibido:', evento);

  if (evento.type === 'turno-actualizado') {
    const turnoActualizado = evento.data;

    const agendaSlotsActuales = recepcionStore.get().turnosDelDia;

    const agendaSlotsNuevos = agendaSlotsActuales.map(slot => {
      if (slot.turnoInfo?.id === turnoActualizado.id) {
        const turnoInfoNuevo = {
          ...slot.turnoInfo,
          estado: turnoActualizado.estado,
          horaLlegadaPaciente: turnoActualizado.horaLlegadaPaciente,
        };
        return { ...slot, turnoInfo: turnoInfoNuevo };
      }
      return slot;
    });

    recepcionStore.setKey('turnosDelDia', agendaSlotsNuevos);
    console.log(`🔄 Store actualizado via SSE: ${turnoActualizado.id}`);
    recepcionStore.setKey('ultimaActualizacion', new Date().toISOString());
  }

  else if (evento.type === 'turno-agendado') {
    const turnoAgendado: AgendaSlot = evento.data;
    const turnosActuales = recepcionStore.get().turnosDelDia;

    const yaExiste = turnosActuales.some(
      slot => slot.turnoInfo?.id === turnoAgendado.turnoInfo?.id
    );
    if (yaExiste) {
      console.log('🔄 Turno agendado ya existe en el store de recepción. Omitiendo.');
      return;
    }

    const turnosNuevos = [...turnosActuales, turnoAgendado];
    turnosNuevos.sort((a, b) => new Date(a.hora).getTime() - new Date(b.hora).getTime());

    recepcionStore.setKey('turnosDelDia', turnosNuevos);
    console.log(`✅ Turno agendado añadido a recepción via SSE: ${turnoAgendado.turnoInfo?.id}`);
    recepcionStore.setKey('ultimaActualizacion', new Date().toISOString());
  }

  else if (evento.type === 'turno-eliminado') {
    const turnoId = evento.data.id;
    const turnosActuales = recepcionStore.get().turnosDelDia;
    const turnosNuevos = turnosActuales.filter(t => t.turnoInfo?.id !== turnoId);

    recepcionStore.setKey('turnosDelDia', turnosNuevos);
    console.log(`🗑️ Turno eliminado de recepción via SSE: ${turnoId}`);
  }
}
// --- GESTIÓN DE CONEXIÓN SSE ---
export function iniciarConexionSSE(userId?: string) {
  if (userId) {
    sseService.setUserId(userId);
  }
  sseService.connect();
}

export function detenerConexionSSE() {
  sseService.disconnect();
}

export function getEstadoSSE() {
  return recepcionStore.get().sseConectado;
}

// --- ACCIONES PRINCIPALES ---


export async function fetchTurnosDelDia(fecha: string, centroMedicoId?: string) {
  recepcionStore.setKey('isLoading', true);
  const { medicoSeleccionadoId, profesionales } = recepcionStore.get();

  try {
    // Construir la URL dinámicamente
    let apiUrl = `/api/agenda?fecha=${fecha}`;
    if (centroMedicoId) {
      apiUrl += `&centroMedicoId=${centroMedicoId}`;
    }

    if (medicoSeleccionadoId) {
      // Si hay un médico específico seleccionado, se usa su ID
      apiUrl += `&profesionalId=${medicoSeleccionadoId}`;
    } else {
      // Si no, se usan los IDs de todos los profesionales asociados
      const ids = profesionales.map(p => p.id);
      if (ids.length > 0) {
        apiUrl += `&profesionalIds=${ids.join(',')}`;
      }
    }

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Respuesta de red no fue ok');
    const data = await response.json();
    recepcionStore.setKey('turnosDelDia', data.data);

    // La conexión SSE se mantiene para recibir actualizaciones de todos modos
    iniciarConexionSSE();
  } catch (error: any) {
    recepcionStore.setKey('error', error.message);
  } finally {
    recepcionStore.setKey('isLoading', false);
  }
}

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

  } catch (error) {
    console.error('Error al cambiar estado del turno:', error);
    recepcionStore.setKey('turnosDelDia', turnosActuales);
    recepcionStore.setKey('error', 'Error al guardar cambios en el servidor');
  }
}

// --- ACCIONES DE CONVENIENCIA ---
export const recepcionActions = {
  recibirPaciente: (turno: AgendaSlot) => setTurnoEstado(turno, 'sala_de_espera'),
  comenzarConsulta: (turno: AgendaSlot) => setTurnoEstado(turno, 'en_consulta'),
  finalizarTurno: (turno: AgendaSlot) => setTurnoEstado(turno, 'finalizado'),
  cancelarTurno: (turno: AgendaSlot) => setTurnoEstado(turno, 'cancelado'),
}
