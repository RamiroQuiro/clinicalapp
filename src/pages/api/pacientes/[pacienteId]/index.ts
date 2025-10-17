import db from '@/db';
import { medicamento, users } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { desc, eq, sql } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, locals, request, cookies }) => {
  const pacienteId = params.pacienteId;
  const ipAddress = request.headers.get('x-forwarded-for') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  const urlParams = new URL(request.url);
  const query = urlParams.searchParams.get('query');

  // Autenticación
  const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return createResponse(401, 'No autorizado');
  }
  const { session, user } = await lucia.validateSession(sessionId);
  if (!session || !user) {
    return createResponse(401, 'No autorizado');
  }

  if (!pacienteId) {
    return createResponse(400, 'Faltan datos requeridos');
  }

  try {
    if (query == 'medicamentos') {
      const medicamentosPacienteDB = await db
        .select({
          id: medicamento.id,
          nombreGenerico: medicamento.nombreGenerico,
          nombreComercial: medicamento.nombreComercial,
          dosis: medicamento.dosis,
          frecuencia: medicamento.frecuencia,
          fechaPrescripcion: medicamento.created_at,
          medico: sql`users.nombre || ' ' || users.apellido`,
          estado: medicamento.estado,
        })
        .from(medicamento)
        .innerJoin(users, eq(medicamento.userMedicoId, users.id))
        .where(eq(medicamento.pacienteId, pacienteId))
        .orderBy(desc(medicamento.created_at))
        .limit(10);

      // Registrar evento de auditoría
      await logAuditEvent({
        userId: user.id,
        actionType: 'VIEW',
        tableName: 'medicamento',
        description: `El usuario ${user.name} (${user.email}) vio el historial de medicamentos del paciente con ID ${pacienteId}.`,
        ipAddress,
        userAgent,
      });

      return createResponse(200, 'Medicamentos encontrados', medicamentosPacienteDB);
    }

    // Si se añaden más queries, se deberían auditar aquí también.

    return createResponse(200, 'Paciente encontrado', {});
  } catch (error) {
    console.log(error);
    return createResponse(500, 'Error interno del servidor');
  }
};
