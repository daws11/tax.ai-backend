import dotenv from 'dotenv';
import path from 'path';

// Load environment variables - prefer local .env in development, fallback to production
console.log('🔍 Loading environment variables...');
console.log('NODE_ENV:', process.env.NODE_ENV);

if (process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.production') });
  console.log('📁 Loaded .env.production');
} else {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  console.log('📁 Loaded .env');
}
// Final fallback
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });
  console.log('📁 Loaded config.env as fallback');
}

console.log('✅ Environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '***SET***' : 'NOT SET');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '***SET***' : 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('PORT:', process.env.PORT);

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Log environment variables for debugging
console.log('🔍 Environment Variables Check:');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '***SET***' : 'NOT SET');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '***SET***' : 'NOT SET');
console.log('='.repeat(50));

// CORS should be registered BEFORE security middleware to ensure preflight isn't blocked
const allowedOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // untuk request dari server (tanpa origin)
    try {
      const { hostname, protocol } = new URL(origin);
      // Allow explicit origins list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      // Allow taxai.ae domains, onrender.com deployments, and localhost on any port
      const isAllowed =
        hostname.endsWith('taxai.ae') ||
        hostname.endsWith('onrender.com') ||
        hostname === 'localhost' ||
        hostname === '127.0.0.1';
      if (isAllowed && (protocol === 'http:' || protocol === 'https:')) {
        return callback(null, true);
      }
    } catch (_) {
      // Fallback to basic checks if URL parsing fails
      const basicAllowed = /taxai\.ae/.test(origin) || /onrender\.com/.test(origin) || /localhost/.test(origin);
      if (basicAllowed) return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200
}));

// Handle preflight for all routes
app.options('*', cors());

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: 'unified',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      auth: '/api/auth/*',
      payment: '/api/payment/*',
      login: '/api/auth/login'
    },
    cors: {
      allowedOrigins: ['taxai.ae', 'onrender.com', 'localhost']
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: unified`);
  console.log(`📧 Email service configured for: no-reply@taxai.ae`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

export default app; 