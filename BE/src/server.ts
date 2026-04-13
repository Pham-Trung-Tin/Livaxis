import dotenv from 'dotenv';

import { connectDB } from './config/database';
import { env } from './config/env';
import app from './app';
import http from 'http';

dotenv.config();

const PORT = env.PORT;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Connect to database
connectDB().catch((error) => {
  console.error('Cannot start server because DB connection failed:', error);
  process.exit(1);
});
// Wrap Express với http.Server để Socket.io có thể dùng chung cổng
const server = http.createServer(app);


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
