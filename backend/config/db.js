import mongoose from 'mongoose';
import { env } from './env.js';

let mongodInstance = null;

export const connectDB = async (customUri = null) => {
  try {
    let uri = customUri || env.dbURL;

    // Support memory mode or fallback when local mongo is not present in dev
    if (uri === 'memory') {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      uri = mongodInstance.getUri();
      console.log(`[Database] Using in-memory MongoDB at ${uri}`);
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    console.log(`[Database] MongoDB connected successfully to ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // If not test environment, rethrow or handle
    if (process.env.NODE_ENV !== 'test') {
      throw error;
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
      mongodInstance = null;
    }
    console.log('[Database] Disconnected successfully');
  } catch (error) {
    console.error(`[Database Error] Disconnection error: ${error.message}`);
  }
};
