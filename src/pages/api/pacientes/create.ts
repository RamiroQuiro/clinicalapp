import { lucia } from '@/lib/auth';
import { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import db from '../../../db';
import { doctoresPacientes, fichaPaciente, pacientes } from '../../../db/schema';
import { pacienteType, type responseAPIType } from '../../../types/index';

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.json();
  console.log(data);

  if (!data.nombre || !data.dni || !data.userId) {
    return new Response('Datos incompletos requeridos', {
      status: 400,
    });
  }

  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }

    // Usar una transacción para garantizar la atomicidad
    const result = await db.transaction(async trx => {
      // Verificar si el paciente ya existe en la tabla `pacientes`
      const isPacienteExistente = await trx
        .select()
        .from(pacientes)
        .where(eq(pacientes.dni, data.dni));

      let pacienteId;

      if (isPacienteExistente[0]) {
        // Si el paciente ya existe, usar su ID
        pacienteId = isPacienteExistente[0].id;
      } else {
        // Si no existe, crear un nuevo paciente
        pacienteId = generateId(15);
        await trx.insert(pacientes).values({
          id: pacienteId,
          nombre: data.nombre,
          email: data.email,
          dni: data.dni,
          fNacimiento: data.fNacimiento,
          apellido: data.apellido,
          sexo: data.sexo,
          created_at: new Date().toISOString(),
        });
      }

      // Insertar en `fichaPaciente`
      await trx.insert(fichaPaciente).values({
        id: generateId(15),
        pacienteId: pacienteId,
        userId: data.userId,
        created_at: new Date().toISOString(),
        direccion: data.direccion || null,
        celular: data.celular || null,
        estatura: data.estatura || null,
        pais: data.pais || null,
        provincia: data.provincia || null,
        ciudad: data.ciudad || null,
        obraSocial: data.obraSocial || null,
        email: data.email || null,
        srcPhoto: data.srcPhoto || null,
        grupoSanguineo: data.grupoSanguineo || null,
      });

      // Verificar si ya existe una relación entre el usuario y el paciente
      const isRelacionExistente = await trx
        .select()
        .from(doctoresPacientes)
        .where(
          and(
            eq(doctoresPacientes.userId, data.userId),
            eq(doctoresPacientes.pacienteId, pacienteId)
          )
        );

      if (isRelacionExistente[0]) {
        throw new Error('El paciente ya está asociado a este usuario');
      }

      // Crear la relación en `doctoresPacientes`
      await trx.insert(doctoresPacientes).values({
        userId: data.userId,
        pacienteId: pacienteId,
      });

      return pacienteId;
    });

    const response: responseAPIType = {
      code: 200,
      msg: 'Paciente creado y asociado con éxito',
      data: { id: result },
    };
    return new Response(JSON.stringify(response), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    const response: responseAPIType = {
      code: 500,
      msg: error.message || 'Error interno del servidor',
    };
    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  const data: pacienteType = await request.json();
  console.log('endpoint create', data);
  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }

    // Verificar si el paciente existe
    const isExistPaciente = (await db.select().from(pacientes).where(eq(pacientes.id, data.id))).at(
      0
    );
    if (!isExistPaciente) {
      const response: responseAPIType = {
        code: 400,
        msg: 'Paciente no encontrado',
      };
      return new Response(JSON.stringify(response));
    }

    // Filtrar solo los campos que tienen valores
    const newDataPaciente = Object.entries(data).reduce((acc, [key, value]) => {
      if (value && key !== 'userId') {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Actualizar el paciente en la tabla `pacientes`
    const updatePaciente = await db
      .update(pacientes)
      .set(newDataPaciente)
      .where(eq(pacientes.id, data.id))
      .returning();

    // Filtrar campos específicos para `fichaPaciente`
    const newDataAtencionPaciente = {
      domicilio: data.domicilio || null,
      celular: data.celular || null,
      estatura: data.estatura || null,
      pais: data.pais || null,
      provincia: data.provincia || null,
      ciudad: data.ciudad || null,
      obraSocial: data.obraSocial || null,
      email: data.email || null,
      srcPhoto: data.srcPhoto || null,
      grupoSanguineo: data.grupoSanguineo || null,
    };

    // Actualizar la tabla `fichaPaciente`
    await db
      .update(fichaPaciente)
      .set(newDataAtencionPaciente)
      .where(
        and(
          eq(fichaPaciente.pacienteId, data.id),
          eq(fichaPaciente.userId, data.userId) // Asegurarse de actualizar solo la relación del usuario actual
        )
      );

    const response: responseAPIType = {
      code: 200,
      msg: 'Paciente y datos de atención actualizados con éxito',
      data: updatePaciente[0],
    };
    return new Response(JSON.stringify(response), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
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
