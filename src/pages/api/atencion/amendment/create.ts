import db from '@/db';
import { atencionAmendments } from '@/db/schema/atencionAmendments';
import { logAuditEvent } from '@/lib/audit';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const { user, session } = locals;

  const ipAddress = request.headers.get('x-forwarded-for') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  if (!user || !session) {
    return createResponse(401, 'No autorizado');
  }

  const {
    atencionId,
    motivo,
    seccion,
    contenidoOriginal,
    contenidoCorregido,
    justificacion,
    userIdMedico,
  } = await request.json();

  if (!atencionId || !motivo || !seccion || !contenidoCorregido || !justificacion) {
    return createResponse(400, 'Faltan datos requeridos para la enmienda.');
  }

  try {
    const [newAmendment] = await db
      .insert(atencionAmendments)
      .values({
        atencionId,
        userIdMedico,
        motivo,
        seccion,
        contenidoOriginal,
        contenidoCorregido,
        justificacion,
      })
      .returning();

    await logAuditEvent({
      userId: userIdMedico,
      actionType: 'CREATE',
      tableName: 'atencionAmendments',
      recordId: newAmendment.id,
      newValue: newAmendment,
      description: `El usuario ${user.nombre} (${user.email}) creó una enmienda en la sección '${seccion}' de la atención ${atencionId}.`,
      ipAddress,
      userAgent,
    });

    return createResponse(201, 'Enmienda creada con éxito', newAmendment);
  } catch (error) {
    console.error('Error al crear la enmienda:', error);
    return createResponse(500, 'Error interno del servidor al crear la enmienda.');
  }
};
