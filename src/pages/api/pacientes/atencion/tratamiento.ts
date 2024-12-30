import { generateId } from "lucia";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import db from "../../../../db";
import { historiaClinica } from "../../../../db/schema/historiaClinica";
import { tratamiento } from "../../../../db/schema";



export const GET: APIRoute = async ({ request, params }) => {
  // console.log("esto es el reques->", request.headers.get("idHistoriaClinica"));
  try {
    // Obtener el ID del paciente desde los headers
    const idHistoriaClinica = request.headers.get("idHistoriaClinica");
    if (!idHistoriaClinica) {
      return new Response(
        JSON.stringify({ error: "ID de paciente no proporcionado" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // consulta a la DB
    const tratamientoDB = (await db
      .select()
      .from(tratamiento)
      .where(eq(tratamiento.historiaClinicaId, idHistoriaClinica))).at(0)
      if(!tratamientoDB){
        return new Response(JSON.stringify({
          status:403,
          msg:'signos vitales no creados para la historia clinica'
        }))
      }

      return new Response(
      JSON.stringify({
        status: 200,
        msg: "respuesta ok",
        data: tratamientoDB,
      })
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 400,
        msg: "error en la busqueda",
      })
    );
  }
}

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
