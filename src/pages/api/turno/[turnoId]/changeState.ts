import db from '@/db';
import { turnos } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { io } from 'socket/socket';

export const POST: APIRoute = async ({ params, locals, request }) => {
  const { turnoId } = params;
  console.log('enpoint changeStarte ->', turnoId);
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
    io.emit('turno-actualizado', { id: turnoId, estado: data.estado });
    console.log('turnoUpdate', turnoUpdate);
    return createResponse(200, 'Turno actualizado exitosamente', turnoUpdate[0]);
  } catch (error) {
    console.log(error);
    return createResponse(200, 'Turno actualizado exitosamente', error);
  }
};
