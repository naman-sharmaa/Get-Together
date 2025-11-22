import User from '../models/User.js';
import { createOTP, sendOTPEmail, verifyOTP, deleteOTP } from '../utils/otpService.js';

/**
 * Request password reset OTP
 * POST /api/auth/forgot-password/request
 */
export const requestPasswordResetOTP = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate role
    const userRole = role || 'user';
    if (!['user', 'organizer'].includes(userRole)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase(), role: userRole });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive a password reset OTP shortly.',
        success: true 
      });
    }

    // Create and send OTP
    const otp = await createOTP(email.toLowerCase(), null, 'password_reset', userRole);
    await sendOTPEmail(email.toLowerCase(), otp, 'password_reset');

    res.status(200).json({
      message: 'Password reset OTP sent to your email. Valid for 5 minutes.',
      success: true,
    });
  } catch (error) {
    console.error('Error requesting password reset OTP:', error);
    res.status(500).json({
      message: 'Failed to send password reset OTP. Please try again.',
      error: error.message,
    });
  }
};

/**
 * Verify password reset OTP
 * POST /api/auth/forgot-password/verify-otp
 */
export const verifyPasswordResetOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Validate role
    const userRole = role || 'user';
    if (!['user', 'organizer'].includes(userRole)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Verify OTP
    const verification = await verifyOTP(email.toLowerCase(), otp, 'password_reset', userRole);

    if (!verification.valid) {
      return res.status(400).json({ 
        message: verification.message,
        success: false 
      });
    }

    res.status(200).json({
      message: 'OTP verified successfully. You can now reset your password.',
      success: true,
    });
  } catch (error) {
    console.error('Error verifying password reset OTP:', error);
    res.status(500).json({
      message: 'Failed to verify OTP. Please try again.',
      error: error.message,
    });
  }
};

/**
 * Reset password with verified OTP
 * POST /api/auth/forgot-password/reset
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, role } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate role
    const userRole = role || 'user';
    if (!['user', 'organizer'].includes(userRole)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Verify OTP one more time
    const verification = await verifyOTP(email.toLowerCase(), otp, 'password_reset', userRole);

    if (!verification.valid) {
      return res.status(400).json({ 
        message: verification.message,
        success: false 
      });
    }

    // Find user (select password field explicitly since it's hidden by default)
    const user = await User.findOne({ email: email.toLowerCase(), role: userRole }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    console.log(`✅ Password reset successful for ${email} (${userRole})`);

    // Delete the OTP after successful password reset
    await deleteOTP(email.toLowerCase(), 'password_reset', userRole);

    res.status(200).json({
      message: 'Password reset successfully. You can now sign in with your new password.',
      success: true,
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      message: 'Failed to reset password. Please try again.',
      error: error.message,
    });
  }
};

/**
 * Resend password reset OTP
 * POST /api/auth/forgot-password/resend
 */
export const resendPasswordResetOTP = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate role
    const userRole = role || 'user';
    if (!['user', 'organizer'].includes(userRole)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase(), role: userRole });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({ 
        message: 'If an account exists with this email, you will receive a new OTP shortly.',
        success: true 
      });
    }

    // Create new OTP (this automatically deletes old ones)
    const otp = await createOTP(email.toLowerCase(), null, 'password_reset', userRole);
    await sendOTPEmail(email.toLowerCase(), otp, 'password_reset');

    res.status(200).json({
      message: 'New OTP sent to your email. Previous OTP is now invalid.',
      success: true,
    });
  } catch (error) {
    console.error('Error resending password reset OTP:', error);
    res.status(500).json({
      message: 'Failed to resend OTP. Please try again.',
      error: error.message,
    });
  }
};
