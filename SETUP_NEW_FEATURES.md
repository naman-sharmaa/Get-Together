# Setup Guide for New Features

## Quick Start

### 1. Database Migration (For Existing Events)

If you have existing events in your database, run this migration script to add the `bookingExpiry` field:

```bash
cd backend
node scripts/add-booking-expiry.js
```

This will:
- Find all events without `bookingExpiry`
- Set `bookingExpiry` to 24 hours before the event date
- Update the database

### 2. Restart Backend Server

```bash
cd backend
npm start
```

The backend will now:
- Require `bookingExpiry` when creating/updating events
- Validate that `bookingExpiry` is a valid ISO8601 date

### 3. Test the Features

#### Create a New Event (As Organizer)
1. Go to `/organizer/dashboard`
2. Click "Create Event"
3. Fill in all fields including "Ticket Booking Expiry Date & Time"
4. Save the event
5. Verify the booking expiry is displayed on the event card

#### View Events (As User)
1. Go to the home page (`/`)
2. Scroll to "Upcoming Events" section
3. Verify booking expiry dates are displayed on event cards
4. Check that expired bookings show "Booking Closed" in red

#### Test Organizer Isolation
1. Create an account as Organizer A
2. Create some events
3. Log out and create an account as Organizer B
4. Log in as Organizer B
5. Verify that you only see Organizer B's events (not Organizer A's)

---

## API Changes

### New Required Field: `bookingExpiry`

When creating or updating events via API, you must now include `bookingExpiry`:

```javascript
// Create Event
POST /api/events
{
  title: "Concert Night",
  category: "Music",
  date: "2024-12-25T20:00:00Z",
  location: "Madison Square Garden",
  price: 99.99,
  totalTickets: 500,
  bookingExpiry: "2024-12-24T20:00:00Z"  // REQUIRED
}

// Update Event
PUT /api/events/{eventId}
{
  bookingExpiry: "2024-12-24T20:00:00Z"  // Optional, but can be updated
}
```

---

## Frontend Components

### EventCard Component
Now accepts `bookingExpiry` prop:
```jsx
<EventCard
  title="Concert"
  date="Dec 25, 2024"
  location="Madison Square Garden"
  image="..."
  category="Music"
  price="$99.99"
  bookingExpiry="2024-12-24T20:00:00Z"  // NEW
/>
```

### EventManagement Component
Automatically includes booking expiry field in the form:
- Field is required
- Shows helper text: "Bookings will close at this date and time"
- Validates date format

---

## Database Schema

The Event model now includes:

```javascript
bookingExpiry: {
  type: Date,
  required: [true, 'Booking expiry date is required'],
}
```

---

## Troubleshooting

### Events showing "Booking Closed" incorrectly
- Check that your server time is correct
- Verify the `bookingExpiry` date in the database is set correctly
- Run the migration script if needed

### Migration script fails
- Ensure MongoDB is running and accessible
- Check that `MONGODB_URI` is set in `.env`
- Verify you have proper permissions to update the database

### Organizers seeing other organizers' events
- This should not happen due to the `organizerId` filter in `getMyEvents`
- Check that authentication middleware is working correctly
- Verify that `req.user.id` is being set properly in the auth middleware

---

## Features Summary

✅ **Private Organizer Dashboards** - Each organizer only sees their own events
✅ **Booking Expiry Dates** - Organizers can set when ticket sales close
✅ **Visual Status Indicators** - Users see if bookings are open or closed
✅ **Automatic Event Status** - Events move to "Past" section when date passes
✅ **Data Isolation** - Complete separation between organizers' data

---

## Next Steps

1. Run the migration script for existing events
2. Restart the backend server
3. Test creating a new event with booking expiry
4. Verify the booking expiry displays correctly on both dashboard and public page
5. Test organizer isolation with multiple accounts

For detailed information, see `FEATURES.md`
