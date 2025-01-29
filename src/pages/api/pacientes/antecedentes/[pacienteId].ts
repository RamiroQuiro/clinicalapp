import { lucia } from '@/lib/auth';
import type { APIRoute } from 'astro';
import { generateId } from 'lucia';
import db from '../../../../db';
import { antecedente } from '../../../../db/schema';

export const POST: APIRoute = async ({ request, params, cookies }) => {
  const data = await request.json();
  const { pacienteId } = params;

  // console.log('enpditn de antecedentes', data, pacienteId);

  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }
    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }
    const id = generateId(13);
    const insertAtecedentes = await db.insert(antecedente).values({
      id: id,
      antecedente: data.antecedente,
      pacienteId,
      observaciones: data.observaciones,
      estado: data.estado,
      tipo: data.tipo,
      fechaDiagnostico: data.fechaDiagnostico,
    });

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
