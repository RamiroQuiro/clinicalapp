import db from '@/db';
import { salaDeEspera } from '@/db/schema';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import type { APIRoute } from 'astro';

import { and, eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, params }) => {
  const listaEsperaDB = await db
    .select()
    .from(salaDeEspera)
    .where(
      and(
        eq(salaDeEspera.userMedicoId, params.userId),
        eq(salaDeEspera.fecha, new Date(getFechaEnMilisegundos()))
      )
    );
  return new Response(JSON.stringify(listaEsperaDB), {
    status: 200,
  });
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
