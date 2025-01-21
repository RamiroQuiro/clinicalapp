export type pacienteType = {
  id: string;
  userId: string;
  email: string;
  nombre: string;
  apellido: string;
  sexo: string;
  dni: number;
  estatura: string;
  fNacimiento: string;
  srcPhoto?: string;
  celular?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  obraSocial?: string;
  pais?: string;
  updated_at?: string;
  created_at: string;
  deleted_at?: string;
};

export type DiagnosticosTypes = {
  id?: number;
  diagnostico: string;
  observacion: string;
  pacienteId?: string;
  userId?: string;
};

export type responseAPIType = {
  msg: string;
  code?: number;
  status?: string;
  body?: string;
  data?: pacienteType;
};

export type optionsSelectInputType = {
  id: number;
  value: string;
  name?: string;
};

export interface Antecedente {
  atecedente: string;
  fechaDiagnostico: string;
  estado: string;
  observacion?: string;
  descripcion?: string;
  tipo: 'personal' | 'familiar';
  condicion?: boolean;
}

export interface AntecedentesMedicosProps {
  antedecentes: Antecedente[];
}

export interface Medication {
  nombre: string;
  dosis: string;
  frecuencia: string;
  estado: 'activo' | 'completado' | 'suspendido';
}

export interface MedicationsProps {
  medications: Medication[];
}
export interface Documentos {
  nombre: string;
  tipo: 'laboratorios' | 'rayosx' | 'prescripcion' | 'electrocardiograma' | 'otros' | 'derivacion';
  fecha: string;
  tamaño: string;
  estado: 'pendiente' | 'revisar' | 'archivado';
  src: string;
}

export interface DocumentosAdjuntosProps {
  documentos: Documentos[];
}

export type signosVitalesTypes = {
  id: string;
  historiaClinica: string;
  pacienteId: string;
  userId: string;
  update_at?: string;
  created_at?: string;
  deleted_ar?: string;
  temperatura?: string;
  pulso?: string;
  respiracion?: string;
  tensionArterial?: string;
  saturacionOxigeno?: string;
  glucosa?: string;
  peso?: string;
  talla?: string;
  imc?: string;
  frecuenciaCardiaca?: string;
  frecuenciaRespiratoria?: string;
  dolor?: string;
};
