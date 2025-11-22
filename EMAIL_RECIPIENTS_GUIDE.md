# Email Recipients Guide - Who Gets What Email

## Understanding Email Recipients

### Your Gmail Account (EMAIL_USER)
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password
```

This is **ONLY** used to authenticate with Gmail SMTP server. It's NOT the recipient.

Think of it like:
- **EMAIL_USER** = Your postal service account
- **Recipients** = The people receiving the mail

---

## Scenario 1: Booking Confirmation Emails

### User Books Tickets

**User fills in booking form**:
```
Booking User: John (john@example.com)
Attendee 1: Jane (jane@example.com)
Attendee 2: Bob (bob@example.com)
Attendee 3: Alice (alice@example.com)
```

### Emails Sent

**Email 1 - To: john@example.com**
```
From: your-email@gmail.com (EMAIL_USER)
To: john@example.com (Main booker)
Subject: 🎫 Booking Confirmed - Concert Event
Content: Full booking confirmation
Attachment: tickets-ABC123.pdf (with all 4 tickets + QR codes)
```

**Email 2 - To: jane@example.com**
```
From: your-email@gmail.com (EMAIL_USER)
To: jane@example.com (Attendee 1)
Subject: 🎫 Your Ticket - Concert Event
Content: Individual ticket confirmation
Attachment: ticket-TICKET001.pdf (Jane's ticket + QR code)
```

**Email 3 - To: bob@example.com**
```
From: your-email@gmail.com (EMAIL_USER)
To: bob@example.com (Attendee 2)
Subject: 🎫 Your Ticket - Concert Event
Content: Individual ticket confirmation
Attachment: ticket-TICKET002.pdf (Bob's ticket + QR code)
```

**Email 4 - To: alice@example.com**
```
From: your-email@gmail.com (EMAIL_USER)
To: alice@example.com (Attendee 3)
Subject: 🎫 Your Ticket - Concert Event
Content: Individual ticket confirmation
Attachment: ticket-TICKET003.pdf (Alice's ticket + QR code)
```

### Code Flow

```javascript
// In bookingController.js
const booking = {
  userId: { email: 'john@example.com' },
  attendeeDetails: [
    { name: 'Jane', email: 'jane@example.com' },
    { name: 'Bob', email: 'bob@example.com' },
    { name: 'Alice', email: 'alice@example.com' }
  ]
};

// sendBookingConfirmationEmail sends to:
// 1. john@example.com (main booker)
// 2. jane@example.com (attendee 1)
// 3. bob@example.com (attendee 2)
// 4. alice@example.com (attendee 3)
```

---

## Scenario 2: Password Reset OTP

### User Requests Password Reset

**User enters email**: user@example.com

### Email Sent

**Email - To: user@example.com**
```
From: your-email@gmail.com (EMAIL_USER)
To: user@example.com (User's registered email)
Subject: Your OTP for Password Reset
Content: 
  Your OTP for password reset is: 123456
  This OTP will expire in 10 minutes.
```

### Code Flow

```javascript
// In otpAuthController.js - requestPasswordResetOTP
const user = await User.findOne({ email: 'user@example.com' });
const otp = await createOTP('user@example.com', user.phone, 'password_reset', 'user');
await sendOTPEmail('user@example.com', otp, 'password_reset');
// Email sent to: user@example.com
```

---

## Scenario 3: Login OTP

### User Requests Login OTP

**User enters email**: user@example.com

### Email Sent

**Email - To: user@example.com**
```
From: your-email@gmail.com (EMAIL_USER)
To: user@example.com (User's registered email)
Subject: Your OTP for Login
Content:
  Your OTP for login is: 654321
  This OTP will expire in 10 minutes.
```

### Code Flow

```javascript
// In otpAuthController.js - requestLoginOTP
const user = await User.findOne({ email: 'user@example.com' });
const otp = await createOTP('user@example.com', user.phone, 'login', 'user');
await sendOTPEmail('user@example.com', otp, 'login');
// Email sent to: user@example.com
```

---

## Email Recipients Summary

### Booking Confirmation
| Email Type | Sent To | From | Contains |
|-----------|---------|------|----------|
| Main Booking | User's email | EMAIL_USER | Full booking + PDF with all tickets |
| Attendee 1 | Attendee 1 email | EMAIL_USER | Individual ticket + PDF |
| Attendee 2 | Attendee 2 email | EMAIL_USER | Individual ticket + PDF |
| Attendee N | Attendee N email | EMAIL_USER | Individual ticket + PDF |

### Password Reset
| Email Type | Sent To | From | Contains |
|-----------|---------|------|----------|
| OTP | User's email | EMAIL_USER | 6-digit OTP (10-min expiry) |

### Login
| Email Type | Sent To | From | Contains |
|-----------|---------|------|----------|
| OTP | User's email | EMAIL_USER | 6-digit OTP (10-min expiry) |

---

## Important Notes

### 1. EMAIL_USER is NOT a recipient
```
❌ WRONG: EMAIL_USER receives all emails
✅ CORRECT: EMAIL_USER is used to send emails
```

### 2. Recipients come from user data
```
Booking emails → From user's booking form (attendeeDetails)
Password reset → From user's account email
Login OTP → From user's account email
```

### 3. All emails sent through EMAIL_USER
```
All emails have:
From: your-email@gmail.com (EMAIL_USER)
```

### 4. Each recipient gets their own email
```
John gets: Full booking confirmation
Jane gets: Her individual ticket
Bob gets: His individual ticket
Alice gets: Her individual ticket
```

---

## Testing Email Recipients

### Test 1: Booking Emails

**Step 1**: Create booking with these attendees
```
Booker: test1@gmail.com
Attendee 1: test2@gmail.com
Attendee 2: test3@gmail.com
```

**Step 2**: Complete payment

**Step 3**: Check emails
```
test1@gmail.com - Should receive: Full booking confirmation + PDF
test2@gmail.com - Should receive: Individual ticket + PDF
test3@gmail.com - Should receive: Individual ticket + PDF
```

### Test 2: Password Reset OTP

**Step 1**: Go to `/forgot-password`

**Step 2**: Enter email: test1@gmail.com

**Step 3**: Check email
```
test1@gmail.com - Should receive: OTP email with 6-digit code
```

### Test 3: Login OTP

**Step 1**: Go to `/otp-login`

**Step 2**: Enter email: test1@gmail.com

**Step 3**: Check email
```
test1@gmail.com - Should receive: OTP email with 6-digit code
```

---

## Troubleshooting

### Problem: User not receiving booking confirmation

**Check**:
1. Is user's email correct in booking form?
2. Is EMAIL_USER and EMAIL_PASSWORD set in .env?
3. Check spam folder
4. Check server logs for errors

### Problem: Attendee not receiving ticket email

**Check**:
1. Is attendee email correct in attendeeDetails?
2. Is EMAIL_USER and EMAIL_PASSWORD set in .env?
3. Check spam folder
4. Check server logs for errors

### Problem: OTP not received

**Check**:
1. Is user's registered email correct?
2. Is EMAIL_USER and EMAIL_PASSWORD set in .env?
3. Check spam folder
4. Check server logs for errors

### Problem: All emails going to spam

**Solution**:
1. Mark emails as "Not spam" in Gmail
2. Add EMAIL_USER to contacts
3. Verify EMAIL_USER is correct
4. Verify EMAIL_PASSWORD is correct (16 characters)

---

## Configuration Checklist

```
✅ EMAIL_USER=your-email@gmail.com (Gmail account)
✅ EMAIL_PASSWORD=xxxx xxxx xxxx xxxx (App password, 16 chars)
✅ FRONTEND_URL=http://localhost:8081 (For email links)
✅ Backend restarted after .env changes
✅ npm install completed (pdfkit, qrcode installed)
```

---

## Summary

1. **EMAIL_USER** = Your Gmail account (for sending emails)
2. **Recipients** = Users' email addresses (from their data)
3. **Booking emails** → Sent to user + all attendees
4. **Password reset OTP** → Sent to user's email
5. **Login OTP** → Sent to user's email
6. **All emails include** → Professional templates + attachments

Everything is implemented and ready to use!
