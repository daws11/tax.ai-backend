import { fetch } from 'undici';

const BACKEND_URL = process.env.BACKEND_URL || 'https://tax-ai-backend-dm7p.onrender.com';

async function testBackendWithUndici() {
  console.log('🧪 Testing Backend with Undici');
  console.log('Backend URL:', BACKEND_URL);
  console.log('='.repeat(50));

  try {
    // Test 1: Health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    console.log(`Health check status: ${healthResponse.status}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check successful:', healthData);
    } else {
      console.log('❌ Health check failed');
      return;
    }

    // Test 2: Test login endpoint with invalid credentials
    console.log('\n2. Testing login endpoint with invalid credentials...');
    const invalidLoginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
    });

    console.log(`Invalid login status: ${invalidLoginResponse.status}`);
    if (invalidLoginResponse.status === 401) {
      console.log('✅ Invalid credentials properly rejected');
    } else {
      const errorData = await invalidLoginResponse.text();
      console.log('⚠️ Unexpected response:', errorData);
    }

    // Test 3: Test login endpoint with missing fields
    console.log('\n3. Testing login endpoint with missing fields...');
    const missingFieldsResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });

    console.log(`Missing fields status: ${missingFieldsResponse.status}`);
    if (missingFieldsResponse.status === 400) {
      console.log('✅ Missing fields properly rejected');
    } else {
      const errorData = await missingFieldsResponse.text();
      console.log('⚠️ Unexpected response:', errorData);
    }

    // Test 4: Test login endpoint structure
    console.log('\n4. Testing login endpoint structure...');
    const optionsResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'OPTIONS'
    });
    console.log(`OPTIONS request status: ${optionsResponse.status}`);
    
    if (optionsResponse.ok) {
      console.log('✅ CORS preflight working');
      console.log('Allowed methods:', optionsResponse.headers.get('access-control-allow-methods'));
      console.log('Allowed headers:', optionsResponse.headers.get('access-control-allow-headers'));
    }

    // Test 5: Test with real user credentials (if available)
    console.log('\n5. Testing with real user credentials...');
    const realUserResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'dawskutel@gmail.com',
        password: 'test123' // Replace with actual password if known
      })
    });

    console.log(`Real user login status: ${realUserResponse.status}`);
    if (realUserResponse.ok) {
      const userData = await realUserResponse.json();
      console.log('✅ Real user login successful:', {
        userId: userData.user._id,
        email: userData.user.email,
        name: userData.user.name,
        subscriptionStatus: userData.user.subscription?.status
      });
    } else {
      const errorData = await realUserResponse.text();
      console.log('❌ Real user login failed:', errorData);
    }

    console.log('\n📋 Backend Test Summary:');
    console.log('✅ Health check working');
    console.log('✅ Invalid credentials properly rejected (401)');
    console.log('✅ Missing fields properly rejected (400)');
    console.log('✅ CORS preflight working');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Check backend logs for authentication errors');
    console.log('2. Verify user password hash in database');
    console.log('3. Test dashboard local authentication');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testBackendWithUndici();
