import { APIRoute } from "astro";
import { eq } from "drizzle-orm";
import { listaDeEspera, pacientes } from "@/db/schema";
import db from "@/db";
import { nanoid } from "nanoid";

export const GET: APIRoute = async ({ request, params }) => {

    const listaEsperaDB = await db.select().from(listaDeEspera).where(eq(listaDeEspera.userId, params.userId))
    return new Response(JSON.stringify(listaEsperaDB), {
        status: 200,
    });

}
export const POST: APIRoute = async ({ request, params }) => {
    const data = await request.json();
    const { userId } = params
    console.log(data);
    if (!data.apellido || !data.nombre || !data.dni || !data.userId) {
        return new Response("Datos incompletos requeridos", {
            status: 400,
        });
    }

    try {
        const isPacienteExiste = (await db.select().from(pacientes).where(eq(pacientes.dni, data.dni))).at(0)
        const fechaHoy = new Date()
        const horaHoy = fechaHoy.getHours()
        if (isPacienteExiste) {
            const insertarPaciente = await db.insert(listaDeEspera).values({
                id: nanoid(),
                pacienteId: isPacienteExiste.id,
                nombre: data.nombre,
                apellido: data.apellido,
                dni: data.dni,
                motivoConsulta: data.motivoConsulta,
                fecha: fechaHoy.toISOString(),
                hora: horaHoy,
                userId: userId,
                isExist: true,
            }).returning()
            return new Response(JSON.stringify({ status: 200, msg: 'paciente agregado a la lista de espera', data: insertarPaciente }), {
                headers: { "content-type": "application/json" },
            });
        }
        const insertarPaciente = await db.insert(listaDeEspera).values({
            id: nanoid(),

            nombre: data.nombre,
            apellido: data.apellido,
            dni: data.dni,
            motivoConsulta: data.motivoConsulta,
            fecha: fechaHoy.toISOString(),
            hora: horaHoy,
            userId: userId,
            isExist: false,
        }).returning()

        return new Response(JSON.stringify({ status: 200, msg: 'paciente agregado a la lista de espera', data: insertarPaciente }), {
            headers: { "content-type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response("error", {
            status: 500,
        });
    }
};


export const DELETE: APIRoute = async ({ request, params }) => {
    const { userId } = params
    const data = await request.json()
    console.log(data)
    try {
        const deletPacienteEnEspera = await db.delete(listaDeEspera).where(eq(listaDeEspera.id, data)).returning()
        return new Response(JSON.stringify({ status: 200, msg: 'eliminado correctamen   te', data: deletPacienteEnEspera }), {
            headers: { "content-type": "application/json" },
        });
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ status: 500, msg: 'error al eliminar' }))
    }

}