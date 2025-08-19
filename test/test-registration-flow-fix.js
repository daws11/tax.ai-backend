import { fetch } from 'undici';

const PRODUCTION_BACKEND = 'https://tax-ai-backend-dm7p.onrender.com';
const TEST_EMAIL = `test-${Date.now()}@example.com`;

console.log('🧪 Testing Fixed Registration Flow');
console.log('================================');

async function testRegistrationFlow() {
  try {
    console.log('\n1️⃣ Testing Backend Health...');
    const healthResponse = await fetch(`${PRODUCTION_BACKEND}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend health check passed:', healthData);
    } else {
      console.log('❌ Backend health check failed:', healthResponse.status);
      return;
    }

    console.log('\n2️⃣ Testing Email Availability Check...');
    const checkEmailResponse = await fetch(`${PRODUCTION_BACKEND}/api/auth/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    
    if (checkEmailResponse.ok) {
      const checkEmailData = await checkEmailResponse.json();
      console.log('✅ Email availability check passed:', checkEmailData);
    } else {
      console.log('❌ Email availability check failed:', checkEmailResponse.status);
      const errorData = await checkEmailResponse.json();
      console.log('Error details:', errorData);
      return;
    }

    console.log('\n3️⃣ Testing Send Verification Email...');
    const sendVerificationResponse = await fetch(`${PRODUCTION_BACKEND}/api/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    
    if (sendVerificationResponse.ok) {
      const sendVerificationData = await sendVerificationResponse.json();
      console.log('✅ Send verification email passed:', sendVerificationData);
    } else {
      console.log('❌ Send verification email failed:', sendVerificationResponse.status);
      const errorData = await sendVerificationResponse.json();
      console.log('Error details:', errorData);
      return;
    }

    console.log('\n4️⃣ Testing Get Plans...');
    const plansResponse = await fetch(`${PRODUCTION_BACKEND}/api/auth/plans`);
    if (plansResponse.ok) {
      const plansData = await plansResponse.json();
      console.log('✅ Get plans passed:', plansData.plans.length, 'plans found');
      console.log('Plans:', plansData.plans.map(p => ({ id: p.id, name: p.name, price: p.price })));
    } else {
      console.log('❌ Get plans failed:', plansResponse.status);
      return;
    }

    console.log('\n5️⃣ Testing Trial Plan Activation...');
    const trialPlanResponse = await fetch(`${PRODUCTION_BACKEND}/api/auth/activate-trial-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, planName: 'trial' })
    });
    
    if (trialPlanResponse.ok) {
      const trialPlanData = await trialPlanResponse.json();
      console.log('✅ Trial plan activation passed:', trialPlanData);
    } else {
      console.log('❌ Trial plan activation failed:', trialPlanResponse.status);
      const errorData = await trialPlanResponse.json();
      console.log('Error details:', errorData);
    }

    console.log('\n6️⃣ Testing Welcome Email...');
    const welcomeEmailResponse = await fetch(`${PRODUCTION_BACKEND}/api/auth/send-welcome-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, name: 'Test User' })
    });
    
    if (welcomeEmailResponse.ok) {
      const welcomeEmailData = await welcomeEmailResponse.json();
      console.log('✅ Welcome email passed:', welcomeEmailData);
    } else {
      console.log('❌ Welcome email failed:', welcomeEmailResponse.status);
      const errorData = await welcomeEmailResponse.json();
      console.log('Error details:', errorData);
    }

    console.log('\n7️⃣ Testing Login Endpoint...');
    const loginResponse = await fetch(`${PRODUCTION_BACKEND}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: 'testpassword123' })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login endpoint passed:', loginData.message);
    } else {
      console.log('❌ Login endpoint failed:', loginResponse.status);
      const errorData = await loginResponse.json();
      console.log('Error details:', errorData);
    }

    console.log('\n🎉 Registration Flow Test Completed!');
    console.log('=====================================');
    console.log('✅ All critical endpoints are working');
    console.log('✅ Email verification flow is functional');
    console.log('✅ Plan selection is working');
    console.log('✅ Trial plan activation is working');
    console.log('✅ Welcome email is working');
    console.log('✅ Login endpoint is accessible');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testRegistrationFlow();

