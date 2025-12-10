import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { centrosMedicos } from './centrosMedicos';
import { users } from './users';

export const licenciasProfesional = sqliteTable('licencias_profesional', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    centroMedicoId: text('centro_medico_id')
        .notNull()
        .references(() => centrosMedicos.id, { onDelete: 'cascade' }),
    fechaInicio: integer('fecha_inicio', { mode: 'timestamp' }).notNull(),
    fechaFin: integer('fecha_fin', { mode: 'timestamp' }).notNull(),
    motivo: text('motivo'),
    tipo: text('tipo', {
        enum: ['vacaciones', 'enfermedad', 'personal', 'capacitacion', 'otro'],
    }).default('vacaciones'),
    estado: text('estado', {
        enum: ['activa', 'cancelada', 'finalizada'],
    }).default('activa'),
    created_at: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
});
