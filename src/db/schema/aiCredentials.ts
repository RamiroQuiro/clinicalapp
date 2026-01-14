import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';

// Tabla para almacenar las credenciales de IA cifradas por centro medico
export const aiCredentials = sqliteTable('ai_credentials', {
    id: text('id').primaryKey(),
    centroMedicoId: text('centro_medico_id')
        .notNull()
        .references(() => centrosMedicos.id, { onDelete: 'cascade' }),
    // Proveedor de IA: openai, gemini, groq
    provider: text('provider').notNull(),
    // API key cifrada con AES-256
    apiKeyEncrypted: text('api_key_encrypted').notNull(),
    // Modelo a utilizar por defecto
    model: text('model').notNull().default('gpt-3.5-turbo'),
    // Si esta credencial esta activa
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    created_at: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
    deleted_at: integer('deleted_at', { mode: 'timestamp' }),
});
