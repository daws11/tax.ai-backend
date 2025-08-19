#!/usr/bin/env node

/**
 * Simple Test untuk Route Issues
 * 
 * Script ini digunakan untuk testing sederhana untuk mengidentifikasi masalah route
 */

import { fetch } from 'undici';

async function simpleTest() {
  console.log('🚀 Simple Route Test...\n');
  
  // Test 1: Check if backend is running
  console.log('1. Testing if backend is running...');
  try {
    const response = await fetch('http://localhost:5000/api/health');
    console.log('✅ Backend is running!');
    console.log('Status:', response.status);
  } catch (error) {
    console.log('❌ Backend is not running or not accessible');
    console.log('Error:', error.message);
    return;
  }
  
  // Test 2: Test verify-email route
  console.log('\n2. Testing verify-email route...');
  try {
    const testToken = 'test-token-' + Date.now();
    const response = await fetch(`http://localhost:5000/api/auth/verify-email?token=${testToken}`);
    console.log('Status:', response.status);
    
    if (response.status === 400) {
      console.log('✅ Backend verify-email route is working (correctly rejects invalid token)');
    } else {
      console.log('❌ Backend verify-email route issue');
    }
  } catch (error) {
    console.log('❌ Backend verify-email route failed');
    console.log('Error:', error.message);
  }
  
  // Test 3: Test frontend verify-email page
  console.log('\n3. Testing frontend verify-email page...');
  try {
    const response = await fetch('http://localhost:8080/verify-email');
    console.log('Status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Frontend verify-email page is accessible');
    } else {
      console.log('❌ Frontend verify-email page issue');
    }
  } catch (error) {
    console.log('❌ Frontend verify-email page failed');
    console.log('Error:', error.message);
  }
  
  // Test 4: Test frontend verify-email with token
  console.log('\n4. Testing frontend verify-email with token...');
  try {
    const testToken = 'test-token-' + Date.now();
    const response = await fetch(`http://localhost:8080/verify-email?token=${testToken}`);
    console.log('Status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Frontend verify-email with token is accessible');
    } else {
      console.log('❌ Frontend verify-email with token issue');
    }
  } catch (error) {
    console.log('❌ Frontend verify-email with token failed');
    console.log('Error:', error.message);
  }
  
  console.log('\n📝 Simple test complete.');
  console.log('\n💡 If backend is not running, start it with: pnpm dev');
  console.log('💡 If frontend is not running, start it with: cd ../tax-ai-wizard-web-70 && pnpm dev');
}

// Run test
simpleTest().catch(error => {
  console.error('❌ Test failed:', error);
}); 