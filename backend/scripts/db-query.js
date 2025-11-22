import connectDB from '../config/database.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import dotenv from 'dotenv';

dotenv.config();

// Query to view all users
const viewUsers = async () => {
  try {
    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 });
    console.log('\n📊 All Users:');
    console.log('='.repeat(80));
    console.table(users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone || 'N/A',
      role: u.role,
      organizationName: u.organizationName || 'N/A',
      createdAt: u.createdAt,
    })));
    console.log(`\nTotal users: ${users.length}\n`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
};

// Query to view all events
const viewEvents = async () => {
  try {
    await connectDB();
    const events = await Event.find({})
      .populate('organizerId', 'name organizationName')
      .sort({ date: -1 });
    
    console.log('\n📅 All Events:');
    console.log('='.repeat(80));
    console.table(events.map(e => ({
      id: e._id,
      title: e.title,
      category: e.category,
      date: e.date,
      location: e.location,
      price: e.price,
      status: e.status,
      organizer: e.organizerId?.name || 'N/A',
      organization: e.organizerId?.organizationName || 'N/A',
    })));
    console.log(`\nTotal events: ${events.length}\n`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
};

// Query to view database stats
const viewStats = async () => {
  try {
    await connectDB();
    
    const [usersByRole, eventsByStatus, totalBookings] = await Promise.all([
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Event.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Booking.countDocuments(),
    ]);

    console.log('\n📈 Database Statistics:');
    console.log('='.repeat(80));
    console.log('\n👥 Users by Role:');
    console.table(usersByRole.map(u => ({ role: u._id, count: u.count })));
    console.log('\n📅 Events by Status:');
    console.table(eventsByStatus.map(e => ({ status: e._id, count: e.count })));
    console.log('\n🎫 Total Bookings:', totalBookings);
    console.log('\n');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
};

// Main function
const main = async () => {
  const command = process.argv[2];

  switch (command) {
    case 'users':
      await viewUsers();
      break;
    case 'events':
      await viewEvents();
      break;
    case 'stats':
      await viewStats();
      break;
    case 'all':
      await connectDB();
      const [users, events] = await Promise.all([
        User.find({}).sort({ createdAt: -1 }),
        Event.find({}).populate('organizerId', 'name organizationName').sort({ date: -1 }),
      ]);
      
      console.log('\n📊 All Users:');
      console.log('='.repeat(80));
      console.table(users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })));
      
      console.log('\n📅 All Events:');
      console.log('='.repeat(80));
      console.table(events.map(e => ({
        id: e._id,
        title: e.title,
        category: e.category,
        status: e.status,
        organizer: e.organizerId?.name || 'N/A',
      })));
      
      await viewStats();
      break;
    default:
      console.log(`
📊 Database Query Tool

Usage: node scripts/db-query.js [command]

Commands:
  users   - View all users
  events  - View all events
  stats   - View database statistics
  all     - View everything

Examples:
  node scripts/db-query.js users
  node scripts/db-query.js events
  node scripts/db-query.js stats
  node scripts/db-query.js all
      `);
      process.exit(0);
  }
};

main();
