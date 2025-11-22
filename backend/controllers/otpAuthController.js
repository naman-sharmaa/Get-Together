import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { validationResult } from 'express-validator';
import {
  generateOTP,
  sendOTPEmail,
  createOTP,
  verifyOTP,
  incrementOTPAttempts,
  deleteOTP,
} from '../utils/otpService.js';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Request OTP for login
export const requestLoginOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role = 'user' } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if role matches
    if (role && user.role !== role) {
      const roleName = user.role === 'organizer' ? 'organizer' : 'user';
      return res.status(403).json({
        message: `This account is registered as a ${roleName}. Please use the ${roleName} login page.`,
      });
    }

    // Create and send OTP
    const otp = await createOTP(email.toLowerCase(), user.phone, 'login', role);
    await sendOTPEmail(email.toLowerCase(), otp, 'login');

    res.json({
      message: 'OTP sent to your email',
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error('Request login OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify OTP and login
export const verifyLoginOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, role = 'user' } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if role matches
    if (role && user.role !== role) {
      const roleName = user.role === 'organizer' ? 'organizer' : 'user';
      return res.status(403).json({
        message: `This account is registered as a ${roleName}. Please use the ${roleName} login page.`,
      });
    }

    // Verify OTP
    const verification = await verifyOTP(email.toLowerCase(), otp, 'login', role);
    if (!verification.valid) {
      await incrementOTPAttempts(email.toLowerCase(), otp, 'login', role);
      return res.status(401).json({ message: verification.message });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Delete OTP after successful verification
    await deleteOTP(email.toLowerCase(), 'login', role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        organizationName: user.organizationName,
      },
    });
  } catch (error) {
    console.error('Verify login OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request password reset OTP
export const requestPasswordResetOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role = 'user' } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if role matches
    if (role && user.role !== role) {
      const roleName = user.role === 'organizer' ? 'organizer' : 'user';
      return res.status(403).json({
        message: `This account is registered as a ${roleName}. Please use the ${roleName} login page.`,
      });
    }

    // Create and send OTP
    const otp = await createOTP(email.toLowerCase(), user.phone, 'password_reset', role);
    await sendOTPEmail(email.toLowerCase(), otp, 'password_reset');

    res.json({
      message: 'Password reset OTP sent to your email',
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error('Request password reset OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify password reset OTP and reset password
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, newPassword, role = 'user' } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if role matches
    if (role && user.role !== role) {
      const roleName = user.role === 'organizer' ? 'organizer' : 'user';
      return res.status(403).json({
        message: `This account is registered as a ${roleName}. Please use the ${roleName} login page.`,
      });
    }

    // Verify OTP
    const verification = await verifyOTP(email.toLowerCase(), otp, 'password_reset', role);
    if (!verification.valid) {
      await incrementOTPAttempts(email.toLowerCase(), otp, 'password_reset', role);
      return res.status(401).json({ message: verification.message });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete OTP after successful verification
    await deleteOTP(email.toLowerCase(), 'password_reset', role);

    res.json({
      message: 'Password reset successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Reset password with OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify phone number with OTP
export const requestPhoneVerificationOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, phone, role = 'user' } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create OTP for phone verification
    const otp = await createOTP(email.toLowerCase(), phone, 'phone_verification', role);
    await sendOTPEmail(email.toLowerCase(), otp, 'phone_verification');

    res.json({
      message: 'Phone verification OTP sent to your email',
      email: email.toLowerCase(),
    });
  } catch (error) {
    console.error('Request phone verification OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Verify phone with OTP
export const verifyPhoneWithOTP = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, phone, role = 'user' } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify OTP
    const verification = await verifyOTP(email.toLowerCase(), otp, 'phone_verification', role);
    if (!verification.valid) {
      await incrementOTPAttempts(email.toLowerCase(), otp, 'phone_verification', role);
      return res.status(401).json({ message: verification.message });
    }

    // Update phone and mark as verified
    user.phone = phone;
    user.phoneVerified = true;
    await user.save();

    // Delete OTP after successful verification
    await deleteOTP(email.toLowerCase(), 'phone_verification', role);

    res.json({
      message: 'Phone verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Verify phone with OTP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
