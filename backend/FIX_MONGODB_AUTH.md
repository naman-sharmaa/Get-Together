# Fix MongoDB Authentication Error

## Error: "bad auth : authentication failed"

This error means your MongoDB connection string has incorrect credentials.

## Quick Fix Steps

### 1. Get Your MongoDB Password

1. Go to https://cloud.mongodb.com
2. Login to your MongoDB Atlas account
3. Click **"Database Access"** in the left sidebar
4. Find the user **"namansharma2109"**
5. If you don't remember the password:
   - Click **"Edit"** next to the user
   - Click **"Edit Password"**
   - Set a new password (remember it!)
   - Click **"Update User"**

### 2. Update .env File

Open `backend/.env` and update the MONGODB_URI line:

**Before:**
```env
MONGODB_URI=mongodb+srv://namansharma2109:<db_password>@cluster0.4njbykc.mongodb.net/ticketcharge_hub?retryWrites=true&w=majority&appName=Cluster0
```

**After (replace YOUR_PASSWORD with actual password):**
```env
MONGODB_URI=mongodb+srv://namansharma2109:YOUR_PASSWORD@cluster0.4njbykc.mongodb.net/ticketcharge_hub?retryWrites=true&w=majority&appName=Cluster0
```

### 3. Special Characters in Password

If your password contains special characters, URL-encode them:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `/` → `%2F`
- `=` → `%3D`
- `?` → `%3F`

**Example:**
If password is `My@Pass#123`, use `My%40Pass%23123`

### 4. Check Network Access

1. In MongoDB Atlas, go to **"Network Access"**
2. Click **"Add IP Address"**
3. For development, you can use:
   - `0.0.0.0/0` (allows all IPs - use only for development!)
   - Or add your specific IP address
4. Click **"Confirm"**

### 5. Restart Server

After updating `.env`:

```bash
# Stop current server (Ctrl+C)
# Then restart
cd backend
npm run dev
```

You should see: `✅ MongoDB Connected: cluster0.4njbykc.mongodb.net`

## Still Having Issues?

1. **Double-check the username**: Should be `namansharma2109`
2. **Verify password**: Make sure no extra spaces or typos
3. **Check database name**: Should be `ticketcharge_hub` (or create it if it doesn't exist)
4. **Test connection**: Try connecting via MongoDB Compass with the same credentials

## Quick Test

After updating, test the connection:

```bash
cd backend
npm run dev
```

Look for: `✅ MongoDB Connected` (success) or error message (needs more fixing)

