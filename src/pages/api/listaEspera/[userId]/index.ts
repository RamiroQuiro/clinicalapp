import db from '@/db';
import { salaDeEspera } from '@/db/schema';
import type { APIRoute } from 'astro';

import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const GET: APIRoute = async ({ request, params }) => {
  const listaEsperaDB = await db
    .select()
    .from(salaDeEspera)
    .where(eq(salaDeEspera.userMedicoId, params.userId));
  return new Response(JSON.stringify(listaEsperaDB), {
    status: 200,
  });
};
export const POST: APIRoute = async ({ params, request }) => {
  try {
    const { userId } = params;
    const body = await request.json();
    // console.log(body);
    // Validar que el userId existe
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId es requerido' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!body.apellido || !body.nombre || !body.dni || !body.userId) {
      return new Response('Datos incompletos requeridos', {
        status: 400,
      });
    }

    // const isPacienteExiste = (
    //   await db.select().from(pacientes).where(eq(pacientes.dni, body.dni))
    // ).at(0);
    const fechaHoy = new Date();
    const horaHoy = fechaHoy.getHours();

    const insertarPaciente = await db
      .insert(salaDeEspera)
      .values({
        id: nanoid(10),
        pacienteId: body.id,
        nombre: body.nombre,
        apellido: body.apellido,
        dni: body.dni,
        motivoConsulta: body.motivoConsulta,
        fecha: fechaHoy.toISOString(),
        hora: horaHoy,
        userMedicoId: userId,
        isExist: true,
      })
      .returning();
    console.log(insertarPaciente);
    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'paciente agregado a la lista de espera',
        data: insertarPaciente,
      }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response('error', {
      status: 500,
    });
  }
};

export const DELETE: APIRoute = async ({ request, params }) => {
  const { userId } = params;
  const data = await request.json();
  console.log('paceinte a agregar -> e', data);
  try {
    const deletPacienteEnEspera = await db
      .delete(salaDeEspera)
      .where(and(eq(salaDeEspera.id, data), eq(salaDeEspera.userMedicoId, userId)))
      .returning();
    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'eliminado correctamen   te',
        data: deletPacienteEnEspera,
      }),
      {
        headers: { 'content-type': 'application/json' },
      }
    );
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ status: 500, msg: 'error al eliminar' }));
  }
};
