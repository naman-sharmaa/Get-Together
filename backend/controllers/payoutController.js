import Payout from '../models/Payout.js';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import SystemSettings from '../models/SystemSettings.js';

// Get all payouts
export const getAllPayouts = async (req, res) => {
  try {
    const { status, organizerId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (organizerId) filter.organizerId = organizerId;

    const payouts = await Payout.find(filter)
      .populate('organizerId', 'name email organizationName')
      .populate('eventId', 'title')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ payouts });
  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Calculate pending payout for organizer
export const calculatePendingPayout = async (req, res) => {
  try {
    const { organizerId } = req.params;

    const settings = await SystemSettings.findOne({ settingsType: 'global' });
    const commissionRate = settings?.commissionRate || 10;

    // Get organizer's events
    const events = await Event.find({ organizerId });
    const eventIds = events.map(e => e._id);

    // Get all completed bookings
    const bookings = await Booking.find({
      eventId: { $in: eventIds },
      paymentStatus: 'completed',
    });

    // Get already paid out amount
    const completedPayouts = await Payout.find({
      organizerId,
      status: 'completed',
    });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const alreadyPaidOut = completedPayouts.reduce((sum, p) => sum + p.netAmount, 0);
    
    const platformCommission = (totalRevenue * commissionRate) / 100;
    const totalEarnings = totalRevenue - platformCommission;
    const pendingAmount = totalEarnings - alreadyPaidOut;

    res.json({
      organizerId,
      totalRevenue,
      platformCommission,
      commissionRate,
      totalEarnings,
      alreadyPaidOut,
      pendingAmount,
      canPayout: pendingAmount >= (settings?.minimumPayout || 0),
      minimumPayout: settings?.minimumPayout || 0,
    });
  } catch (error) {
    console.error('Calculate payout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create payout
export const createPayout = async (req, res) => {
  try {
    const {
      organizerId,
      eventId,
      amount,
      payoutMethod,
      payoutDetails,
      notes,
    } = req.body;

    const settings = await SystemSettings.findOne({ settingsType: 'global' });
    const commissionRate = settings?.commissionRate || 10;

    const commissionAmount = (amount * commissionRate) / 100;
    const netAmount = amount - commissionAmount;

    const payout = await Payout.create({
      organizerId,
      eventId,
      amount,
      commissionAmount,
      commissionRate,
      netAmount,
      payoutMethod,
      payoutDetails,
      notes,
      status: 'pending',
    });

    await payout.populate('organizerId', 'name email organizationName');

    console.log(`✅ Payout created for ${payout.organizerId.name}: Rs ${netAmount}`);

    res.status(201).json({
      message: 'Payout created successfully',
      payout,
    });
  } catch (error) {
    console.error('Create payout error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update payout status
export const updatePayoutStatus = async (req, res) => {
  try {
    const { payoutId } = req.params;
    const { status, transactionId, notes } = req.body;

    const payout = await Payout.findById(payoutId);
    if (!payout) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    payout.status = status;
    if (transactionId) payout.transactionId = transactionId;
    if (notes) payout.notes = notes;

    if (status === 'completed' || status === 'processing') {
      payout.processedBy = req.admin._id;
      payout.processedAt = new Date();
    }

    await payout.save();
    await payout.populate('organizerId', 'name email organizationName');

    console.log(`✅ Payout ${payoutId} status updated to ${status} by ${req.admin.email}`);

    res.json({
      message: 'Payout status updated successfully',
      payout,
    });
  } catch (error) {
    console.error('Update payout status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate bulk payouts for all organizers
export const generateBulkPayouts = async (req, res) => {
  try {
    const { periodStart, periodEnd } = req.body;

    const settings = await SystemSettings.findOne({ settingsType: 'global' });
    const commissionRate = settings?.commissionRate || 10;
    const minimumPayout = settings?.minimumPayout || 0;

    // Get all organizers
    const organizers = await User.find({ role: 'organizer' });

    const payoutsCreated = [];
    const skipped = [];

    for (const organizer of organizers) {
      const events = await Event.find({ organizerId: organizer._id });
      const eventIds = events.map(e => e._id);

      // Get bookings in the period
      const bookings = await Booking.find({
        eventId: { $in: eventIds },
        paymentStatus: 'completed',
        createdAt: { $gte: new Date(periodStart), $lte: new Date(periodEnd) },
      });

      const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
      
      if (totalRevenue === 0) {
        skipped.push({ organizer: organizer.name, reason: 'No revenue in period' });
        continue;
      }

      const commissionAmount = (totalRevenue * commissionRate) / 100;
      const netAmount = totalRevenue - commissionAmount;

      if (netAmount < minimumPayout) {
        skipped.push({
          organizer: organizer.name,
          reason: `Below minimum payout (Rs ${minimumPayout})`,
          amount: netAmount,
        });
        continue;
      }

      const payout = await Payout.create({
        organizerId: organizer._id,
        amount: totalRevenue,
        commissionAmount,
        commissionRate,
        netAmount,
        status: 'pending',
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        notes: `Bulk payout for period ${periodStart} to ${periodEnd}`,
      });

      payoutsCreated.push({
        organizer: organizer.name,
        amount: netAmount,
        payoutId: payout._id,
      });
    }

    console.log(`✅ Bulk payouts generated: ${payoutsCreated.length} created, ${skipped.length} skipped`);

    res.json({
      message: 'Bulk payouts generated successfully',
      created: payoutsCreated,
      skipped,
      summary: {
        totalCreated: payoutsCreated.length,
        totalSkipped: skipped.length,
        totalAmount: payoutsCreated.reduce((sum, p) => sum + p.amount, 0),
      },
    });
  } catch (error) {
    console.error('Generate bulk payouts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default {
  getAllPayouts,
  calculatePendingPayout,
  createPayout,
  updatePayoutStatus,
  generateBulkPayouts,
};
