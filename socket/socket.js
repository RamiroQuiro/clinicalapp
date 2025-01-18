import { Server } from 'socket.io';
import { createServer } from 'http'
const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'] // Permitir conexiones de cualquier origen (ajusta según sea necesario)
  },
});

// Configuración de eventos de Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
// agregar paciente
  socket.on('agregar-paciente', async (paciente) => {
    console.log('Paciente agregado:', paciente);
    try {
      const response = await fetch(`http://localhost:4321/api/listaEspera/${paciente.userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paciente),
      })

      const data = await response.json()
      console.log(data)
      if (response.status === 200) {
        io.emit('lista-actualizada', data.data);
      }

    } catch (error) {
      console.log(error)

    }
  });

// eliminar paciente
  socket.on('eliminar-paciente', async (id) => {
    console.log('Paciente eliminado:', id);
    try {
      const response = await fetch(`http://localhost:4321/api/listaEspera/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      console.log(data)
      if (response.status === 200) {
        io.emit('lista-actualizada', data.data);
      }

    } catch (error) {
      console.log(error)

    }
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

console.log('Socket.IO inicializado');


httpServer.listen(5000, () => {
  console.log('server escuchando por el puerto 5000')
})