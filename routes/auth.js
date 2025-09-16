import express from 'express';
import User from '../models/User.js';
import { auth, generateToken } from '../middleware/auth.js';
import { validateRegistration, handleValidationErrors } from '../middleware/validation.js';
import emailService from '../services/emailService.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Get subscription plans
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'trial',
      name: 'Free Trial',
      description: 'No Credit Card Required',
      price: 0,
      messageLimit: 50,
      duration: 14,
      features: ['10 messages', '14 days', 'Full access to features']
    },
    {
      id: 'monthly',
      name: 'Monthly Plan',
      description: '100 messages per month',
      price: 99,
      messageLimit: 100,
      duration: 30,
      features: ['100 messages', 'Monthly billing', 'Priority support']
    },
    {
      id: 'quarterly',
      name: 'Quarterly Plan',
      description: '300 messages for 3 months',
      price: 250,
      messageLimit: 300,
      duration: 90,
      features: ['300 messages', '3 months', 'Save 16%', 'Priority support']
    },
    {
      id: 'yearly',
      name: 'Yearly Plan',
      description: '1200 messages for 1 year',
      price: 899,
      messageLimit: 1200,
      duration: 365,
      features: ['1200 messages', '1 year', 'Save 24%', 'Priority support']
    }
  ];
  
  res.json({ plans });
});

// Register user (initial registration without email verification)
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password, jobTitle } = req.body;

    console.log('Initial registration request received:', { name, email, jobTitle });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user with minimal subscription (will be updated after plan selection)
    const user = new User({
      name,
      email,
      password,
      jobTitle,
      emailVerified: false,
      subscription: {
        type: 'trial',
        status: 'pending',
        messageLimit: 0,
        remainingMessages: 0,
        callSeconds: 0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        payment: null
      },
      trialUsed: false
    });

    await user.save();
    console.log('User saved successfully (pending email verification):', user._id);

    // Generate token for authentication
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully. Please select your plan to continue.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle,
        emailVerified: user.emailVerified,
        subscription: user.subscription
      },
      token,
      requiresEmailVerification: true,
      requiresPayment: false // Will be determined after plan selection
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Legacy verify email endpoint (deprecated - kept for backward compatibility)
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Find user with this token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Update user
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    
    // Activate subscription if email is verified
    if (user.subscription.status === 'pending') {
      user.subscription.status = 'active';
    }

    await user.save();

    // Note: Welcome email will be sent after payment completion

    res.json({
      message: 'Email verified successfully! Your account is now active.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = emailService.generateVerificationToken();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    // Update user with new token
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Send new verification email - Production configuration
    const origin = req.headers.origin;
    const isLocalDevelopment = process.env.NODE_ENV === 'development' && origin && /localhost|127\.0\.0\.1/.test(origin);
    const computedBase = isLocalDevelopment
      ? origin
      : (process.env.FRONTEND_URL || 'https://taxai.ae');
    const baseUrl = computedBase.replace(/\/+$/, '');
    await emailService.sendVerificationEmail(email, user.name, verificationToken, baseUrl);

    res.json({
      message: 'Verification email sent successfully. Please check your inbox.'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error while resending verification email' });
  }
});

// DEPRECATED: Old select-plan endpoint - REMOVED
// This endpoint was causing conflicts with the new registration flow
// The correct endpoint is below (line ~672) which accepts email parameter
// and works with verified users

// Update subscription after email verification (for existing flow)
router.post('/update-subscription', auth, async (req, res) => {
  try {
    const { subscriptionType } = req.body;
    
    // Check if email is verified
    const user = await User.findById(req.user._id);
    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: 'Email verification required before updating subscription',
        requiresEmailVerification: true 
      });
    }

    // Get plan details
    const plans = {
      trial: { messageLimit: 10, duration: 14, price: 0 },
      monthly: { messageLimit: 100, duration: 30, price: 99 },
      quarterly: { messageLimit: 300, duration: 90, price: 250 },
      yearly: { messageLimit: 1200, duration: 365, price: 899 }
    };

    const plan = plans[subscriptionType];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid subscription type' });
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    // Update subscription
    user.subscription = {
      type: subscriptionType,
      status: subscriptionType === 'trial' ? 'active' : 'pending',
      messageLimit: plan.messageLimit,
      remainingMessages: plan.messageLimit,
      callSeconds: 180,
      startDate: new Date(),
      endDate: endDate,
      payment: subscriptionType === 'trial' ? null : {
        amount: plan.price,
        method: 'credit_card',
        lastPaymentDate: null,
        nextPaymentDate: endDate
      }
    };

    user.trialUsed = subscriptionType === 'trial';
    await user.save();

    res.json({
      message: 'Subscription updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle,
        emailVerified: user.emailVerified,
        subscription: user.subscription
      },
      requiresPayment: subscriptionType !== 'trial'
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ message: 'Server error during subscription update' });
  }
});

// Check email availability
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check for existing user (including temporary users)
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      // Check if this is a temporary user that hasn't been verified
      if (existingUser.emailVerified === false && existingUser.name === 'Temporary User') {
        // Allow re-registration for unverified temporary users
        res.json({ message: 'Email available' });
        return;
      }
      
      // Check if this is a verified user
      if (existingUser.emailVerified === true) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      
      // For any other case, treat as already registered
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    res.json({ message: 'Email available' });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send verification email (for new flow)
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Check if email is already registered (only verified users)
    const existingUser = await User.findOne({ email, emailVerified: true });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    
    // Check for cooldown - prevent spam (including temporary users)
    const tempUser = await User.findOne({ email });
    if (tempUser && tempUser.emailVerificationToken) {
      const lastSentTime = tempUser.updatedAt || tempUser.createdAt;
      const timeSinceLastSent = Date.now() - lastSentTime.getTime();
      const cooldownPeriod = 60 * 1000; // 60 seconds in milliseconds
      
      if (timeSinceLastSent < cooldownPeriod) {
        const remainingTime = Math.ceil((cooldownPeriod - timeSinceLastSent) / 1000);
        return res.status(429).json({ 
          message: `Please wait ${remainingTime} seconds before requesting another verification email.`,
          remainingTime
        });
      }
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Update or create temporary user record
    if (tempUser) {
      // Update existing temporary user
      tempUser.emailVerificationToken = verificationToken;
      tempUser.emailVerificationExpires = verificationExpires;
      tempUser.updatedAt = new Date();
      await tempUser.save();
    } else {
      // Create new temporary user record
      const newTempUser = new User({
        email,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        emailVerified: false,
        name: 'Temporary User',
        password: 'temp-password', // Will be updated during actual registration
        jobTitle: 'Temporary',
        subscription: {
          type: 'trial',
          status: 'pending',
          messageLimit: 0,
          remainingMessages: 0,
          callSeconds: 0,
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          payment: null
        }
      });
      await newTempUser.save();
    }
    
    // Send verification email - Production configuration
    // Use FRONTEND_URL from environment for production, origin only for local development
    const origin = req.headers.origin;
    const isLocalDevelopment = process.env.NODE_ENV === 'development' && origin && /localhost|127\.0\.0\.1/.test(origin);
    const computedFront = isLocalDevelopment
      ? origin
      : (process.env.FRONTEND_URL || 'https://taxai.ae');
    const frontendUrl = computedFront.replace(/\/+$/, '');
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
    
    console.log('📧 Sending verification email:');
    console.log('  - Email:', email);
    console.log('  - Environment: unified');
    console.log('  - Frontend URL:', frontendUrl);
    console.log('  - Verification URL:', verificationUrl);
    console.log('  - Backend URL:', process.env.BACKEND_URL || 'https://tax-ai-backend-dm7p.onrender.com');
    
    await emailService.sendVerificationEmail(email, verificationUrl);
    
    res.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Send verification error:', error);
    res.status(500).json({ message: 'Failed to send verification email' });
  }
});

// Clean up expired temporary users (admin endpoint)
router.post('/cleanup-temp-users', async (req, res) => {
  try {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    const result = await User.deleteMany({
      name: 'Temporary User',
      emailVerified: false,
      createdAt: { $lt: cutoffDate }
    });
    
    console.log(`Cleaned up ${result.deletedCount} expired temporary users`);
    res.json({ 
      message: `Cleaned up ${result.deletedCount} expired temporary users`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ message: 'Failed to cleanup temporary users' });
  }
});

// Verify email with token
router.post('/verify-email', async (req, res) => {
  try {
    console.log('🔍 POST /verify-email called with:', req.body);
    
    const { token, email } = req.body;
    
    if (!token || !email) {
      console.log('❌ Missing token or email');
      return res.status(400).json({ message: 'Token and email are required' });
    }
    
    console.log('🔍 Looking for user with:', { email, token });
    
    const user = await User.findOne({ 
      email,
      emailVerificationToken: token,
      emailVerified: false
    });
    
    if (!user) {
      console.log('❌ User not found or already verified');
      return res.status(400).json({ message: 'Invalid verification token or email' });
    }
    
    console.log('✅ User found:', user._id);
    
    // Check if token is expired
    if (user.emailVerificationExpires && new Date() > user.emailVerificationExpires) {
      console.log('❌ Token expired');
      return res.status(400).json({ message: 'Verification token has expired' });
    }
    
    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    console.log('✅ Email verified successfully for user:', user._id);
    
    // Generate token for verified user
    const authToken = generateToken(user._id);
    
    res.json({
      message: 'Email verified successfully',
      verified: true,
      userId: user._id,
      token: authToken
    });
  } catch (error) {
    console.error('❌ Verify email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check verification status
router.post('/check-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.emailVerified) {
      // Generate token for verified user
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        verified: true,
        userId: user._id,
        token
      });
    } else {
      res.json({ verified: false });
    }
  } catch (error) {
    console.error('Check verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user after email verification (for new flow)
router.post('/update-user-after-verification', async (req, res) => {
  try {
    const { firstName, lastName, role, password, email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.emailVerified) {
      return res.status(400).json({ message: 'Email not verified' });
    }
    
    // Update user with actual registration data
    user.name = `${firstName} ${lastName}`;
    user.jobTitle = role;
    // Important: Assign raw password and let the pre-save hook hash it once
    user.password = password;
    
    await user.save();
    // Debug: log hash prefix to verify single-hash storage
    try {
      console.log('🔐 [update-user-after-verification] Stored hash prefix:', (user.password || '').slice(0, 10));
      const verifyCompare = await bcrypt.compare(password, user.password);
      console.log('🔍 [update-user-after-verification] Immediate compare result:', verifyCompare);
    } catch (_) {}

    console.log('✅ User updated successfully - welcome email will be sent at success step');
    
    // Generate token for the updated user
    const token = generateToken(user._id);
    
    res.json({
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle,
        emailVerified: user.emailVerified,
        subscription: user.subscription
      },
      token
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Select plan and activate subscription
router.post('/select-plan', async (req, res) => {
  try {
    const { subscriptionType, email } = req.body;
    
    if (!subscriptionType || !email) {
      return res.status(400).json({ message: 'Subscription type and email are required' });
    }
    
    console.log('📋 Plan selection request:', { subscriptionType, email });
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.emailVerified) {
      return res.status(400).json({ message: 'Email not verified' });
    }
    
    // Get plan details
    const plans = {
      trial: { messageLimit: 50, duration: 14, price: 0, callSeconds: 300 },
      monthly: { messageLimit: 100, duration: 30, price: 99, callSeconds: 1800 },
      quarterly: { messageLimit: 300, duration: 90, price: 250, callSeconds: 5400 },
      yearly: { messageLimit: 1200, duration: 365, price: 899, callSeconds: 21600 }
    };
    
    const plan = plans[subscriptionType];
    if (!plan) {
      return res.status(400).json({ message: 'Invalid subscription type' });
    }
    
    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);
    
    console.log('📋 Updating subscription for user:', user._id);
    console.log('- Plan type:', subscriptionType);
    console.log('- Message limit:', plan.messageLimit);
    console.log('- Call time:', plan.callSeconds, 'seconds');
    console.log('- End date:', endDate);
    
    // Update user subscription
    user.subscription = {
      type: subscriptionType,
      status: subscriptionType === 'trial' ? 'active' : 'pending',
      messageLimit: plan.messageLimit,
      remainingMessages: plan.messageLimit,
      callSeconds: plan.callSeconds,
      startDate: new Date(),
      endDate: endDate,
      payment: subscriptionType === 'trial' ? {
        amount: 0,
        method: 'trial',
        lastPaymentDate: new Date(),
        nextPaymentDate: endDate
      } : {
        amount: plan.price,
        method: 'credit_card',
        lastPaymentDate: null,
        nextPaymentDate: endDate
      }
    };
    
    // Mark trial as used if applicable
    if (subscriptionType === 'trial') {
      user.trialUsed = true;
    }
    
    await user.save();
    
    console.log('✅ Subscription updated successfully for user:', user._id);
    
    res.json({
      message: 'Plan selected successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription,
        emailVerified: user.emailVerified
      },
      requiresPayment: subscriptionType !== 'trial'
    });
    
  } catch (error) {
    console.error('Plan selection error:', error);
    res.status(500).json({ message: 'Server error during plan selection' });
  }
});

// Middleware to check if email is verified
const requireEmailVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.emailVerified) {
      return res.status(403).json({ 
        message: 'Email verification required',
        requiresEmailVerification: true 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, jobTitle, language } = req.body;
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (jobTitle) user.jobTitle = jobTitle;
    if (language !== undefined) user.language = language;
    
    await user.save();
    
    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle,
        language: user.language,
        subscription: user.subscription
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check email verification status
router.get('/email-verification-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('emailVerified email');
    res.json({ 
      emailVerified: user.emailVerified,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send welcome email when user reaches success step
router.post('/send-welcome-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ message: 'Email and name are required' });
    }
    
    console.log('📧 Sending welcome email to:', email);
    await emailService.sendWelcomeEmail(email, name);
    console.log('✅ Welcome email sent successfully to:', email);
    
    res.json({ message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    res.status(500).json({ message: 'Failed to send welcome email' });
  }
});

// Activate trial plan for new users
router.post('/activate-trial-plan', async (req, res) => {
  try {
    const { email, planName } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    console.log('📋 Activating trial plan for:', email, 'Plan:', planName);
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user already has an active subscription
    if (user.subscription && user.subscription.status === 'active') {
      console.log('⚠️ User already has active subscription:', user.subscription.type);
      return res.json({ 
        message: 'User already has active subscription',
        subscription: user.subscription 
      });
    }
    
    // Set trial plan details
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days trial
    
    user.subscription = {
      type: 'trial',
      status: 'active',
      messageLimit: 50, // Trial message limit
      remainingMessages: 50,
      callSeconds: 300, // 5 minutes trial call time
      startDate: new Date(),
      endDate: trialEndDate,
      payment: {
        amount: 0,
        method: 'trial',
        lastPaymentDate: new Date(),
        nextPaymentDate: trialEndDate
      }
    };
    
    // Mark trial as used
    user.trialUsed = true;
    
    await user.save();
    
    console.log('✅ Trial plan activated successfully for:', email);
    console.log('- Plan type:', user.subscription.type);
    console.log('- Message limit:', user.subscription.messageLimit);
    console.log('- Call time:', user.subscription.callSeconds, 'seconds');
    console.log('- End date:', user.subscription.endDate);
    
    res.json({
      message: 'Trial plan activated successfully',
      subscription: user.subscription
    });
    
  } catch (error) {
    console.error('❌ Failed to activate trial plan:', error);
    res.status(500).json({ message: 'Failed to activate trial plan' });
  }
});

// Login endpoint for dashboard authentication
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    console.log('🔐 Login attempt for email:', email);
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('✅ User found:', { id: user._id, emailVerified: user.emailVerified });
    
    // Check if email is verified - Unified configuration
    if (!user.emailVerified) {
      console.log('⚠️  Unified mode: Skipping email verification check for seamless login');
    }
    
    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', user._id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('✅ Password validated for user:', user._id);
    
    // Check if subscription is active - Unified configuration
    if (!user.isSubscriptionActive()) {
      console.log('⚠️  Unified mode: Skipping subscription check for seamless login');
    }
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    console.log('✅ Login successful for user:', user._id);
    
    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle,
        language: user.language,
        subscription: user.subscription,
        trialUsed: user.trialUsed,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      token
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

export default router; 