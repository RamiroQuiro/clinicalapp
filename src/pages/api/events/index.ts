import type { APIRoute } from 'astro';
import { addClient, removeClient } from '../../../lib/sse/sse';

const encoder = new TextEncoder();

export const GET: APIRoute = async ({ request, locals }) => {
  // 1. Autenticación (¡Muy importante!)
  const { session, user } = locals;
  if (!session || !user) {
    return new Response('No autorizado. Se requiere iniciar sesión.', { status: 401 });
  }
  const userId = user.id;
  const centroMedicoId = user.centroMedicoId;

  console.log(`[API /events/index] Iniciando conexión SSE para usuario ${userId} en centro ${centroMedicoId}`);

  // 2. Creación del Stream
  let controller: ReadableStreamDefaultController;
  let clientId: string;
  let heartbeatInterval: NodeJS.Timeout | null = null;

  const body = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
      
      // --- CONEXIÓN ---
      // Se añade el controller al pool de clientes gestionado por sse.ts
      // que se encargará de los heartbeats y la limpieza.
      clientId = addClient(controller, user.id, user.centroMedicoId);
      console.log(`[API /events/index] Cliente SSE conectado [${clientId}] para usuario ${user.id} en centro ${user.centroMedicoId}`);

      // Heartbeat para mantener la conexión activa
      let isActive = true;
      heartbeatInterval = setInterval(() => {
        try {
          if (!isActive) {
            if (heartbeatInterval) clearInterval(heartbeatInterval);
            return;
          }

          // Enviar ping para mantener conexión
          try {
            controller.enqueue(encoder.encode(':ping\n\n'));
          } catch (error) {
            console.log(`[API /events/index] Cliente [${clientId}] desconectado (error en ping)`);
            isActive = false;
            removeClient(controller);
            if (heartbeatInterval) clearInterval(heartbeatInterval);
          }
        } catch (error) {
          console.log(`[API /events/index] Error verificando cliente [${clientId}]:`, error);
          isActive = false;
          if (heartbeatInterval) clearInterval(heartbeatInterval);
        }
      }, 15000); // Heartbeat cada 15 segundos

      // --- DESCONEXIÓN ---
      // Cuando el cliente cierra la pestaña o se aborta la petición,
      // el 'abort signal' se dispara y podemos limpiar el cliente.
      request.signal.addEventListener('abort', () => {
        console.log(`[API /events/index] Cliente SSE [${clientId}] desconectado por abort signal.`);
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        removeClient(controller);
      });
    },
    cancel() {
      // Se llama si el stream se cancela por otras razones.
      console.log(`[API /events/index] Stream cancelado. Cliente SSE [${clientId}] removido.`);
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      removeClient(controller);
    },
  });

  // 3. Respuesta SSE
  return new Response(body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Accel-Buffering': 'no', // Deshabilitar buffering en Nginx si está presente
    },
  });
};
