// Socket.io handlers for real-time communication
const socketIO = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // User joins their personal room
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined room`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = socketIO;
