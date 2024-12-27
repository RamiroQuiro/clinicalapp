import { generateId } from "lucia";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import { historiaClinica } from "../../../db/schema/historiaClinica";
import db from "../../../db";
import { medicamentos } from "../../../db/schema/medicamentos";

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
  console.log("endpoint ->", data);

  try {
    // Verificar si existe la historia clínica
    const isExists = (
      await db
        .select()
        .from(historiaClinica)
        .where(eq(historiaClinica.id, data.historiaClinicaId))
    ).at(0);

    if (!isExists) {
      return new Response(
        JSON.stringify({
          status: 400,
          msg: "La historia clínica no existe",
        }),
        { status: 400 }
      );
    }

    const updateMedicamento = await db
      .update(medicamentos)
      .set(data)
      .where(eq(medicamentos.id, data.id));
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

export const DELETE: APIRoute = async ({ request }) => {
const data:string=await request.json()



  try {

    const deleteMedicament= await db.delete(medicamentos).where(eq(medicamentos.id,data))

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Medicamentos eliminado correctamente",
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
