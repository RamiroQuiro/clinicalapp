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

export type AtencionMedicaExiste {
  atencionData: {
    id: string;
    historiaClinicaId: string | null;
    pacienteId: string;
    userIdMedico: string;
    fecha: Date;
    motivoConsulta: string;
    sintomas: string | null;
    tratamientoId: string | null;
    motivoInicial: string | null;
    observaciones: string | null;
    estado: string;
    inicioAtencion: Date | null;
    finAtencion: Date | null;
    duracionAtencion: number | null;
    created_at: Date;
    updated_at: Date | null;
    deleted_at: Date | null;
    diagnosticos: {
      id: string;
      diagnostico: string;
      historiaClinicaId: string | null;
      atencionId: string;
      pacienteId: string;
      codigoCIE: string;
      userMedicoId: string;
      observaciones: string;
      tratamiento: string | null;
      updated_at: Date | null;
      created_at: Date;
      deleted_at: Date | null;
    }[];
    medicamentos: {
      id: string;
      nombreGenerico: string;
      nombreComercial: string | null;
      laboratorio: string | null;
      descripcion: string | null;
      tipoMedicamento: string | null;
      historiaClinicaId: string | null;
      atencionId: string;
      pacienteId: string;
      userMedicoId: string;
      updateUserId: string | null;
      dosis: string;
      frecuencia: string;
      duracion: number | null;
      estado: string;
      precio: number | null;
      stock: number | null;
      updated_at: Date | null;
      created_at: Date;
      deleted_at: Date | null;
    }[];
    signosVitales: {
      id: string;
      historiaClinicaId: string | null;
      atencionId: string;
      pacienteId: string;
      userId: string;
      updated_at: Date | null;
      created_at: Date;
      deleted_at: Date | null;
      temperatura: number;
      pulso: number | null;
      respiracion: number | null;
      presionArterial: number | null;
      tensionArterial: number;
      saturacionOxigeno: number;
      glucosa: number;
      peso: number;
      talla: number;
      imc: number;
      frecuenciaCardiaca: number;
      frecuenciaRespiratoria: number;
      dolor: string | null;
      fechaRegistro: Date | null;
    };
  };
  pacienteData: {
    id: string;
    nombre: string;
    apellido: string;
    dni: number;
    sexo: string;
    fNacimiento: Date;
    celular: string | null;
    email: string | null;
    domicilio: string | null;
    historiaClinicaId: string;
    grupoSanguineo: string | null;
  };
}

export interface Antecedente {
  id: string;
  antecedente: string;
  fechaDiagnostico: string;
  estado: string;
  observaciones?: string;
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
