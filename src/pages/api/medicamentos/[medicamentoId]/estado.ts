import db from '@/db';
import { medicamento } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

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
      })
      .where(eq(medicamento.id, medicamentoId))
      .returning();
    console.log('update', update);
    return createResponse(200, 'Medicamento actualizado correctamente', update);
  } catch (error) {
    console.log(error);
    return createResponse(400, 'error al actualizar medicamentos', error);
  }
};
