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

interface AgendaProfesional {
  profesionalId: string;
  agenda: AgendaSlot[];
}

interface RecepcionStore {
  turnosDelDia: AgendaProfesional[];
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
// Ajustados para manejar la estructura de AgendaProfesional[]
// Asumimos que queremos mostrar TODOS los pacientes de TODOS los profesionales cargados
// Ojo: Si la vista debe filtrar por profesional específico, esto debería ajustarse.
// Por ahora concatenamos todas las agendas como comportamiento predeterminado de "Recepción General".

export const pacientesEnEspera = computed(recepcionStore, $store => {
  return $store.turnosDelDia.flatMap(p => p.agenda).filter(t => t.turnoInfo?.estado === 'sala_de_espera' || t.turnoInfo?.estado === 'demorado');
});

export const turnosPendientes = computed(recepcionStore, $store =>
  $store.turnosDelDia.flatMap(p => p.agenda).filter(t => t.turnoInfo?.estado === 'pendiente' || t.turnoInfo?.estado === 'confirmado')
);

export const turnosEnConsulta = computed(recepcionStore, $store =>
  $store.turnosDelDia.flatMap(p => p.agenda).filter(t => t.turnoInfo?.estado === 'en_consulta')
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
    const { turnosDelDia } = recepcionStore.get(); // turnosDelDia es AgendaProfesional[]

    if (!turnosDelDia.length) return;

    console.log('Turno actualizado recibido:', turnoActualizado);

    // Iteramos sobre las agendas de los profesionales
    const agendaActualizada = turnosDelDia.map(profesional => {
      // Verificamos si este turno pertenece a este profesional (optimización)
      // Aunque como 'turnoActualizado' a veces no trae profesionalId explícito en data plana,
      // buscamos por ID de turno en la agenda existente.

      const turnoEnAgenda = profesional.agenda.some(slot => slot.turnoInfo?.id === turnoActualizado.id);

      if (!turnoEnAgenda) return profesional; // Si no está en esta agenda, devolvemos tal cual

      // Si está, actualizamos
      const nuevaAgenda = profesional.agenda.map(slot => {
        if (slot.turnoInfo?.id === turnoActualizado.id) {
          return {
            ...slot,
            turnoInfo: {
              ...slot.turnoInfo,
              ...turnoActualizado,
            },
            disponible: turnoActualizado.estado !== 'cancelado' ? false : true
          };
        }
        return slot;
      });

      return {
        ...profesional,
        agenda: nuevaAgenda
      };
    });

    recepcionStore.setKey('turnosDelDia', agendaActualizada);
    recepcionStore.setKey('ultimaActualizacion', new Date().toISOString());
  }
  else if (evento.type === 'turno-agendado') {
    const turnoAgendado = evento.data; // Es un AgendaSlot
    const { turnosDelDia } = recepcionStore.get();
    if (!turnosDelDia.length) return;

    console.log('Turno recibido para agendar:', turnoAgendado);

    // Obtenemos el ID del médico del turno
    // turnoAgendado es un AgendaSlot, debería tener userMedicoId
    const profesionalIdEvento = turnoAgendado.userMedicoId || turnoAgendado.turnoInfo?.userMedicoId;

    if (!profesionalIdEvento) {
      console.warn('⚠️ Evento turno-agendado recibido sin userMedicoId, no se puede asignar.');
      return;
    }

    // Creamos una copia profunda del estado actual
    const nuevaAgendaGlobal = JSON.parse(JSON.stringify(turnosDelDia)) as AgendaProfesional[];

    // Buscamos el índice del profesional correspondiente
    const profesionalIndex = nuevaAgendaGlobal.findIndex(p => p.profesionalId === profesionalIdEvento);

    if (profesionalIndex === -1) {
      console.log(`ℹ️ Turno agendado recibido para el profesional ${profesionalIdEvento}, pero no está en la vista actual. Ignorando.`);
      return;
    }

    // Trabajamos sobre la agenda del profesional encontrado
    const agendaDelProfesional = nuevaAgendaGlobal[profesionalIndex].agenda;

    // Buscamos si ya existe un turno a la misma hora para evitar duplicados
    const turnoIndex = agendaDelProfesional.findIndex(slot =>
      isEqual(parseISO(slot.hora), parseISO(turnoAgendado.hora))
    );

    if (turnoIndex !== -1) {
      agendaDelProfesional[turnoIndex] = turnoAgendado;
    } else {
      agendaDelProfesional.push(turnoAgendado);
    }

    // Ordenamos
    agendaDelProfesional.sort((a, b) =>
      parseISO(a.hora).getTime() - parseISO(b.hora).getTime()
    );

    console.log(`Agenda actualizada para profesional ${profesionalIdEvento}`);

    recepcionStore.setKey('turnosDelDia', nuevaAgendaGlobal);
    recepcionStore.setKey('ultimaActualizacion', new Date().toISOString());
  }

  // Manejar otros tipos de eventos si es necesario
  else if (evento.type === 'turno-eliminado') {
    const turnoId = evento.data.id;
    const turnosActuales = recepcionStore.get().turnosDelDia;

    // Limpiamos de todas las agendas donde aparezca (teoricamente solo una)
    const agendasLimpias = turnosActuales.map(prof => ({
      ...prof,
      agenda: prof.agenda.filter(t => t.turnoInfo?.id !== turnoId)
    }));

    recepcionStore.setKey('turnosDelDia', agendasLimpias);
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

    // data.data debería ser AgendaProfesional[]
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
      nuevoEstado === 'sala_de_espera' || nuevoEstado === 'demorado'
        ? new Date(getFechaEnMilisegundos()).toISOString()
        : undefined,
  };

  // ✅ ACTUALIZACIÓN OPTIMISTA MEJORADA
  const storeState = recepcionStore.get();
  const turnosGlobales = storeState.turnosDelDia; // AgendaProfesional[]

  // Encontramos el profesional dueño del turno
  const profesionalId = turno.userMedicoId || turno.turnoInfo?.userMedicoId;
  const profIndex = turnosGlobales.findIndex(p => p.profesionalId === profesionalId);

  if (profIndex === -1) {
    console.error('No se encontró el profesional para actualización optimista');
    // Aún así intentamos enviar al backend
  } else {
    // Copia profunda para mutar
    const nuevaGlobal = JSON.parse(JSON.stringify(turnosGlobales));
    const agendaProf = nuevaGlobal[profIndex].agenda;

    const slotIndex = agendaProf.findIndex((t: AgendaSlot) => t.turnoInfo?.id === turno.turnoInfo?.id);
    if (slotIndex !== -1) {
      agendaProf[slotIndex] = {
        ...agendaProf[slotIndex],
        turnoInfo: {
          ...agendaProf[slotIndex].turnoInfo,
          estado: nuevoEstado,
          horaLlegadaPaciente: payload.horaLlegadaPaciente
        }
      };
      recepcionStore.setKey('turnosDelDia', nuevaGlobal);
    }
  }

  try {
    const response = await fetch(`/api/turno/${turno.turnoInfo?.id}/changeState`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log(`Turno ${turno.turnoInfo?.id} actualizado a ${nuevoEstado} en el backend`, data);

    // ✅ NO actualizamos el store aquí - SSE lo hará automáticamente para todos los clientes
  } catch (error) {
    console.error('Error al cambiar estado del turno:', error);
    // ✅ REVERTIR ACTUALIZACIÓN OPTIMISTA si falla
    if (profIndex !== -1) {
      recepcionStore.setKey('turnosDelDia', turnosGlobales); // Restauramos estado anterior
    }
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
