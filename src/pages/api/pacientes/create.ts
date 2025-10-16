import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { emitEvent } from '@/lib/sse/sse';
import { normalize } from '@/utils/normalizadorInput';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq, sql } from 'drizzle-orm';
import db from '../../../db';
import { historiaClinica, pacienteProfesional, pacientes } from '../../../db/schema';

const pacienteSchema = {
  nombre: {
    type: 'string',
    optional: false,
  },
  apellido: {
    type: 'string',
    optional: false,
  },
  email: {
    type: 'string',
    optional: false,
  },
  dni: {
    type: 'number',
    optional: false,
  },
  fNacimiento: {
    type: 'date',
    optional: false,
  },
  sexo: {
    type: 'string',
    optional: false,
  },
  domicilio: {
    type: 'string',
    optional: true,
  },
  celular: {
    type: 'string',
    optional: true,
  },
  estatura: {
    type: 'number',
    optional: true,
  },
  peso: {
    type: 'number',
    optional: true,
  },
  pais: {
    type: 'string',
    optional: true,
  },
  provincia: {
    type: 'string',
    optional: true,
  },
  ciudad: {
    type: 'string',
    optional: true,
  },
  obraSocial: {
    type: 'string',
    optional: true,
  },
  nObraSocial: {
    type: 'string',
    optional: true,
  },
  grupoSanguineo: {
    type: 'string',
    optional: true,
  },
};

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const rawData = await request.json();

    // Validación robusta
    const normalizedData = normalize(rawData, pacienteSchema);

    const data = normalizedData;
    console.log('📥 Creando paciente:', {
      ...data,
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
    console.log('🏥 Centro médico:', normalizedData.dni);

    const pacienteExistente = await db
      .select()
      .from(pacientes)
      .where(
        and(eq(pacientes.dni, normalizedData.dni), eq(pacientes.centroMedicoId, centroMedicoId))
      )
      .limit(1);
    if (pacienteExistente.length > 0) {
      return createResponse(
        409,
        `Ya existe un paciente con DNI ${normalizedData.dni} en este centro médico`
      );
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
          nombre: normalizedData.nombre,
          apellido: normalizedData.apellido,
          email: normalizedData.email || null,
          dni: normalizedData.dni,
          fNacimiento: normalizedData.fNacimiento,
          sexo: normalizedData.sexo,
          centroMedicoId: centroMedicoId,
        })
        .returning();

      console.log('✅ Paciente creado:', nuevoPaciente.id);

      // 2. Insertar en historia clínica (¿o fichaPaciente? DECIDÍ CUÁL USAR)
      console.log('📋 Creando historia clínica...');
      await trx.insert(historiaClinica).values({
        id: nanoIDNormalizador('Hist', 15),
        pacienteId: pacienteId,
        userIdResponsable: user.id,
        domicilio: normalizedData.domicilio || null,
        centroMedicoId: centroMedicoId,
        celular: normalizedData.celular || null,
        pais: normalizedData.pais || null,
        provincia: normalizedData.provincia || null,
        ciudad: normalizedData.ciudad || null,
        obraSocial: normalizedData.obraSocial || null,
        nObraSocial: normalizedData.nObraSocial || null,
        email: normalizedData.email || null,
        grupoSanguineo: normalizedData.grupoSanguineo || null,
        numeroHC: nanoIDNormalizador('HistClinicaInterna', 10),
      });

      console.log('✅ Historia clínica creada');

      // 3. Crear relación paciente-profesional
      console.log('👥 Creando relación paciente-profesional...');

      const relacionExistente = await trx
        .select()
        .from(pacienteProfesional)
        .where(
          and(
            eq(pacienteProfesional.userId, user.id),
            eq(pacienteProfesional.pacienteId, pacienteId)
          )
        )
        .limit(1);

      if (relacionExistente.length === 0) {
        await trx.insert(pacienteProfesional).values({
          id: nanoIDNormalizador('PacProf', 15),
          userId: user.id,
          pacienteId: pacienteId,
          estado: 'activo',
          centroMedicoId: centroMedicoId,
        });
        console.log('✅ Relación profesional creada');
      }

      return nuevoPaciente;
    });

    // AUDITORÍA
    await logAuditEvent({
      userId: user.id,
      actionType: 'CREATE',
      tableName: 'pacientes',
      recordId: result.id,
      newValue: data,
      centroMedicoId: centroMedicoId,
      description: `Creación de paciente: ${data.nombre} ${data.apellido} (DNI: ${data.dni})`,
    });

    console.log('🎉 Paciente creado exitosamente:', result.id);

    emitEvent('paciente-creado', result);
    return createResponse(200, 'Paciente creado y asociado exitosamente', {
      paciente: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error creando paciente:', error);

    if (error.message.includes('UNIQUE constraint failed')) {
      console.log('error.message', error);
      return createResponse(
        409,
        'Conflicto: Ya existe un paciente con este DNI en este centro médico.'
      );
    }

    return createResponse(500, error.message || 'Error interno del servidor al crear paciente');
  }
};

export const PUT: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const rawData = await request.json();

    const data = rawData;

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
