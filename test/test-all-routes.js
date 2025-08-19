import { fetch } from 'undici';

const BACKEND_URL = 'https://tax-ai-backend-dm7p.onrender.com';

async function testAllRoutes() {
  console.log('🧪 Testing All Routes');
  console.log('=====================');
  
  const routes = [
    { method: 'GET', path: '/api/auth/plans', description: 'Get plans' },
    { method: 'POST', path: '/api/auth/check-email', description: 'Check email', body: { email: 'test@example.com' } },
    { method: 'POST', path: '/api/auth/send-verification', description: 'Send verification', body: { email: 'test@example.com', name: 'Test User' } },
    { method: 'POST', path: '/api/auth/select-plan', description: 'Select plan', body: { subscriptionType: 'trial', email: 'test@example.com' } },
    { method: 'POST', path: '/api/auth/activate-trial-plan', description: 'Activate trial plan', body: { email: 'test@example.com', planName: 'trial' } },
    { method: 'POST', path: '/api/auth/send-welcome-email', description: 'Send welcome email', body: { email: 'test@example.com', name: 'Test User' } },
    { method: 'POST', path: '/api/auth/login', description: 'Login', body: { email: 'test@example.com', password: 'test123' } },
  ];
  
  for (const route of routes) {
    console.log(`\n${route.description} (${route.method} ${route.path})`);
    console.log('-'.repeat(50));
    
    try {
      const options = {
        method: route.method,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      if (route.body) {
        options.body = JSON.stringify(route.body);
      }
      
      const response = await fetch(`${BACKEND_URL}${route.path}`, options);
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

testAllRoutes();
