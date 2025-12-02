import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Ticket,
  Download,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TicketDetail {
  ticketNumber: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  status: 'active' | 'expired' | 'cancelled' | 'used';
  cancelledAt?: string;
  cancellationReason?: string;
  refundStatus?: string;
  refundAmount?: number;
}

interface TicketDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: TicketDetail | null;
  booking: any;
  onCancelTicket: (ticketNumber: string, reason: string) => Promise<void>;
  onDownloadTicket?: () => void;
}

// Helper function to construct proper image URLs
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads')) {
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  }
  return imagePath;
};

const TicketDetailModal = ({
  open,
  onOpenChange,
  ticket,
  booking,
  onCancelTicket,
  onDownloadTicket,
}: TicketDetailModalProps) => {
  const { toast } = useToast();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!ticket || !booking) return null;

  const handleCancelTicket = async () => {
    if (!cancellationReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for cancellation",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await onCancelTicket(ticket.ticketNumber, cancellationReason);
      setShowCancelConfirm(false);
      setCancellationReason("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel ticket",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">✓ Active</Badge>;
      case 'expired':
        return <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30">⏰ Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30">✕ Cancelled</Badge>;
      case 'used':
        return <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30">✓ Used</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const eventDate = new Date(booking.eventId.date);
  const isExpired = ticket.status === 'expired' || eventDate < new Date();
  const isCancelled = ticket.status === 'cancelled';
  const canCancel = ticket.status === 'active' && !isExpired;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            Ticket Details
          </DialogTitle>
          <DialogDescription>
            Complete information about your event ticket
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Status */}
          <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Status:</span>
              {getStatusBadge(ticket.status)}
            </div>
            <div className="text-sm font-mono text-muted-foreground">
              {ticket.ticketNumber}
            </div>
          </div>

          {/* Event Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Event Information
            </h3>
            <div className="space-y-2 bg-secondary/10 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                {booking.eventId.imageUrl && (
                  <img
                    src={getImageUrl(booking.eventId.imageUrl)}
                    alt={booking.eventId.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-foreground mb-2">
                    {booking.eventId.title}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {eventDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.eventId.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendee Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Attendee Information
            </h3>
            <div className="space-y-2 bg-secondary/10 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{ticket.attendeeName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{ticket.attendeeEmail}</span>
              </div>
              {ticket.attendeePhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{ticket.attendeePhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Booking Information</h3>
            <div className="space-y-2 bg-secondary/10 p-4 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-mono">{booking._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booked on:</span>
                <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Tickets:</span>
                <span>{booking.quantity}</span>
              </div>
            </div>
          </div>

          {/* Cancellation Information */}
          {isCancelled && (
            <Alert className="bg-red-500/10 border-red-500/30">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-red-700 dark:text-red-400">
                    This ticket has been cancelled
                  </p>
                  {ticket.cancelledAt && (
                    <p className="text-muted-foreground">
                      Cancelled on: {new Date(ticket.cancelledAt).toLocaleString()}
                    </p>
                  )}
                  {ticket.cancellationReason && (
                    <p className="text-muted-foreground">
                      Reason: {ticket.cancellationReason}
                    </p>
                  )}
                  {ticket.refundAmount && (
                    <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                        💰 Refund: ₹{ticket.refundAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Status: {ticket.refundStatus === 'pending' ? 'Processing (5-7 business days)' : ticket.refundStatus}
                      </p>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Expiry Warning */}
          {isExpired && !isCancelled && (
            <Alert className="bg-orange-500/10 border-orange-500/30">
              <Clock className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-sm">
                <p className="font-semibold text-orange-700 dark:text-orange-400">
                  This ticket has expired
                </p>
                <p className="text-muted-foreground mt-1">
                  The event date has passed. This ticket is no longer valid for entry.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Cancel Confirmation */}
          {showCancelConfirm && canCancel && (
            <div className="space-y-4 p-4 border-2 border-red-500/30 rounded-lg bg-red-500/5">
              <Alert className="bg-yellow-500/10 border-yellow-500/30">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-sm">
                  <p className="font-semibold text-yellow-700 dark:text-yellow-400">
                    Are you sure you want to cancel this ticket?
                  </p>
                  <p className="text-muted-foreground mt-1">
                    A refund of ₹{(booking.totalPrice / booking.quantity).toFixed(2)} will be processed within 5-7 business days.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="cancellation-reason">
                  Cancellation Reason <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="cancellation-reason"
                  placeholder="Please provide a reason for cancellation..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelConfirm(false);
                    setCancellationReason("");
                  }}
                  className="flex-1"
                >
                  Keep Ticket
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelTicket}
                  disabled={isLoading || !cancellationReason.trim()}
                  className="flex-1"
                >
                  {isLoading ? "Cancelling..." : "Confirm Cancellation"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {!showCancelConfirm && (
            <>
              {onDownloadTicket && !isCancelled && (
                <Button
                  variant="outline"
                  onClick={onDownloadTicket}
                  className="flex-1 sm:flex-none"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex-1 sm:flex-none"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Ticket
                </Button>
              )}
              {!canCancel && !showCancelConfirm && (
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-none"
                >
                  Close
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailModal;
