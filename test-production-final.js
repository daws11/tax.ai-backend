import { fetch } from 'undici';

const PRODUCTION_BACKEND = 'https://tax-ai-backend-dm7p.onrender.com';
const PRODUCTION_FRONTEND = 'https://taxai.ae';

async function testWithBetterErrorHandling() {
  console.log('🧪 Final Production Test with Better Error Handling');
  console.log('='.repeat(60));

  const tests = [
    {
      name: 'Backend Health Check',
      url: `${PRODUCTION_BACKEND}/api/health`,
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Frontend Verify-Email Page',
      url: `${PRODUCTION_FRONTEND}/verify-email`,
      method: 'GET',
      expectedStatus: 200
    },
    {
      name: 'Backend Verify-Email Endpoint',
      url: `${PRODUCTION_BACKEND}/api/auth/verify-email`,
      method: 'POST',
      body: JSON.stringify({ token: 'test-token', email: 'test@example.com' }),
      expectedStatus: 400 // Should return 400 for invalid token
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      console.log(`URL: ${test.url}`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (test.body) {
        options.body = test.body;
      }

      const response = await fetch(test.url, options);
      console.log(`Status: ${response.status} (Expected: ${test.expectedStatus})`);

      if (response.status === test.expectedStatus) {
        console.log('✅ PASS: Status matches expected');
      } else {
        console.log('❌ FAIL: Status does not match expected');
      }

      // Try to parse JSON response
      try {
        const data = await response.text();
        if (data.trim()) {
          try {
            const jsonData = JSON.parse(data);
            console.log('Response data:', jsonData);
          } catch (parseError) {
            console.log('Response text (not JSON):', data.substring(0, 200));
          }
        }
      } catch (readError) {
        console.log('Could not read response body');
      }

    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }
  }

  console.log('\n📋 Summary:');
  console.log('✅ Backend health should be accessible');
  console.log('✅ Frontend verify-email page should load');
  console.log('✅ Backend verify-email endpoint should respond');
  console.log('✅ Email verification flow should work');

  console.log('\n🔧 Next Steps:');
  console.log('1. Deploy backend changes to Render.com');
  console.log('2. Test email verification flow manually');
  console.log('3. Monitor logs for debugging');
  console.log('4. Verify production flow end-to-end');
}

// Run the test
testWithBetterErrorHandling(); 