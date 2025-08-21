import API from './api';
import io from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = null;
  }

  // Initialize socket connection
  initializeSocket() {
    if (!this.socket) {
      this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        autoConnect: false
      });
    }
    return this.socket;
  }

  // Connect socket
  connect() {
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  // Join chat room
  joinChat(chatId) {
    if (this.socket) {
      this.socket.emit('join-chat', chatId);
    }
  }

  // Leave chat room
  leaveChat(chatId) {
    if (this.socket) {
      this.socket.emit('leave-chat', chatId);
    }
  }

  // Send message via socket
  sendMessageSocket(chatId, message) {
    if (this.socket) {
      this.socket.emit('send-message', { chatId, message });
    }
  }

  // Send typing indicator
  sendTyping(chatId, isTyping, userName) {
    if (this.socket) {
      this.socket.emit('typing', { chatId, isTyping, userName });
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  // Listen for typing indicator
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  // Remove listeners
  removeListeners() {
    if (this.socket) {
      this.socket.off('new-message');
      this.socket.off('user-typing');
    }
  }

  // API methods
  async getChats(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/chats?${queryString}` : '/chats';
    const response = await API.get(url);
    return response.data;
  }

  async getChat(id) {
    const response = await API.get(`/chats/${id}`);
    return response.data;
  }

  async createChat(chatData) {
    const response = await API.post('/chats', chatData);
    return response.data;
  }

  async addMessage(chatId, messageData) {
    const response = await API.post(`/chats/${chatId}/messages`, messageData);
    return response.data;
  }

  async closeChat(id, reason) {
    const response = await API.put(`/chats/${id}/close`, { reason });
    return response.data;
  }

  async rateChat(id, rating, feedback) {
    const response = await API.put(`/chats/${id}/rate`, { rating, feedback });
    return response.data;
  }

  // Admin functions
  async getUnassignedChats() {
    const response = await API.get('/chats/admin/unassigned');
    return response.data;
  }

  async assignChat(id, agentId) {
    const response = await API.put(`/chats/${id}/assign`, { agentId });
    return response.data;
  }

  async resolveChat(id) {
    const response = await API.put(`/chats/${id}/resolve`);
    return response.data;
  }

  async getChatAnalytics() {
    const response = await API.get('/chats/admin/analytics');
    return response.data;
  }
}

export const chatService = new ChatService();