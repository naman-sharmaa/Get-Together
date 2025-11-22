# TicketCharge Hub

A full-stack event management platform built with React, Node.js, Express, and PostgreSQL. Users can browse events, and organizers can create and manage their events.

## Features

### User Features
- User authentication (sign up, sign in)
- Browse upcoming and past events
- View event details
- User profile management

### Organizer Features
- Organizer authentication
- Create, update, and delete events
- Manage event listings
- View organizer dashboard

### Technical Features
- JWT-based authentication
- PostgreSQL database
- RESTful API
- Responsive UI with Tailwind CSS
- TypeScript for type safety

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- React Router
- React Query

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT for authentication
- bcryptjs for password hashing

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd ticketcharge-hub-main
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your configuration:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=ticketcharge_hub
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

FRONTEND_URL=http://localhost:5173
```

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ticketcharge_hub;

# Exit psql
\q
```

#### Run Database Migrations

```bash
cd backend
npm run migrate
```

This will create all necessary tables (users, events, bookings) and indexes.

#### Start the Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies

```bash
# From project root
npm install
```

#### Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

#### Start the Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Project Structure

```
ticketcharge-hub-main/
├── backend/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── eventController.js    # Event CRUD operations
│   │   └── userController.js     # User profile management
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── eventRoutes.js        # Event endpoints
│   │   └── userRoutes.js         # User endpoints
│   ├── scripts/
│   │   └── migrate.js            # Database migration script
│   ├── server.js                 # Express server entry point
│   └── package.json
├── src/
│   ├── components/               # React components
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication context
│   ├── lib/
│   │   ├── api.ts                # API client functions
│   │   └── utils.ts
│   ├── pages/                    # Page components
│   └── App.tsx
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User/Organizer sign up
- `POST /api/auth/signin` - User/Organizer sign in
- `GET /api/auth/me` - Get current user (requires auth)

### Events
- `GET /api/events` - Get all events (query params: `status`, `category`, `organizerId`)
- `GET /api/events/:id` - Get single event
- `GET /api/events/organizer/my-events` - Get organizer's events (requires auth)
- `POST /api/events` - Create event (requires organizer auth)
- `PUT /api/events/:id` - Update event (requires organizer auth)
- `DELETE /api/events/:id` - Delete event (requires organizer auth)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile (requires auth)
- `PUT /api/users/change-password` - Change password (requires auth)

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

## Usage

### Creating an Account

1. Click "Sign In" in the header
2. Switch to "Sign Up" tab
3. Fill in your details and create an account

### Creating an Organizer Account

1. Navigate to `/organizer/auth`
2. Fill in organization details
3. Create your organizer account

### Creating Events (Organizers)

1. Sign in as an organizer
2. Use the API endpoint `POST /api/events` with the following data:
   ```json
   {
     "title": "Event Title",
     "description": "Event Description",
     "category": "Music",
     "date": "2024-12-31T18:00:00Z",
     "location": "Venue Name, City",
     "price": 50.00,
     "totalTickets": 100
   }
   ```

## Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
npm run dev
```

### Building for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
cd backend
npm start
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check that both servers are running

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET is set in backend `.env`
- Verify token is being sent in Authorization header

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.
