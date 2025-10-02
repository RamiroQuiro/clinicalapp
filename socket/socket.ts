// integrations/socket.ts
import type { AstroIntegration } from 'astro';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

export default function socketIntegration(): AstroIntegration {
  return {
    name: 'astro-socket',
    hooks: {
      'astro:server:setup': ({ server }) => {
        io = new SocketIOServer(server.httpServer, {
          cors: {
            origin: 'http://localhost:4322',
            methods: ['GET', 'POST'],
          },
        });

        io.on('connection', socket => {
          console.log('Cliente conectado:', socket.id);

          // ✅ AGREGAR ESTO: Escuchar el evento del frontend
          socket.on('cambiar-estado-turno', async data => {
            console.log('🔄 Evento cambiar-estado-turno recibido:', data);

            try {
              // Hacer fetch a tu endpoint
              const response = await fetch(
                `http://localhost:4322/api/turnos/${data.turnoId}/changeState`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                }
              );

              if (response.ok) {
                const result = await response.json();
                // El endpoint ya emitirá el evento, pero por si acaso:
                io.emit('turno-actualizado', result.data);
              }
            } catch (error) {
              console.error('❌ Error en socket cambiar-estado-turno:', error);
            }
          });

          socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
          });
        });

        console.log('Socket.IO inicializado en el mismo proceso de Astro ✅');

        // ✅ EXPORTAR CORRECTAMENTE
        (global as any).astroSocketIO = io;
      },
    },
  };
}

// ✅ EXPORTAR LA FUNCIÓN GETTER
export function getSocketIO(): SocketIOServer {
  return (global as any).astroSocketIO;
}
