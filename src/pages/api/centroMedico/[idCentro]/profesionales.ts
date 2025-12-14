import db from '@/db';
import { users, usersCentrosMedicos } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { and } from 'drizzle-orm/sql';

export const GET: APIRoute = async ({ params }) => {
    try {
        const { idCentro } = params;

        if (!idCentro) {
            return createResponse(400, 'ID de centro requerido');
        }

        const relaciones = await db
            .select({
                profesionalId: usersCentrosMedicos.userId,
                nombre: users.nombre,
                apellido: users.apellido,
                especialidad: users.especialidad,
                srcPhoto: users.srcPhoto,
                email: users.email,
                dni: users.dni,
                activo: users.activo,
            })
            .from(usersCentrosMedicos)
            .innerJoin(users, eq(usersCentrosMedicos.userId, users.id))
            .where(and(eq(usersCentrosMedicos.centroMedicoId, idCentro), eq(usersCentrosMedicos.rolEnCentro, 'profesional')));

        return createResponse(200, 'OK', relaciones);
    } catch (error) {
        console.error('Error al obtener profesionales relacionados:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};