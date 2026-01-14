import db from '@/db';
import { aiCredentials } from '@/db/schema';
import { encrypt } from '@/lib/encryption/crypto';
import { createResponse, nanoIDNormalizador } from '@/utils/responseAPI';
import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';

/**
 * POST /api/whatsapp/save-ai-credentials
 * Guarda las credenciales de IA cifradas para un centro medico
 */
export const POST: APIRoute = async ({ request, locals }) => {
    try {
        const { user, session } = locals;
        if (!session || !user) {
            return createResponse(401, 'No autorizado');
        }

        const body = await request.json();
        const { provider, apiKey, model } = body;

        if (!provider || !apiKey || !model) {
            return createResponse(400, 'Todos los campos son requeridos');
        }

        const centroMedicoId = String((user as any).centroMedicoId);

        console.log(`[SaveCredentials] Cambiando proveedor. Centro: ${centroMedicoId}, Nuevo: ${provider}`);

        // 1. Desactivar TODAS las credenciales previas de este centro
        // para que solo haya una activa a la vez
        const result = await db
            .update(aiCredentials)
            .set({ isActive: false })
            .where(eq(aiCredentials.centroMedicoId, centroMedicoId));

        console.log(`[SaveCredentials] Registros desactivados: ${result.rowsAffected}`);

        // 2. Cifrar la API key
        const apiKeyEncrypted = encrypt(apiKey);

        // 3. Buscar si ya existe una credencial para este proveedor (para actualizarla)
        const existing = await db
            .select()
            .from(aiCredentials)
            .where(
                and(
                    eq(aiCredentials.centroMedicoId, centroMedicoId),
                    eq(aiCredentials.provider, provider)
                )
            )
            .limit(1);

        if (existing.length > 0) {
            // Actualizar credencial existente y activarla
            await db
                .update(aiCredentials)
                .set({
                    apiKeyEncrypted,
                    model,
                    isActive: true,
                    updated_at: new Date(),
                })
                .where(eq(aiCredentials.id, existing[0].id));
        } else {
            // Crear nueva credencial y activarla
            await db.insert(aiCredentials).values({
                id: nanoIDNormalizador('AICred', 15),
                centroMedicoId,
                provider,
                apiKeyEncrypted,
                model,
                isActive: true,
            });
        }

        return createResponse(200, 'Credenciales guardadas correctamente');
    } catch (error) {
        console.error('Error en save-ai-credentials:', error);
        return createResponse(500, 'Error interno del servidor');
    }
};
