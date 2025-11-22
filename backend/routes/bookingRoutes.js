import express from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  verifyPayment,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
  getEventBookings,
  getOrganizerBookings,
  verifyTicket,
  getTicketVerificationStatus,
  cancelTicket,
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const createBookingValidation = [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('attendeeDetails').isArray({ min: 1 }).withMessage('Attendee details must be an array with at least 1 item'),
];

const verifyPaymentValidation = [
  body('razorpayOrderId').notEmpty().withMessage('Razorpay Order ID is required'),
  body('razorpayPaymentId').notEmpty().withMessage('Razorpay Payment ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Razorpay Signature is required'),
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
];

const verifyTicketValidation = [
  body('ticketNumber').notEmpty().withMessage('Ticket number is required'),
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
];

// Specific routes MUST come before generic :id routes
// Protected routes (user)
router.post('/', authenticate, authorize('user'), createBookingValidation, createBooking);
router.get('/my-bookings', authenticate, authorize('user'), getUserBookings);
router.post('/verify-payment', authenticate, authorize('user'), verifyPaymentValidation, verifyPayment);

// Protected routes (organizer) - specific routes before :id
router.get('/organizer/all-bookings', authenticate, authorize('organizer'), getOrganizerBookings);
router.post('/verify-ticket', authenticate, authorize('organizer'), verifyTicketValidation, verifyTicket);
router.post('/cancel-ticket', authenticate, authorize('organizer'), cancelTicket);
router.get('/ticket-status', authenticate, authorize('organizer'), getTicketVerificationStatus);
router.get('/event/:eventId/bookings', authenticate, authorize('organizer'), getEventBookings);

// Generic routes - MUST be last
router.get('/:id', authenticate, authorize('user'), getBookingDetails);
router.delete('/:id', authenticate, authorize('user'), cancelBooking);

export default router;
