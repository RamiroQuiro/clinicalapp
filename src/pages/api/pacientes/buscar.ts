import db from '@/db';
import { pacientes } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { like, or } from 'drizzle-orm';

export const GET: APIRoute = async ({ url, request, cookies }) => {
  const searchTerm = url.searchParams.get('q');
  const ipAddress = request.headers.get('x-forwarded-for') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  // 1. Autenticación
  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return createResponse(401, 'No autorizado');
  }
  const { session, user } = await lucia.validateSession(sessionId);
  if (!session || !user) {
    return createResponse(401, 'No autorizado');
  }

  if (!searchTerm || searchTerm.length < 2) {
    return createResponse(200, 'OK', []);
  }

  try {
    // 2. Búsqueda en la base de datos
    const searchResults = await db
      .select({
        id: pacientes.id,
        nombre: pacientes.nombre,
        apellido: pacientes.apellido,
        dni: pacientes.dni,
      })
      .from(pacientes)
      .where(
        or(
          like(pacientes.nombre, `%${searchTerm}%`),
          like(pacientes.apellido, `%${searchTerm}%`),
          like(pacientes.dni, `%${searchTerm}%`)
        )
      )
      .limit(10);

    // 3. Registrar evento de auditoría
    await logAuditEvent({
      userId: user.id,
      actionType: 'VIEW',
      tableName: 'pacientes',
      description: `El usuario ${user.name} (${user.email}) buscó pacientes con el término: "${searchTerm}". Se encontraron ${searchResults.length} resultados.`,
      ipAddress,
      userAgent,
    });

    return createResponse(200, 'OK', searchResults);
  } catch (error) {
    console.error('Error searching for patients:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
