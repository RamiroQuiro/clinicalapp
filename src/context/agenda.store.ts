import { getFechaEnMilisegundos } from '@/utils/timesUtils';
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
