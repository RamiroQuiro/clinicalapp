import { map } from 'nanostores';

export type RecepcionStore = {
  pestanaActiva: 'recepcion' | 'salaEspera' | 'pacientes';
  turnosDelDia: any[]; // Se tipará correctamente más adelante
  pacientesEnEspera: any[]; // Se tipará correctamente más adelante
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

export function setPacientesEnEspera(pacientes: any[]) {
  recepcionStore.setKey('pacientesEnEspera', pacientes);
}
export function setPestanaActiva(pestana: 'recepcion' | 'salaEspera' | 'pacientes') {
  recepcionStore.setKey('pestanaActiva', pestana);
}
