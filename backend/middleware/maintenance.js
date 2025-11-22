import SystemSettings from '../models/SystemSettings.js';

export const checkMaintenanceMode = async (req, res, next) => {
  try {
    // Skip maintenance check for admin routes
    if (req.path.startsWith('/api/admin')) {
      return next();
    }

    // Get system settings
    let settings = await SystemSettings.findOne({ settingsType: 'global' });
    
    if (!settings) {
      // Create default settings if not exists
      settings = await SystemSettings.create({ settingsType: 'global' });
    }

    if (settings.maintenanceMode) {
      return res.status(503).json({
        message: 'Service temporarily unavailable',
        maintenanceMessage: settings.maintenanceMessage,
        contactEmail: settings.contactEmail,
        isMaintenanceMode: true,
      });
    }

    // Attach settings to request for other middleware/routes to use
    req.systemSettings = settings;
    next();
  } catch (error) {
    console.error('Maintenance mode check error:', error);
    next(); // Continue even if check fails
  }
};

export default checkMaintenanceMode;
