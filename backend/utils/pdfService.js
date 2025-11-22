import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { Readable } from 'stream';

/**
 * Generate ticket PDF with QR codes
 */
export const generateTicketPDF = async (booking, event, user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });
      doc.on('error', reject);

      const pageWidth = doc.page.width;
      const leftMargin = 50;
      const rightMargin = 50;
      const contentWidth = pageWidth - leftMargin - rightMargin;

      // Header with gradient effect (simulated with rectangles)
      doc.fillColor('#3b82f6').rect(0, 0, pageWidth, 100).fill();
      
      // Title
      doc.fillColor('#ffffff')
         .fontSize(32)
         .font('Helvetica-Bold')
         .text('EventHub', leftMargin, 30, { 
           width: contentWidth, 
           align: 'center' 
         });
      
      doc.fontSize(14)
         .font('Helvetica')
         .text('Event Ticket', leftMargin, 65, { 
           width: contentWidth, 
           align: 'center' 
         });

      // Decorative line
      doc.moveTo(leftMargin, 110)
         .lineTo(pageWidth - rightMargin, 110)
         .strokeColor('#e5e7eb')
         .lineWidth(2)
         .stroke();

      doc.fillColor('#000000'); // Reset to black for content
      let yPosition = 130;

      // Event Details Section
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Event Details', leftMargin, yPosition);
      
      yPosition += 25;

      // Event info with better spacing
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#4b5563')
         .text('Event:', leftMargin, yPosition);
      doc.font('Helvetica')
         .fillColor('#000000')
         .text(event.title, leftMargin + 100, yPosition, { 
           width: contentWidth - 100 
         });
      
      yPosition += 20;

      const eventDate = new Date(event.date);
      const formattedDate = eventDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = eventDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      doc.font('Helvetica-Bold')
         .fillColor('#4b5563')
         .text('Date:', leftMargin, yPosition);
      doc.font('Helvetica')
         .fillColor('#000000')
         .text(`${formattedDate} at ${formattedTime}`, leftMargin + 100, yPosition);
      
      yPosition += 20;

      doc.font('Helvetica-Bold')
         .fillColor('#4b5563')
         .text('Location:', leftMargin, yPosition);
      doc.font('Helvetica')
         .fillColor('#000000')
         .text(event.location, leftMargin + 100, yPosition, { 
           width: contentWidth - 100 
         });
      
      yPosition += 20;

      doc.font('Helvetica-Bold')
         .fillColor('#4b5563')
         .text('Organizer:', leftMargin, yPosition);
      doc.font('Helvetica')
         .fillColor('#000000')
         .text(event.organizationName || 'EventHub', leftMargin + 100, yPosition);
      
      yPosition += 35;

      // Booking Reference
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#4b5563')
         .text('Booking Reference:', leftMargin, yPosition);
      
      yPosition += 18;
      
      doc.fontSize(13)
         .font('Helvetica-Bold')
         .fillColor('#3b82f6')
         .text(booking._id.toString().slice(-8).toUpperCase(), leftMargin, yPosition);
      
      yPosition += 35;

      // Your Tickets Section
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Your Tickets', leftMargin, yPosition);
      
      yPosition += 25;

      // Generate ticket boxes with QR codes
      for (let i = 0; i < booking.ticketNumbers.length; i++) {
        const ticket = booking.ticketNumbers[i];
        const attendee = booking.attendeeDetails[i];

        // Check if we need a new page
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }

        // Ticket box with rounded effect and shadow
        const boxHeight = 110;
        const boxY = yPosition;
        
        // Shadow effect
        doc.fillColor('#e5e7eb')
           .rect(leftMargin + 2, boxY + 2, contentWidth - 2, boxHeight)
           .fill();
        
        // Main box
        doc.fillColor('#ffffff')
           .rect(leftMargin, boxY, contentWidth, boxHeight)
           .fill();
        
        doc.strokeColor('#3b82f6')
           .lineWidth(2)
           .rect(leftMargin, boxY, contentWidth, boxHeight)
           .stroke();

        // Ticket content
        const ticketContentY = boxY + 15;
        const qrSize = 85;
        const qrX = pageWidth - rightMargin - qrSize - 15;
        const qrY = boxY + 12;

        // Ticket number
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#3b82f6')
           .text(`Ticket #${i + 1}: ${ticket}`, leftMargin + 15, ticketContentY, {
             width: contentWidth - qrSize - 40
           });

        // Attendee details
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#4b5563')
           .text('Attendee:', leftMargin + 15, ticketContentY + 22);
        
        doc.font('Helvetica')
           .fillColor('#000000')
           .text(attendee?.name || 'Guest', leftMargin + 85, ticketContentY + 22, {
             width: contentWidth - qrSize - 110
           });

        if (attendee?.email) {
          doc.font('Helvetica-Bold')
             .fillColor('#4b5563')
             .text('Email:', leftMargin + 15, ticketContentY + 38);
          
          doc.font('Helvetica')
             .fillColor('#000000')
             .text(attendee.email, leftMargin + 85, ticketContentY + 38, {
               width: contentWidth - qrSize - 110
           });
        }

        // Generate and place QR code
        try {
          const qrCodeData = await QRCode.toDataURL(ticket, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 200,
          });
          const qrBuffer = Buffer.from(qrCodeData.split(',')[1], 'base64');
          doc.image(qrBuffer, qrX, qrY, { 
            width: qrSize, 
            height: qrSize 
          });
        } catch (qrError) {
          console.error('QR code generation error:', qrError);
        }

        yPosition += boxHeight + 20;
      }

      yPosition += 10;

      // Payment Summary Section with background
      const summaryBoxHeight = 90;
      const notesHeight = 85;
      const footerHeight = 50;
      const remainingSpace = doc.page.height - yPosition - 50; // 50 for bottom margin
      
      // Only add new page if absolutely necessary
      if (remainingSpace < (summaryBoxHeight + notesHeight + footerHeight)) {
        doc.addPage();
        yPosition = 50;
      }
      doc.fillColor('#f3f4f6')
         .rect(leftMargin, yPosition, contentWidth, summaryBoxHeight)
         .fill();
      
      doc.strokeColor('#d1d5db')
         .lineWidth(1)
         .rect(leftMargin, yPosition, contentWidth, summaryBoxHeight)
         .stroke();

      yPosition += 15;

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Payment Summary', leftMargin + 15, yPosition);
      
      yPosition += 25;

      // Number of tickets
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#4b5563')
         .text('Number of Tickets:', leftMargin + 15, yPosition);
      doc.fillColor('#000000')
         .text(booking.quantity.toString(), leftMargin + 200, yPosition);

      yPosition += 18;

      // Price per ticket with proper Rupee symbol
      doc.fillColor('#4b5563')
         .text('Price per Ticket:', leftMargin + 15, yPosition);
      doc.fillColor('#000000')
         .text(`Rs ${event.price.toFixed(2)}`, leftMargin + 200, yPosition);

      yPosition += 22;

      // Total amount
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Total Amount Paid:', leftMargin + 15, yPosition);
      doc.fontSize(13)
         .fillColor('#059669')
         .text(`Rs ${booking.totalPrice.toFixed(2)}`, leftMargin + 200, yPosition);

      yPosition += 35;

      // Important Notes Section
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Important Notes:', leftMargin, yPosition);
      
      yPosition += 22;

      const notes = [
        'Please present this ticket at the event entrance',
        'Tickets are non-transferable and non-refundable',
        'Arrive 15 minutes before the event start time',
        'Keep your QR code safe and do not share it'
      ];

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#4b5563');

      notes.forEach((note) => {
        doc.text(`• ${note}`, leftMargin + 5, yPosition, { 
          width: contentWidth - 5 
        });
        yPosition += 15;
      });

      yPosition += 10;

      // Footer - position it right after content, not at page bottom
      doc.moveTo(leftMargin, yPosition)
         .lineTo(pageWidth - rightMargin, yPosition)
         .strokeColor('#e5e7eb')
         .lineWidth(1)
         .stroke();
      
      yPosition += 10;

      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#9ca3af')
         .text('© 2025 EventHub. All rights reserved.', leftMargin, yPosition, {
           width: contentWidth,
           align: 'center'
         });
      
      
      doc.text('This ticket is valid only for the specified event and attendee.', leftMargin, yPosition, {
        width: contentWidth,
        align: 'center'
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
