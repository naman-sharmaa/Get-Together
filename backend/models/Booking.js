import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price must be positive'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  // Payment details
  razorpayOrderId: {
    type: String,
    unique: true,
    sparse: true,
  },
  razorpayPaymentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  razorpaySignature: String,
  // Ticket details
  ticketNumbers: [String],
  attendeeDetails: [{
    name: String,
    email: String,
    phone: String,
  }],
  // PDF and download
  pdfUrl: String,
  downloadCount: {
    type: Number,
    default: 0,
  },
  // Ticket verification tracking
  verifiedTickets: [{
    ticketNumber: String,
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['approved', 'denied'],
      default: 'approved',
    },
  }],
  // Cancelled tickets tracking
  cancelledTickets: [String],
}, {
  timestamps: true,
});

// Indexes for better query performance
bookingSchema.index({ userId: 1 });
bookingSchema.index({ eventId: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

