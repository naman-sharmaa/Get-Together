import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { eventsAPI, bookingsAPI } from "@/lib/api";
import { Calendar, MapPin, DollarSign, Users, Ticket, ArrowLeft } from "lucide-react";
import BookingForm from "@/components/BookingForm";

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

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (!id) return;
        const response = await eventsAPI.getEvent(id);
        setEvent(response.event);
      } catch (error: any) {
        toast({
          title: "Error loading event",
          description: error.message || "Failed to load event details",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container px-4 py-16 text-center">
          <p className="text-muted-foreground mb-4">Event not found</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isBookingClosed = new Date() > new Date(event.bookingExpiry);
  const eventDate = new Date(event.date);
  const isPastEvent = new Date() > eventDate;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 py-8 md:px-6 max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Event Image and Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Event Image */}
            <div className="rounded-lg overflow-hidden">
              <img
                src={event.imageUrl ? getImageUrl(event.imageUrl) : "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800"}
                alt={event.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Event Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{event.title}</CardTitle>
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <Badge>{event.category}</Badge>
                      <Badge variant="outline">{event.status}</Badge>
                      {isPastEvent && <Badge variant="destructive">Past Event</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">₹{event.price}</p>
                    <p className="text-sm text-muted-foreground">per ticket</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                {event.description && (
                  <div>
                    <h3 className="font-semibold mb-2">About this event</h3>
                    <p className="text-muted-foreground">{event.description}</p>
                  </div>
                )}

                {/* Event Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Date & Time</p>
                      <p className="font-semibold">
                        {eventDate.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-semibold">{event.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                    <Ticket className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Available Tickets</p>
                      <p className="font-semibold">{event.availableTickets} / {event.totalTickets}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="text-xs text-muted-foreground">Booking Closes</p>
                      <p className="font-semibold text-orange-700 dark:text-orange-300">
                        {new Date(event.bookingExpiry).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Organizer Info */}
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Organized by</p>
                  <p className="font-semibold">{event.organization_name || event.organizer_name}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Book Tickets</CardTitle>
                <CardDescription>
                  {isPastEvent
                    ? "This event has already passed"
                    : isBookingClosed
                    ? "Booking period has ended"
                    : `${event.availableTickets} tickets available`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isAuthenticated ? (
                  <div className="text-center space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Sign in to book tickets for this event
                    </p>
                    <Button
                      className="w-full bg-gradient-primary hover:opacity-90"
                      onClick={() => navigate("/")}
                    >
                      Sign In
                    </Button>
                  </div>
                ) : isPastEvent ? (
                  <p className="text-sm text-muted-foreground text-center">
                    This event has already passed and bookings are no longer available.
                  </p>
                ) : isBookingClosed ? (
                  <p className="text-sm text-muted-foreground text-center">
                    Booking period for this event has ended.
                  </p>
                ) : event.availableTickets === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">
                    All tickets for this event are sold out.
                  </p>
                ) : (
                  <>
                    {!showBookingForm ? (
                      <Button
                        className="w-full bg-gradient-primary hover:opacity-90"
                        onClick={() => setShowBookingForm(true)}
                      >
                        <Ticket className="mr-2 h-4 w-4" />
                        Book Now
                      </Button>
                    ) : (
                      <BookingForm
                        event={event}
                        onClose={() => setShowBookingForm(false)}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventDetail;
