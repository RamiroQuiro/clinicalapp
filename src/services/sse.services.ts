// services/sse.service.ts
import { manejarEventoSSE, recepcionStore } from '@/context/recepcion.store';

class SSEService {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private userId: string = 'anonimo';

  setUserId(newUserId: string) {
    this.userId = newUserId;
  }

  connect() {
    try {
      this.disconnect();

      console.log('🔌 Conectando SSE...');
      const url = `/api/events?userId=${this.userId}`;

      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('✅ Conexión SSE establecida');
        recepcionStore.setKey('sseConectado', true);
        this.reconnectAttempts = 0;
      };

      this.eventSource.addEventListener('turno-actualizado', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          manejarEventoSSE({
            type: 'turno-actualizado',
            data: data,
          });
        } catch (error) {
          console.error('❌ Error parsing turno-actualizado:', error);
        }
      });

      this.eventSource.addEventListener('turno-agendado', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          manejarEventoSSE({
            type: 'turno-agendado',
            data: data,
          });
        } catch (error) {
          console.error('❌ Error parsing turno-actualizado:', error);
        }
      });

      this.eventSource.addEventListener('turno-eliminado', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          manejarEventoSSE({
            type: 'turno-eliminado',
            data: data,
          });
        } catch (error) {
          console.error('❌ Error parsing turno-eliminado:', error);
        }
      });

      this.eventSource.onerror = error => {
        console.error('❌ Error en conexión SSE:', error);
        recepcionStore.setKey('sseConectado', false);
        this.handleReconnection();
      };
    } catch (error) {
      console.error('❌ Error al inicializar SSE:', error);
      recepcionStore.setKey('sseConectado', false);
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectDelay);
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      recepcionStore.setKey('sseConectado', false);
    }
  }

  isConnected(): boolean {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

export const sseService = new SSEService();
