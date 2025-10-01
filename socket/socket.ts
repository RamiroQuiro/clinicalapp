import type { AstroIntegration } from 'astro';
import { Server as SocketIOServer } from 'socket.io';

export let io: SocketIOServer;

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

          socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
          });
        });

        console.log('Socket.IO inicializado en el mismo proceso de Astro ✅');
      },
    },
  };
}
