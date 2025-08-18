import { logAuditEvent } from '@/lib/audit'; // Importar logAuditEvent
import { lucia } from '@/lib/auth';
import { normalize } from '@/utils/normalizadorInput'; // Importar normalize
import { createResponse } from '@/utils/responseAPI';
import { getFechaUnix } from '@/utils/timesUtils';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import { nanoid } from 'nanoid';
import db from '../../../db';
import { fichaPaciente, historiaClinica, pacienteProfesional, pacientes } from '../../../db/schema';

// Definir el esquema de normalización para los datos del paciente
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
  console.log('--- INICIANDO POST /api/pacientes/create ---');
  const data = await request.json();
  console.log('Datos recibidos (raw):', data);

  if (!data.nombre || !data.dni || !data.userId) {
    console.error('Error: Datos incompletos requeridos', {
      nombre: data.nombre,
      dni: data.dni,
      userId: data.userId,
    });
    return new Response('Datos incompletos requeridos', {
      status: 400,
    });
  }

  // Normalizar los datos recibidos
  const normalizedData = normalize(data, pacienteSchema);
  console.log('Datos normalizados:', normalizedData);

  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      console.error('Error: No hay sessionId en las cookies.');
      return new Response('No autorizado', { status: 401 });
    }
    console.log('Session ID encontrada:', sessionId);

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      console.error('Error: Sesión no válida.');
      return new Response('No autorizado', { status: 401 });
    }
    console.log('Sesión validada para el usuario:', user.id);

    // Usar una transacción para garantizar la atomicidad
    console.log('Iniciando transacción en la base de datos...');
    const result = await db.transaction(async trx => {
      console.log('Buscando si el paciente ya existe por DNI:', normalizedData.dni);
      const isPacienteExistente = await trx
        .select()
        .from(pacientes)
        .where(eq(pacientes.dni, normalizedData.dni));

      let pacienteId;
      const fechaHoy = new Date(getFechaUnix() * 1000);

      if (isPacienteExistente[0]) {
        pacienteId = isPacienteExistente[0].id;
        console.log(
          `El paciente con DNI ${normalizedData.dni} ya existe. Usando ID: ${pacienteId}`
        );
      } else {
        pacienteId = nanoid(15);
        console.log(`Creando nuevo paciente con ID: ${pacienteId}`);
        try {
          await trx.insert(pacientes).values({
            id: pacienteId,
            nombre: normalizedData.nombre,
            apellido: normalizedData.apellido,
            email: normalizedData.email,
            dni: normalizedData.dni,
            fNacimiento: normalizedData.fNacimiento,
            sexo: normalizedData.sexo,
          });
          console.log("Nuevo paciente insertado en la tabla 'pacientes'");
        } catch (err) {
          console.error('ERROR insertando paciente:', err, {
            valores: {
              id: pacienteId,
              ...normalizedData,
            },
          });
          throw err;
        }

        console.log("Nuevo paciente insertado en la tabla 'pacientes'");
      }

      console.log("Insertando en 'historiaClinica' para el paciente ID:", pacienteId);
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
      console.log('Datos de historia clínica insertados.');

      console.log(
        `Verificando relación existente entre usuario ${data.userId} y paciente ${pacienteId}`
      );
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
        console.error(
          `Error: El paciente ${pacienteId} ya está asociado al usuario ${data.userId}`
        );
        throw new Error('El paciente ya está asociado a este usuario');
      }

      console.log("Creando relación en 'pacienteProfesional'");
      await trx.insert(pacienteProfesional).values({
        id: generateId(15),
        userId: data.userId,
        pacienteId: pacienteId,
        estado: 'activo',
      });
      console.log('Relación creada.');

      console.log('Registrando evento de auditoría...');
      await logAuditEvent({
        userId: user.id,
        actionType: 'CREATE_PATIENT',
        tableName: 'pacientes',
        recordId: pacienteId,
        newValue: normalizedData,
        ipAddress: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent'),
        description: `El usuario ${user.id} creó al paciente ${normalizedData.nombre} ${normalizedData.apellido}`,
      });
      console.log('Evento de auditoría registrado.');

      return pacienteId;
    });
    console.log('Transacción completada con éxito. ID del paciente:', result);

    return createResponse(200, 'Paciente creado y asociado con éxito', { id: result });
  } catch (error) {
    console.error('--- ERROR EN LA TRANSACCIÓN DE CREACIÓN DE PACIENTE ---', error);
    return createResponse(500, error.message || 'Error interno del servidor');
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  console.log('--- INICIANDO PUT /api/pacientes/create ---');
  const data: pacienteType = await request.json();
  console.log('Datos recibidos (raw):', data);

  // Normalizar los datos recibidos
  const normalizedData = normalize(data, pacienteSchema);
  console.log('Datos normalizados:', normalizedData);

  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      console.error('Error: No hay sessionId en las cookies.');
      return new Response('No autorizado', { status: 401 });
    }
    console.log('Session ID encontrada:', sessionId);

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      console.error('Error: Sesión no válida.');
      return new Response('No autorizado', { status: 401 });
    }
    console.log('Sesión validada para el usuario:', user.id);

    console.log('Buscando si el paciente existe por ID:', normalizedData.id);
    const isExistPaciente = (
      await db.select().from(pacientes).where(eq(pacientes.id, normalizedData.id))
    ).at(0);
    if (!isExistPaciente) {
      console.error(`Error: Paciente con ID ${normalizedData.id} no encontrado.`);
      const response: responseAPIType = {
        code: 400,
        msg: 'Paciente no encontrado',
      };
      return new Response(JSON.stringify(response));
    }
    console.log('Paciente encontrado:', isExistPaciente);

    console.log('Filtrando campos para actualizar...');
    const newDataPaciente = Object.entries(normalizedData).reduce((acc, [key, value]) => {
      if (value && key !== 'userId') {
        acc[key] = value;
      }
      return acc;
    }, {});
    console.log("Datos a actualizar en 'pacientes':", newDataPaciente);

    const updatePaciente = await db
      .update(pacientes)
      .set(newDataPaciente)
      .where(eq(pacientes.id, normalizedData.id))
      .returning();
    console.log("Tabla 'pacientes' actualizada:", updatePaciente);

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
    console.log("Datos a actualizar en 'fichaPaciente':", newDataAtencionPaciente);

    await db
      .update(fichaPaciente)
      .set(newDataAtencionPaciente)
      .where(
        and(
          eq(fichaPaciente.pacienteId, normalizedData.id),
          eq(fichaPaciente.userId, normalizedData.userId)
        )
      );
    console.log("Tabla 'fichaPaciente' actualizada.");

    console.log('Registrando evento de auditoría...');
    await logAuditEvent({
      userId: user.id,
      actionType: 'UPDATE_PATIENT',
      tableName: 'pacientes',
      recordId: normalizedData.id,
      oldValue: isExistPaciente,
      newValue: normalizedData,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      description: `El usuario ${user.id} actualizó al paciente ${normalizedData.nombre} ${normalizedData.apellido}`,
    });
    console.log('Evento de auditoría registrado.');

    const response: responseAPIType = {
      code: 200,
      msg: 'Paciente y datos de atención actualizados con éxito',
      data: updatePaciente[0],
    };
    return new Response(JSON.stringify(response), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('--- ERROR EN LA ACTUALIZACIÓN DE PACIENTE ---', error);
    const response: responseAPIType = {
      code: 500,
      msg: 'Error interno del servidor',
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
