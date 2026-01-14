import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';

// Tabla para almacenar las sesiones de WhatsApp por centro medico
export const whatsappSessions = sqliteTable('whatsapp_sessions', {
    id: text('id').primaryKey(),
    centroMedicoId: text('centro_medico_id')
        .notNull()
        .references(() => centrosMedicos.id, { onDelete: 'cascade' }),
    numeroTelefono: text('numero_telefono'),
    // Datos de sesion serializados de whatsapp-web.js
    sessionData: text('session_data'),
    // QR temporal para escanear, se limpia cuando se conecta
    qrCode: text('qr_code'),
    // Estado de la conexion: disconnected, qr_pending, connected
    status: text('status').notNull().default('disconnected'),
    aiActive: integer('ai_active', { mode: 'boolean' }).default(false),
    systemPrompt: text('system_prompt'),
    fechaUltimaConexion: integer('fecha_ultima_conexion', { mode: 'timestamp' }),
    created_at: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
    deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});
