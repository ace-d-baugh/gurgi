import mongoose from 'mongoose';

// Debug: Show what URI we're using
console.log('Connecting to MongoDB with URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'NOT SET');

const connectDB = async (): Promise<void> => {
 try {
 const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gurgi');
 console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
 } catch (error) {
 console.error(`❌ MongoDB Connection Error: ${(error as Error).message}`);
 throw error;
 }
};

export default connectDB;
