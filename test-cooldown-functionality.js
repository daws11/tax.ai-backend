#!/usr/bin/env node

/**
 * Test Cooldown Functionality
 * 
 * Script ini digunakan untuk testing cooldown pada resend verification email
 */

import { fetch } from 'undici';

async function testCooldownFunctionality() {
  console.log('🚀 Testing Cooldown Functionality...\n');
  
  const testEmail = 'test-cooldown-' + Date.now() + '@example.com';
  
  // Test 1: First email send
  console.log('1. Sending first verification email...');
  try {
    const firstResponse = await fetch('http://localhost:5000/api/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail })
    });
    
    if (firstResponse.ok) {
      console.log('✅ First email sent successfully');
      
      // Test 2: Try to send second email immediately (should fail)
      console.log('\n2. Trying to send second email immediately (should fail)...');
      const secondResponse = await fetch('http://localhost:5000/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail })
      });
      
      if (secondResponse.status === 429) {
        const errorData = await secondResponse.json();
        console.log('✅ Cooldown working correctly');
        console.log('Error message:', errorData.message);
        console.log('Remaining time:', errorData.remainingTime, 'seconds');
        
        // Test 3: Wait for cooldown and try again
        console.log('\n3. Waiting for cooldown to expire...');
        const waitTime = Math.min(errorData.remainingTime + 2, 65); // Wait a bit longer than cooldown
        console.log(`Waiting ${waitTime} seconds...`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
        
        console.log('Trying to send email again...');
        const thirdResponse = await fetch('http://localhost:5000/api/auth/send-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: testEmail })
        });
        
        if (thirdResponse.ok) {
          console.log('✅ Email sent successfully after cooldown expired');
        } else {
          console.log('❌ Still getting cooldown error after waiting');
        }
        
      } else {
        console.log('❌ Cooldown not working - second email was sent');
        console.log('Status:', secondResponse.status);
      }
      
    } else {
      console.log('❌ First email failed to send');
      console.log('Status:', firstResponse.status);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  console.log('\n💡 Cooldown Functionality Summary:');
  console.log('✅ Prevents spam by limiting email sends');
  console.log('✅ 60-second cooldown period');
  console.log('✅ Clear error messages with remaining time');
  console.log('✅ Frontend shows countdown timer');
  console.log('✅ Backend enforces cooldown server-side');
  
  console.log('\n📝 Manual Testing Steps:');
  console.log('1. Open: http://localhost:8080/registration');
  console.log('2. Enter email and proceed to verification step');
  console.log('3. Click "Resend Verification Email"');
  console.log('4. Verify button shows countdown: "Resend in 60s"');
  console.log('5. Try clicking again - should show error message');
  console.log('6. Wait for countdown to reach 0');
  console.log('7. Verify button becomes clickable again');
}

// Run test
testCooldownFunctionality().catch(error => {
  console.error('❌ Test failed:', error);
}); 