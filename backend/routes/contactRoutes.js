import express from 'express';
import * as contactController from '../controllers/contactController.js';
import { authenticateAdmin } from '../middleware/adminAuth.js';

const router = express.Router();

// Public route - submit contact form
router.post('/submit', contactController.submitContactForm);

// Admin routes - manage contacts
router.get('/all', authenticateAdmin, contactController.getAllContacts);
router.patch('/:id/status', authenticateAdmin, contactController.updateContactStatus);

export default router;
