import { sseService } from '@/services/sse.services';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import { computed, map } from 'nanostores';

import { isEqual, parseISO } from 'date-fns';
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
  turnosDelDia: AgendaSlot[];
  isLoading: boolean;
  pestanaActiva: 'pacientes' | 'recepcion' | 'salaDeEspera';
  error: string | null;
  sseConectado: boolean;
  ultimaActualizacion: string | null;
}

// --- STORE PRINCIPAL ---
export const recepcionStore = map<RecepcionStore>({
  turnosDelDia: [],
  isLoading: true,
  pestanaActiva: 'recepcion',
  error: null,
  sseConectado: false,
  ultimaActualizacion: null,
});

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
/**
 * Esta función se llama cuando llegan eventos SSE del servidor
 * Actualiza el store con los datos frescos del servidor
 */
export function manejarEventoSSE(evento: any) {
  console.log('📥 Evento SSE recibido:', evento);
  if (evento.type === 'turno-actualizado') {
    const turnoActualizado = evento.data;
    const { turnosDelDia } = recepcionStore.get();

    if (!turnosDelDia.length) return;

    console.log('Turno actualizado recibido:', turnoActualizado);
    console.log('Agenda actual:', turnosDelDia);

    // Actualizamos la estructura de la agenda
    const agendaActualizada = turnosDelDia.map(profesional => {
      // Buscamos si hay un turno con el mismo ID en la agenda del profesional
      const agendaActualizada = profesional.agenda.map(slot => {
        if (slot.turnoInfo?.id === turnoActualizado.id) {
          // Mantenemos los datos existentes del slot y actualizamos solo el turnoInfo
          return {
            ...slot,
            turnoInfo: {
              ...slot.turnoInfo,  // Mantenemos los datos existentes del turno
              ...turnoActualizado, // Sobrescribimos con los datos actualizados
            },
            disponible: turnoActualizado.estado !== 'cancelado' ? false : true
          };
        }
        return slot;
      });

      // Si no encontramos el turno en la agenda, lo agregamos
      const turnoExiste = agendaActualizada.some(slot =>
        slot.turnoInfo?.id === turnoActualizado.id
      );

      if (!turnoExiste) {
        // Creamos un nuevo slot para el turno
        const nuevoSlot: AgendaSlot = {
          hora: turnoActualizado.fechaTurno,
          disponible: false,
          turnoInfo: turnoActualizado,
          // Agregar otras propiedades necesarias según tu interfaz AgendaSlot
        };
        agendaActualizada.push(nuevoSlot);
      }

      return {
        ...profesional,
        agenda: agendaActualizada.sort((a, b) =>
          new Date(a.hora).getTime() - new Date(b.hora).getTime()
        )
      };
    });

    console.log('Agenda actualizada:', agendaActualizada);
    recepcionStore.setKey('turnosDelDia', agendaActualizada);
    recepcionStore.setKey('ultimaActualizacion', new Date().toISOString());
  }
  else if (evento.type === 'turno-agendado') {
    const turnoAgendado = evento.data;
    const { turnosDelDia } = recepcionStore.get();
    if (!turnosDelDia.length) return;

    console.log('Turno recibido:', turnoAgendado);
    console.log('Agenda actual:', turnosDelDia);


    // Creamos una copia profunda del estado actual
    const nuevaAgenda = JSON.parse(JSON.stringify(turnosDelDia));
    const profesionalIndex = 0; // Asumiendo que trabajamos con el primer profesional

    // Buscamos si ya existe un turno a la misma hora
    const turnoIndex = nuevaAgenda[profesionalIndex].agenda.findIndex(slot =>
      isEqual(parseISO(slot.hora), parseISO(turnoAgendado.hora))
    );

    if (turnoIndex !== -1) {
      // Si existe, actualizamos el turno
      nuevaAgenda[profesionalIndex].agenda[turnoIndex] = turnoAgendado;
    } else {
      // Si no existe, lo agregamos
      nuevaAgenda[profesionalIndex].agenda.push(turnoAgendado);
    }

    // Ordenamos la agenda por hora
    nuevaAgenda[profesionalIndex].agenda.sort((a, b) =>
      parseISO(a.hora).getTime() - parseISO(b.hora).getTime()
    );

    console.log('Agenda actualizada:', nuevaAgenda);

    recepcionStore.setKey('turnosDelDia', nuevaAgenda);
    console.log(`✅ Turno agendado añadido a la agenda via SSE: ${turnoAgendado.turnoInfo?.id}`);
    recepcionStore.setKey('ultimaActualizacion', new Date().toISOString());
  }

  // Manejar otros tipos de eventos si es necesario
  else if (evento.type === 'turno-eliminado') {
    const turnoId = evento.data.id;
    const turnosActuales = recepcionStore.get().turnosDelDia;
    // Corregido: filtrar por turnoInfo.id
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
export async function fetchTurnosDelDia(fecha: string, userId?: string, centroMedicoId?: string) {
  recepcionStore.setKey('isLoading', true);
  try {
    const response = await fetch(
      `/api/agenda?fecha=${fecha}&profesionalId=${userId}&centroMedicoId=${centroMedicoId}`
    );
    if (!response.ok) throw new Error('Respuesta de red no fue ok');
    const data = await response.json();
    console.log('turnos del dia->', data.data);
    recepcionStore.setKey('turnosDelDia', data.data);

    // ✅ INICIAR SSE después de cargar los turnos
    iniciarConexionSSE();
  } catch (error: any) {
    recepcionStore.setKey('error', error.message);
  } finally {
    recepcionStore.setKey('isLoading', false);
  }
}

/**
 * Cambia el estado de un turno y envía la actualización al backend.
 * También aplica una actualización optimista al store local.
 * El SSE se encargará de sincronizar con otros clientes.
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

  // ✅ ACTUALIZACIÓN OPTIMISTA ORIGINAL (la que tenías)
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

    // ✅ NO actualizamos el store aquí - SSE lo hará automáticamente para todos los clientes
  } catch (error) {
    console.error('Error al cambiar estado del turno:', error);
    // ✅ REVERTIR ACTUALIZACIÓN OPTIMISTA si falla (manteniendo tu lógica original)
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
