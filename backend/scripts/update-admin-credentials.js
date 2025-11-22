import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to update admin credentials
 * Usage: node update-admin-credentials.js <email> <password>
 */

const updateAdminCredentials = async () => {
  try {
    // Get arguments from command line
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.log('Usage: node update-admin-credentials.js <email> <password>');
      console.log('Example: node update-admin-credentials.js admin@example.com MyNewPassword123');
      process.exit(1);
    }

    const newEmail = args[0];
    const newPassword = args[1];

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      console.error('❌ Invalid email format');
      process.exit(1);
    }

    // Validate password length
    if (newPassword.length < 8) {
      console.error('❌ Password must be at least 8 characters long');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find the super-admin
    const admin = await Admin.findOne({ role: 'super-admin' });
    
    if (!admin) {
      console.error('❌ No super-admin found in database');
      console.log('Creating new super-admin...');
      
      // Create new super-admin - password will be hashed by pre-save hook
      const newAdmin = new Admin({
        name: 'Super Admin',
        email: newEmail,
        password: newPassword,
        role: 'super-admin',
        isActive: true,
        permissions: {
          canManageUsers: true,
          canViewAnalytics: true,
          canManagePayouts: true,
          canToggleMaintenance: true,
        },
      });
      
      await newAdmin.save();
      console.log('✅ New super-admin created successfully!');
      console.log(`📧 Email: ${newEmail}`);
      console.log(`🔑 Password: ${newPassword}`);
    } else {
      // Update existing admin
      console.log(`📝 Found existing admin: ${admin.email}`);
      console.log(`🔄 Updating to new credentials...`);
      
      // Update admin - password will be hashed by pre-save hook
      admin.email = newEmail;
      admin.password = newPassword;
      await admin.save();
      
      console.log('✅ Admin credentials updated successfully!');
      console.log(`📧 New Email: ${newEmail}`);
      console.log(`🔑 New Password: ${newPassword}`);
    }

    console.log('\n🎉 You can now login to the admin portal with your new credentials!');
    console.log(`🌐 Admin Portal: http://localhost:8080/admin/login`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating admin credentials:', error);
    process.exit(1);
  }
};

updateAdminCredentials();
