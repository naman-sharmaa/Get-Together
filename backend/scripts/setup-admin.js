import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';

dotenv.config();

const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ role: 'super-admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Super admin already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log('\nIf you want to create a new super admin, please delete the existing one first.');
      process.exit(0);
    }

    // Create super admin
    const admin = await Admin.create({
      name: 'Super Admin',
      email: 'admin@eventhub.com',
      password: 'Admin@123456', // CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN
      role: 'super-admin',
      permissions: {
        canManageUsers: true,
        canManageEvents: true,
        canManagePayouts: true,
        canToggleMaintenance: true,
        canViewAnalytics: true,
      },
    });

    console.log('\n✅ Super Admin created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: Admin@123456`);
    console.log('\n⚠️  IMPORTANT: Change the password immediately after first login!');
    console.log('\nAccess the admin portal at: http://localhost:8081/admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
};

setupAdmin();
