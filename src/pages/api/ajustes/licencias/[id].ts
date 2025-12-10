import db from '@/db';
import { licenciasProfesional } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

// PUT - Actualizar licencia
export const PUT: APIRoute = async ({ params, request, locals }) => {
    const { session, user } = locals;

    if (!session || !user) {
        return createResponse(401, 'No autorizado');
    }

    const { id } = params;
    if (!id) {
        return createResponse(400, 'ID de licencia requerido');
    }

    const { fechaInicio, fechaFin, motivo, tipo, estado } = await request.json();

    try {
        const licenciaActualizada = await db
            .update(licenciasProfesional)
            .set({
                fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
                fechaFin: fechaFin ? new Date(fechaFin) : undefined,
                motivo,
                tipo,
                estado,
                updated_at: new Date(),
            })
            .where(eq(licenciasProfesional.id, id))
            .returning();

        if (!licenciaActualizada.length) {
            return createResponse(404, 'Licencia no encontrada');
        }

        return createResponse(200, 'Licencia actualizada con éxito', licenciaActualizada[0]);

    } catch (error) {
        console.error('Error al actualizar licencia:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};

// DELETE - Eliminar licencia
export const DELETE: APIRoute = async ({ params, locals }) => {
    const { session, user } = locals;

    if (!session || !user) {
        return createResponse(401, 'No autorizado');
    }

    const { id } = params;
    if (!id) {
        return createResponse(400, 'ID de licencia requerido');
    }

    try {
        const licenciaEliminada = await db
            .delete(licenciasProfesional)
            .where(eq(licenciasProfesional.id, id))
            .returning();

        if (!licenciaEliminada.length) {
            return createResponse(404, 'Licencia no encontrada');
        }

        return createResponse(200, 'Licencia eliminada con éxito');

    } catch (error) {
        console.error('Error al eliminar licencia:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
