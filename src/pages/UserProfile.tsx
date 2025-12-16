import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { bookingsAPI } from "@/lib/api";
import { Calendar, MapPin, Ticket, Download, Loader2, Eye, Clock, XCircle } from "lucide-react";
import { downloadTicketPDF } from "@/utils/ticketGenerator";
import TicketDetailModal from "@/components/TicketDetailModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads')) {
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  }
  return imagePath;
};

const UserProfile = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
      return;
    }

    if (!authLoading && isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getUserBookings();
      setBookings(response.bookings || []);
    } catch (error: any) {
      toast({
        title: "Error loading bookings",
        description: error.message || "Failed to load your bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDownloadTicket = async (booking: any) => {
    try {
      const ticketsData = booking.ticketNumbers.map((ticketNum: string, index: number) => ({
        ticketNumber: ticketNum,
        eventTitle: booking.eventId.title,
        eventDate: new Date(booking.eventId.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        eventLocation: booking.eventId.location,
        attendeeName: booking.attendeeDetails[index]?.name || 'Guest',
        attendeeEmail: booking.attendeeDetails[index]?.email || '',
        bookingId: booking._id,
        quantity: booking.quantity,
        totalPrice: booking.totalPrice,
        organizationName: booking.eventId.organizationName,
      }));

      const success = await downloadTicketPDF(ticketsData, booking.eventId.title);
      if (success) {
        toast({
          title: "Ticket Downloaded",
          description: "Your ticket(s) have been downloaded successfully.",
        });
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download ticket",
        variant: "destructive",
      });
    }
  };

  const handleViewTicket = (booking: any, ticketDetail: any) => {
    setSelectedTicket(ticketDetail);
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const handleCancelTicket = async (ticketNumber: string, reason: string) => {
    if (!selectedBooking) return;

    try {
      const response = await bookingsAPI.cancelUserTicket(
        selectedBooking._id,
        ticketNumber,
        reason
      );

      toast({
        title: "Ticket Cancelled",
        description: response.message || "Your ticket has been cancelled successfully. Refund will be processed within 5-7 business days.",
      });

      // Refresh bookings
      await fetchBookings();
    } catch (error: any) {
      throw error; // Let modal handle the error display
    }
  };

  const getTicketStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">✓ Active</Badge>;
      case 'expired':
        return <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'used':
        return <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30">✓ Used</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container px-4 pt-24 pb-8 md:px-6 max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="mb-8 bg-gradient-to-r from-primary/15 via-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/30 shadow-lg">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-5xl font-bold mb-3">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  My Profile
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Welcome back, <span className="font-bold text-foreground">{user?.name}</span>! 👋
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-primary/20 shadow-xl hover:shadow-2xl transition-shadow">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Email Address</p>
                <p className="font-semibold text-foreground text-sm break-all">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Bookings Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">My Bookings</h2>
            <p className="text-muted-foreground">View and manage your event bookings</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-4">You haven't booked any events yet</p>
                <Button
                  onClick={() => navigate("/")}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  Browse Events
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => {
                // Check if eventId exists and is populated
                if (!booking.eventId) {
                  return null; // Skip this booking if event data is missing
                }
                
                return (
                <Card key={booking._id} className="overflow-hidden hover:shadow-2xl hover:border-primary/50 transition-all duration-300 border-border group">
                  {/* Event Image */}
                  {booking.eventId.imageUrl && (
                    <div className="h-48 overflow-hidden bg-secondary/30">
                      <img
                        src={getImageUrl(booking.eventId.imageUrl)}
                        alt={booking.eventId.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {booking.eventId.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">✓ Confirmed</Badge>
                          <Badge variant="outline">{booking.quantity} {booking.quantity === 1 ? 'ticket' : 'tickets'}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">₹{booking.totalPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Event Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(booking.eventId.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{booking.eventId.location}</span>
                      </div>
                    </div>

                    {/* Ticket Numbers with Status */}
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Your Tickets</p>
                      <div className="space-y-2">
                        {(booking.ticketDetails && booking.ticketDetails.length > 0 
                          ? booking.ticketDetails 
                          : booking.ticketNumbers.map((tNum: string, idx: number) => ({
                              ticketNumber: tNum,
                              attendeeName: booking.attendeeDetails[idx]?.name || '',
                              attendeeEmail: booking.attendeeDetails[idx]?.email || '',
                              attendeePhone: booking.attendeeDetails[idx]?.phone || '',
                              status: 'active',
                            }))
                        ).map((ticket: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-background px-3 py-2 rounded border border-border hover:border-primary/50 cursor-pointer transition-all group"
                            onClick={() => handleViewTicket(booking, ticket)}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              <span className="text-sm font-mono">{ticket.ticketNumber}</span>
                            </div>
                            {getTicketStatusBadge(ticket.status)}
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Click on a ticket to view details or cancel</p>
                    </div>

                    {/* Attendees */}
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Attendees</p>
                      <div className="space-y-1">
                        {booking.attendeeDetails.map((attendee: any, index: number) => (
                          <p key={index} className="text-sm">
                            <span className="font-medium">{attendee.name}</span>
                            <span className="text-muted-foreground"> ({attendee.email})</span>
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button
                        className="flex-1 bg-gradient-primary hover:opacity-90 transition-all"
                        size="sm"
                        onClick={() => handleDownloadTicket(booking)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Ticket
                      </Button>
                    </div>

                    {/* Booking Info */}
                    <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                      <p>Booking ID: {booking._id}</p>
                      <p>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        ticket={selectedTicket}
        booking={selectedBooking}
        onCancelTicket={handleCancelTicket}
        onDownloadTicket={() => selectedBooking && handleDownloadTicket(selectedBooking)}
      />
    </div>
  );
};

export default UserProfile;
