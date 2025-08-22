import db from '@/db';
import { auditLog, medicamento } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq, sql } from 'drizzle-orm';

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const { medicamentoId } = params;
  const { user } = locals;
  const data = await request.json();
  if (!user) {
    return createResponse(401, 'No autorizado');
  }

  if (!medicamentoId) {
    return createResponse(400, 'No se proporciono el id del medicamento');
  }
  try {
    const update = await db
      .update(medicamento)
      .set({
        estado: data.estado,
        updateUserId: user.id,
        updated_at: sql`strftime('%s', 'now')`,
      })
      .where(eq(medicamento.id, medicamentoId))
      .returning();
    const logAudit = await db.insert(auditLog).values({
      tableName: 'medicamentos',
      userId: user.id,
      actionType: 'UPDATE',
      recordId: medicamentoId,
      oldValue: update[0].estado,
      newValue: data.estado,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('cf-connecting-ip'),
      createdAt: new Date(),
    });
    console.log('update', update);
    return createResponse(200, 'Medicamento actualizado correctamente', update);
  } catch (error) {
    console.log(error);
    return createResponse(400, 'error al actualizar medicamentos', error);
  }
};
