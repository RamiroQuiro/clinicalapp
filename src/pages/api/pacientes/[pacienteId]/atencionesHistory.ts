import db from '@/db';
import { atenciones, auditLog, diagnostico, signosVitales, users } from '@/db/schema';
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
        nombreDoctor: users.nombre,
        apellidoDoctor: users.apellido,

        diagnosticoPrincipal: diagnostico.diagnostico,
        temperatura: signosVitales.temperatura,
        frecuenciaCardiaca: signosVitales.frecuenciaCardiaca,
        tensionArterial: signosVitales.presionSiscolica, // Usamos presionSiscolica como aproximación a tensionArterial si no existe
        peso: signosVitales.peso,
      })
      .from(atenciones)
      .leftJoin(users, eq(users.id, atenciones.userIdMedico))
      .leftJoin(diagnostico, eq(diagnostico.atencionId, atenciones.id))
      .leftJoin(signosVitales, eq(signosVitales.atencionId, atenciones.id))
      .where(eq(atenciones.pacienteId, pacienteId))
      .orderBy(desc(atenciones.created_at))
      .limit(10);

    // Grouping since leftJoin might return multiple rows for same attention if multiple diagnoses
    // However, since we only want a preview, we can just deduplicate or take the first one.
    // Drizzle select might return multiple rows. Let's deduplicate by attention ID.
    const uniqueAtenciones = Array.from(new Map(historialVisitaData.map(item => [item.id, item])).values());

    if (!uniqueAtenciones || uniqueAtenciones.length === 0) {
      return createResponse(200, 'No se encontraron visitas', []);
    }

    await db.insert(auditLog).values({
      tableName: 'atenciones',
      userId: user.id,
      actionType: 'VIEW',
      recordId: pacienteId,
      oldValue: null,
      newValue: null,
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('cf-connecting-ip'),
    });

    return createResponse(200, 'Historial de visitas encontrados', uniqueAtenciones);
  } catch (error) {
    console.log(error);
    return createResponse(400, 'error al buscar', error);
  }
};
