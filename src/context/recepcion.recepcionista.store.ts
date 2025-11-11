import { sseService } from '@/services/sse.services';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import { atom, computed, map } from 'nanostores';



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
export const datosNuevoTurnoRecepcionista = map({
  pacienteId: '' as string | undefined,
  pacienteNombre: '' as string,
  userMedicoId: '' as string | undefined,
  fechaTurno: undefined as Date | undefined,
  horaTurno: '' as string, // formato "HH:mm"
  duracion: 30, // en minutos, valor por defecto
  tipoConsulta: 'presencial' as string,
  motivoConsulta: '' as string,
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
export const setFechaYHoraRecepcionista = (fecha: Date, hora: string, medicoId: string) => {
  datosNuevoTurnoRecepcionista.setKey('fechaTurno', fecha);
  datosNuevoTurnoRecepcionista.setKey('horaTurno', hora);
  datosNuevoTurnoRecepcionista.setKey('userMedicoId', medicoId);
};
export const setPacienteRecepcionista = (paciente: { id: string; nombre: string }) => {
  datosNuevoTurnoRecepcionista.setKey('pacienteId', paciente.id);
  datosNuevoTurnoRecepcionista.setKey('pacienteNombre', paciente.nombre);
};


export const resetNuevoTurnoRecepcionista = () => {
  datosNuevoTurnoRecepcionista.set({
    pacienteId: undefined,
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
