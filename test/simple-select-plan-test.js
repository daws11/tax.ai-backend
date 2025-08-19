import { fetch } from 'undici';

const BACKEND_URL = 'https://tax-ai-backend-dm7p.onrender.com';

async function testSelectPlan() {
  console.log('🧪 Simple Select Plan Test');
  console.log('==========================');
  
  try {
    // Test with a simple request
    const response = await fetch(`${BACKEND_URL}/api/auth/select-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionType: 'trial',
        email: 'test@example.com'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success response:', data);
    } else {
      const errorData = await response.json();
      console.log('❌ Error response:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testSelectPlan();
