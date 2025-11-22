import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DateFilterSelect, { DateFilter } from '@/components/admin/DateFilterSelect';
import { adminAPI } from '@/lib/adminApi';
import {
  DollarSign,
  TrendingUp,
  Users,
  Ticket,
  Calendar,
  Activity,
} from 'lucide-react';

interface DashboardData {
  revenue: {
    totalRevenue: number;
    platformCommission: number;
    organizerEarnings: number;
  };
  counts: {
    totalBookings: number;
    totalTickets: number;
    totalOrganizers: number;
    activeEvents: number;
  };
  pendingPayouts: {
    count: number;
    totalAmount: number;
  };
  recentBookings: Array<{
    _id: string;
    bookingId: string;
    eventName: string;
    userName: string;
    totalAmount: number;
    bookingDate: string;
  }>;
  revenueByOrganizer: Array<{
    _id: string;
    name: string;
    email: string;
    totalRevenue: number;
    totalCommission: number;
  }>;
}

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('this_month');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [dateFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard(dateFilter);
      setData(response);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      // If unauthorized, redirect to login
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Additional safety check
  if (!data?.revenue || !data?.counts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your platform analytics</p>
        </div>
        <DateFilterSelect value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Revenue Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.revenue?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From all bookings in period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.revenue?.platformCommission || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your earnings from commissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizer Earnings</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.revenue?.organizerEarnings || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total paid to organizers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts?.totalBookings || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts?.totalTickets || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts?.activeEvents || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts?.totalOrganizers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payouts Card */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="text-orange-800 dark:text-orange-400">
            Pending Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-orange-800 dark:text-orange-400">
                {data.pendingPayouts?.count || 0}
              </p>
              <p className="text-sm text-muted-foreground">Pending transactions</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-400">
                {formatCurrency(data.pendingPayouts?.totalAmount || 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total amount</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data.recentBookings || data.recentBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentBookings.slice(0, 5).map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell className="font-mono text-xs">
                        {booking.bookingId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{booking.eventName}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.userName}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(booking.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Organizers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Organizers by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Commission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data.revenueByOrganizer || data.revenueByOrganizer.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  data.revenueByOrganizer.slice(0, 5).map((organizer) => (
                    <TableRow key={organizer._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{organizer.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {organizer.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(organizer.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {formatCurrency(organizer.totalCommission)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
