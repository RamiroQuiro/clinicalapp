import db from '@/db';
import { aiCredentials, whatsappSessions } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const { user, session } = locals;
        if (!session || !user) {
            return createResponse(401, 'No autorizado');
        }

        const centroMedicoId = String((user as any).centroMedicoId);

        const waSession = await db
            .select()
            .from(whatsappSessions)
            .where(eq(whatsappSessions.centroMedicoId, centroMedicoId))
            .limit(1);

        const credentials = await db
            .select()
            .from(aiCredentials)
            .where(and(
                eq(aiCredentials.centroMedicoId, centroMedicoId),
                eq(aiCredentials.isActive, true)
            ))
            .limit(1);

        return createResponse(200, 'Configuracion recuperada', {
            waSession: waSession[0] || null,
            credentials: credentials[0] || null
        });
    } catch (error) {
        console.error('Error en get-config:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
