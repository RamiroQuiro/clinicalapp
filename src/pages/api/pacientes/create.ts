import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { normalize } from '@/utils/normalizadorInput';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import db from '../../../db';
import { fichaPaciente, historiaClinica, pacienteProfesional, pacientes } from '../../../db/schema';

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
  direccion: {
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

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.json();

  console.log('data entrante en nuevo paciente', data);
  if (!data.nombre || !data.dni || !data.userId) {
    return createResponse(400, 'Datos incompletos requeridos');
  }

  const normalizedData = normalize(data, pacienteSchema);
  console.log('data normalizada', normalizedData);
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
      console.log('verificando existencia de pacientre');
      let pacientenNuevo;
      const [isPacienteExistente] = await trx
        .select()
        .from(pacientes)
        .where(and(eq(pacientes.dni, normalizedData.dni), eq(pacientes.activo, true)));

      console.log('operaciones de isPacienteExistnete', isPacienteExistente);
      let pacienteId;

      if (isPacienteExistente) {
        pacienteId = isPacienteExistente.id;
      } else {
        console.log('el paciente no exite, insertando paciente');
        pacienteId = nanoIDNormalizador('Pac_', 15);
        pacientenNuevo = await trx
          .insert(pacientes)
          .values({
            id: pacienteId,
            nombre: normalizedData.nombre,
            apellido: normalizedData.apellido,
            email: normalizedData.email,
            dni: normalizedData.dni,
            fNacimiento: normalizedData.fNacimiento,

            sexo: normalizedData.sexo,
          })
          .returning();
      }

      console.log('insertando historiaClinica');
      await trx.insert(historiaClinica).values({
        id: nanoIDNormalizador('Hist_', 15),
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

      console.log('insertando pacienteProfesional');
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
        return createResponse(402, 'El paciente ya está asociado a este usuario');
      }

      console.log('insertando pacienteProfesional');
      await trx.insert(pacienteProfesional).values({
        id: generateId(15),
        userId: data.userId,
        pacienteId: pacienteId,
        estado: 'activo',
      });

      return pacientenNuevo;
    });

    console.log('insertando pacienteProfesional', result, 'y creando log de auditoria');
    await logAuditEvent({
      userId: data.userId,
      actionType: 'CREATE',
      tableName: 'pacientes',
      recordId: result.id,
      newValue: normalizedData,
      description: `El usuario ${data.userId} creó al paciente ${normalizedData.nombre} ${normalizedData.apellido}`,
    });
    return createResponse(200, 'Paciente creado y asociado con éxito', result);
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
