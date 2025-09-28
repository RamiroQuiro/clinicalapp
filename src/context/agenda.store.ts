import { atom, map } from 'nanostores';

// El tipo de dato que devuelve nuestra API para cada slot
export interface AgendaSlot {
  hora: string; // ISO string
  disponible: boolean;
  turnoInfo: {
    id: string;
    pacienteId: string;
    pacienteCelular: string;
    pacienteNombre: string;
    pacienteApellido: string;
    pacienteDocumento: string;
    profesionalId: string;
    profesionalNombre: string;
    profesionalApellido: string;
    motivoConsulta: string;
    horaTurno: string;
    duracion: number;
    estado: 'confirmado' | 'pendiente' | 'cancelado';
  } | null;
}

// Atom para la fecha actualmente seleccionada en el calendario
export const fechaSeleccionada = atom<Date | undefined>(new Date());

// Atom para almacenar la agenda completa del día seleccionado
export const agendaDelDia = atom<AgendaSlot[]>([]);

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

// Acciones para manipular el store de nuevo turno
export const setPaciente = (paciente: { id: string; nombre: string }) => {
  datosNuevoTurno.setKey('pacienteId', paciente.id);
  datosNuevoTurno.setKey('pacienteNombre', paciente.nombre);
};

export const setFechaYHora = (fecha: Date, hora: string) => {
  datosNuevoTurno.setKey('fechaTurno', fecha);
  datosNuevoTurno.setKey('horaTurno', hora);
};

export const setDatosTurno = (datos: Partial<typeof datosNuevoTurno.get>) => {
  datosNuevoTurno.set(datos);
};

export const resetNuevoTurno = () => {
  datosNuevoTurno.set({
    pacienteId: undefined,
    pacienteNombre: '',
    userMedicoId: undefined,
    fechaTurno: undefined,
    horaTurno: '',
    duracion: 30,
    tipoConsulta: 'presencial',
    motivoConsulta: '',
  });
};
