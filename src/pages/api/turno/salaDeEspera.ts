import db from '@/db';
import { salaDeEspera } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request }) => {
  try {
    const newUrl = new URL(request.url);
    const userId = newUrl.searchParams.get('userId');

    if (!userId) {
      return createResponse(400, 'userId requerido');
    }
    const salaEsperaDB = await db
      .select()
      .from(salaDeEspera)
      .where(
        and(
          eq(salaDeEspera.userMedicoId, userId)
          //   eq(salaDeEspera.fecha, new Date(getFechaEnMilisegundos()))
        )
      );
    console.log('salaEsperaDB', salaEsperaDB);
    return createResponse(200, 'success', salaEsperaDB);
  } catch (error) {
    return createResponse(500, 'error', error);
  }
};
