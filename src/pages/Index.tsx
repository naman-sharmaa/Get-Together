import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import CategoryCard from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Briefcase, Trophy, Theater, Calendar, Users, ArrowRight, Building2, Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { eventsAPI } from "@/lib/api";

import heroBanner from "@/assets/hero-banner.jpg";
import eventConcert from "@/assets/event-concert.jpg";
import eventConference from "@/assets/event-conference.jpg";
import eventSports from "@/assets/event-sports.jpg";
import eventTheater from "@/assets/event-theater.jpg";
import eventFestival from "@/assets/event-festival.jpg";
import categoryMusic from "@/assets/category-music.jpg";
import categoryBusiness from "@/assets/category-business.jpg";
import categorySports from "@/assets/category-sports.jpg";
import categoryTheater from "@/assets/category-theater.jpg";

// Default images mapping
const defaultImages: { [key: string]: string } = {
  Music: eventFestival,
  Conference: eventConference,
  Sports: eventSports,
  Theater: eventTheater,
  Concert: eventConcert,
};

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isOrganizer, loading: authLoading } = useAuth();
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [pastEvents, setPastEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect organizers to their dashboard
    if (!authLoading && isOrganizer) {
      navigate("/organizer/dashboard");
      return;
    }
  }, [isOrganizer, authLoading, navigate]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const [upcomingResponse, pastResponse] = await Promise.all([
          eventsAPI.getEvents({ status: "upcoming" }),
          eventsAPI.getEvents({ status: "past" }),
        ]);
        
        setUpcomingEvents(upcomingResponse.events || []);
        setPastEvents(pastResponse.events || []);
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

    if (!authLoading && !isOrganizer) {
      fetchEvents();
    }
  }, [toast, authLoading, isOrganizer]);

  const categories = [
    { title: "Music & Concerts", icon: Music, count: 248, image: categoryMusic },
    { title: "Business & Networking", icon: Briefcase, count: 156, image: categoryBusiness },
    { title: "Sports & Recreation", icon: Trophy, count: 189, image: categorySports },
    { title: "Arts & Theater", icon: Theater, count: 134, image: categoryTheater },
  ];

  const partners = [
    "Ticketmaster", "LiveNation", "Eventbrite", "StubHub", "SeatGeek", "AXS", "Ticketek", "See Tickets"
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message sent!",
      description: "We'll get back to you soon.",
    });
    setContactForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <img src={heroBanner} alt="Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 to-foreground/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="container px-4 text-center text-primary-foreground">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover Amazing Events</h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Book tickets to concerts, sports, theater, and more
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Explore Events <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gradient-subtle py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">Browse by Category</h2>
            <p className="text-muted-foreground">Find events that match your interests</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="container px-4 py-16 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Upcoming Events</h2>
            <p className="text-muted-foreground">Don't miss out on these exciting events</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/all-events?status=upcoming")}>View All</Button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {loading ? (
            <div className="text-center w-full py-8 text-muted-foreground">Loading events...</div>
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => (
              <EventCard
                key={event._id || event.id}
                id={event._id || event.id}
                title={event.title}
                date={new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                location={event.location}
                image={event.imageUrl || event.image_url || defaultImages[event.category] || eventFestival}
                category={event.category}
                price={`₹${event.price}`}
                bookingExpiry={event.bookingExpiry}
              />
            ))
          ) : (
            <div className="text-center w-full py-8 text-muted-foreground">No upcoming events</div>
          )}
        </div>
      </section>

      {/* Past Events */}
      <section className="container px-4 py-16 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Past Events</h2>
            <p className="text-muted-foreground">See what you missed</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/all-events?status=past")}>View All</Button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {loading ? (
            <div className="text-center w-full py-8 text-muted-foreground">Loading events...</div>
          ) : pastEvents.length > 0 ? (
            pastEvents.map((event) => (
              <EventCard
                key={event._id || event.id}
                id={event._id || event.id}
                title={event.title}
                date={new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                location={event.location}
                image={event.imageUrl || event.image_url || defaultImages[event.category] || eventFestival}
                category={event.category}
                bookingExpiry={event.bookingExpiry}
              />
            ))
          ) : (
            <div className="text-center w-full py-8 text-muted-foreground">No past events</div>
          )}
        </div>
      </section>

      {/* Partners */}
      <section className="bg-secondary/30 py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-2">Our Partners</h2>
            <p className="text-muted-foreground">Trusted by leading event platforms</p>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {partners.map((partner, index) => (
              <Card key={index} className="hover:shadow-soft transition-all duration-300 cursor-pointer border-border hover:border-primary flex-shrink-0 w-[280px]">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-semibold text-foreground">{partner}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Organizers */}
      <section id="organizers" className="container px-4 py-16 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Calendar className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-foreground mb-4">Are You an Event Organizer?</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join our platform and reach thousands of potential attendees. We provide the tools and support 
            you need to make your event a success. List your events, manage tickets, and grow your audience.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90" onClick={() => window.location.href = '/organizer'}>
              <Users className="mr-2 h-5 w-5" />
              Register as Organizer
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gradient-subtle py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-3">Contact Us</h2>
              <p className="text-lg text-muted-foreground">Have questions? We'd love to hear from you</p>
            </div>

            <div className="bg-card p-10 rounded-xl shadow-elevated">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form - Left Column */}
                <div>
                  <form onSubmit={handleContactSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                      <Input
                        placeholder="Enter your full name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                      <Input
                        type="tel"
                        placeholder="Enter your phone number"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                      <Input
                        placeholder="Enter subject"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                      <Textarea
                        placeholder="Enter your message"
                        required
                        className="min-h-[120px] resize-none"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">We'll never share your details with anyone else.</p>
                    <Button type="submit" size="lg" className="w-full bg-gradient-primary hover:opacity-90">
                      Submit
                    </Button>
                  </form>
                </div>

                {/* Contact Information - Right Column */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Address</h4>
                        <p className="text-muted-foreground">Phagwara - 144401, Punjab, India</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Mail className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Email</h4>
                        <p className="text-muted-foreground">neartocollege@gmail.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                        <p className="text-muted-foreground">+91 9525701001</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-secondary/30 p-6 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Quick Response</h4>
                    <p className="text-muted-foreground text-sm">
                      We typically respond within 24 hours during business days. For urgent matters, please call us directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
