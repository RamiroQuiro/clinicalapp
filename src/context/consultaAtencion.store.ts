// src/stores/consulta.store.ts
import { atom } from 'nanostores';

// --- Tipos Nuevos ---
export interface OrdenEstudio {
  id: string;
  atencionId: string;
  pacienteId: string;
  medicoId: string;
  fechaCreacion: string;
  diagnosticoPresuntivo: string;
  estudiosSolicitados: string[];
}

export interface Derivacion {
  id: string;
  atencionId: string;
  pacienteId: string;
  userIdOrigen: string;
  userIdDestino?: string | null;
  nombreProfesionalExterno?: string | null;
  especialidadDestino: string;
  motivoDerivacion: string;
  estado: string;
}

// Definimos el tipo para un archivo adjunto
export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  url: string;
  tipo: string;
  descripcion: string;
  atencionId: string;
  created_at: string;
}

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
    frecuenciaRespiratoria: number;
    dolor: string | null;
    fechaRegistro: string | null;
    glucosa: number;
    imc: number;
    peso: number;
    perimetroAbdominal: number;
    perimetroCefalico: number;
    talla: number;
    saturacionOxigeno: number;
    presionSistolica: number;
    presionDiastolica: number;
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
  archivos: ArchivoAdjunto[]; // AÑADIDO PARA ARCHIVOS
  ordenesEstudio: OrdenEstudio[]; // NUEVO
  derivaciones: Derivacion[]; // NUEVO
  inicioAtencion: string | null; // AÑADIDO
  finAtencion: string | null; // AÑADIDO
  duracionAtencion: number | null; // AÑADIDO
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
    presionSistolica: 0,
    presionDiastolica: 0,
    perimetroAbdominal: 0,
    perimetroCefalico: 0,
    saturacionOxigeno: 0,
    glucosa: 0,
    peso: 0,
    talla: 0,
    imc: 0,
    dolor: null,
    fechaRegistro: null,
    frecuenciaRespiratoria: 0,
    temperatura: 0,
  },
  planSeguir: '',
  observaciones: '',
  notas: [],
  archivos: [], // AÑADIDO PARA ARCHIVOS
  ordenesEstudio: [], // NUEVO
  derivaciones: [], // NUEVO
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
  inicioAtencion: null, // AÑADIDO
  finAtencion: null, // AÑADIDO
  duracionAtencion: null, // AÑADIDO
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
export function editNota(nota: any) {
  // Tipo ajustado para aceptar la nota completa
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

// --- NUEVAS FUNCIONES PARA ARCHIVOS ---

// Agregar Archivo
export function addArchivo(archivo: ArchivoAdjunto) {
  const current = consultaStore.get();
  const currentArchivos = current.archivos || []; // Ensure it's an array
  consultaStore.set({
    ...current,
    archivos: [...currentArchivos, archivo],
  });
}

// Eliminar Archivo
export function removeArchivo(archivoId: string) {
  const current = consultaStore.get();
  consultaStore.set({
    ...current,
    archivos: current.archivos.filter(a => a.id !== archivoId),
  });
}

// --- NUEVAS FUNCIONES PARA SOLICITUDES ---

// Agregar Orden de Estudio
export function addOrdenEstudio(orden: OrdenEstudio) {
  const current = consultaStore.get();
  consultaStore.set({
    ...current,
    ordenesEstudio: [...current.ordenesEstudio, orden],
  });
}

// Agregar Derivación
export function addDerivacion(derivacion: Derivacion) {
  const current = consultaStore.get();
  consultaStore.set({
    ...current,
    derivaciones: [...current.derivaciones, derivacion],
  });
}

// // Resetear consulta (cuando finalizas/guardas)
// export function resetConsulta() {
//   consultaStore.set(initialConsulta);
// }
