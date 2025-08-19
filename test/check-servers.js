#!/usr/bin/env node

/**
 * Check Servers
 * 
 * Script ini digunakan untuk mengecek apakah backend dan frontend server berjalan
 */

import { fetch } from 'undici';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkServers() {
  console.log('🔍 Checking Servers...\n');
  
  // Check if backend is running
  console.log('1. Checking backend server...');
  try {
    const { stdout } = await execAsync('netstat -an | findstr :5000');
    if (stdout.includes(':5000')) {
      console.log('✅ Backend server is running on port 5000');
    } else {
      console.log('❌ Backend server is not running on port 5000');
    }
  } catch (error) {
    console.log('❌ Backend server is not running on port 5000');
  }
  
  // Check if frontend is running
  console.log('\n2. Checking frontend server...');
  try {
    const { stdout } = await execAsync('netstat -an | findstr :8080');
    if (stdout.includes(':8080')) {
      console.log('✅ Frontend server is running on port 8080');
    } else {
      console.log('❌ Frontend server is not running on port 8080');
    }
  } catch (error) {
    console.log('❌ Frontend server is not running on port 8080');
  }
  
  // Test backend connection
  console.log('\n3. Testing backend connection...');
  try {
    const response = await fetch('http://localhost:5000/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connection successful');
      console.log('Response:', data);
    } else {
      console.log('❌ Backend connection failed');
      console.log('Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Backend connection failed');
    console.log('Error:', error.message);
  }
  
  // Test frontend connection
  console.log('\n4. Testing frontend connection...');
  try {
    const response = await fetch('http://localhost:8080/', {
      method: 'GET'
    });
    
    if (response.ok) {
      console.log('✅ Frontend connection successful');
      console.log('Status:', response.status);
    } else {
      console.log('❌ Frontend connection failed');
      console.log('Status:', response.status);
    }
  } catch (error) {
    console.log('❌ Frontend connection failed');
    console.log('Error:', error.message);
  }
  
  console.log('\n📝 Server check complete.');
  console.log('\n💡 If servers are not running:');
  console.log('Backend: pnpm dev');
  console.log('Frontend: cd ../tax-ai-wizard-web-70 && pnpm dev');
}

// Run check
checkServers().catch(error => {
  console.error('❌ Check failed:', error);
}); 