import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
  },
  type: {
    type: String,
    enum: ['login', 'password_reset', 'phone_verification', 'admin_password_change'],
    required: [true, 'OTP type is required'],
  },
  purpose: {
    type: String,
    enum: ['user', 'organizer'],
    default: 'user',
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // Auto-delete after expiration
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 3,
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for faster queries
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ phone: 1, type: 1 });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
