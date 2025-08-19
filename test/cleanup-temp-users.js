import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function cleanupTempUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all temporary users
    const tempUsers = await User.find({
      name: 'Temporary User',
      emailVerified: false
    });

    console.log(`Found ${tempUsers.length} temporary users:`);
    tempUsers.forEach(user => {
      console.log(`- ${user.email} (created: ${user.createdAt})`);
    });

    if (tempUsers.length > 0) {
      // Delete all temporary users
      const result = await User.deleteMany({
        name: 'Temporary User',
        emailVerified: false
      });

      console.log(`\nDeleted ${result.deletedCount} temporary users successfully`);
    } else {
      console.log('\nNo temporary users found to delete');
    }

    // Also clean up expired temporary users (older than 24 hours)
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const expiredResult = await User.deleteMany({
      name: 'Temporary User',
      emailVerified: false,
      createdAt: { $lt: cutoffDate }
    });

    if (expiredResult.deletedCount > 0) {
      console.log(`Also deleted ${expiredResult.deletedCount} expired temporary users`);
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanupTempUsers(); 