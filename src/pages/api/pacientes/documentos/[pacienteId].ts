import type { APIRoute } from "astro";
import db from "../../../../db";
import { archivosAdjuntos } from "../../../../db/schema";
import { generateId } from "lucia";

export const POST: APIRoute = async ({ request, params }) => {
  const data = await request.json();
  const {pacienteId}=params

  console.log('enpditn de antecedentes',data,pacienteId);

  try {
    const id = generateId(13);
    const insertArchivos = await db.insert(archivosAdjuntos).values({
      id: id,
      pacienteId,
      descripcion:data.descripcion,
      nombre:data.nombre,
      url:data.url,
      estado:data.estado,
      tipo:data.tipo,
      
    });

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "guardado antecedente correcto  ",
      })
    );
  } catch (error) {
    console.log(error)
    return new Response(
      JSON.stringify({
        status: 400,
        msg: "error al guardar antecedentes",
      })
    );
  }
};
