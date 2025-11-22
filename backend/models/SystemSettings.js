import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  maintenanceMessage: {
    type: String,
    default: 'We are currently under maintenance. Please check back soon.',
  },
  commissionRate: {
    type: Number,
    default: 10, // 10% commission
    min: 0,
    max: 100,
  },
  platformFee: {
    type: Number,
    default: 0,
    min: 0,
  },
  allowNewRegistrations: {
    type: Boolean,
    default: true,
  },
  allowNewBookings: {
    type: Boolean,
    default: true,
  },
  allowNewEvents: {
    type: Boolean,
    default: true,
  },
  contactEmail: {
    type: String,
    default: 'support@eventhub.com',
  },
  contactPhone: {
    type: String,
    default: '',
  },
  minimumPayout: {
    type: Number,
    default: 1000, // Minimum amount for payout in rupees
  },
  payoutCycle: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly'],
    default: 'monthly',
  },
  settingsType: {
    type: String,
    default: 'global',
    unique: true,
  },
}, {
  timestamps: true,
});

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

export default SystemSettings;
