import express from 'express';
import {
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  resetPassword,
  resendPasswordResetOTP,
} from '../controllers/passwordResetController.js';

const router = express.Router();

// Request password reset OTP
router.post('/request', requestPasswordResetOTP);

// Verify password reset OTP
router.post('/verify-otp', verifyPasswordResetOTP);

// Reset password with verified OTP
router.post('/reset', resetPassword);

// Resend password reset OTP
router.post('/resend', resendPasswordResetOTP);

export default router;
