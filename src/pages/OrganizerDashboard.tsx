import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import OrganizerHeader from "@/components/OrganizerHeader";
import OrganizerFooter from "@/components/OrganizerFooter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, BarChart3, Settings, Plus, Edit, Trash2, DollarSign, Users, Ticket, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EventManagement from "@/components/organizer/EventManagement";
import AnalyticsDashboard from "@/components/organizer/AnalyticsDashboard";
import OrganizerSettings from "@/components/organizer/OrganizerSettings";
import TicketsVerification from "@/components/organizer/TicketsVerification";

const OrganizerDashboard = () => {
  const { user, isOrganizer, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("events");

  useEffect(() => {
    if (!loading) {
      if (!isOrganizer) {
        toast({
          title: "Access Denied",
          description: "You must be an organizer to access this page.",
          variant: "destructive",
        });
        navigate("/organizer/auth");
      }
    }
  }, [isOrganizer, loading, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isOrganizer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      <OrganizerHeader />

      <div className="container px-4 py-12 md:px-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent rounded-2xl p-8 border border-primary/30 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-5xl font-bold text-foreground mb-3">
                Organizer Dashboard
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Welcome back, <span className="font-semibold text-primary">{user?.name || user?.organizationName}</span>! 
                Manage your events, verify tickets, and track your performance.
              </p>
            </div>
            <div className="hidden lg:block ml-8">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-md rounded-xl p-6 border border-primary/40 shadow-lg">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Organization</p>
                <p className="font-bold text-lg text-foreground">{user?.organizationName || user?.name}</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 h-14 bg-gradient-to-r from-secondary/60 to-secondary/40 backdrop-blur-md border border-border/50 rounded-xl p-1 shadow-md">
            <TabsTrigger 
              value="events" 
              className="flex items-center gap-2 rounded-lg font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-secondary/50"
            >
              <Calendar className="h-5 w-5" />
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 rounded-lg font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-secondary/50"
            >
              <BarChart3 className="h-5 w-5" />
              Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="tickets" 
              className="flex items-center gap-2 rounded-lg font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-secondary/50"
            >
              <Ticket className="h-5 w-5" />
              Tickets
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="flex items-center gap-2 rounded-lg font-semibold transition-all duration-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-secondary/50"
            >
              <Settings className="h-5 w-5" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6">
            <EventManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <TicketsVerification />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <OrganizerSettings />
          </TabsContent>
        </Tabs>
      </div>

      <OrganizerFooter />
    </div>
  );
};

export default OrganizerDashboard;

