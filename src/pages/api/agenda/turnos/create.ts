import db from '@/db';
import { turnos } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const data = await request.json();

  if (!data.pacienteId || !data.fechaTurno || !data.duracion || !data.horaTurno) {
    return createResponse(400, 'Faltan campos obligatorios para crear el turno.');
  }

  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return createResponse(401, 'No autorizado');
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (!session) {
    return createResponse(401, 'No autorizado');
  }

  try {
    const turnoId = nanoIDNormalizador('Turno_', 15);

    const [newTurno] = await db
      .insert(turnos)
      .values({
        id: turnoId,
        pacienteId: data.pacienteId,
        otorgaUserId: user.id, // El usuario que crea el turno
        userMedicoId: user.id, // El médico para el que es el turno (asumimos que es el mismo)
        fechaTurno: new Date(data.fechaTurno),
        horaAtencion: data.horaTurno,
        duracion: data.duracion,
        motivoConsulta: data.motivoConsulta,
        estado: 'pendiente', // Estado inicial
      })
      .returning();

    await logAuditEvent({
      userId: user.id,
      actionType: 'CREATE',
      tableName: 'turnos',
      recordId: newTurno.id,
      newValue: newTurno,
      description: `Se creó un nuevo turno para el paciente ${data.pacienteNombre}`,
    });

    return createResponse(200, 'Turno creado con éxito', newTurno);
  } catch (error: any) {
    console.error('Error al crear el turno:', error);
    return createResponse(500, 'Error interno del servidor al crear el turno.');
  }
};
