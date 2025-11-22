import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { adminAPI } from '@/lib/adminApi';
import { useToast } from '@/hooks/use-toast';
import { Save, Power, AlertTriangle, Key, Mail } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  commissionRate: number;
  platformFee: number;
  allowNewRegistrations: boolean;
  allowNewBookings: boolean;
  allowNewEvents: boolean;
  minimumPayout: number;
  payoutCycle: 'weekly' | 'bi-weekly' | 'monthly';
}

const Settings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const { toast } = useToast();

  // Password change states
  const [passwordStep, setPasswordStep] = useState<'initial' | 'otp' | 'success'>('initial');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSettings();
      console.log('Settings response:', response);
      setSettings(response);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setSettings(null);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      await adminAPI.updateSettings(settings);
      toast({
        title: 'Success',
        description: 'Settings saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenance = async () => {
    if (!settings) return;

    try {
      const newMode = !settings.maintenanceMode;
      await adminAPI.toggleMaintenance(newMode, settings.maintenanceMessage);
      setSettings({ ...settings, maintenanceMode: newMode });
      toast({
        title: newMode ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled',
        description: newMode
          ? 'Website is now in maintenance mode'
          : 'Website is now accessible to users',
        variant: newMode ? 'destructive' : 'default',
      });
      setMaintenanceDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle maintenance mode',
        variant: 'destructive',
      });
    }
  };

  const requestPasswordOTP = async () => {
    try {
      setPasswordLoading(true);
      await adminAPI.requestPasswordOTP();
      setPasswordStep('otp');
      toast({
        title: 'OTP Sent',
        description: 'Check your email for the verification code',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send OTP',
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const changePassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPasswordLoading(true);
      await adminAPI.changePassword(otp, newPassword);
      setPasswordStep('success');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
      
      // Reset to initial after 3 seconds
      setTimeout(() => {
        setPasswordStep('initial');
      }, 3000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const resetPasswordForm = () => {
    setPasswordStep('initial');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!settings) {
    return <div>Failed to load settings</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Manage platform configuration and controls</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Maintenance Mode Card */}
      <Card
        className={
          settings.maintenanceMode
            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
            : 'border-green-500 bg-green-50 dark:bg-green-950/20'
        }
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Power className="h-5 w-5" />
                Maintenance Mode
              </CardTitle>
              <CardDescription>
                {settings.maintenanceMode
                  ? 'Website is currently in maintenance mode'
                  : 'Website is currently operational'}
              </CardDescription>
            </div>
            <Button
              size="lg"
              variant={settings.maintenanceMode ? 'destructive' : 'default'}
              onClick={() => setMaintenanceDialogOpen(true)}
              className="w-32"
            >
              {settings.maintenanceMode ? 'DISABLE' : 'ENABLE'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
            <Textarea
              id="maintenanceMessage"
              value={settings.maintenanceMessage}
              onChange={(e) =>
                setSettings({ ...settings, maintenanceMessage: e.target.value })
              }
              placeholder="Enter message to display to users during maintenance..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Revenue Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Commission</CardTitle>
          <CardDescription>Configure platform fees and commission rates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="commissionRate">Commission Rate (%)</Label>
              <span className="text-2xl font-bold text-green-600">
                {settings.commissionRate}%
              </span>
            </div>
            <Slider
              id="commissionRate"
              value={[settings.commissionRate]}
              onValueChange={(value) =>
                setSettings({ ...settings, commissionRate: value[0] })
              }
              min={0}
              max={50}
              step={0.5}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Percentage charged on each booking as platform commission
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platformFee">Platform Fee (₹)</Label>
            <Input
              id="platformFee"
              type="number"
              value={settings.platformFee}
              onChange={(e) =>
                setSettings({ ...settings, platformFee: Number(e.target.value) })
              }
              min={0}
            />
            <p className="text-sm text-muted-foreground">
              Fixed fee charged per booking (in addition to commission)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimumPayout">Minimum Payout Amount (₹)</Label>
            <Input
              id="minimumPayout"
              type="number"
              value={settings.minimumPayout}
              onChange={(e) =>
                setSettings({ ...settings, minimumPayout: Number(e.target.value) })
              }
              min={0}
            />
            <p className="text-sm text-muted-foreground">
              Minimum amount required to process organizer payouts
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Admin Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your admin password using OTP verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {passwordStep === 'initial' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We'll send a verification code to your registered email address to confirm your identity.
              </p>
              <Button onClick={requestPasswordOTP} disabled={passwordLoading}>
                <Mail className="h-4 w-4 mr-2" />
                {passwordLoading ? 'Sending...' : 'Send OTP to Email'}
              </Button>
            </div>
          )}

          {passwordStep === 'otp' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Check your email for the verification code
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={changePassword} disabled={passwordLoading}>
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </Button>
                <Button variant="outline" onClick={resetPasswordForm}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {passwordStep === 'success' && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-lg font-semibold mb-2">Password Changed!</h3>
              <p className="text-sm text-muted-foreground">
                Your password has been updated successfully
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Access Controls</CardTitle>
          <CardDescription>
            Toggle platform features on/off without full maintenance mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowNewRegistrations">Allow New Registrations</Label>
              <p className="text-sm text-muted-foreground">
                Users can create new accounts
              </p>
            </div>
            <Switch
              id="allowNewRegistrations"
              checked={settings.allowNewRegistrations}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, allowNewRegistrations: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowNewEvents">Allow New Events</Label>
              <p className="text-sm text-muted-foreground">
                Organizers can create new events
              </p>
            </div>
            <Switch
              id="allowNewEvents"
              checked={settings.allowNewEvents}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, allowNewEvents: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowNewBookings">Allow New Bookings</Label>
              <p className="text-sm text-muted-foreground">Users can book event tickets</p>
            </div>
            <Switch
              id="allowNewBookings"
              checked={settings.allowNewBookings}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, allowNewBookings: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Confirmation Dialog */}
      <AlertDialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {settings.maintenanceMode
                ? 'Disable Maintenance Mode?'
                : 'Enable Maintenance Mode?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {settings.maintenanceMode ? (
                <>
                  This will make the website accessible to all users. Are you sure the
                  maintenance is complete?
                </>
              ) : (
                <>
                  This will halt all website services and make the platform inaccessible to
                  regular users. Only admin panel will remain accessible. Are you sure you
                  want to proceed?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={toggleMaintenance}
              className={settings.maintenanceMode ? '' : 'bg-red-600 hover:bg-red-700'}
            >
              {settings.maintenanceMode ? 'Disable' : 'Enable'} Maintenance Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
