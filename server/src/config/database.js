// server/src/config/database.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);

    // Create indexes for location-based queries
    mongoose.connection.db.collection('users').createIndex({ "profile.location": "2dsphere" });
    mongoose.connection.db.collection('fooditems').createIndex({ "location": "2dsphere" });
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    // Don't exit process, just log error
    console.log('⚠️  Running without database connection. Some features will be limited.');
  }
};

export default connectDB;