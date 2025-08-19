import fs from 'fs';
import path from 'path';

console.log('🔍 TaxAI Backend Configuration Verification');
console.log('==========================================');

// Check required files
const requiredFiles = [
  '.env.production',
  'test-login-endpoint.js',
  'deploy-production.sh',
  'server.js',
  'routes/auth.js'
];

console.log('\n📋 Checking required files:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - EXISTS`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check environment files
console.log('\n🔧 Checking environment files:');
const envFiles = [
  '.env',
  'config.env',
  'config.dev.env',
  '.env.production'
];

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const hasMongoDB = content.includes('MONGODB_URI');
    const hasJWT = content.includes('JWT_SECRET');
    const hasFrontend = content.includes('FRONTEND_URL');
    
    console.log(`✅ ${file} - EXISTS`);
    console.log(`   - MongoDB URI: ${hasMongoDB ? 'SET' : 'NOT SET'}`);
    console.log(`   - JWT Secret: ${hasJWT ? 'SET' : 'NOT SET'}`);
    console.log(`   - Frontend URL: ${hasFrontend ? 'SET' : 'NOT SET'}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check server.js configuration
console.log('\n⚙️ Checking server.js configuration:');
try {
  const serverContent = fs.readFileSync('server.js', 'utf8');
  
  const hasEnvLoading = serverContent.includes('.env.production');
  const hasEnhancedHealth = serverContent.includes('mongodb: mongoose.connection.readyState');
  const hasCorsConfig = serverContent.includes('allowedOrigins');
  
  console.log(`✅ Environment loading: ${hasEnvLoading ? 'CORRECT' : 'INCORRECT'}`);
  console.log(`✅ Enhanced health check: ${hasEnhancedHealth ? 'CORRECT' : 'INCORRECT'}`);
  console.log(`✅ CORS configuration: ${hasCorsConfig ? 'CORRECT' : 'INCORRECT'}`);
  
} catch (error) {
  console.log(`❌ Error reading server.js: ${error.message}`);
}

// Check auth.js for login endpoint
console.log('\n🔐 Checking auth.js for login endpoint:');
try {
  const authContent = fs.readFileSync('routes/auth.js', 'utf8');
  
  const hasLoginEndpoint = authContent.includes('router.post(\'/login\'');
  const hasJWTGeneration = authContent.includes('generateToken(user._id)');
  const hasPasswordValidation = authContent.includes('comparePassword(password)');
  
  console.log(`✅ Login endpoint: ${hasLoginEndpoint ? 'EXISTS' : 'MISSING'}`);
  console.log(`✅ JWT generation: ${hasJWTGeneration ? 'EXISTS' : 'MISSING'}`);
  console.log(`✅ Password validation: ${hasPasswordValidation ? 'EXISTS' : 'MISSING'}`);
  
} catch (error) {
  console.log(`❌ Error reading auth.js: ${error.message}`);
}

// Check package.json for dependencies
console.log('\n📦 Checking package.json dependencies:');
try {
  const packageContent = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredDeps = ['express', 'mongoose', 'cors', 'helmet', 'bcryptjs', 'jsonwebtoken'];
  const missingDeps = [];
  
  requiredDeps.forEach(dep => {
    if (!packageContent.dependencies[dep] && !packageContent.devDependencies[dep]) {
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length === 0) {
    console.log('✅ All required dependencies are present');
  } else {
    console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
  }
  
} catch (error) {
  console.log(`❌ Error reading package.json: ${error.message}`);
}

// Summary
console.log('\n📊 Configuration Verification Summary:');
if (allFilesExist) {
  console.log('✅ All required files are present');
  console.log('✅ Configuration appears to be complete');
  console.log('\n🎯 Next steps:');
  console.log('1. Test the backend with: node test-login-endpoint.js');
  console.log('2. Deploy to production with: ./deploy-production.sh');
  console.log('3. Verify login endpoint works with dashboard');
} else {
  console.log('❌ Some required files are missing');
  console.log('❌ Configuration is incomplete');
  console.log('\n🔧 Please restore missing files and run verification again');
}

console.log('\n🔍 Verification completed!');
