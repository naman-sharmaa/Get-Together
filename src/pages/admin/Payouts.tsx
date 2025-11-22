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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/lib/adminApi';
import { DollarSign, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Payout {
  _id: string;
  organizerId: {
    _id: string;
    name: string;
    email: string;
  };
  eventId?: {
    _id: string;
    title: string;
  };
  amount: number;
  commissionAmount: number;
  commissionRate: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payoutMethod: string;
  transactionId?: string;
  createdAt: string;
  processedAt?: string;
}

const Payouts = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState('');
  const [pendingAmount, setPendingAmount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchPayouts();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPayouts();
    }, 30000);

    return () => clearInterval(interval);
  }, [statusFilter]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const filter = statusFilter === 'all' ? undefined : statusFilter;
      const response = await adminAPI.getPayouts(filter);
      console.log('Payouts response:', response);
      // Ensure response is an array
      const payoutsArray = Array.isArray(response) ? response : [];
      setPayouts(payoutsArray);
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
      setPayouts([]);
      toast({
        title: 'Error',
        description: 'Failed to load payouts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePendingPayout = async (organizerId: string) => {
    try {
      const response = await adminAPI.calculatePayout(organizerId);
      setPendingAmount(response.pendingAmount);
      setSelectedOrganizerId(organizerId);
      setCreateDialogOpen(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to calculate payout',
        variant: 'destructive',
      });
    }
  };

  const createPayout = async (payoutData: {
    organizerId: string;
    amount: number;
    payoutMethod: string;
  }) => {
    try {
      await adminAPI.createPayout(payoutData);
      toast({
        title: 'Success',
        description: 'Payout created successfully',
      });
      setCreateDialogOpen(false);
      fetchPayouts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create payout',
        variant: 'destructive',
      });
    }
  };

  const updatePayoutStatus = async (
    payoutId: string,
    status: string,
    transactionId?: string
  ) => {
    try {
      await adminAPI.updatePayoutStatus(payoutId, { status, transactionId });
      toast({
        title: 'Success',
        description: `Payout marked as ${status}`,
      });
      fetchPayouts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update payout',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
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
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      processing: 'default',
      completed: 'success',
      failed: 'destructive',
      cancelled: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'default'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const pendingPayouts = Array.isArray(payouts) ? payouts.filter((p) => p.status === 'pending') : [];
  const totalPending = pendingPayouts.reduce((sum, p) => sum + (p.netAmount || 0), 0);

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
          <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
          <p className="text-muted-foreground">Manage organizer payouts and transactions</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchPayouts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-400">
              Pending Payouts
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800 dark:text-orange-400">
              {pendingPayouts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total: {formatCurrency(totalPending)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payouts.length}</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-400">
              Completed Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-400">
              {payouts.filter((p) => p.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organizer</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No payouts found
                  </TableCell>
                </TableRow>
              ) : (
                payouts.map((payout) => (
                  <TableRow key={payout._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{payout.organizerId.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {payout.organizerId.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payout.eventId ? payout.eventId.title : 'All Events'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(payout.amount)}
                    </TableCell>
                    <TableCell className="text-red-600 text-sm">
                      -{formatCurrency(payout.commissionAmount)} ({payout.commissionRate}%)
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(payout.netAmount)}
                    </TableCell>
                    <TableCell className="capitalize">{payout.payoutMethod}</TableCell>
                    <TableCell>{getStatusBadge(payout.status)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(payout.createdAt)}
                    </TableCell>
                    <TableCell>
                      {payout.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updatePayoutStatus(payout._id, 'processing')
                            }
                          >
                            Process
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const txId = prompt('Enter transaction ID:');
                              if (txId) {
                                updatePayoutStatus(payout._id, 'completed', txId);
                              }
                            }}
                          >
                            Complete
                          </Button>
                        </div>
                      )}
                      {payout.status === 'processing' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const txId = prompt('Enter transaction ID:');
                            if (txId) {
                              updatePayoutStatus(payout._id, 'completed', txId);
                            }
                          }}
                        >
                          Complete
                        </Button>
                      )}
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

export default Payouts;
