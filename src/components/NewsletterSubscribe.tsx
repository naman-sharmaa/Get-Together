import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Check } from "lucide-react";

interface NewsletterSubscribeProps {
  className?: string;
}

const NewsletterSubscribe = ({ className = "" }: NewsletterSubscribeProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5050/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe');
      }

      toast({
        title: "Success!",
        description: data.message || "Successfully subscribed to newsletter",
      });
      
      setIsSubscribed(true);
      setEmail("");
      setName("");
      
      // Reset subscribed state after 3 seconds
      setTimeout(() => setIsSubscribed(false), 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe to newsletter",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="hidden sm:block">
          <div className="bg-primary/10 p-3 rounded-full">
            <Mail className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-2">
            Stay Updated with EventHub
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Subscribe to our newsletter for the latest events, exclusive offers, and event management tips.
          </p>
          
          {isSubscribed ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
              <Check className="h-5 w-5" />
              <span>Successfully subscribed!</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background"
                />
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>
              <Button
                type="submit"
                className="w-full sm:w-auto bg-gradient-primary hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Subscribing..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </form>
          )}
          
          <p className="text-xs text-muted-foreground mt-3">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSubscribe;
