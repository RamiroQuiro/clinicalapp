import db from '@/db';
import { notasMedicas } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const { session, user } = locals;

  if (!session || !user) {
    return createResponse(401, 'No autorizado');
  }

  const { id } = await request.json();

  if (!id) {
    return createResponse(400, 'Falta el ID de la nota');
  }

  try {
    // 1. Obtener el valor antiguo para la auditoría
    const oldNote = await db.query.notasMedicas.findFirst({
      where: and(eq(notasMedicas.id, id), eq(notasMedicas.userMedicoId, user.id)),
    });

    if (!oldNote) {
      return createResponse(404, 'Nota no encontrada o sin permisos para eliminar');
    }

    // 2. Realizar el borrado lógico (soft delete)
    const deleted_at = new Date();
    await db.update(notasMedicas).set({ deleted_at }).where(eq(notasMedicas.id, id));

    // 3. Registrar el evento de auditoría
    await logAuditEvent({
      userId: user.id,
      actionType: 'DELETE',
      tableName: 'notasMedicas',
      recordId: id,
      oldValue: oldNote,
      newValue: { ...oldNote, deleted_at }, // El nuevo valor es la nota con la fecha de borrado
      description: `El usuario ${user.name} eliminó una nota médica.`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return createResponse(200, 'Nota eliminada con éxito');
  } catch (error) {
    console.error('Error al eliminar la nota médica:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
