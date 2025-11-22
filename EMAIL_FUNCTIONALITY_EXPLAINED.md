# Email Functionality - Complete Explanation

## How Email Sending Works

### Important Concept

Your `EMAIL_USER` and `EMAIL_PASSWORD` are **ONLY for authentication** with Gmail's SMTP server. They are NOT the recipient email addresses.

The **recipient emails** come from:
1. **Booking Confirmation**: User's email from their booking + attendees' emails from `attendeeDetails`
2. **Password Reset OTP**: User's email from their account
3. **Login OTP**: User's email from their account

---

## Email Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Gmail Account                        │
│  EMAIL_USER=your-email@gmail.com                            │
│  EMAIL_PASSWORD=app-password                                │
│  (Used ONLY to authenticate with Gmail SMTP)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  Gmail SMTP Server         │
        │  (Sends emails on your     │
        │   behalf)                  │
        └────────────────┬───────────┘
                         │
        ┌────────────────┴───────────────────┐
        │                                    │
        ▼                                    ▼
   ┌─────────────────┐          ┌──────────────────────┐
   │ Booking Email   │          │ Password Reset Email │
   │ Sent TO:        │          │ Sent TO:             │
   │ • User email    │          │ • User's email       │
   │ • Attendee 1    │          │   (from their        │
   │ • Attendee 2    │          │    account)          │
   │ • Attendee 3    │          │                      │
   └─────────────────┘          └──────────────────────┘
```

---

## 1. Booking Confirmation Emails

### How It Works

When a user completes a booking payment:

1. **User books tickets** and enters attendee details:
   ```
   Attendee 1: John (john@example.com)
   Attendee 2: Jane (jane@example.com)
   Attendee 3: Bob (bob@example.com)
   ```

2. **Payment is verified** in `bookingController.js`

3. **System sends emails**:
   - Email to **user** (john@example.com) - Full booking confirmation with PDF
   - Email to **attendee 1** (jane@example.com) - Individual ticket with PDF
   - Email to **attendee 2** (bob@example.com) - Individual ticket with PDF

4. **All emails include**:
   - PDF ticket with QR codes
   - Event details
   - Booking reference
   - Payment summary

### Code Flow

```javascript
// In bookingController.js - verifyPayment function
const booking = await Booking.findByIdAndUpdate(
  bookingId,
  { status: 'confirmed', ... },
  { new: true }
).populate('eventId userId');

// Send confirmation email
await sendBookingConfirmationEmail(booking, booking.eventId, booking.userId);
```

### Email Recipients

**From**: your-email@gmail.com (EMAIL_USER)
**To**: 
- booking.userId.email (main booker)
- booking.attendeeDetails[0].email (attendee 1)
- booking.attendeeDetails[1].email (attendee 2)
- etc.

---

## 2. Password Reset OTP

### How It Works

When a user requests password reset:

1. **User goes to** `/forgot-password`

2. **User enters their email** (e.g., user@example.com)

3. **System**:
   - Finds user in database
   - Generates 6-digit OTP
   - Creates OTP record with 10-minute expiry
   - Sends OTP to user's email

4. **User receives email** with OTP at user@example.com

5. **User enters OTP** on the page

6. **System verifies OTP** and allows password reset

### Code Flow

```javascript
// In otpAuthController.js - requestPasswordResetOTP
const user = await User.findOne({ email: email.toLowerCase() });
const otp = await createOTP(email.toLowerCase(), user.phone, 'password_reset', role);
await sendOTPEmail(email.toLowerCase(), otp, 'password_reset');
// Email sent to: email.toLowerCase() (user's email)
```

### Email Recipients

**From**: your-email@gmail.com (EMAIL_USER)
**To**: user@example.com (user's registered email)

---

## 3. Login OTP

### How It Works

When a user logs in with OTP:

1. **User goes to** `/otp-login`

2. **User enters their email** (e.g., user@example.com)

3. **System**:
   - Finds user in database
   - Generates 6-digit OTP
   - Creates OTP record with 10-minute expiry
   - Sends OTP to user's email

4. **User receives email** with OTP at user@example.com

5. **User enters OTP** on the page

6. **System verifies OTP** and logs them in

### Code Flow

```javascript
// In otpAuthController.js - requestLoginOTP
const user = await User.findOne({ email: email.toLowerCase() });
const otp = await createOTP(email.toLowerCase(), user.phone, 'login', role);
await sendOTPEmail(email.toLowerCase(), otp, 'login');
// Email sent to: email.toLowerCase() (user's email)
```

### Email Recipients

**From**: your-email@gmail.com (EMAIL_USER)
**To**: user@example.com (user's registered email)

---

## Environment Variables Explained

```
EMAIL_USER=your-email@gmail.com
```
- Your Gmail account (used to authenticate with Gmail SMTP)
- This is where emails are "from"
- NOT the recipient email

```
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```
- Gmail App Password (16 characters)
- Used to authenticate with Gmail SMTP
- NOT a regular Gmail password
- Get from: https://myaccount.google.com/ → Security → App passwords

```
FRONTEND_URL=http://localhost:8081
```
- Used in email links (e.g., "View Your Tickets" button)
- Should match your frontend URL

---

## Complete Email Setup

### Step 1: Get Gmail App Password

1. Go to https://myaccount.google.com/
2. Click "Security" in left sidebar
3. Enable 2-Step Verification (if not enabled)
4. Scroll to "App passwords"
5. Select "Mail" and "Windows Computer"
6. Copy the 16-character password

### Step 2: Add to .env

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
FRONTEND_URL=http://localhost:8081
```

### Step 3: Restart Backend

```bash
cd backend
npm run dev
```

### Step 4: Verify Configuration

You should see in console:
```
✅ Email configuration found
   EMAIL_USER: your-email@gmail.com
   EMAIL_PASSWORD: xxx...
```

---

## Testing Email Functionality

### Test 1: Booking Confirmation Email

1. **Create a booking**:
   - Go to home page
   - Select an event
   - Add attendees with their emails
   - Complete payment

2. **Check emails**:
   - Main booker should receive email with PDF
   - Each attendee should receive email with PDF
   - Check inbox (not spam folder)

3. **Verify PDF**:
   - PDF should have QR codes
   - PDF should have event details
   - PDF should have booking reference

### Test 2: Password Reset OTP

1. **Request password reset**:
   - Go to `/forgot-password`
   - Enter your email
   - Click "Send OTP"

2. **Check email**:
   - You should receive email with 6-digit OTP
   - OTP expires in 10 minutes

3. **Reset password**:
   - Enter OTP on the page
   - Enter new password
   - Click "Reset Password"

4. **Verify**:
   - Password should be updated
   - You should be able to login with new password

### Test 3: Login OTP

1. **Request login OTP**:
   - Go to `/otp-login`
   - Enter your email
   - Click "Send OTP"

2. **Check email**:
   - You should receive email with 6-digit OTP
   - OTP expires in 10 minutes

3. **Login**:
   - Enter OTP on the page
   - You should be logged in

---

## Troubleshooting

### Problem: "Missing credentials for PLAIN"

**Solution**:
- EMAIL_USER and EMAIL_PASSWORD not set in .env
- Add them and restart server

### Problem: Emails going to spam

**Solution**:
- Mark email as "Not spam" in Gmail
- Add sender to contacts
- Check that EMAIL_USER is correct
- Verify EMAIL_PASSWORD is correct (16 characters)

### Problem: OTP not received

**Solution**:
- Check spam folder
- Verify EMAIL_USER and EMAIL_PASSWORD are correct
- Check server logs for errors
- Try requesting OTP again

### Problem: Attendee emails not receiving confirmation

**Solution**:
- Verify attendee emails are entered correctly in booking
- Check that attendeeDetails has email field
- Check server logs for email sending errors
- Verify EMAIL_USER and EMAIL_PASSWORD are correct

---

## Key Points

✅ **EMAIL_USER** is your Gmail account (for SMTP authentication)
✅ **Recipient emails** come from user data (booking, account, attendee details)
✅ **All emails sent via Gmail SMTP** using your EMAIL_USER account
✅ **OTP expires in 10 minutes** (configured in otpService.js)
✅ **Booking emails sent to all attendees** with PDF tickets
✅ **Password reset uses OTP** (10-minute expiry, more reliable than Firebase links)

---

## Summary

1. **Set EMAIL_USER and EMAIL_PASSWORD** in .env
2. **Restart backend server**
3. **Users receive emails at their own email addresses**
4. **All emails sent through your Gmail account** (EMAIL_USER)
5. **Booking confirmations** go to user + all attendees
6. **Password reset OTPs** go to user's registered email
7. **Login OTPs** go to user's registered email

Everything is already implemented and working! Just add the email credentials to .env and restart the server.
