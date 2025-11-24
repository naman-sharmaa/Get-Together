import Contact from '../models/Contact.js';
import { sendEmail } from '../utils/emailService.js';

// Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, subject, and message',
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Save to database
    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      subject,
      message,
    });

    await contact.save();

    // Send email notification to developer
    const developerEmail = 'gettogetherebookings@gmail.com';
    
    const emailSubject = `🔔 New Contact Form Submission - ${subject}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .info-row {
              margin: 15px 0;
              padding: 12px;
              background: white;
              border-radius: 6px;
              border-left: 3px solid #3b82f6;
            }
            .label {
              font-weight: 600;
              color: #6366f1;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .value {
              margin-top: 5px;
              font-size: 16px;
              color: #333;
            }
            .message-box {
              background: white;
              padding: 20px;
              border-radius: 6px;
              margin-top: 15px;
              border: 1px solid #e5e7eb;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            .footer {
              margin-top: 20px;
              padding: 20px;
              background: #f3f4f6;
              border-radius: 0 0 8px 8px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
            }
            .timestamp {
              color: #9ca3af;
              font-size: 12px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">📬 New Contact Form Submission</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">GetTogether Event Platform</p>
          </div>
          
          <div class="content">
            <div class="info-row">
              <div class="label">Name</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="info-row">
              <div class="label">Email</div>
              <div class="value"><a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></div>
            </div>
            
            ${phone ? `
            <div class="info-row">
              <div class="label">Phone</div>
              <div class="value"><a href="tel:${phone}" style="color: #3b82f6; text-decoration: none;">${phone}</a></div>
            </div>
            ` : ''}
            
            <div class="info-row">
              <div class="label">Subject</div>
              <div class="value">${subject}</div>
            </div>
            
            <div class="info-row">
              <div class="label">Message</div>
              <div class="message-box">${message}</div>
            </div>
            
            <div class="timestamp">
              Received on ${new Date().toLocaleString('en-IN', { 
                timeZone: 'Asia/Kolkata',
                dateStyle: 'full',
                timeStyle: 'long'
              })}
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">This is an automated notification from GetTogether contact form.</p>
            <p style="margin: 5px 0 0 0;">Reply directly to ${email} to respond to this inquiry.</p>
          </div>
        </body>
      </html>
    `;

    // Send notification email
    try {
      await sendEmail({
        to: developerEmail,
        subject: emailSubject,
        html: emailHtml,
        from: `"GetTogether Contact Form" <${process.env.EMAIL_USER}>`,
      });
      console.log(`✅ Contact form notification sent to ${developerEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send contact notification email:', emailError.message);
      // Don't fail the request if email fails
    }

    // Send confirmation email to user
    const confirmationSubject = 'Thank you for contacting GetTogether';
    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .footer {
              margin-top: 20px;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              background: #f9fafb;
              border-radius: 6px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0;">✅ Message Received!</h1>
          </div>
          
          <div class="content">
            <p>Dear ${name},</p>
            
            <p>Thank you for contacting GetTogether! We have received your message and will get back to you within 24 hours during business days.</p>
            
            <p><strong>Your message:</strong></p>
            <p style="background: #f9fafb; padding: 15px; border-left: 3px solid #3b82f6; border-radius: 4px;">${message}</p>
            
            <p>If you have any urgent concerns, please feel free to call us at <strong>+91 9079235893</strong>.</p>
            
            <p>Best regards,<br>
            <strong>GetTogether Team</strong></p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} GetTogether. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">Phagwara - 144401, Punjab, India</p>
          </div>
        </body>
      </html>
    `;

    try {
      await sendEmail({
        to: email,
        subject: confirmationSubject,
        html: confirmationHtml,
        from: `"GetTogether" <${process.env.EMAIL_USER}>`,
      });
      console.log(`✅ Confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will respond to you soon.',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
      },
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again later.',
      error: error.message,
    });
  }
};

// Get all contacts (admin only)
export const getAllContacts = async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;
    
    const query = status ? { status } : {};
    
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Contact.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: contacts,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contacts',
      error: error.message,
    });
  }
};

// Update contact status (admin only)
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }
    
    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
      error: error.message,
    });
  }
};
