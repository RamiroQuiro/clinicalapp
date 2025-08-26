import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import db from '../../../../db';
import { antecedentes } from '../../../../db/schema';

export const POST: APIRoute = async ({ request, params, cookies, locals }) => {
  const data = await request.json();
  const { pacienteId } = params;
  const { user } = locals;
  console.log('enpoint de antecedentes', data);
  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    // if (user) {
    //   return createResponse(401, 'No autorizado');
    // }
    if (!sessionId) {
      return createResponse(401, 'No autorizado');
    }
    const { session } = await lucia.validateSession(sessionId);
    if (!session) {
      return createResponse(401, 'No autorizado');
    }
    const id = `antec_${nanoid()}`;
    const insertAtecedentes = await db
      .insert(antecedentes)
      .values({
        id: id,
        antecedente: data.antecedente,
        pacienteId,
        observaciones: data.observaciones,
        estado: data.estado,
        tipo: data.tipo,
        fechaDiagnostico: new Date(data.fechaDiagnostico),
        userId: session.userId,
      })
      .returning();
    console.log('insertado', insertAtecedentes);
    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'guardado antecedente correcto  ',
      })
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        status: 400,
        msg: 'error al guardar antecedentes',
      })
    );
  }
};

export const GET: APIRoute = async ({ params, locals }) => {
  const { pacienteId } = params;
  const { user } = locals;

  try {
    // auditar que usuario lee

    const antecedentesDB = await db
      .select({
        id: antecedentes.id,
        antecedente: antecedentes.antecedente,
        pacienteId: antecedentes.pacienteId,
        observaciones: antecedentes.observaciones,
        estado: antecedentes.estado,
        tipo: antecedentes.tipo,
        fechaDiagnostico: antecedentes.fechaDiagnostico,
        userId: antecedentes.userId,
      })
      .from(antecedentes)
      .where(eq(antecedentes.pacienteId, pacienteId));
    return createResponse(200, 'Antecedentes encontrados', antecedentesDB);
  } catch (error) {
    console.log(error);
    return createResponse(400, 'error al buscar antecedentes', error);
  }
};

export const PUT: APIRoute = async ({ request, params, locals }) => {
  const { pacienteId } = params;
  const { user } = locals;

  const newUrl = request.url;
  const urlParams = new URL(newUrl);
  const idAntecedente = urlParams.searchParams.get('id');

  try {
    if (!idAntecedente) {
      return createResponse(400, 'No se proporciono el id del antecedente');
    }
    if (!user) {
      return createResponse(401, 'No autorizado');
    }
    const data = await request.json();
    const update = await db
      .update(antecedentes)
      .set({
        antecedente: data.antecedente,
        observaciones: data.observaciones,
        estado: data.estado,
        tipo: data.tipo,
        fechaDiagnostico: new Date(data.fechaDiagnostico),
      })
      .where(eq(antecedentes.id, idAntecedente));

    return createResponse(200, 'Antecedente actualizado correctamente', update);
  } catch (error) {
    console.log(error);
    return createResponse(400, 'error al actualizar antecedentes', error);
  }
};
