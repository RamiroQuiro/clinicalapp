import db from '@/db';
import { licenciasProfesional } from '@/db/schema';
import { logAuditEvent } from '@/lib/audit';
import { logger } from '@/utils/logger';
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
        // Construir objeto de actualización sin valores undefined
        const updateData: any = {
            updated_at: new Date(),
        };

        // Solo incluir campos si vienen en los datos
        if (fechaInicio !== undefined) {
            updateData.fechaInicio = fechaInicio ? new Date(fechaInicio) : null;
        }
        if (fechaFin !== undefined) {
            updateData.fechaFin = fechaFin ? new Date(fechaFin) : null;
        }
        if (motivo !== undefined) {
            updateData.motivo = motivo;
        }
        if (tipo !== undefined) {
            updateData.tipo = tipo;
        }
        if (estado !== undefined) {
            updateData.estado = estado;
        }

        const licenciaActualizada = await db
            .update(licenciasProfesional)
            .set(updateData)
            .where(eq(licenciasProfesional.id, id))
            .returning();

        if (!licenciaActualizada.length) {
            return createResponse(404, 'Licencia no encontrada');
        }


        await logAuditEvent({
            userId: user.id,
            actionType: 'UPDATE',
            tableName: 'licenciasProfesional',
            recordId: id,
            newValue: licenciaActualizada[0],
            centroMedicoId: user.centroMedicoId,
            description: `Actualización de licencia profesional ${id}`,
        });

        return createResponse(200, 'Licencia actualizada con éxito', licenciaActualizada[0]);
    } catch (error) {
        logger.error('Error al actualizar licencia:', error);
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
        logger.error('Error al eliminar licencia:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
