import db from '@/db';
import { whatsappSessions } from '@/db/schema';
import { createResponse } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';

/**
 * POST /api/whatsapp/save-config
 * Guarda la configuracion de IA para WhatsApp (activo y prompt)
 */
export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const { user, session } = locals;
        if (!session || !user) {
            return createResponse(401, 'No autorizado');
        }

        const body = await request.json();
        const { aiActive, systemPrompt } = body;

        const centroMedicoId = String((user as any).centroMedicoId);

        // Asegurar que existe el registro
        const existing = await db
            .select()
            .from(whatsappSessions)
            .where(eq(whatsappSessions.centroMedicoId, centroMedicoId))
            .limit(1);

        if (existing.length === 0) {
            console.log('[SaveConfig] Creando registro inicial de sesión para centro:', centroMedicoId);
            await db.insert(whatsappSessions).values({
                id: crypto.randomUUID(),
                centroMedicoId,
                aiActive: !!aiActive,
                systemPrompt: systemPrompt || '',
                status: 'disconnected',
            });
        } else {
            await db
                .update(whatsappSessions)
                .set({
                    aiActive: !!aiActive,
                    systemPrompt: systemPrompt || '',
                    updated_at: new Date(),
                })
                .where(eq(whatsappSessions.centroMedicoId, centroMedicoId));
        }

        return createResponse(200, 'Configuracion guardada correctamente');
    } catch (error: any) {
        console.error('Error detallado en save-config:', error);
        return createResponse(500, 'Error interno del servidor: ' + error.message);
    }
};
