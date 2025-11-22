# Verify Your Setup - Complete Checklist

## Step 1: Add Credentials to .env ✅

### File Location
```
/Users/namansharma/Desktop/ticketcharge-hub-main/backend/.env
```

### Add These Lines
```
EMAIL_USER=namansharma2109@gmail.com
EMAIL_PASSWORD=mjbz txzl pyne ruzy
FRONTEND_URL=http://localhost:8081
```

### Verify File Looks Like
```
# Email Configuration
EMAIL_USER=namansharma2109@gmail.com
EMAIL_PASSWORD=mjbz txzl pyne ruzy
FRONTEND_URL=http://localhost:8081

# MongoDB
MONGODB_URI=...

# JWT
JWT_SECRET=...

# Razorpay
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
```

---

## Step 2: Install Dependencies ✅

### Run Command
```bash
cd backend
npm install
```

### What Gets Installed
- pdfkit (PDF generation)
- qrcode (QR code generation)
- nodemailer (Email sending)

---

## Step 3: Restart Backend Server ✅

### Run Command
```bash
npm run dev
```

### Expected Console Output
```
✅ Email configuration found
   EMAIL_USER: namansharma2109@gmail.com
   EMAIL_PASSWORD: mjb...

🚀 Server running on port 5050
✅ MongoDB Connected
```

---

## Step 4: Test Features ✅

### Test 1: Booking Confirmation Email

**Steps**:
1. Go to http://localhost:8081
2. Select an event
3. Add attendees with their emails
4. Complete payment
5. Check email inbox

**Expected**:
- Email received from namansharma2109@gmail.com
- Email contains PDF with QR codes
- Email has event details and booking reference

### Test 2: Password Reset OTP

**Steps**:
1. Go to http://localhost:8081/forgot-password
2. Select "User" or "Organizer"
3. Enter your email
4. Click "Send Reset OTP"
5. Check email for OTP
6. Enter OTP on same page
7. Enter new password
8. Click "Reset Password"

**Expected**:
- OTP email received within 1 minute
- OTP is 6 digits
- OTP expires in 10 minutes
- Password successfully reset
- Can login with new password

### Test 3: Login OTP

**Steps**:
1. Go to http://localhost:8081/otp-login
2. Enter your email
3. Click "Send OTP"
4. Check email for OTP
5. Enter OTP on same page
6. You should be logged in

**Expected**:
- OTP email received within 1 minute
- OTP is 6 digits
- OTP expires in 10 minutes
- Successfully logged in

---

## Forgot Password Feature - Complete Flow

### Page: /forgot-password

#### Step 1: Email Entry
```
┌─────────────────────────────────┐
│  Forgot Password                │
├─────────────────────────────────┤
│  Role: [User] [Organizer]       │
│  Email: [____________]          │
│  [Send Reset OTP]               │
└─────────────────────────────────┘
```

#### Step 2: OTP Entry (Same Page)
```
┌─────────────────────────────────┐
│  Forgot Password                │
├─────────────────────────────────┤
│  OTP sent to: user@example.com  │
│  Enter OTP: [000000]            │
│  [Verify OTP]                   │
│  [Change Email]                 │
└─────────────────────────────────┘
```

#### Step 3: Password Reset (Same Page)
```
┌─────────────────────────────────┐
│  Forgot Password                │
├─────────────────────────────────┤
│  OTP verified! Set new password │
│  New Password: [____________]   │
│  Confirm: [____________]        │
│  [Reset Password]               │
│  [Back]                         │
└─────────────────────────────────┘
```

#### Step 4: Success
```
✅ Password reset successfully
Redirects to login page
```

---

## Email Recipients

### Booking Confirmation
```
From: namansharma2109@gmail.com
To: 
  - Booker email
  - Attendee 1 email
  - Attendee 2 email
  - Attendee 3 email
  - etc.
```

### Password Reset OTP
```
From: namansharma2109@gmail.com
To: User's registered email
```

### Login OTP
```
From: namansharma2109@gmail.com
To: User's registered email
```

---

## Troubleshooting

### Issue: "Missing credentials for PLAIN"

**Cause**: EMAIL_USER or EMAIL_PASSWORD not set in .env

**Solution**:
1. Open backend/.env
2. Add EMAIL_USER=namansharma2109@gmail.com
3. Add EMAIL_PASSWORD=mjbz txzl pyne ruzy
4. Save file
5. Restart server: npm run dev

### Issue: OTP Not Received

**Cause**: Email not sent or going to spam

**Solution**:
1. Check spam folder
2. Verify EMAIL_USER and EMAIL_PASSWORD are correct
3. Check server logs for errors
4. Try requesting OTP again

### Issue: Emails Going to Spam

**Cause**: Gmail marking emails as spam

**Solution**:
1. Go to Gmail spam folder
2. Find email from namansharma2109@gmail.com
3. Click "Not spam"
4. Add to contacts
5. Future emails should go to inbox

### Issue: Password Reset Not Working

**Cause**: OTP not being sent or verified

**Solution**:
1. Check EMAIL_USER and EMAIL_PASSWORD in .env
2. Check server logs for errors
3. Verify email is correct
4. Try again

---

## Files That Handle Password Reset

### Frontend
- `/src/pages/ForgotPassword.tsx` - Password reset page with OTP
- `/src/lib/api.ts` - API calls for OTP and password reset

### Backend
- `/backend/controllers/otpAuthController.js` - OTP generation and verification
- `/backend/utils/otpService.js` - OTP email sending
- `/backend/utils/emailService.js` - Email configuration
- `/backend/routes/authRoutes.js` - API endpoints

---

## API Endpoints Used

### Request Password Reset OTP
```
POST /api/auth/request-password-reset-otp
Body: { email: "user@example.com", role: "user" }
Response: { message: "...", email: "..." }
```

### Reset Password with OTP
```
POST /api/auth/reset-password-otp
Body: { 
  email: "user@example.com", 
  otp: "123456", 
  newPassword: "new-password",
  role: "user" 
}
Response: { message: "...", user: {...} }
```

---

## Configuration Summary

```
✅ EMAIL_USER: namansharma2109@gmail.com
✅ EMAIL_PASSWORD: mjbz txzl pyne ruzy
✅ FRONTEND_URL: http://localhost:8081
✅ OTP Expiry: 10 minutes
✅ Max OTP Attempts: 3
✅ Password Reset: OTP-based (same page)
✅ Booking Emails: To all attendees
✅ PDF Tickets: With QR codes
```

---

## Next Steps

1. ✅ Add EMAIL_USER and EMAIL_PASSWORD to backend/.env
2. ✅ Run npm install in backend
3. ✅ Run npm run dev to restart server
4. ✅ Test password reset at /forgot-password
5. ✅ Test booking confirmation emails
6. ✅ Test login OTP at /otp-login

**Everything is ready! Just add your credentials and restart the server.**
