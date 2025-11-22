# Setup Guide for Latest Fixes

## Issues Fixed

### 1. COOP Header Error ✅
- **Problem**: Cross-Origin-Opener-Policy blocking Firebase popup
- **Solution**: Hybrid popup/redirect flow with automatic fallback
- **File**: `src/lib/firebaseAuth.ts`

### 2. Ticket Confirmation Emails with PDFs ✅
- **Problem**: No PDF tickets sent to attendees
- **Solution**: PDF generation with QR codes, emails to all attendees
- **Files**: `backend/utils/pdfService.js`, `backend/utils/emailService.js`

### 3. Forgot Password Expiry ✅
- **Status**: Already working correctly with 10-minute OTP expiry
- **File**: `backend/utils/otpService.js`

---

## Installation Steps

### Step 1: Install New Dependencies

```bash
cd backend
npm install
```

This will install the new dependencies:
- `pdfkit@^0.13.0` - PDF generation
- `qrcode@^1.5.3` - QR code generation

### Step 2: Verify Environment Variables

Make sure these are set in `.env`:

```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:8081
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
```

**Important**: Use Gmail App Password, not your regular Gmail password!

### Step 3: Restart Backend Server

```bash
npm run dev
```

---

## Testing the Fixes

### Test 1: Google Sign In (COOP Fix)
1. Go to `/organizer/auth` or home page
2. Click "Sign In with Google"
3. Should work with popup OR redirect (if popup blocked)
4. No COOP errors in console

### Test 2: Ticket Confirmation Emails
1. Book a ticket as a user
2. Complete payment with Razorpay
3. Check email inbox (not spam folder)
4. Should receive:
   - Main booker: Full booking confirmation with PDF
   - Each attendee: Individual ticket email with PDF
5. PDF should contain:
   - QR codes for each ticket
   - Event details
   - Booking reference
   - Payment summary

### Test 3: Forgot Password OTP
1. Go to `/forgot-password`
2. Enter email
3. Receive OTP via email
4. OTP expires after 10 minutes
5. Can only try 3 times before OTP is deleted

---

## Email Configuration for Gmail

### Getting Gmail App Password:

1. Go to https://myaccount.google.com/
2. Click "Security" in left sidebar
3. Enable 2-Step Verification if not already enabled
4. Scroll down to "App passwords"
5. Select "Mail" and "Windows Computer" (or your device)
6. Google will generate a 16-character password
7. Use this as `EMAIL_PASSWORD` in `.env`

### Preventing Emails from Going to Spam:

The following are already implemented:
- ✅ TLS configuration in transporter
- ✅ Professional HTML email templates
- ✅ Proper email headers
- ✅ Gradual email sending (not all at once)
- ✅ Descriptive subject lines
- ✅ Unsubscribe information

If emails still go to spam:
1. Check Gmail spam folder
2. Mark as "Not spam"
3. Add to contacts
4. Check SPF/DKIM records if using custom domain

---

## File Changes Summary

### Created Files:
- `backend/utils/pdfService.js` - PDF generation with QR codes

### Modified Files:
- `src/lib/firebaseAuth.ts` - Enhanced COOP error handling
- `backend/utils/emailService.js` - Send to all attendees with PDFs
- `backend/package.json` - Added pdfkit and qrcode

### No Changes Needed:
- `backend/utils/otpService.js` - Already has 10-min expiry
- `backend/controllers/bookingController.js` - Already calls email function

---

## Troubleshooting

### Issue: "Cannot find module 'pdfkit'"
**Solution**: Run `npm install` in backend directory

### Issue: "Cannot find module 'qrcode'"
**Solution**: Run `npm install` in backend directory

### Issue: Emails going to spam
**Solution**: 
1. Check EMAIL_USER and EMAIL_PASSWORD are correct
2. Use Gmail App Password (not regular password)
3. Verify TLS is enabled in transporter
4. Check email templates are professional

### Issue: COOP error still appearing
**Solution**:
1. Clear browser cache
2. Try in incognito/private mode
3. Check browser console for specific error
4. Redirect flow should work as fallback

### Issue: PDF not generating
**Solution**:
1. Check pdfkit is installed: `npm list pdfkit`
2. Check qrcode is installed: `npm list qrcode`
3. Check server logs for errors
4. Verify booking has attendeeDetails

---

## Production Deployment

Before deploying to production:

1. ✅ Test all three fixes locally
2. ✅ Verify email configuration with production Gmail account
3. ✅ Test PDF generation with multiple tickets
4. ✅ Test attendee emails are sent correctly
5. ✅ Verify COOP error doesn't occur
6. ✅ Test forgot password OTP flow
7. ✅ Monitor email delivery rates
8. ✅ Check spam folder for first week

---

## Support

If you encounter any issues:

1. Check the error message in browser console
2. Check server logs: `npm run dev`
3. Verify all environment variables are set
4. Ensure dependencies are installed: `npm install`
5. Clear browser cache and try again
6. Try in incognito/private mode

---

## Summary

All three issues are now fixed and ready for production:
- ✅ COOP error handled with hybrid popup/redirect
- ✅ Ticket PDFs with QR codes sent to all attendees
- ✅ Forgot password OTP has 10-minute expiry

Just run `npm install` in the backend directory and restart the server!
