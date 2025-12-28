import { createResponse } from '@/utils/responseAPI';
import { generateTurnoToken } from '@/utils/turnoToken';
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { turnoId } = await request.json();

        if (!turnoId) {
            return createResponse(400, 'turnoId es requerido');
        }

        // Generate JWT token on server (can't run in browser)
        const token = generateTurnoToken(turnoId);
        const { origin } = new URL(request.url);
        const confirmLink = `${origin}/api/turnos/confirmar/${token}`;

        return createResponse(200, 'Link generado exitosamente', { confirmLink });
    } catch (error: any) {
        console.error('Error generando link de confirmación:', error);
        return createResponse(500, 'Error al generar link de confirmación');
    }
};
