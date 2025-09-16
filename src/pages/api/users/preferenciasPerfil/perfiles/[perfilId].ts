import db from '@/db';
import { preferenciaPerfilUser } from '@/db/schema/preferenciaPerfilUser';
import { createResponse } from '@/utils/responseAPI';
import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const PUT: APIRoute = async ({ request, locals, params }) => {
  const { session } = locals;
  const { perfilId } = params;
  const data = await request.json();
  const { id, nombrePerfil, preferencias, especialidad, estado } = data;
  console.log('data', data);
  // --- SECURITY CHECK ---

  try {
    // Se debe modificar para que actualice un solo perfil, usando el ID del perfil.
    // Ejemplo: .where(and(eq(preferenciaPerfilUser.id, profileId), eq(preferenciaPerfilUser.userId, userId)))
    const updatePerfil = await db
      .update(preferenciaPerfilUser)
      .set({
        nombrePerfil: nombrePerfil,
        preferencias: preferencias,
        especialidad: especialidad,
        estado: estado,
        updated_at: new Date(getFechaEnMilisegundos()),
      })
      .where(eq(preferenciaPerfilUser.id, perfilId))
      .returning();

    console.log('Endpoint de preferenciasPerfil para la data', updatePerfil);
    return createResponse(200, 'Éxito', updatePerfil);
  } catch (error) {
    console.error(error);
    return createResponse(500, 'Error al actualizar datos del perfil', error);
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { perfilId } = params;
  const { session } = locals;

  try {
    const deletePerfil = await db
      .update(preferenciaPerfilUser)
      .set({
        estado: 'borrado',
        deleted_at: new Date(),
      })
      .where(eq(preferenciaPerfilUser.id, perfilId));

    console.log('Endpoint de preferenciasPerfil para la data', deletePerfil);
    return createResponse(200, 'Éxito', deletePerfil);
  } catch (error) {
    console.error(error);
    return createResponse(500, 'Error al eliminar datos del perfil', error);
  }
};
