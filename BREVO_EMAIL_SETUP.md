# Brevo Email Service Setup Guide

## Why Brevo?
- **Free Tier**: 300 emails/day (9,000/month) - perfect for production
- **Cloud-Friendly**: Works on Render, Vercel, Heroku, etc. (no SMTP port blocking)
- **Reliable Delivery**: Industry-standard ESP with excellent deliverability
- **Easy Setup**: Just SMTP credentials, no OAuth complexity

## Step 1: Create Brevo Account

1. Go to https://app.brevo.com/
2. Click "Sign up free"
3. Fill in your details:
   - Email: Use your business/personal email
   - Password: Create secure password
4. Verify your email address (check inbox)

## Step 2: Get SMTP Credentials

1. After login, click **"SMTP & API"** in left sidebar
2. Click **"SMTP"** tab
3. You'll see your SMTP credentials:
   ```
   SMTP Server: smtp-relay.brevo.com
   Port: 587 (recommended)
   Login: Your login email
   SMTP Key: xsmtpsib-xxxxx... (click to reveal)
   ```
4. Click **"Create a new SMTP key"** if needed
5. Copy your **SMTP key** (starts with `xsmtpsib-`)

## Step 3: Add Sender Email (Optional but Recommended)

1. Go to **"Senders & IP"** → **"Senders"**
2. Click **"Add a sender"**
3. Enter:
   - **From Name**: EventHub (or your app name)
   - **From Email**: noreply@yourdomain.com (or use your Brevo email)
4. Verify the email if required

## Step 4: Configure Environment Variables

### Local Development (.env file)

Add to `/backend/.env`:
```env
# Brevo SMTP Configuration
BREVO_SMTP_USER=your-email@example.com
BREVO_SMTP_KEY=xsmtpsib-your-smtp-key-here
```

### Render Production

1. Open Render Dashboard: https://dashboard.render.com/
2. Select your **backend service** (eventhub-backend-fj60)
3. Click **"Environment"** tab
4. Click **"Add Environment Variable"**
5. Add these variables:

| Key | Value |
|-----|-------|
| `BREVO_SMTP_USER` | Your Brevo login email |
| `BREVO_SMTP_KEY` | Your Brevo SMTP key (xsmtpsib-...) |

6. Click **"Save Changes"**
7. Render will automatically redeploy with new variables

## Step 5: Test Email Sending

### Local Test

```bash
cd backend
npm run dev
```

Make a test booking on `http://localhost:5000` and check console for:
```
✅ Confirmation email sent to user@example.com
```

### Production Test

1. Visit your production site: https://eventhub-frontend-3yoi.onrender.com
2. Make a test booking with a real event
3. Check Render backend logs:
   - Go to Render Dashboard → Backend Service → Logs
   - Look for: `✅ Confirmation email sent to...`
4. Check your email inbox for confirmation

## Step 6: Monitor Email Activity

1. In Brevo Dashboard, go to **"Statistics"** → **"Email"**
2. See:
   - Emails sent today
   - Delivery rate
   - Failed sends (with reasons)
3. Go to **"Logs"** to see individual email status

## Troubleshooting

### "SMTP key is invalid"
- Make sure you copied the full key (starts with `xsmtpsib-`)
- Check for extra spaces in environment variable
- Regenerate SMTP key in Brevo dashboard

### Emails not arriving
- Check Brevo logs for delivery status
- Verify sender email is configured in Brevo
- Check recipient spam folder
- Ensure you haven't hit daily limit (300 emails)

### "Connection timeout"
- Port 587 should work on all platforms
- Try port 465 (SSL): change `secure: true` in emailService.js
- Contact Render support if ports are blocked

## Email Limits

**Free Plan:**
- 300 emails/day
- 9,000 emails/month
- All essential features included

**Paid Plans (if you need more):**
- Lite: $25/month → 10,000 emails/month
- Business: $65/month → 20,000 emails/month
- Enterprise: Custom pricing

## From Address Configuration

By default, emails will be sent from your Brevo account email. To use a custom "From" address:

1. **Use your domain**: Add a sender like `noreply@eventhub.com`
2. **Verify domain**: Add SPF/DKIM records (Brevo provides them)
3. **Update emailService.js**: Change `from` field in mail options

Example:
```javascript
from: '"EventHub" <noreply@eventhub.com>'
```

## Alternative: Brevo API (Not Required)

If you want to use Brevo's API instead of SMTP:

```bash
npm install @getbrevo/brevo
```

But SMTP is simpler and already configured!

## Support

- Brevo Docs: https://developers.brevo.com/
- Contact: support@brevo.com
- Status Page: https://status.brevo.com/

---

**Your current configuration:**
- SMTP Host: `smtp-relay.brevo.com`
- Port: `587` (STARTTLS)
- Authentication: SMTP key
- Rate Limit: 5 emails/second
- Connection pooling: Enabled
