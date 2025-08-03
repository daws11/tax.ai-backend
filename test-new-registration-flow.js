#!/usr/bin/env node

/**
 * Test New Registration Flow
 * 
 * Script ini digunakan untuk testing flow registrasi baru yang dinamis
 */

import { fetch } from 'undici';

async function testNewRegistrationFlow() {
  console.log('🚀 Testing New Registration Flow...\n');
  
  // Test 1: Check email availability
  console.log('1. Checking email availability...');
  try {
    const testEmail = 'test-' + Date.now() + '@example.com';
    
    const checkEmailResponse = await fetch('http://localhost:5000/api/auth/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail })
    });
    
    if (checkEmailResponse.ok) {
      console.log('✅ Email is available');
      
      // Test 2: Send verification email
      console.log('\n2. Sending verification email...');
      const sendVerificationResponse = await fetch('http://localhost:5000/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmail })
      });
      
      if (sendVerificationResponse.ok) {
        console.log('✅ Verification email sent successfully');
        
        // Test 3: Get verification token
        console.log('\n3. Getting verification token...');
        const userResponse = await fetch(`http://localhost:5000/api/auth/profile`, {
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const verificationToken = userData.user?.emailVerificationToken;
          
          if (verificationToken) {
            console.log('✅ Verification token found');
            console.log('Token:', verificationToken);
            
            // Test 4: Verify email (simulates clicking link in email)
            console.log('\n4. Verifying email (simulates clicking link in email)...');
            const verifyResponse = await fetch(`http://localhost:5000/api/auth/verify-email?token=${verificationToken}`);
            
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              console.log('✅ Email verification successful!');
              console.log('Message:', verifyData.message);
              
              // Test 5: Check verification status
              console.log('\n5. Checking verification status...');
              const checkVerificationResponse = await fetch('http://localhost:5000/api/auth/check-verification', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: testEmail })
              });
              
              if (checkVerificationResponse.ok) {
                const checkData = await checkVerificationResponse.json();
                if (checkData.verified) {
                  console.log('✅ Verification status confirmed');
                  console.log('User ID:', checkData.userId);
                  console.log('Token:', checkData.token);
                  
                  // Test 6: Update user with registration data
                  console.log('\n6. Updating user with registration data...');
                  const updateResponse = await fetch('http://localhost:5000/api/auth/update-user-after-verification', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${checkData.token}`
                    },
                    body: JSON.stringify({
                      firstName: 'John',
                      lastName: 'Doe',
                      role: 'Developer',
                      password: 'testpassword123'
                    })
                  });
                  
                  if (updateResponse.ok) {
                    const updateData = await updateResponse.json();
                    console.log('✅ User updated successfully');
                    console.log('User:', updateData.user);
                    
                    // Test 7: Check frontend pages
                    console.log('\n7. Testing frontend pages...');
                    
                    // Check new registration flow page
                    const registrationResponse = await fetch('http://localhost:8080/registration');
                    console.log('Registration flow page status:', registrationResponse.status);
                    
                    // Check verification page
                    const verifyPageResponse = await fetch(`http://localhost:8080/verify-email?token=${verificationToken}`);
                    console.log('Verification page status:', verifyPageResponse.status);
                    
                    console.log('\n💡 Expected New Registration Flow:');
                    console.log('1. User enters email → /registration (email-input step)');
                    console.log('2. Email verification sent → /registration (email-verification step)');
                    console.log('3. User clicks email link → verification successful');
                    console.log('4. User fills personal info → /registration (personal-info step)');
                    console.log('5. User selects plan → /registration (plan-selection step)');
                    console.log('6. For paid plans → /registration (payment step)');
                    console.log('7. For trial plans → /registration (success step)');
                    console.log('8. Success dialog shows account details');
                    
                  } else {
                    const updateError = await updateResponse.json();
                    console.log('❌ User update failed:');
                    console.log('Error:', updateError.message);
                  }
                  
                } else {
                  console.log('❌ Verification not confirmed');
                }
              } else {
                console.log('❌ Could not check verification status');
              }
              
            } else {
              const verifyData = await verifyResponse.json();
              console.log('❌ Email verification failed:');
              console.log('Error:', verifyData.message);
            }
          } else {
            console.log('❌ No verification token found');
          }
        } else {
          console.log('❌ Could not get user profile');
        }
        
      } else {
        const verificationError = await sendVerificationResponse.json();
        console.log('❌ Send verification failed:');
        console.log('Error:', verificationError.message);
      }
      
    } else {
      const errorData = await checkEmailResponse.json();
      console.log('❌ Email check failed:');
      console.log('Error:', errorData.message);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
  
  console.log('\n📝 New registration flow test complete.');
  console.log('\n💡 Manual Testing Steps:');
  console.log('1. Open: http://localhost:8080/registration');
  console.log('2. Enter work email address');
  console.log('3. Check email and click verification link');
  console.log('4. Fill personal information (name, role, password)');
  console.log('5. Select a plan (trial or paid)');
  console.log('6. For paid plans: complete payment');
  console.log('7. For trial plans: see success dialog');
  console.log('8. Verify account details are displayed correctly');
}

// Run test
testNewRegistrationFlow().catch(error => {
  console.error('❌ Test failed:', error);
}); 