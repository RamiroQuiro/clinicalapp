import type { APIRoute } from 'astro';
import { addClient, removeClient } from '../../../lib/sse/sse';

export const GET: APIRoute = async ({ request, locals }) => {
  // 1. Autenticación (¡Muy importante!)
  const { session, user } = locals;
  if (!session || !user) {
    return new Response('No autorizado. Se requiere iniciar sesión.', { status: 401 });
  }
  const userId = user.id;

  // 2. Creación del Stream
  const body = new ReadableStream({
    start(controller) {
      // --- CONEXIÓN ---
      // Se añade el controller al pool de clientes gestionado por sse.ts
      // que se encargará de los heartbeats y la limpieza.
      const clientId = addClient(controller, userId);
      console.log(`[API] Cliente SSE conectado [${clientId}] para usuario ${userId}`);

      // --- DESCONEXIÓN ---
      // Cuando el cliente cierra la pestaña o se aborta la petición,
      // el 'abort signal' se dispara y podemos limpiar el cliente.
      request.signal.addEventListener('abort', () => {
        removeClient(controller);
        console.log(`[API] Cliente SSE desconectado [${clientId}] por abort signal.`);
      });
    },
    cancel(controller) {
      // Opcional: Se puede llamar si el stream se cancela por otras razones.
      removeClient(controller);
      console.log('[API] Stream cancelado. Cliente SSE removido.');
    },
  });

  // 3. Respuesta SSE
  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
      // No es necesario 'Access-Control-Allow-Origin' si la API y el cliente están en el mismo dominio.
    },
  });
};
