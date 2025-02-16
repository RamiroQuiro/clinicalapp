import { lucia } from '@/lib/auth';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import db from '../../../../db';
import { diagnostico } from '../../../../db/schema';
import { historiaClinica } from '../../../../db/schema/historiaClinica';

type DiagnosticoType = {
  id?: string;
  diagnostico: string;
  observaciones?: string;
  tratamiento?: string;
  codigoCIE: string;
};

type RequestDiagnosticosFront = {
  diagnostico: DiagnosticoType;
  dataIds: {
    userId: string;
    hcId: string;
    pacienteId?: string;
  };
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const data: RequestDiagnosticosFront = await request.json();
  console.log('endpoint ->', data);

  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }
    // Verificar si existe la historia clínica
    const isExists = (
      await db.select().from(historiaClinica).where(eq(historiaClinica.id, data.dataIds.hcId))
    ).at(0);

    console.log('Historia clínica encontrada:', isExists);
    if (!isExists) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: 'La historia clínica no existe',
        }),
        { status: 400 }
      );
    }

    if (data.diagnostico.id) {
      const updateData = await db
        .update(diagnostico)
        .set(data.diagnostico)
        .where(eq(diagnostico.id, data.diagnostico.id));
    } else {
      const idDiag = generateId(12);
      const creandoDiagnostico = await db.insert(diagnostico).values({
        id: idDiag,
        diagnostico: data.diagnostico.diagnostico,
        observaciones: data.diagnostico.observaciones,
        pacienteId: data.dataIds.pacienteId,
        historiaClinicaId: data.dataIds.hcId, // Relacionar con la historia clínica
        userId: data.dataIds.userId, // Registrar quién realizó la inserción
      });
    }
    // Insertar medicamentos en la base de datos
    // const diagnosticoPromises = data.diagnosticos.map((diag) => {
    //   const idDiag = generateId(12);
    //   return db.insert(diagnostico).values({
    //     id: idDiag,
    //     diagnostico: diag.diagnostico,
    //     observaciones: diag.observaciones,
    //     pacienteId: data.dataIds.pacienteId,
    //     historiaClinicaId: data.dataIds.hcId, // Relacionar con la historia clínica
    //     userId: data.dataIds.userId, // Registrar quién realizó la inserción
    //   });
    // });

    // Esperar que todas las inserciones se completen
    // await Promise.all(diagnosticoPromises);

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Medicamentos guardados correctamente',
      })
    );
  } catch (error) {
    console.error('Error al guardar los medicamentos:', error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: 'Error al guardar los medicamentos',
        error: error.message,
      }),
      { status: 500 }
    );
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  const data: DiagnosticoType = await request.json();

  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }
    const update = await db.update(diagnostico).set(data).where(eq(diagnostico.id, data.id));
    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'actualizacion correcta',
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 404,
        msg: 'error al guardar',
      })
    );
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const { id }: { id: string } = await request.json();
  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }

    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }
    const deletDiag = await db.delete(diagnostico).where(eq(diagnostico.id, id));

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'eliminacion correcta',
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 404,
        msg: 'error al eliminar',
      })
    );
  }
};
