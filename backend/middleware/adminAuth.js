import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    console.log('🔐 Admin auth middleware - Token received:', token ? 'YES' : 'NO');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'Admin authentication required. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully. Admin ID:', decoded.id);

    // Find admin by ID from token
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      console.log('❌ Admin not found with ID:', decoded.id);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    if (!admin.isActive) {
      console.log('❌ Admin account is inactive:', admin.email);
      return res.status(403).json({ message: 'Admin account is inactive' });
    }

    console.log('✅ Admin authenticated:', admin.email, '- Role:', admin.role);

    // Attach admin to request
    req.admin = admin;
    req.user = { id: admin._id }; // For compatibility with other code
    next();
  } catch (error) {
    console.error('❌ Admin authentication error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(500).json({ message: 'Server error during admin authentication' });
  }
};

export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(403).json({ message: 'Admin authentication required' });
    }

    if (req.admin.role === 'super-admin') {
      // Super admin has all permissions
      return next();
    }

    if (!req.admin.permissions[permission]) {
      return res.status(403).json({ 
        message: `You don't have permission to perform this action`,
        requiredPermission: permission 
      });
    }

    next();
  };
};

export default { authenticateAdmin, checkPermission };
