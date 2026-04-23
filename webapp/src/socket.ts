import { io, type Socket } from 'socket.io-client';

const ROOMS_URL = import.meta.env.VITE_API_URL_ROOMS ?? 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(ROOMS_URL);
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
