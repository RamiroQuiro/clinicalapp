import db from '@/db';
import { motivosIniciales } from '@/db/schema';
import { arrayMotivosIniciales } from '@/utils/arrayMotivosIniciales';
import type { APIRoute } from 'astro';
import { desc, eq } from 'drizzle-orm';

// GET /api/motivos
export const GET: APIRoute = async ({ locals }) => {
  const { session, user } = locals;

  if (!session || !user) {
    return new Response('No autorizado', { status: 401 });
  }
  // Aplanamos el array de motivos para tener una sola lista de strings
  const todosLosMotivos = arrayMotivosIniciales.flatMap(item => item.motivos);

  // Eliminamos duplicados
  const motivosUnicos = [...new Set(todosLosMotivos)];

  // Convertimos a un formato de objeto compatible con el frontend
  const listaMotivos = motivosUnicos.map((nombre, index) => ({
    id: index + 1,
    nombre: nombre,
  }))
  try {
    const motivos = await db
      .select()
      .from(motivosIniciales)
      .where(eq(motivosIniciales.medicoId, user.id))
      .orderBy(desc(motivosIniciales.created_at));

    // Fusionamos ambas listas
    // Los motivos hardcodeados tienen ID numérico generado en el map
    // Los de la DB tienen ID string (nanoid)
    const finalMotivos = [...motivos, ...listaMotivos];

    return new Response(JSON.stringify(finalMotivos), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener motivos:', error);
    return new Response(JSON.stringify({ message: 'Error interno' }), { status: 500 });
  }
};
