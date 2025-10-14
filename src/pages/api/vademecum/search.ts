import db from '@/db';
import { vademecum } from '@/db/schema/vademecum';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, like, or } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  const { user, session } = locals;

  if (!user || !session) {
    return createResponse(401, 'No autorizado');
  }

  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    if (!query) {
      return createResponse(400, 'El parámetro de búsqueda "query" es requerido');
    }

    const searchTerm = `%${query}%`;

    // Buscar medicamentos que coincidan con el término de búsqueda
    // La consulta ahora filtra por centro médico directamente en la DB para mayor eficiencia
    const medicamentos = await db
      .select()
      .from(vademecum)
      .where(
        and(
          // Condición de búsqueda por nombre
          or(
            like(vademecum.nombreGenerico, searchTerm),
            like(vademecum.nombreComercial, searchTerm)
          )
        )
      )
      .orderBy(vademecum.nombreGenerico); // Ordenar alfabéticamente
    console.log('medicamentos', medicamentos);
    return createResponse(200, 'Búsqueda de vademécum exitosa', medicamentos);
  } catch (error) {
    console.error('Error al buscar en el vademécum:', error);
    return createResponse(500, 'Error interno del servidor al buscar medicamentos.');
  }
};
