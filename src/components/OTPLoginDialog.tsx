import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OTPLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: 'user' | 'organizer';
}

const OTPLoginDialog = ({ open, onOpenChange, role = 'user' }: OTPLoginDialogProps) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const resetForm = () => {
    setStep('email');
    setEmail("");
    setOtp("");
    setIsLoading(false);
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050/api'}/auth/request-login-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      toast({
        title: "OTP Sent",
        description: "Please check your email for the OTP code (valid for 10 minutes)",
      });
      setStep('otp');
    } catch (error: any) {
      console.error('OTP request error:', error);
      let errorMessage = "Failed to send OTP";
      
      if (error.name === 'AbortError') {
        errorMessage = "Request timeout. The server might be starting up (takes ~30s on first request). Please try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050/api'}/auth/verify-login-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      toast({
        title: "Success",
        description: "Login successful! Redirecting...",
      });

      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      resetForm();
      onOpenChange(false);

      // Redirect based on role
      if (role === 'organizer') {
        window.location.href = '/organizer/dashboard';
      } else {
        window.location.href = '/';
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5050/api'}/auth/request-login-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your email. Previous OTP is now invalid.",
      });
      setOtp(""); // Clear the OTP field
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-gradient-to-br from-background to-muted/20 border-0">
        <DialogHeader className="bg-gradient-primary text-white p-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Login with OTP
          </DialogTitle>
          <DialogDescription className="text-white/80 mt-2">
            {step === 'email' && "Enter your email to receive an OTP"}
            {step === 'otp' && "Enter the 6-digit OTP sent to your email"}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/90">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 bg-background border border-input rounded-lg px-4 py-2 text-sm placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:border-primary/50"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full h-11"
                onClick={handleClose}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium text-foreground/90">
                  Enter OTP
                </Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                  }}
                  maxLength={6}
                  required
                  className="h-14 bg-background border border-input rounded-lg px-4 py-2 text-center text-2xl tracking-[0.5em] placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary hover:border-primary/50"
                />
                <p className="text-xs text-muted-foreground text-center">
                  OTP sent to {email}
                </p>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90 h-11"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Resend OTP
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-11"
                  onClick={() => setStep('email')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Change Email
                </Button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              {step === 'email' && "You'll receive an OTP valid for 10 minutes"}
              {step === 'otp' && "Didn't receive the code? Check spam or click Resend"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OTPLoginDialog;
