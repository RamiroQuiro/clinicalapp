import { sseService } from '@/services/sse.services';
import { isEqual, parseISO } from 'date-fns';
import { atom, map } from 'nanostores';

// --- INTERFACES Y TIPOS ---
export interface Profesional {
  id: string;
  nombre: string;
  apellido: string;
}

export interface AgendaSlot {
  hora: string; // ISO string
  id?: string;
  disponible: boolean;
  userMedicoId: string;
  turnoInfo: DatosTurno | null;
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

interface AgendaStore {
  sseConectado: boolean;
  ultimaActualizacion: string | null;
}

interface Agenda {
  profesionalId: string;
  agenda: AgendaSlot[];
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
export const agendaDelDia = atom<Agenda[]>([
  {
    profesionalId: '',
    agenda: []
  }
]);


export const setCargarAgenda = (agenda: Agenda[]) => {
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
    agendaDelDia.set(data.data);
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
export const datosNuevoTurno = map<DatosTurno>({
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

export const agendaStore = map<AgendaStore>({
  sseConectado: false,
  ultimaActualizacion: null,
});

// --- MANEJADOR DE EVENTOS SSE PARA AGENDA ---
export function manejarEventoSSEAgenda(evento: any) {
  console.log('📥 Evento SSE recibido en Agenda:', evento);

  if (evento.type === 'turno-actualizado') {
    const turnoActualizado = evento.data;
    const agendaActual = agendaDelDia.get()

    console.log('agendaActual en el store de agneda', agendaActual[0].agenda)

    const nuevaAgenda = agendaActual.map(slot => {
      if (slot.agenda.turnoInfo?.id === turnoActualizado.id) {
        const turnoInfoNuevo = {
          ...slot.agenda.turnoInfo,
          estado: turnoActualizado.estado,
          horaLlegadaPaciente: turnoActualizado.horaLlegadaPaciente,
        };
        return { ...slot, agenda: { ...slot.agenda, turnoInfo: turnoInfoNuevo } };
      }
      return slot;
    });
    agendaDelDia.set(nuevaAgenda);
    console.log(`🔄 Agenda actualizada via SSE: ${turnoActualizado.id}`);
    agendaStore.setKey('ultimaActualizacion', new Date().toISOString());
  } else if (evento.type === 'turno-agendado') {
    const turnoAgendado = evento.data;
    const agendaCompleta = dataStoreAgenda.get().data
    if (!agendaCompleta.length) return;

    console.log('Turno recibido:', turnoAgendado);
    console.log('Agenda actual:', agendaCompleta);


    // Creamos una copia profunda del estado actual
    const nuevaAgenda = JSON.parse(JSON.stringify(agendaCompleta));
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

    dataStoreAgenda.setKey('data', nuevaAgenda);
    console.log(`✅ Turno agendado añadido a la agenda via SSE: ${turnoAgendado.turnoInfo?.id}`);
    agendaStore.setKey('ultimaActualizacion', new Date().toISOString());
  } else if (evento.type === 'turno-eliminado') {
    const turnoId = evento.data.id;
    const agendaCompleta = dataStoreAgenda.get().data;
    const agendaActual = agendaCompleta[0].agenda

    const nuevaAgenda = agendaActual.map(slot => {
      if (slot.turnoInfo?.id === turnoId) {
        return { ...slot, disponible: true, agenda: { ...slot.agenda, turnoInfo: null } };
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
export const setFechaYHora = (fecha: Date, hora: string, medicoId: string, turnoId?: string) => {
  console.log('estan entrando los datos?', fecha, hora, medicoId, turnoId);
  datosNuevoTurno.setKey('id', turnoId);
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
