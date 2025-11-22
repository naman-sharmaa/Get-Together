import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ticketcharge_hub';

const connectDB = async () => {
  try {
    // Check if connection string has placeholder
    if (MONGODB_URI.includes('<db_password>')) {
      console.error('❌ MongoDB connection error: Please update MONGODB_URI in .env file');
      console.error('   Replace <db_password> with your actual MongoDB password');
      process.exit(1);
    }

    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (error.message.includes('authentication failed') || error.message.includes('bad auth')) {
      console.error('❌ MongoDB authentication failed!');
      console.error('   Please check:');
      console.error('   1. Your MongoDB password in .env file (MONGODB_URI)');
      console.error('   2. Your MongoDB username is correct');
      console.error('   3. Your IP address is whitelisted in MongoDB Atlas');
      console.error('   4. Your database user has the correct permissions');
    } else {
      console.error('❌ MongoDB connection error:', error.message);
    }
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

export default connectDB;
