import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Users, Target, Heart, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container px-4 pt-24 pb-12 md:px-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">About GetTogether</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Connecting people through unforgettable experiences since 2020
          </p>

          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-foreground mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                GetTogether was founded with a simple yet powerful vision: to make event discovery and 
                booking effortless for everyone. What started as a small platform for local events 
                has grown into a comprehensive solution connecting millions of event-goers with their 
                perfect experiences.
              </p>
              <p>
                We believe that events have the power to bring people together, create lasting 
                memories, and build stronger communities. Whether it's a music concert, a business 
                conference, a sporting event, or a theater performance, every event is an opportunity 
                to experience something extraordinary.
              </p>
              <p>
                Today, GetTogether serves thousands of event organizers and millions of attendees 
                worldwide, offering a seamless platform that makes event management and ticket 
                booking simple, secure, and enjoyable.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-foreground mb-8">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Community First</h3>
                <p className="text-muted-foreground">
                  We're committed to building strong communities by connecting people through 
                  shared experiences and interests.
                </p>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Innovation</h3>
                <p className="text-muted-foreground">
                  We continuously evolve our platform with cutting-edge technology to provide 
                  the best user experience.
                </p>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Passion</h3>
                <p className="text-muted-foreground">
                  We're passionate about events and dedicated to making every experience 
                  memorable and hassle-free.
                </p>
              </Card>

              <Card className="p-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Excellence</h3>
                <p className="text-muted-foreground">
                  We strive for excellence in everything we do, from customer support to 
                  platform reliability.
                </p>
              </Card>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-foreground mb-6">Our Mission</h2>
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
              <p className="text-lg text-foreground leading-relaxed">
                To empower event organizers and attendees worldwide by providing a seamless, 
                innovative platform that makes discovering, creating, and attending events 
                effortless and enjoyable. We're committed to building connections, fostering 
                communities, and creating unforgettable experiences for everyone.
              </p>
            </Card>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-semibold text-foreground mb-6">By The Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">5M+</div>
                <div className="text-sm text-muted-foreground">Happy Attendees</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                <div className="text-sm text-muted-foreground">Events Hosted</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Event Organizers</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">150+</div>
                <div className="text-sm text-muted-foreground">Cities Worldwide</div>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-semibold text-foreground mb-6">Get In Touch</h2>
            <Card className="p-8">
              <p className="text-muted-foreground mb-6">
                Have questions or want to learn more about GetTogether? We'd love to hear from you!
              </p>
              <div className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">Email:</strong> gettogetherebookings@gmail.com</p>
                <p><strong className="text-foreground">Phone:</strong> +91 9079235893</p>
                <p><strong className="text-foreground">Address:</strong> Phagwara - 144401, Punjab, India</p>
              </div>
              <Button 
                onClick={() => navigate('/#contact')} 
                className="mt-6 bg-gradient-primary hover:opacity-90"
              >
                Contact Us
              </Button>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
