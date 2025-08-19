import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

async function checkUserStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('Usage: node check-user-status.js <email>');
      console.log('Example: node check-user-status.js test@example.com');
      return;
    }

    console.log(`\nChecking status for email: ${email}\n`);

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
      console.log(`  - Updated: ${user.updatedAt}`);
      console.log(`  - Job Title: ${user.jobTitle}`);
      
      if (user.subscription) {
        console.log(`  - Subscription Type: ${user.subscription.type}`);
        console.log(`  - Subscription Status: ${user.subscription.status}`);
      }
      
      console.log('');
    });

    // Check if any user is verified
    const verifiedUsers = users.filter(user => user.emailVerified === true);
    if (verifiedUsers.length > 0) {
      console.log('⚠️  WARNING: Found verified users with this email!');
      console.log('This is why you get "Email Already Registered" error.');
    }

    // Check for temporary users
    const tempUsers = users.filter(user => user.name === 'Temporary User');
    if (tempUsers.length > 0) {
      console.log('📝 Found temporary users (these should be cleaned up)');
    }

  } catch (error) {
    console.error('Error during check:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkUserStatus(); 