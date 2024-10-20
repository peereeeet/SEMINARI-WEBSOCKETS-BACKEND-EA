import { Server } from 'socket.io';
import { IChat } from './model'; // Asegúrate de que la ruta sea correcta para importar la interfaz
import Chat from './schema'; // Importa el modelo para poder guardar en la base de datos

const connectedUser = new Set();

const socketService = (io: Server) => {
    io.on('connection', (socket) => {
        console.log('Connected successfully', socket.id);
        socket.join("some room");
        connectedUser.add(socket.id);
        io.to("some room").emit('connected-user', connectedUser.size);
    
        socket.on('disconnect', () => {
          console.log('Disconnected successfully', socket.id);
          connectedUser.delete(socket.id);
          io.to("some room").emit('connected-user', connectedUser.size);
        });
    
        socket.on('manual-disconnect', () => {
          console.log('Manual disconnect requested', socket.id);
          socket.disconnect();
        });
    
        socket.on('sendMessage', async (data) => {
          const { user, message } = data;
      
          const newMessage: IChat = new Chat({
              user: user,
              message: message,
              date: new Date()
          });
          try {
              await newMessage.save();
              io.to("some room").emit('message-receive', {
                  user: newMessage.user,
                  message: newMessage.message,
                  date: newMessage.date
              });
          } catch (error) {
              console.error('Error al guardar el mensaje:', error);
          }
      });
    });
};

export default socketService;