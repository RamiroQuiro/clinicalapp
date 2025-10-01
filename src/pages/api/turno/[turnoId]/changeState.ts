import db from '@/db';
import { turnos } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { io } from 'socket/socket';

export const POST: APIRoute = async ({ params, locals, request }) => {
  const { turnoId } = params;
  try {
    const data = await request.json();
    const isTurno = await db.select().from(turnos).where(eq(turnos.id, turnoId));

    console.log('data ingresando -> ', data);
    if (!isTurno.length) {
      return createResponse(404, 'Turno no encontrado');
    }
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

    // Emitir el evento con el objeto del turno completo y actualizado
    if (io && updatedTurno) {
      io.emit('turno-actualizado', updatedTurno);
    }

    console.log('turnoUpdate', updatedTurno);
    return createResponse(200, 'Turno actualizado exitosamente', updatedTurno);
  } catch (error) {
    console.error('Error al actualizar el turno:', error);
    return createResponse(500, 'Error interno del servidor', error);
  }
};
