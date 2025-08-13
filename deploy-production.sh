#!/bin/bash

echo "🚀 Deploying TaxAI Backend to Production"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "server.js" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    exit 1
fi

# Set production environment
export NODE_ENV=production
export ENV_FILE=.env.production

echo "📋 Environment Configuration:"
echo "NODE_ENV: $NODE_ENV"
echo "ENV_FILE: $ENV_FILE"

# Check if production env file exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found"
    echo "Please create .env.production with production configuration"
    exit 1
fi

# Validate environment variables
echo "🔍 Validating environment variables..."
source .env.production

if [ -z "$MONGODB_URI" ]; then
    echo "❌ Error: MONGODB_URI not set in .env.production"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Error: JWT_SECRET not set in .env.production"
    exit 1
fi

if [ "$JWT_SECRET" = "jwt" ]; then
    echo "⚠️  Warning: JWT_SECRET is using default value 'jwt'"
    echo "Please change this to a secure secret in production"
fi

echo "✅ Environment validation passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

# Test the application
echo "🧪 Testing application..."
node -e "
const dotenv = require('dotenv');
dotenv.config({ path: '.env.production' });

console.log('Environment loaded:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '***SET***' : 'NOT SET');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '***SET***' : 'NOT SET');
console.log('- FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('- PORT:', process.env.PORT);
"

# Start the application
echo "🚀 Starting production server..."
echo "Server will be available at: http://localhost:${PORT:-5000}"
echo "Press Ctrl+C to stop the server"

# Start the server
node server.js
