
import db from '@/db';
import { derivaciones } from '@/db/schema/derivaciones';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, locals }) => {
  const { derivacionId } = params;
  const { session } = locals
  if (!session) {
    return createResponse(401, 'No autorizado');
  }
  console.log('id params de derivacion ->', derivacionId)
  if (!derivacionId) {
    return createResponse(400, 'El ID de la derivación es requerido');
  }

  try {
    const [updatedDerivacion] = await db
      .update(derivaciones)
      .set({
        deleted_at: new Date(),
        estado: 'eliminado'
      })
      .where(eq(derivaciones.id, derivacionId))
      .returning();

    if (!updatedDerivacion) {
      return createResponse(404, 'La derivación no fue encontrada');
    }

    return createResponse(200, 'Derivación cancelada exitosamente', updatedDerivacion);
  } catch (error) {
    console.error('Error al cancelar la derivación:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
