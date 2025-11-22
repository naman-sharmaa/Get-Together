import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { bookingsAPI } from "@/lib/api";
import { QrCode, Search, CheckCircle, XCircle, Loader2, Camera, X, Trash2 } from "lucide-react";
import jsQR from "jsqr";

interface Ticket {
  ticketNumber: string;
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  eventDate: string;
  status: 'pending' | 'approved' | 'denied';
  bookingId: string;
  isCancelled?: boolean;
}

const TicketsVerification = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [scannedTicket, setScannedTicket] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    ticketNumber: string;
    status: 'approved' | 'denied';
    message: string;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScannerActive, setIsScannerActive] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getOrganizerBookings();
      // Transform bookings to tickets format
      const allTickets: Ticket[] = [];
      response.bookings.forEach((booking: any) => {
        booking.ticketNumbers.forEach((ticketNum: string, index: number) => {
          // Check if ticket is already verified in database
          const verifiedTicket = booking.verifiedTickets?.find((vt: any) => vt.ticketNumber === ticketNum);
          let status: 'pending' | 'approved' | 'denied' = 'pending';
          if (verifiedTicket) {
            status = verifiedTicket.status || 'approved';
          }
          
          // Check if ticket is cancelled
          const isCancelled = booking.cancelledTickets?.includes(ticketNum) || false;
          
          // Get attendee details for this specific ticket
          const attendee = booking.attendeeDetails?.[index];
          
          allTickets.push({
            ticketNumber: ticketNum,
            attendeeName: attendee?.name || booking.userId?.name || "Unknown",
            attendeeEmail: attendee?.email || booking.userId?.email || "",
            eventTitle: booking.eventId?.title || "Unknown Event",
            eventDate: new Date(booking.eventId?.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) || "",
            status,
            bookingId: booking._id,
            isCancelled,
          });
        });
      });
      setTickets(allTickets);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerification = async (ticketNumber: string, verificationStatus: 'approved' | 'denied' = 'approved') => {
    const ticket = tickets.find(t => t.ticketNumber === ticketNumber);
    if (ticket) {
      try {
        // Save verification to database
        await bookingsAPI.verifyTicket(ticketNumber, ticket.bookingId, verificationStatus);
        
        setVerificationResult({
          ticketNumber,
          status: verificationStatus,
          message: `Ticket ${verificationStatus} for ${ticket.attendeeName}`,
        });
        setTickets(tickets.map(t =>
          t.ticketNumber === ticketNumber ? { ...t, status: verificationStatus } : t
        ));
        setTimeout(() => setVerificationResult(null), 3000);
      } catch (error: any) {
        console.error('Verification error:', error);
        // If already verified, still show success
        if (error.message?.includes('already')) {
          const existingStatus = error.message?.includes('denied') ? 'denied' : 'approved';
          setVerificationResult({
            ticketNumber,
            status: existingStatus,
            message: `Ticket already ${existingStatus} for ${ticket.attendeeName}`,
          });
          setTickets(tickets.map(t =>
            t.ticketNumber === ticketNumber ? { ...t, status: existingStatus } : t
          ));
        } else {
          setVerificationResult({
            ticketNumber,
            status: 'denied',
            message: error.message || 'Verification failed',
          });
        }
        setTimeout(() => setVerificationResult(null), 3000);
      }
    } else {
      setVerificationResult({
        ticketNumber,
        status: 'denied',
        message: 'Ticket not found in system',
      });
      setTimeout(() => setVerificationResult(null), 3000);
    }
  };

  const handleCancelTicket = async (ticketNumber: string, bookingId: string) => {
    const ticket = tickets.find(t => t.ticketNumber === ticketNumber);
    if (!ticket) return;

    try {
      await bookingsAPI.cancelTicket(bookingId, ticketNumber);
      
      toast({
        title: "Success",
        description: `Ticket ${ticketNumber} has been cancelled successfully`,
        variant: "default",
      });
      
      // Update ticket status to cancelled
      setTickets(tickets.map(t =>
        t.ticketNumber === ticketNumber ? { ...t, isCancelled: true } : t
      ));
    } catch (error: any) {
      console.error('Cancel ticket error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel ticket",
        variant: "destructive",
      });
    }
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);

  const handleScannerToggle = async () => {
    if (!isScannerActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsScannerActive(true);
          scanningRef.current = true;
          startScanning();
        }
      } catch (error: any) {
        console.error('Camera error:', error);
        toast({
          title: "Error",
          description: error.message || "Unable to access camera. Please check permissions.",
          variant: "destructive",
        });
      }
    } else {
      stopScanner();
    }
  };

  const startScanning = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scan = () => {
      if (!scanningRef.current) return;

      if (videoRef.current?.readyState === videoRef.current?.HAVE_ENOUGH_DATA) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          const ticketNumber = code.data;
          handleManualVerification(ticketNumber);
          stopScanner();
          return;
        }
      }

      requestAnimationFrame(scan);
    };

    scan();
  };

  const stopScanner = () => {
    scanningRef.current = false;
    setIsScannerActive(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const filteredTickets = tickets.filter(ticket =>
    ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.attendeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.eventTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-card rounded-lg p-6 border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Tickets Verification</h2>
          <p className="text-muted-foreground">Scan and verify event tickets</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Tickets</p>
          <p className="text-3xl font-bold text-primary">{tickets.length}</p>
        </div>
      </div>

      {/* Scanner Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>Scan ticket QR codes to verify them</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleScannerToggle}
            className={`w-full ${isScannerActive ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-primary hover:opacity-90'}`}
          >
            {isScannerActive ? 'Stop Scanner' : 'Start QR Scanner'}
          </Button>

          {isScannerActive && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg border border-border"
                style={{ maxHeight: '400px' }}
              />
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  📱 Point your camera at the QR code on the ticket to scan it automatically
                </p>
              </div>
            </div>
          )}

          {/* Manual Entry */}
          <div className="space-y-3 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">Or enter ticket number manually:</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter ticket number (e.g., TKT-ABC123-XYZ)"
                value={scannedTicket}
                onChange={(e) => setScannedTicket(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && scannedTicket) {
                    handleManualVerification(scannedTicket);
                    setScannedTicket("");
                  }
                }}
              />
              <Button
                onClick={() => {
                  if (scannedTicket) {
                    handleManualVerification(scannedTicket);
                    setScannedTicket("");
                  }
                }}
                className="bg-gradient-primary hover:opacity-90"
              >
                Verify
              </Button>
            </div>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div className={`p-4 rounded-lg border ${
              verificationResult.status === 'approved'
                ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center gap-3">
                {verificationResult.status === 'approved' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <p className={`font-semibold ${
                    verificationResult.status === 'approved'
                      ? 'text-green-700 dark:text-green-400'
                      : 'text-red-700 dark:text-red-400'
                  }`}>
                    {verificationResult.status === 'approved' ? 'APPROVED ✓' : 'DENIED ✗'}
                  </p>
                  <p className={`text-sm ${
                    verificationResult.status === 'approved'
                      ? 'text-green-600 dark:text-green-300'
                      : 'text-red-600 dark:text-red-300'
                  }`}>
                    {verificationResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets List</CardTitle>
          <CardDescription>All tickets for your events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ticket number, attendee name, or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Tickets Table */}
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-muted-foreground">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tickets found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Ticket Number</th>
                    <th className="text-left py-3 px-4 font-semibold">Attendee</th>
                    <th className="text-left py-3 px-4 font-semibold">Event</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.ticketNumber} className={`border-b border-border hover:bg-secondary/50 transition-colors ${ticket.isCancelled ? 'opacity-60' : ''}`}>
                      <td className="py-3 px-4 font-mono text-xs">{ticket.ticketNumber}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{ticket.attendeeName}</p>
                          <p className="text-xs text-muted-foreground">{ticket.attendeeEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{ticket.eventTitle}</td>
                      <td className="py-3 px-4">
                        {ticket.isCancelled ? (
                          <Badge className="bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30">
                            <XCircle className="h-3 w-3 mr-1" />
                            Cancelled
                          </Badge>
                        ) : ticket.status === 'approved' ? (
                          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved ✓
                          </Badge>
                        ) : ticket.status === 'denied' ? (
                          <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30">
                            <XCircle className="h-3 w-3 mr-1" />
                            Denied ✗
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {!ticket.isCancelled && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelTicket(ticket.ticketNumber, ticket.bookingId)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsVerification;
