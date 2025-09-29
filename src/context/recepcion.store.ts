import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import { map } from 'nanostores';
import type { AgendaSlot } from './agenda.store';

export type RecepcionStore = {
  pestanaActiva: 'recepcion' | 'salaEspera' | 'pacientes';
  turnosDelDia: AgendaSlot[]; // Se tipará correctamente más adelante
  pacientesEnEspera: AgendaSlot[]; // Se tipará correctamente más adelante
  isLoading: boolean;
  error: string | null;
};

export const recepcionStore = map<RecepcionStore>({
  pestanaActiva: 'recepcion',
  turnosDelDia: [],
  pacientesEnEspera: [],
  isLoading: true,
  error: null,
});

export async function setPacientesEnEspera(slot: AgendaSlot) {
  try {
    const response = await fetch(`/api/turno/${slot.turnoInfo?.id}/changeState`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...slot.turnoInfo,
        horaLlegadaPaciente: new Date(getFechaEnMilisegundos()),
        estado: 'sala_de_espera',
      }),
    });
    const data = await response.json();

    if (response.ok) {
      recepcionStore.setKey('pacientesEnEspera', [...recepcionStore.get().pacientesEnEspera, slot]);
      const updateTurnos = recepcionStore.get().turnosDelDia.map(t =>
        t.turnoInfo?.id === data.data.id
          ? {
              ...t,
              turnoInfo: {
                ...t.turnoInfo,
                estado: data.data.estado,
                horaLlegadaPaciente: data.data.horaLlegadaPaciente,
              },
            }
          : t
      );

      recepcionStore.setKey('turnosDelDia', updateTurnos);
    }
  } catch (error) {
    console.log('error al cambiar el estado del turno', error);
  }
}

export function setPestanaActiva(pestana: 'recepcion' | 'salaEspera' | 'pacientes') {
  recepcionStore.setKey('pestanaActiva', pestana);
}

export async function fetchSalaDeEspera(userId: string) {
  try {
    const response = await fetch(`/api/turno/salaDeEspera?userId=${userId}`);
    const data = await response.json();

    recepcionStore.setKey('pacientesEnEspera', data.data);
  } catch (error) {
    console.log('error al obtener los pacientes en espera', error);
  }
}
