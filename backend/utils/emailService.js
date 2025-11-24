import nodemailer from 'nodemailer';
import * as brevo from '@getbrevo/brevo';
import { generateTicketPDF } from './pdfService.js';

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
  const sendSmtpEmail = new brevo.SendSmtpEmail();
  
  sendSmtpEmail.sender = { 
    email: mailOptions.from.match(/<(.+)>/)?.[1] || mailOptions.from,
    name: mailOptions.from.match(/"(.+?)"/)?.[1] || 'EventHub'
  };
  sendSmtpEmail.to = [{ email: mailOptions.to }];
  sendSmtpEmail.subject = mailOptions.subject;
  sendSmtpEmail.htmlContent = mailOptions.html;
  
  // Handle attachments
  if (mailOptions.attachments && mailOptions.attachments.length > 0) {
    sendSmtpEmail.attachment = mailOptions.attachments.map(att => ({
      name: att.filename,
      content: att.content.toString('base64'),
    }));
  }
  
  const result = await brevoApiInstance.sendTransacEmail(sendSmtpEmail);
  return { messageId: result.response.messageId };
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
  console.log('   Sender: EventHub <' + (process.env.EMAIL_USER || 'noreply@eventhub.com') + '>');
  
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
              <p>Thank you for booking with EventHub! Your payment has been successfully processed and your tickets are confirmed.</p>

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
                  <span class="info-value">${event.organizationName || 'EventHub'}</span>
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
                <p>If you have any questions about your booking or tickets, please contact us at <strong>support@eventhub.com</strong></p>
              </div>
            </div>

            <div class="footer">
              <p>© 2025 EventHub. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send to main booking user
    const mainMailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
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
                      <span class="info-value">${event.organizationName || 'EventHub'}</span>
                    </div>
                  </div>

                  <div class="highlight">
                    <strong>📌 Important:</strong> Your ticket PDF is attached to this email. Please download and keep it safe. You'll need to present it at the event entrance. Tickets are non-transferable.
                  </div>

                  <div class="section" style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                    <h2>Need Help?</h2>
                    <p>If you have any questions about your ticket, please contact us at <strong>support@eventhub.com</strong></p>
                  </div>
                </div>

                <div class="footer">
                  <p>© 2025 EventHub. All rights reserved.</p>
                  <p>This is an automated email. Please do not reply to this message.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        const attendeeMailOptions = {
          from: `"EventHub" <${process.env.EMAIL_USER}>`,
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
              <p>© 2025 EventHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: user.email,
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
        subject = 'Welcome to EventHub Newsletter! 🎉';
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
                  <h1>🎉 Welcome to EventHub!</h1>
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
                  <p>© 2025 EventHub. All rights reserved.</p>
                  <p><a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a> from this newsletter</p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      case 'custom':
        subject = customData.subject || 'EventHub Newsletter Update';
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
                  <h1>📬 EventHub Newsletter</h1>
                </div>
                <div class="content">
                  <p>${greeting},</p>
                  ${customData.content || '<p>Check out what\'s new at EventHub!</p>'}
                </div>
                <div class="footer">
                  <p>© 2025 EventHub. All rights reserved.</p>
                  <p><a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe</a> from this newsletter</p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;

      default:
        subject = 'EventHub Newsletter';
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>EventHub Newsletter</h2>
            <p>${greeting},</p>
            <p>Thank you for being a part of EventHub community!</p>
            <p><a href="${unsubscribeUrl}">Unsubscribe</a></p>
          </div>
        `;
    }

    const mailOptions = {
      from: `"EventHub Newsletter" <${process.env.EMAIL_USER}>`,
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
