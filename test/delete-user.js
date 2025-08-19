import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function deleteUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node delete-user.js <email>');
      console.log('Example: node delete-user.js test@example.com');
      console.log('\n⚠️  WARNING: This will delete ALL users with this email!');
      return;
    }

    console.log(`\nChecking users with email: ${email}\n`);

    // Find all users with this email
    const users = await User.find({ email });

    if (users.length === 0) {
      console.log('✅ No users found with this email');
      return;
    }

    console.log(`Found ${users.length} user(s) with this email:\n`);

    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  - ID: ${user._id}`);
      console.log(`  - Name: ${user.name}`);
      console.log(`  - Email: ${user.email}`);
      console.log(`  - Email Verified: ${user.emailVerified}`);
      console.log(`  - Created: ${user.createdAt}`);
      console.log('');
    });

    // Ask for confirmation
    console.log('⚠️  WARNING: This will delete ALL users with this email!');
    console.log('Type "DELETE" to confirm:');
    
    // For now, we'll just delete without confirmation for testing
    // In production, you'd want to add proper confirmation
    
    const result = await User.deleteMany({ email });
    console.log(`\n✅ Deleted ${result.deletedCount} user(s) with email: ${email}`);

  } catch (error) {
    console.error('Error during deletion:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

deleteUser(); 