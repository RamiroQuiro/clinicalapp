import db from '@/db';
import { preferenciaPerfilUser } from '@/db/schema/preferenciaPerfilUser';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';

export const PUT: APIRoute = async ({ request, locals, params }) => {
  const { perfilId } = params;
  const { session } = locals;
  const datos = await request.json();
  const { nombrePerfil, preferencias, especialidad, estado } = datos;

  // --- Comprobación de Seguridad ---
  // Si no hay sesión, el usuario no está autenticado.
  if (!session) {
    return createResponse(401, 'No autorizado');
  }

  try {
    // Actualiza el perfil SÓLO si el ID del perfil y el ID del usuario (de la sesión) coinciden.
    const [perfilActualizado] = await db
      .update(preferenciaPerfilUser)
      .set({
        nombrePerfil: nombrePerfil,
        preferencias: preferencias,
        especialidad: especialidad,
        estado: estado,
        updated_at: new Date(),
      })
      .where(and(
        eq(preferenciaPerfilUser.id, perfilId as string),
        eq(preferenciaPerfilUser.userId, session.user.userId) // Asegura que el usuario es el dueño del perfil.
      ))
      .returning();

    // Si no se actualizó ninguna fila, es porque el perfil no existe o no pertenece al usuario.
    if (!perfilActualizado) {
        return createResponse(404, 'Perfil no encontrado o no tienes permiso para editarlo.');
    }

    return createResponse(200, 'Perfil actualizado con éxito', perfilActualizado);
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    return createResponse(500, 'Error al actualizar el perfil', error);
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  const { perfilId } = params;
  const { session } = locals;

  // --- Comprobación de Seguridad ---
  if (!session) {
    return createResponse(401, 'No autorizado');
  }

  try {
    // Realiza un borrado lógico SÓLO si el ID del perfil y el ID del usuario (de la sesión) coinciden.
    const [perfilBorrado] = await db
      .update(preferenciaPerfilUser)
      .set({
        estado: 'borrado',
        deleted_at: new Date(),
      })
      .where(and(
        eq(preferenciaPerfilUser.id, perfilId as string),
        eq(preferenciaPerfilUser.userId, session.user.userId) // Asegura que el usuario es el dueño del perfil.
      ))
      .returning();

    // Si no se borró ninguna fila, es porque el perfil no existe o no pertenece al usuario.
    if (!perfilBorrado) {
        return createResponse(404, 'Perfil no encontrado o no tienes permiso para borrarlo.');
    }

    return createResponse(200, 'Perfil borrado con éxito', perfilBorrado);
  } catch (error) {
    console.error("Error al borrar el perfil:", error);
    return createResponse(500, 'Error al borrar el perfil', error);
  }
};
