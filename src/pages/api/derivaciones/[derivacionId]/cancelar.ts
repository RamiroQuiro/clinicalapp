
import { db } from '@/db';
import { derivaciones } from '@/db/schema/derivaciones';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, locals }) => {
  const { derivacionId } = params;
  const session = await locals.auth.validate();
  if (!session) {
    return createResponse(401, 'No autorizado');
  }

  if (!derivacionId) {
    return createResponse(400, 'El ID de la derivaciÃ³n es requerido');
  }

  try {
    const [updatedDerivacion] = await db
      .update(derivaciones)
      .set({
        deleted_at: new Date(), // Soft delete
      })
      .where(eq(derivaciones.id, derivacionId))
      .returning();

    if (!updatedDerivacion) {
      return createResponse(404, 'La derivaciÃ³n no fue encontrada');
    }

    return createResponse(200, 'DerivaciÃ³n cancelada exitosamente', updatedDerivacion);
  } catch (error) {
    console.error('Error al cancelar la derivaciÃ³n:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
