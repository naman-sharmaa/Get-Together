# Visual Email Flow - Complete Diagrams

## Booking Confirmation Email Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    USER BOOKS TICKETS                         │
│                                                               │
│  Booking User: john@example.com                              │
│  Attendee 1: jane@example.com                                │
│  Attendee 2: bob@example.com                                 │
│  Attendee 3: alice@example.com                               │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  PAYMENT VERIFICATION        │
        │  (Razorpay)                  │
        │  Status: Confirmed ✓         │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │  GENERATE PDF TICKET         │
        │  - All 4 tickets             │
        │  - QR codes                  │
        │  - Event details             │
        │  - Booking reference         │
        └──────────────┬───────────────┘
                       │
                       ▼
    ┌──────────────────────────────────────┐
    │  SEND CONFIRMATION EMAILS            │
    │  (Using EMAIL_USER account)          │
    └──────────────┬───────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
        ▼          ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │ Email1 │ │ Email2 │ │ Email3 │ │ Email4 │
    └────────┘ └────────┘ └────────┘ └────────┘
        │          │          │          │
        ▼          ▼          ▼          ▼
    john@      jane@      bob@       alice@
    example    example    example    example
    .com       .com       .com       .com
        │          │          │          │
        ▼          ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │ Full   │ │ Ticket │ │ Ticket │ │ Ticket │
    │Booking │ │ Email  │ │ Email  │ │ Email  │
    │ + PDF  │ │ + PDF  │ │ + PDF  │ │ + PDF  │
    └────────┘ └────────┘ └────────┘ └────────┘
```

---

## Password Reset OTP Flow

```
┌─────────────────────────────────────┐
│  USER REQUESTS PASSWORD RESET       │
│  Goes to: /forgot-password          │
│  Enters: user@example.com           │
└────────────────┬────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │  FIND USER IN DATABASE     │
    │  Email: user@example.com   │
    │  Status: Found ✓           │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  GENERATE OTP              │
    │  - 6 digits                │
    │  - Random                  │
    │  - Expiry: 10 minutes      │
    │  - Max attempts: 3         │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  SEND OTP EMAIL            │
    │  (Using EMAIL_USER account)│
    └────────────────┬───────────┘
                     │
                     ▼
            user@example.com
                     │
                     ▼
    ┌────────────────────────────┐
    │  EMAIL RECEIVED            │
    │  Subject: Your OTP         │
    │  OTP: 123456               │
    │  Expires in: 10 minutes    │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  USER ENTERS OTP           │
    │  On: /forgot-password      │
    │  Enters: 123456            │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  VERIFY OTP                │
    │  - Check if valid          │
    │  - Check if not expired    │
    │  - Check attempts < 3      │
    │  Status: Valid ✓           │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  USER SETS NEW PASSWORD    │
    │  Enters: new password      │
    │  Confirms: new password    │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  UPDATE PASSWORD           │
    │  In database               │
    │  Status: Updated ✓         │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  DELETE OTP                │
    │  Remove from database      │
    │  Status: Deleted ✓         │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  SUCCESS MESSAGE           │
    │  Password reset complete   │
    │  Redirect to login         │
    └────────────────────────────┘
```

---

## Login OTP Flow

```
┌─────────────────────────────────────┐
│  USER REQUESTS LOGIN OTP            │
│  Goes to: /otp-login                │
│  Enters: user@example.com           │
└────────────────┬────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │  FIND USER IN DATABASE     │
    │  Email: user@example.com   │
    │  Status: Found ✓           │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  GENERATE OTP              │
    │  - 6 digits                │
    │  - Random                  │
    │  - Expiry: 10 minutes      │
    │  - Max attempts: 3         │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  SEND OTP EMAIL            │
    │  (Using EMAIL_USER account)│
    └────────────────┬───────────┘
                     │
                     ▼
            user@example.com
                     │
                     ▼
    ┌────────────────────────────┐
    │  EMAIL RECEIVED            │
    │  Subject: Your OTP         │
    │  OTP: 654321               │
    │  Expires in: 10 minutes    │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  USER ENTERS OTP           │
    │  On: /otp-login            │
    │  Enters: 654321            │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  VERIFY OTP                │
    │  - Check if valid          │
    │  - Check if not expired    │
    │  - Check attempts < 3      │
    │  Status: Valid ✓           │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  GENERATE JWT TOKEN        │
    │  Token: eyJhbGc...         │
    │  Expires: 7 days           │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  DELETE OTP                │
    │  Remove from database      │
    │  Status: Deleted ✓         │
    └────────────────┬───────────┘
                     │
                     ▼
    ┌────────────────────────────┐
    │  USER LOGGED IN            │
    │  Token stored in browser   │
    │  Redirect to dashboard     │
    └────────────────────────────┘
```

---

## Email Sending Architecture

```
┌──────────────────────────────────────────────────────────┐
│                  BACKEND SERVER                          │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  emailService.js                                   │ │
│  │  - sendBookingConfirmationEmail()                  │ │
│  │  - sendOTPEmail()                                  │ │
│  │  - sendPasswordFailureEmail()                      │ │
│  └────────────────┬─────────────────────────────────┘ │
│                   │                                    │
│                   ▼                                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  nodemailer Transport                              │ │
│  │  - Service: gmail                                  │ │
│  │  - Auth: EMAIL_USER + EMAIL_PASSWORD              │ │
│  │  - TLS: Enabled                                    │ │
│  └────────────────┬─────────────────────────────────┘ │
│                   │                                    │
└───────────────────┼────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────────┐
        │  Gmail SMTP Server        │
        │  smtp.gmail.com:587       │
        │  TLS Enabled              │
        └───────────────┬───────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    ┌────────┐     ┌────────┐     ┌────────┐
    │ User   │     │Attendee│     │Attendee│
    │ Email  │     │ Email  │     │ Email  │
    │ Inbox  │     │ Inbox  │     │ Inbox  │
    └────────┘     └────────┘     └────────┘
```

---

## Email Recipients Mapping

```
BOOKING CONFIRMATION
┌─────────────────────────────────────────────────────┐
│ Booking Form Input                                  │
├─────────────────────────────────────────────────────┤
│ Booker Email: john@example.com                      │
│ Attendee 1: jane@example.com                        │
│ Attendee 2: bob@example.com                         │
│ Attendee 3: alice@example.com                       │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ Email Recipients                                    │
├─────────────────────────────────────────────────────┤
│ Email 1 → john@example.com (Full booking + PDF)    │
│ Email 2 → jane@example.com (Ticket 1 + PDF)       │
│ Email 3 → bob@example.com (Ticket 2 + PDF)        │
│ Email 4 → alice@example.com (Ticket 3 + PDF)      │
└─────────────────────────────────────────────────────┘


PASSWORD RESET OTP
┌─────────────────────────────────────────────────────┐
│ User Input                                          │
├─────────────────────────────────────────────────────┤
│ Email: user@example.com                             │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ Email Recipient                                     │
├─────────────────────────────────────────────────────┤
│ Email → user@example.com (OTP: 123456)             │
└─────────────────────────────────────────────────────┘


LOGIN OTP
┌─────────────────────────────────────────────────────┐
│ User Input                                          │
├─────────────────────────────────────────────────────┤
│ Email: user@example.com                             │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│ Email Recipient                                     │
├─────────────────────────────────────────────────────┤
│ Email → user@example.com (OTP: 654321)             │
└─────────────────────────────────────────────────────┘
```

---

## Configuration Flow

```
┌──────────────────────────────────┐
│  Get Gmail App Password          │
│  https://myaccount.google.com/   │
└──────────────────┬───────────────┘
                   │
                   ▼
┌──────────────────────────────────┐
│  Add to backend/.env             │
│  EMAIL_USER=your-email@gmail.com │
│  EMAIL_PASSWORD=xxxx xxxx xxxx   │
└──────────────────┬───────────────┘
                   │
                   ▼
┌──────────────────────────────────┐
│  Run: npm install                │
│  (Install pdfkit, qrcode)        │
└──────────────────┬───────────────┘
                   │
                   ▼
┌──────────────────────────────────┐
│  Run: npm run dev                │
│  (Restart backend server)        │
└──────────────────┬───────────────┘
                   │
                   ▼
┌──────────────────────────────────┐
│  Verify in Console               │
│  ✅ Email configuration found    │
└──────────────────┬───────────────┘
                   │
                   ▼
┌──────────────────────────────────┐
│  Test Features                   │
│  ✅ Booking emails               │
│  ✅ Password reset OTP           │
│  ✅ Login OTP                    │
└──────────────────────────────────┘
```

---

## Summary

### All Emails Sent FROM
```
your-email@gmail.com (EMAIL_USER)
```

### Email Recipients
```
Booking → User + All Attendees
Password Reset → User's Email
Login OTP → User's Email
```

### Email Contents
```
Booking → Full confirmation + PDF with QR codes
Password Reset → 6-digit OTP (10-min expiry)
Login OTP → 6-digit OTP (10-min expiry)
```

### All Features Ready ✅
```
✅ PDF generation with QR codes
✅ Email to multiple recipients
✅ OTP-based password reset
✅ OTP-based login
✅ 10-minute OTP expiry
✅ COOP error handling
```
