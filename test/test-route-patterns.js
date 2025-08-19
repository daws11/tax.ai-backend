import { fetch } from 'undici';

const BACKEND_URL = 'https://tax-ai-backend-dm7p.onrender.com';

async function testRoutePatterns() {
  console.log('🧪 Testing Route Patterns');
  console.log('==========================');
  
  const testPaths = [
    '/api/auth/select-plan',
    '/api/auth/select-plan/',
    '/api/auth/select-plan/test',
    '/api/auth/select',
    '/api/auth/select-planning',
    '/api/auth/plan',
    '/api/auth/plan-selection',
  ];
  
  for (const path of testPaths) {
    console.log(`\nTesting: ${path}`);
    console.log('-'.repeat(40));
    
    try {
      const response = await fetch(`${BACKEND_URL}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionType: 'trial',
          email: 'test@example.com'
        })
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success:', data.message || 'OK');
      } else {
        const errorData = await response.json();
        console.log(`❌ Error: ${errorData.message}`);
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }
}

testRoutePatterns();
