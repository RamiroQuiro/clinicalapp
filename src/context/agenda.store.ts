import APP_TIME_ZONE from '@/lib/timeZone';
import { sseService } from '@/services/sse.services';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import { toZonedTime } from 'date-fns-tz';
import { atom, map } from 'nanostores';
import { recepcionStore } from './recepcion.store';

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
export const fechaSeleccionada = atom<Date | undefined>(new Date(getFechaEnMilisegundos()));

// Atom para almacenar la agenda completa del día seleccionado
export const agendaDelDia = atom<AgendaSlot[]>([]);

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

    const agendaSlotsActuales = recepcionStore.get().turnosDelDia;
    console.log('turnoAgendado', turnoAgendado);
    const splitFechaTurno = turnoAgendado.turnoInfo?.fechaTurno.split('T');
    let horaFormateada = toZonedTime(
      `${splitFechaTurno[0]}T${turnoAgendado.turnoInfo?.horaTurno}:00.000`,
      APP_TIME_ZONE
    );

    console.log('horaFormateada', horaFormateada);

    const agendaSlotsNuevos = [
      ...agendaSlotsActuales,
      { ...turnoAgendado, hora: horaFormateada.toISOString() },
    ];

    recepcionStore.setKey('turnosDelDia', agendaSlotsNuevos);
    console.log(`nueva agenda ->`, agendaSlotsNuevos);
    console.log(`🔄 Store actualizado via SSE: ${turnoAgendado.turnoInfo.id}`);
    recepcionStore.setKey('ultimaActualizacion', new Date(getFechaEnMilisegundos()).toISOString());
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
