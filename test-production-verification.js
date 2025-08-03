import { fetch } from 'undici';

const PRODUCTION_URL = 'https://tax-ai-backend-dm7p.onrender.com';
const TEST_EMAIL = 'test@example.com';
const TEST_TOKEN = 'test-token-123';

async function testProductionEndpoints() {
  console.log('🧪 Testing Production Verification Endpoints');
  console.log('='.repeat(50));

  try {
    // Test 1: Health check
    console.log('\n1. Testing health check...');
    const healthResponse = await fetch(`${PRODUCTION_URL}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
    }

    // Test 2: Check if verify-email endpoint exists
    console.log('\n2. Testing verify-email endpoint...');
    const verifyResponse = await fetch(`${PRODUCTION_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: TEST_TOKEN,
        email: TEST_EMAIL
      })
    });
    
    console.log('Response status:', verifyResponse.status);
    const verifyData = await verifyResponse.json();
    console.log('Response data:', verifyData);

    // Test 3: Test frontend verify-email page
    console.log('\n3. Testing frontend verify-email page...');
    const frontendUrl = 'https://taxai.ae';
    const pageResponse = await fetch(`${frontendUrl}/verify-email`);
    console.log('Frontend page status:', pageResponse.status);

    // Test 4: Test with actual URL format
    console.log('\n4. Testing URL format from email...');
    const emailUrl = `${frontendUrl}/verify-email?token=${TEST_TOKEN}&email=${encodeURIComponent(TEST_EMAIL)}`;
    console.log('Email URL format:', emailUrl);
    
    const emailPageResponse = await fetch(emailUrl);
    console.log('Email page status:', emailPageResponse.status);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProductionEndpoints(); 