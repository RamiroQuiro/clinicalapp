import { lucia } from '@/lib/auth';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import db from '../../../../db';
import { historiaClinica } from '../../../../db/schema/historiaClinica';

type MotivoConsultaType = {
  id: string;
  motivo: string;
  pacienteId: string;
  hcId?: string;
  userId: string;
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.json();
  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }
    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }
    const isExtis = (
      await db.select().from(historiaClinica).where(eq(historiaClinica.id, data.dataIds.hcId))
    ).at(0);
    if (!isExtis) {
      return new Response(
        JSON.stringify({
          status: 400,
          mg: 'Error al crear el motivo de consulta',
        })
      );
    }
    const updateHC = await db
      .update(historiaClinica)
      .set({
        motivoConsulta: data.motivoConsulta,
      })
      .where(eq(historiaClinica.id, data.dataIds.hcId));

    console.log(updateHC);
    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Motivo de consulta creado correctamente',
      })
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        status: 400,
        mg: 'Error al crear el motivo de consulta',
      })
    );
  }
};
