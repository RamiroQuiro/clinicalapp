import db from '@/db';
import { historiaClinica, medicamento, pacientes, users } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, desc, eq, sql } from 'drizzle-orm';
import { normalize } from 'node:path';
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

export const GET: APIRoute = async ({ params, locals, request, cookies }) => {
  const pacienteId = params.pacienteId;
  const ipAddress = request.headers.get('x-forwarded-for') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  const urlParams = new URL(request.url);
  const query = urlParams.searchParams.get('query');

  // Autenticación
  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return createResponse(401, 'No autorizado');
  }
  const { session, user } = await lucia.validateSession(sessionId);
  if (!session || !user) {
    return createResponse(401, 'No autorizado');
  }

  if (!pacienteId) {
    return createResponse(400, 'Faltan datos requeridos');
  }

  try {
    if (query == 'medicamentos') {
      const medicamentosPacienteDB = await db
        .select({
          id: medicamento.id,
          nombreGenerico: medicamento.nombreGenerico,
          nombreComercial: medicamento.nombreComercial,
          dosis: medicamento.dosis,
          frecuencia: medicamento.frecuencia,
          fechaPrescripcion: medicamento.created_at,
          medico: sql`users.nombre || ' ' || users.apellido`,
          estado: medicamento.estado,
        })
        .from(medicamento)
        .innerJoin(users, eq(medicamento.userMedicoId, users.id))
        .where(eq(medicamento.pacienteId, pacienteId))
        .orderBy(desc(medicamento.created_at))
        .limit(10);

      // Registrar evento de auditoría
      await logAuditEvent({
        userId: user.id,
        actionType: 'VIEW',
        tableName: 'medicamento',
        description: `El usuario ${user.name} (${user.email}) vio el historial de medicamentos del paciente con ID ${pacienteId}.`,
        ipAddress,
        userAgent,
      });

      return createResponse(200, 'Medicamentos encontrados', medicamentosPacienteDB);
    }

    // Si se añaden más queries, se deberían auditar aquí también.

    return createResponse(200, 'Paciente encontrado', {});
  } catch (error) {
    console.log(error);
    return createResponse(500, 'Error interno del servidor');
  }
};
export const PUT: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const rawData = await request.json();

    const data = normalize(rawData, pacienteSchema);
    console.log('datos normalizados para la actualizacion', data);
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
    const centroMedicoId = user.centroMedicoId;

    // Verificar que el paciente existe y pertenece al centro médico del usuario
    const pacienteExistente = await db
      .select()
      .from(pacientes)
      .where(and(eq(pacientes.id, data.id), eq(pacientes.centroMedicoId, centroMedicoId)))
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
          .update(historiaClinica)
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
