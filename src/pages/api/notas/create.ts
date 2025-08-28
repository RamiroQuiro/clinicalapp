import db from '@/db';
import { notasMedicas } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';

export const POST: APIRoute = async ({ request, locals }) => {
  const { session, user } = locals;

  // 1. Validar sesión
  if (!session || !user) {
    return new Response('No autorizado', { status: 401 });
  }

  // 2. Obtener y validar datos del body
  const { descripcion, pacienteId, title, atencionId } = await request.json();
  console.log('recibiendo los datos a insertar: ', descripcion, pacienteId, title, atencionId);
  if (!descripcion || !pacienteId) {
    return createResponse(400, 'Faltan datos requeridos (descripcion, pacienteId)');
  }

  const newNoteId = nanoid();

  // 3. Insertar en la base de datos
  try {
    const insertandoDB = await db
      .insert(notasMedicas)
      .values({
        id: newNoteId,
        descripcion,
        pacienteId,
        title,
        atencionId: atencionId ? atencionId : null,
        userMedicoId: user.id,
      })
      .returning();
    console.log('insertandoDB', insertandoDB);
    // 4. Devolver respuesta de éxito
    return createResponse(201, 'Nota médica creada con éxito', insertandoDB);
  } catch (error) {
    console.error('Error al insertar la nota médica:', error);
    return createResponse(500, 'Error interno del servidor', error);
  }
};
