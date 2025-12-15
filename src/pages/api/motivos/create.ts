import db from '@/db';
import { motivosIniciales } from '@/db/schema';
import { nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
// import { motivos } from '@/db/schema/motivos'; // Se necesitará importar el schema, hay que crearlo.

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const { session, user } = locals;

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

    const idMotivo = nanoIDNormalizador(`motInic-${session.userId}`, 5)

    const nuevoMotivoDB = await db.insert(motivosIniciales).values({
      id: idMotivo,
      nombre: nombre.trim(),
      creadoPorId: session.userId,
      medicoId: session.userId,
      centroMedicoId: user?.centroMedicoId,
    }).returning();

    return new Response(JSON.stringify(nuevoMotivoDB[0]), {
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
