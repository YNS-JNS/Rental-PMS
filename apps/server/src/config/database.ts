import mongoose from 'mongoose';
import { env } from './env'; // Import validated env vars

/**
 * Establishes connection to the MongoDB database.
 * Retries are handled by the app restart policy (Docker/PM2) in production,
 * but here we exit process on failure to prevent running in unstable state.
 */
export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI);

    console.log(`\n🍃 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database Name: ${conn.connection.name}\n`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    // Exit process with failure
    process.exit(1);
  }
};
