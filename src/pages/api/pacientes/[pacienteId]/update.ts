import db from '@/db';
import { historiaClinica, pacientes } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { normalize } from '@/utils/normalizadorInput';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';

const pacienteSchema = {
  id: {
    type: 'string',
    optional: true,
  },
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
export const PUT: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const rawData = await request.json();

    console.log('datos normalizados para la actualizacion', rawData);
    const data = normalize(rawData, pacienteSchema);
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

    console.log('datos normalizados ->', data);
    // TRANSACCIÓN DE ACTUALIZACIÓN
    await db.transaction(async trx => {
      await trx.update(pacientes).set(data).where(eq(pacientes.id, data.id));

      await trx.update(historiaClinica).set(data).where(eq(historiaClinica.pacienteId, data.id));
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
