import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixBookingIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop the old ticketNumbers index if it exists
    try {
      await db.collection('bookings').dropIndex('ticketNumbers_1');
      console.log('✓ Dropped old ticketNumbers unique index');
    } catch (err) {
      if (err.message.includes('index not found')) {
        console.log('✓ Index does not exist (already clean)');
      } else {
        throw err;
      }
    }

    console.log('✓ Booking index migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing booking index:', error);
    process.exit(1);
  }
};

fixBookingIndex();
