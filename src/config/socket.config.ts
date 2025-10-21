
import { Server } from 'socket.io';
import http from 'http';
import { env } from './env';

let io: Server | null = null;

export const configureSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ['GET', 'POST'],
    },
  });
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
