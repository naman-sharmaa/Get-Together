import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { eventsAPI } from "@/lib/api";

import eventConcert from "@/assets/event-concert.jpg";
import eventConference from "@/assets/event-conference.jpg";
import eventSports from "@/assets/event-sports.jpg";
import eventTheater from "@/assets/event-theater.jpg";
import eventFestival from "@/assets/event-festival.jpg";

// Default images mapping
const defaultImages: { [key: string]: string } = {
  Music: eventFestival,
  Conference: eventConference,
  Sports: eventSports,
  Theater: eventTheater,
  Concert: eventConcert,
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

const getImageUrl = (imagePath: string): string => {
  if (imagePath && imagePath.startsWith('/uploads')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  return imagePath;
};

const AllEvents = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "upcoming";
  const urlSearch = searchParams.get("search") || "";
  
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);

  const categories = ["all", "Music", "Conference", "Sports", "Theater", "Concert"];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventsAPI.getEvents({ status });
        setEvents(response.events || []);
      } catch (error: any) {
        console.error("Error fetching events:", error);
        toast({
          title: "Error loading events",
          description: error.message || "Failed to load events",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [status, toast]);

  useEffect(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((event) => event.category === selectedCategory);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 py-12 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {status === "upcoming" ? "Upcoming Events" : "Past Events"}
          </h1>
          <p className="text-muted-foreground">
            {status === "upcoming"
              ? "Browse all upcoming events and book your tickets"
              : "Explore events that have already happened"}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-6 border border-border mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search events by title, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event._id || event.id}
                id={event._id || event.id}
                title={event.title}
                date={new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                location={event.location}
                image={
                  event.imageUrl ||
                  event.image_url ||
                  defaultImages[event.category] ||
                  eventFestival
                }
                category={event.category}
                price={`₹${event.price}`}
                bookingExpiry={event.bookingExpiry}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No events found</p>
            <Button onClick={() => navigate("/")} className="bg-gradient-primary hover:opacity-90">
              Back to Home
            </Button>
          </div>
        )}

        {/* Results count */}
        {!loading && filteredEvents.length > 0 && (
          <div className="mt-8 text-center text-muted-foreground">
            <p>Showing {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AllEvents;
