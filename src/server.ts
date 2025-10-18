
import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/db';
import { initSocket } from './config/socket.config';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.info(`Server is running on port ${PORT}`);
      console.info(`Swagger docs available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
