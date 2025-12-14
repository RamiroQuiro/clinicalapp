import db from '@/db';
import { recepcionistaProfesional } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';

export const DELETE: APIRoute = async ({ params }) => {
    try {
        const { id, profesionalId } = params;

        if (!id || !profesionalId) {
            return createResponse(400, 'IDs requeridos');
        }

        await db
            .delete(recepcionistaProfesional)
            .where(and(
                eq(recepcionistaProfesional.recepcionistaId, id),
                eq(recepcionistaProfesional.profesionalId, profesionalId)
            ));

        return createResponse(200, 'Relación eliminada correctamente');

    } catch (error) {
        console.error('Error al eliminar relación:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
