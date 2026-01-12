import db from '@/db';
import { users, usersCentrosMedicos } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq, or } from 'drizzle-orm';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const centroMedicoId = url.searchParams.get('centroId');

    if (!centroMedicoId) {
        return createResponse(400, 'centroId es requerido');
    }

    try {
        const profesionales = await db
            .select({
                id: users.id,
                nombre: users.nombre,
                apellido: users.apellido,
                especialidad: users.especialidad,
                abreviatura: users.abreviatura,
            })
            .from(usersCentrosMedicos)
            .innerJoin(users, eq(usersCentrosMedicos.userId, users.id))
            .where(
                and(
                    eq(usersCentrosMedicos.centroMedicoId, centroMedicoId),
                    eq(usersCentrosMedicos.activo, true),
                    or(
                        eq(usersCentrosMedicos.rolEnCentro, 'profesional'),
                        eq(usersCentrosMedicos.rolEnCentro, 'admin'),
                        eq(usersCentrosMedicos.rolEnCentro, 'adminLocal')
                    )
                )
            );

        return createResponse(200, 'Profesionales obtenidos con éxito', profesionales);
    } catch (error) {
        console.error('Error en /api/public/profesionales:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
