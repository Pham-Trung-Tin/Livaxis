import dotenv from 'dotenv';

import { connectDB } from './config/database';
import app from './app';
import http from 'http';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Connect to database
connectDB();
// Wrap Express với http.Server để Socket.io có thể dùng chung cổng
const server = http.createServer(app);


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
