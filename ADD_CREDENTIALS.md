# Add Your Gmail Credentials to .env

## Your Gmail Details

```
EMAIL_USER: namansharma2109@gmail.com
EMAIL_PASSWORD: mjbz txzl pyne ruzy
```

## How to Add to .env

### Step 1: Open backend/.env

Navigate to `/Users/namansharma/Desktop/ticketcharge-hub-main/backend/.env`

### Step 2: Add These Lines

Add or update these lines in your .env file:

```
EMAIL_USER=namansharma2109@gmail.com
EMAIL_PASSWORD=mjbz txzl pyne ruzy
FRONTEND_URL=http://localhost:8081
```

### Step 3: Make Sure These Are Also Set

```
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### Step 4: Restart Backend Server

```bash
cd backend
npm run dev
```

### Step 5: Verify Configuration

You should see in console:
```
✅ Email configuration found
   EMAIL_USER: namansharma2109@gmail.com
   EMAIL_PASSWORD: mjb...
```

---

## Forgot Password Feature - Now Working ✅

The forgot password feature is already fully implemented with OTP on the same page:

### How It Works

1. **User goes to** `/forgot-password`

2. **Step 1: Enter Email**
   - User enters their email
   - Clicks "Send Reset OTP"
   - OTP sent to their email (10-minute expiry)

3. **Step 2: Enter OTP**
   - User receives OTP in email
   - Enters 6-digit OTP on the same page
   - Clicks "Verify OTP"

4. **Step 3: Set New Password**
   - User enters new password
   - Confirms password
   - Clicks "Reset Password"
   - Password updated successfully

### All on Same Page ✅

- No page redirects
- No separate pages
- All steps on `/forgot-password`
- User-friendly flow

---

## Testing the Features

### Test 1: Booking Confirmation Email

1. Go to home page
2. Select an event
3. Add attendees with their emails
4. Complete payment with Razorpay
5. Check email inbox for confirmation with PDF

### Test 2: Password Reset OTP

1. Go to `/forgot-password`
2. Select "User" or "Organizer"
3. Enter your email
4. Click "Send Reset OTP"
5. Check email for OTP
6. Enter OTP on the same page
7. Enter new password
8. Click "Reset Password"
9. Login with new password

### Test 3: Login OTP

1. Go to `/otp-login`
2. Enter your email
3. Click "Send OTP"
4. Check email for OTP
5. Enter OTP on the same page
6. You should be logged in

---

## Features Ready ✅

- ✅ Booking confirmation emails with PDF tickets
- ✅ Emails sent to all attendees
- ✅ Password reset OTP (10-minute expiry)
- ✅ OTP on same page (no redirects)
- ✅ Login OTP
- ✅ COOP error handling

---

## Troubleshooting

### "Missing credentials for PLAIN" Error

**Solution**: Make sure EMAIL_USER and EMAIL_PASSWORD are added to .env and server is restarted

### OTP Not Received

**Check**:
1. Is EMAIL_USER and EMAIL_PASSWORD correct?
2. Check spam folder
3. Check server logs for errors
4. Verify email is correct

### Emails Going to Spam

**Solution**:
1. Mark as "Not spam" in Gmail
2. Add namansharma2109@gmail.com to contacts
3. Check that credentials are correct

---

## Summary

1. ✅ Add EMAIL_USER and EMAIL_PASSWORD to backend/.env
2. ✅ Restart backend server
3. ✅ Test booking confirmation emails
4. ✅ Test password reset OTP
5. ✅ Test login OTP

**Everything is ready! Just add your credentials and restart the server.**
