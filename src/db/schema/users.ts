import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    nombre: text('nombre').notNull(),
    apellido: text('apellido').notNull(),
    password: text('password').notNull(),
    mp: text('mp'),
    especialidad: text('especialidad'),
    abreviatura: text('abreviatura'),
    rol: text('rol', {
      enum: ['superadmin', 'admin', 'profesional', 'recepcionista', 'dataEntry', 'reader'],
    })
      .notNull()
      .default('profesional'),
    dni: integer('dni', { mode: 'number' }),
    documento: text('documento'),
    cuil: text('cuil'),
    cuit: text('cuit'),
    telefono: text('telefono'),
    celular: text('celular'),
    direccion: text('direccion'),
    ciudad: text('ciudad'),
    provincia: text('provincia'),
    pais: text('pais').default('Argentina'),
    srcPhoto: text('srcPhoto'),
    emailVerificado: integer('emailVerificado', { mode: 'boolean' }).default(false),
    activo: integer('activo', { mode: 'boolean' }).default(true),
    created_at: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updated_at: integer('updated_at', { mode: 'timestamp' }),
  },
  table => {
    return {
      // 1. Búsqueda por nombre y apellido (casos de uso más común)
      nombreApellidoIdx: sql`INDEX idx_users_nombre_apellido ON users(${table.nombre}, ${table.apellido})`,

      // 2. Búsqueda por email (login, verificación)
      emailIdx: sql`INDEX idx_users_email ON users(${table.email})`,

      // 3. Búsqueda por DNI (identificación rápida)
      dniIdx: sql`INDEX idx_users_dni ON users(${table.dni})`,

      // 4. Búsqueda por rol (filtrar por tipo de usuario)
      rolIdx: sql`INDEX idx_users_rol ON users(${table.rol})`,

      // 5. Búsqueda por especialidad (encontrar profesionales)
      especialidadIdx: sql`INDEX idx_users_especialidad ON users(${table.especialidad})`,

      // 6. Búsqueda por matrícula (verificación profesional)
      mpIdx: sql`INDEX idx_users_mp ON users(${table.mp})`,

      // 7. Búsqueda de usuarios activos (casos comunes)
      activoIdx: sql`INDEX idx_users_activo ON users(${table.activo})`,

      // 8. Búsqueda combinada rol + activo (dashboard admin)
      rolActivoIdx: sql`INDEX idx_users_rol_activo ON users(${table.rol}, ${table.activo})`,

      // 9. Búsqueda por ubicación (filtrar por región)
      ubicacionIdx: sql`INDEX idx_users_ubicacion ON users(${table.provincia}, ${table.ciudad})`,

      // 10. Búsqueda por fecha de creación (reportes, analytics)
      createdAtIndex: sql`INDEX idx_users_created_at ON users(${table.created_at})`,
    };
  }
);
