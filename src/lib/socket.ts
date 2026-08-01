'use client';
import { io, type Socket } from 'socket.io-client';
import { API_BASE, getToken } from './api';

export interface RealtimeNotification {
  id: number;
  user_id: number;
  loan_id?: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

let socket: Socket | null = null;
let currentToken: string | null = null;

export function connectNotifications(token: string | null): Socket | null {
  if (!token) {
    disconnectNotifications();
    return null;
  }
  if (socket && currentToken === token) return socket;
  disconnectNotifications();
  currentToken = token;
  socket = io(`${API_BASE}/notifications`, {
    transports: ['websocket'],
    auth: { token },
    reconnectionAttempts: Infinity,
    reconnectionDelay: 3000,
  });
  return socket;
}

export function subscribeToNewNotifications(
  callback: (notification: RealtimeNotification) => void,
): () => void {
  if (!socket) return () => {};
  socket.on('notification:new', callback);
  return () => {
    socket?.off('notification:new', callback);
  };
}

export function disconnectNotifications() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentToken = null;
}

export function refreshNotificationSocket() {
  connectNotifications(getToken());
}
