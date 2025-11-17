import db from '@/db';
import { turnos } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { emitEvent } from '@/lib/sse/sse';
import APP_TIME_ZONE from '@/lib/timeZone';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const data = await request.json();
  console.log('data', data);
  // Para actualizar, necesitamos el ID del turno y los nuevos datos.
  if (!data.id || !data.fechaTurno || !data.horaTurno) {
    return createResponse(400, 'Faltan campos obligatorios para reagendar el turno (ID, fecha, hora).');
  }

  const { user, session } = locals;
  if (!session) {
    return createResponse(401, 'No autorizado');
  }

  try {
    // 1. Buscamos el turno original para auditoría y validación.
    const [originalTurno] = await db.select().from(turnos).where(eq(turnos.id, data.id));

    if (!originalTurno) {
      return createResponse(404, 'El turno que intenta modificar no fue encontrado.');
    }

    // 2. Validamos que el usuario pertenezca al mismo centro médico.
    if (originalTurno.centroMedicoId !== user.centroMedicoId) {
      return createResponse(403, 'No tiene permiso para modificar este turno.');
    }

    // 3. Preparamos la nueva fecha en UTC.
    const fechaTurnoUtc = toZonedTime(
      `${format(new Date(data.fechaTurno), 'yyyy-MM-dd')}T${data.horaTurno}`,
      APP_TIME_ZONE
    );

    // 4. Actualizamos el turno en la base de datos.
    const [updatedTurno] = await db
      .update(turnos)
      .set({
        fechaTurno: fechaTurnoUtc,
        horaAtencion: data.horaTurno,
        motivoConsulta: data.motivoConsulta,
        duracion: data.duracion,
      })
      .where(eq(turnos.id, data.id))
      .returning();

    // 5. Registramos el evento de auditoría.
    await logAuditEvent({
      userId: user.id,
      actionType: 'UPDATE',
      tableName: 'turnos',
      centroMedicoId: user.centroMedicoId,
      recordId: updatedTurno.id,
      oldValue: originalTurno,
      newValue: updatedTurno,
      description: `Se reagendó el turno del paciente.`,
    });

    // 6. Emitimos un evento SSE para notificar a los clientes en tiempo real.
    const eventPayload = {
      id: updatedTurno.id,
      fechaTurno: updatedTurno.fechaTurno,
      horaTurno: updatedTurno.horaAtencion,
      estado: updatedTurno.estado,
      userMedicoId: updatedTurno.userMedicoId,
      centroMedicoId: updatedTurno.centroMedicoId,
    };
    emitEvent('turno-actualizado', eventPayload, { centroMedicoId: user.centroMedicoId });

    return createResponse(200, 'Turno reagendado con éxito', updatedTurno);
  } catch (error: any) {
    console.error('Error al reagendar el turno:', error);
    return createResponse(500, 'Error interno del servidor al reagendar el turno.');
  }
};
