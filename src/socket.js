// src/socket.js

export default function configureSocket(io, onlineUsers) {
  io.on('connection', (socket) => {
    console.log('🟢 User connected:', socket.id);

    socket.on('register', (userId) => {
      onlineUsers.set(userId, socket.id);
      console.log(`👤 User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      for (let [userId, sockId] of onlineUsers.entries()) {
        if (sockId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      console.log('🔴 User disconnected:', socket.id);
    });
  });
}
