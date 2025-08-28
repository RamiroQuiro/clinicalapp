import db from '@/db';
import { notasMedicas } from '@/db/schema';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request, locals }) => {
  const { session, user } = locals;

  if (!session || !user) {
    return new Response('No autorizado', { status: 401 });
  }

  const { id, title, descripcion } = await request.json();

  if (!id || !title || !descripcion) {
    return new Response('Faltan datos requeridos (id, title, descripcion)', { status: 400 });
  }

  try {
    await db
      .update(notasMedicas)
      .set({
        title,
        descripcion,
        updated_at: new Date(),
      })
      .where(eq(notasMedicas.id, id));

    return new Response('Nota actualizada con éxito', { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la nota médica:', error);
    return new Response('Error interno del servidor', { status: 500 });
  }
};
