import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import CategoryCard from "@/components/CategoryCard";
import TypewriterText from "@/components/TypewriterText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Briefcase, Trophy, Theater, Calendar, Users, ArrowRight, Building2, Mail, Phone, MapPin, Code2 } from "lucide-react";
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
import categoryTech from "@/assets/category-hackathon.jpg";

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
    { title: "Tech & Hackathons", icon: Code2, count: 95, image: categoryTech },
  ];

  const partners = [
    "Ticketmaster", "LiveNation", "Eventbrite", "StubHub", "SeatGeek", "AXS", "Ticketek", "See Tickets"
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get message from textarea element
    const messageTextarea = (e.target as HTMLFormElement).querySelector('textarea');
    const fullMessage = messageTextarea?.value || '';
    
    if (!contactForm.name || !contactForm.email || !contactForm.message || !fullMessage) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          subject: contactForm.message, // Using message field as subject
          message: fullMessage, // Full message from textarea
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Message sent!",
          description: "We'll get back to you soon. Check your email for confirmation.",
        });
        setContactForm({ name: "", email: "", phone: "", message: "" });
        if (messageTextarea) messageTextarea.value = '';
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden pt-28 pb-16">
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="container px-4 text-center relative z-10 animate-fade-in-up">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-5 text-white leading-tight">
              Your Next Great <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Experience</span> Awaits
            </h1>
            <TypewriterText />
            <Button 
              size="lg" 
              onClick={() => navigate("/all-events")}
              className="bg-gradient-to-r from-pink-500 via-purple-500 to-purple-600 hover:from-pink-600 hover:via-purple-600 hover:to-purple-700 text-white font-semibold text-base px-8 py-6 h-auto rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
            >
              Explore Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 relative overflow-hidden">
        <div className="container px-4 md:px-6 mb-12">
          <div className="text-center animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-3 text-white">Browse by Category</h2>
            <p className="text-muted-foreground text-lg">Find events that match your interests</p>
          </div>
        </div>
        <div className="relative overflow-x-auto scrollbar-hide pb-4">
          <div className="flex gap-6 animate-scroll">
            {[...categories, ...categories].map((category, index) => (
              <div key={index} className="flex-shrink-0 w-[280px]">
                <CategoryCard {...category} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="container px-4 py-16 md:px-6">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h2 className="text-4xl font-bold mb-2 text-white">Upcoming Events</h2>
            <p className="text-muted-foreground text-lg">Don't miss out on these exciting events</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/all-events?status=upcoming")} className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-smooth">View All</Button>
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
                image={getImageUrl(event.imageUrl) || event.image_url || defaultImages[event.category] || eventFestival}
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
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h2 className="text-4xl font-bold mb-2 text-white">Past Events</h2>
            <p className="text-muted-foreground text-lg">See what you missed</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/all-events?status=past")} className="border-primary/50 hover:bg-primary/10 hover:border-primary transition-smooth">View All</Button>
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
                image={getImageUrl(event.imageUrl) || event.image_url || defaultImages[event.category] || eventFestival}
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
      <section className="relative py-20 border-y border-primary/20 overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-4xl font-bold mb-3 text-white">Our Partners</h2>
            <p className="text-gray-400 text-lg">Trusted by leading event platforms</p>
          </div>
          <div className="flex gap-6 animate-scroll">
            {[...partners, ...partners].map((partner, index) => (
              <Card key={index} className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-sm border-slate-700/50 hover:border-purple-500/50 transition-smooth cursor-pointer flex-shrink-0 w-[280px]">
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-lg font-semibold text-white">{partner}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Organizers */}
      <section id="organizers" className="container px-4 py-16 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Calendar className="h-16 w-16 text-blue-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Are You an Event Organizer?</h2>
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
              <h2 className="text-4xl font-bold text-white mb-3">Contact Us</h2>
              <p className="text-lg text-muted-foreground">Have questions? We'd love to hear from you</p>
            </div>

            <div className="glass-effect p-10 rounded-xl border border-primary/20">
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
                        <p className="text-muted-foreground">gettogetherebookings@gmail.com</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-primary mt-1" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                        <p className="text-muted-foreground">+91 9079235893</p>
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
