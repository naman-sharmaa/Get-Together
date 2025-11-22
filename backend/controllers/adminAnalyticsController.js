import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Payout from '../models/Payout.js';
import SystemSettings from '../models/SystemSettings.js';
import mongoose from 'mongoose';

// Helper function to get date range based on filter
const getDateRange = (filter) => {
  const now = new Date();
  let startDate;

  switch (filter) {
    case 'last_hour':
      startDate = new Date(now.getTime() - (60 * 60 * 1000));
      break;
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'yesterday':
      startDate = new Date(now.setDate(now.getDate() - 1));
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'this_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case '3_months':
      startDate = new Date(now.setMonth(now.getMonth() - 3));
      break;
    case '6_months':
      startDate = new Date(now.setMonth(now.getMonth() - 6));
      break;
    case '1_year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    case 'all_time':
    default:
      startDate = new Date(0); // Beginning of time
  }

  return { startDate, endDate: new Date() };
};

// Get dashboard overview
export const getDashboardOverview = async (req, res) => {
  try {
    console.log('📊 Fetching dashboard overview...');
    const { dateFilter = 'all_time' } = req.query;
    const { startDate, endDate } = getDateRange(dateFilter);
    console.log('Date range:', startDate, 'to', endDate);

    // Get system settings
    const settings = await SystemSettings.findOne({ settingsType: 'global' });
    const commissionRate = settings?.commissionRate || 10;
    console.log('Commission rate:', commissionRate);

    // Total Revenue (all successful bookings)
    const revenueData = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalBookings: { $sum: 1 },
          totalTickets: { $sum: '$quantity' },
        },
      },
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, totalBookings: 0, totalTickets: 0 };
    const platformRevenue = (revenue.totalRevenue * commissionRate) / 100;
    const organizerRevenue = revenue.totalRevenue - platformRevenue;

    // Total Organizers
    const totalOrganizers = await User.countDocuments({ role: 'organizer' });

    // Active Events
    const activeEvents = await Event.countDocuments({
      status: 'published',
      date: { $gte: new Date() },
    });

    // Pending Payouts
    const pendingPayouts = await Payout.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$netAmount' } } },
    ]);

    // Recent bookings
    const recentBookings = await Booking.find({
      createdAt: { $gte: startDate, $lte: endDate },
    })
      .populate('userId', 'name email')
      .populate('eventId', 'title organizationName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Revenue by organizer
    const revenueByOrganizer = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
      {
        $lookup: {
          from: 'users',
          localField: 'event.organizerId',
          foreignField: '_id',
          as: 'organizer',
        },
      },
      { $unwind: '$organizer' },
      {
        $group: {
          _id: '$organizer._id',
          organizerName: { $first: '$organizer.name' },
          organizerEmail: { $first: '$organizer.email' },
          organizationName: { $first: '$organizer.organizationName' },
          totalRevenue: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 },
          ticketsSold: { $sum: '$quantity' },
        },
      },
      {
        $project: {
          _id: 1,
          organizerName: 1,
          organizerEmail: 1,
          organizationName: 1,
          totalRevenue: 1,
          bookingCount: 1,
          ticketsSold: 1,
          platformCommission: {
            $multiply: ['$totalRevenue', commissionRate / 100],
          },
          organizerEarnings: {
            $subtract: [
              '$totalRevenue',
              { $multiply: ['$totalRevenue', commissionRate / 100] },
            ],
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 20 },
    ]);

    const dashboardData = {
      revenue: {
        totalRevenue: revenue.totalRevenue || 0,
        platformCommission: platformRevenue || 0,
        organizerEarnings: organizerRevenue || 0,
      },
      counts: {
        totalBookings: revenue.totalBookings || 0,
        totalTickets: revenue.totalTickets || 0,
        totalOrganizers: totalOrganizers || 0,
        activeEvents: activeEvents || 0,
      },
      pendingPayouts: {
        count: await Payout.countDocuments({ status: 'pending' }),
        totalAmount: pendingPayouts[0]?.total || 0,
      },
      recentBookings: recentBookings.map(booking => ({
        _id: booking._id,
        bookingId: booking.bookingId,
        eventName: booking.eventId?.title || 'Unknown Event',
        userName: booking.userId?.name || 'Unknown User',
        totalAmount: booking.totalPrice,
        bookingDate: booking.createdAt,
      })),
      revenueByOrganizer: revenueByOrganizer.map(org => ({
        _id: org._id,
        name: org.organizerName || org.organizationName || 'Unknown',
        email: org.organizerEmail || '',
        totalRevenue: org.totalRevenue || 0,
        totalCommission: org.platformCommission || 0,
      })),
    };

    console.log('✅ Dashboard data prepared, sending response');
    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get detailed organizer analytics
export const getOrganizerAnalytics = async (req, res) => {
  try {
    const { organizerId } = req.params;
    const { dateFilter = 'all_time' } = req.query;
    const { startDate, endDate } = getDateRange(dateFilter);

    const settings = await SystemSettings.findOne({ settingsType: 'global' });
    const commissionRate = settings?.commissionRate || 10;

    // Get organizer details
    const organizer = await User.findById(organizerId);
    if (!organizer || organizer.role !== 'organizer') {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    // Get organizer's events
    const events = await Event.find({ organizerId });

    // Get bookings for organizer's events
    const eventIds = events.map(e => e._id);
    const bookings = await Booking.find({
      eventId: { $in: eventIds },
      paymentStatus: 'completed',
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate('eventId', 'title date price');

    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const platformCommission = (totalRevenue * commissionRate) / 100;
    const organizerEarnings = totalRevenue - platformCommission;

    // Revenue by event
    const revenueByEvent = await Booking.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          paymentStatus: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$eventId',
          totalRevenue: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 },
          ticketsSold: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: '$event' },
      {
        $project: {
          eventTitle: '$event.title',
          eventDate: '$event.date',
          totalRevenue: 1,
          bookingCount: 1,
          ticketsSold: 1,
          platformCommission: { $multiply: ['$totalRevenue', commissionRate / 100] },
          organizerEarnings: {
            $subtract: ['$totalRevenue', { $multiply: ['$totalRevenue', commissionRate / 100] }],
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Get payout history
    const payouts = await Payout.find({ organizerId }).sort({ createdAt: -1 });

    res.json({
      organizer: {
        id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        organizationName: organizer.organizationName,
      },
      dateFilter,
      period: { startDate, endDate },
      summary: {
        totalRevenue,
        platformCommission,
        organizerEarnings,
        totalBookings: bookings.length,
        totalEvents: events.length,
        commissionRate,
      },
      revenueByEvent,
      payouts,
      recentBookings: bookings.slice(0, 10),
    });
  } catch (error) {
    console.error('Organizer analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all organizers with revenue summary
export const getAllOrganizers = async (req, res) => {
  try {
    const { dateFilter = 'all_time', search = '' } = req.query;
    const { startDate, endDate } = getDateRange(dateFilter);

    const settings = await SystemSettings.findOne({ settingsType: 'global' });
    const commissionRate = settings?.commissionRate || 10;

    // Build search filter
    const searchFilter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { organizationName: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const organizers = await User.find({
      role: 'organizer',
      ...searchFilter,
    });

    const organizerData = await Promise.all(
      organizers.map(async (organizer) => {
        const events = await Event.find({ organizerId: organizer._id });
        const eventIds = events.map(e => e._id);

        const revenue = await Booking.aggregate([
          {
            $match: {
              eventId: { $in: eventIds },
              paymentStatus: 'completed',
              createdAt: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalPrice' },
              bookings: { $sum: 1 },
              tickets: { $sum: '$quantity' },
            },
          },
        ]);

        const totalRevenue = revenue[0]?.total || 0;
        const commission = (totalRevenue * commissionRate) / 100;

        const pendingPayouts = await Payout.aggregate([
          {
            $match: {
              organizerId: organizer._id,
              status: 'pending',
            },
          },
          { $group: { _id: null, total: { $sum: '$netAmount' } } },
        ]);

        return {
          id: organizer._id,
          name: organizer.name,
          email: organizer.email,
          organizationName: organizer.organizationName,
          totalEvents: events.length,
          totalRevenue,
          platformCommission: commission,
          organizerEarnings: totalRevenue - commission,
          totalBookings: revenue[0]?.bookings || 0,
          ticketsSold: revenue[0]?.tickets || 0,
          pendingPayouts: pendingPayouts[0]?.total || 0,
          createdAt: organizer.createdAt,
        };
      })
    );

    // Sort by totalRevenue descending
    organizerData.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json({
      dateFilter,
      period: { startDate, endDate },
      organizers: organizerData,
      totalOrganizers: organizerData.length,
    });
  } catch (error) {
    console.error('Get all organizers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get revenue trends (daily/weekly/monthly)
export const getRevenueTrends = async (req, res) => {
  try {
    const { dateFilter = 'this_month', groupBy = 'day' } = req.query;
    const { startDate, endDate } = getDateRange(dateFilter);

    let groupFormat;
    switch (groupBy) {
      case 'hour':
        groupFormat = { $dateToString: { format: '%Y-%m-%d %H:00', date: '$createdAt' } };
        break;
      case 'day':
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        groupFormat = { $week: '$createdAt' };
        break;
      case 'month':
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      default:
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const trends = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'completed',
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 },
          tickets: { $sum: '$quantity' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      dateFilter,
      groupBy,
      period: { startDate, endDate },
      trends,
    });
  } catch (error) {
    console.error('Revenue trends error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default {
  getDashboardOverview,
  getOrganizerAnalytics,
  getAllOrganizers,
  getRevenueTrends,
};
