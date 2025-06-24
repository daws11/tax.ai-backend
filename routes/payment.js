import express from 'express';
import Stripe from 'stripe';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';
import { validatePayment, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

function getStripeInstance() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Create payment intent
router.post('/create-payment-intent', auth, async (req, res) => {
  const stripe = getStripeInstance();
  if (!stripe) return res.status(500).json({ message: 'Stripe key not set' });
  try {
    const { subscriptionType } = req.body;
    
    const prices = {
      monthly: 9900, // $99.00 in cents
      quarterly: 25000, // $250.00 in cents
      yearly: 89900 // $899.00 in cents
    };

    const amount = prices[subscriptionType];
    if (!amount) {
      return res.status(400).json({ message: 'Invalid subscription type' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString(),
        subscriptionType
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment intent' });
  }
});

// Confirm payment and activate subscription
router.post('/confirm-payment', auth, validatePayment, handleValidationErrors, async (req, res) => {
  const stripe = getStripeInstance();
  if (!stripe) return res.status(500).json({ message: 'Stripe key not set' });
  try {
    const { paymentIntentId, subscriptionType } = req.body;
    
    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Update user subscription
    const user = await User.findById(req.user._id);
    
    const plans = {
      monthly: { messageLimit: 100, duration: 30, price: 99 },
      quarterly: { messageLimit: 300, duration: 90, price: 250 },
      yearly: { messageLimit: 1200, duration: 365, price: 899 }
    };

    const plan = plans[subscriptionType];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    user.subscription = {
      type: subscriptionType,
      status: 'active',
      messageLimit: plan.messageLimit,
      remainingMessages: plan.messageLimit,
      startDate: new Date(),
      endDate: endDate,
      payment: {
        amount: plan.price,
        method: 'credit_card',
        lastPaymentDate: new Date(),
        nextPaymentDate: endDate
      }
    };

    await user.save();

    res.json({
      message: 'Payment confirmed and subscription activated',
      subscription: user.subscription
    });

  } catch (error) {
    res.status(500).json({ message: 'Error confirming payment' });
  }
});

// Get payment history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    const paymentHistory = {
      lastPayment: user.subscription.payment?.lastPaymentDate,
      nextPayment: user.subscription.payment?.nextPaymentDate,
      amount: user.subscription.payment?.amount,
      method: user.subscription.payment?.method
    };

    res.json({ paymentHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment history' });
  }
});

export default router; 