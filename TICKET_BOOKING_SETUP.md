# Ticket Booking System Setup Guide

## Overview

The ticket booking system allows users to:
- Browse events and view detailed information
- Book tickets for events with multiple attendees
- Pay securely using Razorpay payment gateway
- Download tickets and view bookings in their profile
- Cancel bookings and get refunds

Organizers can:
- View booking analytics and revenue
- Track ticket sales in real-time

---

## Prerequisites

### Backend Requirements
- Node.js and npm
- MongoDB
- Razorpay Account (for payment processing)

### Frontend Requirements
- React 18+
- TypeScript
- Tailwind CSS

---

## Installation & Setup

### Step 1: Install Dependencies

#### Backend
```bash
cd backend
npm install razorpay
```

#### Frontend
No additional dependencies needed (Razorpay script is loaded dynamically)

---

### Step 2: Configure Environment Variables

#### Backend (.env)
```
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Other existing variables
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5050
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Get Razorpay Credentials
1. Sign up at https://razorpay.com
2. Go to Settings → API Keys
3. Copy your Key ID and Key Secret
4. Add them to your .env file

---

### Step 3: Database Migration

The Booking model has been updated with new fields. MongoDB will automatically create the collection when the first booking is made.

---

### Step 4: Start the Application

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
npm run dev
```

---

## Features Implemented

### 1. Event Detail Page (`/event/:id`)
- Full event information display
- Booking expiry status
- Available tickets count
- Organizer information
- Booking form with ticket quantity selector

### 2. Booking Form
- Quantity selector (1-available tickets)
- Attendee details form (name, email, phone)
- Price calculation
- Form validation
- Seamless integration with Razorpay

### 3. Razorpay Payment Integration
- Secure payment processing
- Order creation and verification
- Signature validation
- Payment confirmation

### 4. Ticket Generation
- Unique ticket numbers (format: TKT-TIMESTAMP-RANDOM)
- One ticket number per attendee
- Stored in booking record

### 5. User Profile Page (`/profile`)
- View all confirmed bookings
- Download tickets as text file
- Cancel bookings
- View ticket numbers and attendee details
- Booking history

### 6. Organizer Analytics
- View all bookings for an event
- Total bookings count
- Total tickets sold
- Total revenue
- Attendee information

---

## API Endpoints

### Booking Endpoints

#### Create Booking (Protected - User)
```
POST /api/bookings
Authorization: Bearer {token}

Body:
{
  "eventId": "event_id",
  "quantity": 2,
  "attendeeDetails": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890"
    },
    {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "0987654321"
    }
  ]
}

Response:
{
  "message": "Booking initiated",
  "booking": {
    "_id": "booking_id",
    "razorpayOrderId": "order_id",
    "amount": 200,
    "quantity": 2,
    "eventId": "event_id"
  },
  "razorpayKey": "key_id"
}
```

#### Verify Payment (Protected - User)
```
POST /api/bookings/verify-payment
Authorization: Bearer {token}

Body:
{
  "razorpayOrderId": "order_id",
  "razorpayPaymentId": "payment_id",
  "razorpaySignature": "signature",
  "bookingId": "booking_id"
}

Response:
{
  "message": "Payment verified and booking confirmed",
  "booking": {
    "_id": "booking_id",
    "ticketNumbers": ["TKT-ABC123-XYZ", "TKT-ABC124-XYZ"],
    "eventId": "event_id",
    "quantity": 2,
    "totalPrice": 200,
    "status": "confirmed"
  }
}
```

#### Get User Bookings (Protected - User)
```
GET /api/bookings/my-bookings
Authorization: Bearer {token}

Response:
{
  "bookings": [
    {
      "_id": "booking_id",
      "eventId": { ...event details... },
      "quantity": 2,
      "totalPrice": 200,
      "status": "confirmed",
      "ticketNumbers": [...],
      "attendeeDetails": [...],
      "createdAt": "2024-11-15T..."
    }
  ]
}
```

#### Get Booking Details (Protected - User)
```
GET /api/bookings/:id
Authorization: Bearer {token}

Response:
{
  "booking": { ...booking details... }
}
```

#### Cancel Booking (Protected - User)
```
DELETE /api/bookings/:id
Authorization: Bearer {token}

Response:
{
  "message": "Booking cancelled successfully",
  "booking": { ...updated booking... }
}
```

#### Get Event Bookings (Protected - Organizer)
```
GET /api/bookings/event/:eventId/bookings
Authorization: Bearer {token}

Response:
{
  "bookings": [...],
  "analytics": {
    "totalBookings": 10,
    "totalTickets": 25,
    "totalRevenue": 2500
  }
}
```

---

## Database Schema

### Booking Model
```javascript
{
  userId: ObjectId (ref: User),
  eventId: ObjectId (ref: Event),
  quantity: Number,
  totalPrice: Number,
  status: String (enum: ['pending', 'confirmed', 'cancelled', 'refunded']),
  
  // Payment Details
  razorpayOrderId: String (unique),
  razorpayPaymentId: String (unique),
  razorpaySignature: String,
  
  // Ticket Details
  ticketNumbers: [String],
  attendeeDetails: [
    {
      name: String,
      email: String,
      phone: String
    }
  ],
  
  // PDF and Download
  pdfUrl: String,
  downloadCount: Number,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## User Flow

### Booking Flow
1. User browses events on home page
2. Clicks on an event card → navigates to `/event/:id`
3. Views event details and available tickets
4. Clicks "Book Now" button
5. Fills in ticket quantity and attendee details
6. Clicks "Proceed to Payment"
7. Razorpay payment modal opens
8. User completes payment
9. Payment is verified on backend
10. Booking is confirmed with ticket numbers generated
11. User is redirected to `/profile`
12. User can download tickets or cancel booking

### Organizer Flow
1. Organizer logs in to dashboard
2. Goes to Analytics section
3. Views bookings for each event
4. Sees total bookings, tickets sold, and revenue
5. Can view attendee details

---

## Testing

### Test Razorpay Credentials (Development)
Use these test credentials for development:

**Test Card Numbers:**
- Success: 4111 1111 1111 1111
- Failure: 4222 2222 2222 2222

**Expiry:** Any future date
**CVV:** Any 3-digit number

### Manual Testing Steps

1. **Create Event**
   - Log in as organizer
   - Create an event with booking expiry in future
   - Set available tickets

2. **Book Tickets**
   - Log in as user
   - Click on event
   - Fill booking form with 2 attendees
   - Proceed to payment
   - Use test card 4111 1111 1111 1111
   - Complete payment

3. **Verify Booking**
   - Go to user profile
   - Verify booking appears
   - Check ticket numbers
   - Download ticket
   - Cancel booking (if needed)

4. **Check Analytics**
   - Log in as organizer
   - Go to analytics
   - Verify booking appears
   - Check revenue calculation

---

## Troubleshooting

### Payment Not Processing
- Verify Razorpay credentials in .env
- Check browser console for errors
- Ensure Razorpay script is loaded (check Network tab)
- Verify order amount is in paise (multiply by 100)

### Booking Not Appearing
- Verify user is authenticated
- Check MongoDB connection
- Verify booking status is 'confirmed'
- Check browser console for errors

### Ticket Numbers Not Generated
- Verify payment verification succeeded
- Check booking status in database
- Verify ticketNumbers array is populated

### Organizer Analytics Not Showing
- Verify organizer owns the event
- Check event ID is correct
- Verify bookings have 'confirmed' status

---

## Security Considerations

1. **Payment Verification**
   - Always verify Razorpay signature on backend
   - Never trust client-side payment data

2. **Authorization**
   - Users can only view their own bookings
   - Organizers can only view their own events' bookings
   - Implement proper role-based access control

3. **Data Validation**
   - Validate attendee details on backend
   - Validate quantity against available tickets
   - Check booking expiry before creating booking

4. **API Security**
   - Use HTTPS in production
   - Implement rate limiting
   - Validate all input data
   - Use environment variables for secrets

---

## Performance Optimization

1. **Database Indexes**
   - Bookings indexed by userId and eventId
   - Razorpay IDs are unique for quick lookup

2. **Caching**
   - Cache event details
   - Cache user bookings
   - Invalidate cache on booking changes

3. **Pagination**
   - Implement pagination for large booking lists
   - Limit query results

---

## Future Enhancements

1. **PDF Ticket Generation**
   - Generate PDF tickets with QR codes
   - Email tickets to attendees
   - Implement ticket scanning at event

2. **Refunds**
   - Implement refund processing
   - Track refund status
   - Send refund notifications

3. **Notifications**
   - Email confirmation after booking
   - SMS reminders before event
   - Cancellation notifications

4. **Advanced Analytics**
   - Revenue charts and graphs
   - Booking trends
   - Attendee demographics

5. **Bulk Booking**
   - Allow corporate/group bookings
   - Discount codes
   - Invoice generation

---

## Support & Documentation

For more information:
- See `FEATURES.md` for feature overview
- See `IMPLEMENTATION_COMPLETE.md` for implementation details
- Check backend logs for debugging
- Review Razorpay documentation: https://razorpay.com/docs/

---

## Deployment Checklist

- [ ] Set Razorpay credentials in production .env
- [ ] Update FRONTEND_URL in backend .env
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for production domain
- [ ] Test payment flow in production
- [ ] Monitor error logs
- [ ] Set up email notifications
- [ ] Configure backup strategy
- [ ] Test disaster recovery

---

**Status: Ready for Production** ✅
