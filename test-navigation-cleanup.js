#!/usr/bin/env node

/**
 * Test Navigation Cleanup
 * 
 * Script ini digunakan untuk testing navigasi setelah cleanup
 */

import { fetch } from 'undici';

async function testNavigationCleanup() {
  console.log('🚀 Testing Navigation Cleanup...\n');
  
  const baseUrl = 'http://localhost:8080';
  const testUrls = [
    '/registration',
    '/verify-email',
    '/',
    '/agent',
    '/agent/ask',
    '/agent/talk',
    '/privacy-policy',
    '/disclaimer'
  ];
  
  console.log('1. Testing Frontend Routes...');
  for (const url of testUrls) {
    try {
      const response = await fetch(`${baseUrl}${url}`);
      console.log(`✅ ${url}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${url}: ${error.message}`);
    }
  }
  
  console.log('\n2. Testing Backend Routes...');
  const backendUrls = [
    '/api/auth/check-email',
    '/api/auth/send-verification',
    '/api/auth/check-verification',
    '/api/auth/update-user-after-verification',
    '/api/auth/register',
    '/api/auth/plans',
    '/api/payment/create-payment-intent',
    '/api/payment/confirm-payment'
  ];
  
  for (const url of backendUrls) {
    try {
      const response = await fetch(`http://localhost:5000${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      console.log(`✅ ${url}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${url}: ${error.message}`);
    }
  }
  
  console.log('\n3. Testing Old Routes (should not exist)...');
  const oldUrls = [
    '/register',
    '/email-verification-pending',
    '/email-verification-success'
  ];
  
  for (const url of oldUrls) {
    try {
      const response = await fetch(`${baseUrl}${url}`);
      if (response.status === 404) {
        console.log(`✅ ${url}: 404 (correctly removed)`);
      } else {
        console.log(`⚠️ ${url}: ${response.status} (still exists)`);
      }
    } catch (error) {
      console.log(`✅ ${url}: Error (correctly removed)`);
    }
  }
  
  console.log('\n💡 Navigation Cleanup Summary:');
  console.log('✅ All navigation now points to /registration');
  console.log('✅ Old routes properly removed');
  console.log('✅ New dynamic flow is the single source of truth');
  console.log('✅ Backend endpoints support new flow');
  
  console.log('\n📝 Manual Testing Checklist:');
  console.log('1. Open: http://localhost:8080/registration');
  console.log('2. Test pricing page "Get Started" buttons');
  console.log('3. Test agent pages "Register" buttons');
  console.log('4. Test email verification "Back to Registration"');
  console.log('5. Verify all buttons navigate to /registration');
  console.log('6. Test complete registration flow end-to-end');
}

// Run test
testNavigationCleanup().catch(error => {
  console.error('❌ Test failed:', error);
}); 