// Admin API utilities
const ADMIN_API_BASE = 'http://localhost:5050/api/admin';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken');
  console.log('Using admin token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const adminAPI = {
  // Analytics
  getDashboard: async (dateFilter: string = 'all_time') => {
    const response = await fetch(
      `${ADMIN_API_BASE}/analytics/dashboard?dateFilter=${dateFilter}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  },

  getOrganizers: async (dateFilter: string = 'all_time', search: string = '') => {
    const response = await fetch(
      `${ADMIN_API_BASE}/analytics/organizers?dateFilter=${dateFilter}&search=${search}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch organizers');
    return response.json();
  },

  getOrganizerDetails: async (organizerId: string, dateFilter: string = 'all_time') => {
    const response = await fetch(
      `${ADMIN_API_BASE}/analytics/organizers/${organizerId}?dateFilter=${dateFilter}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch organizer details');
    return response.json();
  },

  getRevenueTrends: async (dateFilter: string = 'this_month', groupBy: string = 'day') => {
    const response = await fetch(
      `${ADMIN_API_BASE}/analytics/revenue-trends?dateFilter=${dateFilter}&groupBy=${groupBy}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch revenue trends');
    return response.json();
  },

  // System Settings
  getSettings: async () => {
    const response = await fetch(`${ADMIN_API_BASE}/settings`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  updateSettings: async (settings: any) => {
    const response = await fetch(`${ADMIN_API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  },

  toggleMaintenance: async (enabled: boolean, message?: string) => {
    const response = await fetch(`${ADMIN_API_BASE}/settings/maintenance`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ enabled, message }),
    });
    if (!response.ok) throw new Error('Failed to toggle maintenance mode');
    return response.json();
  },

  // Payouts
  getPayouts: async (status?: string, organizerId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (organizerId) params.append('organizerId', organizerId);
    
    const response = await fetch(
      `${ADMIN_API_BASE}/payouts?${params.toString()}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch payouts');
    return response.json();
  },

  calculatePayout: async (organizerId: string) => {
    const response = await fetch(
      `${ADMIN_API_BASE}/payouts/calculate/${organizerId}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to calculate payout');
    return response.json();
  },

  createPayout: async (payoutData: any) => {
    const response = await fetch(`${ADMIN_API_BASE}/payouts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payoutData),
    });
    if (!response.ok) throw new Error('Failed to create payout');
    return response.json();
  },

  updatePayoutStatus: async (payoutId: string, data: { status: string; transactionId?: string; notes?: string }) => {
    const response = await fetch(`${ADMIN_API_BASE}/payouts/${payoutId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update payout status');
    return response.json();
  },

  generateBulkPayouts: async (periodStart: string, periodEnd: string) => {
    const response = await fetch(`${ADMIN_API_BASE}/payouts/bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ periodStart, periodEnd }),
    });
    if (!response.ok) throw new Error('Failed to generate bulk payouts');
    return response.json();
  },

  // Users
  getUsers: async () => {
    const response = await fetch(`${ADMIN_API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  // Password Management
  requestPasswordOTP: async () => {
    const response = await fetch(`${ADMIN_API_BASE}/password/request-otp`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }
    return response.json();
  },

  changePassword: async (otp: string, newPassword: string) => {
    const response = await fetch(`${ADMIN_API_BASE}/password/change`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ otp, newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }
    return response.json();
  },
};
