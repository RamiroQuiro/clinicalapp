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
  planSeguir: string;
  signosVitales: {
    presionArterial: number;
    frecuenciaCardiaca: number;
    frecuenciaRespiratoria: number;
    temperatura: number;
  };
  notas: {
    title: string;
    descripcion: string;
    profesional: string;
    fecha: string;
    id: string;
  }[];
  observaciones: string;
  diagnosticos: {
    diagnostico: string;
    observaciones: string;
    codigoCIE: string;
    id: string;
    estado: string;
  }[];
  tratamiento: string;
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
  planSeguir: '',
  observaciones: '',
  notas: [],
  pacienteId: '',
  tratamiento: '',
  medicamentos: [
    {
      nombreGenerico: '',
      nombreComercial: '',
      dosis: '',
      frecuencia: '',
      id: '',
    },
  ],
  diagnosticos: [
    {
      diagnostico: '',
      observaciones: '',
      codigoCIE: '',
      id: '',
      estado: '',
    },
  ],
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

// Agregar Nota
export function addNota(nota: {
  title: string;
  descripcion: string;
  profesional: string;
  id: string;
}) {
  const current = consultaStore.get();

  consultaStore.set({
    ...current,
    notas: [
      ...current.notas,
      {
        title: nota.title,
        descripcion: nota.descripcion,
        profesional: nota.profesional,
        fecha: new Date().toISOString(),
        id: nota.id,
      },
    ],
  });
}

// Editar Nota
export function editNota(nota: {
  title: string;
  descripcion: string;
  created_at: string;
  userMedicoId: string;
  id: string;
}) {
  const current = consultaStore.get();
  consultaStore.set({
    ...current,
    notas: current.notas.map(n => (n.id === nota.id ? nota : n)),
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
