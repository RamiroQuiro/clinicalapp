import db from '@/db';
import { notasMedicas } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const { session, user } = locals;

  if (!session || !user) {
    return createResponse(401, 'No autorizado');
  }

  const { id, title, descripcion } = await request.json();

  if (!id || !title || !descripcion) {
    return createResponse(400, 'Faltan datos requeridos (id, title, descripcion)');
  }

  try {
    // 1. Obtener el valor antiguo para la auditoría
    const oldNote = await db.select().from(notasMedicas).where(eq(notasMedicas.id, id));

    if (!oldNote) {
      return createResponse(404, 'Nota no encontrada o sin permisos para editar');
    }

    // 2. Actualizar la nota
    const updatedData = {
      title,
      descripcion,
      updated_at: new Date(),
    };

    const updatedResult = await db
      .update(notasMedicas)
      .set(updatedData)
      .where(eq(notasMedicas.id, id))
      .returning();

    // 3. Registrar el evento de auditoría
    await logAuditEvent({
      userId: user.id,
      actionType: 'UPDATE',
      tableName: 'notasMedicas',
      recordId: id,
      oldValue: oldNote[0],
      newValue: updatedResult[0],
      description: `El usuario ${user.name} actualizó una nota médica.`,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return createResponse(200, 'Nota actualizada con éxito', updatedResult[0]);
  } catch (error) {
    console.error('Error al actualizar la nota médica:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
