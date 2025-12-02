import nodemailer from 'nodemailer';
import * as brevo from '@getbrevo/brevo';
import { generateTicketPDF } from './pdfService.js';

// Helper function to get the sender email
const getSenderEmail = (customName = 'GetTogether') => {
  // Priority: EMAIL_FROM > EMAIL_USER (for backward compatibility)
  const emailFrom = process.env.EMAIL_FROM || `"${customName}" <${process.env.EMAIL_USER}>`;
  return emailFrom;
};

// Helper function to send email with retry logic
const sendMailWithRetry = async (mailOptions, maxRetries = 3, delayMs = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use Brevo API if configured, otherwise use transporter
      if (brevoApiInstance) {
        const info = await sendViaBrevoApi(mailOptions);
        return info;
      } else {
        const info = await transporter.sendMail(mailOptions);
        return info;
      }
    } catch (error) {
      console.error(`Email attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delayMs * attempt;
      console.log(`Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// Brevo API instance (used when BREVO_API_KEY is set)
let brevoApiInstance = null;

// Helper function to send email via Brevo API
const sendViaBrevoApi = async (mailOptions) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    // Extract sender email and name
    const senderEmail = mailOptions.from.match(/<(.+)>/)?.[1] || mailOptions.from.replace(/[<>"]/g, '');
    const senderName = mailOptions.from.match(/"(.+?)"/)?.[1] || 'GetTogether';
    
    console.log('📤 Brevo API - Preparing email:');
    console.log('   From:', senderName, '<' + senderEmail + '>');
    console.log('   To:', mailOptions.to);
    console.log('   Subject:', mailOptions.subject);
    
    sendSmtpEmail.sender = { 
      email: senderEmail,
      name: senderName
    };
    sendSmtpEmail.to = [{ email: mailOptions.to }];
    sendSmtpEmail.subject = mailOptions.subject;
    sendSmtpEmail.htmlContent = mailOptions.html;
    
    // Handle attachments
    if (mailOptions.attachments && mailOptions.attachments.length > 0) {
      console.log('   Attachments:', mailOptions.attachments.length);
      sendSmtpEmail.attachment = mailOptions.attachments.map(att => ({
        name: att.filename,
        content: att.content.toString('base64'),
      }));
    }
    
    const result = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Brevo API Response:', {
      messageId: result.response.messageId,
      statusCode: result.response.statusCode || 'N/A'
    });
    
    return { messageId: result.response.messageId };
  } catch (error) {
    console.error('❌ Brevo API Error:', error.message);
    console.error('   Error body:', error.body || error.response || 'No details');
    throw error;
  }
};

// Configure email service - priority: Brevo API > Gmail SMTP
let transporter;

// Debug: Log what credentials are available
console.log('🔍 Email Service Configuration Check:');
console.log('  BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('  EMAIL_USER:', process.env.EMAIL_USER ? '✅ SET' : '❌ NOT SET');
console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET' : '❌ NOT SET');

if (process.env.BREVO_API_KEY) {
  // Brevo API - uses HTTPS (port 443), never blocked by cloud providers
  console.log('📧 Using Brevo API (HTTPS - port 443)');
  console.log('   Sender: GetTogether <' + (process.env.EMAIL_USER || 'noreply@gettogether.com') + '>');
  
  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
  brevoApiInstance = apiInstance;
  
  // Create dummy transporter (not used, but needed for compatibility)
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
  });
} else if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  // Gmail SMTP - fallback for local development
  console.log('📧 Using Gmail SMTP service (fallback)');
  console.log('   SMTP Host: smtp.gmail.com:587');
  console.log('   SMTP User:', process.env.EMAIL_USER);
  transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
    debug: false,
    logger: false,
  });
} else {
  console.error('❌ CRITICAL: No email credentials configured!');
  console.error('Option 1 (Brevo API - Recommended for production):');
  console.error('  BREVO_API_KEY=xkeysib-your-api-key');
  console.error('  Get it from: https://app.brevo.com/ → SMTP & API → API Keys');
  console.error('');
  console.error('Option 2 (Gmail - For local development):');
  console.error('  EMAIL_USER=your-gmail@gmail.com');
  console.error('  EMAIL_PASSWORD=your-app-password');
  
  // Create dummy transporter to prevent crashes
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
  });
}

/**
 * Send booking confirmation email with ticket details and PDF to all attendees
 */
export const sendBookingConfirmationEmail = async (booking, event, user) => {
  try {
    // Generate PDF
    let pdfBuffer;
    try {
      pdfBuffer = await generateTicketPDF(booking, event, user);
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      pdfBuffer = null;
    }

    const ticketList = booking.ticketNumbers
      .map((ticket, index) => {
        const attendee = booking.attendeeDetails[index];
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${index + 1}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${ticket}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${attendee?.name || 'Guest'}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${attendee?.email || 'N/A'}</td>
          </tr>
        `;
      })
      .join('');

    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f5f5f5;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .content {
              padding: 30px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section h2 {
              color: #3b82f6;
              font-size: 18px;
              margin-bottom: 12px;
              border-bottom: 2px solid #e0e0e0;
              padding-bottom: 8px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #f0f0f0;
            }
            .info-label {
              font-weight: 600;
              color: #555;
            }
            .info-value {
              color: #333;
            }
            .highlight {
              background-color: #f0f7ff;
              padding: 15px;
              border-left: 4px solid #3b82f6;
              border-radius: 4px;
              margin: 15px 0;
            }
            .highlight strong {
              color: #3b82f6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              background-color: #f9f9f9;
            }
            table th {
              background-color: #3b82f6;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #e0e0e0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
              color: white;
              padding: 12px 30px;
              border-radius: 6px;
              text-decoration: none;
              margin: 15px 0;
              font-weight: 600;
            }
            .status-badge {
              display: inline-block;
              background-color: #10b981;
              color: white;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✓ Booking Confirmed</h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Your tickets are ready!</p>
            </div>

            <div class="content">
              <p>Hi <strong>${user.name}</strong>,</p>
              <p>Thank you for booking with GetTogether! Your payment has been successfully processed and your tickets are confirmed.</p>

              <div class="highlight">
                <strong>Booking Reference:</strong> ${booking._id.toString().slice(-8).toUpperCase()}
              </div>

              <div class="section">
                <h2>Event Details</h2>
                <div class="info-row">
                  <span class="info-label">Event:</span>
                  <span class="info-value"><strong>${event.title}</strong></span>
                </div>
                <div class="info-row">
                  <span class="info-label">Date & Time:</span>
                  <span class="info-value">${eventDate}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Location:</span>
                  <span class="info-value">${event.location}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Organizer:</span>
                  <span class="info-value">${event.organizationName || 'GetTogether'}</span>
                </div>
              </div>

              <div class="section">
                <h2>Payment Summary</h2>
                <div class="info-row">
                  <span class="info-label">Number of Tickets:</span>
                  <span class="info-value">${booking.quantity}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Price per Ticket:</span>
                  <span class="info-value">₹${(event.price).toFixed(2)}</span>
                </div>
                <div class="info-row" style="border-bottom: 2px solid #3b82f6; padding-bottom: 12px;">
                  <span class="info-label" style="font-size: 16px;">Total Amount Paid:</span>
                  <span class="info-value" style="font-size: 16px; color: #3b82f6; font-weight: bold;">₹${booking.totalPrice.toFixed(2)}</span>
                </div>
                <div style="margin-top: 12px;">
                  <span class="status-badge">✓ Payment Confirmed</span>
                </div>
              </div>

              <div class="section">
                <h2>Your Tickets</h2>
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ticket Number</th>
                      <th>Attendee Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ticketList}
                  </tbody>
                </table>
              </div>

              <div class="highlight">
                <strong>📌 Important:</strong> Your ticket PDF is attached to this email. Please download and keep it safe. You'll need to present it at the event entrance. Tickets are non-transferable.
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}/profile" class="button">View Your Tickets</a>
              </div>

              <div class="section" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <h2>Need Help?</h2>
                <p>If you have any questions about your booking or tickets, please contact us at <strong>gettogetherebookings@gmail.com</strong></p>
              </div>
            </div>

            <div class="footer">
              <p>© 2025 GetTogether. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send to main booking user
    const mainMailOptions = {
      from: `"GetTogether" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: `🎫 Booking Confirmed - ${event.title}`,
      html: htmlContent,
    };

    if (pdfBuffer) {
      mainMailOptions.attachments = [
        {
          filename: `tickets-${booking._id.toString().slice(-8)}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ];
    }

    await sendMailWithRetry(mainMailOptions);
    console.log(`✅ Confirmation email sent to ${user.email}`);

    // Wait a bit before sending to attendees to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Send to all attendees with their individual tickets
    for (let i = 0; i < booking.attendeeDetails.length; i++) {
      const attendee = booking.attendeeDetails[i];
      if (attendee?.email && attendee.email !== user.email) {
        const attendeeHtmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background-color: #f5f5f5;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: white;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .header {
                  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                  color: white;
                  padding: 30px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                  font-weight: bold;
                }
                .content {
                  padding: 30px;
                }
                .section {
                  margin-bottom: 25px;
                }
                .section h2 {
                  color: #3b82f6;
                  font-size: 18px;
                  margin-bottom: 12px;
                  border-bottom: 2px solid #e0e0e0;
                  padding-bottom: 8px;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px solid #f0f0f0;
                }
                .info-label {
                  font-weight: 600;
                  color: #555;
                }
                .info-value {
                  color: #333;
                }
                .highlight {
                  background-color: #f0f7ff;
                  padding: 15px;
                  border-left: 4px solid #3b82f6;
                  border-radius: 4px;
                  margin: 15px 0;
                }
                .highlight strong {
                  color: #3b82f6;
                }
                .status-badge {
                  display: inline-block;
                  background-color: #10b981;
                  color: white;
                  padding: 6px 12px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 600;
                }
                .footer {
                  background-color: #f5f5f5;
                  padding: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #999;
                  border-top: 1px solid #e0e0e0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✓ Your Ticket is Ready</h1>
                  <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Event ticket confirmation</p>
                </div>

                <div class="content">
                  <p>Hi <strong>${attendee.name}</strong>,</p>
                  <p>Your ticket for the following event has been confirmed:</p>

                  <div class="highlight">
                    <strong>Ticket Number:</strong> ${booking.ticketNumbers[i]}
                  </div>

                  <div class="section">
                    <h2>Event Details</h2>
                    <div class="info-row">
                      <span class="info-label">Event:</span>
                      <span class="info-value"><strong>${event.title}</strong></span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Date & Time:</span>
                      <span class="info-value">${eventDate}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Location:</span>
                      <span class="info-value">${event.location}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Organizer:</span>
                      <span class="info-value">${event.organizationName || 'GetTogether'}</span>
                    </div>
                  </div>

                  <div class="highlight">
                    <strong>📌 Important:</strong> Your ticket PDF is attached to this email. Please download and keep it safe. You'll need to present it at the event entrance. Tickets are non-transferable.
                  </div>

                  <div class="section" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                    <h2>Need Help?</h2>
                    <p>If you have any questions about your ticket, please contact us at <strong>gettogetherebookings@gmail.com</strong></p>
                  </div>
                </div>

                <div class="footer">
                  <p>© 2025 GetTogether. All rights reserved.</p>
                  <p>This is an automated email. Please do not reply to this message.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const attendeeMailOptions = {
          from: getSenderEmail('GetTogether'),
          to: attendee.email,
          subject: `🎫 Your Ticket - ${event.title}`,
          html: attendeeHtmlContent,
        };

        if (pdfBuffer) {
          attendeeMailOptions.attachments = [
            {
              filename: `ticket-${booking.ticketNumbers[i]}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ];
        }

        try {
          // Wait between attendee emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1500));
          await sendMailWithRetry(attendeeMailOptions);
          console.log(`✅ Ticket email sent to ${attendee.email}`);
        } catch (attendeeEmailError) {
          console.error(`Error sending email to ${attendee.email}:`, attendeeEmailError);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
};

/**
 * Send payment failure email
 */
export const sendPaymentFailureEmail = async (user, event, reason) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .content {
              padding: 30px;
            }
            .highlight {
              background-color: #fef2f2;
              padding: 15px;
              border-left: 4px solid #ef4444;
              border-radius: 4px;
              margin: 15px 0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
              color: white;
              padding: 12px 30px;
              border-radius: 6px;
              text-decoration: none;
              margin: 15px 0;
              font-weight: 600;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Failed</h1>
            </div>

            <div class="content">
              <p>Hi <strong>${user.name}</strong>,</p>
              <p>Unfortunately, your payment for the following event could not be processed:</p>

              <div class="highlight">
                <strong>Event:</strong> ${event.title}<br>
                <strong>Reason:</strong> ${reason}
              </div>

              <p>Your booking has been cancelled and no charges have been made to your account.</p>

              <p>You can try booking again by visiting our website:</p>
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}/events" class="button">Browse Events</a>
              </div>

              <p>If you continue to experience issues, please contact our support team.</p>
            </div>

            <div class="footer">
              <p>© 2025 GetTogether. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: getSenderEmail('GetTogether'),
      to: userEmail,
      subject: `Payment Failed - ${event.title}`,
      html: htmlContent,
    };

    await sendMailWithRetry(mailOptions);
    console.log(`✅ Payment failure email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error('Error sending payment failure email:', error);
    return false;
  }
};

/**
 * Send newsletter email
 */
export const sendNewsletterEmail = async (email, name, type = 'welcome', customData = {}) => {
  try {
    let subject = '';
    let htmlContent = '';

    const greeting = name ? `Hi ${name}` : 'Hi';
    const unsubscribeUrl = `${process.env.FRONTEND_URL || 'http://localhost:8081'}/unsubscribe?email=${encodeURIComponent(email)}`;

    switch (type) {
      case 'welcome':
        subject = 'Welcome to GetTogether Newsletter! 🎉';
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background-color: #f5f5f5;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: white;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .header {
                  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                  color: white;
                  padding: 40px 30px;
                  text-align: center;
                }
                .content {
                  padding: 30px;
                }
                .button {
                  display: inline-block;
                  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                  color: white;
                  padding: 12px 30px;
                  border-radius: 6px;
                  text-decoration: none;
                  margin: 15px 0;
                  font-weight: 600;
                }
                .footer {
                  background-color: #f5f5f5;
                  padding: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #999;
                  border-top: 1px solid #e0e0e0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Welcome to GetTogether!</h1>
                </div>
                <div class="content">
                  <p>${greeting},</p>
                  <p>Thank you for subscribing to our newsletter! We're excited to have you join our community.</p>
                  <p>You'll now receive regular updates about:</p>
                  <ul>
                    <li>🎪 New and upcoming events</li>
                    <li>🎟️ Exclusive ticket offers</li>
                    <li>📢 Event announcements and reminders</li>
                    <li>🌟 Special promotions and discounts</li>
                  </ul>
                  <p>Stay tuned for exciting events coming your way!</p>
                  <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}/events" class="button">Browse Events</a>
                  </div>
                </div>
                <div class="footer">
                  <p>© 2025 GetTogether. All rights reserved.</p>
                  <p><a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a> from this newsletter</p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'custom':
        subject = customData.subject || 'GetTogether Newsletter Update';
        htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background-color: #f5f5f5;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: white;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .header {
                  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                  color: white;
                  padding: 40px 30px;
                  text-align: center;
                }
                .content {
                  padding: 30px;
                }
                .footer {
                  background-color: #f5f5f5;
                  padding: 20px;
                  text-align: center;
                  font-size: 12px;
                  color: #999;
                  border-top: 1px solid #e0e0e0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📬 GetTogether Newsletter</h1>
                </div>
                <div class="content">
                  <p>${greeting},</p>
                  ${customData.content || '<p>Check out what\'s new at GetTogether!</p>'}
                </div>
                <div class="footer">
                  <p>© 2025 GetTogether. All rights reserved.</p>
                  <p><a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a> from this newsletter</p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      default:
        subject = 'GetTogether Newsletter';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>GetTogether Newsletter</h2>
            <p>${greeting},</p>
            <p>Thank you for being a part of GetTogether community!</p>
            <p><a href="${unsubscribeUrl}">Unsubscribe</a></p>
          </div>
        `;
    }

    const mailOptions = {
      from: getSenderEmail('GetTogether Newsletter'),
      to: email,
      subject,
      html: htmlContent,
    };

    await sendMailWithRetry(mailOptions);
    console.log(`✅ Newsletter email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending newsletter email:', error);
    throw new Error('Failed to send newsletter email');
  }
};

// Generic send email function for contact forms and other use cases
export const sendEmail = async (mailOptions) => {
  try {
    await sendMailWithRetry(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send ticket cancellation emails to user, organizer, and admin
export const sendTicketCancellationEmails = async (booking, ticket, event) => {
  try {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. Send confirmation email to user
    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-box { background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #667eea; }
          .value { color: #555; }
          .refund-notice { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          .cancelled-badge { background: #dc3545; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎫 Ticket Cancellation Confirmed</h1>
          </div>
          <div class="content">
            <p>Dear ${booking.userId.name},</p>
            
            <p>Your ticket cancellation request has been processed successfully.</p>
            
            <div class="ticket-box">
              <div style="text-align: center; margin-bottom: 15px;">
                <span class="cancelled-badge">CANCELLED</span>
              </div>
              <h3 style="color: #667eea; margin-top: 0;">Cancelled Ticket Details</h3>
              <div class="info-row">
                <span class="label">Ticket Number:</span>
                <span class="value">${ticket.ticketNumber}</span>
              </div>
              <div class="info-row">
                <span class="label">Event:</span>
                <span class="value">${event.title}</span>
              </div>
              <div class="info-row">
                <span class="label">Event Date:</span>
                <span class="value">${eventDate}</span>
              </div>
              <div class="info-row">
                <span class="label">Location:</span>
                <span class="value">${event.location}</span>
              </div>
              <div class="info-row">
                <span class="label">Attendee:</span>
                <span class="value">${ticket.attendeeName}</span>
              </div>
              <div class="info-row">
                <span class="label">Cancellation Date:</span>
                <span class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <div class="refund-notice">
              <h4 style="margin-top: 0; color: #856404;">💰 Refund Information</h4>
              <p style="margin: 5px 0;"><strong>Refund Amount:</strong> ₹${ticket.refundAmount?.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Refund Status:</strong> Processing</p>
              <p style="margin: 10px 0 0 0;">Your refund will be processed within <strong>5-7 business days</strong> according to our refund policy. The amount will be credited to your original payment method.</p>
            </div>

            ${ticket.cancellationReason ? `
              <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <p style="margin: 0;"><strong>Cancellation Reason:</strong></p>
                <p style="margin: 5px 0 0 0; color: #555;">${ticket.cancellationReason}</p>
              </div>
            ` : ''}

            <p style="margin-top: 30px;">If you have any questions about this cancellation or the refund process, please don't hesitate to contact our support team.</p>
            
            <p>Thank you for using GetTogether.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} GetTogether. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const userMailOptions = {
      from: getSenderEmail('GetTogether'),
      to: booking.userId.email,
      subject: `Ticket Cancellation Confirmed - ${event.title}`,
      html: userEmailHtml,
    };

    await sendMailWithRetry(userMailOptions);
    console.log(`✅ Cancellation confirmation email sent to user: ${booking.userId.email}`);

    // 2. Send notification to organizer
    if (event.organizerId) {
      const organizerEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #667eea; }
            .value { color: #555; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Ticket Cancellation Alert</h1>
            </div>
            <div class="content">
              <p>Hello Organizer,</p>
              
              <div class="alert-box">
                <p style="margin: 0;"><strong>A ticket has been cancelled for your event.</strong></p>
              </div>
              
              <h3 style="color: #667eea;">Event Details</h3>
              <div class="info-row">
                <span class="label">Event:</span>
                <span class="value">${event.title}</span>
              </div>
              <div class="info-row">
                <span class="label">Event Date:</span>
                <span class="value">${eventDate}</span>
              </div>
              
              <h3 style="color: #667eea;">Cancelled Ticket Information</h3>
              <div class="info-row">
                <span class="label">Ticket Number:</span>
                <span class="value">${ticket.ticketNumber}</span>
              </div>
              <div class="info-row">
                <span class="label">Customer:</span>
                <span class="value">${booking.userId.name} (${booking.userId.email})</span>
              </div>
              <div class="info-row">
                <span class="label">Attendee:</span>
                <span class="value">${ticket.attendeeName}</span>
              </div>
              <div class="info-row">
                <span class="label">Refund Amount:</span>
                <span class="value">₹${ticket.refundAmount?.toFixed(2)}</span>
              </div>
              <div class="info-row">
                <span class="label">Cancellation Date:</span>
                <span class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              
              ${ticket.cancellationReason ? `
                <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px;">
                  <p style="margin: 0;"><strong>Cancellation Reason:</strong></p>
                  <p style="margin: 5px 0 0 0; color: #555;">${ticket.cancellationReason}</p>
                </div>
              ` : ''}
              
              <p style="margin-top: 30px;">The ticket has been returned to your event inventory and is now available for booking.</p>
              
              <p>Best regards,<br>GetTogether Team</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Get organizer details
      const { default: User } = await import('../models/User.js');
      const organizer = await User.findById(event.organizerId);
      
      if (organizer && organizer.email) {
        const organizerMailOptions = {
          from: getSenderEmail('GetTogether'),
          to: organizer.email,
          subject: `Ticket Cancelled - ${event.title}`,
          html: organizerEmailHtml,
        };

        await sendMailWithRetry(organizerMailOptions);
        console.log(`✅ Cancellation notification sent to organizer: ${organizer.email}`);
      }
    }

    // 3. Send notification to admin
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    if (adminEmail) {
      const adminEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .info-row { margin: 8px 0; }
            .label { font-weight: bold; color: #667eea; display: inline-block; min-width: 150px; }
            .value { color: #555; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Admin Alert: Ticket Cancellation</h1>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              
              <p>A ticket cancellation has been processed in the system.</p>
              
              <div class="info-section">
                <h3 style="color: #667eea; margin-top: 0;">Booking Information</h3>
                <div class="info-row">
                  <span class="label">Booking ID:</span>
                  <span class="value">${booking._id}</span>
                </div>
                <div class="info-row">
                  <span class="label">Customer:</span>
                  <span class="value">${booking.userId.name} (${booking.userId.email})</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3 style="color: #667eea; margin-top: 0;">Event Information</h3>
                <div class="info-row">
                  <span class="label">Event:</span>
                  <span class="value">${event.title}</span>
                </div>
                <div class="info-row">
                  <span class="label">Event Date:</span>
                  <span class="value">${eventDate}</span>
                </div>
                <div class="info-row">
                  <span class="label">Location:</span>
                  <span class="value">${event.location}</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3 style="color: #667eea; margin-top: 0;">Cancelled Ticket</h3>
                <div class="info-row">
                  <span class="label">Ticket Number:</span>
                  <span class="value">${ticket.ticketNumber}</span>
                </div>
                <div class="info-row">
                  <span class="label">Attendee:</span>
                  <span class="value">${ticket.attendeeName} (${ticket.attendeeEmail})</span>
                </div>
                <div class="info-row">
                  <span class="label">Refund Amount:</span>
                  <span class="value">₹${ticket.refundAmount?.toFixed(2)}</span>
                </div>
                <div class="info-row">
                  <span class="label">Refund Status:</span>
                  <span class="value">${ticket.refundStatus}</span>
                </div>
                <div class="info-row">
                  <span class="label">Cancellation Date:</span>
                  <span class="value">${new Date().toLocaleString('en-US')}</span>
                </div>
              </div>
              
              ${ticket.cancellationReason ? `
                <div class="info-section">
                  <h3 style="color: #667eea; margin-top: 0;">Cancellation Reason</h3>
                  <p style="margin: 0; color: #555;">${ticket.cancellationReason}</p>
                </div>
              ` : ''}
              
              <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated system notification.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const adminMailOptions = {
        from: getSenderEmail('GetTogether System'),
        to: adminEmail,
        subject: `[Admin Alert] Ticket Cancellation - ${event.title}`,
        html: adminEmailHtml,
      };

      await sendMailWithRetry(adminMailOptions);
      console.log(`✅ Cancellation notification sent to admin: ${adminEmail}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending ticket cancellation emails:', error);
    // Don't throw error - allow cancellation to proceed even if emails fail
    return false;
  }
};

// Send ticket cancellation emails when organizer cancels a ticket
export const sendOrganizerCancellationEmails = async (booking, ticket, event) => {
  try {
    const eventDate = new Date(event.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Extract the organizer's reason from the cancellation reason
    const organizerReason = ticket.cancellationReason?.replace('Organizer cancelled: ', '') || 'Event management decision';

    // 1. Send notification email to user
    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .ticket-box { background: white; border: 2px dashed #dc3545; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #dc3545; }
          .value { color: #555; }
          .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .refund-notice { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; color: #0c5460; }
          .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
          .cancelled-badge { background: #dc3545; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Ticket Cancelled by Organizer</h1>
          </div>
          <div class="content">
            <p>Dear ${booking.userId.name},</p>
            
            <div class="alert-box">
              <p style="margin: 0; font-weight: bold;">We regret to inform you that your ticket has been cancelled by the event organizer.</p>
            </div>
            
            <div class="ticket-box">
              <div style="text-align: center; margin-bottom: 15px;">
                <span class="cancelled-badge">CANCELLED BY ORGANIZER</span>
              </div>
              <h3 style="color: #dc3545; margin-top: 0;">Cancelled Ticket Details</h3>
              <div class="info-row">
                <span class="label">Ticket Number:</span>
                <span class="value">${ticket.ticketNumber}</span>
              </div>
              <div class="info-row">
                <span class="label">Event:</span>
                <span class="value">${event.title}</span>
              </div>
              <div class="info-row">
                <span class="label">Event Date:</span>
                <span class="value">${eventDate}</span>
              </div>
              <div class="info-row">
                <span class="label">Location:</span>
                <span class="value">${event.location}</span>
              </div>
              <div class="info-row">
                <span class="label">Attendee:</span>
                <span class="value">${ticket.attendeeName}</span>
              </div>
              <div class="info-row">
                <span class="label">Cancellation Date:</span>
                <span class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <div style="background: white; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc3545;">
              <p style="margin: 0; font-weight: bold; color: #dc3545;">Cancellation Reason:</p>
              <p style="margin: 10px 0 0 0; color: #555;">${organizerReason}</p>
            </div>

            <div class="refund-notice">
              <h4 style="margin-top: 0; color: #0c5460;">💰 Refund Information</h4>
              <p style="margin: 5px 0;"><strong>Refund Amount:</strong> ₹${ticket.refundAmount?.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Refund Status:</strong> Processing</p>
              <p style="margin: 10px 0 0 0;">Your full refund will be processed within <strong>5-7 business days</strong>. The amount will be credited to your original payment method.</p>
            </div>

            <p style="margin-top: 30px;">We sincerely apologize for any inconvenience this may cause. If you have any questions or concerns, please don't hesitate to contact our support team or the event organizer.</p>
            
            <p>Thank you for your understanding.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} GetTogether. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const userMailOptions = {
      from: getSenderEmail('GetTogether'),
      to: booking.userId.email,
      subject: `Ticket Cancelled by Organizer - ${event.title}`,
      html: userEmailHtml,
    };

    await sendMailWithRetry(userMailOptions);
    console.log(`✅ Organizer cancellation notification sent to user: ${booking.userId.email}`);

    // 2. Send notification to super admin
    const superAdminEmail = 'namansharma2109@gmail.com';
    if (superAdminEmail) {
      const adminEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
            .info-row { margin: 8px 0; }
            .label { font-weight: bold; color: #667eea; display: inline-block; min-width: 150px; }
            .value { color: #555; }
            .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Admin Alert: Organizer Cancelled Ticket</h1>
            </div>
            <div class="content">
              <p>Hello Admin,</p>
              
              <div class="alert">
                <p style="margin: 0; font-weight: bold;">An organizer has cancelled a ticket. User has been notified.</p>
              </div>
              
              <div class="info-section">
                <h3 style="color: #667eea; margin-top: 0;">Booking Information</h3>
                <div class="info-row">
                  <span class="label">Booking ID:</span>
                  <span class="value">${booking._id}</span>
                </div>
                <div class="info-row">
                  <span class="label">Customer:</span>
                  <span class="value">${booking.userId.name} (${booking.userId.email})</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3 style="color: #667eea; margin-top: 0;">Event Information</h3>
                <div class="info-row">
                  <span class="label">Event:</span>
                  <span class="value">${event.title}</span>
                </div>
                <div class="info-row">
                  <span class="label">Event Date:</span>
                  <span class="value">${eventDate}</span>
                </div>
                <div class="info-row">
                  <span class="label">Organization:</span>
                  <span class="value">${event.organizationName || 'N/A'}</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3 style="color: #667eea; margin-top: 0;">Cancelled Ticket</h3>
                <div class="info-row">
                  <span class="label">Ticket Number:</span>
                  <span class="value">${ticket.ticketNumber}</span>
                </div>
                <div class="info-row">
                  <span class="label">Attendee:</span>
                  <span class="value">${ticket.attendeeName} (${ticket.attendeeEmail})</span>
                </div>
                <div class="info-row">
                  <span class="label">Refund Amount:</span>
                  <span class="value">₹${ticket.refundAmount?.toFixed(2)}</span>
                </div>
                <div class="info-row">
                  <span class="label">Cancelled By:</span>
                  <span class="value">Organizer</span>
                </div>
                <div class="info-row">
                  <span class="label">Cancellation Date:</span>
                  <span class="value">${new Date().toLocaleString('en-US')}</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3 style="color: #667eea; margin-top: 0;">Organizer's Reason</h3>
                <p style="margin: 0; color: #555;">${organizerReason}</p>
              </div>
              
              <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated system notification. User has been notified about the cancellation.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const adminMailOptions = {
        from: getSenderEmail('GetTogether System'),
        to: superAdminEmail,
        subject: `[Super Admin Alert] Organizer Cancelled Ticket - ${event.title}`,
        html: adminEmailHtml,
      };

      await sendMailWithRetry(adminMailOptions);
      console.log(`✅ Organizer cancellation notification sent to super admin: ${superAdminEmail}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending organizer cancellation emails:', error);
    // Don't throw error - allow cancellation to proceed even if emails fail
    return false;
  }
};
