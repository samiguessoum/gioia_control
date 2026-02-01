import { io, Socket } from 'socket.io-client';

const SOCKET_HOST = import.meta.env.VITE_SOCKET_HOST as string | undefined;
const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? (SOCKET_HOST ? `https://${SOCKET_HOST}` : 'http://localhost:3000');

let socket: Socket | null = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false });
  }
  return socket;
}
