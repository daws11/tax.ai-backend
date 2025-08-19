import bcrypt from 'bcryptjs';

// Test password from the user document you provided
const testPassword = 'test123'; // Replace with actual password
const storedHash = '$2a$12$XAbmTcQXgfa8XDJRKD9lEe/BsWwl2qGivUKAFmSYdqq/CgNcZqKEy';

console.log('🔐 Testing Password Hash Verification');
console.log('=====================================');

console.log('\n📋 Test Details:');
console.log('Test Password:', testPassword);
console.log('Stored Hash:', storedHash);
console.log('Hash Length:', storedHash.length);

try {
  // Test 1: Verify the stored hash
  console.log('\n1. Testing password verification...');
  const isValid = await bcrypt.compare(testPassword, storedHash);
  console.log(`Password verification result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
  
  if (isValid) {
    console.log('✅ Password hash is working correctly');
  } else {
    console.log('❌ Password hash verification failed');
  }

  // Test 2: Generate new hash for comparison
  console.log('\n2. Generating new hash for comparison...');
  const newHash = await bcrypt.hash(testPassword, 12);
  console.log('New hash generated:', newHash);
  console.log('Hash length:', newHash.length);
  
  // Test 3: Verify new hash
  const newHashValid = await bcrypt.compare(testPassword, newHash);
  console.log(`New hash verification: ${newHashValid ? '✅ VALID' : '❌ INVALID'}`);

  // Test 4: Test with different passwords
  console.log('\n3. Testing with different passwords...');
  const wrongPasswords = ['wrongpass', 'test', '123test', 'test1234'];
  
  wrongPasswords.forEach(async (wrongPass) => {
    const wrongResult = await bcrypt.compare(wrongPass, storedHash);
    console.log(`"${wrongPass}" vs stored hash: ${wrongResult ? '❌ WRONGLY ACCEPTED' : '✅ CORRECTLY REJECTED'}`);
  });

  // Test 5: Hash cost analysis
  console.log('\n4. Hash cost analysis...');
  const hashInfo = bcrypt.getRounds(storedHash);
  console.log('Hash cost (rounds):', hashInfo);
  console.log('Hash algorithm:', storedHash.startsWith('$2a$') ? 'bcrypt' : 'unknown');

  console.log('\n📊 Password Hash Test Summary:');
  if (isValid) {
    console.log('✅ Stored password hash is valid');
    console.log('✅ bcrypt comparison is working');
    console.log('✅ Hash generation is working');
    console.log('\n🎯 The password hash in your database is correct!');
    console.log('   The issue might be in the backend authentication logic.');
  } else {
    console.log('❌ Stored password hash is invalid');
    console.log('❌ bcrypt comparison failed');
    console.log('\n🔧 You need to update the password hash in the database.');
  }

} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Error details:', error);
}

console.log('\n🔍 Test completed!');
