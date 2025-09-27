import type { APIRoute } from 'astro';
import db from '@/db';
import { turnos } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import { and, eq, gte, lte, sql } from 'drizzle-orm';

export const GET: APIRoute = async ({ request, locals }) => {
  const { session, user } = locals;
  if (!session || !user) {
    return createResponse(401, 'No autorizado');
  }

  const url = new URL(request.url);
  const year = url.searchParams.get('year');
  const month = url.searchParams.get('month'); // month is 1-based (1-12)

  if (!year || !month) {
    return createResponse(400, 'Faltan los parámetros year y month');
  }

  const yearNum = parseInt(year, 10);
  const monthNum = parseInt(month, 10);

  // Crear fechas de inicio y fin para el mes
  const startDate = new Date(yearNum, monthNum - 1, 1);
  const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

  try {
    const result = await db
      .select({
        dia: sql<number>`strftime('%d', fechaTurno, 'unixepoch')`,
        cantidad: sql<number>`count(id)`,
      })
      .from(turnos)
      .where(
        and(
          eq(turnos.userMedicoId, user.id),
          gte(turnos.fechaTurno, startDate),
          lte(turnos.fechaTurno, endDate),
          sql`deleted_at IS NULL` // Excluir turnos borrados
        )
      )
      .groupBy(sql`strftime('%d', fechaTurno, 'unixepoch')`);

    // Mapear el resultado a un objeto más útil para el frontend
    const monthlyData = result.reduce((acc, row) => {
        acc[row.dia] = row.cantidad;
        return acc;
    }, {} as Record<number, number>);

    return createResponse(200, 'Datos del mes obtenidos con éxito', monthlyData);

  } catch (error) {
    console.error('Error al obtener los turnos del mes:', error);
    return createResponse(500, 'Error interno del servidor');
  }
};
