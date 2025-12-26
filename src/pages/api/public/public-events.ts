import { addClient, removeClient } from '@/lib/sse/sse';
import { logger } from '@/utils/logger';
import type { APIRoute } from 'astro';

const encoder = new TextEncoder();

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.search);

    // Obtener centroMedicoId de los parámetros (viene del portal del paciente)
    const centroMedicoId = searchParams.get('centroMedicoId');

    if (!centroMedicoId) {
        return new Response('centroMedicoId es requerido', { status: 400 });
    }

    // Para el portal del paciente, filtrar eventos solo por centroMedicoId
    // El paciente solo debe recibir eventos de su centro médico específico
    let controller: ReadableStreamDefaultController;
    let clientId: string;
    let heartbeatInterval: NodeJS.Timeout | null = null;

    const stream = new ReadableStream({
        start(ctrl) {
            controller = ctrl;
            clientId = addClient(
                controller,
                undefined, // No userId para portal público
                centroMedicoId // Filtrar por centro médico específico
            );

            logger.log(`📡 Cliente SSE [${clientId}] conectado al portal público del centro: ${centroMedicoId}`);
            let isActive = true;

            // Heartbeat más frecuente para mantener conexión en móviles
            heartbeatInterval = setInterval(() => {
                try {
                    // Verificar si el controller está activo
                    if (!isActive) {
                        if (heartbeatInterval) clearInterval(heartbeatInterval);
                        return;
                    }

                    // Intentar enviar un ping para verificar conexión
                    try {
                        controller.enqueue(encoder.encode(':ping\n\n'));
                    } catch (error) {
                        logger.log(`🔌 Cliente SSE [${clientId}] desconectado del portal público (error en ping)`);
                        isActive = false;
                        removeClient(controller);
                        if (heartbeatInterval) clearInterval(heartbeatInterval);
                    }
                } catch (error) {
                    logger.error(`Error verificando cliente [${clientId}]:`, error);
                    isActive = false;
                    if (heartbeatInterval) clearInterval(heartbeatInterval);
                }
            }, 30000); // 30 segundos para móviles (más largo para ahorrar batería)
        },
        cancel() {
            // Limpiar cuando el stream se cancela
            logger.log(`🔌 Stream SSE [${clientId}] cancelado para portal público`);
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
            }
            removeClient(controller);
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
            'X-Accel-Buffering': 'no', // Deshabilitar buffering en Nginx si está presente
        },
    });
};
