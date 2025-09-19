import db from '@/db';
import { ordenesEstudio } from '@/db/schema/ordenesEstudio';

import { createResponse } from '@/utils/responseAPI';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, locals }) => {
  const { ordenId } = params;
  const { session } = locals;

  if (!ordenId) {
    return createResponse(400, 'El ID de la orden es requerido');
  }

  try {
    const [updatedOrden] = await db
      .update(ordenesEstudio)
      .set({
        deleted_at: new Date(getFechaEnMilisegundos()), // Soft delete
      })
      .where(eq(ordenesEstudio.id, ordenId))
      .returning();

    if (!updatedOrden) {
      return createResponse(404, 'La orden de estudio no fue encontrada');
    }

    return createResponse(200, 'Orden de estudio cancelada exitosamente', updatedOrden);
  } catch (error) {
    console.error('Error al cancelar la orden de estudio:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
