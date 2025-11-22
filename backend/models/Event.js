import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organizer ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  totalTickets: {
    type: Number,
    default: 0,
    min: [0, 'Total tickets must be positive'],
  },
  availableTickets: {
    type: Number,
    default: 0,
    min: [0, 'Available tickets must be positive'],
  },
  status: {
    type: String,
    enum: ['upcoming', 'past', 'cancelled'],
    default: 'upcoming',
  },
  bookingExpiry: {
    type: Date,
    required: [true, 'Booking expiry date is required'],
  },
}, {
  timestamps: true,
});

// Index for better query performance
eventSchema.index({ organizerId: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });

// Virtual to determine status based on date
eventSchema.pre('save', function(next) {
  if (this.isModified('date') || this.isNew) {
    const now = new Date();
    if (this.date < now && this.status === 'upcoming') {
      this.status = 'past';
    }
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

export default Event;

