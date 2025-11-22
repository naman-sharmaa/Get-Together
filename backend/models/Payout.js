import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
  },
  amount: {
    type: Number,
    required: true,
  },
  commissionAmount: {
    type: Number,
    required: true,
  },
  commissionRate: {
    type: Number,
    required: true,
  },
  netAmount: {
    type: Number,
    required: true, // Amount after commission
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  payoutMethod: {
    type: String,
    enum: ['bank_transfer', 'upi', 'paypal', 'other'],
    default: 'bank_transfer',
  },
  payoutDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    upiId: String,
    notes: String,
  },
  transactionId: {
    type: String,
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  processedAt: {
    type: Date,
  },
  notes: {
    type: String,
  },
  periodStart: {
    type: Date,
  },
  periodEnd: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Index for faster queries
payoutSchema.index({ organizerId: 1, status: 1 });
payoutSchema.index({ createdAt: -1 });

const Payout = mongoose.model('Payout', payoutSchema);

export default Payout;
