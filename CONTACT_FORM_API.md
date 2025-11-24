# Contact Form API Documentation

## Public Endpoint

### Submit Contact Form
**POST** `/api/contact/submit`

Submit a new contact form message. Sends notification emails to developer and confirmation to user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "subject": "Question about event booking",
  "message": "Hi, I have a question about..."
}
```

**Required Fields:**
- `name` (string)
- `email` (string, valid email)
- `subject` (string)
- `message` (string)

**Optional Fields:**
- `phone` (string)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Thank you for contacting us! We will respond to you soon.",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Question about event booking"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please provide all required fields: name, email, subject, and message"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to submit contact form. Please try again later.",
  "error": "Error details..."
}
```

---

## Admin Endpoints

### Get All Contacts
**GET** `/api/contact/all`

Retrieve all contact form submissions. Requires admin authentication.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters:**
- `status` (optional): Filter by status (new, read, replied, archived)
- `limit` (optional, default: 50): Number of results per page
- `skip` (optional, default: 0): Number of results to skip (pagination)

**Example:**
```
GET /api/contact/all?status=new&limit=20&skip=0
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "subject": "Question about event booking",
      "message": "Hi, I have a question...",
      "status": "new",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "skip": 0
}
```

---

### Update Contact Status
**PATCH** `/api/contact/:id/status`

Update the status of a contact form submission. Requires admin authentication.

**Headers:**
```
Authorization: Bearer <admin-jwt-token>
```

**URL Parameters:**
- `id`: Contact ID (MongoDB ObjectId)

**Request Body:**
```json
{
  "status": "read"
}
```

**Valid Status Values:**
- `new` - Just submitted
- `read` - Admin has viewed
- `replied` - Admin has responded
- `archived` - Archived/closed

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "subject": "Question about event booking",
    "message": "Hi, I have a question...",
    "status": "read",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid status"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Contact not found"
}
```

---

## Email Notifications

### Developer Notification
When a user submits the contact form, an email is automatically sent to **gettogetherebookings@gmail.com** with:

- **Subject**: 🔔 New Contact Form Submission - [Subject]
- **Content**:
  - User's name
  - User's email (clickable mailto link)
  - User's phone (clickable tel link, if provided)
  - Subject line
  - Full message
  - Timestamp (IST timezone)

### User Confirmation
The user receives a confirmation email with:

- **Subject**: Thank you for contacting GetTogether
- **Content**:
  - Personalized greeting
  - Copy of their message
  - Response time expectation (24 hours)
  - Contact info for urgent matters
  - Professional branding

---

## Frontend Integration Example

### React/TypeScript

```typescript
const handleContactSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/contact/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Show success message
      alert('Message sent! Check your email for confirmation.');
      // Clear form
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } else {
      throw new Error(data.message || 'Failed to send message');
    }
  } catch (error) {
    console.error('Contact form error:', error);
    alert('Failed to send message. Please try again.');
  }
};
```

### Plain JavaScript

```javascript
document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value,
  };
  
  try {
    const response = await fetch('https://eventhub-backend-fj60.onrender.com/api/contact/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Message sent!');
      e.target.reset();
    } else {
      alert(data.message || 'Failed to send message');
    }
  } catch (error) {
    console.error(error);
    alert('Error sending message');
  }
});
```

---

## Testing with cURL

### Submit Contact Form
```bash
curl -X POST https://eventhub-backend-fj60.onrender.com/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "subject": "Test Contact",
    "message": "This is a test message from the contact form."
  }'
```

### Get All Contacts (Admin)
```bash
curl -X GET https://eventhub-backend-fj60.onrender.com/api/contact/all \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Update Contact Status (Admin)
```bash
curl -X PATCH https://eventhub-backend-fj60.onrender.com/api/contact/CONTACT_ID/status \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "read"}'
```

---

## Database Schema

### Contact Model

```javascript
{
  _id: ObjectId,
  name: String (required, trimmed),
  email: String (required, trimmed, lowercase),
  phone: String (optional, trimmed),
  subject: String (required, trimmed),
  message: String (required, trimmed),
  status: String (enum: ['new', 'read', 'replied', 'archived'], default: 'new'),
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `createdAt` (descending) - for sorting by date
- `status` - for filtering
- `email` - for searching

---

## Production URLs

- **Contact Form Page**: https://eventhub-frontend-3yoi.onrender.com/#contact
- **API Endpoint**: https://eventhub-backend-fj60.onrender.com/api/contact/submit
- **Developer Email**: gettogetherebookings@gmail.com
- **Support Phone**: +91 9079235893

---

## Rate Limiting & Best Practices

### Email Service Limits
- **Brevo Free Plan**: 300 emails/day
- Each contact form submission = 2 emails (developer + user)
- Maximum ~150 contact submissions per day on free plan

### Recommendations
1. Add rate limiting on frontend to prevent spam
2. Implement CAPTCHA for production
3. Monitor Brevo dashboard for sending limits
4. Consider pagination when retrieving contacts
5. Archive old contacts regularly

---

## Error Handling

### Common Errors

**CORS Error:**
```
Not allowed by CORS
```
**Solution:** Backend CORS configured for frontend URL. Check `FRONTEND_URL` env var.

**Email Not Sent:**
```
Failed to send contact notification email
```
**Solution:** Check Brevo API key and sender email verification.

**Invalid Email:**
```
Please provide a valid email address
```
**Solution:** Email regex validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

**Missing Fields:**
```
Please provide all required fields
```
**Solution:** Ensure name, email, subject, and message are provided.

---

## Future Enhancements

Consider adding:
- ✅ File upload support (attachments)
- ✅ Admin dashboard UI for viewing contacts
- ✅ Email templates customization
- ✅ Auto-response rules
- ✅ Contact analytics/metrics
- ✅ Export contacts to CSV
- ✅ Integration with CRM systems
- ✅ Webhooks for external integrations

---

**Last Updated:** 24 November 2025  
**Version:** 1.0.0  
**Contact:** gettogetherebookings@gmail.com
