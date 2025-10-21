declare global {
  // Hacemos esto para que el estado de SSE persista durante el Hot-Reloading en desarrollo
  var sseClients: Map<string, SSEClient> | undefined;
  var sseHeartbeatTimer: NodeJS.Timeout | null | undefined;
}

// lib/sse/sse.ts
export type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
  userId?: string;
  centroMedicoId?: string;
  lastActivity: Date;
};

const clients = (globalThis.sseClients = globalThis.sseClients || new Map<string, SSEClient>());
const encoder = new TextEncoder();
const heartbeatInterval = 15 * 1000;

function getHeartbeatTimer(): NodeJS.Timeout | null | undefined {
  return globalThis.sseHeartbeatTimer;
}

function setHeartbeatTimer(timer: NodeJS.Timeout | null) {
  globalThis.sseHeartbeatTimer = timer;
}

function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function startHeartbeat() {
  if (getHeartbeatTimer()) return;
  console.log('❤️ Iniciando Heartbeat SSE...');

  const timer = setInterval(() => {
    if (clients.size === 0) {
      return;
    }

    const pingPayload = encoder.encode(':ping\n\n');

    for (const [id, client] of clients.entries()) {
      try {
        client.controller.enqueue(pingPayload);
        client.lastActivity = new Date();
      } catch (error) {
        console.log(`🔌 Cliente [${id}] no responde a heartbeat. Removiendo.`);
        clients.delete(id);
      }
    }
  }, heartbeatInterval);
  setHeartbeatTimer(timer);
}

function stopHeartbeat() {
  const timer = getHeartbeatTimer();
  if (timer) {
    clearInterval(timer);
    setHeartbeatTimer(null);
    console.log('💔 Deteniendo Heartbeat SSE.');
  }
}

export function addClient(
  controller: ReadableStreamDefaultController,
  userId?: string,
  centroMedicoId?: string
): string {
  const clientId = generateClientId();
  clients.set(clientId, {
    id: clientId,
    controller,
    userId,
    centroMedicoId,
    lastActivity: new Date(),
  });

  console.log(
    `🔌 Nuevo cliente SSE [${clientId}] para usuario: ${userId} en centro: ${centroMedicoId}. Total: ${clients.size}`
  );

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

  if (clients.size === 0) {
    stopHeartbeat();
  }
}
export function emitEvent(event: string, data: unknown, opts?: { centroMedicoId?: string, userId?: string }): void {
  const payload = encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  console.log(`📢 Emitiendo evento "${event}" a ${clients.size} clientes.`);

  let successCount = 0;
  let errorCount = 0;
  const clientesAEliminar: string[] = [];

  for (const [id, client] of clients.entries()) {
    // Filtrado condicional
    if (opts?.centroMedicoId && client.centroMedicoId !== opts.centroMedicoId) continue;
    if (opts?.userId && client.userId !== opts.userId) continue;

    try {
      client.controller.enqueue(payload);
      client.lastActivity = new Date();
    } catch {
      clientesAEliminar.push(id);
    }
  }

  // 🔥 Limpiar clientes que rompieron el stream
  for (const id of clientesAEliminar) {
    clients.delete(id);
    console.log(`🧹 Cliente [${id}] eliminado tras error de envío.`);
  }

  if (clients.size === 0) stopHeartbeat();
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
