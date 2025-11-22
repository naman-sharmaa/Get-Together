import express from 'express';
import { body } from 'express-validator';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim(),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

// Routes
router.get('/:id', getUserProfile);
router.put('/profile', authenticate, updateProfileValidation, updateUserProfile);
router.put('/change-password', authenticate, changePasswordValidation, changePassword);

export default router;

