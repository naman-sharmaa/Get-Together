import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Calendar, MapPin, DollarSign, Ticket } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { eventsAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const EventManagement = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    location: "",
    price: "",
    imageUrl: "",
    totalTickets: "",
    bookingExpiry: "",
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventsAPI.getMyEvents();
      setEvents(response.events || []);
    } catch (error: any) {
      toast({
        title: "Error loading events",
        description: error.message || "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (event?: any) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title || "",
        description: event.description || "",
        category: event.category || "",
        date: event.date ? new Date(event.date).toISOString().slice(0, 16) : "",
        location: event.location || "",
        price: event.price?.toString() || "",
        imageUrl: event.imageUrl || "",
        totalTickets: event.totalTickets?.toString() || "",
        bookingExpiry: event.bookingExpiry ? new Date(event.bookingExpiry).toISOString().slice(0, 16) : "",
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: "",
        description: "",
        category: "",
        date: "",
        location: "",
        price: "",
        imageUrl: "",
        totalTickets: "",
        bookingExpiry: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      category: "",
      date: "",
      location: "",
      price: "",
      imageUrl: "",
      totalTickets: "",
      bookingExpiry: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await eventsAPI.updateEvent(editingEvent._id || editingEvent.id, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          date: new Date(formData.date).toISOString(),
          location: formData.location,
          price: parseFloat(formData.price),
          imageUrl: formData.imageUrl,
          totalTickets: parseInt(formData.totalTickets) || 0,
          bookingExpiry: new Date(formData.bookingExpiry).toISOString(),
        });
        toast({
          title: "Event updated!",
          description: "Your event has been updated successfully.",
        });
      } else {
        await eventsAPI.createEvent({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          date: new Date(formData.date).toISOString(),
          location: formData.location,
          price: parseFloat(formData.price),
          imageUrl: formData.imageUrl,
          totalTickets: parseInt(formData.totalTickets) || 0,
          bookingExpiry: new Date(formData.bookingExpiry).toISOString(),
        });
        toast({
          title: "Event created!",
          description: "Your event has been created successfully.",
        });
      }
      handleCloseDialog();
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save event",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await eventsAPI.deleteEvent(eventId);
      toast({
        title: "Event deleted!",
        description: "Your event has been deleted successfully.",
      });
      fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" } = {
      upcoming: "default",
      past: "secondary",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card rounded-lg p-6 border border-border shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">My Events</h2>
          <p className="text-muted-foreground">Create and manage your events with ease</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
              <DialogDescription>
                {editingEvent ? "Update your event details" : "Fill in the details to create a new event"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Theater">Theater</SelectItem>
                      <SelectItem value="Concert">Concert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date & Time *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bookingExpiry">Ticket Booking Expiry Date & Time *</Label>
                <Input
                  id="bookingExpiry"
                  type="datetime-local"
                  value={formData.bookingExpiry}
                  onChange={(e) => setFormData({ ...formData, bookingExpiry: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">Bookings will close at this date and time</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalTickets">Total Tickets</Label>
                  <Input
                    id="totalTickets"
                    type="number"
                    min="0"
                    value={formData.totalTickets}
                    onChange={(e) => setFormData({ ...formData, totalTickets: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-primary hover:opacity-90">
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-4">Create your first event to get started</p>
            <Button onClick={() => handleOpenDialog()} className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card 
              key={event._id || event.id} 
              className="hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 group overflow-hidden bg-card"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {event.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getStatusBadge(event.status)}
                      <Badge variant="outline" className="text-xs">{event.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 rounded-md p-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-xs">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/30 rounded-md p-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="truncate text-xs">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-orange-50 dark:bg-orange-950/30 rounded-md p-2 border border-orange-200 dark:border-orange-800">
                  <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs"><strong>Booking closes:</strong> {new Date(event.bookingExpiry).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center justify-between bg-primary/10 rounded-md p-2">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="font-bold text-foreground">₹{event.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Ticket className="h-3 w-3" />
                    <span>{event.availableTickets || 0}/{event.totalTickets || 0}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => handleOpenDialog(event)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 hover:bg-destructive/90 transition-colors"
                    onClick={() => handleDelete(event._id || event.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventManagement;

