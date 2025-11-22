import express from 'express';
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  getSubscribers,
  sendNewsletterToAll,
  updatePreferences,
} from '../controllers/newsletterController.js';
import { protect, organizer } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/subscribe', subscribeToNewsletter);
router.post('/unsubscribe', unsubscribeFromNewsletter);
router.put('/preferences', updatePreferences);

// Protected routes (organizer/admin only)
router.get('/subscribers', protect, organizer, getSubscribers);
router.post('/send', protect, organizer, sendNewsletterToAll);

export default router;
