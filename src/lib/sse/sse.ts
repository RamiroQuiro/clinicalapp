// lib/sse/sse.ts
export type SSEClient = {
  id: string; // ← NUEVO: ID único para cada conexión
  controller: ReadableStreamDefaultController;
  userId?: string;
  lastActivity: Date;
  isActive: boolean;
};

// Almacén de clientes conectados
const clients: SSEClient[] = [];

// Generar ID único para cada conexión
function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Agregar nuevo cliente SSE
 */
export function addClient(controller: ReadableStreamDefaultController, userId?: string): string {
  const clientId = generateClientId();

  // PRIMERO limpiar conexiones duplicadas o inactivas
  cleanupStaleClients();

  clients.push({
    id: clientId,
    controller,
    userId,
    lastActivity: new Date(),
    isActive: true,
  });

  console.log(
    `🔌 Nuevo cliente SSE [${clientId}] para usuario: ${userId}. Total: ${clients.length}`
  );

  return clientId;
}

/**
 * Remover cliente específico por controller
 */
export function removeClient(controller: ReadableStreamDefaultController): void {
  const index = clients.findIndex(client => client.controller === controller);
  if (index > -1) {
    const client = clients[index];
    console.log(`🔌 Removiendo cliente [${client.id}]`);
    clients.splice(index, 1);
    console.log(`📊 Clientes restantes: ${clients.length}`);
  }
}

/**
 * Remover cliente por ID
 */
export function removeClientById(clientId: string): void {
  const index = clients.findIndex(client => client.id === clientId);
  if (index > -1) {
    console.log(`🔌 Removiendo cliente por ID [${clientId}]`);
    clients.splice(index, 1);
    console.log(`📊 Clientes restantes: ${clients.length}`);
  }
}

/**
 * Verificar si un controller sigue activo
 */
function isControllerActive(controller: ReadableStreamDefaultController): boolean {
  try {
    // Intentar enviar un comentario vacío (es seguro)
    const encoder = new TextEncoder();
    controller.enqueue(encoder.encode(':ping\n\n')); // Comentario SSE, no afecta al cliente
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Emitir evento a TODOS los clientes ACTIVOS
 */
export function emitEvent(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  // LIMPIAR antes de emitir
  cleanupStaleClients();

  console.log(`📢 Emitiendo evento "${event}" a ${clients.length} clientes registrados`);

  let successCount = 0;
  let errorCount = 0;

  // Usar approach con for loop reverso para poder remover durante la iteración
  for (let i = clients.length - 1; i >= 0; i--) {
    const client = clients[i];

    // Verificar si el cliente está marcado como activo
    if (!client.isActive) {
      console.log(`⏭️  Saltando cliente inactivo [${client.id}]`);
      clients.splice(i, 1);
      continue;
    }

    // Verificar si el controller realmente está activo
    if (!isControllerActive(client.controller)) {
      console.log(`🔌 Controller inactivo [${client.id}], removiendo...`);
      client.isActive = false;
      clients.splice(i, 1);
      continue;
    }

    try {
      const encoder = new TextEncoder();
      client.controller.enqueue(encoder.encode(payload));
      client.lastActivity = new Date();
      successCount++;
      console.log(`✅ Evento enviado a [${client.id}]`);
    } catch (error) {
      console.error(`❌ Error enviando a [${client.id}]:`, error.message);
      client.isActive = false;
      clients.splice(i, 1);
      errorCount++;
    }
  }

  console.log(
    `📊 Resumen: ${successCount} éxitos, ${errorCount} errores, ${clients.length} clientes restantes`
  );
}

/**
 * Limpiar clientes inactivos o duplicados
 */
function cleanupStaleClients(): void {
  const now = new Date();
  const staleThreshold = 20 * 1000; // 20 segundos (más agresivo)

  const initialCount = clients.length;

  for (let i = clients.length - 1; i >= 0; i--) {
    const client = clients[i];
    const timeDiff = now.getTime() - client.lastActivity.getTime();

    // Verificar actividad
    const isStillActive = isControllerActive(client.controller);

    // Remover si:
    // 1. No está activo según la verificación, O
    // 2. No ha tenido actividad en 20 segundos, O
    // 3. Está marcado como inactivo
    if (!isStillActive || timeDiff > staleThreshold || !client.isActive) {
      console.log(
        `🧹 Limpiando cliente [${client.id}]: activo=${isStillActive}, tiempo=${timeDiff}ms, marcado=${client.isActive}`
      );

      try {
        client.controller.close();
      } catch (error) {
        // Ignorar errores al cerrar
      }

      clients.splice(i, 1);
    }
  }

  if (clients.length !== initialCount) {
    console.log(
      `🧹 Limpieza completada: ${initialCount - clients.length} removidos, ${clients.length} restantes`
    );
  }
}

/**
 * Obtener estadísticas REALES de conexiones
 */
export function getSSEStats() {
  cleanupStaleClients(); // Limpiar antes de mostrar stats

  const activeClients = clients.filter(c => c.isActive && isControllerActive(c.controller));

  return {
    totalRegistered: clients.length,
    trulyActive: activeClients.length,
    uniqueUsers: new Set(clients.map(c => c.userId)).size,
    clients: clients.map(c => ({
      id: c.id,
      userId: c.userId,
      isActive: c.isActive,
      controllerActive: isControllerActive(c.controller),
      lastActivity: c.lastActivity.toISOString(),
      ageSeconds: Math.round((Date.now() - c.lastActivity.getTime()) / 1000),
    })),
  };
}
