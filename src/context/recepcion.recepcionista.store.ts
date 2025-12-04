import { sseService } from '@/services/sse.services';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import { isEqual, parseISO } from 'date-fns';
import { atom, computed, map } from 'nanostores';
import type { AgendaSlot } from './agenda.store';
import { sseHandlerRegistry } from './sse.handler';



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
  medicoSeleccionadoId: string[]; // null para 'Todos'
  error: string | null;
  sseConectado: boolean;
  ultimaActualizacion: string | null;
  profesionales: Profesional[];
  pacienteSeleccionado: any;
}

export interface DatosTurno {
  id: string;
  pacienteId: string;
  pacienteCelular: string;
  fechaTurno: string;
  pacienteNombre: string;
  pacienteApellido: string;
  pacienteDocumento: string;
  userMedicoId: string;
  profesionalNombre: string;
  profesionalApellido: string;
  motivoConsulta: string;
  horaTurno: string;
  horaLlegadaPaciente: string;
  duracion: number;
  estado:
  | 'confirmado'
  | 'pendiente'
  | 'cancelado'
  | 'sala_de_espera'
  | 'en_consulta'
  | 'finalizado';
}

// --- STORE PRINCIPAL ---
export const recepcionStore = map<RecepcionStore>({
  turnosDelDia: [],
  isLoading: true,
  pestanaActiva: 'recepcion', // El default ahora es la sala de espera
  medicoSeleccionadoId: [],
  error: null,
  sseConectado: false,
  ultimaActualizacion: null,
  profesionales: [],
  pacienteSeleccionado: null,
});

// DAR TUNRO NUEVO
// Mapa para almacenar los datos del formulario de un nuevo turno
export const datosNuevoTurnoRecepcionista = map<DatosTurno>({
  pacienteId: '' as string,
  pacienteNombre: '' as string,
  userMedicoId: '' as string,
  fechaTurno: '' as string,
  horaTurno: '' as string,
  duracion: 30,
  motivoConsulta: '' as string,
  horaLlegadaPaciente: '' as string,
  estado: 'pendiente' as string,
});



// --- ACCIÓN PARA CAMBIAR MÉDICO ---
// Si recibe un string, lo convierte a array. Si recibe un array, lo usa directamente
export function setMedicoSeleccionado(id: string | string[]) {
  // Si es un array, lo usamos directamente, si no, creamos un array con el id
  const nuevosIds = Array.isArray(id) ? [...id] : [id];

  // Actualizamos el store con los nuevos IDs
  recepcionStore.setKey('medicoSeleccionadoId', nuevosIds);

}

// --- ACCIÓN PARA CAMBIAR PACIENTE SELECCIONADO ---
export function setPacienteSeleccionado(paciente: any) {
  recepcionStore.setKey('pacienteSeleccionado', paciente);
}

// --- ACCIÓN PARA INICIALIZAR PROFESIONALES ---
export function setProfesionales(profesionales: Profesional[]) {
  recepcionStore.setKey('profesionales', profesionales);
}


// --- ACCIÓN PARA CAMBIAR PESTAÑA ---
export function setPestanaActiva(pestana: RecepcionStore['pestanaActiva']) {
  recepcionStore.setKey('pestanaActiva', pestana);
}

// Atom para la fecha actualmente seleccionada en el calendario
export const fechaSeleccionada = atom<Date | undefined>(new Date());

// --- ACCIÓN PARA CAMBIAR FECHA SELECCIONADA ---
// seccion para dar turnos en la agenda
export const setFechaYHoraRecepcionista = (fecha: Date, hora: string, medicoId: string, id?: string) => {
  datosNuevoTurnoRecepcionista.setKey('fechaTurno', fecha);
  datosNuevoTurnoRecepcionista.setKey('horaTurno', hora);
  datosNuevoTurnoRecepcionista.setKey('userMedicoId', medicoId);
  datosNuevoTurnoRecepcionista.setKey('id', id);
};
export const setPacienteRecepcionista = (paciente: { id: string; nombre: string }) => {
  datosNuevoTurnoRecepcionista.setKey('pacienteId', paciente.id);
  datosNuevoTurnoRecepcionista.setKey('pacienteNombre', paciente.nombre);
};


export const resetNuevoTurnoRecepcionista = () => {
  datosNuevoTurnoRecepcionista.set({
    id: '',
    pacienteId: '',
    pacienteNombre: '',
    userMedicoId: '', // Mantiene el médico seleccionado
    fechaTurno: undefined,
    horaTurno: '',
    duracion: 30,
    tipoConsulta: 'presencial',
    motivoConsulta: '',
  });
};


// --- STORES COMPUTADOS ---
export const pacientesEnEspera = computed(recepcionStore, $store =>
  $store.turnosDelDia.filter(t => t.turnoInfo?.estado === 'sala_de_espera')
);

export const turnosPendientes = computed(recepcionStore, $store =>
  $store.turnosDelDia.filter(t => t.turnoInfo?.estado === 'pendiente' || t.turnoInfo?.estado === 'confirmado')
);

export const turnosEnConsulta = computed(recepcionStore, $store =>
  $store.turnosDelDia.filter(t => t.turnoInfo?.estado === 'en_consulta')
);

// --- MANEJADOR DE EVENTOS SSE ---
export function manejarEventoSSERecepcionista(evento: any) {
  console.log('✅ --- Evento SSE en [Recepcionista] --- ✅:', evento);
  const { profesionales } = recepcionStore.get();
  const idsProfesionales = (profesionales || []).map((p: any) => p.id);
  const medicoId = evento.data?.profesionalId ?? evento.data?.userMedicoId;


  if (!idsProfesionales.includes(medicoId)) return;
  if (evento.type === 'turno-actualizado') {
    const t = evento.data;
    const medicoId = t.profesionalId ?? t.userMedicoId;
    if (!medicoId) return;

    const actual = recepcionStore.get().turnosDelDia;
    const nueva = JSON.parse(JSON.stringify(actual));

    const profIdx = nueva.findIndex((p: any) => p.profesionalId === medicoId);
    if (profIdx === -1) return;

    const agendaProf = nueva[profIdx].agenda as any[];
    const slotIdx = agendaProf.findIndex((slot: any) => slot.turnoInfo?.id === t.id);
    if (slotIdx === -1) {
      // Si por alguna razón no lo encuentra, no tocamos nada
      return;
    }

    const slot = agendaProf[slotIdx];
    const turnoInfoNuevo = {
      ...slot.turnoInfo,
      estado: t.estado,
      horaLlegadaPaciente: t.horaLlegadaPaciente,
    };

    agendaProf[slotIdx] = {
      ...slot,
      disponible: false,
      turnoInfo: turnoInfoNuevo,
    };

    recepcionStore.setKey('turnosDelDia', nueva);
    recepcionStore.setKey('ultimaActualizacion', new Date().toISOString());
  }

  else if (evento.type === 'turno-agendado') {
    const turnoAgendado = evento.data;
    const turnosActuales = recepcionStore.get().turnosDelDia;

    console.log('turno-agendado', turnoAgendado);
    // 1) Determinar el profesional del evento
    const medicoId = turnoAgendado.profesionalId ?? turnoAgendado.userMedicoId;
    if (!medicoId) {
      console.warn('turno-agendado sin profesionalId/userMedicoId, se ignora');
      return;
    }

    // 2) Clonar estado actual (evitar mutaciones)
    const nuevaAgenda = JSON.parse(JSON.stringify(turnosActuales));

    // 3) Ubicar el bloque del profesional
    const profesionalIndex = nuevaAgenda.findIndex((p: any) => p.profesionalId === medicoId);
    if (profesionalIndex === -1) {
      console.warn('No se encontró bloque de profesional en turnosDelDia para', medicoId);
      return;
    }

    // 4) Buscar la hora dentro de la agenda del profesional
    const agendaProf = nuevaAgenda[profesionalIndex].agenda as AgendaSlot[];
    const turnoIndex = agendaProf.findIndex(slot =>
      isEqual(parseISO(slot.hora), parseISO(turnoAgendado.hora))
    );
    console.log('turnoIndex', turnoIndex);

    // 5) Actualizar o insertar
    if (turnoIndex !== -1) {
      // Reemplazar el slot entero por el turnoAgendado (tienen misma forma)
      agendaProf[turnoIndex] = turnoAgendado;
    } else {
      agendaProf.push(turnoAgendado);
    }

    // 6) Orden por hora dentro del profesional
    agendaProf.sort((a, b) => parseISO(a.hora).getTime() - parseISO(b.hora).getTime());

    // 7) Guardar
    recepcionStore.setKey('turnosDelDia', nuevaAgenda);
    recepcionStore.setKey('ultimaActualizacion', new Date().toISOString());
    console.log(`✅ Turno agendado aplicado en recepcionista: ${turnoAgendado.turnoInfo?.id}`);
  }

  else if (evento.type === 'turno-eliminado') {
    const t = evento.data; // { id, userMedicoId, hora }
    const medicoId = t.userMedicoId || ''


    const actual = recepcionStore.get().turnosDelDia;
    const nueva = JSON.parse(JSON.stringify(actual));
    const profIdx = nueva.findIndex((p: any) => p.profesionalId === medicoId);
    if (profIdx === -1) return;
    const agendaProf = nueva[profIdx].agenda as any[];
    // 1) Preferir por id
    let slotIdx = agendaProf.findIndex((slot: any) => slot.turnoInfo?.id === t.id);
    // 2) Fallback por hora ISO (por si el turnoInfo ya fue null en memoria)
    if (slotIdx === -1 && t.hora) {
      slotIdx = agendaProf.findIndex((slot: any) => isEqual(parseISO(slot.hora), parseISO(t.hora)));
    }
    if (slotIdx === -1) return;
    const slot = agendaProf[slotIdx];
    agendaProf[slotIdx] = { ...slot, disponible: true, turnoInfo: null };
    recepcionStore.setKey('turnosDelDia', nueva);
    recepcionStore.setKey('ultimaActualizacion', new Date().toISOString());
    console.log(`🗑️ Turno eliminado en recepcionista: ${t.id}`);
  }
}

let recepHandlersRegistrados = false;
export function registrarHandlersRecepcionista() {
  if (recepHandlersRegistrados) return;
  sseHandlerRegistry.registrar('turno-actualizado', {
    id: 'recepcionista-turno-actualizado',
    handler: manejarEventoSSERecepcionista,
    stores: [recepcionStore],
  });
  sseHandlerRegistry.registrar('turno-agendado', {
    id: 'recepcionista-turno-agendado',
    handler: manejarEventoSSERecepcionista,
    stores: [recepcionStore],
  });
  sseHandlerRegistry.registrar('turno-eliminado', {
    id: 'recepcionista-turno-eliminado',
    handler: manejarEventoSSERecepcionista,
    stores: [recepcionStore],
  });
  recepHandlersRegistrados = true;
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
    // Construir la URL base con la fecha
    let apiUrl = `/api/agenda?fecha=${fecha}`;

    // Agregar centro médico si está especificado
    if (centroMedicoId) {
      apiUrl += `&centroMedicoId=${centroMedicoId}`;
    }

    // Obtener los IDs de los profesionales a consultar
    let idsAconsultar: string[] = [];

    if (medicoSeleccionadoId && medicoSeleccionadoId.length > 0) {
      // Usar los IDs de los médicos seleccionados
      idsAconsultar = [...medicoSeleccionadoId];
    } else if (profesionales && profesionales.length > 0) {
      // Si no hay selección, usar todos los profesionales disponibles
      idsAconsultar = profesionales.map(p => p.id);
    }

    // Agregar los IDs a la URL si hay profesionales para consultar
    if (idsAconsultar.length > 0) {
      apiUrl += `&profesionalIds=${idsAconsultar.join(',')}`;
    }

    console.log('Solicitando turnos con URL:', apiUrl);

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Error al obtener los turnos');

    const data = await response.json();
    recepcionStore.setKey('turnosDelDia', data.data || []);
    recepcionStore.setKey('error', null);

    // Iniciar conexión SSE para recibir actualizaciones
    iniciarConexionSSE();

    return data.data;
  } catch (error: any) {
    console.error('Error al cargar los turnos:', error);
    recepcionStore.setKey('error', error.message || 'No se pudieron cargar los turnos');
    return [];
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
