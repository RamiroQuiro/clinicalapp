import db from '@/db';
import { atenciones, auditLog, users } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { desc, eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, locals, request }) => {
  try {
    const { pacienteId } = params;
    const { user } = locals;

    if (!user) {
      return createResponse(401, 'No autorizado');
    }
    if (!pacienteId) {
      return createResponse(400, 'Faltan datos requeridos');
    }
    const historialVisitaData = await db
      .select({
        id: atenciones.id,
        userId: atenciones.userIdMedico,
        pacienteId: atenciones.pacienteId,
        motivoConsulta: atenciones.motivoConsulta,
        motivoInicial: atenciones.motivoInicial,
        fecha: atenciones.fecha,
        estado: atenciones.estado,
        created_at: atenciones.created_at,
        inicioAtencion: atenciones.inicioAtencion,
        finAtencion: atenciones.finAtencion,
        duracionAtencion: atenciones.duracionAtencion,
        nombreDoctor: users.nombre,
        apellidoDoctor: users.apellido,
      })
      .from(atenciones)
      .leftJoin(users, eq(users.id, atenciones.userIdMedico))
      .where(eq(atenciones.pacienteId, pacienteId))
      .orderBy(desc(atenciones.created_at))
      .limit(10);

    if (!historialVisitaData) {
      return createResponse(404, 'No se encontraron visitas');
    }
    const logAudit = await db.insert(auditLog).values({
      tableName: 'atenciones',
      userId: user.id,
      actionType: 'VIEW',
      recordId: pacienteId,
      oldValue: null,
      newValue: null,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('cf-connecting-ip'),
      createdAt: new Date(),
    });

    return createResponse(200, 'Historial de visitas encontrados', historialVisitaData);
  } catch (error) {
    console.log(error);
    return createResponse(400, 'error al buscar', error);
  }
};
