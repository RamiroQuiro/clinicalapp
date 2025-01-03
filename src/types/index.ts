export type pacienteType = {
  id: string;
  userId: string;
  email: string;
  nombre: string;
  apellido: string;
  sexo: string;
  dni: number;
  fNacimiento: string;
  srcPhoto?: string;
  celular?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
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
  baody?: string;
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
  tipo: "personal" | "familiar";
  condicion?: boolean;
}

export interface AntecedentesMedicosProps {
  antedecentes:Antecedente[];
}

export interface Medication {
  nombre: string;
  dosis: string;
  frecuencia: string;
  estado: "activo" | "completado" | "suspendido";
}

export interface MedicationsProps {
  medications: Medication[];
}
export interface Documentos {
  nombre: string;
  tipo: "laboratorios" | "rayosx" | "prescripcion" |"electrocardiograma"| "otros"|"derivacion";
  fecha: string;
  tamaño: string;
  estado: "pendiente" | "revisar" | "archivado";
  src:string
}

export interface DocumentosAdjuntosProps {
  documentos: Documentos[];
}
