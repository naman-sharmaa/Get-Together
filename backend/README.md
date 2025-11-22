# TicketCharge Hub Backend API

Backend API for TicketCharge Hub built with Node.js, Express, and PostgreSQL.

## Features

- User authentication (sign up, sign in)
- Organizer authentication
- Event management (CRUD operations)
- User profile management
- Past and upcoming events tracking
- JWT-based authentication
- PostgreSQL database

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following in `.env`:
- `DB_HOST`: PostgreSQL host (default: localhost)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name (default: ticketcharge_hub)
- `DB_USER`: PostgreSQL username (default: postgres)
- `DB_PASSWORD`: PostgreSQL password
- `JWT_SECRET`: A secure random string for JWT tokens
- `FRONTEND_URL`: Frontend URL (default: http://localhost:5173)

### 3. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ticketcharge_hub;

# Exit psql
\q
```

### 4. Run Database Migrations

```bash
npm run migrate
```

This will create all necessary tables and indexes.

### 5. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in `.env`).

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User sign up
- `POST /api/auth/signin` - User sign in
- `GET /api/auth/me` - Get current user (requires authentication)

### Events

- `GET /api/events` - Get all events (query params: `status`, `category`, `organizerId`)
- `GET /api/events/:id` - Get single event
- `GET /api/events/organizer/my-events` - Get organizer's events (requires authentication)
- `POST /api/events` - Create event (requires organizer authentication)
- `PUT /api/events/:id` - Update event (requires organizer authentication)
- `DELETE /api/events/:id` - Delete event (requires organizer authentication)

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile (requires authentication)
- `PUT /api/users/change-password` - Change password (requires authentication)

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Database Schema

### Users Table
- `id` - Primary key
- `name` - User name
- `email` - Unique email
- `password` - Hashed password
- `phone` - Phone number (optional)
- `role` - 'user' or 'organizer'
- `organization_name` - Organization name (for organizers)
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Events Table
- `id` - Primary key
- `organizer_id` - Foreign key to users
- `title` - Event title
- `description` - Event description
- `category` - Event category
- `date` - Event date/time
- `location` - Event location
- `price` - Ticket price
- `image_url` - Event image URL
- `total_tickets` - Total available tickets
- `available_tickets` - Available tickets
- `status` - 'upcoming', 'past', or 'cancelled'
- `created_at` - Timestamp
- `updated_at` - Timestamp

### Bookings Table
- `id` - Primary key
- `user_id` - Foreign key to users
- `event_id` - Foreign key to events
- `quantity` - Number of tickets
- `total_price` - Total booking price
- `status` - 'confirmed', 'cancelled', or 'refunded'
- `created_at` - Timestamp
- `updated_at` - Timestamp

## Error Handling

All errors are returned in the following format:

```json
{
  "message": "Error message",
  "error": "Detailed error (in development)"
}
```

## Development

- The server uses ES modules (`type: "module"`)
- Database migrations are in `scripts/migrate.js`
- Controllers handle business logic
- Middleware handles authentication and authorization
- Routes define API endpoints

