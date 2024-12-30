import type { APIRoute } from "astro";
import db from "../../../../db";
import { eq } from "drizzle-orm";
import { atenciones,historiaClinica} from "../../../../db/schema";

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
console.log(data)
  try {
    const isExisteAtencion = (
      await db
        .select()
        .from(historiaClinica)
        .where(eq(historiaClinica.id, data.idAtencion))
    ).at(0);
    if (!isExisteAtencion) {
      return new Response(
        JSON.stringify({
          status: 404,
          msg: "No existe atencion buscada",
        })
      );
    }

    const updateCerrarAtencion = await db
      .update(historiaClinica)
      .set({
        estado: "FINALIZADO",
      })
      .where(eq(historiaClinica.id, data.idAtencion));

      return new Response(JSON.stringify({
        status:200,
        msg:'atencion cerrada'
      }))
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({
        status:400,
        msg:'error al cerrar atencion '
      }))
  }
};
