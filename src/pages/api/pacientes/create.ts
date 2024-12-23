import {APIRoute} from 'astro'
import { generateId } from "lucia"
import db from "../../../db"
import { pacientes } from "../../../db/schema"
import {pacienteType} from '../../../types/index'


export const POST:APIRoute= async ({request}) => {
const data:pacienteType = await request.json()
console.log(data)
if (!data.email || !data.nombre || !data.dni || !data.userId) {
    return new Response('Missing required fields', {
        status: 400,
    });
}

try {
    const id=generateId(10)
    const createPaciente=await db.insert(pacientes).values({
        nombre: data.nombre,
        email: data.email,
        dni: data.dni,
        userId: data.userId,
        apellido:data.apelido,
        celular:data.celular,
        id,
        created_at: new Date().toISOString(),
    })

    return new Response(JSON.stringify({ message: 'Paciente creado con éxito', paciente: createPaciente }), {
        headers: { 'content-type': 'application/json' },
    });
} catch (error) {
    console.error(error)
    return new Response('error',{
        status: 500
    })
    
}

    return new Response('Hello worker!', {
        headers: { 'content-type': 'text/plain' },
    })
}