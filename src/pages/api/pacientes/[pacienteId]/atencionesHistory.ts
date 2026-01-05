import db from '@/db';
import { atenciones, auditLog, diagnostico, medicamento, signosVitales, users } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, desc, eq, inArray, not } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, locals, request }) => {
  try {
    const { pacienteId } = params;
    const { user } = locals;

    // Obtener parámetros de búsqueda
    const url = new URL(request.url);
    const excludeAtencionId = url.searchParams.get('excludeAtencionId');
    const soloMisAtenciones = url.searchParams.get('soloMisAtenciones') === 'true';

    if (!user) {
      return createResponse(401, 'No autorizado');
    }
    if (!pacienteId) {
      return createResponse(400, 'Faltan datos requeridos');
    }

    // Construir condiciones dinámicas
    const conditions = [eq(atenciones.pacienteId, pacienteId)];

    if (excludeAtencionId) {
      conditions.push(not(eq(atenciones.id, excludeAtencionId)));
    }

    if (soloMisAtenciones) {
      conditions.push(eq(atenciones.userIdMedico, user.id));
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
        tensionArterial: signosVitales.presionSistolica,
        peso: signosVitales.peso,
      })
      .from(atenciones)
      .leftJoin(users, eq(users.id, atenciones.userIdMedico))
      .leftJoin(diagnostico, eq(diagnostico.atencionId, atenciones.id))
      .leftJoin(signosVitales, eq(signosVitales.atencionId, atenciones.id))
      .where(and(...conditions))
      .orderBy(desc(atenciones.created_at))
      .limit(10);

    const uniqueAtenciones: any[] = Array.from(
      new Map(historialVisitaData.map(item => [item.id, item])).values()
    );

    if (!uniqueAtenciones || uniqueAtenciones.length === 0) {
      return createResponse(200, 'No se encontraron visitas', []);
    }

    // Obtener IDs para consultas adicionales
    const atencionIds = uniqueAtenciones.map(a => a.id);

    // Consultar diagnósticos y medicamentos adicionales
    const [diagnosticosExtra, medicamentosExtra] = await Promise.all([
      db.select().from(diagnostico).where(inArray(diagnostico.atencionId, atencionIds)),
      db.select().from(medicamento).where(inArray(medicamento.atencionId, atencionIds))
    ]);

    // Mapear los datos extra a las atenciones
    const dataConDetalles = uniqueAtenciones.map(atencion => {
      return {
        ...atencion,
        diagnosticos: [...new Set(diagnosticosExtra
          .filter(d => d.atencionId === atencion.id)
          .map(d => d.diagnostico))]
          .slice(0, 4),
        medicamentos: medicamentosExtra
          .filter(m => m.atencionId === atencion.id)
          .slice(0, 4)
          .map(m => m.nombreGenerico || m.nombreComercial)
      };
    });

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

    return createResponse(200, 'Historial de visitas encontrados', dataConDetalles);
  } catch (error) {
    console.log(error);
    return createResponse(400, 'error al buscar', error);
  }
};
