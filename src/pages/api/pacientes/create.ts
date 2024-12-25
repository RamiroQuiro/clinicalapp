import { APIRoute } from "astro";
import { generateId } from "lucia";
import db from "../../../db";
import { pacientes } from "../../../db/schema";
import { pacienteType, type responseAPIType } from "../../../types/index";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request }) => {
  const data: pacienteType = await request.json();
  console.log(data);
  if (!data.email || !data.nombre || !data.dni || !data.userId) {
    return new Response("Missing required fields", {
      status: 400,
    });
  }

  try {
    const isUser = await db
      .select()
      .from(pacientes)
      .where(eq(pacientes.dni, data.dni));

    if (isUser[0]) {
      const response: responseAPIType = {
        code: 400,
        msg: "DNI ya registrado con un paciente",
      };
      return new Response(JSON.stringify(response));
    }

    const id = generateId(10);
    const createPaciente = await db.insert(pacientes).values({
      nombre: data.nombre,
      email: data.email,
      dni: data.dni,
      fNacimiento: data.fNacimiento,
      userId: data.userId,
      apellido: data.apellido,
      celular: data.celular,
      sexo:data.sexo,
      id,
      created_at: new Date().toISOString(),
    });

    const response: responseAPIType = {
      code: 200,
      msg: "Paciente creado con éxito",
    };
    return new Response(JSON.stringify(response), {
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response("error", {
      status: 500,
    });
  }
};
