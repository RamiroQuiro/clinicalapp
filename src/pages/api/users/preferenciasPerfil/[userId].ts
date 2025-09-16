import db from '@/db';
import { preferenciaPerfilUser } from '@/db/schema/preferenciaPerfilUser';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const GET: APIRoute = async ({ params, locals }) => {
  const { userId } = params;
  const { session } = locals;

  // --- SECURITY CHECK ---
  if (session?.user?.userId !== userId) {
    return createResponse(403, 'No autorizado para acceder a este recurso');
  }

  try {
    // Devuelve TODOS los perfiles para el usuario, no solo el primero.
    const perfiles = await db
      .select()
      .from(preferenciaPerfilUser)
      .where(eq(preferenciaPerfilUser.userId, userId));

    console.log('Endpoint de preferenciasPerfil para la data', perfiles);
    return createResponse(200, 'Éxito', perfiles);
  } catch (error) {
    console.error(error);
    return createResponse(500, 'Error al obtener datos del perfil', error);
  }
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const { userId } = params;
  const { session } = locals;
  // --- SECURITY CHECK ---
  if (session?.userId !== userId) {
    return createResponse(403, 'No autorizado para crear un perfil para este usuario');
  }

  const data = await request.json();
  const { nombrePerfil, preferencias, especialidad, estado } = data;
  console.log('data', data);
  try {
    // Valida si ya existe un perfil con el mismo nombre para este usuario
    const [preferenciaPerfilDB] = await db
      .select()
      .from(preferenciaPerfilUser)
      .where(
        and(
          eq(preferenciaPerfilUser.userId, userId),
          eq(preferenciaPerfilUser.nombrePerfil, nombrePerfil)
        )
      );

    if (preferenciaPerfilDB) {
      return createResponse(400, 'El nombre de este perfil ya existe', preferenciaPerfilDB);
    }

    // Inserta el nuevo perfil
    const [preferenciaPerfilDBInsert] = await db
      .insert(preferenciaPerfilUser)
      .values({
        id: nanoid(), // Es buena práctica generar el ID en el servidor
        userId: userId,
        nombrePerfil: nombrePerfil,
        preferencias: preferencias,
        especialidad: especialidad,
        estado: estado,
        // created_at se inserta por defecto con SQL
      })
      .returning();

    console.log('Endpoint de preferenciasPerfil para la data', preferenciaPerfilDBInsert);
    return createResponse(200, 'Éxito', preferenciaPerfilDBInsert);
  } catch (error) {
    console.error(error);
    return createResponse(500, 'Error al crear el perfil', error);
  }
};
