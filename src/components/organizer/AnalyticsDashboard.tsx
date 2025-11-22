import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Users, Ticket, TrendingUp, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { eventsAPI, bookingsAPI } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const AnalyticsDashboard = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    pastEvents: 0,
    totalRevenue: 0,
    totalTickets: 0,
    soldTickets: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const eventsResponse = await eventsAPI.getMyEvents();
      const allEvents = eventsResponse.events || [];
      setEvents(allEvents);

      // Fetch actual bookings data for accurate revenue calculation
      const bookingsResponse = await bookingsAPI.getOrganizerBookings();
      const allBookings = bookingsResponse.bookings || [];
      setBookings(allBookings);

      // Calculate statistics from actual bookings
      const upcoming = allEvents.filter((e: any) => e.status === 'upcoming');
      const past = allEvents.filter((e: any) => e.status === 'past');
      const totalTickets = allEvents.reduce((sum: number, e: any) => sum + (e.totalTickets || 0), 0);
      
      // Calculate sold tickets and revenue from actual confirmed bookings
      const totalSoldTickets = allBookings.reduce((sum: number, b: any) => sum + (b.quantity || 0), 0);
      const totalRevenue = allBookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

      setStats({
        totalEvents: allEvents.length,
        upcomingEvents: upcoming.length,
        pastEvents: past.length,
        totalRevenue: totalRevenue,
        totalTickets,
        soldTickets: totalSoldTickets,
      });
    } catch (error: any) {
      toast({
        title: "Error loading analytics",
        description: error.message || "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data - use actual booking data for accurate revenue
  const revenueByEvent = events
    .map((event: any) => {
      // Calculate revenue from actual confirmed bookings for this event
      const eventBookings = bookings.filter((b: any) => b.eventId?._id === event._id);
      const eventRevenue = eventBookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);
      const eventTickets = eventBookings.reduce((sum: number, b: any) => sum + (b.quantity || 0), 0);
      
      return {
        name: event.title.length > 20 ? event.title.substring(0, 20) + '...' : event.title,
        revenue: eventRevenue,
        tickets: eventTickets,
      };
    })
    .filter((item: any) => item.revenue > 0)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10);

  const eventsByCategory = events.reduce((acc: any, event: any) => {
    const category = event.category || 'Other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.entries(eventsByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const statusData = [
    { name: 'Upcoming', value: stats.upcomingEvents },
    { name: 'Past', value: stats.pastEvents },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Events</CardTitle>
            <Calendar className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{stats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingEvents} upcoming, {stats.pastEvents} past
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">From all events</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Tickets Sold</CardTitle>
            <Ticket className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">{stats.soldTickets}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalTickets} total tickets
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:shadow-lg transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Sales Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-1">
              {stats.totalTickets > 0 ? Math.round((stats.soldTickets / stats.totalTickets) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Tickets sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-secondary/50 backdrop-blur-sm mb-6">
          <TabsTrigger value="revenue" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="category" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            By Category
          </TabsTrigger>
          <TabsTrigger value="status" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">
            Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card className="border-border shadow-lg bg-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg border-b border-border">
              <CardTitle className="text-xl">Revenue by Event</CardTitle>
              <CardDescription>Top performing events by revenue</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {revenueByEvent.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByEvent}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#0088FE" name="Revenue (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No revenue data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          <Card className="border-border shadow-lg bg-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg border-b border-border">
              <CardTitle className="text-xl">Events by Category</CardTitle>
              <CardDescription>Distribution of events across categories</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No category data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card className="border-border shadow-lg bg-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg border-b border-border">
              <CardTitle className="text-xl">Events by Status</CardTitle>
              <CardDescription>Upcoming vs Past events</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {statusData.some((item: any) => item.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#00C49F" name="Number of Events" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No events data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;

