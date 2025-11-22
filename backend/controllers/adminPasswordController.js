import Admin from '../models/Admin.js';
import OTP from '../models/OTP.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

/**
 * Request OTP for password change
 */
export const requestPasswordChangeOTP = async (req, res) => {
  try {
    console.log('[Admin Password OTP] Request received');
    console.log('[Admin Password OTP] Admin ID from token:', req.admin?.id);
    
    const adminId = req.admin.id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
      console.log('[Admin Password OTP] Admin not found for ID:', adminId);
      return res.status(404).json({ message: 'Admin not found' });
    }

    console.log('[Admin Password OTP] Admin found:', admin.email);

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this admin
    await OTP.deleteMany({ email: admin.email, type: 'admin_password_change' });

    // Save new OTP with 10-minute expiry
    const otp = new OTP({
      email: admin.email,
      otp: otpCode,
      type: 'admin_password_change',
      purpose: 'user', // Required field
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    await otp.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: {
        name: 'EventHub Admin',
        address: process.env.EMAIL_USER,
      },
      to: admin.email,
      subject: 'Admin Password Change - OTP Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
            .content { padding: 40px 30px; }
            .otp-box { background: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; border: 2px dashed #667eea; }
            .otp-code { font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; margin: 10px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Admin Password Change</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${admin.name}</strong>,</p>
              <p>You have requested to change your admin password. Use the OTP below to verify your identity:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #6c757d;">Your OTP Code</p>
                <div class="otp-code">${otpCode}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #6c757d;">Valid for 10 minutes</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you did not request this password change, please ignore this email and contact support immediately.
              </div>

              <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                This OTP will expire in 10 minutes for security reasons.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
              <p>This is an automated message, please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send with retry logic
    let emailSent = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!emailSent && attempts < maxAttempts) {
      try {
        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (emailError) {
        attempts++;
        console.error(`Email attempt ${attempts} failed:`, emailError);
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
        }
      }
    }

    if (!emailSent) {
      return res.status(500).json({ 
        message: 'Failed to send OTP email after multiple attempts' 
      });
    }

    console.log(`[Admin Password Change] OTP sent to ${admin.email}`);

    res.json({ 
      message: 'OTP sent successfully to your email',
      email: admin.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'), // Masked email
    });
  } catch (error) {
    console.error('[Admin Password Change] Request OTP error:', error);
    console.error('[Admin Password Change] Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to send OTP',
      error: error.message 
    });
  }
};

/**
 * Verify OTP and change password
 */
export const changePasswordWithOTP = async (req, res) => {
  try {
    const adminId = req.admin.id;
    const { otp, newPassword } = req.body;

    if (!otp || !newPassword) {
      return res.status(400).json({ 
        message: 'OTP and new password are required' 
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        message: 'Password must be at least 8 characters long' 
      });
    }

    // Find admin with password field (it has select: false)
    const admin = await Admin.findById(adminId).select('+password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: admin.email,
      otp: otp,
      type: 'admin_password_change',
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ 
        message: 'Invalid or expired OTP' 
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, admin.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: 'New password must be different from current password' 
      });
    }

    // Update password (pre-save hook will hash it)
    admin.password = newPassword;
    await admin.save();

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Delete all other OTPs for this admin
    await OTP.deleteMany({ 
      email: admin.email, 
      type: 'admin_password_change' 
    });

    console.log(`[Admin Password Change] Password changed successfully for ${admin.email}`);

    // Send confirmation email
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: {
          name: 'EventHub Admin',
          address: process.env.EMAIL_USER,
        },
        to: admin.email,
        subject: 'Admin Password Changed Successfully',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
              .content { padding: 40px 30px; }
              .success-icon { font-size: 64px; text-align: center; margin: 20px 0; }
              .info-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Password Changed</h1>
              </div>
              <div class="content">
                <div class="success-icon">🔐</div>
                <p>Hello <strong>${admin.name}</strong>,</p>
                <p>Your admin password has been changed successfully.</p>
                
                <div class="info-box">
                  <p><strong>Change Details:</strong></p>
                  <p>📧 Email: ${admin.email}</p>
                  <p>🕒 Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                  <p>🔒 Status: Password updated successfully</p>
                </div>

                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> If you did not make this change, please contact support immediately and secure your account.
                </div>

                <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                  You can now use your new password to log in to the admin portal.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('[Admin Password Change] Confirmation email failed:', emailError);
      // Don't fail the request if confirmation email fails
    }

    res.json({ 
      message: 'Password changed successfully',
      success: true,
    });
  } catch (error) {
    console.error('[Admin Password Change] Change password error:', error);
    res.status(500).json({ 
      message: 'Failed to change password',
      error: error.message 
    });
  }
};
