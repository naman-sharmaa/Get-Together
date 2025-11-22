import express from 'express';
import { body } from 'express-validator';
import { signUp, signIn, getMe, firebaseGoogleAuth } from '../controllers/authController.js';
import {
  requestLoginOTP,
  verifyLoginOTP,
  requestPasswordResetOTP,
  resetPasswordWithOTP,
  requestPhoneVerificationOTP,
  verifyPhoneWithOTP,
} from '../controllers/otpAuthController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const signUpValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const signInValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const requestOTPValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
];

const verifyOTPValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

const resetPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const verifyPhoneValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('phone').isMobilePhone().withMessage('Please provide a valid phone number'),
];

// Traditional routes
router.post('/signup', signUpValidation, signUp);
router.post('/signin', signInValidation, signIn);
router.get('/me', authenticate, getMe);

// Firebase Google Authentication
router.post('/firebase-google-auth', firebaseGoogleAuth);

// OTP-based authentication routes
router.post('/request-login-otp', requestOTPValidation, requestLoginOTP);
router.post('/verify-login-otp', verifyOTPValidation, verifyLoginOTP);

// Password reset routes
router.post('/request-password-reset-otp', requestOTPValidation, requestPasswordResetOTP);
router.post('/reset-password-otp', resetPasswordValidation, resetPasswordWithOTP);

// Phone verification routes
router.post('/request-phone-verification-otp', requestOTPValidation, requestPhoneVerificationOTP);
router.post('/verify-phone-otp', verifyPhoneValidation, verifyPhoneWithOTP);

export default router;

