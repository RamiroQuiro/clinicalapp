// pages/api/turnos/[turnoId]/changeState.ts
import db from '@/db';
import { turnos } from '@/db/schema';
import { emitEvent } from '@/lib/sse/sse';

import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ params, request }) => {
  const { turnoId } = params;

  // console.log('🎯 ENDPOINT CALLED with turnoId:', turnoId);

  try {
    const data = await request.json();
    // console.log('📥 Data received:', data);

    // 1. Validación en BD
    const isTurno = await db.select().from(turnos).where(eq(turnos.id, turnoId));

    if (!isTurno.length) {
      return createResponse(404, 'Turno no encontrado');
    }

    // 2. Update en BD
    const turnoUpdate = await db
      .update(turnos)
      .set({
        estado: data.estado,
        horaLlegadaPaciente: data.horaLlegadaPaciente
          ? new Date(data.horaLlegadaPaciente)
          : undefined,
      })
      .where(eq(turnos.id, turnoId))
      .returning();

    const updatedTurno = turnoUpdate[0];
    // console.log('✅ Database updated:', updatedTurno.id, updatedTurno.estado);
    emitEvent('turno-actualizado', updatedTurno);
    // 5. Respuesta al cliente que hizo el fetch
    return createResponse(200, 'Turno actualizado', updatedTurno);
  } catch (error) {
    console.error('❌ Endpoint error:', error);
    return createResponse(500, 'Error interno', error);
  }
};
