import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminThemeProvider } from "@/contexts/AdminThemeContext";
import Index from "./pages/Index";
import AllEvents from "./pages/AllEvents";
import OTPLogin from "./pages/OTPLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ForgotPasswordReset from "./pages/ForgotPasswordReset";
import Organizer from "./pages/Organizer";
import OrganizerAuth from "./pages/OrganizerAuth";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import EventDetail from "./pages/EventDetail";
import UserProfile from "./pages/UserProfile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Organizers from "./pages/admin/Organizers";
import Users from "./pages/admin/Users";
import Payouts from "./pages/admin/Payouts";
import Settings from "./pages/admin/Settings";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <AdminThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/all-events" element={<AllEvents />} />
                <Route path="/otp-login" element={<OTPLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/action" element={<ForgotPasswordReset />} />
                <Route path="/event/:id" element={<EventDetail />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/organizer" element={<Organizer />} />
                <Route path="/organizer/auth" element={<OrganizerAuth />} />
                <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/about" element={<AboutUs />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <AdminLayout />
                    </ProtectedAdminRoute>
                  }
                >
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="organizers" element={<Organizers />} />
                  <Route path="users" element={<Users />} />
                  <Route path="payouts" element={<Payouts />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </AdminThemeProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
