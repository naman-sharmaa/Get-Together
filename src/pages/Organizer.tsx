import OrganizerHeader from "@/components/OrganizerHeader";
import OrganizerFooter from "@/components/OrganizerFooter";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, DollarSign, TrendingUp, Sparkles, BarChart3, Shield, Zap, Globe, HeadphonesIcon } from "lucide-react";

const Organizer = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <OrganizerHeader />

      {/* Hero Section */}
      <section id="hero" className="bg-gradient-subtle py-16 pt-28">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Grow Your Events with GetTogether
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of event organizers who trust us to reach wider audiences and manage their events seamlessly
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="text-3xl font-bold text-white">50K+</h3>
                <p className="text-sm text-gray-400">Active Organizers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="text-3xl font-bold text-white">100K+</h3>
                <p className="text-sm text-gray-400">Events Listed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <DollarSign className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="text-3xl font-bold text-white">₹50Cr+</h3>
                <p className="text-sm text-gray-400">Tickets Sold</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="text-3xl font-bold text-white">95%</h3>
                <p className="text-sm text-gray-400">Satisfaction Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="benefits" className="bg-gradient-subtle py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Why Choose GetTogether?</h2>
            <p className="text-gray-400">Everything you need to manage and grow your events</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Easy Event Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Create and manage events with our intuitive dashboard. Update details, pricing, and availability in real-time.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Powerful Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Track ticket sales, audience demographics, and revenue with comprehensive analytics and reporting tools.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reach More People</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get discovered by thousands of event-goers browsing our platform daily. Boost your visibility and ticket sales.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fast and secure payment processing with multiple payment options for your attendees.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Marketing Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Built-in email campaigns, social media integration, and promotional tools to market your events effectively.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>24/7 Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Dedicated support team available round the clock to help you with any questions or issues.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 px-8"
              onClick={() => navigate("/organizer/auth")}
            >
              Start Your Event
            </Button>
          </div>
        </div>
      </section>

      {/* Top Features Section */}
      <section id="features" className="container px-4 py-16 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">Top Features</h2>
          <p className="text-gray-400">Powerful tools designed for successful event management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Smart Event Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create events in minutes with our intuitive wizard. Set up tickets, pricing, and schedules effortlessly.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Real-Time Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monitor ticket sales, revenue, and attendee engagement with live dashboards and detailed reports.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Secure Payment Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Bank-grade security with multiple payment gateways. Fast payouts and comprehensive fraud protection.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Zap className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Instant Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Stay updated with real-time alerts for new bookings, cancellations, and important event milestones.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Globe className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Global Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                List your events to millions of users worldwide. Multi-language support and international payment options.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <HeadphonesIcon className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Priority Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Dedicated account managers and 24/7 priority support to ensure your events run smoothly.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 px-8"
            onClick={() => navigate("/organizer/auth")}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-gradient-subtle py-16">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Get In Touch</h2>
            <p className="text-gray-400">Have questions? We're here to help you succeed</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <p className="text-center text-muted-foreground mb-8">
                  Ready to take your events to the next level? Contact our team today and discover how GetTogether can transform your event management experience.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Call Us</h4>
                    <p className="text-muted-foreground">+91 9079235893</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Email Us</h4>
                    <p className="text-muted-foreground">gettogetherebookings@gmail.com</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Visit Us</h4>
                    <p className="text-muted-foreground">Phagwara - 144401, Punjab, India</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <OrganizerFooter />
    </div>
  );
};

export default Organizer;
