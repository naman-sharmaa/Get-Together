import mongoose from 'mongoose';
import Event from '../models/Event.js';
import dotenv from 'dotenv';

dotenv.config();

const addBookingExpiryToEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all events without bookingExpiry
    const eventsWithoutExpiry = await Event.find({ bookingExpiry: { $exists: false } });
    console.log(`Found ${eventsWithoutExpiry.length} events without bookingExpiry`);

    if (eventsWithoutExpiry.length === 0) {
      console.log('All events already have bookingExpiry set');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Update each event with a default bookingExpiry (24 hours before event date)
    for (const event of eventsWithoutExpiry) {
      const eventDate = new Date(event.date);
      const bookingExpiry = new Date(eventDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before event
      
      await Event.findByIdAndUpdate(event._id, { bookingExpiry });
      console.log(`Updated event: ${event.title} with bookingExpiry: ${bookingExpiry}`);
    }

    console.log(`✅ Successfully updated ${eventsWithoutExpiry.length} events with bookingExpiry`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

addBookingExpiryToEvents();
