import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DateFilterSelect, { DateFilter } from '@/components/admin/DateFilterSelect';
import { adminAPI } from '@/lib/adminApi';
import { Search, ExternalLink, DollarSign, Calendar, Ticket } from 'lucide-react';

interface Organizer {
  _id: string;
  name: string;
  email: string;
  totalRevenue: number;
  totalCommission: number;
  totalBookings: number;
  totalTickets: number;
  totalEvents: number;
  activeEvents: number;
}

const Organizers = () => {
  const [dateFilter, setDateFilter] = useState<DateFilter>('all_time');
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState<Organizer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrganizers();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOrganizers();
    }, 30000);

    return () => clearInterval(interval);
  }, [dateFilter]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrganizers(organizers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = organizers.filter(
        (org) =>
          org.name.toLowerCase().includes(query) ||
          org.email.toLowerCase().includes(query)
      );
      setFilteredOrganizers(filtered);
    }
  }, [searchQuery, organizers]);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrganizers(dateFilter);
      console.log('Organizers response:', response);
      // Ensure response is an array
      const organizersArray = Array.isArray(response) ? response : [];
      setOrganizers(organizersArray);
      setFilteredOrganizers(organizersArray);
    } catch (error) {
      console.error('Failed to fetch organizers:', error);
      setOrganizers([]);
      setFilteredOrganizers([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = Array.isArray(filteredOrganizers) 
    ? filteredOrganizers.reduce((sum, org) => sum + (org.totalRevenue || 0), 0)
    : 0;
  const totalCommission = Array.isArray(filteredOrganizers)
    ? filteredOrganizers.reduce((sum, org) => sum + (org.totalCommission || 0), 0)
    : 0;

  if (loading) {
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
          <h1 className="text-3xl font-bold tracking-tight">Organizers</h1>
          <p className="text-muted-foreground">Manage and track organizer performance</p>
        </div>
        <DateFilterSelect value={dateFilter} onChange={setDateFilter} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrganizers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Combined Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalCommission)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organizer</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {searchQuery ? 'No organizers found' : 'No organizers available'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrganizers.map((organizer) => (
                  <TableRow key={organizer._id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{organizer.name}</p>
                        <p className="text-xs text-muted-foreground">{organizer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {organizer.activeEvents} / {organizer.totalEvents}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{organizer.totalBookings}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Ticket className="h-3 w-3 text-muted-foreground" />
                        {organizer.totalTickets}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(organizer.totalRevenue)}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(organizer.totalCommission)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/organizers/${organizer._id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Organizers;
