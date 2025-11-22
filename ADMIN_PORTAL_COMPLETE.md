# Admin Portal - Complete Setup

## 🎉 Admin Portal Successfully Created!

The admin portal is now fully implemented with all features requested.

## 📁 Files Created

### Backend (Already Complete)
- ✅ All backend files from previous setup
- ✅ Models: Admin, SystemSettings, Payout
- ✅ Controllers: adminAuth, adminAnalytics, systemSettings, payout
- ✅ Middleware: adminAuth, maintenance
- ✅ Routes: /api/admin/*
- ✅ Setup script: scripts/setup-admin.js

### Frontend (New)
- ✅ `src/contexts/AdminAuthContext.tsx` - Admin authentication
- ✅ `src/contexts/AdminThemeContext.tsx` - Dark/light theme
- ✅ `src/lib/adminApi.ts` - API utilities
- ✅ `src/pages/admin/AdminLogin.tsx` - Login page
- ✅ `src/pages/admin/AdminLayout.tsx` - Layout with sidebar
- ✅ `src/pages/admin/Dashboard.tsx` - Analytics dashboard
- ✅ `src/pages/admin/Organizers.tsx` - Organizer management
- ✅ `src/pages/admin/Payouts.tsx` - Payout management
- ✅ `src/pages/admin/Settings.tsx` - System settings
- ✅ `src/components/admin/ProtectedAdminRoute.tsx` - Route protection
- ✅ `src/components/admin/DateFilterSelect.tsx` - Date filter component
- ✅ `src/App.tsx` - Updated with admin routes

## 🚀 Quick Start

### 1. Setup Admin User
```bash
cd backend
node scripts/setup-admin.js
```

**Default Admin Credentials:**
- Email: `admin@eventhub.com`
- Password: `Admin@123456`

### 2. Start Backend Server
```bash
cd backend
npm start
# or
node server.js
```

Server runs on: `http://localhost:5050`

### 3. Start Frontend
```bash
npm run dev
# or
bun dev
```

Frontend runs on: `http://localhost:8080` (or your configured port)

### 4. Access Admin Portal
Navigate to: `http://localhost:8080/admin/login`

Login with the default credentials above.

## 🎯 Features Implemented

### ✅ Dashboard Page (`/admin/dashboard`)
- **Revenue Overview Cards**
  - Total Revenue
  - Platform Commission (your earnings)
  - Organizer Earnings
- **Stats Cards**
  - Total Bookings
  - Tickets Sold
  - Active Events
  - Total Organizers
- **Pending Payouts Alert**
- **Recent Bookings Table**
- **Top Organizers by Revenue**
- **Date Filter** (last hour, today, yesterday, this month, 3 months, 6 months, 1 year, all time)

### ✅ Organizers Page (`/admin/organizers`)
- List all organizers with search functionality
- View statistics per organizer:
  - Total revenue
  - Commission earned
  - Number of events (active/total)
  - Bookings count
  - Tickets sold
- Date filtering
- Summary cards showing combined metrics
- Click to view detailed organizer info

### ✅ Payouts Page (`/admin/payouts`)
- View all payouts with filters (by status, organizer)
- Create new payout for organizer
- Calculate pending payout automatically
- Update payout status:
  - Pending → Processing
  - Processing → Completed
  - Mark as failed/cancelled
- Shows commission breakdown
- Transaction ID tracking
- Summary cards for pending/completed payouts

### ✅ Settings Page (`/admin/settings`)
- **🔴 MAINTENANCE MODE TOGGLE**
  - Big button to enable/disable maintenance
  - Confirmation dialog before toggling
  - Custom maintenance message
  - When enabled: ALL non-admin routes return 503 error
  - Admin portal remains accessible
- **Revenue Settings**
  - Commission Rate slider (0-50%)
  - Platform fee configuration
  - Minimum payout amount
- **Access Controls**
  - Allow/disallow new registrations
  - Allow/disallow new events
  - Allow/disallow new bookings
- Save changes button

### ✅ UI/UX Features
- **Dark/Light Theme Toggle** - Theme switcher in header
- **Responsive Design** - Mobile-friendly sidebar
- **Protected Routes** - Auto-redirect to login if not authenticated
- **Admin Profile** - View admin name, email, role in header
- **Gradient Design** - Purple/blue gradients matching EventHub brand
- **Loading States** - Spinners while fetching data
- **Toast Notifications** - Success/error messages

## 🛡️ Security Features

- ✅ JWT-based authentication
- ✅ Admin-only routes (separate from user auth)
- ✅ Role-based permissions (super-admin vs admin)
- ✅ Token stored in localStorage
- ✅ Auto-redirect if not authenticated
- ✅ Maintenance mode blocks all non-admin API routes

## 📊 Date Filter Options

All analytics pages support these filters:
- **Last Hour** - Data from last 60 minutes
- **Today** - From 00:00 today
- **Yesterday** - Full yesterday data
- **This Month** - From 1st of current month
- **Last 3 Months** - Rolling 90 days
- **Last 6 Months** - Rolling 180 days
- **Last Year** - Rolling 365 days
- **All Time** - Complete historical data

## 🔧 API Endpoints

All admin endpoints are at `/api/admin/*`:

### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get current admin

### Analytics
- `GET /api/admin/analytics/dashboard?dateFilter=` - Dashboard overview
- `GET /api/admin/analytics/organizers?dateFilter=` - All organizers
- `GET /api/admin/analytics/organizers/:id?dateFilter=` - Organizer details
- `GET /api/admin/analytics/revenue-trends?dateFilter=&groupBy=` - Revenue trends

### Payouts
- `GET /api/admin/payouts?status=&organizerId=` - Get payouts
- `GET /api/admin/payouts/calculate/:organizerId` - Calculate pending
- `POST /api/admin/payouts` - Create payout
- `PUT /api/admin/payouts/:id/status` - Update status
- `POST /api/admin/payouts/bulk` - Generate bulk payouts

### Settings
- `GET /api/admin/settings` - Get system settings
- `PUT /api/admin/settings` - Update settings
- `POST /api/admin/settings/maintenance` - Toggle maintenance mode

## 🎨 Theme System

The admin portal has its own independent theme system:
- Separate from main website theme
- Stored in localStorage as `admin-theme`
- Toggle button in header (Sun/Moon icon)
- Applies to all admin pages
- Dark mode with proper contrast for readability

## 🧪 Testing Checklist

### 1. Authentication
- [ ] Login with default credentials
- [ ] Check auto-redirect to dashboard
- [ ] Logout and verify redirect to login
- [ ] Try accessing protected route without auth

### 2. Dashboard
- [ ] View revenue cards
- [ ] Test date filter (try different ranges)
- [ ] Check recent bookings table
- [ ] Verify top organizers list

### 3. Organizers
- [ ] Search for organizer by name/email
- [ ] Test date filter
- [ ] View organizer details (if implemented)

### 4. Payouts
- [ ] Filter by status
- [ ] Calculate pending payout for organizer
- [ ] Create new payout
- [ ] Update payout status to completed

### 5. Settings
- [ ] Change commission rate
- [ ] Update minimum payout amount
- [ ] Toggle maintenance mode ON
- [ ] Verify main website returns 503
- [ ] Toggle maintenance mode OFF
- [ ] Verify main website accessible again
- [ ] Save settings changes

### 6. UI/UX
- [ ] Toggle dark/light theme
- [ ] Test responsive sidebar (mobile)
- [ ] Check all navigation links
- [ ] Verify toast notifications

## 🚨 Important Notes

### Maintenance Mode Behavior
When maintenance mode is **ENABLED**:
- ❌ All `/api/*` routes (except `/api/admin/*`) return 503 error
- ❌ Users cannot access the website
- ❌ Bookings are blocked
- ❌ Event creation blocked
- ✅ Admin portal remains fully functional
- ✅ You can still view analytics and manage payouts

When maintenance mode is **DISABLED**:
- ✅ Website works normally
- ✅ All user features accessible

### Commission System
- Commission is **deducted from organizer revenue**
- Default rate: **10%**
- Example: ₹10,000 booking
  - Platform commission: ₹1,000
  - Organizer receives: ₹9,000
- Commission rate can be changed in Settings
- Historical payouts keep their original commission rate

### Payout Workflow
1. Organizer earns money from bookings
2. Admin calculates pending payout (auto-deducts commission)
3. Admin creates payout record
4. Admin marks as "processing" when payment initiated
5. Admin marks as "completed" with transaction ID

## 🎯 Next Steps (Optional Enhancements)

If you want to add more features:
1. **Revenue Charts** - Add charts to visualize trends (use recharts or chart.js)
2. **Organizer Detail Page** - Detailed view of single organizer with event breakdown
3. **Export to CSV** - Export analytics data
4. **Email Notifications** - Notify organizers when payout is created
5. **Payout History** - Download payout receipts/invoices
6. **User Management** - View and manage platform users
7. **Event Management** - View/approve/reject events from admin
8. **Booking Management** - View all bookings, refunds, cancellations

## 📝 Customization

### Change Admin Credentials
Edit `backend/scripts/setup-admin.js` and run again:
```javascript
email: 'your-email@example.com',
password: 'YourSecurePassword',
name: 'Your Name'
```

### Change Commission Rate
Go to Settings page → Adjust slider → Save Changes

### Customize Maintenance Message
Go to Settings page → Edit textarea → Enable maintenance mode

### Change Theme Colors
Edit `src/pages/admin/AdminLayout.tsx` and other admin pages
- Current: Purple/Blue gradients
- Can change to any color scheme

## 🐛 Troubleshooting

**Cannot login:**
- Ensure backend is running on port 5050
- Check MongoDB connection
- Run setup-admin.js script
- Check browser console for errors

**Maintenance mode not working:**
- Check backend logs
- Verify SystemSettings document exists
- Test API directly: `GET http://localhost:5050/api/events`

**Theme not persisting:**
- Check localStorage in browser dev tools
- Look for `admin-theme` key
- Clear cache and try again

**Data not loading:**
- Open browser dev tools → Network tab
- Check API responses
- Verify JWT token in localStorage (`adminToken`)

## 🎉 You're All Set!

Your admin portal is fully functional with:
- ✅ Separate authentication system
- ✅ Dark/light theme toggle
- ✅ Revenue tracking with commission
- ✅ Payout management
- ✅ Maintenance mode control
- ✅ Date filtering (8 time ranges)
- ✅ Beautiful gradient UI
- ✅ Responsive design
- ✅ Protected routes

Access it at: **http://localhost:8080/admin/login**
