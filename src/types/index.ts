export type pacienteType = {
  id: string;
  nombre: string;
  apellido: string;
  sexo: string;
  dni: number;
  fNacimiento: string;
  updated_at?: string;
  created_at: string;
  deleted_at?: string;
};

export type fichaPaciente = {
  id: string;
  pacienteId: string;
  userId: string;
  direccion?: string | null;
  celular?: string | null;
  estatura?: string | null;
  pais?: string | null;
  provincia?: string | null;
  domicilio?: string | null;
  nombre: string;
  apellido: string;
  sexo?: string | null;
  fNacimient: Date;
  ciudad?: string | null;
  obraSocial?: string | null;
  email?: string | null;
  srcPhoto?: string | null;
  grupoSanguineo?: string | null;
  created_at: string;
  updated_at?: string | null;
  deleted_at?: string | null;
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
