import db from "@/db";
import { users, whatsappSolicitudes } from "@/db/schema";

import type { APIRoute } from "astro";
import { and, eq } from "drizzle-orm";

export const GET: APIRoute = async ({ request, locals }) => {

    const { session, user } = locals

    if (!session || !user || !user.id) {
        return new Response("Unauthorized", { status: 401 });
    }


    try {
        const solicitudes = await db.select({
            id: whatsappSolicitudes.id,
            nombrePaciente: whatsappSolicitudes.nombrePaciente,
            numeroTelefono: whatsappSolicitudes.numeroTelefono,
            fechaHora: whatsappSolicitudes.fechaHora,
            created_at: whatsappSolicitudes.created_at,
            userMedicoId: whatsappSolicitudes.userMedicoId,
            nombreMedico: users.nombre,
            apellidoMedico: users.apellido,
        })
            .from(whatsappSolicitudes)
            .leftJoin(users, eq(whatsappSolicitudes.userMedicoId, users.id))
            .where(
                and(
                    eq(whatsappSolicitudes.centroMedicoId, user.centroMedicoId),
                    eq(whatsappSolicitudes.estado, 'pendiente')
                )
            ).orderBy(whatsappSolicitudes.created_at);

        const data = solicitudes.map(s => ({
            ...s,
            nombreMedico: `${s.nombreMedico} ${s.apellidoMedico}`
        }))

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Error fetching WhatsApp solicitudes:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
