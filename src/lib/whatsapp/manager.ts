// El gestor ahora solo sirve como puente o para mantener estados simples
// La logica pesada se movio a whatsapp-server.mjs

export class WhatsAppManager {
    /**
     * Verifica el estado de un cliente (ahora via DB o Servidor externo)
     */
    async getStatus(centroMedicoId: string) {
        return 'disconnected';
    }

    // Métodos vacíos para evitar errores de compilación si todavía se importan
    hasClient(id: string) { return false; }
    getClient(id: string) { return null; }
    registerClient(id: string, client: any) { }
    updateStatus(id: string, status: any, qr?: string) { }
    async removeClient(id: string) { }
}

export const whatsappManager = new WhatsAppManager();
