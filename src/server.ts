
import http from 'http';
import app from './app';
import { env } from './config/env';
import { configureSocket } from './config/socket.config';
import connectDB from './config/db';
import jwt from 'jsonwebtoken';
import logger from './utils/logger';

const PORT = env.PORT;
const server = http.createServer(app);

// Main startup function
const startServer = async () => {
  try {
    // 1. Connect to the database first
    await connectDB();

    // 2. Configure and start Socket.IO
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
        socket.data.userId = decoded.id;
        next();
      });
    });

    // Handle new connections
    io.on('connection', (socket) => {
      logger.info(`New client connected: ${socket.id}`);
      const userId = socket.data.userId;
      if (userId) {
        socket.join(userId);
        logger.info(`User ${userId} with socket ${socket.id} joined their room.`);
      }
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });

    // 3. Start the HTTP server
    server.listen(PORT, () => {
      logger.info(`✅ Server is running on port ${PORT} in ${env.NODE_ENV} mode.`);
      logger.info(`🚀 API Base URL: ${env.API_BASE_URL}`);
      logger.info(`📄 Swagger Docs available at: ${env.API_BASE_URL}/api-docs`);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
