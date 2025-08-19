import { fetch } from 'undici';

const PRODUCTION_BACKEND = 'https://tax-ai-backend-dm7p.onrender.com';
const PRODUCTION_FRONTEND = 'https://taxai.ae';

async function quickTest() {
  console.log('🚀 Quick Production Test');
  console.log('='.repeat(40));

  try {
    // Test 1: Backend health
    console.log('\n1. Testing backend health...');
    const healthResponse = await fetch(`${PRODUCTION_BACKEND}/api/health`);
    console.log(`Status: ${healthResponse.status}`);
    if (healthResponse.status === 200) {
      const data = await healthResponse.json();
      console.log('✅ Backend is accessible');
      console.log('Data:', data);
    } else {
      console.log('❌ Backend health check failed');
    }

    // Test 2: Frontend page
    console.log('\n2. Testing frontend verify-email page...');
    const frontendResponse = await fetch(`${PRODUCTION_FRONTEND}/verify-email`);
    console.log(`Status: ${frontendResponse.status}`);
    if (frontendResponse.status === 200) {
      console.log('✅ Frontend page is accessible');
    } else {
      console.log('❌ Frontend page failed');
    }

    // Test 3: Backend verify endpoint
    console.log('\n3. Testing backend verify-email endpoint...');
    const verifyResponse = await fetch(`${PRODUCTION_BACKEND}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: 'test-token',
        email: 'test@example.com'
      })
    });
    console.log(`Status: ${verifyResponse.status}`);
    const verifyData = await verifyResponse.json();
    console.log('Response:', verifyData);

    console.log('\n📋 Summary:');
    console.log('✅ All tests completed');
    console.log('🔧 Check the status codes above');
    console.log('📧 Next: Deploy and test email verification flow');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
quickTest(); 