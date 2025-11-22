# Ticket Booking System - Quick Reference

## 🎯 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install razorpay
```

### 2. Configure Environment
```bash
# Add to backend/.env
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### 3. Start Application
```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
npm run dev
```

### 4. Test Booking
1. Go to http://localhost:5173
2. Click on any event card
3. Click "Book Now"
4. Fill in attendee details
5. Click "Proceed to Payment"
6. Use test card: 4111 1111 1111 1111
7. Complete payment
8. View booking in profile

---

## 📂 File Structure

```
ticketcharge-hub-main/
├── backend/
│   ├── controllers/
│   │   └── bookingController.js (NEW)
│   ├── models/
│   │   └── Booking.js (MODIFIED)
│   ├── routes/
│   │   └── bookingRoutes.js (NEW)
│   └── server.js (MODIFIED)
├── src/
│   ├── pages/
│   │   ├── EventDetail.tsx (NEW)
│   │   └── UserProfile.tsx (NEW)
│   ├── components/
│   │   ├── BookingForm.tsx (NEW)
│   │   ├── RazorpayPayment.tsx (NEW)
│   │   ├── EventCard.tsx (MODIFIED)
│   │   └── Header.tsx (MODIFIED)
│   ├── lib/
│   │   └── api.ts (MODIFIED)
│   └── App.tsx (MODIFIED)
```

---

## 🔗 Routes

### User Routes
- `GET /` - Home page with events
- `GET /event/:id` - Event detail page
- `GET /profile` - User profile with bookings

### API Routes
- `POST /api/bookings` - Create booking
- `POST /api/bookings/verify-payment` - Verify payment
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/event/:eventId/bookings` - Get event bookings (organizer)

---

## 💻 Key Components

### EventDetail.tsx
- Displays full event information
- Shows booking form
- Handles booking initiation

### BookingForm.tsx
- Quantity selector
- Attendee details form
- Price calculation
- Form validation

### RazorpayPayment.tsx
- Razorpay modal integration
- Payment processing
- Success/failure handling

### UserProfile.tsx
- Display user bookings
- Download tickets
- Cancel bookings

---

## 🔑 Key Functions

### Backend
```javascript
// bookingController.js
createBooking()        // Create booking and Razorpay order
verifyPayment()        // Verify payment and confirm booking
getUserBookings()      // Get user's bookings
getBookingDetails()    // Get specific booking
cancelBooking()        // Cancel booking
getEventBookings()     // Get event bookings (organizer)
generateTicketNumber() // Generate unique ticket number
```

### Frontend
```typescript
// bookingsAPI
createBooking()        // Create booking
verifyPayment()        // Verify payment
getUserBookings()      // Get user bookings
getBookingDetails()    // Get booking details
cancelBooking()        // Cancel booking
getEventBookings()     // Get event bookings
```

---

## 📊 Data Models

### Booking
```javascript
{
  userId: ObjectId,
  eventId: ObjectId,
  quantity: Number,
  totalPrice: Number,
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded',
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  ticketNumbers: [String],
  attendeeDetails: [{ name, email, phone }],
  pdfUrl: String,
  downloadCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Test Scenarios

### Successful Booking
1. Click event → EventDetail page
2. Click "Book Now" → BookingForm appears
3. Select quantity → Attendee fields appear
4. Fill attendee details → Form validates
5. Click "Proceed to Payment" → Razorpay modal opens
6. Enter test card 4111 1111 1111 1111 → Payment processes
7. Payment verified → Booking confirmed
8. Redirected to profile → Booking visible

### Failed Payment
1. Use test card 4222 2222 2222 2222
2. Payment fails
3. Error message displayed
4. Can retry payment

### Cancel Booking
1. Go to profile
2. Click "Cancel" on booking
3. Confirm cancellation
4. Booking status changes to 'cancelled'
5. Tickets refunded to event

---

## 🔒 Security Checklist

- ✅ JWT authentication on all protected routes
- ✅ Razorpay signature verification
- ✅ User authorization (can only view own bookings)
- ✅ Organizer authorization (can only view own events)
- ✅ Input validation on all forms
- ✅ Email format validation
- ✅ Quantity validation against available tickets
- ✅ Booking expiry check
- ✅ Unique constraints on Razorpay IDs
- ✅ Unique constraints on ticket numbers

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Payment not processing | Check Razorpay credentials in .env |
| Booking not appearing | Verify payment verification succeeded |
| Ticket numbers missing | Check booking status is 'confirmed' |
| Download not working | Verify browser download settings |
| Organizer can't see bookings | Verify organizer owns the event |
| User sees other's bookings | Check userId filter in API |

---

## 📈 Performance Tips

1. **Database Indexes**
   - Bookings indexed by userId and eventId
   - Razorpay IDs indexed for quick lookup

2. **Caching**
   - Cache event details
   - Cache user bookings
   - Invalidate on changes

3. **Pagination**
   - Implement for large booking lists
   - Limit query results

---

## 🚀 Deployment Steps

1. Set Razorpay credentials
2. Update FRONTEND_URL
3. Enable HTTPS
4. Set NODE_ENV=production
5. Configure CORS
6. Test payment flow
7. Monitor logs
8. Set up backups

---

## 📞 Support Resources

- **Razorpay Docs**: https://razorpay.com/docs/
- **MongoDB Docs**: https://docs.mongodb.com/
- **React Router**: https://reactrouter.com/
- **TypeScript**: https://www.typescriptlang.org/

---

## ✨ Features Summary

✅ Event detail page with full information
✅ Ticket booking with quantity selector
✅ Attendee details collection
✅ Razorpay payment integration
✅ Unique ticket number generation
✅ User profile with bookings
✅ Ticket download functionality
✅ Booking cancellation
✅ Organizer analytics
✅ Complete API endpoints
✅ Security and validation
✅ Error handling

---

**Ready to use!** 🎉
