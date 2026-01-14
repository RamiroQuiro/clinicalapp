import db from '@/db';
import { whatsappSessions } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';

/**
 * POST /api/whatsapp/disconnect
 * Proxy para el servidor independiente de WhatsApp
 */
export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const { user, session } = locals;
        if (!session || !user) {
            return createResponse(401, 'No autorizado');
        }

        const centroMedicoId = String((user as any).centroMedicoId);

        // Llamar al servidor independiente para desconectar
        try {
            const response = await fetch('http://localhost:5001/disconnect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ centroMedicoId })
            });

            if (!response.ok) {
                // Si el servidor responde con error, igual intentamos limpiar la DB localmente
                console.warn('[API] El servidor de WhatsApp devolvió un error al desconectar');
            }
        } catch (e) {
            console.error('[API] No se pudo contactar con el servidor de WhatsApp para desconectar');
            // IMPORTANTE: Si el servidor externo está caído, igual limpiamos la DB local
            // para que el usuario no se quede trabado con el estado "Connected" falso.
        }

        // Siempre actualizar estado en base de datos local para evitar estados "fantasma"
        await db
            .update(whatsappSessions)
            .set({
                status: 'disconnected',
                qrCode: null,
                updated_at: new Date(),
            })
            .where(eq(whatsappSessions.centroMedicoId, centroMedicoId));

        return createResponse(200, 'Sesion de WhatsApp desconectada (Reset local completado)');
    } catch (error) {
        console.error('Error en disconnect:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
