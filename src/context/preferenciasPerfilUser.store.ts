import { atom } from 'nanostores';

export type PreferenciasPerfil = {
  configuracionGeneral: {
    tema: 'claro' | 'oscuro' | 'sistema';
    idioma: 'es' | 'en';
    mostrarHistorialCompleto: boolean;
    notificaciones: {
      recordatorios: boolean;
      alertasCriticas: boolean;
    };
  };
  signosVitales: {
    mostrar: boolean;
    campos: string[];
  };
  consulta: {
    motivoInicial: boolean;
    sintomas: boolean;
    diagnostico: boolean;
    tratamientoFarmacologico: boolean;
    tratamientoNoFarmacologico: boolean;
    planASeguir: boolean;
    archivosAdjuntos: boolean;
    notasPrivadas: boolean;
  };
  reportes: {
    incluirDatosPaciente: boolean;
    incluirDatosMedico: boolean;
    incluirFirmaDigital: boolean;
  };
};
// types/preferencias.ts
export interface PerfilUsuarioCompleto {
  id: string;
  nombrePerfil: string;
  preferencias: PreferenciasPerfil;
  especialidad: string;
  estado: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

// context/preferenciasPerfilUser.store.ts

export const preferenciaPerfilUserStore = atom<PerfilUsuarioCompleto | null>(null);

// O si prefieres mantenerlo separado:
export const preferenciasStore = atom<PreferenciasPerfil>({
  configuracionGeneral: {
    tema: 'claro',
    idioma: 'es',
    mostrarHistorialCompleto: true,
    notificaciones: {
      recordatorios: true,
      alertasCriticas: true,
    },
  },
  signosVitales: {
    mostrar: true,
    campos: [
      'peso',
      'talla',
      'temperatura',
      'perimetroCefalico',
      'presionSistolica',
      'presionDiastolica',
      'saturacionOxigeno',
      'frecuenciaRespiratoria',
      'perimetroAbdominal',
      'imc',
      'glucosa',
      'dolor',
    ],
  },
  consulta: {
    motivoInicial: true,
    sintomas: true,
    diagnostico: true,
    tratamientoFarmacologico: true,
    tratamientoNoFarmacologico: true,
    planASeguir: true,
    archivosAdjuntos: true,
    notasPrivadas: false,
  },
  reportes: {
    incluirDatosPaciente: true,
    incluirDatosMedico: true,
    incluirFirmaDigital: true,
  },
});
export const perfilUsuarioStore = atom<Omit<PerfilUsuarioCompleto, 'preferencias'> | null>(null);
