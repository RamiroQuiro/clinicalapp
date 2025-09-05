import db from '@/db';
import { atencionAmendments } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const { user, session } = locals;
  const ipAddress = request.headers.get('x-forwarded-for') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  if (!user || !session) {
    return createResponse(401, 'No autorizado');
  }

  const { atencionId, reason, details } = await request.json();

  if (!atencionId || !reason || !details) {
    return createResponse(400, 'Faltan datos requeridos para la enmienda.');
  }

  try {
    const newAmendment = await db.insert(atencionAmendments).values({
      atencionId,
      userId: user.id,
      reason,
      details,
    }).returning();

    await logAuditEvent({
      userId: user.id,
      actionType: 'CREATE',
      tableName: 'atencionAmendments',
      recordId: newAmendment[0].id,
      newValue: newAmendment[0],
      description: `El usuario ${user.name} (${user.email}) creó una enmienda para la atención ${atencionId}. Motivo: ${reason}`,
      ipAddress,
      userAgent,
    });

    return createResponse(201, 'Enmienda creada con éxito', newAmendment[0]);
  } catch (error) {
    console.error('Error al crear la enmienda:', error);
    return createResponse(500, 'Error interno del servidor al crear la enmienda.');
  }
};
