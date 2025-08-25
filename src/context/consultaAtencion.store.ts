// src/stores/consulta.store.ts
import { atom } from 'nanostores';

// Definimos el tipo de la consulta
export interface Consulta {
  id: string;
  pacienteId: string;
  motivoInicial: string;
  motivoConsulta: string;
  sintomas: string;
  historiaClinicaId: string;
  estado: string; // AÑADIDO

  signosVitales: {
    presionArterial: number;
    frecuenciaCardiaca: number;
    frecuenciaRespiratoria: number;
    temperatura: number;
  };
  notas: string;
  observaciones: string;
  diagnosticos: { diagnostico: string; observaciones: string; codigoCIE: string; id: string }[];
  tratamiento: {
    fechaInicio: string;
    fechaFin: string;
    tratamiento: string;
  };
  medicamentos: {
    nombreGenerico: string;
    nombreComercial: string;
    dosis: string;
    frecuencia: string;
    id: string;
  }[];
  inicioConsulta: string | null; // AÑADIDO
  finConsulta: string | null; // AÑADIDO
  duracionConsulta: number | null; // AÑADIDO
}

// Estado inicial
const initialConsulta: Consulta = {
  id: '',
  motivoInicial: '',
  motivoConsulta: '',
  sintomas: '',
  historiaClinicaId: '',
  estado: '', // AÑADIDO
  signosVitales: {
    presionArterial: 0,
    frecuenciaCardiaca: 0,
    frecuenciaRespiratoria: 0,
    temperatura: 0,
  },
  observaciones: '',
  notas: '',
  pacienteId: '',
  tratamiento: {
    fechaInicio: '',
    fechaFin: '',
    tratamiento: '',
  },
  medicamentos: [
    {
      nombreGenerico: '',
      nombreComercial: '',
      dosis: '',
      frecuencia: '',
      id: '',
    },
  ],
  diagnosticos: [],
  inicioConsulta: null, // AÑADIDO
  finConsulta: null, // AÑADIDO
  duracionConsulta: null, // AÑADIDO
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
export function addTratamiento(tratamiento: string, fechaInicio: string, fechaFin: string) {
  const current = consultaStore.get();
  consultaStore.set({
    ...current,
    tratamiento: {
      ...current.tratamiento,
      tratamiento,
      fechaInicio,
      fechaFin,
    },
  });
}
// Agregar medicamento
export function addMedicamento(nombre: string) {
  const current = consultaStore.get();
  consultaStore.set({
    ...current,
    medicamentos: [
      ...current.medicamentos,
      { nombreComercial: '', nombreGenerico: '', dosis: '', frecuencia: '', id: '' },
    ],
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

// // Resetear consulta (cuando finalizas/guardas)
// export function resetConsulta() {
//   consultaStore.set(initialConsulta);
// }
