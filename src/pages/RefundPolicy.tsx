import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-12 md:px-6 max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-4xl font-bold text-foreground mb-8">Refund Policy</h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. General Refund Policy</h2>
            <p>
              At GetTogether, we understand that plans can change. Our refund policy is designed to be 
              fair to both event attendees and organizers. Please read this policy carefully before 
              purchasing tickets.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Standard Refund Timeframes</h2>
            <p className="mb-4">For most events, the following refund schedule applies:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>More than 30 days before event:</strong> Full refund minus processing fees (5%)</li>
              <li><strong>15-30 days before event:</strong> 75% refund</li>
              <li><strong>7-14 days before event:</strong> 50% refund</li>
              <li><strong>Less than 7 days before event:</strong> No refund</li>
            </ul>
            <p className="mt-4">
              Please note that some events may have different refund policies as determined by the 
              event organizer. These will be clearly displayed during the ticket purchase process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Event Cancellation by Organizer</h2>
            <p>
              If an event is cancelled by the organizer, all attendees will receive a full refund 
              including all processing fees within 5-10 business days. You will be notified via email 
              about the cancellation and refund status.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Event Postponement</h2>
            <p className="mb-4">
              If an event is postponed to a new date, your tickets will automatically be valid for 
              the new date. You may request a refund if you cannot attend the rescheduled event:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Full refund if requested within 7 days of postponement announcement</li>
              <li>Subject to standard refund policy timeframes after 7 days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. How to Request a Refund</h2>
            <p className="mb-4">To request a refund:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Log in to your GetTogether account</li>
              <li>Navigate to "My Tickets"</li>
              <li>Select the ticket you wish to refund</li>
              <li>Click "Request Refund" and follow the prompts</li>
            </ol>
            <p className="mt-4">
              Alternatively, you can contact our support team at support@eventhub.com with your 
              order number and reason for refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Processing Time</h2>
            <p>
              Once your refund request is approved, please allow 5-10 business days for the refund 
              to appear in your original payment method. In some cases, it may take longer depending 
              on your bank or payment provider.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Non-Refundable Items</h2>
            <p className="mb-4">The following items are non-refundable:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>VIP packages and meet-and-greet tickets (unless event is cancelled)</li>
              <li>Donated or charity tickets</li>
              <li>Tickets marked as "No Refund" at time of purchase</li>
              <li>Processing and service fees (except in case of organizer cancellation)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Special Circumstances</h2>
            <p>
              We understand that emergencies happen. In cases of medical emergencies, family 
              emergencies, or other extenuating circumstances, please contact our support team. 
              We will review each case individually and may make exceptions to our standard policy 
              at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about our Refund Policy, please contact us at:
              <br />
              Email: gettogetherebookings@gmail.com
              <br />
              Phone: +91 9079235893
              <br />
              Hours: Monday-Friday, 9 AM - 6 PM IST
            </p>
          </section>

          <p className="text-sm pt-8 border-t border-border">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
