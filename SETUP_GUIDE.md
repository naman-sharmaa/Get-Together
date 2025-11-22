# TicketCharge Hub - Setup & Feature Guide

## Overview
TicketCharge Hub is a comprehensive event ticketing platform with support for both users and organizers. This guide covers all recent implementations and setup instructions.

---

## Recent Features Implemented

### 1. **Razorpay Payment Gateway** ✅
- Integrated Razorpay for secure payment processing
- OTP-based payment verification
- Automatic ticket generation upon successful payment
- Support for INR currency

**Files Modified:**
- `backend/controllers/bookingController.js` - Payment creation and verification
- `src/components/RazorpayPayment.tsx` - Frontend payment UI with error handling
- `backend/models/Booking.js` - Payment tracking fields

**Setup Required:**
```bash
# Install Razorpay package (already done)
npm install razorpay

# Add to .env:
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

### 2. **Currency Changed to INR** ✅
- All pricing now displays in Indian Rupees (₹)
- Organizer event creation form updated
- Event cards display INR pricing

**Files Modified:**
- `src/components/organizer/EventManagement.tsx` - Price field label and display
- `src/pages/Index.tsx` - Event card pricing
- `src/pages/AllEvents.tsx` - All events page pricing

---

### 3. **View All Events Functionality** ✅
- Added "View All" buttons for Upcoming and Past Events sections
- Created dedicated `/all-events` page with filtering
- Search by title, location, or description
- Filter by category
- Responsive grid layout

**Files Created:**
- `src/pages/AllEvents.tsx` - Full events listing page

**Files Modified:**
- `src/pages/Index.tsx` - Added "View All" button navigation
- `src/App.tsx` - Added route for `/all-events`

---

### 4. **OTP Authentication System** ✅
Complete OTP-based authentication for both users and organizers.

#### Features:
- **OTP Login**: Login without password using email OTP
- **Password Reset**: Recover account with OTP verification
- **Phone Verification**: Verify and update phone number with OTP
- **Email Notifications**: OTP sent via email with 10-minute expiry
- **Security**: Max 3 attempts per OTP, auto-deletion after expiry

**Backend Files Created:**
- `backend/models/OTP.js` - OTP data model
- `backend/utils/otpService.js` - OTP generation, sending, verification
- `backend/controllers/otpAuthController.js` - OTP authentication endpoints

**Backend Files Modified:**
- `backend/models/User.js` - Added OTP verification fields
- `backend/routes/authRoutes.js` - Added OTP endpoints
- `backend/package.json` - Added nodemailer dependency

**Frontend Files Created:**
- `src/pages/OTPLogin.tsx` - OTP login interface
- `src/pages/ForgotPassword.tsx` - Password reset with OTP

**Frontend Files Modified:**
- `src/lib/api.ts` - Added OTP API methods
- `src/App.tsx` - Added routes for OTP login and forgot password
- `src/contexts/AuthContext.tsx` - Updated User interface with phone field

---

### 5. **Organizer Profile & Phone Field** ✅
- Added phone number field to user profiles
- Organizer settings page with profile management
- Phone verification capability
- Profile update functionality

**Files Created:**
- `src/components/organizer/OrganizerSettings.tsx` - Settings page component

**Files Modified:**
- `backend/models/User.js` - Added phone and verification fields
- `src/contexts/AuthContext.tsx` - Updated User interface
- `src/pages/OrganizerDashboard.tsx` - Added Settings tab

---

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticketcharge_hub

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email (Gmail)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Server
PORT=5050
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5050/api
```

---

## Installation & Running

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Run development server
npm run dev

# Run production server
npm start
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

---

## API Endpoints

### Authentication Endpoints

#### OTP Login
```
POST /api/auth/request-login-otp
Body: { email: string, role?: 'user' | 'organizer' }

POST /api/auth/verify-login-otp
Body: { email: string, otp: string, role?: 'user' | 'organizer' }
```

#### Password Reset
```
POST /api/auth/request-password-reset-otp
Body: { email: string, role?: 'user' | 'organizer' }

POST /api/auth/reset-password-otp
Body: { email: string, otp: string, newPassword: string, role?: 'user' | 'organizer' }
```

#### Phone Verification
```
POST /api/auth/request-phone-verification-otp
Body: { email: string, phone: string, role?: 'user' | 'organizer' }

POST /api/auth/verify-phone-otp
Body: { email: string, otp: string, phone: string, role?: 'user' | 'organizer' }
```

#### Traditional Auth
```
POST /api/auth/signup
POST /api/auth/signin
GET /api/auth/me (requires authentication)
```

---

## User Flows

### OTP Login Flow
1. User navigates to `/otp-login`
2. Selects role (User/Organizer)
3. Enters email address
4. System sends 6-digit OTP to email
5. User enters OTP
6. System verifies and logs in user
7. Redirects to dashboard

### Forgot Password Flow
1. User navigates to `/forgot-password`
2. Selects role (User/Organizer)
3. Enters email address
4. System sends password reset OTP
5. User enters OTP
6. User sets new password
7. System updates password and redirects to login

### Organizer Profile Update
1. Organizer logs in
2. Goes to Dashboard → Settings tab
3. Updates name, phone, organization name
4. Clicks "Save Changes"
5. Profile is updated in database

---

## Testing Checklist

### Payment Gateway
- [ ] Create event with price in INR
- [ ] Book tickets
- [ ] Proceed to payment
- [ ] Razorpay modal opens
- [ ] Complete payment
- [ ] Tickets generated successfully

### OTP Authentication
- [ ] Request OTP login
- [ ] Receive OTP email
- [ ] Verify OTP and login
- [ ] Request password reset
- [ ] Verify reset OTP
- [ ] Update password successfully
- [ ] Login with new password

### Events & Filtering
- [ ] View Upcoming Events
- [ ] View Past Events
- [ ] Click "View All" buttons
- [ ] Search events by title
- [ ] Filter by category
- [ ] Events display in grid layout

### Organizer Features
- [ ] Create event with INR pricing
- [ ] Update organizer profile
- [ ] Add phone number
- [ ] View Settings tab
- [ ] Update profile information

---

## Important Notes

### Email Configuration
- Uses Gmail SMTP for sending OTPs
- Requires Gmail App Password (not regular password)
- To generate App Password:
  1. Go to Google Account settings
  2. Enable 2-Factor Authentication
  3. Generate App Password for Mail
  4. Use this password in EMAIL_PASSWORD

### OTP Expiry
- OTP valid for 10 minutes
- Maximum 3 verification attempts
- Auto-deleted after expiry or successful verification

### Security
- All passwords hashed with bcryptjs
- JWT tokens expire after 7 days
- OTP attempts tracked to prevent brute force
- Phone verification optional but recommended

---

## Troubleshooting

### Razorpay Not Loading
- Check RAZORPAY_KEY_ID is correct
- Verify CORS settings in backend
- Check browser console for errors

### OTP Not Sending
- Verify EMAIL_USER and EMAIL_PASSWORD in .env
- Check Gmail App Password is correct
- Ensure 2FA is enabled on Gmail account
- Check spam folder for OTP email

### MongoDB Connection Error
- Verify MONGODB_URI is correct
- Check IP is whitelisted in MongoDB Atlas
- Ensure network connectivity

### Port Already in Use
- Change PORT in .env
- Or kill process using port 5050

---

## Future Enhancements

- [ ] SMS OTP delivery
- [ ] Two-Factor Authentication (2FA)
- [ ] Social login (Google, GitHub)
- [ ] Email templates customization
- [ ] Bulk event import
- [ ] Advanced analytics dashboard
- [ ] Refund management system
- [ ] Event cancellation with automatic refunds

---

## Support

For issues or questions, please check:
1. Console logs for error messages
2. MongoDB Atlas for data verification
3. Email settings for OTP delivery
4. Razorpay dashboard for payment status

---

**Last Updated:** November 17, 2025
**Version:** 1.0.0
