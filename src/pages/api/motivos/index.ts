import type { APIRoute } from 'astro';
import { arrayMotivosIniciales } from '@/utils/arrayMotivosIniciales';

// Temporal: Usamos un array local en lugar de la DB
export const GET: APIRoute = async ({ locals }) => {
  const { session } = locals;

  if (!session) {
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
  }));

  return new Response(JSON.stringify(listaMotivos), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
