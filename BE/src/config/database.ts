import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: env.DB_NAME,
    });

    console.log('✅ MongoDB Atlas Connected Successfully');
    console.log(`📦 Database: ${env.DB_NAME}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};
