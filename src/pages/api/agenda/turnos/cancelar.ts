import db from '@/db';
import { turnos } from '@/db/schema';
import { emitEvent } from '@/lib/sse/sse';
import { createResponse } from '@/utils/responseAPI';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

// POST /api/turnos/[id]/cancelar
export const DELETE: APIRoute = async ({ request, locals }) => {
  const { user, session } = locals
  if (!session) {
    return createResponse(401, 'No autorizado');
  }
  const urlQuery = new URL(request.url);
  const id = urlQuery.searchParams.get('id');

  if (!id) {
    return createResponse(400, 'El ID del turno es requerido');
  }

  try {
    const [updatedTurno] = await db
      .update(turnos)
      .set({ deleted_at: new Date(getFechaEnMilisegundos()), estado: 'cancelado' })
      .where(eq(turnos.id, id))
      .returning();

    console.log('turno a cancelar', updatedTurno);
    emitEvent('turno-eliminado', updatedTurno, { centroMedicoId: user?.centroMedicoId });
    if (!updatedTurno) {
      return createResponse(404, 'Turno no encontrado');
    }

    return createResponse(200, 'Turno cancelado exitosamente', updatedTurno);
  } catch (error) {
    console.error('Error al cancelar el turno:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
