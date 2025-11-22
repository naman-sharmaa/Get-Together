# Database Management Guide

This guide shows you how to manage and view your PostgreSQL database.

## Database Connection Details

- **Host**: localhost
- **Port**: 5432
- **Database**: ticketcharge_hub
- **User**: namansharma
- **Password**: postgres

## Method 1: Using Command Line (psql)

### Connect to Database

```bash
/opt/homebrew/opt/postgresql@14/bin/psql -U namansharma -d ticketcharge_hub
```

### Useful Commands

Once connected, you can use these SQL commands:

```sql
-- View all users
SELECT id, name, email, role, organization_name, created_at FROM users;

-- View all events
SELECT e.*, u.name as organizer_name 
FROM events e 
LEFT JOIN users u ON e.organizer_id = u.id;

-- View all bookings
SELECT * FROM bookings;

-- Count users by role
SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- View events by status
SELECT status, COUNT(*) as count FROM events GROUP BY status;

-- View recent users
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- Exit psql
\q
```

## Method 2: Using NPM Scripts (Easiest)

We've created convenient npm scripts for quick database queries:

```bash
# View all users
npm run db:users

# View all events
npm run db:events

# View database statistics
npm run db:stats

# View everything (users, events, stats)
npm run db:all
```

## Method 3: Using GUI Tools (Recommended for Visual Management)

### Option A: pgAdmin (Free, Official PostgreSQL Tool)

1. Install pgAdmin:
   ```bash
   brew install --cask pgadmin4
   ```

2. Open pgAdmin and add a new server:
   - Host: localhost
   - Port: 5432
   - Database: ticketcharge_hub
   - Username: namansharma
   - Password: postgres

### Option B: DBeaver (Free, Cross-platform)

1. Download from: https://dbeaver.io/download/
2. Create new PostgreSQL connection with the details above

### Option C: TablePlus (macOS, Free with limitations)

1. Install:
   ```bash
   brew install --cask tableplus
   ```
2. Create new PostgreSQL connection

### Option D: Postico (macOS, Free with limitations)

1. Download from: https://eggerapps.at/postico/
2. Create new connection with your database details

## Quick Reference: Common Queries

### View All Users
```bash
npm run db:users
```

### View All Events
```bash
npm run db:events
```

### View Database Statistics
```bash
npm run db:stats
```

### Using psql directly
```bash
/opt/homebrew/opt/postgresql@14/bin/psql -U namansharma -d ticketcharge_hub -c "SELECT * FROM users;"
```

## Database Tables

1. **users** - All user accounts (both regular users and organizers)
   - Columns: id, name, email, password, phone, role, organization_name, created_at, updated_at

2. **events** - All events created by organizers
   - Columns: id, organizer_id, title, description, category, date, location, price, image_url, total_tickets, available_tickets, status, created_at, updated_at

3. **bookings** - All ticket bookings
   - Columns: id, user_id, event_id, quantity, total_price, status, created_at, updated_at

## Tips

- Always backup your database before making manual changes
- Use transactions when making multiple changes
- The password is hashed in the users table (you won't see plain text passwords)
- Events status can be: 'upcoming', 'past', or 'cancelled'
- User roles can be: 'user' or 'organizer'

