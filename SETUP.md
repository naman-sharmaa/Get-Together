# Quick Setup Guide

Follow these steps to get your TicketCharge Hub application running:

## Step 1: Install PostgreSQL

If you don't have PostgreSQL installed:

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)

## Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ticketcharge_hub;

# Exit
\q
```

## Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Edit .env with your PostgreSQL credentials:
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=your-random-secret-key-here

# Run database migrations
npm run migrate

# Start backend server
npm run dev
```

Backend should now be running on `http://localhost:5000`

## Step 4: Frontend Setup

Open a new terminal:

```bash
# From project root
npm install

# Create .env file in root directory
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start frontend server
npm run dev
```

Frontend should now be running on `http://localhost:5173`

## Step 5: Test the Application

1. Open `http://localhost:5173` in your browser
2. Click "Sign In" to create an account
3. Navigate to `/organizer/auth` to create an organizer account
4. Create events using the API or through your frontend

## Troubleshooting

### Port Already in Use
If port 5000 or 5173 is already in use:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Vite will automatically use the next available port

### Database Connection Failed
- Ensure PostgreSQL is running: `pg_isready`
- Check credentials in `backend/.env`
- Verify database exists: `psql -U postgres -l`

### Module Not Found Errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## Next Steps

- Create your first organizer account
- Add some events through the API
- Customize the UI to your preferences
- Deploy to production when ready

