// lib/sse/sse.ts
export type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
  userId?: string;
  lastActivity: Date;
};

const clients = new Map<string, SSEClient>();
const encoder = new TextEncoder();
const heartbeatInterval = 15 * 1000; // 15 segundos
let heartbeatTimer: NodeJS.Timeout | null = null;

function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function startHeartbeat() {
  if (heartbeatTimer) return;
  console.log('❤️ Iniciando Heartbeat SSE...');

  heartbeatTimer = setInterval(() => {
    if (clients.size === 0) {
      // No hay clientes, no hacer nada
      return;
    }

    // console.log(`❤️ Enviando heartbeat a ${clients.size} clientes...`);
    const pingPayload = encoder.encode(':ping\n\n');

    for (const [id, client] of clients.entries()) {
      try {
        client.controller.enqueue(pingPayload);
        client.lastActivity = new Date();
      } catch (error) {
        console.log(`🔌 Cliente [${id}] no responde a heartbeat. Removiendo.`);
        // No es necesario llamar a client.controller.close(), el error en enqueue ya implica que está cerrado.
        clients.delete(id);
      }
    }
  }, heartbeatInterval);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    console.log('💔 Deteniendo Heartbeat SSE.');
  }
}

export function addClient(controller: ReadableStreamDefaultController, userId?: string): string {
  const clientId = generateClientId();
  clients.set(clientId, {
    id: clientId,
    controller,
    userId,
    lastActivity: new Date(),
  });

  console.log(
    `🔌 Nuevo cliente SSE [${clientId}] para usuario: ${userId}. Total: ${clients.size}`
  );

  // Iniciar el heartbeat si es el primer cliente
  if (clients.size === 1) {
    startHeartbeat();
  }

  return clientId;
}

export function removeClient(controller: ReadableStreamDefaultController): void {
  for (const [id, client] of clients.entries()) {
    if (client.controller === controller) {
      clients.delete(id);
      console.log(`🔌 Cliente [${id}] removido. Total: ${clients.size}`);
      break;
    }
  }

  // Detener el heartbeat si no quedan clientes
  if (clients.size === 0) {
    stopHeartbeat();
  }
}

export function emitEvent(event: string, data: unknown): void {
  const payload = encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  console.log(`📢 Emitiendo evento "${event}" a ${clients.size} clientes.`);

  let successCount = 0;
  let errorCount = 0;

  for (const [id, client] of clients.entries()) {
    try {
      client.controller.enqueue(payload);
      client.lastActivity = new Date();
      successCount++;
    } catch (error) {
      console.error(`❌ Error enviando a [${id}]:`, (error as Error).message);
      // El heartbeat se encargará de limpiar este cliente si la conexión está rota
      errorCount++;
    }
  }
  // console.log(`📊 Resumen de emisión: ${successCount} éxitos, ${errorCount} errores.`);
}

export function getSSEStats() {
  const now = Date.now();
  return {
    totalRegistered: clients.size,
    uniqueUsers: new Set(Array.from(clients.values()).map(c => c.userId)).size,
    heartbeatActive: !!heartbeatTimer,
    clients: Array.from(clients.values()).map(c => ({
      id: c.id,
      userId: c.userId,
      lastActivity: c.lastActivity.toISOString(),
      ageSeconds: Math.round((now - c.lastActivity.getTime()) / 1000),
    })),
  };
}
