import { lucia } from '@/lib/auth';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import db from '../../../../db';
import { signosVitales } from '../../../../db/schema/signosVitales';
import calcularIMC from '../../../../utils/calcularIMC';

type MotivoConsultaType = {
  id: string;
  motivo: string;
  pacienteId: string;
  hcId?: string;
  userId: string;
};

export const GET: APIRoute = async ({ request, params, cookies }) => {
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
    // Obtener el ID del paciente desde los headers
    const idHistoriaClinica = request.headers.get('idHistoriaClinica');
    if (!idHistoriaClinica) {
      return new Response(JSON.stringify({ error: 'ID de paciente no proporcionado' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // consulta a la DB
    const signosBD = (
      await db
        .select()
        .from(signosVitales)
        .where(eq(signosVitales.historiaClinicaId, idHistoriaClinica))
    ).at(0);
    if (!signosBD) {
      return new Response(
        JSON.stringify({
          status: 203,
          msg: 'signos vitales no creados para la historia clinica',
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

export const POST: APIRoute = async ({ request, cookies }) => {
  const { dataIds, dataSignosVitales } = await request.json();
  // console.log('signos vitales post ', dataSignosVitales);
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
      await db.select().from(signosVitales).where(eq(signosVitales.atencionId, dataIds.hcId))
    ).at(0);
    if (!isExtis) {
      return new Response(
        JSON.stringify({
          status: 400,
          mg: 'Error al crear el motivo de consulta',
        })
      );
    }
    const imc = calcularIMC(dataSignosVitales.peso, dataSignosVitales.talla);
    dataSignosVitales.imc = imc;

    const updateHC = await db
      .update(signosVitales)
      .set(dataSignosVitales)
      .where(eq(signosVitales.historiaClinicaId, dataIds.hcId));
    // console.log(updateHC);
    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'signos guardador correctamente',
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
