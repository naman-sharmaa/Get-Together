import express from 'express';
import * as contactController from '../controllers/contactController.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = express.Router();

// Public route - submit contact form
router.post('/submit', contactController.submitContactForm);

// Admin routes - manage contacts
router.get('/all', adminAuth, contactController.getAllContacts);
router.patch('/:id/status', adminAuth, contactController.updateContactStatus);

export default router;
