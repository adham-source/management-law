
import http from 'http';
import app from './app';
import { env } from './config/env';
import { configureSocket } from './config/socket.config';
import jwt from 'jsonwebtoken';

const PORT = env.PORT;
const server = http.createServer(app);

// Configure Socket.IO
const io = configureSocket(server);

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token not provided'));
  }

  jwt.verify(token, env.ACCESS_TOKEN_SECRET, (err: any, decoded: any) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    // Attach user id to the socket object for later use
    socket.data.userId = decoded.id;
    next();
  });
});

// Handle new connections
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Join a room based on the user ID from the authenticated token
  const userId = socket.data.userId;
  if (userId) {
    socket.join(userId);
    console.log(`User ${userId} with socket ${socket.id} joined their room.`);
  }

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${env.NODE_ENV} mode`);
});
