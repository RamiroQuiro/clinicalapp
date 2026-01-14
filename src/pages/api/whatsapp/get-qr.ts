import db from '@/db';
import { whatsappSessions } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

/**
 * GET /api/whatsapp/get-qr
 * Lee el estado y el QR directamente de la base de datos
 * El servidor independiente (whatsapp-server.mjs) es quien actualiza estos datos.
 */
export const GET: APIRoute = async ({ request, locals }) => {
    try {
        const { user, session } = locals;
        if (!session || !user) {
            return createResponse(401, 'No autorizado');
        }

        const centroMedicoId = String((user as any).centroMedicoId);

        // Consultar la base de datos para obtener el estado real
        const sessionData = await db
            .select()
            .from(whatsappSessions)
            .where(eq(whatsappSessions.centroMedicoId, centroMedicoId))
            .limit(1);

        if (sessionData.length === 0) {
            return createResponse(404, 'No hay sesion registrada');
        }

        const data = sessionData[0];

        return createResponse(200, 'Estado recuperado', {
            status: data.status,
            qrCode: data.qrCode,
        });
    } catch (error) {
        console.error('Error en get-qr:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
