import db from '@/db';
import { preferenciaPerfilUser } from '@/db/schema/preferenciaPerfilUser';
import { eq } from 'drizzle-orm';

/**
 * Actualiza las preferencias de un perfil de usuario específico en la base de datos.
 *
 * @param perfilId El ID del registro de preferencias a actualizar (no el userId).
 * @param nuevasPreferencias El objeto JavaScript completo con las nuevas preferencias.
 * @returns El resultado de la operación de actualización.
 */
export const actualizarPreferenciasUsuario = async (
  perfilId: string,
  nuevasPreferencias: object
) => {
  try {
    // Drizzle con mode: 'json' maneja automáticamente la serialización del objeto a JSON string.
    const updateResult = await db
      .update(preferenciaPerfilUser)
      .set({
        preferencias: nuevasPreferencias, // Pasamos el objeto JavaScript directamente
        updated_at: new Date(),
      })
      .where(eq(preferenciaPerfilUser.id, perfilId));

    if (updateResult.rowsAffected === 0) {
      console.warn(
        `[preferencias.utils] No se encontró el perfil de preferencias con ID: ${perfilId} para actualizar.`
      );
    } else {
      console.log(
        `[preferencias.utils] Preferencias actualizadas para el perfil con ID: ${perfilId}`
      );
    }
    return updateResult;
  } catch (error) {
    console.error(
      `[preferencias.utils] Error al actualizar preferencias para el perfil ${perfilId}:`,
      error
    );
    throw error; // Re-lanzar el error para que el llamador pueda manejarlo
  }
};
