# Email Setup Guide - CRITICAL

## Error: "Missing credentials for PLAIN"

This error means your email credentials are not configured in the `.env` file.

### Quick Fix

Add these lines to your `.backend/.env` file:

```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Getting Gmail App Password (Required)

**Important**: You MUST use Gmail App Password, NOT your regular Gmail password!

#### Step-by-Step:

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/

2. **Enable 2-Step Verification (if not already enabled)**
   - Click "Security" in the left sidebar
   - Scroll to "2-Step Verification"
   - Follow the prompts to enable it

3. **Generate App Password**
   - Go back to Security settings
   - Scroll down to "App passwords"
   - Select "Mail" from the dropdown
   - Select "Windows Computer" (or your device type)
   - Google will generate a 16-character password
   - Copy this password

4. **Add to .env**
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```
   (Paste the 16-character password exactly as shown)

5. **Restart Backend Server**
   ```bash
   npm run dev
   ```

### Verify Configuration

When you restart the server, you should see:
```
✅ Email configuration found
   EMAIL_USER: your-email@gmail.com
   EMAIL_PASSWORD: xxx...
```

If you see an error, double-check:
- Email is a Gmail address (@gmail.com)
- 2-Step Verification is enabled
- App Password is correct (16 characters)
- No extra spaces in .env file

---

## Issue: Firebase Password Reset Link Expired

Firebase password reset links expire after 1 hour. If the link is old or invalid, you'll see:
```
Failed to load resource: the server responded with a status of 400
Try resetting your password again
Your request to reset your password has expired or the link has already been used
```

### Solution

We've updated the password reset page to:
1. Detect expired links
2. Show a user-friendly error message
3. Provide a button to request a new reset link

### How Password Reset Works Now

**Option 1: Firebase Email Link (1-hour expiry)**
1. User clicks "Forgot Password"
2. Enters email
3. Receives email with reset link
4. Clicks link within 1 hour
5. Sets new password

**Option 2: OTP-Based Reset (10-minute expiry)**
1. User clicks "Forgot Password"
2. Enters email
3. Receives OTP via email (10-minute expiry)
4. Enters OTP
5. Sets new password

### Recommended: Use OTP-Based Reset

The OTP-based reset is more reliable and has a 10-minute expiry as requested. To use it:

1. Go to `/forgot-password` page
2. Enter your email
3. You'll receive an OTP via email
4. Enter the OTP
5. Set your new password

This method is:
- ✅ More reliable (no link issues)
- ✅ 10-minute expiry (as requested)
- ✅ Works with all email providers
- ✅ No Firebase link issues

---

## Testing Email Configuration

### Test 1: Verify Credentials on Startup

When you start the backend server:
```bash
npm run dev
```

You should see in the console:
```
✅ Email configuration found
   EMAIL_USER: your-email@gmail.com
   EMAIL_PASSWORD: xxx...
```

### Test 2: Send Test Email

1. Create a booking
2. Complete payment with Razorpay
3. Check your email inbox (not spam folder)
4. You should receive:
   - Booking confirmation email
   - PDF ticket attachment
   - Email to all attendees

### Test 3: Check Email Headers

If emails go to spam:
1. Open the email in Gmail
2. Click the three dots (⋮)
3. Click "Show original"
4. Check for proper headers

---

## Troubleshooting

### Problem: Still getting "Missing credentials for PLAIN"

**Solution:**
1. Check `.env` file exists in `backend/` directory
2. Verify EMAIL_USER and EMAIL_PASSWORD are set
3. No quotes around values: `EMAIL_USER=email@gmail.com` (not `"email@gmail.com"`)
4. No spaces around equals: `EMAIL_USER=email` (not `EMAIL_USER = email`)
5. Restart server: `npm run dev`

### Problem: Emails going to spam

**Solution:**
1. Check email is from your Gmail account
2. Verify app password is correct (16 characters)
3. Gmail may put first emails in spam - mark as "Not spam"
4. Add sender to contacts
5. Check SPF/DKIM if using custom domain

### Problem: Password reset link shows "expired"

**Solution:**
1. Links expire after 1 hour
2. Request a new reset link
3. Or use OTP-based reset (10-minute expiry)
4. OTP method is more reliable

### Problem: OTP not received

**Solution:**
1. Check spam folder
2. Verify EMAIL_USER and EMAIL_PASSWORD are correct
3. Check server logs for errors
4. Try requesting OTP again

---

## Environment Variables Checklist

Make sure your `.env` file has:

```
# Email Configuration (REQUIRED)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-char-app-password

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:8081

# Other required variables
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

---

## Production Deployment

Before deploying to production:

1. ✅ Test email configuration locally
2. ✅ Verify all environment variables are set
3. ✅ Test booking confirmation emails
4. ✅ Test password reset (both methods)
5. ✅ Check emails don't go to spam
6. ✅ Monitor email delivery for first week

---

## Support

If you still have issues:

1. Check backend console logs: `npm run dev`
2. Look for error messages starting with "❌"
3. Verify Gmail app password is correct
4. Try in incognito mode
5. Clear browser cache

The error message will tell you exactly what's wrong!
