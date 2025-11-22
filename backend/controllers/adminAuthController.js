import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Generate JWT Token
const generateToken = (adminId) => {
  return jwt.sign({ id: adminId, isAdmin: true }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

// Admin Login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('[Admin Login] Attempting login for:', email);

    // Find admin with password
    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    if (!admin) {
      console.log('[Admin Login] No admin found with email:', email.toLowerCase());
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('[Admin Login] Admin found:', admin.email);

    if (!admin.isActive) {
      return res.status(403).json({ message: 'Admin account is inactive. Contact super admin.' });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);
    console.log('[Admin Login] Password match:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id.toString());

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create Admin (Only super-admin can create)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      permissions,
    });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current admin
export const getCurrentAdmin = async (req, res) => {
  try {
    // req.admin is already populated by authenticateAdmin middleware
    if (!req.admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ 
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role,
        permissions: req.admin.permissions,
      }
    });
  } catch (error) {
    console.error('Get admin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default { adminLogin, createAdmin, getCurrentAdmin };
