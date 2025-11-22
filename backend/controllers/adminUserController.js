import User from '../models/User.js';

/**
 * Get all users with their details
 */
export const getAllUsers = async (req, res) => {
  try {
    console.log('[Admin Users] Fetching all users');

    // Fetch all users with basic details
    const users = await User.find({})
      .select('name email phoneNumber role createdAt lastLogin isActive')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`[Admin Users] Found ${users.length} users`);

    // Transform data for frontend
    const usersData = users.map(user => ({
      _id: user._id,
      name: user.name || 'N/A',
      email: user.email || 'N/A',
      phoneNumber: user.phoneNumber || 'N/A',
      role: user.role || 'user',
      isActive: user.isActive !== false, // default to true if not set
      createdAt: user.createdAt,
      lastLogin: user.lastLogin || null,
    }));

    res.json(usersData);
  } catch (error) {
    console.error('[Admin Users] Error fetching users:', error);
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};

/**
 * Get user statistics
 */
export const getUserStats = async (req, res) => {
  try {
    console.log('[Admin Users] Fetching user statistics');

    const totalUsers = await User.countDocuments();
    const organizers = await User.countDocuments({ role: 'organizer' });
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // New users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });

    const stats = {
      total: totalUsers,
      organizers,
      active: activeUsers,
      new: newUsers,
      existing: totalUsers - newUsers,
    };

    console.log('[Admin Users] Stats:', stats);

    res.json(stats);
  } catch (error) {
    console.error('[Admin Users] Error fetching stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch user statistics',
      error: error.message 
    });
  }
};
