import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

/**
 * Tabla de Auditoría (Audit Log)
 *
 * Registra todas las acciones críticas realizadas en el sistema para garantizar
 * la trazabilidad, seguridad y cumplimiento normativo.
 * No se establece una foreign key explícita en userId para evitar problemas
 * si un usuario es eliminado; el log debe ser inmutable.
 */
export const auditLog = sqliteTable(
  'auditLog',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Quién realizó la acción
    userId: text('userId').references(() => users.id),

    // Qué acción se realizó. Ej: CREATE, VIEW, UPDATE, DELETE, LOGIN_SUCCESS, LOGIN_FAILURE, EXPORT
    actionType: text('actionType', {
      enum: ['CREATE', 'VIEW', 'UPDATE', 'DELETE', 'LOGIN_SUCCESS', 'LOGIN_FAILURE', 'EXPORT'],
    }).notNull(),

    centroMedicoId: text('centroMedicoId'),
    // Sobre qué tabla se realizó la acción
    tableName: text('tableName').notNull(),

    // El ID del registro afectado (si aplica)
    recordId: text('recordId'),

    // Valor del registro ANTES del cambio (en formato JSON)
    oldValue: text('oldValue'),

    // Valor del registro DESPUÉS del cambio (en formato JSON)
    newValue: text('newValue'),

    // Cuándo se realizó la acción (UNIX timestamp)
    timestamp: integer('timestamp', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),

    // --- Contexto de Seguridad ---
    // Dirección IP del cliente que originó el evento
    ipAddress: text('ipAddress'),

    // User Agent del cliente (navegador/dispositivo)
    userAgent: text('userAgent'),

    // Descripción adicional legible por humanos
    description: text('description'),
  },
  table => {
    return {
      userIdIdx: index('userId_idx').on(table.userId),
      centroMedicoIdIdx: index('centroMedicoId_idx').on(table.centroMedicoId),
      timestampIdx: index('timestamp_idx').on(table.timestamp),
      actionTypeIdx: index('actionType_idx').on(table.actionType),
      tableNameIdx: index('tableName_idx').on(table.tableName),
    };
  }
);
