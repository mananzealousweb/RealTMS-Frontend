import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_BACKEND_PATH);
  }
  return socket;
};

export const getSocket = () => socket;
