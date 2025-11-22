import QRCode from 'qrcode';
import jsPDF from 'jspdf';

interface TicketData {
  ticketNumber: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  attendeeName: string;
  attendeeEmail: string;
  bookingId: string;
  quantity: number;
  totalPrice: number;
  organizationName?: string;
}

export const generateTicketPDF = async (ticketsData: TicketData[]) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPosition = 10;

  for (let i = 0; i < ticketsData.length; i++) {
    if (i > 0) {
      pdf.addPage();
      yPosition = 10;
    }

    const ticket = ticketsData[i];

    // Premium header with gradient effect
    pdf.setFillColor(59, 130, 246); // Primary blue
    pdf.rect(0, 0, pageWidth, 35, 'F');
    
    // Accent line
    pdf.setFillColor(99, 102, 241); // Indigo
    pdf.rect(0, 35, pageWidth, 2, 'F');

    // Header
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont(undefined, 'bold');
    pdf.text('EVENT TICKET', pageWidth / 2, 18, { align: 'center' });

    // Organization name
    if (ticket.organizationName) {
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Organized by: ${ticket.organizationName}`, pageWidth / 2, 28, { align: 'center' });
    }

    yPosition = 50;

    // Event Details Section
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text(ticket.eventTitle, 15, yPosition);

    yPosition += 12;
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Date & Time: ${ticket.eventDate}`, 15, yPosition);

    yPosition += 8;
    pdf.text(`Location: ${ticket.eventLocation}`, 15, yPosition);

    yPosition += 15;

    // Attendee Information
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('ATTENDEE INFORMATION', 15, yPosition);

    yPosition += 8;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(10);
    pdf.text(`Name: ${ticket.attendeeName}`, 15, yPosition);

    yPosition += 7;
    pdf.text(`Email: ${ticket.attendeeEmail}`, 15, yPosition);

    yPosition += 15;

    // Ticket Number and QR Code Section
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(15, yPosition - 5, pageWidth - 30, 70);

    // Left side - Ticket Number
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('TICKET NUMBER', 20, yPosition + 5);

    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(59, 130, 246);
    pdf.text(ticket.ticketNumber, 20, yPosition + 18);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.text('Scan this ticket at entry', 20, yPosition + 28);

    // Right side - QR Code
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(ticket.ticketNumber, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 200,
      });

      pdf.addImage(qrCodeDataUrl, 'PNG', pageWidth - 50, yPosition, 35, 35);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }

    yPosition += 75;

    // Booking Information
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Booking ID: ${ticket.bookingId}`, 15, yPosition);

    yPosition += 6;
    pdf.text(`Total Tickets: ${ticket.quantity}`, 15, yPosition);

    yPosition += 6;
    pdf.text(`Total Price: ₹${ticket.totalPrice.toFixed(2)}`, 15, yPosition);

    yPosition += 10;

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    const footerText = `Generated on ${new Date().toLocaleDateString()} | TicketCharge Hub`;
    pdf.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Terms
    pdf.setFontSize(7);
    pdf.text('This ticket is non-transferable. Please present this ticket at the event entrance.', 15, pageHeight - 5);
  }

  return pdf;
};

export const downloadTicketPDF = async (ticketsData: TicketData[], eventTitle: string) => {
  try {
    const pdf = await generateTicketPDF(ticketsData);
    const fileName = `${eventTitle.replace(/\s+/g, '-')}-tickets-${Date.now()}.pdf`;
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error downloading ticket:', error);
    return false;
  }
};
