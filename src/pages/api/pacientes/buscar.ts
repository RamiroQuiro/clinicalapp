import type { APIRoute } from 'astro';
import { like, or, sql } from 'drizzle-orm';

import db from '@/db';
import { pacientes } from '../../../db/schema/pacientes';

export const GET: APIRoute = async ({ url }) => {
  const searchTerm = url.searchParams.get('q');
  console.log(searchTerm);
  if (!searchTerm || searchTerm.length < 2) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  try {
    const searchResults = await db

      .select({
        id: pacientes.id,
        nombre: pacientes.nombre,
        apellido: pacientes.apellido,
        dni: pacientes.dni,
      })
      .from(pacientes)
      .where(
        sql`activo = 1 AND (${or(
          like(pacientes.nombre, `%${searchTerm}%`),
          like(pacientes.apellido, `%${searchTerm}%`),
          like(pacientes.dni, `%${searchTerm}%`)
        )})`
      )
      .limit(10);

    return new Response(JSON.stringify(searchResults), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error searching for patients:', error);
    return new Response(JSON.stringify({ message: 'Error interno del servidor' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
