// client/src/services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (!this.socket) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.isConnected = true;
        if (userId) {
          this.socket.emit('join', userId);
        }
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Food notifications
  onNewFoodAvailable(callback) {
    if (this.socket) {
      this.socket.on('new-food-available', callback);
    }
  }

  onNewMatch(callback) {
    if (this.socket) {
      this.socket.on('new-match', callback);
    }
  }

  onDeliveryUpdate(callback) {
    if (this.socket) {
      this.socket.on('delivery-update', callback);
    }
  }

  // Driver location updates
  emitLocationUpdate(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('location-update', data);
    }
  }

  onDriverLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('driver-location', callback);
    }
  }

  // Generic event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();