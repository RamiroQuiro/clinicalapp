import { addClient, removeClient } from '@/lib/sse/sse';
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

    const stream = new ReadableStream({
        start(ctrl) {
            controller = ctrl;
            clientId = addClient(
                controller,
                undefined, // No userId para portal público
                centroMedicoId // Filtrar por centro médico específico
            );

            console.log(`📡 Cliente SSE [${clientId}] conectado al portal público del centro: ${centroMedicoId}`);
            let isActive = true;

            const interval = setInterval(() => {
                try {
                    // Verificar si el controller está activo
                    if (!isActive) {
                        clearInterval(interval);
                        return;
                    }

                    // Intentar enviar un ping para verificar conexión
                    try {
                        controller.enqueue(encoder.encode(':ping\n\n'));
                    } catch (error) {
                        isActive = false;
                        removeClient(controller);
                        console.log(`🔌 Cliente SSE [${clientId}] desconectado del portal público`);
                    }
                } catch (error) {
                    console.log(`Error verificando cliente [${clientId}]:`, error);
                    isActive = false;
                }
            }, 5000);
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
        },
    });
};
