import Newsletter from '../models/Newsletter.js';
import { sendNewsletterEmail } from '../utils/emailService.js';

/**
 * Subscribe to newsletter
 * POST /api/newsletter/subscribe
 */
export const subscribeToNewsletter = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email already subscribed
    let subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (subscriber) {
      if (subscriber.status === 'active') {
        return res.status(200).json({ 
          message: 'You are already subscribed to our newsletter!',
          success: true 
        });
      } else {
        // Resubscribe
        subscriber.status = 'active';
        subscriber.subscribedAt = new Date();
        subscriber.unsubscribedAt = null;
        if (name) subscriber.name = name;
        await subscriber.save();

        return res.status(200).json({
          message: 'Welcome back! You have been resubscribed to our newsletter.',
          success: true,
        });
      }
    }

    // Create new subscriber
    subscriber = await Newsletter.create({
      email: email.toLowerCase(),
      name: name || '',
      status: 'active',
    });

    // Send welcome email
    try {
      await sendNewsletterEmail(email.toLowerCase(), name, 'welcome');
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    res.status(201).json({
      message: 'Successfully subscribed to newsletter! Check your email for confirmation.',
      success: true,
    });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({
      message: 'Failed to subscribe to newsletter. Please try again.',
      error: error.message,
    });
  }
};

/**
 * Unsubscribe from newsletter
 * POST /api/newsletter/unsubscribe
 */
export const unsubscribeFromNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.status(404).json({ 
        message: 'Email not found in our newsletter list',
        success: false 
      });
    }

    if (subscriber.status === 'unsubscribed') {
      return res.status(200).json({ 
        message: 'You are already unsubscribed from our newsletter',
        success: true 
      });
    }

    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.status(200).json({
      message: 'Successfully unsubscribed from newsletter. We\'re sorry to see you go!',
      success: true,
    });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({
      message: 'Failed to unsubscribe from newsletter. Please try again.',
      error: error.message,
    });
  }
};

/**
 * Get newsletter subscribers (admin only)
 * GET /api/newsletter/subscribers
 */
export const getSubscribers = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const subscribers = await Newsletter.find(filter)
      .select('-__v')
      .sort({ subscribedAt: -1 });

    const stats = {
      total: subscribers.length,
      active: await Newsletter.countDocuments({ status: 'active' }),
      unsubscribed: await Newsletter.countDocuments({ status: 'unsubscribed' }),
    };

    res.status(200).json({
      success: true,
      count: subscribers.length,
      stats,
      subscribers,
    });
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    res.status(500).json({
      message: 'Failed to fetch subscribers',
      error: error.message,
    });
  }
};

/**
 * Send newsletter to all active subscribers (admin only)
 * POST /api/newsletter/send
 */
export const sendNewsletterToAll = async (req, res) => {
  try {
    const { subject, content, type } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }

    // Get all active subscribers
    const subscribers = await Newsletter.find({ status: 'active' });

    if (subscribers.length === 0) {
      return res.status(404).json({ 
        message: 'No active subscribers found',
        success: false 
      });
    }

    // Send email to all subscribers
    let successCount = 0;
    let failCount = 0;

    for (const subscriber of subscribers) {
      try {
        await sendNewsletterEmail(
          subscriber.email,
          subscriber.name,
          type || 'custom',
          { subject, content }
        );
        successCount++;
      } catch (emailError) {
        console.error(`Failed to send to ${subscriber.email}:`, emailError);
        failCount++;
      }
    }

    res.status(200).json({
      message: `Newsletter sent successfully to ${successCount} subscribers`,
      success: true,
      stats: {
        total: subscribers.length,
        success: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({
      message: 'Failed to send newsletter',
      error: error.message,
    });
  }
};

/**
 * Update newsletter preferences
 * PUT /api/newsletter/preferences
 */
export const updatePreferences = async (req, res) => {
  try {
    const { email, preferences } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.status(404).json({ 
        message: 'Email not found in our newsletter list',
        success: false 
      });
    }

    if (preferences) {
      subscriber.preferences = { ...subscriber.preferences, ...preferences };
      await subscriber.save();
    }

    res.status(200).json({
      message: 'Newsletter preferences updated successfully',
      success: true,
      preferences: subscriber.preferences,
    });
  } catch (error) {
    console.error('Error updating newsletter preferences:', error);
    res.status(500).json({
      message: 'Failed to update preferences',
      error: error.message,
    });
  }
};
