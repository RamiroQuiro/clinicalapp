import { generateId } from "lucia";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import db from "../../../../db";
import { historiaClinica } from "../../../../db/schema/historiaClinica";
import { tratamiento } from "../../../../db/schema";



export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
//   console.log("este es el enpoint", data);
  const hcId = data.dataIds.hcId
  console.log('endpoint trataiento',data)
  try {
    const isExtis = (
      await db
        .select()
        .from(tratamiento)
        .where(eq(tratamiento.historiaClinicaId, hcId))
    ).at(0);
    if (!isExtis) {
      return new Response(
        JSON.stringify({
          status: 400,
          mg: "Error al crear el motivo de consulta",
        })
      );
    }
    const updateHC = await db
      .update(tratamiento)
      .set({
        tratamiento:data.tratamiento,
      })
      .where(eq(tratamiento.historiaClinicaId, hcId))

    console.log(updateHC);
    return new Response(
      JSON.stringify({
        status: 200,
        msg: "Motivo de consulta creado correctamente",
      })
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        status: 400,
        mg: "Error al crear el motivo de consulta",
      })
    );
  }
};
