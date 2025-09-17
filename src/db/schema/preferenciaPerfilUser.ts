import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { users } from './users';

const defaultPreferencias = {
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
};

export const preferenciaPerfilUser = sqliteTable(
  'preferenciaPerfilUser',
  {
    id: text('id').primaryKey(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    nombrePerfil: text('nombrePerfil'),
    especialidad: text('especialidad'),
    estado: text('estado'),
    preferencias: text('preferencias', { mode: 'json' }).default(
      JSON.stringify(defaultPreferencias)
    ),
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s','now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
    deleted_at: integer('deleted_at', { mode: 'timestamp' }),
  },
  t => [unique().on(t.userId, t.nombrePerfil)]
);
