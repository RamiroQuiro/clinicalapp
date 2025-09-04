import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { normalize } from '@/utils/normalizadorInput';
import { createResponse } from '@/utils/responseAPI';
import { getFechaUnix } from '@/utils/timesUtils';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { nanoid } from 'nanoid';
import db from '../../../db';
import {
  fichaPaciente,
  historiaClinica,
  pacienteProfesional,
  pacientes,
} from '../../../db/schema';

const pacienteSchema = {
  nombre: 'string',
  apellido: 'string',
  email: 'string',
  dni: 'number',
  fNacimiento: 'date',
  sexo: 'string',
  direccion: 'string',
  celular: 'string',
  estatura: 'number',
  peso: 'number',
  pais: 'string',
  provincia: 'string',
  ciudad: 'string',
  obraSocial: 'string',
  nObraSocial: 'string',
  grupoSanguineo: 'string',
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.json();

  if (!data.nombre || !data.dni || !data.userId) {
    return createResponse(400, 'Datos incompletos requeridos');
  }

  const normalizedData = normalize(data, pacienteSchema);

  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return createResponse(401, 'No autorizado');
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return createResponse(401, 'No autorizado');
    }

    const result = await db.transaction(async trx => {
      const isPacienteExistente = await trx
        .select()
        .from(pacientes)
        .where(eq(pacientes.dni, normalizedData.dni));

      let pacienteId;

      if (isPacienteExistente[0]) {
        pacienteId = isPacienteExistente[0].id;
      } else {
        pacienteId = nanoid(15);
        await trx.insert(pacientes).values({
          id: pacienteId,
          nombre: normalizedData.nombre,
          apellido: normalizedData.apellido,
          email: normalizedData.email,
          dni: normalizedData.dni,
          fNacimiento: normalizedData.fNacimiento,
          sexo: normalizedData.sexo,
        });
      }

      await trx.insert(historiaClinica).values({
        id: nanoid(12),
        pacienteId: pacienteId,
        userIdResponsable: data.userId,
        direccion: normalizedData.direccion || null,
        celular: normalizedData.celular || null,
        estatura: normalizedData.estatura ? normalizedData.estatura : 0,
        peso: normalizedData.peso ? normalizedData.peso : 0,
        pais: normalizedData.pais || null,
        provincia: normalizedData.provincia || null,
        ciudad: normalizedData.ciudad || null,
        obraSocial: normalizedData.obraSocial || null,
        nObraSocial: normalizedData.nObraSocial || null,
        email: normalizedData.email || null,
        grupoSanguineo: normalizedData.grupoSanguineo || null,
      });

      const isRelacionExistente = await trx
        .select()
        .from(pacienteProfesional)
        .where(
          and(
            eq(pacienteProfesional.userId, data.userId),
            eq(pacienteProfesional.pacienteId, pacienteId)
          )
        );

      if (isRelacionExistente[0]) {
        throw new Error('El paciente ya está asociado a este usuario');
      }

      await trx.insert(pacienteProfesional).values({
        id: generateId(15),
        userId: data.userId,
        pacienteId: pacienteId,
        estado: 'activo',
      });

      await logAuditEvent({
        userId: user.id,
        actionType: 'CREATE',
        tableName: 'pacientes',
        recordId: pacienteId,
        newValue: normalizedData,
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
        description: `El usuario ${user.id} creó al paciente ${normalizedData.nombre} ${normalizedData.apellido}`,
      });

      return pacienteId;
    });

    return createResponse(200, 'Paciente creado y asociado con éxito', { id: result });
  } catch (error: any) {
    return createResponse(500, error.message || 'Error interno del servidor');
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  const data = await request.json();

  const normalizedData = normalize(data, pacienteSchema);

  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return createResponse(401, 'No autorizado');
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return createResponse(401, 'No autorizado');
    }

    const isExistPaciente = (
      await db.select().from(pacientes).where(eq(pacientes.id, normalizedData.id))
    ).at(0);
    if (!isExistPaciente) {
      return createResponse(400, 'Paciente no encontrado');
    }

    const newDataPaciente = Object.entries(normalizedData).reduce((acc: any, [key, value]) => {
      if (value && key !== 'userId') {
        acc[key] = value;
      }
      return acc;
    }, {});

    const updatePaciente = await db
      .update(pacientes)
      .set(newDataPaciente)
      .where(eq(pacientes.id, normalizedData.id))
      .returning();

    const newDataAtencionPaciente = {
      domicilio: normalizedData.domicilio || null,
      celular: normalizedData.celular || null,
      estatura: normalizedData.estatura || null,
      pais: normalizedData.pais || null,
      provincia: normalizedData.provincia || null,
      ciudad: normalizedData.ciudad || null,
      obraSocial: normalizedData.obraSocial || null,
      nObraSocial: normalizedData.nObraSocial || null,
      email: normalizedData.email || null,
      srcPhoto: normalizedData.srcPhoto || null,
      grupoSanguineo: normalizedData.grupoSanguineo || null,
    };

    await db
      .update(fichaPaciente)
      .set(newDataAtencionPaciente)
      .where(
        and(
          eq(fichaPaciente.pacienteId, normalizedData.id),
          eq(fichaPaciente.userId, normalizedData.userId)
        )
      );

    await logAuditEvent({
      userId: user.id,
      actionType: 'UPDATE',
      tableName: 'pacientes',
      recordId: normalizedData.id,
      oldValue: isExistPaciente,
      newValue: normalizedData,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      description: `El usuario ${user.id} actualizó al paciente ${normalizedData.nombre} ${normalizedData.apellido}`,
    });

    return createResponse(200, 'Paciente y datos de atención actualizados con éxito', {
      data: updatePaciente[0],
    });
  } catch (error) {
    return createResponse(500, 'Error interno del servidor');
  }
};
