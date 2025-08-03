import { fetch } from 'undici';

const PRODUCTION_BACKEND = 'https://tax-ai-backend-dm7p.onrender.com';
const PRODUCTION_FRONTEND = 'https://taxai.ae';

async function testProductionDeployment() {
  console.log('🚀 Production Deployment Test');
  console.log('='.repeat(50));

  const tests = [
    {
      name: 'Backend Health Check',
      test: async () => {
        const response = await fetch(`${PRODUCTION_BACKEND}/api/health`);
        const data = await response.json();
        return { success: response.ok, data };
      }
    },
    {
      name: 'Frontend Verify-Email Page',
      test: async () => {
        const response = await fetch(`${PRODUCTION_FRONTEND}/verify-email`);
        return { success: response.ok, status: response.status };
      }
    },
    {
      name: 'Backend Verify-Email Endpoint',
      test: async () => {
        const response = await fetch(`${PRODUCTION_BACKEND}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: 'test', email: 'test@example.com' })
        });
        const data = await response.json();
        return { success: response.status === 400, data }; // Should return 400 for invalid token
      }
    },
    {
      name: 'Email URL Format Test',
      test: async () => {
        const testUrl = `${PRODUCTION_FRONTEND}/verify-email?token=test123&email=test@example.com`;
        const response = await fetch(testUrl);
        return { success: response.ok, url: testUrl };
      }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      const result = await test.test();
      
      if (result.success) {
        console.log('✅ PASS:', result);
      } else {
        console.log('❌ FAIL:', result);
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }
  }

  console.log('\n📋 Summary:');
  console.log('1. Backend should be accessible');
  console.log('2. Frontend verify-email page should load');
  console.log('3. Backend verify-email endpoint should respond');
  console.log('4. Email URL format should work');
  
  console.log('\n🔧 If tests fail:');
  console.log('- Check Render.com environment variables');
  console.log('- Verify redirect rules in Render.com');
  console.log('- Check frontend build and deployment');
  console.log('- Monitor backend logs for errors');
}

// Run tests
testProductionDeployment(); 