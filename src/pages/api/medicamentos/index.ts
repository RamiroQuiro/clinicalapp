import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import db from '../../../db';
import { medicamento } from '../../../db/schema/medicamento';

type MedicamentoType = {
  medicamento: string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
  userId?: string;
  pacienteId?: string;
  historiaClinicaId?: string;
  id: string;
};

type RequestMedicamentosFront = {
  medicamentos: MedicamentoType[];
  dataids: {
    userId: string;
    hcId: string;
    pacienteId?: string;
  };
};

export const PUT: APIRoute = async ({ request }) => {
  const data: MedicamentoType = await request.json();
  console.log('endpoint ->', data);

  try {
    // Verificar si existe la historia clínica

    const updateMedicamento = await db
      .update(medicamento)
      .set(data)
      .where(eq(medicamento.id, data.id));

    if (!updateMedicamento) {
      return new Response(
        JSON.stringify({
          status: 404,
          mdg: 'medicacin no entontrada',
        })
      );
    }
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

export const DELETE: APIRoute = async ({ request }) => {
  const { id }: string = await request.json();

  try {
    const deleteMedicament = await db.delete(medicamento).where(eq(medicamento.id, id));

    return new Response(
      JSON.stringify({
        status: 200,
        msg: 'Medicamentos eliminado correctamente',
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
