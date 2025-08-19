// src/stores/consulta.store.ts
import { atom } from 'nanostores';

// Definimos el tipo de la consulta
export interface Consulta {
  id: string;
  pacienteId: string;
  motivoConsulta: string;
  sintomas: string;
  historiaClinicaId: string;

  signosVitales: {
    presionArterial: number;
    frecuenciaCardiaca: number;
    frecuenciaRespiratoria: number;
    temperatura: number;
  };
  notas: string;
  observaciones: string;
  diagnosticos: { nombre: string; observacion: string }[];
  tratamiento: {
    fechaInicio: string;
    fechaFin: string;
    tratamiento: string;
  };
  medicamentos: string[];
}

// Estado inicial
const initialConsulta: Consulta = {
  id: '',
  motivoConsulta: '',
  sintomas: '',
  historiaClinicaId: '',
  signosVitales: {
    presionArterial: 0,
    frecuenciaCardiaca: 0,
    frecuenciaRespiratoria: 0,
    temperatura: 0,
  },
  observaciones: '',
  medicamentos: [],
  notas: '',
  pacienteId: '',
  tratamiento: {
    fechaInicio: '',
    fechaFin: '',
    tratamiento: '',
  },
  diagnosticos: [],
};

// Creamos el store
export const consultaStore = atom<Consulta>(initialConsulta);

// --- Helpers (acciones para actualizar el store) ---

// Setear campo específico
export function setConsultaField<K extends keyof Consulta>(field: K, value: Consulta[K]) {
  consultaStore.set({
    ...consultaStore.get(),
    [field]: value,
  });
}

// Agregar medicamento
export function addMedicamento(nombre: string) {
  const current = consultaStore.get();
  consultaStore.set({
    ...current,
    medicamentos: [...current.medicamentos, nombre],
  });
}

// Eliminar medicamento
export function removeMedicamento(index: number) {
  const current = consultaStore.get();
  consultaStore.set({
    ...current,
    medicamentos: current.medicamentos.filter((_, i) => i !== index),
  });
}

// Resetear consulta (cuando finalizas/guardas)
export function resetConsulta() {
  consultaStore.set(initialConsulta);
}
