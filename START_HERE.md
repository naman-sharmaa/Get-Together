# START HERE - Email Setup in 5 Minutes

## Your Question Answered

**Q**: How do I send confirmation emails to users based on their emails from booking?

**A**: Your EMAIL_USER is just for Gmail authentication. Recipients come from user data automatically.

---

## Quick Setup

### 1️⃣ Get Gmail App Password (2 min)

```
1. Go to: https://myaccount.google.com/
2. Click: Security (left sidebar)
3. Scroll to: App passwords
4. Select: Mail + Windows Computer
5. Copy: 16-character password
```

### 2️⃣ Add to .env (1 min)

Open `backend/.env` and add:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
FRONTEND_URL=http://localhost:8081
```

### 3️⃣ Install & Restart (2 min)

```bash
cd backend
npm install
npm run dev
```

### ✅ Done!

You should see:
```
✅ Email configuration found
   EMAIL_USER: your-email@gmail.com
```

---

## How It Works

### Booking Confirmation

**User books with attendees**:
```
Booker: john@example.com
Attendee 1: jane@example.com
Attendee 2: bob@example.com
```

**Emails sent automatically**:
- john@example.com ← Full booking + PDF with all tickets
- jane@example.com ← Individual ticket + PDF
- bob@example.com ← Individual ticket + PDF

### Password Reset

**User requests reset** → OTP sent to their email → 10-minute expiry

### Login OTP

**User requests login** → OTP sent to their email → 10-minute expiry

---

## Email Recipients

| Feature | Sent To | From |
|---------|---------|------|
| Booking | User + All attendees | EMAIL_USER |
| Password Reset OTP | User's email | EMAIL_USER |
| Login OTP | User's email | EMAIL_USER |

---

## Testing

### Test 1: Booking Email
1. Create booking with attendees
2. Complete payment
3. Check inbox for emails with PDF

### Test 2: Password Reset
1. Go to `/forgot-password`
2. Enter email
3. Receive OTP (10-min expiry)

### Test 3: Login OTP
1. Go to `/otp-login`
2. Enter email
3. Receive OTP (10-min expiry)

---

## Key Points

✅ EMAIL_USER = Your Gmail account (for SMTP only)
✅ Recipients = Users' emails (from their data)
✅ Booking emails = Sent to user + all attendees
✅ OTP expiry = 10 minutes
✅ PDF = Includes QR codes + event details

---

## Troubleshooting

### "Missing credentials for PLAIN"
→ Add EMAIL_USER and EMAIL_PASSWORD to .env

### Emails going to spam
→ Mark as "Not spam" in Gmail

### OTP not received
→ Check spam folder, verify credentials

---

## Documentation

For detailed information, see:
- `FINAL_SETUP_SUMMARY.md` - Complete setup guide
- `EMAIL_RECIPIENTS_GUIDE.md` - Recipients mapping
- `VISUAL_EMAIL_FLOW.md` - Flow diagrams
- `IMPLEMENTATION_STATUS.md` - Feature status

---

## Summary

1. ✅ Get Gmail App Password
2. ✅ Add EMAIL_USER and EMAIL_PASSWORD to .env
3. ✅ Run `npm install` and `npm run dev`
4. ✅ Test booking emails
5. ✅ Test password reset OTP
6. ✅ Test login OTP

**Everything is ready! Just add the email credentials.**
