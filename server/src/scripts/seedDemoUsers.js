// server/src/scripts/seedDemoUsers.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

async function upsertUser({ email, password, firstName, lastName, userType }) {
  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    const hashed = await bcrypt.hash(password, 10);
    user = await User.create({
      email,
      password: hashed,
      firstName,
      lastName,
      userType,
    });
    console.log(`Created demo user: ${email} (${userType})`);
    return user;
  }

  // Ensure user has correct type and password
  let changed = false;
  if (user.userType !== userType) {
    user.userType = userType;
    changed = true;
  }
  if (password) {
  user.password = await bcrypt.hash(password, 10);
  changed = true;
  }
  if (firstName && user.firstName !== firstName) {
    user.firstName = firstName;
    changed = true;
  }
  if (lastName && user.lastName !== lastName) {
    user.lastName = lastName;
    changed = true;
  }

  if (changed) {
    await user.save();
    console.log(`Updated demo user: ${email}`);
  } else {
    console.log(`Demo user already up-to-date: ${email}`);
  }

  return user;
}

async function run() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set. Please configure your database connection in environment variables.');
    }

    await connectDB();

    const demoUsers = [
      {
        email: 'business@demo.com',
        password: 'demo123',
        firstName: 'Demo',
        lastName: 'Business',
        userType: 'business',
      },
      {
        email: 'recipient@demo.com',
        password: 'demo123',
        firstName: 'Demo',
        lastName: 'Recipient',
        userType: 'recipient',
      },
      {
        email: 'driver@demo.com',
        password: 'demo123',
        firstName: 'Demo',
        lastName: 'Driver',
        userType: 'driver',
      },
    ];

    for (const u of demoUsers) {
      await upsertUser(u);
    }

    console.log('✅ Demo users seeded successfully');
  } catch (err) {
    console.error('❌ Seeding demo users failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

run();
