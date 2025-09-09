import { getFechaEnMilisegundos } from '@/utils/timesUtils';
import type { APIRoute } from 'astro';
// import { motivos } from '@/db/schema/motivos'; // Se necesitará importar el schema, hay que crearlo.

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const { session } = locals;

  if (!session) {
    return new Response('No autorizado', { status: 401 });
  }

  try {
    const { nombre } = await request.json();

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return new Response('El nombre del motivo es requerido', { status: 400 });
    }

    // --- Lógica de Inserción en la Base de Datos ---
    // const [nuevoMotivo] = await db.insert(motivos).values({
    //   nombre: nombre.trim(),
    //   creadoPor: session.user.userId, // Asociamos el motivo al doctor que lo crea
    // }).returning();

    // Por ahora, devolvemos un mock hasta tener el schema
    const nuevoMotivo = {
      id: `mock_${Date.now()}`,
      nombre: nombre.trim(),
      creadoPor: session.userId,
    };

    return new Response(JSON.stringify(nuevoMotivo), {
      status: 201, // 201 Created
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al crear el motivo:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
};
