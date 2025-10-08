// ============================================================================
// SERVER - SOCKET SERVICE
// ============================================================================

// server/src/services/socket.service.js
export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user-specific room
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    // Handle food item posted
    socket.on('food-posted', (data) => {
      // Broadcast to all recipients in the area
      socket.broadcast.emit('new-food-available', data);
    });

    // Handle match notifications
    socket.on('match-created', (data) => {
      // Notify specific recipient
      socket.to(data.recipientId).emit('new-match', data);
    });

    // Handle real-time location updates for drivers
    socket.on('location-update', (data) => {
      socket.to(data.matchId).emit('driver-location', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};