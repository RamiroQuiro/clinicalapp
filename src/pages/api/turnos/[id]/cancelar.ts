import type { APIRoute } from 'astro';
import { createResponse } from '@/utils/responseAPI';
import db from '@/db';
import { turnos } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/turnos/[id]/cancelar
export const POST: APIRoute = async ({ params, locals }) => {
  // 1. Validar sesion
  if (!locals.session) {
    return createResponse(401, 'No autorizado');
  }

  const { id } = params;
  if (!id) {
    return createResponse(400, 'El ID del turno es requerido');
  }

  try {
    const [updatedTurno] = await db.update(turnos)
      .set({ deleted_at: new Date().getTime() })
      .where(eq(turnos.id, id))
      .returning();

    if (!updatedTurno) {
      return createResponse(404, 'Turno no encontrado');
    }

    return createResponse(200, 'Turno cancelado exitosamente', updatedTurno);
  } catch (error) {
    console.error('Error al cancelar el turno:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
