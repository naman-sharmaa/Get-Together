# IMMEDIATE ACTION - What To Do Now

## Your Gmail Credentials

```
Email: namansharma2109@gmail.com
Password: mjbz txzl pyne ruzy
```

---

## Action 1: Add to .env File

### Open File
```
/Users/namansharma/Desktop/ticketcharge-hub-main/backend/.env
```

### Add These Lines
```
EMAIL_USER=namansharma2109@gmail.com
EMAIL_PASSWORD=mjbz txzl pyne ruzy
FRONTEND_URL=http://localhost:8081
```

### Save File

---

## Action 2: Install Dependencies

### Open Terminal

```bash
cd /Users/namansharma/Desktop/ticketcharge-hub-main/backend
npm install
```

### Wait for Installation to Complete

---

## Action 3: Restart Backend Server

### Run Command

```bash
npm run dev
```

### Expected Output
```
✅ Email configuration found
   EMAIL_USER: namansharma2109@gmail.com
   EMAIL_PASSWORD: mjb...

🚀 Server running on port 5050
✅ MongoDB Connected
```

---

## Action 4: Test Password Reset Feature

### Go to URL
```
http://localhost:8081/forgot-password
```

### Test Steps
1. Select "User" or "Organizer"
2. Enter your email
3. Click "Send Reset OTP"
4. Check your email for OTP
5. Enter OTP on the same page
6. Enter new password
7. Click "Reset Password"
8. You should see success message

### Expected Flow
```
Step 1: Enter Email
        ↓
Step 2: Receive OTP in Email
        ↓
Step 3: Enter OTP (Same Page)
        ↓
Step 4: Enter New Password (Same Page)
        ↓
Step 5: Success! Password Reset
```

---

## Action 5: Test Booking Confirmation Email

### Go to URL
```
http://localhost:8081
```

### Test Steps
1. Select an event
2. Add attendees with their emails
3. Complete payment with Razorpay
4. Check email inbox for confirmation
5. Verify PDF with QR codes is attached

### Expected Emails
- Main booker receives full booking confirmation + PDF
- Each attendee receives individual ticket + PDF

---

## What's Already Working ✅

- ✅ Forgot password page with OTP (same page, no redirects)
- ✅ OTP sent to user's email
- ✅ OTP expires in 10 minutes
- ✅ Max 3 verification attempts
- ✅ User can set new password
- ✅ Booking confirmation emails to all attendees
- ✅ PDF tickets with QR codes
- ✅ Login OTP feature
- ✅ COOP error handling

---

## Troubleshooting

### If OTP Not Received
1. Check spam folder
2. Verify EMAIL_USER and EMAIL_PASSWORD in .env
3. Restart server: npm run dev
4. Try again

### If Emails Going to Spam
1. Go to Gmail spam folder
2. Mark as "Not spam"
3. Add namansharma2109@gmail.com to contacts

### If Server Won't Start
1. Check if port 5050 is already in use
2. Check if MongoDB is connected
3. Check console for error messages

---

## Files to Reference

- `ADD_CREDENTIALS.md` - How to add credentials
- `VERIFY_SETUP.md` - Complete verification checklist
- `FINAL_SETUP_SUMMARY.md` - Detailed setup guide
- `EMAIL_RECIPIENTS_GUIDE.md` - Email recipients mapping
- `VISUAL_EMAIL_FLOW.md` - Flow diagrams

---

## Summary

1. ✅ Add EMAIL_USER and EMAIL_PASSWORD to backend/.env
2. ✅ Run npm install
3. ✅ Run npm run dev
4. ✅ Test at /forgot-password
5. ✅ Test booking emails
6. ✅ Done!

**Everything is ready! Just follow the 3 actions above.**
