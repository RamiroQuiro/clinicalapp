import { generateId } from "lucia";
import { eq } from "drizzle-orm";
import type { APIRoute } from "astro";
import db from "../../../../db";
import { historiaClinica } from "../../../../db/schema/historiaClinica";

type MotivoConsultaType={
    id:string,
    motivo:string,
    pacienteId:string,
    historiaClinicaId?:string,
    userId:string,
}

export const POST: APIRoute = async ({ request }) => {
const data = await request.json();
console.log(data)
try {

    let id=generateId(10)
    const createConsutla= await db.insert(historiaClinica).values({
        id,
        motivoConsulta:data.mo
    })



    return new Response(JSON.stringify({
        status: 200,
        msg: "Motivo de consulta creado correctamente",
    }))
} catch (error) {
    console.log(error)
    return new Response(JSON.stringify({
        status: 400,
       mg: "Error al crear el motivo de consulta" ,
    }))
    
}

};
