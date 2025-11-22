import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { sendBookingConfirmationEmail, sendPaymentFailureEmail } from '../utils/emailService.js';

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
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, bookingId } = req.body;

    // Verify signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update booking
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
      await sendBookingConfirmationEmail(booking, booking.eventId, booking.userId);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
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

    const bookings = await Booking.find({ userId, status: 'confirmed' })
      .populate('eventId', 'title date location price category imageUrl')
      .sort({ createdAt: -1 });

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

    res.json({
      bookings,
      totalBookings: bookings.length,
      totalTickets: bookings.reduce((sum, b) => sum + b.quantity, 0),
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
    const { bookingId, ticketNumber } = req.body;
    const organizerId = req.user.id;

    if (!bookingId || !ticketNumber) {
      return res.status(400).json({ message: 'Booking ID and ticket number are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('eventId');
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

    // Check if ticket is already cancelled
    const cancelledTickets = booking.cancelledTickets || [];
    if (cancelledTickets.includes(ticketNumber)) {
      return res.status(400).json({ message: 'Ticket is already cancelled' });
    }

    // Add ticket to cancelled list
    if (!booking.cancelledTickets) {
      booking.cancelledTickets = [];
    }
    booking.cancelledTickets.push(ticketNumber);

    await booking.save();

    // Refund one ticket back to event
    await Event.findByIdAndUpdate(
      booking.eventId._id,
      { $inc: { availableTickets: 1 } },
      { new: true }
    );

    res.json({
      message: 'Ticket cancelled successfully',
      booking: {
        _id: booking._id,
        cancelledTickets: booking.cancelledTickets,
      },
    });
  } catch (error) {
    console.error('Cancel ticket error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
