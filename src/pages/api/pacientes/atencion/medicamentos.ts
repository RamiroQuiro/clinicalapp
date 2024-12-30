import { generateId } from "lucia";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import db from "../../../../db";
import { historiaClinica } from "../../../../db/schema/historiaClinica";
import { medicamento } from "../../../../db/schema/medicamento";

type MedicamentoType = {
  id?:string,
  nombre: string;
  dosis?: string;
  frecuencia?: string;
  duracion?: string;
};

type RequestMedicamentosFront = {
  medicamentos: MedicamentoType[];
  dataids: {
    userId: string;
    hcId: string;
    pacienteId?: string;
  };
};

export const POST: APIRoute = async ({ request }) => {
  const data: RequestMedicamentosFront = await request.json();
  console.log("endpoint ->", data);

  try {
    // Verificar si existe la historia clínica
    const isExists = (
      await db
        .select()
        .from(historiaClinica)
        .where(eq(historiaClinica.id, data.dataids.hcId))
    ).at(0);

    console.log("Historia clínica encontrada:", isExists);
    if (!isExists) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: "La historia clínica no existe",
        }),
        { status: 400 }
      );
    }


    // Insertar medicamentos en la base de datos
    const medicamentosPromises = data.medicamentos.map((med) => {
      const idMedicamento = generateId(12);
      return db.insert(medicamento).values({
        id: idMedicamento,
        nombre: med.nombre,
        dosis: med.dosis,
        frecuencia: med.frecuencia,
        duracion: med.duracion,
        pacienteId: data.dataids.pacienteId,
        historiaClinicaId: data.dataids.hcId, // Relacionar con la historia clínica
        userId: data.dataids.userId, // Registrar quién realizó la inserción
      });
    });

    // Esperar que todas las inserciones se completen
    await Promise.all(medicamentosPromises);

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Medicamentos guardados correctamente",
      })
    );
  } catch (error) {
    console.error("Error al guardar los medicamentos:", error);
    return new Response(
      JSON.stringify({
        status: 500,
        msg: "Error al guardar los medicamentos",
        error: error.message,
      }),
      { status: 500 }
    );
  }
};
