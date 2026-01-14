import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';

// Tabla para almacenar conversaciones de WhatsApp
export const whatsappConversaciones = sqliteTable('whatsapp_conversaciones', {
    id: text('id').primaryKey(),
    centroMedicoId: text('centro_medico_id')
        .notNull()
        .references(() => centrosMedicos.id, { onDelete: 'cascade' }),
    // Numero de telefono del paciente
    numeroTelefono: text('numero_telefono').notNull(),
    // Nombre del paciente si se conoce
    nombrePaciente: text('nombre_paciente'),
    // Ultimo mensaje para preview
    ultimoMensaje: text('ultimo_mensaje'),
    // Estado de la conversacion: active, closed
    status: text('status').notNull().default('active'),
    created_at: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
    deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});

// Tabla para almacenar mensajes individuales
export const whatsappMensajes = sqliteTable('whatsapp_mensajes', {
    id: text('id').primaryKey(),
    conversacionId: text('conversacion_id')
        .notNull()
        .references(() => whatsappConversaciones.id, { onDelete: 'cascade' }),
    // Direccion del mensaje: incoming, outgoing
    direccion: text('direccion').notNull(),
    // Contenido del mensaje
    contenido: text('contenido').notNull(),
    // Tipo de mensaje: text, image, audio
    messageType: text('message_type').notNull().default('text'),
    // Timestamp del mensaje
    timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
    // Si fue generado por IA
    isAiGenerated: integer('is_ai_generated', { mode: 'boolean' }).default(false),
    created_at: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
    deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});
