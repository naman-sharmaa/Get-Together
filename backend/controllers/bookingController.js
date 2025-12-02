import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { sendBookingConfirmationEmail, sendPaymentFailureEmail } from '../utils/emailService.js';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Generate unique ticket number
const generateTicketNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TKT-${timestamp}-${random}`;
};

// Create booking and initiate payment
export const createBooking = async (req, res) => {
  try {
    const { eventId, quantity, attendeeDetails } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!eventId || !quantity || !attendeeDetails) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (quantity !== attendeeDetails.length) {
      return res.status(400).json({ message: 'Quantity must match attendee details count' });
    }

    // Validate phone numbers
    for (let i = 0; i < attendeeDetails.length; i++) {
      const { phone } = attendeeDetails[i];
      if (!phone) {
        return res.status(400).json({ message: `Phone number is required for attendee ${i + 1}` });
      }
      // Try to parse and validate phone number
      // Assume international format if not provided (e.g., starts with +)
      let phoneToValidate = phone.trim();
      if (!phoneToValidate.startsWith('+')) {
        // Default to India country code if no + prefix
        phoneToValidate = '+91' + phoneToValidate;
      }
      if (!isValidPhoneNumber(phoneToValidate)) {
        return res.status(400).json({ 
          message: `Invalid phone number for attendee ${i + 1}. Please provide a valid phone number with country code (e.g., +919876543210)` 
        });
      }
    }

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if booking is still open
    if (new Date() > new Date(event.bookingExpiry)) {
      return res.status(400).json({ message: 'Booking period has expired for this event' });
    }

    // Check available tickets
    if (event.availableTickets < quantity) {
      return res.status(400).json({ 
        message: `Only ${event.availableTickets} tickets available` 
      });
    }

    // Calculate total price
    const totalPrice = event.price * quantity;

    // Create booking with pending status
    const booking = new Booking({
      userId,
      eventId,
      quantity,
      totalPrice,
      attendeeDetails,
      status: 'pending',
    });

    await booking.save();

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalPrice * 100), // Amount in paise
      currency: 'INR',
      receipt: booking._id.toString(),
      notes: {
        bookingId: booking._id.toString(),
        eventId: eventId,
        userId: userId,
      },
    });

    // Update booking with Razorpay order ID
    booking.razorpayOrderId = razorpayOrder.id;
    await booking.save();

    res.status(201).json({
      message: 'Booking initiated',
      booking: {
        _id: booking._id,
        razorpayOrderId: razorpayOrder.id,
        amount: totalPrice,
        quantity,
        eventId,
      },
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify payment and confirm booking
export const verifyPayment = async (req, res) => {
  console.log('🔍 verifyPayment called');
  console.log('Request body:', req.body);
  
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;
    
    console.log('📝 Payment verification data:', {
      razorpayOrderId,
      razorpayPaymentId,
      bookingId
    });

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.log('❌ Signature verification failed');
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    console.log('✅ Signature verified successfully');

    // Update booking
    console.log('📦 Updating booking:', bookingId);
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: 'confirmed',
        razorpayPaymentId,
        razorpaySignature,
      },
      { new: true }
    ).populate('eventId userId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Generate ticket numbers
    const ticketNumbers = [];
    for (let i = 0; i < booking.quantity; i++) {
      ticketNumbers.push(generateTicketNumber());
    }
    booking.ticketNumbers = ticketNumbers;

    // Update event available tickets
    const event = await Event.findByIdAndUpdate(
      booking.eventId._id,
      { $inc: { availableTickets: -booking.quantity } },
      { new: true }
    );

    await booking.save();

    // Send confirmation email
    try {
      console.log('📧 Attempting to send confirmation email to:', booking.userId.email);
      await sendBookingConfirmationEmail(booking, booking.eventId, booking.userId);
      console.log('✅ Confirmation email sent successfully');
    } catch (emailError) {
      console.error('❌ Error sending confirmation email:', emailError);
      console.error('Email error details:', {
        message: emailError.message,
        stack: emailError.stack
      });
      // Don't fail the booking if email fails
    }

    res.json({
      message: 'Payment verified and booking confirmed',
      booking: {
        _id: booking._id,
        ticketNumbers: booking.ticketNumbers,
        eventId: booking.eventId._id,
        quantity: booking.quantity,
        totalPrice: booking.totalPrice,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    // Return all bookings (including cancelled) so user can see their full ticket history
    const bookings = await Booking.find({ userId })
      .populate('eventId', 'title date location price category imageUrl')
      .sort({ createdAt: -1 });

    // Check and update expired tickets
    for (const booking of bookings) {
      if (!booking.eventId) continue;

      const eventDate = new Date(booking.eventId.date);
      
      // Initialize ticketDetails if not present
      if (!booking.ticketDetails || booking.ticketDetails.length === 0) {
        booking.ticketDetails = booking.ticketNumbers.map((tNum, index) => ({
          ticketNumber: tNum,
          attendeeName: booking.attendeeDetails[index]?.name || '',
          attendeeEmail: booking.attendeeDetails[index]?.email || '',
          attendeePhone: booking.attendeeDetails[index]?.phone || '',
          status: 'active',
          refundStatus: 'not_initiated',
        }));
      }

      // If event has passed and not yet marked as expired, update it
      if (eventDate < now && !booking.isExpired) {
        booking.ticketDetails.forEach(ticket => {
          if (ticket.status === 'active') {
            ticket.status = 'expired';
          }
        });
        booking.isExpired = true;
        booking.expiryCheckedAt = now;
        await booking.save();
      }
    }

    res.json({ bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get booking details
export const getBookingDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(id)
      .populate('eventId')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.userId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json({ booking });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be cancelled' });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Refund tickets back to event
    await Event.findByIdAndUpdate(
      booking.eventId,
      { $inc: { availableTickets: booking.quantity } },
      { new: true }
    );

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get event bookings (for organizer analytics)
export const getEventBookings = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // Verify organizer owns this event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId.toString() !== organizerId) {
      return res.status(403).json({ message: 'Not authorized to view this event' });
    }

    // Get bookings for this event
    const bookings = await Booking.find({ eventId, status: 'confirmed' })
      .populate('userId', 'name email phone')
      .populate('eventId', 'title date location organizationName')
      .sort({ createdAt: -1 });

    // Calculate analytics
    const totalBookings = bookings.length;
    const totalTickets = bookings.reduce((sum, b) => sum + b.quantity, 0);
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({
      bookings,
      analytics: {
        totalBookings,
        totalTickets,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Get event bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all bookings for organizer's events (for ticket verification)
export const getOrganizerBookings = async (req, res) => {
  try {
    const organizerId = req.user.id;

    // Get all events for this organizer
    const events = await Event.find({ organizerId });
    const eventIds = events.map(e => e._id);

    // Get all confirmed bookings for these events
    const bookings = await Booking.find({ 
      eventId: { $in: eventIds }, 
      status: 'confirmed' 
    })
      .populate('userId', 'name email phone')
      .populate('eventId', 'title date location organizationName')
      .sort({ createdAt: -1 });

    // Calculate cancellation statistics
    let totalCancelledTickets = 0;
    let totalRefundAmount = 0;
    const recentCancellations = [];

    bookings.forEach(booking => {
      if (booking.ticketDetails && booking.ticketDetails.length > 0) {
        booking.ticketDetails.forEach(ticket => {
          if (ticket.status === 'cancelled') {
            totalCancelledTickets++;
            totalRefundAmount += ticket.refundAmount || 0;
            
            // Add to recent cancellations (limit to 10 most recent)
            if (recentCancellations.length < 10) {
              recentCancellations.push({
                ticketNumber: ticket.ticketNumber,
                eventTitle: booking.eventId.title,
                customerName: booking.userId.name,
                cancelledAt: ticket.cancelledAt,
                refundAmount: ticket.refundAmount,
              });
            }
          }
        });
      }
    });

    res.json({
      bookings,
      totalBookings: bookings.length,
      totalTickets: bookings.reduce((sum, b) => sum + b.quantity, 0),
      totalCancelledTickets,
      totalRefundAmount,
      recentCancellations: recentCancellations.sort((a, b) => 
        new Date(b.cancelledAt) - new Date(a.cancelledAt)
      ),
    });
  } catch (error) {
    console.error('Get organizer bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify a ticket and update its status in database
export const verifyTicket = async (req, res) => {
  try {
    const { ticketNumber, bookingId, verificationStatus = 'approved' } = req.body;
    const organizerId = req.user.id;

    if (!ticketNumber || !bookingId) {
      return res.status(400).json({ message: 'Ticket number and booking ID are required' });
    }

    if (!['approved', 'denied'].includes(verificationStatus)) {
      return res.status(400).json({ message: 'Verification status must be "approved" or "denied"' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('eventId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify organizer owns this event
    if (booking.eventId.organizerId.toString() !== organizerId) {
      return res.status(403).json({ message: 'Not authorized to verify this ticket' });
    }

    // Check if ticket exists in this booking
    if (!booking.ticketNumbers.includes(ticketNumber)) {
      return res.status(404).json({ message: 'Ticket not found in this booking' });
    }

    // Check if already verified
    const alreadyVerified = booking.verifiedTickets.find(t => t.ticketNumber === ticketNumber);
    if (alreadyVerified) {
      return res.json({
        message: `Ticket already ${alreadyVerified.status}`,
        verified: true,
        status: alreadyVerified.status,
        verifiedAt: alreadyVerified.verifiedAt,
      });
    }

    // Add to verified tickets with status
    booking.verifiedTickets.push({
      ticketNumber,
      verifiedAt: new Date(),
      verifiedBy: organizerId,
      status: verificationStatus,
    });

    await booking.save();

    res.json({
      message: `Ticket ${verificationStatus} successfully`,
      verified: true,
      status: verificationStatus,
      verifiedAt: new Date(),
    });
  } catch (error) {
    console.error('Verify ticket error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get verification status of a ticket
export const getTicketVerificationStatus = async (req, res) => {
  try {
    const { ticketNumber, bookingId } = req.query;

    if (!ticketNumber || !bookingId) {
      return res.status(400).json({ message: 'Ticket number and booking ID are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const verifiedTicket = booking.verifiedTickets.find(t => t.ticketNumber === ticketNumber);
    
    res.json({
      ticketNumber,
      isVerified: !!verifiedTicket,
      verifiedAt: verifiedTicket?.verifiedAt || null,
    });
  } catch (error) {
    console.error('Get ticket verification status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel a ticket (organizer can cancel individual tickets from a booking)
export const cancelTicket = async (req, res) => {
  try {
    const { bookingId, ticketNumber, cancellationReason } = req.body;
    const organizerId = req.user.id;

    if (!bookingId || !ticketNumber) {
      return res.status(400).json({ message: 'Booking ID and ticket number are required' });
    }

    if (!cancellationReason || !cancellationReason.trim()) {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    // Find the booking with user details
    const booking = await Booking.findById(bookingId)
      .populate('eventId', 'title date location organizerId organizationName')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify organizer owns this event
    if (booking.eventId.organizerId.toString() !== organizerId) {
      return res.status(403).json({ message: 'Not authorized to cancel this ticket' });
    }

    // Check if ticket exists in this booking
    if (!booking.ticketNumbers.includes(ticketNumber)) {
      return res.status(404).json({ message: 'Ticket not found in this booking' });
    }

    // Initialize ticketDetails if not present (migration for old bookings)
    if (!booking.ticketDetails || booking.ticketDetails.length === 0) {
      booking.ticketDetails = booking.ticketNumbers.map((tNum, index) => ({
        ticketNumber: tNum,
        attendeeName: booking.attendeeDetails[index]?.name || '',
        attendeeEmail: booking.attendeeDetails[index]?.email || '',
        attendeePhone: booking.attendeeDetails[index]?.phone || '',
        status: 'active',
        refundStatus: 'not_initiated',
      }));
    }

    // Find the ticket in ticketDetails
    const ticketIndex = booking.ticketDetails.findIndex(
      t => t.ticketNumber === ticketNumber
    );

    if (ticketIndex === -1) {
      return res.status(404).json({ message: 'Ticket not found in booking details' });
    }

    const ticket = booking.ticketDetails[ticketIndex];

    // Check if ticket is already cancelled
    if (ticket.status === 'cancelled') {
      return res.status(400).json({ message: 'Ticket is already cancelled' });
    }

    // Calculate refund amount (per ticket price)
    const perTicketPrice = booking.totalPrice / booking.quantity;

    // Update ticket status
    ticket.status = 'cancelled';
    ticket.cancelledAt = new Date();
    ticket.cancellationReason = `Organizer cancelled: ${cancellationReason}`;
    ticket.refundStatus = 'pending';
    ticket.refundAmount = perTicketPrice;

    // Add to legacy cancelledTickets array for backward compatibility
    if (!booking.cancelledTickets) {
      booking.cancelledTickets = [];
    }
    if (!booking.cancelledTickets.includes(ticketNumber)) {
      booking.cancelledTickets.push(ticketNumber);
    }

    // Check if all tickets are cancelled
    const allCancelled = booking.ticketDetails.every(t => t.status === 'cancelled');
    if (allCancelled) {
      booking.status = 'cancelled';
    }

    await booking.save();

    // Refund ticket back to event inventory
    await Event.findByIdAndUpdate(
      booking.eventId._id,
      { $inc: { availableTickets: 1 } },
      { new: true }
    );

    // Import email service and send notifications
    const { sendOrganizerCancellationEmails } = await import('../utils/emailService.js');
    await sendOrganizerCancellationEmails(booking, ticket, booking.eventId);

    res.json({
      message: 'Ticket cancelled successfully. User has been notified.',
      booking: {
        _id: booking._id,
        cancelledTickets: booking.cancelledTickets,
      },
      ticket: {
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        refundAmount: ticket.refundAmount,
      },
    });
  } catch (error) {
    console.error('Cancel ticket error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User cancels their own ticket
export const cancelUserTicket = async (req, res) => {
  try {
    const { bookingId, ticketNumber, cancellationReason } = req.body;
    const userId = req.user.id;

    if (!bookingId || !ticketNumber) {
      return res.status(400).json({ message: 'Booking ID and ticket number are required' });
    }

    // Find booking
    const booking = await Booking.findById(bookingId)
      .populate('eventId', 'title date location organizerId organizationName')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify user owns this booking
    if (booking.userId._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this ticket' });
    }

    // Check if event has already passed
    const eventDate = new Date(booking.eventId.date);
    const now = new Date();
    
    // Check if booking has ticketDetails array
    if (!booking.ticketDetails || booking.ticketDetails.length === 0) {
      // Migrate old data to new structure if needed
      booking.ticketDetails = booking.ticketNumbers.map((tNum, index) => ({
        ticketNumber: tNum,
        attendeeName: booking.attendeeDetails[index]?.name || '',
        attendeeEmail: booking.attendeeDetails[index]?.email || '',
        attendeePhone: booking.attendeeDetails[index]?.phone || '',
        status: 'active',
        refundStatus: 'not_initiated',
      }));
    }

    // Find the ticket in ticketDetails
    const ticketIndex = booking.ticketDetails.findIndex(
      t => t.ticketNumber === ticketNumber
    );

    if (ticketIndex === -1) {
      return res.status(404).json({ message: 'Ticket not found in booking' });
    }

    const ticket = booking.ticketDetails[ticketIndex];

    // Check if ticket is already cancelled
    if (ticket.status === 'cancelled') {
      return res.status(400).json({ message: 'Ticket is already cancelled' });
    }

    // Check if ticket has expired
    if (ticket.status === 'expired') {
      return res.status(400).json({ message: 'Cannot cancel an expired ticket' });
    }

    // Calculate refund amount (per ticket price)
    const perTicketPrice = booking.totalPrice / booking.quantity;
    
    // Update ticket status
    ticket.status = 'cancelled';
    ticket.cancelledAt = new Date();
    ticket.cancellationReason = cancellationReason || 'User requested cancellation';
    ticket.refundStatus = 'pending';
    ticket.refundAmount = perTicketPrice;

    // Also add to legacy cancelledTickets array for backward compatibility
    if (!booking.cancelledTickets) {
      booking.cancelledTickets = [];
    }
    if (!booking.cancelledTickets.includes(ticketNumber)) {
      booking.cancelledTickets.push(ticketNumber);
    }

    // Check if all tickets are cancelled
    const allCancelled = booking.ticketDetails.every(t => t.status === 'cancelled');
    if (allCancelled) {
      booking.status = 'cancelled';
    }

    await booking.save();

    // Return ticket to event inventory
    await Event.findByIdAndUpdate(
      booking.eventId._id,
      { $inc: { availableTickets: 1 } },
      { new: true }
    );

    // Import email service dynamically to avoid circular dependencies
    const { sendTicketCancellationEmails } = await import('../utils/emailService.js');
    
    // Send cancellation emails (user, organizer, admin)
    await sendTicketCancellationEmails(booking, ticket, booking.eventId);

    res.json({
      message: 'Ticket cancelled successfully. Refund will be processed within 5-7 business days.',
      ticket: {
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        refundAmount: ticket.refundAmount,
        refundStatus: ticket.refundStatus,
      },
    });
  } catch (error) {
    console.error('Cancel user ticket error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check and update expired tickets
export const checkExpiredTickets = async (req, res) => {
  try {
    const now = new Date();

    // Find all confirmed bookings with events that have passed
    const bookings = await Booking.find({
      status: { $in: ['confirmed', 'pending'] },
      isExpired: { $ne: true },
    }).populate('eventId', 'date');

    let updatedCount = 0;

    for (const booking of bookings) {
      if (!booking.eventId) continue;

      const eventDate = new Date(booking.eventId.date);
      
      // If event has passed, mark tickets as expired
      if (eventDate < now) {
        // Initialize ticketDetails if not present
        if (!booking.ticketDetails || booking.ticketDetails.length === 0) {
          booking.ticketDetails = booking.ticketNumbers.map((tNum, index) => ({
            ticketNumber: tNum,
            attendeeName: booking.attendeeDetails[index]?.name || '',
            attendeeEmail: booking.attendeeDetails[index]?.email || '',
            attendeePhone: booking.attendeeDetails[index]?.phone || '',
            status: 'active',
            refundStatus: 'not_initiated',
          }));
        }

        // Mark all active tickets as expired
        booking.ticketDetails.forEach(ticket => {
          if (ticket.status === 'active') {
            ticket.status = 'expired';
          }
        });

        booking.isExpired = true;
        booking.expiryCheckedAt = now;
        await booking.save();
        updatedCount++;
      }
    }

    res.json({
      message: `Checked and updated ${updatedCount} expired bookings`,
      updatedCount,
    });
  } catch (error) {
    console.error('Check expired tickets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
