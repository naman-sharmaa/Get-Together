import OrganizerHeader from "@/components/OrganizerHeader";
import OrganizerFooter from "@/components/OrganizerFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import loginIllustration from "@/assets/login-illustration.jpg";
import ForgotPasswordDialog from "@/components/ForgotPasswordDialog";
import OTPLoginDialog from "@/components/OTPLoginDialog";

const OrganizerAuth = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOTPLogin, setShowOTPLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [signupForm, setSignupForm] = useState({
    organizationName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Force organizer role for organizer page login
      await signIn(loginForm.email, loginForm.password, 'organizer');
      // Wait for AuthContext to update with user data
      await new Promise(resolve => setTimeout(resolve, 300));
      navigate("/organizer/dashboard");
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.password !== signupForm.confirmPassword) {
      return;
    }
    setIsLoading(true);
    try {
      // Force organizer role for organizer page signup
      await signUp({
        name: signupForm.organizationName,
        email: signupForm.email,
        phone: signupForm.phone,
        password: signupForm.password,
        role: "organizer", // Explicitly set as organizer
        organizationName: signupForm.organizationName,
      });
      // Wait for AuthContext to update with user data
      await new Promise(resolve => setTimeout(resolve, 300));
      navigate("/organizer/dashboard");
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OrganizerHeader />
      <ForgotPasswordDialog 
        open={showForgotPassword} 
        onOpenChange={setShowForgotPassword}
        role="organizer"
      />
      <OTPLoginDialog 
        open={showOTPLogin} 
        onOpenChange={setShowOTPLogin}
        role="organizer"
      />

      <main className="flex-1 container px-4 py-12 md:px-6">
        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Side - Forms */}
              <div className="p-8 lg:p-12">
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* Login Tab */}
                  <TabsContent value="login">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">Login</h2>
                        <p className="text-muted-foreground">
                          Log in to your account and get started managing events
                        </p>
                      </div>

                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({ ...loginForm, email: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showLoginPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              value={loginForm.password}
                              onChange={(e) =>
                                setLoginForm({ ...loginForm, password: e.target.value })
                              }
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showLoginPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <button
                            type="button"
                            className="text-primary hover:underline font-medium"
                            onClick={() => setShowOTPLogin(true)}
                          >
                            Login With OTP
                          </button>
                          <button
                            type="button"
                            className="text-primary hover:underline font-medium"
                            onClick={() => setShowForgotPassword(true)}
                          >
                            Forgot Password?
                          </button>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-primary hover:opacity-90"
                          size="lg"
                          disabled={isLoading}
                        >
                          {isLoading ? "Logging in..." : "LOG IN"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                          Do not have an account?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              const signupTab = document.querySelector('[value="signup"]') as HTMLElement;
                              signupTab?.click();
                            }}
                            className="text-primary hover:underline font-medium"
                          >
                            Sign Up
                          </button>
                        </p>
                      </form>
                    </div>
                  </TabsContent>

                  {/* Sign Up Tab */}
                  <TabsContent value="signup">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-3xl font-bold text-foreground mb-2">Sign Up</h2>
                        <p className="text-muted-foreground">
                          Create your organizer account and start listing events
                        </p>
                      </div>

                      <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                          <Label htmlFor="organizationName">Organization Name</Label>
                          <Input
                            id="organizationName"
                            placeholder="Enter your organization name"
                            value={signupForm.organizationName}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, organizationName: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="signupEmail">Email Address</Label>
                          <Input
                            id="signupEmail"
                            type="email"
                            placeholder="Enter your email"
                            value={signupForm.email}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, email: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="signupPhone">Phone Number *</Label>
                          <Input
                            id="signupPhone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={signupForm.phone}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, phone: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="signupPassword">Password</Label>
                          <div className="relative">
                            <Input
                              id="signupPassword"
                              type={showSignupPassword ? "text" : "password"}
                              placeholder="Create a password"
                              value={signupForm.password}
                              onChange={(e) =>
                                setSignupForm({ ...signupForm, password: e.target.value })
                              }
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowSignupPassword(!showSignupPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showSignupPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              value={signupForm.confirmPassword}
                              onChange={(e) =>
                                setSignupForm({ ...signupForm, confirmPassword: e.target.value })
                              }
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-primary hover:opacity-90"
                          size="lg"
                          disabled={isLoading}
                        >
                          {isLoading ? "Creating account..." : "Create Account"}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                          Already have an account?{" "}
                          <button
                            type="button"
                            onClick={() => {
                              const loginTab = document.querySelector('[value="login"]') as HTMLElement;
                              loginTab?.click();
                            }}
                            className="text-primary hover:underline font-medium"
                          >
                            Login
                          </button>
                        </p>
                      </form>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Side - Illustration */}
              <div className="hidden lg:block bg-gradient-subtle relative">
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="w-full max-w-md">
                    <img
                      src={loginIllustration}
                      alt="Login illustration"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <OrganizerFooter />
    </div>
  );
};

export default OrganizerAuth;
