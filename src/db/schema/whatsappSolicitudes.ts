import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { users } from './users';

export const whatsappSolicitudes = sqliteTable('whatsapp_solicitudes', {
    id: text('id').primaryKey(),
    centroMedicoId: text('centro_medico_id')
        .notNull()
        .references(() => centrosMedicos.id, { onDelete: 'cascade' }),

    // Datos del paciente desde WhatsApp
    numeroTelefono: text('numero_telefono').notNull(),
    nombrePaciente: text('nombre_paciente'), // Puede ser capturado por la IA

    // Datos del turno solicitado
    userMedicoId: text('user_medico_id')
        .references(() => users.id),
    fechaHora: text('fecha_hora').notNull(), // Almacenamos el string que detectó la IA

    // Control de flujo
    estado: text('estado', {
        enum: ['pendiente', 'confirmada', 'rechazada', 'expirada']
    }).notNull().default('pendiente'),

    // Referencia al mensaje/char para auditoría
    mensajeOriginal: text('mensaje_original'),

    created_at: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
});
