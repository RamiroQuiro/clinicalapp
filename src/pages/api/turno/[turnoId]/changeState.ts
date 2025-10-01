import type { AgendaSlot } from '@/context/agenda.store';
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

    const armarTurno: AgendaSlot = {
      disponible: false,
      horaTurno: data.horaTurno,
      turnoInfo: {
        duracion: updatedTurno.duracion,
        estado: updatedTurno.estado,
        fechaTurno: updatedTurno.fechaTurno,
        id: updatedTurno.id,
        pacienteApellido: updatedTurno.apellidoPaciente,
        pacienteDocumento: updatedTurno.documentoPaciente,
        pacienteId: updatedTurno.pacienteId,
        pacienteNombre: updatedTurno.nombrePaciente,
        profesionalApellido: updatedTurno.apellidoProfesional,
        profesionalId: updatedTurno.profesionalId,
        profesionalNombre: updatedTurno.profesionalNombre,
        motivoConsulta: updatedTurno.motivoConsulta,
      },
    };

    return createResponse(200, 'Turno actualizado exitosamente', armarTurno);
  } catch (error) {
    console.error('Error al actualizar el turno:', error);
    return createResponse(500, 'Error interno del servidor', error);
  }
};
