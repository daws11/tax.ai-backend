import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    default: 'credit_card'
  },
  lastPaymentDate: {
    type: Date,
    default: Date.now
  },
  nextPaymentDate: {
    type: Date
  }
});

const subscriptionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', 'trial'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'pending'],
    default: 'pending'
  },
  messageLimit: {
    type: Number,
    required: true
  },
  remainingMessages: {
    type: Number,
    required: true
  },
  callSeconds: {
    type: Number,
    default: 180, // 3 menit dalam detik
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  payment: paymentSchema
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  language: {
    type: String,
    default: null
  },
  subscription: {
    type: subscriptionSchema,
    required: true
  },
  trialUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if subscription is active
userSchema.methods.isSubscriptionActive = function() {
  return this.subscription.status === 'active' && new Date() < this.subscription.endDate;
};

// Method to get remaining messages
userSchema.methods.getRemainingMessages = function() {
  return this.subscription.remainingMessages;
};

// Method to decrement message count
userSchema.methods.decrementMessageCount = function() {
  if (this.subscription.remainingMessages > 0) {
    this.subscription.remainingMessages -= 1;
    return this.save();
  }
  return Promise.reject(new Error('No messages remaining'));
};

const User = mongoose.model('User', userSchema);

export default User; 