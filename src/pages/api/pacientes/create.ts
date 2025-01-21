import { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import db from '../../../db';
import { pacientes } from '../../../db/schema';
import { pacienteType, type responseAPIType } from '../../../types/index';

export const POST: APIRoute = async ({ request }) => {
  const data: pacienteType = await request.json();
  console.log(data);
  if (!data.nombre || !data.dni || !data.userId) {
    return new Response('Datos incompletos requeridos', {
      status: 400,
    });
  }

  try {
    const isUser = await db.select().from(pacientes).where(eq(pacientes.dni, data.dni));

    if (isUser[0]) {
      const response: responseAPIType = {
        code: 400,
        msg: 'DNI ya registrado con un paciente',
      };
      return new Response(JSON.stringify(response));
    }

    const id = generateId(13);
    const createPaciente = await db
      .insert(pacientes)
      .values({
        nombre: data.nombre,
        email: data.email,
        dni: data.dni,
        fNacimiento: data.fNacimiento,
        ciudad: data.ciudad,
        direccion: data.direccion,
        estatura: data.estatura,
        provincia: data.provincia,
        userId: data.userId,
        apellido: data.apellido,
        celular: data.celular,
        sexo: data.sexo,
        obraSocial: data.obraSocial,
        id,
        created_at: new Date().toISOString(),
      })
      .returning();

    const response: responseAPIType = {
      code: 200,
      msg: 'Paciente creado con éxito',
      data: createPaciente[0],
    };
    return new Response(JSON.stringify(response), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response('error', {
      status: 500,
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  const data: pacienteType = await request.json();
  console.log(data);
  try {
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

    const newData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    console.log('enspoint de actualizaar ->', newData);
    const updatePaciente = await db
      .update(pacientes)
      .set(newData)
      .where(eq(pacientes.id, data.id))
      .returning();

    const response: responseAPIType = {
      code: 200,
      msg: 'Paciente actualizado con éxito',
    };
    return new Response(JSON.stringify(response), {
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response('error', {
      status: 500,
    });
  }
};
