import db from '@/db';
import { medicamento, users } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { desc, eq, sql } from 'drizzle-orm';

export const GET: APIRoute = async ({ params, locals, request }) => {
  const pacienteId = params.pacienteId;
  const { user } = locals;
  const urlParams = new URL(request.url);
  const query = urlParams.searchParams.get('query');
  try {
    if (!user) {
      return createResponse(401, 'No autorizado');
    }

    if (!pacienteId) {
      return createResponse(400, 'Faltan datos requeridos');
    }

    if (query == 'medicamentos') {
      const medicamentosPacienteDB = await db
        .select({
          id: medicamento.id,
          nombre: medicamento.nombreGenerico,
          dosis: medicamento.dosis,
          frecuencia: medicamento.frecuencia,
          fechaPrescripcion: medicamento.created_at,
          medico: sql`CONCAT(${users.nombre}, ' ', ${users.apellido})`,
          estado: medicamento.estado,
        })
        .from(medicamento)
        .innerJoin(users, eq(medicamento.userMedicoId, users.id))
        .where(eq(medicamento.pacienteId, pacienteId))
        .orderBy(desc(medicamento.created_at))
        .limit(10);
      return createResponse(200, 'Medicamentos encontrados', medicamentosPacienteDB);
    }
    return createResponse(200, 'Paciente encontrado', {});
  } catch (error) {
    console.log(error);
    return createResponse(400, 'error al buscar', error);
  }
};
