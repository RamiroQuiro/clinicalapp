import { users } from '@/db/schema';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq, sql } from 'drizzle-orm';
import { generateId } from 'lucia';
import db from '../../../../db';
import { notasMedicas } from '../../../../db/schema/notasMedicas';

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
    const insertArchivos = await db.insert(notasMedicas).values({
      id: id,
      pacienteId,
      userId: data.userId,
      descripcion: data.descripcion,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'guardado nota correcto  ',
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

export const GET: APIRoute = async ({ params }) => {
  const { pacienteId } = params;

  try {
    const notas = await db
      .select({
        id: notasMedicas.id,
        title: notasMedicas.title,
        atencionId: notasMedicas.atencionId,
        profesional: sql`CONCAT(users.nombre, ' ', users.apellido)`,
        fecha: notasMedicas.created_at,
        descripcion: notasMedicas.descripcion,
        created_at: notasMedicas.created_at,
      })
      .from(notasMedicas)
      .innerJoin(users, eq(notasMedicas.userMedicoId, users.id))
      .where(eq(notasMedicas.pacienteId, pacienteId));
    return createResponse(200, 'notas', notas);
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return createResponse(500, 'Error al obtener notas', error);
  }
};
