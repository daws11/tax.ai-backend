import express from 'express';
import User from '../models/User.js';
import { auth, generateToken } from '../middleware/auth.js';
import { validateRegistration, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Get subscription plans
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'trial',
      name: 'Free Trial',
      description: '14 days free trial with 50 messages',
      price: 0,
      messageLimit: 50,
      duration: 14,
      features: ['50 messages', '14 days', 'Full access to features']
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

// Register user
router.post('/register', validateRegistration, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password, jobTitle, subscriptionType } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Get plan details
    const plans = {
      trial: { messageLimit: 50, duration: 14, price: 0 },
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

    // Create subscription object
    const subscription = {
      type: subscriptionType,
      status: subscriptionType === 'trial' ? 'active' : 'pending',
      messageLimit: plan.messageLimit,
      remainingMessages: plan.messageLimit,
      startDate: new Date(),
      endDate: endDate,
      payment: subscriptionType === 'trial' ? null : {
        amount: plan.price,
        method: 'credit_card',
        lastPaymentDate: null,
        nextPaymentDate: endDate
      }
    };

    // Create user
    const user = new User({
      name,
      email,
      password,
      jobTitle,
      subscription,
      trialUsed: subscriptionType === 'trial'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle,
        subscription: user.subscription
      },
      token,
      requiresPayment: subscriptionType !== 'trial'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

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

export default router; 