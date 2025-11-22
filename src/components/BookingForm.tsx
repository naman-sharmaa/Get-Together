import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { bookingsAPI } from "@/lib/api";
import { Minus, Plus, Loader2 } from "lucide-react";
import RazorpayPayment from "./RazorpayPayment";

interface BookingFormProps {
  event: any;
  onClose: () => void;
}

interface AttendeeDetail {
  name: string;
  email: string;
  phone: string;
}

const BookingForm = ({ event, onClose }: BookingFormProps) => {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [attendees, setAttendees] = useState<AttendeeDetail[]>([
    { name: "", email: "", phone: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  const totalPrice = event.price * quantity;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= event.availableTickets) {
      setQuantity(newQuantity);
      // Adjust attendees array
      const newAttendees = [...attendees];
      if (newQuantity > attendees.length) {
        for (let i = attendees.length; i < newQuantity; i++) {
          newAttendees.push({ name: "", email: "", phone: "" });
        }
      } else {
        newAttendees.splice(newQuantity);
      }
      setAttendees(newAttendees);
    }
  };

  const handleAttendeeChange = (index: number, field: string, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      [field]: value,
    };
    setAttendees(newAttendees);
  };

  const validateAttendees = () => {
    for (let i = 0; i < attendees.length; i++) {
      const { name, email, phone } = attendees[i];
      if (!name || !email || !phone) {
        toast({
          title: "Missing Information",
          description: `Please fill all details for attendee ${i + 1}`,
          variant: "destructive",
        });
        return false;
      }
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast({
          title: "Invalid Email",
          description: `Please enter a valid email for attendee ${i + 1}`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleBooking = async () => {
    if (!validateAttendees()) return;

    try {
      setLoading(true);
      const response = await bookingsAPI.createBooking({
        eventId: event._id || event.id,
        quantity,
        attendeeDetails: attendees,
      });

      setBookingData(response);
      toast({
        title: "Booking Initiated",
        description: "Proceeding to payment...",
      });
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (bookingData) {
    return (
      <RazorpayPayment
        bookingData={bookingData}
        event={event}
        onSuccess={onClose}
        onCancel={() => setBookingData(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div>
        <Label className="text-sm font-semibold mb-2 block">Number of Tickets</Label>
        <div className="flex items-center gap-2 bg-secondary/30 rounded-lg p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="flex-1 text-center font-semibold">{quantity}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= event.availableTickets}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Attendee Details */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        <Label className="text-sm font-semibold">Attendee Details</Label>
        {attendees.map((attendee, index) => (
          <Card key={index} className="p-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Attendee {index + 1}</p>
              <Input
                placeholder="Full Name"
                value={attendee.name}
                onChange={(e) => handleAttendeeChange(index, "name", e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Email"
                type="email"
                value={attendee.email}
                onChange={(e) => handleAttendeeChange(index, "email", e.target.value)}
                className="text-sm"
              />
              <Input
                placeholder="Phone Number"
                value={attendee.phone}
                onChange={(e) => handleAttendeeChange(index, "phone", e.target.value)}
                className="text-sm"
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Price Summary */}
      <div className="bg-secondary/30 rounded-lg p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Price per ticket</span>
          <span className="font-semibold">₹{event.price}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Quantity</span>
          <span className="font-semibold">{quantity}</span>
        </div>
        <div className="border-t border-border pt-2 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          className="flex-1 bg-gradient-primary hover:opacity-90"
          onClick={handleBooking}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Proceed to Payment"
          )}
        </Button>
      </div>
    </div>
  );
};

export default BookingForm;
