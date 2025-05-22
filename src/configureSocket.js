export default function configureSocket(io, onlineUsers) {
  io.on('connection', (socket) => {
    console.log('🟢 New socket connected:', socket.id);

    socket.on('user-connected', (userId) => {
      onlineUsers.set(userId, socket.id);
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log('🔴 Socket disconnected:', socket.id);
    });
  });
}
