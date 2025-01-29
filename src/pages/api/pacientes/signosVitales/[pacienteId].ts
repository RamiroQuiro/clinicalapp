import { lucia } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import db from '../../../../db';
import { signosVitales } from '../../../../db/schema';

export const GET: APIRoute = async ({ request, params, cookies }) => {
  const { pacienteId } = params;
  // console.log("esto es el reques->", request.headers.get("idHistoriaClinica"));
  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }
    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }
    // consulta a la DB
    const signosBD = await db
      .select()
      .from(signosVitales)
      .where(eq(signosVitales.pacienteId, pacienteId));
    if (!signosBD) {
      return new Response(
        JSON.stringify({
          status: 203,
          msg: 'paciente no existe',
        })
      );
    }

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'respuesta ok',
        data: signosBD,
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 400,
        msg: 'error en la busqueda',
      })
    );
  }
};
