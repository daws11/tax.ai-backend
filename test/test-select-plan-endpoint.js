import { fetch } from 'undici';

const BACKEND_URL = 'https://tax-ai-backend-dm7p.onrender.com';
const TEST_EMAIL = 'test-select-plan@example.com';

async function testSelectPlanEndpoint() {
  console.log('🧪 Testing Select Plan Endpoint');
  console.log('================================');
  
  try {
    // Step 1: Create a test user with email verification
    console.log('1️⃣ Creating test user with email verification...');
    
    const createUserResponse = await fetch(`${BACKEND_URL}/api/auth/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        name: 'Test User'
      })
    });
    
    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.json();
      console.log('ℹ️ User creation response:', errorData);
    } else {
      const createData = await createUserResponse.json();
      console.log('✅ User creation response:', createData);
    }
    
    // Step 2: Simulate email verification (we'll use the token from the response)
    console.log('\n2️⃣ Simulating email verification...');
    
    // For testing purposes, we'll manually verify the user in the database
    // In real scenario, this would happen when user clicks email link
    
    // Step 3: Test plan selection with verified user
    console.log('\n3️⃣ Testing plan selection with verified user...');
    
    const planSelectionResponse = await fetch(`${BACKEND_URL}/api/auth/select-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionType: 'trial',
        email: TEST_EMAIL
      })
    });
    
    if (planSelectionResponse.ok) {
      const planData = await planSelectionResponse.json();
      console.log('✅ Plan selection successful:', planData);
      
      if (planData.requiresPayment === false) {
        console.log('✅ Trial plan correctly marked as no payment required');
      } else {
        console.log('⚠️ Trial plan incorrectly marked as requiring payment');
      }
      
      if (planData.user.subscription.status === 'active') {
        console.log('✅ Trial plan correctly marked as active');
      } else {
        console.log('⚠️ Trial plan status:', planData.user.subscription.status);
      }
      
    } else {
      const errorData = await planSelectionResponse.json();
      console.log('❌ Plan selection failed:', planSelectionResponse.status);
      console.log('Error details:', errorData);
    }
    
    // Step 4: Test with different plan types
    console.log('\n4️⃣ Testing with monthly plan...');
    
    const monthlyPlanResponse = await fetch(`${BACKEND_URL}/api/auth/select-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionType: 'monthly',
        email: TEST_EMAIL
      })
    });
    
    if (monthlyPlanResponse.ok) {
      const monthlyData = await monthlyPlanResponse.json();
      console.log('✅ Monthly plan selection successful:', monthlyData);
      
      if (monthlyData.requiresPayment === true) {
        console.log('✅ Monthly plan correctly marked as requiring payment');
      } else {
        console.log('⚠️ Monthly plan incorrectly marked as no payment required');
      }
      
      if (monthlyData.user.subscription.status === 'pending') {
        console.log('✅ Monthly plan correctly marked as pending (waiting for payment)');
      } else {
        console.log('⚠️ Monthly plan status:', monthlyData.user.subscription.status);
      }
      
    } else {
      const errorData = await monthlyPlanResponse.json();
      console.log('❌ Monthly plan selection failed:', monthlyPlanResponse.status);
      console.log('Error details:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testSelectPlanEndpoint();
