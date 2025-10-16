import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq, sql } from 'drizzle-orm';
import { generateId } from 'lucia';
import { z } from 'zod';
import db from '../../../db';
import { historiaClinica, pacienteProfesional, pacientes } from '../../../db/schema';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const rawData = await request.json();

    // Validación robusta

    const data = rawData;
    console.log('📥 Creando paciente:', {
      nombre: data.nombre,
      dni: data.dni,
      userId: data.userId,
    });

    // Validar sesión
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return createResponse(401, 'No autorizado - Sesión no encontrada');
    }

    const { user } = locals;
    const { session } = await lucia.validateSession(sessionId);

    if (!session || !user || !user.centroMedicoId) {
      return createResponse(401, 'No autorizado o sin centro médico asignado');
    }

    const centroMedicoId = user.centroMedicoId;
    console.log('🏥 Centro médico:', centroMedicoId);

    // VERIFICAR SI EL DNI YA EXISTE EN ESTE CENTRO MÉDICO
    const pacienteExistente = await db
      .select()
      .from(pacientes)
      .where(and(eq(pacientes.dni, data.dni), eq(pacientes.centroMedicoId, centroMedicoId)))
      .limit(1);

    if (pacienteExistente.length > 0) {
      return createResponse(409, `Ya existe un paciente con DNI ${data.dni} en este centro médico`);
    }

    // TRANSACCIÓN ATÓMICA
    const result = await db.transaction(async trx => {
      console.log('💾 Insertando paciente...');

      const pacienteId = nanoIDNormalizador('Pac', 15);

      // 1. Insertar en tabla principal de pacientes
      const [nuevoPaciente] = await trx
        .insert(pacientes)
        .values({
          id: pacienteId,
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email || null,
          dni: data.dni,
          fNacimiento: data.fNacimiento,
          sexo: data.sexo,
          centroMedicoId: centroMedicoId,
          created_at: sql`(strftime('%s','now'))`,
          updated_at: sql`(strftime('%s','now'))`,
        })
        .returning();

      console.log('✅ Paciente creado:', nuevoPaciente.id);

      // 2. Insertar en historia clínica (¿o fichaPaciente? DECIDÍ CUÁL USAR)
      console.log('📋 Creando historia clínica...');
      await trx.insert(historiaClinica).values({
        id: nanoIDNormalizador('Hist', 15),
        pacienteId: pacienteId,
        userIdResponsable: data.userId,
        domicilio: data.domicilio || null,
        centroMedicoId: centroMedicoId,
        celular: data.celular || null,
        estatura: data.estatura || null,
        peso: data.peso || null,
        pais: data.pais || null,
        provincia: data.provincia || null,
        ciudad: data.ciudad || null,
        obraSocial: data.obraSocial || null,
        nObraSocial: data.nObraSocial || null,
        email: data.email || null,
        grupoSanguineo: data.grupoSanguineo || null,
        created_at: sql`(strftime('%s','now'))`,
      });

      console.log('✅ Historia clínica creada');

      // 3. Crear relación paciente-profesional
      console.log('👥 Creando relación paciente-profesional...');

      const relacionExistente = await trx
        .select()
        .from(pacienteProfesional)
        .where(
          and(
            eq(pacienteProfesional.userId, data.userId),
            eq(pacienteProfesional.pacienteId, pacienteId)
          )
        )
        .limit(1);

      if (relacionExistente.length === 0) {
        await trx.insert(pacienteProfesional).values({
          id: generateId(15),
          userId: data.userId,
          pacienteId: pacienteId,
          estado: 'activo',
          created_at: sql`(strftime('%s','now'))`,
        });
        console.log('✅ Relación profesional creada');
      }

      return nuevoPaciente;
    });

    // AUDITORÍA
    await logAuditEvent({
      userId: data.userId,
      actionType: 'CREATE',
      tableName: 'pacientes',
      recordId: result.id,
      newValue: data,
      centroMedicoId: centroMedicoId,
      description: `Creación de paciente: ${data.nombre} ${data.apellido} (DNI: ${data.dni})`,
    });

    console.log('🎉 Paciente creado exitosamente:', result.id);

    return createResponse(201, 'Paciente creado y asociado exitosamente', {
      paciente: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error creando paciente:', error);

    if (error.message.includes('UNIQUE constraint failed')) {
      return createResponse(409, 'El paciente ya existe en el sistema');
    }

    if (error.message.includes('FOREIGN KEY constraint failed')) {
      return createResponse(400, 'Error de referencia: usuario o centro médico no válido');
    }

    return createResponse(500, error.message || 'Error interno del servidor al crear paciente');
  }
};

export const PUT: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const rawData = await request.json();

    // Esquema para actualización (campos opcionales)
    const updateSchema = pacienteSchema.partial().extend({
      id: z.string().min(1, 'ID de paciente requerido'),
    });

    const validationResult = updateSchema.safeParse(rawData);
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(
        err => `${err.path.join('.')}: ${err.message}`
      );
      return createResponse(400, `Datos inválidos: ${errors.join(', ')}`);
    }

    const data = validationResult.data;

    // Validar sesión
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return createResponse(401, 'No autorizado');
    }

    const { user } = locals;
    const { session } = await lucia.validateSession(sessionId);
    if (!session || !user) {
      return createResponse(401, 'No autorizado');
    }

    // Verificar que el paciente existe y pertenece al centro médico del usuario
    const pacienteExistente = await db
      .select()
      .from(pacientes)
      .where(and(eq(pacientes.id, data.id), eq(pacientes.centroMedicoId, user.centroMedicoId)))
      .limit(1);

    if (!pacienteExistente[0]) {
      return createResponse(404, 'Paciente no encontrado o no pertenece a tu centro médico');
    }

    // TRANSACCIÓN DE ACTUALIZACIÓN
    await db.transaction(async trx => {
      // Actualizar datos básicos del paciente
      const updateDataPaciente: any = {
        updated_at: sql`(strftime('%s','now'))`,
      };

      // Solo actualizar campos que vienen en la data
      const camposPaciente = ['nombre', 'apellido', 'email', 'dni', 'fNacimiento', 'sexo'];
      camposPaciente.forEach(campo => {
        if (data[campo as keyof typeof data] !== undefined) {
          updateDataPaciente[campo] = data[campo as keyof typeof data];
        }
      });

      if (Object.keys(updateDataPaciente).length > 1) {
        // Más que solo updated_at
        await trx.update(pacientes).set(updateDataPaciente).where(eq(pacientes.id, data.id));
      }

      // Actualizar historia clínica (DECIDÍ SI USAS historiaClinica O fichaPaciente)
      const updateDataHistoria: any = {};
      const camposHistoria = [
        'domicilio',
        'celular',
        'estatura',
        'peso',
        'pais',
        'provincia',
        'ciudad',
        'obraSocial',
        'nObraSocial',
        'grupoSanguineo',
      ];

      camposHistoria.forEach(campo => {
        if (data[campo as keyof typeof data] !== undefined) {
          updateDataHistoria[campo] = data[campo as keyof typeof data];
        }
      });

      if (Object.keys(updateDataHistoria).length > 0) {
        await trx
          .update(historiaClinica) // ⚠️ CAMBIAR POR fichaPaciente SI ES NECESARIO
          .set(updateDataHistoria)
          .where(eq(historiaClinica.pacienteId, data.id));
      }
    });

    // Auditoría
    await logAuditEvent({
      userId: user.id,
      actionType: 'UPDATE',
      tableName: 'pacientes',
      recordId: data.id,
      oldValue: pacienteExistente[0],
      newValue: data,
      centroMedicoId: user.centroMedicoId,
      description: `Actualización de paciente: ${data.nombre} ${data.apellido}`,
    });

    return createResponse(200, 'Paciente actualizado exitosamente', {
      pacienteId: data.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error actualizando paciente:', error);
    return createResponse(500, 'Error interno del servidor al actualizar paciente');
  }
};
