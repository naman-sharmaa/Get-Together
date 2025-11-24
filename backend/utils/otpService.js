import OTP from '../models/OTP.js';
import nodemailer from 'nodemailer';
import * as brevo from '@getbrevo/brevo';

// Email configuration - use Brevo API or Gmail SMTP
let transporter;
let brevoApiInstance = null;

// Initialize email service (same logic as emailService.js)
if (process.env.BREVO_API_KEY) {
  console.log('📧 OTP Service: Using Brevo API');
  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
  brevoApiInstance = apiInstance;
} else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  console.log('📧 OTP Service: Using Gmail SMTP');
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// Generate random OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email using Brevo API or Gmail
export const sendOTPEmail = async (email, otp, type = 'login') => {
  try {
    const expiryMinutes = type === 'password_reset' ? 5 : 10;
    const subject = type === 'login' 
      ? 'Your OTP for Login' 
      : 'Your OTP for Password Reset';
    
    const message = type === 'login'
      ? `Your OTP for login is: ${otp}. This OTP will expire in ${expiryMinutes} minutes.`
      : `Your OTP for password reset is: ${otp}. This OTP will expire in ${expiryMinutes} minutes. If you requested a new OTP, any previous OTPs are now invalid.`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">GetTogether Security</h2>
        <p style="color: #666; font-size: 16px;">
          ${message}
        </p>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin: 0; text-align: center; font-size: 32px; letter-spacing: 5px;">
            ${otp}
          </h3>
        </div>
        <p style="color: #999; font-size: 12px;">
          If you didn't request this OTP, please ignore this email.
        </p>
      </div>
    `;

    if (brevoApiInstance) {
      // Use Brevo API
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.sender = { 
        email: process.env.EMAIL_USER || 'gettogetherebookings@gmail.com',
        name: 'GetTogether Security'
      };
      sendSmtpEmail.to = [{ email }];
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
      
      await brevoApiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`✅ OTP email sent via Brevo to ${email}`);
    } else if (transporter) {
      // Use Gmail SMTP
      await transporter.sendMail({
        from: `"GetTogether Security" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: htmlContent,
      });
      console.log(`✅ OTP email sent via Gmail to ${email}`);
    } else {
      throw new Error('No email service configured');
    }

    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send OTP email: ' + error.message);
  }
};

// Create and save OTP
export const createOTP = async (email, phone, type, purpose = 'user') => {
  try {
    // Delete any existing OTP for this email/type combination
    // This ensures old OTPs are invalidated when a new one is requested
    await OTP.deleteMany({ email, type, purpose });

    const otp = generateOTP();
    // Set expiry based on type: 5 minutes for password reset, 10 minutes for login
    const expiryMinutes = type === 'password_reset' ? 5 : 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const otpRecord = await OTP.create({
      email,
      phone,
      otp,
      type,
      purpose,
      expiresAt,
    });

    return otp;
  } catch (error) {
    console.error('Error creating OTP:', error);
    throw new Error('Failed to create OTP');
  }
};

// Verify OTP
export const verifyOTP = async (email, otp, type, purpose = 'user') => {
  try {
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type,
      purpose,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return { valid: false, message: 'Invalid or expired OTP' };
    }

    // Check attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return { valid: false, message: 'Maximum attempts exceeded. Please request a new OTP.' };
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    return { valid: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Failed to verify OTP');
  }
};

// Increment OTP attempts
export const incrementOTPAttempts = async (email, otp, type, purpose = 'user') => {
  try {
    const otpRecord = await OTP.findOne({
      email,
      otp,
      type,
      purpose,
    });

    if (otpRecord) {
      otpRecord.attempts += 1;
      await otpRecord.save();
    }
  } catch (error) {
    console.error('Error incrementing OTP attempts:', error);
  }
};

// Delete OTP after successful verification
export const deleteOTP = async (email, type, purpose = 'user') => {
  try {
    await OTP.deleteOne({ email, type, purpose, verified: true });
  } catch (error) {
    console.error('Error deleting OTP:', error);
  }
};
