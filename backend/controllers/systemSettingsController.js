import SystemSettings from '../models/SystemSettings.js';

// Get system settings
export const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({ settingsType: 'global' });
    
    if (!settings) {
      settings = await SystemSettings.create({ settingsType: 'global' });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update system settings
export const updateSystemSettings = async (req, res) => {
  try {
    const updates = req.body;

    let settings = await SystemSettings.findOne({ settingsType: 'global' });
    
    if (!settings) {
      settings = await SystemSettings.create({ settingsType: 'global', ...updates });
    } else {
      Object.keys(updates).forEach(key => {
        settings[key] = updates[key];
      });
      await settings.save();
    }

    console.log(`✅ System settings updated by admin ${req.admin.email}`);
    if (updates.maintenanceMode !== undefined) {
      console.log(`🔧 Maintenance mode: ${updates.maintenanceMode ? 'ON' : 'OFF'}`);
    }

    res.json({
      message: 'System settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle maintenance mode
export const toggleMaintenanceMode = async (req, res) => {
  try {
    const { enabled, message } = req.body;

    let settings = await SystemSettings.findOne({ settingsType: 'global' });
    
    if (!settings) {
      settings = await SystemSettings.create({ settingsType: 'global' });
    }

    settings.maintenanceMode = enabled;
    if (message) {
      settings.maintenanceMessage = message;
    }
    await settings.save();

    console.log(`🔧 Maintenance mode ${enabled ? 'ENABLED' : 'DISABLED'} by ${req.admin.email}`);

    res.json({
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
    });
  } catch (error) {
    console.error('Toggle maintenance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default {
  getSystemSettings,
  updateSystemSettings,
  toggleMaintenanceMode,
};
