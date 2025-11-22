import Event from '../models/Event.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Get all events (with filters for upcoming/past)
export const getEvents = async (req, res) => {
  try {
    const { status, category, organizerId } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (organizerId) {
      query.organizerId = new mongoose.Types.ObjectId(organizerId);
    }

    const events = await Event.find(query)
      .populate('organizerId', 'name organizationName')
      .sort({ date: 1 });

    const now = new Date();

    // Filter events based on date and status
    let filteredEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      const isPast = eventDate < now;
      
      if (status === 'upcoming') {
        return !isPast;
      } else if (status === 'past') {
        return isPast;
      }
      return true;
    });

    // Update event status in database if needed (async, don't wait)
    filteredEvents.forEach(event => {
      const eventDate = new Date(event.date);
      const isPast = eventDate < now;
      if (isPast && event.status === 'upcoming') {
        Event.updateOne({ _id: event._id }, { status: 'past' }).catch(err => 
          console.error('Error updating event status:', err)
        );
      }
    });

    // Transform the data to match expected format
    const formattedEvents = filteredEvents.map(event => ({
      ...event.toObject(),
      organizer_name: event.organizerId?.name,
      organization_name: event.organizerId?.organizationName,
      organizer_id: event.organizerId?._id,
    }));

    res.json({ events: formattedEvents });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single event
export const getEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const event = await Event.findById(id).populate('organizerId', 'name organizationName');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const formattedEvent = {
      ...event.toObject(),
      organizer_name: event.organizerId?.name,
      organization_name: event.organizerId?.organizationName,
      organizer_id: event.organizerId?._id,
    };

    res.json({ event: formattedEvent });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create event (organizer only)
export const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      date,
      location,
      price,
      imageUrl,
      totalTickets,
      bookingExpiry,
    } = req.body;

    const event = await Event.create({
      organizerId: req.user.id,
      title,
      description: description || undefined,
      category,
      date,
      location,
      price,
      imageUrl: imageUrl || undefined,
      totalTickets: totalTickets || 0,
      availableTickets: totalTickets || 0,
      bookingExpiry,
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update event (organizer only)
export const updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // Check if event exists and belongs to organizer
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const {
      title,
      description,
      category,
      date,
      location,
      price,
      imageUrl,
      totalTickets,
      bookingExpiry,
    } = req.body;

    // Update only provided fields
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (category !== undefined) event.category = category;
    if (date !== undefined) event.date = date;
    if (location !== undefined) event.location = location;
    if (price !== undefined) event.price = price;
    if (imageUrl !== undefined) event.imageUrl = imageUrl;
    if (totalTickets !== undefined) {
      event.totalTickets = totalTickets;
      event.availableTickets = totalTickets;
    }
    if (bookingExpiry !== undefined) event.bookingExpiry = bookingExpiry;

    await event.save();

    res.json({ message: 'Event updated successfully', event });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete event (organizer only)
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // Check if event exists and belongs to organizer
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get organizer's events
export const getMyEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { organizerId: req.user.id };

    if (status) {
      query.status = status;
    }

    const events = await Event.find(query).sort({ date: -1 });
    res.json({ events });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
