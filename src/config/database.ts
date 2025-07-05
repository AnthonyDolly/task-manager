import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async (mongoUri: string) => {
  try {
    await mongoose.connect(mongoUri);
    logger.info('✅ MongoDB connected');
  } catch (error) {
    logger.error(`❌ MongoDB connection error: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB; 