import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PRODUCTION_BACKEND = 'https://taxai-backend.onrender.com';
const PRODUCTION_FRONTEND = 'https://taxai.ae';

async function testWithCurl() {
  console.log('🧪 Testing Production with curl');
  console.log('='.repeat(50));

  const tests = [
    {
      name: 'Backend Health Check',
      command: `curl -s -o /dev/null -w "%{http_code}" ${PRODUCTION_BACKEND}/api/health`
    },
    {
      name: 'Frontend Verify-Email Page',
      command: `curl -s -o /dev/null -w "%{http_code}" ${PRODUCTION_FRONTEND}/verify-email`
    },
    {
      name: 'Backend Verify-Email Endpoint (POST)',
      command: `curl -s -X POST -H "Content-Type: application/json" -d '{"token":"test","email":"test@example.com"}' -w "%{http_code}" ${PRODUCTION_BACKEND}/api/auth/verify-email`
    }
  ];

  for (const test of tests) {
    try {
      console.log(`\n🧪 Testing: ${test.name}`);
      const { stdout, stderr } = await execAsync(test.command);
      
      const statusCode = parseInt(stdout.trim());
      if (statusCode === 200 || statusCode === 400) {
        console.log(`✅ PASS: Status ${statusCode}`);
      } else {
        console.log(`❌ FAIL: Status ${statusCode}`);
      }
      
      if (stderr) {
        console.log('⚠️  Warning:', stderr);
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }
  }

  console.log('\n📋 Manual Tests:');
  console.log('1. Open browser and go to:', `${PRODUCTION_FRONTEND}/verify-email`);
  console.log('2. Check if page loads correctly');
  console.log('3. Test with actual email URL format');
  console.log('4. Monitor backend logs in Render.com dashboard');
}

// Alternative: Simple fetch test if available
async function testWithFetch() {
  console.log('\n🧪 Testing with built-in fetch (if available)');
  
  try {
    // Test if fetch is available (Node.js 18+)
    if (typeof fetch !== 'undefined') {
      console.log('✅ Fetch is available');
      
      // Test backend health
      const healthResponse = await fetch(`${PRODUCTION_BACKEND}/api/health`);
      console.log('Backend health status:', healthResponse.status);
      
      if (healthResponse.ok) {
        const data = await healthResponse.json();
        console.log('Backend health data:', data);
      }
      
      // Test frontend page
      const frontendResponse = await fetch(`${PRODUCTION_FRONTEND}/verify-email`);
      console.log('Frontend page status:', frontendResponse.status);
      
    } else {
      console.log('❌ Fetch not available, using curl tests');
    }
  } catch (error) {
    console.log('❌ Fetch test failed:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testWithCurl();
  await testWithFetch();
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Deploy backend changes to Render.com');
  console.log('2. Check environment variables in Render.com dashboard');
  console.log('3. Test email verification flow manually');
  console.log('4. Monitor logs for debugging');
}

runAllTests(); 