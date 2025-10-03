// pages/api/events.ts
import { addClient, removeClient } from '@/lib/sse/sse';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const session = locals.session;
  const user = locals.user;

  if (!session || !user) {
    return new Response('No autorizado', { status: 401 });
  }

  const userId = user.id;
  console.log(`🎯 Nueva conexión SSE solicitada para usuario: ${userId}`);

  return new Response(
    new ReadableStream({
      start(controller) {
        // Agregar cliente
        const clientId = addClient(controller, userId);

        const encoder = new TextEncoder();
        const welcomeMsg = `event: conectado\ndata: ${JSON.stringify({
          message: 'Conectado al servidor de eventos',
          userId,
          clientId,
          timestamp: new Date().toISOString(),
        })}\n\n`;

        controller.enqueue(encoder.encode(welcomeMsg));

        // Manejar desconexión del cliente
        const handleDisconnect = () => {
          console.log(`🔌 Desconectando cliente [${clientId}] (signal abort)`);
          removeClient(controller);
        };

        // 1. Usar el abort signal (principal)
        request.signal.addEventListener('abort', handleDisconnect);

        // 2. Heartbeat para mantener la conexión y detectar caídas
        const heartbeat = setInterval(() => {
          try {
            const heartbeatMsg = `event: heartbeat\ndata: ${JSON.stringify({
              clientId,
              timestamp: new Date().toISOString(),
            })}\n\n`;
            controller.enqueue(encoder.encode(heartbeatMsg));
          } catch (error) {
            console.log(`💔 Heartbeat falló para [${clientId}], removiendo...`);
            clearInterval(heartbeat);
            removeClient(controller);
          }
        }, 15000); // Cada 15 segundos

        // Limpiar intervalo al desconectar
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
        });
      },

      // 4. También podemos usar el método cancel para detectar cierres
      cancel(reason) {
        console.log(`🔌 Stream cancelado para cliente:`, reason);
        // No necesitamos remover aquí porque el abort signal ya lo hará
      },
    }),
    {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'Content-Encoding': 'none',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
};
