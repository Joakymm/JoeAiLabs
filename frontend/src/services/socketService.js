import { io } from 'socket.io-client';

let socket = null;

export function connectSocket(token) {
  if (socket?.connected) return socket;

  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const url = baseUrl ? baseUrl.replace('/api', '') : '';

  socket = io(url, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinConversation(conversationId) {
  socket?.emit('join-conversation', conversationId);
}

export function leaveConversation(conversationId) {
  socket?.emit('leave-conversation', conversationId);
}

export function sendTypingStart(conversationId) {
  socket?.emit('typing-start', { conversationId });
}

export function sendTypingStop(conversationId) {
  socket?.emit('typing-stop', { conversationId });
}
