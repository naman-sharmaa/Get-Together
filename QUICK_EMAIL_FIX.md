# Quick Email Fix - 5 Minutes

## Problem
```
Error sending confirmation email: Error: Missing credentials for "PLAIN"
```

## Solution

### Step 1: Get Gmail App Password (2 minutes)

1. Go to: https://myaccount.google.com/
2. Click "Security" (left sidebar)
3. Scroll to "App passwords"
4. Select "Mail" and "Windows Computer"
5. Copy the 16-character password

### Step 2: Add to .env (1 minute)

Open `backend/.env` and add:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

Replace with your actual Gmail and the 16-character password from Step 1.

### Step 3: Restart Server (1 minute)

```bash
cd backend
npm run dev
```

### Step 4: Verify (1 minute)

You should see in console:
```
✅ Email configuration found
   EMAIL_USER: your-email@gmail.com
   EMAIL_PASSWORD: xxx...
```

## Done! ✅

Now test by:
1. Creating a booking
2. Completing payment
3. Check email inbox for confirmation

---

## Password Reset Issue

**Problem**: "Your request to reset your password has expired or the link has already been used"

**Solution**: Use OTP-based password reset instead
1. Go to `/forgot-password`
2. Enter email
3. Receive OTP (10-minute expiry)
4. Enter OTP and set new password

This is more reliable than Firebase email links.

---

## Common Mistakes

❌ Using regular Gmail password (use App Password instead)
❌ Quotes in .env: `EMAIL_USER="email@gmail.com"` (remove quotes)
❌ Spaces in .env: `EMAIL_USER = email` (no spaces around =)
❌ Not restarting server after .env changes

---

## Still Not Working?

Check:
1. Is EMAIL_USER a Gmail address? (@gmail.com)
2. Is 2-Step Verification enabled?
3. Did you use the 16-character App Password?
4. Did you restart the server?
5. Check backend console for error messages
