import { Server } from 'socket.io';
import {createServer} from 'http'
const httpServer=createServer()

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods:['GET','POST'] // Permitir conexiones de cualquier origen (ajusta según sea necesario)
    },
  });

  // Configuración de eventos de Socket.IO
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('agregar-paciente', (paciente) => {
      console.log('Paciente agregado:', paciente);
      io.emit('lista-actualizada', paciente);
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  console.log('Socket.IO inicializado');

  
httpServer.listen(5000,()=>{
    console.log('server escuchando por el puerto 5000')
})