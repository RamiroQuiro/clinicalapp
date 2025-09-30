import { createServer } from 'http';
import { Server } from 'socket.io';
const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'], // Permitir conexiones de cualquier origen (ajusta según sea necesario)
  },
});

// Configuración de eventos de Socket.IO
io.on('connection', socket => {
  console.log('Cliente conectado:', socket.id);

  // --- EVENTO PARA ACTUALIZAR ESTADO DE TURNOS ---
  socket.on('cambiar-estado-turno', async data => {
    const { turnoId, ...body } = data;
    console.log(`Recibido cambio de estado para turno ${turnoId}:`, body);
    try {
      const response = await fetch(`http://localhost:4321/api/turno/${turnoId}/changeState`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const responseData = await response.json();
      if (response.ok) {
        // Emitir a TODOS los clientes que un turno fue actualizado
        console.log('Emitiendo evento: turno-actualizado');
        io.emit('turno-actualizado', responseData.data);
      } else {
        console.error('Error en la API al cambiar estado:', responseData);
      }
    } catch (error) {
      console.error('Error en fetch a changeState:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

console.log('Socket.IO inicializado y limpio.');

httpServer.listen(5000, () => {
  console.log('server escuchando por el puerto 5000');
});
