import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  name: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed'],
    default: 'active',
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  unsubscribedAt: {
    type: Date,
  },
  preferences: {
    eventUpdates: {
      type: Boolean,
      default: true,
    },
    newEvents: {
      type: Boolean,
      default: true,
    },
    promotions: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

// Index for faster queries (email already indexed due to unique: true)
newsletterSchema.index({ status: 1 });

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;
