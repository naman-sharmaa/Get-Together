# 🎉 ADMIN PORTAL - READY TO USE!

## ✅ Setup Complete

Your complete admin portal is now running and ready to use!

## 🌐 Access Points

**Admin Portal Login:**
```
http://localhost:8080/admin/login
```

**Default Admin Credentials:**
- **Email:** `admin@eventhub.com`
- **Password:** `Admin@123456`

**Main Website:**
```
http://localhost:8080/
```

## 🚀 What's Running

✅ **Backend Server:** Port 5050 (Already running)
✅ **Frontend Server:** Port 8080 (Just started)
✅ **MongoDB:** Connected
✅ **Admin User:** Created

## 📱 Admin Portal Features

### 1. 🏠 Dashboard (`/admin/dashboard`)
- **Revenue Overview**
  - Total Revenue across all bookings
  - Platform Commission (your earnings)
  - Organizer Earnings (after commission)
- **Key Metrics**
  - Total Bookings count
  - Tickets Sold count
  - Active Events count
  - Total Organizers count
- **Pending Payouts Alert** (orange card)
- **Recent Bookings Table** (last 5)
- **Top Organizers by Revenue** (top 5)
- **Date Filter Dropdown** with 8 options

### 2. 👥 Organizers (`/admin/organizers`)
- View all organizers in searchable table
- Search by name or email
- See per-organizer stats:
  - Total revenue generated
  - Commission you earned
  - Number of events (active/total)
  - Bookings count
  - Tickets sold count
- Summary cards at top
- Date filtering support

### 3. 💰 Payouts (`/admin/payouts`)
- View all payout records
- Filter by status (pending/processing/completed/failed)
- Create new payout:
  - Calculate pending amount automatically
  - Deducts commission before creating payout
- Update payout status:
  - Mark as "Processing" when payment initiated
  - Mark as "Completed" with transaction ID
- See commission breakdown for each payout
- Summary cards showing pending/completed counts

### 4. ⚙️ Settings (`/admin/settings`)
- **🔴 MAINTENANCE MODE TOGGLE**
  - Big button to enable/disable
  - Confirmation dialog before toggling
  - Custom maintenance message for users
  - When ON: Website returns 503 error for all users
  - Admin portal always accessible
  
- **Revenue Settings**
  - Commission Rate slider (0-50%)
  - Platform fee amount
  - Minimum payout threshold
  
- **Access Controls**
  - Toggle new registrations on/off
  - Toggle new events on/off
  - Toggle new bookings on/off

### 5. 🎨 UI Features
- **Theme Toggle** - Sun/Moon icon in header (dark/light mode)
- **Responsive Sidebar** - Collapses on mobile
- **User Profile Dropdown** - Shows admin name, email, role
- **Logout Function** - Clears session and redirects
- **Loading States** - Spinners while fetching data
- **Toast Notifications** - Success/error messages

## 📊 Date Filter Options

Available on Dashboard and Organizers pages:
1. **Last Hour** - Data from last 60 minutes
2. **Today** - From midnight today
3. **Yesterday** - Full yesterday data
4. **This Month** - From 1st of current month
5. **Last 3 Months** - Rolling 90 days
6. **Last 6 Months** - Rolling 180 days
7. **Last Year** - Rolling 365 days
8. **All Time** - Complete historical data

## 🧪 Quick Testing Guide

### Step 1: Login
1. Go to `http://localhost:8080/admin/login`
2. Enter email: `admin@eventhub.com`
3. Enter password: `Admin@123456`
4. Click "Sign In"
5. Should redirect to Dashboard

### Step 2: View Dashboard
1. Check if revenue cards show data
2. Try changing the date filter
3. Scroll down to see recent bookings
4. Check top organizers list

### Step 3: View Organizers
1. Click "Organizers" in sidebar
2. See list of all organizers
3. Try searching for a name
4. Click view details icon (if any organizers exist)

### Step 4: View Payouts
1. Click "Payouts" in sidebar
2. See all payout records
3. Try filtering by status
4. If you have pending payouts, try marking one as "Processing"

### Step 5: Test Maintenance Mode 🚨
1. Click "Settings" in sidebar
2. Scroll to Maintenance Mode card
3. Click "ENABLE" button
4. Confirm in dialog
5. Open a new tab to `http://localhost:8080/`
6. Should see maintenance message (503 error)
7. Go back to admin portal (should still work)
8. Click "DISABLE" to restore website
9. Refresh main website tab (should work now)

### Step 6: Change Commission Rate
1. In Settings page
2. Move the Commission Rate slider
3. Click "Save Changes" button
4. Should see success toast

### Step 7: Toggle Theme
1. Click Sun/Moon icon in header
2. Page should switch between light/dark mode
3. Theme persists on page refresh

### Step 8: Logout
1. Click your profile in top-right
2. Click "Logout"
3. Should redirect to login page
4. Try accessing `/admin/dashboard` directly
5. Should redirect back to login

## 🎯 Commission System Explained

**How it works:**
- You set a commission rate (e.g., 10%)
- When a booking is made:
  - Total booking amount recorded
  - Commission calculated: `amount × rate / 100`
  - Organizer net earning: `amount - commission`
  
**Example:**
- User books tickets for ₹10,000
- Commission rate: 10%
- Platform commission: ₹1,000
- Organizer receives: ₹9,000

**Where to see:**
- Dashboard shows total commission earned
- Organizers page shows commission per organizer
- Payouts page shows commission breakdown per payout

## 🔒 Security Features

- ✅ Separate authentication from regular users
- ✅ JWT tokens for session management
- ✅ Protected routes (auto-redirect if not logged in)
- ✅ Admin-only API endpoints
- ✅ Role-based permissions (super-admin vs admin)
- ✅ Maintenance mode blocks all non-admin routes

## 🎨 Customization

### Change Admin Password
After first login, you should change the default password:
1. In MongoDB, update the Admin document
2. Or create a new super admin with setup script
3. Or implement "Change Password" feature in UI

### Adjust Commission Rate
1. Go to Settings page
2. Move slider to desired percentage
3. Click "Save Changes"
4. New bookings will use new rate

### Customize Maintenance Message
1. Go to Settings page
2. Edit the "Maintenance Message" textarea
3. Click "Save Changes"
4. Enable maintenance mode to show message

### Change Theme Colors
Edit these files to customize appearance:
- `src/pages/admin/AdminLayout.tsx` - Layout colors
- `src/pages/admin/Dashboard.tsx` - Dashboard colors
- All other admin pages for specific colors

Current theme: Purple/Blue gradients matching EventHub brand

## 📝 Important Notes

### Maintenance Mode
- When enabled, ALL API routes return 503 error
- Except `/api/admin/*` routes (admin portal still works)
- Regular users see "Under Maintenance" message
- You can manage everything while in maintenance
- Use this when doing updates, migrations, or fixing issues

### Payout Workflow
1. Organizer hosts event and sells tickets
2. Money goes to booking, commission tracked
3. Admin views pending payout in Payouts page
4. Admin calculates pending amount (auto-deducts commission)
5. Admin creates payout record
6. Admin initiates payment externally (bank transfer, etc.)
7. Admin marks payout as "Processing"
8. After payment clears, admin marks "Completed" with transaction ID
9. Organizer receives money minus commission

### Date Filtering
- All analytics respect the selected date filter
- "All Time" shows complete historical data
- Shorter filters give you recent performance insights
- Use "This Month" for current period tracking

## 🐛 Troubleshooting

**Can't login?**
- Check backend is running: `http://localhost:5050`
- Verify MongoDB is connected
- Check browser console for errors
- Ensure admin user exists (run setup script)

**Data not loading?**
- Open browser DevTools → Network tab
- Check API calls to `/api/admin/*`
- Look for JWT token in request headers
- Verify backend logs for errors

**Maintenance mode not working?**
- Enable it in Settings
- Try accessing main website in incognito
- Check backend logs for "Maintenance mode: true"
- Verify SystemSettings document in MongoDB

**Theme not saving?**
- Check localStorage in browser DevTools
- Look for `admin-theme` key
- Clear localStorage and try again

## 🎊 You're All Set!

Your admin portal is fully functional and ready for production use. Here's what you have:

✅ **Separate Admin Portal** - Completely different from main website
✅ **Dark/Light Theme** - Toggle in header
✅ **Revenue Tracking** - Real-time analytics with date filters
✅ **Commission System** - Automatic calculation (configurable %)
✅ **Payout Management** - Create and track organizer payouts
✅ **Maintenance Mode** - One-click website shutdown
✅ **Access Controls** - Granular feature toggles
✅ **Beautiful UI** - Responsive, gradient design
✅ **Secure** - Protected routes, admin-only access

**Login now:** [http://localhost:8080/admin/login](http://localhost:8080/admin/login)

Email: `admin@eventhub.com`  
Password: `Admin@123456`

---

## 📚 Documentation Files

Refer to these files for detailed information:
- `ADMIN_PORTAL_COMPLETE.md` - Complete setup guide
- `ADMIN_PORTAL_SETUP.md` - API documentation
- Backend models/controllers/routes - Technical implementation

Enjoy your powerful admin portal! 🚀
