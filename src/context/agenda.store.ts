import { sseService } from '@/services/sse.services';
import { atom, map } from 'nanostores';

// --- INTERFACES Y TIPOS ---
export interface Profesional {
  id: string;
  nombre: string;
  apellido: string;
}

export interface AgendaSlot {
  hora: string; // ISO string
  disponible: boolean;
  userMedicoId: string;
  turnoInfo: {
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
  } | null;
}

interface AgendaStore {
  sseConectado: boolean;
  ultimaActualizacion: string | null;
}

// --- STORES ---

// Atom para la fecha actualmente seleccionada en el calendario
export const fechaSeleccionada = atom<Date | undefined>(new Date());


export const dataStoreAgenda = map({
  isLoading: false,
  error: null,
  data: []
})
// Atom para almacenar la agenda completa del día seleccionado
export const agendaDelDia = atom<AgendaSlot[]>([]);


export const setCargarAgenda = (agenda: AgendaSlot[]) => {
  dataStoreAgenda.setKey('data', agenda);
}

export const fetchAgenda = async (fechaFormateada: string, userSeleccionadoId: string, centroMedicoId: string) => {
  dataStoreAgenda.setKey('isLoading', true);
  try {
    const response = await fetch(
      `/api/agenda?fecha=${fechaFormateada}&profesionalId=${userSeleccionadoId}&centroMedicoId=${centroMedicoId}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    setCargarAgenda(data.data); // Actualiza el store global
    dataStoreAgenda.setKey('isLoading', false);
  } catch (error) {
    console.error('Error al obtener la agenda:', error);

    agendaDelDia.set([]); // Limpiar la agenda en caso de error
    dataStoreAgenda.setKey('isLoading', false);
  }
};



// Atom para el profesional actualmente seleccionado en la agenda
export const profesionalSeleccionado = atom<Profesional | undefined>();

// Mapa para almacenar los datos del formulario de un nuevo turno
export const datosNuevoTurno = map({
  pacienteId: '' as string | undefined,
  pacienteNombre: '' as string,
  userMedicoId: '' as string | undefined,
  fechaTurno: undefined as Date | undefined,
  horaTurno: '' as string, // formato "HH:mm"
  duracion: 30, // en minutos, valor por defecto
  tipoConsulta: 'presencial' as string,
  motivoConsulta: '' as string,
});

export const agendaStore = map<AgendaStore>({
  sseConectado: false,
  ultimaActualizacion: null,
});

// --- MANEJADOR DE EVENTOS SSE PARA AGENDA ---
export function manejarEventoSSEAgenda(evento: any) {
  console.log('📥 Evento SSE recibido en Agenda:', evento);

  if (evento.type === 'turno-actualizado') {
    const turnoActualizado = evento.data;
    const agendaActual = agendaDelDia.get();

    const nuevaAgenda = agendaActual.map(slot => {
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
    agendaDelDia.set(nuevaAgenda);
    console.log(`🔄 Agenda actualizada via SSE: ${turnoActualizado.id}`);
    agendaStore.setKey('ultimaActualizacion', new Date().toISOString());
  } else if (evento.type === 'turno-agendado') {
    const turnoAgendado: AgendaSlot = evento.data;
    const agendaActual = agendaDelDia.get();

    // Comprobamos si el turno ya existe para evitar duplicados
    const yaExiste = agendaActual.some(
      slot => slot.turnoInfo?.id === turnoAgendado.turnoInfo?.id
    );
    if (yaExiste) {
      console.log('🔄 Turno agendado ya existe en el store de agenda. Omitiendo.');
      return;
    }

    const fechaFormateada = new Date(turnoAgendado.hora);

    console.log('fechaFormateada', fechaFormateada);

    // Añadimos el nuevo turno al array
    const nuevaAgenda = [...agendaActual, turnoAgendado];

    // Ordenamos la agenda por hora, convirtiendo la fecha ISO a un valor numérico
    const agendaOrdenada = nuevaAgenda.sort(
      (a, b) => new Date(a.hora).getTime() - new Date(b.hora).getTime()
    );

    console.log('esta es la agenda ordenada en el AstroConfigRefinedSchema.store', agendaOrdenada);
    agendaDelDia.set(agendaOrdenada);
    console.log(`✅ Turno agendado añadido a la agenda via SSE: ${turnoAgendado.turnoInfo?.id}`);
    agendaStore.setKey('ultimaActualizacion', new Date().toISOString());
  } else if (evento.type === 'turno-eliminado') {
    const turnoId = evento.data.id;
    const agendaActual = agendaDelDia.get();

    const nuevaAgenda = agendaActual.map(slot => {
      if (slot.turnoInfo?.id === turnoId) {
        return { ...slot, disponible: true, turnoInfo: null };
      }
      return slot;
    });
    agendaDelDia.set(nuevaAgenda);
    console.log(`🗑️ Turno eliminado via SSE: ${turnoId}`);
    agendaStore.setKey('ultimaActualizacion', new Date().toISOString());
  }
}

// --- GESTIÓN DE CONEXIÓN SSE ---
export function iniciarConexionSSEAgenda(userId?: string) {
  if (userId) {
    sseService.setUserId(userId);
  }
  sseService.connect();
  agendaStore.setKey('sseConectado', true); // Asumimos que la conexión se intentará
}

export function detenerConexionSSEAgenda() {
  sseService.disconnect();
  agendaStore.setKey('sseConectado', false);
}

// --- ACCIONES (SETTERS) ---

export const setProfesionalSeleccionado = (profesional: Profesional) => {
  profesionalSeleccionado.set(profesional);
};

export const setPaciente = (paciente: { id: string; nombre: string }) => {
  datosNuevoTurno.setKey('pacienteId', paciente.id);
  datosNuevoTurno.setKey('pacienteNombre', paciente.nombre);
};

// MODIFICADO: Ahora también acepta y guarda el medicoId
export const setFechaYHora = (fecha: Date, hora: string, medicoId: string) => {
  datosNuevoTurno.setKey('fechaTurno', fecha);
  datosNuevoTurno.setKey('horaTurno', hora);
  datosNuevoTurno.setKey('userMedicoId', medicoId);
};

export const setDatosTurno = (datos: Partial<typeof datosNuevoTurno.get>) => {
  console.log('datos en el store ->', datos);
  datosNuevoTurno.set(datos);
};

export const resetNuevoTurno = () => {
  datosNuevoTurno.set({
    pacienteId: undefined,
    pacienteNombre: '',
    userMedicoId: profesionalSeleccionado.get()?.id, // Mantiene el médico seleccionado
    fechaTurno: undefined,
    horaTurno: '',
    duracion: 30,
    tipoConsulta: 'presencial',
    motivoConsulta: '',
  });
};
