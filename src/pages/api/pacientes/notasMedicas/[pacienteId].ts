import { users } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { lucia } from '@/lib/auth';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq, sql } from 'drizzle-orm';
import { generateId } from 'lucia';
import db from '../../../../db';
import { notasMedicas } from '../../../../db/schema/notasMedicas';

// TODO: Revisar este endpoint. Parece duplicar la funcionalidad de /api/notas/create.ts y está incompleto.
export const POST: APIRoute = async ({ request, params, cookies }) => {
  const { session, user } = await lucia.validateSession(
    cookies.get(lucia.sessionCookieName)?.value ?? null
  );
  if (!session) {
    return createResponse(401, 'No autorizado');
  }

  const data = await request.json();
  const { pacienteId } = params;

  try {
    const id = generateId(13);
    // Esta inserción es incompleta, faltan campos como `title`.
    const insertArchivos = await db.insert(notasMedicas).values({
      id: id,
      pacienteId,
      userMedicoId: user.id, // Corregido para usar el id del médico logueado
      descripcion: data.descripcion,
      title: data.title || 'Nota sin título', // Añadido valor por defecto
    });

    // No se audita aquí, usar /api/notas/create.ts que ya está auditado.

    return createResponse(200, 'Nota creada (desde endpoint posiblemente obsoleto)');
  } catch (error) {
    console.log(error);
    return createResponse(500, 'Error al guardar la nota');
  }
};

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const { pacienteId } = params;
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

  if (!pacienteId) {
    return createResponse(400, 'Falta el ID del paciente');
  }

  try {
    // 2. Búsqueda en la base de datos
    const notas = await db
      .select({
        id: notasMedicas.id,
        title: notasMedicas.title,
        atencionId: notasMedicas.atencionId,
        profesional: sql`users.nombre || ' ' || users.apellido`,
        fecha: notasMedicas.created_at,
        descripcion: notasMedicas.descripcion,
        created_at: notasMedicas.created_at,
      })
      .from(notasMedicas)
      .innerJoin(users, eq(notasMedicas.userMedicoId, users.id))
      .where(eq(notasMedicas.pacienteId, pacienteId));

    // 3. Registrar evento de auditoría
    await logAuditEvent({
      userId: user.id,
      actionType: 'VIEW',
      tableName: 'notasMedicas',
      description: `El usuario ${user.name} (${user.email}) vio las notas médicas del paciente con ID ${pacienteId}.`,
      ipAddress,
      userAgent,
    });

    return createResponse(200, 'Notas obtenidas correctamente', notas);
  } catch (error) {
    console.error('Error al obtener notas:', error);
    return createResponse(500, 'Error al obtener notas');
  }
};
