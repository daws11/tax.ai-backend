import dotenv from 'dotenv';
import path from 'path';
// Load environment variables
const envFile = process.env.ENV_FILE || (process.env.NODE_ENV === 'production' ? '.env' : '.env');
dotenv.config({ path: path.resolve(process.cwd(), envFile) });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(process.cwd(), 'config.env') });
}

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
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '***SET***' : 'NOT SET');
console.log('='.repeat(50));

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // untuk request dari server (tanpa origin)
    // Allow localhost:8080 in development
    if (process.env.NODE_ENV !== 'production' && origin === 'http://localhost:8080') {
      return callback(null, true);
    }
    const allowed = /\.onrender\.com$/.test(origin) || /taxai\.ae$/.test(origin);
    if (allowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

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
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
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