// context/sse.handlers.ts

export interface SSEEventHandler {
    (evento: { type: string; data: any }): void;
}

export interface SSEHandler {
    id: string;
    handler: SSEEventHandler;
    stores?: any[]; // Stores que necesita actualizar el estado de conexión
}

class SSEHandlerRegistry {
    private handlers: Map<string, SSEHandler[]> = new Map();

    // Registrar un handler para un tipo de evento
    registrar(eventType: string, handler: SSEHandler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType)!.push(handler);
        console.log(`📝 Handler registrado para evento: ${eventType} (${handler.id})`);
    }

    // Ejecutar todos los handlers de un tipo de evento
    ejecutar(eventType: string, evento: any) {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
            console.log(`🚀 Ejecutando ${handlers.length} handlers para evento: ${eventType}`);
            handlers.forEach(({ handler, id }) => {
                try {
                    handler(evento);
                } catch (error) {
                    console.error(`❌ Error en handler ${id}:`, error);
                }
            });
        }
    }

    // Obtener todos los stores registrados para manejar conexión
    obtenerStores(): any[] {
        const allStores = new Set<any>();
        this.handlers.forEach(handlers => {
            handlers.forEach(({ stores }) => {
                if (stores) {
                    stores.forEach(store => allStores.add(store));
                }
            });
        });
        return Array.from(allStores);
    }
}

// Exportamos la instancia única del registro
export const sseHandlerRegistry = new SSEHandlerRegistry();