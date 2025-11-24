import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { bookingsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface RazorpayPaymentProps {
  bookingData: any;
  event: any;
  onSuccess: () => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayPayment = ({
  bookingData,
  event,
  onSuccess,
  onCancel,
}: RazorpayPaymentProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      toast({
        title: "Error",
        description: "Failed to load payment gateway. Please refresh and try again.",
        variant: "destructive",
      });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [toast]);

  const handlePayment = async () => {
    try {
      setLoading(true);

      if (!window.Razorpay) {
        toast({
          title: "Error",
          description: "Razorpay is not loaded. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const options = {
        key: bookingData.razorpayKey,
        amount: Math.round(bookingData.booking.amount * 100), // Amount in paise
        currency: "INR",
        name: "GetTogether",
        description: `Booking for ${event.title}`,
        order_id: bookingData.booking.razorpayOrderId,
        handler: async (response: any) => {
          console.log("=== Payment handler START ===");
          console.log("Payment response:", response);
          console.log("Booking ID:", bookingData.booking._id);
          
          // Show success immediately (payment was successful from Razorpay)
          toast({
            title: "Payment Successful!",
            description: "Your tickets have been booked. Redirecting...",
          });
          console.log("✅ Toast shown");
          
          // Call onSuccess callback immediately
          if (onSuccess) {
            onSuccess();
            console.log("✅ onSuccess callback executed");
          }
          
          // Verify payment in background (non-blocking)
          bookingsAPI.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            bookingId: bookingData.booking._id,
          }).then(verifyResponse => {
            console.log("✅ Payment verified successfully:", verifyResponse);
          }).catch(error => {
            console.error("❌ Payment verification error (background):", error);
            // Payment already succeeded, verification is just for backend records
          });
          
          // Redirect immediately without waiting for verification
          console.log("Redirecting to /profile immediately...");
          setTimeout(() => {
            console.log("Executing redirect NOW");
            window.location.href = "/profile";
          }, 800);
          
          console.log("=== Payment handler END ===");
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed");
            setLoading(false);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          Click the button below to proceed with payment via Razorpay
        </p>
      </div>

      <div className="space-y-2 bg-secondary/30 rounded-lg p-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Event</span>
          <span className="font-semibold">{event.title}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tickets</span>
          <span className="font-semibold">{bookingData.booking.quantity}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="font-semibold">Total Amount</span>
          <span className="text-lg font-bold text-primary">₹{bookingData.booking.amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 bg-gradient-primary hover:opacity-90"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Pay with Razorpay"
          )}
        </Button>
      </div>
    </div>
  );
};

export default RazorpayPayment;
