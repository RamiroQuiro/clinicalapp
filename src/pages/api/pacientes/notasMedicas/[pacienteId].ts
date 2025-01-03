import type { APIRoute } from "astro";
import db from "../../../../db";
import {} from "../../../../db/schema";
import { generateId } from "lucia";
import { notasMedicas } from "../../../../db/schema/notasMedicas";

export const POST: APIRoute = async ({ request, params }) => {
  const data = await request.json();
  const { pacienteId } = params;

  console.log("enpditn de antecedentes", data, pacienteId);

  try {
    const id = generateId(13);
    const insertArchivos = await db.insert(notasMedicas).values({
      id: id,
      pacienteId,
      userId:data.userId,
      descripcion: data.descripcion,
    });

    return new Response(
      JSON.stringify({
        status: 200,
        msg: "guardado nota correcto  ",
      })
    );
  } catch (error) {
    console.log(error);
    return new Response(
      JSON.stringify({
        status: 400,
        msg: "error al guardar antecedentes",
      })
    );
  }
};
