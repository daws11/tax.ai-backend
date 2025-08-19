import { fetch } from 'undici';

const BACKEND_URL = 'https://tax-ai-backend-dm7p.onrender.com';

async function debugSelectPlan() {
  console.log('🔍 Debug Select Plan Endpoint');
  console.log('==============================');
  
  try {
    // Test 1: Health check to ensure backend is working
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    console.log('Health status:', healthResponse.status);
    
    // Test 2: Test the exact endpoint path
    console.log('\n2️⃣ Testing /api/auth/select-plan...');
    const response1 = await fetch(`${BACKEND_URL}/api/auth/select-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionType: 'trial',
        email: 'test@example.com'
      })
    });
    
    console.log('Response 1 status:', response1.status);
    const data1 = await response1.json();
    console.log('Response 1 data:', data1);
    
    // Test 3: Test with different method
    console.log('\n3️⃣ Testing with GET method...');
    const response2 = await fetch(`${BACKEND_URL}/api/auth/select-plan`);
    console.log('Response 2 status:', response2.status);
    
    // Test 4: Test with different path
    console.log('\n4️⃣ Testing /api/auth/select-plan/...');
    const response3 = await fetch(`${BACKEND_URL}/api/auth/select-plan/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionType: 'trial',
        email: 'test@example.com'
      })
    });
    
    console.log('Response 3 status:', response3.status);
    
    // Test 5: Test a different auth endpoint
    console.log('\n5️⃣ Testing /api/auth/send-verification...');
    const response4 = await fetch(`${BACKEND_URL}/api/auth/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User'
      })
    });
    
    console.log('Response 4 status:', response4.status);
    const data4 = await response4.json();
    console.log('Response 4 data:', data4);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugSelectPlan();
