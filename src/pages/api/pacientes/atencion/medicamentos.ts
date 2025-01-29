import { lucia } from '@/lib/auth';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';
import db from '../../../../db';
import { historiaClinica } from '../../../../db/schema/historiaClinica';
import { medicamento } from '../../../../db/schema/medicamento';

type MedicamentoType = {
  id?: string;
  nombre: string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
};

type RequestMedicamentosFront = {
  medicamentos: MedicamentoType;
  dataIds: {
    userId: string;
    hcId: string;
    pacienteId?: string;
  };
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const data: RequestMedicamentosFront = await request.json();
  // console.log("endpoint meidcamento->", data);

  try {
    const sessionId = cookies.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return new Response('No autorizado', { status: 401 });
    }
    const { session, user } = await lucia.validateSession(sessionId);
    if (!session) {
      return new Response('No autorizado', { status: 401 });
    }
    // Verificar si existe la historia clínica
    const isExists = (
      await db.select().from(historiaClinica).where(eq(historiaClinica.id, data.dataIds.hcId))
    ).at(0);

    // console.log("Historia clínica encontrada:", isExists);
    if (!isExists) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: 'La historia clínica no existe',
        }),
        { status: 400 }
      );
    }

    // Insertar medicamentos en la base de datos
    const idMedicamento = generateId(12);
    const insetMedicamento = await db.insert(medicamento).values({
      id: idMedicamento,
      nombre: data.medicamentos.nombre,
      dosis: data.medicamentos.dosis,
      frecuencia: data.medicamentos.frecuencia,
      duracion: data.medicamentos.duracion,
      pacienteId: data.dataIds.pacienteId,
      historiaClinicaId: data.dataIds.hcId, // Relacionar con la historia clínica
      userId: data.dataIds.userId, // Registrar quién realizó la inserción
    });

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Medicamentos guardados correctamente',
      })
    );
  } catch (error) {
    console.error('Error al guardar los medicamentos:', error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: 'Error al guardar los medicamentos',
        error: error.message,
      }),
      { status: 500 }
    );
  }
};
